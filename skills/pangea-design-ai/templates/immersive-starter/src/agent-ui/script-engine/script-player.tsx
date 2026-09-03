import type { ReactNode } from 'react'

import type { ConversationScene, ScriptPlayerRender } from './types'

/**
 * Renderer-neutral player bridge.
 *
 * Rich immersive products pass `ConversationFlow`; Copilot products pass their
 * own left-canvas-aware renderer. The engine therefore never recreates a
 * second message UI or acquires panel/canvas responsibilities.
 */
export interface ScriptPlayerProps<TTarget> {
  scene: ConversationScene<TTarget> | null
  renderScene: ScriptPlayerRender<TTarget>
  fallback?: ReactNode
}

export function ScriptPlayer<TTarget>({ scene, renderScene, fallback = null }: ScriptPlayerProps<TTarget>) {
  return scene ? renderScene(scene) : fallback
}
