import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy and Data Handling for Aivones.",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4">Privacy Policy</h1>
          <p className="text-zinc-400">Last Updated: June 2026</p>
        </div>

        <div className="prose prose-invert prose-zinc max-w-none">
          <section className="mb-10 space-y-4">
            <h2 className="text-2xl font-bold text-zinc-100">1. Information We Collect</h2>
            <p className="text-zinc-400 leading-relaxed">
              We collect information you provide directly to us when you register for an account, create a profile, or upload media. This includes:
            </p>
            <ul className="list-disc pl-5 text-zinc-400 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, and authentication credentials.</li>
              <li><strong>Profile Information:</strong> Bios, social media links, avatars, and custom usernames.</li>
              <li><strong>Content:</strong> Any URLs, PDFs, images, and documents you upload to the platform.</li>
            </ul>
          </section>

          <section className="mb-10 space-y-4">
            <h2 className="text-2xl font-bold text-zinc-100">2. How We Use Your Information</h2>
            <p className="text-zinc-400 leading-relaxed">
              The information we collect is used to:
            </p>
            <ul className="list-disc pl-5 text-zinc-400 space-y-2">
              <li>Provide, maintain, and improve the Aivones platform.</li>
              <li>Generate your public-facing smart links and profile pages.</li>
              <li>Provide aggregate analytics regarding profile views and link clicks.</li>
              <li>Ensure the security and integrity of our systems.</li>
            </ul>
          </section>

          <section className="mb-10 space-y-4">
            <h2 className="text-2xl font-bold text-zinc-100">3. Data Storage & Security</h2>
            <p className="text-zinc-400 leading-relaxed">
              We implement reasonable security measures to protect your personal information and uploaded files. Our database and authentication systems are securely managed by trusted third-party providers (e.g., Supabase). However, please remember that no method of transmission over the internet or method of electronic storage is 100% secure.
            </p>
          </section>

          <section className="mb-10 space-y-4">
            <h2 className="text-2xl font-bold text-zinc-100">4. Third-Party Services</h2>
            <p className="text-zinc-400 leading-relaxed">
              We do not sell, trade, or otherwise transfer your Personally Identifiable Information to outside parties. This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.
            </p>
          </section>

          <section className="mb-10 space-y-4">
            <h2 className="text-2xl font-bold text-zinc-100">5. Your Privacy Rights</h2>
            <p className="text-zinc-400 leading-relaxed">
              You have the right to access, update, or delete your personal information at any time via your account settings dashboard. If you wish to completely erase your account and all associated data, you may contact us through our Support page.
            </p>
          </section>

          <section className="mt-12 pt-8 border-t border-zinc-800">
            <p className="text-zinc-500 text-sm">
              If you have any questions about this Privacy Policy, please contact us via the Support page.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
