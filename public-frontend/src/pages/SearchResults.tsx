import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, ArrowLeft, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSearchPosts } from "@/hooks/useApi";
import { Article } from "@/lib/api";

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const query = searchParams.get("q") || "";

  // Use cached hook for search
  const {
    data: articles = [],
    isLoading: loading,
    error,
  } = useSearchPosts(query);

  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Searching for articles...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Search Error</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Failed to perform search. Please try again later.
          </p>
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

          <div className="flex items-center mb-4">
            <Search className="h-6 w-6 text-red-600 mr-3" />
            <h1 className="text-3xl md:text-4xl font-bold">Search Results</h1>
          </div>

          {searchQuery && (
            <p className="text-gray-600 dark:text-gray-400">
              {articles.length} result{articles.length !== 1 ? "s" : ""} for "
              {searchQuery}"
            </p>
          )}
        </div>

        {!searchQuery ? (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">No Search Query</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please enter a search term to find articles.
            </p>
            <Button onClick={() => navigate("/")}>Browse All Articles</Button>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">No Results Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              No articles found for "{searchQuery}". Try different keywords or
              browse all articles.
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
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{article.readTime} min</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
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

export default SearchResults;
