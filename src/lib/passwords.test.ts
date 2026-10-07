import { describe, expect, it } from "vitest";
import { generateStrings } from "./generateStrings";
import { generatePassphrases, passphraseEntropy, DEFAULT_PASSPHRASE } from "./passphrase";
import { entropyBits, rate } from "./strength";
import { generateForConfig, presetFor } from "./modes";
import type { ModeConfig } from "./modes";

const all = { letters: true, numbers: true, special: true, letterCase: "both" as const };

describe("guaranteeEach", () => {
  it("includes lower, upper, digit and symbol in every string", () => {
    const out = generateStrings({
      count: 2000,
      length: 8,
      charsetOptions: all,
      readable: false,
      guaranteeEach: true,
    });
    for (const s of out) {
      expect(s).toMatch(/[a-z]/);
      expect(s).toMatch(/[A-Z]/);
      expect(s).toMatch(/\d/);
      expect(s).toMatch(/[^a-zA-Z0-9]/);
      expect(s).toHaveLength(8);
    }
  });

  it("still returns the requested length when it is shorter than the number of types", () => {
    const out = generateStrings({
      count: 5,
      length: 2,
      charsetOptions: all,
      readable: false,
      guaranteeEach: true,
    });
    out.forEach((s) => expect(s).toHaveLength(2));
  });

  it("keeps guarantees with readable mode", () => {
    const out = generateStrings({
      count: 500,
      length: 12,
      charsetOptions: all,
      readable: true,
      guaranteeEach: true,
    });
    out.forEach((s) => expect(s).not.toMatch(/[1lIi0Oo]/));
  });
});

describe("customSymbols", () => {
  it("only uses the allowed symbols", () => {
    const out = generateStrings({
      count: 500,
      length: 20,
      charsetOptions: { ...all, letters: false, numbers: false, customSymbols: "#@ #" },
      readable: false,
    });
    out.forEach((s) => expect(s).toMatch(/^[#@]+$/));
  });
});

describe("passphrase", () => {
  it("builds the requested number of words plus a number", () => {
    const [p] = generatePassphrases(1, { ...DEFAULT_PASSPHRASE, words: 5, separator: "." });
    const parts = p.split(".");
    expect(parts).toHaveLength(6);
    expect(parts[0][0]).toMatch(/[A-Z]/);
    expect(parts[5]).toMatch(/^\d{1,2}$/);
  });

  it("reports entropy from the 2048-word list", () => {
    const bits = passphraseEntropy({ ...DEFAULT_PASSPHRASE, words: 6, appendNumber: false });
    expect(bits).toBeCloseTo(66, 5);
  });
});

describe("strength", () => {
  it("computes entropy and rates it", () => {
    expect(entropyBits(10, 10)).toBeCloseTo(33.2, 1);
    expect(rate(30).label).toBe("Weak");
    expect(rate(105).label).toBe("Very strong");
  });
});

describe("presets", () => {
  const base: ModeConfig = {
    mode: "pin",
    count: 3,
    length: 6,
    charsetOptions: all,
    readable: false,
    guaranteeEach: false,
    passphrase: DEFAULT_PASSPHRASE,
  };

  it("PIN preset produces digits only", () => {
    const cfg = { ...base, ...presetFor("pin") } as ModeConfig;
    generateForConfig(cfg).forEach((s) => expect(s).toMatch(/^\d{6}$/));
  });

  it("standard preset has no symbols", () => {
    const cfg = { ...base, mode: "standard", ...presetFor("standard") } as ModeConfig;
    generateForConfig(cfg).forEach((s) => expect(s).toMatch(/^[a-zA-Z0-9]{14}$/));
  });
});
