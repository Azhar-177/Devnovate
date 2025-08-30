import { useEffect, useState } from "react";
import { useAuth } from "@getmocha/users-service/react";
import { Shield, CheckCircle, XCircle, EyeOff, Trash2, Clock, Eye } from "lucide-react";

interface AdminArticle {
  id: number;
  title: string;
  author?: {
    username?: string;
    email?: string;
  };
  status: string;
  createdAt: string;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  adminNotes?: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const response = await fetch('/api/admin/articles');
        if (response.ok) {
          const data = await response.json();
          setArticles(data);
          setIsAdmin(true);
        } else if (response.status === 403) {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Failed to fetch admin articles:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
        setCheckingAdmin(false);
      }
    };

    if (user) {
      checkAdminAccess();
    } else {
      setLoading(false);
      setCheckingAdmin(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Sign in required</h1>
          <p className="text-slate-600">You need to sign in to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  const updateArticleStatus = async (articleId: number, status: string, adminNotes?: string) => {
    setProcessingId(articleId);
    try {
      const response = await fetch(`/api/admin/articles/${articleId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes })
      });

      if (response.ok) {
        setArticles(articles.map(article => 
          article.id === articleId 
            ? { ...article, status, adminNotes }
            : article
        ));
      }
    } catch (error) {
      console.error("Failed to update article status:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      published: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      rejected: 'bg-red-100 text-red-700',
      hidden: 'bg-purple-100 text-purple-700'
    };
    
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const pendingArticles = articles.filter(a => a.status === 'pending');
  const publishedArticles = articles.filter(a => a.status === 'published');
  const otherArticles = articles.filter(a => !['pending', 'published'].includes(a.status));

  if (checkingAdmin || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAdmin && user) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Access Denied</h1>
          <p className="text-slate-600">You don't have admin privileges to access this dashboard.</p>
          <p className="text-slate-500 mt-2 text-sm">Contact an administrator to request access.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        </div>
        <p className="text-lg text-slate-600">
          Manage article submissions and published content
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="text-2xl font-bold text-slate-900">{pendingArticles.length}</div>
          <div className="text-sm text-slate-600">Pending Review</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="text-2xl font-bold text-slate-900">{publishedArticles.length}</div>
          <div className="text-sm text-slate-600">Published</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="text-2xl font-bold text-slate-900">
            {publishedArticles.reduce((sum, a) => sum + a.viewsCount, 0)}
          </div>
          <div className="text-sm text-slate-600">Total Views</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="text-2xl font-bold text-slate-900">
            {publishedArticles.reduce((sum, a) => sum + a.likesCount, 0)}
          </div>
          <div className="text-sm text-slate-600">Total Likes</div>
        </div>
      </div>

      {/* Pending Articles */}
      {pendingArticles.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-yellow-500" />
            Pending Review ({pendingArticles.length})
          </h2>
          
          <div className="space-y-4">
            {pendingArticles.map((article) => (
              <div key={article.id} className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{article.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-slate-600 mb-4">
                      <span>By {article.author?.username || article.author?.email || 'Unknown User'}</span>
                      <span>{formatDate(article.createdAt)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(article.status)}`}>
                        {article.status}
                      </span>
                    </div>
                    
                    {article.adminNotes && (
                      <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-700">
                          <strong>Previous notes:</strong> {article.adminNotes}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-6">
                    <button
                      onClick={() => updateArticleStatus(article.id, 'published')}
                      disabled={processingId === article.id}
                      className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </button>
                    
                    <button
                      onClick={() => {
                        const notes = prompt('Rejection reason (optional):');
                        updateArticleStatus(article.id, 'rejected', notes || undefined);
                      }}
                      disabled={processingId === article.id}
                      className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Published Articles */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
          <Eye className="w-5 h-5 mr-2 text-green-500" />
          Published Articles ({publishedArticles.length})
        </h2>
        
        <div className="space-y-4">
          {publishedArticles.map((article) => (
            <div key={article.id} className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{article.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-slate-600 mb-2">
                    <span>By {article.author?.username || article.author?.email || 'Unknown User'}</span>
                    <span>{formatDate(article.createdAt)}</span>
                    <span>{article.viewsCount} views</span>
                    <span>{article.likesCount} likes</span>
                    <span>{article.commentsCount} comments</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-6">
                  <button
                    onClick={() => updateArticleStatus(article.id, 'hidden')}
                    disabled={processingId === article.id}
                    className="flex items-center px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
                  >
                    <EyeOff className="w-4 h-4 mr-1" />
                    Hide
                  </button>
                  
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
                        // updateArticleStatus(article.id, 'deleted');
                      }
                    }}
                    disabled={processingId === article.id}
                    className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Other Articles */}
      {otherArticles.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-6">Other Articles</h2>
          
          <div className="space-y-4">
            {otherArticles.map((article) => (
              <div key={article.id} className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{article.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-slate-600 mb-2">
                      <span>By {article.author?.username || article.author?.email || 'Unknown User'}</span>
                      <span>{formatDate(article.createdAt)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(article.status)}`}>
                        {article.status}
                      </span>
                    </div>
                    
                    {article.adminNotes && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-700">
                          <strong>Notes:</strong> {article.adminNotes}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-6">
                    {article.status === 'hidden' && (
                      <button
                        onClick={() => updateArticleStatus(article.id, 'published')}
                        disabled={processingId === article.id}
                        className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Publish
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
