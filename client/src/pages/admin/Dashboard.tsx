import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  Plus, 
  Search,
  BarChart3,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MOCK_ARTICLES, MOCK_STATS } from "@/lib/mockData";

export default function AdminDashboard() {
  const [_, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  const Sidebar = () => (
    <div className="h-full flex flex-col bg-slate-900 text-slate-300 w-64">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white tracking-tight">MK Admin</h2>
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
          className="w-full justify-start hover:bg-slate-800 hover:text-white"
        >
          <Users className="mr-2 h-4 w-4" /> Users
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start hover:bg-slate-800 hover:text-white"
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
                  <Sidebar />
                </SheetContent>
              </Sheet>
            </div>
            <h1 className="text-xl font-bold text-slate-800 capitalize">{activeTab}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, Admin</span>
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
              A
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Total Articles</h3>
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-3xl font-bold">{MOCK_STATS.totalArticles}</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Total Categories</h3>
                    <BarChart3 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-3xl font-bold">{MOCK_STATS.totalCategories}</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Active Readers</h3>
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-3xl font-bold">{MOCK_STATS.activeUsers}</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">New Posts (24h)</h3>
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-3xl font-bold">{MOCK_STATS.recentPosts}</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                <div className="text-sm text-muted-foreground">Chart placeholder area...</div>
                <div className="h-40 bg-slate-50 rounded border border-dashed flex items-center justify-center mt-2">
                  Analytics Graph
                </div>
              </div>
            </div>
          )}

          {activeTab === 'articles' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative w-72">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search articles..." className="pl-8" />
                </div>
                <Button className="bg-primary hover:bg-primary/90">
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
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_ARTICLES.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell className="font-medium max-w-md truncate">{article.title}</TableCell>
                        <TableCell>{article.category}</TableCell>
                        <TableCell>{article.author}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                            Published
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">Delete</Button>
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
    </div>
  );
}
