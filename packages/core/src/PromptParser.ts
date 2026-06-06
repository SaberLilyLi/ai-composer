import type { WorkflowStepType } from "@company/ai-composer-shared";

const stepTypeByHint: Array<{ pattern: RegExp; type: WorkflowStepType }> = [
  { pattern: /\b(video|animate|motion)\b|视频|动起来/i, type: "video_generate" },
  { pattern: /\bavatar\b|数字人/i, type: "avatar_generate" },
  { pattern: /\b(agent|research|plan)\b|智能体|规划/i, type: "agent_task" },
  { pattern: /\b(edit|replace|change|adjust|background|crop|ratio)\b|改成|背景|调整|替换|比例/i, type: "image_edit" }
];

export class PromptParser {
  parse(prompt: string): Array<{ type: WorkflowStepType; prompt: string }> {
    return prompt
      .split(/\r?\n|然后|接着|最后/)
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => ({
        type: this.detectStepType(part),
        prompt: part
      }));
  }

  private detectStepType(prompt: string): WorkflowStepType {
    const matched = stepTypeByHint.find((item) => item.pattern.test(prompt));
    return matched?.type ?? "chat";
  }
}
