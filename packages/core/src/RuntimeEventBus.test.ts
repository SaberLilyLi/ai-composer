import { describe, expect, it } from "vitest";
import { RuntimeEventBus } from "./events";

describe("RuntimeEventBus", () => {
  it("supports on, off, once, and emit", () => {
    const bus = new RuntimeEventBus();
    const events: string[] = [];
    const handler = () => events.push("on");

    bus.on("workflow:start", handler);
    bus.once("workflow:start", () => events.push("once"));
    bus.emit("workflow:start", { state: { status: "running" } });
    bus.emit("workflow:start", { state: { status: "running" } });
    bus.off("workflow:start", handler);
    bus.emit("workflow:start", { state: { status: "running" } });

    expect(events).toEqual(["on", "once", "on"]);
  });
});
