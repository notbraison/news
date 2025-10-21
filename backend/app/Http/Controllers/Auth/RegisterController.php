<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use Illuminate\Http\Request;

class RegisterController
{
    public function __invoke(Request $request)
    {
        $data = $request->validate([
            'fname' => 'required|string|max:30',
            'lname' => 'required|string|max:30',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'number' => 'nullable|string|max:15',
        ]);

        $user = User::create([
            ...$data,
            'password' => bcrypt($data['password']),
            'role' => 'viewer',
        ]);

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'user' => $user,
            'access_token' => $token,
        ], 201);
    }
}
