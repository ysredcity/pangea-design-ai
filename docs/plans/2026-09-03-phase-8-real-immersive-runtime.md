# Phase 8 Real Immersive Runtime Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the real immersive Agent template a single package-owned runtime that the website and `immersive-starter` consume without maintaining a second shell implementation.

**Architecture:** Move the complete rich `agent-layout` closure, its Base UI dependency closure, rich contracts, and canonical product theme into `@agent-ux/agent-ui/immersive`. The package exposes only explicitly named immersive APIs; `immersive-starter` receives a materialized copy through `sync-agent-ui.mjs`, while website adapts its neutral JSON targets into immersive panel/image targets and mounts the same `ImmersiveAgentApp`.

**Tech Stack:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Base UI/shadcn v4, `@agent-ux/agent-ui`, script-engine.

---

### Task 1: Establish package-owned rich immersive contracts and theme

**Files:**
- Replace: `packages/agent-ui/src/immersive/agent-app.tsx`
- Create: `packages/agent-ui/src/immersive/contracts.ts`
- Create: `packages/agent-ui/src/immersive/theme.css`
- Create: `packages/agent-ui/src/immersive/typeset.css`
- Modify: `packages/agent-ui/src/immersive/index.ts`

**Steps:**
1. Define explicit `ImmersiveAgentApp`, `ImmersiveAppConfig`, `ImmersiveConversationMeta`, `ImmersiveArtifactTarget`, and rich renderer contracts. Do not re-export shared `ConversationFlow` or shared `Composer` under ambiguous names.
2. Move the canonical product semantic token mapping and Markdown typeset rules from the immersive template into the package.
3. Verify `npm run check --workspace=@agent-ux/agent-ui` passes.

### Task 2: Move the complete rich application closure into the package

**Files:**
- Create: `packages/agent-ui/src/immersive/agent-layout/**`
- Create: `packages/agent-ui/src/immersive/ui/**`
- Create: `packages/agent-ui/src/immersive/hooks/use-media-query.ts`
- Create: `packages/agent-ui/src/immersive/lib/utils.ts`

**Steps:**
1. Copy the 26 rich `agent-layout` files as package source, preserving relative intra-layout imports.
2. Copy the entire 21-file Base UI dependency directory plus `use-media-query` and `cn()` utility so the runtime remains self-contained.
3. Update package-local imports to relative immersive paths and shared cards/script-engine imports to package source paths.
4. Refactor `AgentShell` to receive scenes, initial conversation metadata, and a draft-scene factory through public props instead of importing template data.
5. Run TypeScript check and repair all package path/type errors.

### Task 3: Extend one-way materialization for the immersive template

**Files:**
- Modify: `scripts/sync-agent-ui.mjs`
- Modify: `skills/agent-ux-react/templates/immersive-starter/src/App.tsx`
- Modify: `skills/agent-ux-react/templates/immersive-starter/src/index.css`
- Modify: `skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/{app-config,conversation-data,panel-data,scenes}.ts(x)`

**Steps:**
1. Add an immersive-only materialization plan for `agent-layout`, `ui`, `hooks`, `lib`, and canonical CSS; preserve current copilot materialization unchanged.
2. Implement deterministic import rewriting from package-relative source paths to the template alias paths.
3. Convert template app/config/data modules into consumers of `ImmersiveAgentApp` and public contracts; retain only product-specific seed data.
4. Run `node scripts/sync-agent-ui.mjs`, then `node scripts/sync-agent-ui.mjs --check` and the immersive gate.

### Task 4: Mount the same runtime in website through an explicit adapter

**Files:**
- Replace: `website/src/components/immersive-preview.tsx`
- Modify: `website/src/lib/website-document.ts`
- Modify: `website/src/data/default-document.ts`
- Modify: `website/src/index.css`

**Steps:**
1. Add a website-local neutral-target → immersive-target adapter for panel and image routes, including all rich scene target locations.
2. Build a minimal `ImmersiveAgentApp` config and seeded conversation metadata from the website document; no template-local source import is permitted.
3. Remove the lossy shared `ConversationFlow` projection and local decision/artifact state from website preview.
4. Verify JSON editor preview, approvals, artifact panels, and responsive shell behavior in the running website.

### Task 5: Update governance and run all verification

**Files:**
- Modify: `README.md`
- Modify: `CHANGELOG.md`
- Modify: `PROJECT_CONTEXT.md`
- Modify: `docs/proposals/{website-showcase,agent-layout-integration}.md`

**Steps:**
1. Record package ownership, materialization boundaries, website adapter scope, and the removal of the Phase 8 technical debt.
2. Run `npm run check --workspace=@agent-ux/agent-ui`, `node scripts/sync-agent-ui.mjs --check`, `npm run gate:immersive`, `npm run gate:website`, `npm run gate`, `git diff --check`, and a local preview smoke test.
3. Do not create a git commit or push; report modified files and remaining warnings.
