import { useState } from "react";
import { CATEGORIES, MOCK_ARTICLES } from "@/lib/mockData";
import ArticleCard from "@/components/news/ArticleCard";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BreakingNewsTicker from "@/components/layout/Ticker";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");

  const featuredArticle = MOCK_ARTICLES.find(a => a.featured) || MOCK_ARTICLES[0];
  const filteredArticles = activeCategory === "All" 
    ? MOCK_ARTICLES 
    : MOCK_ARTICLES.filter(a => a.category === activeCategory);

  // Filter out the featured one from the main grid to avoid duplication if viewing "All"
  const gridArticles = filteredArticles.filter(a => a.id !== featuredArticle.id);

  // Latest news (just taking the last 4 for the sidebar)
  const latestNews = [...MOCK_ARTICLES].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <BreakingNewsTicker />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        
        {/* Hero Section */}
        {activeCategory === "All" && (
          <section className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <ArticleCard article={featuredArticle} variant="hero" />
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Content Column */}
          <div className="lg:col-span-8">
            
            {/* Category Filter */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
               <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
                {CATEGORIES.map(cat => (
                    <Button 
                    key={cat} 
                    variant={activeCategory === cat ? "default" : "ghost"}
                    onClick={() => setActiveCategory(cat)}
                    className={`rounded-full text-sm font-medium transition-all ${activeCategory === cat ? 'shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                    size="sm"
                    >
                    {cat}
                    </Button>
                ))}
               </div>
            </div>

            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 flex items-center gap-3">
                <span className="w-1.5 h-8 bg-primary rounded-full"></span>
                {activeCategory === "All" ? "Top Stories" : `${activeCategory} News`}
              </h2>
              <Link href="/archive">
                 <Button variant="ghost" className="text-primary hover:text-primary/80 hidden sm:flex">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                 </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {gridArticles.map((article, idx) => (
                <div key={article.id} className="animate-in fade-in duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
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

            <div className="mt-12 text-center">
                 <Button variant="outline" size="lg" className="rounded-full px-8">
                    Load More Articles
                 </Button>
            </div>
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
                  <Link href="/latest">
                    <a className="text-xs font-bold text-primary hover:underline uppercase tracking-wide">See All Updates</a>
                  </Link>
              </div>
            </div>

            {/* Newsletter */}
            <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-8 text-center shadow-xl">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary rounded-full opacity-20 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-blue-500 rounded-full opacity-20 blur-2xl"></div>
              
              <h3 className="text-2xl font-serif font-bold mb-3 relative z-10">The Morning Brief</h3>
              <p className="text-slate-300 mb-6 relative z-10 text-sm leading-relaxed">
                Start your day with the most important stories from Mount Kenya and beyond.
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
            <div className="bg-slate-200 rounded-xl h-64 flex items-center justify-center text-slate-400 text-sm font-medium border-2 border-dashed border-slate-300">
                Advertisement Space
            </div>

          </aside>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
