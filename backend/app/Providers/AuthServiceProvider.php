<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        // Model::class => ModelPolicy::class (if using policies)
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        // Define the manage-users Gate with debugging
        Gate::define('manage-users', function ($user) {
            // Log the user's role for debugging
            Log::info('User role check for manage-users gate', [
                'user_id' => $user->id,
                'email' => $user->email,
                'role' => $user->role,
                'is_admin' => strtolower($user->role) === 'admin'
            ]);

            // Check role case-insensitively
            return strtolower($user->role) === 'admin';
        });
    }
}
