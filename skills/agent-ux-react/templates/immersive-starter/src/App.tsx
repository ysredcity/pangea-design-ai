import { AgentShell } from "@/components/agent-layout/agent-shell"
import { appConfig } from "@/components/agent-layout/app-config"

// The immersive shell remains the Base UI adapter: it maps the shared artifact
// semantic to panel tabs or the image viewer without exposing panel types.
export default function App() {
  return <AgentShell config={appConfig} />
}
