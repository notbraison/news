<?php
/* api.php */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\MeController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\PostRevisionController;
use App\Http\Controllers\PostViewController;
use App\Http\Controllers\PostAnalyticsController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\PostCategoryController;
use App\Http\Controllers\PostTagController;
use App\Http\Controllers\AttachmentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\BreakingNewsController;


// Handle OPTIONS requests globally
/* Route::options('/{any}', function () {
    return response()->json([], 204)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        ->header('Access-Control-Allow-Credentials', 'true');
})->where('any', '.*'); */

// Health check endpoint
Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now(),
        'environment' => env('APP_ENV'),
    ]);
});

// Public registration: only for viewer users
Route::post('/viewer-register', RegisterController::class);

//auth
Route::post('/login', [LoginController::class, 'login'])->name('login');

// Posts management
Route::apiResource('posts', PostController::class);
Route::get('/posts/slug/{slug}', [PostController::class, 'showBySlug']);

// Public categories routes
Route::apiResource('categories', CategoryController::class)->only(['index', 'show']);

//auth -Protected routes (require authentication) - real
Route::middleware('auth:sanctum')->group(function () {

    //user routes (protected)
    Route::post('/logout', [LogoutController::class, 'logout']);
    Route::get('/me', [MeController::class, 'me']);
    Route::put('/me', [MeController::class, 'update']);

    // Dashboard endpoints
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/recent-articles', [DashboardController::class, 'recentArticles']);

    // Users management (admin only)
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);

    // Categories management (admin and author)
    Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);

    // Post revisions (requires authentication)
    Route::get('/posts/{post}/revisions', [PostRevisionController::class, 'index']);
    Route::get('/revisions/{id}', [PostRevisionController::class, 'show']);
    Route::post('/revisions', [PostRevisionController::class, 'store']);

    //post views track post analytics
    Route::post('/post-views', [PostViewController::class, 'store']);
    Route::get('/post-views', [PostViewController::class, 'index']);

    //post analytics
    Route::get('/post/{id}', [PostAnalyticsController::class, 'postStats']);
    Route::get('/top-posts', [PostAnalyticsController::class, 'topPosts']);
    Route::get('/views-over-time/{id}', [PostAnalyticsController::class, 'viewsOverTime']);
    Route::get('/total-views-over-time', [PostAnalyticsController::class, 'totalViewsOverTime']);

    //post categories pivot table
    Route::prefix('post-categories')->group(function () {
        Route::post('/{post}/attach', [PostCategoryController::class, 'attach']);
        Route::post('/{post}/detach', [PostCategoryController::class, 'detach']);
        Route::put('/{post}', [PostCategoryController::class, 'sync']);
        Route::get('/{post}', [PostCategoryController::class, 'getCategoriesForPost']);
    });

    //post tags pivot table
    Route::prefix('post-tags')->group(function () {
        Route::post('/', [PostTagController::class, 'attach']);           // attach
        Route::put('/{post}', [PostTagController::class, 'sync']);        // sync
        Route::delete('/{post}', [PostTagController::class, 'detach']);   // detach
        Route::get('/{post}', [PostTagController::class, 'getTagsForPost']); // fetch
    });

    // Tags management
    Route::apiResource('tags', TagController::class);

    // Media management
    Route::apiResource('media', MediaController::class);
    Route::get('/media/by-url', [MediaController::class, 'findByUrl']);
    Route::delete('/media/by-url', [MediaController::class, 'deleteByUrl']);
    Route::post('/media/multiple', [MediaController::class, 'storeMultiple']);
    Route::put('/media/order', [MediaController::class, 'updateOrder']);
    Route::get('/posts/{postId}/media', [MediaController::class, 'getByPost']);

    // Comments management (admin only)
    Route::apiResource('comments', CommentController::class);
    Route::patch('/comments/{id}/approve', [CommentController::class, 'approve']);
    Route::patch('/comments/{id}/mark-spam', [CommentController::class, 'markSpam']);

    // Comment creation (requires auth)
    Route::post('/comments', [CommentController::class, 'store']);

    // Attachments management
    Route::apiResource('attachments', AttachmentController::class);

});

// Public: fetch posts for a category by slug with pagination
Route::get('/categories/{slug}/posts', [App\Http\Controllers\CategoryController::class, 'postsBySlug']);

// Public comment viewing (no auth required)
Route::get('/posts/{post}/comments', [CommentController::class, 'commentsByPost']);

// Breaking news endpoints
Route::get('/breaking-news', [BreakingNewsController::class, 'getBreakingNews']);
Route::get('/breaking-news/settings', [BreakingNewsController::class, 'getSettings']);
Route::post('/breaking-news/settings', [BreakingNewsController::class, 'updateSettings']);

// Test endpoint for comments
Route::get('/comments/test', [CommentController::class, 'test']);
