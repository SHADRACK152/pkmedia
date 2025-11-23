import { useEffect, useState } from "react";
import { MOCK_ARTICLES } from "@/lib/mockData";

export default function BreakingNewsTicker() {
  const breakingNews = MOCK_ARTICLES.filter(a => a.isBreaking);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (breakingNews.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % breakingNews.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [breakingNews.length]);

  if (breakingNews.length === 0) return null;

  return (
    <div className="bg-accent text-white text-sm font-medium py-2 overflow-hidden relative">
      <div className="container mx-auto px-4 flex items-center">
        <span className="bg-red-700 px-2 py-0.5 text-xs font-bold uppercase tracking-wider mr-4 rounded animate-pulse">
          Breaking
        </span>
        <div className="flex-1 relative h-5">
            <div 
              key={currentIndex}
              className="absolute inset-0 animate-in slide-in-from-bottom-2 fade-in duration-500"
            >
              {breakingNews[currentIndex].title}
            </div>
        </div>
      </div>
    </div>
  );
}
