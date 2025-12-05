import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function Unsubscribe() {
  const [location] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    
    if (!emailParam) {
      setStatus('error');
      return;
    }

    setEmail(emailParam);

    // Auto-unsubscribe
    fetch('/api/newsletter/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailParam }),
    })
      .then(res => {
        if (res.ok) {
          setStatus('success');
        } else {
          setStatus('error');
        }
      })
      .catch(() => {
        setStatus('error');
      });
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              {status === 'loading' && (
                <>
                  <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                  <CardTitle>Processing...</CardTitle>
                  <CardDescription>Unsubscribing you from our newsletter</CardDescription>
                </>
              )}
              
              {status === 'success' && (
                <>
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <CardTitle>Successfully Unsubscribed</CardTitle>
                  <CardDescription>
                    You've been removed from our mailing list
                  </CardDescription>
                </>
              )}
              
              {status === 'error' && (
                <>
                  <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <CardTitle>Unable to Unsubscribe</CardTitle>
                  <CardDescription>
                    We couldn't find your subscription
                  </CardDescription>
                </>
              )}
            </CardHeader>
            
            <CardContent className="text-center space-y-4">
              {status === 'success' && (
                <>
                  <p className="text-sm text-muted-foreground">
                    {email} will no longer receive newsletters from PKMedia.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    We're sorry to see you go! You can resubscribe anytime from our homepage.
                  </p>
                  <Button asChild className="w-full">
                    <a href="/">Return to Homepage</a>
                  </Button>
                </>
              )}
              
              {status === 'error' && (
                <>
                  <p className="text-sm text-muted-foreground">
                    If you continue to receive emails, please contact us at newsletter@pkmedia.com
                  </p>
                  <Button asChild className="w-full">
                    <a href="/">Return to Homepage</a>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
