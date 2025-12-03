import { Link, useLocation } from "wouter";
import { Menu, Search, User, X, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";

export default function Navbar() {
  const [location] = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  useEffect(() => {
    let mounted = true;
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => {
        if (!mounted) return;
        if (!r.ok) return setUser(null);
        return r.json();
      })
      .then((data) => {
        if (data && data.user) setUser(data.user);
      })
      .catch(() => {
        if (mounted) setUser(null);
      });

    return () => { mounted = false; };
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    ...categories.slice(0, 5).map(c => ({ name: c.name, href: `/category/${c.name}` }))
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-nav">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link key={link.name} href={link.href} className={`text-lg font-medium ${location === link.href ? 'text-primary' : 'text-foreground'}`}>
                      {link.name}
                  </Link>
                ))}
                {/* Admin login link intentionally hidden from regular users. Admins navigate to /admin/login directly when needed. */}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo (uses /pklogo.png if available in client/public) */}
            <Link href="/" className="flex items-center gap-2">
            <img src="/pklogo.png" alt="PKMedia logo" className="h-8 w-auto rounded-sm" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
            <span className="font-serif font-bold text-xl hidden sm:block text-accent-blue-dark">
              PK<span className="text-accent-blue">Media</span>
            </span>
          </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
                {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className={`text-sm font-semibold uppercase tracking-wide hover:text-primary transition-colors ${location === link.href ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(!isSearchOpen)}>
            <Search className="h-5 w-5" />
          </Button>
          <Link href="/chat">
            <Button variant="ghost" size="icon" title="Chat">
              <MessageCircle className="h-5 w-5" />
            </Button>
          </Link>
          {/* Chat floating button is rendered globally in App - removed from Navbar */}
            {!user && (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="hidden sm:inline">Login</Button>
                </Link>
                <Link href="/register">
                  <Button variant="ghost" size="sm" className="hidden sm:inline">Register</Button>
                </Link>
              </>
            )}

            {user && (
              <>
                <Link href="/settings">
                  <Button variant="ghost" size="sm" className="hidden sm:inline">Settings</Button>
                </Link>
                {/* Show Admin Dashboard link only for admin users */}
                {(user as any).role === 'admin' && (
                  <Link href="/admin/dashboard">
                    <Button variant="ghost" size="icon" title="Admin Dashboard">
                      <User className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
              </>
            )}
        </div>
      </div>
      
      {/* Search Bar Expand */}
      {isSearchOpen && (
        <div className="border-t p-4 bg-white animate-in slide-in-from-top-2">
          <div className="container mx-auto max-w-2xl flex gap-2">
            <input 
              type="text" 
              placeholder="Search news..." 
              className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <Button onClick={() => setIsSearchOpen(false)}>Search</Button>
          </div>
        </div>
      )}
    </header>
  );
}
