import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from 'react-helmet-async';
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import Archive from "@/pages/Archive";
import ArticlePage from "@/pages/Article";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Funders from "@/pages/Funders";
import AdminLogin from "@/pages/admin/Login";
import AdminDashboard from "@/pages/admin/Dashboard";
import Settings from "@/pages/Settings";
import Chatbot from "@/components/ui/chatbot";
import ChatPage from "@/pages/Chat";
import Register from "@/pages/Register";
import Unsubscribe from "@/pages/Unsubscribe";
import Sports from "@/pages/Sports";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/archive" component={Archive} />
      <Route path="/category/:cat" component={Home} /> {/* Re-use Home for categories for mockup */}
      <Route path="/article/:slug" component={ArticlePage} />
      <Route path="/s/:code" component={ArticlePage} /> {/* Short link route handled server-side, but keep for client routing */}
      <Route path="/about" component={About} />
      <Route path="/funders" component={Funders} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/unsubscribe" component={Unsubscribe} />
      <Route path="/login" component={AdminLogin} />
        <Route path="/register" component={Register} />
      <Route path="/sports" component={Sports} />
      
      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/settings" component={Settings} />
      <Route path="/chat" component={ChatPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Record visit
    fetch('/api/analytics/visit', { method: 'POST' }).catch(err => console.error('Failed to record visit:', err));
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Chatbot />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
