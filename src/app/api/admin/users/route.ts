import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function PATCH(request: Request) {
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceRoleKey || !supabaseUrl) {
      return NextResponse.json({ error: "Missing service role key" }, { status: 500 });
    }

    const cookieStore = await cookies();
    
    // Verify caller is an admin
    const callerClient = createServerClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "", {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    });

    const { data: { user: callerUser } } = await callerClient.auth.getUser();
    if (!callerUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify caller is admin via user_metadata
    if (!callerUser.user_metadata?.is_admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id, is_admin } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Use service role for admin operations
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Update Auth Metadata (Service Role only) — this is the source of truth for is_admin
    const { error: metaError } = await supabaseAdmin.auth.admin.updateUserById(id, {
      user_metadata: { is_admin },
    });

    if (metaError) {
      return NextResponse.json({ error: metaError.message }, { status: 400 });
    }

    // Also try to update profiles table if the column exists
    await supabaseAdmin.from("profiles").update({ is_admin }).eq("id", id);
    // Ignore profiles update errors (column may not exist)

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
