import { useRoute } from "wouter";
import { MOCK_ARTICLES } from "@/lib/mockData";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BreakingNewsTicker from "@/components/layout/Ticker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, Share2, Facebook, Twitter, Linkedin, ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

export default function ArticlePage() {
  const [match, params] = useRoute("/article/:id");
  const id = params ? parseInt(params.id) : 0;
  const article = MOCK_ARTICLES.find(a => a.id === id);

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
          <Link href="/">
            <a className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to News
            </a>
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
                  <Clock className="w-3 h-3" /> {format(new Date(article.timestamp), "MMMM dd, yyyy • h:mm a")}
                </p>
              </div>
            </div>

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

        <div className="relative aspect-video w-full rounded-xl overflow-hidden shadow-lg mb-8">
          <img 
            src={article.image} 
            alt={article.title} 
            className="w-full h-full object-cover"
          />
        </div>

        <article className="prose prose-lg prose-blue max-w-none font-serif text-foreground/80">
          <p className="lead text-xl md:text-2xl mb-6 font-light">
            {article.content.substring(0, 150)}...
          </p>
          <p>
            {article.content}
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </p>
          <h3 className="text-2xl font-bold mt-8 mb-4">Impact on the Community</h3>
          <p>
             Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.
          </p>
          <blockquote className="border-l-4 border-primary pl-4 italic my-6 text-lg text-gray-700 bg-gray-50 py-2">
            "This is a transformative moment for our region. We are seeing changes that will last for generations."
          </blockquote>
          <p>
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.
          </p>
        </article>

      </main>
      <Footer />
    </div>
  );
}
