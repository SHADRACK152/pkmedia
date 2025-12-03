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
  Megaphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

  // Real Data Queries
  const { data: articles = [] } = useQuery<any[]>({
    queryKey: ['/api/articles'],
  });

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ['/api/categories'],
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ['/api/users'],
  });

  const { data: comments = [] } = useQuery<any[]>({
    queryKey: ['/api/comments'],
  });

  const { data: ads = [] } = useQuery<Ad[]>({
    queryKey: ['/api/ads'],
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

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    let imageUrl = formData.get('image') as string;

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
      category: formData.get('category'),
      author: formData.get('author'),
      image: imageUrl,
      content: formData.get('content'),
      featured: formData.get('featured') === 'on',
      isBreaking: formData.get('breaking') === 'on',
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
    setImageUploadType('url');
    setUploadedFile(null);
    setIsArticleSheetOpen(true);
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      createCategoryMutation.mutate(newCategoryName);
    }
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({ title: "Settings Saved", description: "All changes have been successfully applied." });
    }, 1000);
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
                        <div className="h-64 w-full flex items-end gap-2 justify-between px-2">
                            {[...Array(30)].map((_, i) => {
                                const height = Math.floor(Math.random() * 80) + 20;
                                return (
                                    <div key={i} className="w-full bg-primary/10 hover:bg-primary/80 transition-colors rounded-t relative group" style={{ height: `${height}%` }}>
                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            {height * 12} Visits
                                        </div>
                                    </div>
                                );
                            })}
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
                            {[
                                { action: "Article Published", detail: "Tech Hubs Sprouting...", time: "2h ago", icon: CheckCircle2, color: "text-green-500" },
                                { action: "New User Signup", detail: "james.k@email.com", time: "4h ago", icon: UserCheck, color: "text-blue-500" },
                                { action: "Comment Flagged", detail: "Spam detected in Sports...", time: "5h ago", icon: AlertCircle, color: "text-red-500" },
                                { action: "System Backup", detail: "Daily backup completed", time: "12h ago", icon: Shield, color: "text-purple-500" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className={`mt-1 ${item.color}`}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-slate-900">{item.action}</p>
                                        <p className="text-xs text-muted-foreground">{item.detail}</p>
                                    </div>
                                    <div className="ml-auto text-xs text-muted-foreground">
                                        {item.time}
                                    </div>
                                </div>
                            ))}
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
                                        <p className="text-xs text-muted-foreground">Healthy</p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-slate-700">12%</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Uptime</p>
                                        <p className="text-xs text-muted-foreground">Last 30 Days</p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-slate-700">99.9%</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                        <Shield className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Security</p>
                                        <p className="text-xs text-muted-foreground">No Threats</p>
                                    </div>
                                </div>
                                <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Secure</Badge>
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

      {/* Article Editor Sheet */}
      <Sheet open={isArticleSheetOpen} onOpenChange={setIsArticleSheetOpen}>
        <SheetContent side="right" className="w-[100%] sm:w-[600px] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>{editingArticle ? "Edit Article" : "Create New Article"}</SheetTitle>
            <SheetDescription>
              {editingArticle ? "Make changes to your article below." : "Fill in the details to publish a new article."}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSaveArticle} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Article Title</Label>
              <Input id="title" name="title" defaultValue={editingArticle?.title} placeholder="Enter a catchy headline" required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" defaultValue={editingArticle?.category || "Politics"}>
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
                    <Label htmlFor="author">Author</Label>
                    <Input id="author" name="author" defaultValue={editingArticle?.author} placeholder="Author Name" />
                </div>
            </div>

            <div className="space-y-3">
              <Label>Featured Image</Label>
              <div className="flex gap-4 mb-2">
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="type-url" 
                    checked={imageUploadType === 'url'} 
                    onChange={() => setImageUploadType('url')}
                    className="accent-primary"
                  />
                  <Label htmlFor="type-url" className="cursor-pointer font-normal">Image URL</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="type-file" 
                    checked={imageUploadType === 'file'} 
                    onChange={() => setImageUploadType('file')}
                    className="accent-primary"
                  />
                  <Label htmlFor="type-file" className="cursor-pointer font-normal">Upload from Computer</Label>
                </div>
              </div>

              {imageUploadType === 'url' ? (
                <div className="flex gap-2">
                  <Input id="image" name="image" defaultValue={editingArticle?.image} placeholder="https://..." />
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
              <Label htmlFor="content">Content</Label>
              <Textarea 
                id="content" 
                name="content"
                defaultValue={editingArticle?.content} 
                placeholder="Write your article here..." 
                className="min-h-[300px] font-serif"
              />
            </div>

            <div className="flex items-center gap-8 p-4 bg-slate-50 rounded-lg border">
                <div className="flex items-center gap-2">
                    <Switch id="featured" name="featured" defaultChecked={editingArticle?.featured} />
                    <Label htmlFor="featured">Featured Story</Label>
                </div>
                <div className="flex items-center gap-2">
                    <Switch id="breaking" name="breaking" defaultChecked={editingArticle?.isBreaking} />
                    <Label htmlFor="breaking" className="text-red-600 font-bold">Breaking News</Label>
                </div>
            </div>

            <div className="flex gap-4 pt-4 border-t">
                <Button type="submit" className="flex-1">
                    {editingArticle ? "Update Article" : "Publish Article"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsArticleSheetOpen(false)}>
                    Cancel
                </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

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
    </div>
  );
}
