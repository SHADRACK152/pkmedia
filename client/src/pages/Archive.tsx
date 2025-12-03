import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ArticleCard from "@/components/news/ArticleCard";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Article, Category } from "@shared/schema";

export default function Archive() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(12);

  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: ['/api/articles'],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || article.category?.toLowerCase() === activeCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-4">News Archive</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse through our complete collection of articles, news, and stories.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search articles..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar w-full md:w-auto">
            <Button 
              variant={activeCategory === "All" ? "default" : "outline"}
              onClick={() => setActiveCategory("All")}
              size="sm"
            >
              All
            </Button>
            {categories.map(cat => (
              <Button 
                key={cat.id} 
                variant={activeCategory === cat.name ? "default" : "outline"}
                onClick={() => setActiveCategory(cat.name)}
                size="sm"
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.slice(0, visibleCount).map((article, idx) => (
            <div key={article.id} className="animate-in fade-in duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                <ArticleCard article={article} />
            </div>
          ))}
        </div>
        
        {filteredArticles.length === 0 && (
          <div className="py-24 text-center bg-white rounded-xl border border-dashed">
            <p className="text-muted-foreground">No articles found matching your criteria.</p>
            <Button variant="link" onClick={() => {setSearchTerm(""); setActiveCategory("All");}}>Clear filters</Button>
          </div>
        )}

        {visibleCount < filteredArticles.length && (
          <div className="mt-12 text-center">
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full px-8"
                onClick={() => setVisibleCount(prev => prev + 12)}
              >
                  Load More Articles
              </Button>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
