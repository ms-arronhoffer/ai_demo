import type { WidgetKey } from "@/lib/demos";
import AgentTrace from "@/components/widgets/AgentTrace";
import LiveAgentPlayground from "@/components/widgets/LiveAgentPlayground";
import RagExplorer from "@/components/widgets/RagExplorer";
import PromptLab from "@/components/widgets/PromptLab";

/**
 * Maps a stage's declarative `widget` key to its interactive client component.
 */
export default function WidgetRenderer({ widget }: { widget: WidgetKey }) {
  switch (widget) {
    case "agent-trace":
      return <AgentTrace />;
    case "live-agent-playground":
      return <LiveAgentPlayground />;
    case "rag-explorer":
      return <RagExplorer />;
    case "prompt-lab":
      return <PromptLab />;
    default:
      return null;
  }
}
