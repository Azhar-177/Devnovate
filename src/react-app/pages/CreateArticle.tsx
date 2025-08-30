import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
import { Save, Eye, X, Image } from "lucide-react";
import { type CreateArticle } from "@/shared/types";
import MarkdownEditor from "@/react-app/components/MarkdownEditor";

export default function CreateArticle() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateArticle>({
    title: '',
    content: '',
    excerpt: '',
    coverImageUrl: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Sign in required</h1>
          <p className="text-slate-600">You need to sign in to create articles.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const { slug } = await response.json();
        navigate(`/article/${slug}`);
      }
    } catch (error) {
      console.error('Failed to create article:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (!formData.tags?.includes(tag)) {
        setFormData({
          ...formData,
          tags: [...(formData.tags || []), tag]
        });
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(tag => tag !== tagToRemove) || []
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Create New Article</h1>
        <p className="text-slate-600">Share your knowledge with the developer community</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter article title..."
            required
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
          />
        </div>

        {/* Cover Image */}
        <div>
          <label htmlFor="coverImage" className="block text-sm font-medium text-slate-700 mb-2">
            Cover Image URL
          </label>
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="url"
                id="coverImage"
                value={formData.coverImageUrl}
                onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              type="button"
              className="px-4 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Image className="w-5 h-5" />
            </button>
          </div>
          {formData.coverImageUrl && (
            <div className="mt-4">
              <img
                src={formData.coverImageUrl}
                alt="Cover preview"
                className="w-full h-48 object-cover rounded-xl border"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* Excerpt */}
        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-slate-700 mb-2">
            Excerpt
          </label>
          <textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            placeholder="Brief description of your article..."
            rows={3}
            maxLength={500}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
          <p className="text-xs text-slate-500 mt-1">
            {formData.excerpt?.length || 0}/500 characters
          </p>
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-slate-700 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.tags?.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-2 hover:text-indigo-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={addTag}
            placeholder="Type a tag and press Enter..."
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Content Editor */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-slate-700">
              Content *
            </label>
            <button
              type="button"
              onClick={() => setPreview(!preview)}
              className="flex items-center px-3 py-1 text-sm text-slate-600 hover:text-slate-900 border rounded-lg hover:bg-slate-50"
            >
              <Eye className="w-4 h-4 mr-1" />
              {preview ? 'Edit' : 'Preview'}
            </button>
          </div>
          
          <MarkdownEditor
            value={formData.content}
            onChange={(value) => setFormData({ ...formData, content: value })}
            preview={preview}
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-between items-center pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-3 text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading || !formData.title.trim() || !formData.content.trim()}
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Submit for Review
            </button>
          </div>
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <h3 className="font-medium text-blue-900 mb-2">📝 Article Submission Process</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Your article will be submitted for admin review</li>
          <li>• You'll be notified once it's approved and published</li>
          <li>• You can edit your article until it's published</li>
          <li>• Use Markdown syntax for rich formatting</li>
        </ul>
      </div>
    </div>
  );
}
