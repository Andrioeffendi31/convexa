@php
    $sections = $sections ?? [];
    $pricing = $sections['pricing'] ?? [];
    $cta = $sections['cta'] ?? [];
    $features = array_slice($sections['features'] ?? [], 0, 3);
    $benefits = array_slice($sections['benefits'] ?? [], 0, 3);
    $template = $salesPage->template_key ?? 'aurora';
    $featureSource = $salesPage->key_features ?? [];
    $productName = $salesPage->product_name ?: 'Your product';
    $audience = $salesPage->target_audience ?: 'Teams focused on predictable growth';
@endphp
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{{ $sections['headline'] ?? $productName }}</title>
        <style>
            :root {
                color-scheme: light;
            }
            * {
                box-sizing: border-box;
            }
            body {
                --page-bg: linear-gradient(135deg, #fff7ed, #f8fafc 45%, #e0f2fe);
                --text-primary: #0f172a;
                --text-secondary: #475569;
                --panel-bg: rgba(255, 255, 255, 0.9);
                --panel-border: #fde68a;
                --muted-border: #e2e8f0;
                --primary: #f97316;
                --primary-hover: #ea580c;
                --accent-bg: #fef3c7;
                --accent-text: #92400e;
                --benefit-bg: #ffedd5;
                --benefit-text: #9a3412;
                margin: 0;
                min-height: 100vh;
                font-family: "Avenir Next", "Avenir", "Helvetica Neue", sans-serif;
                background: var(--page-bg);
                color: var(--text-primary);
            }
            body.template-foundry {
                --page-bg: #020617;
                --text-primary: #f8fafc;
                --text-secondary: #cbd5e1;
                --panel-bg: #0f172a;
                --panel-border: #1e293b;
                --muted-border: #1f2937;
                --primary: #ef4444;
                --primary-hover: #dc2626;
                --accent-bg: rgba(239, 68, 68, 0.2);
                --accent-text: #fecaca;
                --benefit-bg: #020617;
                --benefit-text: #e2e8f0;
            }
            body.template-studio {
                --page-bg: linear-gradient(135deg, #fff1f2, #ffffff 40%, #e0e7ff);
                --text-primary: #0f172a;
                --text-secondary: #475569;
                --panel-bg: rgba(255, 255, 255, 0.9);
                --panel-border: #fbcfe8;
                --muted-border: #f3e8ff;
                --primary: #7c3aed;
                --primary-hover: #6d28d9;
                --accent-bg: #ede9fe;
                --accent-text: #5b21b6;
                --benefit-bg: #ffe4e6;
                --benefit-text: #9f1239;
            }
            .page {
                max-width: 1120px;
                margin: 0 auto;
                padding: 48px 24px 72px;
            }
            .shell {
                border-radius: 32px;
                border: 1px solid var(--panel-border);
                background: var(--panel-bg);
                box-shadow: 0 30px 80px rgba(15, 23, 42, 0.16);
                backdrop-filter: blur(2px);
                padding: 32px;
            }
            .navbar {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                border: 1px solid var(--panel-border);
                border-radius: 16px;
                padding: 12px 14px;
                background: var(--panel-bg);
            }
            .nav-left {
                display: flex;
                align-items: center;
                gap: 10px;
                flex-wrap: wrap;
            }
            .badge {
                display: inline-flex;
                align-items: center;
                border: 1px solid transparent;
                border-radius: 999px;
                padding: 8px 14px;
                background: var(--accent-bg);
                color: var(--accent-text);
                font-size: 12px;
                font-weight: 700;
                letter-spacing: 0.04em;
            }
            .eyebrow {
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.3em;
                color: var(--text-secondary);
                font-weight: 700;
            }
            .nav-links {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            .nav-links a {
                color: var(--text-secondary);
                font-size: 12px;
                text-decoration: none;
                padding: 6px 10px;
                border-radius: 999px;
            }
            .hero {
                margin-top: 24px;
                display: grid;
                gap: 24px;
                grid-template-columns: 1.2fr 0.8fr;
            }
            .hero h1 {
                margin: 0;
                font-size: 44px;
                line-height: 1.08;
            }
            .subheadline {
                margin: 12px 0 0;
                font-size: 20px;
                line-height: 1.35;
                color: var(--text-secondary);
            }
            .description {
                margin: 14px 0 0;
                font-size: 15px;
                line-height: 1.7;
                color: var(--text-secondary);
            }
            .button-row {
                margin-top: 24px;
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }
            .btn {
                text-decoration: none;
                border-radius: 999px;
                padding: 12px 18px;
                font-size: 14px;
                font-weight: 700;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            .btn-primary {
                background: var(--primary);
                color: #fff;
            }
            .btn-secondary {
                border: 1px solid var(--muted-border);
                color: var(--text-primary);
                background: transparent;
            }
            .panel {
                border-radius: 22px;
                border: 1px solid var(--muted-border);
                background: var(--panel-bg);
                padding: 24px;
            }
            .pricing-title {
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.3em;
                color: var(--text-secondary);
                font-weight: 700;
            }
            .price {
                margin-top: 10px;
                font-size: 42px;
                font-weight: 700;
                line-height: 1.05;
            }
            .price-note {
                margin-top: 4px;
                color: var(--text-secondary);
                font-size: 14px;
            }
            .helper {
                margin-top: 16px;
                border-radius: 14px;
                border: 1px solid var(--panel-border);
                background: var(--accent-bg);
                color: var(--accent-text);
                font-size: 13px;
                padding: 10px 12px;
            }
            .section {
                margin-top: 24px;
                border-radius: 18px;
                border: 1px solid var(--muted-border);
                background: var(--panel-bg);
                padding: 18px;
            }
            .section p {
                margin: 10px 0 0;
                color: var(--text-secondary);
                line-height: 1.7;
                font-size: 14px;
            }
            .mini-grid {
                margin-top: 12px;
                display: grid;
                gap: 10px;
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }
            .mini-item {
                border-radius: 12px;
                border: 1px solid var(--muted-border);
                background: var(--panel-bg);
                padding: 10px 12px;
                color: var(--text-secondary);
                font-size: 13px;
            }
            .benefits,
            .features,
            .proof-grid {
                margin-top: 12px;
                display: grid;
                gap: 12px;
                grid-template-columns: repeat(3, minmax(0, 1fr));
            }
            .benefit,
            .feature-card,
            .proof {
                border-radius: 14px;
                border: 1px solid var(--muted-border);
                background: var(--panel-bg);
                padding: 12px;
            }
            .benefit {
                background: var(--benefit-bg);
                color: var(--benefit-text);
                border-color: transparent;
                font-size: 14px;
            }
            .feature-card h3 {
                margin: 0;
                font-size: 14px;
            }
            .feature-card p {
                margin: 6px 0 0;
                font-size: 13px;
            }
            .proof {
                text-align: center;
                color: var(--text-secondary);
                font-size: 13px;
            }
            .proof strong {
                display: block;
                font-size: 20px;
                color: var(--text-primary);
            }
            .cta {
                margin-top: 24px;
                border-radius: 18px;
                border: 1px solid var(--panel-border);
                background: var(--accent-bg);
                color: var(--accent-text);
                padding: 20px;
            }
            .cta h3 {
                margin: 0;
                font-size: 24px;
                color: var(--text-primary);
            }
            .cta p {
                margin: 8px 0 0;
                color: var(--text-secondary);
                font-size: 14px;
                line-height: 1.7;
            }
            footer {
                margin-top: 26px;
                padding-top: 14px;
                border-top: 1px solid var(--muted-border);
                font-size: 12px;
                color: var(--text-secondary);
                display: flex;
                flex-wrap: wrap;
                justify-content: space-between;
                gap: 8px;
            }
            .footnote {
                margin-top: 6px;
                font-size: 11px;
                color: var(--text-secondary);
                width: 100%;
            }
            @media (max-width: 900px) {
                .hero {
                    grid-template-columns: 1fr;
                }
                .benefits,
                .features,
                .proof-grid,
                .mini-grid {
                    grid-template-columns: 1fr;
                }
                .hero h1 {
                    font-size: 34px;
                }
            }
        </style>
    </head>
    <body class="template-{{ $template }}">
        <div class="page">
            <section class="shell">
                <nav class="navbar">
                    <div class="nav-left">
                        <span class="badge">{{ $productName }}</span>
                        <span class="eyebrow">Professional landing page</span>
                    </div>
                    <div class="nav-links">
                        <a href="#benefits">Benefits</a>
                        <a href="#features">Features</a>
                        <a href="#pricing">Pricing</a>
                        <a href="#cta">Contact</a>
                    </div>
                </nav>

                <section class="hero">
                    <div>
                        <h1>{{ $sections['headline'] ?? 'Your headline goes here' }}</h1>
                        <p class="subheadline">{{ $sections['subheadline'] ?? 'A clear, confident subheadline.' }}</p>
                        <p class="description">{{ $sections['description'] ?? 'Use the generator to craft compelling product copy.' }}</p>
                        <div class="button-row">
                            <a class="btn btn-primary" href="#cta">{{ $cta['primary'] ?? 'Get started' }}</a>
                            <a class="btn btn-secondary" href="#cta">{{ $cta['secondary'] ?? 'Book a demo' }}</a>
                        </div>
                    </div>
                    <div class="panel" id="pricing">
                        <div class="pricing-title">{{ $pricing['label'] ?? 'Pricing' }}</div>
                        <div class="price">{{ $pricing['value'] ?? 'Contact us' }}</div>
                        <div class="price-note">{{ $pricing['note'] ?? 'Flexible plans tailored to your growth stage.' }}</div>
                        <div class="helper">Clear scope, fast onboarding, measurable outcomes.</div>
                    </div>
                </section>

                <section class="section">
                    <div class="eyebrow">Product overview</div>
                    <p>{{ $sections['description'] ?? 'Summarize the core value proposition and why this product is a strategic fit for the customer.' }}</p>
                    <div class="mini-grid">
                        <div class="mini-item"><strong>Ideal for:</strong> {{ $audience }}</div>
                        <div class="mini-item"><strong>Core value:</strong> Faster execution with less operational friction.</div>
                    </div>
                </section>

                <section class="section" id="benefits">
                    <div class="eyebrow">Benefits</div>
                    <div class="benefits">
                        @forelse ($benefits as $benefit)
                            <article class="benefit">{{ $benefit }}</article>
                        @empty
                            <article class="benefit">Stronger conversion from clearer messaging.</article>
                            <article class="benefit">Faster launch with reusable structure.</article>
                            <article class="benefit">Professional brand presentation by default.</article>
                        @endforelse
                    </div>
                </section>

                <section class="section" id="features">
                    <div class="eyebrow">Feature breakdown</div>
                    <div class="features">
                        @forelse ($features as $index => $feature)
                            <article class="feature-card">
                                <div class="eyebrow">Feature {{ $index + 1 }}</div>
                                <h3>{{ $feature['title'] ?? 'Feature title' }}</h3>
                                <p>{{ $feature['description'] ?? 'Feature detail' }}</p>
                            </article>
                        @empty
                            <article class="feature-card">
                                <div class="eyebrow">Feature 1</div>
                                <h3>Feature title</h3>
                                <p>Feature detail</p>
                            </article>
                            <article class="feature-card">
                                <div class="eyebrow">Feature 2</div>
                                <h3>Feature title</h3>
                                <p>Feature detail</p>
                            </article>
                            <article class="feature-card">
                                <div class="eyebrow">Feature 3</div>
                                <h3>Feature title</h3>
                                <p>Feature detail</p>
                            </article>
                        @endforelse
                    </div>
                </section>

                <section class="section">
                    <div class="eyebrow">Social proof placeholder</div>
                    <p>{{ $sections['socialProof'] ?? 'Add one testimonial or KPI that validates the promise above.' }}</p>
                    <div class="proof-grid">
                        <article class="proof">
                            <strong>+37%</strong>
                            Pipeline velocity
                        </article>
                        <article class="proof">
                            <strong>12 days</strong>
                            Average onboarding
                        </article>
                        <article class="proof">
                            <strong>4.8/5</strong>
                            Customer satisfaction
                        </article>
                    </div>
                </section>

                <section class="cta" id="cta">
                    <h3>Ready to move faster with {{ $productName }}?</h3>
                    <p>{{ $cta['supporting'] ?? 'Start with a focused implementation plan and ship your first wins quickly.' }}</p>
                    <div class="button-row">
                        <a class="btn btn-primary" href="#">{{ $cta['primary'] ?? 'Start now' }}</a>
                        <a class="btn btn-secondary" href="#">{{ $cta['secondary'] ?? 'Talk to sales' }}</a>
                    </div>
                </section>

                <footer>
                    <span>{{ $productName }} · Professional sales page</span>
                    <span>{{ now()->year }} · All rights reserved.</span>
                    @if (! empty($featureSource))
                        <div class="footnote">Key capabilities: {{ implode(' • ', array_slice($featureSource, 0, 4)) }}</div>
                    @endif
                </footer>
            </section>
        </div>
    </body>
</html>
