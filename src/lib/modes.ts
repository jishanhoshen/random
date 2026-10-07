import type { CharsetOptions } from "./generateStrings";
import { generateStrings, poolSize } from "./generateStrings";
import { generatePassphrases, passphraseEntropy } from "./passphrase";
import type { PassphraseOptions } from "./passphrase";
import { entropyBits, rate } from "./strength";
import type { Strength } from "./strength";

export type Mode = "strong" | "standard" | "pin" | "passphrase" | "custom";

export interface ModeConfig {
  mode: Mode;
  count: number;
  length: number;
  charsetOptions: CharsetOptions;
  readable: boolean;
  guaranteeEach: boolean;
  passphrase: PassphraseOptions;
}

export interface ModeInfo {
  label: string;
  hint: string;
  minLength: number;
  maxLength: number;
  maxCount: number;
}

export const MODES: Record<Mode, ModeInfo> = {
  strong: {
    label: "Strong",
    hint: "Letters, numbers and symbols. Best for accounts that matter.",
    minLength: 12,
    maxLength: 64,
    maxCount: 20,
  },
  standard: {
    label: "Standard",
    hint: "Letters and numbers only. Works on sites that reject symbols.",
    minLength: 8,
    maxLength: 32,
    maxCount: 20,
  },
  pin: {
    label: "PIN",
    hint: "Digits only. Use it where wrong guesses lock you out.",
    minLength: 4,
    maxLength: 12,
    maxCount: 20,
  },
  passphrase: {
    label: "Passphrase",
    hint: "Random words that are easy to remember and type.",
    minLength: 1,
    maxLength: 100,
    maxCount: 20,
  },
  custom: {
    label: "Custom",
    hint: "Full control over length, count and characters.",
    minLength: 1,
    maxLength: 100,
    maxCount: 10000,
  },
};

export const MODE_ORDER: Mode[] = ["strong", "standard", "pin", "passphrase", "custom"];

/** Settings a mode applies when you pick it. Custom keeps whatever you had. */
export function presetFor(mode: Mode): Partial<ModeConfig> {
  switch (mode) {
    case "strong":
      return {
        count: 1,
        length: 20,
        charsetOptions: { letters: true, numbers: true, special: true, letterCase: "both" },
        guaranteeEach: true,
      };
    case "standard":
      return {
        count: 1,
        length: 14,
        charsetOptions: { letters: true, numbers: true, special: false, letterCase: "both" },
        guaranteeEach: true,
      };
    case "pin":
      return {
        count: 1,
        length: 6,
        readable: false,
        charsetOptions: { letters: false, numbers: true, special: false, letterCase: "both" },
        guaranteeEach: false,
      };
    default:
      return {};
  }
}

export function generateForConfig(c: ModeConfig): string[] {
  if (c.mode === "passphrase") return generatePassphrases(c.count, c.passphrase);
  return generateStrings({
    count: c.count,
    length: c.length,
    charsetOptions: c.charsetOptions,
    readable: c.readable,
    guaranteeEach: c.guaranteeEach,
  });
}

export function strengthFor(c: ModeConfig): Strength {
  if (c.mode === "passphrase") return rate(passphraseEntropy(c.passphrase));
  return rate(entropyBits(c.length, poolSize(c.charsetOptions, c.readable)));
}
