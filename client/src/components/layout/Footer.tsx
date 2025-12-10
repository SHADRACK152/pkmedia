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
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error("Failed to subscribe");
      }
      
      toast({ title: "Subscribed!", description: "Thanks for subscribing to our newsletter." });
      setEmail("");
    } catch (err: any) {
      toast({ title: "Error", description: "Unable to subscribe. Please try again later.", variant: "destructive" });
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
      "https://www.facebook.com/TokeaTwende",
      "https://twitter.com/pkmedia",
      "https://instagram.com/pkmedia",
      "https://youtube.com/@pkmedia",
      "https://www.tiktok.com/@pk_mediake?_r=1&_t=ZM-9274EitwMjk"
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
              <a href="https://www.facebook.com/TokeaTwende" aria-label="PKMedia on Facebook" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="https://twitter.com/pkmedia" aria-label="PKMedia on X (Twitter)" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="https://instagram.com/pkmedia" aria-label="PKMedia on Instagram" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="https://youtube.com/@pkmedia" aria-label="PKMedia on YouTube" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Youtube className="h-5 w-5" /></a>
              <a href="https://www.tiktok.com/@pk_mediake?_r=1&_t=ZM-9274EitwMjk" aria-label="PKMedia on TikTok" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
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
