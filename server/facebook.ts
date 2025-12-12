// Lightweight Facebook Page poster (photo fallback)
import type { Article } from "../shared/schema.js";

const FB_GRAPH_BASE = 'https://graph.facebook.com';

export async function postArticleToFacebook(article: Article, shortLink?: { code: string } | null) {
  const pageId = process.env.FB_PAGE_ID;
  const pageToken = process.env.FB_PAGE_ACCESS_TOKEN; // long-lived page access token
  const siteUrl = process.env.SITE_URL || process.env.PUBLIC_URL || 'https://example.com';

  if (!pageId || !pageToken) {
    console.warn('[facebook] FB_PAGE_ID or FB_PAGE_ACCESS_TOKEN not configured — skipping Facebook post');
    return;
  }

  // Build the article URL (absolute)
  const articleUrl = `${siteUrl.replace(/\/$/, '')}/article/${article.id}`;

  const captionParts: string[] = [];
  if (article.title) captionParts.push(article.title);
  captionParts.push(`Read more: ${articleUrl}`);
  if (shortLink && shortLink.code) captionParts.push(`Short link: ${siteUrl.replace(/\/$/, '')}/s/${shortLink.code}`);
  const caption = captionParts.join('\n\n');

  // Prefer to upload the image as a page photo with the article link in the caption.
  // This ensures the image shows in the post even when Open Graph scraping is imperfect.
  if (article.image) {
    try {
      const url = `${FB_GRAPH_BASE}/v17.0/${pageId}/photos`;
      const body = new URLSearchParams();
      body.append('url', article.image);
      body.append('caption', caption);
      body.append('access_token', pageToken);

      const res = await fetch(url, { method: 'POST', body });
      const json = await res.text();
      try { JSON.parse(json); } catch (_) { /* allow non-json message */ }

      if (!res.ok) {
        console.error('[facebook] Photo post failed:', res.status, json);
        throw new Error(`Facebook photo post failed: ${res.status}`);
      }
      console.log('[facebook] Posted article photo to Facebook page:', article.id);
      return;
    } catch (err:any) {
      console.warn('[facebook] Photo post failed, falling back to link post:', err.message || err);
      // continue to try link post below
    }
  }

  // Fallback: post the link to the page feed (relies on og:image on the article URL for preview)
  try {
    const url = `${FB_GRAPH_BASE}/v17.0/${pageId}/feed`;
    const body = new URLSearchParams();
    body.append('message', article.title || 'New article');
    body.append('link', articleUrl);
    body.append('access_token', pageToken);

    const res = await fetch(url, { method: 'POST', body });
    const text = await res.text();
    if (!res.ok) {
      console.error('[facebook] Link post failed:', res.status, text);
      throw new Error(`Facebook link post failed: ${res.status}`);
    }
    console.log('[facebook] Posted article link to Facebook page:', article.id);
  } catch (err:any) {
    console.error('[facebook] Failed to post to Facebook page:', err.message || err);
    throw err;
  }
}

export default postArticleToFacebook;
