"use client";

import { useState } from "react";
import Link from "next/link";
import { Link2, Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMsg("");
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
      });

      if (error) {
        console.error("Reset password error:", error.message);
        // For security, show success even on auth errors to prevent email enumeration.
      }
      // Show success for both actual success and auth errors (prevents enumeration)
      setSuccess(true);
    } catch (err) {
      console.error("Unexpected error during reset password:", err);
      setErrorMsg("Unable to send reset email. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-8 py-12 select-none relative overflow-hidden" suppressHydrationWarning>
      {/* Background radial effects */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[100px]" suppressHydrationWarning />
      
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-zinc-900 bg-zinc-900/30 p-8 backdrop-blur-xl">
        {/* Brand */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 transition-transform group-hover:scale-105">
              <Link2 className="h-5 w-5 text-violet-400" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Aivones</span>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Reset Password
          </h2>
          <p className="mt-2 text-xs text-zinc-550">
            Enter your email to receive a recovery reset link.
          </p>
        </div>

        {success ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Check your inbox</h3>
            <p className="text-xs text-zinc-400">
              We have sent a mock password reset link to <strong className="text-zinc-200">{email}</strong>.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </Link>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {errorMsg && (
              <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
                {errorMsg}
              </div>
            )}
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-650" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 py-3 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-700 focus:border-violet-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-650 py-3.5 text-sm font-semibold text-white hover:opacity-95 shadow-md shadow-violet-950/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                "Send Reset Link"
              )}
            </button>

            {/* Footer */}
            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
