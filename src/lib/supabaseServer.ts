import { supabase } from './supabase';

export const getSupabaseServer = () => {
  return supabase;
};

export default getSupabaseServer;
