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

## Design

The platform uses a professional news aesthetic with:
- Blue, white, and red color scheme
- Merriweather serif font for headlines
- Inter sans-serif font for UI text
- Clean, modern layout with responsive design

## License

MIT
