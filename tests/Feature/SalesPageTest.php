<?php

namespace Tests\Feature;

use App\Models\SalesPage;
use App\Models\SalesPageMessage;
use App\Models\SalesPageVersion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SalesPageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('services.ai.provider', 'groq');
        config()->set('services.ai.base_url', 'https://api.groq.com/openai/v1');
        config()->set('services.ai.key', 'test-key');
        config()->set('services.ai.model', 'llama-3.3-70b-versatile');
    }

    public function test_sales_page_routes_require_authentication(): void
    {
        $this->get(route('sales-pages.index'))->assertRedirect(route('login'));
        $this->get(route('sales-pages.create'))->assertRedirect(route('login'));
        $this->post(route('sales-pages.store'), [])->assertRedirect(route('login'));
        $this->post(route('sales-pages.generate'), [])->assertRedirect(route('login'));
    }

    public function test_public_sales_page_is_accessible_without_authentication(): void
    {
        $owner = User::factory()->create();
        $page = SalesPage::query()->create([
            ...$this->validInputOnly(['product_name' => 'Nimbus Public']),
            'public_token' => '01JT1P2A8AK6Y2NZ8CVQG4Y9M3',
            'user_id' => $owner->id,
            'template_key' => 'freeform',
            'html_content' => $this->sampleHtml('Nimbus Public', 'Public headline'),
            'sections' => [],
        ]);

        $response = $this->get(route('sales-pages.public', $page->public_token));

        $response->assertOk();
        $response->assertSee('Nimbus Public');
        $response->assertSee('Public headline');
        $response->assertHeader('Content-Type', 'text/html; charset=UTF-8');
    }

    public function test_public_sales_page_returns_404_for_unknown_token(): void
    {
        $this->get(route('sales-pages.public', '01JT1P2A8AK6Y2NZ8CVQG4Y9ZZ'))
            ->assertNotFound();
    }

    public function test_authenticated_user_can_create_update_and_delete_a_sales_page(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('sales-pages.store'), $this->validInputOnly())
            ->assertRedirect();

        $page = SalesPage::query()->firstOrFail();
        $this->assertSame($user->id, $page->user_id);
        $this->assertSame('aurora', $page->template_key);
        $this->assertNotEmpty($page->html_content);

        $updatePayload = $this->validInputOnly([
            'product_name' => 'Updated product',
        ]);

        $this->actingAs($user)
            ->put(route('sales-pages.update', $page), $updatePayload)
            ->assertRedirect(route('sales-pages.show', $page));

        $page->refresh();
        $this->assertSame('Updated product', $page->product_name);

        $this->actingAs($user)
            ->delete(route('sales-pages.destroy', $page))
            ->assertRedirect(route('sales-pages.index'));

        $this->assertDatabaseMissing('sales_pages', ['id' => $page->id]);
    }

    public function test_user_can_create_workspace_with_minimal_brief_input(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('sales-pages.store'), [
                'product_name' => 'QuickDraft',
            ])
            ->assertRedirect();

        $page = SalesPage::query()->firstOrFail();
        $this->assertSame('QuickDraft', $page->product_name);
        $this->assertSame('aurora', $page->template_key);
        $this->assertNotEmpty($page->product_description);
        $this->assertNotEmpty($page->html_content);
    }

    public function test_store_creates_initial_chat_message_and_version(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('sales-pages.store'), $this->validInputOnly())
            ->assertRedirect();

        $page = SalesPage::query()->firstOrFail();
        $this->assertNotNull($page->active_version_id);

        $version = SalesPageVersion::query()->where('sales_page_id', $page->id)->first();
        $this->assertNotNull($version);
        $this->assertSame(1, $version->version_number);
        $this->assertNotEmpty($version->html_content);

        $assistantMessage = SalesPageMessage::query()
            ->where('sales_page_id', $page->id)
            ->where('role', 'assistant')
            ->first();
        $this->assertNotNull($assistantMessage);
    }

    public function test_user_cannot_access_another_users_sales_page(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $page = SalesPage::query()->create([
            ...$this->validInputOnly(),
            'user_id' => $owner->id,
            'template_key' => 'freeform',
            'html_content' => $this->sampleHtml(),
            'sections' => [],
        ]);

        $this->actingAs($otherUser)
            ->get(route('sales-pages.show', $page))
            ->assertForbidden();

        $this->actingAs($otherUser)
            ->put(route('sales-pages.update', $page), $this->validInputOnly())
            ->assertForbidden();

        $this->actingAs($otherUser)
            ->delete(route('sales-pages.destroy', $page))
            ->assertForbidden();

        $this->actingAs($otherUser)
            ->post(route('sales-pages.regenerate', $page), ['instruction' => 'refresh'])
            ->assertForbidden();
    }

    public function test_index_can_filter_by_product_name_template_and_updated_at(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $oldPage = SalesPage::query()->create([
            ...$this->validInputOnly([
                'product_name' => 'Old Foundry Prospect',
            ]),
            'template_key' => 'foundry',
            'html_content' => $this->sampleHtml(),
            'sections' => [],
            'user_id' => $user->id,
        ]);
        $oldPage->forceFill([
            'updated_at' => Carbon::parse('2026-04-20 10:00:00'),
        ])->saveQuietly();

        $matchingPage = SalesPage::query()->create([
            ...$this->validInputOnly([
                'product_name' => 'Nimbus Freeform Offer',
            ]),
            'template_key' => 'freeform',
            'html_content' => $this->sampleHtml(),
            'sections' => [],
            'user_id' => $user->id,
        ]);
        $matchingPage->forceFill([
            'updated_at' => Carbon::parse('2026-04-28 10:00:00'),
        ])->saveQuietly();

        SalesPage::query()->create([
            ...$this->validInputOnly([
                'product_name' => 'Nimbus Aurora Offer',
            ]),
            'template_key' => 'aurora',
            'html_content' => $this->sampleHtml(),
            'sections' => [],
            'user_id' => $user->id,
        ]);

        SalesPage::query()->create([
            ...$this->validInputOnly([
                'product_name' => 'Nimbus External',
            ]),
            'template_key' => 'freeform',
            'html_content' => $this->sampleHtml(),
            'sections' => [],
            'user_id' => $otherUser->id,
        ]);

        $response = $this->actingAs($user)
            ->get(route('sales-pages.index', [
                'product_name' => 'Nimbus',
                'template_key' => 'freeform',
                'updated_from' => '2026-04-25',
                'updated_to' => '2026-04-29',
            ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('SalesPages/Index')
            ->where('filters.product_name', 'Nimbus')
            ->where('filters.template_key', 'freeform')
            ->where('filters.updated_from', '2026-04-25')
            ->where('filters.updated_to', '2026-04-29')
            ->has('pages.data', 1)
            ->where('pages.data.0.id', $matchingPage->id)
            ->where('pages.total', 1)
        );
    }

    public function test_chat_send_creates_new_html_version_and_persists_messages(): void
    {
        Http::fake([
            $this->aiApiPattern() => Http::response([
                'id' => 'resp_chat_123',
                'model' => 'llama-3.3-70b-versatile',
                'usage' => [
                    'prompt_tokens' => 130,
                    'completion_tokens' => 90,
                    'total_tokens' => 220,
                ],
                'choices' => [[
                    'message' => [
                        'content' => json_encode([
                            'assistant_message' => 'Refined hero and strengthened CTA hierarchy.',
                            'html_content' => $this->sampleHtml('FlowPilot', 'Enterprise-ready growth engine'),
                        ]),
                    ],
                ]],
            ], 200),
        ]);

        $user = User::factory()->create();
        $page = SalesPage::query()->create([
            ...$this->validInputOnly(),
            'user_id' => $user->id,
            'template_key' => 'freeform',
            'html_content' => $this->sampleHtml(),
            'sections' => [],
        ]);
        $version1 = $page->versions()->create([
            'version_number' => 1,
            'template_key' => $page->template_key,
            'html_content' => $page->html_content,
            'sections' => [],
            'summary' => 'Initial version',
        ]);
        $page->update(['active_version_id' => $version1->id]);

        $response = $this->actingAs($user)
            ->postJson(route('sales-pages.chat.send', $page), [
                'message' => 'Make this sound more enterprise and stronger CTA.',
                'version_id' => $version1->id,
            ]);

        $response->assertOk();
        $response->assertJsonPath('version.version_number', 2);
        $response->assertJsonPath('version.summary', 'Refined hero and strengthened CTA hierarchy.');
        $response->assertJsonPath('version.html_content', $this->sampleHtml('FlowPilot', 'Enterprise-ready growth engine'));

        $page->refresh();
        $this->assertStringContainsString('Enterprise-ready growth engine', (string) $page->html_content);
        $this->assertSame(2, $page->versions()->max('version_number'));
        $this->assertSame(1, $page->messages()->where('role', 'user')->count());
        $this->assertSame(1, $page->messages()->where('role', 'assistant')->count());
    }

    public function test_can_activate_an_older_version_from_history(): void
    {
        $user = User::factory()->create();
        $page = SalesPage::query()->create([
            ...$this->validInputOnly(),
            'user_id' => $user->id,
            'template_key' => 'freeform',
            'html_content' => $this->sampleHtml('FlowPilot', 'Version two'),
            'sections' => [],
        ]);
        $version1 = $page->versions()->create([
            'version_number' => 1,
            'template_key' => 'freeform',
            'html_content' => $this->sampleHtml('FlowPilot', 'Version one'),
            'sections' => [],
            'summary' => 'V1',
        ]);
        $version2 = $page->versions()->create([
            'version_number' => 2,
            'template_key' => 'freeform',
            'html_content' => $this->sampleHtml('FlowPilot', 'Version two'),
            'sections' => [],
            'summary' => 'V2',
        ]);
        $page->update([
            'active_version_id' => $version2->id,
            'html_content' => $version2->html_content,
        ]);

        $response = $this->actingAs($user)
            ->postJson(route('sales-pages.versions.activate', $page), [
                'version_id' => $version1->id,
            ]);

        $response->assertOk();
        $response->assertJsonPath('version.version_number', 1);
        $response->assertJsonPath('version.html_content', $this->sampleHtml('FlowPilot', 'Version one'));

        $page->refresh();
        $this->assertSame($version1->id, $page->active_version_id);
        $this->assertStringContainsString('Version one', (string) $page->html_content);
    }

    public function test_generate_returns_html_from_ai_provider(): void
    {
        Http::fake([
            $this->aiApiPattern() => Http::response([
                'id' => 'resp_full_123',
                'model' => 'llama-3.3-70b-versatile',
                'usage' => [
                    'prompt_tokens' => 88,
                    'completion_tokens' => 143,
                    'total_tokens' => 231,
                ],
                'choices' => [[
                    'message' => [
                        'content' => json_encode([
                            'assistant_message' => 'Built a complete professional draft.',
                            'html_content' => $this->sampleHtml(),
                        ]),
                    ],
                ]],
            ], 200),
        ]);

        $response = $this->actingAs(User::factory()->create())
            ->postJson(route('sales-pages.generate'), $this->validInputOnly());

        $response->assertOk();
        $response->assertJsonPath('assistant_message', 'Built a complete professional draft.');
        $response->assertJsonPath('html_content', $this->sampleHtml());
        $response->assertJsonPath('generation_meta.provider', 'groq');
        $response->assertJsonPath('generation_meta.model', 'llama-3.3-70b-versatile');
        $response->assertJsonPath('generation_meta.response_id', 'resp_full_123');
    }

    public function test_export_returns_html_attachment_and_stores_snapshot(): void
    {
        $user = User::factory()->create();
        $page = SalesPage::query()->create([
            ...$this->validInputOnly(['product_name' => 'Growth Engine']),
            'user_id' => $user->id,
            'template_key' => 'freeform',
            'html_content' => $this->sampleHtml('Growth Engine', 'Win back your time'),
            'sections' => [],
        ]);

        $response = $this->actingAs($user)
            ->get(route('sales-pages.export', $page));

        $response->assertOk();
        $response->assertHeader(
            'Content-Disposition',
            'attachment; filename="growth-engine-'.$page->id.'.html"'
        );
        $response->assertSee('Win back your time');

        $page->refresh();
        $this->assertNotNull($page->export_html);
        $this->assertStringContainsString('Win back your time', $page->export_html);
    }

    public function test_generate_returns_clear_message_when_api_key_is_missing(): void
    {
        config()->set('services.ai.key', '');

        $response = $this->actingAs(User::factory()->create())
            ->postJson(route('sales-pages.generate'), $this->validInputOnly());

        $response->assertStatus(422);
        $response->assertJsonPath('message', 'AI_API_KEY is not configured.');
    }

    public function test_generate_is_rate_limited_per_user(): void
    {
        Http::fake([
            $this->aiApiPattern() => Http::response([
                'id' => 'resp_limit_123',
                'model' => 'llama-3.3-70b-versatile',
                'choices' => [[
                    'message' => [
                        'content' => json_encode([
                            'assistant_message' => 'Draft generated.',
                            'html_content' => $this->sampleHtml(),
                        ]),
                    ],
                ]],
            ], 200),
        ]);

        $user = User::factory()->create();
        $payload = $this->validInputOnly();

        for ($i = 0; $i < 20; $i++) {
            $this->actingAs($user)
                ->postJson(route('sales-pages.generate'), $payload)
                ->assertOk();
        }

        $this->actingAs($user)
            ->postJson(route('sales-pages.generate'), $payload)
            ->assertStatus(429)
            ->assertJsonPath('message', 'Too many generation requests. Please wait a minute and try again.');
    }

    public function test_generate_returns_clear_message_when_provider_api_key_is_invalid(): void
    {
        Http::fake([
            $this->aiApiPattern() => Http::response([
                'error' => ['message' => 'Invalid API key'],
            ], 401),
        ]);

        $response = $this->actingAs(User::factory()->create())
            ->postJson(route('sales-pages.generate'), $this->validInputOnly());

        $response->assertStatus(422);
        $response->assertJsonPath('message', 'Groq request failed: Invalid API key');
    }

    private function validInputOnly(array $overrides = []): array
    {
        return [
            'product_name' => 'FlowPilot',
            'product_description' => 'Workflow automation for lean sales teams.',
            'key_features' => ['Auto follow-ups', 'Pipeline AI', 'Team analytics'],
            'target_audience' => 'B2B SaaS teams',
            'price' => '$49/month',
            'unique_selling_points' => ['7-day onboarding', 'No-code setup'],
            ...$overrides,
        ];
    }

    private function sampleHtml(
        string $product = 'FlowPilot',
        string $headline = 'Win back your time'
    ): string {
        return <<<HTML
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{$product}</title>
  <style>body{font-family:Arial,sans-serif;margin:0;padding:32px;background:#f8fafc;color:#0f172a}h1{font-size:42px}</style>
</head>
<body>
  <header><nav>Home | Benefits | Pricing</nav></header>
  <main>
    <h1>{$headline}</h1>
    <h2>Automate pipeline work without adding headcount</h2>
    <p>FlowPilot keeps your team focused on conversations, not admin.</p>
    <section><h3>Benefits</h3><ul><li>Close more deals</li><li>Spot risks earlier</li><li>Scale without friction</li></ul></section>
    <section><h3>Features</h3><p>Smart follow-ups, deal risk monitor, live dashboards.</p></section>
    <section><h3>Social Proof</h3><p>Trusted by 300+ revenue teams.</p></section>
    <section><h3>Pricing</h3><p>Starting at \$49/month</p></section>
    <section><h3>CTA</h3><button>Start free trial</button></section>
  </main>
  <footer>2026 {$product}</footer>
</body>
</html>
HTML;
    }

    private function aiApiPattern(): string
    {
        return rtrim((string) config('services.ai.base_url'), '/').'/*';
    }
}
