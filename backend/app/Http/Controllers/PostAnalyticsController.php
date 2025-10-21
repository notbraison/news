<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Post;
use App\Models\PostView;

class PostAnalyticsController extends Controller
{
    // Total views for a specific post
    public function postStats($id)
    {
        $totalViews = PostView::where('post_id', $id)->count();
        $uniqueUsers = PostView::where('post_id', $id)
                            ->whereNotNull('user_id')
                            ->distinct('user_id')
                            ->count();

        return response()->json([
            'post_id' => $id,
            'total_views' => $totalViews,
            'unique_users' => $uniqueUsers
        ]);
    }

    // Top N most viewed posts
    public function topPosts(Request $request)
    {
        $limit = $request->query('limit', 10);

        $top = DB::table('post_views')
            ->select('post_id', DB::raw('COUNT(*) as views'))
            ->groupBy('post_id')
            ->orderByDesc('views')
            ->limit($limit)
            ->get()
            ->map(function ($item) {
                $post = Post::find($item->post_id);
                return [
                    'post_id' => $item->post_id,
                    'title' => $post?->title,
                    'slug' => $post?->slug,
                    'views' => $item->views
                ];
            });

        return response()->json($top);
    }

    // Views over time for a single post
    public function viewsOverTime($id)
    {
        $views = DB::table('post_views')
            ->selectRaw('DATE(viewed_at) as date, COUNT(*) as views')
            ->where('post_id', $id)
            ->groupByRaw('DATE(viewed_at)')
            ->orderBy('date')
            ->get();

        return response()->json([
            'post_id' => $id,
            'daily_views' => $views
        ]);
    }

    // All-time daily views (all posts)
    public function totalViewsOverTime()
    {
        $views = DB::table('post_views')
            ->selectRaw('DATE(viewed_at) as date, COUNT(*) as views')
            ->groupByRaw('DATE(viewed_at)')
            ->orderBy('date')
            ->get();

        return response()->json($views);
    }
}
