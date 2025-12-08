# PKMedia SEO Setup Guide

## ✅ Completed SEO Implementations

### 1. XML Sitemap
- **URL**: `https://pkmedia.co.ke/sitemap.xml`
- **Features**:
  - Lists all articles with metadata
  - Includes static pages (About, Contact, Privacy, Terms, Funders)
  - Google News sitemap tags
  - Image sitemap tags
  - Priority and change frequency indicators
  - Updates dynamically as new articles are published

### 2. Robots.txt
- **URL**: `https://pkmedia.co.ke/robots.txt`
- **Configuration**:
  - Allows all search engines to crawl public content
  - Disallows admin pages and API endpoints
  - Specifies sitemap location
  - Optimized for Googlebot, Bingbot, and other major crawlers

### 3. Meta Tags & SEO
- **Homepage**:
  - Title: "PKMedia - Mount Kenya News | Breaking News & Current Affairs"
  - Description optimized for search engines
  - Keywords targeting Kenya news market
  - Open Graph tags for social sharing
  - Twitter Card tags
  - Canonical URLs

- **Article Pages**:
  - Dynamic title based on article content
  - Auto-generated meta descriptions from article content
  - Article-specific Open Graph tags
  - Twitter Card with large image
  - Canonical URLs to prevent duplicate content
  - Published/Modified timestamps

### 4. Structured Data (Schema.org)
- **NewsArticle Schema** (JSON-LD):
  - Headline, description, image
  - Author information
  - Publisher information (PKMedia)
  - Date published/modified
  - Article section (category)
  - Keywords from tags
  - Language: en-KE (English - Kenya)

### 5. Google News Optimization
- Team credentials added to About page:
  - Peter Kamau Kariuki (Editor-in-Chief)
  - Emadau Mark Shadrack (Senior Reporter)
- Funding transparency page created
- Physical address and contact information
- NewsArticle schema markup
- News sitemap with publication details

### 6. Performance Optimizations
- Lazy loading for images (`loading="lazy"`)
- Optimized image formats via Cloudinary
- Code splitting with Vite
- Responsive images for all screen sizes

## 🎯 Next Steps for Google Registration

### Step 1: Verify Your Site
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click "Add Property"
3. Enter: `pkmedia.co.ke`
4. Choose verification method (HTML file, DNS, or meta tag)
5. Complete verification

### Step 2: Submit Sitemap
1. In Google Search Console, go to "Sitemaps"
2. Enter: `https://pkmedia.co.ke/sitemap.xml`
3. Click "Submit"
4. Wait for Google to crawl (can take 1-7 days)

### Step 3: Bing Webmaster Tools
1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Add your site: `pkmedia.co.ke`
3. Verify using one of their methods
4. Submit sitemap: `https://pkmedia.co.ke/sitemap.xml`

### Step 4: Google News Publisher Center
1. Go to [Google News Publisher Center](https://publishercenter.google.com)
2. Click "Add Publication"
3. Provide:
   - Publication name: PKMedia
   - URL: https://pkmedia.co.ke
   - Language: English
   - Country: Kenya
4. Complete verification process
5. Wait for Google News approval (can take 2-4 weeks)

### Step 5: Monitor & Optimize
1. Check Google Search Console weekly for:
   - Crawl errors
   - Index coverage
   - Performance metrics
   - Mobile usability issues
2. Fix any errors reported
3. Monitor which keywords drive traffic
4. Optimize content based on insights

## 📊 SEO Checklist

### Technical SEO ✅
- [x] XML Sitemap generated
- [x] Robots.txt configured
- [x] Canonical URLs implemented
- [x] HTTPS enabled (verify on production)
- [x] Mobile-responsive design
- [x] Fast loading times
- [x] Structured data (JSON-LD)
- [x] Meta tags on all pages
- [x] Open Graph tags
- [x] Twitter Card tags

### Content SEO ✅
- [x] Unique titles for each page
- [x] Meta descriptions under 160 characters
- [x] Keyword-rich content
- [x] Alt text for images
- [x] Internal linking structure
- [x] Categories and tags
- [x] Author attribution

### Google News Requirements ✅
- [x] Team credentials published
- [x] Funding transparency
- [x] Contact information
- [x] Privacy policy
- [x] Terms of service
- [x] Physical address
- [x] NewsArticle schema
- [x] Consistent publishing schedule
- [x] Original content
- [x] Clear date stamps

## 🔧 Maintenance Tasks

### Daily
- Publish fresh content regularly
- Monitor breaking news coverage

### Weekly
- Check Google Search Console for errors
- Review indexing status
- Monitor site speed
- Check for broken links

### Monthly
- Analyze traffic patterns
- Review top-performing articles
- Optimize underperforming content
- Update old articles with new information
- Review and update keywords

## 🎨 Best Practices

### Article Writing
1. **Headlines**: Clear, compelling, 50-60 characters
2. **First Paragraph**: Summary of key points
3. **Keywords**: Natural placement, avoid stuffing
4. **Images**: High quality, properly attributed
5. **Length**: Aim for 500+ words for depth
6. **Updates**: Add timestamps when updating articles

### Image Optimization
- Use descriptive file names
- Add alt text describing the image
- Include image attribution/credits
- Optimize file size (via Cloudinary)
- Use responsive images

### URL Structure
- Keep URLs short and descriptive
- Use hyphens between words
- Include primary keyword when relevant
- Format: `/article/article-title__article-id`

## 📱 Social Media Optimization

Your site is optimized for sharing on:
- Facebook (Open Graph tags)
- Twitter (Twitter Cards)
- WhatsApp (Open Graph tags)
- LinkedIn (Open Graph tags)

When articles are shared, they display:
- Featured image (1200x630px recommended)
- Article title
- Description/excerpt
- Publication date
- Author

## 🌍 Additional Search Engines

Consider submitting to:
- **Yandex Webmaster**: webmaster.yandex.com
- **DuckDuckGo**: Uses Bing index, no separate submission
- **Baidu**: For Chinese audience (if applicable)

## 📈 Expected Timeline

- **Initial Indexing**: 1-7 days after sitemap submission
- **First Rankings**: 2-4 weeks with regular content
- **Google News Approval**: 2-4 weeks after application
- **Stable Rankings**: 3-6 months with consistent publishing

## 🆘 Troubleshooting

### Site Not Appearing in Search
1. Check robots.txt isn't blocking crawlers
2. Verify sitemap submitted in Search Console
3. Ensure no `noindex` tags on pages
4. Check for crawl errors in Search Console
5. Wait 1-2 weeks for initial indexing

### Low Rankings
1. Publish more high-quality content
2. Build backlinks from reputable sites
3. Improve page load speed
4. Optimize for mobile
5. Use keywords naturally in content

### Google News Not Approving
1. Ensure team credentials are visible
2. Add funding transparency
3. Publish consistently (daily if possible)
4. Ensure original content only
5. Add clear date stamps
6. Contact support if delayed beyond 4 weeks

## 🔗 Useful Links

- Google Search Console: https://search.google.com/search-console
- Bing Webmaster Tools: https://www.bing.com/webmasters
- Google News Publisher Center: https://publishercenter.google.com
- Schema.org NewsArticle: https://schema.org/NewsArticle
- Google News Guidelines: https://support.google.com/news/publisher-center

---

**Status**: ✅ All SEO implementations complete and ready for search engine registration

**Last Updated**: December 8, 2025
