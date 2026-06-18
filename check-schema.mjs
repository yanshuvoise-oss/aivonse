import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase.from('smart_links').select('*').limit(1);
  console.log("Error:", error);
  console.log("Data:", JSON.stringify(data, null, 2));
}

run();
