import { useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";

export default function AdminLogin() {
  const [_, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // fetch username & password values
      const form = e.target as HTMLFormElement;
      const username = (form.querySelector('#username') as HTMLInputElement).value;
      const password = (form.querySelector('#password') as HTMLInputElement).value;

      const res = await apiRequest('POST', '/api/auth/login', { username, password });
      const data = await res.json();
      const user = data.user;
      if (!user) throw new Error('Login failed');
      
      if (user.role === 'admin') {
        setLocation('/admin/dashboard');
      } else {
        setLocation('/');
      }
    } catch (err: any) {
      toast({ title: 'Login failed', description: err.message || 'Unable to login', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4">
            <img src="/pklogo.png" alt="PKMedia logo" className="w-12 h-12" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          </div>
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username or Email</Label>
              <Input id="username" placeholder="username" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Authenticating..." : "Sign In"}
            </Button>
          </CardFooter>
        </form>
        <div className="pb-6 text-center text-xs text-muted-foreground">
          PKMedia Management System
        </div>
      </Card>
    </div>
  );
}
