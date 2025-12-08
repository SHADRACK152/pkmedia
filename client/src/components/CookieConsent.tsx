import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Cookie } from "lucide-react";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show banner after a short delay
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
    // Enable analytics, ads, etc.
    gtag('consent', 'update', {
      ad_storage: 'granted',
      analytics_storage: 'granted',
      functionality_storage: 'granted',
      personalization_storage: 'granted',
      security_storage: 'granted'
    });
  };

  const acceptEssential = () => {
    localStorage.setItem('cookie-consent', 'essential-only');
    setShowBanner(false);
    // Only enable essential cookies
    gtag('consent', 'update', {
      ad_storage: 'denied',
      analytics_storage: 'denied',
      functionality_storage: 'granted',
      personalization_storage: 'denied',
      security_storage: 'granted'
    });
  };

  const dismiss = () => {
    setShowBanner(false);
    // Default to essential only
    acceptEssential();
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg p-4 md:p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-start gap-4">
          <Cookie className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-2">Cookie Preferences</h3>
            <p className="text-sm text-gray-600 mb-4">
              We use cookies to enhance your experience, analyze site traffic, and personalize content.
              By continuing to use our site, you agree to our use of cookies in accordance with our{' '}
              <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={acceptAll} size="sm" className="bg-primary hover:bg-primary/90">
                Accept All Cookies
              </Button>
              <Button onClick={acceptEssential} variant="outline" size="sm">
                Essential Only
              </Button>
              <Button onClick={dismiss} variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}