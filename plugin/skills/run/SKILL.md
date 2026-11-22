---
name: run
description: Run a playbook, a named chain of studio steps, on a product, idea or feature. Stops at your decisions, skips fresh work, resumes half-done runs. Built-in or your own.
argument-hint: "<playbook> <target> | list | status <target>"
disable-model-invocation: true
---

# /founder:run

Rules: `${CLAUDE_PLUGIN_ROOT}/references/journey.md`.

Playbooks live in `${CLAUDE_PLUGIN_ROOT}/playbooks/*.md` and `<workspace>/playbooks/`; a workspace playbook overrides a built-in one with the same name. Each is a list of numbered steps that name commands, and **Stop:** marks the user's decisions.

- **`list`:** one line per playbook: name, title, target, time and estimated tokens (`costs.md`). Add: "To make your own, copy one into `<workspace>/playbooks/`."
- **`status <target>`:** the newest entry for each playbook in the target's `runs.md`.
- **`<playbook> <target>`:**
  1. Resolve the target as `/founder:idea` does. Open with the steps, their **Stop:** points, and the cost line from `${CLAUDE_PLUGIN_ROOT}/references/costs.md` (over 1M tokens, ask once first).
  2. **Skip a step** whose result is already fresh (from `INDEX.md`, the issue stage or `STATE.md`). Say "done <date>, skipping"; the user can say "redo <n>".
  3. **Run each step:** `Step i of n · <title>`.
     - A `/founder:<name>` step means: read `${CLAUDE_PLUGIN_ROOT}/skills/<name>/SKILL.md` and follow it.
     - A "Playbook X" step runs that playbook inline, with its Stops.
     - A named third-party skill runs per `${CLAUDE_PLUGIN_ROOT}/references/skills.md`.
     - At **Stop:**, give a summary, the options and a pick, then wait.
     - **Autopilot** (when `/founder:ceo` runs it): no questions between Stops, and decisions that are due together come in one batch.
  4. **After each step,** append to `<target>/product/runs.md` (or `ideas/<slug>/runs.md`): `<date time> · <playbook> · step <i> <title> · done | skipped | stopped: <decision> | failed: <why> · <n>k tokens`. Re-running continues from the last one.
  5. **On failure:** retry, skip, or stop.
  6. **Close** with what was produced, the decisions made, and the next step.
- **Never skip a Stop:** step. Outward actions inside a step keep their own confirmation.
