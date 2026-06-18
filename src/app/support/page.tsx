import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Bug, Lightbulb, MessageCircleQuestion } from "lucide-react";

export const metadata = {
  title: "Support & Help Center",
  description: "Get help, report issues, and request features for Aivones.",
};

export default function SupportPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50">
      <Navbar />

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4">Support & Help Center</h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            We are here to help you get the most out of Aivones. Browse our FAQs or reach out to our support team directly at <a href="mailto:yanshuvoise@gmail.com" className="text-blue-400 hover:underline">yanshuvoise@gmail.com</a>.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {/* General Support */}
          <a href="mailto:yanshuvoise@gmail.com?subject=General Support Request" className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:bg-zinc-900 transition-colors group cursor-pointer">
            <div className="h-12 w-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">General Inquiry</h3>
            <p className="text-sm text-zinc-500 mb-4">Have a question about your account or need help getting started?</p>
            <span className="text-blue-400 text-sm font-semibold flex items-center gap-1">Contact Support &rarr;</span>
          </a>

          {/* Bug Reporting */}
          <a href="mailto:yanshuvoise@gmail.com?subject=Bug Report" className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:bg-zinc-900 transition-colors group cursor-pointer">
            <div className="h-12 w-12 bg-rose-500/10 text-rose-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Bug className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">Report an Issue</h3>
            <p className="text-sm text-zinc-500 mb-4">Found a bug or experiencing technical difficulties? Let us know.</p>
            <span className="text-rose-400 text-sm font-semibold flex items-center gap-1">Report Bug &rarr;</span>
          </a>

          {/* Feature Request */}
          <a href="mailto:yanshuvoise@gmail.com?subject=Feature Request" className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:bg-zinc-900 transition-colors group cursor-pointer">
            <div className="h-12 w-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Lightbulb className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">Feature Request</h3>
            <p className="text-sm text-zinc-500 mb-4">Have an idea to make Aivones better? We would love to hear it.</p>
            <span className="text-emerald-400 text-sm font-semibold flex items-center gap-1">Suggest Feature &rarr;</span>
          </a>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <MessageCircleQuestion className="h-8 w-8 text-violet-400" />
            <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6">
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-zinc-100 mb-2">Is Aivones free to use?</h4>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Yes! During our Early Access period, all features—including premium layouts, smart links, and unlimited uploads—are completely free.
              </p>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-zinc-100 mb-2">What file types can I upload?</h4>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Currently, you can upload PDFs, Images (JPG, PNG, GIF, WebP), and Document files.
              </p>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-zinc-100 mb-2">How do Smart Links work?</h4>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Smart Links allow you to generate a custom URL that shares only specific content from your dashboard. For example, you can create a link that only shows your resume PDF and portfolio images, hiding everything else.
              </p>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-zinc-100 mb-2">Can I delete my account?</h4>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Yes. If you wish to permanently delete your account and all associated data, please send an email to our support team and we will process the deletion within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
