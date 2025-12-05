# Newsletter Setup Instructions

## Email Service Configuration

The newsletter feature uses [Resend](https://resend.com) for sending emails. Follow these steps:

### 1. Create a Resend Account
1. Go to https://resend.com and sign up
2. Verify your email address
3. Add your domain (or use their testing domain for development)

### 2. Get Your API Key
1. Go to API Keys section in Resend dashboard
2. Create a new API key
3. Copy the key (starts with `re_`)

### 3. Add Environment Variables

Add these to your `.env` file and Vercel environment variables:

```env
# Resend Email Service
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=PKMedia <newsletter@yourdomain.com>
APP_URL=https://yourdomain.vercel.app
```

**Important:** Replace `yourdomain.com` with your actual domain or use Resend's testing email during development.

### 4. Domain Verification (Production)

For production use:
1. In Resend dashboard, go to Domains
2. Add your domain (e.g., `pkmedia.com`)
3. Add the DNS records Resend provides to your domain registrar
4. Wait for verification (usually takes a few minutes)
5. Update `EMAIL_FROM` to use your verified domain

### 5. Testing

During development, you can use Resend's test mode:
- Emails sent to `delivered@resend.dev` will be marked as delivered
- Check the Resend dashboard for email logs

## Features

### What Works Now:
✅ Newsletter subscription (Footer + Morning Brief widget)
✅ Welcome email sent automatically when someone subscribes
✅ Admin dashboard to view all subscribers
✅ "Send Newsletter" button to send to all active subscribers
✅ Unsubscribe functionality with dedicated page
✅ Beautiful HTML email templates

### How to Send Newsletter:
1. Go to Admin Dashboard → Newsletter tab
2. Click "Send Newsletter" button
3. System will automatically:
   - Fetch latest 5 articles
   - Generate beautiful HTML email
   - Send to all active subscribers
   - Show success/failure count

### Email Templates Include:
- **Welcome Email:** Sent when someone subscribes
- **Morning Brief:** Daily newsletter with top 5 stories, images, and links

## Free Tier Limits

Resend free tier includes:
- 100 emails per day
- 3,000 emails per month
- Great for getting started!

For higher volume, check their paid plans.

## Troubleshooting

**Emails not sending?**
- Check RESEND_API_KEY is set correctly
- Verify domain is added and verified in Resend
- Check Resend dashboard logs for errors

**Unsubscribe not working?**
- Ensure APP_URL is set correctly
- Check browser console for errors

**Welcome email not sent?**
- Check server logs for errors
- Verify RESEND_API_KEY is set
- Email sends in background, doesn't block subscription
