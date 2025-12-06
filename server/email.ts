import { Resend } from 'resend';
import { generateNewsletterHTML, generateDripEmailHTML, type NewsletterArticle, type TemplateOptions } from './email-templates';

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
  articles: NewsletterArticle[];
  template?: TemplateOptions;
  trackingId?: string; // For analytics
}

export async function sendNewsletterEmail(data: NewsletterEmailData) {
  const client = getResendClient();
  const { to, articles, template, trackingId } = data;
  
  const { html, subject } = generateNewsletterHTML(
    articles.slice(0, template?.type === 'breaking_news' ? 1 : 5),
    to,
    template || { type: 'daily_digest' }
  );

  try {
    const result = await client.emails.send({
      from: process.env.EMAIL_FROM || 'PKMedia <newsletter@pkmedia.com>',
      to,
      subject,
      html,
      tags: trackingId ? [{ name: 'send_id', value: trackingId }] : undefined,
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
  const appUrl = process.env.APP_URL || 'https://pkmedia.vercel.app';
  
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
              <a href="${appUrl}" style="display: inline-block; background-color: #ef4444; color: white; font-size: 16px; font-weight: bold; padding: 14px 32px; border-radius: 8px; text-decoration: none;">Explore PKMedia</a>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 30px; background-color: #1e293b; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                <a href="${appUrl}/unsubscribe?email=${encodeURIComponent(to)}" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a>
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

export async function sendDripEmail(to: string, subject: string, htmlContent: string) {
  const client = getResendClient();
  const html = generateDripEmailHTML(subject, htmlContent, to);

  try {
    const result = await client.emails.send({
      from: process.env.EMAIL_FROM || 'PKMedia <newsletter@pkmedia.com>',
      to,
      subject,
      html,
    });

    console.log('Drip email sent successfully to:', to);
    return result;
  } catch (error) {
    console.error('Error sending drip email to', to, ':', error);
    throw error;
  }
}

export async function sendBreakingNewsAlert(to: string, article: NewsletterArticle) {
  return sendNewsletterEmail({
    to,
    articles: [article],
    template: {
      type: 'breaking_news',
      accentColor: '#dc2626', // Red for urgency
      layout: 'featured'
    }
  });
}

export async function sendVerificationEmail(to: string, token: string) {
  const client = getResendClient();
  const appUrl = process.env.APP_URL || 'https://pkmedia.vercel.app';
  const verifyUrl = `${appUrl}/newsletter/verify?token=${token}`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0 0 20px 0; color: #1e293b; font-size: 28px;">✉️ Verify Your Email</h1>
              <p style="margin: 0 0 30px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
                Please click the button below to confirm your subscription to PKMedia newsletters.
              </p>
              <a href="${verifyUrl}" style="display: inline-block; background-color: #ef4444; color: white; font-size: 16px; font-weight: bold; padding: 14px 32px; border-radius: 8px; text-decoration: none;">Verify Email</a>
              <p style="margin: 30px 0 0 0; color: #94a3b8; font-size: 13px;">
                If you didn't subscribe to PKMedia, you can safely ignore this email.
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
      subject: 'Verify your PKMedia subscription',
      html,
    });

    console.log('Verification email sent successfully to:', to);
    return result;
  } catch (error) {
    console.error('Error sending verification email to', to, ':', error);
    throw error;
  }
}
