import { defineConfig } from "drizzle-kit";
import { getDatabaseUrl } from "./server/database-config";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: getDatabaseUrl(),
  },
});
