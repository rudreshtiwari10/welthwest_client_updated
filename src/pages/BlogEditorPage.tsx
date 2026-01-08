import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  EyeIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import newsBlogService, { Blog } from '../services/newsBlogService';

const BlogEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState<string>('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'developer';

  useEffect(() => {
    if (!isAdmin) {
      navigate('/news-and-blogs');
      return;
    }

    if (id) {
      loadBlog();
    }
  }, [id, isAdmin]);

  const loadBlog = async () => {
    try {
      setLoading(true);
      const response = await newsBlogService.getBlogById(id!);

      if (response.success) {
        const blog = response.blog;
        setTitle(blog.title);
        setSlug(blog.slug);
        setContent(blog.content);
        setSummary(blog.summary || '');
        setCategory(blog.category);
        setTags(blog.tags.join(', '));
        setImageUrl(blog.imageUrl || '');
        setStatus(blog.status);
      }
    } catch (error) {
      console.error('Error loading blog:', error);
      alert('Failed to load blog');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!id) {
      setSlug(generateSlug(newTitle));
    }
  };

  const handleSave = async (publishNow: boolean = false) => {
    if (!title.trim() || !content.trim()) {
      alert('Title and content are required');
      return;
    }

    try {
      setSaving(true);

      const blogData: Partial<Blog> = {
        title: title.trim(),
        content: content.trim(),
        author: user?.first_name && user?.last_name
          ? `${user.first_name} ${user.last_name}`
          : user?.username || user?.email || 'Admin',
        category,
        tags: tags.split(',').map(t => t.trim()).filter(t => t),
        summary: summary.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        status: publishNow ? 'published' : status
      };

      let response;
      if (id) {
        response = await newsBlogService.updateBlog(id, blogData);
      } else {
        response = await newsBlogService.createBlog(blogData);
      }

      if (response.success) {
        alert(id ? 'Blog updated successfully!' : 'Blog created successfully!');
        navigate('/news-and-blogs');
      }
    } catch (error: any) {
      console.error('Error saving blog:', error);
      alert(error.response?.data?.error || 'Failed to save blog');
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419]">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1f2e] border-b border-gray-200 dark:border-gray-700 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/news-and-blogs')}
              className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to News & Blogs
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {previewMode ? <DocumentTextIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                {previewMode ? 'Edit' : 'Preview'}
              </button>

              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </button>

              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <CheckIcon className="h-5 w-5" />
                {saving ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!previewMode ? (
          /* Editor Mode */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Editor */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter blog title..."
                  className="w-full px-4 py-3 bg-white dark:bg-[#1a1f2e] border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 text-gray-900 dark:text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="auto-generated-from-title"
                  className="w-full px-4 py-3 bg-white dark:bg-[#1a1f2e] border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 text-gray-900 dark:text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Summary (optional)
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Brief summary of the blog post..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white dark:bg-[#1a1f2e] border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 text-gray-900 dark:text-white placeholder-gray-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content * (Supports basic markdown)
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your blog content here... Use ## for headings, - for lists"
                  rows={20}
                  className="w-full px-4 py-3 bg-white dark:bg-[#1a1f2e] border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 text-gray-900 dark:text-white placeholder-gray-500 font-mono text-sm"
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-[#1a1f2e] rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Settings</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2 bg-white dark:bg-[#1a1f2e] border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 text-gray-900 dark:text-white"
                    >
                      <option>General</option>
                      <option>Finance</option>
                      <option>Investment Tips</option>
                      <option>AI & Technology</option>
                      <option>Market Analysis</option>
                      <option>Education</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="stocks, trading, analysis"
                      className="w-full px-4 py-2 bg-white dark:bg-[#1a1f2e] border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 text-gray-900 dark:text-white placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Featured Image URL
                    </label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-2 bg-white dark:bg-[#1a1f2e] border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 text-gray-900 dark:text-white placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                      className="w-full px-4 py-2 bg-white dark:bg-[#1a1f2e] border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 text-gray-900 dark:text-white"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Preview Mode */
          <div className="max-w-4xl mx-auto">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Preview Mode</strong> - This is how your blog will appear to readers
              </p>
            </div>

            <article className="bg-white dark:bg-[#1a1f2e] rounded-lg p-8">
              <span className="inline-block text-sm px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full mb-4">
                {category}
              </span>

              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {title || 'Untitled Blog Post'}
              </h1>

              {summary && (
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                  {summary}
                </p>
              )}

              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-64 object-cover rounded-xl mb-8"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}

              <div className="prose prose-lg dark:prose-invert max-w-none">
                {content.split('\n\n').map((para, index) => (
                  <p key={index} className="mb-4">
                    {para}
                  </p>
                ))}
              </div>

              {tags && (
                <div className="flex gap-2 mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                  {tags.split(',').map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm rounded-full"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </article>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogEditorPage;
