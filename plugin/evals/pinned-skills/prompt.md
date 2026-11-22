---
name: pinned-skills
tags: [install, vendor, needs-shell]
runs: 1
max_turns: 8
timeout_seconds: 180
allowed_tools: [Bash, Read, Glob]
---

Full Stack Founder runs third-party skills from pinned copies inside the plugin. Use its lookup script (scripts/skill.mjs, in the plugin folder) to find the founder-board skill, then print the full path it returns and the first heading of that file.
