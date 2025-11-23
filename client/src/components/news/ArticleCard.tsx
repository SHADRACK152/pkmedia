import { Article } from "@/lib/mockData";
import { Link } from "wouter";
import { Clock, User, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ArticleCardProps {
  article: Article;
  variant?: "default" | "compact" | "featured" | "hero";
}

export default function ArticleCard({ article, variant = "default" }: ArticleCardProps) {
  const timeAgo = formatDistanceToNow(new Date(article.timestamp), { addSuffix: true });

  if (variant === "hero") {
     return (
      <Link href={`/article/${article.id}`}>
        <a className="group block h-full w-full relative overflow-hidden rounded-2xl shadow-2xl">
          <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors z-10" />
          <img 
            src={article.image} 
            alt={article.title} 
            className="w-full h-[500px] object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20" />
          
          <div className="absolute bottom-0 left-0 p-8 md:p-12 z-30 w-full md:w-3/4">
            <Badge className="mb-4 bg-primary text-white hover:bg-primary/90 border-none px-3 py-1 text-sm">
              {article.category}
            </Badge>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white leading-tight mb-4 drop-shadow-sm group-hover:text-primary-foreground/90 transition-colors">
              {article.title}
            </h2>
            <p className="text-gray-200 text-lg mb-6 line-clamp-2 md:line-clamp-none max-w-2xl">
              {article.content}
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-300 font-medium">
              <span className="flex items-center gap-2"><User className="w-4 h-4 text-primary" /> {article.author}</span>
              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> {timeAgo}</span>
            </div>
          </div>
        </a>
      </Link>
     );
  }

  if (variant === "featured") {
    return (
      <Link href={`/article/${article.id}`}>
        <a className="group block h-full relative overflow-hidden rounded-xl shadow-lg">
          <img 
            src={article.image} 
            alt={article.title} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
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
        </a>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={`/article/${article.id}`}>
        <a className="group flex gap-4 items-start p-3 rounded-lg hover:bg-slate-50 transition-colors">
          <div className="w-20 h-20 shrink-0 rounded-md overflow-hidden relative bg-slate-200">
             <img 
              src={article.image} 
              alt={article.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
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
        </a>
      </Link>
    );
  }

  // Default Card
  return (
    <Link href={`/article/${article.id}`}>
      <a className="block h-full group hover:-translate-y-1 transition-transform duration-300">
        <Card className="h-full border-none shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col bg-white ring-1 ring-slate-900/5">
          <div className="aspect-[16/10] w-full overflow-hidden relative">
            <img 
              src={article.image} 
              alt={article.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="bg-white/95 backdrop-blur hover:bg-white text-slate-900 shadow-sm font-semibold">
                {article.category}
              </Badge>
            </div>
          </div>
          <CardContent className="p-5 flex-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <span className="font-medium text-slate-700">{article.author}</span>
                <span>•</span>
                <span>{timeAgo}</span>
            </div>
            <h3 className="text-xl font-serif font-bold leading-tight mb-3 text-slate-900 group-hover:text-primary transition-colors line-clamp-3">
              {article.title}
            </h3>
            <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
              {article.content}
            </p>
          </CardContent>
          <CardFooter className="p-5 pt-0 mt-auto">
            <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                Read Story <ArrowRight className="w-4 h-4" />
            </span>
          </CardFooter>
        </Card>
      </a>
    </Link>
  );
}
