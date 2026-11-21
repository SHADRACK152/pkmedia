import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema.js";
import { getDatabaseUrl } from "./database-config.js";

const client = postgres(getDatabaseUrl());
export const db = drizzle(client, { schema });
