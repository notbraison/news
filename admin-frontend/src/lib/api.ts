import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL_LOCAL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Dashboard API endpoints
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentArticles: (limit = 5) => api.get(`/dashboard/recent-articles?limit=${limit}`),
};

// Posts API endpoints
export const postsApi = {
  getAll: () => api.get('/posts'),
  getById: (id: string) => api.get(`/posts/${id}`),
  create: (data: any) => api.post('/posts', data),
  update: (id: string, data: any) => api.put(`/posts/${id}`, data),
  delete: (id: string) => api.delete(`/posts/${id}`),
  getRevisions: (id: string) => api.get(`/posts/${id}/revisions`),
  getComments: (id: string) => api.get(`/posts/${id}/comments`),
  getViews: (id: string) => api.get(`/post/${id}`), // Get post stats
  attachCategories: (id: string, categoryIds: number[]) => api.post(`/post-categories/${id}/attach`, { category_ids: categoryIds }),
  detachCategories: (id: string, categoryIds: number[]) => api.post(`/post-categories/${id}/detach`, { category_ids: categoryIds }),
  syncCategories: (id: string, categoryIds: number[]) => api.put(`/post-categories/${id}`, { category_ids: categoryIds }),
  getPostCategories: (id: string) => api.get(`/post-categories/${id}`),
  attachTags: (id: string, tagIds: number[]) => api.post(`/post-tags`, { post_id: id, tag_ids: tagIds }),
  detachTags: (id: string, tagIds: number[]) => api.delete(`/post-tags/${id}`, { data: { tag_ids: tagIds } }),
  syncTags: (id: string, tagIds: number[]) => api.put(`/post-tags/${id}`, { tag_ids: tagIds }),
};

// Analytics API endpoints
export const analyticsApi = {
  getPostStats: (id: string) => api.get(`/post/${id}`),
  getTopPosts: (limit: number = 10) => api.get(`/top-posts?limit=${limit}`),
  getViewsOverTime: (id: string) => api.get(`/views-over-time/${id}`),
  getTotalViewsOverTime: () => api.get('/total-views-over-time'),
};

// Comments API endpoints
export const commentsApi = {
  getAll: () => api.get('/comments'),
  getById: (id: string) => api.get(`/comments/${id}`),
  update: (id: string, data: any) => api.put(`/comments/${id}`, data),
  delete: (id: string) => api.delete(`/comments/${id}`),
  approve: (id: string) => api.patch(`/comments/${id}/approve`),
  markSpam: (id: string) => api.patch(`/comments/${id}/mark-spam`),
  getByPost: (postId: string) => api.get(`/posts/${postId}/comments`),
};

// Media API endpoints
export const mediaApi = {
  create: (data: {
    post_id: number;
    type: string;
    subtype?: string;
    url: string;
    alt_text?: string;
    order?: number;
  }) => api.post('/media', data),
  
  createMultiple: (data: {
    post_id: number;
    images: Array<{
      url: string;
      type: string;
      subtype?: string;
      alt_text?: string;
      order?: number;
    }>;
  }) => api.post('/media/multiple', data),
  
  updateOrder: (data: {
    media_items: Array<{
      id: number;
      order: number;
    }>;
  }) => api.put('/media/order', data),
  
  getByPost: (postId: string) => api.get(`/posts/${postId}/media`),
  
  delete: (id: string) => api.delete(`/media/${id}`),
  deleteByUrl: (url: string) => api.delete(`/media/by-url`, { params: { url } }),
};

// Categories API endpoints
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getById: (id: string) => api.get(`/categories/${id}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Tags API endpoints
export const tagsApi = {
  getAll: () => api.get('/tags'),
  getById: (id: string) => api.get(`/tags/${id}`),
  create: (data: any) => api.post('/tags', data),
  update: (id: string, data: any) => api.put(`/tags/${id}`, data),
  delete: (id: string) => api.delete(`/tags/${id}`),
};

// Users API endpoints
export const usersApi = {
  getAll: () => api.get('/users'),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// Profile API endpoints
export const profileApi = {
  update: (data: {
    fname?: string;
    lname?: string;
    email?: string;
    number?: string;
    current_password?: string;
    new_password?: string;
    new_password_confirmation?: string;
  }) => api.put('/me', data),
};

export default api; 


 