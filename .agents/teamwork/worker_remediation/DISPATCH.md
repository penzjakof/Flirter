# Dispatch Task: Worker Remediation (Implementation of Targeted Fixes)

## Mission
Apply the targeted remediation fixes designed by Explorers 1, 2, and 3 across the codebase, execute all test suites, and verify zero errors in TypeScript and Linter.

## Mandatory Files to Read Before Starting
1. `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/ORIGINAL_REQUEST.md` (mandatory first read)
2. `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/PROJECT.md`
3. Explorer Handoff Reports:
   - `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/explorer_rem_1/handoff.md`
   - `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/explorer_rem_2/handoff.md`
   - `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/explorer_rem_3/handoff.md`

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Detailed Tasks & File Ownership
You have exclusive write ownership of:
1. `src/components/layout/glass-tab-bar.tsx`
   - Lock `GlassSurface` to `tintColor="rgba(255, 255, 255, 0.40)"` and `colorScheme="light"`.
   - Clean destructuring to `const { colors } = useTheme();`.

2. `src/lib/storage.ts`
   - Add `theme: 'flirter.theme.v1'` to `STORAGE_KEYS`.

3. `src/store/theme-store.ts`
   - Import `STORAGE_KEYS` from `@/lib/storage`.
   - Set `name: STORAGE_KEYS.theme, // name: 'flirter.theme.v1'`.

4. `src/components/energy/energy-plus-card.tsx`
   - In `styles.benefitText`, remove `color: colors.textPrimary` so that `benefitText: { flex: 1 }` and `AppText` dynamically controls its color without dark-on-dark contrast collision.

5. `src/app/(app)/(tabs)/chats.tsx`
   - Clean up static color references in `StyleSheet` for `unreadBadge` and `countBadge` to use dynamic styling or remove `colors` from static StyleSheet.

## Verification Commands
After making the changes, run:
1. `npx tsc --noEmit` (must be 0 errors, exit code 0)
2. `npx expo lint` (must be 0 errors, 0 warnings, exit code 0)
3. `node scratch/test-m1.mjs` (must pass 6/6 with exit code 0)
4. `node scratch/test-m2.mjs` (must pass with exit code 0)
5. `node scratch/test-m3.mjs` (must pass with exit code 0)
6. `node scratch/adversarial-transitions-test.mjs` (must pass 25/25 with exit code 0)
7. `node scratch/adversarial-contrast-test.mjs` (must pass with exit code 0)
8. `node scratch/forensic-audit-suite.mjs` (must pass 7/7 with exit code 0)

## Handoff Requirements
Write your implementation report to `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/worker_remediation/implementation_report.md` and handoff to `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/worker_remediation/handoff.md`.
Send a message to orchestrator_2 (f4c9f810-9ff6-4876-9fec-a2a6dcce1bf6) when finished.

## 2026-10-08T14:07:12Z
You are Worker Remediation (Implementation Specialist).
Your working directory is: /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/worker_remediation
Your task instructions are in: /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/worker_remediation/DISPATCH.md

Read /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/ORIGINAL_REQUEST.md (mandatory first read) and /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/PROJECT.md.
Also read:
- /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/explorer_rem_1/handoff.md
- /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/explorer_rem_2/handoff.md
- /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/explorer_rem_3/handoff.md

