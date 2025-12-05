import { Article } from "@shared/schema";
import { Link } from "wouter";
import { Clock, User, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useShortLink } from "@/hooks/use-short-link";

interface ArticleCardProps {
  article: Article;
  variant?: "default" | "compact" | "featured" | "hero";
}

export default function ArticleCard({ article, variant = "default" }: ArticleCardProps) {
  if (!article) return null;
  
  const shortCode = useShortLink(article.id);
  
  // If short code is still loading (null) and article is new, wait a moment
  // Otherwise use UUID as fallback for old articles
  const articleUrl = shortCode ? `/s/${shortCode}` : `/article/${article.id}`;
  
  const timeAgo = article.createdAt 
    ? formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })
    : 'Just now';

  const isVideo = (url: string) => {
    return url.match(/\.(mp4|webm|mov)$/i) || url.includes('/video/upload/');
  };

  const MediaContent = ({ className }: { className: string }) => {
    if (isVideo(article.image)) {
      return (
        <video
          src={article.image}
          muted
          loop
          playsInline
          onMouseOver={(e) => e.currentTarget.play()}
          onMouseOut={(e) => e.currentTarget.pause()}
          className={className}
        />
      );
    }
    return (
      <img 
        src={article.image} 
        alt={article.title} 
        className={className}
      />
    );
  };

  if (variant === "hero") {
     return (
      <Link href={articleUrl}>
        <div className="group block h-full w-full relative overflow-hidden rounded-xl shadow-2xl cursor-pointer bg-slate-900">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/90 z-10" />
          <MediaContent className="w-full h-[550px] object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90" />
          
          <div className="absolute bottom-0 left-0 p-6 md:p-10 z-20 w-full">
            <div className="max-w-4xl">
              <Badge className="mb-3 bg-primary text-white hover:bg-primary/90 border-none px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
                {article.category}
              </Badge>
              <h2 className="text-3xl md:text-5xl font-serif font-black text-white leading-[1.1] mb-4 drop-shadow-2xl">
                {article.title}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-200 font-medium">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> 
                  <span className="font-semibold">{article.author}</span>
                </span>
                <span className="text-gray-400">•</span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" /> 
                  {timeAgo}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
     );
  }

  if (variant === "featured") {
    return (
      <Link href={articleUrl}>
        <div className="group block h-full relative overflow-hidden rounded-xl shadow-lg cursor-pointer">
          <MediaContent className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 text-white z-10">
            <Badge className="mb-2 bg-primary/90 hover:bg-primary border-none text-white text-xs">
              {article.category}
            </Badge>
            <h2 className="text-xl md:text-2xl font-serif font-bold leading-snug mb-2 group-hover:text-gray-100 transition-colors">
              {article.title}
            </h2>
            <div className="flex items-center gap-3 text-xs text-gray-300">
              <span>{article.author}</span>
              <span>•</span>
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={articleUrl}>
        <div className="group flex gap-4 items-start p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
          <div className="w-20 h-20 shrink-0 rounded-md overflow-hidden relative bg-slate-200">
             <MediaContent className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1 block">
              {article.category}
            </span>
            <h3 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-primary transition-colors mb-1 line-clamp-2">
              {article.title}
            </h3>
             <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Clock className="w-3 h-3" /> {timeAgo}
              </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default Card
  return (
    <Link href={articleUrl}>
      <div className="block h-full group hover:-translate-y-2 transition-all duration-300 cursor-pointer">
        <Card className="h-full border-0 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col bg-white">
          <div className="aspect-[16/10] w-full overflow-hidden relative bg-slate-100">
            <MediaContent className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute top-3 left-3 z-10">
              <Badge variant="secondary" className="bg-white backdrop-blur hover:bg-white text-slate-900 shadow-lg font-bold text-xs uppercase tracking-wide">
                {article.category}
              </Badge>
            </div>
          </div>
          <CardContent className="p-6 flex-1 flex flex-col">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 font-medium">
                <User className="w-3.5 h-3.5" />
                <span className="font-semibold text-slate-700">{article.author}</span>
                <span className="text-slate-400">•</span>
                <Clock className="w-3.5 h-3.5" />
                <span>{timeAgo}</span>
            </div>
            <h3 className="text-xl font-serif font-bold leading-tight mb-3 text-slate-900 group-hover:text-primary transition-colors line-clamp-2 flex-1">
              {article.title}
            </h3>
            <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed mb-4">
              {article.content}
            </p>
            <div className="mt-auto pt-3 border-t border-slate-100">
              <span className="text-sm font-bold text-primary flex items-center gap-2 group-hover:gap-3 transition-all uppercase tracking-wide">
                  Read More <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </Link>
  );
}
