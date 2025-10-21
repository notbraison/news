<?php

namespace App\Http\Controllers;

use App\Models\PostRevision;
use Illuminate\Http\Request;

class PostRevisionController extends Controller
{
    // List all revisions for a given post
    public function index($postId)
    {
        $revisions = PostRevision::where('post_id', $postId)
            ->with('editor:id,fname,lname,email') // Optional: include editor info
            ->orderByDesc('created_at')
            ->get();

        return response()->json($revisions);
    }

    // Store a new revision (typically after editing a post)
    public function store(Request $request)
    {
        $data = $request->validate([
            'post_id' => 'required|exists:posts,id',
            'body_snapshot' => 'required|string',
        ]);

        $revision = PostRevision::create([
            'post_id' => $data['post_id'],
            'editor_id' => auth()->id(), // Requires auth:sanctum middleware
            'body_snapshot' => $data['body_snapshot'],
        ]);

        return response()->json([
            'message' => 'Revision saved successfully.',
            'revision' => $revision
        ], 201);
    }

    // View a single revision
    public function show($id)
    {
        $revision = PostRevision::with('editor:id,fname,lname,email')->findOrFail($id);
        return response()->json($revision);
    }
}
