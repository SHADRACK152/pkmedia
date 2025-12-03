import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const CONTACT_EMAIL = "contact@pkmedia.co.ke";
  const NEWSROOM_EMAIL = "newsroom@pkmedia.co.ke";
  const ADDRESS = "Nairobi, Kenya";

  async function handleSubscribe(e: any) {
    e.preventDefault();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast({ title: "Please enter a valid email address" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        // fallback to localStorage if endpoint not available
        const existing = JSON.parse(localStorage.getItem("pk_newsletter") || "[]");
        existing.push({ email, date: new Date().toISOString() });
        localStorage.setItem("pk_newsletter", JSON.stringify(existing));
        toast({ title: "Saved locally", description: "Newsletter subscription saved locally." });
      } else {
        toast({ title: "Subscribed", description: "Thanks — we added you to our newsletter." });
      }
      setEmail("");
    } catch (err: any) {
      const existing = JSON.parse(localStorage.getItem("pk_newsletter") || "[]");
      existing.push({ email, date: new Date().toISOString() });
      localStorage.setItem("pk_newsletter", JSON.stringify(existing));
      toast({ title: "Saved locally", description: "Unable to reach server; subscription saved locally." });
    } finally {
      setLoading(false);
    }
  }

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "name": "PKMedia",
    "url": typeof window !== 'undefined' ? window.location.origin : "https://pkmedia.co.ke",
    "logo": typeof window !== 'undefined' ? `${window.location.origin}/pklogo.png` : "/pklogo.png",
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "email": CONTACT_EMAIL,
        "areaServed": "KE"
      }
    ],
    "sameAs": [
      "https://facebook.com/pkmedia",
      "https://twitter.com/pkmedia",
      "https://instagram.com/pkmedia",
      "https://youtube.com/@pkmedia"
    ]
  };

  return (
    <footer className="bg-slate-900 text-slate-300 mt-20">
      <script type="application/ld+json">{JSON.stringify(orgJsonLd)}</script>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand / Contact */}
          <div className="space-y-4">
             <div className="flex items-center gap-2">
                <div className="bg-white text-primary p-1 rounded-sm">
                  <span className="font-serif font-bold text-xl tracking-tighter">PK</span>
                </div>
                <span className="font-serif font-bold text-xl text-white">
                  PK<span className="text-red-500">Media</span>
                </span>
            </div>
            <p className="text-sm text-slate-400 max-w-xs">
              Accurate news across Kenya, Africa and the world — independent reporting, verified sources, and local insights.
            </p>

            <div className="text-sm text-slate-400 space-y-2 mt-4">
              <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white">{CONTACT_EMAIL}</a></div>
              <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> <a href={`mailto:${NEWSROOM_EMAIL}`} className="hover:text-white">{NEWSROOM_EMAIL}</a></div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> <span>{ADDRESS}</span></div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-serif font-bold mb-4">Sections</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/category/politics" className="hover:text-white transition-colors">Politics</Link></li>
              <li><Link href="/category/business" className="hover:text-white transition-colors">Business</Link></li>
              <li><Link href="/category/tech" className="hover:text-white transition-colors">Technology</Link></li>
              <li><Link href="/category/sports" className="hover:text-white transition-colors">Sports</Link></li>
            </ul>
          </div>

          {/* Company / Legal */}
          <div>
            <h4 className="text-white font-serif font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div>
            <h4 className="text-white font-serif font-bold mb-4">Stay Connected</h4>
            <p className="text-sm text-slate-400 mb-4">Get the day's top stories delivered to your inbox.</p>
            <form onSubmit={handleSubscribe} className="flex gap-2 mb-4">
              <input aria-label="Email address" type="email" placeholder="you@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 p-2 rounded-md text-black" />
              <button type="submit" className="bg-primary text-white px-3 rounded-md" disabled={loading}>{loading ? '...' : 'Subscribe'}</button>
            </form>

            <div className="flex gap-4 mb-6">
              <a href="https://facebook.com/pkmedia" aria-label="PKMedia on Facebook" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="https://twitter.com/pkmedia" aria-label="PKMedia on X (Twitter)" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="https://instagram.com/pkmedia" aria-label="PKMedia on Instagram" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="https://youtube.com/@pkmedia" aria-label="PKMedia on YouTube" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Youtube className="h-5 w-5" /></a>
            </div>

            <div className="flex items-center gap-2">
              <img src="/pklogo.png" alt="PKMedia logo" className="w-6 h-6 object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              <p className="text-xs text-slate-500">© {currentYear} PKMedia. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-600">
        Accurate news across Kenya, Africa and the world.
      </div>
    </footer>
  );
}
