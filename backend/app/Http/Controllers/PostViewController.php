<?php

namespace App\Http\Controllers;

use App\Models\PostView;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PostViewController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'post_id' => 'required|exists:posts,id',
        ]);

        $userId = Auth::check() ? Auth::id() : null;

        PostView::create([
            'post_id' => $data['post_id'],
            'user_id' => $userId,
            'viewed_at' => now(),
        ]);

        return response()->json(['message' => 'Post view recorded'], 201);
    }

    public function index()
    {
        return PostView::with(['post', 'user'])->latest('viewed_at')->get();
    }
}
