import { createBrowserClient } from "@supabase/ssr";
import { isRealSupabase, mockSupabase } from "@/lib/supabase";

export function createClient() {
  if (!isRealSupabase) {
    return mockSupabase;
  }
  
  return createBrowserClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/rest\/v1\/?$/, ''),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
