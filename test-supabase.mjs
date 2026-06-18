import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing environment variables");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function setup() {
  console.log("Connecting to Supabase at:", SUPABASE_URL);

  // 1. Check if we can reach auth by listing users (needs service role)
  console.log("Testing Auth Connection...");
  const { data: users, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error("Auth test failed:", authError);
    // Continue anyway to try buckets
  } else {
    console.log(`Auth test passed. Found ${users.users.length} users.`);
  }

  // 2. Check Storage
  console.log("Testing Storage...");
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  if (bucketsError) {
    console.error("Storage test failed:", bucketsError);
  } else {
    console.log(`Found ${buckets.length} buckets.`);
    
    // Create media bucket if it doesn't exist
    const mediaBucket = buckets.find(b => b.name === 'media');
    if (!mediaBucket) {
      console.log("Creating 'media' bucket...");
      const { data, error } = await supabase.storage.createBucket('media', {
        public: true,
        allowedMimeTypes: ['image/*', 'video/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      });
      if (error) {
        console.error("Failed to create bucket:", error);
      } else {
        console.log("Successfully created 'media' bucket.");
      }
    } else {
      console.log("'media' bucket already exists.");
    }
  }

  // 3. Database test - check if profiles table exists
  console.log("Testing Database...");
  const { data: profileCheck, error: profileError } = await supabase.from('profiles').select('id').limit(1);
  if (profileError) {
    if (profileError.code === '42P01') {
      console.log("Profiles table does not exist. The database schema needs to be applied.");
    } else {
      console.error("Database query failed:", profileError);
    }
  } else {
    console.log("Database connection successful. Profiles table exists.");
  }
}

setup().catch(console.error);
