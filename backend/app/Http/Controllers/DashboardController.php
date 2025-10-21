<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Category;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats()
    {
        $totalArticles = Post::count();
        $publishedArticles = Post::where('status', 'published')->count();
        $draftArticles = Post::where('status', 'draft')->count();
        $totalCategories = Category::count();
        $totalUsers = User::count();
        $totalTags = Tag::count();

        return response()->json([
            'total_articles' => $totalArticles,
            'published_articles' => $publishedArticles,
            'draft_articles' => $draftArticles,
            'total_categories' => $totalCategories,
            'total_users' => $totalUsers,
            'total_tags' => $totalTags,
        ]);
    }

    public function recentArticles(Request $request)
    {
        $limit = $request->query('limit', 5);

        $articles = Post::with(['user:id,fname,lname'])
            ->select('id', 'title', 'status', 'user_id', 'created_at', 'published_at')
            ->latest('created_at')
            ->limit($limit)
            ->get()
            ->map(function ($article) {
                return [
                    'id' => $article->id,
                    'title' => $article->title,
                    'status' => $article->status,
                    'author' => $article->user ? $article->user->fname . ' ' . $article->user->lname : 'Unknown',
                    'date' => $article->status === 'published'
                        ? $article->published_at?->format('Y-m-d') ?? $article->created_at->format('Y-m-d')
                        : $article->created_at->format('Y-m-d'),
                ];
            });

        return response()->json($articles);
    }
}
