<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

class SalesPageGenerator
{
    private const OUTPUT_SCHEMA = '{"assistant_message":"...","html_content":"<!doctype html>..."}';

    public function generateHtmlFromBrief(array $input): array
    {
        $prompt = $this->buildInitialHtmlPrompt($input);
        $responseJson = $this->requestStructuredJson($prompt);
        $decoded = $this->decodeJson(data_get($responseJson, 'choices.0.message.content'));

        return [
            'assistant_message' => (string) ($decoded['assistant_message'] ?? 'Created a first draft based on your brief.'),
            'html_content' => $this->normalizeHtmlContent($decoded['html_content'] ?? null),
            'generation_meta' => $this->buildGenerationMeta($prompt, $responseJson),
        ];
    }

    public function reviseFromChat(
        array $input,
        string $currentHtml,
        string $instruction,
        array $messageHistory = [],
    ): array {
        $prompt = $this->buildChatHtmlPrompt(
            $input,
            $currentHtml,
            $instruction,
            $messageHistory,
        );

        $responseJson = $this->requestStructuredJson($prompt);
        $decoded = $this->decodeJson(data_get($responseJson, 'choices.0.message.content'));

        return [
            'assistant_message' => (string) ($decoded['assistant_message'] ?? 'Updated the HTML draft.'),
            'html_content' => $this->normalizeHtmlContent($decoded['html_content'] ?? null, $currentHtml),
            'generation_meta' => $this->buildGenerationMeta($prompt, $responseJson),
        ];
    }

    private function requestStructuredJson(string $prompt): array
    {
        $this->ensureExecutionWindow();
        $lastStatus = 500;
        $lastBody = '';
        $requestDeadline = microtime(true) + $this->requestBudgetSeconds();

        foreach ($this->modelCandidates() as $model) {
            $remainingSeconds = (int) floor($requestDeadline - microtime(true));
            if ($remainingSeconds <= 1) {
                $lastStatus = 408;
                $lastBody = 'request budget exceeded';
                break;
            }

            $perRequestTimeout = min(
                $this->requestTimeoutSeconds(),
                max(2, $remainingSeconds - 1),
            );

            try {
                $response = $this->httpClient()
                    ->connectTimeout($this->connectTimeoutSeconds())
                    ->timeout($perRequestTimeout)
                    ->post($this->chatCompletionsUrl(), [
                        'model' => $model,
                        'temperature' => 0.55,
                        'response_format' => ['type' => 'json_object'],
                        'messages' => [
                            [
                                'role' => 'system',
                                'content' => 'You are an elite landing page designer and conversion copywriter. Return JSON only.',
                            ],
                            ['role' => 'user', 'content' => $prompt],
                        ],
                    ]);
            } catch (ConnectionException $exception) {
                $lastStatus = 408;
                $lastBody = (string) $exception->getMessage();
                continue;
            }

            if ($response->successful()) {
                return $response->json();
            }

            $lastStatus = $response->status();
            $lastBody = (string) $response->body();

            // Retry with next model only for likely model-specific failures.
            if (! in_array($lastStatus, [400, 403, 404, 422, 429, 500, 503], true)) {
                break;
            }
        }

        throw new \RuntimeException($this->resolveErrorMessage($lastStatus, $lastBody));
    }

    private function requestTimeoutSeconds(): int
    {
        $value = (int) config('services.ai.request_timeout_seconds', 12);

        return max(2, $value);
    }

    private function connectTimeoutSeconds(): int
    {
        $value = (int) config('services.ai.connect_timeout_seconds', 4);

        return max(1, $value);
    }

    private function requestBudgetSeconds(): int
    {
        $value = (int) config('services.ai.request_budget_seconds', 22);

        return max(6, $value);
    }

    private function ensureExecutionWindow(): void
    {
        $targetSeconds = $this->requestBudgetSeconds() + 8;
        $current = (int) ini_get('max_execution_time');

        if ($current === 0 || $current >= $targetSeconds) {
            return;
        }

        @set_time_limit($targetSeconds);
    }

    private function httpClient()
    {
        $client = Http::withToken($this->apiKey());

        if ($this->isOpenRouterProvider()) {
            $headers = [];
            $referer = trim((string) config('services.ai.http_referer'));
            $appTitle = trim((string) config('services.ai.app_title'));

            if ($referer !== '') {
                $headers['HTTP-Referer'] = $referer;
            }

            if ($appTitle !== '') {
                $headers['X-Title'] = $appTitle;
            }

            if ($headers !== []) {
                $client = $client->withHeaders($headers);
            }
        }

        return $client;
    }

    private function apiKey(): string
    {
        $key = (string) config('services.ai.key');

        if ($key === '') {
            throw new \RuntimeException('AI_API_KEY is not configured.');
        }

        return $key;
    }

    private function model(): string
    {
        $model = trim((string) config('services.ai.model'));

        if ($model === '') {
            throw new \RuntimeException('AI_MODEL is not configured.');
        }

        return $model;
    }

    private function modelCandidates(): array
    {
        $primary = $this->model();
        $fallbacks = config('services.ai.fallback_models', []);

        if (! is_array($fallbacks)) {
            $fallbacks = [];
        }

        $all = array_merge([$primary], $fallbacks);

        return array_values(array_unique(array_filter(array_map(
            fn ($item) => trim((string) $item),
            $all
        ))));
    }

    private function chatCompletionsUrl(): string
    {
        $baseUrl = trim((string) config('services.ai.base_url'));

        if ($baseUrl === '') {
            throw new \RuntimeException('AI_BASE_URL is not configured.');
        }

        return rtrim($baseUrl, '/').'/chat/completions';
    }

    private function buildInitialHtmlPrompt(array $input): string
    {
        $templateKey = trim((string) ($input['template_key'] ?? ''));

        $instructions = [
            'Create a complete and professional single-file landing page in English.',
            'Return JSON only with this schema:',
            self::OUTPUT_SCHEMA,
            'Treat product brief as initial context only. It can be expanded for quality and persuasion.',
            'html_content must be a complete HTML document including <!doctype html>, <head>, and <body>.',
            'Use inline CSS inside a <style> block. Keep JS optional and inline only if needed.',
            'The page must include: navbar, headline, sub-headline, product description, benefits, features, social proof, pricing, CTA, and footer.',
            'Navbar must be sticky on top (position: sticky; top: 0; z-index high), with readable background and responsive behavior on mobile.',
            'Include at least 2 visual images using direct Pexels CDN URLs (images.pexels.com), not pexels.com page links.',
            'Each image must have descriptive alt text and professional composition (hero and/or feature-supporting visuals).',
            'Make it responsive for desktop and mobile and visually polished by default.',
            'Include print-friendly CSS for PDF export: @media print, @page margin, avoid clipped content and preserve readable contrast.',
            'Make visual hierarchy explicit with strong typography scale, clear spacing rhythm, and premium CTA styling.',
            'Use credible, concrete, professional copy with no hype spam.',
            'If details are missing, infer reasonable defaults consistent with B2B professional landing pages.',
            'Build a coherent narrative: problem -> value -> proof -> offer -> CTA.',
            'Avoid fake claims, avoid overpromising, and avoid generic filler text.',
            'assistant_message must be one short sentence describing what you generated.',
        ];

        if ($this->isLlamaVersatileModel()) {
            $instructions = array_merge($instructions, [
                'Llama optimization: use explicit section labels and preserve section order strictly.',
                'Llama optimization: keep each headline concise, concrete, and outcome-oriented.',
                'Llama optimization: keep features and benefits distinct and non-duplicative.',
                'Llama optimization: avoid overly poetic tone and keep business language direct.',
            ]);
        }

        $context = [
            'Enhanced product brief dossier:',
            $this->buildEnhancedBriefDossier($input),
            '',
            'Template blueprint contract (follow strictly):',
            $this->templatePlaybook($templateKey),
            '',
            'Pexels dummy image reference (use direct src URLs):',
            $this->pexelsImageReference(),
            '',
            'Output quality checklist:',
            '- Strong above-the-fold clarity with one primary CTA.',
            '- Pricing block readable in under 5 seconds.',
            '- Benefit bullets specific and scannable.',
            '- Footer feels credible and complete.',
            'assistant_message must be one short sentence describing what you generated.',
        ];

        return implode("\n", array_merge($instructions, ['---'], $context));
    }

    private function buildChatHtmlPrompt(
        array $input,
        string $currentHtml,
        string $instruction,
        array $messageHistory = [],
    ): string {
        $templateKey = trim((string) ($input['template_key'] ?? ''));
        $featureList = $this->stringifyList($input['key_features'] ?? []);
        $uspList = $this->stringifyList($input['unique_selling_points'] ?? []);
        $pricing = trim((string) ($input['price'] ?? ''));
        $audience = trim((string) ($input['target_audience'] ?? ''));

        $history = collect($messageHistory)
            ->filter(fn ($item) => is_array($item))
            ->map(function ($item) {
                $role = trim((string) ($item['role'] ?? 'user'));
                $content = trim((string) ($item['content'] ?? ''));

                if ($content === '') {
                    return null;
                }

                return strtoupper($role).': '.$content;
            })
            ->filter()
            ->take(-12)
            ->values()
            ->all();

        $instructions = [
            'You are editing an existing landing page HTML based on user chat instructions.',
            'Return JSON only with this schema:',
            self::OUTPUT_SCHEMA,
            'Treat product brief as initial context only. The latest user instruction has highest priority.',
            'Always return the full updated HTML document, not partial snippets.',
            'Preserve valid semantic HTML and polished styling.',
            'Keep template identity consistent with the selected template blueprint unless user explicitly asks to switch style.',
            'Navbar must remain sticky and responsive after each revision.',
            'If visuals are missing or weak, add/improve dummy visuals using direct Pexels CDN URLs (images.pexels.com).',
            'Do not use pexels.com page URLs in <img src>; use direct image files with query params.',
            'Preserve or improve responsive behavior and visual hierarchy.',
            'Keep or improve print-friendly CSS for PDF export: @media print + @page + readable print contrast.',
            'Keep the output professional, conversion-oriented, and business-ready.',
            'assistant_message must summarize the change in one short sentence.',
        ];

        $context = [
            "Product name: {$input['product_name']}",
            "Product brief: {$input['product_description']}",
            $featureList ? "Key features: {$featureList}" : 'Key features: (none provided)',
            $audience !== '' ? "Target audience: {$audience}" : 'Target audience: (not specified)',
            $pricing !== '' ? "Price: {$pricing}" : 'Price: (not specified)',
            $uspList ? "Unique selling points: {$uspList}" : 'Unique selling points: (none provided)',
            "Selected template: ".($templateKey !== '' ? $templateKey : 'aurora'),
            'Template blueprint contract:',
            $this->templatePlaybook($templateKey),
            'Pexels dummy image reference:',
            $this->pexelsImageReference(),
            'Current HTML draft:',
            $currentHtml,
            'Enhanced user instruction:',
            $this->enhanceUserInstruction($instruction),
        ];

        if ($history !== []) {
            $context[] = 'Recent chat history: '.json_encode($history);
        }

        return implode("\n", array_merge($instructions, ['---'], $context));
    }

    private function stringifyList(array $items): string
    {
        $clean = array_values(
            array_filter(array_map(fn ($item) => trim((string) $item), $items)),
        );

        return implode(', ', $clean);
    }

    private function enhanceUserInstruction(string $instruction): string
    {
        $raw = trim($instruction);
        $normalized = $raw !== '' ? $raw : 'Improve the page professionally.';
        $lower = strtolower($normalized);
        $wantsRewrite = str_contains($lower, 'rewrite') || str_contains($lower, 'redesign') || str_contains($lower, 'revamp');
        $wantsSimple = str_contains($lower, 'simple') || str_contains($lower, 'minimal');
        $wantsBold = str_contains($lower, 'bold') || str_contains($lower, 'premium') || str_contains($lower, 'modern');

        $designDirection = match (true) {
            $wantsSimple => 'Minimal, clean, and highly readable with restrained color accents.',
            $wantsBold => 'Bold and premium with stronger contrast, larger headings, and high-emphasis CTA.',
            default => 'Professional and modern with balanced hierarchy and polished spacing.',
        };

        $scopeDirection = $wantsRewrite
            ? 'Apply a full-page redesign while preserving product truth and business context.'
            : 'Apply focused improvements while preserving working sections that are already strong.';

        $modelHint = str_contains(strtolower($this->model()), 'llama-3.3-70b-versatile')
            ? 'For llama-3.3-70b-versatile: keep instructions explicit, section by section, and avoid vague wording.'
            : 'Keep structure explicit and output deterministic.';

        return implode("\n", [
            "Primary user request: {$normalized}",
            '',
            'Execution brief:',
            "- {$scopeDirection}",
            '- Prioritize conversion clarity: clear value proposition, proof, offer, and CTA sequence.',
            "- Design direction: {$designDirection}",
            '- Keep visual quality high: consistent typography scale, spacing rhythm, card hierarchy, and button prominence.',
            '- Keep copy quality high: concise, concrete, credible, and business-ready English.',
            '- Ensure responsive layout quality for desktop and mobile.',
            '- Keep navbar, hero, benefits, features, social proof, pricing, CTA, and footer coherent.',
            '- Keep navbar sticky on top with clear contrast and good mobile usability.',
            '- Add or improve visuals with direct Pexels CDN image URLs and proper alt text when relevant.',
            '',
            'Technical output constraints:',
            '- Return a complete single-file HTML document.',
            '- Keep semantic HTML valid and maintainable.',
            '- Keep CSS inline in <style> with clear structure.',
            '- When using dummy images, use direct links from images.pexels.com (not page links).',
            '- Avoid broken links, placeholder gibberish, and visual clutter.',
            "- {$modelHint}",
        ]);
    }

    private function templatePlaybook(string $templateKey): string
    {
        $normalized = strtolower(trim($templateKey));

        return match ($normalized) {
            'foundry' => implode("\n", [
                '- Use Foundry Enterprise style: dark premium surfaces, high-contrast cyan accent, executive tone.',
                '- Keep section order: sticky navbar, hero, benefits, feature breakdown, social proof, pricing, CTA, footer.',
                '- Use structured cards and concise outcome-oriented enterprise copy.',
            ]),
            'studio' => implode("\n", [
                '- Use Studio Product style: warm modern product storytelling with orange accents and clean cards.',
                '- Keep section order: sticky navbar, hero, benefits, features, social proof, pricing, CTA, footer.',
                '- Emphasize product clarity, scannability, and visual balance.',
            ]),
            'freeform' => implode("\n", [
                '- Use professional freeform style with coherent hierarchy and modern SaaS conventions.',
                '- Keep required section order and ensure sticky responsive navbar.',
                '- Prioritize readability, spacing rhythm, and conversion clarity.',
            ]),
            default => implode("\n", [
                '- Use Aurora SaaS style: clean light theme, trust-first look, strong but minimal dark CTA accents.',
                '- Keep section order: sticky navbar, hero, benefits, feature breakdown, social proof, pricing, CTA, footer.',
                '- Maintain premium whitespace and calm professional tone.',
            ]),
        };
    }

    private function pexelsImageReference(): string
    {
        return implode("\n", [
            '- https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1600',
            '- https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1600',
            '- https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1600',
            '- https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg?auto=compress&cs=tinysrgb&w=1600',
        ]);
    }

    private function buildEnhancedBriefDossier(array $input): string
    {
        $productName = trim((string) ($input['product_name'] ?? ''));
        $productBrief = trim((string) ($input['product_description'] ?? ''));
        $audience = trim((string) ($input['target_audience'] ?? ''));
        $price = trim((string) ($input['price'] ?? ''));
        $templateKey = trim((string) ($input['template_key'] ?? ''));
        $featureList = $this->stringifyList($input['key_features'] ?? []);
        $uspList = $this->stringifyList($input['unique_selling_points'] ?? []);
        $briefMeta = is_array($input['brief_meta'] ?? null) ? $input['brief_meta'] : [];
        $problemStatement = trim((string) ($briefMeta['problem_statement'] ?? ''));
        $desiredOutcome = trim((string) ($briefMeta['desired_outcome'] ?? ''));
        $brandTone = trim((string) ($briefMeta['brand_tone'] ?? ''));
        $primaryCta = trim((string) ($briefMeta['primary_cta'] ?? ''));
        $secondaryCta = trim((string) ($briefMeta['secondary_cta'] ?? ''));
        $visualDirection = trim((string) ($briefMeta['visual_direction'] ?? ''));
        $proofPoints = $this->stringifyList($briefMeta['proof_points'] ?? []);
        $objections = $this->stringifyList($briefMeta['objections'] ?? []);
        $competitors = $this->stringifyList($briefMeta['competitors'] ?? []);

        $positioning = $uspList !== ''
            ? "Position around these differentiators: {$uspList}."
            : 'Position around measurable speed, clarity, and operational value.';

        $voice = $audience !== ''
            ? 'Tone: confident, professional, and aligned to decision-makers.'
            : 'Tone: professional B2B-default with clear decision-oriented language.';

        return implode("\n", [
            "- Product name: {$productName}",
            "- Product brief (raw): {$productBrief}",
            '- Product brief (interpreted): Focus on business outcomes, reduced friction, and faster implementation value.',
            '- Core promise to emphasize: Help users achieve better outcomes with less complexity.',
            '- Primary customer pain: '.($problemStatement !== '' ? $problemStatement : 'Not specified, infer top operational pain point.'),
            '- Desired business outcome: '.($desiredOutcome !== '' ? $desiredOutcome : 'Not specified, infer measurable positive outcome.'),
            '- Target audience: '.($audience !== '' ? $audience : 'Not specified, infer realistic B2B buyer persona.'),
            '- Key features: '.($featureList !== '' ? $featureList : 'Not specified, infer 3 practical capabilities.'),
            '- Unique selling points: '.($uspList !== '' ? $uspList : 'Not specified, infer credible differentiation.'),
            '- Pricing context: '.($price !== '' ? $price : 'Not specified, provide neutral professional pricing placeholder.'),
            '- Template blueprint preference: '.($templateKey !== '' ? $templateKey : 'aurora'),
            '- Brand tone direction: '.($brandTone !== '' ? $brandTone : 'Professional, clear, confident, and trustworthy.'),
            '- Visual direction: '.($visualDirection !== '' ? $visualDirection : 'Modern SaaS style with clean cards and high readability.'),
            '- Primary CTA preference: '.($primaryCta !== '' ? $primaryCta : 'Start free trial'),
            '- Secondary CTA preference: '.($secondaryCta !== '' ? $secondaryCta : 'Book a demo'),
            '- Proof points available: '.($proofPoints !== '' ? $proofPoints : 'Not specified, create realistic placeholders.'),
            '- Common objections to answer: '.($objections !== '' ? $objections : 'Not specified, infer top 2 objections.'),
            '- Alternative/competitor references: '.($competitors !== '' ? $competitors : 'Not specified.'),
            "- Positioning direction: {$positioning}",
            "- {$voice}",
        ]);
    }

    private function isLlamaVersatileModel(): bool
    {
        return str_contains(strtolower($this->model()), 'llama-3.3-70b-versatile');
    }

    private function decodeJson(?string $content): array
    {
        if (! $content) {
            throw new \RuntimeException('AI response was empty.');
        }

        $decoded = json_decode($content, true);

        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }

        $start = strpos($content, '{');
        $end = strrpos($content, '}');

        if ($start !== false && $end !== false) {
            $decoded = json_decode(substr($content, $start, $end - $start + 1), true);

            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return $decoded;
            }
        }

        throw new \RuntimeException('Failed to parse AI response.');
    }

    private function normalizeHtmlContent(mixed $html, ?string $fallback = null): string
    {
        $content = trim((string) $html);

        if ($content === '') {
            if ($fallback && trim($fallback) !== '') {
                return $fallback;
            }

            throw new \RuntimeException('AI returned empty html_content.');
        }

        if (! str_contains(strtolower($content), '<html')) {
            $content = "<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n<title>Landing Page</title>\n</head>\n<body>\n{$content}\n</body>\n</html>";
        }

        if (! str_starts_with(strtolower($content), '<!doctype html')) {
            $content = "<!doctype html>\n".$content;
        }

        return $content;
    }

    private function resolveErrorMessage(int $status, string $body = ''): string
    {
        $provider = $this->providerLabel();
        $bodyLower = strtolower($body);
        $providerError = $this->extractProviderErrorMessage($body);

        if (str_contains($bodyLower, 'model') && (str_contains($bodyLower, 'not found') || str_contains($bodyLower, 'unavailable'))) {
            return "{$provider} request failed: configured model is unavailable. Please use another model.";
        }

        if ($providerError !== null && $providerError !== '') {
            return "{$provider} request failed: {$providerError}";
        }

        return match ($status) {
            401 => "{$provider} request failed: invalid API key.",
            403 => "{$provider} request failed: access denied for this model or key.",
            408 => "{$provider} request timed out. Please try again with a shorter prompt or use a faster model.",
            429 => "{$provider} rate limit reached. Please wait and try again.",
            default => "{$provider} request failed. Please try again shortly.",
        };
    }

    private function extractProviderErrorMessage(string $body): ?string
    {
        $trimmed = trim($body);
        if ($trimmed === '') {
            return null;
        }

        $decoded = json_decode($trimmed, true);
        if (is_array($decoded)) {
            $message = data_get($decoded, 'error.message')
                ?? data_get($decoded, 'message')
                ?? data_get($decoded, 'error');

            if (is_string($message)) {
                $clean = trim($message);

                if ($clean !== '') {
                    return $clean;
                }
            }
        }

        // Last resort: return a short plain-text snippet for easier debugging.
        $plain = trim(strip_tags($trimmed));
        if ($plain === '') {
            return null;
        }

        return mb_substr($plain, 0, 220);
    }

    private function buildGenerationMeta(string $prompt, array $responseJson): array
    {
        return [
            'provider' => (string) config('services.ai.provider', 'unknown'),
            'model' => (string) (data_get($responseJson, 'model') ?: config('services.ai.model')),
            'response_id' => (string) (data_get($responseJson, 'id') ?: ''),
            'prompt_hash' => hash('sha256', $prompt),
            'status' => 'ok',
            'prompt_tokens' => $this->nullableInt(data_get($responseJson, 'usage.prompt_tokens')),
            'completion_tokens' => $this->nullableInt(data_get($responseJson, 'usage.completion_tokens')),
            'total_tokens' => $this->nullableInt(data_get($responseJson, 'usage.total_tokens')),
            'generated_at' => now()->toIso8601String(),
        ];
    }

    private function nullableInt(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        return (int) $value;
    }

    private function providerLabel(): string
    {
        $provider = strtolower(trim((string) config('services.ai.provider', 'AI')));

        if ($provider === '') {
            return 'AI';
        }

        return match ($provider) {
            'openrouter' => 'OpenRouter',
            'groq' => 'Groq',
            default => ucfirst($provider),
        };
    }

    private function isOpenRouterProvider(): bool
    {
        return strtolower((string) config('services.ai.provider')) === 'openrouter';
    }
}
