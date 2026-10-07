import { CHARSETS, filterAmbiguousChars } from "./charsets";

export interface CharsetOptions {
  letters: boolean;
  numbers: boolean;
  special: boolean;
  letterCase: "uppercase" | "lowercase" | "both";
  /** Replaces the default symbol set when non-empty. */
  customSymbols?: string;
}

export interface GenerateOptions {
  count: number;
  length: number;
  charsetOptions: CharsetOptions;
  readable: boolean;
  /** Make sure every selected character type appears at least once. */
  guaranteeEach?: boolean;
}

// --- secure randomness -------------------------------------------------

const POOL_SIZE = 4096;
const pool = new Uint32Array(POOL_SIZE);
let poolIndex = POOL_SIZE;

function nextUint32(): number {
  if (poolIndex >= POOL_SIZE) {
    crypto.getRandomValues(pool);
    poolIndex = 0;
  }
  return pool[poolIndex++];
}

/** Uniform random integer in [0, max) using rejection sampling (no modulo bias). */
export function randomInt(max: number): number {
  const range = 0x100000000;
  const limit = range - (range % max);
  let value: number;
  do {
    value = nextUint32();
  } while (value >= limit);
  return value % max;
}

export function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

// --- character classes ---------------------------------------------------

function unique(chars: string): string {
  return Array.from(new Set(chars.split(""))).join("");
}

function symbolSet(options: CharsetOptions): string {
  const custom = options.customSymbols ? unique(options.customSymbols.replace(/\s/g, "")) : "";
  return custom || CHARSETS.special;
}

/** The selected character groups, each guaranteed non-empty or dropped. */
export function buildClasses(options: CharsetOptions, readable: boolean): string[] {
  const classes: string[] = [];

  if (options.letters) {
    if (options.letterCase !== "uppercase") classes.push(CHARSETS.lowercase);
    if (options.letterCase !== "lowercase") classes.push(CHARSETS.uppercase);
  }
  if (options.numbers) classes.push(CHARSETS.numbers);
  if (options.special) classes.push(symbolSet(options));

  return classes.map((c) => (readable ? filterAmbiguousChars(c) : c)).filter((c) => c.length > 0);
}

/** Number of distinct characters strings are drawn from. */
export function poolSize(options: CharsetOptions, readable: boolean): number {
  return unique(buildClasses(options, readable).join("")).length;
}

// --- generation ---------------------------------------------------------

function generateString(
  length: number,
  classes: string[],
  charset: string,
  guarantee: boolean
): string {
  const chars: string[] = new Array(length);
  const mustHave = guarantee && length >= classes.length ? classes : [];

  for (let i = 0; i < length; i++) {
    chars[i] =
      i < mustHave.length
        ? mustHave[i][randomInt(mustHave[i].length)]
        : charset[randomInt(charset.length)];
  }

  return (mustHave.length > 0 ? shuffle(chars) : chars).join("");
}

export function generateStrings(options: GenerateOptions): string[] {
  const classes = buildClasses(options.charsetOptions, options.readable);
  const charset = unique(classes.join(""));

  if (charset.length === 0) {
    throw new Error("At least one character type must be selected");
  }

  const results: string[] = [];
  for (let i = 0; i < options.count; i++) {
    results.push(generateString(options.length, classes, charset, options.guaranteeEach === true));
  }
  return results;
}
