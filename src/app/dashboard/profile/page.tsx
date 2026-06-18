"use client";

import { useEffect, useState, useRef } from "react";
import { 
  User, Save, Loader2, Upload, Send, Globe, Mail, Plus, X, Link2 
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const TwitterIcon = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>;
const GithubIcon = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.8c0-1.2-.4-2.2-1-2.9 3-.3 6-1.5 6-6.5 0-1.4-.5-2.6-1.3-3.5.1-.3.6-1.6-.1-3.4 0 0-1-.3-3.3 1.2-.9-.3-1.9-.4-2.9-.4s-2 .1-2.9.4C5 2.5 4 2.8 4 2.8c-.7 1.8-.2 3.1-.1 3.4-.8.9-1.3 2.1-1.3 3.5 0 5 3 6.2 6 6.5-.6.6-1 1.6-1 3v3.8"/></svg>;
const InstagramIcon = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>;
const LinkedinIcon = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>;
const YoutubeIcon = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>;
const FacebookIcon = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3.81l.39-4h-4.2V7a1 1 0 0 1 1-1h3z"/></svg>;

const PhoneIcon = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const WhatsappIcon = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>;

const CONTACT_PLATFORMS = [
  { id: 'email', name: 'Email Address', icon: Mail },
  { id: 'phone', name: 'Phone Number', icon: PhoneIcon },
  { id: 'whatsapp', name: 'WhatsApp', icon: WhatsappIcon },
  { id: 'telegram', name: 'Telegram', icon: Send },
  { id: 'custom', name: 'Custom Contact Method', icon: Link2 },
];

const SOCIAL_PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: InstagramIcon },
  { id: 'twitter', name: 'X (Twitter)', icon: TwitterIcon },
  { id: 'linkedin', name: 'LinkedIn', icon: LinkedinIcon },
  { id: 'facebook', name: 'Facebook', icon: FacebookIcon },
  { id: 'youtube', name: 'YouTube', icon: YoutubeIcon },
  { id: 'github', name: 'GitHub', icon: GithubIcon },
  { id: 'website', name: 'Website', icon: Globe },
];

const PLATFORMS = [...CONTACT_PLATFORMS, ...SOCIAL_PLATFORMS];

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    bio: "",
    avatar_url: "",
    social_links: {} as Record<string, string>
  });

  const [activeSocials, setActiveSocials] = useState<string[]>([]);
  const [showSocialPlatformSelect, setShowSocialPlatformSelect] = useState(false);
  const [showContactPlatformSelect, setShowContactPlatformSelect] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        const links = profile.social_links || {};
        
        // Find which links actually have values
        const active = Object.entries(links)
          .filter(([_, val]) => val)
          .map(([key]) => key);
          
        setFormData({
          full_name: profile.full_name || "",
          username: profile.username || "",
          bio: profile.bio || "",
          avatar_url: profile.avatar_url || "",
          social_links: links
        });
        setActiveSocials(active);
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSocialChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      social_links: { ...prev.social_links, [platform]: value }
    }));
  };

  const addPlatform = (platformId: string) => {
    if (!activeSocials.includes(platformId)) {
      setActiveSocials([...activeSocials, platformId]);
      setFormData(prev => ({
        ...prev,
        social_links: { ...prev.social_links, [platformId]: "" }
      }));
    }
    setShowSocialPlatformSelect(false);
    setShowContactPlatformSelect(false);
  };

  const removePlatform = (platformId: string) => {
    setActiveSocials(activeSocials.filter(id => id !== platformId));
    setFormData(prev => ({
      ...prev,
      social_links: { ...prev.social_links, [platformId]: "" }
    }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Profile photo must be under 5MB");
      return;
    }

    setUploadingAvatar(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("media")
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, avatar_url: urlData.publicUrl }));
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to upload photo");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          username: formData.username,
          bio: formData.bio,
          avatar_url: formData.avatar_url,
          social_links: formData.social_links
        })
        .eq("id", session.user.id);

      if (error) throw error;
      
      // Simulate slight loading for better UX feedback as requested
      await new Promise(resolve => setTimeout(resolve, 800));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
    } catch (err) {
      console.error(err);
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl animate-pulse">
        <div className="h-10 w-48 rounded bg-zinc-200" />
        <div className="h-[400px] rounded-[24px] bg-zinc-100" />
      </div>
    );
  }

  const availableSocialPlatforms = SOCIAL_PLATFORMS.filter(p => !activeSocials.includes(p.id));
  const availableContactPlatforms = CONTACT_PLATFORMS.filter(p => !activeSocials.includes(p.id));

  const activeSocialPlatformsList = activeSocials.filter(id => SOCIAL_PLATFORMS.some(p => p.id === id));
  const activeContactPlatformsList = activeSocials.filter(id => CONTACT_PLATFORMS.some(p => p.id === id));

  return (
    <div className="space-y-8 select-none max-w-3xl">
      <div className="border-b border-zinc-200 pb-6">
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-2">
          Public Profile
        </h1>
        <p className="text-sm text-zinc-500 mt-1 font-medium">Manage your public information and social links.</p>
      </div>

      <div className="rounded-[24px] border border-zinc-200 bg-white shadow-sm">
        <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-8">
          
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 shrink-0 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden relative group flex items-center justify-center">
              {formData.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={formData.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-zinc-400" />
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Profile Photo</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-sm font-semibold rounded-lg transition-colors border border-zinc-200 cursor-pointer"
                >
                  <Upload className="h-4 w-4" /> Upload Image
                </button>
                {formData.avatar_url && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, avatar_url: "" }))}
                    className="px-4 py-2 text-zinc-500 hover:text-rose-600 text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/png, image/jpeg, image/gif"
                className="hidden"
              />
              <p className="text-[11px] text-zinc-500 font-medium mt-2">Recommended: 400x400px. Max 5MB (JPG, PNG).</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Display Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 px-4 text-sm text-zinc-900 font-medium placeholder-zinc-400 focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Username</label>
            <div className="flex items-center rounded-xl border border-zinc-200 bg-zinc-50 focus-within:border-zinc-400 focus-within:ring-1 focus-within:ring-zinc-400 transition-all overflow-hidden">
              <span className="pl-4 pr-1 py-3 text-sm text-zinc-500 bg-zinc-100 border-r border-zinc-200">aivones.com/</span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="johndoe"
                className="w-full bg-transparent py-3 px-3 text-sm text-zinc-900 font-medium placeholder-zinc-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us a little bit about yourself"
              rows={3}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 px-4 text-sm text-zinc-900 font-medium placeholder-zinc-400 focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all resize-none"
            />
          </div>

          <div className="pt-6 border-t border-zinc-100">
            <h3 className="text-base font-bold text-zinc-900 mb-1">Social Links</h3>
            <p className="text-sm text-zinc-500 mb-6">Link your external social profiles for your followers.</p>

            <div className="space-y-3 mb-4">
              {activeSocialPlatformsList.map(platformId => {
                const platform = PLATFORMS.find(p => p.id === platformId);
                if (!platform) return null;
                const Icon = platform.icon;
                
                return (
                  <div key={platformId} className="flex items-center gap-3">
                    <div className="flex-1 flex items-center rounded-xl border border-zinc-200 bg-white focus-within:border-zinc-400 focus-within:ring-1 focus-within:ring-zinc-400 transition-all overflow-hidden shadow-sm">
                      <div className="flex items-center justify-center w-12 border-r border-zinc-200 bg-zinc-50 text-zinc-600">
                        <Icon className="h-5 w-5" />
                      </div>
                      <input
                        type="text"
                        value={formData.social_links[platformId] || ""}
                        onChange={(e) => handleSocialChange(platformId, e.target.value)}
                        placeholder={platformId === 'website' ? 'https://example.com' : `${platform.name} Username/Link`}
                        className="flex-1 bg-transparent py-3 px-3 text-sm text-zinc-900 font-medium placeholder-zinc-400 focus:outline-none"
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removePlatform(platformId)}
                      className="p-2.5 text-zinc-400 hover:text-rose-500 bg-zinc-50 hover:bg-rose-50 border border-zinc-200 hover:border-rose-200 rounded-xl transition-all cursor-pointer"
                      title="Remove Link"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {availableSocialPlatforms.length > 0 && (
              <div className="relative mt-2">
                {!showSocialPlatformSelect ? (
                  <button
                    type="button"
                    onClick={() => setShowSocialPlatformSelect(true)}
                    className="flex items-center gap-2 text-sm font-bold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-4 py-2.5 rounded-xl transition-colors cursor-pointer border border-violet-200 border-dashed"
                  >
                    <Plus className="h-4 w-4" /> Add Social Link
                  </button>
                ) : (
                  <div className="bg-white border border-zinc-200 rounded-xl shadow-lg p-2 mt-2 max-w-sm absolute z-10 w-full grid grid-cols-2 gap-1 max-h-[250px] overflow-y-auto">
                    {availableSocialPlatforms.map(platform => (
                      <button
                        key={platform.id}
                        type="button"
                        onClick={() => addPlatform(platform.id)}
                        className="flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-50 rounded-lg text-sm text-zinc-700 font-medium transition-colors text-left cursor-pointer"
                      >
                        <platform.icon className="h-4 w-4 text-zinc-500" />
                        {platform.name}
                      </button>
                    ))}
                    <div className="col-span-2 pt-1 border-t border-zinc-100 mt-1">
                      <button
                        type="button"
                        onClick={() => setShowSocialPlatformSelect(false)}
                        className="w-full text-center py-2 text-xs text-zinc-500 font-medium hover:text-zinc-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-zinc-100">
            <h3 className="text-base font-bold text-zinc-900 mb-1">Contact Information</h3>
            <p className="text-sm text-zinc-500 mb-6">Add ways for people to reach out to you directly.</p>

            <div className="space-y-3 mb-4">
              {activeContactPlatformsList.map(platformId => {
                const platform = PLATFORMS.find(p => p.id === platformId);
                if (!platform) return null;
                const Icon = platform.icon;
                
                return (
                  <div key={platformId} className="flex items-center gap-3">
                    <div className="flex-1 flex items-center rounded-xl border border-zinc-200 bg-white focus-within:border-zinc-400 focus-within:ring-1 focus-within:ring-zinc-400 transition-all overflow-hidden shadow-sm">
                      <div className="flex items-center justify-center w-12 border-r border-zinc-200 bg-zinc-50 text-zinc-600">
                        <Icon className="h-5 w-5" />
                      </div>
                      <input
                        type="text"
                        value={formData.social_links[platformId] || ""}
                        onChange={(e) => handleSocialChange(platformId, e.target.value)}
                        placeholder={platformId === 'email' ? 'hello@example.com' : platformId === 'phone' || platformId === 'whatsapp' ? '+1234567890' : `${platform.name} Details`}
                        className="flex-1 bg-transparent py-3 px-3 text-sm text-zinc-900 font-medium placeholder-zinc-400 focus:outline-none"
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removePlatform(platformId)}
                      className="p-2.5 text-zinc-400 hover:text-rose-500 bg-zinc-50 hover:bg-rose-50 border border-zinc-200 hover:border-rose-200 rounded-xl transition-all cursor-pointer"
                      title="Remove Link"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {availableContactPlatforms.length > 0 && (
              <div className="relative mt-2">
                {!showContactPlatformSelect ? (
                  <button
                    type="button"
                    onClick={() => setShowContactPlatformSelect(true)}
                    className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition-colors cursor-pointer border border-blue-200 border-dashed"
                  >
                    <Plus className="h-4 w-4" /> Add Contact Method
                  </button>
                ) : (
                  <div className="bg-white border border-zinc-200 rounded-xl shadow-lg p-2 mt-2 max-w-sm absolute z-10 w-full grid grid-cols-2 gap-1 max-h-[250px] overflow-y-auto">
                    {availableContactPlatforms.map(platform => (
                      <button
                        key={platform.id}
                        type="button"
                        onClick={() => addPlatform(platform.id)}
                        className="flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-50 rounded-lg text-sm text-zinc-700 font-medium transition-colors text-left cursor-pointer"
                      >
                        <platform.icon className="h-4 w-4 text-zinc-500" />
                        {platform.name}
                      </button>
                    ))}
                    <div className="col-span-2 pt-1 border-t border-zinc-100 mt-1">
                      <button
                        type="button"
                        onClick={() => setShowContactPlatformSelect(false)}
                        className="w-full text-center py-2 text-xs text-zinc-500 font-medium hover:text-zinc-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-6 mt-6 border-t border-zinc-200 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-zinc-900 hover:bg-zinc-800 px-8 py-3.5 text-sm font-bold text-white flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-4 w-4" /> Save Profile</>}
            </button>
          </div>
        </form>
      </div>

      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 font-medium text-sm transition-all duration-300 transform translate-y-0 opacity-100">
          <svg className="h-5 w-5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          Successfully Updated
        </div>
      )}
    </div>
  );
}
