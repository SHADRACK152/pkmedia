import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { callGrok } from "./ai.js";
import { sendWelcomeEmail, sendNewsletterEmail } from "./email.js";
import { insertArticleSchema, insertCategorySchema, insertTagSchema, insertCommentSchema, insertUserSchema, insertAdSchema } from "../shared/schema.js";
import { z } from "zod";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import os from "os";

// Configure Cloudinary
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn("Cloudinary environment variables not set. Uploads will fail.");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer with Cloudinary
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'pkmedia',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp', 'mp4', 'webm', 'mov'],
    resource_type: 'auto', // Allow both images and videos
  } as any,
});

const upload = multer({
  storage: cloudinaryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for videos
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // IMPORTANT: Register short link redirect FIRST before any other routes
  // This must come before Vite middleware which has a catch-all route
  app.get("/s/:code", async (req, res) => {
    try {
      const shortLink = await storage.getShortLink(req.params.code);
      
      if (!shortLink) {
        return res.status(404).send("Short link not found");
      }
      
      // Increment click counter
      await storage.incrementShortLinkClicks(req.params.code);
      
      // Get article to build slug
      const article = await storage.getArticleById(shortLink.articleId);
      if (!article) {
        return res.status(404).send("Article not found");
      }
      
      // Build full article URL with slug
      const slug = article.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .substring(0, 60);
      
      const articleUrl = `/article/${slug}__${article.id}`;
      const fullUrl = `${req.protocol}://${req.get('host')}${articleUrl}`;
      const shortUrl = `${req.protocol}://${req.get('host')}/s/${req.params.code}`;
      
      // Clean content for description - escape HTML entities
      const description = article.content 
        ? article.content
            .replace(/<[^>]*>/g, '')
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .substring(0, 160)
        : '';
      
      // Escape title for HTML
      const safeTitle = article.title
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      
      // Ensure absolute image URL
      const imageUrl = article.image?.startsWith('http') 
        ? article.image 
        : `${req.protocol}://${req.get('host')}${article.image}`;
      
      // Check if this is a bot/crawler (WhatsApp, Facebook, Twitter, etc.)
      const userAgent = req.get('user-agent') || '';
      const isBot = /WhatsApp|facebookexternalhit|Twitterbot|LinkedInBot|Slackbot|TelegramBot|bot|crawler|spider/i.test(userAgent);
      
      if (isBot) {
        // Serve HTML with Open Graph tags for bots/social media crawlers
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${safeTitle} - PKMedia</title>
  <meta name="description" content="${description}">
  
  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="PKMedia">
  <meta property="og:url" content="${shortUrl}">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:secure_url" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${safeTitle}">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${shortUrl}">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
  
  <meta http-equiv="refresh" content="0;url=${articleUrl}">
</head>
<body>
  <h1>${safeTitle}</h1>
  <p>Redirecting to article...</p>
  <script>window.location.href="${articleUrl}";</script>
</body>
</html>`);
      }
      
      // For regular users, do instant redirect
      res.redirect(articleUrl);
    } catch (error: any) {
      console.error('Short link error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Configure passport for authentication
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Accept either username or email as login identifier
        let user = await storage.getUserByUsername(username);
        if (!user) {
          user = await storage.getUserByEmail(username);
          console.log(`[auth] attempting login for identifier=${username} resolvedUser=${user ? user.username : 'none'}`);
        }
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        
        const isValid = await bcrypt.compare(password, user.password);
        console.log(`[auth] password valid: ${isValid}`);
        if (!isValid) {
          return done(null, false, { message: "Incorrect password" });
        }
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  const sanitizeUser = (user: any) => {
    if (!user) return null;
    // remove sensitive fields
    const { password, ...rest } = user as any;
    return rest;
  };

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ error: "Unauthorized" });
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && (req.user as any)?.role === 'admin') {
      return next();
    }
    res.status(403).json({ error: 'Forbidden' });
  };

  // Serve uploaded files
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // Upload endpoint
  app.post("/api/upload", requireAuth, upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    // Cloudinary storage puts the url in req.file.path
    const fileUrl = req.file.path;
    res.json({ url: fileUrl });
  });

  // Auth routes
  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    res.json({ user: sanitizeUser(req.user) });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ user: sanitizeUser(req.user) });
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  app.put('/api/auth/me', requireAuth, async (req, res) => {
    try {
      const updateSchema = z.object({
        username: z.string().min(3).optional(),
        name: z.string().min(2).optional(),
        email: z.string().email().optional(),
        password: z.string().min(6).optional(),
      });
      const validated = updateSchema.parse(req.body);

      if (validated.username) {
        const existing = await storage.getUserByUsername(validated.username);
        if (existing && existing.id !== (req.user as any).id) {
          return res.status(400).json({ error: 'Username already exists' });
        }
      }

      if (validated.password) {
        validated.password = await bcrypt.hash(validated.password, 10);
      }

      const updated = await storage.updateUser((req.user as any).id, validated as any);
      if (!updated) return res.status(404).json({ error: 'User not found' });

      res.json({ user: sanitizeUser(updated) });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Force role to 'writer' on registration to prevent privilege escalation
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        role: 'writer',
      } as any);
      
      res.json({ user: sanitizeUser(user) });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Sanitize users (remove passwords)
      const sanitized = users.map(u => {
        const { password, ...rest } = u;
        return rest;
      });
      res.json(sanitized);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Article routes
  app.get("/api/articles", async (req, res) => {
    try {
      const articles = await storage.getAllArticles();
      res.json(articles);
    } catch (error: any) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/articles/:id", async (req, res) => {
    try {
      const article = await storage.getArticleById(req.params.id);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      res.json(article);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/articles", requireAuth, async (req, res) => {
    try {
      const validatedData = insertArticleSchema.parse(req.body);
      const article = await storage.createArticle(validatedData);
      
      // Automatically create a short link for the new article
      console.log(`[articles] Creating short link for new article ${article.id}`);
      const shortLink = await storage.createShortLink(article.id);
      console.log(`[articles] Short link created: ${shortLink.code}`);
      
      res.json(article);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/articles/:id", requireAuth, async (req, res) => {
    try {
      const article = await storage.updateArticle(req.params.id, req.body);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      res.json(article);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/articles/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteArticle(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Article not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/articles/:id/view", async (req, res) => {
    try {
      await storage.incrementArticleViews(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/articles/:id/like", async (req, res) => {
    try {
      await storage.incrementArticleLikes(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/categories", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/categories/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteCategory(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Tag routes
  app.get("/api/tags", async (req, res) => {
    try {
      const tags = await storage.getAllTags();
      res.json(tags);
    } catch (error: any) {
      console.error("Error fetching tags:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tags", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertTagSchema.parse(req.body);
      const tag = await storage.createTag(validatedData);
      res.json(tag);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/tags/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteTag(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Tag not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Comment routes
  app.get("/api/articles/:articleId/comments", async (req, res) => {
    try {
      const comments = await storage.getCommentsByArticle(req.params.articleId);
      res.json(comments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/comments", async (req, res) => {
    try {
      const comments = await storage.getAllComments();
      res.json(comments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/comments", async (req, res) => {
    try {
      const validatedData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment(validatedData);
      res.json(comment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/comments/:id/status", requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      
      const comment = await storage.updateCommentStatus(req.params.id, status);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }
      res.json(comment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/comments/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteComment(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Comment not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/comments/:id/like", async (req, res) => {
    try {
      await storage.incrementCommentLikes(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/comments/:id/unlike", async (req, res) => {
    try {
      await storage.decrementCommentLikes(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/comments/:id/dislike", async (req, res) => {
    try {
      await storage.incrementCommentDislikes(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/comments/:id/undislike", async (req, res) => {
    try {
      await storage.decrementCommentDislikes(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/comments/:id/share", async (req, res) => {
    try {
      await storage.incrementCommentShares(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Ad routes
  app.get("/api/ads", requireAdmin, async (req, res) => {
    try {
      const ads = await storage.getAllAds();
      res.json(ads);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/ads/active", async (req, res) => {
    try {
      const ads = await storage.getActiveAds();
      res.json(ads);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ads", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertAdSchema.parse(req.body);
      const ad = await storage.createAd(validatedData);
      res.json(ad);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/ads/:id", requireAdmin, async (req, res) => {
    try {
      const ad = await storage.updateAd(req.params.id, req.body);
      if (!ad) {
        return res.status(404).json({ error: "Ad not found" });
      }
      res.json(ad);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/ads/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteAd(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Ad not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Analytics routes
  app.post("/api/analytics/visit", async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const isNewVisitor = !(req.session as any).visitedToday;
      
      if (isNewVisitor) {
        (req.session as any).visitedToday = true;
      }
      
      await storage.recordVisit(today, isNewVisitor);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/analytics/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getDailyStats();
      // Ensure we return 30 days of data, filling in gaps with 0
      const result = [];
      const map = new Map(stats.map(s => [s.date, s]));
      
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const stat = map.get(dateStr) || { date: dateStr, visitors: 0, pageViews: 0 };
        result.push(stat);
      }
      
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/health', async (_req, res) => {
    try {
      // try to call an existing storage method to ensure the storage layer can query the database
      await storage.getAllCategories();
      res.json({ ok: true, env: process.env.NODE_ENV || 'development' });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  app.get("/api/system/status", requireAdmin, (req, res) => {
    const uptime = process.uptime();
    const memory = process.memoryUsage();
    const load = os.loadavg();
    
    res.json({
        uptime,
        memoryUsage: Math.round(memory.heapUsed / 1024 / 1024), // MB
        totalMemory: Math.round(os.totalmem() / 1024 / 1024), // MB
        load: load[0] || 0,
        platform: os.platform()
    });
  });

  // Chatbot endpoint (PKBoot) - very lightweight and rule-based.
  app.post('/api/chat', async (req, res) => {
    try {
      const schema = z.object({ message: z.string().min(1), history: z.array(z.object({ role: z.string(), text: z.string() })).optional() });
      const { message, history } = schema.parse(req.body);
      // If GROK is configured, attempt to use it. You can require the LLM to be online
      // by setting GROK_REQUIRE_ONLINE=true in the environment; when required and
      // the LLM call fails, we return a 502 so the client can know the LLM is unavailable.
      if (process.env.GROK_API_KEY && process.env.GROK_API_URL) {
        try {
          const grokResponse = await callGrok(message, history || []);
          return res.json({ reply: grokResponse, source: 'grok' });
        } catch (err: any) {
          console.error('[grok] call failed:', err?.message || err);
          if (process.env.GROK_REQUIRE_ONLINE === 'true') {
            return res.status(502).json({ error: 'LLM provider unavailable', details: err?.message });
          }
          // otherwise continue to rule-based fallback
          console.warn('[grok] falling back to local rule-based assistant');
        }
      }

      const generateReply = async (msg: string) => {
        const normalized = msg.toLowerCase().trim();
        const now = new Date();
        const greetings = [
          "Hello! I'm PKBoot — how can I help you today?",
          "Hi there — I'm PKBoot, your friendly assistant. How can I help?",
          "Hey! PKBoot here. Ask me anything about the news or the site.",
        ];

        const smallTalk = [
          "Nice — I hope you're having a calm moment! If you want to read something, try 'Latest news' or ask for a category like 'Sports'.",
          "Chilling is an art. If you'd like, I can show the top headlines or a quick summary of a topic—try 'What's new?'",
          "Sounds good — if you're relaxing, here are things you can try: 'Latest news', 'Help', or 'Contact'.",
        ];

        // Featured site features the bot is aware of
        const features = [
          "Latest headlines and category browsing",
          "Article details and comments",
          "Register and Settings management",
          "Admin dashboard for moderation (admins only)",
          "Contact and reporting workflows",
        ];

        const capabilitiesReply = `I can: ${features.join(', ')}.`;

        if (/^hello|^hi|^hey|^yo/.test(normalized)) {
          return greetings[Math.floor(Math.random() * greetings.length)];
        }

        if (/(just\s*chill|chilling|relaxing|bored|just chilling)/.test(normalized)) {
          return smallTalk[Math.floor(Math.random() * smallTalk.length)];
        }

        if (normalized.includes('what can you do') || normalized.includes('what can i ask') || normalized.includes('what can you help')) {
          return 'I can show latest headlines, summarize articles, help with account settings, and guide you to report issues. What would you like me to do?';
        }

        if (normalized.includes('news') || normalized.includes('article') || normalized.includes('headlines') || normalized.includes('latest')) {
          // Return a helpful direct summary using site data if available
          try {
            const latest = await storage.getAllArticles();
            const top = latest.slice(0, 3).map(a => a.title).join('; ');
            return `Here are the top headlines: ${top}. Ask me for more details about any of these.`;
          } catch (e) {
            return `You can find the latest stories on the homepage. If you'd like a topical summary, ask 'Give me a quick summary of the latest in Sports' or ask by category.`;
          }
        }

        if (normalized.includes('admin') || normalized.includes('dashboard') || normalized.includes('moderate')) {
          return "Admin features include article creation, comment moderation, category management, and site settings. You must be an admin to access those. If you need an account, ask the site owner.";
        }

        if (normalized.includes('contact') || normalized.includes('email') || normalized.includes('support')) {
          return "You can email us at contact@pkmedia.com or use the contact form. If it's urgent, tell me what happened and I can explain the report workflow.";
        }

        if (normalized.includes('philosophy') || normalized.includes('philosophical') || normalized.includes('thoughts') || normalized.includes('civic')) {
          // mild philosophical/ civic-minded reply
          return "That's a thoughtful question. I believe the press is at its best when it informs and empowers citizens. If you'd like, I can find articles about civic issues or propose ways to get involved locally.";
        }

        // respond to grammar questions
        if (normalized.includes('verb') && (normalized.includes('what') || normalized.includes("whats"))) {
          return "A verb is a word that expresses an action, occurrence, or state of being — for example: 'run', 'is', 'think'. Would you like a few example sentences using verbs?";
        }

        // default friendly fallback — concise and action-oriented (no paraphrase templates)
        return 'I can show headlines, summarize articles, help with your account, or guide you to report content. What would you like me to do?';
      }

      const reply = await generateReply(message);
      res.json({ reply, source: 'rule' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Short link routes
  // Get short link for an article
  app.get("/api/articles/:id/short-link", async (req, res) => {
    try {
      let shortLink = await storage.getShortLinkByArticleId(req.params.id);
      
      // If no short link exists, create one
      if (!shortLink) {
        console.log(`[short-link] Creating short link for article ${req.params.id}`);
        shortLink = await storage.createShortLink(req.params.id);
        console.log(`[short-link] Created: ${shortLink.code}`);
      }
      
      res.json({ code: shortLink.code, url: `/s/${shortLink.code}` });
    } catch (error: any) {
      console.error(`[short-link] Error:`, error);
      res.status(500).json({ error: error.message });
    }
  });

  // Newsletter routes
  // Subscribe to newsletter (public)
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const { email, name } = req.body;
      
      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: "Valid email is required" });
      }

      const subscriber = await storage.subscribeNewsletter({
        email: email.toLowerCase().trim(),
        name: name?.trim() || null,
        status: 'active'
      });

      // Send welcome email (don't wait for it to avoid delaying response)
      if (process.env.RESEND_API_KEY) {
        sendWelcomeEmail(subscriber.email).catch(err => {
          console.error("[newsletter] Failed to send welcome email:", err);
        });
      }

      res.json({ message: "Successfully subscribed to newsletter", subscriber });
    } catch (error: any) {
      console.error("[newsletter] Subscribe error:", error);
      res.status(500).json({ error: "Failed to subscribe" });
    }
  });

  // Get all newsletter subscribers (admin only)
  app.get("/api/newsletter/subscribers", requireAdmin, async (req, res) => {
    try {
      const subscribers = await storage.getAllSubscribers();
      res.json(subscribers);
    } catch (error: any) {
      console.error("[newsletter] Get subscribers error:", error);
      res.status(500).json({ error: "Failed to fetch subscribers" });
    }
  });

  // Unsubscribe from newsletter (public)
  app.post("/api/newsletter/unsubscribe", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const success = await storage.unsubscribeNewsletter(email.toLowerCase().trim());
      
      if (success) {
        res.json({ message: "Successfully unsubscribed from newsletter" });
      } else {
        res.status(404).json({ error: "Subscriber not found" });
      }
    } catch (error: any) {
      console.error("[newsletter] Unsubscribe error:", error);
      res.status(500).json({ error: "Failed to unsubscribe" });
    }
  });

  // Delete subscriber (admin only)
  app.delete("/api/newsletter/subscribers/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteSubscriber(req.params.id);
      
      if (success) {
        res.json({ message: "Subscriber deleted successfully" });
      } else {
        res.status(404).json({ error: "Subscriber not found" });
      }
    } catch (error: any) {
      console.error("[newsletter] Delete subscriber error:", error);
      res.status(500).json({ error: "Failed to delete subscriber" });
    }
  });

  // Send newsletter to all subscribers (admin only)
  app.post("/api/newsletter/send", requireAdmin, async (req, res) => {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.error("[newsletter] RESEND_API_KEY not configured");
        return res.status(500).json({ error: "Email service not configured - missing API key" });
      }

      console.log("[newsletter] Starting newsletter send process...");

      const subscribers = await storage.getActiveSubscribers();
      console.log(`[newsletter] Found ${subscribers.length} active subscribers`);
      
      if (subscribers.length === 0) {
        return res.status(400).json({ error: "No active subscribers" });
      }

      // Get latest 5 articles for the newsletter
      const articles = await storage.getAllArticles();
      console.log(`[newsletter] Found ${articles.length} total articles`);
      
      if (articles.length === 0) {
        return res.status(400).json({ error: "No articles available to send" });
      }

      const latestArticles = articles.slice(0, 5).map((article: any) => ({
        title: article.title,
        excerpt: article.excerpt || article.content.substring(0, 150) + '...',
        url: `${process.env.APP_URL || 'https://pkmedia.vercel.app'}/article/${article.id}`,
        image: article.image,
        category: article.category || 'News',
      }));

      console.log(`[newsletter] Sending to ${subscribers.length} subscribers with ${latestArticles.length} articles`);

      // Send emails (in background, don't wait)
      const sendPromises = subscribers.map(sub => 
        sendNewsletterEmail({
          to: sub.email,
          articles: latestArticles,
        }).catch(err => {
          console.error(`[newsletter] Failed to send to ${sub.email}:`, err.message || err);
          return null;
        })
      );

      // Wait for all emails to be sent
      const results = await Promise.allSettled(sendPromises);
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value !== null).length;
      const failCount = results.filter(r => r.status === 'rejected' || r.value === null).length;

      console.log(`[newsletter] Send complete: ${successCount} succeeded, ${failCount} failed`);

      res.json({ 
        message: "Newsletter sent",
        total: subscribers.length,
        success: successCount,
        failed: failCount
      });
    } catch (error: any) {
      console.error("[newsletter] Send error:", error.message || error);
      res.status(500).json({ 
        error: "Failed to send newsletter", 
        details: error.message || "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
