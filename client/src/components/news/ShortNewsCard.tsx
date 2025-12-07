import { ShortNews } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Clock, Eye, Heart, ExternalLink, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface ShortNewsCardProps {
  news: ShortNews;
}

export default function ShortNewsCard({ news }: ShortNewsCardProps) {
  const queryClient = useQueryClient();
  const [liked, setLiked] = useState(false);

  const timeAgo = news.createdAt 
    ? formatDistanceToNow(new Date(news.createdAt), { addSuffix: true })
    : 'Just now';

  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/short-news/${news.id}/like`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to like');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/short-news'] });
      setLiked(true);
    },
  });

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!liked) {
      likeMutation.mutate();
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary overflow-hidden">
      <CardContent className="p-4">
        <div className="flex gap-3">
          {news.image && (
            <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-100">
              <img 
                src={news.image} 
                alt="News preview" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-[10px] font-bold uppercase">
                {news.category}
              </Badge>
              {news.isPinned && (
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
              )}
            </div>
            
            <p className="text-sm text-slate-800 leading-relaxed mb-3 line-clamp-3">
              {news.content}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {timeAgo}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {news.views}
                </span>
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1 hover:text-red-500 transition-colors ${liked ? 'text-red-500' : ''}`}
                  disabled={liked}
                >
                  <Heart className={`w-3 h-3 ${liked ? 'fill-current' : ''}`} />
                  {news.likes + (liked ? 1 : 0)}
                </button>
              </div>
              
              {news.linkUrl && (
                <a
                  href={news.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>Read more</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            
            <div className="mt-2 text-[10px] text-slate-500">
              By {news.author}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
