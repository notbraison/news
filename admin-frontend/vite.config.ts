import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: true, // bind to 0.0.0.0 in dev too (safe fallback)
    port: 3001,
    
    proxy: mode === "development"
      ? {
          "/api": {
            target: "http://localhost:8000",
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/api/, ""),
          },
        }
      : undefined,
  },
  preview: {
    host: "0.0.0.0",
    port: parseInt(process.env.PORT || "4173"),
    strictPort: true,
  },
  base:'/admin/',
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "news",
    emptyOutDir: true,
    assetsDir: "assets",
    sourcemap: false,
    // Memory optimization settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Handle Firebase separately to avoid build issues
          if (id.includes('firebase')) {
            return 'firebase';
          }
          // Split vendor libraries
          if (id.includes('react') || id.includes('react-dom')) {
            return 'vendor';
          }
          if (id.includes('@radix-ui')) {
            return 'ui';
          }
          if (id.includes('date-fns') || id.includes('clsx') || id.includes('tailwind-merge')) {
            return 'utils';
          }
          if (id.includes('react-hook-form') || id.includes('@hookform/resolvers') || id.includes('zod')) {
            return 'forms';
          }
          if (id.includes('openai') || id.includes('axios')) {
            return 'admin';
          }
        },
      },
    },
    // Enable chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'firebase/app', 'firebase/storage'],
    exclude: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
  },
}));
