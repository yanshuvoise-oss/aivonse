import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-white">
                <path d="M12 2L2 22l10-4 10 4L12 2z" />
              </svg>
            </div>
            <span className="font-bold text-zinc-900">Aivones</span>
          </div>
          <p className="text-left text-[13px] font-medium text-zinc-500">
            &copy; {new Date().getFullYear()} Aivones Inc. All rights reserved. Made for futuristic sharing.
          </p>
          <div className="flex space-x-6 text-[13px] font-medium text-zinc-500">
            <Link href="/privacy" className="hover:text-zinc-900 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-zinc-900 transition-colors">
              Terms of Service
            </Link>
            <Link href="/support" className="hover:text-zinc-900 transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
