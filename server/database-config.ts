import "dotenv/config";

export function getDatabaseUrl(value = process.env.DATABASE_URL): string {
  const connectionString = value?.trim();
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add a PostgreSQL connection URL to your .env file or environment.",
    );
  }

  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error("DATABASE_URL must be a valid PostgreSQL connection URL.");
  }

  if (
    (url.protocol !== "postgres:" && url.protocol !== "postgresql:") ||
    !url.hostname
  ) {
    throw new Error("DATABASE_URL must be a valid PostgreSQL connection URL.");
  }

  const hostname = url.hostname.toLowerCase();
  const isLoopback =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1";
  const localDatabaseAllowed =
    process.env.ALLOW_LOCAL_DATABASE === "true";

  if (isLoopback && !localDatabaseAllowed) {
    throw new Error(
      "DATABASE_URL points to a local PostgreSQL server. Set ALLOW_LOCAL_DATABASE=true only when intentionally using a local database.",
    );
  }

  return connectionString;
}
