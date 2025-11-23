import { Article } from "@/lib/mockData";
import { Link } from "wouter";
import { Clock, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ArticleCardProps {
  article: Article;
  variant?: "default" | "compact" | "featured";
}

export default function ArticleCard({ article, variant = "default" }: ArticleCardProps) {
  const timeAgo = formatDistanceToNow(new Date(article.timestamp), { addSuffix: true });

  if (variant === "featured") {
    return (
      <Link href={`/article/${article.id}`}>
        <a className="group block h-full">
          <div className="relative h-full min-h-[400px] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
            <img 
              src={article.image} 
              alt={article.title} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white z-10">
              <Badge className="mb-3 bg-primary hover:bg-primary/90 border-none text-white">
                {article.category}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-serif font-bold leading-tight mb-3 group-hover:text-primary-foreground/90 transition-colors">
                {article.title}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <span className="flex items-center gap-1"><User className="w-4 h-4" /> {article.author}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {timeAgo}</span>
              </div>
            </div>
          </div>
        </a>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={`/article/${article.id}`}>
        <a className="group flex gap-4 items-start mb-6">
          <div className="w-24 h-24 md:w-32 md:h-24 shrink-0 rounded-lg overflow-hidden relative">
             <img 
              src={article.image} 
              alt={article.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <div className="flex-1">
            <span className="text-xs font-bold text-primary uppercase tracking-wider mb-1 block">
              {article.category}
            </span>
            <h3 className="text-sm md:text-base font-serif font-bold leading-snug group-hover:text-primary transition-colors mb-1 line-clamp-2">
              {article.title}
            </h3>
             <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
      <a className="block h-full group">
        <Card className="h-full border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
          <div className="aspect-video w-full overflow-hidden relative">
            <img 
              src={article.image} 
              alt={article.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="bg-white/90 backdrop-blur hover:bg-white text-black shadow-sm">
                {article.category}
              </Badge>
            </div>
          </div>
          <CardContent className="p-4 flex-1">
            <h3 className="text-lg font-serif font-bold leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {article.title}
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-2">
              {article.content}
            </p>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium">{article.author}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {timeAgo}</span>
          </CardFooter>
        </Card>
      </a>
    </Link>
  );
}
