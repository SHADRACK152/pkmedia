import { db } from "./db.js";
import { users, articles, categories, comments, ads, dailyStats, shortLinks } from "../shared/schema.js";
import type { User, InsertUser, Article, InsertArticle, Category, InsertCategory, Comment, InsertComment, Ad, InsertAd, DailyStats, ShortLink, InsertShortLink } from "../shared/schema.js";
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
  getArticleById(id: string): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: string, article: Partial<InsertArticle>): Promise<Article | undefined>;
  deleteArticle(id: string): Promise<boolean>;
  incrementArticleViews(id: string): Promise<void>;
  incrementArticleLikes(id: string): Promise<void>;
  
  // Category operations
  getAllCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  deleteCategory(id: string): Promise<boolean>;
  
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

  async updateArticle(id: string, updateData: Partial<InsertArticle>): Promise<Article | undefined> {
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

  // Comment operations
  async getCommentsByArticle(articleId: string): Promise<Comment[]> {
    return await db.select().from(comments).where(eq(comments.articleId, articleId)).orderBy(desc(comments.createdAt));
  }

  async getAllComments(): Promise<Comment[]> {
    return await db.select().from(comments).orderBy(desc(comments.createdAt));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(insertComment).returning();
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
    // Generate a random 7-character code (like trib.al)
    const code = this.generateShortCode();
    
    const [shortLink] = await db.insert(shortLinks)
      .values({ code, articleId, clicks: 0 })
      .returning();
    
    return shortLink;
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

  private generateShortCode(): string {
    // Generate a random 7-character code using alphanumeric characters
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 7; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}

export const storage = new Storage();
