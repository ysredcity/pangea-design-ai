import type { ConversationScene as ScriptConversationScene } from "@/agent-ui/script-engine"

import { conversationScenes } from "./conversation-data"
import type { ArtifactTarget } from "./panel-types"

/**
 * TS 是沉浸式模板的默认场景作者入口：完整富场景由 tsc 校验。
 * 侧栏仍使用 scenesById，以保持既有导航与壳层行为不变。
 */
export const scenes = Object.entries(conversationScenes).map(([id, scene]) => ({ id, ...scene })) satisfies ScriptConversationScene<ArtifactTarget>[]

export const scenesById = Object.fromEntries(scenes.map((scene) => [scene.id, scene])) as Record<string, ScriptConversationScene<ArtifactTarget>>
