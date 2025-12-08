import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Ad } from "@shared/schema";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  Plus, 
  Search,
  BarChart3,
  Menu,
  Image as ImageIcon,
  Tags,
  MoreVertical,
  Pencil,
  Trash2,
  Upload,
  X,
  MessageSquare,
  Shield,
  UserCheck,
  UserX,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Clock,
  Megaphone,
  Mail,
  Newspaper,
  Pin,
  PinOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import RichTextEditor from "@/components/ui/rich-text-editor";

export default function AdminDashboard() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [isArticleSheetOpen, setIsArticleSheetOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [imageUploadType, setImageUploadType] = useState<'url' | 'file'>('url');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAdSheetOpen, setIsAdSheetOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [commentFilter, setCommentFilter] = useState<'all' | 'pending'>('all');
  const [articleContent, setArticleContent] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    author: '',
    image: '',
    imageAttribution: '', // Photo credit/source
    images: [] as string[], // Multiple images for slideshow
    tags: [] as string[]
  });
  const [tagInput, setTagInput] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [additionalImageUrl, setAdditionalImageUrl] = useState('');
  const [isShortNewsSheetOpen, setIsShortNewsSheetOpen] = useState(false);
  const [editingShortNews, setEditingShortNews] = useState<any>(null);
  const [shortNewsForm, setShortNewsForm] = useState({
    content: '',
    image: '',
    category: '',
    author: '',
    linkUrl: '',
    isPinned: false
  });

  // Real Data Queries
  const { data: articles = [] } = useQuery<any[]>({
    queryKey: ['/api/articles'],
  });

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ['/api/categories'],
  });

  const { data: availableTags = [] } = useQuery<any[]>({
    queryKey: ['/api/tags'],
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ['/api/users'],
  });

  const { data: comments = [] } = useQuery<any[]>({
    queryKey: ['/api/comments'],
  });

  const { data: subscribers = [] } = useQuery<any[]>({
    queryKey: ['/api/newsletter/subscribers'],
  });

  const { data: ads = [] } = useQuery<Ad[]>({
    queryKey: ['/api/ads'],
  });

  const { data: trafficStats = [] } = useQuery<any[]>({
    queryKey: ['/api/analytics/stats'],
  });

  const { data: systemStatus } = useQuery<any>({
    queryKey: ['/api/system/status'],
    refetchInterval: 30000, // Refresh every 30s
  });

  const { data: shortNews = [] } = useQuery<any[]>({
    queryKey: ['/api/short-news'],
  });

  const recentPostsCount = articles.filter((a: any) => {
    if (!a.createdAt) return false;
    const now = new Date();
    const articleDate = new Date(a.createdAt);
    const diff = now.getTime() - articleDate.getTime();
    return diff < 24 * 60 * 60 * 1000;
  }).length;

  const getArticleTitle = (id: string) => {
    const a = articles.find((art: any) => art.id === id);
    return a ? a.title : 'Unknown Article';
  };

  // Combine all activities for the feed
  const recentActivity = [
    ...articles.map((a: any) => ({ 
      type: 'article', 
      action: 'Article Published', 
      detail: a.title, 
      time: a.createdAt, 
      icon: FileText, 
      color: 'text-blue-500' 
    })),
    ...users.map((u: any) => ({ 
      type: 'user', 
      action: 'New User Signup', 
      detail: u.email, 
      time: u.createdAt, 
      icon: UserCheck, 
      color: 'text-green-500' 
    })),
    ...comments.map((c: any) => ({ 
      type: 'comment', 
      action: c.status === 'Flagged' ? 'Comment Flagged' : 'New Comment', 
      detail: c.content.substring(0, 30) + (c.content.length > 30 ? '...' : ''), 
      time: c.createdAt, 
      icon: c.status === 'Flagged' ? AlertCircle : MessageSquare, 
      color: c.status === 'Flagged' ? 'text-red-500' : 'text-slate-500' 
    })),
    ...ads.map((a: any) => ({ 
      type: 'ad', 
      action: 'Ad Created', 
      detail: a.title, 
      time: a.createdAt, 
      icon: Megaphone, 
      color: 'text-purple-500' 
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const formatUptime = (seconds: number) => {
    if (!seconds) return '0m';
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const flaggedCommentsCount = comments.filter((c: any) => c.status === 'Flagged').length;

  const createArticleMutation = useMutation({
    mutationFn: async (newArticle: any) => {
      const res = await apiRequest("POST", "/api/articles", newArticle);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      toast({ title: "Article Published", description: "The article has been created successfully." });
      setIsArticleSheetOpen(false);
      setEditingArticle(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const updateArticleMutation = useMutation({
    mutationFn: async (article: any) => {
      const res = await apiRequest("PUT", `/api/articles/${article.id}`, article);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      toast({ title: "Article Updated", description: "The changes have been saved successfully." });
      setIsArticleSheetOpen(false);
      setEditingArticle(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const deleteArticleMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/articles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      toast({ title: "Article Deleted", description: "The article has been removed.", variant: "destructive" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/categories", { name });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({ title: "Category Added", description: "New category created." });
      setNewCategoryName("");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({ title: "Category Deleted", description: "Category removed." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const createTagMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/tags", { name });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tags'] });
      toast({ title: "Tag Added", description: "New tag created." });
      setNewTagName("");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const deleteTagMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/tags/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tags'] });
      toast({ title: "Tag Deleted", description: "Tag removed." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const updateCommentStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const res = await apiRequest("PATCH", `/api/comments/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/comments'] });
      toast({ title: "Comment Updated", description: "Status has been changed." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Ensure cookies are sent
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Upload failed');
      }
      return res.json();
    }
  });

  const createAdMutation = useMutation({
    mutationFn: async (newAd: any) => {
      const res = await apiRequest("POST", "/api/ads", newAd);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ads'] });
      toast({ title: "Ad Created", description: "The advertisement has been created successfully." });
      setIsAdSheetOpen(false);
      setEditingAd(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const updateAdMutation = useMutation({
    mutationFn: async (ad: any) => {
      const res = await apiRequest("PUT", `/api/ads/${ad.id}`, ad);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ads'] });
      toast({ title: "Ad Updated", description: "The changes have been saved successfully." });
      setIsAdSheetOpen(false);
      setEditingAd(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const deleteAdMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/ads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ads'] });
      toast({ title: "Ad Deleted", description: "The advertisement has been removed.", variant: "destructive" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Short News Mutations
  const createShortNewsMutation = useMutation({
    mutationFn: async (newShortNews: any) => {
      const res = await apiRequest("POST", "/api/short-news", newShortNews);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/short-news'] });
      toast({ title: "Short News Created", description: "Quick update posted successfully." });
      setIsShortNewsSheetOpen(false);
      setEditingShortNews(null);
      setShortNewsForm({ content: '', image: '', category: '', author: '', linkUrl: '', isPinned: false });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const updateShortNewsMutation = useMutation({
    mutationFn: async (news: any) => {
      const res = await apiRequest("PUT", `/api/short-news/${news.id}`, news);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/short-news'] });
      toast({ title: "Short News Updated", description: "Changes saved successfully." });
      setIsShortNewsSheetOpen(false);
      setEditingShortNews(null);
      setShortNewsForm({ content: '', image: '', category: '', author: '', linkUrl: '', isPinned: false });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const deleteShortNewsMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/short-news/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/short-news'] });
      toast({ title: "Short News Deleted", description: "Update removed successfully.", variant: "destructive" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    let imageUrl = formData.image;

    if (imageUploadType === 'file' && uploadedFile) {
      try {
        const uploadRes = await uploadFileMutation.mutateAsync(uploadedFile);
        imageUrl = uploadRes.url;
      } catch (err) {
        toast({ title: "Upload Error", description: "Failed to upload image", variant: "destructive" });
        return;
      }
    }

    const data = {
      title: formData.title,
      category: formData.category,
      author: formData.author,
      image: imageUrl,
      imageAttribution: formData.imageAttribution || null,
      images: formData.images, // Include additional images for slideshow
      content: articleContent,
      tags: formData.tags,
      featured: (form.elements.namedItem('featured') as HTMLInputElement)?.checked || false,
      isBreaking: (form.elements.namedItem('breaking') as HTMLInputElement)?.checked || false,
    };

    if (editingArticle) {
      updateArticleMutation.mutate({ ...data, id: editingArticle.id });
    } else {
      createArticleMutation.mutate(data);
    }
  };

  const handleDeleteArticle = (id: number) => {
    if (confirm("Are you sure you want to delete this article?")) {
      deleteArticleMutation.mutate(id);
    }
  };

  const openArticleEditor = (article?: any) => {
    setEditingArticle(article || null);
    setArticleContent(article?.content || '');
    setImageUploadType('url');
    setUploadedFile(null);
    setCurrentStep(1);
    setFormData({
      title: article?.title || '',
      category: article?.category || '',
      author: article?.author || '',
      image: article?.image || '',
      imageAttribution: article?.imageAttribution || '',
      images: article?.images || [],
      tags: article?.tags || []
    });
    setTagInput('');
    setAdditionalImageUrl('');
    setIsArticleSheetOpen(true);
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      createCategoryMutation.mutate(newCategoryName);
    }
  };

  const handleAddTag = () => {
    if (newTagName.trim()) {
      createTagMutation.mutate(newTagName);
    }
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({ title: "Settings Saved", description: "All changes have been successfully applied." });
    }, 1000);
  };

  const openShortNewsEditor = (news?: any) => {
    setEditingShortNews(news || null);
    setShortNewsForm({
      content: news?.content || '',
      image: news?.image || '',
      category: news?.category || '',
      author: news?.author || '',
      linkUrl: news?.linkUrl || '',
      isPinned: news?.isPinned || false
    });
    setIsShortNewsSheetOpen(true);
  };

  const handleSaveShortNews = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      ...shortNewsForm,
      status: 'published'
    };

    if (editingShortNews) {
      updateShortNewsMutation.mutate({ ...data, id: editingShortNews.id });
    } else {
      createShortNewsMutation.mutate(data);
    }
  };

  const handleDeleteShortNews = (id: string) => {
    if (confirm("Are you sure you want to delete this update?")) {
      deleteShortNewsMutation.mutate(id);
    }
  };

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    let imageUrl = formData.get('imageUrl') as string;

    if (imageUploadType === 'file' && uploadedFile) {
      try {
        const uploadRes = await uploadFileMutation.mutateAsync(uploadedFile);
        imageUrl = uploadRes.url;
      } catch (err) {
        toast({ title: "Upload Error", description: "Failed to upload image", variant: "destructive" });
        return;
      }
    }

    const data = {
      title: formData.get('title'),
      imageUrl: imageUrl,
      linkUrl: formData.get('linkUrl'),
      location: formData.get('location'),
      active: formData.get('active') === 'on',
    };

    if (editingAd) {
      updateAdMutation.mutate({ ...data, id: editingAd.id });
    } else {
      createAdMutation.mutate(data);
    }
  };

  const handleDeleteAd = (id: string) => {
    if (confirm("Are you sure you want to delete this ad?")) {
      deleteAdMutation.mutate(id);
    }
  };

  const openAdEditor = (ad?: Ad) => {
    setEditingAd(ad || null);
    setImageUploadType('url');
    setUploadedFile(null);
    setIsAdSheetOpen(true);
  };

  const isVideo = (url: string) => {
    return url.match(/\.(mp4|webm|mov)$/i) || url.includes('/video/upload/');
  };

  const MediaItem = ({ media }: { media: any }) => {
    if (isVideo(media.url)) {
      return (
        <video
          src={media.url}
          className="w-full h-full object-cover"
          muted
          loop
          onMouseOver={(e) => e.currentTarget.play()}
          onMouseOut={(e) => e.currentTarget.pause()}
        />
      );
    }
    return <img src={media.url} alt={media.title} className="w-full h-full object-cover" />;
  };

  const Sidebar = () => (
    <div className="h-full flex flex-col bg-slate-900 text-slate-300 w-64">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <img src="/pklogo.png" alt="PKMedia logo" className="w-8 h-8 object-contain rounded-sm" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
        <h2 className="text-xl font-bold text-white tracking-tight">PKMedia Admin</h2>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Button 
          variant="ghost" 
          className={`w-full justify-start ${activeTab === 'overview' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
          onClick={() => setActiveTab('overview')}
        >
          <LayoutDashboard className="mr-2 h-4 w-4" /> Overview
        </Button>
        <Button 
          variant="ghost" 
          className={`w-full justify-start ${activeTab === 'articles' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
          onClick={() => setActiveTab('articles')}
        >
          <FileText className="mr-2 h-4 w-4" /> Articles
        </Button>
        <Button 
          variant="ghost" 
          className={`w-full justify-start ${activeTab === 'short-news' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
          onClick={() => setActiveTab('short-news')}
        >
          <Newspaper className="mr-2 h-4 w-4" /> Short News
        </Button>
        <Button 
          variant="ghost" 
          className={`w-full justify-start ${activeTab === 'media' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
          onClick={() => setActiveTab('media')}
        >
          <ImageIcon className="mr-2 h-4 w-4" /> Media Library
        </Button>
        <Button 
          variant="ghost" 
          className={`w-full justify-start ${activeTab === 'categories' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
          onClick={() => setActiveTab('categories')}
        >
          <Tags className="mr-2 h-4 w-4" /> Categories
        </Button>
        <Button 
          variant="ghost" 
          className={`w-full justify-start ${activeTab === 'tags' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
          onClick={() => setActiveTab('tags')}
        >
          <Tags className="mr-2 h-4 w-4" /> Tags
        </Button>
        <Button 
          variant="ghost" 
          className={`w-full justify-start ${activeTab === 'users' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
          onClick={() => setActiveTab('users')}
        >
          <Users className="mr-2 h-4 w-4" /> Users
        </Button>
        <Button 
          variant="ghost" 
          className={`w-full justify-start ${activeTab === 'comments' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
          onClick={() => setActiveTab('comments')}
        >
          <MessageSquare className="mr-2 h-4 w-4" /> Comments
        </Button>
        <Button 
          variant="ghost" 
          className={`w-full justify-start ${activeTab === 'newsletter' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
          onClick={() => setActiveTab('newsletter')}
        >
          <Mail className="mr-2 h-4 w-4" /> Newsletter
        </Button>
        <Button 
          variant="ghost" 
          className={`w-full justify-start ${activeTab === 'ads' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
          onClick={() => setActiveTab('ads')}
        >
          <Megaphone className="mr-2 h-4 w-4" /> Ads
        </Button>
        <Button 
          variant="ghost" 
          className={`w-full justify-start ${activeTab === 'settings' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings className="mr-2 h-4 w-4" /> Settings
        </Button>
      </nav>
      <div className="p-4 border-t border-slate-800">
        <Button 
          variant="destructive" 
          className="w-full justify-start"
          onClick={() => setLocation("/admin/login")}
        >
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>
    </div>
  );

  // Check admin authorization on load
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.status === 200) {
          const data = await res.json();
          if (mounted) {
            setAuthorized(data.user?.role === 'admin');
            if (data.user?.role !== 'admin') {
              setLocation('/admin/login');
            }
          }
        } else {
          if (mounted) {
            setAuthorized(false);
            setLocation('/admin/login');
          }
        }
      } catch (err) {
        if (mounted) {
          setAuthorized(false);
          setLocation('/admin/login');
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <header className="bg-white border-b h-16 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64 border-r-0">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Navigation Menu</SheetTitle>
                    <SheetDescription>Main navigation links for the admin dashboard.</SheetDescription>
                  </SheetHeader>
                  <Sidebar />
                </SheetContent>
              </Sheet>
            </div>
            <h1 className="text-xl font-bold text-slate-800 capitalize">{activeTab}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/">
               <Button variant="outline" size="sm">View Site</Button>
            </Link>
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
              A
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Articles</p>
                      <h3 className="text-3xl font-bold mt-2">{articles.length}</h3>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                      <FileText className="h-6 w-6" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Categories</p>
                      <h3 className="text-3xl font-bold mt-2">{categories.length}</h3>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full text-green-600">
                      <Tags className="h-6 w-6" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Readers</p>
                      <h3 className="text-3xl font-bold mt-2">1.2k</h3>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                      <Users className="h-6 w-6" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">New Posts (24h)</p>
                      <h3 className="text-3xl font-bold mt-2">{recentPostsCount}</h3>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-full text-orange-600">
                      <BarChart3 className="h-6 w-6" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Traffic Overview</CardTitle>
                        <CardDescription>Daily unique visitors over the last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 w-full flex items-end gap-1 justify-between px-2">
                            {trafficStats.length > 0 ? trafficStats.map((stat: any, i: number) => {
                                const maxVisitors = Math.max(...trafficStats.map((s: any) => s.visitors), 10); // Scale based on max, min 10
                                const height = Math.min((stat.visitors / maxVisitors) * 100, 100);
                                const displayHeight = Math.max(height, 4); // Min height for visibility
                                
                                return (
                                    <div key={i} className="w-full bg-gradient-to-t from-[#1e3a8a] to-[#60a5fa] hover:from-[#1e40af] hover:to-[#93c5fd] transition-all rounded-t relative group" style={{ height: `${displayHeight}%` }}>
                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                                            <p className="font-bold">{stat.visitors} Visitors</p>
                                            <p className="text-[10px] opacity-80">{new Date(stat.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                                        </div>
                                    </div>
                                );
                            }) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                No traffic data available yet.
                              </div>
                            )}
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-4 px-2">
                            <span>30 Days Ago</span>
                            <span>Today</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {recentActivity.length > 0 ? recentActivity.map((item, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className={`mt-1 ${item.color}`}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-slate-900">{item.action}</p>
                                        <p className="text-xs text-muted-foreground">{item.detail}</p>
                                    </div>
                                    <div className="ml-auto text-xs text-muted-foreground">
                                        {formatTimeAgo(item.time)}
                                    </div>
                                </div>
                            )) : (
                              <div className="text-center text-muted-foreground py-4">No recent activity</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>System Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                        <TrendingUp className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Server Load</p>
                                        <p className="text-xs text-muted-foreground">Memory Usage</p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-slate-700">
                                  {systemStatus ? `${systemStatus.memoryUsage} MB` : '...'}
                                </span>
                            </div>
                             <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Uptime</p>
                                        <p className="text-xs text-muted-foreground">Since last restart</p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-slate-700">
                                  {systemStatus ? formatUptime(systemStatus.uptime) : '...'}
                                </span>
                            </div>
                             <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${flaggedCommentsCount > 0 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                                        <Shield className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Security</p>
                                        <p className="text-xs text-muted-foreground">Flagged Content</p>
                                    </div>
                                </div>
                                <Badge variant="outline" className={flaggedCommentsCount > 0 ? "text-red-600 bg-red-50 border-red-200" : "text-green-600 bg-green-50 border-green-200"}>
                                  {flaggedCommentsCount > 0 ? `${flaggedCommentsCount} Threats` : 'Secure'}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ARTICLES TAB */}
          {activeTab === 'articles' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex items-center justify-between">
                <div className="relative w-72">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search articles..." className="pl-8" />
                </div>
                <Button className="bg-primary hover:bg-primary/90" onClick={() => openArticleEditor()}>
                  <Plus className="mr-2 h-4 w-4" /> Add Article
                </Button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Likes</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {articles.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell className="font-medium max-w-md truncate">{article.title}</TableCell>
                        <TableCell><Badge variant="outline">{article.category}</Badge></TableCell>
                        <TableCell>{article.author}</TableCell>
                        <TableCell>{article.views || 0}</TableCell>
                        <TableCell>{article.likes || 0}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                            Published
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openArticleEditor(article)}>
                            <Pencil className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteArticle(article.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          {/* SHORT NEWS TAB */}
          {activeTab === 'short-news' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Short News</h2>
                  <p className="text-sm text-muted-foreground">Quick updates and breaking news briefs</p>
                </div>
                <Button className="bg-primary hover:bg-primary/90" onClick={() => openShortNewsEditor()}>
                  <Plus className="mr-2 h-4 w-4" /> Add Update
                </Button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Content</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Likes</TableHead>
                      <TableHead>Pinned</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shortNews.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No short news updates yet. Create your first one!
                        </TableCell>
                      </TableRow>
                    ) : (
                      shortNews.map((news: any) => (
                        <TableRow key={news.id}>
                          <TableCell className="max-w-md">
                            <p className="line-clamp-2">{news.content}</p>
                          </TableCell>
                          <TableCell><Badge variant="outline">{news.category}</Badge></TableCell>
                          <TableCell>{news.author}</TableCell>
                          <TableCell>{news.views || 0}</TableCell>
                          <TableCell>{news.likes || 0}</TableCell>
                          <TableCell>
                            {news.isPinned ? (
                              <Pin className="h-4 w-4 text-primary" />
                            ) : (
                              <PinOff className="h-4 w-4 text-muted-foreground" />
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(news.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => openShortNewsEditor(news)}>
                              <Pencil className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteShortNews(news.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          {/* MEDIA TAB */}
          {activeTab === 'media' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="flex justify-between items-center">
                      <h2 className="text-lg font-bold">Media Library</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {[
                        ...articles.filter((a: any) => a.image).map((a: any) => ({ type: 'article', id: a.id, url: a.image, title: a.title, item: a })),
                        ...ads.filter((a: any) => a.imageUrl).map((a: any) => ({ type: 'ad', id: a.id, url: a.imageUrl, title: a.title, item: a }))
                      ].map((media, i) => (
                          <div key={`${media.type}-${media.id}-${i}`} className="group relative aspect-square bg-slate-100 rounded-lg overflow-hidden border hover:border-primary cursor-pointer">
                              <MediaItem media={media} />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2 text-center">
                                  <p className="text-white text-xs font-medium line-clamp-2 mb-1">{media.title}</p>
                                  <div className="flex gap-2">
                                    <Button 
                                        variant="secondary" 
                                        size="icon" 
                                        className="h-8 w-8"
                                        onClick={() => media.type === 'article' ? openArticleEditor(media.item) : openAdEditor(media.item)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                        variant="destructive" 
                                        size="icon" 
                                        className="h-8 w-8"
                                        onClick={() => media.type === 'article' ? handleDeleteArticle(media.item.id) : handleDeleteAd(media.item.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <Badge variant="outline" className="text-white border-white/50 mt-2 text-[10px] h-5">
                                    {media.type === 'article' ? 'Article' : 'Ad'}
                                  </Badge>
                              </div>
                          </div>
                      ))}
                      {articles.length === 0 && ads.length === 0 && (
                          <div className="col-span-full text-center py-10 text-muted-foreground">
                              No media found.
                          </div>
                      )}
                  </div>
              </div>
          )}

          {/* CATEGORIES TAB */}
          {activeTab === 'categories' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="flex justify-between items-center">
                      <h2 className="text-lg font-bold">Manage Categories</h2>
                      <div className="flex gap-2">
                          <Input 
                            placeholder="New Category Name" 
                            className="w-64" 
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                          />
                          <Button onClick={handleAddCategory} disabled={createCategoryMutation.isPending}>
                            <Plus className="mr-2 h-4 w-4" /> Add
                          </Button>
                      </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categories.map((cat: any) => (
                          <Card key={cat.id} className="group hover:border-primary transition-colors">
                              <CardContent className="p-4 flex justify-between items-center">
                                  <span className="font-medium">{cat.name}</span>
                                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-red-500"
                                        onClick={() => {
                                          if(confirm('Delete category?')) deleteCategoryMutation.mutate(cat.id);
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                  </div>
                              </CardContent>
                          </Card>
                      ))}
                  </div>
              </div>
          )}

          {/* TAGS TAB */}
          {activeTab === 'tags' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="flex justify-between items-center">
                      <h2 className="text-lg font-bold">Manage Tags</h2>
                      <div className="flex gap-2">
                          <Input 
                            placeholder="New Tag Name" 
                            className="w-64" 
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && newTagName.trim()) {
                                handleAddTag();
                              }
                            }}
                          />
                          <Button onClick={handleAddTag} disabled={createTagMutation.isPending}>
                            <Plus className="mr-2 h-4 w-4" /> Add
                          </Button>
                      </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {availableTags.map((tag: any) => (
                          <Card key={tag.id} className="group hover:border-primary transition-colors">
                              <CardContent className="p-3 flex justify-between items-center">
                                  <Badge variant="secondary" className="text-sm">{tag.name}</Badge>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                      if(confirm(`Delete tag "${tag.name}"?`)) deleteTagMutation.mutate(tag.id);
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                              </CardContent>
                          </Card>
                      ))}
                      {availableTags.length === 0 && (
                        <div className="col-span-full text-center py-10 text-muted-foreground">
                          No tags yet. Add your first tag above.
                        </div>
                      )}
                  </div>
              </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="flex justify-between items-center">
                      <h2 className="text-lg font-bold">User Management</h2>
                      <Button><Plus className="mr-2 h-4 w-4" /> Add User</Button>
                  </div>
                  <Card>
                      <CardContent className="p-0">
                          <Table>
                              <TableHeader>
                                  <TableRow>
                                      <TableHead>User</TableHead>
                                      <TableHead>Role</TableHead>
                                      <TableHead>Status</TableHead>
                                      <TableHead className="text-right">Actions</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {users.map((user) => (
                                      <TableRow key={user.id}>
                                          <TableCell className="flex items-center gap-3">
                                              <Avatar className="h-8 w-8">
                                                  <AvatarImage src={`https://i.pravatar.cc/150?u=${user.id}`} />
                                                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                              </Avatar>
                                              <div>
                                                  <p className="font-medium text-sm">{user.name}</p>
                                                  <p className="text-xs text-muted-foreground">{user.email}</p>
                                              </div>
                                          </TableCell>
                                          <TableCell>
                                              <Badge variant="outline">{user.role}</Badge>
                                          </TableCell>
                                          <TableCell>
                                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                  user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                                              }`}>
                                                  <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-slate-500'}`}></span>
                                                  {user.status}
                                              </span>
                                          </TableCell>
                                          <TableCell className="text-right">
                                              <Button variant="ghost" size="sm">Edit</Button>
                                          </TableCell>
                                      </TableRow>
                                  ))}
                              </TableBody>
                          </Table>
                      </CardContent>
                  </Card>
              </div>
          )}

          {/* COMMENTS TAB */}
          {activeTab === 'comments' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="flex justify-between items-center">
                      <h2 className="text-lg font-bold">Latest Comments ({comments.length})</h2>
                      <div className="flex gap-2">
                          <Button 
                            variant={commentFilter === 'all' ? 'default' : 'outline'} 
                            size="sm"
                            onClick={() => setCommentFilter('all')}
                          >
                            All
                          </Button>
                          <Button 
                            variant={commentFilter === 'pending' ? 'default' : 'outline'} 
                            size="sm" 
                            className={commentFilter === 'pending' ? "bg-yellow-500 text-white hover:bg-yellow-600" : "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"}
                            onClick={() => setCommentFilter('pending')}
                          >
                            Pending
                          </Button>
                      </div>
                  </div>
                  <div className="space-y-4">
                      {comments.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                          No comments found.
                        </div>
                      ) : (
                        comments
                          .filter((c: any) => commentFilter === 'all' || c.status?.toLowerCase() === 'pending')
                          .map((comment: any) => (
                          <Card key={comment.id} className={comment.status === 'Flagged' ? 'border-red-200 bg-red-50/30' : ''}>
                              <CardContent className="p-4">
                                  <div className="flex justify-between items-start mb-2">
                                      <div className="flex items-center gap-2">
                                          <span className="font-bold text-sm">{comment.userName}</span>
                                          <span className="text-xs text-muted-foreground">• {new Date(comment.createdAt).toLocaleDateString()}</span>
                                          <span className="text-xs text-muted-foreground">on <span className="text-primary font-medium">{getArticleTitle(comment.articleId)}</span></span>
                                      </div>
                                      <Badge variant={
                                          comment.status === 'Approved' ? 'default' : 
                                          comment.status === 'Flagged' ? 'destructive' : 'secondary'
                                      }>
                                          {comment.status}
                                      </Badge>
                                  </div>
                                  <p className="text-sm text-slate-700 mb-4 bg-slate-50 p-3 rounded border border-slate-100">
                                      "{comment.content}"
                                  </p>
                                  <div className="flex gap-2 justify-end">
                                      {comment.status?.toLowerCase() === 'pending' && (
                                          <>
                                              <Button 
                                                size="sm" 
                                                variant="outline" 
                                                className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                                onClick={() => updateCommentStatusMutation.mutate({ id: comment.id, status: 'Approved' })}
                                                disabled={updateCommentStatusMutation.isPending}
                                              >
                                                  <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                                              </Button>
                                              <Button 
                                                size="sm" 
                                                variant="outline" 
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                                onClick={() => updateCommentStatusMutation.mutate({ id: comment.id, status: 'Flagged' })}
                                                disabled={updateCommentStatusMutation.isPending}
                                              >
                                                  <XCircle className="w-4 h-4 mr-1" /> Reject
                                              </Button>
                                          </>
                                      )}
                                      <Button size="sm" variant="ghost" className="text-slate-500">
                                          Reply
                                      </Button>
                                  </div>
                              </CardContent>
                          </Card>
                      ))
                    )}
                  </div>
              </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
              <div className="space-y-8 max-w-4xl animate-in fade-in duration-500">
                  
                  {/* General Settings */}
                  <Card>
                      <CardHeader>
                          <CardTitle>General Settings</CardTitle>
                          <CardDescription>Manage core site configuration and SEO.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                  <Label htmlFor="siteName">Site Name</Label>
                                  <Input id="siteName" defaultValue="PKMedia" />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="contactEmail">Contact Email</Label>
                                  <Input id="contactEmail" defaultValue="contact@pkmedia.com" />
                              </div>
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="description">Site Description (Meta)</Label>
                              <Textarea id="description" defaultValue="Your trusted source for breaking news, politics, business, and sports from PKMedia and beyond." />
                          </div>
                      </CardContent>
                  </Card>

                  {/* Social Media */}
                  <Card>
                      <CardHeader>
                          <CardTitle>Social Media Links</CardTitle>
                          <CardDescription>Connect your social profiles to the footer.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                  <Label htmlFor="facebook">Facebook URL</Label>
                                  <Input id="facebook" placeholder="https://facebook.com/..." />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="twitter">Twitter (X) URL</Label>
                                  <Input id="twitter" placeholder="https://twitter.com/..." />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="instagram">Instagram URL</Label>
                                  <Input id="instagram" placeholder="https://instagram.com/..." />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="youtube">YouTube URL</Label>
                                  <Input id="youtube" placeholder="https://youtube.com/..." />
                              </div>
                          </div>
                      </CardContent>
                  </Card>

                  {/* Content & Comments */}
                  <Card>
                      <CardHeader>
                          <CardTitle>Content Configuration</CardTitle>
                          <CardDescription>Control how content is displayed and managed.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                          <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                  <Label className="text-base">Enable Comments</Label>
                                  <p className="text-sm text-muted-foreground">Allow users to comment on articles.</p>
                              </div>
                              <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                  <Label className="text-base">Auto-Moderation</Label>
                                  <p className="text-sm text-muted-foreground">Automatically hide comments with filtered keywords.</p>
                              </div>
                              <Switch defaultChecked />
                          </div>
                           <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                  <Label className="text-base">Breaking News Ticker</Label>
                                  <p className="text-sm text-muted-foreground">Show the scrolling ticker on the homepage.</p>
                              </div>
                              <Switch defaultChecked />
                          </div>
                      </CardContent>
                  </Card>

                  {/* Admin Profile */}
                  <Card>
                      <CardHeader>
                          <CardTitle>Admin Profile</CardTitle>
                          <CardDescription>Update your login credentials.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <div className="space-y-2">
                              <Label htmlFor="new-password">New Password</Label>
                              <Input id="new-password" type="password" />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="confirm-password">Confirm New Password</Label>
                              <Input id="confirm-password" type="password" />
                          </div>
                          <Button 
                              onClick={handleSaveSettings}
                              disabled={isSaving}
                          >
                              {isSaving ? "Saving..." : "Save All Changes"}
                          </Button>
                      </CardContent>
                  </Card>
              </div>
          )}

          {/* NEWSLETTER TAB */}
          {activeTab === 'newsletter' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              {/* Newsletter Composer Card */}
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5" />
                    Newsletter Composer
                  </CardTitle>
                  <CardDescription>
                    Create and send targeted newsletters to your subscribers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Newsletter Type */}
                    <div className="space-y-2">
                      <Label htmlFor="newsletter-type">Newsletter Type</Label>
                      <Select 
                        defaultValue="latest"
                        onValueChange={(value) => {
                          const selectEl = document.getElementById('newsletter-type') as any;
                          if (selectEl) selectEl.dataset.value = value;
                        }}
                      >
                        <SelectTrigger id="newsletter-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="latest">Latest Articles (All Categories)</SelectItem>
                          <SelectItem value="breaking">Breaking News Alert</SelectItem>
                          <SelectItem value="politics">Politics Newsletter</SelectItem>
                          <SelectItem value="business">Business Newsletter</SelectItem>
                          <SelectItem value="sports">Sports Newsletter</SelectItem>
                          <SelectItem value="entertainment">Entertainment Newsletter</SelectItem>
                          <SelectItem value="technology">Technology Newsletter</SelectItem>
                          <SelectItem value="health">Health Newsletter</SelectItem>
                          <SelectItem value="lifestyle">Lifestyle Newsletter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Template Style */}
                    <div className="space-y-2">
                      <Label htmlFor="template-style">Template Style</Label>
                      <Select 
                        defaultValue="featured"
                        onValueChange={(value) => {
                          const selectEl = document.getElementById('template-style') as any;
                          if (selectEl) selectEl.dataset.value = value;
                        }}
                      >
                        <SelectTrigger id="template-style">
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="featured">Featured Story (Large hero image)</SelectItem>
                          <SelectItem value="grid">Grid Layout (2 columns)</SelectItem>
                          <SelectItem value="compact">Compact List (Text-focused)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Number of Articles */}
                  <div className="space-y-2">
                    <Label htmlFor="article-count">Number of Articles</Label>
                    <Select defaultValue="5">
                      <SelectTrigger id="article-count">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 Articles</SelectItem>
                        <SelectItem value="5">5 Articles</SelectItem>
                        <SelectItem value="7">7 Articles</SelectItem>
                        <SelectItem value="10">10 Articles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Preview Note */}
                  <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800 dark:text-blue-300">
                      <p className="font-medium">Newsletter will include:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Articles from selected category/type</li>
                        <li>Professional email template with your branding</li>
                        <li>Direct links to full articles</li>
                        <li>Unsubscribe option for recipients</li>
                      </ul>
                    </div>
                  </div>

                  {/* Send Button */}
                  <Button 
                    onClick={async () => {
                      const typeEl = document.getElementById('newsletter-type') as any;
                      const templateEl = document.getElementById('template-style') as any;
                      const countEl = document.getElementById('article-count') as any;
                      
                      const newsletterType = typeEl?.dataset.value || 'latest';
                      const templateStyle = templateEl?.dataset.value || 'featured';
                      const articleCount = parseInt(countEl?.textContent?.match(/\d+/)?.[0] || '5');
                      
                      const categoryMap: Record<string, string> = {
                        'latest': '',
                        'breaking': 'breaking-news',
                        'politics': 'politics',
                        'business': 'business',
                        'sports': 'sports',
                        'entertainment': 'entertainment',
                        'technology': 'technology',
                        'health': 'health',
                        'lifestyle': 'lifestyle'
                      };
                      
                      const category = categoryMap[newsletterType];
                      const isBreaking = newsletterType === 'breaking';
                      
                      if (!confirm(`Send ${newsletterType === 'latest' ? 'latest articles' : newsletterType} newsletter to all active subscribers?`)) return;
                      
                      try {
                        const response = await fetch('/api/newsletter/send', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          credentials: 'include',
                          body: JSON.stringify({
                            category: category,
                            template: templateStyle,
                            count: articleCount,
                            type: isBreaking ? 'breaking_news' : 'daily_digest'
                          })
                        });
                        
                        if (!response.ok) {
                          const errorData = await response.text();
                          let errorMsg = 'Failed to send newsletter';
                          try {
                            const parsed = JSON.parse(errorData);
                            errorMsg = parsed.error || parsed.message || errorMsg;
                          } catch {
                            errorMsg = errorData || errorMsg;
                          }
                          throw new Error(errorMsg);
                        }
                        
                        const data = await response.json();
                        toast({ 
                          title: "Newsletter sent!",
                          description: `Sent to ${data.success} subscribers. ${data.failed > 0 ? `${data.failed} failed.` : ''}`
                        });
                        queryClient.invalidateQueries({ queryKey: ['/api/newsletter/subscribers'] });
                      } catch (error: any) {
                        console.error('Newsletter send error:', error);
                        const errorMessage = error?.message || "Failed to send newsletter";
                        toast({ 
                          title: "Error sending newsletter", 
                          description: errorMessage,
                          variant: "destructive" 
                        });
                      }
                    }}
                    className="w-full bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    <Megaphone className="mr-2 h-5 w-5" /> 
                    Send Newsletter to {subscribers.filter((s: any) => s.status === 'active').length} Active Subscribers
                  </Button>
                </CardContent>
              </Card>

              {/* Subscribers List */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-bold">Newsletter Subscribers</h2>
                  <Badge variant="secondary">{subscribers.length} Total</Badge>
                  <Badge variant="default">
                    {subscribers.filter((s: any) => s.status === 'active').length} Active
                  </Badge>
                </div>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Subscribed</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscribers.map((subscriber: any) => (
                        <TableRow key={subscriber.id}>
                          <TableCell className="font-medium">{subscriber.email}</TableCell>
                          <TableCell>{subscriber.name || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={subscriber.status === 'active' ? 'default' : 'secondary'}>
                              {subscriber.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(subscriber.subscribedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                if (confirm(`Delete subscriber ${subscriber.email}?`)) {
                                  try {
                                    await apiRequest(`/api/newsletter/subscribers/${subscriber.id}`, {
                                      method: 'DELETE',
                                    });
                                    queryClient.invalidateQueries({ queryKey: ['/api/newsletter/subscribers'] });
                                    toast({ title: "Subscriber deleted" });
                                  } catch (error) {
                                    toast({ 
                                      title: "Error", 
                                      description: "Failed to delete subscriber",
                                      variant: "destructive" 
                                    });
                                  }
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {subscribers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No subscribers yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ADS TAB */}
          {activeTab === 'ads' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Manage Advertisements</h2>
                <Button className="bg-primary hover:bg-primary/90" onClick={() => openAdEditor()}>
                  <Plus className="mr-2 h-4 w-4" /> Create Ad
                </Button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ads.map((ad) => (
                      <TableRow key={ad.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <img src={ad.imageUrl} alt={ad.title} className="w-10 h-10 object-cover rounded" />
                            <span>{ad.title}</span>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline">{ad.location}</Badge></TableCell>
                        <TableCell>
                          <Badge variant={ad.active ? "default" : "secondary"} className={ad.active ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}>
                            {ad.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openAdEditor(ad)}>
                            <Pencil className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteAd(ad.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Article Editor Dialog */}
      <Dialog open={isArticleSheetOpen} onOpenChange={setIsArticleSheetOpen}>
        <DialogContent className="max-w-7xl h-[90vh] p-0 gap-0">
          <div className="h-full flex flex-col">
            <DialogHeader className="px-8 py-6 border-b bg-slate-50">
              <DialogTitle className="text-2xl">{editingArticle ? "Edit Article" : "Create New Article"}</DialogTitle>
              <DialogDescription>
                {editingArticle ? "Make changes to your article below." : "Fill in the details to publish a new article."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveArticle} className="flex-1 flex flex-col">
              <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Navigation */}
                <div className="w-56 border-r bg-slate-50/50 p-6 overflow-y-auto">
                  <nav className="space-y-1">
                    <div 
                      className={`block px-4 py-3 text-sm font-medium rounded-lg transition-colors ${currentStep >= 1 ? 'text-primary bg-white' : 'text-slate-400 cursor-not-allowed'}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400'}`}>
                          {currentStep > 1 ? '✓' : '1'}
                        </span>
                        Basic Info
                      </span>
                    </div>
                    <div 
                      className={`block px-4 py-3 text-sm font-medium rounded-lg transition-colors ${currentStep >= 2 ? 'text-primary bg-white' : 'text-slate-400 cursor-not-allowed'}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400'}`}>
                          {currentStep > 2 ? '✓' : '2'}
                        </span>
                        Featured Media
                      </span>
                    </div>
                    <div 
                      className={`block px-4 py-3 text-sm font-medium rounded-lg transition-colors ${currentStep >= 3 ? 'text-primary bg-white' : 'text-slate-400 cursor-not-allowed'}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentStep >= 3 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400'}`}>
                          {currentStep > 3 ? '✓' : '3'}
                        </span>
                        Slideshow Images
                      </span>
                    </div>
                    <div 
                      className={`block px-4 py-3 text-sm font-medium rounded-lg transition-colors ${currentStep >= 4 ? 'text-primary bg-white' : 'text-slate-400 cursor-not-allowed'}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentStep >= 4 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400'}`}>
                          {currentStep > 4 ? '✓' : '4'}
                        </span>
                        Content
                      </span>
                    </div>
                    <div 
                      className={`block px-4 py-3 text-sm font-medium rounded-lg transition-colors ${currentStep >= 5 ? 'text-primary bg-white' : 'text-slate-400 cursor-not-allowed'}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentStep >= 5 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400'}`}>
                          {currentStep > 5 ? '✓' : '5'}
                        </span>
                        Publishing
                      </span>
                    </div>
                  </nav>
                </div>

                {/* Main Form Content */}
                <div className="flex-1 overflow-y-auto px-8 py-6">
                  <div className="max-w-4xl mx-auto w-full">
                
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                <div id="basic-info" className="mb-8 scroll-mt-6">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">1</span>
                    Basic Information
                  </h3>
                  <div className="space-y-4 pl-8">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-base font-semibold">Article Title *</Label>
                      <Input 
                        id="title" 
                        name="title" 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="Enter a compelling headline that captures attention" 
                        required 
                        className="text-lg py-6 font-serif"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-base font-semibold">Category *</Label>
                        <Combobox
                          value={formData.category || ""}
                          onValueChange={(value) => setFormData({...formData, category: value})}
                          options={categories.map((cat: any) => ({
                            value: cat.name,
                            label: cat.name
                          }))}
                          placeholder="Select or type category"
                          searchPlaceholder="Type to search categories..."
                          emptyText="No category found."
                          className="py-6"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="author" className="text-base font-semibold">Author Name *</Label>
                        <Input 
                          id="author" 
                          name="author" 
                          value={formData.author}
                          onChange={(e) => setFormData({...formData, author: e.target.value})}
                          placeholder="Your name" 
                          className="py-6"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tags" className="text-base font-semibold flex items-center gap-2">
                        <Tags className="w-4 h-4" />
                        Tags
                      </Label>
                      <p className="text-sm text-muted-foreground">Add relevant tags to help readers discover your article</p>
                      
                      {/* Tag Input with Suggestions */}
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <Input 
                            id="tags" 
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && tagInput.trim()) {
                                e.preventDefault();
                                if (!formData.tags.includes(tagInput.trim())) {
                                  setFormData({...formData, tags: [...formData.tags, tagInput.trim()]});
                                }
                                setTagInput('');
                              }
                            }}
                            placeholder="Type a tag and press Enter" 
                            className="py-6"
                          />
                        </div>
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => {
                            if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
                              setFormData({...formData, tags: [...formData.tags, tagInput.trim()]});
                              setTagInput('');
                            }
                          }}
                          className="px-6 py-6"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* Available Tags from Database */}
                      {availableTags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs text-muted-foreground">Available tags:</span>
                          {availableTags.map((tag: any) => (
                            <Button
                              key={tag.id}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (!formData.tags.includes(tag.name)) {
                                  setFormData({...formData, tags: [...formData.tags, tag.name]});
                                }
                              }}
                              className="text-xs h-7"
                            >
                              {tag.name}
                            </Button>
                          ))}
                        </div>
                      )}
                      
                      {/* Selected Tags */}
                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg border">
                          {formData.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                              {tag}
                              <button
                                type="button"
                                onClick={() => setFormData({...formData, tags: formData.tags.filter((_, i) => i !== index)})}
                                className="ml-2 hover:text-destructive"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end mt-6">
                      <Button 
                        type="button" 
                        onClick={() => {
                          if (formData.title && formData.category && formData.author) {
                            setCurrentStep(2);
                          } else {
                            toast({ title: "Missing Information", description: "Please fill in all required fields", variant: "destructive" });
                          }
                        }}
                        className="px-8 py-6 text-base"
                      >
                        Next: Featured Media →
                      </Button>
                    </div>
                  </div>
                </div>
                )}

                {/* Step 2: Featured Media */}
                {currentStep === 2 && (
                <div id="featured-media" className="mb-8 scroll-mt-6">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">2</span>
                    Featured Image or Video
                  </h3>
                  <div className="space-y-4 pl-8">
                    <div className="flex gap-3">
                      <Button 
                        type="button"
                        variant={imageUploadType === 'url' ? 'default' : 'outline'}
                        onClick={() => setImageUploadType('url')}
                        className="flex-1"
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Image URL
                      </Button>
                      <Button 
                        type="button"
                        variant={imageUploadType === 'file' ? 'default' : 'outline'}
                        onClick={() => setImageUploadType('file')}
                        className="flex-1"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload File
                      </Button>
                    </div>

                    {imageUploadType === 'url' ? (
                      <div className="space-y-3">
                        <Input 
                          id="image" 
                          name="image" 
                          value={formData.image}
                          onChange={(e) => setFormData({...formData, image: e.target.value})}
                          placeholder="https://example.com/image.jpg" 
                          className="py-6"
                        />
                        <div>
                          <Label htmlFor="imageAttribution" className="text-sm font-medium">
                            Image Attribution / Photo Credit
                          </Label>
                          <Input 
                            id="imageAttribution" 
                            name="imageAttribution" 
                            value={formData.imageAttribution}
                            onChange={(e) => setFormData({...formData, imageAttribution: e.target.value})}
                            placeholder="e.g., Photo by John Doe/Reuters or Unsplash" 
                            className="mt-1"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Required for images not owned by PKMedia. Use format: "Photo by [Name]/[Source]"
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="border-2 border-dashed border-primary/30 rounded-xl p-8 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer relative">
                          <input 
                            type="file" 
                            accept="image/*,video/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => {
                              if (e.target.files?.[0]) setUploadedFile(e.target.files[0]);
                            }}
                          />
                          <div className="text-center">
                            <Upload className="h-12 w-12 text-primary mx-auto mb-3" />
                            <p className="text-base font-semibold text-slate-900 mb-1">
                              {uploadedFile ? uploadedFile.name : "Click to upload or drag and drop"}
                            </p>
                            <p className="text-sm text-muted-foreground">Images or Videos (max. 50MB)</p>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="imageAttribution" className="text-sm font-medium">
                            Image Attribution / Photo Credit
                          </Label>
                          <Input 
                            id="imageAttribution" 
                            name="imageAttribution" 
                            value={formData.imageAttribution}
                            onChange={(e) => setFormData({...formData, imageAttribution: e.target.value})}
                            placeholder="e.g., Photo by John Doe/Reuters or Unsplash" 
                            className="mt-1"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Required for images not owned by PKMedia. Use format: "Photo by [Name]/[Source]"
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between mt-6 pt-4 border-t">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                        className="px-8 py-6 text-base"
                      >
                        ← Back
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => {
                          if ((imageUploadType === 'url' && formData.image) || (imageUploadType === 'file' && uploadedFile)) {
                            setCurrentStep(3);
                          } else {
                            toast({ title: "Missing Media", description: "Please add a featured image or video", variant: "destructive" });
                          }
                        }}
                        className="px-8 py-6 text-base"
                      >
                        Next: Slideshow Images →
                      </Button>
                    </div>
                  </div>
                </div>
                )}

                {/* Step 3: Slideshow Images */}
                {currentStep === 3 && (
                <div id="slideshow-images" className="mb-8 scroll-mt-6">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">3</span>
                    Slideshow Images
                  </h3>
                  <div className="space-y-4 pl-8">
                    <p className="text-sm text-muted-foreground">
                      Add additional images to create a slideshow at the top of your article (Optional)
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* URL Input */}
                      <div className="flex gap-2">
                        <Input 
                          value={additionalImageUrl}
                          onChange={(e) => setAdditionalImageUrl(e.target.value)}
                          placeholder="Paste image URL" 
                          className="flex-1"
                        />
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => {
                            if (additionalImageUrl.trim()) {
                              setFormData({...formData, images: [...formData.images, additionalImageUrl.trim()]});
                              setAdditionalImageUrl('');
                            }
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                      
                      {/* File Upload - Multiple files */}
                      <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer relative">
                        <input 
                          type="file" 
                          accept="image/*,video/*"
                          multiple
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={async (e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length > 0) {
                              for (const file of files) {
                                try {
                                  const uploadRes = await uploadFileMutation.mutateAsync(file);
                                  if (uploadRes.url) {
                                    setFormData(prev => ({...prev, images: [...prev.images, uploadRes.url]}));
                                  }
                                } catch (err) {
                                  toast({ title: "Upload Error", description: `Failed to upload ${file.name}`, variant: "destructive" });
                                }
                              }
                            }
                            e.target.value = '';
                          }}
                        />
                        <div className="text-center pointer-events-none">
                          <Upload className="h-8 w-8 text-primary mx-auto mb-2" />
                          <p className="text-sm font-medium text-slate-700">Upload from computer</p>
                          <p className="text-xs text-slate-500">Multiple files supported</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Display added images */}
                    {formData.images.length > 0 && (
                      <div className="mt-4 bg-slate-50 p-4 rounded-lg border">
                        <p className="text-sm text-muted-foreground mb-3">{formData.images.length} image(s) added</p>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {formData.images.map((img, index) => (
                            <div key={index} className="relative group flex-shrink-0 w-24 h-24 bg-slate-100 rounded-lg overflow-hidden border-2">
                              <img src={img} alt={`${index + 1}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setFormData({...formData, images: formData.images.filter((_, i) => i !== index)})}
                                className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between mt-6">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setCurrentStep(2)}
                        className="px-8 py-6 text-base"
                      >
                        ← Back
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => setCurrentStep(4)}
                        className="px-8 py-6 text-base"
                      >
                        Next: Article Content →
                      </Button>
                    </div>
                  </div>
                </div>
                )}

                {/* Step 4: Article Content */}
                {currentStep === 4 && (
                <div id="article-content" className="mb-8 scroll-mt-6">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">4</span>
                    Article Content
                  </h3>
                  <div className="space-y-3 pl-8">
                    <p className="text-sm text-muted-foreground">
                      Write your article using the rich text editor. You can format text, add images, and embed videos.
                    </p>
                    <div className="border rounded-lg overflow-hidden" style={{ height: '500px' }}>
                      <RichTextEditor 
                        value={articleContent}
                        onChange={setArticleContent}
                        placeholder="Start writing your article... Use the toolbar to format text, insert images, and add videos."
                        className="h-full"
                        onImageUpload={async (file) => {
                          const uploadRes = await uploadFileMutation.mutateAsync(file);
                          return uploadRes.url;
                        }}
                      />
                    </div>
                    
                    <div className="flex justify-between mt-6">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setCurrentStep(3)}
                        className="px-8 py-6 text-base"
                      >
                        ← Back
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => {
                          if (articleContent.trim()) {
                            setCurrentStep(5);
                          } else {
                            toast({ title: "Missing Content", description: "Please write your article content", variant: "destructive" });
                          }
                        }}
                        className="px-8 py-6 text-base"
                      >
                        Next: Publishing Options →
                      </Button>
                    </div>
                  </div>
                </div>
                )}

                {/* Step 5: Publishing Options */}
                {currentStep === 5 && (
                <div id="publishing-options" className="mb-6 scroll-mt-6">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">5</span>
                    Publishing Options
                  </h3>
                  <div className="pl-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2">
                      <div className="flex items-center gap-3 p-4 bg-white rounded-lg border hover:border-primary/50 transition-colors">
                        <Switch id="featured" name="featured" defaultChecked={editingArticle?.featured} />
                        <div>
                          <Label htmlFor="featured" className="text-base font-semibold cursor-pointer">Featured Story</Label>
                          <p className="text-xs text-muted-foreground">Highlight on homepage</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-white rounded-lg border hover:border-red-500/50 transition-colors">
                        <Switch id="breaking" name="breaking" defaultChecked={editingArticle?.isBreaking} />
                        <div>
                          <Label htmlFor="breaking" className="text-base font-semibold cursor-pointer text-red-600">Breaking News</Label>
                          <p className="text-xs text-muted-foreground">Show in ticker</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between mt-6">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setCurrentStep(4)}
                        className="px-8 py-6 text-base"
                      >
                        ← Back
                      </Button>
                    </div>
                  </div>
                </div>
                )}

                </div>
                </div>
              </div>

              {currentStep === 5 && (
              <div className="flex gap-4 px-8 py-6 border-t bg-slate-50 shadow-lg">
                <Button type="button" variant="outline" className="px-8 py-6 text-base" onClick={() => setIsArticleSheetOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 py-6 text-lg font-bold shadow-lg">
                  {editingArticle ? "Update Article" : "Publish Article"}
                </Button>
              </div>
              )}
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ad Editor Sheet */}
      <Sheet open={isAdSheetOpen} onOpenChange={setIsAdSheetOpen}>
        <SheetContent side="right" className="w-[100%] sm:w-[600px] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>{editingAd ? "Edit Advertisement" : "Create New Ad"}</SheetTitle>
            <SheetDescription>
              {editingAd ? "Update ad details below." : "Create a new advertisement placement."}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSaveAd} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ad-title">Ad Title (Internal)</Label>
              <Input id="ad-title" name="title" defaultValue={editingAd?.title} placeholder="e.g. Summer Sale Banner" required />
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="ad-location">Location</Label>
                <Select name="location" defaultValue={editingAd?.location || "sidebar"}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Location" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="sidebar">Sidebar</SelectItem>
                        <SelectItem value="header">Header</SelectItem>
                        <SelectItem value="footer">Footer</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-3">
              <Label>Ad Image</Label>
              <div className="flex gap-4 mb-2">
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="ad-type-url" 
                    checked={imageUploadType === 'url'} 
                    onChange={() => setImageUploadType('url')}
                    className="accent-primary"
                  />
                  <Label htmlFor="ad-type-url" className="cursor-pointer font-normal">Image URL</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="ad-type-file" 
                    checked={imageUploadType === 'file'} 
                    onChange={() => setImageUploadType('file')}
                    className="accent-primary"
                  />
                  <Label htmlFor="ad-type-file" className="cursor-pointer font-normal">Upload</Label>
                </div>
              </div>

              {imageUploadType === 'url' ? (
                <div className="flex gap-2">
                  <Input id="ad-imageUrl" name="imageUrl" defaultValue={editingAd?.imageUrl} placeholder="https://..." />
                  <Button type="button" variant="outline" size="icon"><ImageIcon className="h-4 w-4" /></Button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    accept="image/*,video/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setUploadedFile(e.target.files[0]);
                    }}
                  />
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium text-slate-700">
                    {uploadedFile ? uploadedFile.name : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Images or Videos (max. 50MB)</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ad-linkUrl">Target URL</Label>
              <Input id="ad-linkUrl" name="linkUrl" defaultValue={editingAd?.linkUrl} placeholder="https://example.com/promo" required />
            </div>

            <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-lg border">
                <Switch id="ad-active" name="active" defaultChecked={editingAd?.active !== false} />
                <Label htmlFor="ad-active">Active</Label>
            </div>

            <div className="flex gap-4 pt-4 border-t">
                <Button type="submit" className="flex-1">
                    {editingAd ? "Update Ad" : "Create Ad"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAdSheetOpen(false)}>
                    Cancel
                </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Short News Editor Sheet */}
      <Sheet open={isShortNewsSheetOpen} onOpenChange={setIsShortNewsSheetOpen}>
        <SheetContent side="right" className="w-[100%] sm:w-[600px] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>{editingShortNews ? "Edit Short News" : "Create Quick Update"}</SheetTitle>
            <SheetDescription>
              {editingShortNews ? "Update quick news brief below." : "Post a short news update or breaking brief."}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSaveShortNews} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="short-news-content">Content</Label>
              <Textarea 
                id="short-news-content" 
                name="content" 
                value={shortNewsForm.content}
                onChange={(e) => setShortNewsForm({ ...shortNewsForm, content: e.target.value })}
                placeholder="Quick update or breaking news (recommended max 280 chars)" 
                rows={4}
                maxLength={500}
                required 
              />
              <p className="text-xs text-muted-foreground">
                {shortNewsForm.content.length} / 500 characters
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="short-news-category">Category</Label>
              <Select 
                value={shortNewsForm.category} 
                onValueChange={(value) => setShortNewsForm({ ...shortNewsForm, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="short-news-author">Author</Label>
              <Input 
                id="short-news-author" 
                name="author" 
                value={shortNewsForm.author}
                onChange={(e) => setShortNewsForm({ ...shortNewsForm, author: e.target.value })}
                placeholder="Author name" 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="short-news-image">Image URL (Optional)</Label>
              <Input 
                id="short-news-image" 
                name="image" 
                value={shortNewsForm.image}
                onChange={(e) => setShortNewsForm({ ...shortNewsForm, image: e.target.value })}
                placeholder="https://..." 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="short-news-link">External Link (Optional)</Label>
              <Input 
                id="short-news-link" 
                name="linkUrl" 
                value={shortNewsForm.linkUrl}
                onChange={(e) => setShortNewsForm({ ...shortNewsForm, linkUrl: e.target.value })}
                placeholder="https://..." 
              />
              <p className="text-xs text-muted-foreground">
                Link to full article or external source
              </p>
            </div>

            <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-lg border">
              <Switch 
                id="short-news-pinned" 
                checked={shortNewsForm.isPinned}
                onCheckedChange={(checked) => setShortNewsForm({ ...shortNewsForm, isPinned: checked })}
              />
              <div>
                <Label htmlFor="short-news-pinned" className="cursor-pointer">Pin to Top</Label>
                <p className="text-xs text-muted-foreground">Pinned updates appear first</p>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t">
              <Button type="submit" className="flex-1">
                {editingShortNews ? "Update" : "Publish"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsShortNewsSheetOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
