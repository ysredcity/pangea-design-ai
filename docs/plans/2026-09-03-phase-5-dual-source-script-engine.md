# Phase 5 Dual-Source Script Engine Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the script engine consume typed rich `ConversationScene[]` by default while allowing website/editor JSON to resolve artifact target IDs at the loading boundary.

**Architecture:** The engine owns source-agnostic rich scene contracts, trigger matching and JSON target resolution; it does not render a parallel message UI. The immersive template remains the rich renderer and authors its example data in TypeScript, preserving existing L1/L2/L3 execution, clarification, product blocks and explicit approval semantics.

**Tech Stack:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Base UI/shadcn v4, Node.js quality scripts.

---

### Task 1: Replace the obsolete seven-block contract with rich scene contracts

**Files:**
- Modify: `/Users/yangshuo/Code/agent-ued-guide/packages/agent-ui/src/script-engine/types.ts`
- Modify: `/Users/yangshuo/Code/agent-ued-guide/packages/agent-ui/src/script-engine/match.ts`
- Modify: `/Users/yangshuo/Code/agent-ued-guide/packages/agent-ui/src/script-engine/interpolate.ts`
- Modify: `/Users/yangshuo/Code/agent-ued-guide/packages/agent-ui/tsconfig.json`
- Modify: `/Users/yangshuo/Code/agent-ued-guide/packages/agent-ui/package.json`

**Step 1:** Define a rich `ConversationScene` contract with scene ID, optional keyword/regex trigger, L1/L2/L3 execution data, clarification data, attachments, product blocks and explicit approval outcomes.

**Step 2:** Define JSON-only target-reference shapes (`targetId`) beside the resolved shapes, retaining a generic target parameter so the shared engine never imports the immersive panel registry.

**Step 3:** Update trigger matching to select rich scenes; preserve declared-order priority and robust invalid-regex handling.

**Step 4:** Expose the script-engine entry point and include it in package type checking.

### Task 2: Implement source-boundary parsing and a renderer-neutral runtime

**Files:**
- Modify: `/Users/yangshuo/Code/agent-ued-guide/packages/agent-ui/src/script-engine/parse.ts`
- Modify: `/Users/yangshuo/Code/agent-ued-guide/packages/agent-ui/src/script-engine/runtime.ts`
- Modify: `/Users/yangshuo/Code/agent-ued-guide/packages/agent-ui/src/script-engine/script-player.tsx`
- Modify: `/Users/yangshuo/Code/agent-ued-guide/packages/agent-ui/src/script-engine/index.ts`

**Step 1:** Replace old block/node validation with rich-scene validation: unique scene/turn IDs, clarification-field and follow-up bounds, high-risk ConfirmCard five-field requirement, and explicit `awaitingApproval` plus approved/rejected outcomes.

**Step 2:** Add `resolveTargets()` to resolve JSON `targetId` references in execution actions and user/assistant attachments through a caller-provided registry. Fail clearly for unresolved IDs and never couple to panel or canvas implementations.

**Step 3:** Reduce the runtime to scene selection and immutable rich-scene handling; retain string interpolation only as a standalone utility for any future generated text.

**Step 4:** Replace `ScriptPlayer`’s former seven-component rendering switch with a renderer-neutral bridge that delegates a selected resolved scene to the product’s rich renderer.

### Task 3: Migrate the immersive example to typed scene authoring

**Files:**
- Modify: `/Users/yangshuo/Code/agent-ued-guide/skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/conversation-data.ts`
- Create: `/Users/yangshuo/Code/agent-ued-guide/skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/scenes.ts`
- Modify: `/Users/yangshuo/Code/agent-ued-guide/skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/agent-shell.tsx`
- Modify: `/Users/yangshuo/Code/agent-ued-guide/scripts/sync-agent-ui.mjs`

**Step 1:** Move example `conversationScenes` into a typed `scenes.ts` array and derive the sidebar’s existing ID-indexed lookup from it, leaving the displayed experience unchanged.

**Step 2:** Keep template-specific `ArtifactTarget`, panel routing and renderer data in `agent-layout`; do not import panel types into shared engine code.

**Step 3:** Preserve the three-turn `pinned-1` approval flow exactly: only the imminent write is confirmable, pending remains shell-owned, and approve/reject append local demonstration outcomes.

**Step 4:** Materialize the source-agnostic script-engine module into standalone templates, while preserving relative imports and no shared runtime dependency.

### Task 4: Adapt the JSON quality gate to both sources

**Files:**
- Modify: `/Users/yangshuo/Code/agent-ued-guide/skills/agent-ux-react/scripts/check-scripts.mjs`
- Modify: `/Users/yangshuo/Code/agent-ued-guide/skills/agent-ux-react/templates/immersive-starter/package.json`
- Modify: `/Users/yangshuo/Code/agent-ued-guide/skills/agent-ux-react/templates/copilot-starter/package.json`

**Step 1:** Detect a typed `src/components/agent-layout/scenes.ts` source for immersive templates and keep `src/mock/scenarios.json` validation for JSON consumers.

**Step 2:** Validate JSON rich-scene target references, high-risk approval outcomes, clarification field counts and follow-up count without trying to execute TypeScript in Node.

**Step 3:** Let TypeScript validate the TS route through normal template build; make the gate report which source mode was checked.

### Task 5: Document the contract and run all gates

**Files:**
- Modify: `/Users/yangshuo/Code/agent-ued-guide/docs/proposals/mock-script-engine.md`
- Modify: `/Users/yangshuo/Code/agent-ued-guide/docs/proposals/agent-layout-integration.md`
- Modify: `/Users/yangshuo/Code/agent-ued-guide/CHANGELOG.md`
- Modify: `/Users/yangshuo/Code/agent-ued-guide/PROJECT_CONTEXT.md`

**Step 1:** Document TS as the default authoring route, JSON as an editor interchange route, the registry-based `resolveTargets()` boundary, and the deliberately deferred clarification-timing data model.

**Step 2:** Update roadmap and context records to mark Phase 5 complete only after all validation passes.

**Step 3:** Run `npm run sync:agent-ui`, `npm run check:agent-ui-types`, `npm run check:agent-ui-drift`, `npm run check:component-docs`, `npm run gate`, `git diff --check`, and `git status -sb` from `/Users/yangshuo/Code/agent-ued-guide`.
