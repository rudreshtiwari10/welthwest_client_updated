import axios from 'axios';
import { API_URL } from './api';

// Create axios instance for news service
const newsApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
newsApi.interceptors.request.use(
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

export interface Post {
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
  status: string;
  view_count: number;
  like_count: number;
  is_featured: boolean;
  type: 'news' | 'blog';
}

export interface PostsResponse {
  success: boolean;
  posts: Post[];
  total_count: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface PostResponse {
  success: boolean;
  post: Post;
}

export interface FeaturedPostsResponse {
  success: boolean;
  featured_posts: Post[];
}

export interface SearchResponse {
  success: boolean;
  posts: Post[];
  total_count: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface CreatePostData {
  title: string;
  content: string;
  author: string;
  category?: string;
  tags?: string[];
  image_url?: string;
  summary?: string;
}

class NewsService {
  /**
   * Get all news posts with pagination and filtering
   */
  async getNews(
    page: number = 1, 
    limit: number = 10, 
    category?: string, 
    featured?: boolean
  ): Promise<PostsResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (category) {
        params.append('category', category);
      }
      
      if (featured) {
        params.append('featured', 'true');
      }

      const response = await newsApi.get(`/news?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
  }

  /**
   * Get all blog posts with pagination and filtering
   */
  async getBlogs(
    page: number = 1, 
    limit: number = 10, 
    category?: string, 
    featured?: boolean
  ): Promise<PostsResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (category) {
        params.append('category', category);
      }
      
      if (featured) {
        params.append('featured', 'true');
      }

      const response = await newsApi.get(`/blogs?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching blogs:', error);
      throw error;
    }
  }

  /**
   * Get a specific news post by ID
   */
  async getNewsPost(postId: string): Promise<PostResponse> {
    try {
      const response = await newsApi.get(`/news/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching news post:', error);
      throw error;
    }
  }

  /**
   * Get a specific blog post by ID
   */
  async getBlogPost(postId: string): Promise<PostResponse> {
    try {
      const response = await newsApi.get(`/blogs/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching blog post:', error);
      throw error;
    }
  }

  /**
   * Get featured posts from both news and blogs
   */
  async getFeaturedPosts(limit: number = 5): Promise<FeaturedPostsResponse> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
      });

      const response = await newsApi.get(`/featured-posts?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching featured posts:', error);
      throw error;
    }
  }

  /**
   * Search posts by title, content, or tags
   */
  async searchPosts(
    query: string,
    type: 'all' | 'news' | 'blog' = 'all',
    page: number = 1,
    limit: number = 10
  ): Promise<SearchResponse> {
    try {
      const params = new URLSearchParams({
        q: query,
        type: type,
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await newsApi.get(`/search-posts?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error searching posts:', error);
      throw error;
    }
  }

  /**
   * Create a new news post (admin only)
   */
  async createNewsPost(postData: CreatePostData): Promise<PostResponse> {
    try {
      const response = await newsApi.post('/news', postData);
      return response.data;
    } catch (error) {
      console.error('Error creating news post:', error);
      throw error;
    }
  }

  /**
   * Create a new blog post (admin only)
   */
  async createBlogPost(postData: CreatePostData): Promise<PostResponse> {
    try {
      const response = await newsApi.post('/blogs', postData);
      return response.data;
    } catch (error) {
      console.error('Error creating blog post:', error);
      throw error;
    }
  }

  /**
   * Get post by ID regardless of type
   */
  async getPostById(postId: string, type: 'news' | 'blog'): Promise<PostResponse> {
    try {
      if (type === 'news') {
        return await this.getNewsPost(postId);
      } else {
        return await this.getBlogPost(postId);
      }
    } catch (error) {
      console.error('Error fetching post by ID:', error);
      throw error;
    }
  }

  /**
   * Get posts by category
   */
  async getPostsByCategory(
    category: string, 
    type: 'all' | 'news' | 'blog' = 'all',
    page: number = 1,
    limit: number = 10
  ): Promise<PostsResponse> {
    try {
      if (type === 'news') {
        return await this.getNews(page, limit, category);
      } else if (type === 'blog') {
        return await this.getBlogs(page, limit, category);
      } else {
        // For 'all', we need to fetch both and combine
        const [newsResponse, blogsResponse] = await Promise.all([
          this.getNews(1, Math.ceil(limit / 2), category),
          this.getBlogs(1, Math.ceil(limit / 2), category)
        ]);

        if (newsResponse.success && blogsResponse.success) {
          const combinedPosts = [...newsResponse.posts, ...blogsResponse.posts];
          combinedPosts.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

          return {
            success: true,
            posts: combinedPosts.slice(0, limit),
            total_count: newsResponse.total_count + blogsResponse.total_count,
            page: page,
            limit: limit,
            total_pages: Math.ceil((newsResponse.total_count + blogsResponse.total_count) / limit)
          };
        }

        return {
          success: false,
          posts: [],
          total_count: 0,
          page: page,
          limit: limit,
          total_pages: 0
        };
      }
    } catch (error) {
      console.error('Error fetching posts by category:', error);
      throw error;
    }
  }

  /**
   * Get recent posts
   */
  async getRecentPosts(limit: number = 5): Promise<PostsResponse> {
    try {
      const [newsResponse, blogsResponse] = await Promise.all([
        this.getNews(1, Math.ceil(limit / 2)),
        this.getBlogs(1, Math.ceil(limit / 2))
      ]);

      if (newsResponse.success && blogsResponse.success) {
        const combinedPosts = [...newsResponse.posts, ...blogsResponse.posts];
        combinedPosts.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        return {
          success: true,
          posts: combinedPosts.slice(0, limit),
          total_count: combinedPosts.length,
          page: 1,
          limit: limit,
          total_pages: 1
        };
      }

      return {
        success: false,
        posts: [],
        total_count: 0,
        page: 1,
        limit: limit,
        total_pages: 0
      };
    } catch (error) {
      console.error('Error fetching recent posts:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const newsService = new NewsService();
export default newsService;