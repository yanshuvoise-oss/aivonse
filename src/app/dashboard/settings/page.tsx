"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, LogOut, Trash2, Shield, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    is_public: true,
  });
  const [subType, setSubType] = useState("free");

  // Modal states
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchSettingsData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_public")
        .eq("id", session.user.id)
        .single();

      setFormData({
        email: session.user.email || "",
        is_public: profile?.is_public !== false,
      });

      // Fetch subscription type
      let finalPlanType = "free";
      try {
        const res = await fetch("/api/coupons/redeem");
        if (res.ok) {
          const data = await res.json();
          finalPlanType = data.plan_type || "free";
        } else {
          throw new Error("API failed");
        }
      } catch (e) {
        // Fallback to direct supabase query
        const { data: subData } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("profile_id", session.user.id)
          .single();
          
        if (subData) {
          const isExpired = subData.plan_type === "pro" && subData.current_period_end && new Date(subData.current_period_end) < new Date();
          finalPlanType = isExpired ? "free" : subData.plan_type;
        }
      }
      setSubType(finalPlanType);

      setLoading(false);
    };

    fetchSettingsData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSavePrivacy = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          is_public: formData.is_public,
        })
        .eq("id", session.user.id);

      if (error) throw error;
      
      // Optionally show a toast here
    } catch (err) {
      console.error(err);
      alert("Failed to update privacy settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you absolutely sure you want to permanently delete your account and ALL associated data? This action cannot be undone.")) {
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const res = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
      });
      
      if (!res.ok) {
        throw new Error("Failed to delete account from server.");
      }
      
      await supabase.auth.signOut();
      router.push("/");
    } catch (err) {
      console.error(err);
      alert("Failed to delete account. Contact support.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl animate-pulse">
        <div className="h-10 w-48 rounded bg-zinc-200" />
        <div className="h-[200px] rounded-[24px] bg-zinc-100" />
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none max-w-3xl">
      <div className="border-b border-zinc-200 pb-6">
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-2">
          Account Settings
        </h1>
        <p className="text-sm text-zinc-500 mt-1 font-medium">Manage your security, privacy, and account data.</p>
      </div>

      <div className="space-y-6">
        {/* Account Information */}
        <div className="rounded-[24px] border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center">
              <Shield className="h-4 w-4 text-zinc-900" />
            </div>
            Account Information
          </h2>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="text"
              value={formData.email}
              disabled
              className="w-full rounded-xl border border-zinc-200 bg-zinc-100 py-3 px-4 text-sm text-zinc-500 font-medium cursor-not-allowed"
            />
            <p className="text-[11px] text-zinc-400 font-medium mt-2">Your primary email address is used for authentication and cannot be changed here.</p>
          </div>
        </div>

        {/* Subscription Plan */}
        <div className="rounded-[24px] border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5 text-zinc-500" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-zinc-900">Current Plan: <span className="uppercase">{subType}</span></h3>
              <p className="text-sm text-zinc-500 mt-1 font-medium">
                {subType === "pro" 
                  ? "You have unlimited access to all features." 
                  : "You are currently on the Free plan with limited features."}
              </p>
            </div>
          </div>
          {subType !== "pro" && (
            <button
              onClick={() => router.push("/pricing")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
            >
              Upgrade to Pro
            </button>
          )}
        </div>

        {/* Privacy */}
        <div className="rounded-[24px] border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center shrink-0">
              {formData.is_public ? <Eye className="h-5 w-5 text-zinc-500" /> : <EyeOff className="h-5 w-5 text-zinc-500" />}
            </div>
            <div>
              <h4 className="font-bold text-zinc-900 text-base mb-1">Public Profile Visibility</h4>
              <p className="text-sm text-zinc-500 font-medium leading-relaxed max-w-md">
                Allow your profile to be visible to anyone with the link. Turning this off hides your profile page.
              </p>
              
              <label className="flex items-center cursor-pointer mt-4">
                <div className="relative">
                  <input type="checkbox" name="is_public" className="sr-only" checked={formData.is_public} onChange={handleChange} />
                  <div className={`block w-12 h-7 rounded-full transition-colors ${formData.is_public ? 'bg-violet-500' : 'bg-zinc-300'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform shadow-sm ${formData.is_public ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
                <span className="ml-3 text-sm font-bold text-zinc-700">
                  {formData.is_public ? 'Profile is Public' : 'Profile is Hidden'}
                </span>
              </label>
            </div>
          </div>
          
          <button
            type="button"
            disabled={saving}
            onClick={handleSavePrivacy}
            className="shrink-0 rounded-xl bg-zinc-900 hover:bg-zinc-800 px-6 py-2.5 text-sm font-bold text-white flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Privacy'}
          </button>
        </div>

        {/* Danger Zone */}
        <div className="rounded-[24px] border border-rose-200 bg-rose-50/30 p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-rose-600 flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-rose-100 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
            </div>
            Danger Zone
          </h2>

          <div className="space-y-4">
            <div className="flex flex-row items-center justify-between gap-4 p-5 bg-white border border-zinc-200 rounded-[16px]">
              <div>
                <h4 className="font-bold text-zinc-900 text-sm mb-1">Sign Out</h4>
                <p className="text-xs text-zinc-500 font-medium">Log out of your current session on this device.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSignOutModal(true)}
                className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-sm font-bold rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>

            <div className="flex flex-row items-center justify-between gap-4 p-5 bg-white border border-rose-200 rounded-[16px]">
              <div>
                <h4 className="font-bold text-rose-600 text-sm mb-1">Delete Account</h4>
                <p className="text-xs text-rose-500/80 font-medium">Permanently delete your profile and all associated data.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                <Trash2 className="h-4 w-4" /> Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sign Out Modal */}
      {showSignOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] p-6 max-w-sm w-full shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4 border border-zinc-200 mx-auto">
              <LogOut className="h-5 w-5 text-zinc-600" />
            </div>
            <h3 className="text-xl font-extrabold text-zinc-900 text-center mb-2">Sign Out</h3>
            <p className="text-sm text-zinc-500 text-center font-medium mb-6">Are you sure you want to sign out of your account?</p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setShowSignOutModal(false)}
                className="px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-600 text-sm font-bold hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleLogout}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-800 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] p-6 max-w-sm w-full shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center mb-4 border border-rose-200 mx-auto">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
            </div>
            <h3 className="text-xl font-extrabold text-zinc-900 text-center mb-2">Delete Account</h3>
            <p className="text-sm text-zinc-500 text-center font-medium mb-6">
              Are you sure you want to delete your account? This action is permanent and cannot be undone.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleDeleteAccount}
                className="w-full px-4 py-3 rounded-xl bg-rose-600 text-white text-sm font-bold hover:bg-rose-700 transition-colors flex items-center justify-center gap-2"
              >
                Yes, Delete My Account
              </button>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-600 text-sm font-bold hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
