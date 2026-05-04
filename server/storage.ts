import { db, pool, isDbConnected } from "./db";
import { and, desc, eq, sql } from "drizzle-orm";
import {
  users, orders, orderItems, academyProgress, leaderboardEntries, contactMessages, userPreferences,
  news, products, academyCourses, youtubeChannels, youtubeVideos, supportRequests,
  type User, type InsertUser, type PublicUser,
  type Order, type OrderItem, type InsertOrder, type OrderWithItems,
  type Progress, type InsertProgress,
  type LeaderboardEntry, type InsertLeaderboard,
  type ContactMessage, type InsertContact,
  type UserPreferences, type UserPreferencesInput,
  type NewsArticle, type InsertNews,
  type ProductEntry, type InsertProduct,
  type AcademyCourseEntry, type InsertAcademyCourse,
  type YoutubeChannelEntry, type InsertYoutubeChannel,
  type YoutubeVideoEntry, type InsertYoutubeVideo,
  type SupportRequest, type InsertSupportRequest,
} from "../shared/schema";
import bcrypt from "bcryptjs";

function toPublic(u: User): PublicUser {
  const { passwordHash, ...rest } = u;
  return rest;
}

export interface IStorage {
  createUser(input: InsertUser): Promise<PublicUser>;
  getUserById(id: number): Promise<PublicUser | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  verifyPassword(plain: string, hash: string): Promise<boolean>;
  listUsers(): Promise<PublicUser[]>;
  updateUserRole(id: number, role: string): Promise<PublicUser>;

  createOrder(input: InsertOrder, userId: number | null): Promise<OrderWithItems>;
  getOrdersByUser(userId: number): Promise<OrderWithItems[]>;

  markLessonComplete(userId: number, courseSlug: string, lessonSlug: string): Promise<Progress>;
  getProgressByUser(userId: number): Promise<Progress[]>;

  saveLeaderboard(input: InsertLeaderboard): Promise<LeaderboardEntry>;
  getLeaderboardByGame(gameKey: string, limit?: number): Promise<LeaderboardEntry[]>;
  clearLeaderboardByGame(gameKey: string): Promise<void>;

  createContact(input: InsertContact): Promise<ContactMessage>;

  getUserPreferences(userId: number): Promise<UserPreferences>;
  upsertUserPreferences(userId: number, patch: UserPreferencesInput): Promise<UserPreferences>;

  // Admin CRUD for News
  listNews(): Promise<NewsArticle[]>;
  createNews(input: InsertNews): Promise<NewsArticle>;
  updateNews(id: number, patch: Partial<InsertNews>): Promise<NewsArticle>;
  deleteNews(id: number): Promise<void>;

  // Admin CRUD for Products
  listProducts(): Promise<ProductEntry[]>;
  createProduct(input: InsertProduct): Promise<ProductEntry>;
  updateProduct(id: number, patch: Partial<InsertProduct>): Promise<ProductEntry>;
  deleteProduct(id: number): Promise<void>;

  // Admin CRUD for Academy
  listCourses(): Promise<AcademyCourseEntry[]>;
  createCourse(input: InsertAcademyCourse): Promise<AcademyCourseEntry>;
  updateCourse(id: number, patch: Partial<InsertAcademyCourse>): Promise<AcademyCourseEntry>;
  deleteCourse(id: number): Promise<void>;

  // YouTube Integration
  listYoutubeChannels(): Promise<YoutubeChannelEntry[]>;
  createYoutubeChannel(input: InsertYoutubeChannel): Promise<YoutubeChannelEntry>;
  deleteYoutubeChannel(id: number): Promise<void>;
  listYoutubeVideos(channelId?: string): Promise<YoutubeVideoEntry[]>;
  syncYoutubeVideos(channelId: string, videos: InsertYoutubeVideo[]): Promise<void>;

  // Support Requests (Solidarity Store)
  createSupportRequest(input: InsertSupportRequest, userId: number | null): Promise<SupportRequest>;
}

class DbStorage implements IStorage {
  async createUser(input: InsertUser): Promise<PublicUser> {
    const passwordHash = await bcrypt.hash(input.password, 10);
    const [row] = await db!.insert(users).values({
      email: input.email.toLowerCase().trim(),
      fullName: input.fullName,
      passwordHash,
      role: input.role ?? "student",
      age: input.age ?? null,
      city: input.city ?? null,
    }).returning();
    return toPublic(row);
  }

  async getUserById(id: number): Promise<PublicUser | undefined> {
    const [row] = await db!.select().from(users).where(eq(users.id, id));
    return row ? toPublic(row) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [row] = await db!.select().from(users).where(eq(users.email, email.toLowerCase().trim()));
    return row;
  }

  async verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  async listUsers(): Promise<PublicUser[]> {
    const rows = await db!.select().from(users).orderBy(desc(users.createdAt));
    return rows.map(toPublic);
  }

  async updateUserRole(id: number, role: string): Promise<PublicUser> {
    const [row] = await db!.update(users).set({ role }).where(eq(users.id, id)).returning();
    return toPublic(row);
  }

  async createOrder(input: InsertOrder, userId: number | null): Promise<OrderWithItems> {
    const total = input.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const [order] = await db!.insert(orders).values({
      userId: userId ?? null,
      customerName: input.customerName,
      email: input.email.toLowerCase().trim(),
      phone: input.phone ?? null,
      address: input.address,
      city: input.city,
      country: input.country,
      total,
    }).returning();

    const insertedItems = await db!.insert(orderItems).values(
      input.items.map(it => ({
        orderId: order.id,
        productSlug: it.productSlug,
        productName: it.productName,
        image: it.image ?? null,
        price: it.price,
        quantity: it.quantity,
        size: it.size ?? null,
        color: it.color ?? null,
      }))
    ).returning();

    return { ...order, items: insertedItems };
  }

  async getOrdersByUser(userId: number): Promise<OrderWithItems[]> {
    const rows = await db!.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
    const results: OrderWithItems[] = [];
    for (const order of rows) {
      const items = await db!.select().from(orderItems).where(eq(orderItems.orderId, order.id));
      results.push({ ...order, items });
    }
    return results;
  }

  async markLessonComplete(userId: number, courseSlug: string, lessonSlug: string): Promise<Progress> {
    const [row] = await db!.insert(academyProgress).values({
      userId, courseSlug, lessonSlug
    }).onConflictDoUpdate({
      target: [academyProgress.userId, academyProgress.courseSlug, academyProgress.lessonSlug],
      set: { completedAt: new Date() }
    }).returning();
    return row;
  }

  async getProgressByUser(userId: number): Promise<Progress[]> {
    return db!.select().from(academyProgress).where(eq(academyProgress.userId, userId));
  }

  async saveLeaderboard(input: InsertLeaderboard): Promise<LeaderboardEntry> {
    const [row] = await db!.insert(leaderboardEntries).values(input).returning();
    return row;
  }

  async getLeaderboardByGame(gameKey: string, limit = 10): Promise<LeaderboardEntry[]> {
    return db!.select().from(leaderboardEntries)
      .where(eq(leaderboardEntries.gameKey, gameKey))
      .orderBy(desc(leaderboardEntries.score))
      .limit(limit);
  }

  async clearLeaderboardByGame(gameKey: string): Promise<void> {
    await db!.delete(leaderboardEntries).where(eq(leaderboardEntries.gameKey, gameKey));
  }

  async createContact(input: InsertContact): Promise<ContactMessage> {
    const [row] = await db!.insert(contactMessages).values(input).returning();
    return row;
  }

  async getUserPreferences(userId: number): Promise<UserPreferences> {
    const [row] = await db!.select().from(userPreferences).where(eq(userPreferences.userId, userId));
    if (row) return row;
    const [newRow] = await db!.insert(userPreferences).values({ userId }).returning();
    return newRow;
  }

  async upsertUserPreferences(userId: number, patch: UserPreferencesInput): Promise<UserPreferences> {
    const values: any = { ...patch, updatedAt: new Date() };
    if (typeof patch.signLanguageMode === "boolean") {
      values.signLanguageMode = patch.signLanguageMode ? 1 : 0;
    }
    const [row] = await db!.insert(userPreferences).values({ userId, ...values })
      .onConflictDoUpdate({ target: userPreferences.userId, set: values })
      .returning();
    return row;
  }

  // Admin CRUD implementations
  async listNews(): Promise<NewsArticle[]> {
    return db!.select().from(news).orderBy(desc(news.createdAt));
  }
  async createNews(input: InsertNews): Promise<NewsArticle> {
    const [row] = await db!.insert(news).values(input).returning();
    return row;
  }
  async updateNews(id: number, patch: Partial<InsertNews>): Promise<NewsArticle> {
    const [row] = await db!.update(news).set(patch).where(eq(news.id, id)).returning();
    return row;
  }
  async deleteNews(id: number): Promise<void> {
    await db!.delete(news).where(eq(news.id, id));
  }

  async listProducts(): Promise<ProductEntry[]> {
    return db!.select().from(products).orderBy(desc(products.createdAt));
  }
  async createProduct(input: InsertProduct): Promise<ProductEntry> {
    const [row] = await db!.insert(products).values(input).returning();
    return row;
  }
  async updateProduct(id: number, patch: Partial<InsertProduct>): Promise<ProductEntry> {
    const [row] = await db!.update(products).set(patch).where(eq(products.id, id)).returning();
    return row;
  }
  async deleteProduct(id: number): Promise<void> {
    await db!.delete(products).where(eq(products.id, id));
  }

  async listCourses(): Promise<AcademyCourseEntry[]> {
    return db!.select().from(academyCourses).orderBy(desc(academyCourses.createdAt));
  }
  async createCourse(input: InsertAcademyCourse): Promise<AcademyCourseEntry> {
    const [row] = await db!.insert(academyCourses).values(input).returning();
    return row;
  }
  async updateCourse(id: number, patch: Partial<InsertAcademyCourse>): Promise<AcademyCourseEntry> {
    const [row] = await db!.update(academyCourses).set(patch).where(eq(academyCourses.id, id)).returning();
    return row;
  }
  async deleteCourse(id: number): Promise<void> {
    await db!.delete(academyCourses).where(eq(academyCourses.id, id));
  }

  async listYoutubeChannels(): Promise<YoutubeChannelEntry[]> {
    return db!.select().from(youtubeChannels).orderBy(desc(youtubeChannels.createdAt));
  }
  async createYoutubeChannel(input: InsertYoutubeChannel): Promise<YoutubeChannelEntry> {
    const [row] = await db!.insert(youtubeChannels).values(input).returning();
    return row;
  }
  async deleteYoutubeChannel(id: number): Promise<void> {
    const [channel] = await db!.select().from(youtubeChannels).where(eq(youtubeChannels.id, id));
    if (channel) {
      await db!.delete(youtubeVideos).where(eq(youtubeVideos.channelId, channel.channelId));
      await db!.delete(youtubeChannels).where(eq(youtubeChannels.id, id));
    }
  }
  async listYoutubeVideos(channelId?: string): Promise<YoutubeVideoEntry[]> {
    if (channelId) {
      return db!.select().from(youtubeVideos).where(eq(youtubeVideos.channelId, channelId)).orderBy(desc(youtubeVideos.publishedAt));
    }
    return db!.select().from(youtubeVideos).orderBy(desc(youtubeVideos.publishedAt));
  }
  async syncYoutubeVideos(channelId: string, videosData: InsertYoutubeVideo[]): Promise<void> {
    // Delete old videos for this channel and insert new ones (simple sync)
    await db!.delete(youtubeVideos).where(eq(youtubeVideos.channelId, channelId));
    if (videosData.length > 0) {
      await db!.insert(youtubeVideos).values(videosData);
    }
  }

  async createSupportRequest(input: InsertSupportRequest, userId: number | null): Promise<SupportRequest> {
    const [row] = await db!.insert(supportRequests).values({
      ...input,
      userId
    }).returning();
    return row;
  }
}

class MemStorage implements IStorage {
  private users = new Map<number, User>();
  private orders = new Map<number, Order>();
  private orderItems = new Map<number, OrderItem>();
  private progress = new Map<number, Progress>();
  private leaderboard = new Map<number, LeaderboardEntry>();
  private contacts = new Map<number, ContactMessage>();
  private preferences = new Map<number, UserPreferences>();
  
  // New maps for admin management
  private news = new Map<number, NewsArticle>();
  private products = new Map<number, ProductEntry>();
  private academyCourses = new Map<number, AcademyCourseEntry>();
  private ytChannels = new Map<number, YoutubeChannelEntry>();
  private ytVideos = new Map<number, YoutubeVideoEntry>();
  private supportReqs = new Map<number, SupportRequest>();

  private uid = 1;
  private oid = 1;
  private oiid = 1;
  private prid = 1;
  private lid = 1;
  private cid = 1;
  private nid = 1;
  private pid = 1;
  private acid = 1;
  private ycid = 1;
  private yvid = 1;
  private srid = 1;

  constructor() {
    this.seedYouTube();
  }

  private seedYouTube() {
    const channelId = "therapeutic-scouting-channel";
    this.createYoutubeChannel({
      channelId,
      title: "قناة الدمج والترويح العلاجي",
      thumbnail: "https://images.unsplash.com/photo-1573497620053-ea5310f94a17?auto=format&fit=crop&q=80&w=200",
      isActive: 1
    });

    const videos: InsertYoutubeVideo[] = [
      {
        videoId: "v1",
        channelId,
        title: "الدمج الشامل في المخيمات الكشفية: دليل القادة",
        description: "شرح مفصل لكيفية دمج ذوي الاحتياجات الخاصة في الأنشطة الكشفية.",
        thumbnail: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=400",
        publishedAt: new Date(),
        sortOrder: 1
      },
      {
        videoId: "v2",
        channelId,
        title: "مهارات التعامل مع الكشاف الكفيف",
        description: "تعلم أساسيات لغة برايل والتحرك الآمن للكشافين المكفوفين.",
        thumbnail: "https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&q=80&w=400",
        publishedAt: new Date(),
        sortOrder: 2
      },
      {
        videoId: "v3",
        channelId,
        title: "أنشطة حركية مكيفة لمستخدمي الكراسي المتحركة",
        description: "ألعاب كشفية تفاعلية مصممة لتعزيز القوة البدنية والروح المعنوية.",
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400",
        publishedAt: new Date(),
        sortOrder: 3
      },
      {
        videoId: "v4",
        channelId,
        title: "الترويح العلاجي عبر الطبيعة",
        description: "كيف نستخدم البيئة الكشفية كوسيلة للعلاج والتحسين النفسي.",
        thumbnail: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=400",
        publishedAt: new Date(),
        sortOrder: 4
      }
    ];

    videos.forEach(v => {
      const id = this.yvid++;
      this.ytVideos.set(id, { id, ...v } as YoutubeVideoEntry);
    });
  }

  async createUser(input: InsertUser): Promise<PublicUser> {
    const id = this.uid++;
    const passwordHash = await bcrypt.hash(input.password, 10);
    const user: User = { 
      id, ...input, passwordHash, 
      role: input.role ?? "student", 
      createdAt: new Date(), 
      age: input.age ?? null, 
      city: input.city ?? null,
      emailVerified: 0,
      email: input.email.toLowerCase().trim()
    };
    this.users.set(id, user);
    return toPublic(user);
  }

  async getUserById(id: number): Promise<PublicUser | undefined> {
    const u = this.users.get(id);
    return u ? toPublic(u) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email.toLowerCase().trim());
  }

  async verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  async listUsers(): Promise<PublicUser[]> {
    return Array.from(this.users.values()).map(toPublic).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateUserRole(id: number, role: string): Promise<PublicUser> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    const updated = { ...user, role };
    this.users.set(id, updated);
    return toPublic(updated);
  }

  async createOrder(input: InsertOrder, userId: number | null): Promise<OrderWithItems> {
    const id = this.oid++;
    const total = input.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const order: Order = {
      id, userId, total, status: "pending", createdAt: new Date(),
      customerName: input.customerName, email: input.email, phone: input.phone ?? null,
      address: input.address, city: input.city, country: input.country
    };
    this.orders.set(id, order);

    const items: OrderItem[] = [];
    for (const it of input.items) {
      const item: OrderItem = {
        id: this.oiid++, orderId: id, productSlug: it.productSlug, productName: it.productName,
        image: it.image ?? null, price: it.price, quantity: it.quantity, size: it.size ?? null, color: it.color ?? null
      };
      this.orderItems.set(item.id, item);
      items.push(item);
    }
    return { ...order, items };
  }

  async getOrdersByUser(userId: number): Promise<OrderWithItems[]> {
    const userOrders = Array.from(this.orders.values()).filter(o => o.userId === userId);
    return userOrders.map(o => ({
      ...o,
      items: Array.from(this.orderItems.values()).filter(oi => oi.orderId === o.id)
    }));
  }

  async markLessonComplete(userId: number, courseSlug: string, lessonSlug: string): Promise<Progress> {
    const key = Array.from(this.progress.values()).findIndex(p => p.userId === userId && p.courseSlug === courseSlug && p.lessonSlug === lessonSlug);
    if (key !== -1) return Array.from(this.progress.values())[key];
    const id = this.prid++;
    const row: Progress = { id, userId, courseSlug, lessonSlug, completedAt: new Date() };
    this.progress.set(id, row);
    return row;
  }

  async getProgressByUser(userId: number): Promise<Progress[]> {
    return Array.from(this.progress.values()).filter(p => p.userId === userId);
  }

  async saveLeaderboard(input: InsertLeaderboard): Promise<LeaderboardEntry> {
    const id = this.lid++;
    const entry: LeaderboardEntry = { id, ...input, createdAt: new Date() };
    this.leaderboard.set(id, entry);
    return entry;
  }

  async getLeaderboardByGame(gameKey: string, limit = 10): Promise<LeaderboardEntry[]> {
    return Array.from(this.leaderboard.values())
      .filter(e => e.gameKey === gameKey)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async clearLeaderboardByGame(gameKey: string): Promise<void> {
    Array.from(this.leaderboard.keys()).forEach(id => {
      if (this.leaderboard.get(id)?.gameKey === gameKey) this.leaderboard.delete(id);
    });
  }

  async createContact(input: InsertContact): Promise<ContactMessage> {
    const id = this.cid++;
    const msg: ContactMessage = { id, ...input, createdAt: new Date() };
    this.contacts.set(id, msg);
    return msg;
  }

  async getUserPreferences(userId: number): Promise<UserPreferences> {
    let prefs = this.preferences.get(userId);
    if (!prefs) {
      prefs = { userId, language: "ar", signLanguageMode: 0, theme: "light", updatedAt: new Date() };
      this.preferences.set(userId, prefs);
    }
    return prefs;
  }

  async upsertUserPreferences(userId: number, patch: UserPreferencesInput): Promise<UserPreferences> {
    const current = await this.getUserPreferences(userId);
    const next = { ...current, ...patch, updatedAt: new Date() };
    if (typeof patch.signLanguageMode === "boolean") {
      next.signLanguageMode = patch.signLanguageMode ? 1 : 0;
    }
    this.preferences.set(userId, next as UserPreferences);
    return next as UserPreferences;
  }

  // Admin CRUD implementations (MemStorage)
  async listNews(): Promise<NewsArticle[]> {
    return Array.from(this.news.values()).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  async createNews(input: InsertNews): Promise<NewsArticle> {
    const id = this.nid++;
    const article: NewsArticle = { 
      id, ...input, 
      views: 0, likes: 0, createdAt: new Date(),
      featured: input.featured ?? 0,
      breaking: input.breaking ?? 0
    };
    this.news.set(id, article);
    return article;
  }
  async updateNews(id: number, patch: Partial<InsertNews>): Promise<NewsArticle> {
    const current = this.news.get(id);
    if (!current) throw new Error("Article not found");
    const updated = { ...current, ...patch };
    this.news.set(id, updated);
    return updated;
  }
  async deleteNews(id: number): Promise<void> {
    this.news.delete(id);
  }

  async listProducts(): Promise<ProductEntry[]> {
    return Array.from(this.products.values()).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  async createProduct(input: InsertProduct): Promise<ProductEntry> {
    const id = this.pid++;
    const product: ProductEntry = { 
      id, ...input, createdAt: new Date(),
      currency: input.currency ?? "EGP",
      tag: input.tag ?? null,
      inStock: input.inStock ?? 1,
      rating: input.rating ?? "5",
      reviewCount: input.reviewCount ?? 0
    };
    this.products.set(id, product);
    return product;
  }
  async updateProduct(id: number, patch: Partial<InsertProduct>): Promise<ProductEntry> {
    const current = this.products.get(id);
    if (!current) throw new Error("Product not found");
    const updated = { ...current, ...patch };
    this.products.set(id, updated);
    return updated;
  }
  async deleteProduct(id: number): Promise<void> {
    this.products.delete(id);
  }

  async listCourses(): Promise<AcademyCourseEntry[]> {
    return Array.from(this.academyCourses.values()).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  async createCourse(input: InsertAcademyCourse): Promise<AcademyCourseEntry> {
    const id = this.acid++;
    const course: AcademyCourseEntry = { 
      id, ...input, enrolledCount: 0, createdAt: new Date(),
      price: input.price ?? 0,
      rating: input.rating ?? "5",
      requirements: input.requirements ?? []
    };
    this.academyCourses.set(id, course);
    return course;
  }
  async updateCourse(id: number, patch: Partial<InsertAcademyCourse>): Promise<AcademyCourseEntry> {
    const current = this.academyCourses.get(id);
    if (!current) throw new Error("Course not found");
    const updated = { ...current, ...patch };
    this.academyCourses.set(id, updated);
    return updated;
  }
  async deleteCourse(id: number): Promise<void> {
    this.academyCourses.delete(id);
  }

  async listYoutubeChannels(): Promise<YoutubeChannelEntry[]> {
    return Array.from(this.ytChannels.values()).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  async createYoutubeChannel(input: InsertYoutubeChannel): Promise<YoutubeChannelEntry> {
    const id = this.ycid++;
    const channel: YoutubeChannelEntry = { 
      id, ...input, createdAt: new Date(),
      thumbnail: input.thumbnail ?? null,
      isActive: input.isActive ?? 1
    };
    this.ytChannels.set(id, channel);
    return channel;
  }
  async deleteYoutubeChannel(id: number): Promise<void> {
    const channel = this.ytChannels.get(id);
    if (channel) {
      Array.from(this.ytVideos.keys()).forEach(vid => {
        if (this.ytVideos.get(vid)?.channelId === channel.channelId) this.ytVideos.delete(vid);
      });
      this.ytChannels.delete(id);
    }
  }
  async listYoutubeVideos(channelId?: string): Promise<YoutubeVideoEntry[]> {
    const all = Array.from(this.ytVideos.values());
    if (channelId) return all.filter(v => v.channelId === channelId).sort((a,b) => (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0));
    return all.sort((a,b) => (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0));
  }
  async syncYoutubeVideos(channelId: string, videosData: InsertYoutubeVideo[]): Promise<void> {
    Array.from(this.ytVideos.keys()).forEach(id => {
      if (this.ytVideos.get(id)?.channelId === channelId) this.ytVideos.delete(id);
    });
    videosData.forEach(v => {
      const id = this.yvid++;
      this.ytVideos.set(id, { id, ...v } as YoutubeVideoEntry);
    });
  }

  async createSupportRequest(input: InsertSupportRequest, userId: number | null): Promise<SupportRequest> {
    const id = this.srid++;
    const row: SupportRequest = {
      id, ...input, userId, status: "pending", createdAt: new Date()
    };
    this.supportReqs.set(id, row);
    return row;
  }
}

export const storage: IStorage = isDbConnected ? new DbStorage() : new MemStorage();
export { pool };
