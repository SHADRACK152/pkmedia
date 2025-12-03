# Deployment Plan for PKMedia on Vercel

This document outlines the steps to deploy the PKMedia application to **Vercel**. Vercel is an excellent choice for frontend performance and has a generous free tier, though it requires some specific configurations for the backend.

## 1. Prerequisites

*   **GitHub Account:** Your code must be pushed to a GitHub repository.
*   **Vercel Account:** Sign up at [vercel.com](https://vercel.com).
*   **Database:** A cloud-hosted PostgreSQL database. You are already using **NeonDB**, which is perfect.
*   **Cloud Storage (Important):** Vercel has a **read-only filesystem**. You cannot save uploaded images to the local `uploads/` folder. You must switch to a cloud storage provider like **Vercel Blob**, **AWS S3**, or **Cloudinary** for image uploads to work in production.

## 2. Project Configuration

We have already added the necessary files for Vercel support:
*   `api/index.ts`: The entry point for the serverless backend.
*   `vercel.json`: Configuration to handle routing and rewrites.

### Step 2.1: Verify Build Settings
In `vite.config.ts`, the build output is set to `dist/public`. We need to tell Vercel this.

## 3. Deployment Steps

### Step 3.1: Push to GitHub
Ensure all your latest changes, including `api/index.ts` and `vercel.json`, are committed and pushed to GitHub.

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 3.2: Import into Vercel
1.  Go to your Vercel Dashboard.
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your `pkmedia` repository.

### Step 3.3: Configure Project Settings
In the "Configure Project" screen:

1.  **Framework Preset:** Select **Vite**.
2.  **Root Directory:** Leave as `./` (default).
3.  **Build & Development Settings:**
    *   **Output Directory:** Change this to `dist/public` (This is crucial because your `vite.config.ts` outputs here).
    *   **Install Command:** `npm install` (default is fine).
    *   **Build Command:** `npm run build` (default is fine).

4.  **Environment Variables:**
    Expand the "Environment Variables" section and add the following from your `.env` file:
    *   `DATABASE_URL`: (Your NeonDB connection string)
    *   `SESSION_SECRET`: (A long random string)
    *   `NODE_ENV`: `production`
    *   `GROK_API_KEY`: (If you are using Grok)
    *   `GROK_API_URL`: (If you are using Grok)

### Step 3.4: Deploy
Click **"Deploy"**. Vercel will build your frontend and set up the serverless functions.

## 4. Post-Deployment Checks

1.  **Visit the URL:** Vercel will provide a domain (e.g., `pkmedia.vercel.app`).
2.  **Test API:** Try logging in or viewing articles.
3.  **Database Migrations:** Vercel does *not* automatically run your migrations (`npm run db:push`). You should run this locally from your machine to update the production database:
    ```bash
    # Ensure your local .env has the PRODUCTION database URL
    npm run db:push
    ```

## 5. Known Limitations & Fixes

### Image Uploads
**Issue:** The current code saves images to a local `uploads/` folder. On Vercel, these uploads will fail or disappear immediately because the filesystem is ephemeral.
**Solution:**
1.  Sign up for **Vercel Blob** (easiest integration).
2.  Update `server/routes.ts` to upload to Vercel Blob instead of `multer.diskStorage`.

### Cold Starts
Serverless functions can have a slight delay ("cold start") if they haven't been used in a while. This is normal for the free tier.

### Database Connections
Serverless functions can exhaust database connections. NeonDB handles this well, but ensure you are using the **pooled connection string** (usually ends in `-pooler` or you see `pgbouncer` references) if available, though standard Neon connection strings work fine for moderate traffic.
