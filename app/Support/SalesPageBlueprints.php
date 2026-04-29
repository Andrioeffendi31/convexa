<?php

namespace App\Support;

class SalesPageBlueprints
{
    public static function options(): array
    {
        return [
            [
                'key' => 'aurora',
                'name' => 'Aurora SaaS',
                'description' => 'Clean modern SaaS style with strong trust cues and conversion-focused flow.',
            ],
            [
                'key' => 'foundry',
                'name' => 'Foundry Enterprise',
                'description' => 'Enterprise-ready layout with premium contrast and executive messaging structure.',
            ],
            [
                'key' => 'studio',
                'name' => 'Studio Product',
                'description' => 'Product storytelling layout for feature-first launches with polished visuals.',
            ],
        ];
    }

    public static function keys(): array
    {
        return array_map(
            fn (array $item) => (string) $item['key'],
            self::options(),
        );
    }

    public static function defaultKey(): string
    {
        return 'aurora';
    }

    public static function normalizeTemplateKey(?string $templateKey): string
    {
        $key = trim((string) $templateKey);

        if (in_array($key, self::keys(), true)) {
            return $key;
        }

        return self::defaultKey();
    }

    public static function renderStarterHtml(array $data, ?string $templateKey): string
    {
        $name = e(trim((string) ($data['product_name'] ?? '')) ?: 'Your Product');
        $description = e(trim((string) ($data['product_description'] ?? '')) ?: 'A modern solution designed to help teams execute faster with less operational friction.');
        $audience = e(trim((string) ($data['target_audience'] ?? '')) ?: 'Growth-focused teams');
        $price = e(trim((string) ($data['price'] ?? '')) ?: 'Contact sales');

        $features = array_values(array_filter(array_map(
            fn ($item) => trim((string) $item),
            is_array($data['key_features'] ?? null) ? $data['key_features'] : []
        )));
        if ($features === []) {
            $features = [
                'Fast onboarding in days, not months',
                'Workflow automation for repeatable execution',
                'Live visibility across your revenue pipeline',
            ];
        }

        $usps = array_values(array_filter(array_map(
            fn ($item) => trim((string) $item),
            is_array($data['unique_selling_points'] ?? null) ? $data['unique_selling_points'] : []
        )));
        if ($usps === []) {
            $usps = [
                'Built for scale with enterprise-grade reliability',
                'Designed for rapid adoption across teams',
                'Clear ROI framing for decision-makers',
            ];
        }

        $key = self::normalizeTemplateKey($templateKey);

        return match ($key) {
            'foundry' => self::foundry($name, $description, $audience, $price, $features, $usps),
            'studio' => self::studio($name, $description, $audience, $price, $features, $usps),
            default => self::aurora($name, $description, $audience, $price, $features, $usps),
        };
    }

    private static function aurora(
        string $name,
        string $description,
        string $audience,
        string $price,
        array $features,
        array $usps,
    ): string {
        $benefitItems = self::renderList($usps);

        return <<<HTML
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{$name}</title>
  <style>
    :root{--bg:#f7fafc;--paper:#ffffff;--ink:#0f172a;--muted:#475569;--line:#e2e8f0;--brand:#0f172a}
    *{box-sizing:border-box}body{margin:0;font-family:Inter,Segoe UI,Arial,sans-serif;background:radial-gradient(circle at 20% -10%,#dbeafe,transparent 38%),var(--bg);color:var(--ink)}
    .wrap{max-width:1120px;margin:0 auto;padding:24px}.nav{position:sticky;top:0;z-index:40;display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:rgba(255,255,255,.86);backdrop-filter:blur(8px);border:1px solid var(--line);border-radius:14px}
    .logo{font-weight:700;letter-spacing:.2px}.menu{display:flex;gap:18px;color:var(--muted);font-size:14px;flex-wrap:wrap}.hero{display:grid;grid-template-columns:1.1fr .9fr;gap:28px;align-items:center;padding:44px 0}
    .card{background:var(--paper);border:1px solid var(--line);border-radius:18px;padding:24px;box-shadow:0 10px 35px rgba(15,23,42,.08)}
    h1{font-size:48px;line-height:1.08;margin:0 0 12px}h2{font-size:18px;color:var(--muted);font-weight:500;margin:0 0 18px}
    p{margin:0 0 14px;line-height:1.7}.cta{display:inline-block;background:var(--brand);color:#fff;padding:12px 18px;border-radius:12px;text-decoration:none;font-weight:600}
    .section{padding:10px 0 28px}.title{font-size:28px;margin:0 0 12px}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
    ul{margin:0;padding-left:18px;line-height:1.8}.proof{background:#eff6ff;border-color:#bfdbfe}.price{font-size:34px;font-weight:700}
    footer{padding:30px 0;color:var(--muted);font-size:14px;border-top:1px solid var(--line);margin-top:10px}
    @media (max-width:920px){.hero{grid-template-columns:1fr}.grid{grid-template-columns:1fr}.nav{flex-direction:column;align-items:flex-start;gap:8px}}
    @media print{@page{margin:14mm}body{background:#fff}.card{box-shadow:none}}
  </style>
</head>
<body>
  <div class="wrap">
    <header class="nav">
      <div class="logo">{$name}</div>
      <nav class="menu"><span>Benefits</span><span>Features</span><span>Pricing</span><span>Contact</span></nav>
    </header>

    <section class="hero">
      <div>
        <h1>{$name}</h1>
        <h2>Modern platform to help {$audience} execute faster and convert better.</h2>
        <p>{$description}</p>
        <a href="#cta" class="cta">Book a Demo</a>
      </div>
      <div class="card">
        <h3 style="margin-top:0">Why teams switch</h3>
        <ul>{$benefitItems}</ul>
      </div>
    </section>

    <section class="section">
      <h3 class="title">Benefits</h3>
      <div class="card"><ul>{$benefitItems}</ul></div>
    </section>

    <section class="section">
      <h3 class="title">Feature Breakdown</h3>
      <div class="grid">
        <article class="card"><h4>Core Automation</h4><p>{$features[0]}</p></article>
        <article class="card"><h4>Team Visibility</h4><p>{$features[1]}</p></article>
        <article class="card"><h4>Scalable Ops</h4><p>{$features[2]}</p></article>
      </div>
    </section>

    <section class="section">
      <div class="card proof">
        <h3 style="margin-top:0">Social Proof</h3>
        <p>Trusted by high-performing teams worldwide. Add your customer logos, short testimonials, and measurable outcomes here.</p>
      </div>
    </section>

    <section class="section">
      <div class="card">
        <h3 style="margin:0 0 8px">Pricing</h3>
        <p class="price">{$price}</p>
        <p>Simple, transparent pricing for teams that value speed and reliability.</p>
      </div>
    </section>

    <section id="cta" class="section">
      <div class="card" style="text-align:center">
        <h3 style="margin-top:0">Ready to launch faster?</h3>
        <p>Start with a guided walkthrough and see how {$name} fits your workflow.</p>
        <a href="#" class="cta">Start Free Trial</a>
      </div>
    </section>

    <footer>
      <strong>{$name}</strong> · Built for {$audience} · © 2026 {$name}. All rights reserved.
    </footer>
  </div>
</body>
</html>
HTML;
    }

    private static function foundry(
        string $name,
        string $description,
        string $audience,
        string $price,
        array $features,
        array $usps,
    ): string {
        $benefitItems = self::renderList($usps);

        return <<<HTML
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{$name}</title>
  <style>
    :root{--bg:#0b1220;--panel:#111a2b;--panel-2:#152238;--ink:#e2e8f0;--muted:#94a3b8;--line:#1f2b43;--accent:#22d3ee}
    *{box-sizing:border-box}body{margin:0;font-family:Inter,Segoe UI,Arial,sans-serif;color:var(--ink);background:linear-gradient(170deg,#0b1220,#101c34 45%,#1a2945)}
    .wrap{max-width:1140px;margin:0 auto;padding:26px}.card{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:24px}
    .nav{position:sticky;top:0;z-index:40;display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:rgba(11,18,32,.88);backdrop-filter:blur(8px);border:1px solid var(--line);border-radius:14px}.menu{display:flex;gap:16px;font-size:14px;color:var(--muted);flex-wrap:wrap}
    .hero{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding:30px 0}.kicker{display:inline-block;background:#082f49;color:#67e8f9;padding:6px 10px;border-radius:999px;font-size:12px}
    h1{font-size:46px;line-height:1.08;margin:12px 0}.lead{color:var(--muted);line-height:1.75}.cta{display:inline-block;background:var(--accent);color:#083344;padding:12px 18px;border-radius:12px;text-decoration:none;font-weight:700}
    .section{padding:10px 0 20px}.title{font-size:26px;margin:0 0 12px}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
    ul{margin:0;padding-left:18px;line-height:1.8}.price{font-size:36px;font-weight:700;color:#67e8f9}
    footer{margin-top:14px;padding:22px 0;border-top:1px solid var(--line);color:var(--muted);font-size:14px}
    @media (max-width:940px){.hero{grid-template-columns:1fr}.grid{grid-template-columns:1fr}.nav{flex-direction:column;align-items:flex-start;gap:8px}}
    @media print{@page{margin:14mm}body{background:#fff;color:#0f172a}.card{background:#fff;border-color:#cbd5e1}}
  </style>
</head>
<body>
  <div class="wrap">
    <header class="nav">
      <strong>{$name}</strong>
      <nav class="menu"><span>Platform</span><span>Outcomes</span><span>Pricing</span><span>Contact</span></nav>
    </header>

    <section class="hero">
      <article class="card">
        <span class="kicker">Enterprise Blueprint</span>
        <h1>{$name}</h1>
        <p class="lead">{$description}</p>
        <p class="lead"><strong>Designed for:</strong> {$audience}</p>
        <a href="#cta" class="cta">Request Consultation</a>
      </article>
      <article class="card" style="background:var(--panel-2)">
        <h3 style="margin-top:0">Strategic Benefits</h3>
        <ul>{$benefitItems}</ul>
      </article>
    </section>

    <section class="section">
      <h3 class="title">Feature Breakdown</h3>
      <div class="grid">
        <article class="card"><h4>Execution Layer</h4><p>{$features[0]}</p></article>
        <article class="card"><h4>Decision Layer</h4><p>{$features[1]}</p></article>
        <article class="card"><h4>Scale Layer</h4><p>{$features[2]}</p></article>
      </div>
    </section>

    <section class="section">
      <article class="card">
        <h3 style="margin-top:0">Social Proof Placeholder</h3>
        <p class="lead">Insert enterprise logos, KPI deltas, and short quotes from successful rollouts.</p>
      </article>
    </section>

    <section class="section">
      <article class="card">
        <h3 style="margin-top:0">Pricing</h3>
        <p class="price">{$price}</p>
        <p class="lead">Flexible packaging for growing and mature revenue organizations.</p>
      </article>
    </section>

    <section id="cta" class="section">
      <article class="card" style="text-align:center;background:var(--panel-2)">
        <h3 style="margin-top:0">Move from planning to execution</h3>
        <p class="lead">Get a custom rollout plan and align your team around outcomes.</p>
        <a href="#" class="cta">Schedule a Demo</a>
      </article>
    </section>

    <footer>
      {$name} · Trusted infrastructure for {$audience} · © 2026
    </footer>
  </div>
</body>
</html>
HTML;
    }

    private static function studio(
        string $name,
        string $description,
        string $audience,
        string $price,
        array $features,
        array $usps,
    ): string {
        $benefitItems = self::renderList($usps);

        return <<<HTML
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{$name}</title>
  <style>
    :root{--bg:#fffaf5;--paper:#ffffff;--ink:#1f2937;--muted:#4b5563;--line:#fed7aa;--accent:#ea580c}
    *{box-sizing:border-box}body{margin:0;font-family:Inter,Segoe UI,Arial,sans-serif;color:var(--ink);background:radial-gradient(circle at 90% 0%,#ffedd5,transparent 35%),var(--bg)}
    .wrap{max-width:1100px;margin:0 auto;padding:24px}.nav{position:sticky;top:0;z-index:40;display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:rgba(255,250,245,.9);backdrop-filter:blur(8px);border:1px solid var(--line);border-radius:14px}
    .menu{display:flex;gap:16px;color:var(--muted);font-size:14px;flex-wrap:wrap}.hero{padding:36px 0 18px}.hero-card{background:var(--paper);border:1px solid var(--line);border-radius:22px;padding:32px}
    h1{font-size:50px;line-height:1.04;margin:0 0 10px}.sub{font-size:20px;color:var(--muted);margin:0 0 14px}.lead{line-height:1.75}
    .cta{display:inline-block;background:var(--accent);color:#fff;padding:12px 18px;border-radius:12px;text-decoration:none;font-weight:700}
    .section{padding:12px 0}.title{font-size:28px;margin:0 0 12px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    .card{background:var(--paper);border:1px solid var(--line);border-radius:18px;padding:22px}.price{font-size:35px;font-weight:800;color:#c2410c}
    ul{margin:0;padding-left:18px;line-height:1.8}footer{margin-top:16px;padding:24px 0;border-top:1px solid var(--line);color:var(--muted);font-size:14px}
    @media (max-width:900px){.grid{grid-template-columns:1fr}h1{font-size:38px}.nav{flex-direction:column;align-items:flex-start;gap:8px}}
    @media print{@page{margin:14mm}body{background:#fff}}
  </style>
</head>
<body>
  <div class="wrap">
    <header class="nav">
      <strong>{$name}</strong>
      <nav class="menu"><span>Overview</span><span>Benefits</span><span>Features</span><span>Pricing</span></nav>
    </header>

    <section class="hero">
      <article class="hero-card">
        <h1>{$name}</h1>
        <p class="sub">Professional sales page starter crafted for {$audience}.</p>
        <p class="lead">{$description}</p>
        <a class="cta" href="#cta">Get Started</a>
      </article>
    </section>

    <section class="section">
      <h3 class="title">Benefits</h3>
      <article class="card"><ul>{$benefitItems}</ul></article>
    </section>

    <section class="section">
      <h3 class="title">Features</h3>
      <div class="grid">
        <article class="card"><h4>Feature 1</h4><p>{$features[0]}</p></article>
        <article class="card"><h4>Feature 2</h4><p>{$features[1]}</p></article>
        <article class="card"><h4>Feature 3</h4><p>{$features[2]}</p></article>
        <article class="card"><h4>Use Cases</h4><p>Show practical scenarios and how teams adopt this quickly.</p></article>
      </div>
    </section>

    <section class="section">
      <article class="card">
        <h3 style="margin-top:0">Social Proof</h3>
        <p class="lead">Add real testimonials, media mentions, or before/after outcome snapshots here.</p>
      </article>
    </section>

    <section class="section">
      <article class="card">
        <h3 style="margin-top:0">Pricing</h3>
        <p class="price">{$price}</p>
        <p class="lead">Position your plan clearly with a concise value explanation and no surprises.</p>
      </article>
    </section>

    <section id="cta" class="section">
      <article class="card" style="text-align:center">
        <h3 style="margin-top:0">Ready to launch this page?</h3>
        <p class="lead">Continue in chat to refine copy, visual style, and conversion details.</p>
        <a class="cta" href="#">Launch Your Draft</a>
      </article>
    </section>

    <footer>
      {$name} · Crafted for {$audience} · © 2026 {$name}
    </footer>
  </div>
</body>
</html>
HTML;
    }

    private static function renderList(array $items): string
    {
        return implode('', array_map(
            fn (string $item) => '<li>'.e($item).'</li>',
            array_slice($items, 0, 6),
        ));
    }
}
