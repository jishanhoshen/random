export const CHARSETS = {
  letters: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  special: "!@#$%^&*()-_=+[]{};:,.<>?",
} as const;

export const AMBIGUOUS_CHARS = new Set(["1", "l", "I", "i", "0", "O", "o"]);

export function filterAmbiguousChars(charset: string): string {
  return charset
    .split("")
    .filter((char) => !AMBIGUOUS_CHARS.has(char))
    .join("");
}
