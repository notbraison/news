<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CommentController extends Controller
{
    public function index()
    {
        return Comment::with(['user', 'replies'])->whereNull('parent_comment_id')->get();
    }

    public function store(Request $request)
    {
        Log::info('Comment creation request received', [
            'request_data' => $request->all(),
            'user_id' => $request->user()->id ?? 'no_user'
        ]);

        $data = $request->validate([
            'post_id' => 'required|exists:posts,id',
            'body' => 'required|string',
            'parent_comment_id' => 'nullable|exists:comments,id',
            'status' => 'in:pending,approved,spam'
        ]);

        // Automatically set the user_id from the authenticated user
        $data['user_id'] = $request->user()->id;
        // Set status to approved for authenticated users (or 'pending' if you want moderation)
        $data['status'] = $data['status'] ?? 'approved';

        Log::info('Creating comment with data', $data);

        try {
            $comment = Comment::create($data);
            Log::info('Comment created successfully', ['comment_id' => $comment->id]);

            // Load the user relationship for the response
            $comment->load('user');

            return response()->json($comment, 201);
        } catch (\Exception $e) {
            Log::error('Failed to create comment', [
                'error' => $e->getMessage(),
                'data' => $data
            ]);
            throw $e;
        }
    }

    public function show($id)
    {
        return Comment::with(['user', 'replies'])->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $comment = Comment::findOrFail($id);

        $comment->update($request->only(['body', 'status']));

        return response()->json($comment);
    }

    public function destroy($id)
    {
        Comment::destroy($id);
        return response()->json(['message' => 'Comment deleted']);
    }
    public function approve($id)
{
    $comment = Comment::findOrFail($id);
    $comment->status = 'approved';
    $comment->save();

    return response()->json(['message' => 'Comment approved.']);
}

public function markSpam($id)
{
    $comment = Comment::findOrFail($id);
    $comment->status = 'spam';
    $comment->save();

    return response()->json(['message' => 'Comment marked as spam.']);
}

public function commentsByPost($postId)
{
    Log::info('Fetching comments for post', ['post_id' => $postId]);

    $comments = Comment::with(['user', 'replies'])
        ->where('post_id', $postId)
        ->whereNull('parent_comment_id')
        ->where('status', 'approved')
        ->get();

    Log::info('Comments found', ['count' => $comments->count(), 'comments' => $comments->toArray()]);

    return response()->json($comments);
}

public function test()
{
    Log::info('Testing comment functionality');

    // Check if we can access the database
    try {
        $commentCount = Comment::count();
        Log::info('Total comments in database:', ['count' => $commentCount]);

        // Try to get all comments
        $allComments = Comment::with('user')->get();
        Log::info('All comments:', ['comments' => $allComments->toArray()]);

        return response()->json([
            'message' => 'Comment test successful',
            'total_comments' => $commentCount,
            'comments' => $allComments
        ]);
    } catch (\Exception $e) {
        Log::error('Comment test failed', ['error' => $e->getMessage()]);
        return response()->json([
            'message' => 'Comment test failed',
            'error' => $e->getMessage()
        ], 500);
    }
}

}
