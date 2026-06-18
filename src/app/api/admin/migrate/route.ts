import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// This endpoint applies necessary database migrations using the service role key.
// It is only accessible to authenticated admin users.
export async function POST(request: Request) {
  try {
    // Verify admin access
    const cookieStore = await cookies();
    const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '');
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const authClient = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    });
    const { data: { user } } = await authClient.auth.getUser();
    if (!user || !user.user_metadata?.is_admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey || !supabaseUrl) {
      return NextResponse.json({ error: "Missing service role key" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const results: string[] = [];

    // Step 1: Add is_admin to profiles using upsert trick
    // We check by trying to select it; if error, we know it's missing
    const { error: isAdminCheckError } = await supabase
      .from("profiles")
      .select("is_admin")
      .limit(1);

    if (isAdminCheckError && isAdminCheckError.message.includes("is_admin")) {
      results.push("⚠️ is_admin column missing from profiles - run SQL migration manually");
    } else {
      results.push("✅ profiles.is_admin column exists");
    }

    // Step 2: Check coupons table
    const { error: couponsCheckError } = await supabase
      .from("coupons")
      .select("id")
      .limit(1);

    if (couponsCheckError) {
      results.push(`⚠️ coupons table missing: ${couponsCheckError.message} - run SQL migration manually`);
    } else {
      results.push("✅ coupons table exists");
    }

    // Step 3: Check subscriptions table
    const { error: subsCheckError } = await supabase
      .from("subscriptions")
      .select("id")
      .limit(1);

    if (subsCheckError) {
      results.push(`⚠️ subscriptions table missing: ${subsCheckError.message} - run SQL migration manually`);
    } else {
      results.push("✅ subscriptions table exists");
    }

    return NextResponse.json({
      results,
      sqlMigrationRequired: results.some(r => r.includes("⚠️")),
      migrationSQL: results.some(r => r.includes("⚠️"))
        ? "Please run supabase/migrations/001_add_missing_tables.sql in the Supabase SQL Editor"
        : null
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
