import { Router } from "express";
import { storage } from "./storage";
import { requireAuth, requireAdmin } from "./auth";
import {
  insertUserSchema, loginSchema, insertOrderSchema,
  insertProgressSchema, insertLeaderboardSchema, insertContactSchema,
  userPreferencesSchema,
  insertNewsSchema, insertProductSchema, insertAcademyCourseSchema,
  insertYoutubeChannelSchema, insertYoutubeVideoSchema,
  insertSupportRequestSchema
} from "../shared/schema";
import { ZodError } from "zod";

export function buildRoutes() {
  const r = Router();

  r.get("/health", (_req, res) => res.json({ status: "ok" }));

  function handleError(res: any, err: unknown) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: "بيانات غير صالحة", details: err.flatten() });
    }
    const msg = err instanceof Error ? err.message : "خطأ غير معروف";
    console.error("[routes] error:", msg);
    return res.status(500).json({ error: msg });
  }

  // ===== Auth =====
  r.post("/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const existing = await storage.getUserByEmail(data.email);
      if (existing) return res.status(409).json({ error: "البريد الإلكتروني مسجل مسبقاً" });
      const user = await storage.createUser(data);
      req.session.userId = user.id;
      res.status(201).json({ user });
    } catch (e) { handleError(res, e); }
  });

  r.post("/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(data.email);
      if (!user) return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
      const ok = await storage.verifyPassword(data.password, user.passwordHash);
      if (!ok) return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
      req.session.userId = user.id;
      const { passwordHash, ...pub } = user;
      res.json({ user: pub });
    } catch (e) { handleError(res, e); }
  });

  r.post("/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ ok: true });
    });
  });

  r.get("/auth/me", async (req, res) => {
    if (!req.session.userId) return res.json({ user: null });
    const user = await storage.getUserById(req.session.userId);
    res.json({ user: user ?? null });
  });

  // ===== Orders =====
  r.post("/orders", async (req, res) => {
    try {
      const data = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(data, req.session.userId ?? null);
      res.status(201).json({ order });
    } catch (e) { handleError(res, e); }
  });

  r.get("/orders/mine", requireAuth, async (req, res) => {
    try {
      const list = await storage.getOrdersByUser(req.session.userId!);
      res.json({ orders: list });
    } catch (e) { handleError(res, e); }
  });

  // ===== Academy progress =====
  r.post("/academy/progress", requireAuth, async (req, res) => {
    try {
      const data = insertProgressSchema.parse(req.body);
      const row = await storage.markLessonComplete(req.session.userId!, data.courseSlug, data.lessonSlug);
      res.status(201).json({ progress: row });
    } catch (e) { handleError(res, e); }
  });

  r.get("/academy/progress", requireAuth, async (req, res) => {
    try {
      const list = await storage.getProgressByUser(req.session.userId!);
      res.json({ progress: list });
    } catch (e) { handleError(res, e); }
  });

  // ===== Leaderboard =====
  r.get("/leaderboard/:gameKey", async (req, res) => {
    try {
      const list = await storage.getLeaderboardByGame(req.params.gameKey, 10);
      res.json({ entries: list });
    } catch (e) { handleError(res, e); }
  });

  r.post("/leaderboard", async (req, res) => {
    try {
      const data = insertLeaderboardSchema.parse(req.body);
      const row = await storage.saveLeaderboard(data);
      res.status(201).json({ entry: row });
    } catch (e) { handleError(res, e); }
  });

  // ===== Contact =====
  r.post("/contact", async (req, res) => {
    try {
      const data = insertContactSchema.parse(req.body);
      const msg = await storage.createContact(data);
      res.status(201).json({ message: msg });
    } catch (e) { handleError(res, e); }
  });

  // ===== User Preferences =====
  r.get("/user/preferences", requireAuth, async (req, res) => {
    try {
      const prefs = await storage.getUserPreferences(req.session.userId!);
      res.json({ preferences: prefs });
    } catch (e) { handleError(res, e); }
  });

  r.patch("/user/preferences", requireAuth, async (req, res) => {
    try {
      const data = userPreferencesSchema.parse(req.body);
      const prefs = await storage.upsertUserPreferences(req.session.userId!, data);
      res.json({ preferences: prefs });
    } catch (e) { handleError(res, e); }
  });

  // ===== Admin: Users =====
  r.get("/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.listUsers();
      res.json({ users });
    } catch (e) { handleError(res, e); }
  });

  r.patch("/admin/users/:id/role", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(String(req.params.id));
      const { role } = req.body;
      const user = await storage.updateUserRole(userId, role);
      res.json({ user });
    } catch (e) { handleError(res, e); }
  });

  // ===== Admin: Stats (New) =====
  r.get("/admin/stats", requireAdmin, async (req, res) => {
    try {
      const [users, newsList, productsList, coursesList] = await Promise.all([
        storage.listUsers(),
        storage.listNews(),
        storage.listProducts(),
        storage.listCourses(),
      ]);
      res.json({
        totalUsers: users.length,
        totalNews: newsList.length,
        totalProducts: productsList.length,
        totalCourses: coursesList.length,
      });
    } catch (e) { handleError(res, e); }
  });

  // ===== Admin: News =====
  r.get("/admin/news", requireAdmin, async (req, res) => {
    try { res.json({ news: await storage.listNews() }); } catch (e) { handleError(res, e); }
  });
  r.post("/admin/news", requireAdmin, async (req, res) => {
    try { res.status(201).json({ article: await storage.createNews(insertNewsSchema.parse(req.body)) }); } catch (e) { handleError(res, e); }
  });
  r.patch("/admin/news/:id", requireAdmin, async (req, res) => {
    try { res.json({ article: await storage.updateNews(parseInt(String(req.params.id)), req.body) }); } catch (e) { handleError(res, e); }
  });
  r.delete("/admin/news/:id", requireAdmin, async (req, res) => {
    try { await storage.deleteNews(parseInt(String(req.params.id))); res.status(204).end(); } catch (e) { handleError(res, e); }
  });

  // ===== Admin: Products =====
  r.get("/admin/products", requireAdmin, async (req, res) => {
    try { res.json({ products: await storage.listProducts() }); } catch (e) { handleError(res, e); }
  });
  r.post("/admin/products", requireAdmin, async (req, res) => {
    try { res.status(201).json({ product: await storage.createProduct(insertProductSchema.parse(req.body)) }); } catch (e) { handleError(res, e); }
  });
  r.patch("/admin/products/:id", requireAdmin, async (req, res) => {
    try { res.json({ product: await storage.updateProduct(parseInt(String(req.params.id)), req.body) }); } catch (e) { handleError(res, e); }
  });
  r.delete("/admin/products/:id", requireAdmin, async (req, res) => {
    try { await storage.deleteProduct(parseInt(String(req.params.id))); res.status(204).end(); } catch (e) { handleError(res, e); }
  });

  // ===== Admin: Academy =====
  r.get("/admin/courses", requireAdmin, async (req, res) => {
    try { res.json({ courses: await storage.listCourses() }); } catch (e) { handleError(res, e); }
  });
  r.post("/admin/courses", requireAdmin, async (req, res) => {
    try { res.status(201).json({ course: await storage.createCourse(insertAcademyCourseSchema.parse(req.body)) }); } catch (e) { handleError(res, e); }
  });
  r.patch("/admin/courses/:id", requireAdmin, async (req, res) => {
    try { res.json({ course: await storage.updateCourse(parseInt(String(req.params.id)), req.body) }); } catch (e) { handleError(res, e); }
  });
  r.delete("/admin/courses/:id", requireAdmin, async (req, res) => {
    try { await storage.deleteCourse(parseInt(String(req.params.id))); res.status(204).end(); } catch (e) { handleError(res, e); }
  });

  // ===== YouTube API =====
  r.get("/youtube/channels", async (req, res) => {
    try { res.json({ channels: await storage.listYoutubeChannels() }); } catch (e) { handleError(res, e); }
  });

  r.get("/youtube/videos", async (req, res) => {
    try { res.json({ videos: await storage.listYoutubeVideos(req.query.channelId as string) }); } catch (e) { handleError(res, e); }
  });

  r.post("/admin/youtube/channels", requireAdmin, async (req, res) => {
    try {
      const channel = await storage.createYoutubeChannel(insertYoutubeChannelSchema.parse(req.body));
      res.status(201).json({ channel });
    } catch (e) { handleError(res, e); }
  });

  r.delete("/admin/youtube/channels/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteYoutubeChannel(parseInt(String(req.params.id)));
      res.status(204).end();
    } catch (e) { handleError(res, e); }
  });

  r.post("/admin/youtube/sync/:channelId", requireAdmin, async (req, res) => {
    try {
      const { channelId } = req.params;
      const { videos } = req.body;
      if (!Array.isArray(videos)) throw new Error("قائمة الفيديوهات غير صالحة");
      
      const parsedVideos = videos.map((v: any) => insertYoutubeVideoSchema.parse({
        ...v,
        channelId
      }));
      
      await storage.syncYoutubeVideos(String(channelId), parsedVideos);
      res.json({ ok: true, count: parsedVideos.length });
    } catch (e) { handleError(res, e); }
  });

  // ===== Support Requests (Solidarity Store) =====
  r.post("/support-requests", async (req, res) => {
    try {
      const data = insertSupportRequestSchema.parse(req.body);
      const row = await storage.createSupportRequest(data, req.session.userId ?? null);
      res.status(201).json({ request: row });
    } catch (e) { handleError(res, e); }
  });

  return r;
}
