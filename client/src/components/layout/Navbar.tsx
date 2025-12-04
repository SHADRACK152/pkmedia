import { Link, useLocation } from "wouter";
import { Menu, Search, User, X, MessageCircle, Clock, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { Category, Article } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { createArticleSlug } from "@/lib/utils";

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: ['/api/articles'],
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

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Handle search
  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const filtered = articles.filter(article => 
      article.title.toLowerCase().includes(query.toLowerCase()) ||
      article.content?.toLowerCase().includes(query.toLowerCase()) ||
      article.category?.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(filtered);
  };

  // Save search query
  const saveSearch = (query: string) => {
    if (!query.trim()) return;
    
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleSearch(query);
  };

  // Navigate to article
  const goToArticle = (article: Article) => {
    const slug = createArticleSlug(article.title, article.id);
    saveSearch(searchQuery);
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    setLocation(`/article/${slug}`);
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

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
        <div className="border-t bg-white shadow-lg animate-in slide-in-from-top-2">
          <div className="container mx-auto max-w-3xl p-6">
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search articles by title, content, or category..." 
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                  autoFocus
                />
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="rounded-xl"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Search Results */}
            {searchQuery && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-slate-700">
                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {searchResults.length > 0 ? (
                    searchResults.map(article => (
                      <div
                        key={article.id}
                        onClick={() => goToArticle(article)}
                        className="p-4 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border border-slate-100 group"
                      >
                        <div className="flex gap-3">
                          {article.image && (
                            <img 
                              src={article.image} 
                              alt={article.title}
                              className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                              {article.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Badge variant="secondary" className="text-xs">
                                {article.category}
                              </Badge>
                              <span>•</span>
                              <span>{article.author}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Search className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No articles found matching "{searchQuery}"</p>
                      <p className="text-sm text-slate-400 mt-1">Try different keywords</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {!searchQuery && recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Recent Searches
                  </h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearRecentSearches}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    Clear
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => {
                        setSearchQuery(search);
                        handleSearch(search);
                      }}
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Categories */}
            {!searchQuery && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Browse by Category
                </h4>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 8).map(cat => (
                    <Badge
                      key={cat.id}
                      className="cursor-pointer hover:bg-primary/90 transition-colors"
                      onClick={() => {
                        setIsSearchOpen(false);
                        setLocation(`/category/${cat.name}`);
                      }}
                    >
                      {cat.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
