import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { MessageCircle } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function Chatbot() {
  // This is only the launch button — the full chat UI lives in `/chat`.
  const [unreadCount, setUnreadCount] = useState(0);
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => {
        if (!mounted) return;
        if (!r.ok) return setUser(null);
        return r.json();
      })
      .then((data) => {
        if (data && data.user) setUser(data.user);
      })
      .catch(() => {
        if (mounted) setUser(null);
      });

    return () => { mounted = false; };
  }, []);

  // Only render for logged-in users
  if (!user) return null;

  // NOTE: send logic lives in the full-page chat; we keep this component simple.

  return (
    <>
      {/* Floating chat icon */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button variant="default" className="rounded-full w-14 h-14 p-0 relative" onClick={() => setLocation('/chat')} aria-label="Open chat">
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-destructive text-white w-6 h-6 text-xs">{unreadCount}</span>
          )}
        </Button>
      </div>
      {/* The full-page chat moved to /chat route. This component just shows the floating button */}
    </>
  );
}
