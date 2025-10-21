<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PostController extends Controller
{
    public function index(Request $request)
    {
        // Create cache key based on search parameter
        $cacheKey = 'posts_' . ($request->get('search', 'all'));

        // Try to get from cache first
        $posts = Cache::remember($cacheKey, 300, function () use ($request) {
            $query = Post::with(['user', 'tags', 'categories', 'media']);

            // Handle search parameter
            if ($request->has('search') && !empty($request->search)) {
                $searchTerm = $request->search;
                $query->where(function($q) use ($searchTerm) {
                    $q->where('title', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('body', 'LIKE', "%{$searchTerm}%");
                });
            }

            return $query->latest()->get();
        });

        // Add HTTP caching headers
        return response()->json($posts)
            ->header('Cache-Control', 'public, max-age=300, s-maxage=600') // 5 min browser, 10 min CDN
            ->header('ETag', md5($posts->toJson()))
            ->header('Last-Modified', $posts->first()?->updated_at?->toRfc7231String() ?? now()->toRfc7231String());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id'      => 'required|exists:users,id',
            'title'        => 'required|string|max:255',
            'body'         => 'required|string',
            'status'       => 'required|in:draft,published,archived',
            'published_at' => 'nullable|date',
            'categories'   => 'array',
            'categories.*' => 'exists:categories,id',
            'tags'         => 'array',
            'tags.*'       => 'exists:tags,id',
        ]);

        $post = Post::create($data);

        // Attach categories and tags if provided
        if ($request->has('categories')) {
            $post->categories()->sync($request->input('categories'));
        }
        if ($request->has('tags')) {
            $post->tags()->sync($request->input('tags'));
        }

        $post->load(['user', 'tags', 'categories', 'media']);
        return response()->json($post, 201);
    }

    public function show(Post $post)
    {
        $post = $post->load(['user', 'tags', 'categories', 'media']);

        // Add HTTP caching headers
        return response()->json($post)
            ->header('Cache-Control', 'public, max-age=600, s-maxage=1200') // 10 min browser, 20 min CDN
            ->header('ETag', md5($post->toJson()))
            ->header('Last-Modified', $post->updated_at->toRfc7231String());
    }

    public function showBySlug($slug)
    {
        $post = Post::where('slug', $slug)
            ->with(['user', 'tags', 'categories', 'media'])
            ->firstOrFail();

        // Add HTTP caching headers
        return response()->json($post)
            ->header('Cache-Control', 'public, max-age=600, s-maxage=1200') // 10 min browser, 20 min CDN
            ->header('ETag', md5($post->toJson()))
            ->header('Last-Modified', $post->updated_at->toRfc7231String());
    }

    public function update(Request $request, Post $post)
    {
        $data = $request->validate([
            'title'        => 'sometimes|string|max:255',
            'body'         => 'sometimes|string',
            'status'       => 'sometimes|in:draft,published,archived',
            'published_at' => 'nullable|date',
            'categories'   => 'array',
            'categories.*' => 'exists:categories,id',
            'tags'         => 'array',
            'tags.*'       => 'exists:tags,id',
        ]);

        $post->update($data);

        // Sync categories and tags if provided
        if ($request->has('categories')) {
            $post->categories()->sync($request->input('categories'));
        }
        if ($request->has('tags')) {
            $post->tags()->sync($request->input('tags'));
        }

        $post->load(['user', 'tags', 'categories', 'media']);
        return $post;
    }

    public function destroy(Post $post)
    {
        $post->delete();
        return response()->noContent();
    }
}
