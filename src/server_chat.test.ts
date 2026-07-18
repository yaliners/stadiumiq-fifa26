import { describe, it, expect } from "vitest";
import { cleanInput, withTimeout } from "../server/chat";

describe("cleanInput - Sanitization & Localisation", () => {
  it("should strip HTML from input", () => {
    const input = "Hello <script>alert('xss')</script> World!";
    const result = cleanInput(input, "en");
    expect(result.message).toBe("Hello alert('xss') World!");
    expect(result.locale).toBe("en");
  });

  it("should truncate message to 500 characters", () => {
    const longMsg = "A".repeat(600);
    const result = cleanInput(longMsg, "fr");
    expect(result.message.length).toBe(500);
    expect(result.message).toBe("A".repeat(500));
    expect(result.locale).toBe("fr");
  });

  it("should default unsupported languages to 'en'", () => {
    const result = cleanInput("test", "de-DE");
    expect(result.locale).toBe("en");
  });

  it("should recognize supported languages", () => {
    expect(cleanInput("test", "es").locale).toBe("es");
    expect(cleanInput("test", "fr").locale).toBe("fr");
    expect(cleanInput("test", "en").locale).toBe("en");
  });
});

describe("withTimeout - Promise Timeout Helper", () => {
  it("should resolve if promise resolves within timeout", async () => {
    const p = Promise.resolve("success");
    const result = await withTimeout(p, 1000);
    expect(result).toBe("success");
  });

  it("should reject if promise takes longer than timeout", async () => {
    const slowP = new Promise((resolve) => setTimeout(() => resolve("done"), 50));
    await expect(withTimeout(slowP, 10)).rejects.toThrow("TimeoutError");
  });
});
