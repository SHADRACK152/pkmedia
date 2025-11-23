import { Link, useLocation } from "wouter";
import { Menu, Search, User, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Navbar() {
  const [location] = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Politics", href: "/category/politics" },
    { name: "Business", href: "/category/business" },
    { name: "Sports", href: "/category/sports" },
    { name: "Tech", href: "/category/tech" },
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
                  <Link key={link.name} href={link.href}>
                    <a className={`text-lg font-medium ${location === link.href ? 'text-primary' : 'text-foreground'}`}>
                      {link.name}
                    </a>
                  </Link>
                ))}
                <Link href="/admin/login">
                  <a className="text-lg font-medium text-muted-foreground mt-4">Admin Login</a>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <Link href="/">
          <a className="flex items-center gap-2">
            <div className="bg-primary text-white p-1 rounded-sm">
              <span className="font-serif font-bold text-xl tracking-tighter">MK</span>
            </div>
            <span className="font-serif font-bold text-xl hidden sm:block text-primary">
              Mount Kenya <span className="text-accent">News</span>
            </span>
          </a>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href}>
              <a className={`text-sm font-semibold uppercase tracking-wide hover:text-primary transition-colors ${location === link.href ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
                {link.name}
              </a>
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(!isSearchOpen)}>
            <Search className="h-5 w-5" />
          </Button>
          <Link href="/admin/login">
            <Button variant="ghost" size="icon" title="Admin Login">
              <User className="h-5 w-5" />
            </Button>
          </Link>
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
