---
name: setup-product
description: Turn a ready idea into a product repo. Scaffold, template, GitHub repo, labels, media folders, research moved in; then brief, roadmap, starting backlog, Pocock setup, Content log.
argument-hint: "<slug> \"<Product Name>\""
disable-model-invocation: true
---

# /founder:setup-product

Rules: `${CLAUDE_PLUGIN_ROOT}/references/journey.md`. Gate: `build`. Usually offered by `/founder:prove` when the founder says "build it".

1. **Confirm:** the name. If there's no `03-brand/naming.md` yet, write it first with startup-design's brand phase, naming part only (5 names, each with `.com`/`.app` availability by RDAP, handles and a trademark search link, then a pick). Suggest the pick. Preview what happens: a private repo `<owner>/<name>` is created, the research moves in, and the media folder is renamed.
2. **Script** (several minutes; run it in the background):
   ```
   node "${CLAUDE_PLUGIN_ROOT}/scripts/setup-product.mjs" --slug <slug> --name "<Product Name>"
   ```
   If it fails, report the step and stop. Never delete half-made work without asking.
3. **Finish in the new repo:**
   1. **Brief:** the `product-marketing` skill, on `product/discovery/` → `.agents/product-marketing.md`.
   2. **Roadmap:** `product/roadmap.md` from `mvp-definition.md` and `feature-prioritization.md`: Now (MVP), Next, Later.
   3. **Backlog** (show the list once before creating anything):
      - each roadmap item → `type:idea, status:validated, source:discovery`, with `impact confidence ease score evidence updated`
      - deferred variants and the council's expansion ideas → `status:new`
   4. **Pocock setup:** follow `setup-matt-pocock-skills`, loaded with `node "${CLAUDE_PLUGIN_ROOT}/scripts/skill.mjs" setup-matt-pocock-skills`. Choose the GitHub tracker, triage labels and single-context docs.
   5. **`product-metrics.md`:** the targets and graduation thresholds from discovery.
   6. **`services.json`:** empty it if the product has no database, so Docker never starts for it.
   7. **`Content log` Sheet** in the media folder, with columns `date, campaign, channel, asset path, post URL, impressions, reactions, comments, clicks, signups, notes`. Use the Sheets connector, otherwise an `.xlsx`. Link it in `STATE.md`.
   8. **Commit and push** `Add brief, roadmap and backlog`. The repo stays private until `/founder:showcase`.
4. **Next:** `/founder:spec`, in a fresh session in this repo. Stop any time with `/founder:pause`.

**Template test:** `--local --out <scratch>` scaffolds only (about 700 MB). Put it on a roomy drive and delete it afterwards.
