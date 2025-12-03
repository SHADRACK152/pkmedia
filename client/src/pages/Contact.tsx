import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Users, Megaphone } from "lucide-react";
import { useState } from "react";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<null | string>(null);

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (!res.ok) throw new Error("server error");

      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      // fallback: open user's mail client if server endpoint missing or fails
      try {
        const mailto = `mailto:contact@pkmedia.co.ke?subject=${encodeURIComponent(
          `Contact from ${email || "visitor"}`
        )}&body=${encodeURIComponent(`Name: ${name}\n\n${message}`)}`;
        window.location.href = mailto;
        setStatus("mailto");
      } catch (_) {
        // final fallback: store message locally
        const fallback = { name, email, message, date: new Date().toISOString() };
        const saved = JSON.parse(localStorage.getItem("pk_contact_fallback") || "[]");
        saved.push(fallback);
        localStorage.setItem("pk_contact_fallback", JSON.stringify(saved));
        setStatus("saved");
      }
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <header className="max-w-3xl mx-auto text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white p-4 rounded-md shadow-sm">
            <Mail className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Contact PKMedia</h1>
              <p className="text-sm text-slate-500 mt-1">We welcome tips, press enquiries, corrections and career enquiries.</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2">
            <Card>
              <CardContent>
                <h2 className="text-lg font-semibold">Get in touch</h2>
                <p className="text-sm text-gray-700 mt-2">Use the form below for general enquiries, news tips or to reach our editorial team. For press enquiries, see the dedicated contact details to the right.</p>

                <form className="mt-4 space-y-4" onSubmit={submitForm} aria-label="Contact form">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Your name</label>
                    <input
                      className="mt-1 block w-full rounded-md border-gray-200 bg-white shadow-sm p-2"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      aria-required="true"
                      placeholder="Full name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      className="mt-1 block w-full rounded-md border-gray-200 bg-white shadow-sm p-2"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      aria-required="true"
                      placeholder="you@domain.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700">Message</label>
                    <textarea
                      className="mt-1 block w-full rounded-md border-gray-200 bg-white shadow-sm p-2"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={6}
                      required
                      aria-required="true"
                      placeholder="Write your message, tip, or enquiry"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md"
                      aria-label="Send message"
                      disabled={status === "sending"}
                    >
                      {status === "sending" ? "Sending..." : "Send message"}
                    </button>

                    {status === "sent" && <span className="text-sm text-green-600">Message sent — thank you.</span>}
                    {status === "mailto" && <span className="text-sm text-slate-600">Opened mail client to send message.</span>}
                    {status === "saved" && <span className="text-sm text-orange-600">Saved locally — server unavailable.</span>}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardContent>
                <h3 className="text-lg font-semibold">Corrections and complaints</h3>
                <p className="text-sm text-gray-700 mt-2">If you believe we have published inaccurate information, email <a className="text-primary" href="mailto:contact@pkmedia.co.ke">contact@pkmedia.co.ke</a> with links and supporting documents. We will acknowledge and investigate reported issues.</p>
              </CardContent>
            </Card>
          </section>

          <aside>
            <div className="space-y-4">
              <Card>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <Megaphone className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <p className="text-sm font-semibold">Newsroom</p>
                      <p className="text-xs text-gray-600">Email: <a className="text-primary" href="mailto:newsroom@pkmedia.co.ke">newsroom@pkmedia.co.ke</a></p>
                      <p className="text-xs text-gray-600">Phone: <a className="text-primary" href="tel:+254700000000">+254 700 000 000</a></p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <Phone className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <p className="text-sm font-semibold">General enquiries</p>
                      <p className="text-xs text-gray-600">Email: <a className="text-primary" href="mailto:contact@pkmedia.co.ke">contact@pkmedia.co.ke</a></p>
                      <p className="text-xs text-gray-600">Phone: <a className="text-primary" href="tel:+254700000001">+254 700 000 001</a></p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <p className="text-sm font-semibold">Office</p>
                      <p className="text-xs text-gray-600">PKMedia, 3rd Floor, Nairobi Business Centre, Nairobi, Kenya</p>
                      <p className="text-xs text-gray-600">PO Box 12345 — Nairobi</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <div className="text-xs text-gray-600">
                    <p className="font-semibold">Press enquiries</p>
                    <p>Email: <a className="text-primary" href="mailto:press@pkmedia.co.ke">press@pkmedia.co.ke</a></p>
                    <p className="mt-2">For partnership, licensing or syndication enquiries, contact <a className="text-primary" href="mailto:partnerships@pkmedia.co.ke">partnerships@pkmedia.co.ke</a>.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
