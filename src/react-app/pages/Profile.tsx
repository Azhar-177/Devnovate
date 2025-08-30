import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
import { Edit, BookOpen, Clock, Eye, Heart, MessageCircle, Plus } from "lucide-react";
import { ArticleWithAuthor, UpdateUserProfile } from "@/shared/types";

export default function Profile() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<ArticleWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState<UpdateUserProfile>({
    username: '',
    bio: '',
    avatarUrl: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.google_user_data.name || '',
        bio: '',
        avatarUrl: user.google_user_data.picture || ''
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchUserArticles = async () => {
      if (!user) return;
      
      try {
        const response = await fetch(`/api/articles?author=${user.google_user_data.name || user.email}`);
        const data = await response.json();
        setArticles(data);
      } catch (error) {
        console.error("Failed to fetch user articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserArticles();
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        setEditingProfile(false);
        // Refresh user data
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Sign in required</h1>
          <p className="text-slate-600">You need to sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      published: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      draft: 'bg-gray-100 text-gray-700',
      rejected: 'bg-red-100 text-red-700',
      hidden: 'bg-purple-100 text-purple-700'
    };
    
    return styles[status as keyof typeof styles] || styles.draft;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 mb-8">
        <div className="flex items-start space-x-6">
          <img
            src={user.google_user_data.picture || `https://ui-avatars.com/api/?name=${user.email}&background=6366f1&color=fff`}
            alt="Profile"
            className="w-24 h-24 rounded-full"
          />
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {user.google_user_data.name || user.email}
                </h1>
                <p className="text-slate-600">{user.email}</p>
              </div>
              
              <button
                onClick={() => setEditingProfile(true)}
                className="flex items-center px-4 py-2 text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            </div>
            
            <p className="text-slate-500 italic mb-4">No bio yet. Add one to tell others about yourself!</p>
            
            <div className="flex items-center space-x-6 text-sm text-slate-600">
              <div className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1" />
                {articles.length} articles
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Joined {formatDate(user.created_at)}
              </div>
              
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editingProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Edit Profile</h2>
            
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {profileData.bio?.length || 0}/500 characters
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Avatar URL
                </label>
                <input
                  type="url"
                  value={profileData.avatarUrl}
                  onChange={(e) => setProfileData({ ...profileData, avatarUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingProfile(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Articles Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Your Articles</h2>
          <Link
            to="/create"
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Article
          </Link>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No articles yet</h3>
            <p className="text-slate-600 mb-6">Start sharing your knowledge with the community!</p>
            <Link
              to="/create"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Write Your First Article
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <div key={article.id} className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Link
                        to={article.status === 'published' ? `/article/${article.slug}` : '#'}
                        className={`text-lg font-semibold ${
                          article.status === 'published' 
                            ? 'text-slate-900 hover:text-indigo-600' 
                            : 'text-slate-600'
                        } transition-colors`}
                      >
                        {article.title}
                      </Link>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(article.status)}`}>
                        {article.status}
                      </span>
                    </div>
                    
                    {article.excerpt && (
                      <p className="text-slate-600 mb-3 line-clamp-2">{article.excerpt}</p>
                    )}
                    
                    <div className="flex items-center space-x-6 text-sm text-slate-500">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDate(article.createdAt)}
                      </div>
                      {article.status === 'published' && (
                        <>
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {article.viewsCount}
                          </div>
                          <div className="flex items-center">
                            <Heart className="w-4 h-4 mr-1" />
                            {article.likesCount}
                          </div>
                          <div className="flex items-center">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            {article.commentsCount}
                          </div>
                        </>
                      )}
                    </div>
                    
                    {article.adminNotes && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>Admin Note:</strong> {article.adminNotes}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {article.status !== 'published' && (
                      <Link
                        to={`/edit/${article.id}`}
                        className="p-2 text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
