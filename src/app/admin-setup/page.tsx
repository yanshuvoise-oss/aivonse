"use client";

import { useState } from "react";
import { Shield, KeyRound, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminSetupPage() {
  const [secret, setSecret] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret) return;
    
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret })
      });

      const data = await res.json();

      if (res.ok) {
        if (data.devModeAction === "setAdmin") {
          // Dev Mode Mock DB override
          const sessionData = localStorage.getItem("aivones_session");
          if (sessionData) {
             const session = JSON.parse(sessionData);
             session.user.user_metadata = { ...session.user.user_metadata, is_admin: true };
             localStorage.setItem("aivones_session", JSON.stringify(session));
             
             const profiles = JSON.parse(localStorage.getItem("aivones_profiles") || "[]");
             const userProfileIndex = profiles.findIndex((p: any) => p.id === session.user.id);
             if (userProfileIndex > -1) {
               profiles[userProfileIndex].is_admin = true;
               localStorage.setItem("aivones_profiles", JSON.stringify(profiles));
             }
             
             document.cookie = `aivones_admin_active=true; path=/; max-age=86400; SameSite=Lax`;
          }
        }

        setStatus("success");
        setTimeout(() => {
          window.location.href = "/admin";
        }, 1500);
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Failed to grant admin access.");
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg("An unexpected error occurred.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden">
        <div className="bg-zinc-900 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 mb-4">
            <Shield className="h-6 w-6 text-fuchsia-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Setup</h1>
          <p className="text-zinc-400 text-sm mt-2">
            Securely grant administrative privileges to your current account.
          </p>
        </div>
        
        <div className="p-6">
          {status === "success" ? (
            <div className="text-center py-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
                <Shield className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900 mb-2">Access Granted!</h2>
              <p className="text-zinc-600 text-sm">
                Your account has been upgraded to an Administrator. Redirecting you to the Admin Panel...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSetup} className="space-y-4">
              {status === "error" && (
                <div className="p-3 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg">
                  {errorMsg}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700">Setup Secret Key</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" />
                  <input
                    type="password"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="Enter the environment secret"
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white font-semibold py-2.5 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-70"
              >
                {status === "loading" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Grant Admin Access
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
