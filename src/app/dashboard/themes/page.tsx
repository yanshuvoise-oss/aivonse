"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ThemeCustomizerPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-center py-20 text-zinc-500 text-sm">
      Redirecting...
    </div>
  );
}
