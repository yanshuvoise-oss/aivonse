"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Link2, LayoutDashboard, BarChart3, FileText, ImageIcon, File, Share2, Settings,
  LogOut, ExternalLink, Menu, X, Sparkles, User
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { supabase } from "@/lib/supabase";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [subType, setSubType] = useState("free");
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [counts, setCounts] = useState({ link: 0, pdf: 0, image: 0, document: 0 });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const isDevBypass = process.env.NEXT_PUBLIC_DEV_MODE_DISABLE_AUTH === 'true';

        if (isDevBypass) {
          setProfile({
            id: 'dev-bypass',
            username: 'dev_user',
            full_name: 'Development User',
            is_admin: true,
          });
          setSubType("pro");
          return;
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
        if (!session) {
          router.push("/login");
          return;
        }

        let { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();
          
        if (profileError) throw profileError;

        // Auto-create profile if missing (e.g. trigger failed or account restored)
        if (!profileData) {
          const newProfile = {
            id: session.user.id,
            username: session.user.email?.split('@')[0] || `user_${Date.now()}`,
            full_name: session.user.user_metadata?.full_name || 'New User',
            is_admin: false,
            created_at: new Date().toISOString()
          };
          
          const { data: insertedProfile, error: insertError } = await supabase
            .from("profiles")
            .insert(newProfile)
            .select()
            .single();
            
          if (insertError) throw insertError;
          profileData = insertedProfile;
        }

        setProfile(profileData);

        let finalPlanType = "free";
        try {
          const res = await fetch("/api/coupons/redeem");
          if (res.ok) {
            const data = await res.json();
            finalPlanType = data.plan_type || "free";
          } else {
            throw new Error("API failed");
          }
        } catch (e) {
          // Fallback to direct supabase query
          const { data: subData } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("profile_id", session.user.id)
            .single();
            
          if (subData) {
            const isExpired = subData.plan_type === "pro" && subData.current_period_end && new Date(subData.current_period_end) < new Date();
            finalPlanType = isExpired ? "free" : subData.plan_type;
          }
        }
        setSubType(finalPlanType);
      } catch (err: any) {
        const msg = err?.message || err?.details || (typeof err === 'string' ? err : JSON.stringify(err));
        console.error("Dashboard auth error:", msg, err);
        await supabase.auth.signOut();
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  useEffect(() => {
    const fetchCounts = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: linksData } = await supabase
        .from("links")
        .select("type")
        .eq("profile_id", session.user.id);

      if (linksData) {
        const countsObj = { link: 0, pdf: 0, image: 0, document: 0 };
        linksData.forEach((l: any) => {
          if (l.type in countsObj) {
            countsObj[l.type as keyof typeof countsObj]++;
          }
        });
        setCounts(countsObj);
      }
    };
    fetchCounts();
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div suppressHydrationWarning className="flex h-screen items-center justify-center bg-[#FDFDFE] text-zinc-500">
        <div suppressHydrationWarning className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
        <span suppressHydrationWarning className="ml-3 text-sm font-medium">Loading session...</span>
      </div>
    );
  }

  const topNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Links", href: "/dashboard/links", icon: Link2, count: counts.link },
    { name: "PDFs", href: "/dashboard/pdfs", icon: FileText, count: counts.pdf },
    { name: "Images", href: "/dashboard/images", icon: ImageIcon, count: counts.image },
    { name: "Documents", href: "/dashboard/documents", icon: File, count: counts.document },
  ];

  const bottomNavItems = [
    { name: "Smart Links", href: "/dashboard/smart-links", icon: Share2 },
    { name: "Profile", href: "/dashboard/profile", icon: User },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div suppressHydrationWarning className="min-h-screen bg-[#FDFDFE] flex flex-col md:flex-row text-zinc-900 font-sans selection:bg-zinc-200">
      {/* Mobile Top Navbar */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3.5 md:hidden sticky top-0 z-50">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800">
            <Logo className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-sm text-zinc-900">Aivones</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 shadow-sm"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar - Desktop */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-zinc-100 bg-white p-5 
        transition-transform duration-300 md:static md:translate-x-0
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Logo / Title */}
        <div className="flex items-center justify-between mb-8 px-2">
          <Link href="/dashboard" className="flex items-center space-x-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 text-white"><path d="M12 2L2 22l10-4 10 4L12 2z" /></svg>
            </div>
            <span className="text-base font-extrabold tracking-tight text-zinc-900">Aivones</span>
          </Link>
          <button className="md:hidden text-zinc-500" onClick={() => setMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-grow space-y-1">
          {topNavItems.map((item) => {
            const Icon = item.icon;
            
            // Check active state
            let isActive = false;
            if (item.href === "/dashboard") {
              isActive = pathname === "/dashboard";
            } else {
              isActive = pathname.startsWith(item.href);
            }
              
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200
                  ${isActive 
                    ? "bg-zinc-100/80 text-zinc-900" 
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                  }
                `}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4" />
                  {item.name}
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm transition-all ${
                    isActive ? "bg-white text-zinc-900" : "bg-zinc-100 text-zinc-550 group-hover:bg-zinc-200"
                  }`}>
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="mt-4 pt-4 border-t border-zinc-100"></div>

          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200
                  ${isActive 
                    ? "bg-zinc-100/80 text-zinc-900" 
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}

        </nav>

        {/* Bottom User Area */}
        <div className="mt-auto pt-4 space-y-3">
          {/* User Display */}
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 rounded-full overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <User className="h-full w-full p-2 text-zinc-400" />
              )}
            </div>
            <div className="min-w-0 flex-grow">
              <h4 className="text-[13px] font-bold text-zinc-900 truncate">{profile?.full_name || "User"}</h4>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] text-zinc-500 truncate">@{profile?.username || "username"}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 uppercase tracking-wide ${
                  subType === "pro" 
                    ? "bg-amber-100 text-amber-700 border border-amber-200 shadow-sm" 
                    : "bg-zinc-100 text-zinc-600 border border-transparent"
                }`}>
                  {subType}
                </span>
              </div>
            </div>
          </div>
          
          {subType === "free" && (
            <Link 
              href="/pricing"
              className="w-full flex justify-center items-center gap-2 px-3 py-2.5 rounded-lg text-[13px] font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md transition-all group"
            >
              <Sparkles className="h-4 w-4 text-blue-200 group-hover:text-white" />
              Upgrade to Pro
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-semibold text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-all"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0 bg-[#FDFDFE]">
        <main className="flex-grow p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
