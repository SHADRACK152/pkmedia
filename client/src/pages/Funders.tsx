import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Calendar, DollarSign } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function Funders() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-3">Project Funders & Grants</h1>
            <p className="text-gray-600">
              In the interest of transparency, this page lists all organizations that provide grant funding 
              for specific PKMedia projects. Grant funding supports public interest reporting but does not 
              influence editorial decisions.
            </p>
          </header>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
            <h2 className="font-bold text-lg mb-2">Editorial Independence</h2>
            <p className="text-sm text-gray-700">
              PKMedia maintains complete editorial independence. No external funder has control over our 
              story selection, reporting, or publication decisions. Our editorial team retains final 
              authority over all content.
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Current Funding Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 border-l-4 border-green-500 p-6">
                  <h3 className="font-bold text-lg mb-3">Independent Operations</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    <strong>PKMedia currently operates without grant funding from external organizations.</strong>
                  </p>
                  <p className="text-sm text-gray-700 mb-3">
                    Our operations are funded through:
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-2 ml-4">
                    <li><strong>Reader Subscriptions:</strong> Premium memberships and supporter contributions</li>
                    <li><strong>Advertising Revenue:</strong> Display advertising clearly labeled on article pages</li>
                    <li><strong>Sponsored Content:</strong> Branded content clearly marked as "Sponsored" or "Paid Partnership"</li>
                  </ul>
                  <p className="text-sm text-gray-700 mt-4">
                    This funding model ensures our editorial independence and allows us to serve our readers 
                    without influence from external grant funders.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Our Funding Principles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Editorial Independence First</h4>
                      <p className="text-sm text-gray-600">
                        If we accept grants in the future, all funders must agree in writing that they have no editorial control
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Full Transparency</h4>
                      <p className="text-sm text-gray-600">
                        All funding sources will be disclosed on this page with project details
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Conflict Review</h4>
                      <p className="text-sm text-gray-600">
                        Our editorial board reviews potential funders for conflicts of interest
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Reader-First Approach</h4>
                      <p className="text-sm text-gray-600">
                        Our primary accountability is to our readers and the public interest
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <h3 className="font-bold mb-2">Future Updates</h3>
              <p className="text-sm text-gray-700">
                This page will be updated if PKMedia receives grant funding for specific journalism projects. 
                Any such grants will be listed here with complete transparency including funder names, 
                project descriptions, amounts, and timelines.
              </p>
            </div>
          </div>

          <div className="mt-12 text-sm text-gray-600 text-center">
            <p className="mb-2"><strong>Last Updated:</strong> December 2025</p>
            <p>For questions about our funding or to report concerns, contact <a href="mailto:legal@pkmedia.co.ke" className="text-primary font-medium">legal@pkmedia.co.ke</a></p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
