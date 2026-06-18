import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envStr = fs.readFileSync('.env.local', 'utf8');
const lines = envStr.split('\n');
const env = {};
for (const line of lines) {
  const [key, ...vals] = line.split('=');
  if (key) env[key] = vals.join('=').trim().replace(/(^"|"$)/g, '');
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const adminKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const adminSupabase = createClient(supabaseUrl, adminKey);

async function test() {
  const email = `testupload_${Date.now()}@example.com`;
  const password = 'Password123!';
  
  await adminSupabase.auth.admin.createUser({ email, password, email_confirm: true });
  const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  
  if (signInError) {
    console.error('Sign in error:', signInError);
    return;
  }
  
  console.log('Signed in as', user.id);
  
  const blob = new Blob(['hello world'], { type: 'image/png' });
  const { data, error } = await supabase.storage.from('media').upload(`${user.id}/test.png`, blob);
  
  if (error) {
    console.error('Upload Error:', error);
  } else {
    console.log('Upload Success:', data);
  }
  
  await adminSupabase.auth.admin.deleteUser(user.id);
}

test();
