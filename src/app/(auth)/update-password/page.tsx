"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Link2, Lock, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

function UpdatePasswordContent() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setErrorMsg(error.message || "Failed to update password");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 2000);
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-8 py-12 select-none relative overflow-hidden" suppressHydrationWarning>
      <div className="absolute top-1/2 left-1/2 -z-10 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[100px]" suppressHydrationWarning />
      
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-zinc-900 bg-zinc-900/30 p-8 backdrop-blur-xl">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 transition-transform group-hover:scale-105">
              <Link2 className="h-5 w-5 text-violet-400" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Aivones</span>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Update Password
          </h2>
          <p className="mt-2 text-xs text-zinc-550">
            Enter a new, secure password for your account.
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Password Updated</h3>
            <p className="text-xs text-zinc-400">
              Your password has been successfully changed. Redirecting...
            </p>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleUpdate}>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-650" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 py-3 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-750 focus:border-violet-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-650 py-3.5 text-sm font-semibold text-white hover:opacity-95 shadow-md shadow-violet-950/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function UpdatePasswordPage() {
  return (
    <div suppressHydrationWarning>
      <Suspense fallback={
        <div suppressHydrationWarning className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-400">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          <span className="ml-3 text-sm">Loading...</span>
        </div>
      }>
        <UpdatePasswordContent />
      </Suspense>
    </div>
  );
}
