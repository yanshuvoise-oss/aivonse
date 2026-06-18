import sys

content = """\"use client\";

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
  const [activeTab, setActiveTab] = useState("all"); // all, links, media

  // Add Item States
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newType, setNewType] = useState("link"); // link, pdf, image, video, document
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    loadLinksData();
  }, []);

  const loadLinksData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

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
      .order("sort_order", { ascending: true });
    
    if (linksData) {
      setLinks(linksData);
    }
    setLoading(false);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!newTitle.trim()) return;

    setErrorMsg("");
    setSuccessMsg("");

    // Enforce Pro constraints on files
    if (newType !== "link" && subType !== "pro") {
      setErrorMsg("File uploads are only available to Pro members. Please upgrade to continue.");
      return;
    }

    setActionLoading(true);

    try {
      let mediaUrl = "";

      // Handle file upload
      if (newType !== "link") {
        if (!uploadFile) {
          setErrorMsg(`Please select a file to upload for type: ${newType.toUpperCase()}`);
          setActionLoading(false);
          return;
        }

        let maxSizeBytes = 0;
        let maxSizeLabel = "";

        switch (newType) {
          case "image":
            maxSizeBytes = 10 * 1024 * 1024; // 10MB
            maxSizeLabel = "10MB";
            break;
          case "pdf":
          case "document":
            maxSizeBytes = 25 * 1024 * 1024; // 25MB
            maxSizeLabel = "25MB";
            break;
          default:
            maxSizeBytes = 10 * 1024 * 1024;
            maxSizeLabel = "10MB";
        }

        if (uploadFile.size > maxSizeBytes) {
          setErrorMsg(`File too large for ${newType}. Maximum allowed size is ${maxSizeLabel}.`);
          setActionLoading(false);
          return;
        }

        const fileName = `${profile.id}/${Date.now()}_${uploadFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("media")
          .upload(fileName, uploadFile);

        if (uploadError) {
          throw new Error("File upload failed");
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("media")
          .getPublicUrl(fileName);
        
        mediaUrl = urlData.publicUrl;
      }

      // Create new link
      const newOrder = links.length > 0 ? Math.max(...links.map((l) => l.sort_order)) + 1 : 0;
      const insertPayload = {
        profile_id: profile.id,
        title: newTitle.trim(),
        url: newType === "link" ? (newUrl.startsWith("http") ? newUrl : `https://${newUrl}`) : "",
        type: newType,
        media_url: mediaUrl || null,
        is_enabled: true,
        sort_order: newOrder
      };

      const { data: insertedData, error } = await supabase.from("links").insert(insertPayload).select();

      if (error) {
        throw error;
      }

      // Sync local list
      if (insertedData) {
        setLinks([...links, ...(Array.isArray(insertedData) ? insertedData : [insertedData])]);
      }

      setNewTitle("");
      setNewUrl("");
      setUploadFile(null);
      setSuccessMsg(`${newType.charAt(0).toUpperCase() + newType.slice(1)} successfully added!`);
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
    const matchesSearch = link.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || 
                      (activeTab === "links" && link.type === "link") || 
                      (activeTab === "media" && link.type !== "link");
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-8 select-none max-w-6xl">
      {/* Header */}
      <div className="border-b border-zinc-200 pb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            Links & Media
          </h1>
          <p className="text-sm text-zinc-500 mt-1 font-medium">Configure and sort items on your public profile page.</p>
        </div>

        {subType !== "pro" && (
          <Link
            href="/pricing"
            className="flex items-center gap-2 rounded-xl bg-violet-50 border border-violet-100 px-4 py-2 text-xs font-bold text-violet-600 hover:bg-violet-100 transition-colors shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5" /> Unlock File Hosting
          </Link>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Add Link Form (Col span 4) */}
        <div className="lg:col-span-4 rounded-[24px] border border-zinc-200 bg-white p-6 lg:p-8 shadow-sm sticky top-24">
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center">
              <Plus className="h-4 w-4 text-zinc-900" />
            </div>
            Create New Item
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
            {/* Type selector */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Item Type</label>
              <select
                value={newType}
                onChange={(e) => {
                  setNewType(e.target.value);
                  setErrorMsg("");
                }}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 px-4 text-sm text-zinc-900 font-medium focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all"
              >
                <option value="link">Web Link Redirect</option>
                <option value="pdf">PDF Upload (Pro)</option>
                <option value="image">Image Upload (Pro)</option>
                <option value="document">Custom Document (Pro)</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Title</label>
              <input
                type="text"
                required
                placeholder="My Awesome Project"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 px-4 text-sm text-zinc-900 font-medium placeholder-zinc-400 focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all"
              />
            </div>

            {/* Conditionally render URL or file upload */}
            {newType === "link" ? (
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
            ) : (
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Select Upload File</label>
                <div className="relative rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 p-8 text-center hover:bg-zinc-100 hover:border-zinc-300 transition-all">
                  <input
                    type="file"
                    required
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-2">
                    <div className="h-10 w-10 mx-auto rounded-full bg-white flex items-center justify-center border border-zinc-200 shadow-sm">
                      <FileText className="h-5 w-5 text-zinc-500" />
                    </div>
                    <p className="text-sm font-bold text-zinc-700">
                      {uploadFile ? uploadFile.name : "Drop file to upload"}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide">
                      Max: 25MB (PDF, PNG, JPG)
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full rounded-xl bg-zinc-900 hover:bg-zinc-800 py-3.5 text-sm font-bold text-white flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer mt-4"
            >
              {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Plus className="h-5 w-5" /> Add to Profile</>}
            </button>
          </form>
        </div>

        {/* Existing Links List (Col span 8) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-zinc-200 p-2 rounded-2xl shadow-sm">
            <div className="flex bg-zinc-100 rounded-xl p-1 border border-zinc-200 w-full sm:w-auto">
              {['all', 'links', 'media'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                    activeTab === tab ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200' : 'text-zinc-500 hover:text-zinc-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search items..." 
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
              <p className="font-bold text-zinc-900 text-lg">No items found.</p>
              <p className="text-sm mt-1 text-zinc-500 font-medium">Try adjusting your filters or adding a new item.</p>
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
                      const base = window.location.origin;
                      const url = link.type === "link"
                        ? (link.url.startsWith("http") ? link.url : `https://${link.url}`)
                        : `${base}/${link.type}/${link.id}`;
                      if (url) window.open(url, "_blank");
                    }}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Move buttons */}
                      {searchQuery === "" && activeTab === "all" && (
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
                        {link.type === "image" && link.media_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={link.media_url} alt={link.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          getTypeIcon(link.type)
                        )}
                      </div>

                      {/* Details */}
                      <div className="min-w-0 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-zinc-900 truncate">{link.title}</h4>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getBadgeStyle(link.type)}`}>
                            {link.type}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 font-medium truncate mt-0.5">
                          {link.type === "link" ? link.url : (link.media_url || "Media File")}
                        </p>
                        <p className="text-[10px] text-zinc-400 font-semibold mt-1">
                          Added {formattedDate}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const baseUrl = window.location.origin;
                          const url = link.type === "link" ? link.url : `${baseUrl}/${link.type}/${link.id}`;
                          navigator.clipboard.writeText(url);
                          setSuccessMsg(`Link for ${link.title} copied!`);
                          setTimeout(() => setSuccessMsg(""), 2000);
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 transition-all cursor-pointer"
                        title="Copy Share Link"
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
"""

with open('/Users/voise/Desktop/aivones/src/app/dashboard/links/page.tsx', 'w') as f:
    f.write(content)
