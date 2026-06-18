import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { secret } = await request.json();
    const envSecret = process.env.ADMIN_SETUP_SECRET;

    if (!envSecret || secret !== envSecret) {
      return NextResponse.json({ error: "Invalid setup secret" }, { status: 401 });
    }

    const cookieStore = await cookies();
    const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '');
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    const DEV_MODE_DISABLE_AUTH = process.env.NEXT_PUBLIC_DEV_MODE_DISABLE_AUTH === 'true';
    const isRealSupabase = !DEV_MODE_DISABLE_AUTH && supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder');

    if (isRealSupabase) {
      if (!serviceRoleKey) {
        return NextResponse.json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
      }

      // Create admin client
      const supabaseAdmin = createServerClient(supabaseUrl, serviceRoleKey, {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {}
        }
      });

      // Get current user session
      const supabaseClient = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {}
        }
      });

      const { data: { user } } = await supabaseClient.auth.getUser();
      
      if (!user) {
        return NextResponse.json({ error: "You must be logged in to grant admin access" }, { status: 401 });
      }

      // Only update user metadata for middleware because the is_admin column 
      // is missing from the public.profiles database schema cache.
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: { is_admin: true }
      });

      if (updateError) {
        return NextResponse.json({ error: updateError.message || "Failed to set admin status" }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    } else {
      // MOCK DEV MODE - We instruct the client to update localStorage
      return NextResponse.json({ 
        success: true, 
        message: "In Dev Mode, admin granted.", 
        devModeAction: "setAdmin" 
      });
    }

  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
