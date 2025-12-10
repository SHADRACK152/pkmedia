import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import AdBanner from "@/components/layout/AdBanner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BreakingNewsTicker from "@/components/layout/Ticker";
import ShortNewsFeed from "@/components/news/ShortNewsFeed";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, TrendingUp, FileText, Search } from "lucide-react";
import { Link } from "wouter";
import { Article, Category } from "@shared/schema";
import ArticleCard from "@/components/news/ArticleCard";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import SearchComponent from "@/components/SearchComponent";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(6);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setVisibleCount(6);
  }, [activeCategory]);

  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: ['/api/articles'],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Always show the most recent article in hero section
  const featuredArticle = [...articles].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  })[0];

  const filteredArticles = activeCategory === "All" 
    ? articles 
    : articles.filter(a => a.category?.toLowerCase() === activeCategory.toLowerCase());

  // Show all articles in the grid, even if featured
  const gridArticles = filteredArticles;

  // Latest news (just taking the last 4 for the sidebar)
  const latestNews = [...articles].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
  }).slice(0, 5);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubscribing(true);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail }),
      });

      if (!response.ok) {
        throw new Error("Failed to subscribe");
      }

      toast({
        title: "Successfully subscribed!",
        description: "You'll receive The Morning Brief every day",
      });

      setNewsletterEmail("");
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col font-sans">
      <SEO />
      <BreakingNewsTicker />
      <Navbar />
      
      {/* Header Ad */}
      <div className="container mx-auto px-4 mt-6">
        <AdBanner location="header" format="horizontal" className="h-24" />
      </div>
      
      <main className="flex-1 container mx-auto px-4 py-10">
        
        {/* Hidden H1 for SEO */}
        <h1 className="sr-only">PKMedia - Kenya and Worldwide News | Breaking News & Current Affairs</h1>
        
        {/* Hero Section - Magazine Style */}
        {activeCategory === "All" && featuredArticle && (
          <section className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
              <div className="relative">
                <ArticleCard article={featuredArticle} variant="hero" />
              </div>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Content Column */}
          <div className="lg:col-span-8">
            
            {/* Category Filter */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-slate-900/10">
               <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
                <Button 
                  variant={activeCategory === "All" ? "default" : "ghost"}
                  onClick={() => setActiveCategory("All")}
                  className={`rounded-full text-sm font-semibold transition-all ${activeCategory === "All" ? 'shadow-lg shadow-primary/20' : 'text-slate-600 hover:bg-slate-100'}`}
                  size="sm"
                >
                  All
                </Button>
                {categories.map(cat => (
                    <Button 
                    key={cat.id} 
                    variant={activeCategory === cat.name ? "default" : "ghost"}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`rounded-full text-sm font-semibold transition-all whitespace-nowrap ${activeCategory === cat.name ? 'shadow-lg shadow-primary/20' : 'text-slate-600 hover:bg-slate-100'}`}
                    size="sm"
                    >
                    {cat.name}
                    </Button>
                ))}
               </div>
            </div>

            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl md:text-4xl font-serif font-black text-slate-900 flex items-center gap-3">
                <span className="w-1.5 h-10 bg-gradient-to-b from-primary to-primary/50 rounded-full"></span>
                {activeCategory === "All" ? "Latest Stories" : activeCategory}
              </h2>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Search
                </Button>
                <Link href="/archive">
                   <Button variant="ghost" className="text-primary hover:text-primary/80 font-semibold hidden sm:flex items-center gap-1 group">
                      View All 
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                   </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {gridArticles.slice(0, visibleCount).map((article, idx) => (
                <div key={article.id} className="animate-in fade-in duration-500 hover:scale-[1.02] transition-transform" style={{ animationDelay: `${idx * 50}ms` }}>
                    <ArticleCard article={article} />
                </div>
              ))}
            </div>
            
            {gridArticles.length === 0 && (
              <div className="py-32 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No Articles Found</h3>
                  <p className="text-muted-foreground mb-6">We couldn't find any articles in this category.</p>
                  <Button variant="default" onClick={() => setActiveCategory("All")} className="rounded-full">
                    View All News
                  </Button>
                </div>
              </div>
            )}

            {visibleCount < gridArticles.length && (
              <div className="mt-16 text-center">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="rounded-full px-10 py-6 text-base font-semibold shadow-sm hover:shadow-md transition-all"
                    onClick={() => setVisibleCount(prev => prev + 6)}
                  >
                      Load More Articles
                      <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <aside className="lg:col-span-4 space-y-8">
            
            {/* Short News Feed */}
            <ShortNewsFeed />
            
            {/* Latest News Widget */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden sticky top-24 hover:shadow-xl transition-shadow">
              <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Latest Updates
                </h3>
                <span className="text-xs font-bold text-white bg-red-500 px-3 py-1 rounded-full animate-pulse shadow-lg shadow-red-500/30">LIVE</span>
              </div>
              <div className="p-3">
                {latestNews.map(article => (
                  <ArticleCard key={article.id} article={article} variant="compact" />
                ))}
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-center">
                  <Link href="/archive" className="text-sm font-bold text-primary hover:text-primary/80 hover:underline uppercase tracking-wide transition-colors">View All Updates →</Link>
              </div>
            </div>

            {/* Newsletter */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-10 text-center shadow-2xl">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-primary rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
              
              <h3 className="text-2xl md:text-3xl font-serif font-bold mb-4 relative z-10">📰 The Morning Brief</h3>
              <p className="text-slate-300 mb-8 relative z-10 text-sm leading-relaxed max-w-sm mx-auto">
                Start your day with the most important stories from PKMedia.
              </p>
              
              <form onSubmit={handleNewsletterSubmit} className="relative z-10 space-y-4">
                <input 
                    type="email" 
                    placeholder="Your email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    disabled={isSubscribing}
                    className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm backdrop-blur-sm transition-all" 
                />
                <Button 
                  type="submit"
                  disabled={isSubscribing}
                  className="w-full bg-primary hover:bg-primary/90 font-bold py-6 shadow-xl shadow-primary/30 rounded-xl text-base"
                >
                    {isSubscribing ? "Subscribing..." : "Subscribe Free →"}
                </Button>
                <p className="text-[11px] text-slate-400 mt-3">
                    ✓ Unsubscribe anytime · No spam · Privacy protected
                </p>
              </form>
            </div>
            
            {/* Ad Space / Promo */}
            <AdBanner location="sidebar" />

          </aside>
        </div>
      </main>
      
      {/* Footer Ad */}
      <div className="container mx-auto px-4 mb-8">
        <AdBanner location="footer" format="horizontal" className="h-24" />
      </div>
      
      <Footer />
      
      <SearchComponent 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </div>
  );
}
