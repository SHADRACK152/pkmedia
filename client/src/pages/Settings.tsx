import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notAuthorized, setNotAuthorized] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiRequest("GET", "/api/auth/me");
        const data = await res.json();
        if (mounted) setUser(data.user);
      } catch (err: any) {
        // not authenticated or failed
        setNotAuthorized(true);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        username: user.username,
        name: user.name,
        email: user.email,
      };
      // only send password if set
      if (user.password && user.password.length > 0) payload.password = user.password;

      const res = await apiRequest("PUT", "/api/auth/me", payload);
      const data = await res.json();
      setUser(data.user);
      // Clear password field in UI after successful save
      setUser((prev: any) => ({ ...prev, password: "" }));
      toast({ title: "Profile updated" });
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message || "Error saving profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (notAuthorized) return (
    <div className="p-6 text-center">
      <p className="mb-2">You must be logged in to edit your profile.</p>
      <a href="/admin/login" className="text-primary">Log in</a>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Your Account Settings</CardTitle>
          <CardDescription>Update your profile details.</CardDescription>
        </CardHeader>
        <form onSubmit={onSave}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={user?.username || ""} onChange={(e) => setUser({ ...user, username: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={user?.name || ""} onChange={(e) => setUser({ ...user, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ""} onChange={(e) => setUser({ ...user, email: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="password">New password</Label>
              <Input id="password" type="password" value={user?.password || ""} onChange={(e) => setUser({ ...user, password: e.target.value })} placeholder="(leave blank to keep current password)" />
            </div>
          </CardContent>
          <div className="p-4 border-t">
            <Button type="submit" disabled={saving} className="w-full">{saving ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
