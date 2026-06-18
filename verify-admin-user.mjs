import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testAdminUserCreation() {
  console.log("=== Testing Admin User Creation (Bypassing Email Auth Rate Limits) ===");
  const testEmail = `admin_test_${Date.now()}@example.com`;
  const username = `admin_test_${Date.now()}`;

  console.log(`Creating user ${testEmail}...`);
  // Using Admin API bypasses the email rate limit and immediately confirms the email
  const { data, error } = await adminSupabase.auth.admin.createUser({
    email: testEmail,
    password: 'TestPassword123!',
    email_confirm: true,
    user_metadata: {
      username: username,
      full_name: 'Admin Test User'
    }
  });

  if (error) {
    console.error("❌ Failed to create user via Admin API:", error.message);
    return;
  }

  const userId = data.user.id;
  console.log("✅ Successfully created user in auth.users:", userId);

  console.log("Waiting 2 seconds for profiles trigger to run...");
  await new Promise(resolve => setTimeout(resolve, 2000));

  const { data: profile, error: profileError } = await adminSupabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    console.error("❌ Profile sync failed:", profileError?.message);
  } else {
    console.log("✅ Profile successfully synced:", profile.username);
  }

  console.log("Cleaning up test user...");
  await adminSupabase.auth.admin.deleteUser(userId);
  console.log("✅ Cleanup complete.");
}

testAdminUserCreation().catch(console.error);
