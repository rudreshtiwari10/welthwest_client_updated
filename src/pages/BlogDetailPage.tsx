import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  EyeIcon,
  ShareIcon,
  ClockIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import newsBlogService, { Blog } from '../services/newsBlogService';
import { usePageMeta } from '../hooks/usePageMeta';

const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  usePageMeta({
    title: blog ? `${blog.title} | WelthWest Blog` : 'Blog | WelthWest',
    description: blog?.summary || 'Read the latest trading insights and market analysis from WelthWest.',
    ogUrl: blog ? `https://www.welthwest.com/blog/${slug}` : undefined,
  });

  useEffect(() => {
    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await newsBlogService.getBlogBySlug(slug!);

      if (response.success) {
        setBlog(response.blog);
      } else {
        setError('Blog not found');
      }
    } catch (err: any) {
      console.error('Error fetching blog:', err);
      setError(err.response?.data?.error || 'Failed to load blog');
    } finally {
      setLoading(false);
    }
  };

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const handleShare = async () => {
    if (navigator.share && blog) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.summary,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to copying link
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const renderContent = (content: string) => {
    // Simple markdown-like rendering
    const paragraphs = content.split('\n\n');

    return paragraphs.map((para, index) => {
      // Heading
      if (para.startsWith('##')) {
        const headingText = para.replace(/^##\s*/, '');
        return (
          <h2 key={index} className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-8">
            {headingText}
          </h2>
        );
      }

      // List
      if (para.includes('\n-')) {
        const items = para.split('\n').filter(line => line.trim().startsWith('-'));
        return (
          <ul key={index} className="list-disc list-inside mb-6 space-y-2 text-gray-700 dark:text-gray-300">
            {items.map((item, itemIndex) => (
              <li key={itemIndex}>{item.replace(/^-\s*/, '')}</li>
            ))}
          </ul>
        );
      }

      // Regular paragraph
      return (
        <p key={index} className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
          {para}
        </p>
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Blog not found'}
          </h2>
          <button
            onClick={() => navigate('/news-and-blogs')}
            className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to News & Blogs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419]">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1f2e] border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/news-and-blogs')}
            className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to News & Blogs
          </button>
        </div>
      </div>

      {/* Main Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Article Header */}
        <header className="mb-8">
          {/* Category */}
          <span className="inline-block text-sm px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full mb-4">
            {blog.category}
          </span>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            {blog.title}
          </h1>

          {/* Summary */}
          {blog.summary && (
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
              {blog.summary}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-6">
            <div className="flex items-center gap-1">
              <CalendarDaysIcon className="h-4 w-4" />
              <span>{new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              <span>{calculateReadingTime(blog.content)} min read</span>
            </div>
            <div className="flex items-center gap-1">
              <EyeIcon className="h-4 w-4" />
              <span>{blog.viewCount} views</span>
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              By {blog.author}
            </span>
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          >
            <ShareIcon className="h-4 w-4" />
            Share
          </button>
        </header>

        {/* Featured Image */}
        {blog.imageUrl && (
          <div className="mb-8">
            <img
              src={blog.imageUrl}
              alt={blog.title}
              className="w-full h-64 md:h-80 lg:h-96 object-cover rounded-xl"
            />
          </div>
        )}

        {/* Article Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
          {renderContent(blog.content)}
        </div>

        {/* Tags */}
        {blog.tags.length > 0 && (
          <div className="flex items-center gap-2 mb-8 flex-wrap pt-8 border-t border-gray-200 dark:border-gray-700">
            <TagIcon className="h-4 w-4 text-gray-400" />
            {blog.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </div>
  );
};

export default BlogDetailPage;
