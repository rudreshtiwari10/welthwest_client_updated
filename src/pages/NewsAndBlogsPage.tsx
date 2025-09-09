import React, { useState, useEffect } from 'react';
import { 
  NewspaperIcon, 
  PencilSquareIcon, 
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  EyeIcon,
  TagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FireIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
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

interface PostsResponse {
  success: boolean;
  posts: Post[];
  total_count: number;
  page: number;
  limit: number;
  total_pages: number;
}

const NewsAndBlogsPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'all' | 'news' | 'blogs'>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const categories = {
    news: ['General', 'Market News', 'Economic Updates', 'Technology', 'Global Markets'],
    blogs: ['Finance', 'Investment Tips', 'AI & Technology', 'Market Analysis', 'Education']
  };

  useEffect(() => {
    fetchFeaturedPosts();
    fetchPosts();
  }, [activeTab, currentPage, selectedCategory]);

  const fetchFeaturedPosts = async () => {
    try {
      const response = await newsService.getFeaturedPosts(4);
      if (response.success) {
        setFeaturedPosts(response.featured_posts || []);
      }
    } catch (error) {
      console.error('Error fetching featured posts:', error);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let response: PostsResponse | undefined;
      
      if (searchQuery.trim()) {
        response = await newsService.searchPosts(
          searchQuery,
          activeTab === 'all' ? 'all' : activeTab === 'news' ? 'news' : 'blog',
          currentPage,
          12
        );
      } else if (activeTab === 'news') {
        response = await newsService.getNews(currentPage, 12, selectedCategory);
      } else if (activeTab === 'blogs') {
        response = await newsService.getBlogs(currentPage, 12, selectedCategory);
      } else {
        // Fetch both news and blogs for 'all' tab
        const [newsResponse, blogsResponse] = await Promise.all([
          newsService.getNews(1, 6, selectedCategory),
          newsService.getBlogs(1, 6, selectedCategory)
        ]);
        
        if (newsResponse.success && blogsResponse.success) {
          const combinedPosts = [...newsResponse.posts, ...blogsResponse.posts];
          combinedPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          
          setPosts(combinedPosts);
          setTotalPages(1);
        } else {
          setPosts([]);
          setTotalPages(1);
        }
        setLoading(false);
        return;
      }
      
      if (response?.success) {
        setPosts(response.posts || []);
        setTotalPages(response.total_pages || 1);
      } else {
        setPosts([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPosts();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.substr(0, maxLength) + '...';
  };

  const FeaturedPostCard = ({ post }: { post: Post }) => (
    <div 
      className="relative group overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 via-blue-600 to-teal-500 p-1 cursor-pointer transform transition-all duration-200 hover:scale-105"
      onClick={() => navigate(`/${post.type}/${post._id}`)}
    >
      <div className="relative h-48 bg-white dark:bg-[#1a1f2e] rounded-lg p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            {post.type === 'news' ? (
              <NewspaperIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            ) : (
              <PencilSquareIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            )}
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300 capitalize">
              {post.type}
            </span>
            <FireIcon className="h-4 w-4 text-orange-500" />
          </div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
            {post.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {post.summary}
          </p>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(post.created_at)}</span>
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <EyeIcon className="h-3 w-3" />
            <span>{post.view_count}</span>
          </div>
        </div>
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowRightIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </div>
      </div>
    </div>
  );

  const PostCard = ({ post }: { post: Post }) => (
    <div 
      className="group bg-white dark:bg-[#1a1f2e] rounded-xl shadow-sm hover:shadow-lg dark:shadow-gray-900/50 transition-all duration-200 border border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer transform hover:scale-105"
      onClick={() => navigate(`/${post.type}/${post._id}`)}
    >
      {post.image_url && (
        <div className="h-48 overflow-hidden">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
      )}
      <div className="p-6 relative">
        <div className="flex items-center gap-2 mb-3">
          {post.type === 'news' ? (
            <NewspaperIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          ) : (
            <PencilSquareIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          )}
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300 capitalize">
            {post.type}
          </span>
          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
            {post.category}
          </span>
          {post.is_featured && (
            <SparklesIcon className="h-4 w-4 text-yellow-500" />
          )}
        </div>
        
        <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
          {post.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
          {post.summary || truncateContent(post.content)}
        </p>
        
        {post.tags.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <TagIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <div className="flex gap-1 flex-wrap">
              {post.tags.slice(0, 3).map((tag, index) => (
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
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <CalendarDaysIcon className="h-4 w-4" />
              <span>{formatDate(post.created_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              <EyeIcon className="h-4 w-4" />
              <span>{post.view_count}</span>
            </div>
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            By {post.author}
          </span>
        </div>

        {/* Hover Arrow */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowRightIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </div>
      </div>
    </div>
  );

  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-lg bg-white dark:bg-[#1a1f2e] border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2f3e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const pageNumber = i + Math.max(1, currentPage - 2);
          if (pageNumber > totalPages) return null;
          
          return (
            <button
              key={pageNumber}
              onClick={() => setCurrentPage(pageNumber)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === pageNumber
                  ? 'bg-blue-600 dark:bg-purple-600 text-white'
                  : 'bg-white dark:bg-[#1a1f2e] border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2f3e]'
              }`}
            >
              {pageNumber}
            </button>
          );
        })}
        
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg bg-white dark:bg-[#1a1f2e] border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2f3e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] transition-colors">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            News & Insights
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
            Stay updated with the latest financial news, AI insights, and expert analysis 
            to make informed investment decisions
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for news, blogs, or topics..."
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 dark:text-white bg-white dark:bg-[#1a1f2e] border-0 focus:ring-2 focus:ring-white dark:focus:ring-purple-500 shadow-lg placeholder-gray-500 dark:placeholder-gray-400"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Posts */}
        {featuredPosts.length > 0 && !searchQuery && (
          <section className="mb-16">
            <div className="flex items-center gap-2 mb-8">
              <FireIcon className="h-6 w-6 text-orange-500" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Featured Posts</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredPosts.map((post) => (
                <FeaturedPostCard key={post._id} post={post} />
              ))}
            </div>
          </section>
        )}

        {/* Tabs and Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div className="flex gap-1 bg-gray-100 dark:bg-[#1a1f2e] p-1 rounded-lg">
            <button
              onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-[#2a2f3e] text-blue-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              All Posts
            </button>
            <button
              onClick={() => { setActiveTab('news'); setCurrentPage(1); }}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'news'
                  ? 'bg-white dark:bg-[#2a2f3e] text-blue-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              News
            </button>
            <button
              onClick={() => { setActiveTab('blogs'); setCurrentPage(1); }}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'blogs'
                  ? 'bg-white dark:bg-[#2a2f3e] text-blue-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Blogs
            </button>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1a1f2e] text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-600 dark:focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {(activeTab === 'news' ? categories.news : activeTab === 'blogs' ? categories.blogs : [...categories.news, ...categories.blogs])
              .map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))
            }
          </select>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-purple-500"></div>
          </div>
        ) : posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
            <Pagination />
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              {searchQuery ? (
                <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
              ) : (
                <NewspaperIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No search results found' : 'No posts available'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              {searchQuery 
                ? 'Try adjusting your search terms or browse our categories.'
                : 'Check back soon for the latest news and insights.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsAndBlogsPage;