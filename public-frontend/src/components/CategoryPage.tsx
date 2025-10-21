import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SortAsc, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ArticleCard from "./ArticleCard";
import { usePostsByCategory } from "@/hooks/useApi";

interface Article {
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
}

const CategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("latest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Use cached hook for data fetching
  const {
    data: categoryData = [],
    isLoading,
    error,
  } = usePostsByCategory(category?.toLowerCase() || "");

  // Normalize the category data to match the Article interface
  const articles: Article[] = React.useMemo(() => {
    if (!categoryData || !Array.isArray(categoryData)) return [];

    return categoryData.map(
      (item: any): Article => ({
        id: item.id,
        title: item.title,
        excerpt: item.body?.slice(0, 200) + "..." || "",
        content: item.body || "",
        author: item.user
          ? `${item.user.fname || ""} ${item.user.lname || ""}`.trim()
          : "Unknown",
        publishedAt: item.published_at || item.created_at,
        category:
          item.categories && item.categories.length > 0
            ? item.categories[0].name
            : "General",
        imageUrl: item.media && item.media.length > 0 ? item.media[0].url : "",
        readTime: Math.ceil((item.body || "").split(" ").length / 200),
        tags: item.tags ? item.tags.map((t: any) => t.name) : [],
        slug: item.slug || "",
      })
    );
  }, [categoryData]);

  const handleArticleClick = (article: Article) => {
    navigate(`/article/${article.slug}`);
  };

  const getCategoryDescription = (cat: string) => {
    const descriptions: Record<string, string> = {
      world:
        "Breaking news and in-depth coverage of global events, international affairs, and worldwide developments.",
      politics:
        "Political analysis, policy updates, election coverage, and governmental affairs from around the world.",
      business:
        "Market trends, economic analysis, corporate news, and financial insights for informed decision-making.",
      sports:
        "Latest scores, athlete profiles, championship coverage, and sports analysis across all major leagues.",
      entertainment:
        "Celebrity news, movie reviews, music updates, and entertainment industry insights.",
    };
    return (
      descriptions[cat?.toLowerCase()] ||
      "Latest news and updates in this category."
    );
  };

  const sortedArticles = [...articles].sort((a, b) => {
    switch (sortBy) {
      case "latest":
        return (
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
      case "oldest":
        return (
          new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
        );
      case "popular":
        return b.readTime - a.readTime; // Mock popularity
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const categoryTitle = category?.charAt(0).toUpperCase() + category?.slice(1);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">
            Error Loading Category
          </h1>
          <p className="text-gray-600 mb-4">
            Failed to load category articles. Please try again later.
          </p>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-hierarchy-1 mb-4">{categoryTitle}</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            {getCategoryDescription(category || "")}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <SortAsc className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading articles...</p>
          </div>
        )}

        {/* Articles Grid/List */}
        {!isLoading && sortedArticles.length > 0 && (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {sortedArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                size={viewMode === "grid" ? "medium" : "large"}
                onClick={handleArticleClick}
              />
            ))}
          </div>
        )}

        {/* No Articles */}
        {!isLoading && sortedArticles.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-4">No articles found</h3>
            <p className="text-muted-foreground mb-6">
              No articles found in this category. Check back later for new
              content.
            </p>
            <Button onClick={() => navigate("/")}>Browse All Articles</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
