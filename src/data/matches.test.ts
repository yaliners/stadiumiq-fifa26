import { describe, it, expect } from "vitest";
import { upcomingMatches } from "./matches";

describe("Upcoming Matches Data", () => {
  it("should have matches array", () => {
    expect(Array.isArray(upcomingMatches)).toBe(true);
    expect(upcomingMatches.length).toBeGreaterThan(0);
  });

  it("should contain correct fields for all matches", () => {
    upcomingMatches.forEach((match) => {
      expect(match).toHaveProperty("id");
      expect(match).toHaveProperty("teams");
      expect(match).toHaveProperty("date");
      expect(match).toHaveProperty("time");
      expect(match).toHaveProperty("venue");
    });
  });

  it("should contain the updated Spain vs Argentina match", () => {
    const finalMatch = upcomingMatches.find((m) => m.id === "u3");
    expect(finalMatch).toBeDefined();
    expect(finalMatch?.teams).toBe("Spain vs Argentina");
    expect(finalMatch?.date).toBe("July 20, 2026");
  });
});
