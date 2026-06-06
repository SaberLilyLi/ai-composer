import type { Message, WorkflowStepType } from "@company/ai-composer-shared";
import type { ProviderConfig, ResolvedProviderConfig } from "../config";
import { resolveProviderConfig } from "../config";
import { ProviderError } from "../errors";
import { providerRequest } from "../http";
import { GPT_PROVIDER_METADATA } from "../metadata";
import type { ChatProvider, PromptOptimizerProvider, ProviderCapability, ProviderMetadata, WorkflowAnalyzerProvider } from "../types";

interface ChatCompletionResponse {
  model?: string;
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
}

const workflowStepTypes = new Set<WorkflowStepType>([
  "chat",
  "image_generate",
  "image_edit",
  "image_replace",
  "video_generate",
  "image_to_video",
  "avatar_generate",
  "avatar_talking_video",
  "agent_task"
]);

function extractText(data: ChatCompletionResponse): string {
  const content = data.choices?.[0]?.message?.content;

  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => (item.type === "text" && typeof item.text === "string" ? item.text : ""))
      .join("\n")
      .trim();
  }

  return "";
}

function parseWorkflowJson(text: string): Array<{ type: WorkflowStepType; prompt: string }> {
  const cleaned = text
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  const parsed = JSON.parse(cleaned) as { steps?: Array<{ type?: string; prompt?: string }> };

  if (!Array.isArray(parsed.steps)) {
    throw new ProviderError("ModelError", "Workflow analysis response did not include a steps array.");
  }

  return parsed.steps.map((step) => {
    const type = workflowStepTypes.has(step.type as WorkflowStepType) ? (step.type as WorkflowStepType) : "chat";
    return {
      type,
      prompt: typeof step.prompt === "string" ? step.prompt : ""
    };
  });
}

export class GPTProvider implements ChatProvider, PromptOptimizerProvider, WorkflowAnalyzerProvider {
  private readonly config: ResolvedProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = resolveProviderConfig(config);
  }

  getCapability(): ProviderCapability {
    return {
      provider: this.config.model,
      supports: ["chat"],
      inputTypes: ["text", "image"],
      outputTypes: ["text"],
      streaming: false,
      batch: false,
      configurable: true,
      metadata: {
        provider: this.config.provider
      }
    };
  }

  getMetadata(): ProviderMetadata {
    return {
      ...GPT_PROVIDER_METADATA,
      id: this.config.model,
      name: this.config.model
    };
  }

  async chat(input: { messages: Message[]; signal?: AbortSignal }): Promise<{ text: string; model: string }> {
    const data = await providerRequest<ChatCompletionResponse>(this.config, {
      path: "/chat/completions",
      signal: input.signal,
      body: {
        model: this.config.model,
        messages: input.messages.map((message) => ({
          role: message.role,
          content: message.content
        }))
      }
    });
    const text = extractText(data);

    if (!text) {
      throw new ProviderError("ModelError", "GPTProvider returned an empty chat response.");
    }

    return {
      text,
      model: data.model ?? this.config.model
    };
  }

  async optimizePrompt(input: { prompt: string; signal?: AbortSignal }): Promise<{ prompt: string; model: string }> {
    const result = await this.chat({
      signal: input.signal,
      messages: [
        {
          id: "system-optimize-prompt",
          role: "system",
          content:
            "You optimize short image editing prompts into precise production prompts. Preserve the subject, style intent, and concrete user constraints. Return only the optimized prompt.",
          createdAt: Date.now()
        },
        {
          id: "user-optimize-prompt",
          role: "user",
          content: input.prompt,
          createdAt: Date.now()
        }
      ]
    });

    return {
      prompt: result.text,
      model: result.model
    };
  }

  async analyzeWorkflow(input: {
    prompt: string;
    signal?: AbortSignal;
  }): Promise<{ steps: Array<{ type: WorkflowStepType; prompt: string }>; model: string }> {
    const result = await this.chat({
      signal: input.signal,
      messages: [
        {
          id: "system-analyze-workflow",
          role: "system",
          content:
            'Analyze the user request into a JSON object with a "steps" array. Each step must have "type" and "prompt". Use only these types: chat, image_generate, image_edit, image_replace. Return JSON only.',
          createdAt: Date.now()
        },
        {
          id: "user-analyze-workflow",
          role: "user",
          content: input.prompt,
          createdAt: Date.now()
        }
      ]
    });

    return {
      steps: parseWorkflowJson(result.text),
      model: result.model
    };
  }
}
