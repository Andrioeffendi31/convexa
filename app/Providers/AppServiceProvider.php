<?php

namespace App\Providers;

use App\Models\SalesPage;
use App\Policies\SalesPagePolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(SalesPage::class, SalesPagePolicy::class);

        RateLimiter::for('ai-generation', function (Request $request) {
            return Limit::perMinute(20)
                ->by((string) optional($request->user())->id ?: $request->ip())
                ->response(fn () => response()->json([
                    'message' => 'Too many generation requests. Please wait a minute and try again.',
                ], 429));
        });

        Vite::prefetch(concurrency: 3);
    }
}
