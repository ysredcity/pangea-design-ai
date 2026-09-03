import { AgentShell } from '@/components/agent-layout/agent-shell'
import type { ImmersiveAgentAppProps } from './contracts'

/** The full package-owned immersive agent workspace runtime. */
export function ImmersiveAgentApp(props: ImmersiveAgentAppProps) {
  return <AgentShell {...props} />
}
