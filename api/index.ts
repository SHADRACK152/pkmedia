
import { app } from '../server/app.js';
import { registerRoutes } from '../server/routes.js';
import { storage } from '../server/storage.js';
import {
  getCanonicalCategoryPath,
  getCanonicalArticlePath,
  getCategoryBySlug,
  renderArticlePage,
  renderPageMetadata,
} from '../server/article-page.js';

let indexTemplatePromise: Promise<string> | undefined;

function getIndexTemplate(): Promise<string> {
  if (!indexTemplatePromise) {
    indexTemplatePromise = (async () => {
      const host = process.env.VERCEL_ENV === 'production'
        ? 'pkmedia.co.ke'
        : process.env.VERCEL_URL || 'pkmedia.co.ke';
      const response = await fetch(`https://${host}/index.html`, {
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) {
        throw new Error(`Unable to retrieve deployed index.html (${response.status}).`);
      }
      return response.text();
    })().catch((error) => {
      indexTemplatePromise = undefined;
      throw error;
    });
  }
  return indexTemplatePromise;
}

// Cache the initialization promise to ensure it only runs once
let initPromise: Promise<any> | null = null;

export default async function handler(req: any, res: any) {
  if (!initPromise) {
    // Initialize routes and other setup logic
    // We pass a dummy server object because registerRoutes expects one, 
    // but in serverless we don't have a real HTTP server instance to attach to.
    // Most logic in registerRoutes doesn't use the server instance except for WebSocket setup (if any).
    const dummyServer: any = {
      listen: () => {},
      on: () => {},
      address: () => ({ port: 0 })
    };
    
    initPromise = registerRoutes(app).then(() => {
      console.log('Routes registered for Vercel');
    });
  }

  await initPromise;

  const requestPath = new URL(req.url || '/', 'http://localhost').pathname;
  const articleMatch = requestPath.match(/^\/article\/([^/]+)\/?$/);
  const publicPages: Record<string, { title: string; description: string }> = {
    '/archive': {
      title: 'Kenya News Archive - PKMedia',
      description: "Browse PKMedia's latest and archived news reporting from Kenya and around the world.",
    },
    '/about': {
      title: 'About PKMedia - Independent News from Kenya',
      description: 'Learn about PKMedia, an independent Nairobi-based news organisation reporting on Kenya, Africa and the world.',
    },
    '/funders': {
      title: 'Project Funders and Grants - PKMedia',
      description: "See PKMedia's project funding disclosures and editorial independence commitments.",
    },
    '/contact': {
      title: 'Contact PKMedia',
      description: 'Contact PKMedia with news tips, press enquiries, corrections and general questions.',
    },
    '/privacy': {
      title: 'Privacy Policy - PKMedia',
      description: 'Read how PKMedia collects, uses and protects visitor information and personal data.',
    },
    '/terms': {
      title: 'Terms of Service - PKMedia',
      description: "Review the terms and conditions for using PKMedia's website and services.",
    },
    '/sports': {
      title: 'Kenya and World Sports News - PKMedia',
      description: 'Follow sports news, league standings, teams and match updates from PKMedia.',
    },
  };
  const categoryMatch = requestPath.match(/^\/category\/([^/]+)\/?$/);
  let page = publicPages[requestPath.replace(/\/$/, '')];

  if (categoryMatch) {
    try {
      const categories = await storage.getAllCategories();
      const category = getCategoryBySlug(categories, categoryMatch[1]);
      if (!category) {
        return res.status(404).send('Page not found');
      }

      const canonicalPath = getCanonicalCategoryPath(category);
      if (requestPath !== canonicalPath) {
        return res.redirect(301, canonicalPath);
      }

      page = {
        title: `${category.name} News - PKMedia`,
        description: `Read the latest ${category.name} news and reporting from PKMedia.`,
      };
    } catch (error) {
      console.error('[seo] Failed to validate category page:', error);
      return res.status(500).send('Unable to load category');
    }
  }

  if (page) {
    try {
      const template = await getIndexTemplate();
      return res
        .status(200)
        .type('html')
        .send(
          renderPageMetadata(template, {
            ...page,
            canonicalUrl: `https://pkmedia.co.ke${requestPath.replace(/\/$/, '')}`,
          }),
        );
    } catch (error) {
      console.error('[seo] Failed to render page metadata:', error);
      return res.status(500).send('Unable to load page');
    }
  }

  if (articleMatch) {
    try {
      const slugParts = articleMatch[1].split('__');
      const articleId = slugParts[slugParts.length - 1];
      const article = await storage.getArticleById(articleId);
      const now = Date.now();

      if (
        !article ||
        article.status !== 'published' ||
        article.createdAt.getTime() > now ||
        (article.publishedAt && article.publishedAt.getTime() > now)
      ) {
        return res.status(404).send('Page not found');
      }

      const canonicalPath = getCanonicalArticlePath(article);
      if (requestPath !== canonicalPath) {
        return res.redirect(301, canonicalPath);
      }

      const template = await getIndexTemplate();
      return res
        .status(200)
        .type('html')
        .send(renderArticlePage(template, article));
    } catch (error) {
      console.error('[seo] Failed to validate article page:', error);
      return res.status(500).send('Unable to load article');
    }
  }
  
  // Forward the request to the Express app
  app(req, res);
}
