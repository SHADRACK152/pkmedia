import { Resend } from 'resend';

let resend: Resend | null = null;

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export interface NewsletterEmailData {
  to: string;
  articles: Array<{
    title: string;
    excerpt: string;
    url: string;
    image?: string;
    category: string;
  }>;
}

export async function sendNewsletterEmail(data: NewsletterEmailData) {
  const client = getResendClient();
  const { to, articles } = data;
  
  const topArticles = articles.slice(0, 5);
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Morning Brief - PKMedia</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">📰 The Morning Brief</h1>
              <p style="margin: 10px 0 0 0; color: #cbd5e1; font-size: 14px;">Your daily digest from PKMedia</p>
            </td>
          </tr>
          
          <!-- Date -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 14px; text-align: center;">
                ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </td>
          </tr>
          
          <!-- Articles -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 20px; font-weight: bold;">Today's Top Stories</h2>
              
              ${topArticles.map((article, index) => `
                <div style="margin-bottom: ${index < topArticles.length - 1 ? '30px' : '0'}; padding-bottom: ${index < topArticles.length - 1 ? '30px' : '0'}; border-bottom: ${index < topArticles.length - 1 ? '1px solid #e2e8f0' : 'none'};">
                  ${article.image ? `
                    <img src="${article.image}" alt="${article.title}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 15px;" />
                  ` : ''}
                  <span style="display: inline-block; background-color: #ef4444; color: white; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 4px; margin-bottom: 10px; text-transform: uppercase;">${article.category}</span>
                  <h3 style="margin: 10px 0; color: #1e293b; font-size: 18px; font-weight: bold; line-height: 1.4;">
                    <a href="${article.url}" style="color: #1e293b; text-decoration: none;">${article.title}</a>
                  </h3>
                  <p style="margin: 10px 0; color: #64748b; font-size: 14px; line-height: 1.6;">${article.excerpt}</p>
                  <a href="${article.url}" style="display: inline-block; margin-top: 10px; color: #ef4444; font-size: 14px; font-weight: 600; text-decoration: none;">Read Full Story →</a>
                </div>
              `).join('')}
            </td>
          </tr>
          
          <!-- CTA -->
          <tr>
            <td style="padding: 30px; background-color: #f8fafc; text-align: center;">
              <a href="${process.env.APP_URL || 'https://pkmedia.vercel.app'}" style="display: inline-block; background-color: #ef4444; color: white; font-size: 16px; font-weight: bold; padding: 14px 32px; border-radius: 8px; text-decoration: none;">Visit PKMedia</a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #1e293b; text-align: center;">
              <p style="margin: 0 0 15px 0; color: #cbd5e1; font-size: 12px;">
                © ${new Date().getFullYear()} PKMedia. All rights reserved.
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                You're receiving this because you subscribed to The Morning Brief.<br/>
                <a href="${process.env.APP_URL || 'https://pkmedia.vercel.app'}/unsubscribe?email=${encodeURIComponent(to)}" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a>
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

  try {
    const result = await client.emails.send({
      from: process.env.EMAIL_FROM || 'PKMedia <newsletter@pkmedia.com>',
      to,
      subject: `📰 The Morning Brief - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      html,
    });

    console.log('Newsletter email sent successfully to:', to);
    return result;
  } catch (error) {
    console.error('Error sending newsletter email to', to, ':', error);
    throw error;
  }
}

export async function sendWelcomeEmail(to: string) {
  const client = getResendClient();
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to PKMedia Newsletter</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <tr>
            <td style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 50px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 36px; font-weight: bold;">Welcome! 🎉</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 24px;">You're now subscribed to The Morning Brief</h2>
              <p style="margin: 0 0 20px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
                Thank you for joining PKMedia! You'll receive daily updates with the most important stories from Kenya, Africa, and around the world.
              </p>
              <p style="margin: 0 0 30px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
                Your first Morning Brief will arrive tomorrow. Get ready for quality journalism delivered straight to your inbox!
              </p>
              <a href="${process.env.APP_URL || 'https://pkmedia.vercel.app'}" style="display: inline-block; background-color: #ef4444; color: white; font-size: 16px; font-weight: bold; padding: 14px 32px; border-radius: 8px; text-decoration: none;">Explore PKMedia</a>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 30px; background-color: #1e293b; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                <a href="${process.env.APP_URL || 'https://pkmedia.vercel.app'}/unsubscribe?email=${encodeURIComponent(to)}" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a>
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

  try {
    const result = await client.emails.send({
      from: process.env.EMAIL_FROM || 'PKMedia <newsletter@pkmedia.com>',
      to,
      subject: '🎉 Welcome to The Morning Brief - PKMedia',
      html,
    });

    console.log('Welcome email sent successfully to:', to);
    return result;
  } catch (error) {
    console.error('Error sending welcome email to', to, ':', error);
    throw error;
  }
}
