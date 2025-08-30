
DROP INDEX idx_article_tags_unique;
DROP INDEX idx_article_tags_tag_name;
DROP INDEX idx_article_tags_article_id;
DROP TABLE article_tags;

DROP INDEX idx_comments_parent_comment_id;
DROP INDEX idx_comments_author_id;
DROP INDEX idx_comments_article_id;
DROP TABLE comments;

DROP INDEX idx_article_likes_unique;
DROP INDEX idx_article_likes_user_id;
DROP INDEX idx_article_likes_article_id;
DROP TABLE article_likes;

DROP INDEX idx_articles_slug;
DROP INDEX idx_articles_published_at;
DROP INDEX idx_articles_status;
DROP INDEX idx_articles_author_id;
DROP TABLE articles;

DROP INDEX idx_user_profiles_username;
DROP INDEX idx_user_profiles_mocha_user_id;
DROP TABLE user_profiles;
