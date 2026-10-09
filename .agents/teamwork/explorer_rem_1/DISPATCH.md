# Dispatch Task: Explorer 1 (Glass Tab Bar & Test M1 Remediation Strategy)

## Mission
Investigate and design a precise fix strategy for the Glass Tab Bar iOS contrast defect and the `scratch/test-m1.mjs` test failure.

## Mandatory Files to Read
1. `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/ORIGINAL_REQUEST.md` (mandatory first read)
2. `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/PROJECT.md`
3. Forensic Auditor Evidence:
   - `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/auditor_1/audit_report.md`
   - `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/auditor_1/handoff.md`
4. Reviewer 1 & Challenger 1 Reports:
   - `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/reviewer_1/handoff.md`
   - `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/challenger_1/handoff.md`

## Problem Context
1. In `src/components/layout/glass-tab-bar.tsx` (lines 53–56), `GlassSurface` is currently given:
   `tintColor={isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.40)'}`
   `colorScheme={isDark ? 'dark' : 'light'}`
   On iOS, this forces native `GlassView` into dark material mode, which turns the tab bar dark and drops inactive icon contrast (`tabBarInactive: '#403644'`) to ~1.08:1 on dark backgrounds, violating R1 of ORIGINAL_REQUEST.md.
2. In `scratch/test-m1.mjs`, running `node scratch/test-m1.mjs` fails with `AssertionError: GlassTabBar must use useTheme()`.

## Output Requirements
1. Analyze `src/components/layout/glass-tab-bar.tsx`, `src/components/ui/glass-surface.tsx`, and `scratch/test-m1.mjs`.
2. Formulate the exact code edits needed to fix both the iOS contrast (locking `colorScheme="light"` and `tintColor="rgba(255, 255, 255, 0.40)"` on GlassSurface) and pass `scratch/test-m1.mjs`.
3. Write your report to `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/explorer_rem_1/remediation_strategy.md` and handoff to `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/explorer_rem_1/handoff.md`.
4. Send a message to orchestrator_2 (f4c9f810-9ff6-4876-9fec-a2a6dcce1bf6) when complete.


## 2026-10-08T13:56:54Z
You are Explorer 1 (Glass Tab Bar & Test M1 Remediation Strategy Specialist).
Your working directory is: /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/explorer_rem_1
Your task instructions are in: /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/explorer_rem_1/DISPATCH.md
Read /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/ORIGINAL_REQUEST.md (mandatory first read) and /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/PROJECT.md.
Also read:
- /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/auditor_1/audit_report.md
- /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/auditor_1/handoff.md
- /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/reviewer_1/handoff.md
- /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/challenger_1/handoff.md

Investigate `src/components/layout/glass-tab-bar.tsx`, `src/components/ui/glass-surface.tsx`, and `scratch/test-m1.mjs`.
Design the exact fix strategy to lock `colorScheme="light"` and `tintColor="rgba(255, 255, 255, 0.40)"` on GlassSurface in `glass-tab-bar.tsx` while satisfying R1 and `test-m1.mjs`.
Write your report to /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/explorer_rem_1/remediation_strategy.md and your handoff to /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/explorer_rem_1/handoff.md.
When finished, send a message to orchestrator_2 (f4c9f810-9ff6-4876-9fec-a2a6dcce1bf6).
