export interface Strength {
  bits: number;
  label: "Weak" | "Fair" | "Good" | "Strong" | "Very strong";
  /** 0 to 1, for the meter bar */
  level: number;
}

/** Entropy of a string where each character is drawn uniformly from a pool. */
export function entropyBits(length: number, pool: number): number {
  return pool > 1 ? length * Math.log2(pool) : 0;
}

export function rate(bits: number): Strength {
  const label =
    bits < 40
      ? "Weak"
      : bits < 60
        ? "Fair"
        : bits < 80
          ? "Good"
          : bits < 100
            ? "Strong"
            : "Very strong";
  return { bits, label, level: Math.min(1, bits / 110) };
}
