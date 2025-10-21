import axios from 'axios';
import { config } from './config';

// User interface
export interface User {
  id: number;
  fname: string;
  lname: string;
  email: string;
  role: string;
  number?: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

// Auth response interface
export interface AuthResponse {
  user: User;
  token?: string;
  access_token?: string;
}

// Login/Signup form data
export interface AuthFormData {
  name?: string;
  email: string;
  password: string;
}

// Create axios instance
const api = axios.create({
  baseURL: config.api.baseUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
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
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      // Optionally redirect to login page
      // window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth service class
class AuthService {

  private async request<T>(endpoint: string, method: string = 'GET', data?: any): Promise<T> {
    try {
      const response = await api.request({
        method,
        url: endpoint,
        data,
      });
      return response.data;
    } catch (error) {
      console.error('Auth request error:', error);
      throw error;
    }
  }

  // Login user
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.request<AuthResponse>('/login', 'POST', { email, password });

      // Store token and user data (handle both token and access_token)
      const token = response.token || response.access_token;
      if (token) {
        this.setToken(token);
      }
      this.setUser(response.user);

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Register new user (viewer only)
  async register(fname: string, lname: string, email: string, password: string, number?: string): Promise<AuthResponse> {
    try {
      const response = await this.request<AuthResponse>('/viewer-register', 'POST', { 
        fname,
        lname,
        email, 
        password,
        password_confirmation: password,
        number,
        role: 'viewer'
      });

      // Store token and user data (handle both token and access_token)
      const token = response.token || response.access_token;
      if (token) {
        this.setToken(token);
      }
      this.setUser(response.user);

      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await this.request('/logout', 'POST');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API response
      this.clearAuth();
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const user = await this.request<User>('/me');
      this.setUser(user);
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Update user profile
  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      const user = await this.request<User>('/me', 'PUT', data);
      this.setUser(user);
      return user;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Token management
  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  removeToken(): void {
    localStorage.removeItem('auth_token');
  }

  // User management
  setUser(user: User): void {
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('auth_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  removeUser(): void {
    localStorage.removeItem('auth_user');
  }

  // Clear all auth data
  clearAuth(): void {
    this.removeToken();
    this.removeUser();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.role === role;
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  // Check if user is author
  isAuthor(): boolean {
    return this.hasRole('author') || this.isAdmin();
  }

  // Check if user is viewer
  isViewer(): boolean {
    return this.hasRole('viewer') || this.isAuthor();
  }

  // Get user's full name
  getUserFullName(): string {
    const user = this.getUser();
    if (!user) return '';
    return `${user.fname} ${user.lname}`.trim();
  }

  // Get user's first name
  getUserFirstName(): string {
    const user = this.getUser();
    return user?.fname || '';
  }
}

// Export singleton instance
export const authService = new AuthService(); 