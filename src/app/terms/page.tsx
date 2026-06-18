import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Terms of Service",
  description: "Terms of Service and Usage Rules for Aivones.",
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4">Terms of Service</h1>
          <p className="text-zinc-400">Last Updated: June 2026</p>
        </div>

        <div className="prose prose-invert prose-zinc max-w-none">
          <section className="mb-10 space-y-4">
            <h2 className="text-2xl font-bold text-zinc-100">1. Acceptance of Terms</h2>
            <p className="text-zinc-400 leading-relaxed">
              By accessing and using Aivones (the &quot;Service&quot;), you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you may not use our platform.
            </p>
          </section>

          <section className="mb-10 space-y-4">
            <h2 className="text-2xl font-bold text-zinc-100">2. Account Responsibilities</h2>
            <p className="text-zinc-400 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section className="mb-10 space-y-4">
            <h2 className="text-2xl font-bold text-zinc-100">3. Acceptable Use Policy</h2>
            <p className="text-zinc-400 leading-relaxed">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc pl-5 text-zinc-400 space-y-2">
              <li>Upload, share, or transmit any content that is unlawful, harmful, threatening, abusive, harassing, or otherwise objectionable.</li>
              <li>Distribute malware, viruses, or any other malicious code.</li>
              <li>Violate the intellectual property rights of others.</li>
              <li>Engage in spamming, phishing, or other fraudulent activities.</li>
            </ul>
            <p className="text-zinc-400 mt-4 leading-relaxed">
              We reserve the right to remove any content or suspend/terminate accounts that violate these rules without prior notice.
            </p>
          </section>

          <section className="mb-10 space-y-4">
            <h2 className="text-2xl font-bold text-zinc-100">4. Intellectual Property</h2>
            <p className="text-zinc-400 leading-relaxed">
              You retain all ownership rights to the content you upload. By uploading content, you grant Aivones a worldwide, non-exclusive, royalty-free license to host, display, and distribute that content strictly for the purpose of operating the Service.
            </p>
          </section>

          <section className="mb-10 space-y-4">
            <h2 className="text-2xl font-bold text-zinc-100">5. Limitation of Liability</h2>
            <p className="text-zinc-400 leading-relaxed">
              Aivones is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. We do not warrant that the service will be uninterrupted or error-free. In no event shall Aivones be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the Service.
            </p>
          </section>

          <section className="mb-10 space-y-4">
            <h2 className="text-2xl font-bold text-zinc-100">6. Modifications to the Service</h2>
            <p className="text-zinc-400 leading-relaxed">
              We reserve the right to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
