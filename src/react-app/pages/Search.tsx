import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Search as SearchIcon, Filter, X, Tag } from "lucide-react";
import { ArticleWithAuthor, SearchFilters } from "@/shared/types";
import ArticleCard from "@/react-app/components/ArticleCard";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<ArticleWithAuthor[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || '',
    sortBy: (searchParams.get('sortBy') as any) || 'latest',
    tags: searchParams.getAll('tag')
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.query);

  const sortOptions = [
    { value: 'latest', label: 'Latest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'trending', label: 'Trending' }
  ];

  const popularTags = ['javascript', 'react', 'typescript', 'nodejs', 'python', 'web-development', 'tutorial', 'beginners'];

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.query) params.set('query', filters.query);
        if (filters.sortBy) params.set('sortBy', filters.sortBy);
        if (filters.tags) {
          filters.tags.forEach(tag => params.append('tags', tag));
        }

        const response = await fetch(`/api/articles?${params.toString()}`);
        const data = await response.json();
        setArticles(data);
      } catch (error) {
        console.error("Failed to fetch articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ query: searchInput });
  };

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    // Update URL params
    const params = new URLSearchParams();
    if (updatedFilters.query) params.set('q', updatedFilters.query);
    if (updatedFilters.sortBy && updatedFilters.sortBy !== 'latest') params.set('sortBy', updatedFilters.sortBy);
    if (updatedFilters.tags && updatedFilters.tags.length > 0) {
      updatedFilters.tags.forEach(tag => params.append('tag', tag));
    }
    setSearchParams(params);
  };

  const addTag = (tag: string) => {
    if (!filters.tags?.includes(tag)) {
      updateFilters({ tags: [...(filters.tags || []), tag] });
    }
  };

  const removeTag = (tag: string) => {
    updateFilters({ tags: filters.tags?.filter(t => t !== tag) || [] });
  };

  const clearFilters = () => {
    setFilters({ query: '', sortBy: 'latest', tags: [] });
    setSearchInput('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
            <SearchIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Search Articles</h1>
        </div>
        <p className="text-lg text-slate-600">
          Find articles by keywords, tags, or authors
        </p>
      </div>

      {/* Search Form */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search articles, tags, or authors..."
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Filter className="w-5 h-5" />
          </button>
        </form>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Clear all
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Sort by
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilters({ sortBy: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Popular Tags */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Popular tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => addTag(tag)}
                      disabled={filters.tags?.includes(tag)}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        filters.tags?.includes(tag)
                          ? 'bg-indigo-100 text-indigo-700 cursor-not-allowed'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {(filters.query || filters.tags?.length || filters.sortBy !== 'latest') && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm text-slate-600">Active filters:</span>
            
            {filters.query && (
              <span className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                "{filters.query}"
                <button
                  onClick={() => {
                    setSearchInput('');
                    updateFilters({ query: '' });
                  }}
                  className="ml-2 hover:text-indigo-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.tags?.map(tag => (
              <span key={tag} className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-2 hover:text-slate-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            
            {filters.sortBy !== 'latest' && (
              <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                Sort: {sortOptions.find(opt => opt.value === filters.sortBy)?.label}
                <button
                  onClick={() => updateFilters({ sortBy: 'latest' })}
                  className="ml-2 hover:text-green-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <p className="text-sm text-slate-600">
              {articles.length} article{articles.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {articles.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchIcon className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No articles found</h3>
              <p className="text-slate-600 mb-6">Try adjusting your search terms or filters.</p>
              <button
                onClick={clearFilters}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
