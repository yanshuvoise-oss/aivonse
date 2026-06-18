import { NextResponse } from "next/server";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  return NextResponse.json({
    hasUrl: !!supabaseUrl,
    urlPrefix: supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : '(empty)',
    hasAnonKey: !!supabaseAnonKey,
    anonKeyPrefix: supabaseAnonKey ? supabaseAnonKey.substring(0, 15) + '...' : '(empty)',
    hasServiceKey: !!serviceRoleKey,
    devModeDisableAuth: process.env.NEXT_PUBLIC_DEV_MODE_DISABLE_AUTH || '(not set)',
    nodeEnv: process.env.NODE_ENV,
  });
}
