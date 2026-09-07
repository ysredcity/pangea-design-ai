# Copilot Conversation Surface Implementation Plan

> **For Kiro:** Execute this plan end-to-end without committing or pushing. Treat `packages/agent-ui` as the runtime source of truth and materialize templates only through `npm run sync:agent-ui`.

**Goal:** Make the Copilot assistant match Figma node `12838:5913` with `sidebar | floating | collapsed` states while sharing the neutral conversation surface, content styling, Composer styling, and scroll behavior with the immersive conversation area.

**Architecture:** Add a neutral `ConversationSurface` layout primitive under `packages/agent-ui/src/conversation/`. Copilot owns assistant-state presentation and routes artifacts to its canvas. Immersive owns its navigation and panel lifecycle, but consumes the same surface primitive for content scrolling, footer placement, disclaimer, and scroll-to-bottom behavior. Keep legacy `assistantMode` values as a deprecated compatibility input mapped to the new state model.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, lucide-react, Vite 8.

---

## Task 1: Introduce the assistant view contract

**Files:**
- Modify: `packages/agent-ui/src/copilot/copilot-config.ts`
- Modify: `packages/agent-ui/src/copilot/copilot-app.tsx`

1. Define `CopilotAssistantView = 'sidebar' | 'floating' | 'collapsed'`.
2. Retain the old four-value `AssistantMode` as deprecated compatibility input.
3. Add `assistantView`, `defaultAssistantView`, and `onAssistantViewChange` to `CopilotConfig`.
4. Normalize legacy values (`panel`, `side-drawer`, `overlay-drawer` → `sidebar`; `floating` → `floating`).
5. Implement controlled/uncontrolled state without losing assistant conversation state when presentation changes.

## Task 2: Add the shared ConversationSurface

**Files:**
- Create: `packages/agent-ui/src/conversation/conversation-surface.tsx`
- Modify: `packages/agent-ui/src/conversation/index.ts`
- Modify: `packages/agent-ui/src/conversation/composer.tsx`
- Modify: `packages/agent-ui/src/conversation/conversation-flow.tsx`
- Modify: `packages/agent-ui/src/immersive/agent-layout/conversation-page.tsx`

1. Add shared content scrolling, max-width layout, footer, AI disclaimer, and scroll-to-bottom affordance.
2. Preserve draft state above conditional presentation shells.
3. Align Composer with the 24px Figma radius and immersive visual language.
4. Align shared conversation spacing and typography with the immersive conversation body.
5. Replace the immersive page’s duplicated scroll/footer shell with `ConversationSurface`; keep its rich flow and rich Composer as children.

## Task 3: Implement Figma presentation states

**Files:**
- Modify: `packages/agent-ui/src/copilot/copilot-app.tsx`

1. Sidebar: 400px fixed width, full height, left border, 52px header.
2. Floating: 400×600px, right/bottom 16px, 16px radius, semantic border, xl shadow.
3. Collapsed: use a host-provided top-navigation trigger when available; otherwise show a 44×44px Sparkles button at right/bottom 32px.
4. Add header controls for switching sidebar/floating/collapsed states with accessible labels and tooltips via native titles where shared tooltip infrastructure is unavailable.
5. Degrade sidebar to floating on narrow desktop and use a full-screen assistant on mobile instead of hiding it.

## Task 4: Align the starter and documentation

**Files:**
- Modify: `skills/pangea-design-ai/templates/copilot-starter/src/pages/ContractReview.tsx`
- Modify: `skills/pangea-design-ai/templates/copilot-starter/src/styles/globals.css`
- Delete if unreferenced: `skills/pangea-design-ai/templates/copilot-starter/src/components/layout/CopilotShell.tsx`
- Modify: `skills/pangea-design-ai/references/patterns/copilot-shell.md`
- Modify: `skills/pangea-design-ai/references/components/README.md`
- Modify: `skills/pangea-design-ai/references/components/conversation/conversation-flow.md`
- Modify: `skills/pangea-design-ai/references/components/delegation/composer.md`
- Modify: `skills/pangea-design-ai/references/overview/extension-map.md`
- Modify: `skills/pangea-design-ai/references/overview/quality-gates.md`
- Modify: `skills/pangea-design-ai/references/overview/project-structure.md`
- Modify: `PROJECT_CONTEXT.md`

1. Set the Copilot starter default to `sidebar` and preserve canvas-only artifact routing.
2. Align the Copilot theme imports, Geist font, type styles, and radius scale with the canonical immersive theme.
3. Document the three-state contract, responsive fallback, state ownership, and Panel/Canvas separation.
4. Update the project ledger with the new runtime facts, file map, decisions, and completion log.

## Task 5: Materialize and validate

Run in `/Users/yangshuo/Code/agent-ued-guide`:

```bash
npm run sync:agent-ui
npm run check:agent-ui-types
npm run check:agent-ui-drift
npm run check:component-docs
npm run gate
git diff --check
```

Fix all new errors and warnings. The existing immersive initial chunk-size warning may remain documented; do not raise its threshold. Confirm that no generated template drift remains and do not run `git commit` or `git push`.
