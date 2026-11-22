import { Link, useLocation } from "wouter";
import { Menu, Search, User, X, MessageCircle, Clock, TrendingUp, Archive } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { Category, Article } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import NotificationSubscribe from "@/components/ui/notification-subscribe";
import { getArticleImageSources } from "@/lib/article-images";

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
  const goToArticle = async (articleId: string) => {
    saveSearch(searchQuery);
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    
    // Fetch short link and navigate
    try {
      const response = await fetch(`/api/articles/${articleId}/short-link`);
      const data = await response.json();
      setLocation(`/s/${data.code}`);
    } catch (error) {
      // Fallback to article ID if short link fails
      setLocation(`/article/${articleId}`);
    }
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Sports", href: "/sports" },
    ...categories
      .filter((category) => category.name.toLowerCase() !== "sports")
      .slice(0, 5)
      .map(category => ({ name: category.name, href: `/category/${category.name}` }))
  ];
  const isActive = (href: string) =>
    href === "/" ? location === "/" : location === href || location.startsWith(`${href}/`);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 xl:px-8">
        <div className="flex h-[68px] items-center justify-between gap-3 sm:h-[76px]">
          <Link
            href="/"
            onClick={() => {
              closeMobileMenu();
              setIsSearchOpen(false);
            }}
            className="flex shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <img
              src="/pklogo.png"
              alt="PKMedia home"
              className="h-9 w-auto object-contain sm:h-11"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          </Link>

          <nav aria-label="Main navigation" className="hidden min-w-0 flex-1 items-center justify-center gap-0 lg:flex">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`whitespace-nowrap rounded-full px-2 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-blue-50 text-primary"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <NotificationSubscribe compact />
            <Button
              variant="ghost"
              size="icon"
              aria-label={isSearchOpen ? "Close search" : "Open search"}
              aria-expanded={isSearchOpen}
              title={isSearchOpen ? "Close search" : "Search"}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            >
              <Search className="h-5 w-5" />
            </Button>

            <Link
              href="/chat"
              aria-label="Open chat"
              title="Chat"
              className="hidden h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 lg:flex"
            >
              <MessageCircle className="h-5 w-5" />
            </Link>

            {!user && (
              <div className="hidden items-center gap-2 lg:flex">
                <Link
                  href="/login"
                  className="rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                >
                  Register
                </Link>
              </div>
            )}

            {user && (
              <div className="hidden items-center gap-1 lg:flex">
                <Link
                  href="/settings"
                  aria-label="Account settings"
                  title="Account settings"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
                >
                  <User className="h-5 w-5" />
                </Link>
                {(user as any).role === 'admin' && (
                  <Link
                    href="/admin/dashboard"
                    aria-label="Admin dashboard"
                    title="Admin dashboard"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
                  >
                    <TrendingUp className="h-5 w-5" />
                  </Link>
                )}
              </div>
            )}

            <div className="lg:hidden">
              <Sheet
                open={isMobileMenuOpen}
                onOpenChange={(open) => {
                  setIsMobileMenuOpen(open);
                  if (open) setIsSearchOpen(false);
                }}
              >
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Open navigation menu"
                    aria-expanded={isMobileMenuOpen}
                    className="rounded-full text-slate-700 hover:bg-slate-100"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex w-[88vw] max-w-sm flex-col gap-0 border-slate-200 bg-white p-0">
                  <SheetHeader className="border-b border-slate-100 px-5 py-5 pr-14 text-left">
                    <Link href="/" onClick={closeMobileMenu} className="inline-flex w-fit rounded-md">
                      <img src="/pklogo.png" alt="PKMedia home" className="h-10 w-auto object-contain" />
                    </Link>
                    <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                    <SheetDescription className="sr-only">Browse PKMedia sections and account links.</SheetDescription>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto px-4 py-5">
                    <p className="mb-2 px-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Sections</p>
                    <nav aria-label="Mobile navigation" className="space-y-1">
                      {navLinks.map((link) => {
                        const active = isActive(link.href);
                        return (
                          <Link
                            key={link.name}
                            href={link.href}
                            onClick={closeMobileMenu}
                            aria-current={active ? "page" : undefined}
                            className={`flex items-center rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
                              active
                                ? "bg-blue-50 text-primary"
                                : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                            }`}
                          >
                            {link.name}
                          </Link>
                        );
                      })}
                    </nav>

                    <div className="mt-6 border-t border-slate-100 pt-5">
                      <p className="mb-2 px-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">More</p>
                      <Link
                        href="/archive"
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <Archive className="h-4 w-4 text-slate-400" />
                        News archive
                      </Link>
                      <Link
                        href="/chat"
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <MessageCircle className="h-4 w-4 text-slate-400" />
                        Chat
                      </Link>
                      {user ? (
                        <>
                          <Link
                            href="/settings"
                            onClick={closeMobileMenu}
                            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                          >
                            <User className="h-4 w-4 text-slate-400" />
                            Account settings
                          </Link>
                          {(user as any).role === 'admin' && (
                            <Link
                              href="/admin/dashboard"
                              onClick={closeMobileMenu}
                              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                            >
                              <TrendingUp className="h-4 w-4 text-slate-400" />
                              Admin dashboard
                            </Link>
                          )}
                        </>
                      ) : (
                        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
                          <Link
                            href="/login"
                            onClick={closeMobileMenu}
                            className="rounded-xl border border-slate-200 px-3 py-2.5 text-center text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                          >
                            Log in
                          </Link>
                          <Link
                            href="/register"
                            onClick={closeMobileMenu}
                            className="rounded-xl bg-primary px-3 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                          >
                            Register
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 text-xs text-slate-500">
                    Accurate news across Kenya, Africa and the world.
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {isSearchOpen && (
        <div className="animate-in slide-in-from-top-2 border-t border-slate-100 bg-white shadow-xl">
          <div className="mx-auto max-w-3xl px-4 py-4 sm:p-6">
            <div className="mb-4 flex gap-2 sm:gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search articles by title, content, or category..." 
                  aria-label="Search articles"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-base outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
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
                aria-label="Close search"
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
                        onClick={() => goToArticle(article.id)}
                        className="p-4 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border border-slate-100 group"
                      >
                        <div className="flex gap-3">
                          {article.image && (
                            <img
                              {...getArticleImageSources(article.image)}
                              alt={article.title}
                              sizes="80px"
                              loading="lazy"
                              decoding="async"
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
