import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  Eye,
  TrendingUp,
  Calendar,
  Users,
  FileText,
  ChevronDown,
  ChevronUp,
  User,
  Tag,
  FolderOpen,
  Image,
  Clock,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { postsApi, analyticsApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/AdminLayout";

interface Post {
  id: number;
  title: string;
  slug: string;
  body: string;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    fname: string;
    lname: string;
    email: string;
  };
  categories?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  tags?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  media?: Array<{
    id: number;
    url: string;
    type: string;
    filename: string;
  }>;
}

interface PostStats {
  post_id: number;
  total_views: number;
  unique_users: number;
}

interface TopPost {
  post_id: number;
  title: string;
  slug: string;
  views: number;
}

interface DailyViews {
  date: string;
  views: number;
}

interface ViewsOverTime {
  post_id: number;
  daily_views: DailyViews[];
}

const AnalyticsPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [postStats, setPostStats] = useState<PostStats | null>(null);
  const [viewsOverTime, setViewsOverTime] = useState<ViewsOverTime | null>(
    null
  );
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostDetails, setShowPostDetails] = useState(false);

  useEffect(() => {
    if (postId) {
      fetchData();
    }
  }, [postId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [postResponse, statsResponse, viewsResponse, topPostsResponse] =
        await Promise.all([
          postsApi.getById(postId!),
          analyticsApi.getPostStats(postId!),
          analyticsApi.getViewsOverTime(postId!),
          analyticsApi.getTopPosts(10),
        ]);

      setPost(postResponse.data);
      setPostStats(statsResponse.data);
      setViewsOverTime(viewsResponse.data);
      setTopPosts(topPostsResponse.data);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              {post && (
                <p className="text-gray-600 text-sm">
                  For: <span className="font-medium">{post.title}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">Post Analytics</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Views</p>
                  <p className="text-xl font-bold">
                    {postStats?.total_views || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Unique Users</p>
                  <p className="text-xl font-bold">
                    {postStats?.unique_users || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Engagement Rate</p>
                  <p className="text-xl font-bold">
                    {postStats?.total_views && postStats?.unique_users
                      ? Math.round(
                          (postStats.unique_users / postStats.total_views) * 100
                        )
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Views Over Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Views Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              {viewsOverTime && viewsOverTime.daily_views.length > 0 ? (
                <div className="space-y-3">
                  {viewsOverTime.daily_views.slice(-7).map((day, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm font-medium">
                        {formatDate(day.date)}
                      </span>
                      <div className="flex items-center space-x-2">
                        <Eye className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold">{day.views}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No view data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Posts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Top Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topPosts.length > 0 ? (
                <div className="space-y-3">
                  {topPosts.slice(0, 5).map((topPost, index) => (
                    <div
                      key={topPost.post_id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary">{index + 1}</Badge>
                        <div className="max-w-xs">
                          <p className="text-sm font-medium truncate">
                            {topPost.title}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Eye className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold">{topPost.views}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No top posts data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Comments Link */}
        <div className="mt-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Comments Management</h3>
                  <p className="text-gray-600 text-sm">
                    View and manage comments for this article
                  </p>
                </div>
                <Button asChild>
                  <a href={`/articles/${postId}/comments`}>
                    <FileText className="h-4 w-4 mr-2" />
                    View Comments
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Post Details Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Post Information
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPostDetails(!showPostDetails)}
                  className="flex items-center"
                >
                  {showPostDetails ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Minimize
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Expand
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            {showPostDetails && (
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-gray-800">
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">
                          Title:
                        </span>
                        <span className="text-sm">{post?.title}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Tag className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">
                          Slug:
                        </span>
                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {post?.slug}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">
                          Status:
                        </span>
                        <Badge
                          variant={
                            post?.status === "published"
                              ? "default"
                              : post?.status === "draft"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {post?.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">
                          Author:
                        </span>
                        <span className="text-sm">
                          {post?.user
                            ? `${post.user.fname} ${post.user.lname}`
                            : "Unknown"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">
                          Created:
                        </span>
                        <span className="text-sm">
                          {post?.created_at
                            ? formatDate(post.created_at)
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">
                          Published:
                        </span>
                        <span className="text-sm">
                          {post?.published_at
                            ? formatDate(post.published_at)
                            : "Not published"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Categories */}
                {post?.categories && post.categories.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                      <FolderOpen className="w-5 h-5 mr-2" />
                      Categories
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {post.categories.map((category) => (
                        <Badge key={category.id} variant="outline">
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {post?.tags && post.tags.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                      <Tag className="w-5 h-5 mr-2" />
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag.id} variant="secondary">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Media */}
                {post?.media && post.media.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                      <Image className="w-5 h-5 mr-2" />
                      Media Files
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {post.media.map((media) => (
                        <div
                          key={media.id}
                          className="border rounded-lg p-3 bg-gray-50"
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <Image className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium">
                              {media.filename}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Type: {media.type}
                          </div>
                          {media.type === "image" && (
                            <img
                              src={media.url}
                              alt={media.filename}
                              className="w-full h-24 object-cover rounded mt-2"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content Preview */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-gray-800">
                    Content Preview
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {post?.body
                        ? post.body.length > 500
                          ? `${post.body.substring(0, 500)}...`
                          : post.body
                        : "No content available"}
                    </p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AnalyticsPage;
