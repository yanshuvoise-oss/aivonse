import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function verifyAll() {
  console.log('=== Supabase Integration Verification ===');

  const testEmail = `test_${Date.now()}@gmail.com`;
  const testPassword = 'TestPass123!';

  // 1. Test Signup
  console.log(`\n1. Testing Signup for ${testEmail}...`);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        full_name: 'Test User',
        username: `testuser_${Date.now()}`
      }
    }
  });

  if (signUpError) {
    console.error('❌ Signup failed:', signUpError.message);
    return;
  }
  console.log('✅ Signup successful!');
  const userId = signUpData.user.id;

  // Wait for trigger to create profile
  await new Promise(r => setTimeout(r, 2000));

  // 2. Verify profile sync
  console.log('\n2. Verifying profile sync...');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (profileError || !profile) {
    console.error('❌ Profile not found:', profileError?.message);
    return;
  } else {
    console.log('✅ Profile created:', profile.username);
  }

  // Helper to upload file from a URL
  async function uploadFromUrl(url, path, mime) {
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    const blob = new Blob([buffer], { type: mime });
    const { error } = await supabase.storage.from('media').upload(path, blob, { upsert: true });
    if (error) {
      console.error(`❌ Upload failed for ${path}:`, error.message);
    } else {
      console.log(`✅ Uploaded ${path}`);
    }
  }

  // 3. Upload image, PDF, video
  console.log('\n3. Uploading media files...');
  await uploadFromUrl('https://via.placeholder.com/150', `${userId}/image.png`, 'image/png');
  await uploadFromUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', `${userId}/doc.pdf`, 'application/pdf');
  await uploadFromUrl('https://sample-videos.com/video123/mp4/240/big_buck_bunny_240p_1mb.mp4', `${userId}/video.mp4`, 'video/mp4');

  // 4. Insert link records for each media type
  console.log('\n4. Inserting link records...');
  const basePublicUrl = `${SUPABASE_URL.replace('https://', '').replace('.supabase.co', '')}/storage/v1/object/public/media/${userId}`;
  const mediaLinks = [
    { type: 'image', title: 'Test Image', media_url: `${basePublicUrl}/image.png` },
    { type: 'pdf', title: 'Test PDF', media_url: `${basePublicUrl}/doc.pdf` },
    { type: 'video', title: 'Test Video', media_url: `${basePublicUrl}/video.mp4` }
  ];

  for (const m of mediaLinks) {
    const { error } = await supabase.from('links').insert({
      profile_id: userId,
      title: m.title,
      type: m.type,
      media_url: m.media_url,
      is_enabled: true
    });
    if (error) {
      console.error(`❌ Link insert error for ${m.type}:`, error.message);
    } else {
      console.log(`✅ Link for ${m.type} inserted`);
    }
  }

  // 5. Retrieve and log public URLs for verification
  console.log('\n5. Verifying public URLs...');
  const { data: publicInfo } = supabase.storage.from('media').getPublicUrl(`${userId}/image.png`);
  console.log('Image public URL:', publicInfo.publicUrl);

  // Cleanup test user using admin privileges
  console.log('\nCleaning up test user...');
  await adminSupabase.auth.admin.deleteUser(userId);
  console.log('✅ Cleanup complete');
}

verifyAll().catch(console.error);
