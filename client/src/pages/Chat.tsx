import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';
import { Send, Loader2, ArrowLeft, Trash2, Plus, Download, Edit } from 'lucide-react';

type Message = { role: 'user' | 'bot'; text: string; createdAt?: string };
type Conversation = { id: string; title: string; messages: Message[]; createdAt: string };

const STORAGE_KEY = 'pkmedia-chat-conversations';

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

function loadConversations(): Conversation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Conversation[];
  } catch (err) {
    console.error('Failed to load conversations', err);
    return [];
  }
}

function saveConversations(convos: Conversation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(convos));
  } catch (err) {
    console.error('Failed to save conversations', err);
  }
}
 

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations());
  const [activeId, setActiveId] = useState<string | null>(() => conversations[0]?.id || null);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [conversations, activeId]);

  // persist conversations to localStorage when they change
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  const active = conversations.find((c) => c.id === activeId) || null;

  function createConversation() {
    const id = generateId();
    const conv: Conversation = { id, title: 'New chat', messages: [], createdAt: new Date().toISOString() };
    setConversations((c) => [conv, ...c]);
    setActiveId(id);
  }

  function deleteConversation(id: string) {
    setConversations((c) => {
      const updated = c.filter((x) => x.id !== id);
      if (updated.length === 0) return updated;
      if (id === activeId) setActiveId(updated[0].id);
      return updated;
    });
  }

  function renameConversation(id: string, title: string) {
    setConversations((c) => c.map((x) => (x.id === id ? { ...x, title } : x)));
  }

  function persistMessage(conversationId: string, message: Message) {
    setConversations((c) => c.map((conv) => (conv.id === conversationId ? { ...conv, messages: [...conv.messages, message] } : conv)));
  }

  async function send() {
    if (!text.trim() || !active) return;
    const messageText = text.trim();
    persistMessage(active.id, { role: 'user', text: messageText, createdAt: new Date().toISOString() });
    setText('');
    setLoading(true);
    try {
      setTyping(true);
      const res = await apiRequest('POST', '/api/chat', { message: messageText, history: active.messages.map(m => ({ role: m.role, text: m.text })) });
      const data = await res.json();
      const reply = data.reply?.toString?.() || data.reply || 'Sorry, something went wrong.';
      const source = data.source || 'unknown';
      const textToPersist = source === 'grok' ? reply : `${reply}${source === 'rule' ? ' \n\n— (PKBoot local assistant)' : ''}`;
      persistMessage(active.id, { role: 'bot', text: textToPersist, createdAt: new Date().toISOString() });
    } catch (err) {
      persistMessage(active.id, { role: 'bot', text: 'Sorry, something went wrong.' });
    } finally {
      setLoading(false);
      setTyping(false);
    }
  }

  function clearConversation(conversationId: string) {
    setConversations((c) => c.map((conv) => (conv.id === conversationId ? { ...conv, messages: [] } : conv)));
  }

  async function exportConversation(conv: Conversation) {
    try {
      const payload = JSON.stringify(conv, null, 2);
      await navigator.clipboard.writeText(payload);
      alert('Conversation copied to clipboard (JSON)');
    } catch (err) {
      alert('Failed to copy conversation');
    }
  }

  function regenerateLastReply() {
    if (!active) return;
    const lastUserMessage = [...active.messages].reverse().find((m) => m.role === 'user');
    if (lastUserMessage) {
      // remove last bot message and re-send
      setConversations((c) => c.map((conv) => (conv.id === active.id ? { ...conv, messages: conv.messages.filter((m) => m.role !== 'bot' || m.createdAt !== conv.messages.slice(-1)[0]?.createdAt) } : conv)));
      setText(lastUserMessage.text);
      send();
    }
  }

  // Ensure there is at least one conversation
  useEffect(() => {
    if (conversations.length === 0) createConversation();
  }, []);

  const clear = () => active && clearConversation(active.id);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="p-4 bg-white border-b flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation('/')} title="Back">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="/pklogo.png" alt="PKBoot" />
            <AvatarFallback>PK</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-lg font-semibold">PKBoot</h1>
            <p className="text-xs text-muted-foreground">Ask about articles, help, or reporting problems</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={clear} title="Clear conversation"><Trash2 className='w-4 h-4' /></Button>
          <Link href="/">
            <Button variant="secondary" size="sm">Close</Button>
          </Link>
        </div>
      </header>

      <main className="p-4 flex-1 overflow-hidden">
        <Card className="h-full flex flex-col">
          <CardContent className="flex-1 p-0 flex flex-col">
            <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {(!active || active.messages.length === 0) && (
                <div className="text-sm text-muted-foreground">
                  Say hi 👋 — PKBoot can answer questions about the site, latest headlines, or even share a short, thoughtful reply.
                  Try: <strong>Latest news</strong>, <strong>Help</strong>, <strong>Contact</strong>, or ask for a category like <strong>Sports</strong>.
                </div>
              )}

              {active && active.messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'bot' ? 'items-start' : 'items-end'} gap-3 ${m.role === 'bot' ? '' : 'justify-end'}`}>
                  {m.role === 'bot' ? (
                    <div className="flex items-start gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src="/pklogo.png" alt="PKBoot" />
                        <AvatarFallback>PK</AvatarFallback>
                      </Avatar>
                      <div className="bg-white border shadow-sm p-3 rounded-lg max-w-[70%]">
                        <div className="whitespace-pre-wrap text-sm text-slate-900">{m.text}</div>
                        <div className="text-xs text-muted-foreground mt-1">{m.createdAt ? new Date(m.createdAt).toLocaleTimeString() : ''}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-end gap-3 justify-end w-full">
                      <div className="text-right bg-primary text-white p-3 rounded-lg max-w-[70%] whitespace-pre-wrap">{m.text}</div>
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>YOU</AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                </div>
              ))}

              {typing && (
                <div className="flex items-start gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="/pklogo.png" alt="PKBoot" />
                    <AvatarFallback>PK</AvatarFallback>
                  </Avatar>
                    <div className="bg-white border shadow-sm p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground">Typing<span className="animate-pulse">...</span></div>
                    </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-white">
              <div className="flex items-center gap-2">
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Message PKBoot... (Shift+Enter for newline)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                />
                <Button onClick={send} disabled={loading} title="Send message">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className='h-4 w-4' />}
                </Button>
              </div>

              <div className="flex gap-2 mt-3 flex-wrap">
                {['Latest news', 'Help', 'Contact', 'Report a problem'].map((q) => (
                  <Button key={q} variant="ghost" size="sm" onClick={() => { setText(q); }}>
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
