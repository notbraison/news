<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Gate;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index(Request $request)
    {
        $user = $request->user();

        // Log the request details
        Log::info('User attempting to access users list', [
            'user_id' => $user->id,
            'email' => $user->email,
            'role' => $user->role,
        ]);

        // Explicit authorization check
        if ($user->role !== 'admin') {
            Log::warning('Unauthorized access attempt to users list', [
                'user_id' => $user->id,
                'email' => $user->email,
                'role' => $user->role,
            ]);
            return response()->json(['message' => 'Unauthorized. Admin access required.'], 403);
        }

        // Return JSON for API requests
        if ($request->wantsJson()) {
            $users = User::withCount('posts as article_count')
                ->select('id', 'fname', 'lname', 'email', 'role', 'number', 'created_at', 'updated_at')
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->fname . ' ' . $user->lname,
                        'fname' => $user->fname,
                        'lname' => $user->lname,
                        'email' => $user->email,
                        'role' => $user->role,
                        'number' => $user->number,
                        'article_count' => $user->article_count ?? 0,
                        'joined_at' => optional($user->created_at)->format('Y-m-d'),
                        'last_active' => optional($user->updated_at)->format('Y-m-d'),
                        'status' => 'active',
                    ];
                });

            return response()->json($users);
        }

        // Return view for web requests
        $users = User::paginate(15);
        return view('admin.users.index', compact('users'));
    }

    public function create()
    {
        return view('admin.users.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'fname' => 'required|string|max:30',
            'lname' => 'required|string|max:30',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|confirmed|min:8',
            'role' => 'required|in:admin,author,viewer,editor',
            'number' => 'nullable|string|max:15',
        ]);

        $user = User::create($validated);

        // Return JSON for API requests
        if (request()->wantsJson()) {
            return response()->json([
                'id' => $user->id,
                'name' => $user->fname . ' ' . $user->lname,
                'fname' => $user->fname,
                'lname' => $user->lname,
                'email' => $user->email,
                'role' => $user->role,
                'number' => $user->number,
                'article_count' => 0,
                'joined_at' => $user->created_at->format('Y-m-d'),
                'last_active' => $user->created_at->format('Y-m-d'),
                'status' => 'active',
            ], 201);
        }

        return redirect()->route('users.index')->with('success', 'User created successfully.');
    }

    public function show(User $user)
    {
        return view('admin.users.show', compact('user'));
    }

    public function edit(User $user)
    {
        return view('admin.users.edit', compact('user'));
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'fname' => 'required|string|max:255',
            'lname' => 'required|string|max:255',
            'email' => "required|email|unique:users,email,{$user->id}",
            'role' => 'required|in:admin,author,viewer,editor',
            'number' => 'nullable|string|max:20',
        ]);

        if ($request->filled('password')) {
            $validated['password'] = $request->validate(['password' => 'confirmed|min:8'])['password'];
        }

        $user->update($validated);

        // Return JSON for API requests
        if (request()->wantsJson()) {
            return response()->json([
                'id' => $user->id,
                'name' => $user->fname . ' ' . $user->lname,
                'fname' => $user->fname,
                'lname' => $user->lname,
                'email' => $user->email,
                'role' => $user->role,
                'number' => $user->number,
                'article_count' => $user->posts()->count(),
                'joined_at' => $user->created_at->format('Y-m-d'),
                'last_active' => $user->updated_at->format('Y-m-d'),
                'status' => 'active',
            ]);
        }

        return redirect()->route('users.index')->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        $user->delete();

        // Return JSON for API requests
        if (request()->wantsJson()) {
            return response()->json(['message' => 'User deleted successfully.']);
        }

        return redirect()->route('users.index')->with('success', 'User deleted.');
    }
}
