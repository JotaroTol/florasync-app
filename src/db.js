import { supabase } from './supabaseClient';

const listeners = {};

export const subscribeToTable = (tableName, callback) => {
  if (!listeners[tableName]) {
    listeners[tableName] = new Set();
  }
  listeners[tableName].add(callback);
  return () => {
    listeners[tableName].delete(callback);
  };
};

const notifyTableChange = (tableName) => {
  if (listeners[tableName]) {
    listeners[tableName].forEach(callback => {
      try {
        callback();
      } catch (err) {
        console.error('Error in table change callback:', err);
      }
    });
  }
};

const createTableProxy = (tableName) => ({
  add: async (data) => {
    const { data: inserted, error } = await supabase.from(tableName).insert(data).select().single();
    if (error) throw error;
    notifyTableChange(tableName);
    return inserted.id;
  },
  bulkAdd: async (dataArray) => {
    const { error } = await supabase.from(tableName).insert(dataArray);
    if (error) throw error;
    notifyTableChange(tableName);
  },
  update: async (id, data) => {
    const { error } = await supabase.from(tableName).update(data).eq('id', id);
    if (error) throw error;
    notifyTableChange(tableName);
  },
  delete: async (id) => {
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) throw error;
    notifyTableChange(tableName);
  },
  put: async (data) => {
    const { error } = await supabase.from(tableName).upsert(data);
    if (error) throw error;
    notifyTableChange(tableName);
  },
  // Provide basic fetch for non-hook direct calls (e.g. login)
  where: (field) => ({
    equals: (value) => ({
      first: async () => {
        const { data, error } = await supabase.from(tableName).select('*').eq(field, value).limit(1).single();
        if (error && error.code !== 'PGRST116') throw error;
        return data || undefined;
      },
      toArray: async () => {
        const { data, error } = await supabase.from(tableName).select('*').eq(field, value);
        if (error) throw error;
        return data || [];
      }
    })
  }),
  get: async (id) => {
    const { data, error } = await supabase.from(tableName).select('*').eq('id', id).limit(1).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || undefined;
  },
  toArray: async () => {
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) throw error;
    return data || [];
  },
  count: async () => {
    const { count, error } = await supabase.from(tableName).select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count || 0;
  }
});

export const db = {
  locations: createTableProxy('locations'),
  plants: createTableProxy('plants'),
  events: createTableProxy('events'),
  inventory: createTableProxy('inventory'),
  templates: createTableProxy('templates'),
  pests: createTableProxy('pests'),
  userProfile: createTableProxy('userProfile'),
  users: createTableProxy('users'),
  categories: createTableProxy('categories')
};

// Removed bulk seeder since Supabase is persistent and shared.
