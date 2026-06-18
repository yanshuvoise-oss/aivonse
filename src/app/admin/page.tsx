"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import {
  Users, CreditCard, Share2, Package, Ticket, Eye, Trash2,
  Plus, X, Check, RefreshCw, AlertCircle, ChevronDown, ChevronUp,
  FileText, ImageIcon, File, Link as LinkIcon, ExternalLink, Copy, CheckCircle2,
  TrendingUp, ArrowUpRight
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar 
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Profile { id: string; username: string; full_name: string; is_admin?: boolean; created_at: string; avatar_url?: string; }
interface Subscription { profile_id: string; plan_type: string; status: string; current_period_end?: string | null; created_at: string; }
interface SmartLink { id: string; title: string; slug: string; profile_id: string; created_at: string; view_count?: number; }
interface Coupon { id: string; code: string; discount_percent: number; is_active: boolean; created_at?: string; uses?: number; }
interface CouponRedemption { id: string; coupon_id: string; profile_id: string; redeemed_at: string; }
interface LinkItem { id: string; title: string; type: string; profile_id: string; created_at: string; }

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Colors
const PIE_COLORS = ['#334155', '#94A3B8', '#E2E8F0'];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  // Data state
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponRedemptions, setCouponRedemptions] = useState<CouponRedemption[]>([]);
  const [linkItems, setLinkItems] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [userSearch, setUserSearch] = useState("");
  const [userSortField, setUserSortField] = useState<"full_name" | "created_at">("created_at");
  const [userSortAsc, setUserSortAsc] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Coupon create modal state
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState("100");
  const [couponSaving, setCouponSaving] = useState(false);
  const [couponError, setCouponError] = useState("");

  // ─── Fetch All Data ───────────────────────────────────────────────────────
  const fetchAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      // Fetch all data in parallel — tables now confirmed to exist after migration
      const [profilesResult, linksResult, subsResult, couponsResult, redemptionsResult] = await Promise.all([
        supabase.from("profiles").select("id, username, full_name, is_admin, avatar_url, created_at").order("created_at", { ascending: false }),
        supabase.from("links").select("id, title, type, profile_id, created_at").order("created_at", { ascending: false }),
        supabase.from("subscriptions").select("profile_id, plan_type, status, current_period_end, created_at"),
        supabase.from("coupons").select("id, code, discount_percent, is_active, created_at, uses").order("created_at", { ascending: false }),
        supabase.from("coupon_redemptions").select("id, coupon_id, profile_id, redeemed_at"),
      ]);

      if (profilesResult.error) console.warn("Profiles error:", profilesResult.error.message);
      if (linksResult.error) console.warn("Links error:", linksResult.error.message);
      if (subsResult.error) console.warn("Subscriptions error:", subsResult.error.message);
      if (couponsResult.error) console.warn("Coupons error:", couponsResult.error.message);
      if (redemptionsResult.error) console.warn("Redemptions error:", redemptionsResult.error.message);

      setProfiles(profilesResult.data || []);
      setLinkItems(linksResult.data || []);
      setSubscriptions(subsResult.data || []);
      setCoupons(couponsResult.data || []);
      setCouponRedemptions(redemptionsResult.data || []);
    } catch (e: any) {
      setError(e.message || "Failed to load admin data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); setMounted(true); }, [fetchAll]);

  // ─── Derived Stats & Chart Data ───────────────────────────────────────────

  const subMap = useMemo(() => new Map(subscriptions.map(s => [s.profile_id, s])), [subscriptions]);
  
  // Set of user IDs who redeemed any coupon
  const couponUserIds = useMemo(() => new Set(couponRedemptions.map(r => r.profile_id)), [couponRedemptions]);

  // Pro users: plan_type = 'pro' AND (no expiry OR expiry is in the future)
  const proUsersList = useMemo(() => {
    const now = new Date();
    return profiles.filter(p => {
      const sub = subMap.get(p.id);
      if (!sub || sub.plan_type !== "pro") return false;
      if (sub.current_period_end && new Date(sub.current_period_end) < now) return false; // expired
      return true;
    });
  }, [profiles, subMap]);
  const proUsers = proUsersList.length;

  // Coupon users: users who have a redemption record (regardless of plan)
  const couponUsers = useMemo(() => profiles.filter(p => couponUserIds.has(p.id)).length, [profiles, couponUserIds]);

  // Free users: all users without an active Pro subscription (including expired)
  const freeUsers = useMemo(() => {
    const now = new Date();
    return profiles.filter(p => {
      const sub = subMap.get(p.id);
      if (!sub || sub.plan_type !== "pro") return true;
      if (sub.current_period_end && new Date(sub.current_period_end) < now) return true; // expired pro is free
      return false;
    }).length;
  }, [profiles, subMap]);
  
  const activeCoupons = coupons.filter(c => c.is_active);
  const smartLinks = linkItems.filter(l => l.type === 'link');

  // Total coupon upgrades = actual redemption records from DB
  const totalCouponUpgrades = useMemo(() => couponRedemptions.length, [couponRedemptions]);

  // User Growth Chart Data (Group by month)
  const userGrowthData = useMemo(() => {
    const monthsMap = new Map<string, { total: number, active: number }>();
    
    // Initialize last 6 months
    const d = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(d.getFullYear(), d.getMonth() - i, 1);
      monthsMap.set(`${monthNames[month.getMonth()]} ${month.getFullYear()}`, { total: 0, active: 0 });
    }

    let cumulative = 0;
    // Sort profiles oldest to newest for cumulative
    const sortedProfiles = [...profiles].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    sortedProfiles.forEach(p => {
      const date = new Date(p.created_at);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      cumulative++;
      if (monthsMap.has(monthKey)) {
        const current = monthsMap.get(monthKey)!;
        current.total = cumulative;
        current.active += 1;
      }
    });

    // Fill forward missing cumulative values
    let lastTotal = 0;
    Array.from(monthsMap.entries()).forEach(([key, val]) => {
      if (val.total === 0) val.total = lastTotal;
      lastTotal = val.total;
    });

    return Array.from(monthsMap.entries()).map(([name, data]) => ({ name: name.split(' ')[0], ...data }));
  }, [profiles]);

  const planBreakdownData = [
    { name: 'Free', value: freeUsers },
    { name: 'Pro', value: proUsers },
  ];



  // Storage By Type (Content Count)
  const contentByType = useMemo(() => {
    return linkItems.reduce((acc, l) => {
      acc[l.type] = (acc[l.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [linkItems]);

  const storageByTypeData = [
    { name: 'PDFs', value: contentByType['pdf'] || 0 },
    { name: 'Images', value: contentByType['image'] || 0 },
    { name: 'Docs', value: contentByType['doc'] || 0 },
    { name: 'Links', value: contentByType['link'] || 0 },
  ];

  const recentUsers = [...profiles].slice(0, 5);

  // ─── User Sort & Filter ───────────────────────────────────────────────────
  const filteredUsers = profiles
    .filter(p =>
      !userSearch ||
      p.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      p.username?.toLowerCase().includes(userSearch.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[userSortField] || "";
      const bVal = b[userSortField] || "";
      return userSortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

  const toggleSort = (field: "full_name" | "created_at") => {
    if (userSortField === field) setUserSortAsc(!userSortAsc);
    else { setUserSortField(field); setUserSortAsc(true); }
  };

  // ─── Coupon Actions ───────────────────────────────────────────────────────
  const createCoupon = async () => {
    if (!newCouponCode.trim()) { setCouponError("Code is required"); return; }
    const pct = parseInt(newCouponDiscount);
    if (isNaN(pct) || pct < 1 || pct > 100) { setCouponError("Discount must be 1–100%"); return; }
    
    setCouponSaving(true);
    setCouponError("");

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newCouponCode.trim().toUpperCase(),
          discount_percent: pct,
          is_active: true
        })
      });

      const json = await res.json();
      
      if (json.useMock) {
        // Fallback to client insert if API says we are in mock mode without service role
        const { data, error: err } = await supabase.from("coupons").insert({
          code: newCouponCode.trim().toUpperCase(),
          discount_percent: pct,
          is_active: true,
          uses: 0,
        }).select().single();
        if (err) throw err;
        setCoupons(prev => [data, ...prev]);
      } else if (!res.ok) {
        throw new Error(json.error || "Failed to create coupon");
      } else {
        setCoupons(prev => [json.data, ...prev]);
      }

      setNewCouponCode("");
      setNewCouponDiscount("100");
      setShowCouponModal(false);
    } catch (err: any) {
      setCouponError(err.message);
    } finally {
      setCouponSaving(false);
    }
  };

  const toggleCoupon = async (coupon: Coupon) => {
    const updated = { ...coupon, is_active: !coupon.is_active };
    // Optimistic UI
    setCoupons(prev => prev.map(c => c.id === coupon.id ? updated : c));
    
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: coupon.id, is_active: updated.is_active })
      });
      const json = await res.json();
      if (json.useMock) {
        await supabase.from("coupons").update({ is_active: updated.is_active }).eq("id", coupon.id);
      } else if (!res.ok) {
        throw new Error("Failed to update");
      }
    } catch (err) {
      // Revert optimistic
      setCoupons(prev => prev.map(c => c.id === coupon.id ? coupon : c));
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Delete this coupon? This cannot be undone.")) return;
    const previous = [...coupons];
    setCoupons(prev => prev.filter(c => c.id !== id));

    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.useMock) {
        await supabase.from("coupons").delete().eq("id", id);
      } else if (!res.ok) {
        throw new Error("Failed to delete");
      }
    } catch (err) {
      setCoupons(previous);
    }
  };

  // ─── User Actions ─────────────────────────────────────────────────────────
  const toggleAdmin = async (p: Profile) => {
    if (!confirm(`${p.is_admin ? "Revoke" : "Grant"} admin access for ${p.full_name}?`)) return;
    const previous = [...profiles];
    setProfiles(prev => prev.map(u => u.id === p.id ? { ...u, is_admin: !u.is_admin } : u));

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id, is_admin: !p.is_admin })
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to update admin status");
      }
    } catch (err: any) {
      setProfiles(previous);
      alert("Failed to update user admin status: " + err.message);
    }
  };

  const copySlug = async (slug: string) => {
    const url = `${window.location.origin}/s/${slug}`;
    try { await navigator.clipboard.writeText(url); setCopiedSlug(slug); setTimeout(() => setCopiedSlug(null), 2000); } catch {}
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-zinc-400">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" />
          <span className="text-sm">Loading admin data…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-10 w-10 text-rose-400" />
        <p className="text-sm text-zinc-600 max-w-sm">{error}</p>
        <button onClick={() => fetchAll()} className="text-sm font-semibold text-zinc-900 underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12">

      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-zinc-900">Overview</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Live platform metrics and management</p>
        </div>
        <button
          onClick={() => fetchAll(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors border border-zinc-200 rounded-lg px-3 py-1.5 bg-white disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* ── SECTION 1: Stats Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title="Total Users" value={fmt(profiles.length)} trend={`+${userGrowthData[userGrowthData.length-1]?.active || 0} this mo`} />
        <StatCard title="Free Users" value={fmt(freeUsers)} trend={profiles.length ? `${Math.round((freeUsers/profiles.length)*100)}%` : ''} />
        <StatCard title="Pro Users" value={fmt(proUsers)} trend={profiles.length ? `${Math.round((proUsers/profiles.length)*100)}% conv.` : ''} />
        <StatCard title="Coupon Users" value={fmt(couponUsers)} trend={`${totalCouponUpgrades} redemptions`} />
        <StatCard title="Active Coupons" value={String(activeCoupons.length)} />
      </div>

      {/* ── SECTION 2: Analytics Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* User Analytics Line Chart */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-zinc-900">User Analytics</h3>
          </div>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="total" name="Total Users" stroke="#18181b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="active" name="New Users" stroke="#a1a1aa" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue & Subscriptions */}
        <div className="flex flex-col space-y-6">
          <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
            <h3 className="font-semibold text-zinc-900 mb-4">Revenue & Subscriptions</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
               <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                  <p className="text-xs text-zinc-500">Monthly Revenue (MRR)</p>
                  <p className="text-xl font-bold text-zinc-400">—</p>
               </div>
               <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                  <p className="text-xs text-zinc-500">Total Revenue</p>
                  <p className="text-xl font-bold text-zinc-400">—</p>
               </div>
               <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                  <p className="text-xs text-zinc-500">Yearly Run Rate</p>
                  <p className="text-xl font-bold text-zinc-400">—</p>
               </div>
               <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                  <p className="text-xs text-zinc-500">Last Month</p>
                  <p className="text-xl font-bold text-zinc-400">—</p>
               </div>
            </div>
            
            <h4 className="text-sm font-semibold text-zinc-700 mb-3">Revenue Trend</h4>
            <div className="h-32 w-full flex items-center justify-center bg-zinc-50 rounded-lg border border-zinc-100">
               <p className="text-xs text-zinc-400">Connect Stripe to view revenue trends</p>
            </div>
          </div>

          {/* Coupon & Plan Analytics */}
          <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm flex-1">
             <div className="grid grid-cols-2 gap-6 h-full">
                <div>
                   <h4 className="text-sm font-semibold text-zinc-700 mb-4">Subscriber Base</h4>
                   <div className="space-y-3">
                     <div className="flex justify-between items-center text-sm"><span className="text-zinc-500">Free Users</span><span className="font-bold text-zinc-900">{freeUsers}</span></div>
                     <div className="flex justify-between items-center text-sm"><span className="text-zinc-500">Pro Users</span><span className="font-bold text-zinc-900">{proUsers}</span></div>
                     <div className="flex justify-between items-center text-sm"><span className="text-zinc-500">Coupon Users</span><span className="font-bold text-blue-600">{couponUsers}</span></div>
                     <div className="flex justify-between items-center text-sm pt-2 border-t border-zinc-100"><span className="text-zinc-900 font-semibold">Total</span><span className="font-bold text-zinc-900">{profiles.length}</span></div>
                   </div>
                </div>
                <div>
                   <h4 className="text-sm font-semibold text-zinc-700 mb-4">Coupon Impact</h4>
                   <div className="space-y-3">
                     <div className="flex justify-between items-center text-sm"><span className="text-zinc-500">Total Redemptions</span><span className="font-bold text-zinc-900">{totalCouponUpgrades}</span></div>
                     <div className="flex justify-between items-center text-sm"><span className="text-zinc-500">Active Coupons</span><span className="font-bold text-zinc-900">{activeCoupons.length}</span></div>
                     <div className="flex justify-between items-center text-sm pt-2 border-t border-zinc-100"><span className="text-zinc-500">Coupon → Pro Rate</span><span className="font-bold text-emerald-600">{profiles.length ? Math.round((couponUsers/profiles.length)*100) : 0}%</span></div>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>

      {/* ── SECTION 3: Storage & Content ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm flex flex-col">
          <h3 className="font-semibold text-zinc-900 mb-4">Storage by Type</h3>
          <div className="h-40 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={storageByTypeData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a' }} allowDecimals={false} />
                <RechartsTooltip cursor={{fill: '#f4f4f5'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="#94A3B8" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm flex flex-col">
          <h3 className="font-semibold text-zinc-900 mb-2">Platform Content Usage</h3>
          <div className="h-32 flex flex-col items-center justify-center relative mt-4 flex-1">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{value: linkItems.length || 0, name: 'Items'}]}
                    innerRadius={50}
                    outerRadius={70}
                    startAngle={180}
                    endAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="#334155" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 mt-4 text-center">
                <span className="text-3xl font-bold text-zinc-900">{linkItems.length}</span>
                <p className="text-xs text-zinc-500">Items</p>
              </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-zinc-900 mb-4">Recent Registrations</h3>
          {recentUsers.length === 0 ? (
            <p className="text-sm text-zinc-400 py-4 text-center">No users yet</p>
          ) : (
            <div className="space-y-4">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold text-xs shrink-0">
                      {(u.full_name?.[0] || u.username?.[0] || "?").toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-zinc-900 truncate max-w-[120px]">{u.full_name || "—"}</span>
                      <span className="text-xs text-zinc-500">@{u.username || "—"}</span>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-zinc-400">
                    {mounted ? timeAgo(u.created_at) : new Date(u.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── SECTION 4: Content & Smart Sharing Analytics ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm flex flex-col">
          <h3 className="font-semibold text-zinc-900 mb-4">Most Shared Resources</h3>
          <div className="grid grid-cols-2 gap-4 flex-1">
            <div className="space-y-3">
              {[
                { type: "pdf", label: "PDFs", icon: <FileText className="h-4 w-4 text-zinc-600" />, count: contentByType['pdf'] || 0 },
                { type: "image", label: "Images", icon: <ImageIcon className="h-4 w-4 text-zinc-600" />, count: contentByType['image'] || 0 },
                { type: "link", label: "Links", icon: <LinkIcon className="h-4 w-4 text-zinc-600" />, count: contentByType['link'] || 0 },
              ].map((item, i) => (
                <div key={i} className="bg-zinc-50 p-3 rounded-lg flex items-center gap-3">
                  <div className="p-2 bg-white rounded shadow-sm border border-zinc-100">{item.icon}</div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900 leading-none">{item.label}</p>
                    <p className="text-xs text-zinc-500 mt-1">{item.count} items</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 border-l border-zinc-100 pl-4">
              <h4 className="text-sm font-semibold text-zinc-700">Smart Sharing</h4>
              <div>
                <p className="text-xs text-zinc-500">Total Smart Links Created</p>
                <p className="text-xl font-bold text-zinc-900">{smartLinks.length}</p>
              </div>
              <div className="space-y-2 border-t border-zinc-100 pt-3">
                <div className="flex justify-between items-center text-xs font-semibold text-zinc-400 pb-1 border-b border-zinc-100">
                  <span>Recent Links</span>
                  <span>Added</span>
                </div>
                {[...smartLinks].slice(0,3).map(sl => (
                   <div key={sl.id} className="flex justify-between items-center">
                    <span className="text-xs text-zinc-700 font-medium truncate max-w-[120px]">{sl.title || "Untitled"}</span>
                    <span className="text-[10px] text-zinc-400">{mounted ? timeAgo(sl.created_at) : "Recently"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
            <h3 className="text-sm font-bold text-zinc-900">Coupon Management</h3>
            <button
              onClick={() => { setShowCouponModal(true); setCouponError(""); }}
              className="flex items-center gap-1.5 text-xs font-semibold bg-zinc-900 text-white px-3 py-1.5 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Create
            </button>
          </div>

          <div className="flex-1 overflow-x-auto">
            {coupons.length === 0 ? (
              <div className="flex h-full items-center justify-center p-8">
                <p className="text-sm text-zinc-400">No coupons created yet.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 text-zinc-400 text-xs">
                  <tr>
                    <th className="px-5 py-2.5 text-left font-medium">Code</th>
                    <th className="px-5 py-2.5 text-left font-medium">Discount</th>
                    <th className="px-5 py-2.5 text-left font-medium">Status</th>
                    <th className="px-5 py-2.5 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {coupons.map((c) => (
                    <tr key={c.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-5 py-3">
                        <span className="font-mono font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded text-xs">{c.code}</span>
                      </td>
                      <td className="px-5 py-3 font-semibold text-zinc-900">{c.discount_percent}%</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${c.is_active ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
                          {c.is_active ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          {c.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleCoupon(c)}
                            className="text-xs font-medium text-zinc-500 hover:text-zinc-900 px-2 py-1 rounded border border-zinc-200 hover:bg-zinc-50 transition-colors"
                          >
                            {c.is_active ? "Disable" : "Enable"}
                          </button>
                          <button
                            onClick={() => deleteCoupon(c.id)}
                            className="p-1.5 text-zinc-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ── SECTION 5: User Management ── */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-zinc-100">
          <h3 className="text-sm font-bold text-zinc-900">User Management</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users…"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="pl-3 pr-8 py-1.5 text-xs border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-zinc-900 w-44 transition-all"
              />
              {userSearch && (
                <button onClick={() => setUserSearch("")} className="absolute right-2 top-2 text-zinc-400 hover:text-zinc-700">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <span className="text-xs text-zinc-400">{filteredUsers.length} users</span>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[400px]">
          <table className="w-full text-sm relative">
            <thead className="bg-zinc-50 text-zinc-400 text-xs sticky top-0 z-10 border-b border-zinc-100 shadow-sm">
              <tr>
                <th className="px-5 py-2.5 text-left font-medium">
                  <button className="flex items-center gap-1 hover:text-zinc-700 transition-colors" onClick={() => toggleSort("full_name")}>
                    Name {userSortField === "full_name" ? (userSortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : null}
                  </button>
                </th>
                <th className="px-5 py-2.5 text-left font-medium">Plan Type</th>
                <th className="px-5 py-2.5 text-left font-medium">
                  <button className="flex items-center gap-1 hover:text-zinc-700 transition-colors" onClick={() => toggleSort("created_at")}>
                    Joined {userSortField === "created_at" ? (userSortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : null}
                  </button>
                </th>
                <th className="px-5 py-2.5 text-left font-medium">Role</th>
                <th className="px-5 py-2.5 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-xs text-zinc-400">
                    {userSearch ? "No users match your search" : "No users found"}
                  </td>
                </tr>
              ) : filteredUsers.map((u) => {
                const sub = subMap.get(u.id);
                const isExpired = sub?.plan_type === "pro" && sub?.current_period_end && new Date(sub.current_period_end) < new Date();
                const isPro = sub?.plan_type === "pro" && !isExpired;
                const hasCoupon = couponUserIds.has(u.id);
                return (
                  <tr key={u.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 shrink-0 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600">
                          {(u.full_name?.[0] || u.username?.[0] || "?").toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900">{u.full_name || "—"}</p>
                          <p className="text-[11px] text-zinc-400">@{u.username || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded border ${isPro ? "border-blue-200 bg-blue-50 text-blue-700" : isExpired ? "border-orange-200 bg-orange-50 text-orange-600" : "border-zinc-200 bg-zinc-50 text-zinc-500"}`}>
                          {isPro ? "Pro" : isExpired ? "Expired" : "Free"}
                        </span>
                        {hasCoupon && <span className="inline-flex text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 border border-purple-100">Coupon</span>}
                        {isPro && sub?.current_period_end && (
                          <span className="text-[9px] text-zinc-400 font-medium">
                            Exp: {new Date(sub.current_period_end).toLocaleDateString()}
                          </span>
                        )}
                        {isExpired && sub?.current_period_end && (
                          <span className="text-[9px] text-orange-400 font-medium">
                            Expired: {new Date(sub.current_period_end).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-zinc-400">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      {u.is_admin ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-fuchsia-700 bg-fuchsia-50 px-2 py-0.5 rounded">
                          Admin
                        </span>
                      ) : <span className="text-xs text-zinc-400">User</span>}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-3 text-zinc-400">
                        <a
                          href={`/${u.username}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-zinc-900 transition-colors"
                          title="View profile"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => toggleAdmin(u)}
                          className={`hover:text-zinc-900 transition-colors text-xs font-medium px-2 py-1 rounded border ${u.is_admin ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700' : 'border-zinc-200 hover:bg-zinc-100'}`}
                          title={u.is_admin ? "Revoke admin" : "Grant admin"}
                        >
                          {u.is_admin ? "Revoke" : "Make Admin"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Coupon Create Modal ── */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
            <button
              onClick={() => setShowCouponModal(false)}
              className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 mb-5">
              <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                <Ticket className="h-4 w-4 text-zinc-700" />
              </div>
              <h3 className="text-base font-bold text-zinc-900">Create Coupon</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Coupon Code</label>
                <input
                  type="text"
                  value={newCouponCode}
                  onChange={e => setNewCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. FREEPRO"
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm font-mono text-zinc-900 bg-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Discount (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={newCouponDiscount}
                  onChange={e => setNewCouponDiscount(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-900 bg-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
                <p className="text-[11px] text-zinc-500 mt-1">Set to 100% to grant full Pro access for free.</p>
              </div>

              {couponError && (
                <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {couponError}
                </div>
              )}

              <button
                onClick={createCoupon}
                disabled={couponSaving}
                className="w-full bg-zinc-900 text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-zinc-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {couponSaving
                  ? <><RefreshCw className="h-4 w-4 animate-spin" /> Creating…</>
                  : <><Plus className="h-4 w-4" /> Create Coupon</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({ title, value, trend }: { title: string; value: string; trend?: string }) {
  // Deterministic sparkline path based on the title
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const val1 = Math.abs((hash % 15) + 10);
  const val2 = Math.abs(((hash >> 3) % 10) + 5);
  const pathD = `M0,25 C20,${val1} 30,${val2} 50,15 C70,20 80,5 100,0`;

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm flex flex-col justify-between">
      <h3 className="text-sm font-semibold text-zinc-700">{title}</h3>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-zinc-900">{value}</span>
        {trend && <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{trend}</span>}
      </div>
      {/* Dynamic Sparkline style */}
      <div className="mt-4 h-8 w-full opacity-40 overflow-hidden">
        <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-full w-full stroke-zinc-900 fill-transparent stroke-2">
           <path d={pathD} />
        </svg>
      </div>
    </div>
  );
}
