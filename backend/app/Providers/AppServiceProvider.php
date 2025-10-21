<?php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        ini_set('max_execution_time', 0);
    set_time_limit(0);

        // Force HTTPS in production
        if (env('FORCE_HTTPS', false)) {
            URL::forceScheme('https');
        }

        // Trust Railway proxies
        if (env('APP_ENV') === 'production') {
            Request::setTrustedProxies(['0.0.0.0/0', '::/0'], Request::HEADER_X_FORWARDED_FOR | Request::HEADER_X_FORWARDED_HOST | Request::HEADER_X_FORWARDED_PORT | Request::HEADER_X_FORWARDED_PROTO);
        }
    }

    public function register(): void
    {
        //
    }
}
