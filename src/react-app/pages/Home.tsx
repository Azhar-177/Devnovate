import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Clock, TrendingUp, PenTool } from "lucide-react";
import { ArticleWithAuthor } from "@/shared/types";
import ArticleCard from "@/react-app/components/ArticleCard";

export default function Home() {
  const [articles, setArticles] = useState<ArticleWithAuthor[]>([]);
  const [trendingArticles, setTrendingArticles] = useState<ArticleWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articlesRes, trendingRes] = await Promise.all([
          fetch("/api/articles?sortBy=latest"),
          fetch("/api/articles/trending")
        ]);
        
        const [articlesData, trendingData] = await Promise.all([
          articlesRes.json(),
          trendingRes.json()
        ]);
        
        setArticles(articlesData);
        setTrendingArticles(trendingData);
      } catch (error) {
        console.error("Failed to fetch articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 blur-3xl rounded-full"></div>
          <h1 className="relative text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Share Your
            </span>
            <br />
            <span className="text-slate-900">Developer Story</span>
          </h1>
        </div>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Join a community of passionate developers sharing insights, tutorials, and experiences. 
          Write, discover, and engage with quality content.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/create"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-indigo-200 hover:shadow-xl"
          >
            <PenTool className="w-5 h-5 mr-2" />
            Start Writing
          </Link>
          <Link
            to="/search"
            className="inline-flex items-center px-8 py-4 bg-white text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-200 shadow-lg border border-slate-200"
          >
            Explore Articles
          </Link>
        </div>
      </div>

      {/* Trending Section */}
      {trendingArticles.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Trending This Week</h2>
            </div>
            <Link 
              to="/trending" 
              className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              View all
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trendingArticles.slice(0, 3).map((article) => (
              <ArticleCard key={article.id} article={article} showTrending />
            ))}
          </div>
        </section>
      )}

      {/* Latest Articles */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Latest Articles</h2>
          </div>
        </div>
        
        {articles.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PenTool className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No articles yet</h3>
            <p className="text-slate-600 mb-6">Be the first to share your story with the community.</p>
            <Link
              to="/create"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
            >
              <PenTool className="w-4 h-4 mr-2" />
              Write First Article
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
