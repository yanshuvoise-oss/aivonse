"use client";

import { useEffect, useState } from "react";
import { 
  ImageIcon as Image, Plus, ArrowUp, ArrowDown, Trash2, ToggleLeft, ToggleRight, 
  Loader2, AlertCircle, Copy, Search, Filter
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ImagesManagerPage() {
  const [profile, setProfile] = useState<any>(null);
  const [subType, setSubType] = useState("free");
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter/Search States
  const [searchQuery, setSearchQuery] = useState("");

  // Add Item States
  const [newTitle, setNewTitle] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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
      const isExpired = subData.plan_type === "pro" && subData.current_period_end && new Date(subData.current_period_end) < new Date();
      setSubType(isExpired ? "free" : subData.plan_type);
    }

    // Fetch images
    const { data: linksData } = await supabase
      .from("links")
      .select("*")
      .eq("profile_id", session.user.id)
      .eq("type", "image")
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

    // Enforce Pro constraints on files: Free plan limits to 5 images
    if (subType !== "pro" && links.length >= 5) {
      setErrorMsg("You have reached the limit of 5 images for the Free Plan. Please upgrade to Pro for unlimited uploads.");
      return;
    }

    if (!uploadFile) {
      setErrorMsg("Please select an image file to upload.");
      return;
    }

    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    if (uploadFile.size > maxSizeBytes) {
      setErrorMsg("File too large. Maximum allowed size is 10MB.");
      return;
    }

    setActionLoading(true);

    try {
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
      
      const mediaUrl = urlData.publicUrl;

      // Create new link
      const newOrder = links.length > 0 ? Math.max(...links.map((l) => l.sort_order)) + 1 : 0;
      const insertPayload = {
        profile_id: profile.id,
        title: newTitle.trim(),
        url: "",
        type: "image",
        media_url: mediaUrl,
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
      setUploadFile(null);
      setSuccessMsg("Image successfully added!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to add image. Try again.");
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
    if (!confirm("Are you sure you want to delete this image? This action cannot be undone.")) return;
    try {
      setLinks(links.filter((l) => l.id !== linkId));
      await supabase.from("links").delete().eq("id", linkId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const actualIndex = links.findIndex(l => l.id === filteredLinks[index].id);
    if (direction === "up" && actualIndex === 0) return;
    if (direction === "down" && actualIndex === links.length - 1) return;

    const newIndex = direction === "up" ? actualIndex - 1 : actualIndex + 1;
    const items = [...links];

    const tempSort = items[actualIndex].sort_order;
    items[actualIndex].sort_order = items[newIndex].sort_order;
    items[newIndex].sort_order = tempSort;

    const tempItem = items[actualIndex];
    items[actualIndex] = items[newIndex];
    items[newIndex] = tempItem;

    setLinks(items);

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

  const filteredLinks = links.filter((link) => {
    return link.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-8 select-none max-w-6xl">
      {/* Header */}
      <div className="border-b border-zinc-200 pb-6 flex flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            Images
          </h1>
          <p className="text-sm text-zinc-500 mt-1 font-medium">Upload and manage images on your public profile page.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Add Image Form */}
        <div className="lg:col-span-4 rounded-[24px] border border-zinc-200 bg-white p-6 lg:p-8 shadow-sm sticky top-24">
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center">
              <Plus className="h-4 w-4 text-zinc-900" />
            </div>
            Upload Image
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

          {subType !== "pro" && links.length >= 5 ? (
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 text-center">
              <p className="text-sm text-zinc-600 font-medium mb-4">You have reached the limit of 5 images for the Free Plan.</p>
              <Link
                href="/pricing"
                className="inline-block bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-colors"
              >
                Upgrade to Pro
              </Link>
            </div>
          ) : (
            <form onSubmit={handleAddItem} className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Title</label>
                <input
                  type="text"
                  required
                  placeholder="My Creative Asset"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 px-4 text-sm text-zinc-900 font-medium placeholder-zinc-400 focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all"
                />
              </div>

              {/* Upload File */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Select Image File</label>
                <div className="relative rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 p-8 text-center hover:bg-zinc-100 hover:border-zinc-300 transition-all">
                  <input
                    type="file"
                    required
                    accept="image/png, image/jpeg, image/gif, image/webp"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-2">
                    <div className="h-10 w-10 mx-auto rounded-full bg-white flex items-center justify-center border border-zinc-200 shadow-sm">
                      <Image className="h-5 w-5 text-zinc-500" />
                    </div>
                    <p className="text-sm font-bold text-zinc-700">
                      {uploadFile ? uploadFile.name : "Drop image here"}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide">
                      Max: 10MB (PNG, JPG, GIF, WEBP)
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full rounded-xl bg-zinc-900 hover:bg-zinc-800 py-3.5 text-sm font-bold text-white flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer mt-4"
              >
                {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Plus className="h-5 w-5" /> Upload Image</>}
              </button>
            </form>
          )}
        </div>

        {/* Existing Images List */}
        <div className="lg:col-span-8 space-y-4">
          {/* Search Bar */}
          <div className="flex flex-row items-center justify-between gap-4 bg-white border border-zinc-200 p-2 rounded-2xl shadow-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search images..." 
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
              <p className="font-bold text-zinc-900 text-lg">No images found.</p>
              <p className="text-sm mt-1 text-zinc-500 font-medium">Try adjusting your search or uploading a new image.</p>
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
                      if (link.media_url) window.open(link.media_url, "_blank");
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
                        {link.media_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={link.media_url} alt={link.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <Image className="h-5 w-5 text-zinc-500" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="min-w-0 flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-zinc-900 truncate">{link.title}</h4>
                        </div>
                        <p className="text-xs text-zinc-500 font-medium truncate mt-0.5">
                          {link.media_url || "Uploaded Image"}
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
                          if (link.media_url) {
                            navigator.clipboard.writeText(link.media_url);
                            setSuccessMsg("Image URL copied!");
                            setTimeout(() => setSuccessMsg(""), 2000);
                          }
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 transition-all cursor-pointer"
                        title="Copy Image URL"
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
                        title="Delete Image"
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
