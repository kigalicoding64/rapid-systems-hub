<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules (RAPID SYSTEMS)

- Public website pages wrap their content in `SiteLayout` (src/components/site); the client portal (`/client/*`) and operations platform (`/app/*`) will get their own shells — keeps the three experiences visually and structurally separate while `src/routes/index.tsx` stays the `/` route.
- Company facts (name, contact details, vision, mission) come from the single-row `company_settings` table via `companyQueryOptions()`; never hard-code them in pages — the owner edits them in one place. The fallback constant in `company.functions.ts` must mirror the row.
- Marketing copy for divisions, industries, solutions and process lives in `src/lib/site-content.ts` — one source for nav, pages and the request form's service/subcategory options.
- Request-form validation lives in `src/lib/request-schema.ts` and is shared by browser and server; the server function re-parses everything — client checks are UX only.
- Public submissions (requests, contact) are written only by server functions using the admin client after validation, honeypot and per-email hourly rate limit; those tables have no anon policies — guests must never read or write them directly.
- Guest request tracking uses a 256-bit random token; only its SHA-256 hash is stored and lookups never expose internal ids or private notes — sequential references are display-only, never an access key.
- Request files go to the private `request-attachments` bucket via server-issued signed upload URLs, then are recorded after the server verifies the object exists — no public bucket and no client storage policies.
- Business reference numbers are assigned by a database trigger from a sequence — never generated in app code.
- Portfolio entries are public only when `is_published` is true (RLS); never seed or show unverified sample projects.
- Brand colours are sampled from the supplied logo and defined as tokens in `src/styles.css`; dark sections use the `.dark` class on a wrapper rather than hard-coded colours.
