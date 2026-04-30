# Convexa — Approach, Tools & Logic

## What It Is

Convexa is an AI-powered sales page generator. Users describe a product, pick a visual template, and the app produces a complete, single-file HTML landing page. From there, users can refine the page through a conversational chat interface, manage versions, preview the output live, edit the raw HTML, export, or share via a public link.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Backend | Laravel 11 (PHP) |
| Frontend | React 18 via Inertia.js |
| Styling | Tailwind CSS v3 + Radix UI primitives |
| Build | Vite |
| State | Zustand (client), Inertia props (server→client) |
| Code editor | CodeMirror + `@codemirror/lang-html` |
| Database | SQLite (single-file, portable) |
| AI | OpenAI-compatible chat completions (OpenRouter, Groq, or any compatible provider) |
| Deployment | Railway / Render |

---

## Architecture

```
User browser
    ↕  Inertia.js (no separate REST API — Laravel renders page props directly)
Laravel routes / controllers
    ↕  SalesPageGenerator (service)
OpenAI-compatible /chat/completions endpoint
```

Inertia.js eliminates the need for a separate JSON API: controllers return `Inertia::render(...)` responses and React pages receive typed props, keeping the data layer thin.

---

## Core Data Model

- **SalesPage** — the root entity (product brief, template key, active version pointer, public share token)
- **SalesPageVersion** — each AI generation or code save creates a version snapshot (HTML content + generation metadata)
- **SalesPageMessage** — chat turn history per page (role, content, associated version)

Versions let users roll back to any prior generation. A single `active_version_id` foreign key on `SalesPage` controls what the live preview renders.

---

## Generation Flow

### Initial generation

1. User fills the brief form (`New.jsx` → `SalesPageController@store`).
2. Controller creates the `SalesPage` record and immediately renders a **starter HTML blueprint** (`SalesPageBlueprints::renderStarterHtml`) — a deterministic, no-AI template pre-filled with the brief data. This gives instant feedback while the AI runs.
3. `SalesPageGenerationController@generate` calls `SalesPageGenerator::generateHtmlFromBrief()`.
4. The service builds a prompt: enhanced brief dossier + template blueprint contract + Pexels image reference + output quality checklist.
5. A single chat completion request is sent with `response_format: json_object`. The model returns `{"assistant_message": "...", "html_content": "..."}`.
6. The HTML is normalized (ensures `<!doctype html>` wrapper if missing), saved as a new `SalesPageVersion`, and the page's `active_version_id` is updated.

### Chat revision

1. User types an instruction in the chat panel (`Chat.jsx`).
2. `SalesPageChatController@send` calls `SalesPageGenerator::reviseFromChat()`.
3. The service injects: current HTML draft + recent message history (last 12 turns) + enhanced user instruction.
4. `enhanceUserInstruction()` classifies the instruction (rewrite vs. focused edit, minimal vs. bold design direction) and injects an execution brief to steer output quality.
5. Same JSON response format — the assistant message appears in the chat, the new HTML becomes a new version.

---

## AI Prompt Strategy

The prompts are structured in two parts separated by `---`:

**Instructions** (what to do and how to output it):
- Mandate complete single-file HTML with inline `<style>`, responsive layout, sticky navbar, print CSS
- Require Pexels CDN image URLs (not page links) for visual placeholders
- Demand professional conversion structure: navbar → hero → benefits → features → social proof → pricing → CTA → footer
- Output schema contract: `{"assistant_message":"...","html_content":"..."}`

**Context** (what to generate it for):
- Enhanced brief dossier: product name, description, audience, price, features, USPs, brand tone, CTA preferences, proof points, objections — with inferred defaults when fields are empty
- Template blueprint contract: style/color/tone rules specific to the chosen template (Aurora, Foundry, Studio)
- Pexels image seed URLs for visual reference

Model-specific optimizations are applied for `llama-3.3-70b-versatile` (explicit section labels, concrete outcome-oriented language, avoid poetic tone).

---

## Reliability: Model Fallback & Timeouts

`requestStructuredJson()` operates within a configurable **request budget** (default 22 s). It iterates over a primary model plus any configured fallbacks:

- Per-request timeout is clamped to the remaining budget.
- Retries happen only for model-specific failure codes (400, 403, 404, 422, 429, 500, 503).
- `ConnectionException` (network-level) triggers a fallback to the next model.
- Budget exhaustion returns HTTP 408 with a user-readable error.

Error messages are resolved from provider JSON (`error.message`, `message`, `error`) before falling back to plain-text truncation, then matched to friendly user-facing strings per status code.

---

## Templates

Three templates ship as both **starter blueprints** (server-rendered PHP, zero AI cost) and **prompt contracts** (injected into AI context):

| Key | Style |
|---|---|
| `aurora` | Clean SaaS — light theme, trust-first, dark CTA accents |
| `foundry` | Enterprise — dark premium surfaces, cyan accent, executive tone |
| `studio` | Product storytelling — warm orange accents, feature-first |

The blueprint contract is injected verbatim into the prompt so the model maintains visual consistency across chat revisions.

---

## Frontend: Chat & Preview

- **Split-pane layout** — resizable left (chat) / right (preview) with a drag handle. Collapses to stacked on mobile.
- **Preview** renders generated HTML in a sandboxed `<iframe>`.
- **Code editor** (CodeMirror, HTML mode) allows direct HTML editing. Saving creates a new `SalesPageVersion`.
- **Version selector** — dropdown lists all versions by timestamp/label; activating one calls `SalesPageChatController@activateVersion`.
- **Streaming animation** — `useStreamingText` hook progressively reveals the HTML string in the preview over ~6 s, giving a smooth "writing" effect. This is simulated client-side animation, not server-sent events.
- **Auto-generate on load** — if `generation_meta` is absent or `status === "failed"`, the chat page fires a generation request automatically on mount.

---

## Export & Sharing

- **Export** (`/sales-pages/{id}/export`) — streams the active HTML as a downloadable `.html` file.
- **Public link** (`/s/{token}`) — unauthenticated route renders the active version's HTML in an iframe. Each page has a unique opaque `public_token` (generated on creation).

---

## Rate Limiting

AI-touching routes (`generate`, `regenerate`, `chat`, `retry-initial`) are grouped under the `throttle:ai-generation` middleware alias, configurable in `AppServiceProvider`.

---

## Key Files

| File | Purpose |
|---|---|
| [app/Services/SalesPageGenerator.php](../app/Services/SalesPageGenerator.php) | All AI prompt building, HTTP dispatch, fallback logic |
| [app/Support/SalesPageBlueprints.php](../app/Support/SalesPageBlueprints.php) | Deterministic starter HTML per template |
| [resources/js/Pages/SalesPages/Chat.jsx](../resources/js/Pages/SalesPages/Chat.jsx) | Main chat + preview interface |
| [resources/js/Pages/SalesPages/New.jsx](../resources/js/Pages/SalesPages/New.jsx) | Brief intake form |
| [resources/js/hooks/useStreamingText.js](../resources/js/hooks/useStreamingText.js) | Preview streaming animation |
| [routes/web.php](../routes/web.php) | All application routes |
