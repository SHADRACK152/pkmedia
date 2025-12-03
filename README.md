# PKMedia

A full-stack news platform built with React, Express, and PostgreSQL. Features article management, user authentication, comment moderation, and a professional admin dashboard.

## Features

- **News Homepage** - Responsive news feed with featured articles and category filtering
- **Article Details** - Full article pages with comments
- **Admin Dashboard** - Complete content management system
  - Article editor with rich forms
  - Category management
  - Comment moderation
  - User management
  - Media library
  - Site settings
- **Authentication** - Secure login system with session management
- **Comment System** - User comments with admin moderation workflow

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Wouter (routing)
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: Radix UI, shadcn/ui
- **Forms**: React Hook Form with Zod validation

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database (automatically set up in Replit)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will start on `http://localhost:5000`

### Database

Initialize or update the database schema:

```bash
npm run db:push
```

If you need to force update the schema:

```bash
npm run db:push --force
```

### Neon (Postgres) Setup

This repo uses a Postgres database for Drizzle and session storage. Set the `DATABASE_URL` environment variable to your Neon connection string.

Example (Windows cmd.exe):

```cmd
set DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require
set SESSION_SECRET=some_long_secret
npm install
npm run db:push
npm run dev
```

- The `drizzle` migration script reads `DATABASE_URL`. The server also uses `DATABASE_URL` for database queries and `pg` (a `pg.Pool`) for session storage.
- For serverless deployments or to reduce connection overhead, consider using `@neondatabase/serverless` or a connection pooler recommended by Neon.

Health check

The backend exposes `GET /api/health` which returns { ok: true } if the database connection is healthy.

User registration & settings
---------------------------
Users can register themselves at `/register` (frontend) which calls `POST /api/auth/register` to create an account.
They can edit their account and update password at `/settings` which calls `PUT /api/auth/me`.

Note: The settings page requires authentication; if you haven't logged in, the page will ask you to sign in first.

Using your logo
----------------
To show your `pklogo.png` across the website (navbar, admin, favicon), place the image at `client/public/pklogo.png`. The app will automatically look for `/pklogo.png` and use it where appropriate; if not found, the UI will keep textual fallbacks.

Example (Windows cmd.exe):

```cmd
copy path\to\your\pklogo.png client\public\pklogo.png
```

## Project Structure

```
├── client/              # Frontend React application
│   ├── src/
│   │   ├── pages/      # Page components (Home, Article, Admin)
│   │   ├── components/ # Reusable UI components
│   │   └── lib/        # Utilities and mock data
│   └── index.html      # HTML entry point
├── server/             # Backend Express server
│   ├── routes.ts       # API route definitions
│   ├── storage.ts      # Database operations (Drizzle)
│   ├── db.ts           # Database connection
│   └── app.ts          # Express app setup
├── shared/             # Shared types and schemas
│   └── schema.ts       # Drizzle ORM schemas
└── drizzle.config.ts   # Drizzle configuration
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/register` - Register user
- `GET /api/auth/me` - Get current user

### Articles
- `GET /api/articles` - List all articles
- `GET /api/articles/:id` - Get article details
- `POST /api/articles` - Create article (authenticated)
- `PUT /api/articles/:id` - Update article (authenticated)
- `DELETE /api/articles/:id` - Delete article (authenticated)

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category (authenticated)
- `DELETE /api/categories/:id` - Delete category (authenticated)

### Comments
- `GET /api/articles/:articleId/comments` - Get article comments
- `GET /api/comments` - List all comments
- `POST /api/comments` - Create comment
- `PATCH /api/comments/:id/status` - Update comment status (authenticated)
- `DELETE /api/comments/:id` - Delete comment (authenticated)

## AI Chat - Grok Integration

The server has support for using a Grok-like AI provider for the chatbot. By default, the simple rule-based `PKBoot` is used.

To enable a Grok provider, set the following environment variables in your local `.env` file (copy `.env.example` and fill values):

- `GROK_API_KEY` — your Grok API key (keep this secret; do not commit it)
- `GROK_API_URL` — the full URL to your Grok or console.grok completions endpoint
- `GROK_MODEL` — optional model identifier (defaults to `grok-1`)

When both `GROK_API_KEY` and `GROK_API_URL` are set, the `/api/chat` route will try to forward user messages to the remote AI provider, and fall back to the simple rule-based chatbot on error.

Security notes:
- Keep your API keys out of source control; `.env` is in `.gitignore`.
- Consider rotating keys and using runtime secrets managers (e.g., environment variables on the host) for production.


## Design

The platform uses a professional news aesthetic with:
- Blue, white, and red color scheme
- Merriweather serif font for headlines
- Inter sans-serif font for UI text
- Clean, modern layout with responsive design

## License

MIT
