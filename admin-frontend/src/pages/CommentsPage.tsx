import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MessageCircle,
  CheckCircle,
  XCircle,
  Trash2,
  User,
  Clock,
  FileText,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { postsApi, commentsApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/AdminLayout";

interface Comment {
  id: number;
  post_id: number;
  user_id: number | null;
  body: string;
  parent_comment_id: number | null;
  status: "pending" | "approved" | "spam";
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    fname: string;
    lname: string;
  };
  replies?: Comment[];
}

interface Post {
  id: number;
  title: string;
  slug: string;
}

const CommentsPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>([]);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "spam">(
    "all"
  );

  useEffect(() => {
    if (postId) {
      fetchData();
    }
  }, [postId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [postResponse, commentsResponse] = await Promise.all([
        postsApi.getById(postId!),
        commentsApi.getByPost(postId!),
      ]);

      setPost(postResponse.data);
      setComments(commentsResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    commentId: number,
    action: "approve" | "spam" | "delete"
  ) => {
    try {
      switch (action) {
        case "approve":
          await commentsApi.approve(commentId.toString());
          break;
        case "spam":
          await commentsApi.markSpam(commentId.toString());
          break;
        case "delete":
          await commentsApi.delete(commentId.toString());
          break;
      }

      // Refresh comments
      await fetchData();

      toast({
        title: "Success",
        description: `Comment ${
          action === "delete"
            ? "deleted"
            : action === "approve"
            ? "approved"
            : "marked as spam"
        } successfully`,
      });
    } catch (error) {
      console.error("Error updating comment:", error);
      toast({
        title: "Error",
        description: "Failed to update comment",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Approved
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        );
      case "spam":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Spam
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredComments = comments.filter((comment) => {
    if (filter === "all") return true;
    return comment.status === filter;
  });

  const getCommentAuthor = (comment: Comment) => {
    if (comment.user) {
      return `${comment.user.fname} ${comment.user.lname}`;
    }
    return "Anonymous";
  };

  const CommentItem: React.FC<{ comment: Comment; level?: number }> = ({
    comment,
    level = 0,
  }) => (
    <div
      className={`border-l-2 border-gray-200 pl-4 mb-4 ${
        level > 0 ? "ml-4" : ""
      }`}
    >
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-semibold text-sm">
                    {getCommentAuthor(comment)}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3 text-gray-500" />
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.created_at)}
                    </span>
                    {getStatusBadge(comment.status)}
                  </div>
                </div>
              </div>

              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                {comment.body}
              </p>

              <div className="flex space-x-2">
                {comment.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(comment.id, "approve")}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(comment.id, "spam")}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Mark Spam
                    </Button>
                  </>
                )}

                {comment.status === "spam" && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(comment.id, "approve")}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Approve
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange(comment.id, "delete")}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );

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
              onClick={() => navigate("/articles")}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Articles
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Comments</h1>
              {post && (
                <p className="text-gray-600 text-sm">
                  For: <span className="font-medium">{post.title}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">
              {comments.length} total comments
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-xl font-bold">{comments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-xl font-bold">
                    {comments.filter((c) => c.status === "approved").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-xl font-bold">
                    {comments.filter((c) => c.status === "pending").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Spam</p>
                  <p className="text-xl font-bold">
                    {comments.filter((c) => c.status === "spam").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Link */}
        <div className="mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Post Analytics</h3>
                  <p className="text-gray-600 text-sm">
                    View detailed analytics and performance metrics for this
                    article
                  </p>
                </div>
                <Button asChild>
                  <a href={`/articles/${postId}/analytics`}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex space-x-2 mb-6">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            size="sm"
          >
            All ({comments.length})
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
            size="sm"
          >
            Pending ({comments.filter((c) => c.status === "pending").length})
          </Button>
          <Button
            variant={filter === "approved" ? "default" : "outline"}
            onClick={() => setFilter("approved")}
            size="sm"
          >
            Approved ({comments.filter((c) => c.status === "approved").length})
          </Button>
          <Button
            variant={filter === "spam" ? "default" : "outline"}
            onClick={() => setFilter("spam")}
            size="sm"
          >
            Spam ({comments.filter((c) => c.status === "spam").length})
          </Button>
        </div>

        <Separator className="mb-6" />

        {/* Comments List */}
        <div className="space-y-4">
          {filteredComments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {filter === "all"
                    ? "No comments yet for this article."
                    : `No ${filter} comments found.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default CommentsPage;
