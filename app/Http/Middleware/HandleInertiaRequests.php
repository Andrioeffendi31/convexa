<?php

namespace App\Http\Middleware;

use App\Models\SalesPage;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'recentSalesPages' => fn () => $request->user()
                ? SalesPage::where('user_id', $request->user()->id)
                    ->latest('updated_at')
                    ->limit(30)
                    ->get(['id', 'product_name', 'updated_at'])
                    ->map(fn ($page) => [
                        'id' => $page->id,
                        'product_name' => $page->product_name,
                        'updated_at' => $page->updated_at?->toIso8601String(),
                    ])
                    ->values()
                : [],
        ];
    }
}
