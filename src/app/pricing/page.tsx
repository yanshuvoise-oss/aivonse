"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, Sparkles, AlertCircle, ArrowLeft, Loader2, Tag, CheckCircle2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function PricingPage() {
  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [couponMessage, setCouponMessage] = useState("");
  const [currentPlan, setCurrentPlan] = useState<"free" | "pro">("free");
  const [loadingPlan, setLoadingPlan] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoadingPlan(false); return; }

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("plan_type, current_period_end")
        .eq("profile_id", session.user.id)
        .single();

      if (sub) {
        const isExpired = sub.plan_type === "pro" && sub.current_period_end && new Date(sub.current_period_end) < new Date();
        if (sub.plan_type === "pro" && !isExpired) {
          setCurrentPlan("pro");
        }
      }
      setLoadingPlan(false);
    };
    fetchPlan();
  }, []);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponStatus("loading");
    setCouponMessage("");

    try {
      const res = await fetch("/api/coupons/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCouponStatus("success");
        setCouponMessage(data.message);
        if (data.upgraded) {
          setCurrentPlan("pro");
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 2500);
        }
      } else {
        setCouponStatus("error");
        setCouponMessage(data.error || "Invalid coupon code. Please try again.");
      }
    } catch (err) {
      setCouponStatus("error");
      setCouponMessage("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9FB] font-sans selection:bg-blue-100 selection:text-blue-900 py-20 px-4 sm:px-6 relative">
      
      {/* Back Button */}
      <div className="absolute top-6 left-6 sm:top-10 sm:left-10 z-10">
        <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-900 font-bold text-sm flex items-center gap-2 transition-colors bg-white px-4 py-2 rounded-full border border-zinc-200 shadow-sm">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </div>

      <div className="max-w-7xl mx-auto pt-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto font-medium">
            Start for free. Upgrade to Pro with a coupon code for unlimited access.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-start">
          
          {/* Free Plan */}
          <div className={`bg-white rounded-3xl p-8 border shadow-sm flex flex-col h-full transition-all ${currentPlan === "free" && !loadingPlan ? "border-zinc-900 ring-2 ring-zinc-900 ring-offset-4 ring-offset-[#F9F9FB]" : "border-zinc-200"}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-extrabold text-zinc-900">Free Plan</h3>
              {currentPlan === "free" && !loadingPlan && (
                <span className="text-xs font-bold bg-zinc-900 text-white px-3 py-1 rounded-full">Current Plan</span>
              )}
            </div>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-black text-zinc-900">$0</span>
              <span className="text-zinc-500 font-bold">/ forever</span>
            </div>
            
            <Link 
              href="/dashboard"
              className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 py-3.5 rounded-full font-bold text-center transition-colors mb-8 shadow-sm border border-zinc-200/60 block"
            >
              {currentPlan === "free" ? "Go to Dashboard" : "Downgrade to Free"}
            </Link>

            <div className="space-y-4 flex-grow">
              {[
                { text: "Unlimited normal links", included: true },
                { text: "Up to 5 PDFs", included: true },
                { text: "Up to 5 Images", included: true },
                { text: "Up to 5 Documents", included: true },
                { text: "Public profile page", included: true },
                { text: "Basic analytics", included: true },
                { text: "Unlimited PDFs", included: false },
                { text: "Unlimited Smart Share Links", included: false },
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  {feature.included
                    ? <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    : <X className="h-5 w-5 text-zinc-300 shrink-0 mt-0.5" />
                  }
                  <span className={`font-semibold text-sm ${feature.included ? "text-zinc-700" : "text-zinc-400"}`}>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Plan */}
          <div className={`bg-zinc-900 rounded-3xl p-8 border shadow-2xl relative flex flex-col h-full transition-all ${currentPlan === "pro" && !loadingPlan ? "ring-2 ring-blue-500 ring-offset-4 ring-offset-[#F9F9FB] border-blue-500" : "border-zinc-800 ring-2 ring-blue-500 ring-offset-4 ring-offset-[#F9F9FB]"}`}>
            {currentPlan !== "pro" && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 shadow-md whitespace-nowrap">
                <Sparkles className="h-3.5 w-3.5" /> Recommended
              </div>
            )}
            {currentPlan === "pro" && !loadingPlan && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 shadow-md whitespace-nowrap">
                <CheckCircle2 className="h-3.5 w-3.5" /> Active Plan
              </div>
            )}
            
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-extrabold text-white">Pro Plan</h3>
            </div>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-black text-white">$5</span>
              <span className="text-zinc-400 font-bold">/ month</span>
            </div>

            {currentPlan === "pro" ? (
              <div className="mb-8 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl p-4 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-emerald-300 font-bold text-sm">You&apos;re on the Pro plan!</p>
                <p className="text-emerald-400/70 text-xs mt-1">Enjoy unlimited access to all features.</p>
              </div>
            ) : (
              <div className="mb-8 space-y-4">
                {/* Payment notice */}
                <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4">
                  <p className="text-zinc-300 text-xs font-medium text-center leading-relaxed">
                    💡 Payment gateway coming soon. Upgrade now for <span className="text-white font-bold">free</span> using a coupon code below.
                  </p>
                </div>

                {/* Coupon Code Section */}
                <form onSubmit={handleApplyCoupon} className="space-y-3">
                  <label htmlFor="coupon" className="block text-xs font-bold text-zinc-400 ml-1 uppercase tracking-wider">
                    Have a Coupon Code?
                  </label>

                  {/* Success message */}
                  {couponStatus === "success" && (
                    <div className="flex items-start gap-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl p-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-emerald-300 text-xs font-medium">{couponMessage}</p>
                    </div>
                  )}

                  {/* Error message */}
                  {couponStatus === "error" && (
                    <div className="flex items-start gap-2 bg-red-500/20 border border-red-500/40 rounded-xl p-3">
                      <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                      <p className="text-red-300 text-xs font-medium">{couponMessage}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <input
                        type="text"
                        id="coupon"
                        value={couponCode}
                        onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponStatus("idle"); }}
                        placeholder="ENTER CODE"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow font-mono text-sm uppercase"
                        disabled={couponStatus === "loading" || couponStatus === "success"}
                      />
                    </div>
                    {couponCode.trim() && couponStatus !== "success" && (
                      <button
                        type="submit"
                        disabled={couponStatus === "loading"}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-bold text-sm transition-colors shadow-lg flex items-center gap-2 whitespace-nowrap disabled:opacity-60"
                      >
                        {couponStatus === "loading"
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <><Tag className="h-4 w-4" /> Use Coupon</>
                        }
                      </button>
                    )}
                  </div>
                </form>

                <button
                  disabled
                  className="w-full bg-blue-600/40 text-blue-300 py-3.5 rounded-full font-bold text-center cursor-not-allowed border border-blue-700/50"
                >
                  Pay $5 / Month (Coming Soon)
                </button>
              </div>
            )}

            <div className="space-y-4 flex-grow">
              {[
                "Unlimited normal links",
                "Unlimited PDFs",
                "Unlimited Images",
                "Unlimited Documents",
                "Unlimited Smart Share Links",
                "Advanced analytics",
                "Priority access to new features",
                "Everything included in Free Plan",
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-300 font-semibold text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
