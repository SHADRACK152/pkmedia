import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Send, ThumbsUp, ThumbsDown, Share2, Reply, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import SubscribeForm from "@/components/newsletter/SubscribeForm";

interface CommentWithRepliesProps {
  comment: any;
  replies: any[];
  onReply: (commentId: string | null) => void;
  replyingTo: string | null;
  replyContent: string;
  setReplyContent: (content: string) => void;
  onReplySubmit: (e: React.FormEvent, parentId: string) => void;
  userInteractions: Record<string, 'like' | 'dislike' | null>;
  onLike: (commentId: string) => void;
  onDislike: (commentId: string) => void;
  onShare: (commentId: string) => void;
  canReply: boolean;
}

function CommentWithReplies({ 
  comment, 
  replies, 
  onReply, 
  replyingTo, 
  replyContent, 
  setReplyContent, 
  onReplySubmit,
  userInteractions,
  onLike,
  onDislike,
  onShare,
  canReply
}: CommentWithRepliesProps) {
  return (
    <div className="space-y-4">
      {/* Main Comment */}
      <div className="flex gap-4 animate-in fade-in duration-500">
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
                onClick={() => onLike(comment.id)}
              >
                <ThumbsUp className={`w-4 h-4 mr-1.5 ${userInteractions[comment.id] === 'like' ? 'fill-current' : ''}`} />
                <span className="text-xs">{comment.likes || 0}</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-8 px-2 ${userInteractions[comment.id] === 'dislike' ? 'text-red-600 bg-red-50' : 'text-slate-500 hover:text-red-600'}`}
                onClick={() => onDislike(comment.id)}
              >
                <ThumbsDown className={`w-4 h-4 mr-1.5 ${userInteractions[comment.id] === 'dislike' ? 'fill-current' : ''}`} />
                <span className="text-xs">{comment.dislikes || 0}</span>
              </Button>
              {canReply && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 text-slate-500 hover:text-green-600"
                  onClick={() => onReply(replyingTo === comment.id ? null : comment.id)}
                >
                  <Reply className="w-4 h-4 mr-1.5" />
                  <span className="text-xs">Reply</span>
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-slate-500 hover:text-purple-600"
                onClick={() => onShare(comment.id)}
              >
                <Share2 className="w-4 h-4 mr-1.5" />
                <span className="text-xs">{comment.shares || 0}</span>
              </Button>
            </div>
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className="mt-4 ml-8">
              <form onSubmit={(e) => onReplySubmit(e, comment.id)} className="flex gap-3">
                <Avatar className="w-8 h-8 mt-1">
                  <AvatarFallback className="text-xs">You</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder={`Reply to ${comment.userName}...`}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="min-h-[60px] text-sm"
                    required
                  />
                  <div className="flex gap-2 mt-2">
                    <Button type="submit" size="sm" disabled={!replyContent.trim()}>
                      <Send className="w-3 h-3 mr-1" />
                      Reply
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        onReply(null);
                        setReplyContent("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="ml-12 space-y-3">
          {replies.map((reply) => (
            <div key={reply.id} className="flex gap-3">
              <Avatar className="w-6 h-6">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${reply.userName}`} />
                <AvatarFallback className="text-xs">{reply.userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-slate-100 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-900 text-sm">{reply.userName}</span>
                    <span className="text-xs text-slate-500">
                      {format(new Date(reply.createdAt), "MMM d, h:mm a")}
                    </span>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed">{reply.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface CommentSectionProps {
  articleId: string;
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const { toast } = useToast();
  const [userName, setUserName] = useState("");
  const [content, setContent] = useState("");
  const [subscriber, setSubscriber] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  // Check user authentication (for admin access)
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

  // Check newsletter subscription
  useEffect(() => {
    const checkSubscription = () => {
      const subscriberData = localStorage.getItem('newsletter_subscriber');
      if (subscriberData) {
        try {
          const data = JSON.parse(subscriberData);
          setSubscriber(data);
        } catch (err) {
          localStorage.removeItem('newsletter_subscriber');
        }
      }
    };
    checkSubscription();
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
      // Allow admins to comment without subscription check
      if (!(user?.role === 'admin' || subscriber)) {
        setShowSubscribeModal(true);
        throw new Error("Subscription required");
      }
      
      const res = await apiRequest("POST", "/api/comments", {
        ...newComment,
        userId: user?.id || null, // Use user ID if admin, null for subscribers
        userEmail: user?.email || subscriber?.email,
        userName: user?.name || user?.username || subscriber?.name || userName
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/articles/${articleId}/comments`] });
      toast({ title: "Comment Submitted", description: "Your comment has been submitted for review." });
      setContent("");
    },
    onError: (error: any) => {
      if (error.message !== "Subscription required") {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For admins and subscribers, we get name from their profile
    // For anonymous users, require a name input
    const hasValidName = user?.role === 'admin' || subscriber || userName.trim();
    
    if (!hasValidName || !content.trim()) return;

    createCommentMutation.mutate({
      articleId,
      userName: user?.name || user?.username || subscriber?.name || userName,
      content,
      status: "Approved", // Top-level comments need approval
      parentId: null
    });
  };

  const handleReplySubmit = (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    
    if (!replyContent.trim()) return;

    createCommentMutation.mutate({
      articleId,
      userName: user?.name || user?.username || subscriber?.name || userName,
      content: replyContent,
      status: "Approved", // Replies are approved immediately
      parentId
    });
    
    setReplyingTo(null);
    setReplyContent("");
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

  // Separate top-level comments from replies
  const topLevelComments = comments.filter(c => !c.parentId && c.status === 'Approved');
  const replies = comments.filter(c => c.parentId);
  const approvedComments = comments.filter(c => c.status === 'Approved');

  // Get replies for a specific comment
  const getRepliesForComment = (commentId: string) => {
    return replies.filter(r => r.parentId === commentId);
  };

  return (
    <div className="mt-12 border-t pt-8">
      <h3 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
        <MessageSquare className="w-6 h-6" />
        Comments ({approvedComments.length})
      </h3>

      {/* Comment Form */}
      <Card className="mb-8 bg-slate-50">
        <CardContent className="p-6">
          {(subscriber || user?.role === 'admin') ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>
                    {user?.role === 'admin' ? (user.name?.[0] || user.username?.[0] || 'A') : (subscriber.name?.[0] || 'S')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">
                    {user?.role === 'admin' ? (user.name || user.username) : subscriber.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.role === 'admin' ? user.email : subscriber.email}
                    {user?.role === 'admin' && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Admin</span>}
                  </p>
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
              <Button 
                type="submit" 
                disabled={createCommentMutation.isPending || !content.trim()}
              >
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
                Subscribe to our newsletter to share your thoughts and engage with other readers.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => setShowSubscribeModal(true)}>
                  <Mail className="w-4 h-4 mr-2" />
                  Subscribe to Comment
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-6">
        {topLevelComments.length === 0 ? (
          <p className="text-slate-500 italic">No comments yet. Be the first to share your thoughts!</p>
        ) : (
          topLevelComments.map((comment) => (
            <CommentWithReplies 
              key={comment.id} 
              comment={comment} 
              replies={getRepliesForComment(comment.id)}
              onReply={setReplyingTo}
              replyingTo={replyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              onReplySubmit={handleReplySubmit}
              userInteractions={userInteractions}
              onLike={handleLike}
              onDislike={handleDislike}
              onShare={(id) => shareMutation.mutate(id)}
              canReply={user?.role === 'admin' || subscriber}
            />
          ))
        )}
      </div>

      {/* Subscription Modal */}
      <Dialog open={showSubscribeModal} onOpenChange={setShowSubscribeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscribe to Comment</DialogTitle>
            <DialogDescription>
              Subscribe to our newsletter to join the conversation and share your thoughts with other readers.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <SubscribeForm />
          </div>
          <p className="text-sm text-muted-foreground mt-3 text-center">
            Already subscribed? <button 
              onClick={() => {
                setShowSubscribeModal(false);
                // Check subscription again
                const subscriberData = localStorage.getItem('newsletter_subscriber');
                if (subscriberData) {
                  try {
                    const data = JSON.parse(subscriberData);
                    setSubscriber(data);
                  } catch (err) {
                    // Ignore
                  }
                }
              }}
              className="text-primary hover:underline"
            >
              Refresh
            </button>
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
