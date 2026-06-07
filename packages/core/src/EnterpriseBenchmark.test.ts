import { describe, expect, it } from "vitest";
import { runEnterpriseBenchmark } from "./EnterpriseBenchmark";

describe("Enterprise benchmark", () => {
  it("measures enterprise runtime operations", async () => {
    const report = await runEnterpriseBenchmark();

    expect(report.metrics).toHaveLength(4);
    expect(report.metrics.map((metric) => metric.name)).toEqual([
      "Workspace Creation",
      "Provider Registration",
      "Workflow Execution",
      "Plugin Activation"
    ]);

    console.log("BENCHMARK_REPORT", JSON.stringify(report));
  });
});
