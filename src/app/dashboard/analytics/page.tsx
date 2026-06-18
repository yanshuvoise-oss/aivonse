"use client";

import { useEffect, useState, useCallback } from "react";
import { BarChart3, TrendingUp, Laptop, Globe, Eye, MousePointerClick, Loader2, Link2, FileText, Share2, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AnalyticsDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState({
    views: 0,
    clicks: 0,
    totalLinks: 0,
    filesCount: 0,
    smartLinksCount: 0,
    publicProfilesCount: 0,
    topLinks: [] as any[],
    devices: { desktop: 0, mobile: 0, tablet: 0 },
    referrals: [] as any[],
    dailyTrend: [] as any[]
  });

  const fetchAnalytics = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      // 1. Fetch user content (links & files)
      const { data: userLinks } = await supabase
        .from("links")
        .select("id, title, url, type")
        .eq("profile_id", session.user.id);

      const linksMap = new Map<string, any>(userLinks?.map((l: any) => [l.id, l]) || []);
      const totalLinks = userLinks?.filter((l: any) => l.type === "link").length || 0;
      const smartLinksCount = userLinks?.filter((l: any) => l.type === "smart_link").length || 0;
      const filesCount = userLinks?.filter((l: any) => l.type !== "link" && l.type !== "smart_link").length || 0;

      // 3. Profiles count (always 1 for the authenticated user)
      const publicProfilesCount = 1;

      // 4. Fetch Analytics logs
      const { data: logs } = await supabase
        .from("analytics")
        .select("*")
        .eq("profile_id", session.user.id);

      const viewsCount = logs ? logs.filter((l: any) => l.event_type === "view").length : 0;
      const clicksCount = logs ? logs.filter((l: any) => l.event_type === "click").length : 0;

      // Process logs if they exist
      let sortedLinks: any[] = [];
      const deviceCounts = { desktop: 0, mobile: 0, tablet: 0 };
      let sortedReferrals: any[] = [];
      let dailyTrend: any[] = [];

      if (logs && logs.length > 0) {
        // Top Links
        const linkClicks: Record<string, number> = {};
        logs.forEach((log: any) => {
          if (log.event_type === "click" && log.link_id) {
            linkClicks[log.link_id] = (linkClicks[log.link_id] || 0) + 1;
          }
        });

        sortedLinks = Object.entries(linkClicks)
          .map(([id, count]) => {
            const linkObj = linksMap.get(id);
            return {
              id,
              title: linkObj?.title || linkObj?.url || "Unknown Link",
              url: linkObj?.url || "",
              count
            };
          })
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Devices
        logs.forEach((log: any) => {
          const dev = log.device_type?.toLowerCase();
          if (dev && dev in deviceCounts) {
            deviceCounts[dev as keyof typeof deviceCounts]++;
          }
        });

        // Referrals
        const referralCounts: Record<string, number> = {};
        logs.forEach((log: any) => {
          const ref = log.referral_source || "direct";
          referralCounts[ref] = (referralCounts[ref] || 0) + 1;
        });

        sortedReferrals = Object.entries(referralCounts)
          .map(([source, count]) => ({ source, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Daily Trend (last 7 days)
        const dailyData: Record<string, number> = {};
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          dailyData[dateStr] = 0;
        }

        logs.forEach((log: any) => {
          if (log.event_type === "view" && log.created_at) {
            const dateStr = new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (dateStr in dailyData) {
              dailyData[dateStr]++;
            }
          }
        });

        dailyTrend = Object.entries(dailyData).map(([date, count]) => ({ date, count }));
      } else {
        // Build empty trend for chart consistency
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          dailyTrend.push({ date: dateStr, count: 0 });
        }
      }

      setMetrics({
        views: viewsCount,
        clicks: clicksCount,
        totalLinks,
        filesCount,
        smartLinksCount,
        publicProfilesCount,
        topLinks: sortedLinks,
        devices: deviceCounts,
        referrals: sortedReferrals,
        dailyTrend
      });
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial Fetch & Auto Refresh Effect
  useEffect(() => {
    fetchAnalytics();

    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAnalytics(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
      </div>
    );
  }

  // Calculate totals and percentages
  const ctr = metrics.views > 0 ? ((metrics.clicks / metrics.views) * 100).toFixed(1) : "0.0";
  
  const totalDev = metrics.devices.desktop + metrics.devices.mobile + metrics.devices.tablet;
  const devPercent = {
    desktop: totalDev > 0 ? Math.round((metrics.devices.desktop / totalDev) * 100) : 0,
    mobile: totalDev > 0 ? Math.round((metrics.devices.mobile / totalDev) * 100) : 0,
    tablet: totalDev > 0 ? Math.round((metrics.devices.tablet / totalDev) * 100) : 0
  };

  return (
    <div className="space-y-8 select-none max-w-6xl">
      {/* Header */}
      <div className="border-b border-zinc-200 pb-6 flex flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center border border-zinc-200">
            <BarChart3 className="h-4.5 w-4.5 text-zinc-900" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Analytics</h1>
            <p className="text-sm text-zinc-500 mt-1 font-medium">Real-time engagement tracking for your profile and links.</p>
          </div>
        </div>
        
        <button
          onClick={() => fetchAnalytics(true)}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-xl bg-white border border-zinc-200 px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-colors shadow-sm cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* Main Totals Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Views</p>
              <h3 className="text-3xl font-extrabold text-zinc-900 mt-2">{metrics.views.toLocaleString()}</h3>
            </div>
            <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 text-zinc-600 shadow-inner">
              <Eye className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Link Clicks</p>
              <h3 className="text-3xl font-extrabold text-zinc-900 mt-2">{metrics.clicks.toLocaleString()}</h3>
            </div>
            <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 text-zinc-600 shadow-inner">
              <MousePointerClick className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm col-span-2 md:col-span-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Click Through Rate</p>
              <h3 className="text-3xl font-extrabold text-zinc-900 mt-2">{ctr}%</h3>
            </div>
            <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 text-zinc-600 shadow-inner">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Links</p>
              <h4 className="text-xl font-bold text-zinc-900 mt-1">{metrics.totalLinks}</h4>
            </div>
            <Link2 className="h-5 w-5 text-zinc-400" />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Files Hosted</p>
              <h4 className="text-xl font-bold text-zinc-900 mt-1">{metrics.filesCount}</h4>
            </div>
            <FileText className="h-5 w-5 text-zinc-400" />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Smart Shares</p>
              <h4 className="text-xl font-bold text-zinc-900 mt-1">{metrics.smartLinksCount}</h4>
            </div>
            <Share2 className="h-5 w-5 text-zinc-400" />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Public Profiles</p>
              <h4 className="text-xl font-bold text-zinc-900 mt-1">{metrics.publicProfilesCount}</h4>
            </div>
            <Globe className="h-5 w-5 text-zinc-400" />
          </div>
        </div>
      </div>

      {/* Visitor trend daily line chart */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider mb-6">Visitor Trend</h3>
        <div className="h-64 w-full flex items-end relative">
          {metrics.dailyTrend.length > 0 && (
            <svg className="w-full h-full" viewBox="0 0 700 220" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="50" x2="700" y2="50" stroke="#f4f4f5" strokeDasharray="3" />
              <line x1="0" y1="110" x2="700" y2="110" stroke="#f4f4f5" strokeDasharray="3" />
              <line x1="0" y1="170" x2="700" y2="170" stroke="#f4f4f5" strokeDasharray="3" />
              
              {/* Area path */}
              <path
                d={(() => {
                  const maxVal = Math.max(...metrics.dailyTrend.map(t => t.count), 10);
                  const points = metrics.dailyTrend.map((t, idx) => {
                    const x = (idx / (metrics.dailyTrend.length - 1)) * 700;
                    const y = 200 - (t.count / maxVal) * 160;
                    return `${x},${y}`;
                  });
                  return `M0,200 L${points.join(' L')} L700,200 Z`;
                })()}
                fill="url(#grad)"
                opacity="0.1"
              />
              
              {/* Line path */}
              <path
                d={(() => {
                  const maxVal = Math.max(...metrics.dailyTrend.map(t => t.count), 10);
                  return metrics.dailyTrend.map((t, idx) => {
                    const x = (idx / (metrics.dailyTrend.length - 1)) * 700;
                    const y = 200 - (t.count / maxVal) * 160;
                    return `${idx === 0 ? 'M' : 'L'}${x},${y}`;
                  }).join(' ');
                })()}
                fill="none"
                stroke="#6366f1"
                strokeWidth="3"
                strokeLinecap="round"
              />
              
              {/* Gradients */}
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Data points */}
              {metrics.dailyTrend.map((t, idx) => {
                const maxVal = Math.max(...metrics.dailyTrend.map(v => v.count), 10);
                const x = (idx / (metrics.dailyTrend.length - 1)) * 700;
                const y = 200 - (t.count / maxVal) * 160;
                return (
                  <g key={idx} className="group cursor-pointer">
                    <circle cx={x} cy={y} r="5" fill="#6366f1" stroke="#ffffff" strokeWidth="2.5" />
                    <circle cx={x} cy={y} r="12" fill="#6366f1" opacity="0" className="hover:opacity-20 transition-opacity" />
                  </g>
                );
              })}
            </svg>
          )}
        </div>
        {/* X Axis dates */}
        <div className="flex justify-between mt-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
          {metrics.dailyTrend.map((t, idx) => (
            <span key={idx}>{t.date}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Links */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider mb-6">Top Performing Links</h3>
          {metrics.topLinks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-400 text-xs py-4">No links clicked yet. Perform clicks on your profile to see data.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {metrics.topLinks.map((link, idx) => {
                const maxCount = Math.max(...metrics.topLinks.map(l => l.count), 1);
                const percent = Math.round((link.count / maxCount) * 100);
                return (
                  <div key={link.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-mono font-bold text-zinc-400">0{idx + 1}</span>
                        <span className="font-semibold text-zinc-700 truncate">{link.title}</span>
                      </div>
                      <span className="font-bold text-zinc-900 shrink-0">{link.count} clicks</span>
                    </div>
                    <div className="h-1.5 w-full rounded bg-zinc-100 overflow-hidden">
                      <div className="h-full rounded bg-indigo-600" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Device Breakdown */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider mb-6 flex items-center gap-1.5">
              <Laptop className="h-4.5 w-4.5 text-indigo-500" /> Device Breakdown
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between font-medium mb-1.5">
                  <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Desktop</span>
                  <span className="text-zinc-900 font-bold text-xs">{devPercent.desktop}%</span>
                </div>
                <div className="h-2 w-full rounded bg-zinc-100 overflow-hidden">
                  <div className="h-full rounded bg-indigo-500" style={{ width: `${devPercent.desktop}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between font-medium mb-1.5">
                  <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Mobile</span>
                  <span className="text-zinc-900 font-bold text-xs">{devPercent.mobile}%</span>
                </div>
                <div className="h-2 w-full rounded bg-zinc-100 overflow-hidden">
                  <div className="h-full rounded bg-violet-500" style={{ width: `${devPercent.mobile}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between font-medium mb-1.5">
                  <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Tablet</span>
                  <span className="text-zinc-900 font-bold text-xs">{devPercent.tablet}%</span>
                </div>
                <div className="h-2 w-full rounded bg-zinc-100 overflow-hidden">
                  <div className="h-full rounded bg-fuchsia-500" style={{ width: `${devPercent.tablet}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Globe className="h-4.5 w-4.5 text-indigo-500" /> Traffic Sources
            </h3>
            <div className="space-y-3">
              {metrics.referrals.length === 0 ? (
                <p className="text-zinc-400 text-xs text-center py-4">No traffic referrals recorded yet.</p>
              ) : (
                metrics.referrals.map((ref, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="text-zinc-650 font-semibold font-mono capitalize">{ref.source}</span>
                    <span className="font-bold text-zinc-900">{ref.count} visits</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
