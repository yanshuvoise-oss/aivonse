"use client";

import { useEffect, useState } from "react";
import { 
  Link2, FileText, ImageIcon, File, Search, Bell, ChevronDown, MoveUpRight, ArrowRight, Copy, Check
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SmartShareModal } from "@/components/SmartShareModal";

export default function DashboardOverview() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    views: 0,
    clicks: 0,
    mediaCount: 0,
    storageGB: 0,
    dailyTrend: [] as any[],
  });

  const [recentContent, setRecentContent] = useState<any[]>([]);
  const [allLinks, setAllLinks] = useState<any[]>([]);
  const [activeProfileTab, setActiveProfileTab] = useState("link");
  const [isCopied, setIsCopied] = useState(false);
  const [isSmartShareOpen, setIsSmartShareOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const [profileResult, linksResult, analyticsResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", session.user.id).single(),
        supabase.from("links").select("*").eq("profile_id", session.user.id).order("created_at", { ascending: false }),
        supabase.from("analytics").select("event_type, created_at").eq("profile_id", session.user.id)
      ]);

      if (profileResult.data) {
        setProfile(profileResult.data);
      }

      const allLinksData = linksResult.data || [];
      setAllLinks(allLinksData);
      setRecentContent(allLinksData.slice(0, 4));

      const mediaItems = allLinksData.filter((l: any) => l.type !== "link");
      const storageEstimate = (mediaItems.length * 2.4) / 1024; // Mocking roughly 2.4MB per file

      const analyticsData = analyticsResult.data || [];
      const views = analyticsData.filter((a: any) => a.event_type === "view").length;
      const clicks = analyticsData.filter((a: any) => a.event_type === "click").length;

      // Calculate 14-day daily trend
      const dailyTrend: any[] = [];
      for (let i = 13; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const keyString = date.toISOString().split("T")[0];

        const dayLogs = analyticsData.filter((log: any) => log.created_at.startsWith(keyString));
        const dayViews = dayLogs.filter((log: any) => log.event_type === "view").length;
        const dayClicks = dayLogs.filter((log: any) => log.event_type === "click").length;

        // cumulative files & storage up to this day
        const dayDate = new Date(keyString + "T23:59:59Z");
        const filesUntilDay = allLinksData.filter((l: any) => l.type !== "link" && new Date(l.created_at) <= dayDate);
        const dayFiles = filesUntilDay.length;
        const dayStorage = parseFloat(((dayFiles * 2.4) / 1024).toFixed(4));

        dailyTrend.push({ date: dateString, views: dayViews, clicks: dayClicks, files: dayFiles, storage: dayStorage });
      }



      setStats({
        views,
        clicks,
        mediaCount: mediaItems.length,
        storageGB: parseFloat(storageEstimate.toFixed(2)),
        dailyTrend,
      });

      setLoading(false);
    };

    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-400">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-900 border-t-transparent"></div>
      </div>
    );
  }

  // Social Icons mapping for profile card
  const socials = profile?.social_links || {};
  const hasSocials = Object.values(socials).some(v => v);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="h-3.5 w-3.5 text-blue-500" />;
      case 'pdf': return <FileText className="h-3.5 w-3.5 text-red-500" />;
      case 'document': return <File className="h-3.5 w-3.5 text-blue-600" />;
      default: return <Link2 className="h-3.5 w-3.5 text-zinc-500" />;
    }
  };

  // Helper to generate smooth SVG paths from data points
  const generateSmoothPath = (data: number[], width = 100, height = 20, isBigChart = false) => {
    if (!data || data.length === 0) return "";
    const paddingY = isBigChart ? 10 : 2;
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - paddingY * 2) - paddingY;
      return { x, y };
    });

    if (points.length === 1) return `M0,${height} L${width},${height}`;

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(i - 1, 0)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(i + 2, points.length - 1)];

      const tension = 0.2;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };


  return (
    <div className="flex flex-col xl:flex-row gap-6 items-start select-none">
      
      {/* Left Main Content */}
      <div className="flex-1 min-w-0 space-y-6 w-full">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-zinc-100 shadow-sm mb-6">
          <h2 className="font-bold text-xl text-zinc-900">Dashboard</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5">
              <span className="text-[11px] text-zinc-500 font-medium">aivones.com/{profile?.username}</span>
            </div>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/${profile?.username}`);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
              }}
              className="flex items-center gap-1.5 bg-zinc-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {isCopied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-zinc-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-[11px] text-zinc-500 font-medium mb-1">Total Views</p>
            <div className="flex items-baseline gap-2 mb-3">
              <p className="text-xl font-bold text-zinc-900">{stats.views > 0 ? stats.views.toLocaleString() : '0'}</p>
            </div>
            <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 20" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" preserveAspectRatio="none">
              <path d={generateSmoothPath(stats.dailyTrend.map(d => d.views))} />
            </svg>
          </div>
          
          <div className="bg-white border border-zinc-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-[11px] text-zinc-500 font-medium mb-1">Link Clicks</p>
            <div className="flex items-baseline gap-2 mb-3">
              <p className="text-xl font-bold text-zinc-900">{stats.clicks > 0 ? stats.clicks.toLocaleString() : '0'}</p>
            </div>
            <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 20" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" preserveAspectRatio="none">
              <path d={generateSmoothPath(stats.dailyTrend.map(d => d.clicks))} />
            </svg>
          </div>

          <div className="bg-white border border-zinc-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-[11px] text-zinc-500 font-medium mb-1">Files</p>
            <div className="flex items-baseline gap-2 mb-3">
              <p className="text-xl font-bold text-zinc-900">{stats.mediaCount.toLocaleString()}</p>
            </div>
            <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 20" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" preserveAspectRatio="none">
              <path d={generateSmoothPath(stats.dailyTrend.map(d => d.files))} />
            </svg>
          </div>

          <div className="bg-white border border-zinc-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-[11px] text-zinc-500 font-medium mb-1">Storage Used</p>
            <div className="flex items-baseline gap-2 mb-3">
              <p className="text-xl font-bold text-zinc-900">~{stats.storageGB > 0 ? stats.storageGB : '0.00'} GB</p>
            </div>
          </div>
        </div>

        {/* Bottom Split (Recent & Chart) */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Recent Content */}
          <div className="flex-1 bg-white border border-zinc-100 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-[14px] text-zinc-900">Recent Content</h3>
              <Link href="/dashboard/links" className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 transition-colors">View all</Link>
            </div>
            <div className="space-y-4">
              {recentContent.length > 0 ? recentContent.map((item) => (
                <div key={item.id} className="flex justify-between items-center group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center group-hover:bg-zinc-100 transition-colors">
                      {getFileIcon(item.type)}
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-zinc-900 leading-tight truncate max-w-[300px]">
                        {item.title || item.url}
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-0.5 truncate max-w-[300px]">
                        {item.type === 'link' ? item.url : 'Uploaded File'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[12px] font-bold text-zinc-900 bg-zinc-50 px-2 py-1 rounded">--</span>
                </div>
              )) : (
                <div className="text-center py-8 text-zinc-400 text-sm">
                  No content added yet.
                </div>
              )}
            </div>
          </div>

          {/* Profile Views Chart */}
          <div className="lg:w-72 bg-white border border-zinc-100 rounded-xl p-5 shadow-sm relative shrink-0">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[11px] text-zinc-500 font-medium mb-1">Profile Views</p>
                <p className="text-2xl font-bold text-zinc-900">{stats.views > 0 ? stats.views.toLocaleString() : '0'}</p>
              </div>
              <div className="h-6 w-6 rounded-md bg-zinc-50 flex items-center justify-center border border-zinc-100">
                <MoveUpRight className="h-3 w-3 text-zinc-400" />
              </div>
            </div>
            
            <div className="h-40 w-full relative mt-4">
              <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[9px] font-medium text-zinc-400">
                <span>{Math.max(stats.views, 10)}</span>
                <span>{Math.max(Math.floor(stats.views * 0.75), 7)}</span>
                <span>{Math.max(Math.floor(stats.views * 0.5), 5)}</span>
                <span>0</span>
              </div>
              <div className="absolute left-8 right-0 top-1 bottom-6">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {(() => {
                    const viewData = stats.dailyTrend.map(d => d.views);
                    const path = generateSmoothPath(viewData, 100, 100, true);
                    return (
                      <>
                        <path d={path} fill="none" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d={`${path} L100 100 L0 100 Z`} fill="url(#gradientDash)" opacity="0.1" />
                      </>
                    );
                  })()}
                  <defs>
                    <linearGradient id="gradientDash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#18181b" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <circle cx="100" cy={
                    (() => {
                      const viewData = stats.dailyTrend.map(d => d.views);
                      const max = Math.max(...viewData, 1);
                      const min = Math.min(...viewData, 0);
                      const lastVal = viewData[viewData.length - 1] || 0;
                      return 100 - ((lastVal - min) / (max - min || 1)) * 80 - 10;
                    })()
                  } r="3.5" fill="#18181b" stroke="#fff" strokeWidth="1.5" />
                </svg>
                <div className="absolute right-0 top-0 bottom-0 border-r border-dashed border-zinc-300 pointer-events-none"></div>
              </div>
              <div className="absolute left-8 right-0 bottom-0 flex justify-between text-[9px] font-medium text-zinc-400">
                <span>{stats.dailyTrend[0]?.date || "14 days ago"}</span>
                <span>{stats.dailyTrend[stats.dailyTrend.length - 1]?.date || "Today"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar Profile Card */}
      <div className="w-full xl:w-80 bg-white rounded-[24px] shadow-sm border border-zinc-100 p-5 shrink-0">
        <div className="flex flex-col items-center pt-2 pb-4">
          <div className="h-20 w-20 rounded-full bg-zinc-100 mb-4 overflow-hidden border border-zinc-200 shadow-sm relative group">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400 bg-zinc-50">No Image</div>
            )}
            <Link href="/dashboard/profile" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] text-white font-bold">Edit</span>
            </Link>
          </div>
          
          <h4 className="font-extrabold text-base text-zinc-900">{profile?.full_name || "Your Name"}</h4>
          <p className="text-[11px] text-zinc-500 mb-3 font-medium">@{profile?.username || "username"}</p>
          
          <p className="text-[11px] text-zinc-600 text-center leading-relaxed px-2 max-w-[220px]">
            {profile?.bio || "Add a bio in settings to tell people who you are and what you do."}
          </p>
          
          {hasSocials && (
            <div className="flex gap-3 mt-5 text-zinc-400">
              {socials.twitter && <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>}
              {socials.github && <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.8c0-1.2-.4-2.2-1-2.9 3-.3 6-1.5 6-6.5 0-1.4-.5-2.6-1.3-3.5.1-.3.6-1.6-.1-3.4 0 0-1-.3-3.3 1.2-.9-.3-1.9-.4-2.9-.4s-2 .1-2.9.4C5 2.5 4 2.8 4 2.8c-.7 1.8-.2 3.1-.1 3.4-.8.9-1.3 2.1-1.3 3.5 0 5 3 6.2 6 6.5-.6.6-1 1.6-1 3v3.8"></path></svg>}
              {socials.instagram && <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>}
              {/* Only showing a few for mockup cleanliness */}
            </div>
          )}
          
          <Link href="/dashboard/profile" className="mt-4 text-[10px] font-bold text-zinc-400 hover:text-zinc-900 border border-zinc-200 px-3 py-1 rounded-full transition-colors">
            Edit Profile
          </Link>
        </div>

        {(() => {
          const countsObj = {
            link: allLinks.filter(l => l.type === "link").length,
            pdf: allLinks.filter(l => l.type === "pdf").length,
            image: allLinks.filter(l => l.type === "image").length,
            document: allLinks.filter(l => l.type === "document").length,
          };
          return (
            <>
              <div className="flex gap-4 border-b border-zinc-100 pb-2 mb-4 px-2 justify-between mt-2">
                <div onClick={() => { if (activeProfileTab === "link") router.push("/dashboard/links"); else setActiveProfileTab("link"); }} className={`text-[11px] font-bold cursor-pointer transition-colors ${activeProfileTab === "link" ? "text-zinc-900 border-b-2 border-zinc-900 pb-1.5 -mb-[9px]" : "text-zinc-400 hover:text-zinc-600 pb-1.5"}`}>Links ({countsObj.link})</div>
                <div onClick={() => { if (activeProfileTab === "pdf") router.push("/dashboard/pdfs"); else setActiveProfileTab("pdf"); }} className={`text-[11px] font-bold cursor-pointer transition-colors ${activeProfileTab === "pdf" ? "text-zinc-900 border-b-2 border-zinc-900 pb-1.5 -mb-[9px]" : "text-zinc-400 hover:text-zinc-600 pb-1.5"}`}>PDFs ({countsObj.pdf})</div>
                <div onClick={() => { if (activeProfileTab === "image") router.push("/dashboard/images"); else setActiveProfileTab("image"); }} className={`text-[11px] font-bold cursor-pointer transition-colors ${activeProfileTab === "image" ? "text-zinc-900 border-b-2 border-zinc-900 pb-1.5 -mb-[9px]" : "text-zinc-400 hover:text-zinc-600 pb-1.5"}`}>Images ({countsObj.image})</div>
                <div onClick={() => { if (activeProfileTab === "document") router.push("/dashboard/documents"); else setActiveProfileTab("document"); }} className={`text-[11px] font-bold cursor-pointer transition-colors ${activeProfileTab === "document" ? "text-zinc-900 border-b-2 border-zinc-900 pb-1.5 -mb-[9px]" : "text-zinc-400 hover:text-zinc-600 pb-1.5"}`}>Docs ({countsObj.document})</div>
              </div>

              <div className="space-y-2.5">
                {allLinks.filter(l => l.type === activeProfileTab).length > 0 ? allLinks.filter(l => l.type === activeProfileTab).slice(0, 4).map((item) => (
                  <div key={item.id} onClick={() => { const targetPath = item.type === "link" ? "/dashboard/links" : `/dashboard/${item.type}s`; router.push(targetPath); }} className="bg-white rounded-xl p-3 flex items-center gap-3 border border-zinc-100 shadow-sm hover:border-zinc-200 transition-colors cursor-pointer group">
                    <div className="h-9 w-9 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center group-hover:bg-zinc-100">
                      {getFileIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-bold text-zinc-900 truncate">{item.title || item.url}</div>
                      <div className="text-[10px] text-zinc-400 font-medium truncate">{item.type}</div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                  </div>
                )) : (
                  <div className="text-center py-6 border border-dashed border-zinc-200 rounded-xl bg-zinc-50">
                    <p className="text-[10px] text-zinc-500 mb-2">No {activeProfileTab}s added yet.</p>
                    <Link href={activeProfileTab === 'link' ? '/dashboard/links' : `/dashboard/${activeProfileTab}s`} className="text-[11px] font-bold text-zinc-900 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg shadow-sm">
                      Add Content
                    </Link>
                  </div>
                )}
              </div>
            </>
          );
        })()}
      </div>

      {profile && (
        <SmartShareModal 
          isOpen={isSmartShareOpen} 
          onClose={() => setIsSmartShareOpen(false)} 
          profileId={profile.id}
          profileUsername={profile.username}
        />
      )}
    </div>
  );
}
