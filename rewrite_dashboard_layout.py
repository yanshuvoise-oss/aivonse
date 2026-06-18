import sys

content = """\"use client\";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Link2, LayoutDashboard, BarChart3, FileText, ImageIcon, File, Share2, Settings,
  LogOut, ShieldAlert, ExternalLink, Menu, X, Sparkles, User
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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
        if (!session) {
          router.push("/login");
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
          
        if (profileError) throw profileError;
        setProfile(profileData);

        const { data: subData } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("profile_id", session.user.id)
          .single();
          
        if (subData) {
          setSubType(subData.plan_type);
        }
      } catch (err) {
        console.error("Dashboard auth error:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FDFDFE] text-zinc-500">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
        <span className="ml-3 text-sm font-medium">Loading session...</span>
      </div>
    );
  }

  const isAdmin = profile?.is_admin === true;

  const topNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Links", href: "/dashboard/links", icon: Link2 },
    { name: "PDFs", href: "/dashboard/links?type=pdf", icon: FileText },
    { name: "Images", href: "/dashboard/links?type=image", icon: ImageIcon },
    { name: "Documents", href: "/dashboard/links?type=document", icon: File },
  ];

  const bottomNavItems = [
    { name: "Smart Links", href: "/dashboard/smart-links", icon: Share2 },
    { name: "Public Profile", href: "/dashboard/settings", icon: User },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFE] flex flex-col md:flex-row text-zinc-900 font-sans selection:bg-zinc-200">
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
            // Check active state more broadly for links section
            const isActive = item.href === "/dashboard" 
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href.split('?')[0]);
              
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

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className={`
                mt-2 flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200
                ${pathname.startsWith("/admin") 
                  ? "bg-rose-50 text-rose-600" 
                  : "text-rose-500 hover:bg-rose-50"
                }
              `}
            >
              <ShieldAlert className="h-4 w-4" />
              Admin Panel
            </Link>
          )}
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
                    ? "bg-violet-100 text-violet-600" 
                    : "bg-zinc-100 text-zinc-600"
                }`}>
                  {subType}
                </span>
              </div>
            </div>
          </div>
          
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
        <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
"""

with open('/Users/voise/Desktop/aivones/src/app/dashboard/layout.tsx', 'w') as f:
    f.write(content)
