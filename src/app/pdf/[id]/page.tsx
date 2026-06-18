"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { FileText, Loader2, AlertCircle } from "lucide-react";

export default function PdfViewerPage() {
  const params = useParams();
  const id = params.id as string;

  const [link, setLink] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecord = async () => {
      if (!id) return;
      const { data: linkData } = await supabase
        .from("links")
        .select("*")
        .eq("id", id)
        .eq("type", "pdf")
        .single();
      
      if (linkData) {
        setLink(linkData);
        // Log view
        let device = "desktop";
        if (typeof window !== "undefined") {
          const ua = navigator.userAgent;
          if (/tablet|ipad|playbook|silk/i.test(ua)) device = "tablet";
          else if (/mobile|iphone|ipod|android|blackberry|iemobile/i.test(ua)) device = "mobile";
        }
        await supabase.from("analytics").insert({
          profile_id: linkData.profile_id,
          link_id: linkData.id,
          event_type: "pdf_view",
          device_type: device,
          referral_source: "direct"
        });

        // Fetch owner profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", linkData.profile_id)
          .single();
        if (profileData) setProfile(profileData);
      }
      setLoading(false);
    };

    fetchRecord();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (!link || !link.media_url) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-center select-none">
        <AlertCircle className="h-10 w-10 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-zinc-200">Document Not Found</h2>
        <p className="text-sm text-zinc-500 mt-2">The requested PDF is unavailable or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 select-none">
      <div className="flex items-center justify-between p-4 border-b border-zinc-900 bg-zinc-950">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20">
            <FileText className="h-5 w-5 text-rose-500" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-100 max-w-md truncate">{link.title}</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
              {profile ? `Shared by @${profile.username}` : "PDF Document"}
            </p>
          </div>
        </div>
        <a 
          href={link.media_url} 
          download 
          target="_blank" 
          rel="noopener noreferrer"
          className="rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 transition-colors"
        >
          Download PDF
        </a>
      </div>
      <div className="flex-1 bg-zinc-900/50 w-full">
        <iframe 
          src={link.media_url} 
          className="w-full h-full border-none"
          title={link.title}
        />
      </div>
    </div>
  );
}
