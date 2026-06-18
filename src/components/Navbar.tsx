"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Menu, X, LayoutDashboard, Shield, LogOut } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const isAdmin = session?.user?.user_metadata?.is_admin === true;

  // Hide navbar on auth and dashboard routes
  if (
    pathname.startsWith("/login") || 
    pathname.startsWith("/register") || 
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin")
  ) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 bg-white/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex max-w-7xl h-[72px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 transition-transform duration-300 group-hover:scale-105">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5 text-white">
              <path d="M12 2L2 22l10-4 10 4L12 2z" />
            </svg>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-zinc-900">
            Aivones
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-[14px] font-semibold text-zinc-600">
          <Link href="/#product" className="hover:text-zinc-900 transition-colors">
            Product
          </Link>
          <Link href="/#features" className="hover:text-zinc-900 transition-colors">
            Features
          </Link>
          <Link href="/#product" className="hover:text-zinc-900 transition-colors">
            Use Cases
          </Link>
          {session && (
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1.5 ml-4 border-l border-zinc-200 pl-4">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
          )}
          {session && isAdmin && (
            <Link href="/admin" className="text-fuchsia-600 hover:text-fuchsia-700 transition-colors flex items-center gap-1.5 ml-4">
              <Shield className="h-4 w-4" /> Admin
            </Link>
          )}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {loading ? (
            <div className="h-9 w-24 rounded-full bg-zinc-100 animate-pulse" />
          ) : session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-zinc-600">
                {session.user.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-all cursor-pointer shadow-sm"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[14px] font-bold text-zinc-700 hover:text-zinc-900 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-zinc-900 px-5 py-2.5 text-[14px] font-bold text-white hover:bg-zinc-800 shadow-sm transition-all"
              >
                Sign up free
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 md:hidden hover:bg-zinc-50 shadow-sm"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200 bg-white px-4 pt-2 pb-6 space-y-4 shadow-lg absolute w-full">
          <Link
            href="/#product"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-zinc-600 font-semibold hover:text-zinc-900 transition-colors py-2"
          >
            Product
          </Link>
          <Link
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-zinc-600 font-semibold hover:text-zinc-900 transition-colors py-2"
          >
            Features
          </Link>
          <Link
            href="/#product"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-zinc-600 font-semibold hover:text-zinc-900 transition-colors py-2"
          >
            Use Cases
          </Link>

          {session && (
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-blue-600 font-bold hover:text-blue-700 transition-colors py-2"
            >
              Dashboard
            </Link>
          )}
          {session && isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-fuchsia-600 font-bold hover:text-fuchsia-700 transition-colors py-2"
            >
              Admin Panel
            </Link>
          )}
          <hr className="border-zinc-100 my-2" />
          <div className="flex flex-col gap-3 pt-2">
            {session ? (
              <>
                <span className="text-sm font-medium text-zinc-500 text-center">{session.user.email}</span>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white py-3 text-sm font-bold text-zinc-700 hover:bg-zinc-50 shadow-sm cursor-pointer"
                >
                  <LogOut className="h-4 w-4" /> Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-center rounded-full border border-zinc-200 bg-white py-3 text-[15px] font-bold text-zinc-700 shadow-sm"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-center rounded-full bg-zinc-900 py-3 text-[15px] font-bold text-white shadow-sm"
                >
                  Sign up free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
