<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use PDO;

class MemoryOptimizationServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Only apply optimizations in production
        if ($this->app->environment('production')) {
            $this->optimizeMemory();
        }
    }

    /**
     * Apply memory optimizations
     */
    private function optimizeMemory(): void
    {
        // Optimize database connections
        $this->optimizeDatabase();

        // Optimize cache
        $this->optimizeCache();

        // Set memory limits
        $this->setMemoryLimits();

        // Optimize logging
        $this->optimizeLogging();
    }

    /**
     * Optimize database connections
     */
    private function optimizeDatabase(): void
    {
        // Set database connection limits
        config(['database.connections.mysql.options' => [
            PDO::ATTR_PERSISTENT => false,
            PDO::MYSQL_ATTR_USE_BUFFERED_QUERY => false,
        ]]);

        // Monitor query performance
        if (config('app.debug') === false) {
            DB::listen(function ($query) {
                if ($query->time > 1000) { // Log slow queries (>1s)
                    Log::warning('Slow query detected', [
                        'sql' => $query->sql,
                        'time' => $query->time,
                        'bindings' => $query->bindings,
                    ]);
                }
            });
        }
    }

    /**
     * Optimize cache settings
     */
    private function optimizeCache(): void
    {
        // Set cache TTL for better memory management
        config(['cache.ttl' => 3600]); // 1 hour default TTL

        // Clear old cache entries periodically
        if (rand(1, 100) === 1) { // 1% chance on each request
            Cache::flush();
        }
    }

    /**
     * Set memory limits
     */
    private function setMemoryLimits(): void
    {
        // Set PHP memory limit
        ini_set('memory_limit', '256M');

        // Set max execution time
        ini_set('max_execution_time', 30);

        // Optimize garbage collection
        gc_enable();
    }

    /**
     * Optimize logging
     */
    private function optimizeLogging(): void
    {
        // Set log level to reduce memory usage
        config(['logging.channels.stack.level' => 'warning']);

        // Limit log file size
        config(['logging.channels.single.path' => storage_path('logs/laravel.log')]);
    }
}
