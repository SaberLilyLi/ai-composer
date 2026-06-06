import { useState } from "react";
import { AgentConversationWorkspace } from "@company/ai-composer";
import "@company/ai-composer/styles.css";
import { ChatModelDemo, ImageModelDemo } from "./ComponentDemos";
import { GPTPlayground } from "./GPTPlayground";
import { RuntimePlayground } from "./RuntimePlayground";

function getWorkspaceConfig() {
  const env = ((import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {});

  return {
    apiKey: env.VITE_GPT_API_KEY ?? env.VITE_AGENT_API_KEY ?? "",
    baseUrl: env.VITE_GPT_BASE_URL ?? env.VITE_AGENT_BASE_URL ?? "https://api.openai.com/v1",
    chatEndpoint: env.VITE_AGENT_CHAT_ENDPOINT ?? "",
    imageEndpoint: env.VITE_AGENT_IMAGE_ENDPOINT ?? "",
    chatModel: env.VITE_GPT_CHAT_MODEL ?? env.VITE_AGENT_CHAT_MODEL ?? "gpt-5.5",
    imageModel: env.VITE_GPT_IMAGE_MODEL ?? env.VITE_AGENT_IMAGE_MODEL ?? "gpt-image-2"
  };
}

export function App() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [surface, setSurface] = useState<"chat-demo" | "image-demo" | "workspace" | "gpt" | "runtime">("chat-demo");
  const workspaceConfig = getWorkspaceConfig();

  return (
    <div className="min-h-screen bg-[#0d0e12]">
      <div className="fixed left-4 top-4 z-50 flex gap-2">
        {(["chat-demo", "image-demo", "workspace", "gpt", "runtime"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setSurface(item)}
            style={{
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.12)",
              background: surface === item ? "#ffffff" : "rgba(255,255,255,0.08)",
              color: surface === item ? "#11131a" : "#ffffff",
              padding: "8px 12px"
            }}
          >
            {item}
          </button>
        ))}
        {(["dark", "light"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTheme(item)}
            style={{
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.12)",
              background: theme === item ? "#ffffff" : "rgba(255,255,255,0.08)",
              color: theme === item ? "#11131a" : "#ffffff",
              padding: "8px 12px"
            }}
          >
            {item}
          </button>
        ))}
      </div>
      {surface === "chat-demo" ? <ChatModelDemo theme={theme} config={workspaceConfig} /> : null}
      {surface === "image-demo" ? <ImageModelDemo theme={theme} config={workspaceConfig} /> : null}
      {surface === "workspace" ? <AgentConversationWorkspace theme={theme} config={workspaceConfig} /> : null}
      {surface === "gpt" ? <GPTPlayground /> : null}
      {surface === "runtime" ? <RuntimePlayground /> : null}
    </div>
  );
}
