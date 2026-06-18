import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

// POST /api/coupons/redeem — validates and redeems a coupon for the current user
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '');
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 });
    }

    // Get current user via cookie-based client
    const supabaseClient = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    });

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "You must be logged in to redeem a coupon" }, { status: 401 });
    }

    const { code } = await request.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    // Use service role to bypass RLS for the update operations
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // 1. Fetch the coupon
    const { data: coupon, error: couponError } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .eq("is_active", true)
      .single();

    if (couponError || !coupon) {
      return NextResponse.json({ error: "Invalid or inactive coupon code" }, { status: 400 });
    }

    // 2. Check if user already redeemed this coupon
    const { data: existingRedemption } = await supabaseAdmin
      .from("coupon_redemptions")
      .select("id")
      .eq("coupon_id", coupon.id)
      .eq("profile_id", user.id)
      .single();

    if (existingRedemption) {
      return NextResponse.json({ error: "You have already used this coupon" }, { status: 400 });
    }

    // 3. Check current subscription status
    const { data: existingSub } = await supabaseAdmin
      .from("subscriptions")
      .select("plan_type, current_period_end")
      .eq("profile_id", user.id)
      .single();

    // Block if already active pro (not expired)
    if (existingSub?.plan_type === "pro") {
      const isExpired = existingSub.current_period_end && new Date(existingSub.current_period_end) < new Date();
      if (!isExpired) {
        return NextResponse.json({ error: "You already have an active Pro subscription" }, { status: 400 });
      }
    }

    const now = new Date();
    const expiryDate = new Date(now);

    // 4. For 100% discount coupons — upgrade to Pro with 30-day expiry
    if (coupon.discount_percent === 100) {
      expiryDate.setDate(expiryDate.getDate() + 30);

      const { error: subError } = await supabaseAdmin
        .from("subscriptions")
        .upsert({
          profile_id: user.id,
          plan_type: "pro",
          status: "active",
          current_period_end: expiryDate.toISOString(),
          updated_at: now.toISOString(),
        }, { onConflict: "profile_id" });

      if (subError) {
        return NextResponse.json({
          error: "Failed to upgrade subscription: " + subError.message,
        }, { status: 500 });
      }
    }

    // 5. Record the redemption
    const { error: redemptionError } = await supabaseAdmin.from("coupon_redemptions").insert({
      coupon_id: coupon.id,
      profile_id: user.id,
    });

    if (redemptionError) {
      console.error("Failed to record coupon redemption:", redemptionError.message);
    }

    // 6. Increment uses counter
    const { error: usesError } = await supabaseAdmin
      .from("coupons")
      .update({ uses: (coupon.uses || 0) + 1 })
      .eq("id", coupon.id);

    if (usesError) {
      console.error("Failed to increment coupon uses:", usesError.message);
    }

    const isFullUpgrade = coupon.discount_percent === 100;

    return NextResponse.json({
      success: true,
      upgraded: isFullUpgrade,
      discount: coupon.discount_percent,
      expiresAt: isFullUpgrade ? expiryDate.toISOString() : null,
      message: isFullUpgrade
        ? `🎉 Upgraded to Pro! Your plan is active until ${expiryDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`
        : `Coupon applied! You get ${coupon.discount_percent}% off.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// GET /api/coupons/redeem — check if a user's subscription has expired and revert to free
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '');
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    const supabaseClient = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    });

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("plan_type, status, current_period_end")
      .eq("profile_id", user.id)
      .single();

    if (!sub) return NextResponse.json({ plan_type: "free", status: "active" });

    // Check expiry — if pro and expired, revert to free
    const isExpired = sub.plan_type === "pro" && sub.current_period_end && new Date(sub.current_period_end) < new Date();

    if (isExpired) {
      await supabaseAdmin
        .from("subscriptions")
        .update({ plan_type: "free", status: "active", current_period_end: null, updated_at: new Date().toISOString() })
        .eq("profile_id", user.id);

      return NextResponse.json({ plan_type: "free", status: "active", reverted: true });
    }

    return NextResponse.json({
      plan_type: sub.plan_type,
      status: sub.status,
      current_period_end: sub.current_period_end,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
