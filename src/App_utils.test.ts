import { describe, it, expect } from "vitest";
import { getTeamFlag, formatMessageText } from "./App";

describe("App Utility Functions", () => {
  describe("getTeamFlag", () => {
    it("should return the correct flag emoji for supported countries", () => {
      expect(getTeamFlag("USA")).toBe("🇺🇸");
      expect(getTeamFlag("United States")).toBe("🇺🇸");
      expect(getTeamFlag("Spain")).toBe("🇪🇸");
      expect(getTeamFlag("France")).toBe("🇫🇷");
      expect(getTeamFlag("Argentina")).toBe("🇦🇷");
      expect(getTeamFlag("Germany")).toBe("🇩🇪");
      expect(getTeamFlag("England")).toBe("🏴󠁧󠁢󠁥󠁮󠁧󠁿");
    });

    it("should return a default globe emoji for unknown countries", () => {
      expect(getTeamFlag("Atlantis")).toBe("🏳️");
      expect(getTeamFlag("")).toBe("🏳️");
    });
  });

  describe("formatMessageText", () => {
    it("should correctly split text into paragraphs and lines", () => {
      const text = "Hello\nWorld";
      const formatted = formatMessageText(text);
      expect(formatted).toHaveLength(2);
    });

    it("should handle headers and markdown-like titles", () => {
      const text = "### Section Header\nSimple text lines.";
      const formatted = formatMessageText(text);
      expect(formatted).toBeDefined();
    });
  });
});
