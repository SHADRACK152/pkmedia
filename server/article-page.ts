import type { Article, Category } from "../shared/schema.js";

const SITE_URL = "https://pkmedia.co.ke";

export interface PageMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
  image?: string;
  type?: "website" | "article";
}

export function getArticleSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .substring(0, 60);
}

export function getCanonicalArticlePath(article: Pick<Article, "id" | "title">): string {
  return `/article/${getArticleSlug(article.title)}__${article.id}`;
}

export function getCategoryBySlug(
  categories: Category[],
  slug: string,
): Category | undefined {
  let decodedSlug: string;
  try {
    decodedSlug = getArticleSlug(decodeURIComponent(slug));
  } catch {
    return undefined;
  }
  const normalizedSlug = decodedSlug === "tech" ? "technology" : decodedSlug;
  return categories.find(
    (category) => getArticleSlug(category.name) === normalizedSlug,
  );
}

export function getCanonicalCategoryPath(category: Pick<Category, "name">): string {
  return `/category/${encodeURIComponent(category.name)}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getDescription(content: string): string {
  return content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

function updateMeta(
  html: string,
  attribute: "name" | "property",
  key: string,
  content: string,
): string {
  const tag = `<meta ${attribute}="${key}" content="${escapeHtml(content)}" />`;
  const matcher = new RegExp(
    `<meta\\s+${attribute}="${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>`,
    "i",
  );
  return matcher.test(html) ? html.replace(matcher, tag) : html;
}

export function renderArticlePage(template: string, article: Article): string {
  const title = `${article.title} - PKMedia`;
  const description = getDescription(article.content);
  const canonicalUrl = `${SITE_URL}${getCanonicalArticlePath(article)}`;
  const imageUrl = article.image
    ? article.image.startsWith("http")
      ? article.image
      : `${SITE_URL}${article.image}`
    : `${SITE_URL}/pklogo.png`;
  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description,
    image: imageUrl,
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt || article.publishedAt || article.createdAt,
    author: {
      "@type": "Person",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: "PKMedia",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/pklogo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    articleSection: article.category,
    keywords: article.tags?.join(", "),
    inLanguage: "en-KE",
  }).replace(/</g, "\\u003c");

  const metadataHtml = renderPageMetadata(template, {
    title,
    description,
    canonicalUrl,
    image: imageUrl,
    type: "article",
  });
  let html = updateMeta(metadataHtml, "property", "og:title", article.title);
  html = updateMeta(html, "name", "twitter:title", article.title);
  return html.replace(
    /<\/head>/i,
    `    <script type="application/ld+json">${structuredData}</script>\n  </head>`,
  );
}

export function renderPageMetadata(
  template: string,
  metadata: PageMetadata,
): string {
  const image = metadata.image || `${SITE_URL}/pklogo.png`;
  let html = template.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${escapeHtml(metadata.title)}</title>`,
  );
  const canonicalTag = `<link rel="canonical" href="${escapeHtml(metadata.canonicalUrl)}" />`;
  const canonicalMatcher = /<link rel="canonical" href="[^"]*"\s*\/?>/i;
  html = canonicalMatcher.test(html)
    ? html.replace(canonicalMatcher, canonicalTag)
    : html.replace(/<\/head>/i, `    ${canonicalTag}\n  </head>`);

  html = updateMeta(html, "name", "title", metadata.title);
  html = updateMeta(html, "name", "description", metadata.description);
  html = updateMeta(html, "property", "og:type", metadata.type || "website");
  html = updateMeta(html, "property", "og:title", metadata.title);
  html = updateMeta(html, "property", "og:description", metadata.description);
  html = updateMeta(html, "property", "og:url", metadata.canonicalUrl);
  html = updateMeta(html, "property", "og:image", image);
  html = updateMeta(html, "name", "twitter:title", metadata.title);
  html = updateMeta(html, "name", "twitter:description", metadata.description);
  html = updateMeta(html, "name", "twitter:url", metadata.canonicalUrl);
  html = updateMeta(html, "name", "twitter:image", image);
  return html;
}
