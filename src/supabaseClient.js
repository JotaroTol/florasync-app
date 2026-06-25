import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wkguxfglkctawtinszrc.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_soi4ZjrQBKKsIFnZBWN9bA_AazuSbke';

export const supabase = createClient(supabaseUrl, supabaseKey);
