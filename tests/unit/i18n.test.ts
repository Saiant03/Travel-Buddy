import { describe, expect, it } from "vitest";
import { messages, t } from "../../src/app/i18n";

describe("foundation translations", () => {
  it("provides every Romanian key in each supported language", () => {
    for (const locale of ["en", "fr"] as const) {
      expect(Object.keys(messages[locale]).sort()).toEqual(
        Object.keys(messages.ro).sort(),
      );
      for (const value of Object.values(messages[locale]))
        expect(value.trim()).not.toBe("");
    }
  });
  it("uses Romanian for an unsupported locale and interpolates literal values", () => {
    expect(t("unknown", "greeting", { name: "<Buddy>$&" })).toBe(
      "Bun venit, <Buddy>$&!",
    );
    expect(t("en", "greeting", { name: "Alex" })).toBe("Welcome, Alex!");
    expect(t("fr", "greeting", { name: "Alex" })).toBe("Bienvenue, Alex !");
  });
  it("leaves missing placeholders visible", () => {
    expect(t("ro", "greeting")).toBe("Bun venit, {name}!");
  });
});
