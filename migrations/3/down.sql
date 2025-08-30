
-- Remove the new sample data
DELETE FROM article_tags WHERE article_id IN (
  SELECT id FROM articles WHERE author_id IN ('demo-user-css', 'demo-user-python', 'demo-user-js')
);
DELETE FROM articles WHERE author_id IN ('demo-user-css', 'demo-user-python', 'demo-user-js');
DELETE FROM user_profiles WHERE mocha_user_id IN ('demo-user-css', 'demo-user-python', 'demo-user-js');
