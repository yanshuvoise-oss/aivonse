import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const isRealSupabase = supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder') && !supabaseAnonKey.includes('placeholder');

  let isAuthenticated = false;
  let isAdmin = false;

  const DEV_MODE_DISABLE_AUTH = process.env.NEXT_PUBLIC_DEV_MODE_DISABLE_AUTH === 'true';

  if (DEV_MODE_DISABLE_AUTH) {
    const isLoggedOut = request.cookies.has('aivones_test_mode_logged_out');
    if (!isLoggedOut) {
      isAuthenticated = true;
      isAdmin = request.cookies.has('aivones_admin_active');
    }
  } else if (isRealSupabase) {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    let user = null;
    try {
      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch (err) {
      console.warn("Middleware auth error:", err);
    }
    
    isAuthenticated = !!user;
    if (user) {
      // Admin status from user_metadata (set by service role, cross-browser reliable)
      isAdmin = !!user.user_metadata?.is_admin;
    }
  } else {
    // Fallback to mock cookies for development/preview
    isAuthenticated = request.cookies.has('aivones_session_active');
    isAdmin = request.cookies.has('aivones_admin_active');
  }

  const url = request.nextUrl.clone();
  const path = url.pathname;

  // Development bypass
  if (DEV_MODE_DISABLE_AUTH) {
    if (path === '/login' || path === '/register') {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // Protect Dashboard routes
  if (path.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  // Protect Admin routes
  if (path.startsWith('/admin')) {
    if (!isAuthenticated) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    // Check admin privilege
    if (!isAdmin) {
      url.pathname = '/unauthorized';
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users away from auth pages
  if ((path === '/login' || path === '/register' || path === '/forgot-password') && isAuthenticated) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
