import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BreakingNewsTicker from "@/components/layout/Ticker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, ChevronLeft, Eye, ThumbsUp, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import CommentSection from "@/components/news/CommentSection";
import ShareButtons from "@/components/news/ShareButtons";
import { Helmet } from 'react-helmet-async';
import { extractIdFromSlug } from "@/lib/utils";

export default function ArticlePage() {
  const [matchSlug, paramsSlug] = useRoute("/article/:slug");
  const slug = paramsSlug?.slug;
  
  // Extract ID - if slug contains __, extract from it, otherwise treat as direct UUID
  let id: string | null = null;
  if (slug) {
    if (slug.includes('__')) {
      id = extractIdFromSlug(slug);
    } else {
      // Direct UUID or short format
      id = slug;
    }
  }
  
  const [hasLiked, setHasLiked] = useState(false);

  const { data: article, isLoading, error } = useQuery<any>({
    queryKey: [`/api/articles/${id}`],
    enabled: !!id && id !== 'undefined',
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

  const articleUrl = `/article/${slug}`;
  const articleDescription = article.content ? article.content.replace(/<[^>]*>/g, '').substring(0, 160) : '';
  const absoluteImageUrl = article.image?.startsWith('http') 
    ? article.image 
    : `${typeof window !== 'undefined' ? window.location.origin : ''}${article.image}`;
  const absoluteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}${articleUrl}`;

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Helmet>
        <title>{article.title} - PKMedia</title>
        <meta name="description" content={articleDescription} />
        
        {/* Open Graph / Facebook / WhatsApp */}
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="PKMedia" />
        <meta property="og:url" content={absoluteUrl} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={articleDescription} />
        <meta property="og:image" content={absoluteImageUrl} />
        <meta property="og:image:secure_url" content={absoluteImageUrl} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={article.title} />
        <meta property="article:published_time" content={article.createdAt} />
        <meta property="article:author" content={article.author} />
        <meta property="article:section" content={article.category} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@PKMedia" />
        <meta name="twitter:url" content={absoluteUrl} />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={articleDescription} />
        <meta name="twitter:image" content={absoluteImageUrl} />
        <meta name="twitter:image:alt" content={article.title} />
      </Helmet>

      <BreakingNewsTicker />
      <Navbar />
      
      <main className="flex-1">
        
        {/* Featured Image Slideshow at the top */}
        {(article.image || (article.images && article.images.length > 0)) && (() => {
          const [currentIndex, setCurrentIndex] = useState(0);
          const allImages = [article.image, ...(article.images || [])].filter(Boolean);
          
          useEffect(() => {
            if (allImages.length > 1) {
              const interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % allImages.length);
              }, 4000); // Change image every 4 seconds
              
              return () => clearInterval(interval);
            }
          }, [allImages.length]);
          
          return (
            <div className="relative w-full aspect-[21/9] md:aspect-[21/8] bg-slate-100 overflow-hidden group">
              {allImages.map((img, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {isVideo(img) ? (
                    <video
                      src={img}
                      controls
                      autoPlay
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img 
                      src={img} 
                      alt={`${article.title} - Image ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              ))}
              
              {/* Slideshow indicators */}
              {allImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentIndex 
                          ? 'bg-white w-8' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        <div className="container mx-auto px-4 py-8 max-w-4xl">
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
          
          {/* Tags Display */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {article.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

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

              <ShareButtons 
                articleId={id!}
                title={article.title}
                description={articleDescription}
              />
            </div>
          </div>

        <article className="prose prose-lg prose-blue max-w-none font-serif text-foreground/80">
          <div 
            className="article-content leading-relaxed text-lg"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>

        <style>{`
          .article-content {
            line-height: 1.8;
          }
          .article-content p {
            margin-bottom: 1.25rem;
          }
          .article-content h1,
          .article-content h2,
          .article-content h3,
          .article-content h4,
          .article-content h5,
          .article-content h6 {
            font-weight: bold;
            margin-top: 2rem;
            margin-bottom: 1rem;
            line-height: 1.3;
          }
          .article-content h1 { font-size: 2.25rem; }
          .article-content h2 { font-size: 1.875rem; }
          .article-content h3 { font-size: 1.5rem; }
          .article-content img {
            max-width: 100%;
            height: auto;
            margin: 2rem auto;
            display: block;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          }
          .article-content ul,
          .article-content ol {
            margin: 1.5rem 0;
            padding-left: 2rem;
          }
          .article-content li {
            margin-bottom: 0.5rem;
          }
          .article-content blockquote {
            border-left: 4px solid #3b82f6;
            padding-left: 1.5rem;
            margin: 1.5rem 0;
            font-style: italic;
            color: #64748b;
          }
          .article-content a {
            color: #3b82f6;
            text-decoration: underline;
          }
          .article-content a:hover {
            color: #2563eb;
          }
          .article-content code {
            background: #f1f5f9;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-family: monospace;
            font-size: 0.9em;
          }
          .article-content pre {
            background: #1e293b;
            color: #e2e8f0;
            padding: 1rem;
            border-radius: 8px;
            overflow-x: auto;
            margin: 1.5rem 0;
          }
          .article-content pre code {
            background: transparent;
            color: inherit;
            padding: 0;
          }
          .article-content strong {
            font-weight: 700;
          }
          .article-content em {
            font-style: italic;
          }
        `}</style>

        <CommentSection articleId={id} />

        </div>
      </main>
      <Footer />
    </div>
  );
}
