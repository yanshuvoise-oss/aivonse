import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Aivones | One Link. Share Everything.",
    template: "%s | Aivones",
  },
  description: "Aivones is a modern, premium link-in-bio platform. Share links, PDFs, documents, images, and social profiles using one sleek, customizable sharing link.",
  keywords: ["link in bio", "one link", "share media", "custom profile", "portfolio links", "SaaS MVP", "Aivones"],
  authors: [{ name: "Aivones Team", url: "https://aivones.com" }],
  creator: "Aivones",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://aivones.com",
    title: "Aivones - One Link. Share Everything.",
    description: "Share links, documents, PDFs, social cards, and premium profiles under one beautiful link.",
    siteName: "Aivones",
    images: [
      {
        url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&h=630&q=80",
        width: 1200,
        height: 630,
        alt: "Aivones - Shared Spaces",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aivones - One Link. Share Everything.",
    description: "The next-gen link sharing profile for creators, professionals, and developers.",
    images: ["https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&h=630&q=80"],
  },
  icons: {
    icon: "/favicon.ico",
  },
  metadataBase: new URL("https://aivones.com"),
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <head suppressHydrationWarning>
        {/* Decoy script for Kaspersky/Bitdefender to hijack instead of our real code */}
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: "/* decoy */" }} />
        {/* Real interceptor */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              // Intercept global errors before Next.js Dev Overlay catches them
              if (typeof window !== 'undefined') {
                // 1. Aggressively remove bis_skin_checked injected by Kaspersky/BitDefender
                const cleanDOM = () => {
                  const elements = document.querySelectorAll('[bis_skin_checked]');
                  for (let i = 0; i < elements.length; i++) {
                    elements[i].removeAttribute('bis_skin_checked');
                  }
                };
                cleanDOM();
                const observer = new MutationObserver(cleanDOM);
                observer.observe(document.documentElement, { attributes: true, attributeFilter: ['bis_skin_checked'], subtree: true });

                // 2. Intercept console errors just in case
                const originalError = console.error;
                console.error = function(...args) {
                  if (typeof args[0] === 'string' && args[0].includes('A tree hydrated but some attributes of the server rendered HTML didn\\'t match')) {
                    return;
                  }
                  if (typeof args[0] === 'string' && args[0].includes('Hydration failed because the initial UI does not match')) {
                    return;
                  }
                  if (args[0] && (args[0].message === 'Failed to fetch' || args[0].message === 'Load failed') && args[0].stack && args[0].stack.includes('chrome-extension://')) {
                    return;
                  }
                  // Safari generic load failed
                  if (args[0] && args[0].message === 'Load failed') {
                    return;
                  }
                  originalError.apply(console, args);
                };

                // 3. Silence chrome-extension crashes
                window.addEventListener('error', function(event) {
                  if (event.filename && event.filename.includes('chrome-extension://')) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                  }
                  if (event.error && event.error.stack && event.error.stack.includes('chrome-extension://')) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                  }
                  if (event.error && (event.error.message === 'Failed to fetch' || event.error.message === 'Load failed')) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                  }
                }, true);

                window.addEventListener('unhandledrejection', function(event) {
                  if (event.reason && event.reason.stack && event.reason.stack.includes('chrome-extension://')) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                  }
                  if (event.reason && (event.reason.message === 'Failed to fetch' || event.reason.message === 'Load failed')) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                  }
                }, true);
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased bg-zinc-950 text-zinc-50 min-h-screen flex flex-col`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
