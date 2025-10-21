import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePostsByCategory, usePosts } from "@/hooks/useApi";
import { Article } from "@/lib/api";

const CategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Use cached hooks for data fetching
  const { data: categoryArticles = [], isLoading: categoryLoading, error: categoryError } = usePostsByCategory(category?.toLowerCase() || "");
  const { data: allArticles = [], isLoading: allLoading } = usePosts();

  useEffect(() => {
    if (!category) return;

    // If category articles are loaded, use them
    if (categoryArticles.length > 0) {
      setArticles(categoryArticles);
      setError(null);
    } else if (!categoryLoading && !allLoading) {
      // If no category articles found, try filtering from all articles
      const categorySlug = category.toLowerCase();
      const filteredArticles = allArticles.filter(
        (article) => article.category.toLowerCase() === categorySlug
      );
      setArticles(filteredArticles);
      setError(null);
    }

    // Handle category error
    if (categoryError) {
      setError("Failed to load category articles. Please try again later.");
    }
  }, [category, categoryArticles, allArticles, categoryLoading, allLoading, categoryError]);

  const handleArticleClick = (article: Article) => {
    navigate(`/article/${article.slug}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCategoryName = (slug: string) => {
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const loading = categoryLoading || allLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading category articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">
            Error Loading Articles
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {category ? formatCategoryName(category) : "Category"}
            </h1>
          </div>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">No Articles Found</h2>
            <p className="text-gray-600 mb-6">
              No articles found in this category. Check back later for new
              content.
            </p>
            <Button onClick={() => navigate("/")}>Browse All Articles</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Card
                key={article.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleArticleClick(article)}
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4">
                  <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold uppercase rounded mb-2 inline-block">
                    {article.category}
                  </span>
                  <h3 className="font-bold text-lg mb-2 hover:text-red-600 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{article.readTime} min</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {formatDate(article.publishedAt)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
