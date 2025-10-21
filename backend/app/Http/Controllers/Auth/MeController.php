<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class MeController
{
    public function me(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'id' => $user->id,
            'fname' => $user->fname,
            'lname' => $user->lname,
            'name' => $user->fname . ' ' . $user->lname,
            'email' => $user->email,
            'role' => $user->role,
            'number' => $user->number,
            'created_at' => $user->created_at,
            'article_count' => $user->posts()->count(),
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'fname' => 'sometimes|required|string|max:255',
            'lname' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'email', Rule::unique('users')->ignore($user->id)],
            'number' => 'sometimes|nullable|string|max:20',
            'current_password' => 'required_with:new_password|string',
            'new_password' => 'sometimes|required|string|min:8|confirmed',
        ]);

        // Log the update attempt
        Log::info('User profile update attempt', [
            'user_id' => $user->id,
            'email' => $user->email,
        ]);

        // Verify current password if changing password
        if (isset($validated['current_password'])) {
            if (!Hash::check($validated['current_password'], $user->password)) {
                return response()->json(['message' => 'Current password is incorrect'], 422);
            }
            $validated['password'] = Hash::make($validated['new_password']);
            unset($validated['current_password'], $validated['new_password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->id,
                'fname' => $user->fname,
                'lname' => $user->lname,
                'name' => $user->fname . ' ' . $user->lname,
                'email' => $user->email,
                'role' => $user->role,
                'number' => $user->number,
                'created_at' => $user->created_at,
                'article_count' => $user->posts()->count(),
            ]
        ]);
    }
}
