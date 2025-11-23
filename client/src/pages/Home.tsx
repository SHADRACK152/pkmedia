import { useState } from "react";
import { CATEGORIES, MOCK_ARTICLES } from "@/lib/mockData";
import ArticleCard from "@/components/news/ArticleCard";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BreakingNewsTicker from "@/components/layout/Ticker";
import { Button } from "@/components/ui/button";

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
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <BreakingNewsTicker />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        
        {/* Featured Section */}
        {activeCategory === "All" && (
          <section className="mb-12">
            <ArticleCard article={featuredArticle} variant="featured" />
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Content Column */}
          <div className="lg:col-span-8">
            
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b">
              {CATEGORIES.map(cat => (
                <Button 
                  key={cat} 
                  variant={activeCategory === cat ? "default" : "outline"}
                  onClick={() => setActiveCategory(cat)}
                  className="rounded-full text-sm"
                  size="sm"
                >
                  {cat}
                </Button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold border-l-4 border-primary pl-3">
                {activeCategory === "All" ? "Top Stories" : `${activeCategory} News`}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {gridArticles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
            
            {gridArticles.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                No articles found in this category.
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <aside className="lg:col-span-4 space-y-8">
            
            {/* Latest News Widget */}
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-serif font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                Latest Updates
              </h3>
              <div className="space-y-2">
                {latestNews.map(article => (
                  <ArticleCard key={article.id} article={article} variant="compact" />
                ))}
              </div>
            </div>

            {/* Ad Placeholder / Newsletter */}
            <div className="bg-primary/5 rounded-xl p-6 border border-primary/10 text-center">
              <h3 className="text-lg font-serif font-bold text-primary mb-2">Subscribe to Newsletter</h3>
              <p className="text-sm text-muted-foreground mb-4">Get the latest news delivered to your inbox daily.</p>
              <input type="email" placeholder="Your email address" className="w-full p-2 text-sm border rounded mb-2" />
              <Button className="w-full">Subscribe</Button>
            </div>

          </aside>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
