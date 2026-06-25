import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

/**
 * Hook to fetch and subscribe to Supabase data.
 * @param {string} table - Table name
 * @param {object} options - Options { eq: { column: value }, order: { column: 'id', ascending: true } }
 * @param {Array} deps - Dependency array
 * @param {boolean} single - If true, returns a single object instead of an array
 */
export function useSupabaseQuery(table, options = {}, deps = [], single = false) {
  const [data, setData] = useState(single ? null : []);
  // Use a ref for the channel so we can clean it up reliably
  const channelRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

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
        // Do NOT clear existing data on transient fetch errors to prevent data from suddenly disappearing
      } else {
        if (isMounted) {
          if (single) {
            // Return first item or null instead of using .single() to avoid PGRST116
            setData(result && result.length > 0 ? result[0] : null);
          } else {
            setData(result || []);
          }
        }
      }
    };

    fetchData();

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
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return data;
}
