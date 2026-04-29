<?php

namespace App\Http\Controllers;

use App\Models\SalesPage;
use App\Services\SalesPageGenerator;
use Illuminate\Http\Request;

class SalesPageGenerationController extends Controller
{
    public function generate(Request $request, SalesPageGenerator $generator)
    {
        $this->authorize('create', SalesPage::class);
        $data = $this->validateBrief($request);

        try {
            $result = $generator->generateHtmlFromBrief($data);
        } catch (\RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'assistant_message' => $result['assistant_message'],
            'html_content' => $result['html_content'],
            'generation_meta' => $result['generation_meta'],
        ]);
    }

    public function regenerate(
        Request $request,
        SalesPage $salesPage,
        SalesPageGenerator $generator,
    ) {
        $this->authorize('update', $salesPage);

        $data = $request->validate([
            ...$this->briefRules(partial: true),
            'instruction' => ['required', 'string', 'max:3000'],
            'current_html' => ['nullable', 'string'],
        ]);

        $brief = [
            'product_name' => $data['product_name'] ?? $salesPage->product_name,
            'product_description' => $data['product_description'] ?? $salesPage->product_description,
            'key_features' => $data['key_features'] ?? $salesPage->key_features ?? [],
            'target_audience' => $data['target_audience'] ?? $salesPage->target_audience,
            'price' => $data['price'] ?? $salesPage->price,
            'unique_selling_points' => $data['unique_selling_points'] ?? $salesPage->unique_selling_points ?? [],
        ];

        $currentHtml = trim((string) ($data['current_html'] ?? $salesPage->html_content));

        try {
            $result = $generator->reviseFromChat(
                $brief,
                $currentHtml,
                $data['instruction'],
            );
        } catch (\RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        $salesPage->update([
            'template_key' => 'freeform',
            'html_content' => $result['html_content'],
            'generation_meta' => $result['generation_meta'],
            'sections' => [],
        ]);

        return response()->json([
            'assistant_message' => $result['assistant_message'],
            'html_content' => $result['html_content'],
            'generation_meta' => $result['generation_meta'],
        ]);
    }

    private function validateBrief(Request $request): array
    {
        return $request->validate($this->briefRules());
    }

    private function briefRules(bool $partial = false): array
    {
        return [
            'product_name' => [$partial ? 'sometimes' : 'required', 'string', 'max:120'],
            'product_description' => [$partial ? 'sometimes' : 'required', 'string', 'max:2000'],
            'key_features' => ['nullable', 'array'],
            'key_features.*' => ['string', 'max:120'],
            'target_audience' => ['nullable', 'string', 'max:160'],
            'price' => ['nullable', 'string', 'max:80'],
            'unique_selling_points' => ['nullable', 'array'],
            'unique_selling_points.*' => ['string', 'max:160'],
        ];
    }
}
