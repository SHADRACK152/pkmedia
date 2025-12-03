import { Card, CardContent } from "@/components/ui/card";
import { Shield, Link as LinkIcon } from "lucide-react";

export default function Privacy() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <header className="max-w-3xl mx-auto text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white p-4 rounded-md shadow-sm">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Privacy Policy</h1>
              <p className="text-sm text-slate-500 mt-1">How PKMedia collects, uses and protects your data.</p>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardContent>
              <h2 className="text-lg font-semibold">Information we collect</h2>
              <p className="text-sm text-gray-700 mt-2">We may collect information you provide directly (for example, when you contact us or subscribe), information collected automatically through cookies and analytics, and information from third-party partners where you have consented to sharing.</p>

              <h3 className="mt-4 text-md font-semibold">How we use information</h3>
              <p className="text-sm text-gray-700 mt-2">We use data to deliver and personalise content, respond to enquiries, improve the site, and for analytics and security. We do not sell personal data to third parties.</p>

              <h3 className="mt-4 text-md font-semibold">Cookies and tracking</h3>
              <p className="text-sm text-gray-700 mt-2">We use cookies for site functionality, analytics, and optional personalization. You can manage cookie preferences through your browser settings or via any available site controls.</p>

              <h3 className="mt-4 text-md font-semibold">Your rights</h3>
              <p className="text-sm text-gray-700 mt-2">Depending on your jurisdiction, you may have rights to access, correct, export, or delete your personal information. To exercise these rights, contact us at <a href="mailto:privacy@pkmedia.co.ke" className="text-primary">privacy@pkmedia.co.ke</a>.</p>

              <h3 className="mt-4 text-md font-semibold">Security</h3>
              <p className="text-sm text-gray-700 mt-2">We maintain administrative, technical and physical safeguards to protect personal data. However, no transmission over the internet is completely secure; report concerns to <a href="mailto:security@pkmedia.co.ke" className="text-primary">security@pkmedia.co.ke</a>.</p>

              <h3 className="mt-4 text-md font-semibold">Changes to this policy</h3>
              <p className="text-sm text-gray-700 mt-2">We may update this policy periodically. The most recent version is published on this page with the effective date.</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="text-lg font-semibold">Contact about privacy</h3>
              <p className="text-sm text-gray-700 mt-2">For privacy requests or questions, email <a href="mailto:privacy@pkmedia.co.ke" className="text-primary">privacy@pkmedia.co.ke</a> or use the contact form on our <a href="/" className="text-primary inline-flex items-center">main page <LinkIcon className="ml-2 h-4 w-4" /></a>.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
