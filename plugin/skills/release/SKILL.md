---
name: release
description: Cut a release. Semver, changelog, GitHub release notes, ideas marked shipped; plus backup, migrations, promote, smoke and Sentry once deployed. Offers an announcement.
argument-hint: "[patch | minor | major]"
disable-model-invocation: true
---

# /founder:release

Rules: `${CLAUDE_PLUGIN_ROOT}/references/journey.md`. Gate: `build --product .`, or `graduate` once deployed. Run on an up-to-date `main`.

1. **Ready?**
   - The newest `/founder:verify` is newer than the last merge and has no open P1. Otherwise run `/founder:verify`.
   - The version comes from the PRs since the last tag: `feat` → minor, `fix` → patch, breaking → major. The user can override.
2. **Local, always:**
   1. Update `CHANGELOG.md` (Added / Changed / Fixed, in user language) and `app/changelog`.
   2. Commit `release: vX.Y.Z` and tag it.
   3. Preview, then push `main` and the tag.
   4. `gh release create` with notes from the merged PRs.
   5. Ideas whose spec shipped get `status:shipped` and `next: /founder:listen`.
3. **Production** (only after `/founder:deploy`). Stop at the first failure:
   1. Back up the database.
   2. `supabase db push` (expand only).
   3. Promote the Vercel deployment.
   4. Check `/api/health` and run the smoke suite.
   5. Create the Sentry release.

   Rollback is Vercel's instant rollback. The database only moves forward, with a fix migration.
4. **Close:** update `STATE.md`, and say what shipped in user language. Next: `/founder:market announce vX.Y.Z`.
