# Dispatch Task: Reviewer 2 (UI Primitives & Screens Theming Review)

## Mission
Conduct a thorough review of all adapted UI components and screens across the entire application.
You MUST read:
1. `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/ORIGINAL_REQUEST.md` (mandatory first read)
2. `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/PROJECT.md`
3. `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/worker_m2/handoff.md`
4. `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/worker_m3/handoff.md`

## Review Scope & Instructions
1. Run `npx tsc --noEmit` and `npx expo lint`.
2. Inspect:
   - UI primitives: `AppText`, `Button`, `SelectableChip`, `TextField`, `BottomSheet`, `Checkbox`, `OptionGroup`, `IconButton`, `Avatar`, `Chip`.
   - Onboarding screens and layouts: `welcome.tsx`, `age.tsx`, `verify.tsx`, `disclosure.tsx`, `onboarding-layout.tsx`.
   - Main tabs and routes: `index.tsx` (Discover), `chats.tsx`, `profile.tsx` (Theme switcher), `character/[id].tsx`, `legal/[doc].tsx`.
   - Chat: `chat/[id].tsx`, `composer.tsx`, `message-bubble.tsx`, `typing-indicator.tsx`.
   - Energy: `energy.tsx`, `balance-card.tsx`, `energy-chip.tsx`, `energy-packages-list.tsx`, `energy-plus-card.tsx`, `insufficient-energy-sheet.tsx`, `waiting-characters.tsx`.
   - Layout & Discover: `app-header.tsx`, `boot-screen.tsx`, `brand-mark.tsx`, `character-grid-card.tsx`, `filter-sheet.tsx`, `gender-selector.tsx`.
3. Check for contrast issues, hardcoded colors, broken layouts, or regression risks.
4. Write your detailed review to `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/reviewer_2/review_report.md` and handoff to `/Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/reviewer_2/handoff.md`.
5. Include your explicit verdict: `APPROVE` or `REQUEST_CHANGES`.

## 2026-10-08T13:41:00Z
Sender: f4c9f810-9ff6-4876-9fec-a2a6dcce1bf6 (orchestrator_2)
You are Reviewer 2 (UI Primitives & Screens Theming Review Specialist).
Your working directory is: /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/reviewer_2
Read /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/ORIGINAL_REQUEST.md before starting work.
Run `npx tsc --noEmit` and `npx expo lint`.
Write your report to /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/reviewer_2/review_report.md and your handoff to /Users/ivanpenzakov/Documents/Projects/Tiolki/Front/.agents/teamwork/reviewer_2/handoff.md.
State your verdict explicitly: APPROVE or REQUEST_CHANGES.
When finished, send a message to orchestrator_2 (f4c9f810-9ff6-4876-9fec-a2a6dcce1bf6).
