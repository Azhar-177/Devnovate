import { Link } from "react-router";
import { Eye, Heart, MessageCircle, Clock, TrendingUp } from "lucide-react";
import { ArticleWithAuthor } from "@/shared/types";

interface ArticleCardProps {
  article: ArticleWithAuthor;
  showTrending?: boolean;
}

export default function ArticleCard({ article, showTrending }: ArticleCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCount = (count: number | null | undefined) => {
    const safeCount = count || 0;
    if (safeCount >= 1000) {
      return `${(safeCount / 1000).toFixed(1)}k`;
    }
    return safeCount.toString();
  };

  return (
    <article className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1">
      {showTrending && (
        <div className="absolute top-4 left-4 z-10 flex items-center px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-medium rounded-full">
          <TrendingUp className="w-3 h-3 mr-1" />
          Trending
        </div>
      )}
      
      {article.coverImageUrl && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={article.coverImageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
      )}
      
      <div className="p-6">
        {/* Author info */}
        <div className="flex items-center space-x-3 mb-4">
          <img
            src={article.author.avatarUrl || `https://ui-avatars.com/api/?name=${article.author.username}&background=6366f1&color=fff`}
            alt={article.author.username}
            className="w-8 h-8 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {article.author.username || 'Anonymous'}
            </p>
            <div className="flex items-center text-xs text-slate-500">
              <Clock className="w-3 h-3 mr-1" />
              {formatDate(article.publishedAt || article.createdAt)}
            </div>
          </div>
        </div>

        {/* Title and excerpt */}
        <Link to={`/article/${article.slug}`} className="block group-hover:text-indigo-600 transition-colors">
          <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2 leading-tight">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="text-slate-600 text-sm line-clamp-3 mb-4 leading-relaxed">
              {article.excerpt}
            </p>
          )}
        </Link>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-slate-500 pt-4 border-t border-slate-100">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {formatCount(article.viewsCount)}
            </div>
            <div className="flex items-center">
              <Heart className="w-4 h-4 mr-1" />
              {formatCount(article.likesCount)}
            </div>
            <div className="flex items-center">
              <MessageCircle className="w-4 h-4 mr-1" />
              {formatCount(article.commentsCount)}
            </div>
          </div>
          
          <Link
            to={`/article/${article.slug}`}
            className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
          >
            Read more →
          </Link>
        </div>
      </div>
    </article>
  );
}
