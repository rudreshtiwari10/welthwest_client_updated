/**
 * News & Blog Service
 * - News: Fetched from external sources (no database storage)
 * - Blogs: Internal content management (database storage)
 */

import axios from 'axios';
import { API_URL } from './api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper function to convert camelCase to snake_case for backend
const toSnakeCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      acc[snakeKey] = toSnakeCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
};

// Helper function to convert snake_case to camelCase for frontend
const toCamelCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
};

// ============================================================================
// Types
// ============================================================================

export interface NewsItem {
  title: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
  publishedAt: string;
  category: string;
  imageUrl?: string;
}

export interface NewsResponse {
  success: boolean;
  data: NewsItem[];
  count: number;
  category: string;
  region: string;
  timestamp: string;
  disclaimer: string;
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  summary?: string;
  imageUrl?: string;
  status: 'draft' | 'published';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  likeCount: number;
}

export interface BlogsResponse {
  success: boolean;
  blogs: Blog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BlogResponse {
  success: boolean;
  blog: Blog;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

// ============================================================================
// Simple in-memory cache (survives page navigation, clears on tab close)
// ============================================================================
const _cache: Record<string, { data: any; expiry: number }> = {};

function getCached<T>(key: string): T | null {
  const entry = _cache[key];
  if (entry && Date.now() < entry.expiry) return entry.data as T;
  if (entry) delete _cache[key];
  return null;
}

function setCache(key: string, data: any, ttlMs: number) {
  _cache[key] = { data, expiry: Date.now() + ttlMs };
}

// Cache TTLs
const NEWS_CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const BLOGS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// News Service
// ============================================================================

class NewsBlogService {
  /**
   * Get news from external sources
   */
  async getNews(
    category: string = 'all',
    region: string = 'indian',
    limit: number = 50
  ): Promise<NewsResponse> {
    const cacheKey = `news_${category}_${region}_${limit}`;
    const cached = getCached<NewsResponse>(cacheKey);
    if (cached) return cached;

    try {
      const params = new URLSearchParams({
        category,
        region,
        limit: limit.toString(),
      });

      const response = await api.get(`/news?${params.toString()}`);
      setCache(cacheKey, response.data, NEWS_CACHE_TTL);
      return response.data;
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
  }

  /**
   * Search news articles
   */
  async searchNews(
    query: string,
    category: string = 'all',
    limit: number = 20
  ): Promise<NewsResponse> {
    try {
      const params = new URLSearchParams({
        q: query,
        category,
        limit: limit.toString(),
      });

      const response = await api.get(`/news/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error searching news:', error);
      throw error;
    }
  }

  /**
   * Get news categories
   */
  async getNewsCategories(): Promise<{ success: boolean; categories: Category[] }> {
    try {
      const response = await api.get('/news/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching news categories:', error);
      throw error;
    }
  }

  // ============================================================================
  // Blog Service (Public)
  // ============================================================================

  /**
   * Get published blogs
   */
  async getBlogs(
    page: number = 1,
    limit: number = 10,
    category?: string
  ): Promise<BlogsResponse> {
    const cacheKey = `blogs_${page}_${limit}_${category || 'all'}`;
    const cached = getCached<BlogsResponse>(cacheKey);
    if (cached) return cached;

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (category) {
        params.append('category', category);
      }

      const response = await api.get(`/blogs?${params.toString()}`);

      // Manually transform response to handle field name differences
      const data = response.data;
      const result = {
        success: data.success,
        blogs: data.blogs || [],
        total: data.total || 0,
        page: data.page || 1,
        limit: data.limit || 10,
        totalPages: data.totalPages || 0
      };
      setCache(cacheKey, result, BLOGS_CACHE_TTL);
      return result;
    } catch (error) {
      console.error('Error fetching blogs:', error);
      throw error;
    }
  }

  /**
   * Get blog by slug
   */
  async getBlogBySlug(slug: string): Promise<BlogResponse> {
    try {
      const response = await api.get(`/blogs/${slug}`);

      // Convert response back to camelCase
      const result = toCamelCase(response.data);
      return result;
    } catch (error) {
      console.error('Error fetching blog:', error);
      throw error;
    }
  }

  /**
   * Search blogs
   */
  async searchBlogs(
    query: string,
    page: number = 1,
    limit: number = 10
  ): Promise<BlogsResponse> {
    try {
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await api.get(`/blogs/search?${params.toString()}`);

      // Convert response back to camelCase
      const result = toCamelCase(response.data);
      return result;
    } catch (error) {
      console.error('Error searching blogs:', error);
      throw error;
    }
  }

  /**
   * Get blog categories
   */
  async getBlogCategories(): Promise<{ success: boolean; categories: string[] }> {
    try {
      const response = await api.get('/blogs/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching blog categories:', error);
      throw error;
    }
  }

  // ============================================================================
  // Blog Service (Admin)
  // ============================================================================

  /**
   * Create blog (admin only)
   */
  async createBlog(blogData: Partial<Blog>): Promise<BlogResponse> {
    try {
      // Convert camelCase to snake_case for backend
      const backendData = toSnakeCase(blogData);
      const response = await api.post('/blogs', backendData);

      // Convert response back to camelCase
      const result = toCamelCase(response.data);
      return result;
    } catch (error) {
      console.error('Error creating blog:', error);
      throw error;
    }
  }

  /**
   * Update blog (admin only)
   */
  async updateBlog(blogId: string, blogData: Partial<Blog>): Promise<BlogResponse> {
    try {
      // Convert camelCase to snake_case for backend
      const backendData = toSnakeCase(blogData);
      const response = await api.put(`/blogs/${blogId}`, backendData);

      // Convert response back to camelCase
      const result = toCamelCase(response.data);
      return result;
    } catch (error) {
      console.error('Error updating blog:', error);
      throw error;
    }
  }

  /**
   * Delete blog (admin only)
   */
  async deleteBlog(blogId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/blogs/${blogId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting blog:', error);
      throw error;
    }
  }

  /**
   * Get blog by ID (admin - can view drafts)
   */
  async getBlogById(blogId: string): Promise<BlogResponse> {
    try {
      const response = await api.get(`/blogs/${blogId}`);

      // Convert response back to camelCase
      const result = toCamelCase(response.data);
      return result;
    } catch (error) {
      console.error('Error fetching blog:', error);
      throw error;
    }
  }

  /**
   * Get all blogs including drafts (admin only)
   */
  async getAllBlogsAdmin(
    page: number = 1,
    limit: number = 10,
    status: string = 'all'
  ): Promise<BlogsResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status,
      });

      const response = await api.get(`/blogs?${params.toString()}`);

      // Convert response back to camelCase
      const result = toCamelCase(response.data);
      return result;
    } catch (error) {
      console.error('Error fetching blogs (admin):', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const newsBlogService = new NewsBlogService();
export default newsBlogService;
