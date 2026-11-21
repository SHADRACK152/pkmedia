import fs from "node:fs";
import "dotenv/config";
import { type Server } from "node:http";
import path from "node:path";

import express, { type Express, type Request } from "express";

import runApp from "./app.js";
import { storage } from "./storage.js";
import {
  getCanonicalCategoryPath,
  getCanonicalArticlePath,
  getCategoryBySlug,
  renderPageMetadata,
  renderArticlePage,
} from "./article-page.js";

export async function serveStatic(app: Express, server: Server) {
  const distPath = path.resolve(import.meta.dirname, "public");
  const indexPath = path.resolve(distPath, "index.html");
  const notFoundPath = path.resolve(distPath, "404.html");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  app.use("*", async (req, res) => {
    const publicPages: Record<string, { title: string; description: string }> = {
      "/archive": {
        title: "Kenya News Archive - PKMedia",
        description: "Browse PKMedia's latest and archived news reporting from Kenya and around the world.",
      },
      "/about": {
        title: "About PKMedia - Independent News from Kenya",
        description: "Learn about PKMedia, an independent Nairobi-based news organisation reporting on Kenya, Africa and the world.",
      },
      "/funders": {
        title: "Project Funders and Grants - PKMedia",
        description: "See PKMedia's project funding disclosures and editorial independence commitments.",
      },
      "/contact": {
        title: "Contact PKMedia",
        description: "Contact PKMedia with news tips, press enquiries, corrections and general questions.",
      },
      "/privacy": {
        title: "Privacy Policy - PKMedia",
        description: "Read how PKMedia collects, uses and protects visitor information and personal data.",
      },
      "/terms": {
        title: "Terms of Service - PKMedia",
        description: "Review the terms and conditions for using PKMedia's website and services.",
      },
      "/sports": {
        title: "Kenya and World Sports News - PKMedia",
        description: "Follow sports news, league standings, teams and match updates from PKMedia.",
      },
    };
    const normalizedPath = req.path.replace(/\/$/, "") || "/";
    const categoryMatch = normalizedPath.match(/^\/category\/([^/]+)$/);
    let page = publicPages[normalizedPath];

    if (categoryMatch) {
      try {
        const categories = await storage.getAllCategories();
        const category = getCategoryBySlug(categories, categoryMatch[1]);
        if (!category) {
          return res.status(404).sendFile(notFoundPath);
        }

        const canonicalPath = getCanonicalCategoryPath(category);
        if (req.path !== canonicalPath) {
          return res.redirect(301, canonicalPath);
        }

        page = {
          title: `${category.name} News - PKMedia`,
          description: `Read the latest ${category.name} news and reporting from PKMedia.`,
        };
      } catch (error) {
        console.error("[seo] Failed to validate category page:", error);
        return res.status(500).send("Unable to load category");
      }
    }

    if (page) {
      const template = await fs.promises.readFile(indexPath, "utf8");
      return res
        .status(200)
        .type("html")
        .send(
          renderPageMetadata(template, {
            ...page,
            canonicalUrl: `https://pkmedia.co.ke${normalizedPath}`,
          }),
        );
    }

    const knownAppRoutes = [
      /^\/$/,
      /^\/unsubscribe\/?$/,
      /^\/login\/?$/,
      /^\/register\/?$/,
      /^\/admin\/login\/?$/,
      /^\/admin\/dashboard\/?$/,
      /^\/settings\/?$/,
      /^\/chat\/?$/,
    ];

    if (knownAppRoutes.some((route) => route.test(req.path))) {
      return res.sendFile(indexPath);
    }

    const articleMatch = req.path.match(/^\/article\/([^/]+)\/?$/);
    if (articleMatch) {
      try {
        const slugParts = articleMatch[1].split("__");
        const articleId = slugParts[slugParts.length - 1];
        const article = await storage.getArticleById(articleId);
        const now = Date.now();

        if (
          article &&
          article.status === "published" &&
          article.createdAt.getTime() <= now &&
          (!article.publishedAt || article.publishedAt.getTime() <= now)
        ) {
          const canonicalPath = getCanonicalArticlePath(article);
          if (req.path !== canonicalPath) {
            return res.redirect(301, canonicalPath);
          }

          const template = await fs.promises.readFile(indexPath, "utf8");
          return res
            .status(200)
            .type("html")
            .send(renderArticlePage(template, article));
        }
      } catch (error) {
        console.error("[seo] Failed to validate article page:", error);
        return res.status(500).send("Unable to load article");
      }
    }

    return res.status(404).sendFile(notFoundPath);
  });
}

(async () => {
  await runApp(serveStatic);
})();
