import { Card, CardContent } from "@/components/ui/card";
import { FileText, Link as LinkIcon } from "lucide-react";

export default function Terms() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <header className="max-w-3xl mx-auto text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white p-4 rounded-md shadow-sm">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Terms of Service</h1>
              <p className="text-sm text-slate-500 mt-1">Rules and conditions for using PKMedia services.</p>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardContent>
              <h2 className="text-lg font-semibold">Acceptance of terms</h2>
              <p className="text-sm text-gray-700 mt-2">By accessing or using PKMedia, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>

              <h3 className="mt-4 text-md font-semibold">Use of content</h3>
              <p className="text-sm text-gray-700 mt-2">All content published on PKMedia is owned by or licensed to PKMedia. You may share links and use short excerpts for non-commercial purposes with clear attribution. For commercial reuse or syndication, contact <a href="mailto:partnerships@pkmedia.co.ke" className="text-primary">partnerships@pkmedia.co.ke</a>.</p>

              <h3 className="mt-4 text-md font-semibold">User conduct</h3>
              <p className="text-sm text-gray-700 mt-2">Users must not post unlawful, defamatory, infringing, or abusive content. We reserve the right to remove content that violates these terms and suspend accounts where appropriate.</p>

              <h3 className="mt-4 text-md font-semibold">Disclaimers and liability</h3>
              <p className="text-sm text-gray-700 mt-2">Content is provided for informational purposes only. PKMedia is not liable for indirect or consequential damages arising from your use of the site. Where local law limits these exclusions, they will apply to the fullest extent permitted.</p>

              <h3 className="mt-4 text-md font-semibold">Privacy</h3>
              <p className="text-sm text-gray-700 mt-2">Our Privacy Policy describes how we collect and use personal information. By using the site you also accept our Privacy Policy.</p>

              <h3 className="mt-4 text-md font-semibold">Changes to terms</h3>
              <p className="text-sm text-gray-700 mt-2">We may update these terms periodically; continued use after changes constitutes acceptance of the revised terms.</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="text-lg font-semibold">Contact about terms</h3>
              <p className="text-sm text-gray-700 mt-2">Questions about these terms? Email <a href="mailto:legal@pkmedia.co.ke" className="text-primary">legal@pkmedia.co.ke</a> or return to the <a href="/" className="text-primary inline-flex items-center">main page <LinkIcon className="ml-2 h-4 w-4" /></a>.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
