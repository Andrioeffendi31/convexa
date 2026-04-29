<?php

namespace App\Http\Controllers;

use App\Models\SalesPage;
use App\Models\SalesPageMessage;
use App\Models\SalesPageVersion;
use App\Services\SalesPageGenerator;
use App\Support\SalesPageBlueprints;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SalesPageChatController extends Controller
{
    public function send(Request $request, SalesPage $salesPage, SalesPageGenerator $generator)
    {
        $this->authorize('update', $salesPage);
        $this->bootstrapInitialVersion($salesPage);

        $data = $request->validate([
            'message' => ['required', 'string', 'max:3000'],
            'version_id' => [
                'nullable',
                'integer',
                Rule::exists('sales_page_versions', 'id')->where(
                    fn ($query) => $query->where('sales_page_id', $salesPage->id),
                ),
            ],
        ]);

        $baseVersion = $this->resolveBaseVersion($salesPage, $data['version_id'] ?? null);
        $userMessage = $salesPage->messages()->create([
            'role' => 'user',
            'content' => $data['message'],
            'version_id' => $baseVersion->id,
        ]);

        $history = $salesPage->messages()
            ->latest()
            ->take(12)
            ->get(['role', 'content'])
            ->reverse()
            ->values()
            ->all();

        try {
            $result = $generator->reviseFromChat(
                $this->briefInput($salesPage),
                (string) ($baseVersion->html_content ?: $salesPage->html_content),
                $data['message'],
                $history,
            );
        } catch (\RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        $nextVersion = ((int) $salesPage->versions()->max('version_number')) + 1;
        $templateKey = $this->resolveTemplateKey($salesPage);
        $version = $salesPage->versions()->create([
            'version_number' => $nextVersion,
            'template_key' => $templateKey,
            'html_content' => $result['html_content'],
            'sections' => [],
            'generation_meta' => $result['generation_meta'],
            'source_user_message_id' => $userMessage->id,
            'summary' => $result['assistant_message'],
        ]);

        $assistantMessage = $salesPage->messages()->create([
            'role' => 'assistant',
            'content' => $result['assistant_message'],
            'version_id' => $version->id,
            'meta' => [
                'generation_meta' => $result['generation_meta'],
            ],
        ]);

        $salesPage->update([
            'template_key' => $templateKey,
            'html_content' => $version->html_content,
            'sections' => [],
            'generation_meta' => $version->generation_meta,
            'active_version_id' => $version->id,
        ]);

        return response()->json([
            'messages' => [
                $this->mapMessage($userMessage),
                $this->mapMessage($assistantMessage),
            ],
            'version' => $this->mapVersion($version),
            'generation_meta' => $result['generation_meta'],
        ]);
    }

    public function activateVersion(Request $request, SalesPage $salesPage)
    {
        $this->authorize('update', $salesPage);
        $this->bootstrapInitialVersion($salesPage);

        $data = $request->validate([
            'version_id' => [
                'required',
                'integer',
                Rule::exists('sales_page_versions', 'id')->where(
                    fn ($query) => $query->where('sales_page_id', $salesPage->id),
                ),
            ],
        ]);

        $version = $salesPage->versions()->whereKey($data['version_id'])->firstOrFail();

        $salesPage->update([
            'template_key' => $this->resolveTemplateKey($salesPage),
            'html_content' => $version->html_content,
            'sections' => [],
            'generation_meta' => $version->generation_meta,
            'active_version_id' => $version->id,
        ]);

        return response()->json([
            'version' => $this->mapVersion($version),
        ]);
    }

    public function retryInitial(
        Request $request,
        SalesPage $salesPage,
        SalesPageGenerator $generator,
    ) {
        $this->authorize('update', $salesPage);
        $this->bootstrapInitialVersion($salesPage);

        try {
            $result = $generator->generateHtmlFromBrief(
                $this->briefInput($salesPage),
            );
        } catch (\RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        $nextVersion = ((int) $salesPage->versions()->max('version_number')) + 1;
        $templateKey = $this->resolveTemplateKey($salesPage);
        $version = $salesPage->versions()->create([
            'version_number' => $nextVersion,
            'template_key' => $templateKey,
            'html_content' => $result['html_content'],
            'sections' => [],
            'generation_meta' => $result['generation_meta'],
            'summary' => $result['assistant_message'],
        ]);

        $assistantMessage = $salesPage->messages()->create([
            'role' => 'assistant',
            'content' => $result['assistant_message'],
            'version_id' => $version->id,
            'meta' => [
                'generation_meta' => $result['generation_meta'],
            ],
        ]);

        $salesPage->update([
            'template_key' => $templateKey,
            'html_content' => $version->html_content,
            'sections' => [],
            'generation_meta' => $version->generation_meta,
            'active_version_id' => $version->id,
        ]);

        return response()->json([
            'messages' => [$this->mapMessage($assistantMessage)],
            'version' => $this->mapVersion($version),
            'generation_meta' => $result['generation_meta'],
        ]);
    }

    public function saveCodeVersion(Request $request, SalesPage $salesPage)
    {
        $this->authorize('update', $salesPage);
        $this->bootstrapInitialVersion($salesPage);

        $data = $request->validate([
            'html_content' => ['required', 'string', 'min:40', 'max:2000000'],
            'summary' => ['nullable', 'string', 'max:160'],
        ]);

        $nextVersion = ((int) $salesPage->versions()->max('version_number')) + 1;
        $summary = trim((string) ($data['summary'] ?? 'Manual code edit saved.'));
        $templateKey = $this->resolveTemplateKey($salesPage);
        $generationMeta = [
            'provider' => 'manual',
            'model' => 'manual-edit',
            'status' => 'manual',
            'generated_at' => now()->toIso8601String(),
        ];

        $version = $salesPage->versions()->create([
            'version_number' => $nextVersion,
            'template_key' => $templateKey,
            'html_content' => $data['html_content'],
            'sections' => [],
            'generation_meta' => $generationMeta,
            'summary' => $summary,
        ]);

        $assistantMessage = $salesPage->messages()->create([
            'role' => 'assistant',
            'content' => $summary,
            'version_id' => $version->id,
            'meta' => [
                'generation_meta' => $generationMeta,
            ],
        ]);

        $salesPage->update([
            'template_key' => $templateKey,
            'html_content' => $version->html_content,
            'sections' => [],
            'generation_meta' => $generationMeta,
            'active_version_id' => $version->id,
        ]);

        return response()->json([
            'messages' => [$this->mapMessage($assistantMessage)],
            'version' => $this->mapVersion($version),
            'generation_meta' => $generationMeta,
        ]);
    }

    private function resolveBaseVersion(SalesPage $salesPage, ?int $versionId): SalesPageVersion
    {
        if ($versionId) {
            return $salesPage->versions()->whereKey($versionId)->firstOrFail();
        }

        if ($salesPage->activeVersion) {
            return $salesPage->activeVersion;
        }

        return $salesPage->versions()->latest('version_number')->firstOrFail();
    }

    private function bootstrapInitialVersion(SalesPage $salesPage): void
    {
        if ($salesPage->versions()->exists()) {
            return;
        }

        $initialHtml = (string) ($salesPage->html_content ?: $this->starterHtml($salesPage));
        $templateKey = $this->resolveTemplateKey($salesPage);
        $version = $salesPage->versions()->create([
            'version_number' => 1,
            'template_key' => $templateKey,
            'html_content' => $initialHtml,
            'sections' => [],
            'generation_meta' => $salesPage->generation_meta,
            'summary' => 'Initial draft ready for chat edits.',
        ]);

        $salesPage->messages()->create([
            'role' => 'assistant',
            'content' => 'Starter draft ready. Auto-generation runs when you open this workspace, then refine with chat.',
            'version_id' => $version->id,
        ]);

        $salesPage->update([
            'active_version_id' => $version->id,
            'template_key' => $templateKey,
            'html_content' => $version->html_content,
            'sections' => [],
        ]);
    }

    private function starterHtml(SalesPage $salesPage): string
    {
        return SalesPageBlueprints::renderStarterHtml([
            'product_name' => $salesPage->product_name,
            'product_description' => $salesPage->product_description,
            'target_audience' => $salesPage->target_audience,
            'price' => $salesPage->price,
            'key_features' => $salesPage->key_features ?? [],
            'unique_selling_points' => $salesPage->unique_selling_points ?? [],
        ], $salesPage->template_key);
    }

    private function briefInput(SalesPage $salesPage): array
    {
        return [
            'product_name' => $salesPage->product_name,
            'product_description' => $salesPage->product_description,
            'key_features' => $salesPage->key_features ?? [],
            'target_audience' => $salesPage->target_audience ?? '',
            'price' => $salesPage->price ?? '',
            'unique_selling_points' => $salesPage->unique_selling_points ?? [],
            'brief_meta' => $salesPage->brief_meta ?? [],
            'template_key' => $salesPage->template_key,
        ];
    }

    private function mapMessage(SalesPageMessage $message): array
    {
        return [
            'id' => $message->id,
            'role' => $message->role,
            'content' => $message->content,
            'version_id' => $message->version_id,
            'created_at' => $message->created_at?->toDateTimeString(),
        ];
    }

    private function mapVersion(SalesPageVersion $version): array
    {
        return [
            'id' => $version->id,
            'version_number' => $version->version_number,
            'template_key' => $version->template_key,
            'html_content' => (string) $version->html_content,
            'summary' => $version->summary,
            'generation_meta' => $version->generation_meta,
            'created_at' => $version->created_at?->toDateTimeString(),
        ];
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
