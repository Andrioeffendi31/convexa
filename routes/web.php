<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SalesPageChatController;
use App\Http\Controllers\SalesPageController;
use App\Http\Controllers\SalesPageGenerationController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('sales-pages.index');
    }

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return redirect()->route('sales-pages.index');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/s/{token}', [SalesPageController::class, 'shared'])
    ->name('sales-pages.public');

Route::middleware('auth')->group(function () {
    Route::get('/sales-pages', [SalesPageController::class, 'index'])->name('sales-pages.index');
    Route::get('/sales-pages/create', [SalesPageController::class, 'create'])->name('sales-pages.create');
    Route::post('/sales-pages', [SalesPageController::class, 'store'])->name('sales-pages.store');
    Route::post('/sales-pages/generate', [SalesPageGenerationController::class, 'generate'])
        ->middleware('throttle:ai-generation')
        ->name('sales-pages.generate');
    Route::post('/sales-pages/{salesPage}/regenerate', [SalesPageGenerationController::class, 'regenerate'])
        ->middleware('throttle:ai-generation')
        ->name('sales-pages.regenerate');
    Route::post('/sales-pages/{salesPage}/chat', [SalesPageChatController::class, 'send'])
        ->middleware('throttle:ai-generation')
        ->name('sales-pages.chat.send');
    Route::post('/sales-pages/{salesPage}/retry-initial', [SalesPageChatController::class, 'retryInitial'])
        ->middleware('throttle:ai-generation')
        ->name('sales-pages.retry-initial');
    Route::post('/sales-pages/{salesPage}/code-version', [SalesPageChatController::class, 'saveCodeVersion'])
        ->name('sales-pages.code-version');
    Route::post('/sales-pages/{salesPage}/versions/activate', [SalesPageChatController::class, 'activateVersion'])
        ->name('sales-pages.versions.activate');
    Route::get('/sales-pages/{salesPage}/export', [SalesPageController::class, 'export'])->name('sales-pages.export');
    Route::get('/sales-pages/{salesPage}', [SalesPageController::class, 'show'])->name('sales-pages.show');
    Route::put('/sales-pages/{salesPage}', [SalesPageController::class, 'update'])->name('sales-pages.update');
    Route::delete('/sales-pages/{salesPage}', [SalesPageController::class, 'destroy'])->name('sales-pages.destroy');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
