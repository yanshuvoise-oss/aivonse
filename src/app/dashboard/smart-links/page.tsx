"use client";

import { useEffect, useState } from "react";
import { Plus, Share2, Search, Loader2, Sparkles, AlertCircle, Copy, CheckCircle2, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SmartShareModal } from "@/components/SmartShareModal";

export default function SmartLinksPage() {
  const [loading, setLoading] = useState(true);
  const [smartLinks, setSmartLinks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [profile, setProfile] = useState<any>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (profileData) setProfile(profileData);

    const { data: rawLinksData } = await supabase
      .from("links")
      .select("*")
      .eq("type", "smart_link")
      .eq("profile_id", session.user.id)
      .order("created_at", { ascending: false });

    if (rawLinksData) {
      const mappedLinks = rawLinksData.map((link: any) => ({
        id: link.id,
        profile_id: link.profile_id,
        slug: link.url,
        name: link.title,
        config: link.media_url ? JSON.parse(link.media_url) : {},
        views: link.sort_order || 0,
        created_at: link.created_at
      }));
      setSmartLinks(mappedLinks);
    }
    setLoading(false);
  };

  const handleCopy = async (slug: string, id: string) => {
    const url = `${window.location.origin}/s/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this smart share link?")) return;
    
    await supabase.from("links").delete().eq("id", id);
    setSmartLinks(prev => prev.filter(l => l.id !== id));
  };

  const filteredLinks = smartLinks.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 select-none max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-2">
            Smart Share Links
          </h1>
          <p className="text-sm text-zinc-500 mt-1 font-medium">Create custom links sharing specific collections of your resources.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors shadow-sm cursor-pointer"
        >
          <Sparkles className="h-4 w-4" />
          Create New Link
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-zinc-400">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        </div>
      ) : (
        <div className="space-y-6">
          {smartLinks.length > 0 && (
            <div className="flex items-center justify-end">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="Search links..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-zinc-200 text-zinc-900 text-sm rounded-xl py-2 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
                />
              </div>
            </div>
          )}

          {smartLinks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-zinc-200 border-dashed rounded-[24px] text-center">
              <div className="bg-zinc-50 p-4 rounded-full mb-4 border border-zinc-100">
                <Share2 className="h-8 w-8 text-zinc-400" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">No smart links yet</h3>
              <p className="text-sm text-zinc-500 max-w-sm mb-6">Create your first smart share link to privately share a custom selection of your resources.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Create Link
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredLinks.map(link => (
                <div key={link.id} className="bg-white border border-zinc-200 rounded-[24px] p-5 flex flex-col shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 border border-violet-100">
                        <Share2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-zinc-900 truncate max-w-[150px]">{link.name}</h4>
                        <p className="text-[11px] font-mono text-zinc-500 mt-0.5 truncate">/s/{link.slug}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDelete(link.id)}
                      className="text-zinc-400 hover:text-rose-500 transition-colors p-1 opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-auto pt-4 border-t border-zinc-100 flex items-center justify-between">
                    <div className="text-xs font-semibold text-zinc-500">
                      {new Date(link.created_at).toLocaleDateString()}
                    </div>
                    
                    <button
                      onClick={() => handleCopy(link.slug, link.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        copiedId === link.id 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                          : 'bg-zinc-50 text-zinc-600 hover:text-zinc-900 border border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      {copiedId === link.id ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedId === link.id ? 'Copied' : 'Copy Link'}
                    </button>
                  </div>
                </div>
              ))}
              
              {filteredLinks.length === 0 && (
                <div className="col-span-full py-12 text-center text-sm text-zinc-500">
                  No links matching your search.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {profile && (
        <SmartShareModal 
          isOpen={isModalOpen} 
          onClose={() => {
            setIsModalOpen(false);
            loadData(); // refresh list
          }}
          profileId={profile.id}
          profileUsername={profile.username}
        />
      )}
    </div>
  );
}
