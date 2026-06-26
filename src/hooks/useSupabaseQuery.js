import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { subscribeToTable } from '../db';

/**
 * Hook to fetch and subscribe to Supabase data.
 * @param {string} table - Table name
 * @param {object} options - Options { eq: { column: value }, order: { column: 'id', ascending: true } }
 * @param {Array} deps - Dependency array
 * @param {boolean} single - If true, returns a single object instead of an array
 */
export function useSupabaseQuery(table, options = {}, deps = [], single = false) {
  const [data, setData] = useState(single ? null : []);
  const [loading, setLoading] = useState(true);
  // Use a ref for the channel so we can clean it up reliably
  const channelRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchData = async () => {
      let query = supabase.from(table).select('*');

      if (options.eq) {
        Object.entries(options.eq).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      if (options.order) {
        query = query.order(options.order.column, { ascending: options.order.ascending });
      }

      const { data: result, error } = await query;

      if (error) {
        console.error(`Error fetching ${table}:`, error);
        if (isMounted) {
          setLoading(false);
        }
      } else {
        if (isMounted) {
          if (single) {
            // Return first item or null instead of using .single() to avoid PGRST116
            setData(result && result.length > 0 ? result[0] : null);
          } else {
            setData(result || []);
          }
          setLoading(false);
        }
      }
    };

    fetchData();

    // Subscribe to local write events via our db proxy for instant zero-latency updates
    const unsubscribeLocal = subscribeToTable(table, () => {
      fetchData();
    });

    // Clean up any existing channel before creating a new one
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Create a unique channel name using table + timestamp to avoid conflicts
    const channelName = `${table}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    // Build channel and add listener BEFORE subscribing
    const channel = supabase.channel(channelName);
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: table },
      () => {
        // Re-fetch on any change
        fetchData();
      }
    );
    // Subscribe after all listeners are added
    channel.subscribe();
    channelRef.current = channel;

    return () => {
      isMounted = false;
      unsubscribeLocal();
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // Attach non-enumerable loading property to data if it is an object/array
  if (data && (Array.isArray(data) || typeof data === 'object')) {
    Object.defineProperty(data, 'loading', {
      value: loading,
      writable: true,
      configurable: true,
      enumerable: false
    });
  }

  return data;
}
