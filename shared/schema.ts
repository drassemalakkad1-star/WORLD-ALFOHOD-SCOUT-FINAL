import { pgTable, serial, text, varchar, integer, timestamp, jsonb, uniqueIndex, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("student"),
  age: integer("age"),
  city: varchar("city", { length: 120 }),
  emailVerified: integer("email_verified").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire", { precision: 6 }).notNull(),
}, (table) => ({
  expireIdx: index("IDX_session_expire").on(table.expire),
}));

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  address: text("address").notNull(),
  city: varchar("city", { length: 120 }).notNull(),
  country: varchar("country", { length: 120 }).notNull(),
  total: integer("total").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productSlug: varchar("product_slug", { length: 200 }).notNull(),
  productName: varchar("product_name", { length: 255 }).notNull(),
  image: text("image"),
  price: integer("price").notNull(),
  quantity: integer("quantity").notNull().default(1),
  size: varchar("size", { length: 50 }),
  color: varchar("color", { length: 50 }),
});

export const academyProgress = pgTable("academy_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  courseSlug: varchar("course_slug", { length: 200 }).notNull(),
  lessonSlug: varchar("lesson_slug", { length: 200 }).notNull(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
}, (table) => ({
  uniq: uniqueIndex("academy_progress_user_lesson_uniq").on(table.userId, table.courseSlug, table.lessonSlug),
}));

export const leaderboardEntries = pgTable("leaderboard_entries", {
  id: serial("id").primaryKey(),
  gameKey: varchar("game_key", { length: 50 }).notNull(),
  playerName: varchar("player_name", { length: 80 }).notNull(),
  score: integer("score").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  gameIdx: index("leaderboard_game_idx").on(table.gameKey, table.score),
}));

export const userPreferences = pgTable("user_preferences", {
  userId: integer("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  language: varchar("language", { length: 10 }).notNull().default("ar"),
  signLanguageMode: integer("sign_language_mode").notNull().default(0),
  theme: varchar("theme", { length: 16 }).notNull().default("light"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  image: text("image").notNull(),
  authorName: varchar("author_name", { length: 255 }).notNull(),
  authorRole: varchar("author_role", { length: 100 }).notNull(),
  authorAvatarColor: varchar("author_avatar_color", { length: 20 }).notNull(),
  featured: integer("featured").notNull().default(0),
  breaking: integer("breaking").notNull().default(0),
  views: integer("views").notNull().default(0),
  likes: integer("likes").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const supportRequests = pgTable("support_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(), // 'request' or 'donation'
  category: varchar("category", { length: 100 }).notNull(),
  item: varchar("item", { length: 255 }).notNull(),
  message: text("message"),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // stored as cents or whole units depending on frontend use
  currency: varchar("currency", { length: 10 }).notNull().default("USD"),
  category: varchar("category", { length: 100 }).notNull(),
  image: text("image").notNull(),
  tag: varchar("tag", { length: 50 }),
  inStock: integer("in_stock").notNull().default(1),
  rating: text("rating").default("5.0"),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const academyCourses = pgTable("academy_courses", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: varchar("subtitle", { length: 255 }).notNull(),
  description: text("description").notNull(),
  longDescription: text("long_description").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  level: varchar("level", { length: 50 }).notNull(),
  duration: varchar("duration", { length: 50 }).notNull(),
  price: integer("price").notNull().default(0),
  isFree: integer("is_free").notNull().default(1),
  certificate: integer("certificate").notNull().default(1),
  coverColor: varchar("cover_color", { length: 20 }).notNull(),
  instructorName: varchar("instructor_name", { length: 255 }).notNull(),
  instructorTitle: varchar("instructor_title", { length: 255 }).notNull(),
  instructorBio: text("instructor_bio").notNull(),
  instructorAvatarColor: varchar("instructor_avatar_color", { length: 20 }).notNull(),
  lessonsCount: integer("lessons_count").notNull().default(0),
  enrolledCount: integer("enrolled_count").notNull().default(0),
  rating: text("rating").default("5.0"),
  isFeatured: integer("is_featured").notNull().default(0),
  isNew: integer("is_new").notNull().default(1),
  lessons: jsonb("lessons").notNull().default([]), // Array of lesson objects
  skills: jsonb("skills").notNull().default([]), // Array of strings
  requirements: jsonb("requirements").notNull().default([]), // Array of strings
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  emailVerified: true,
  passwordHash: true,
}).extend({
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type PublicUser = Omit<User, "passwordHash">;

export const loginSchema = z.object({
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const insertOrderSchema = z.object({
  customerName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  items: z.array(z.object({
    productSlug: z.string(),
    productName: z.string(),
    image: z.string().nullable().optional(),
    price: z.number().int().nonnegative(),
    quantity: z.number().int().positive(),
    size: z.string().optional().nullable(),
    color: z.string().optional().nullable(),
  })).min(1),
});
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type OrderWithItems = Order & { items: OrderItem[] };

export const insertProgressSchema = createInsertSchema(academyProgress).omit({
  id: true,
  completedAt: true,
  userId: true,
});
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type Progress = typeof academyProgress.$inferSelect;

export const insertLeaderboardSchema = createInsertSchema(leaderboardEntries).omit({
  id: true,
  createdAt: true,
}).extend({
  playerName: z.string().min(1).max(80),
  score: z.number().int(),
});
export type InsertLeaderboard = z.infer<typeof insertLeaderboardSchema>;
export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;

export const userPreferencesSchema = z.object({
  language: z.enum([
    "ar","en","fr","es","de","zh","ru","pt","it","tr",
    "ja","ko","hi","id","ms","nl","fa","he","ur","sw",
  ]).optional(),
  signLanguageMode: z.union([z.literal(0), z.literal(1), z.boolean()]).optional(),
  theme: z.enum(["light", "dark"]).optional(),
});
export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;

export const insertContactSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(2),
  message: z.string().min(5),
});
export type InsertContact = z.infer<typeof insertContactSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

export const youtubeChannels = pgTable("youtube_channels", {
  id: serial("id").primaryKey(),
  channelId: varchar("channel_id", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  thumbnail: text("thumbnail"),
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const youtubeVideos = pgTable("youtube_videos", {
  id: serial("id").primaryKey(),
  channelId: varchar("channel_id", { length: 255 }).notNull(),
  videoId: varchar("video_id", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  thumbnail: text("thumbnail").notNull(),
  publishedAt: timestamp("published_at"),
  sortOrder: integer("sort_order").default(0),
});

export const hallOfFameNominees = pgTable("hall_of_fame_nominees", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }), // nominator
  nomineeName: varchar("nominee_name", { length: 255 }).notNull(),
  relationship: varchar("relationship", { length: 100 }).notNull(), // 'mother' or 'father'
  description: text("description").notNull(),
  image: text("image"),
  votes: integer("votes").notNull().default(0),
  views: integer("views").notNull().default(0),
  status: varchar("status", { length: 50 }).notNull().default("active"), // 'active', 'won', 'archived'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const hallOfFameVotes = pgTable("hall_of_fame_votes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  nomineeId: integer("nominee_id").notNull().references(() => hallOfFameNominees.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  uniq: uniqueIndex("hof_vote_user_nominee_uniq").on(table.userId, table.nomineeId),
}));

export const hallOfFameWinners = pgTable("hall_of_fame_winners", {
  id: serial("id").primaryKey(),
  nomineeId: integer("nominee_id").notNull().references(() => hallOfFameNominees.id, { onDelete: "cascade" }),
  rank: integer("rank").notNull(), // 1, 2, 3, 4 for pyramid
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  prizeTitle: varchar("prize_title", { length: 255 }),
  familyPhoto: text("family_photo"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});


// New schemas for admin management
export const insertNewsSchema = createInsertSchema(news).omit({ id: true, createdAt: true, views: true, likes: true });
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type NewsArticle = typeof news.$inferSelect;

export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type ProductEntry = typeof products.$inferSelect;

export const insertAcademyCourseSchema = createInsertSchema(academyCourses).omit({ id: true, createdAt: true, enrolledCount: true });
export type InsertAcademyCourse = z.infer<typeof insertAcademyCourseSchema>;
export type AcademyCourseEntry = typeof academyCourses.$inferSelect;

export const insertYoutubeChannelSchema = createInsertSchema(youtubeChannels).omit({ id: true, createdAt: true });
export type InsertYoutubeChannel = z.infer<typeof insertYoutubeChannelSchema>;
export type YoutubeChannelEntry = typeof youtubeChannels.$inferSelect;

export const insertYoutubeVideoSchema = createInsertSchema(youtubeVideos).omit({ id: true });
export type InsertYoutubeVideo = z.infer<typeof insertYoutubeVideoSchema>;
export type YoutubeVideoEntry = typeof youtubeVideos.$inferSelect;

export const insertSupportRequestSchema = createInsertSchema(supportRequests).omit({
  id: true,
  createdAt: true,
  status: true,
  userId: true,
}).extend({
  email: z.string().email("بريد إلكتروني غير صالح"),
  phone: z.string().min(8, "رقم الهاتف يجب أن يكون 8 أرقام على الأقل"),
});
export type InsertSupportRequest = z.infer<typeof insertSupportRequestSchema>;
export type SupportRequest = typeof supportRequests.$inferSelect;

export const insertNomineeSchema = createInsertSchema(hallOfFameNominees).omit({
  id: true,
  createdAt: true,
  votes: true,
  views: true,
  status: true,
  userId: true,
});
export type InsertNominee = z.infer<typeof insertNomineeSchema>;
export type Nominee = typeof hallOfFameNominees.$inferSelect;

export const insertWinnerSchema = createInsertSchema(hallOfFameWinners).omit({
  id: true,
  createdAt: true,
});
export type InsertWinner = z.infer<typeof insertWinnerSchema>;
export type Winner = typeof hallOfFameWinners.$inferSelect;
