import { describe, it, expect } from "vitest";
import { bannerTranslations } from "./DashboardWrapper";

describe("Banner Translations", () => {
  it("should have translations for all required languages", () => {
    const requiredLangs = ["en", "es", "fr", "de", "pt", "it"] as const;
    requiredLangs.forEach((lang) => {
      expect(bannerTranslations).toHaveProperty(lang);
      const trans = bannerTranslations[lang];
      expect(trans).toHaveProperty("title");
      expect(trans).toHaveProperty("teams");
      expect(trans).toHaveProperty("date");
      expect(trans).toHaveProperty("stadium");
      expect(trans).toHaveProperty("live");
      expect(trans).toHaveProperty("upcoming");
      expect(trans).toHaveProperty("concluded");
    });
  });

  it("should contain correct team pairs in all supported languages", () => {
    expect(bannerTranslations.en.teams).toContain("France vs");
    expect(bannerTranslations.en.teams).toContain("England");
    expect(bannerTranslations.es.teams).toContain("Francia vs");
    expect(bannerTranslations.es.teams).toContain("Inglaterra");
    expect(bannerTranslations.fr.teams).toContain("France vs");
    expect(bannerTranslations.fr.teams).toContain("Angleterre");
  });
});
