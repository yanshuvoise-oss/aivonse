import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div 
      suppressHydrationWarning 
      className="flex min-h-screen flex-col items-center justify-center bg-[#F9F9FB] dark:bg-zinc-950 px-4 text-center select-none font-sans"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 text-zinc-400 mb-6">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">Page Not Found</h2>
      <p className="mt-2 mb-8 text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
        We couldn&apos;t find the page you were looking for.
      </p>
      <Link 
        href="/" 
        className="rounded-full bg-zinc-900 dark:bg-zinc-100 px-6 py-2.5 text-sm font-semibold text-white dark:text-zinc-900 hover:opacity-90 transition-opacity"
      >
        Return Home
      </Link>
    </div>
  );
}
