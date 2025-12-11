import { db } from "./db.js";
import { users, articles, categories, tags, comments, ads, dailyStats, shortLinks, newsletterSubscribers, pushSubscriptions, shortNews, leagues, teams, standings, matches } from "../shared/schema.js";
import type { User, InsertUser, Article, InsertArticle, Category, InsertCategory, Tag, InsertTag, Comment, InsertComment, Ad, InsertAd, DailyStats, ShortLink, InsertShortLink, NewsletterSubscriber, InsertNewsletterSubscriber, PushSubscription, InsertPushSubscription, ShortNews, InsertShortNews, League, InsertLeague, Team, InsertTeam, Standing, InsertStanding, Match, InsertMatch } from "../shared/schema.js";
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
  searchArticles(query: string, filters?: { category?: string; author?: string; tags?: string[]; dateFrom?: Date; dateTo?: Date }): Promise<Article[]>;
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

  // Sports operations
  // Leagues
  getAllLeagues(): Promise<League[]>;
  getLeagueById(id: string): Promise<League | undefined>;
  getLeagueByCode(code: string): Promise<League | undefined>;
  createLeague(league: InsertLeague): Promise<League>;
  updateLeague(id: string, league: Partial<InsertLeague>): Promise<League | undefined>;

  // Teams
  getTeamsByLeague(leagueId: string): Promise<Team[]>;
  getAllTeams(): Promise<Team[]>;
  getTeamById(id: string): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: string, team: Partial<InsertTeam>): Promise<Team | undefined>;

  // Standings
  getStandingsByLeague(leagueId: string): Promise<Standing[]>;
  getAllStandings(): Promise<Standing[]>;
  updateStandings(leagueId: string, standings: InsertStanding[]): Promise<void>;
  getTeamStanding(leagueId: string, teamId: string): Promise<Standing | undefined>;

  // Matches
  getMatchesByLeague(leagueId: string, limit?: number): Promise<Match[]>;
  getAllMatches(limit?: number): Promise<Match[]>;
  getUpcomingMatches(leagueId: string, limit?: number): Promise<Match[]>;
  getRecentMatches(leagueId: string, limit?: number): Promise<Match[]>;
  getMatchById(id: string): Promise<Match | undefined>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: string, match: Partial<InsertMatch>): Promise<Match | undefined>;
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

  async searchArticles(query: string, filters?: { category?: string; author?: string; tags?: string[]; dateFrom?: Date; dateTo?: Date }): Promise<Article[]> {
    let whereConditions = [sql`${articles.status} = 'published'`];

    // Add text search if query provided
    if (query && query.trim()) {
      const searchTerm = query.trim();
      whereConditions.push(sql`to_tsvector('english', ${articles.title} || ' ' || ${articles.content}) @@ plainto_tsquery('english', ${searchTerm})`);
    }

    // Add filters
    if (filters?.category) {
      whereConditions.push(eq(articles.category, filters.category));
    }
    if (filters?.author) {
      whereConditions.push(sql`${articles.author} ILIKE ${'%' + filters.author + '%'}`);
    }
    if (filters?.tags && filters.tags.length > 0) {
      // Check if any of the article's tags match the filter tags
      const tagConditions = filters.tags.map(tag => sql`${articles.tags}::text[] @> ARRAY[${tag}]::text[]`);
      whereConditions.push(sql`(${sql.join(tagConditions, sql` OR `)})`);
    }
    if (filters?.dateFrom) {
      whereConditions.push(sql`coalesce(${articles.publishedAt}, ${articles.createdAt}) >= ${filters.dateFrom}`);
    }
    if (filters?.dateTo) {
      whereConditions.push(sql`coalesce(${articles.publishedAt}, ${articles.createdAt}) <= ${filters.dateTo}`);
    }

    // Ensure articles are not in the future
    whereConditions.push(sql`(${articles.publishedAt} IS NULL OR ${articles.publishedAt} <= NOW()) AND ${articles.createdAt} <= NOW()`);

    return await db
      .select()
      .from(articles)
      .where(sql.join(whereConditions, sql` AND `))
      .orderBy(desc(sql`coalesce(${articles.publishedAt}, ${articles.createdAt})`))
      .limit(50); // Limit results for performance
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

  // Sports operations implementation

  // Leagues
  async getAllLeagues(): Promise<League[]> {
    return await db.select().from(leagues).where(eq(leagues.isActive, true)).orderBy(leagues.name);
  }

  async getLeagueById(id: string): Promise<League | undefined> {
    const [league] = await db.select().from(leagues).where(eq(leagues.id, id)).limit(1);
    return league;
  }

  async getLeagueByCode(code: string): Promise<League | undefined> {
    const [league] = await db.select().from(leagues).where(eq(leagues.code, code)).limit(1);
    return league;
  }

  async createLeague(league: InsertLeague): Promise<League> {
    const [created] = await db.insert(leagues).values(league).returning();
    return created;
  }

  async updateLeague(id: string, league: Partial<InsertLeague>): Promise<League | undefined> {
    const [updated] = await db.update(leagues)
      .set({ ...league, lastUpdated: new Date() })
      .where(eq(leagues.id, id))
      .returning();
    return updated;
  }

  // Teams
  async getTeamsByLeague(leagueId: string): Promise<Team[]> {
    return await db.select().from(teams).where(eq(teams.leagueId, leagueId)).orderBy(teams.name);
  }

  async getAllTeams(): Promise<Team[]> {
    return await db.select().from(teams).orderBy(teams.name);
  }

  async getTeamById(id: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id)).limit(1);
    return team;
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const [created] = await db.insert(teams).values(team).returning();
    return created;
  }

  async updateTeam(id: string, team: Partial<InsertTeam>): Promise<Team | undefined> {
    // Do not overwrite the leagueId when updating an existing team; teams may be shared across leagues.
    const { leagueId: _ignoreLeague, ...rest } = team as any;
    const [updated] = await db.update(teams)
      .set(rest)
      .where(eq(teams.id, id))
      .returning();
    return updated;
  }

  // Standings
  async getStandingsByLeague(leagueId: string): Promise<Standing[]> {
    return await db
      .select()
      .from(standings)
      .where(eq(standings.leagueId, leagueId))
      .orderBy(standings.position);
  }

  async getAllStandings(): Promise<Standing[]> {
    return await db
      .select()
      .from(standings)
      .orderBy(standings.leagueId, standings.position);
  }

  async updateStandings(leagueId: string, standingsData: InsertStanding[]): Promise<void> {
    // First delete existing standings for this league
    await db.delete(standings).where(eq(standings.leagueId, leagueId));

    // Insert new standings
    if (standingsData.length > 0) {
      await db.insert(standings).values(standingsData);
    }
  }

  async getTeamStanding(leagueId: string, teamId: string): Promise<Standing | undefined> {
    const [standing] = await db
      .select()
      .from(standings)
      .where(sql`${standings.leagueId} = ${leagueId} AND ${standings.teamId} = ${teamId}`)
      .limit(1);
    return standing;
  }

  // Matches
  async getMatchesByLeague(leagueId: string, limit?: number): Promise<Match[]> {
    const query = db
      .select()
      .from(matches)
      .where(eq(matches.leagueId, leagueId))
      .orderBy(desc(matches.utcDate));

    if (limit) {
      return await query.limit(limit);
    }

    return await query;
  }

  async getAllMatches(limit?: number): Promise<Match[]> {
    const query = db
      .select()
      .from(matches)
      .orderBy(desc(matches.utcDate));

    if (limit) return await query.limit(limit);
    return await query;
  }

  async getUpcomingMatches(leagueId: string, limit?: number): Promise<Match[]> {
    const query = db
      .select()
      .from(matches)
      .where(sql`${matches.leagueId} = ${leagueId} AND ${matches.status} = 'SCHEDULED' AND ${matches.utcDate} > NOW()`)
      .orderBy(matches.utcDate);

    if (limit) {
      return await query.limit(limit);
    }

    return await query;
  }

  async getRecentMatches(leagueId: string, limit?: number): Promise<Match[]> {
    const query = db
      .select()
      .from(matches)
      .where(sql`${matches.leagueId} = ${leagueId} AND ${matches.status} = 'FINISHED'`)
      .orderBy(desc(matches.utcDate));

    if (limit) {
      return await query.limit(limit);
    }

    return await query;
  }

  async getMatchById(id: string): Promise<Match | undefined> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id)).limit(1);
    return match;
  }

  async createMatch(match: InsertMatch): Promise<Match> {
    const [created] = await db.insert(matches).values(match).returning();
    return created;
  }

  async updateMatch(id: string, match: Partial<InsertMatch>): Promise<Match | undefined> {
    const [updated] = await db.update(matches)
      .set({ ...match, lastUpdated: new Date() })
      .where(eq(matches.id, id))
      .returning();
    return updated;
  }
}

export const storage = new Storage();
