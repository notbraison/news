<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;

class PostCategoryController extends Controller
{
    public function attach(Request $request, Post $post)
    {
        $data = $request->validate([
            'category_ids' => 'required|array',
            'category_ids.*' => 'exists:categories,id',
        ]);

        $post->categories()->syncWithoutDetaching($data['category_ids']);

        return response()->json(['message' => 'Categories attached to post successfully.']);
    }

    public function detach(Request $request, Post $post)
    {
        $data = $request->validate([
            'category_ids' => 'required|array',
            'category_ids.*' => 'exists:categories,id',
        ]);

        $post->categories()->detach($data['category_ids']);

        return response()->json(['message' => 'Categories detached from post.']);
    }
    public function sync(Request $request, $postId)
{
    $data = $request->validate([
        'category_ids' => 'required|array',
        'category_ids.*' => 'exists:categories,id',
    ]);

    $post = Post::findOrFail($postId);
    $post->categories()->sync($data['category_ids']);

    return response()->json(['message' => 'Categories synced successfully.']);
}

public function getCategoriesForPost($postId)
{
    $post = Post::with('categories')->findOrFail($postId);

    return response()->json([
        'post_id' => $post->id,
        'categories' => $post->categories
    ]);
}


}
