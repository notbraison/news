// Environment variables configuration
export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL_LOCAL || 'http://localhost:8000/api',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  },
  
  // App Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'News Portal',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    description: import.meta.env.VITE_APP_DESCRIPTION || 'Modern news portal with real-time updates',
  },
  
  // Site Configuration
  site: {
    url: import.meta.env.VITE_SITE_URL_PROD || import.meta.env.VITE_SITE_URL,
    description: import.meta.env.VITE_SITE_DESCRIPTION || 'Your trusted source for the latest news and updates',
    keywords: import.meta.env.VITE_SITE_KEYWORDS || 'news, updates, latest, breaking news',
  },
  
  // Feature Flags
  features: {
    darkMode: import.meta.env.VITE_ENABLE_DARK_MODE === 'true',
    search: import.meta.env.VITE_ENABLE_SEARCH !== 'false',
    categories: import.meta.env.VITE_ENABLE_CATEGORIES !== 'false',
    comments: import.meta.env.VITE_ENABLE_COMMENTS !== 'false',
  },
  
  // Pagination
  pagination: {
    articlesPerPage: parseInt(import.meta.env.VITE_ARTICLES_PER_PAGE || '15'),
    searchResultsPerPage: parseInt(import.meta.env.VITE_SEARCH_RESULTS_PER_PAGE || '12'),
  },
  
  // Social Media
  social: {
    facebook: import.meta.env.VITE_SOCIAL_FACEBOOK_URL || '',
    twitter: import.meta.env.VITE_SOCIAL_TWITTER_URL || '',
    instagram: import.meta.env.VITE_SOCIAL_INSTAGRAM_URL || '',
  },
  
  // Analytics
  analytics: {
    googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '',
  },
} as const;

// Route configuration
export const routes = {
  home: '/',
  article: '/article/:slug',
  search: '/search',
  category: '/category/:category',
  about: '/about',
  contact: '/contact',
  privacy: '/privacy',
  terms: '/terms',
  notFound: '*',
} as const;

// Navigation items
export const navigationItems = [
  { name: 'Home', path: routes.home },
  { name: 'Categories', path: '/categories' },
  { name: 'About', path: routes.about },
  { name: 'Contact', path: routes.contact },
] as const; 