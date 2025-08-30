import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
import { Heart, MessageCircle, Eye, Clock, Edit, Share2, Tag, ArrowLeft } from "lucide-react";
import { ArticleWithAuthor } from "@/shared/types";

export default function Article() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [article, setArticle] = useState<ArticleWithAuthor | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;
      
      try {
        const response = await fetch(`/api/articles/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setArticle(data);
          
          // Check if user has liked this article
          if (user) {
            // This would be implemented in a real app
          }
        } else if (response.status === 404) {
          navigate('/');
        }
      } catch (error) {
        console.error("Failed to fetch article:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug, user, navigate]);

  const handleLike = async () => {
    if (!user || !article) return;

    try {
      const response = await fetch(`/api/articles/${article.id}/like`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        setLiked(data.liked);
        setArticle({
          ...article,
          likesCount: article.likesCount + (data.liked ? 1 : -1)
        });
      }
    } catch (error) {
      console.error("Failed to like article:", error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.excerpt,
          url: window.location.href
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href);
      // Show toast notification
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !article || !commentContent.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: article.id,
          content: commentContent.trim()
        })
      });

      if (response.ok) {
        setCommentContent('');
        // Refresh comments
        // fetchComments();
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderMarkdown = (text: string) => {
    // Simple markdown renderer
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-slate-100 px-2 py-1 rounded text-sm font-mono">$1</code>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-6 shadow-lg" />')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-indigo-600 hover:text-indigo-800 underline">$1</a>')
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-indigo-300 pl-6 italic text-slate-700 my-6 bg-slate-50 py-4">$1</blockquote>')
      .replace(/^- (.+)$/gm, '<li class="list-disc ml-6 my-2">$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li class="list-decimal ml-6 my-2">$1</li>')
      .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-slate-900 my-8">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-slate-900 my-6">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold text-slate-900 my-4">$1</h3>')
      .replace(/```([^`]+)```/g, '<pre class="bg-slate-900 text-white p-4 rounded-lg my-6 overflow-x-auto"><code>$1</code></pre>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br />');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Article not found</h1>
          <Link to="/" className="text-indigo-600 hover:text-indigo-700">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-slate-600 hover:text-slate-900 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      {/* Article Header */}
      <header className="mb-8">
        {article.coverImageUrl && (
          <img
            src={article.coverImageUrl}
            alt={article.title}
            className="w-full h-64 object-cover rounded-xl mb-8 shadow-lg"
          />
        )}

        <h1 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">
          {article.title}
        </h1>

        {article.excerpt && (
          <p className="text-xl text-slate-600 mb-6 leading-relaxed">
            {article.excerpt}
          </p>
        )}

        {/* Author and meta info */}
        <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-200">
          <div className="flex items-center space-x-4">
            <img
              src={article.author.avatarUrl || `https://ui-avatars.com/api/?name=${article.author.username}&background=6366f1&color=fff`}
              alt={article.author.username}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <p className="font-semibold text-slate-900">
                {article.author.username || 'Anonymous'}
              </p>
              <div className="flex items-center text-sm text-slate-500 space-x-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatDate(article.publishedAt || article.createdAt)}
                </div>
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {article.viewsCount} views
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user && user.id === article.authorId && (
              <Link
                to={`/edit/${article.id}`}
                className="flex items-center px-4 py-2 text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Link>
            )}
            
            <button
              onClick={handleShare}
              className="flex items-center px-4 py-2 text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </button>
          </div>
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Article Content */}
      <article className="prose prose-lg prose-slate max-w-none mb-12">
        <div 
          dangerouslySetInnerHTML={{ 
            __html: `<p class="mb-4">${renderMarkdown(article.content)}</p>` 
          }} 
        />
      </article>

      {/* Article Actions */}
      <div className="flex items-center justify-between py-6 border-y border-slate-200 mb-12">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleLike}
            disabled={!user}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              liked
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'text-slate-600 hover:text-red-600 hover:bg-red-50'
            } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
            <span>{article.likesCount}</span>
          </button>
          
          <div className="flex items-center space-x-2 text-slate-600">
            <MessageCircle className="w-5 h-5" />
            <span>{article.commentsCount}</span>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <section>
        <h3 className="text-xl font-bold text-slate-900 mb-6">
          Comments ({article.commentsCount})
        </h3>

        {user ? (
          <form onSubmit={submitComment} className="mb-8">
            <div className="flex space-x-4">
              <img
                src={user.google_user_data.picture || `https://ui-avatars.com/api/?name=${user.email}&background=6366f1&color=fff`}
                alt="Your avatar"
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                />
                <div className="flex justify-between items-center mt-3">
                  <p className="text-xs text-slate-500">
                    {commentContent.length}/1000 characters
                  </p>
                  <button
                    type="submit"
                    disabled={!commentContent.trim() || submittingComment}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="text-center py-8 bg-slate-50 rounded-lg mb-8">
            <p className="text-slate-600 mb-4">Sign in to join the discussion</p>
            <button className="text-indigo-600 hover:text-indigo-700 font-medium">
              Sign in
            </button>
          </div>
        )}

        {/* Comments list would go here */}
        <div className="space-y-6">
          <p className="text-center text-slate-500 py-8">
            No comments yet. Be the first to share your thoughts!
          </p>
        </div>
      </section>
    </div>
  );
}
