import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function getAdminClient() {
  const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!serviceRoleKey || !supabaseUrl) {
    return null;
  }

  // Use createClient (not createServerClient) for service role — it bypasses cookies/RLS
  return createClient(supabaseUrl, serviceRoleKey);
}

async function verifyAdmin() {
  const cookieStore = await cookies();
  const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '');
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  const client = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {},
    },
  });

  const { data: { user } } = await client.auth.getUser();
  if (!user) return null;
  if (!user.user_metadata?.is_admin) return null;
  return user;
}

export async function GET() {
  try {
    const user = await verifyAdmin();
    if (!user) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

    const adminClient = await getAdminClient();
    if (!adminClient) return NextResponse.json({ error: "Missing service role" }, { status: 500 });

    const { data, error } = await adminClient
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await verifyAdmin();
    if (!user) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

    const adminClient = await getAdminClient();
    if (!adminClient) return NextResponse.json({ error: "Missing service role" }, { status: 500 });

    const { code, discount_percent, is_active } = await request.json();

    if (!code || !discount_percent) {
      return NextResponse.json({ error: "code and discount_percent are required" }, { status: 400 });
    }

    const { data, error } = await adminClient
      .from("coupons")
      .insert({ code: code.trim().toUpperCase(), discount_percent, is_active: is_active ?? true, uses: 0 })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await verifyAdmin();
    if (!user) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

    const adminClient = await getAdminClient();
    if (!adminClient) return NextResponse.json({ error: "Missing service role" }, { status: 500 });

    const { id, is_active } = await request.json();
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const { data, error } = await adminClient
      .from("coupons")
      .update({ is_active })
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await verifyAdmin();
    if (!user) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

    const adminClient = await getAdminClient();
    if (!adminClient) return NextResponse.json({ error: "Missing service role" }, { status: 500 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const { error } = await adminClient.from("coupons").delete().eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
