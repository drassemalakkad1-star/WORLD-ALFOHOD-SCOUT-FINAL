import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "../shared/schema";

neonConfig.webSocketConstructor = ws;

export const isDbConnected = !!process.env.DATABASE_URL;

if (!isDbConnected) {
  console.warn("[db] DATABASE_URL is not set. Falling back to in-memory storage.");
}

export const pool = isDbConnected ? new Pool({ connectionString: process.env.DATABASE_URL }) : null;
export const db = isDbConnected ? drizzle({ client: pool!, schema }) : null;
