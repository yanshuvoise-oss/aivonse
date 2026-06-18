import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envStr = fs.readFileSync('.env.local', 'utf8');
const lines = envStr.split('\n');
const env = {};
for (const line of lines) {
  const [key, ...vals] = line.split('=');
  if (key) env[key] = vals.join('=').trim().replace(/(^"|"$)/g, '');
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const adminKey = env.SUPABASE_SERVICE_ROLE_KEY;

const adminSupabase = createClient(supabaseUrl, adminKey);

async function test() {
  const { data: profiles, error: pError } = await adminSupabase.from('profiles').select('*');
  console.log('Profiles in DB:', profiles?.length, profiles, pError);

  const { data: links, error: lError } = await adminSupabase.from('links').select('*');
  console.log('Links in DB:', links?.length, links, lError);
}

test();
