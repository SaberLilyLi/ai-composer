import { describe, expect, it } from "vitest";
import { PromptParser } from "./PromptParser";

describe("PromptParser", () => {
  it("splits multi-step prompts into workflow steps", () => {
    const parser = new PromptParser();

    const result = parser.parse("把车改成蓝色\n然后背景改成雨夜高架\n最后调整为9:16");

    expect(result).toHaveLength(3);
    expect(result[0]?.type).toBe("image_edit");
    expect(result[2]?.prompt).toContain("9:16");
  });
});
