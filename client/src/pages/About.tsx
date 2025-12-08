import { Card, CardContent } from "@/components/ui/card";
import { Info, Users, Globe, CheckCircle, Clock, Megaphone, MapPin, Mail, Scale } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function About() {
  return (
    <>
      <Navbar />
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
                <p className="text-sm text-gray-700 mb-4">PKMedia is an independent news organisation based in Nairobi, Kenya, serving audiences across the country and continent. Our reporters and editors work from national, county and community levels to surface stories that matter to everyday citizens — from governance and development to business, technology, health and the arts.</p>
                
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                  <h4 className="font-semibold text-sm mb-2">Leadership & Ownership</h4>
                  <p className="text-sm text-gray-700"><strong>Editor-in-Chief:</strong> Peter Kamau Kariuki</p>
                  <p className="text-sm text-gray-700"><strong>Managing Director:</strong> Peter Kamau Kariuki</p>
                  <p className="text-sm text-gray-700 mt-2">PKMedia is independently owned and operated, committed to editorial independence and public interest journalism.</p>
                </div>

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
                <p className="text-sm text-gray-700 mb-3">If you believe we have published inaccurate information, please contact our corrections team at <a href="mailto:corrections@pkmedia.co.ke" className="text-primary font-medium">corrections@pkmedia.co.ke</a> with the details and supporting documents. We review all reported issues and publish corrections where necessary.</p>
                
                <div className="bg-slate-50 p-4 rounded-lg text-sm">
                  <p className="font-semibold mb-2">Contact Points:</p>
                  <ul className="space-y-1 text-gray-700">
                    <li><strong>General Inquiries:</strong> <a href="mailto:contact@pkmedia.co.ke" className="text-primary">contact@pkmedia.co.ke</a></li>
                    <li><strong>Corrections & Complaints:</strong> <a href="mailto:corrections@pkmedia.co.ke" className="text-primary">corrections@pkmedia.co.ke</a></li>
                    <li><strong>Legal & Data Protection:</strong> <a href="mailto:legal@pkmedia.co.ke" className="text-primary">legal@pkmedia.co.ke</a></li>
                    <li><strong>Newsroom & Tips:</strong> <a href="mailto:newsroom@pkmedia.co.ke" className="text-primary">newsroom@pkmedia.co.ke</a></li>
                  </ul>
                </div>

                <h3 className="mt-6 text-lg font-semibold">Partnerships & impact</h3>
                <p className="text-sm text-gray-700">We work with local organisations, research institutions and independent journalists to extend coverage and ensure diverse representation in our reporting. Our investigations aim to create measurable civic impact through public interest reporting.</p>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardContent>
                <h3 className="text-lg font-semibold mb-4">Our Team</h3>
                <p className="text-sm text-gray-700 mb-4">Meet the journalists and professionals behind PKMedia's coverage.</p>
                
                {/* Placeholder for team members - Add actual staff details */}
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4 py-2">
                    <h4 className="font-semibold text-sm">Peter Kamau Kariuki</h4>
                    <p className="text-xs text-primary font-medium">Editor-in-Chief & Managing Director</p>
                    <p className="text-xs text-gray-600 mt-1">Peter brings 10 years of comprehensive media experience to PKMedia. A Maseno University graduate, he has worked extensively in content creation for government officials including PS Raymond Omollo and Governor Ann Waiguru, specializing in social media strategy and public communication. His decade-long career spans journalism, digital content creation, and media consultancy, with a focus on governance, development, and community-centered storytelling.</p>
                    <p className="text-xs text-gray-600 mt-2"><a href="mailto:mtkenyanews1@gmail.com" className="text-primary hover:underline">mtkenyanews1@gmail.com</a></p>
                  </div>
                  
                  <div className="border-l-4 border-blue-500 pl-4 py-2">
                    <h4 className="font-semibold text-sm">Emadau Mark Shadrack</h4>
                    <p className="text-xs text-blue-600 font-medium">Senior Reporter & Technical Editor</p>
                    <p className="text-xs text-gray-600 mt-1">Mark brings 5 years of media experience to PKMedia, combining journalism with technical expertise. A Kabarak University graduate, he specializes in creating engaging video content (eCards) and comprehensive articles. His dual background in media and programming enables him to cover technology stories with depth and accuracy, while also contributing to PKMedia's digital infrastructure and multimedia storytelling capabilities.</p>
                    <p className="text-xs text-gray-600 mt-2"><a href="mailto:markemadu@gmail.com" className="text-primary hover:underline">markemadu@gmail.com</a></p>
                  </div>
                  
                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <h4 className="font-semibold text-sm">[Data Editor Name]</h4>
                    <p className="text-xs text-green-600 font-medium">Data & Investigations Editor</p>
                    <p className="text-xs text-gray-600 mt-1">[Brief bio highlighting data journalism expertise]</p>
                  </div>
                  
                  <p className="text-xs text-gray-500 italic mt-4 bg-yellow-50 p-3 rounded">
                    📝 <strong>Note:</strong> Add actual team member names, professional photos, detailed bios with credentials, and contact information for each key staff member. This significantly boosts E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) for Google News.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardContent>
                <h3 className="text-lg font-semibold">Newsroom & careers</h3>
                <p className="text-sm text-gray-700">We are always looking for talented reporters, editors, data journalists and multimedia producers. To apply or suggest a contributor, email <a href="mailto:newsroom@pkmedia.co.ke" className="text-primary">newsroom@pkmedia.co.ke</a> with your CV and relevant work samples.</p>
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
                      <p className="text-sm font-semibold">Contact Us</p>
                      <p className="text-xs text-gray-600 mt-1">General: contact@pkmedia.co.ke</p>
                      <p className="text-xs text-gray-600">Newsroom: newsroom@pkmedia.co.ke</p>
                      <p className="text-xs text-gray-600">Legal: legal@pkmedia.co.ke</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">Physical Address</p>
                      <p className="text-xs text-gray-600 mt-1">
                        PKMedia News Network<br />
                        Nairobi CBD<br />
                        Nairobi, Kenya
                      </p>
                      <p className="text-xs text-gray-500 mt-2">For specific office location inquiries, contact: <a href="mailto:contact@pkmedia.co.ke" className="text-primary">contact@pkmedia.co.ke</a></p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>

        <div className="max-w-4xl mx-auto mt-8">
          <Card>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Scale className="h-5 w-5 text-primary" />
                  Editorial Independence & Funding
                </h3>
                <p className="text-sm text-gray-700 mt-3">PKMedia maintains complete editorial independence from political and commercial interests. Our editorial team retains full control over reporting decisions, story selection, and newsroom operations.</p>
                
                <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4">
                  <h4 className="font-semibold text-sm mb-2">Revenue Model & Transparency</h4>
                  <p className="text-sm text-gray-700 mb-2">Our operations are funded through:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2">
                    <li><strong>Subscriptions:</strong> Reader support through premium memberships</li>
                    <li><strong>Advertising:</strong> Clearly disclosed on article pages with "Advertisement" labels</li>
                    <li><strong>Sponsored Content:</strong> Always labeled as "Sponsored" or "Paid Partnership"</li>
                    <li><strong>Public Interest Grants:</strong> Project-specific funding from verified organizations</li>
                  </ul>
                  <p className="text-sm text-gray-700 mt-3">
                    <strong>Current Grant Funders:</strong> A complete list of organizations funding specific projects is maintained on our <a href="/funders" className="text-primary font-medium underline">Project Funders Page</a>.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold">Corrections & Complaints</h3>
                <p className="text-sm text-gray-700 mt-2">To file a complaint or request a correction, contact <a href="mailto:corrections@pkmedia.co.ke" className="text-primary font-medium">corrections@pkmedia.co.ke</a>. We will acknowledge receipt within 24 hours and respond within a reasonable timeframe. For legal or data protection matters, contact <a href="mailto:legal@pkmedia.co.ke" className="text-primary font-medium">legal@pkmedia.co.ke</a>.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </main>
      <Footer />
    </>
  );
}
