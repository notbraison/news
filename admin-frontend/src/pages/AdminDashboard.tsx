import { AdminLayout } from "@/components/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { dashboardApi } from "@/lib/api";
import {
  FileText,
  Users,
  FolderOpen,
  Eye,
  TrendingUp,
  Clock,
  Tag,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

interface DashboardStats {
  total_articles: number;
  published_articles: number;
  draft_articles: number;
  total_categories: number;
  total_users: number;
  total_tags: number;
}

interface RecentArticle {
  id: number;
  title: string;
  status: string;
  author: string;
  date: string;
}

const AdminDashboard = () => {
  const { user } = useAuth();

  // Fetch dashboard stats
  const { data: statsData, isLoading: statsLoading } = useQuery<{
    data: DashboardStats;
  }>({
    queryKey: ["dashboardStats"],
    queryFn: () => dashboardApi.getStats(),
  });

  // Fetch recent articles
  const { data: articlesData, isLoading: articlesLoading } = useQuery<{
    data: RecentArticle[];
  }>({
    queryKey: ["recentArticles"],
    queryFn: () => dashboardApi.getRecentArticles(5),
  });

  const stats = statsData?.data
    ? [
        {
          title: "Total Articles",
          value: statsData.data.total_articles.toString(),
          icon: FileText,
          color: "bg-blue-500",
        },
        {
          title: "Published",
          value: statsData.data.published_articles.toString(),
          icon: Eye,
          color: "bg-green-500",
        },
        {
          title: "Drafts",
          value: statsData.data.draft_articles.toString(),
          icon: Clock,
          color: "bg-yellow-500",
        },
        {
          title: "Categories",
          value: statsData.data.total_categories.toString(),
          icon: FolderOpen,
          color: "bg-purple-500",
        },
        {
          title: "Tags",
          value: statsData.data.total_tags.toString(),
          icon: Tag,
          color: "bg-purple-500",
        },
        ...(user?.role === "admin"
          ? [
              {
                title: "Total Users",
                value: statsData.data.total_users.toString(),
                icon: Users,
                color: "bg-red-500",
              },
            ]
          : []),
      ]
    : [];

  const recentArticles = articlesData?.data || [];

  if (statsLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-1">Loading dashboard data...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your news platform today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Articles</CardTitle>
              <CardDescription>Latest articles from your team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {articlesLoading ? (
                  // Loading skeleton for articles
                  [...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                      </div>
                      <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                  ))
                ) : recentArticles.length > 0 ? (
                  recentArticles.map((article) => (
                    <div
                      key={article.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{article.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          By {article.author} • {article.date}
                        </p>
                      </div>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          article.status === "published"
                            ? "bg-green-100 text-green-800"
                            : article.status === "draft"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {article.status}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No articles found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks you can perform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <a
                  href="/articles/create"
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FileText className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="font-medium">Create New Article</span>
                </a>
                <a
                  href="/articles"
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Eye className="h-5 w-5 text-green-600 mr-3" />
                  <span className="font-medium">View All Articles</span>
                </a>
                {(user?.role === "editor" || user?.role === "admin") && (
                  <a
                    href="/categories"
                    className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FolderOpen className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="font-medium">Manage Categories</span>
                  </a>
                )}
                {user?.role === "admin" && (
                  <a
                    href="/users"
                    className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Users className="h-5 w-5 text-red-600 mr-3" />
                    <span className="font-medium">Manage Users</span>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
