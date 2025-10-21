import React, { useState, useEffect } from "react";
import { MessageCircle, Send, Reply, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useComments, useCreateComment } from "@/hooks/useApi";
import { Comment } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface CommentSectionProps {
  postId: number;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const { user, isAuthenticated } = useAuth();

  // Use cached hooks for data fetching and mutations
  const { data: comments = [], isLoading: loading } = useComments(postId);
  const createCommentMutation = useCreateComment();

  // Component mounted
  useEffect(() => {
    // Component initialized
  }, [isAuthenticated, user]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated) return;

    // Check authentication status

    try {
      await createCommentMutation.mutateAsync({
        postId,
        body: newComment.trim(),
      });

      setNewComment("");
    } catch (error) {
      // Error creating comment
    }
  };

  const handleSubmitReply = async (parentId: number) => {
    if (!replyText.trim() || !isAuthenticated) return;

    try {
      await createCommentMutation.mutateAsync({
        postId,
        body: replyText.trim(),
        parentCommentId: parentId,
      });

      setReplyText("");
      setReplyingTo(null);
    } catch (error) {
      // Error creating reply
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const CommentItem: React.FC<{ comment: Comment; level?: number }> = ({
    comment,
    level = 0,
  }) => (
    <div
      className={`border-l-2 border-gray-200 dark:border-gray-700 pl-4 mb-4 ${
        level > 0 ? "ml-4" : ""
      }`}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-semibold text-gray-900 dark:text-white">
                {comment.author}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              {comment.body}
            </p>

            {isAuthenticated && level === 0 && (
              <button
                onClick={() =>
                  setReplyingTo(replyingTo === comment.id ? null : comment.id)
                }
                className="mt-2 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center space-x-1"
              >
                <Reply className="w-3 h-3" />
                <span>Reply</span>
              </button>
            )}
          </div>
        </div>

        {replyingTo === comment.id && (
          <div className="mt-4 ml-11">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitReply(comment.id);
              }}
            >
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="mb-2 text-sm"
                rows={2}
              />
              <div className="flex space-x-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={
                    createCommentMutation.isPending || !replyText.trim()
                  }
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Send className="w-3 h-3 mr-1" />
                  Reply
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyText("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="mt-8">
        <div className="flex items-center space-x-2 mb-4">
          <MessageCircle className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Comments
          </h3>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Loading comments...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center space-x-2 mb-6">
        <MessageCircle className="w-5 h-5 text-red-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Comments ({comments.length})
        </h3>
      </div>

      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="mb-3 text-sm"
              rows={3}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={createCommentMutation.isPending || !newComment.trim()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                {createCommentMutation.isPending
                  ? "Posting..."
                  : "Post Comment"}
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Please{" "}
            <button className="text-red-600 dark:text-red-400 hover:underline">
              sign in
            </button>{" "}
            to leave a comment.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
