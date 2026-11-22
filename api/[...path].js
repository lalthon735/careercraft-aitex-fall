/**
 * Vercel serverless entry for the CareerCraft game API.
 *
 * All /api/* requests are routed here (see vercel.json). This reuses the exact
 * same request router that runs under `npm run dev` (Vite middleware) and the
 * standalone Node server (src/game/server/index.js), so there is one source of
 * truth for the routes.
 *
 * Requirements on Vercel (see docs/vercel-deployment.md):
 *   - bodyParser is disabled so handle()'s raw-stream reader works for uploads.
 *   - DATABASE_URL must point at a Postgres instance; the serverless filesystem
 *     is read-only/ephemeral, so saves cannot use the local-file backend.
 *   - The bundled data/ and src/data/ datasets are included via vercel.json
 *     `includeFiles` because the router reads them from disk at runtime.
 */
import { handle } from '../src/game/server/app.js'

// Let handle() consume the raw request stream itself (file uploads are base64 JSON bodies).
export const config = { api: { bodyParser: false } }

export default async function handler(request, response) {
    try {
        const handled = await handle(request, response)
        if (!handled && !response.writableEnded) {
            response.statusCode = 404
            response.setHeader('Content-Type', 'application/json; charset=utf-8')
            response.end(JSON.stringify({ error: 'not-found' }))
        }
    } catch (error) {
        console.error('[api] unhandled error:', error?.stack ?? error)
        if (!response.writableEnded) {
            response.statusCode = 500
            response.setHeader('Content-Type', 'application/json; charset=utf-8')
            response.end(JSON.stringify({ error: 'internal-error' }))
        }
    }
}
