# Approach, Tools & Logic — Convexa UI/UX

A concise document covering how the Convexa UI/UX revamp was designed and implemented: the design approach, libraries used, and the logic behind complex areas (streaming animation, conversation history, theme system).

---

## 1. Goals & Scope

Convexa is an AI Sales Page Generator (Laravel + Inertia + React + Tailwind). The revamp targets:

1. **Landing page** feels premium and modern (on par with v0.dev / Cursor / Bolt.new).
2. **Code generation animation** feels alive — not just a spinner.
3. **Chat system** has UX on par with ChatGPT/Claude.ai (markdown, avatars, history, actions).
4. **Auth pages** (Login/Register/Forgot/Reset/Confirm/Verify) consistent with the dark premium direction.
5. **Contrast consistency** — zero tolerance for unreadable text caused by leftover light backgrounds.

Key constraint: **the backend is largely unchanged**. All improvements happen on the frontend, except for one additional shared prop added via Inertia middleware for the sidebar conversation list.

---

## 2. Design System Approach

### Dark-first with semantic tokens

Choice: **dark-first premium** (zinc/neutral palette + violet→cyan accent), not a dark/light toggle. Rationale: faster to ship, AI-tools vibe, and light mode can be added later without a refactor since tokens are already class-based (`darkMode: 'class'`).

Tokens are defined as HSL CSS variables in [`resources/css/app.css`](../resources/css/app.css), then bridged to Tailwind utilities via `extend.colors` in [`tailwind.config.js`](../tailwind.config.js):

| Token                                 | Role                                              |
| ------------------------------------- | ------------------------------------------------- |
| `bg`                                  | Page/canvas background                            |
| `bg-elevated`                         | Cards, panels, sidebar                            |
| `bg-subtle`                           | Inset surfaces (inputs, code blocks, hover)       |
| `border` / `border-strong`            | Subtle / strong dividers                          |
| `text` / `text-muted` / `text-subtle` | 3-level text hierarchy                            |
| `accent`                              | Violet (262° 83% 66%) — primary action            |
| `accent-2`                            | Cyan (188° 95% 60%) — secondary action / success  |

Every class `bg-bg-elevated`, `text-text-muted`, etc. is automatically available because Tailwind 3 supports `<alpha-value>` in custom colors.

### Why tokens instead of hard-coded values?

The previous UI was full of `text-slate-900`, `bg-amber-50`, `bg-gradient-to-r from-slate-50 to-white` — switching to dark made text unreadable. With tokens, every surface carries **meaning** (hierarchy and elevation), not raw color values. Changing the palette means changing one CSS variable.

### Contrast rules

- Body text on `bg-elevated` always uses `text-text` or `text-text-muted` (≥4.5:1 contrast ratio).
- Border-on-bg uses `/40` or `/60` opacity for softness; avoid solid borders except for hard dividers.
- Every accent gradient (`bg-gradient-accent`) is always paired with `text-white`, never `text-text` (gradient overshoots dark text).

---

## 3. Tools & Libraries

### Already present (leveraged)

- **Tailwind 3** + `@tailwindcss/forms` — utility-first styling.
- **shadcn-style primitives** (`Button`, `Card`, `Badge`, `Input`, `Label`, `Select`, `Tabs`, `Textarea`) in [`Components/ui/`](../resources/js/Components/ui) — all repainted to semantic tokens, API unchanged.
- **Radix UI** (`@radix-ui/react-select`, `react-tabs`, `react-slot`) — accessible primitives.
- **Inertia.js** + **React 18** — SPA-feel pages without a separate API layer.
- **CodeMirror** (`@uiw/react-codemirror` + `@codemirror/lang-html`) — HTML editor with syntax highlighting.
- **lucide-react** — icon set (Sparkles, ArrowRight, Wand2, Layers, Eye/EyeOff, etc.).
- **class-variance-authority** + **clsx** + **tailwind-merge** — variant management for shadcn primitives.
- **Headless UI** (`@headlessui/react`) — Modal & Transition.
- **Zustand** — state store (used in the legacy Builder).

### Added for the revamp

| Library            | Purpose                                        |
| ------------------ | ---------------------------------------------- |
| `react-markdown`   | Render markdown in AI messages                 |
| `remark-gfm`       | Tables, strikethrough, task lists in markdown  |
| `rehype-highlight` | Syntax highlighting for code blocks            |
| `highlight.js`     | `github-dark.css` theme for rehype-highlight   |

Deliberately **not using** Framer Motion / GSAP — animations are handled with Tailwind keyframes + `IntersectionObserver`. Lighter bundle, more predictable performance.

### Fonts

- **Inter** (body, UI) + **JetBrains Mono** (code) via Google Fonts CDN, loaded in [`resources/views/app.blade.php`](../resources/views/app.blade.php).

---

## 4. Logic & Implementation Highlights

### 4.1 Fake streaming code generation

**Problem**: the backend `SalesPageGenerator` is synchronous — the HTML response arrives all at once. There is no SSE. But users of AI products expect to see code being "typed out."

**Solution**: pure frontend streaming simulation via [`hooks/useStreamingText.js`](../resources/js/hooks/useStreamingText.js).

```js
const { displayedText, isStreaming, progress } = useStreamingText({
    targetText: response.html_content,
    durationMs: 6000,
    onDone: () => setPreviewHtml(response.html_content),
});
```

Core logic:

- `requestAnimationFrame` loop with **ease-out cubic** progression (`1 - (1-t)³`) — starts fast, slows near the end, feels natural.
- Adaptive duration: for large HTML, capped to `Math.max(2000, total_chars / 4)` so the total stays around 10 seconds.
- Cleanup in `useEffect` return to prevent frame leaks on re-render.

Wiring in [`Chat.jsx`](../resources/js/Pages/SalesPages/Chat.jsx):

1. When a response arrives, **don't** immediately set `previewHtml` to the full HTML.
2. Set `streamTarget = response.html_content`, switch tab to `code`.
3. CodeMirror binds to `streamedHtml` (read-only during streaming).
4. [`GenerationProgress`](../resources/js/Components/chat/GenerationProgress.jsx) shows a gradient progress bar + section detector (Hero/Features/Pricing/Testimonials/CTA/FAQ/Footer via regex) — each section already present in `displayedText` gets a green checkmark.
5. [`PreviewSkeleton`](../resources/js/Components/chat/PreviewSkeleton.jsx) in the iframe overlay lights up per-section as the regex detects completed sections.
6. After `onDone`, set `previewHtml` to the full HTML, auto-switch to the `preview` tab after 800 ms.

Result: feels like AI is typing in real time, with zero backend modifications.

### 4.2 Conversation history sidebar

**Problem**: a ChatGPT-like sidebar needs a list of all the user's sales pages, available on every authenticated page.

**Solution**: shared prop via Inertia middleware. In [`HandleInertiaRequests.php`](../app/Http/Middleware/HandleInertiaRequests.php):

```php
'recentSalesPages' => fn () => $request->user()
    ? SalesPage::where('user_id', $request->user()->id)
        ->latest('updated_at')
        ->limit(30)
        ->get(['id', 'product_name', 'updated_at'])
        ->map(fn ($p) => [...])
    : [],
```

On the frontend, [`AuthenticatedLayout.jsx`](../resources/js/Layouts/AuthenticatedLayout.jsx) reads it via `usePage().props.recentSalesPages`. No individual controller changes needed.

Date grouping in [`ConversationList.jsx`](../resources/js/Components/sidebar/ConversationList.jsx):

```
Today / Yesterday / Last 7 days / Last 30 days / Older
```

Buckets are calculated from the difference between `updated_at` and midnight today. Active state is determined from `usePage().props.salesPage?.id` (automatically available on the Chat page because Inertia propagates page-level props).

### 4.3 Markdown rendering in chat

[`ChatMessage.jsx`](../resources/js/Components/chat/ChatMessage.jsx) uses `react-markdown` with a custom `components` mapper — every tag (`p`, `ul`, `ol`, `li`, `a`, `code`, `pre`, `blockquote`, `h1-3`, `table`) is mapped to Tailwind styling consistent with the dark theme. `rehype-highlight` converts `<code class="language-html">` into spans with `hljs-*` classes, then `highlight.js/styles/github-dark.css` (imported in [`app.jsx`](../resources/js/app.jsx)) colorizes the tokens.

Action buttons (Copy/Regenerate) appear on hover via the `group-hover:opacity-100` Tailwind pattern — no JS state needed for show/hide.

### 4.4 Landing page animations

No animation library used. Strategy:

- **Hero typing demo** ([`LandingHeroDemo.jsx`](../resources/js/Components/landing/LandingHeroDemo.jsx)) — a `requestAnimationFrame` loop that increments `typed.length`, with auto-reset for looping. Code is tokenized into a `CODE_LINES` array with tag + className, then rendered progressively as colored spans.
- **Scroll reveal** ([`hooks/useReveal.js`](../resources/js/hooks/useReveal.js)) — `IntersectionObserver` toggles `.is-visible` on elements. CSS transition from `opacity-0 translate-y-6` to `opacity-100 translate-y-0` defined in [`app.css`](../resources/css/app.css).
- **Aurora background** — 3 absolute `<div>` elements with `bg-accent/30 blur-[120px]` + `animate-aurora` keyframe (translate3d + scale). GPU-accelerated, doesn't affect layout.

### 4.5 Auth split-screen

[`GuestLayout.jsx`](../resources/js/Layouts/GuestLayout.jsx) accepts `eyebrow`, `title`, `subtitle` props. 2-column layout (form left, [`AuthShowcase.jsx`](../resources/js/Components/landing/AuthShowcase.jsx) right) on desktop, single-column with subtle aurora on mobile. Login/Register/etc. simply pass props — no duplicate header/footer needed.

[`PasswordInput.jsx`](../resources/js/Components/PasswordInput.jsx) combines `<input type=password>` with an Eye/EyeOff toggle button — reusable in Login, Register, ResetPassword, and ConfirmPassword.

Password strength meter in Register: 4 criteria (length≥8 + uppercase + digit + special char) → score 0–4 → 4 visual bars + label (Weak/Fair/Good/Strong). Pure derivation via `useMemo`, no extra state beyond the input value.

---

## 5. Code Organization

```
resources/js/
├── Components/
│   ├── ui/              # shadcn primitives (button, card, input, label, badge, textarea, select, tabs)
│   ├── chat/            # ChatMessage, ChatComposer, ChatEmptyState, StreamingMessage,
│   │                    # GenerationProgress, PreviewSkeleton, TypingDots
│   ├── sidebar/         # ConversationList, ConversationItem, UserMenu
│   ├── landing/         # LandingHeroDemo, FeatureCard, SectionHeader, AuthShowcase
│   ├── PasswordInput.jsx
│   └── (legacy: Modal, Dropdown, NavLink, etc. — repainted to dark)
├── Layouts/
│   ├── AuthenticatedLayout.jsx   # sidebar + main shell
│   └── GuestLayout.jsx           # split-screen auth
├── Pages/
│   ├── Welcome.jsx               # landing page
│   ├── Auth/                     # Login, Register, ForgotPassword, ResetPassword, ConfirmPassword, VerifyEmail
│   └── SalesPages/               # Index, New, Chat, Builder
├── hooks/
│   ├── useReveal.js              # IntersectionObserver scroll reveal
│   └── useStreamingText.js       # Fake streaming RAF loop
└── app.jsx                       # Inertia bootstrap + highlight.js theme import
```

**Convention**: page-level components live in `Pages/`. Reusable domain components live in `Components/{domain}/` subfolders. Hooks in `hooks/`. No barrel files (`index.js`) — explicit import paths for discoverability.

---

## 6. Verification Strategy

For every UI change:

1. **Build check** — `npm run build` must exit 0. Ensures JSX is valid, all imports resolve, Tailwind recognizes new classes.
2. **Backend check** — `php -l` for any modified PHP files; `php artisan route:list` to confirm routes are intact.
3. **Network shape preserved** — chat & generation request/response unchanged; DevTools Network to verify `{messages, version, generation_meta}` shape.
4. **Manual browser smoke test** — landing page (aurora + hero demo loop), auth pages (split-screen), sidebar (conversation grouping + active state), Chat workspace (empty state → suggestion → streaming animation → preview switch), markdown rendering, password show/hide, password strength meter.

Build & PHP lint are run automatically. Manual browser testing is handed off to the user.

---

## 7. Trade-offs & Future Work

### Trade-offs made

- **Fake streaming, not SSE**: faster to ship, zero risk of backend regression. Consequence: total latency doesn't decrease — the user still waits for the full backend response before the animation starts. Can be improved with SSE later.
- **No animation library**: lighter bundle, but complex animations (page transitions, layout animations) become harder. Current needs are covered by keyframes + IntersectionObserver.
- **Sales page templates remain light**: Aurora/Studio/Foundry templates in [`Templates/`](../resources/js/Templates) are intentionally left light — they are **output content** (mockup landing pages the user will deploy), not app UI. Darkening them would break the user's preview experience of the generated result.
- **Chat.jsx is large (~915 kB)**: CodeMirror + react-markdown + highlight.js are heavy. Can be reduced via dynamic `import()` lazy loading — out of scope for the visual revamp.

### Potential improvements

- True SSE streaming from `SalesPageGenerator` so code appears in real time as AI tokens are emitted.
- Light mode toggle (CSS variables are ready — just set `<html class="light">`).
- Conversation actions (Rename / Delete) in the sidebar — currently visual-only.
- Code-split Chat.jsx via route-level dynamic import to reduce the initial bundle.
- Toast notification system for Copy/Save feedback (currently inline status).
