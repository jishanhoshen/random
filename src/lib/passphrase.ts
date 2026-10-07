import { wordlist } from "@scure/bip39/wordlists/english.js";
import { randomInt } from "./generateStrings";

export interface PassphraseOptions {
  words: number;
  separator: string;
  capitalize: boolean;
  appendNumber: boolean;
}

export const DEFAULT_PASSPHRASE: PassphraseOptions = {
  words: 6,
  separator: "-",
  capitalize: true,
  appendNumber: true,
};

const NUMBER_RANGE = 100; // 0 to 99

export function passphraseEntropy(o: PassphraseOptions): number {
  return o.words * Math.log2(wordlist.length) + (o.appendNumber ? Math.log2(NUMBER_RANGE) : 0);
}

export function generatePassphrases(count: number, o: PassphraseOptions): string[] {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const words: string[] = [];
    for (let w = 0; w < o.words; w++) {
      const word = wordlist[randomInt(wordlist.length)];
      words.push(o.capitalize ? word[0].toUpperCase() + word.slice(1) : word);
    }
    if (o.appendNumber) words.push(String(randomInt(NUMBER_RANGE)));
    out.push(words.join(o.separator));
  }
  return out;
}
