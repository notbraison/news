import { config } from './config';
import { authService } from './auth';

// API Response interfaces
export interface ApiPost {
  id: number;
  title: string;
  slug: string;
  body: string;
  status: 'draft' | 'published' | 'archived';
  published_at: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    fname: string;
    lname: string;
  };
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  media: Array<{
    id: number;
    url: string;
    alt_text: string;
    type: string;
  }>;
}

export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Transformed interfaces for frontend use
export interface Article {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  category: string;
  imageUrl: string;
  readTime: number;
  tags: string[];
  slug: string;
  status: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

// Comment interfaces
export interface ApiComment {
  id: number;
  post_id: number;
  user_id: number | null;
  body: string;
  parent_comment_id: number | null;
  status: 'pending' | 'approved' | 'spam';
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    fname: string;
    lname: string;
  };
  replies?: ApiComment[];
}

export interface Comment {
  id: number;
  postId: number;
  userId: number | null;
  body: string;
  parentCommentId: number | null;
  status: 'pending' | 'approved' | 'spam';
  createdAt: string;
  updatedAt: string;
  author: string;
  replies: Comment[];
}

// API service class
class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.api.baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Get token from authService
    const token = authService.getToken();
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  // Transform API post to frontend article format
  private transformPost(post: ApiPost): Article {
    // Clean the body content for excerpt (remove image markers)
    const cleanBody = post.body.replace(/\[IMAGE: [^\]]+\]/g, '').trim();
    const excerpt = cleanBody.length > 200 
      ? cleanBody.slice(0, 200) + '...' 
      : cleanBody;

    const readTime = Math.ceil(post.body.split(' ').length / 200);
    
    const author = post.user 
      ? `${post.user.fname || ''} ${post.user.lname || ''}`.trim() || 'Unknown'
      : 'Unknown';

    const category = post.categories?.[0]?.name || 'General';
    
    const imageUrl = post.media?.find(m => m.type === 'image')?.url || '';

    const tags = post.tags?.map(t => t.name) || [];

    return {
      id: post.id,
      title: post.title,
      excerpt,
      content: post.body,
      author,
      publishedAt: post.published_at || post.created_at,
      category,
      imageUrl,
      readTime,
      tags,
      slug: post.slug,
      status: post.status,
    };
  }

  // Get all published posts
  async getPosts(): Promise<Article[]> {
    try {
      const posts: ApiPost[] = await this.request<ApiPost[]>('/posts');
      return posts
        .filter(post => post.status === 'published')
        .map(post => this.transformPost(post));
    } catch (error) {
      return [];
    }
  }

  // Get a single post by ID
  async getPost(id: string | number): Promise<Article | null> {
    try {
      const post: ApiPost = await this.request<ApiPost>(`/posts/${id}`);
      return this.transformPost(post);
    } catch (error) {
      return null;
    }
  }

  // Get a single post by slug
  async getPostBySlug(slug: string): Promise<Article | null> {
    try {
      const post: ApiPost = await this.request<ApiPost>(`/posts/slug/${slug}`);
      return this.transformPost(post);
    } catch (error) {
      return null;
    }
  }

  // Get posts by category slug
  async getPostsByCategory(slug: string): Promise<Article[]> {
    try {
      const posts: ApiPost[] = await this.request<ApiPost[]>(`/categories/${slug}/posts`);
      return posts
        .filter(post => post.status === 'published')
        .map(post => this.transformPost(post));
    } catch (error) {
      return [];
    }
  }

  // Get all categories
  async getCategories(): Promise<Category[]> {
    try {
      const categories: ApiCategory[] = await this.request<ApiCategory[]>('/categories');
      return categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
      }));
    } catch (error) {
      return [];
    }
  }

  // Search posts (if backend supports it)
  async searchPosts(query: string): Promise<Article[]> {
    try {
      const posts: ApiPost[] = await this.request<ApiPost[]>(`/posts?search=${encodeURIComponent(query)}`);
      return posts
        .filter(post => post.status === 'published')
        .map(post => this.transformPost(post));
    } catch (error) {
      return [];
    }
  }

  // Get trending posts (most recent published posts)
  async getTrendingPosts(limit: number = 5): Promise<Article[]> {
    try {
      const posts: ApiPost[] = await this.request<ApiPost[]>(`/posts?limit=${limit}`);
      return posts
        .filter(post => post.status === 'published')
        .slice(0, limit)
        .map(post => this.transformPost(post));
    } catch (error) {
      return [];
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.request<{ status: string }>('/health');
      return response.status === 'healthy';
    } catch (error) {
      return false;
    }
  }

  // Transform API comment to frontend comment format
  private transformComment(comment: ApiComment): Comment {
    const author = comment.user 
      ? `${comment.user.fname || ''} ${comment.user.lname || ''}`.trim() || 'Anonymous'
      : 'Anonymous';

    const replies = comment.replies?.map(reply => this.transformComment(reply)) || [];

    return {
      id: comment.id,
      postId: comment.post_id,
      userId: comment.user_id,
      body: comment.body,
      parentCommentId: comment.parent_comment_id,
      status: comment.status,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      author,
      replies,
    };
  }

  // Get comments for a post
  async getComments(postId: number): Promise<Comment[]> {
    try {
      const comments: ApiComment[] = await this.request<ApiComment[]>(`/posts/${postId}/comments`);
      const transformedComments = comments.map(comment => this.transformComment(comment));
      return transformedComments;
    } catch (error) {
      return [];
    }
  }

  // Create a new comment
  async createComment(data: {
    postId: number;
    body: string;
    parentCommentId?: number;
  }): Promise<Comment | null> {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const requestBody = {
        post_id: data.postId,
        body: data.body,
        parent_comment_id: data.parentCommentId || null,
      };

      const comment: ApiComment = await this.request<ApiComment>('/comments', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      return this.transformComment(comment);
    } catch (error) {
      return null;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService(); 