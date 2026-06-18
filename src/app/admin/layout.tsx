"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Home, LogOut, Shield, Menu, X, ExternalLink } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const isDevBypass = process.env.NEXT_PUBLIC_DEV_MODE_DISABLE_AUTH === 'true';

      if (isDevBypass) {
        setProfile({
          id: 'dev-bypass',
          username: 'dev_admin',
          full_name: 'Development Admin',
          is_admin: true,
        });
        setLoading(false);
        return;
      }

      // Use getUser() — makes a server-side request, more reliable cross-browser than getSession()
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        router.push("/login");
        return;
      }

      // Admin check: use user_metadata as source of truth (set by service role)
      const isAdmin = !!user.user_metadata?.is_admin;
      
      if (!isAdmin) {
        router.push("/unauthorized");
        return;
      }

      // Fetch profile details for display
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .eq("id", user.id)
        .single();

      setProfile({ 
        ...(profileData || {}), 
        id: user.id,
        full_name: profileData?.full_name || user.user_metadata?.full_name || "Admin",
        username: profileData?.username || user.email?.split("@")[0] || "admin",
        is_admin: true 
      });
      setLoading(false);
    };
    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" />
      </div>
    );
  }

  const initials = profile?.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "A";

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex w-56 flex-col bg-white border-r border-zinc-200
        transition-transform duration-300 lg:static lg:translate-x-0
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Logo */}
        <div className="flex h-14 items-center justify-between border-b border-zinc-100 px-5">
          <Link href="/admin" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-zinc-900 tracking-tight">Admin Panel</span>
          </Link>
          <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden text-zinc-400 hover:text-zinc-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold bg-zinc-100 text-zinc-900"
          >
            <Home className="h-4 w-4" />
            Overview
          </Link>
        </nav>

        {/* Footer */}
        <div className="border-t border-zinc-100 p-3 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 text-zinc-500 hover:bg-zinc-100 rounded-md"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-semibold text-zinc-700">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-zinc-900 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-zinc-800 leading-none">{profile?.full_name || "Admin"}</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">{profile?.username ? `@${profile.username}` : "Administrator"}</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
