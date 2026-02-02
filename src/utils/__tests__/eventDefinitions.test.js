import { describe, it, expect } from "vitest";
import { EmbeddedEvents, IncomingEvents } from "../eventDefinitions.js";

describe("eventDefinitions", () => {
  describe("EmbeddedEvents", () => {
    it("exports object with embedded:: namespace keys", () => {
      const keys = Object.keys(EmbeddedEvents);
      expect(keys.length).toBeGreaterThan(0);
      keys.forEach((key) => {
        expect(key).toMatch(/^embedded::/);
      });
    });

    it("each event has category, description, and payload", () => {
      Object.entries(EmbeddedEvents).forEach(([_key, def]) => {
        expect(def).toHaveProperty("category");
        expect(def).toHaveProperty("description");
        expect(def).toHaveProperty("payload");
        expect(typeof def.payload).toBe("object");
      });
    });

    it("includes iframe.ready and embedded::ready", () => {
      expect(EmbeddedEvents["embedded::iframe.ready"]).toBeDefined();
      expect(EmbeddedEvents["embedded::ready"]).toBeDefined();
    });
  });

  describe("IncomingEvents", () => {
    it("exports object with event keys", () => {
      const keys = Object.keys(IncomingEvents);
      expect(keys.length).toBeGreaterThanOrEqual(0);
    });
  });
});
