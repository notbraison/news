import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, Article, Category, Comment } from '@/lib/api';

// Query keys for React Query
export const queryKeys = {
  posts: ['posts'] as const,
  post: (id: string) => ['post', id] as const,
  postBySlug: (slug: string) => ['post', 'slug', slug] as const,
  postsByCategory: (slug: string) => ['posts', 'category', slug] as const,
  categories: ['categories'] as const,
  searchPosts: (query: string) => ['posts', 'search', query] as const,
  comments: (postId: number) => ['comments', postId] as const,
};

// Custom hook for fetching all posts with caching
export const usePosts = () => {
  return useQuery({
    queryKey: queryKeys.posts,
    queryFn: () => apiService.getPosts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};

// Custom hook for fetching a single post by ID
export const usePost = (id: string) => {
  return useQuery({
    queryKey: queryKeys.post(id),
    queryFn: () => apiService.getPost(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
};

// Custom hook for fetching a single post by slug
export const usePostBySlug = (slug: string) => {
  return useQuery({
    queryKey: queryKeys.postBySlug(slug),
    queryFn: () => apiService.getPostBySlug(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
};

// Custom hook for fetching posts by category
export const usePostsByCategory = (slug: string) => {
  return useQuery({
    queryKey: queryKeys.postsByCategory(slug),
    queryFn: () => apiService.getPostsByCategory(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Custom hook for fetching categories
export const useCategories = () => {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => apiService.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

// Custom hook for searching posts
export const useSearchPosts = (query: string) => {
  return useQuery({
    queryKey: queryKeys.searchPosts(query),
    queryFn: () => apiService.searchPosts(query),
    enabled: !!query.trim(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Custom hook for fetching comments
export const useComments = (postId: number) => {
  return useQuery({
    queryKey: queryKeys.comments(postId),
    queryFn: () => apiService.getComments(postId),
    enabled: !!postId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Custom hook for creating comments
export const useCreateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { postId: number; body: string; parentCommentId?: number }) =>
      apiService.createComment(data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch comments for the specific post
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments(variables.postId),
      });
    },
  });
};

// Custom hook for prefetching data
export const usePrefetch = () => {
  const queryClient = useQueryClient();
  
  return {
    prefetchPost: (slug: string) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.postBySlug(slug),
        queryFn: () => apiService.getPostBySlug(slug),
        staleTime: 10 * 60 * 1000,
        gcTime: 20 * 60 * 1000,
      });
    },
    prefetchCategory: (slug: string) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.postsByCategory(slug),
        queryFn: () => apiService.getPostsByCategory(slug),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
      });
    },
  };
}; 