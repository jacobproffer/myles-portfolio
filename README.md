# Myles' Portfolio Site

Made with Astro and Tailwind.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## ✏️ Content preview

Edits in Sanity can be previewed on the real site before they're published, from the
**Preview** tab in the Studio (Sanity's Presentation tool).

- `/` is built ahead of time and only ever shows **published** content.
- `/preview` is the same page rendered on request by a Netlify function. When it's opened from the
  Studio, it shows **unpublished drafts**, updates as you type, and lets you click text to edit it.
  Opened any other way, it shows published content. It's marked `noindex`.

The Studio signs a browser into draft mode through `/api/draft-mode/enable`, which checks a
one-time secret and sets a cookie. Preview code lives in `src/preview/`, `src/middleware.ts`,
`src/pages/preview.astro` and `src/pages/api/draft-mode/`.

### One-time setup

1. **Read token.** In [sanity.io/manage](https://www.sanity.io/manage) → API → Tokens, add a token
   with the **Viewer** role.
2. **Netlify environment variables** (Site configuration → Environment variables), then redeploy:
   - `SANITY_API_READ_TOKEN` = the token from step 1
   - `SANITY_STUDIO_URL` = the deployed Studio URL, e.g. `https://<name>.sanity.studio`
3. **Point the Studio at the site.** Create `studio/.env.production` with
   `SANITY_STUDIO_SITE_URL=https://<your-site>` (no trailing slash), then run `npm run deploy` in `studio/`.
4. **Publish → rebuild.** In Netlify → Build hooks, create a hook. In sanity.io/manage → API →
   Webhooks, add it as the URL for create/update/delete on the `production` dataset (leave drafts
   and versions off), so published changes reach `/`.
5. **Editors.** Invite collaborators in sanity.io/manage → Members.

### Running preview locally

Add `SANITY_API_READ_TOKEN=<viewer token>` to `.env`, run `npm run dev` here and `npm run dev` in
`studio/`, then open the **Preview** tab at `localhost:3333`.
