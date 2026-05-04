import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { storage } from "./storage";
import type { Request, Response, NextFunction } from "express";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

export function buildSessionMiddleware() {
  if (!pool) {
    // Fallback to memory store if no database pool is available
    return session({
      secret: process.env.SESSION_SECRET || "cheetahs-dev-secret-change-me",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        sameSite: "lax",
      },
    });
  }

  const PgStore = connectPg(session);
  const store = new PgStore({
    pool,
    tableName: "sessions",
    createTableIfMissing: false,
  });

  return session({
    store,
    secret: process.env.SESSION_SECRET || "cheetahs-dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    },
  });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "غير مصرح به" });
  }
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "غير مصرح به" });
  }
  const user = await storage.getUserById(req.session.userId);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "هذه الصلاحية للمدير فقط" });
  }
  next();
}
