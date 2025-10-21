import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash,
  Eye,
  FileText,
  Loader2,
  BarChart3,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { postsApi } from "@/lib/api";

interface Article {
  id: number;
  title: string;
  body: string;
  status: "draft" | "published" | "archived";
  user: {
    id: number;
    fname: string;
    lname: string;
  };
  categories: Array<{
    id: number;
    name: string;
  }>;
  published_at: string | null;
  created_at: string;
  views_count?: number;
}

const ArticlesPage = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const response = await postsApi.getAll();
      setArticles(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch articles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    try {
      await postsApi.delete(id.toString());
      setArticles(articles.filter((article) => article.id !== id));
      toast({
        title: "Article deleted",
        description: `"${title}" has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete article. Please try again.",
        variant: "destructive",
      });
    }
  };

  const canEdit = (article: Article) => {
    if (user?.role === "admin") return true;
    return user?.role === "author" && article.user.id === user.id;
  };

  const canDelete = (article: Article) => {
    if (user?.role === "admin") return true;
    return user?.role === "author" && article.user.id === user.id;
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.user.fname + " " + article.user.lname)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || article.status === filterStatus;
    const matchesAuthor =
      user?.role === "author" ? article.user.id === user.id : true;

    return matchesSearch && matchesStatus && matchesAuthor;
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
            <p className="text-gray-600 mt-1">
              Manage and organize your news articles
            </p>
          </div>
          <Button asChild>
            <a href="/articles/create">
              <Plus className="h-4 w-4 mr-2" />
              New Article
            </a>
          </Button>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            aria-label="Filter articles by status"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="space-y-4">
          {filteredArticles.map((article) => (
            <Card key={article.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant={
                          article.status === "published"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {article.status}
                      </Badge>
                      {article.categories?.map((category) => (
                        <span
                          key={category.id}
                          className="text-sm text-gray-500"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {article.body}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        By {article.user.fname} {article.user.lname}
                      </span>
                      {article.published_at && (
                        <span>
                          {new Date(article.published_at).toLocaleDateString()}
                        </span>
                      )}
                      {article.status === "published" &&
                        article.views_count !== undefined && (
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {article.views_count} views
                          </span>
                        )}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white">
                      {canEdit(article) && (
                        <DropdownMenuItem asChild>
                          <a href={`/articles/edit/${article.id}`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </a>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <a href={`/articles/${article.id}/analytics`}>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analytics
                        </a>
                      </DropdownMenuItem>
                      {canDelete(article) && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleDelete(article.id, article.title)
                          }
                          className="text-red-600"
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No articles found
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Create your first article to get started"}
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ArticlesPage;
