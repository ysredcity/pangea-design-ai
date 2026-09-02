import { ConversationFlow, type AgentIdentity, type ArtifactRouter, type ConversationScene, type ProductBlockRenderer } from '../conversation'

/**
 * Base UI immersive entry point for products that do not need the template's
 * richer panel registry. Rich immersive products may provide their own adapter
 * and preserve the same neutral artifact route contract.
 */
export function AgentApp({ identity, scene, routeArtifact, renderProductBlock }: { identity: AgentIdentity; scene: ConversationScene; routeArtifact: ArtifactRouter; renderProductBlock?: ProductBlockRenderer }) {
  return <main className="min-h-dvh bg-background px-4 py-6"><ConversationFlow scene={scene} identity={identity} openArtifact={routeArtifact} renderProductBlock={renderProductBlock} /></main>
}
