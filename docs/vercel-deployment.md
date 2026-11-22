# Deploying CareerCraft on Vercel

CareerCraft was built for a long-running Node server, but it can run on Vercel as
a **static frontend + a single serverless function**. This guide covers that setup.

## Architecture on Vercel

```
Browser ──> Vercel static (src/game/dist)         # the Vite-built 3D frontend
        └─> /api/*  ──> api/[...path].js (function)  # the game API router
                             └─> Postgres (DATABASE_URL)  # game saves
                             └─> DeepSeek (outbound HTTPS) # AI features
```

- **Frontend:** `vercel.json` builds `src/game` with Vite and serves `src/game/dist` statically.
- **API:** every `/api/*` request is routed to `api/[...path].js`, which reuses the exact
  same router (`src/game/server/app.js`) used by `npm run dev` and the standalone server.
  The bundled `data/` and `src/data/` datasets are shipped with the function via
  `includeFiles` because the router reads them from disk at runtime.
- **Not included:** the Python Telegram chatbot (`src/chatbot/`) is a separate service.
  Deploy it elsewhere (e.g. Render) or as its own Vercel Python function; it is optional.

## Required environment variables

Set these in the Vercel project (Settings → Environment Variables):

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | **Yes** | Postgres connection string. The serverless filesystem is read-only/ephemeral, so the local-file save backend will not persist. Tables are created automatically (`CREATE TABLE IF NOT EXISTS`). |
| `AI_PROVIDER` | Yes | `deepseek` for the live demo, or `AI_MOCK=1` for canned answers with no provider. |
| `DEEPSEEK_API_KEY` | If using DeepSeek | Your private key. |
| `DEEPSEEK_MODEL` | Optional | Defaults to `deepseek-flash`. |
| `AI_MOCK` | Optional | `1` = no provider calls (safe for a first deploy / avoids AI timeouts). |
| `INTEGRATION_TOKEN` | If using the Telegram/n8n integration | Must match the chatbot's token. Leave empty to disable `/api/integrations/*`. |

## Provisioning Postgres

Any Postgres works (Vercel Postgres, Neon, Supabase, RDS…). Create a database, copy its
connection string into `DATABASE_URL`. No migration step is required — the app creates its
`game_saves` and `app_documents` tables on first write.

## Deploy

1. Push this repository to a Git provider and import it into Vercel.
2. Vercel reads `vercel.json` (build command, output directory, and the function config) —
   no manual framework settings needed.
3. Add the environment variables above.
4. Deploy. The frontend is served from `/`; the API answers under `/api/*`.

To test locally with the Vercel runtime: `npx vercel dev` (set the env vars in a `.env` first).

## Known limitations / caveats

- **Function duration & AI calls.** `vercel.json` sets `maxDuration: 60`. Long AI
  generations (roadmaps) can take longer than 60s; on the **Hobby** plan they may be cut off.
  On **Pro** you can raise `maxDuration` up to `300`. For a reliable demo without a paid plan,
  set `AI_MOCK=1`, or keep AI features to the faster calls.
- **No shared in-process state.** The standalone server serialises save-mutating requests
  in process; across serverless invocations that lock does not apply. CareerCraft uses a
  single shared save, so concurrent writers could race — fine for a demo, not for heavy use.
- **PDF upload.** `pdf-parse` is loaded on demand; if the bundler drops it, PDF profile
  extraction fails while everything else works. Pasting text / uploading page images still works.
- **Background collection.** The optional crawler/market collection writes to disk and will not
  run on the read-only serverless filesystem; leave it disabled.

If you want the full stack (including the Telegram bot) running unchanged, use the Render
setup in [`render.yaml`](../render.yaml) / [render-deployment.md](render-deployment.md) instead.
