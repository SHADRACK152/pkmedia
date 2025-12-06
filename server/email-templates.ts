// Newsletter Email Templates with different layouts

export interface NewsletterArticle {
  title: string;
  excerpt: string;
  url: string;
  image?: string;
  category: string;
}

export interface TemplateOptions {
  type: 'daily_digest' | 'weekly_roundup' | 'breaking_news' | 'custom';
  headerColor?: string;
  accentColor?: string;
  layout?: 'compact' | 'featured' | 'grid';
  customIntro?: string;
  customFooter?: string;
  includeImages?: boolean;
}

export function generateNewsletterHTML(
  articles: NewsletterArticle[],
  recipientEmail: string,
  options: TemplateOptions = { type: 'daily_digest' }
): { html: string; subject: string } {
  const {
    type,
    headerColor = '#1e293b',
    accentColor = '#ef4444',
    layout = 'compact',
    customIntro = '',
    customFooter = '',
    includeImages = true
  } = options;

  const date = new Date();
  const formattedDate = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const appUrl = process.env.APP_URL || 'https://pkmedia.vercel.app';
  const unsubscribeUrl = `${appUrl}/unsubscribe?email=${encodeURIComponent(recipientEmail)}`;

  let subject = '';
  let headerTitle = '';
  let headerSubtitle = '';

  switch (type) {
    case 'daily_digest':
      subject = `📰 Daily Digest - ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      headerTitle = '📰 The Morning Brief';
      headerSubtitle = 'Your daily digest from PKMedia';
      break;
    case 'weekly_roundup':
      subject = `📅 Weekly Roundup - Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      headerTitle = '📅 Weekly Roundup';
      headerSubtitle = 'Top stories from the past week';
      break;
    case 'breaking_news':
      subject = `🚨 Breaking: ${articles[0]?.title || 'Important News Alert'}`;
      headerTitle = '🚨 Breaking News';
      headerSubtitle = 'Important update from PKMedia';
      break;
    case 'custom':
      subject = `PKMedia Newsletter - ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      headerTitle = 'PKMedia Newsletter';
      headerSubtitle = 'Hand-picked stories for you';
      break;
  }

  const articlesHTML = layout === 'compact' 
    ? generateCompactLayout(articles, accentColor, includeImages)
    : layout === 'featured'
    ? generateFeaturedLayout(articles, accentColor, includeImages)
    : generateGridLayout(articles, accentColor, includeImages);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${headerColor} 0%, ${adjustColor(headerColor, 20)} 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">${headerTitle}</h1>
              <p style="margin: 10px 0 0 0; color: #cbd5e1; font-size: 14px;">${headerSubtitle}</p>
            </td>
          </tr>
          
          <!-- Date -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 14px; text-align: center;">
                ${formattedDate}
              </p>
            </td>
          </tr>
          
          ${customIntro ? `
          <!-- Custom Intro -->
          <tr>
            <td style="padding: 30px 30px 0 30px;">
              <div style="color: #64748b; font-size: 15px; line-height: 1.6;">
                ${customIntro}
              </div>
            </td>
          </tr>
          ` : ''}
          
          <!-- Articles -->
          ${articlesHTML}
          
          <!-- CTA -->
          <tr>
            <td style="padding: 30px; background-color: #f8fafc; text-align: center;">
              <a href="${appUrl}" style="display: inline-block; background-color: ${accentColor}; color: white; font-size: 16px; font-weight: bold; padding: 14px 32px; border-radius: 8px; text-decoration: none;">Visit PKMedia</a>
            </td>
          </tr>
          
          ${customFooter ? `
          <!-- Custom Footer -->
          <tr>
            <td style="padding: 20px 30px; border-top: 1px solid #e2e8f0;">
              <div style="color: #94a3b8; font-size: 13px; line-height: 1.6; text-align: center;">
                ${customFooter}
              </div>
            </td>
          </tr>
          ` : ''}
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: ${headerColor}; text-align: center;">
              <p style="margin: 0 0 15px 0; color: #cbd5e1; font-size: 12px;">
                © ${date.getFullYear()} PKMedia. All rights reserved.
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                You're receiving this because you subscribed to PKMedia newsletters.<br/>
                <a href="${unsubscribeUrl}" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return { html, subject };
}

function generateCompactLayout(articles: NewsletterArticle[], accentColor: string, includeImages: boolean): string {
  return `
    <tr>
      <td style="padding: 30px;">
        <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 20px; font-weight: bold;">Today's Top Stories</h2>
        
        ${articles.map((article, index) => `
          <div style="margin-bottom: ${index < articles.length - 1 ? '25px' : '0'}; padding-bottom: ${index < articles.length - 1 ? '25px' : '0'}; border-bottom: ${index < articles.length - 1 ? '1px solid #e2e8f0' : 'none'};">
            ${includeImages && article.image ? `
              <img src="${article.image}" alt="${article.title}" style="width: 100%; height: 180px; object-fit: cover; border-radius: 8px; margin-bottom: 12px;" />
            ` : ''}
            <span style="display: inline-block; background-color: ${accentColor}; color: white; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 4px; margin-bottom: 8px; text-transform: uppercase;">${article.category}</span>
            <h3 style="margin: 8px 0; color: #1e293b; font-size: 16px; font-weight: bold; line-height: 1.4;">
              <a href="${article.url}" style="color: #1e293b; text-decoration: none;">${article.title}</a>
            </h3>
            <p style="margin: 8px 0; color: #64748b; font-size: 14px; line-height: 1.6;">${article.excerpt}</p>
            <a href="${article.url}" style="display: inline-block; margin-top: 8px; color: ${accentColor}; font-size: 14px; font-weight: 600; text-decoration: none;">Read More →</a>
          </div>
        `).join('')}
      </td>
    </tr>
  `;
}

function generateFeaturedLayout(articles: NewsletterArticle[], accentColor: string, includeImages: boolean): string {
  const featured = articles[0];
  const rest = articles.slice(1);

  return `
    <tr>
      <td style="padding: 30px;">
        <!-- Featured Article -->
        ${featured ? `
          <div style="margin-bottom: 30px; padding-bottom: 30px; border-bottom: 2px solid #e2e8f0;">
            ${includeImages && featured.image ? `
              <img src="${featured.image}" alt="${featured.title}" style="width: 100%; height: 280px; object-fit: cover; border-radius: 12px; margin-bottom: 15px;" />
            ` : ''}
            <span style="display: inline-block; background-color: ${accentColor}; color: white; font-size: 12px; font-weight: bold; padding: 5px 14px; border-radius: 4px; margin-bottom: 10px; text-transform: uppercase;">Featured: ${featured.category}</span>
            <h2 style="margin: 10px 0; color: #1e293b; font-size: 24px; font-weight: bold; line-height: 1.3;">
              <a href="${featured.url}" style="color: #1e293b; text-decoration: none;">${featured.title}</a>
            </h2>
            <p style="margin: 10px 0 15px 0; color: #64748b; font-size: 15px; line-height: 1.6;">${featured.excerpt}</p>
            <a href="${featured.url}" style="display: inline-block; background-color: ${accentColor}; color: white; font-size: 15px; font-weight: bold; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Read Full Story</a>
          </div>
        ` : ''}
        
        <!-- More Stories -->
        ${rest.length > 0 ? `
          <h3 style="margin: 0 0 15px 0; color: #1e293b; font-size: 18px; font-weight: bold;">More Stories</h3>
          ${rest.map((article, index) => `
            <div style="margin-bottom: ${index < rest.length - 1 ? '20px' : '0'}; padding-bottom: ${index < rest.length - 1 ? '20px' : '0'}; border-bottom: ${index < rest.length - 1 ? '1px solid #e2e8f0' : 'none'};">
              <span style="display: inline-block; background-color: ${accentColor}; color: white; font-size: 10px; font-weight: bold; padding: 3px 10px; border-radius: 3px; margin-bottom: 6px; text-transform: uppercase;">${article.category}</span>
              <h4 style="margin: 6px 0; color: #1e293b; font-size: 15px; font-weight: bold; line-height: 1.4;">
                <a href="${article.url}" style="color: #1e293b; text-decoration: none;">${article.title}</a>
              </h4>
              <a href="${article.url}" style="color: ${accentColor}; font-size: 13px; font-weight: 600; text-decoration: none;">Read More →</a>
            </div>
          `).join('')}
        ` : ''}
      </td>
    </tr>
  `;
}

function generateGridLayout(articles: NewsletterArticle[], accentColor: string, includeImages: boolean): string {
  return `
    <tr>
      <td style="padding: 30px;">
        <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 20px; font-weight: bold;">Top Stories</h2>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${articles.map((article, index) => {
            if (index % 2 === 0) {
              const nextArticle = articles[index + 1];
              return `
                <tr>
                  <td style="width: 48%; padding-bottom: 20px; vertical-align: top;">
                    ${includeImages && article.image ? `
                      <img src="${article.image}" alt="${article.title}" style="width: 100%; height: 140px; object-fit: cover; border-radius: 6px; margin-bottom: 10px;" />
                    ` : ''}
                    <span style="display: inline-block; background-color: ${accentColor}; color: white; font-size: 9px; font-weight: bold; padding: 3px 8px; border-radius: 3px; margin-bottom: 6px; text-transform: uppercase;">${article.category}</span>
                    <h4 style="margin: 6px 0; color: #1e293b; font-size: 14px; font-weight: bold; line-height: 1.3;">
                      <a href="${article.url}" style="color: #1e293b; text-decoration: none;">${article.title}</a>
                    </h4>
                  </td>
                  ${nextArticle ? `
                    <td style="width: 4%;"></td>
                    <td style="width: 48%; padding-bottom: 20px; vertical-align: top;">
                      ${includeImages && nextArticle.image ? `
                        <img src="${nextArticle.image}" alt="${nextArticle.title}" style="width: 100%; height: 140px; object-fit: cover; border-radius: 6px; margin-bottom: 10px;" />
                      ` : ''}
                      <span style="display: inline-block; background-color: ${accentColor}; color: white; font-size: 9px; font-weight: bold; padding: 3px 8px; border-radius: 3px; margin-bottom: 6px; text-transform: uppercase;">${nextArticle.category}</span>
                      <h4 style="margin: 6px 0; color: #1e293b; font-size: 14px; font-weight: bold; line-height: 1.3;">
                        <a href="${nextArticle.url}" style="color: #1e293b; text-decoration: none;">${nextArticle.title}</a>
                      </h4>
                    </td>
                  ` : '<td style="width: 52%;"></td>'}
                </tr>
              `;
            }
            return '';
          }).join('')}
        </table>
      </td>
    </tr>
  `;
}

// Helper function to adjust color brightness
function adjustColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (
    0x1000000 +
    (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)
  ).toString(16).slice(1);
}

// Generate drip campaign email HTML
export function generateDripEmailHTML(
  subject: string,
  content: string,
  recipientEmail: string
): string {
  const appUrl = process.env.APP_URL || 'https://pkmedia.vercel.app';
  const unsubscribeUrl = `${appUrl}/unsubscribe?email=${encodeURIComponent(recipientEmail)}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 30px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 30px; background-color: #1e293b; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                <a href="${unsubscribeUrl}" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
