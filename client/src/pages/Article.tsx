import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BreakingNewsTicker from "@/components/layout/Ticker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, Share2, Facebook, Twitter, Linkedin, ChevronLeft, Eye, ThumbsUp, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import CommentSection from "@/components/news/CommentSection";

export default function ArticlePage() {
  const [match, params] = useRoute("/article/:id");
  const id = params?.id;
  const [hasLiked, setHasLiked] = useState(false);

  const { data: article, isLoading } = useQuery<any>({
    queryKey: [`/api/articles/${id}`],
    enabled: !!id,
  });

  // Increment view count on mount
  useEffect(() => {
    if (id) {
      const viewedKey = `viewed_article_${id}`;
      if (!sessionStorage.getItem(viewedKey)) {
        apiRequest("POST", `/api/articles/${id}/view`);
        sessionStorage.setItem(viewedKey, "true");
      }
    }
  }, [id]);

  const likeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/articles/${id}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/articles/${id}`] });
      setHasLiked(true);
    }
  });

  const isVideo = (url: string) => {
    return url.match(/\.(mp4|webm|mov)$/i) || url.includes('/video/upload/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <p className="text-muted-foreground mb-8">Article not found</p>
            <Link href="/"><Button>Return Home</Button></Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <BreakingNewsTicker />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4 cursor-pointer">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to News
          </Link>
          
          <div className="flex gap-2 mb-4">
            <Badge className="bg-primary hover:bg-primary/90">{article.category}</Badge>
            {article.isBreaking && <Badge variant="destructive" className="animate-pulse">Breaking</Badge>}
          </div>

          <h1 className="text-3xl md:text-5xl font-serif font-bold leading-tight text-foreground mb-6">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between border-b pb-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">{article.author}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {article.createdAt ? format(new Date(article.createdAt), "MMMM dd, yyyy • h:mm a") : 'Just now'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-muted-foreground text-sm mr-2">
                <Eye className="w-4 h-4" />
                <span>{article.views || 0} views</span>
              </div>
              
              <Button 
                variant={hasLiked ? "default" : "outline"} 
                size="sm" 
                className="gap-2"
                onClick={() => !hasLiked && likeMutation.mutate()}
                disabled={hasLiked}
              >
                <ThumbsUp className="w-4 h-4" />
                {article.likes || 0}
              </Button>

              <div className="h-6 w-px bg-border mx-2"></div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="rounded-full w-8 h-8">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full w-8 h-8 text-blue-600 hover:text-blue-700">
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full w-8 h-8 text-sky-500 hover:text-sky-600">
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full w-8 h-8 text-blue-700 hover:text-blue-800">
                  <Linkedin className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative aspect-video w-full rounded-xl overflow-hidden shadow-lg mb-8 bg-black">
          {isVideo(article.image) ? (
            <video
              src={article.image}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          ) : (
            <img 
              src={article.image} 
              alt={article.title} 
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <article className="prose prose-lg prose-blue max-w-none font-serif text-foreground/80">
          <p className="lead text-xl md:text-2xl mb-6 font-light">
            {article.content.substring(0, 150)}...
          </p>
          <p className="whitespace-pre-wrap">
            {article.content}
          </p>
        </article>

        <CommentSection articleId={id} />

      </main>
      <Footer />
    </div>
  );
}
