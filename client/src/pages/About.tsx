import { Card, CardContent } from "@/components/ui/card";
import { Info, Users, Globe, CheckCircle, Clock, Megaphone } from "lucide-react";

export default function About() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <header className="max-w-4xl mx-auto text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white p-4 rounded-md shadow-sm">
            <Info className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">About PKMedia</h1>
              <p className="text-sm text-slate-500 mt-1">Accurate news across Kenya, Africa and the world — independent reporting that informs, explains and empowers.</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2">
            <Card>
              <CardContent>
                <h2 className="text-xl font-semibold mb-3">Who we are</h2>
                <p className="text-sm text-gray-700">PKMedia is an independent news organisation based in Nairobi, Kenya, serving audiences across the country and continent. Our reporters and editors work from national, county and community levels to surface stories that matter to everyday citizens — from governance and development to business, technology, health and the arts.</p>

                <h3 className="mt-6 text-lg font-semibold">Our mission</h3>
                <p className="text-sm text-gray-700">To provide accurate, timely and impartial journalism that holds power to account, amplifies under‑reported voices and supports informed public debate. We prioritise verification, transparency and the safety of our sources and staff.</p>

                <h3 className="mt-6 text-lg font-semibold">Our history</h3>
                <p className="text-sm text-gray-700">Founded by a group of Kenyan journalists and media professionals, PKMedia grew from a local newsroom into a pan‑African news platform with correspondents and contributors across multiple counties and cities. We remain committed to local reporting and editorial independence.</p>

                <h3 className="mt-6 text-lg font-semibold">What we cover</h3>
                <p className="text-sm text-gray-700">Our core coverage areas include: Politics & Governance, Business & Economy, Technology & Innovation, Health & Environment, Culture & Society, and Sports. Special projects include data journalism, investigations and explainers tailored to regional issues.</p>

                <h3 className="mt-6 text-lg font-semibold">Editorial standards</h3>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-2 mt-2">
                  <li><strong>Verification:</strong> We verify facts with multiple independent sources before publication.</li>
                  <li><strong>Corrections:</strong> We publish prompt corrections and clarifications when errors are identified.</li>
                  <li><strong>Transparency:</strong> We disclose sources, funding and potential conflicts where relevant.</li>
                  <li><strong>Separation of news and opinion:</strong> News reporting is distinguished clearly from analysis and opinion pieces.</li>
                </ul>

                <h3 className="mt-6 text-lg font-semibold">Accountability & corrections</h3>
                <p className="text-sm text-gray-700">If you believe we have published inaccurate information, please contact our corrections team at <a href="mailto:contact@pkmedia.co.ke" className="text-primary">contact@pkmedia.co.ke</a> with the details and supporting documents. We review all reported issues and publish corrections where necessary.</p>

                <h3 className="mt-6 text-lg font-semibold">Partnerships & impact</h3>
                <p className="text-sm text-gray-700">We work with local organisations, research institutions and independent journalists to extend coverage and ensure diverse representation in our reporting. Our investigations aim to create measurable civic impact through public interest reporting.</p>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardContent>
                <h3 className="text-lg font-semibold">Newsroom & careers</h3>
                <p className="text-sm text-gray-700">We are always looking for talented reporters, editors, data journalists and multimedia producers. To apply or suggest a contributor, email <a href="mailto:newsroom@pkmedia.co.ke" className="text-primary">newsroom@pkmedia.co.ke</a> with your CV and relevant work samples.</p>
                <p className="mt-4 text-sm text-gray-600">If you provide staff bios, I will add a team section with photos and contact details.</p>
              </CardContent>
            </Card>
          </section>

          <aside>
            <div className="space-y-4">
              <Card>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-primary" />
                    <div>
                      <p className="text-sm font-semibold">Audience</p>
                      <p className="text-xs text-gray-600">Serving readers across Kenya and the African continent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Globe className="h-6 w-6 text-primary" />
                    <div>
                      <p className="text-sm font-semibold">Coverage</p>
                      <p className="text-xs text-gray-600">Local counties to regional and global issues</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-primary" />
                    <div>
                      <p className="text-sm font-semibold">Standards</p>
                      <p className="text-xs text-gray-600">Verification • Corrections • Transparency</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Clock className="h-6 w-6 text-primary" />
                    <div>
                      <p className="text-sm font-semibold">Publishing</p>
                      <p className="text-xs text-gray-600">Daily updates and in‑depth features</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Megaphone className="h-6 w-6 text-primary" />
                    <div>
                      <p className="text-sm font-semibold">Contact</p>
                      <p className="text-xs text-gray-600">General: contact@pkmedia.co.ke</p>
                      <p className="text-xs text-gray-600">Newsroom: newsroom@pkmedia.co.ke</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>

        <div className="max-w-4xl mx-auto mt-8 text-sm text-gray-600">
          <h3 className="text-lg font-semibold">Editorial independence</h3>
          <p className="mt-2">PKMedia maintains editorial independence from political and commercial interests. Our revenue model includes subscriptions, advertising disclosed on the article pages, and sponsored content that is clearly labelled. Our editorial team retains full control over reporting and newsroom decisions.</p>

          <h3 className="mt-6 text-lg font-semibold">Corrections & complaints</h3>
          <p className="mt-2">To file a complaint or request a correction, contact <a href="mailto:contact@pkmedia.co.ke" className="text-primary">contact@pkmedia.co.ke</a>. We will acknowledge receipt and respond within a reasonable timeframe.</p>
        </div>
      </div>
    </main>
  );
}
