import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default('writer'),
  status: text("status").notNull().default('active'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Categories table
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Tags table
export const tags = pgTable("tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTagSchema = createInsertSchema(tags).omit({
  id: true,
  createdAt: true,
});
export type InsertTag = z.infer<typeof insertTagSchema>;
export type Tag = typeof tags.$inferSelect;

// Articles table
export const articles = pgTable("articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  image: text("image").notNull(),
  images: text("images").array().default(sql`'{}'::text[]`), // Multiple images for slideshow
  category: text("category").notNull(),
  author: text("author").notNull(),
  tags: text("tags").array().default(sql`'{}'::text[]`), // Array of tags
  isBreaking: boolean("is_breaking").default(false),
  featured: boolean("featured").default(false),
  views: integer("views").default(0).notNull(),
  likes: integer("likes").default(0).notNull(),
  status: text("status").notNull().default('published'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;

// Comments table
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  articleId: varchar("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
  userName: text("user_name").notNull(),
  content: text("content").notNull(),
  status: text("status").notNull().default('pending'),
  likes: integer("likes").default(0).notNull(),
  dislikes: integer("dislikes").default(0).notNull(),
  shares: integer("shares").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

// Ads table
export const ads = pgTable("ads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  linkUrl: text("link_url").notNull(),
  location: text("location").notNull().default('sidebar'), // sidebar, header, footer
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAdSchema = createInsertSchema(ads).omit({
  id: true,
  createdAt: true,
});
export type InsertAd = z.infer<typeof insertAdSchema>;
export type Ad = typeof ads.$inferSelect;

// Session table (managed by connect-pg-simple, but defined here to prevent Drizzle from deleting it)
export const session = pgTable("session", {
  sid: varchar("sid").primaryKey().notNull(),
  sess: text("sess").notNull(), // json is stored as text/json
  expire: timestamp("expire", { precision: 6 }).notNull(),
});

// Daily Stats table
export const dailyStats = pgTable("daily_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull().unique(), // Format: YYYY-MM-DD
  visitors: integer("visitors").default(0).notNull(),
  pageViews: integer("page_views").default(0).notNull(),
});

export const insertDailyStatsSchema = createInsertSchema(dailyStats).omit({
  id: true,
});
export type InsertDailyStats = z.infer<typeof insertDailyStatsSchema>;
export type DailyStats = typeof dailyStats.$inferSelect;

// Short Links table
export const shortLinks = pgTable("short_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 8 }).notNull().unique(), // Short code like "p2GI1Hl"
  articleId: varchar("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
  clicks: integer("clicks").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertShortLinkSchema = createInsertSchema(shortLinks).omit({
  id: true,
  createdAt: true,
});
export type InsertShortLink = z.infer<typeof insertShortLinkSchema>;
export type ShortLink = typeof shortLinks.$inferSelect;

// Newsletter Subscribers table
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name"),
  status: text("status").notNull().default('active'), // active, unsubscribed
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
  unsubscribedAt: timestamp("unsubscribed_at"),
});

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).omit({
  id: true,
  subscribedAt: true,
});
export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;

// Newsletter Templates table
export const newsletterTemplates = pgTable("newsletter_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // daily_digest, weekly_roundup, breaking_news, custom
  subjectTemplate: text("subject_template").notNull(),
  headerColor: text("header_color").default('#1e293b'),
  accentColor: text("accent_color").default('#ef4444'),
  layout: text("layout").notNull(), // compact, featured, grid
  includeImages: boolean("include_images").default(true),
  customIntro: text("custom_intro"),
  customFooter: text("custom_footer"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type NewsletterTemplate = typeof newsletterTemplates.$inferSelect;

// Newsletter Schedules table
export const newsletterSchedules = pgTable("newsletter_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  frequency: text("frequency").notNull(), // daily, weekly, monthly
  sendTime: text("send_time").notNull(), // HH:MM format
  dayOfWeek: integer("day_of_week"), // 0-6 for weekly
  dayOfMonth: integer("day_of_month"), // 1-31 for monthly
  templateId: varchar("template_id").references(() => newsletterTemplates.id),
  articleCount: integer("article_count").default(5),
  segment: text("segment"), // JSON array of category preferences
  lastSentAt: timestamp("last_sent_at"),
  nextSendAt: timestamp("next_send_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type NewsletterSchedule = typeof newsletterSchedules.$inferSelect;

// Newsletter Sends table (tracking)
export const newsletterSends = pgTable("newsletter_sends", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").references(() => newsletterTemplates.id),
  scheduleId: varchar("schedule_id").references(() => newsletterSchedules.id),
  subject: text("subject").notNull(),
  articleIds: text("article_ids").notNull(), // JSON array
  recipientCount: integer("recipient_count").notNull(),
  successCount: integer("success_count").default(0),
  failedCount: integer("failed_count").default(0),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  sentBy: varchar("sent_by"),
});

export type NewsletterSend = typeof newsletterSends.$inferSelect;

// Newsletter Events table (opens, clicks, etc.)
export const newsletterEvents = pgTable("newsletter_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sendId: varchar("send_id").notNull().references(() => newsletterSends.id, { onDelete: "cascade" }),
  subscriberEmail: text("subscriber_email").notNull(),
  eventType: text("event_type").notNull(), // sent, delivered, opened, clicked, bounced, unsubscribed
  articleId: varchar("article_id"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type NewsletterEvent = typeof newsletterEvents.$inferSelect;

// Newsletter Archives table
export const newsletterArchives = pgTable("newsletter_archives", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sendId: varchar("send_id").notNull().unique().references(() => newsletterSends.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  htmlContent: text("html_content").notNull(),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  views: integer("views").default(0),
});

export type NewsletterArchive = typeof newsletterArchives.$inferSelect;

// Drip Campaign tables
export const newsletterDripCampaigns = pgTable("newsletter_drip_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  triggerEvent: text("trigger_event").notNull(), // subscribe, first_article_view, custom
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type NewsletterDripCampaign = typeof newsletterDripCampaigns.$inferSelect;

export const newsletterDripEmails = pgTable("newsletter_drip_emails", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull().references(() => newsletterDripCampaigns.id, { onDelete: "cascade" }),
  sequenceNumber: integer("sequence_number").notNull(),
  subject: text("subject").notNull(),
  htmlContent: text("html_content").notNull(),
  delayDays: integer("delay_days").notNull(),
  delayHours: integer("delay_hours").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type NewsletterDripEmail = typeof newsletterDripEmails.$inferSelect;

export const newsletterDripTracking = pgTable("newsletter_drip_tracking", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull().references(() => newsletterDripCampaigns.id, { onDelete: "cascade" }),
  subscriberEmail: text("subscriber_email").notNull(),
  emailId: varchar("email_id").notNull().references(() => newsletterDripEmails.id, { onDelete: "cascade" }),
  status: text("status").notNull(), // scheduled, sent, failed
  scheduledFor: timestamp("scheduled_for").notNull(),
  sentAt: timestamp("sent_at"),
});

export type NewsletterDripTracking = typeof newsletterDripTracking.$inferSelect;

// Push Notifications Subscriptions table
export const pushSubscriptions = pgTable("push_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  userId: varchar("user_id"), // Optional - if logged in user subscribes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPushSubscriptionSchema = createInsertSchema(pushSubscriptions).omit({
  id: true,
  createdAt: true,
});
export type InsertPushSubscription = z.infer<typeof insertPushSubscriptionSchema>;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
