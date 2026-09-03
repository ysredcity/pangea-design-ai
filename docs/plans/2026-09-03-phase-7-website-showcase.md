# Phase 7 Website Showcase Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a standalone static website workspace for browsing the agent UX system, switching between immersive Agent and Copilot template demos, inspecting component documentation/variants, previewing a resolved immersive scene, and editing/importing/exporting JSON scene data locally.

**Architecture:** `website/` is a Vite workspace and a third internal consumer of `@agent-ux/agent-ui`. It uses the shared conversation and script-engine contracts, but keeps website-specific target rendering and local persistence within the website adapter; it does not duplicate the template’s panel registry or turn website configuration into an agent-expression constraint.

**Tech Stack:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Base UI/shadcn v4, `@agent-ux/agent-ui`, `localStorage`.

---

### Task 1: Add a standalone website workspace

**Files:**
- Modify: `/Users/yangshuo/Code/agent-ued-guide/package.json`
- Create: `/Users/yangshuo/Code/agent-ued-guide/website/package.json`
- Create: `/Users/yangshuo/Code/agent-ued-guide/website/tsconfig.json`
- Create: `/Users/yangshuo/Code/agent-ued-guide/website/tsconfig.app.json`
- Create: `/Users/yangshuo/Code/agent-ued-guide/website/tsconfig.node.json`
- Create: `/Users/yangshuo/Code/agent-ued-guide/website/vite.config.ts`
- Create: `/Users/yangshuo/Code/agent-ued-guide/website/index.html`
- Create: `/Users/yangshuo/Code/agent-ued-guide/website/src/main.tsx`
- Create: `/Users/yangshuo/Code/agent-ued-guide/website/src/index.css`

**Step 1:** Register `website` in root workspaces and add it to the root gate as an independently buildable static project.

**Step 2:** Reuse exact React/Vite/Tailwind/Base UI dependency versions already used by the immersive template. Add only the local `workspace:*` shared package dependency; do not introduce server, request, auth, or persistence packages.

**Step 3:** Establish semantic-token CSS and responsive global shell styles.

### Task 2: Define website document, target registry, validation, and persistence

**Files:**
- Create: `/Users/yangshuo/Code/agent-ued-guide/website/src/data/default-document.ts`
- Create: `/Users/yangshuo/Code/agent-ued-guide/website/src/lib/website-document.ts`
- Create: `/Users/yangshuo/Code/agent-ued-guide/website/src/lib/persistence.ts`

**Step 1:** Define a versioned website document that contains a constrained product identity, welcome copy, a JSON scene list, and target registry content.

**Step 2:** Provide default JSON scene data illustrating a high-risk approval flow and a target registry using neutral shared `ArtifactTarget` data.

**Step 3:** Resolve target IDs through `resolveTargets()` and report parsing/contract errors visibly. Persist valid local state under one versioned `localStorage` key and support JSON import/export without accessing the real template filesystem.

### Task 3: Build documentation and gallery views

**Files:**
- Create: `/Users/yangshuo/Code/agent-ued-guide/website/src/data/documentation.ts`
- Create: `/Users/yangshuo/Code/agent-ued-guide/website/src/components/docs-view.tsx`
- Create: `/Users/yangshuo/Code/agent-ued-guide/website/src/components/gallery-view.tsx`

**Step 1:** Add navigable design-system/documentation summaries with links back to the canonical repository documents.

**Step 2:** Add a layer-oriented component gallery with per-component detail pages exposing public versus template boundaries, supported composition, variants, common pitfalls, source/design-rule references, and a truthful preview.

**Step 3:** Make browse navigation keyboard-accessible and responsive without duplicating documentation as a new fact source.

### Task 4: Build the template demos, immersive preview, and local editor

**Files:**
- Create: `/Users/yangshuo/Code/agent-ued-guide/website/src/components/immersive-preview.tsx`
- Create: `/Users/yangshuo/Code/agent-ued-guide/website/src/components/editor-view.tsx`
- Create: `/Users/yangshuo/Code/agent-ued-guide/website/src/App.tsx`

**Step 1:** Provide explicit immersive Agent and assistant-style Copilot demo entries. Render resolved rich Agent scenes through shared `ConversationFlow` with a website-owned artifact drawer; render Copilot through shared `CopilotApp` with a fixed contract-review workspace. Preserve confirmation as a local demonstration action, never claim a real write.

**Step 2:** Provide controls for product identity, scene selection, JSON editing, local reset, import, and export. Keep product-specific custom blocks, new container types, and token editing outside the editor scope.

**Step 3:** Surface `resolveTargets()` and `parseScript()` issues before preview, and preserve the last valid preview on an invalid JSON draft.

### Task 5: Document Phase 7 and validate static deployment readiness

**Files:**
- Modify: `/Users/yangshuo/Code/agent-ued-guide/README.md`
- Modify: `/Users/yangshuo/Code/agent-ued-guide/docs/proposals/website-showcase.md`
- Modify: `/Users/yangshuo/Code/agent-ued-guide/docs/proposals/agent-layout-integration.md`
- Modify: `/Users/yangshuo/Code/agent-ued-guide/CHANGELOG.md`
- Modify: `/Users/yangshuo/Code/agent-ued-guide/PROJECT_CONTEXT.md`

**Step 1:** Record the static build command and Cloudflare Pages configuration (`website` root, `npm run build`, `dist` output) without changing lockfiles or deployment provider settings.

**Step 2:** Record Phase 7 completion, keep full template-shell extraction explicitly identified as separate technical debt, and update the file map.

**Step 3:** Run `npm run gate:website`, `npm run gate`, `git diff --check`, and `git status -sb` from `/Users/yangshuo/Code/agent-ued-guide`.
