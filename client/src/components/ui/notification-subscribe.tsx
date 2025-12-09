import { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Button } from './button';
import { useToast } from '@/hooks/use-toast';

export default function NotificationSubscribe() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if browser supports notifications
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      // Silently fail - user hasn't actively tried to subscribe yet
      console.debug('Push subscription check failed (this is normal if push service is unavailable)');
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToNotifications = async () => {
    setLoading(true);
    
    try {
      // Check if we're in a secure context (HTTPS or localhost)
      if (!window.isSecureContext && import.meta.env.PROD) {
        toast({
          title: 'HTTPS Required',
          description: 'Push notifications require a secure HTTPS connection',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }

      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        toast({
          title: 'Permission denied',
          description: 'Please enable notifications in your browser settings',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Check if push manager is available
      if (!registration.pushManager) {
        throw new Error('Push notifications are not supported in this browser');
      }

      // Try to subscribe with timeout to catch hanging requests
      const subscriptionPromise = registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY || 
          'BEl62iUYgUivxIkv69yViEuiBIa-Ib37L8-F4MYM3UYZjY6-hLLlhBvwwqPxCZTJhLFE2P8u7F0hzKZxI8Vh0qE'
        )
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Push service timeout')), 10000)
      );

      const subscription = await Promise.race([subscriptionPromise, timeoutPromise]) as PushSubscription;

      // Send subscription to server
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(subscription)
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription');
      }

      setIsSubscribed(true);
      toast({
        title: 'Notifications enabled!',
        description: 'You\'ll receive alerts for new articles'
      });

      // Show a test notification
      registration.showNotification('PK Media News', {
        body: 'You\'re now subscribed to article notifications!',
        icon: '/logo.png',
        badge: '/logo.png'
      });

    } catch (error: any) {
      // Only log to console if user actively tried to subscribe (not on page load)
      console.warn('Push notification subscription failed:', error.name || error.message);
      
      // Handle specific error cases
      let errorTitle = 'Subscription failed';
      let errorMessage = 'Could not enable notifications';
      
      if (error.name === 'AbortError' || error.message?.includes('push service') || error.message?.includes('Registration failed') || error.message?.includes('timeout')) {
        errorTitle = 'Push Service Unavailable';
        errorMessage = 'The browser\'s push notification service is currently unavailable. This could be due to:\n\n• Network connectivity issues\n• Browser push service being down\n• Firewall/VPN blocking the connection\n• Browser extensions interfering\n\nPlease try again later or check your network settings.';
        
        // Don't show toast for AbortError in production - it's too common
        if (import.meta.env.PROD) {
          console.warn('Push service unavailable - silently failing');
          setLoading(false);
          return;
        }
      } else if (error.name === 'NotAllowedError') {
        errorMessage = 'Notification permission was denied. Please enable notifications in your browser settings and try again.';
      } else if (error.message?.includes('not supported')) {
        errorMessage = 'Push notifications are not supported in your browser. Try using Chrome, Firefox, or Edge.';
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive',
        duration: 8000
      });
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeFromNotifications = async () => {
    setLoading(true);
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        // Unsubscribe from push
        await subscription.unsubscribe();
        
        // Notify server
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ endpoint: subscription.endpoint })
        });
      }

      setIsSubscribed(false);
      toast({
        title: 'Notifications disabled',
        description: 'You won\'t receive article alerts anymore'
      });

    } catch (error: any) {
      console.error('Error unsubscribing:', error);
      toast({
        title: 'Error',
        description: 'Could not disable notifications',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      onClick={isSubscribed ? unsubscribeFromNotifications : subscribeToNotifications}
      disabled={loading}
      variant={isSubscribed ? 'outline' : 'default'}
      size="sm"
      className="gap-2"
    >
      {isSubscribed ? (
        <>
          <BellOff className="h-4 w-4" />
          Notifications On
        </>
      ) : (
        <>
          <Bell className="h-4 w-4" />
          Enable Notifications
        </>
      )}
    </Button>
  );
}
