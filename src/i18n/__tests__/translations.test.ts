import { describe, it, expect } from "vitest";

// Import all locale files
import fr from "@/i18n/locales/fr.json";
import en from "@/i18n/locales/en.json";
import zh from "@/i18n/locales/zh.json";
import ko from "@/i18n/locales/ko.json";
import ja from "@/i18n/locales/ja.json";
import ru from "@/i18n/locales/ru.json";
import es from "@/i18n/locales/es.json";
import ar from "@/i18n/locales/ar.json";
import pt from "@/i18n/locales/pt.json";
import de from "@/i18n/locales/de.json";

const locales = { fr, en, zh, ko, ja, ru, es, ar, pt, de };
const frKeys = Object.keys(fr);

describe("i18n translations", () => {
  it("should have French as reference with 109 keys", () => {
    expect(frKeys.length).toBe(109);
  });

  Object.entries(locales).forEach(([lang, translations]) => {
    describe(`${lang} locale`, () => {
      it("should have the same number of keys as French", () => {
        expect(Object.keys(translations).length).toBe(frKeys.length);
      });

      it("should have all French keys", () => {
        const missingKeys = frKeys.filter((key) => !(key in translations));
        expect(missingKeys).toEqual([]);
      });

      it("should not have empty values", () => {
        const emptyKeys = Object.entries(translations)
          .filter(([, value]) => !value || value.trim() === "")
          .map(([key]) => key);
        expect(emptyKeys).toEqual([]);
      });
    });
  });
});
