<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TokenExpiryMiddleware
{
    // Max token age (in minutes)
    protected $maxLifetime = 60 * 24 * 7; // 7 days

    // Max inactivity duration (in minutes)
    protected $maxIdleTime = 60 * 24 * 2; // 2 days

    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();
        $token = $user?->currentAccessToken();

        if (!$user || !$token) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $created = $token->created_at;
        $lastUsed = $token->last_used_at ?? $token->created_at;

        if (now()->diffInMinutes($created) > $this->maxLifetime) {
            $token->delete();
            return response()->json(['message' => 'Token expired (lifetime)'], 401);
        }

        if (now()->diffInMinutes($lastUsed) > $this->maxIdleTime) {
            $token->delete();
            return response()->json(['message' => 'Token expired (inactivity)'], 401);
        }

        // Optional: Update last_used_at field
        $token->forceFill(['last_used_at' => now()])->save();

        return $next($request);
    }
}
