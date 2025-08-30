import { useEffect, useState } from "react";
import { TrendingUp, Filter } from "lucide-react";
import { ArticleWithAuthor } from "@/shared/types";
import ArticleCard from "@/react-app/components/ArticleCard";

export default function Trending() {
  const [articles, setArticles] = useState<ArticleWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/articles/trending");
        const data = await response.json();
        setArticles(data);
      } catch (error) {
        console.error("Failed to fetch trending articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [timeFrame]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Trending Articles</h1>
        </div>
        <p className="text-lg text-slate-600">
          Discover the most popular articles based on likes, comments, and views
        </p>
      </div>

      {/* Time frame filters */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-slate-500" />
          <div className="flex space-x-2">
            {[
              { key: 'day', label: 'Today' },
              { key: 'week', label: 'This Week' },
              { key: 'month', label: 'This Month' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTimeFrame(key as 'day' | 'week' | 'month')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  timeFrame === key
                    ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No trending articles</h3>
          <p className="text-slate-600">Check back later for trending content.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <div key={article.id} className="relative">
              {index < 3 && (
                <div className="absolute -top-2 -left-2 z-10 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {index + 1}
                </div>
              )}
              <ArticleCard article={article} showTrending={index < 3} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
