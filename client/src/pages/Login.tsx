import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<null | string>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: identifier, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setStatus(body?.message || 'Login failed');
        return;
      }

      // fetch current user to decide where to redirect
      const me = await fetch('/api/auth/me', { credentials: 'include' });
      if (me.ok) {
        const { user } = await me.json();
        if (user?.role === 'admin') {
          setLocation('/admin/dashboard');
          return;
        }
      }

      // default redirect to home
      setLocation('/');
    } catch (err: any) {
      setStatus('Network error');
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent>
              <h1 className="text-xl font-semibold">Login</h1>
              <form className="mt-4 space-y-4" onSubmit={submit} aria-label="User login form">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Email or username</label>
                  <input className="mt-1 block w-full rounded-md border-gray-200 bg-white shadow-sm p-2" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required placeholder="you@domain.com or username" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">Password</label>
                  <input type="password" className="mt-1 block w-full rounded-md border-gray-200 bg-white shadow-sm p-2" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Password" />
                </div>

                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 bg-primary text-white rounded-md" type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Signing in...' : 'Sign in'}</button>
                  {status && status !== 'loading' && <span className="text-sm text-red-600">{status}</span>}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
