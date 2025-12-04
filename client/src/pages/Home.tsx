import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import AdBanner from "@/components/layout/AdBanner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BreakingNewsTicker from "@/components/layout/Ticker";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { Article, Category } from "@shared/schema";
import ArticleCard from "@/components/news/ArticleCard";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    setVisibleCount(6);
  }, [activeCategory]);

  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: ['/api/articles'],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const featuredArticle = articles.find(a => a.featured) || articles[0];
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <BreakingNewsTicker />
      <Navbar />
      
      {/* Header Ad */}
      <div className="container mx-auto px-4 mt-4">
        <AdBanner location="header" format="horizontal" className="h-24" />
      </div>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        
        {/* Hero Section - Magazine Style */}
        {activeCategory === "All" && featuredArticle && (
          <section className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <ArticleCard article={featuredArticle} variant="hero" />
              </div>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Content Column */}
          <div className="lg:col-span-8">
            
            {/* Category Filter */}
            <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-slate-900">
               <div className="flex overflow-x-auto pb-2 gap-3 no-scrollbar">
                <Button 
                  variant={activeCategory === "All" ? "default" : "ghost"}
                  onClick={() => setActiveCategory("All")}
                  className={`rounded-full text-sm font-medium transition-all ${activeCategory === "All" ? 'shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                  size="sm"
                >
                  All
                </Button>
                {categories.map(cat => (
                    <Button 
                    key={cat.id} 
                    variant={activeCategory === cat.name ? "default" : "ghost"}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`rounded-full text-sm font-medium transition-all ${activeCategory === cat.name ? 'shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                    size="sm"
                    >
                    {cat.name}
                    </Button>
                ))}
               </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-serif font-black text-slate-900 flex items-center gap-3">
                <span className="w-1 h-8 bg-primary"></span>
                {activeCategory === "All" ? "Latest Stories" : activeCategory}
              </h2>
              <Link href="/archive">
                 <Button variant="ghost" className="text-primary hover:text-primary/80 hidden sm:flex">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                 </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {gridArticles.slice(0, visibleCount).map((article, idx) => (
                <div key={article.id} className="animate-in fade-in duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                    <ArticleCard article={article} />
                </div>
              ))}
            </div>
            
            {gridArticles.length === 0 && (
              <div className="py-24 text-center bg-white rounded-xl border border-dashed">
                <p className="text-muted-foreground">No articles found in this category.</p>
                <Button variant="link" onClick={() => setActiveCategory("All")}>View all news</Button>
              </div>
            )}

            {visibleCount < gridArticles.length && (
              <div className="mt-12 text-center">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="rounded-full px-8"
                    onClick={() => setVisibleCount(prev => prev + 6)}
                  >
                      Load More Articles
                  </Button>
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <aside className="lg:col-span-4 space-y-8">
            
            {/* Latest News Widget */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden sticky top-24">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Latest Updates
                </h3>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">Live</span>
              </div>
              <div className="p-2">
                {latestNews.map(article => (
                  <ArticleCard key={article.id} article={article} variant="compact" />
                ))}
              </div>
              <div className="p-3 border-t border-slate-50 text-center">
                  <Link href="/archive" className="text-xs font-bold text-primary hover:underline uppercase tracking-wide">See All Updates</Link>
              </div>
            </div>

            {/* Newsletter */}
            <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-8 text-center shadow-xl">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary rounded-full opacity-20 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-blue-500 rounded-full opacity-20 blur-2xl"></div>
              
              <h3 className="text-2xl font-serif font-bold mb-3 relative z-10">The Morning Brief</h3>
              <p className="text-slate-300 mb-6 relative z-10 text-sm leading-relaxed">
                Start your day with the most important stories from PKMedia.
              </p>
              
              <div className="relative z-10 space-y-3">
                <input 
                    type="email" 
                    placeholder="Your email address" 
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary text-sm backdrop-blur-sm" 
                />
                <Button className="w-full bg-primary hover:bg-primary/90 font-bold py-6 shadow-lg shadow-primary/25">
                    Subscribe Free
                </Button>
                <p className="text-[10px] text-slate-500 mt-2">
                    Unsubscribe at any time. No spam.
                </p>
              </div>
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
    </div>
  );
}
