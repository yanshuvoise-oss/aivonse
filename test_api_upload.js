import fs from 'fs';

const envStr = fs.readFileSync('.env.local', 'utf8');
const lines = envStr.split('\n');
const env = {};
for (const line of lines) {
  const [key, ...vals] = line.split('=');
  if (key) env[key] = vals.join('=').trim().replace(/(^"|"$)/g, '');
}

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const adminKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const adminSupabase = createClient(supabaseUrl, adminKey);

async function test() {
  const email = `testupload_${Date.now()}@example.com`;
  const password = 'Password123!';
  
  await adminSupabase.auth.admin.createUser({ email, password, email_confirm: true });
  const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  
  if (signInError) {
    console.error('Sign in error:', signInError);
    return;
  }
  
  console.log('Signed in as', session.user.id);
  
  const token = session.access_token;
  
  const formData = new FormData();
  formData.append('file', new Blob(['hello world'], { type: 'image/png' }));
  formData.append('path', `${session.user.id}/test_api.png`);
  formData.append('bucket', 'media');
  
  const res = await fetch('http://localhost:3000/api/storage/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  const data = await res.json();
  console.log('API Response:', data);
  
  await adminSupabase.auth.admin.deleteUser(session.user.id);
}

test();
