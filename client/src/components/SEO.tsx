import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  article?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  canonicalUrl?: string;
}

export function SEO({
  title = 'PKMedia - Kenya and Worldwide News | Breaking News & Current Affairs',
  description = 'Your trusted source for breaking news, in-depth analysis, and comprehensive reporting from Kenya and around the world. Stay informed with PKMedia.',
  keywords = 'Kenya news, Mount Kenya news, breaking news Kenya, current affairs, PKMedia',
  image = 'https://pkmedia.co.ke/pklogo.png',
  article = false,
  publishedTime,
  modifiedTime,
  author = 'PKMedia News Team',
  canonicalUrl,
}: SEOProps) {
  const [location] = useLocation();
  const baseUrl = 'https://pkmedia.co.ke';
  const currentUrl = canonicalUrl || `${baseUrl}${location}`;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper function to update or create meta tag
    const updateMetaTag = (selector: string, content: string) => {
      let element = document.querySelector(selector);
      if (element) {
        element.setAttribute('content', content);
      } else {
        element = document.createElement('meta');
        const selectorParts = selector.match(/\[(.+?)="(.+?)"\]/);
        if (selectorParts) {
          element.setAttribute(selectorParts[1], selectorParts[2]);
        }
        element.setAttribute('content', content);
        document.head.appendChild(element);
      }
    };

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', currentUrl);
    } else {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      canonical.setAttribute('href', currentUrl);
      document.head.appendChild(canonical);
    }

    // Primary Meta Tags
    updateMetaTag('meta[name="title"]', title);
    updateMetaTag('meta[name="description"]', description);
    updateMetaTag('meta[name="keywords"]', keywords);
    updateMetaTag('meta[name="author"]', author);

    // Open Graph
    updateMetaTag('meta[property="og:title"]', title);
    updateMetaTag('meta[property="og:description"]', description);
    updateMetaTag('meta[property="og:image"]', image);
    updateMetaTag('meta[property="og:url"]', currentUrl);
    updateMetaTag('meta[property="og:type"]', article ? 'article' : 'website');

    // Twitter
    updateMetaTag('meta[name="twitter:title"]', title);
    updateMetaTag('meta[name="twitter:description"]', description);
    updateMetaTag('meta[name="twitter:image"]', image);
    updateMetaTag('meta[name="twitter:url"]', currentUrl);

    // Article specific tags
    if (article && publishedTime) {
      updateMetaTag('meta[property="article:published_time"]', publishedTime);
    }
    if (article && modifiedTime) {
      updateMetaTag('meta[property="article:modified_time"]', modifiedTime);
    }
    if (article && author) {
      updateMetaTag('meta[property="article:author"]', author);
    }
  }, [title, description, keywords, image, article, publishedTime, modifiedTime, author, currentUrl]);

  return null;
}
