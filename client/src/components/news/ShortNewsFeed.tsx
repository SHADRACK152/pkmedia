import { useQuery } from "@tanstack/react-query";
import { ShortNews } from "@shared/schema";
import ShortNewsCard from "./ShortNewsCard";
import { Newspaper } from "lucide-react";

export default function ShortNewsFeed() {
  const { data: shortNews = [], isLoading } = useQuery<ShortNews[]>({
    queryKey: ['/api/short-news'],
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-slate-200 h-24 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (shortNews.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-slate-900">Quick Updates</h2>
      </div>
      
      <div className="space-y-3">
        {shortNews.map((news) => (
          <ShortNewsCard key={news.id} news={news} />
        ))}
      </div>
    </div>
  );
}
