import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, X, Calendar, User, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import ArticleCard from "@/components/news/ArticleCard";
import { Article, Category } from "@shared/schema";

interface SearchFilters {
  category?: string;
  author?: string;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
}

interface SearchComponentProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export default function SearchComponent({ isOpen, onClose, initialQuery = "" }: SearchComponentProps) {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: searchResults = [], isLoading, error } = useQuery<Article[]>({
    queryKey: ['/api/articles/search', query, filters],
    enabled: query.length > 0 || Object.keys(filters).length > 0,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (filters.category) params.append('category', filters.category);
      if (filters.author) params.append('author', filters.author);
      if (filters.tags?.length) params.append('tags', filters.tags.join(','));
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
      if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());

      const res = await fetch(`/api/articles/search?${params}`);
      if (!res.ok) throw new Error('Search failed');
      return res.json();
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is triggered automatically by the query
  };

  const clearFilters = () => {
    setFilters({});
  };

  const addTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: [...(prev.tags || []), tag]
    }));
  };

  const removeTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Articles
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {(Object.keys(filters).length > 0) && (
                <Badge variant="secondary" className="ml-1">
                  {Object.keys(filters).length}
                </Badge>
              )}
            </Button>
          </form>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select
                  value={filters.category || ""}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, category: value || undefined }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Author</label>
                <Input
                  placeholder="Author name"
                  value={filters.author || ""}
                  onChange={(e) => setFilters(prev => ({ ...prev, author: e.target.value || undefined }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="flex-1 justify-start text-left font-normal">
                        <Calendar className="mr-2 h-4 w-4" />
                        {filters.dateFrom ? format(filters.dateFrom, "PPP") : "From"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={filters.dateFrom}
                        onSelect={(date) => setFilters(prev => ({ ...prev, dateFrom: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="flex-1 justify-start text-left font-normal">
                        <Calendar className="mr-2 h-4 w-4" />
                        {filters.dateTo ? format(filters.dateTo, "PPP") : "To"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={filters.dateTo}
                        onSelect={(date) => setFilters(prev => ({ ...prev, dateTo: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="text-sm font-medium mb-2 block">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {filters.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Add tag and press Enter"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const tag = (e.target as HTMLInputElement).value.trim();
                      if (tag) {
                        addTag(tag);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
              </div>

              <div className="md:col-span-3 flex justify-end">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Searching...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-500">Error: {(error as Error).message}</p>
            </div>
          )}

          {!isLoading && !error && searchResults.length === 0 && (query || Object.keys(filters).length > 0) && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No articles found matching your search.</p>
            </div>
          )}

          {!isLoading && !error && searchResults.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Found {searchResults.length} article{searchResults.length !== 1 ? 's' : ''}
              </p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {searchResults.map((article) => (
                  <ArticleCard key={article.id} article={article} variant="compact" />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}