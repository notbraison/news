<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    public function index()
    {
        try {
            // Try to get from cache first
            $categories = Cache::remember('categories_all', 1800, function () {
                return Category::orderBy('name')->get();
            });

            // Add HTTP caching headers
            return response()->json($categories)
                ->header('Cache-Control', 'public, max-age=1800, s-maxage=3600') // 30 min browser, 1 hour CDN
                ->header('ETag', md5($categories->toJson()))
                ->header('Last-Modified', $categories->first()?->updated_at?->toRfc7231String() ?? now()->toRfc7231String());
        } catch (\Exception $e) {
            Log::error('Failed to fetch categories: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to fetch categories'], 500);
        }
    }

    public function store(Request $request)
{
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:categories,name',
                'description' => 'nullable|string',
            ]);

            $category = Category::create($validated);

            return response()->json($category, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Failed to create category: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to create category'], 500);
        }
}

    public function show(Category $category)
    {
        try {
            return $category->load('posts');
        } catch (\Exception $e) {
            Log::error('Failed to fetch category: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to fetch category'], 500);
        }
    }

    public function update(Request $request, Category $category)
    {
        try {
            $validated = $request->validate([
            'name' => "required|string|max:255|unique:categories,name,{$category->id}",
            'description' => 'nullable|string',
        ]);

            $category->update($validated);

            return response()->json($category);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Failed to update category: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to update category'], 500);
        }
    }

    public function destroy(Category $category)
    {
        try {
            // Check if category has any posts
            if ($category->posts()->exists()) {
                return response()->json([
                    'message' => 'Cannot delete category with associated articles. Remove articles first.',
                ], 422);
            }

        $category->delete();
        return response()->noContent();
        } catch (\Exception $e) {
            Log::error('Failed to delete category: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to delete category'], 500);
        }
    }

    public function postsBySlug(Request $request, $slug)
    {
        $limit = $request->query('limit', 9);
        $offset = $request->query('offset', 0);
        $category = Category::where('slug', $slug)->firstOrFail();
        $posts = $category->posts()
            ->with(['user', 'tags', 'categories', 'media'])
            ->orderBy('published_at', 'desc')
            ->skip($offset)
            ->take($limit)
            ->get();

        // Add HTTP caching headers
        return response()->json($posts)
            ->header('Cache-Control', 'public, max-age=300, s-maxage=600') // 5 min browser, 10 min CDN
            ->header('ETag', md5($posts->toJson()))
            ->header('Last-Modified', $posts->first()?->updated_at?->toRfc7231String() ?? now()->toRfc7231String());
    }
}
