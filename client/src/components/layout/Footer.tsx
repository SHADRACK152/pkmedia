import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="space-y-4">
             <div className="flex items-center gap-2">
                <div className="bg-white text-primary p-1 rounded-sm">
                  <span className="font-serif font-bold text-xl tracking-tighter">MK</span>
                </div>
                <span className="font-serif font-bold text-xl text-white">
                  Mount Kenya <span className="text-red-500">News</span>
                </span>
            </div>
            <p className="text-sm text-slate-400 max-w-xs">
              Your trusted source for breaking news, comprehensive analysis, and in-depth reporting from the mountain region and beyond.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-serif font-bold mb-4">Sections</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/"><a className="hover:text-white transition-colors">Home</a></Link></li>
              <li><Link href="/category/politics"><a className="hover:text-white transition-colors">Politics</a></Link></li>
              <li><Link href="/category/business"><a className="hover:text-white transition-colors">Business</a></Link></li>
              <li><Link href="/category/tech"><a className="hover:text-white transition-colors">Technology</a></Link></li>
              <li><Link href="/category/sports"><a className="hover:text-white transition-colors">Sports</a></Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-serif font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-serif font-bold mb-4">Stay Connected</h4>
            <div className="flex gap-4 mb-6">
              <a href="#" className="hover:text-white transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><Youtube className="h-5 w-5" /></a>
            </div>
            <p className="text-xs text-slate-500">© 2025 Mount Kenya News. All rights reserved.</p>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-600">
        Designed for Speed and Accuracy.
      </div>
    </footer>
  );
}
