import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  EyeIcon,
  ShareIcon,
  BookmarkIcon,
  TagIcon,
  ClockIcon,
  NewspaperIcon,
  PencilSquareIcon,
  FireIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { 
  BookmarkIcon as BookmarkSolidIcon, 
  ShareIcon as ShareSolidIcon 
} from '@heroicons/react/24/solid';
import { useTheme } from '../contexts/ThemeContext';
import newsService from '../services/newsService';

interface Post {
  _id: string;
  title: string;
  content: string;
  summary: string;
  author: string;
  category: string;
  tags: string[];
  image_url?: string;
  created_at: string;
  updated_at: string;
  view_count: number;
  like_count: number;
  is_featured: boolean;
  type: 'news' | 'blog';
}

const NewsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isShared, setIsShared] = useState(false);

  // Extract type from URL path using window.location
  const type = window.location.pathname.startsWith('/news/') ? 'news' : 'blog';

  useEffect(() => {
    if (id && (type === 'news' || type === 'blog')) {
      fetchPost();
    } else {
      setError('Invalid post type or ID');
      setLoading(false);
    }
  }, [id, type]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await newsService.getPostById(id!, type as 'news' | 'blog');
      
      if (response.success) {
        setPost(response.post);
        // Fetch related posts
        await fetchRelatedPosts(response.post);
      } else {
        setError('Post not found');
      }
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async (currentPost: Post) => {
    try {
      const response = currentPost.type === 'news' 
        ? await newsService.getNews(1, 4, currentPost.category)
        : await newsService.getBlogs(1, 4, currentPost.category);
      
      if (response.success) {
        // Filter out current post and limit to 3
        const filtered = response.posts.filter(p => p._id !== currentPost._id).slice(0, 3);
        setRelatedPosts(filtered);
      }
    } catch (err) {
      console.error('Error fetching related posts:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime;
  };

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.summary,
          url: window.location.href,
        });
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
      } catch (err) {
        console.log('Share failed:', err);
        fallbackShare();
      }
    } else {
      fallbackShare();
    }
  };

  const fallbackShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsShared(true);
    setTimeout(() => setIsShared(false), 2000);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // Here you would typically save to localStorage or make API call
  };

  const renderContent = (content: string) => {
    // Split content by paragraphs and render with proper spacing
    const paragraphs = content.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Check if paragraph is a heading (starts with **)
      if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
        const headingText = paragraph.replace(/\*\*/g, '');
        return (
          <h3 key={index} className="text-xl font-bold text-gray-900 dark:text-white mb-4 mt-6">
            {headingText}
          </h3>
        );
      }
      
      // Check if paragraph is a list item (starts with -)
      if (paragraph.includes('- ')) {
        const items = paragraph.split('\n').filter(line => line.trim().startsWith('-'));
        return (
          <ul key={index} className="list-disc list-inside mb-6 space-y-2 text-gray-700 dark:text-gray-300">
            {items.map((item, itemIndex) => (
              <li key={itemIndex}>{item.replace('- ', '')}</li>
            ))}
          </ul>
        );
      }
      
      // Regular paragraph
      return (
        <p key={index} className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
          {paragraph}
        </p>
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-purple-500"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <NewspaperIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {error || 'Post not found'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The content you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/news-and-blogs')}
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to News & Blogs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] transition-colors">
      {/* Header with back button */}
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

      {/* Main content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Article header */}
        <header className="mb-8">
          {/* Post type and category */}
          <div className="flex items-center gap-2 mb-4">
            {post.type === 'news' ? (
              <NewspaperIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            ) : (
              <PencilSquareIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            )}
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300 capitalize">
              {post.type}
            </span>
            <span className="text-sm px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
              {post.category}
            </span>
            {post.is_featured && (
              <>
                <FireIcon className="h-4 w-4 text-orange-500" />
                <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                  Featured
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            {post.title}
          </h1>

          {/* Meta information */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-6">
            <div className="flex items-center gap-1">
              <CalendarDaysIcon className="h-4 w-4" />
              <span>{formatDate(post.created_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              <span>{calculateReadingTime(post.content)} min read</span>
            </div>
            <div className="flex items-center gap-1">
              <EyeIcon className="h-4 w-4" />
              <span>{post.view_count} views</span>
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              By {post.author}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handleBookmark}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              {isBookmarked ? (
                <BookmarkSolidIcon className="h-4 w-4 text-blue-600 dark:text-purple-400" />
              ) : (
                <BookmarkIcon className="h-4 w-4" />
              )}
              Bookmark
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              {isShared ? (
                <ShareSolidIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <ShareIcon className="h-4 w-4" />
              )}
              {isShared ? 'Copied!' : 'Share'}
            </button>
          </div>
        </header>

        {/* Featured image */}
        {post.image_url && (
          <div className="mb-8">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-64 md:h-80 lg:h-96 object-cover rounded-xl"
            />
          </div>
        )}

        {/* Article content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
          {renderContent(post.content)}
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex items-center gap-2 mb-8 flex-wrap">
            <TagIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            {post.tags.map((tag, index) => (
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

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-white dark:bg-[#1a1f2e] py-12 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Related {post.type === 'news' ? 'News' : 'Blogs'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <div
                  key={relatedPost._id}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/${relatedPost.type}/${relatedPost._id}`)}
                >
                  <div className="bg-gray-50 dark:bg-[#0f1419] rounded-xl p-6 hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      {relatedPost.type === 'news' ? (
                        <NewspaperIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <PencilSquareIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {relatedPost.type}
                      </span>
                      {relatedPost.is_featured && (
                        <SparklesIcon className="h-3 w-3 text-yellow-500" />
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-purple-400 transition-colors">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                      {relatedPost.summary}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatDate(relatedPost.created_at)}</span>
                      <div className="flex items-center gap-1">
                        <EyeIcon className="h-3 w-3" />
                        <span>{relatedPost.view_count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default NewsDetailPage;