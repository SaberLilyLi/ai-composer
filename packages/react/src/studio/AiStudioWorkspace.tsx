import type { AgentConversationConfig } from "../controllers/useAgentConversationController";
import { AgentConversationWorkspace, type AgentConversationWorkspaceProps } from "../components/AgentConversationWorkspace";
import { useAiStudio } from "./AiStudioProvider";

export interface AiStudioWorkspaceProps {
  title?: string;
  subtitle?: string;
  theme?: AgentConversationWorkspaceProps["theme"];
}

export function AiStudioWorkspace({ title, subtitle, theme }: AiStudioWorkspaceProps) {
  const studio = useAiStudio();
  const { schema } = studio;
  const initialMode = schema.workspace === "image" ? "image" : "chat";
  const config: AgentConversationConfig = {
    apiKey: schema.providerConfig.apiKey,
    baseUrl: schema.providerConfig.baseUrl,
    chatModel: schema.providerConfig.chatModel,
    imageModel: schema.providerConfig.imageModel,
    timeout: schema.providerConfig.timeout,
    maxRetries: schema.providerConfig.maxRetries,
    ui: {
      modeSwitch: {
        enabled: schema.workspace === "agent",
        modes: schema.workspace === "agent" ? ["chat", "image"] : [initialMode]
      },
      image: {
        multiImage: false,
        generationOptions: {
          enabled: schema.features.includes("workflow")
        }
      }
    }
  };

  return (
    <AgentConversationWorkspace
      theme={theme ?? schema.theme.mode}
      title={title}
      subtitle={subtitle}
      initialMode={initialMode}
      config={config}
    />
  );
}
