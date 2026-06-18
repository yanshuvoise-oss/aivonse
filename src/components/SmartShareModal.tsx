"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Share2, Copy, Check, Link2, FileText, Image as ImageIcon, File, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface LinkItem {
  id: string;
  title: string;
  type: string;
  url?: string;
  media_url?: string;
}

interface SmartShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  profileUsername: string;
}

export function SmartShareModal({ isOpen, onClose, profileId, profileUsername }: SmartShareModalProps) {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [linkName, setLinkName] = useState("");
  const [generatedSlug, setGeneratedSlug] = useState("");
  const [copied, setCopied] = useState(false);

  // Category toggles
  const [categories, setCategories] = useState({
    link: true,
    pdf: true,
    image: true,
    document: true
  });

  // Selected item IDs
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const loadLinks = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("links")
      .select("*")
      .eq("profile_id", profileId)
      .eq("is_enabled", true)
      .order("sort_order", { ascending: true });
      
    if (data) {
      setLinks(data);
      // Auto-select all items
      setSelectedItems(new Set(data.map((l: LinkItem) => l.id)));
    }
    setLoading(false);
  }, [profileId]);

  useEffect(() => {
    if (isOpen && profileId) {
      loadLinks();
      // Reset state on reopen
      setLinkName("");
      setGeneratedSlug("");
      setCopied(false);
      setErrorMsg("");
    }
  }, [isOpen, profileId, loadLinks]);



  const handleToggleCategory = (category: string) => {
    setCategories((prev) => ({
      ...prev,
      [category]: !prev[category as keyof typeof prev]
    }));
  };

  const handleToggleSelectItem = (id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const [errorMsg, setErrorMsg] = useState("");

  const handleGenerate = async () => {
    if (!linkName.trim()) return;
    setGenerating(true);
    setErrorMsg("");

    try {
      const slug = linkName.toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .trim()
        + "-" + Math.random().toString(36).substring(2, 6);

      const { error } = await supabase
        .from("links")
        .insert({
          profile_id: profileId,
          url: slug,
          title: linkName,
          type: "smart_link",
          media_url: JSON.stringify({
            categories,
            selectedItemIds: Array.from(selectedItems)
          })
        });

      if (error) {
        // Supabase errors are plain objects {message, code, details, hint}
        // — they log as {} via console.error, so stringify them
        const msg = error.message || error.details || JSON.stringify(error);
        console.error("Error generating smart link:", msg, error);
        setErrorMsg(msg || "Failed to create smart link. Please try again.");
        return;
      }

      setGeneratedSlug(slug);
    } catch (err: any) {
      const msg = err?.message || (typeof err === 'string' ? err : JSON.stringify(err));
      console.error("Error generating smart link (exception):", msg);
      setErrorMsg(msg || "Failed to create smart link. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/s/${generatedSlug}` : '';
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  if (!isOpen) return null;

  const groupedLinks = {
    link: links.filter(l => l.type === 'link'),
    pdf: links.filter(l => l.type === 'pdf'),
    image: links.filter(l => l.type === 'image'),
    document: links.filter(l => l.type === 'document'),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-900 bg-zinc-950 flex flex-col justify-between max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-violet-400" />
            <h3 className="text-lg font-bold text-white">Generate Smart Share Link</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
          {errorMsg && (
            <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-400 font-medium">
              <span>{errorMsg}</span>
            </div>
          )}

          {generatedSlug ? (
            <div className="space-y-4 py-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-600/10 text-violet-400">
                <Check className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Smart Link Generated!</h4>
                <p className="text-xs text-zinc-400">Your custom link is ready to share.</p>
              </div>
              
              <div className="flex gap-2 items-center bg-zinc-900 border border-zinc-800 rounded-xl p-3 mt-4">
                <input
                  type="text"
                  readOnly
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/s/${generatedSlug}`}
                  className="bg-transparent border-none text-xs text-zinc-200 outline-none flex-grow min-w-0"
                />
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Link Name Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Smart Link Name</label>
                <input
                  type="text"
                  placeholder="e.g. My Presentation Pack, Design Portfolio"
                  value={linkName}
                  onChange={(e) => setLinkName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 px-4 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 transition-all"
                />
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">Include Categories</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(categories).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleToggleCategory(cat)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        categories[cat as keyof typeof categories]
                          ? "bg-violet-600/10 border-violet-500/30 text-violet-400 hover:bg-violet-600/20"
                          : "bg-zinc-900/30 border-zinc-850 text-zinc-500 hover:bg-zinc-900/50"
                      }`}
                    >
                      <span className="capitalize">{cat}s</span>
                      <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${categories[cat as keyof typeof categories] ? 'border-violet-500 bg-violet-500' : 'border-zinc-700 bg-zinc-950'}`}>
                        {categories[cat as keyof typeof categories] && <Check className="h-2.5 w-2.5 text-zinc-950 stroke-[3]" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Links Selector */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Select Items to Include</label>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                  </div>
                ) : links.length === 0 ? (
                  <p className="text-zinc-500 text-xs py-4 text-center">No links found on your profile.</p>
                ) : (
                  <div className="space-y-4 max-h-[200px] overflow-y-auto pr-1">
                    {Object.entries(groupedLinks).map(([category, categoryLinks]: [string, any]) => {
                      if (categoryLinks.length === 0) return null;
                      return (
                        <div key={category} className="space-y-2">
                          <h4 className="text-xs font-bold text-zinc-400 capitalize">{category}s</h4>
                          {categories[category as keyof typeof categories] && (
                            <div className="space-y-1">
                              {categoryLinks.map((link: any) => (
                                <div
                                  key={link.id}
                                  onClick={() => handleToggleSelectItem(link.id)}
                                  className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-750 transition-all cursor-pointer group"
                                >
                                  <div className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${selectedItems.has(link.id) ? 'bg-violet-600 border-violet-600' : 'border-zinc-700 bg-zinc-900 group-hover:border-zinc-500'}`}>
                                    {selectedItems.has(link.id) && <Check className="h-3 w-3 text-white" />}
                                  </div>
                                  <span className={`text-xs truncate max-w-md ${selectedItems.has(link.id) ? 'text-zinc-300' : 'text-zinc-600'}`}>
                                    {link.title || link.url || link.media_url || 'Untitled'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!generatedSlug && (
          <div className="border-t border-zinc-900 p-4 bg-zinc-950/80 flex justify-end gap-3">
            <button onClick={onClose} className="px-5 py-2 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button 
              onClick={handleGenerate}
              disabled={generating || loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {generating && <Loader2 className="h-4 w-4 animate-spin" />}
              Generate Link
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
