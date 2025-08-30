import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  exchangeCodeForSessionToken,
  getOAuthRedirectUrl,
  authMiddleware,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";
import { getCookie, setCookie } from "hono/cookie";
import { zValidator } from "@hono/zod-validator";
import {
  CreateArticleSchema,
  UpdateArticleSchema,
  UpdateUserProfileSchema,
  type SearchFilters
} from "@/shared/types";

const app = new Hono<{ Bindings: Env }>();

// Enable CORS
app.use("/*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Auth endpoints
app.get('/api/oauth/google/redirect_url', async (c) => {
  const redirectUrl = await getOAuthRedirectUrl('google', {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  return c.json({ redirectUrl }, 200);
});

app.post("/api/sessions", async (c) => {
  try {
    const body = await c.req.json();

    if (!body.code) {
      return c.json({ error: "No authorization code provided" }, 400);
    }

    const sessionToken = await exchangeCodeForSessionToken(body.code, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });

    setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      path: "/",
      sameSite: "none",
      secure: true,
      maxAge: 60 * 24 * 60 * 60, // 60 days
    });

    return c.json({ success: true }, 200);
  } catch (error) {
    console.error("Session creation error:", error);
    return c.json({ error: "Authentication failed", details: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

app.get("/api/users/me", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  // Get or create user profile
  let profile = await c.env.DB.prepare(
    "SELECT * FROM user_profiles WHERE mocha_user_id = ?"
  ).bind(user.id).first();

  if (!profile) {
    // Create user profile - make first user admin
    const existingUsers = await c.env.DB.prepare("SELECT COUNT(*) as count FROM user_profiles").first();
    const isFirstUser = existingUsers && existingUsers.count === 0;
    
    const result = await c.env.DB.prepare(`
      INSERT INTO user_profiles (mocha_user_id, username, avatar_url, is_admin, created_at, updated_at) 
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(user.id, user.google_user_data.name || user.email.split('@')[0], user.google_user_data.picture, isFirstUser ? 1 : 0).run();
    
    profile = await c.env.DB.prepare(
      "SELECT * FROM user_profiles WHERE id = ?"
    ).bind(result.meta.last_row_id).first();
  }

  return c.json({ ...user, profile });
});

app.get('/api/logout', async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === 'string') {
    await deleteSession(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    sameSite: 'none',
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// User profile endpoints
app.put("/api/profile", authMiddleware, zValidator("json", UpdateUserProfileSchema), async (c) => {
  const user = c.get("user");
  const data = c.req.valid("json");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await c.env.DB.prepare(`
    UPDATE user_profiles 
    SET username = COALESCE(?, username),
        bio = COALESCE(?, bio),
        avatar_url = COALESCE(?, avatar_url),
        updated_at = datetime('now')
    WHERE mocha_user_id = ?
  `).bind(data.username, data.bio, data.avatarUrl, user.id).run();

  return c.json({ success: true });
});

// Article endpoints
app.get("/api/articles", async (c) => {
  const { query, tags, author, sortBy = 'latest' } = c.req.query() as SearchFilters;
  
  let sql = `
    SELECT a.*, up.username, up.avatar_url, up.mocha_user_id,
           GROUP_CONCAT(at.tag_name) as tags,
           COALESCE(a.views_count, 0) as views_count,
           COALESCE(a.likes_count, 0) as likes_count,
           COALESCE(a.comments_count, 0) as comments_count
    FROM articles a
    LEFT JOIN user_profiles up ON a.author_id = up.mocha_user_id
    LEFT JOIN article_tags at ON a.id = at.article_id
    WHERE a.status = 'published'
  `;
  
  const params: any[] = [];
  
  if (query) {
    sql += ` AND (a.title LIKE ? OR a.content LIKE ? OR a.excerpt LIKE ?)`;
    params.push(`%${query}%`, `%${query}%`, `%${query}%`);
  }
  
  if (author) {
    sql += ` AND up.username = ?`;
    params.push(author);
  }
  
  sql += ` GROUP BY a.id`;
  
  if (tags && tags.length > 0) {
    sql += ` HAVING `;
    const tagConditions = tags.map(() => `tags LIKE ?`).join(' AND ');
    sql += tagConditions;
    tags.forEach(tag => params.push(`%${tag}%`));
  }
  
  // Sort by
  switch (sortBy) {
    case 'oldest':
      sql += ` ORDER BY a.published_at ASC`;
      break;
    case 'popular':
      sql += ` ORDER BY a.likes_count DESC, a.views_count DESC`;
      break;
    case 'trending':
      sql += ` ORDER BY (a.likes_count + a.comments_count) DESC, a.published_at DESC`;
      break;
    default:
      sql += ` ORDER BY a.published_at DESC`;
  }
  
  sql += ` LIMIT 50`;
  
  const { results } = await c.env.DB.prepare(sql).bind(...params).all();
  
  const articles = results.map((row: any) => ({
    ...row,
    author: {
      username: row.username,
      avatarUrl: row.avatar_url,
      mochaUserId: row.mocha_user_id
    },
    tags: row.tags && typeof row.tags === 'string' ? row.tags.split(',') : []
  }));
  
  return c.json(articles);
});

app.get("/api/articles/trending", async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT a.*, up.username, up.avatar_url, up.mocha_user_id,
           GROUP_CONCAT(at.tag_name) as tags,
           COALESCE(a.views_count, 0) as views_count,
           COALESCE(a.likes_count, 0) as likes_count,
           COALESCE(a.comments_count, 0) as comments_count,
           (COALESCE(a.likes_count, 0) * 2 + COALESCE(a.comments_count, 0) + COALESCE(a.views_count, 0) * 0.1) as trending_score
    FROM articles a
    LEFT JOIN user_profiles up ON a.author_id = up.mocha_user_id
    LEFT JOIN article_tags at ON a.id = at.article_id
    WHERE a.status = 'published' 
      AND a.published_at > datetime('now', '-7 days')
    GROUP BY a.id
    ORDER BY trending_score DESC
    LIMIT 10
  `).all();
  
  const articles = results.map((row: any) => ({
    ...row,
    author: {
      username: row.username,
      avatarUrl: row.avatar_url,
      mochaUserId: row.mocha_user_id
    },
    tags: row.tags && typeof row.tags === 'string' ? row.tags.split(',') : []
  }));
  
  return c.json(articles);
});

app.get("/api/articles/:slug", async (c) => {
  const slug = c.req.param("slug");
  
  const article = await c.env.DB.prepare(`
    SELECT a.*, up.username, up.avatar_url, up.mocha_user_id,
           GROUP_CONCAT(at.tag_name) as tags,
           COALESCE(a.views_count, 0) as views_count,
           COALESCE(a.likes_count, 0) as likes_count,
           COALESCE(a.comments_count, 0) as comments_count
    FROM articles a
    LEFT JOIN user_profiles up ON a.author_id = up.mocha_user_id
    LEFT JOIN article_tags at ON a.id = at.article_id
    WHERE a.slug = ? AND a.status = 'published'
    GROUP BY a.id
  `).bind(slug).first();
  
  if (!article) {
    return c.json({ error: "Article not found" }, 404);
  }
  
  // Increment view count
  await c.env.DB.prepare(`
    UPDATE articles SET views_count = views_count + 1 WHERE id = ?
  `).bind(article.id).run();
  
  const result = {
    ...article,
    author: {
      username: article.username,
      avatarUrl: article.avatar_url,
      mochaUserId: article.mocha_user_id
    },
    tags: article.tags && typeof article.tags === 'string' ? article.tags.split(',') : []
  };
  
  return c.json(result);
});

app.post("/api/articles", authMiddleware, zValidator("json", CreateArticleSchema), async (c) => {
  const user = c.get("user");
  const data = c.req.valid("json");
  
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  // Generate slug from title
  const slug = data.title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim() + '-' + Date.now();
  
  const result = await c.env.DB.prepare(`
    INSERT INTO articles (title, slug, content, excerpt, cover_image_url, author_id, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'pending', datetime('now'), datetime('now'))
  `).bind(data.title, slug, data.content, data.excerpt, data.coverImageUrl, user.id).run();
  
  const articleId = result.meta.last_row_id;
  
  // Add tags
  if (data.tags && data.tags.length > 0) {
    for (const tag of data.tags) {
      await c.env.DB.prepare(`
        INSERT INTO article_tags (article_id, tag_name, created_at, updated_at)
        VALUES (?, ?, datetime('now'), datetime('now'))
      `).bind(articleId, tag.toLowerCase()).run();
    }
  }
  
  return c.json({ id: articleId, slug }, 201);
});

app.put("/api/articles/:id", authMiddleware, zValidator("json", UpdateArticleSchema), async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const data = c.req.valid("json");
  
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  // Check if user owns the article
  const article = await c.env.DB.prepare(`
    SELECT * FROM articles WHERE id = ? AND author_id = ?
  `).bind(id, user.id).first();
  
  if (!article) {
    return c.json({ error: "Article not found or not authorized" }, 404);
  }
  
  const updates: string[] = [];
  const params: any[] = [];
  
  if (data.title) {
    updates.push("title = ?");
    params.push(data.title);
  }
  if (data.content) {
    updates.push("content = ?");
    params.push(data.content);
  }
  if (data.excerpt !== undefined) {
    updates.push("excerpt = ?");
    params.push(data.excerpt);
  }
  if (data.coverImageUrl !== undefined) {
    updates.push("cover_image_url = ?");
    params.push(data.coverImageUrl);
  }
  
  updates.push("updated_at = datetime('now')");
  params.push(id);
  
  await c.env.DB.prepare(`
    UPDATE articles SET ${updates.join(", ")} WHERE id = ?
  `).bind(...params).run();
  
  // Update tags if provided
  if (data.tags) {
    await c.env.DB.prepare("DELETE FROM article_tags WHERE article_id = ?").bind(id).run();
    for (const tag of data.tags) {
      await c.env.DB.prepare(`
        INSERT INTO article_tags (article_id, tag_name, created_at, updated_at)
        VALUES (?, ?, datetime('now'), datetime('now'))
      `).bind(id, tag.toLowerCase()).run();
    }
  }
  
  return c.json({ success: true });
});

// Like/Unlike article
app.post("/api/articles/:id/like", authMiddleware, async (c) => {
  const user = c.get("user");
  const articleId = c.req.param("id");
  
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  // Check if already liked
  const existingLike = await c.env.DB.prepare(`
    SELECT * FROM article_likes WHERE article_id = ? AND user_id = ?
  `).bind(articleId, user.id).first();
  
  if (existingLike) {
    // Unlike
    await c.env.DB.prepare(`
      DELETE FROM article_likes WHERE article_id = ? AND user_id = ?
    `).bind(articleId, user.id).run();
    
    await c.env.DB.prepare(`
      UPDATE articles SET likes_count = likes_count - 1 WHERE id = ?
    `).bind(articleId).run();
    
    return c.json({ liked: false });
  } else {
    // Like
    await c.env.DB.prepare(`
      INSERT INTO article_likes (article_id, user_id, created_at, updated_at)
      VALUES (?, ?, datetime('now'), datetime('now'))
    `).bind(articleId, user.id).run();
    
    await c.env.DB.prepare(`
      UPDATE articles SET likes_count = likes_count + 1 WHERE id = ?
    `).bind(articleId).run();
    
    return c.json({ liked: true });
  }
});

// Admin endpoints
app.get("/api/admin/articles", authMiddleware, async (c) => {
  const user = c.get("user");
  
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  // Check if user is admin
  const profile = await c.env.DB.prepare(`
    SELECT * FROM user_profiles WHERE mocha_user_id = ? AND is_admin = 1
  `).bind(user.id).first();
  
  if (!profile) {
    return c.json({ error: "Admin access required" }, 403);
  }
  
  const { results } = await c.env.DB.prepare(`
    SELECT a.*, up.username, up.avatar_url, up.mocha_user_id
    FROM articles a
    LEFT JOIN user_profiles up ON a.author_id = up.mocha_user_id
    WHERE a.status IN ('pending', 'published', 'hidden')
    ORDER BY a.created_at DESC
  `).all();
  
  const articlesWithAuthor = results.map((row: any) => ({
    ...row,
    author: {
      username: row.username,
      email: row.username || 'Unknown User',
      avatarUrl: row.avatar_url,
      mochaUserId: row.mocha_user_id
    }
  }));
  
  return c.json(articlesWithAuthor);
});

app.put("/api/admin/articles/:id/status", authMiddleware, async (c) => {
  const user = c.get("user");
  const articleId = c.req.param("id");
  const { status, adminNotes } = await c.req.json();
  
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  // Check if user is admin
  const profile = await c.env.DB.prepare(`
    SELECT * FROM user_profiles WHERE mocha_user_id = ? AND is_admin = 1
  `).bind(user.id).first();
  
  if (!profile) {
    return c.json({ error: "Admin access required" }, 403);
  }
  
  if (status === 'published') {
    await c.env.DB.prepare(`
      UPDATE articles 
      SET status = ?, admin_notes = ?, published_at = datetime('now'), updated_at = datetime('now')
      WHERE id = ?
    `).bind(status, adminNotes || null, articleId).run();
  } else {
    await c.env.DB.prepare(`
      UPDATE articles 
      SET status = ?, admin_notes = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(status, adminNotes || null, articleId).run();
  }
  
  return c.json({ success: true });
});

// Add endpoint to get article for editing
app.get("/api/articles/:id/edit", authMiddleware, async (c) => {
  const user = c.get("user");
  const articleId = c.req.param("id");
  
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  const article = await c.env.DB.prepare(`
    SELECT a.*, GROUP_CONCAT(at.tag_name) as tags
    FROM articles a
    LEFT JOIN article_tags at ON a.id = at.article_id
    WHERE a.id = ? AND a.author_id = ?
    GROUP BY a.id
  `).bind(articleId, user.id).first();
  
  if (!article) {
    return c.json({ error: "Article not found or not authorized" }, 404);
  }
  
  const result = {
    ...article,
    tags: article.tags && typeof article.tags === 'string' ? article.tags.split(',') : []
  };
  
  return c.json(result);
});

export default app;
