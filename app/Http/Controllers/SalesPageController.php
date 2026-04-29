<?php

namespace App\Http\Controllers;

use App\Models\SalesPage;
use App\Models\SalesPageVersion;
use App\Support\SalesPageBlueprints;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SalesPageController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', SalesPage::class);

        $filters = $request->validate([
            'product_name' => ['nullable', 'string', 'max:120'],
            'template_key' => ['nullable', 'string', 'in:aurora,foundry,studio,freeform'],
            'updated_from' => ['nullable', 'date'],
            'updated_to' => ['nullable', 'date', 'after_or_equal:updated_from'],
            'per_page' => ['nullable', 'integer', 'in:12,24,48'],
        ]);

        $productName = trim((string) ($filters['product_name'] ?? ''));
        $templateKey = (string) ($filters['template_key'] ?? '');
        $updatedFrom = (string) ($filters['updated_from'] ?? '');
        $updatedTo = (string) ($filters['updated_to'] ?? '');
        $perPage = (int) ($filters['per_page'] ?? 12);

        $pages = $request->user()
            ->salesPages()
            ->when($productName !== '', fn ($query) => $query->where(
                'product_name',
                'like',
                "%{$productName}%"
            ))
            ->when($templateKey !== '', fn ($query) => $query->where(
                'template_key',
                $templateKey
            ))
            ->when($updatedFrom !== '', fn ($query) => $query->whereDate(
                'updated_at',
                '>=',
                $updatedFrom
            ))
            ->when($updatedTo !== '', fn ($query) => $query->whereDate(
                'updated_at',
                '<=',
                $updatedTo
            ))
            ->latest()
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (SalesPage $page) => [
                'id' => $page->id,
                'product_name' => $page->product_name,
                'template_key' => $page->template_key,
                'headline' => $page->product_name,
                'updated_at' => $page->updated_at?->toDateTimeString(),
                'public_url' => $page->public_token
                    ? route('sales-pages.public', $page->public_token)
                    : null,
            ]);

        return Inertia::render('SalesPages/Index', [
            'pages' => $pages,
            'filters' => [
                'product_name' => $productName,
                'template_key' => $templateKey,
                'updated_from' => $updatedFrom,
                'updated_to' => $updatedTo,
                'per_page' => $perPage,
            ],
            'templates' => $this->templateOptions(),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', SalesPage::class);

        return Inertia::render('SalesPages/New', [
            'templates' => SalesPageBlueprints::options(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', SalesPage::class);
        $data = $this->normalizeInput($this->validateInput($request));
        $initialHtml = $this->starterHtml($data);
        $initialSummary = 'Starter draft created from your brief.';
        $generationMeta = null;
        $templateKey = SalesPageBlueprints::normalizeTemplateKey($data['template_key'] ?? null);

        try {
            $salesPage = $request->user()->salesPages()->create([
                ...$data,
                'public_token' => (string) Str::ulid(),
                'template_key' => $templateKey,
                'sections' => [],
                'html_content' => $initialHtml,
                'generation_meta' => $generationMeta,
            ]);

            $version = $salesPage->versions()->create([
                'version_number' => 1,
                'template_key' => $templateKey,
                'sections' => [],
                'html_content' => $initialHtml,
                'generation_meta' => $generationMeta,
                'summary' => $initialSummary,
            ]);

            $salesPage->messages()->create([
                'role' => 'assistant',
                'content' => $initialSummary,
                'version_id' => $version->id,
            ]);

            $salesPage->update([
                'active_version_id' => $version->id,
            ]);
        } catch (QueryException $exception) {
            $sqlMessage = strtolower((string) $exception->getMessage());

            if (
                str_contains($sqlMessage, 'column') ||
                str_contains($sqlMessage, 'does not exist') ||
                str_contains($sqlMessage, 'unknown column') ||
                str_contains($sqlMessage, 'undefined column')
            ) {
                throw ValidationException::withMessages([
                    'database' => 'Database schema is outdated. Please run migrations on Railway (`php artisan migrate --force`) and retry.',
                ]);
            }

            throw $exception;
        }

        return redirect()
            ->route('sales-pages.show', $salesPage)
            ->with('success', 'Workspace created. Auto-generation runs when you open the workspace.');
    }

    public function show(SalesPage $salesPage): Response
    {
        $this->authorize('view', $salesPage);
        $this->ensureInitialVersion($salesPage);

        $versions = $salesPage->versions()
            ->latest('version_number')
            ->get()
            ->map(fn (SalesPageVersion $version) => [
                'id' => $version->id,
                'version_number' => $version->version_number,
                'template_key' => $version->template_key,
                'html_content' => (string) $version->html_content,
                'summary' => $version->summary,
                'created_at' => $version->created_at?->toDateTimeString(),
            ])
            ->values();

        $messages = $salesPage->messages()
            ->get()
            ->map(fn ($message) => [
                'id' => $message->id,
                'role' => $message->role,
                'content' => $message->content,
                'version_id' => $message->version_id,
                'created_at' => $message->created_at?->toDateTimeString(),
            ])
            ->values();

        return Inertia::render('SalesPages/Chat', [
            'salesPage' => $this->mapSalesPage($salesPage),
            'messages' => $messages,
            'versions' => $versions,
        ]);
    }

    public function update(Request $request, SalesPage $salesPage): RedirectResponse
    {
        $this->authorize('update', $salesPage);
        $data = $this->normalizeInput(
            $this->validateInput($request, partial: true),
            $salesPage,
        );

        $salesPage->update($data);

        return redirect()
            ->route('sales-pages.show', $salesPage)
            ->with('success', 'Product brief updated.');
    }

    public function destroy(SalesPage $salesPage): RedirectResponse
    {
        $this->authorize('delete', $salesPage);
        $salesPage->delete();

        return redirect()
            ->route('sales-pages.index')
            ->with('success', 'Sales page deleted.');
    }

    public function export(SalesPage $salesPage)
    {
        $this->authorize('view', $salesPage);
        $this->ensureInitialVersion($salesPage);

        $html = (string) ($salesPage->html_content ?: $this->starterHtml([
            'product_name' => $salesPage->product_name,
            'product_description' => $salesPage->product_description,
            'target_audience' => $salesPage->target_audience,
            'price' => $salesPage->price,
            'template_key' => $salesPage->template_key,
        ]));

        $salesPage->update(['export_html' => $html]);
        $filename = $this->safeFilename($salesPage);

        return response($html)
            ->header('Content-Type', 'text/html; charset=UTF-8')
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
    }

    public function shared(string $token)
    {
        $salesPage = SalesPage::query()
            ->where('public_token', $token)
            ->firstOrFail();

        $html = (string) ($salesPage->html_content ?: $salesPage->export_html);

        if (trim($html) === '') {
            $html = $this->starterHtml([
                'product_name' => $salesPage->product_name,
                'product_description' => $salesPage->product_description,
                'target_audience' => $salesPage->target_audience,
                'price' => $salesPage->price,
                'template_key' => $salesPage->template_key,
            ]);
        }

        return response($html)->header('Content-Type', 'text/html; charset=UTF-8');
    }

    private function mapSalesPage(SalesPage $salesPage): array
    {
        return [
            'id' => $salesPage->id,
            'product_name' => $salesPage->product_name,
            'product_description' => $salesPage->product_description,
            'key_features' => $salesPage->key_features ?? [],
            'target_audience' => $salesPage->target_audience,
            'price' => $salesPage->price,
            'unique_selling_points' => $salesPage->unique_selling_points ?? [],
            'brief_meta' => $salesPage->brief_meta ?? [],
            'template_key' => $salesPage->template_key,
            'public_url' => $salesPage->public_token
                ? route('sales-pages.public', $salesPage->public_token)
                : null,
            'html_content' => (string) $salesPage->html_content,
            'active_version_id' => $salesPage->active_version_id,
            'generation_meta' => $salesPage->generation_meta,
            'updated_at' => $salesPage->updated_at?->toDateTimeString(),
        ];
    }

    private function templateOptions(): array
    {
        return [
            ...SalesPageBlueprints::options(),
            ['key' => 'freeform', 'name' => 'Freeform (legacy)'],
        ];
    }

    private function validateInput(Request $request, bool $partial = false): array
    {
        return $request->validate([
            'product_name' => ['nullable', 'string', 'max:120'],
            'product_description' => ['nullable', 'string', 'max:2000'],
            'key_features' => ['nullable', 'array'],
            'key_features.*' => ['string', 'max:120'],
            'target_audience' => ['nullable', 'string', 'max:160'],
            'price' => ['nullable', 'string', 'max:80'],
            'unique_selling_points' => ['nullable', 'array'],
            'unique_selling_points.*' => ['string', 'max:160'],
            'template_key' => $partial
                ? ['nullable', 'string', Rule::in(SalesPageBlueprints::keys())]
                : ['nullable', 'string', Rule::in(SalesPageBlueprints::keys())],
            'brief_meta' => ['nullable', 'array'],
            'brief_meta.problem_statement' => ['nullable', 'string', 'max:500'],
            'brief_meta.desired_outcome' => ['nullable', 'string', 'max:500'],
            'brief_meta.primary_cta' => ['nullable', 'string', 'max:120'],
            'brief_meta.secondary_cta' => ['nullable', 'string', 'max:120'],
            'brief_meta.brand_tone' => ['nullable', 'string', 'max:120'],
            'brief_meta.visual_direction' => ['nullable', 'string', 'max:500'],
            'brief_meta.proof_points' => ['nullable', 'array'],
            'brief_meta.proof_points.*' => ['string', 'max:200'],
            'brief_meta.objections' => ['nullable', 'array'],
            'brief_meta.objections.*' => ['string', 'max:200'],
            'brief_meta.competitors' => ['nullable', 'array'],
            'brief_meta.competitors.*' => ['string', 'max:120'],
        ]);
    }

    private function normalizeInput(array $data, ?SalesPage $existing = null): array
    {
        $productName = trim((string) ($data['product_name'] ?? $existing?->product_name ?? ''));
        if ($productName === '') {
            $productName = 'Untitled Product';
        }

        $productDescription = trim((string) ($data['product_description'] ?? $existing?->product_description ?? ''));
        if ($productDescription === '') {
            $productDescription = "Professional landing page for {$productName}.";
        }

        $targetAudience = trim((string) ($data['target_audience'] ?? $existing?->target_audience ?? ''));
        if ($targetAudience === '') {
            $targetAudience = 'Growth-focused teams';
        }

        $price = trim((string) ($data['price'] ?? $existing?->price ?? ''));
        if ($price === '') {
            $price = 'Contact sales';
        }

        $templateCandidate = (string) ($data['template_key'] ?? $existing?->template_key ?? '');
        $templateKey = $templateCandidate === 'freeform'
            ? 'freeform'
            : SalesPageBlueprints::normalizeTemplateKey($templateCandidate);

        return [
            'product_name' => $productName,
            'product_description' => $productDescription,
            'key_features' => $this->normalizeList(
                $data['key_features'] ?? $existing?->key_features ?? [],
                120
            ),
            'target_audience' => $targetAudience,
            'price' => $price,
            'unique_selling_points' => $this->normalizeList(
                $data['unique_selling_points'] ?? $existing?->unique_selling_points ?? [],
                160
            ),
            'template_key' => $templateKey,
            'brief_meta' => $this->normalizeBriefMeta(
                $data['brief_meta'] ?? $existing?->brief_meta ?? []
            ),
        ];
    }

    private function normalizeList(mixed $items, int $maxLength): array
    {
        if (! is_array($items)) {
            return [];
        }

        return array_values(array_filter(array_map(function ($item) use ($maxLength) {
            $clean = trim((string) $item);
            if ($clean === '') {
                return null;
            }

            return Str::limit($clean, $maxLength, '');
        }, $items)));
    }

    private function normalizeBriefMeta(mixed $briefMeta): array
    {
        if (! is_array($briefMeta)) {
            return [];
        }

        $meta = [
            'problem_statement' => trim((string) ($briefMeta['problem_statement'] ?? '')),
            'desired_outcome' => trim((string) ($briefMeta['desired_outcome'] ?? '')),
            'primary_cta' => trim((string) ($briefMeta['primary_cta'] ?? '')),
            'secondary_cta' => trim((string) ($briefMeta['secondary_cta'] ?? '')),
            'brand_tone' => trim((string) ($briefMeta['brand_tone'] ?? '')),
            'visual_direction' => trim((string) ($briefMeta['visual_direction'] ?? '')),
            'proof_points' => $this->normalizeList($briefMeta['proof_points'] ?? [], 200),
            'objections' => $this->normalizeList($briefMeta['objections'] ?? [], 200),
            'competitors' => $this->normalizeList($briefMeta['competitors'] ?? [], 120),
        ];

        return array_filter(
            $meta,
            fn ($value) => !(is_string($value) && $value === '') && !(is_array($value) && $value === [])
        );
    }

    private function starterHtml(array $data): string
    {
        return SalesPageBlueprints::renderStarterHtml(
            $data,
            $data['template_key'] ?? null,
        );
    }

    private function safeFilename(SalesPage $salesPage): string
    {
        $slug = Str::slug($salesPage->product_name);
        $slug = $slug !== '' ? Str::limit($slug, 40, '') : 'sales-page';

        return "{$slug}-{$salesPage->id}.html";
    }

    private function ensureInitialVersion(SalesPage $salesPage): void
    {
        if ($salesPage->versions()->exists()) {
            if (! $salesPage->active_version_id) {
                $latest = $salesPage->versions()->latest('version_number')->first();
                $salesPage->update([
                    'active_version_id' => $latest?->id,
                ]);
            }

            return;
        }

        $version = $salesPage->versions()->create([
            'version_number' => 1,
            'template_key' => $this->resolveTemplateKey($salesPage),
            'html_content' => (string) ($salesPage->html_content ?: $this->starterHtml([
                'product_name' => $salesPage->product_name,
                'product_description' => $salesPage->product_description,
                'target_audience' => $salesPage->target_audience,
                'price' => $salesPage->price,
                'template_key' => $salesPage->template_key,
            ])),
            'sections' => [],
            'generation_meta' => $salesPage->generation_meta,
            'summary' => 'Imported existing draft.',
        ]);

        $salesPage->messages()->create([
            'role' => 'assistant',
            'content' => 'Session initialized from existing draft.',
            'version_id' => $version->id,
        ]);

        $salesPage->update([
            'active_version_id' => $version->id,
            'template_key' => $this->resolveTemplateKey($salesPage),
            'html_content' => $version->html_content,
            'sections' => [],
        ]);
    }

    private function resolveTemplateKey(SalesPage $salesPage): string
    {
        $templateKey = (string) $salesPage->template_key;

        if ($templateKey === 'freeform') {
            return $templateKey;
        }

        return SalesPageBlueprints::normalizeTemplateKey($templateKey);
    }
}
