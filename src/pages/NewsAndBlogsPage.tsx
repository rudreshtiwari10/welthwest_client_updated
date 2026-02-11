import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  NewspaperIcon,
  PencilSquareIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CalendarDaysIcon,
  EyeIcon,
  TagIcon,
  ArrowTopRightOnSquareIcon,
  PlusIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import newsBlogService, { NewsItem, Blog } from '../services/newsBlogService';

const NewsAndBlogsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'news' | 'blogs'>('news');

  // News state
  const [news, setNews] = useState<NewsItem[]>([]);
  const [allNews, setAllNews] = useState<NewsItem[]>([]); // Store all news for filtering
  const [newsLoading, setNewsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Blogs state
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [allBlogs, setAllBlogs] = useState<Blog[]>([]); // Store all blogs for filtering
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = user?.role === 'admin' || user?.role === 'developer';

  const newsCategories = [
    { id: 'all', name: 'All News', icon: '📰' },
    { id: 'indian_markets', name: 'Indian Markets', icon: '🇮🇳' },
    { id: 'global_markets', name: 'Global Markets', icon: '🌍' },
    { id: 'nse', name: 'NSE', icon: '🏢' },
    { id: 'bse', name: 'BSE', icon: '🏢' },
    { id: 'ipos', name: 'IPOs', icon: '🚀' },
    { id: 'economy', name: 'Economy', icon: '💰' },
    { id: 'banking', name: 'Banking', icon: '🏦' }
  ];

  useEffect(() => {
    if (activeTab === 'news') {
      fetchNews();
    } else {
      fetchBlogs();
    }
  }, [activeTab, selectedCategory, currentPage]);

  const fetchNews = async () => {
    try {
      setNewsLoading(true);
      const response = await newsBlogService.getNews(selectedCategory, 'indian', 30);
      if (response.success) {
        setAllNews(response.data); // Store all news
        setNews(response.data); // Set initial display
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setNewsLoading(false);
    }
  };

  const fetchBlogs = async () => {
    try {
      setBlogsLoading(true);
      const response = await newsBlogService.getBlogs(currentPage, 9);
      if (response.success) {
        console.log('Fetched blogs:', response.blogs); // Debug log
        // Ensure all blogs have a slug (use _id as fallback)
        const blogsWithSlug = response.blogs.map(blog => ({
          ...blog,
          slug: blog.slug || blog._id // Fallback to _id if slug is missing
        }));
        setAllBlogs(blogsWithSlug); // Store all blogs
        setBlogs(blogsWithSlug); // Set initial display
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setBlogsLoading(false);
    }
  };

  // Real-time search/filter function
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) {
      // If search is empty, show all items
      setNews(allNews || []);
      setBlogs(allBlogs || []);
      return;
    }

    if (activeTab === 'news') {
      // Filter news by title, summary, category, or source name
      const filtered = (allNews || []).filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.sourceName.toLowerCase().includes(query)
      );
      setNews(filtered);
    } else {
      // Filter blogs by title, summary, content, category, tags, or author
      const filtered = (allBlogs || []).filter(blog =>
        blog.title.toLowerCase().includes(query) ||
        (blog.summary && blog.summary.toLowerCase().includes(query)) ||
        blog.content.toLowerCase().includes(query) ||
        blog.category.toLowerCase().includes(query) ||
        blog.author.toLowerCase().includes(query) ||
        blog.tags.some(tag => tag.toLowerCase().includes(query))
      );
      setBlogs(filtered);
    }
  }, [searchQuery, allNews, allBlogs, activeTab]);

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419]">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center mb-2">
                <NewspaperIcon className="h-10 w-10 mr-3" />
                <h1 className="text-4xl font-bold">News & Insights</h1>
              </div>
              <p className="text-lg opacity-90">
                Latest market news and expert analysis from WelthWest
              </p>
            </div>
            {isAdmin && activeTab === 'blogs' && (
              <button
                onClick={() => navigate('/blog-editor')}
                className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                <PlusIcon className="h-5 w-5" />
                New Blog
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mb-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab} by title, category, tags...`}
                className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-[#1a1f2e] border-0 focus:ring-2 focus:ring-white placeholder-gray-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveTab('news');
                setSearchQuery('');
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'news'
                  ? 'bg-white text-blue-600 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <NewspaperIcon className="h-5 w-5" />
              News
            </button>
            <button
              onClick={() => {
                setActiveTab('blogs');
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'blogs'
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <PencilSquareIcon className="h-5 w-5" />
              Blogs
            </button>
          </div>

          {/* Disclaimer for News */}
          {activeTab === 'news' && (
            <p className="text-xs opacity-75 mt-4">
              News content is aggregated from publicly available sources. WelthWest does not claim ownership.
            </p>
          )}
        </div>
      </div>

      {/* Category Tabs (News only) */}
      {activeTab === 'news' && (
        <div className="sticky top-16 z-10 bg-white dark:bg-[#1a1f2e] shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex overflow-x-auto scrollbar-hide gap-2 py-4">
              {newsCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Results Counter */}
        {searchQuery && !newsLoading && !blogsLoading && (
          <div className="mb-4 text-gray-600 dark:text-gray-400">
            Found {activeTab === 'news' ? (news?.length || 0) : (blogs?.length || 0)} {activeTab === 'news' ? 'news articles' : 'blog posts'} matching "{searchQuery}"
          </div>
        )}

        {/* Loading */}
        {(newsLoading || blogsLoading) && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* News Grid */}
        {activeTab === 'news' && !newsLoading && (
          <>
            {news && news.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((item, index) => (
                  <a
                    key={index}
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white dark:bg-[#1a1f2e] rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    {item.imageUrl && (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                          {item.category}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <ClockIcon className="h-3 w-3" />
                          <span>{formatTimeAgo(item.publishedAt)}</span>
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                        {item.summary}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {item.sourceName}
                        </span>
                        <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <NewspaperIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No news available
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Check back soon for the latest updates.
                </p>
              </div>
            )}
          </>
        )}

        {/* Blogs Grid */}
        {activeTab === 'blogs' && !blogsLoading && (
          <>
            {blogs && blogs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {blogs.map((blog) => (
                    <div
                      key={blog._id}
                      onClick={() => {
                        const blogSlug = blog.slug || blog._id;
                        console.log('Navigating to blog:', { slug: blog.slug, _id: blog._id, using: blogSlug });
                        navigate(`/blog/${blogSlug}`);
                      }}
                      className="group bg-white dark:bg-[#1a1f2e] rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer"
                    >
                      {blog.imageUrl && (
                        <div className="h-48 overflow-hidden">
                          <img
                            src={blog.imageUrl}
                            alt={blog.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                            {blog.category}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <ClockIcon className="h-3 w-3" />
                            <span>{calculateReadingTime(blog.content)} min read</span>
                          </div>
                        </div>
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                          {blog.title}
                        </h3>
                        {blog.summary && (
                          <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                            {blog.summary}
                          </p>
                        )}
                        {blog.tags.length > 0 && (
                          <div className="flex items-center gap-2 mb-4">
                            <TagIcon className="h-4 w-4 text-gray-400" />
                            <div className="flex gap-1 flex-wrap">
                              {blog.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <CalendarDaysIcon className="h-4 w-4" />
                            <span>{new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <EyeIcon className="h-4 w-4" />
                            <span>{blog.viewCount}</span>
                          </div>
                        </div>
                        <div className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                          By {blog.author}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white dark:bg-[#1a1f2e] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-gray-700 dark:text-gray-300">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white dark:bg-[#1a1f2e] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <PencilSquareIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No blog posts found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Check back soon for new insights.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NewsAndBlogsPage;
