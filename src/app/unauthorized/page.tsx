"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4">
        {/* Placeholder skeleton */}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-100">
          <ShieldAlert className="h-10 w-10 text-rose-600" />
        </div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-zinc-900">
          Access Denied
        </h1>
        <p className="mb-8 text-base text-zinc-600">
          You do not have permission to view this page. This area is restricted to administrators only.
        </p>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-zinc-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
