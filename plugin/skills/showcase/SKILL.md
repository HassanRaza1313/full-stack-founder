---
name: showcase
description: Turn a built product into a portfolio piece. Case study with early-access form, videos, carousel, posts, public repo, optional free demo. You approve and post everything.
argument-hint: "[product] | <product> demo on|off"
disable-model-invocation: true
---

# /founder:showcase

Rules: `${CLAUDE_PLUGIN_ROOT}/references/journey.md`. Gate: `showcase`. The case study is published through the portfolio site, at the folder in `site.repo`. If it's missing, run `/founder:setup showcase`.

## Showcase

1. **Ready:** a `/founder:verify` from the last 7 days with no P1 bugs, and the MVP milestone done apart from `launch-blocker` tickets.
2. **Case study:** `/founder:market case-study`, then publish it as `content/<slug>.mdx` in `site.repo`, at `<site.url>/<slug>` (or `https://<site.domain>/<slug>` when only a domain is set), with the video and the form block.
3. **Early-access form:**
   - email
   - a qualifier, "Which describes you best?", with the 3 personas plus "Just curious"
   - an optional "use for?"
   - consent and a privacy notice
   - Turnstile

   It writes to the shared `waitlist` table, with `product_slug` and the UTM fields. No automated emails before graduation.
4. **Media:** `/founder:market video demo`, `video vertical`, `video brag` and `carousel showcase`, plus screenshots at 1440×900 and 390×844. Everything goes in `<media>/<Name>/Marketing/<date>-showcase/`.
5. **Posts:** `/founder:market post showcase` (an announcement, a build story, a lessons post) → `showcase/posts.md`.
6. **Go public:** a README with a demo GIF, and `gitleaks` clean across the whole history. **Gate:** then run `gh repo edit --visibility public --accept-visibility-change-consequences`.
7. **Track:**
   - `status:showcased`
   - metadata `site:` and `next: /founder:listen`
   - a comment with all the links
   - Content log rows
8. **Close** with a posting schedule. Then offer `/founder:sales prospects --signal`.

## `demo on | off`

**on:** for products on the template's stack (a `supabase` service). For others, host the demo where the engineering rules say; if no free host fits (a GPU, a big Docker stack), say so plainly and offer a recorded demo instead.
1. Check that live demos are below `demos.maxLive`. Otherwise, ask which one comes down.
2. **(the user)** creates the Vercel Hobby project. Point to the exact screen.
3. **The database:** its own Supabase project if a slot is free, otherwise a schema in `studio`.
4. Seed it, create a demo account (no sign-up), and set up a nightly `pg_cron` reset.
5. **Address:** with `site.domain` set, point `<slug>.<site.domain>` at the deployment with a Cloudflare DNS record, once the user confirms. Without one, use the project's free `<project>.vercel.app` address.
6. Set `demo: live` and `demo_url:`. Free Supabase projects pause after about a week without use; `/founder:listen` checks for that.

**off:** remove the custom address if there is one, pause the database (deleting it needs its own confirmation), and set `demo: none`.
