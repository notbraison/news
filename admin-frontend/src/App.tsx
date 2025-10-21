import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import ArticlesPage from "./pages/ArticlesPage";
import CreateArticlePage from "./pages/CreateArticlePage";
import EditArticlePage from "./pages/EditArticlePage";
import CategoriesPage from "./pages/CategoriesPage";
import UsersPage from "./pages/UsersPage";
import SettingsPage from "./pages/SettingsPage";
import BreakingNewsPage from "./pages/BreakingNewsPage";
import CommentsPage from "./pages/CommentsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import BlockEditorDemo from "./pages/BlockEditorDemo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename="/admin">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/articles" element={<ArticlesPage />} />
            <Route path="/articles/create" element={<CreateArticlePage />} />
            <Route path="/articles/edit/:id" element={<EditArticlePage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/breaking-news" element={<BreakingNewsPage />} />
            <Route
              path="/articles/:postId/analytics"
              element={<AnalyticsPage />}
            />
            <Route
              path="/articles/:postId/comments"
              element={<CommentsPage />}
            />
            <Route path="/block-editor-demo" element={<BlockEditorDemo />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
