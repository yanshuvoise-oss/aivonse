"use client";

import { useEffect, useState } from "react";
import { 
  Link2, FileText, ImageIcon as Image, Video, File, Plus, ArrowUp, ArrowDown, 
  Trash2, ToggleLeft, ToggleRight, Sparkles, Loader2, Link as LinkIcon, AlertCircle, Copy, Search, Filter
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function LinksManagerPage() {
  const [profile, setProfile] = useState<any>(null);
  const [subType, setSubType] = useState("free");
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter/Search States
  const [searchQuery, setSearchQuery] = useState("");

  // Add Item States
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const newType = "link";

  useEffect(() => {
    loadLinksData();
  }, []);

  const loadLinksData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    // Fetch profile
    const { data: p } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();
    setProfile(p);

    // Fetch subscription
    const { data: subData } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("profile_id", session.user.id)
      .single();
    if (subData) {
      setSubType(subData.plan_type);
    }

    // Fetch links
    const { data: linksData } = await supabase
      .from("links")
      .select("*")
      .eq("profile_id", session.user.id)
      .eq("type", "link")
      .order("sort_order", { ascending: true });
    
    if (linksData) {
      setLinks(linksData);
    }
    setLoading(false);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!newTitle.trim() || !newUrl.trim()) return;

    setErrorMsg("");
    setSuccessMsg("");
    setActionLoading(true);

    try {
      const newOrder = links.length > 0 ? Math.max(...links.map((l) => l.sort_order)) + 1 : 0;
      const insertPayload = {
        profile_id: profile.id,
        title: newTitle.trim(),
        url: newUrl.startsWith("http") ? newUrl.trim() : `https://${newUrl.trim()}`,
        type: "link",
        media_url: null,
        is_enabled: true,
        sort_order: newOrder
      };

      const { data: insertedData, error } = await supabase.from("links").insert(insertPayload).select();

      if (error) {
        const msg = error.message || error.details || JSON.stringify(error);
        throw new Error(msg);
      }

      if (insertedData) {
        setLinks([...links, ...(Array.isArray(insertedData) ? insertedData : [insertedData])]);
      }

      setNewTitle("");
      setNewUrl("");
      setSuccessMsg("Link successfully added!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to add link. Try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (linkId: string, currentStatus: boolean) => {
    try {
      setLinks(
        links.map((l) => (l.id === linkId ? { ...l, is_enabled: !currentStatus } : l))
      );

      await supabase
        .from("links")
        .update({ is_enabled: !currentStatus })
        .eq("id", linkId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (linkId: string) => {
    if (!confirm("Are you sure you want to delete this item? This action cannot be undone.")) return;
    try {
      setLinks(links.filter((l) => l.id !== linkId));
      await supabase.from("links").delete().eq("id", linkId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    // Note: sorting now happens on filtered items, so we need to find actual indices in the full array.
    const actualIndex = links.findIndex(l => l.id === filteredLinks[index].id);
    if (direction === "up" && actualIndex === 0) return;
    if (direction === "down" && actualIndex === links.length - 1) return;

    const newIndex = direction === "up" ? actualIndex - 1 : actualIndex + 1;
    const items = [...links];

    // Swap sort order locally
    const tempSort = items[actualIndex].sort_order;
    items[actualIndex].sort_order = items[newIndex].sort_order;
    items[newIndex].sort_order = tempSort;

    // Swap elements in array
    const tempItem = items[actualIndex];
    items[actualIndex] = items[newIndex];
    items[newIndex] = tempItem;

    setLinks(items);

    // Save changes to database
    try {
      await supabase.from("links").update({ sort_order: items[actualIndex].sort_order }).eq("id", items[actualIndex].id);
      await supabase.from("links").update({ sort_order: items[newIndex].sort_order }).eq("id", items[newIndex].id);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl animate-pulse">
        <div className="h-10 w-48 rounded bg-zinc-200" />
        <div className="h-64 rounded-xl bg-zinc-100" />
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "pdf": return <FileText className="h-5 w-5 text-red-500" />;
      case "image": return <Image className="h-5 w-5 text-blue-500" />;
      case "video": return <Video className="h-5 w-5 text-purple-500" />;
      case "document": return <File className="h-5 w-5 text-blue-600" />;
      default: return <LinkIcon className="h-5 w-5 text-zinc-600" />;
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case "pdf": return "bg-red-50 text-red-600 border-red-100";
      case "image": return "bg-blue-50 text-blue-600 border-blue-100";
      case "video": return "bg-purple-50 text-purple-600 border-purple-100";
      case "document": return "bg-blue-50 text-blue-600 border-blue-100";
      default: return "bg-zinc-100 text-zinc-600 border-zinc-200";
    }
  };

  const filteredLinks = links.filter((link) => {
    return link.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-8 select-none max-w-6xl">
      {/* Header */}
      <div className="border-b border-zinc-200 pb-6 flex flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            Links
          </h1>
          <p className="text-sm text-zinc-500 mt-1 font-medium">Configure and sort link redirects on your public profile page.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Add Link Form (Col span 4) */}
        <div className="lg:col-span-4 rounded-[24px] border border-zinc-200 bg-white p-6 lg:p-8 shadow-sm sticky top-24">
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center">
              <Plus className="h-4 w-4 text-zinc-900" />
            </div>
            Create New Link
          </h2>

          {errorMsg && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-600 mb-4 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-600 mb-4 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleAddItem} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Title</label>
              <input
                type="text"
                required
                placeholder="My Awesome Website"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 px-4 text-sm text-zinc-900 font-medium placeholder-zinc-400 focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all"
              />
            </div>

            {/* Destination URL */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Destination URL</label>
              <input
                type="text"
                required
                placeholder="https://mywebsite.com"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 px-4 text-sm text-zinc-900 font-medium placeholder-zinc-400 focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full rounded-xl bg-zinc-900 hover:bg-zinc-800 py-3.5 text-sm font-bold text-white flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer mt-4"
            >
              {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Plus className="h-5 w-5" /> Add Link</>}
            </button>
          </form>
        </div>

        {/* Existing Links List (Col span 8) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Search Bar */}
          <div className="flex flex-row items-center justify-between gap-4 bg-white border border-zinc-200 p-2 rounded-2xl shadow-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search links..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
              />
            </div>
          </div>

          {filteredLinks.length === 0 ? (
            <div className="rounded-[24px] border border-zinc-200 bg-white p-16 text-center text-zinc-500 flex flex-col items-center shadow-sm">
              <div className="h-16 w-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4 border border-zinc-100">
                <Filter className="h-6 w-6 text-zinc-400" />
              </div>
              <p className="font-bold text-zinc-900 text-lg">No links found.</p>
              <p className="text-sm mt-1 text-zinc-500 font-medium">Try adjusting your search or adding a new link.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLinks.map((link, idx) => {
                const date = new Date(link.created_at);
                const formattedDate = `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}, ${date.getFullYear()}`;
                
                return (
                  <div 
                    key={link.id}
                    className={`group flex items-center justify-between rounded-2xl border bg-white hover:border-zinc-300 p-4 lg:p-5 transition-all duration-300 cursor-pointer shadow-sm ${
                      link.is_enabled ? "border-zinc-200" : "border-zinc-100 opacity-60"
                    }`}
                    onClick={() => {
                      const url = link.url.startsWith("http") ? link.url : `https://${link.url}`;
                      if (url) window.open(url, "_blank");
                    }}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Move buttons */}
                      {searchQuery === "" && (
                        <div className="flex flex-col gap-1.5 px-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleMoveOrder(idx, "up"); }}
                            disabled={idx === 0}
                            className="text-zinc-300 hover:text-zinc-600 disabled:opacity-0 cursor-pointer transition-colors"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleMoveOrder(idx, "down"); }}
                            disabled={idx === filteredLinks.length - 1}
                            className="text-zinc-300 hover:text-zinc-600 disabled:opacity-0 cursor-pointer transition-colors"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                        </div>
                      )}

                      {/* Icon or Thumbnail */}
                      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-zinc-50 border border-zinc-100 overflow-hidden shadow-inner">
                        {getTypeIcon(link.type)}
                      </div>

                      {/* Details */}
                      <div className="min-w-0 flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-zinc-900 truncate">{link.title}</h4>
                        </div>
                        <p className="text-xs text-zinc-500 font-medium truncate mt-0.5">
                          {link.url}
                        </p>
                        <p className="text-[10px] text-zinc-400 font-semibold mt-1">
                          Added {formattedDate}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1.5 sm:gap-2 w-auto" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(link.url);
                          setSuccessMsg(`Link for ${link.title} copied!`);
                          setTimeout(() => setSuccessMsg(""), 2000);
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 transition-all cursor-pointer"
                        title="Copy Link URL"
                      >
                        <Copy className="h-4 w-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(link.id, link.is_enabled);
                        }}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all cursor-pointer ${link.is_enabled ? 'bg-zinc-900 border-zinc-900 text-white hover:bg-zinc-800' : 'bg-zinc-50 border-zinc-200 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600'}`}
                        title={link.is_enabled ? "Disable Link" : "Enable Link"}
                      >
                        {link.is_enabled ? (
                          <ToggleRight className="h-5 w-5" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(link.id);
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all cursor-pointer ml-2"
                        title="Delete Link"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
