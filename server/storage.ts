import { db } from "./db.js";
import { users, articles, categories, tags, comments, ads, dailyStats, shortLinks, newsletterSubscribers, pushSubscriptions, shortNews } from "../shared/schema.js";
import type { User, InsertUser, Article, InsertArticle, Category, InsertCategory, Tag, InsertTag, Comment, InsertComment, Ad, InsertAd, DailyStats, ShortLink, InsertShortLink, NewsletterSubscriber, InsertNewsletterSubscriber, PushSubscription, InsertPushSubscription, ShortNews, InsertShortNews } from "../shared/schema.js";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByRole(role: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Article operations
  getAllArticles(): Promise<Article[]>;
  getAllArticlesAdmin(): Promise<Article[]>;
  getArticleById(id: string): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: string, article: Partial<Article>): Promise<Article | undefined>;
  deleteArticle(id: string): Promise<boolean>;
  incrementArticleViews(id: string): Promise<void>;
  incrementArticleLikes(id: string): Promise<void>;
  getScheduledArticles(): Promise<Article[]>;
  publishScheduledArticle(id: string): Promise<void>;
  
  // Category operations
  getAllCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  deleteCategory(id: string): Promise<boolean>;
  
  // Tag operations
  getAllTags(): Promise<Tag[]>;
  createTag(tag: InsertTag): Promise<Tag>;
  deleteTag(id: string): Promise<boolean>;
  
  // Comment operations
  getCommentsByArticle(articleId: string): Promise<Comment[]>;
  getAllComments(): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateCommentStatus(id: string, status: string): Promise<Comment | undefined>;
  deleteComment(id: string): Promise<boolean>;
  incrementCommentLikes(id: string): Promise<void>;
  decrementCommentLikes(id: string): Promise<void>;
  incrementCommentDislikes(id: string): Promise<void>;
  decrementCommentDislikes(id: string): Promise<void>;
  incrementCommentShares(id: string): Promise<void>;

  // Ad operations
  getAllAds(): Promise<Ad[]>;
  getActiveAds(): Promise<Ad[]>;
  createAd(ad: InsertAd): Promise<Ad>;
  updateAd(id: string, ad: Partial<InsertAd>): Promise<Ad | undefined>;
  deleteAd(id: string): Promise<boolean>;

  // Analytics operations
  recordVisit(date: string, isNewVisitor: boolean): Promise<void>;
  getDailyStats(limit?: number): Promise<DailyStats[]>;

  // Short link operations
  createShortLink(articleId: string): Promise<ShortLink>;
  getShortLink(code: string): Promise<ShortLink | undefined>;
  getShortLinkByArticleId(articleId: string): Promise<ShortLink | undefined>;
  incrementShortLinkClicks(code: string): Promise<void>;
  
  // Newsletter operations
  subscribeNewsletter(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber>;
  getAllSubscribers(): Promise<NewsletterSubscriber[]>;
  getActiveSubscribers(): Promise<NewsletterSubscriber[]>;
  unsubscribeNewsletter(email: string): Promise<boolean>;
  deleteSubscriber(id: string): Promise<boolean>;
  
  // Push Notification operations
  savePushSubscription(subscription: any): Promise<PushSubscription>;
  getAllPushSubscriptions(): Promise<PushSubscription[]>;
  removePushSubscription(endpoint: string): Promise<boolean>;
  
  // Short News operations
  getAllShortNews(): Promise<ShortNews[]>;
  getShortNewsById(id: string): Promise<ShortNews | undefined>;
  createShortNews(news: InsertShortNews): Promise<ShortNews>;
  updateShortNews(id: string, news: Partial<InsertShortNews>): Promise<ShortNews | undefined>;
  deleteShortNews(id: string): Promise<boolean>;
  incrementShortNewsViews(id: string): Promise<void>;
  incrementShortNewsLikes(id: string): Promise<void>;
}

export class Storage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user;
  }

  async getUserByRole(role: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.role, role)).limit(1);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role)).orderBy(users.createdAt);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updateData })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Article operations
  async getAllArticles(): Promise<Article[]> {
    return await db
      .select()
      .from(articles)
      .where(sql`${articles.status} = 'published' AND (${articles.publishedAt} IS NULL OR ${articles.publishedAt} <= NOW()) AND ${articles.createdAt} <= NOW()`)
      .orderBy(desc(sql`coalesce(${articles.publishedAt}, ${articles.createdAt})`));
  }

  async getAllArticlesAdmin(): Promise<Article[]> {
    return await db.select().from(articles).orderBy(desc(articles.createdAt));
  }

  async getArticleById(id: string): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
    return article;
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const [article] = await db.insert(articles).values(insertArticle).returning();
    return article;
  }

  async updateArticle(id: string, updateData: Partial<Article>): Promise<Article | undefined> {
    const [article] = await db
      .update(articles)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(articles.id, id))
      .returning();
    return article;
  }

  async deleteArticle(id: string): Promise<boolean> {
    const result = await db.delete(articles).where(eq(articles.id, id));
    return result.count > 0;
  }

  async incrementArticleViews(id: string): Promise<void> {
    await db
      .update(articles)
      .set({ 
        views: sql`${articles.views} + 1` 
      })
      .where(eq(articles.id, id));
  }

  async incrementArticleLikes(id: string): Promise<void> {
    await db
      .update(articles)
      .set({ 
        likes: sql`${articles.likes} + 1` 
      })
      .where(eq(articles.id, id));
  }

  async getScheduledArticles(): Promise<Article[]> {
    return await db
      .select()
      .from(articles)
      .where(eq(articles.status, 'scheduled'))
      .orderBy(articles.scheduledFor);
  }

  async publishScheduledArticle(id: string): Promise<void> {
    await db
      .update(articles)
      .set({
        status: 'published',
        publishedAt: new Date(),
        scheduledFor: null
      })
      .where(eq(articles.id, id));
  }

  // Category operations
  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return result.count > 0;
  }

  // Tag operations
  async getAllTags(): Promise<Tag[]> {
    return await db.select().from(tags).orderBy(tags.name);
  }

  async createTag(insertTag: InsertTag): Promise<Tag> {
    const [tag] = await db.insert(tags).values(insertTag).returning();
    return tag;
  }

  async deleteTag(id: string): Promise<boolean> {
    const result = await db.delete(tags).where(eq(tags.id, id));
    return result.count > 0;
  }

  // Comment operations
  async getCommentsByArticle(articleId: string): Promise<Comment[]> {
    return await db.select().from(comments).where(eq(comments.articleId, articleId)).orderBy(desc(comments.createdAt)) as Comment[];
  }

  async getAllComments(): Promise<Comment[]> {
    return await db.select().from(comments).orderBy(desc(comments.createdAt)) as Comment[];
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(insertComment).returning() as Comment[];
    return comment;
  }

  async updateCommentStatus(id: string, status: string): Promise<Comment | undefined> {
    const [comment] = await db
      .update(comments)
      .set({ status })
      .where(eq(comments.id, id))
      .returning();
    return comment;
  }

  async deleteComment(id: string): Promise<boolean> {
    const result = await db.delete(comments).where(eq(comments.id, id));
    return result.count > 0;
  }

  async incrementCommentLikes(id: string): Promise<void> {
    await db
      .update(comments)
      .set({ 
        likes: sql`${comments.likes} + 1` 
      })
      .where(eq(comments.id, id));
  }

  async decrementCommentLikes(id: string): Promise<void> {
    await db
      .update(comments)
      .set({ 
        likes: sql`GREATEST(${comments.likes} - 1, 0)` 
      })
      .where(eq(comments.id, id));
  }

  async incrementCommentDislikes(id: string): Promise<void> {
    await db
      .update(comments)
      .set({ 
        dislikes: sql`${comments.dislikes} + 1` 
      })
      .where(eq(comments.id, id));
  }

  async decrementCommentDislikes(id: string): Promise<void> {
    await db
      .update(comments)
      .set({ 
        dislikes: sql`GREATEST(${comments.dislikes} - 1, 0)` 
      })
      .where(eq(comments.id, id));
  }

  async incrementCommentShares(id: string): Promise<void> {
    await db
      .update(comments)
      .set({ 
        shares: sql`${comments.shares} + 1` 
      })
      .where(eq(comments.id, id));
  }

  // Ad operations
  async getAllAds(): Promise<Ad[]> {
    return await db.select().from(ads).orderBy(desc(ads.createdAt));
  }

  async getActiveAds(): Promise<Ad[]> {
    return await db.select().from(ads).where(eq(ads.active, true)).orderBy(desc(ads.createdAt));
  }

  async createAd(insertAd: InsertAd): Promise<Ad> {
    const [ad] = await db.insert(ads).values(insertAd).returning();
    return ad;
  }

  async updateAd(id: string, updateData: Partial<InsertAd>): Promise<Ad | undefined> {
    const [ad] = await db
      .update(ads)
      .set({ ...updateData })
      .where(eq(ads.id, id))
      .returning();
    return ad;
  }

  async deleteAd(id: string): Promise<boolean> {
    const result = await db.delete(ads).where(eq(ads.id, id));
    return result.count > 0;
  }

  // Analytics operations
  async recordVisit(date: string, isNewVisitor: boolean): Promise<void> {
    await db.insert(dailyStats)
      .values({ date, visitors: isNewVisitor ? 1 : 0, pageViews: 1 })
      .onConflictDoUpdate({
        target: dailyStats.date,
        set: {
          visitors: sql`${dailyStats.visitors} + ${isNewVisitor ? 1 : 0}`,
          pageViews: sql`${dailyStats.pageViews} + 1`
        }
      });
  }

  async getDailyStats(limit: number = 30): Promise<DailyStats[]> {
    return await db.select()
      .from(dailyStats)
      .orderBy(desc(dailyStats.date))
      .limit(limit);
  }

  // Short link operations
  async createShortLink(articleId: string): Promise<ShortLink> {
    // Try up to 5 times to generate a unique code
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const code = this.generateShortCode();
        
        const [shortLink] = await db.insert(shortLinks)
          .values({ code, articleId, clicks: 0 })
          .returning();
        
        return shortLink;
      } catch (error: any) {
        // If unique constraint violation, try again with a new code
        if (attempt === 4 || !error.message?.includes('unique')) {
          throw error;
        }
      }
    }
    
    throw new Error('Failed to generate unique short code');
  }

  async getShortLink(code: string): Promise<ShortLink | undefined> {
    const [shortLink] = await db.select().from(shortLinks).where(eq(shortLinks.code, code)).limit(1);
    return shortLink;
  }

  async getShortLinkByArticleId(articleId: string): Promise<ShortLink | undefined> {
    const [shortLink] = await db.select().from(shortLinks).where(eq(shortLinks.articleId, articleId)).limit(1);
    return shortLink;
  }

  async incrementShortLinkClicks(code: string): Promise<void> {
    await db.update(shortLinks)
      .set({ clicks: sql`${shortLinks.clicks} + 1` })
      .where(eq(shortLinks.code, code));
  }

  // Newsletter operations
  async subscribeNewsletter(insertSubscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const [subscriber] = await db.insert(newsletterSubscribers)
      .values(insertSubscriber)
      .onConflictDoUpdate({
        target: newsletterSubscribers.email,
        set: { 
          status: 'active',
          unsubscribedAt: null
        }
      })
      .returning();
    return subscriber;
  }

  async getAllSubscribers(): Promise<NewsletterSubscriber[]> {
    return await db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.subscribedAt));
  }

  async getActiveSubscribers(): Promise<NewsletterSubscriber[]> {
    return await db.select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.status, 'active'))
      .orderBy(desc(newsletterSubscribers.subscribedAt));
  }

  async unsubscribeNewsletter(email: string): Promise<boolean> {
    const result = await db.update(newsletterSubscribers)
      .set({ 
        status: 'unsubscribed',
        unsubscribedAt: new Date()
      })
      .where(eq(newsletterSubscribers.email, email));
    return result.count > 0;
  }

  async deleteSubscriber(id: string): Promise<boolean> {
    const result = await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.id, id));
    return result.count > 0;
  }

  // Push Notification operations
  async savePushSubscription(subscription: any): Promise<PushSubscription> {
    const { endpoint, keys } = subscription;
    
    // Check if subscription already exists
    const existing = await db.select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint))
      .limit(1);
    
    if (existing.length > 0) {
      return existing[0];
    }

    const [sub] = await db.insert(pushSubscriptions).values({
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    }).returning();
    
    return sub;
  }

  async getAllPushSubscriptions(): Promise<PushSubscription[]> {
    return await db.select().from(pushSubscriptions);
  }

  async removePushSubscription(endpoint: string): Promise<boolean> {
    const result = await db.delete(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint));
    return result.count > 0;
  }

  private generateShortCode(): string {
    // Generate a random 7-character code using alphanumeric characters
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 7; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Short News operations
  async getAllShortNews(): Promise<ShortNews[]> {
    return await db.select().from(shortNews)
      .orderBy(desc(shortNews.isPinned), desc(shortNews.createdAt));
  }

  async getShortNewsById(id: string): Promise<ShortNews | undefined> {
    const [news] = await db.select().from(shortNews).where(eq(shortNews.id, id)).limit(1);
    return news;
  }

  async createShortNews(news: InsertShortNews): Promise<ShortNews> {
    const [created] = await db.insert(shortNews).values(news).returning();
    return created;
  }

  async updateShortNews(id: string, news: Partial<InsertShortNews>): Promise<ShortNews | undefined> {
    const [updated] = await db.update(shortNews)
      .set(news)
      .where(eq(shortNews.id, id))
      .returning();
    return updated;
  }

  async deleteShortNews(id: string): Promise<boolean> {
    const result = await db.delete(shortNews).where(eq(shortNews.id, id));
    return result.count > 0;
  }

  async incrementShortNewsViews(id: string): Promise<void> {
    await db.update(shortNews)
      .set({ views: sql`${shortNews.views} + 1` })
      .where(eq(shortNews.id, id));
  }

  async incrementShortNewsLikes(id: string): Promise<void> {
    await db.update(shortNews)
      .set({ likes: sql`${shortNews.likes} + 1` })
      .where(eq(shortNews.id, id));
  }
}

export const storage = new Storage();
