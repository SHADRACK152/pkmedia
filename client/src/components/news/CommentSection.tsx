import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Send, ThumbsUp, ThumbsDown, Share2, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface CommentSectionProps {
  articleId: string;
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const { toast } = useToast();
  const [userName, setUserName] = useState("");
  const [content, setContent] = useState("");
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Check user authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        // User not authenticated
      }
    };
    checkAuth();
  }, []);

  const [userInteractions, setUserInteractions] = useState<Record<string, 'like' | 'dislike' | null>>(() => {
    const saved = localStorage.getItem('comment_interactions');
    return saved ? JSON.parse(saved) : {};
  });

  const updateInteraction = (commentId: string, type: 'like' | 'dislike' | null) => {
    const newInteractions = { ...userInteractions, [commentId]: type };
    setUserInteractions(newInteractions);
    localStorage.setItem('comment_interactions', JSON.stringify(newInteractions));
  };

  const { data: comments = [] } = useQuery<any[]>({
    queryKey: [`/api/articles/${articleId}/comments`],
    enabled: !!articleId,
  });

  const createCommentMutation = useMutation({
    mutationFn: async (newComment: any) => {
      if (!user) {
        setShowAuthModal(true);
        throw new Error("Authentication required");
      }
      
      const res = await apiRequest("POST", "/api/comments", {
        ...newComment,
        userId: user.id,
        userEmail: user.email,
        userName: user.name || user.username
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/articles/${articleId}/comments`] });
      toast({ title: "Comment Submitted", description: "Your comment has been submitted for review." });
      setContent("");
    },
    onError: (error: any) => {
      if (error.message !== "Authentication required") {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !content.trim()) return;

    createCommentMutation.mutate({
      articleId,
      userName,
      content,
      status: "Pending" // Default status
    });
  };

  const likeMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string, action: 'like' | 'unlike' }) => {
      await apiRequest("POST", `/api/comments/${id}/${action}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/articles/${articleId}/comments`] });
    }
  });

  const dislikeMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string, action: 'dislike' | 'undislike' }) => {
      await apiRequest("POST", `/api/comments/${id}/${action}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/articles/${articleId}/comments`] });
    }
  });

  const shareMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("POST", `/api/comments/${id}/share`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/articles/${articleId}/comments`] });
      toast({ title: "Shared", description: "Comment shared successfully" });
    }
  });

  const handleLike = (commentId: string) => {
    const current = userInteractions[commentId];
    
    if (current === 'like') {
      // Unlike
      likeMutation.mutate({ id: commentId, action: 'unlike' });
      updateInteraction(commentId, null);
    } else {
      // Like (and remove dislike if exists)
      if (current === 'dislike') {
        dislikeMutation.mutate({ id: commentId, action: 'undislike' });
      }
      likeMutation.mutate({ id: commentId, action: 'like' });
      updateInteraction(commentId, 'like');
    }
  };

  const handleDislike = (commentId: string) => {
    const current = userInteractions[commentId];
    
    if (current === 'dislike') {
      // Undislike
      dislikeMutation.mutate({ id: commentId, action: 'undislike' });
      updateInteraction(commentId, null);
    } else {
      // Dislike (and remove like if exists)
      if (current === 'like') {
        likeMutation.mutate({ id: commentId, action: 'unlike' });
      }
      dislikeMutation.mutate({ id: commentId, action: 'dislike' });
      updateInteraction(commentId, 'dislike');
    }
  };

  // Filter only approved comments for public view
  const approvedComments = comments.filter(c => c.status === 'Approved');

  return (
    <div className="mt-12 border-t pt-8">
      <h3 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
        <MessageSquare className="w-6 h-6" />
        Comments ({approvedComments.length})
      </h3>

      {/* Comment Form */}
      <Card className="mb-8 bg-slate-50">
        <CardContent className="p-6">
          {user ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>{user.name?.[0] || user.username?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{user.name || user.username}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-slate-700 mb-1">Comment</label>
                <Textarea 
                  id="comment" 
                  placeholder="Share your thoughts..." 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)}
                  required
                  className="bg-white min-h-[100px]"
                />
              </div>
              <Button type="submit" disabled={createCommentMutation.isPending}>
                {createCommentMutation.isPending ? "Submitting..." : (
                  <>
                    <Send className="w-4 h-4 mr-2" /> Post Comment
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="font-medium text-lg mb-2">Join the Conversation</h4>
              <p className="text-muted-foreground mb-6">
                Login to share your thoughts and engage with other readers.
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/login">
                  <Button>
                    <LogIn className="w-4 h-4 mr-2" />
                    Login to Comment
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline">Sign Up</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-6">
        {approvedComments.length === 0 ? (
          <p className="text-slate-500 italic">No comments yet. Be the first to share your thoughts!</p>
        ) : (
          approvedComments.map((comment) => (
            <div key={comment.id} className="flex gap-4 animate-in fade-in duration-500">
              <Avatar>
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.userName}`} />
                <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-slate-50 p-4 rounded-lg rounded-tl-none">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900">{comment.userName}</span>
                    <span className="text-xs text-slate-500">
                      {format(new Date(comment.createdAt), "MMM d, yyyy • h:mm a")}
                    </span>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed mb-3">{comment.content}</p>
                  
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`h-8 px-2 ${userInteractions[comment.id] === 'like' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-blue-600'}`}
                      onClick={() => handleLike(comment.id)}
                    >
                      <ThumbsUp className={`w-4 h-4 mr-1.5 ${userInteractions[comment.id] === 'like' ? 'fill-current' : ''}`} />
                      <span className="text-xs">{comment.likes || 0}</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`h-8 px-2 ${userInteractions[comment.id] === 'dislike' ? 'text-red-600 bg-red-50' : 'text-slate-500 hover:text-red-600'}`}
                      onClick={() => handleDislike(comment.id)}
                    >
                      <ThumbsDown className={`w-4 h-4 mr-1.5 ${userInteractions[comment.id] === 'dislike' ? 'fill-current' : ''}`} />
                      <span className="text-xs">{comment.dislikes || 0}</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2 text-slate-500 hover:text-green-600"
                      onClick={() => shareMutation.mutate(comment.id)}
                    >
                      <Share2 className="w-4 h-4 mr-1.5" />
                      <span className="text-xs">{comment.shares || 0}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Authentication Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              You need to be logged in to leave comments. This helps us maintain quality discussions and track engagement.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Link href="/login">
              <Button className="flex-1">Login</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="flex-1">Register</Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-3 text-center">
            Don't have an account? <Link href="/register" className="text-primary hover:underline">Sign up</Link> for free.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
