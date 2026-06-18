"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Link2, FileText, Image as ImageIcon, Video, File, 
  AlertCircle, ArrowUpRight, X, Download, Eye, Loader2,
  Share, Bell, CheckCircle2, Copy, UserPlus, Mail, Phone, Send, MessageSquare, Globe
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params?.username as string;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [activeMedia, setActiveMedia] = useState<any>(null);
  const [stats, setStats] = useState({ views: 0, links: 0, pdfs: 0, images: 0, documents: 0 });
  const [activeTab, setActiveTab] = useState("All");
  const [copied, setCopied] = useState(false);
  const [showSocialsModal, setShowSocialsModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    if (!username) return;

    const loadProfileData = async () => {
      // 1. Fetch profile details
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username.toLowerCase());

      if (profileError || !profileData || profileData.length === 0) {
        setLoading(false);
        return;
      }

      const prof = profileData[0];
      setProfile(prof);

      // 2. Log profile view analytics event
      let device = "desktop";
      if (typeof window !== "undefined") {
        const ua = navigator.userAgent;
        if (/tablet|ipad|playbook|silk/i.test(ua)) device = "tablet";
        else if (/mobile|iphone|ipod|android|blackberry|iemobile/i.test(ua)) device = "mobile";
      }

      let referralSource = "direct";
      try {
        if (document.referrer) referralSource = new URL(document.referrer).hostname;
      } catch { /* malformed referrer */ }

      await supabase.from("analytics").insert({
        profile_id: prof.id,
        link_id: null,
        event_type: "view",
        device_type: device,
        referral_source: referralSource
      });

      // 3. Fetch link items
      const { data: linksData } = await supabase
        .from("links")
        .select("*")
        .eq("profile_id", prof.id)
        .eq("is_enabled", true)
        .order("sort_order", { ascending: true });

      let parsedLinks = [];
      if (linksData) {
        parsedLinks = linksData;
        setLinks(linksData);
      }

      // 4. Fetch Analytics for total views
      const { data: analyticsData } = await supabase
        .from("analytics")
        .select("*")
        .eq("profile_id", prof.id)
        .eq("event_type", "view");

      setStats({
        views: analyticsData ? analyticsData.length : 0,
        links: parsedLinks.filter((l: any) => l.type === "link").length,
        pdfs: parsedLinks.filter((l: any) => l.type === "pdf").length,
        images: parsedLinks.filter((l: any) => l.type === "image").length,
        documents: parsedLinks.filter((l: any) => l.type === "document").length,
      });

      setLoading(false);
    };

    loadProfileData();
  }, [username]);

  const handleLinkClick = async (link: any) => {
    if (!profile) return;
    // 1. Log click event
    let device = "desktop";
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent;
      if (/tablet|ipad/i.test(ua)) device = "tablet";
      else if (/mobile|iphone|ipod|android/i.test(ua)) device = "mobile";
    }

    let referralSource = "direct";
    try {
      if (document.referrer) referralSource = new URL(document.referrer).hostname;
    } catch { /* malformed referrer */ }

    await supabase.from("analytics").insert({
      profile_id: profile.id,
      link_id: link.id,
      event_type: "click",
      device_type: device,
      referral_source: referralSource
    });

    // 2. Execute action
    if (link.type === "link") {
      if (typeof window !== "undefined" && link.url) {
        window.open(link.url, "_blank", "noopener,noreferrer");
      }
    } else {
      // Preview in modal instead of new page to keep them on the profile
      setActiveMedia(link);
    }
  };

  const handleCopyProfile = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F9F9FB] text-zinc-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Profile not found state
  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9F9FB] px-4 text-center select-none text-zinc-900">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm border border-zinc-200 text-rose-500 mb-6">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-zinc-900">Profile Not Found</h2>
        <p className="mt-2 text-sm text-zinc-500 max-w-xs">
          The username &apos;{username}&apos; is not registered on the Aivones sharing platform.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-8 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white cursor-pointer shadow-md hover:bg-blue-700 transition-colors"
        >
          Build Your Own Profile Link
        </button>
      </div>
    );
  }

  const getMediaIcon = (type: string, className = "h-5 w-5") => {
    switch (type) {
      case "pdf": return <FileText className={`${className} text-rose-500`} />;
      case "image": return <ImageIcon className={`${className} text-emerald-500`} />;
      case "video": return <Video className={`${className} text-cyan-500`} />;
      case "document": return <File className={`${className} text-blue-500`} />;
      default: return <Link2 className={`${className} text-zinc-900`} />;
    }
  };

  const getCardThumb = (link: any) => {
    if (link.type === 'image' && link.media_url) {
      return (
        <div className="w-full h-32 bg-zinc-100 flex items-center justify-center overflow-hidden border-b border-zinc-100">
          <img src={link.media_url} alt={link.title} className="w-full h-full object-cover" />
        </div>
      );
    }
    
    // Default placeholder thumbnail based on type
    const colors = {
      link: "bg-gradient-to-br from-zinc-800 to-zinc-900",
      pdf: "bg-gradient-to-br from-rose-50 to-rose-100/50",
      image: "bg-gradient-to-br from-emerald-50 to-emerald-100/50",
      video: "bg-gradient-to-br from-cyan-50 to-cyan-100/50",
      document: "bg-gradient-to-br from-blue-50 to-blue-100/50"
    };
    
    const bg = colors[link.type as keyof typeof colors] || colors.link;
    
    return (
      <div className={`w-full h-32 flex items-center justify-center border-b border-zinc-100 ${bg}`}>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-zinc-100">
          {getMediaIcon(link.type, "h-8 w-8")}
        </div>
      </div>
    );
  };

  const socialLinks = profile.social_links ? Object.entries(profile.social_links).filter(([_, handle]) => !!handle) : [];
  
  // Filter logic
  const filteredLinks = activeTab === "All" 
    ? links 
    : links.filter(l => {
        if (activeTab === "Links") return l.type === "link";
        if (activeTab === "PDFs") return l.type === "pdf";
        if (activeTab === "Images") return l.type === "image";
        if (activeTab === "Documents") return l.type === "document";
        return true;
      });

  const featuredLinks = links.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#F9F9FB] text-zinc-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#F9F9FB]/80 backdrop-blur-md border-b border-zinc-200/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Aivones Logo */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-900">
              <path d="M12 2L2 22l10-4 10 4L12 2z" />
            </svg>
            <span className="font-bold text-lg tracking-tight">Aivones</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleCopyProfile}
              className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer"
            >
              {copied ? <CheckCircle2 className="h-4 w-4" /> : <Share className="h-4 w-4" />}
              Share Profile
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        
        {/* Profile Block */}
        <section className="flex flex-col items-center text-center space-y-5">
          <div className="h-28 w-28 rounded-full overflow-hidden border border-zinc-200 shadow-sm bg-white p-1">
            <div className="h-full w-full rounded-full overflow-hidden bg-zinc-100">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-tr from-violet-500 to-fuchsia-500 text-white text-4xl font-extrabold shadow-inner">
                  {profile.full_name ? profile.full_name.substring(0,1).toUpperCase() : (profile.username || "?").substring(0,2).toUpperCase()}
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-1.5 flex flex-col items-center">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
                {profile.full_name || `@${profile.username}`}
              </h1>
              <CheckCircle2 className="h-6 w-6 text-blue-500 fill-blue-50" />
            </div>
            {profile.full_name && (
              <p className="text-zinc-500 font-semibold text-sm">@{profile.username}</p>
            )}
          </div>

          {profile.bio && (
            <p className="max-w-xl text-zinc-600 leading-relaxed text-base">
              {profile.bio}
            </p>
          )}

          <div className="flex items-center gap-3 pt-3">
            <button 
              onClick={() => setShowSocialsModal(true)}
              className="bg-zinc-900 hover:bg-zinc-800 text-white h-12 px-12 flex items-center justify-center text-base font-bold rounded-full transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Follow
            </button>
            <button 
              onClick={() => setShowContactModal(true)}
              className="h-12 w-12 flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 rounded-full transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Contact Methods"
            >
              <UserPlus className="h-5 w-5" />
            </button>
          </div>
        </section>

        {/* Stats Section */}
        <section>
          <h3 className="text-lg font-bold text-zinc-900 mb-4">Profile Analytics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/60 backdrop-blur-md border border-zinc-200/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-50 p-2 rounded-xl text-blue-600 mb-2"><Link2 className="h-5 w-5" /></div>
              <span className="text-2xl font-extrabold text-zinc-900">{stats.links}</span>
              <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mt-1">Links</span>
            </div>
            <div className="bg-white/60 backdrop-blur-md border border-zinc-200/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-rose-50 p-2 rounded-xl text-rose-600 mb-2"><FileText className="h-5 w-5" /></div>
              <span className="text-2xl font-extrabold text-zinc-900">{stats.pdfs}</span>
              <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mt-1">PDFs</span>
            </div>
            <div className="bg-white/60 backdrop-blur-md border border-zinc-200/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600 mb-2"><ImageIcon className="h-5 w-5" /></div>
              <span className="text-2xl font-extrabold text-zinc-900">{stats.images}</span>
              <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mt-1">Images</span>
            </div>
            <div className="bg-white/60 backdrop-blur-md border border-zinc-200/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-amber-50 p-2 rounded-xl text-amber-600 mb-2"><File className="h-5 w-5" /></div>
              <span className="text-2xl font-extrabold text-zinc-900">{stats.documents}</span>
              <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mt-1">Docs</span>
            </div>
          </div>
        </section>

        {/* Featured Content Section */}
        {featuredLinks.length > 0 && (
          <section>
            <h3 className="text-lg font-bold text-zinc-900 mb-4">Featured</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredLinks.map(link => (
                <div key={`feat-${link.id}`} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
                  {getCardThumb(link)}
                  <div className="p-4 flex flex-col flex-grow">
                    <h4 className="font-bold text-sm text-zinc-900 line-clamp-2 mb-1">{link.title}</h4>
                    <p className="text-xs text-zinc-500 line-clamp-2 mb-4">
                      {link.type === 'link' ? link.url : `${link.type.toUpperCase()} File Attachment`}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-md">
                        {getMediaIcon(link.type, "h-3.5 w-3.5")}
                        <span className="capitalize">{link.type}</span>
                      </div>
                      <button 
                        onClick={() => handleLinkClick(link)}
                        className="text-xs font-semibold bg-zinc-900 text-white px-4 py-1.5 rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        {link.type === 'link' ? 'Open' : 'View'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Content Navigation & Feed */}
        <section>
          <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {["All", "Links", "PDFs", "Images", "Documents"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === tab 
                    ? "bg-zinc-900 text-white shadow-sm" 
                    : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {filteredLinks.length === 0 ? (
            <div className="text-center py-16 bg-white border border-zinc-200 border-dashed rounded-3xl">
              <p className="text-zinc-500 text-sm">No items found for this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredLinks.map(link => (
                <div key={link.id} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
                  {getCardThumb(link)}
                  <div className="p-4 flex flex-col flex-grow">
                    <h4 className="font-bold text-sm text-zinc-900 line-clamp-2 mb-1">{link.title}</h4>
                    <p className="text-xs text-zinc-500 line-clamp-2 mb-4">
                      {link.type === 'link' ? link.url : `${link.type.toUpperCase()} File Attachment`}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-md">
                        {getMediaIcon(link.type, "h-3.5 w-3.5")}
                        <span className="capitalize">{link.type}</span>
                      </div>
                      <button 
                        onClick={() => handleLinkClick(link)}
                        className="text-xs font-semibold bg-white border border-zinc-200 text-zinc-800 px-4 py-1.5 rounded-full hover:bg-zinc-50 transition-colors shadow-sm cursor-pointer"
                      >
                        {link.type === 'link' ? 'Open' : 'View'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Social Section */}
        {socialLinks.length > 0 && (
          <section className="pt-8 border-t border-zinc-200 pb-12">
            <h3 className="text-lg font-bold text-zinc-900 mb-6 text-left">Connect with me</h3>
            <div className="flex flex-wrap items-center justify-start gap-8">
              {socialLinks.map(([platform, rawHandle]) => {
                const handle = rawHandle as string;
                let href = "";
                let icon = null;
                const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
                
                switch (platform) {
                  case 'twitter':
                    href = `https://twitter.com/${handle}`;
                    icon = <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
                    break;
                  case 'github':
                    href = `https://github.com/${handle}`;
                    icon = <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>;
                    break;
                  case 'youtube':
                    href = `https://youtube.com/c/${handle}`;
                    icon = <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.507 9.388.507 9.388.507s7.517 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
                    break;
                  case 'instagram':
                    href = `https://instagram.com/${handle}`;
                    icon = <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
                    break;
                  case 'linkedin':
                    href = `https://linkedin.com/in/${handle}`;
                    icon = <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
                    break;
                  case 'website':
                    href = handle.startsWith('http') ? handle : `https://${handle}`;
                    icon = <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>;
                    break;
                  case 'facebook':
                    href = `https://facebook.com/${handle}`;
                    icon = <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
                    break;
                  case 'telegram':
                    href = `https://t.me/${handle}`;
                    icon = <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12zM5.278 11.51c4.545-1.979 7.574-3.284 9.088-3.914 4.316-1.796 5.213-2.109 5.795-2.12.128-.002.416.03.595.176.15.122.193.285.213.4.02.115.044.353.024.532-.236 2.012-1.258 8.472-1.782 11.458-.224 1.27-.923 1.464-1.597 1.503-1.46.084-2.571-.97-3.987-1.89-2.215-1.442-3.468-2.339-5.618-3.754-2.474-1.626-.87-2.52.548-3.988.371-.384 6.812-6.242 6.936-6.772.015-.067.03-.318-.112-.444-.141-.125-.333-.083-.478-.05-.205.047-3.468 2.19-9.803 6.471-.926.635-1.765.946-2.52.93-.834-.017-2.438-.47-3.633-.859-1.464-.477-2.628-.727-2.528-1.536.052-.405.617-.82 1.694-1.246z"/></svg>;
                    break;
                  default:
                    href = `https://${handle}`;
                    icon = <Link2 className="h-6 w-6" />;
                }
                
                if (platform === 'email') return null; // Email handled by Contact button
                
                return (
                  <a 
                    key={platform}
                    href={href} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex flex-col items-center gap-2 group cursor-pointer"
                  >
                    <div className="text-zinc-500 group-hover:text-zinc-900 transition-colors">
                      {icon}
                    </div>
                    <span className="text-[11px] font-medium text-zinc-500 group-hover:text-zinc-900 transition-colors">{platformName}</span>
                  </a>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Media Modal Viewer */}
      {activeMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 flex flex-col justify-between max-h-[90vh] shadow-2xl">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-2">
                  {getMediaIcon(activeMedia.type)}
                  <h3 className="text-sm font-bold text-zinc-900 truncate max-w-md">{activeMedia.title}</h3>
                </div>
                <button
                  onClick={() => setActiveMedia(null)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Viewer Pane */}
              <div className="rounded-xl overflow-hidden bg-zinc-50 border border-zinc-100 flex items-center justify-center min-h-[300px]">
                {activeMedia.type === "image" && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={activeMedia.media_url} 
                    alt={activeMedia.title} 
                    className="max-h-[500px] w-full object-contain" 
                  />
                )}

                {activeMedia.type === "video" && (
                  <video 
                    src={activeMedia.media_url} 
                    controls 
                    className="max-h-[500px] w-full"
                    autoPlay
                  />
                )}

                {activeMedia.type === "pdf" && (
                  <div className="p-8 text-center space-y-4">
                    <div className="bg-rose-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto">
                      <FileText className="h-10 w-10 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">PDF Document</p>
                      <p className="text-xs text-zinc-500 mt-1">Ready for download</p>
                    </div>
                  </div>
                )}

                {activeMedia.type === "document" && (
                  <div className="p-8 text-center space-y-4">
                    <div className="bg-blue-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto">
                      <File className="h-10 w-10 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">Document File</p>
                      <p className="text-xs text-zinc-500 mt-1">Ready for download</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <a
                href={activeMedia.media_url}
                target="_blank"
                rel="noreferrer"
                download
                className="flex-grow rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 flex items-center justify-center gap-2 transition-all cursor-pointer text-center shadow-sm"
              >
                <Download className="h-4.5 w-4.5" /> Download File
              </a>
              <button
                onClick={() => setActiveMedia(null)}
                className="rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 py-3 px-6 text-sm font-semibold text-zinc-700 transition-all cursor-pointer shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Follow Modal (Socials) */}
      {showSocialsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-base font-bold text-zinc-900">Follow @{profile.username}</h3>
              <button
                onClick={() => setShowSocialsModal(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {(() => {
                const socialPlatforms = [
                  { id: 'instagram', name: 'Instagram', getHref: (h: string) => `https://instagram.com/${h}`, icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg> },
                  { id: 'twitter', name: 'Twitter/X', getHref: (h: string) => `https://twitter.com/${h}`, icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                  { id: 'linkedin', name: 'LinkedIn', getHref: (h: string) => `https://linkedin.com/in/${h}`, icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
                  { id: 'facebook', name: 'Facebook', getHref: (h: string) => `https://facebook.com/${h}`, icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
                  { id: 'youtube', name: 'YouTube', getHref: (h: string) => `https://youtube.com/c/${h}`, icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.507 9.388.507 9.388.507s7.517 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
                  { id: 'github', name: 'GitHub', getHref: (h: string) => `https://github.com/${h}`, icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg> },
                  { id: 'website', name: 'Website', getHref: (h: string) => h.startsWith('http') ? h : `https://${h}`, icon: <Globe className="h-5 w-5" /> },
                ];

                const activeSocials = socialPlatforms.filter(p => !!profile.social_links?.[p.id]);

                if (activeSocials.length === 0) {
                  return (
                    <p className="text-sm text-zinc-400 text-center py-4">No social profiles configured yet.</p>
                  );
                }

                return activeSocials.map(platform => (
                  <a
                    key={platform.id}
                    href={platform.getHref(profile.social_links[platform.id])}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3.5 p-3 rounded-xl border border-zinc-150 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-300 text-zinc-850 font-bold transition-all text-sm shadow-sm cursor-pointer"
                  >
                    <div className="text-zinc-600 shrink-0">{platform.icon}</div>
                    <span>{platform.name}</span>
                  </a>
                ));
              })()}
            </div>

            <button
              onClick={() => setShowSocialsModal(false)}
              className="w-full rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold py-3 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Contact Modal (Contact Channels) */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-base font-bold text-zinc-900">Contact @{profile.username}</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {(() => {
                const contactPlatforms = [
                  { id: 'email', name: 'Email Address', getHref: (h: string) => `mailto:${h}`, icon: <Mail className="h-5 w-5" /> },
                  { id: 'phone', name: 'Phone Number', getHref: (h: string) => `tel:${h}`, icon: <Phone className="h-5 w-5" /> },
                  { id: 'whatsapp', name: 'WhatsApp', getHref: (h: string) => `https://wa.me/${h.replace(/[+\s-]/g, '')}`, icon: <MessageSquare className="h-5 w-5" /> },
                  { id: 'telegram', name: 'Telegram', getHref: (h: string) => `https://t.me/${h}`, icon: <Send className="h-5 w-5" /> },
                  { id: 'custom', name: 'Custom Contact Channel', getHref: (h: string) => h.startsWith('http') ? h : `https://${h}`, icon: <Link2 className="h-5 w-5" /> },
                ];

                const activeContacts = contactPlatforms.filter(p => !!profile.social_links?.[p.id]);

                if (activeContacts.length === 0) {
                  return (
                    <p className="text-sm text-zinc-400 text-center py-4">No contact channels configured yet.</p>
                  );
                }

                return activeContacts.map(platform => (
                  <a
                    key={platform.id}
                    href={platform.getHref(profile.social_links[platform.id])}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3.5 p-3 rounded-xl border border-zinc-150 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-300 text-zinc-850 font-bold transition-all text-sm shadow-sm cursor-pointer"
                  >
                    <div className="text-zinc-600 shrink-0">{platform.icon}</div>
                    <div className="min-w-0 flex-grow">
                      <p className="text-xs text-zinc-400 font-bold uppercase tracking-wide leading-none">{platform.name}</p>
                      <p className="truncate text-sm mt-1 text-zinc-800">{profile.social_links[platform.id]}</p>
                    </div>
                  </a>
                ));
              })()}
            </div>

            <button
              onClick={() => setShowContactModal(false)}
              className="w-full rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold py-3 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
