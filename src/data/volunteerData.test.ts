import { describe, it, expect } from "vitest";
import { volunteerDetailsMap } from "./volunteerData";

describe("Volunteer Data Map", () => {
  it("should have all expected stadium records", () => {
    const requiredStadiums = ["st_sofi", "st_metlife", "st_mercedes", "st_azteca", "st_bcplace"];
    requiredStadiums.forEach((key) => {
      expect(volunteerDetailsMap).toHaveProperty(key);
      const detail = volunteerDetailsMap[key];
      expect(detail).toBeDefined();
      expect(detail.venueName).toBeTypeOf("string");
      expect(detail.shiftHours).toBeTypeOf("string");
      expect(detail.barcodeId).toMatch(/^VOL-2026-\d{4}$/);
    });
  });

  it("should contain correct SOS triggers for each stadium", () => {
    Object.keys(volunteerDetailsMap).forEach((key) => {
      const details = volunteerDetailsMap[key];
      expect(Array.isArray(details.sosTriggers)).toBe(true);
      expect(details.sosTriggers.length).toBeGreaterThan(0);
      
      details.sosTriggers.forEach((trigger) => {
        expect(trigger).toHaveProperty("label");
        expect(trigger).toHaveProperty("category");
        expect(trigger).toHaveProperty("desc");
        expect(["seat", "spill", "gate", "other"]).toContain(trigger.category);
      });
    });
  });

  it("should have realistic distance values", () => {
    Object.keys(volunteerDetailsMap).forEach((key) => {
      const details = volunteerDetailsMap[key];
      expect(details.distance).toBeGreaterThan(0);
      expect(details.distance).toBeLessThan(5);
    });
  });
});
