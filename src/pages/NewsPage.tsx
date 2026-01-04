import React, { useState, useEffect } from 'react';
import {
  NewspaperIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import newsBlogService, { NewsItem } from '../services/newsBlogService';

const NewsPage: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState(false);

  const categories = [
    { id: 'all', name: 'All News', icon: '📰' },
    { id: 'indian_markets', name: 'Indian Markets', icon: '🇮🇳' },
    { id: 'global_markets', name: 'Global Markets', icon: '🌍' },
    { id: 'nse', name: 'NSE', icon: '🏢' },
    { id: 'bse', name: 'BSE', icon: '🏢' },
    { id: 'ipos', name: 'IPOs', icon: '🚀' },
    { id: 'economy', name: 'Economy', icon: '💰' },
    { id: 'banking', name: 'Banking & Finance', icon: '🏦' },
    { id: 'corporate', name: 'Corporate Results', icon: '📊' }
  ];

  useEffect(() => {
    fetchNews();
  }, [selectedCategory]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await newsBlogService.getNews(selectedCategory, 'indian', 50);

      if (response.success) {
        setNews(response.data);
      } else {
        setError('Failed to fetch news');
      }
    } catch (err: any) {
      console.error('Error fetching news:', err);
      setError(err.response?.data?.error || 'Failed to load news. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setSearchMode(false);
      fetchNews();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSearchMode(true);

      const response = await newsBlogService.searchNews(searchQuery, selectedCategory, 30);

      if (response.success) {
        setNews(response.data);
      }
    } catch (err: any) {
      console.error('Error searching news:', err);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419]">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-4">
            <NewspaperIcon className="h-10 w-10 mr-3" />
            <h1 className="text-4xl font-bold">Financial News</h1>
          </div>
          <p className="text-lg opacity-90 mb-6">
            Latest market news from trusted sources - Updated in real-time
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search news articles..."
                className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-[#1a1f2e] border-0 focus:ring-2 focus:ring-white placeholder-gray-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Disclaimer */}
          <p className="text-xs opacity-75 mt-4">
            News content is aggregated from publicly available sources. WelthWest does not claim ownership.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="sticky top-16 z-10 bg-white dark:bg-[#1a1f2e] shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-hide gap-2 py-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSearchMode(false);
                  setSearchQuery('');
                }}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {searchMode && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-gray-700 dark:text-gray-300">
              Search results for "<span className="font-semibold">{searchQuery}</span>"
              <span className="ml-2 text-sm text-gray-500">({news.length} results)</span>
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchMode(false);
                fetchNews();
              }}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* News Grid */}
        {!loading && !error && news.length > 0 && (
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
        )}

        {/* No Results */}
        {!loading && !error && news.length === 0 && (
          <div className="text-center py-16">
            <NewspaperIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No news available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchMode
                ? 'Try adjusting your search terms or browse other categories.'
                : 'Check back soon for the latest updates.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
