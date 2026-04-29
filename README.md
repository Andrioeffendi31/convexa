# Convexa - AI Sales Page Generator

Convexa turns raw product notes into a structured, persuasive sales page. It supports multiple templates, section-by-section regeneration, and HTML export.

## Stack

- Laravel + Breeze + Inertia React
- PostgreSQL
- shadcn/ui components + Tailwind
- zustand for client state
- Groq API for generation

## Setup

1. Install PHP, Composer, Node.js, and PostgreSQL.
2. Create a PostgreSQL database named `convexa`.
3. Copy environment settings:
    - Ensure `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD` are set in `.env`.
    - Set `AI_PROVIDER=groq`, `AI_BASE_URL=https://api.groq.com/openai/v1`, your `AI_API_KEY`, and:
      - `AI_MODEL=llama-3.3-70b-versatile`
      - `AI_FALLBACK_MODELS=openai/gpt-oss-120b,meta-llama/llama-4-scout-17b-16e-instruct,qwen/qwen3-32b`
4. Install dependencies:
    - `composer install`
    - `npm install`
5. Run migrations:
    - `php artisan migrate`
6. Start the dev servers:
    - `php artisan serve`
    - `npm run dev`

## Core Routes

- `/sales-pages` - list saved pages
- `/sales-pages/create` - create a new chat workspace from initial brief
- `/sales-pages/{id}` - chat + live preview workspace
- `/sales-pages/{id}/export` - export HTML

## Notes

- Generation happens through a configurable AI provider (default: Groq).
- Default model is `llama-3.3-70b-versatile` with automatic fallback models for reliability.
- Generation runs synchronously for MVP simplicity; switch to queued jobs if request latency starts impacting UX.
- Stored AI audit data is intentionally minimal (`generation_meta`) instead of full raw prompt/response payloads.
- Chat-first flow: product brief is initial context only, then copy iteration happens continuously through chat.
- Every assistant response creates a new saved version that can be revisited/switched from the workspace.
- HTML export uses inline styles for a standalone file.
- Each saved page has a public share URL (`/s/{token}`) that can be opened without authentication.
- Render deployment blueprint is available in `render.yaml` (web + worker + Postgres).
- AI generation metadata (model, token usage, prompt hash, timestamp) is stored with each saved page.
- History page includes server-side filter/search (`product_name`, `template`, `updated_at`) + pagination for scale.

## Deploy to Render

1. Push this repository to GitHub/GitLab.
2. In Render Dashboard, create a **Blueprint** and select this repo (it will detect `render.yaml`).
3. Fill secret env vars when prompted:
    - `APP_KEY` (`php artisan key:generate --show`)
    - `APP_URL` (your final Render URL or custom domain)
    - `ASSET_URL` (usually same as `APP_URL`)
    - `AI_API_KEY`
4. Wait for initial deploy to finish, then open the web service URL and run the manual flow:
    - register → create page → regenerate section → save → export → delete

## Deploy to Railway

1. Push this repository to GitHub.
2. Create a new Railway project and deploy from this repo.
3. Add PostgreSQL plugin in Railway, then set environment variables on the web service:
   - `APP_ENV=production`
   - `APP_DEBUG=false`
   - `APP_KEY` (generate with `php artisan key:generate --show`)
   - `APP_URL` (Railway public domain)
   - `ASSET_URL` (same as `APP_URL`)
   - `DB_CONNECTION=pgsql`
   - `DB_URL` (from Railway Postgres `DATABASE_URL`)
   - `CACHE_STORE=database`
   - `SESSION_DRIVER=database`
   - `QUEUE_CONNECTION=database`
   - `FILESYSTEM_DISK=local`
   - `LOG_CHANNEL=stderr`
   - `AI_PROVIDER=groq`
   - `AI_BASE_URL=https://api.groq.com/openai/v1`
   - `AI_API_KEY` (your Groq key)
   - `AI_MODEL=llama-3.3-70b-versatile`
   - `AI_FALLBACK_MODELS=openai/gpt-oss-120b,meta-llama/llama-4-scout-17b-16e-instruct,qwen/qwen3-32b`
4. Deploy web service. By default startup script runs:
   - cache clear/build
   - `php artisan migrate --force`
   - `php artisan serve --host=0.0.0.0 --port=$PORT`
5. (Recommended) Create a second Railway service for queue worker from the same repo:
   - keep same env vars
   - set start command to `sh -lc scripts/railway/start-worker.sh`
