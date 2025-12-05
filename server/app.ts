import { type Server } from "node:http";

import express, { type Express, type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";
import passport from "passport";
import { storage } from "./storage.js";
import bcrypt from "bcryptjs";
import { registerRoutes } from "./routes.js";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export const app = express();

// Trust proxy is required for secure cookies to work behind Vercel/proxies
app.set("trust proxy", 1);

// Setup session store using Postgres via connect-pg-simple
const PgSession = connectPgSimple(session as any);
export const pgPool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Handle unexpected errors on idle clients to prevent process crash
pgPool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Apply session middleware only to API routes to avoid overhead on static files
app.use("/api",
  session({
    store: new PgSession({ pool: pgPool, tableName: 'session', createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  }),
);

// Initialize Passport for session-based auth (only for API)
app.use("/api", passport.initialize());
app.use("/api", passport.session());

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
// Create a JSON parser that captures the raw body for signed payloads or diagnostics.
const jsonParser = express.json({
  verify: (req, _res, buf) => {
    // Attach the raw buffer for handlers that need it (e.g., signature verification)
    (req as any).rawBody = buf;
  },
});

// Only run the JSON body parser for requests that may have a body (not for GET/HEAD).
app.use((req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD') return next();
  return jsonParser(req, res, next);
});

// Parse urlencoded bodies for form submissions (also skip for GET/HEAD)
const urlencodedParser = express.urlencoded({ extended: false });
app.use((req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD') return next();
  return urlencodedParser(req, res, next);
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

export default async function runApp(
  setup: (app: Express, server: Server) => Promise<void>,
) {
  const server = await registerRoutes(app);

  // verify DB connections before serving
  try {
    await pgPool.query("SELECT 1");
    log("connected to Postgres DB", "db");
    // Check if the connect-pg-simple session table exists and print a helpful warning
    try {
      const sessionCheck = await pgPool.query("SELECT to_regclass('public.session') as reg");
      if (!sessionCheck || !sessionCheck.rows || sessionCheck.rows.length === 0 || sessionCheck.rows[0].reg === null) {
        log("session table not found in Postgres DB: sessions will fail if not created. Run 'npm run db:push' to apply migrations.", "db");
      } else {
        log("session table exists in Postgres DB", "db");
      }
    } catch (err: any) {
      log(`Unable to determine session table presence: ${err.message}`);
    }
    // Inform about Grok configuration
    if (process.env.GROK_API_KEY) {
      log('Grok API key provided; AI responses will route to GROK provider if GROK_API_URL is set', 'ai');
      if (!process.env.GROK_API_URL) log('GROK_API_KEY present but GROK_API_URL is not set — please set GROK_API_URL in your .env', 'ai');
    } else {
      log('Grok not configured; using simple server rule-based chatbot', 'ai');
    }
  } catch (err: any) {
    log(`failed to connect to Postgres DB: ${err.message}`, "db");
    throw err;
  }

  // Ensure there is exactly one admin user (create default admin if none; demote extra admins)
  try {
    const admins = await storage.getUsersByRole("admin");
    if (!admins || admins.length === 0) {
      const defaultAdmin = {
        username: "admin",
        name: "PKMedia Admin",
        email: "admin@pkmedia.co.ke",
        password: await bcrypt.hash(process.env.ADMIN_PASSWORD || "Pkmedia@123", 10),
        role: "admin",
      };
      const createdAdmin = await storage.createUser(defaultAdmin as any);
      log(`Default admin account created: ${createdAdmin.username} <${createdAdmin.email}>`, "db");
    } else if (admins.length > 1) {
      // Keep first admin, demote others
      const [firstAdmin, ...others] = admins;
      for (const other of others) {
        await storage.updateUser(other.id, { role: "writer" as any });
        log(`Demoted extra admin account ${other.username} -> writer`, "db");
      }
    }
  } catch (err: any) {
    log(`Unable to ensure single admin exists: ${err.message}`, "db");
  }

  // importantly run the final setup after setting up all the other routes so
  // the catch-all route doesn't interfere with the other routes
  await setup(app, server);

  // Global error handler - must be after setup to catch errors from all middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Don't throw the error, just log it and send response
    console.error(err);
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
  });

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  const listenOptions: any = {
    port,
    host: "0.0.0.0",
  };
  // Windows doesn't support reusePort, only enable it on non-Windows systems
  if (process.platform !== 'win32') listenOptions.reusePort = true;

  server.listen(listenOptions, () => {
    log(`serving on port ${port}`);
  });
}
