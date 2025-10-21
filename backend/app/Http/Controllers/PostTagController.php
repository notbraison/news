<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;

class PostTagController extends Controller
{
    public function attach(Request $request)
    {
        $data = $request->validate([
            'post_id'   => 'required|exists:posts,id',
            'tag_ids'   => 'required|array',
            'tag_ids.*' => 'exists:tags,id',
        ]);

        $post = Post::findOrFail($data['post_id']);
        $post->tags()->attach($data['tag_ids']);

        return response()->json(['message' => 'Tags attached successfully.']);
    }

    public function sync(Request $request, $postId)
    {
        $data = $request->validate([
            'tag_ids'   => 'required|array',
            'tag_ids.*' => 'exists:tags,id',
        ]);

        $post = Post::findOrFail($postId);
        $post->tags()->sync($data['tag_ids']);

        return response()->json(['message' => 'Tags synced successfully.']);
    }

    public function detach(Request $request, $postId)
    {
        $data = $request->validate([
            'tag_ids'   => 'required|array',
            'tag_ids.*' => 'exists:tags,id',
        ]);

        $post = Post::findOrFail($postId);
        $post->tags()->detach($data['tag_ids']);

        return response()->json(['message' => 'Tags detached successfully.']);
    }

    public function getTagsForPost($postId)
    {
        $post = Post::with('tags')->findOrFail($postId);

        return response()->json([
            'post_id' => $post->id,
            'tags' => $post->tags,
        ]);
    }
}
