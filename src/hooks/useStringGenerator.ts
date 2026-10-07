import { useState, useCallback, useEffect, useMemo } from "react";
import type { CharsetOptions } from "../lib/generateStrings";
import { formatOutput } from "../lib/formatOutput";
import type { OutputFormat } from "../lib/formatOutput";
import { DEFAULT_PASSPHRASE } from "../lib/passphrase";
import type { PassphraseOptions } from "../lib/passphrase";
import { MODES, generateForConfig, presetFor, strengthFor } from "../lib/modes";
import type { Mode, ModeConfig } from "../lib/modes";

const SETTINGS_KEY = "generatorSettings.v2";

function loadSettings(): Record<string, unknown> {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

const clampNum = (v: unknown, min: number, max: number, fallback: number) =>
  typeof v === "number" && Number.isFinite(v) ? Math.max(min, Math.min(max, v)) : fallback;

const STRONG = presetFor("strong");

export function useStringGenerator() {
  const [saved] = useState(loadSettings);

  const [mode, setModeState] = useState<Mode>(() =>
    typeof saved.mode === "string" && saved.mode in MODES ? (saved.mode as Mode) : "strong"
  );
  const info = MODES[mode];

  const [count, setCountRaw] = useState(() => clampNum(saved.count, 1, 10000, 1));
  const [length, setLengthRaw] = useState(() =>
    clampNum(saved.length, 1, 100, STRONG.length as number)
  );
  const [charsetOptions, setCharsetOptions] = useState<CharsetOptions>(() => ({
    ...(STRONG.charsetOptions as CharsetOptions),
    ...((saved.charsetOptions as Partial<CharsetOptions>) ?? {}),
  }));
  const [readable, setReadable] = useState(() => saved.readable === true);
  const [guaranteeEach, setGuaranteeEach] = useState(() => saved.guaranteeEach !== false);
  const [passphrase, setPassphrase] = useState<PassphraseOptions>(() => ({
    ...DEFAULT_PASSPHRASE,
    ...((saved.passphrase as Partial<PassphraseOptions>) ?? {}),
  }));
  const [outputFormat, setOutputFormat] = useState<OutputFormat>(
    () => (saved.outputFormat as OutputFormat) ?? "linebreak"
  );
  const [wrapArray, setWrapArray] = useState(() => saved.wrapArray === true);

  const [results, setResults] = useState<string[]>([]);
  const [output, setOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState(0);

  useEffect(() => {
    try {
      // Generated results are never stored, only the settings.
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({
          mode,
          count,
          length,
          charsetOptions,
          readable,
          guaranteeEach,
          passphrase,
          outputFormat,
          wrapArray,
        })
      );
    } catch {
      /* storage unavailable */
    }
  }, [
    mode,
    count,
    length,
    charsetOptions,
    readable,
    guaranteeEach,
    passphrase,
    outputFormat,
    wrapArray,
  ]);

  const config: ModeConfig = useMemo(
    () => ({ mode, count, length, charsetOptions, readable, guaranteeEach, passphrase }),
    [mode, count, length, charsetOptions, readable, guaranteeEach, passphrase]
  );

  const hasSelectedCharset =
    mode === "passphrase" ||
    charsetOptions.letters ||
    charsetOptions.numbers ||
    charsetOptions.special;

  const strength = useMemo(() => strengthFor(config), [config]);

  const format = useCallback(
    (items: string[]) =>
      formatOutput(items, { format: mode === "custom" ? outputFormat : "linebreak", wrapArray }),
    [mode, outputFormat, wrapArray]
  );

  const generate = useCallback(() => {
    if (!hasSelectedCharset) {
      setError("Choose at least one character type.");
      return;
    }
    setError(null);
    setIsGenerating(true);
    const start = performance.now();

    setTimeout(() => {
      try {
        const generated = generateForConfig(config);
        setResults(generated);
        setOutput(format(generated));
        setGenerationTime(performance.now() - start);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Generation failed");
      } finally {
        setIsGenerating(false);
      }
    }, 0);
  }, [config, format, hasSelectedCharset]);

  const clear = useCallback(() => {
    setResults([]);
    setOutput("");
    setGenerationTime(0);
    setError(null);
  }, []);

  const reformat = useCallback(() => {
    if (results.length > 0) setOutput(format(results));
  }, [results, format]);

  const setCount = useCallback(
    (value: number) => setCountRaw(Math.max(1, Math.min(info.maxCount, value))),
    [info.maxCount]
  );

  const setLength = useCallback(
    (value: number) => setLengthRaw(Math.max(info.minLength, Math.min(info.maxLength, value))),
    [info.minLength, info.maxLength]
  );

  const selectMode = useCallback(
    (next: Mode) => {
      const preset = presetFor(next);
      setModeState(next);
      if (preset.count !== undefined) setCountRaw(preset.count);
      else setCountRaw((c) => Math.min(c, MODES[next].maxCount));
      if (preset.length !== undefined) setLengthRaw(preset.length);
      if (preset.charsetOptions) setCharsetOptions(preset.charsetOptions);
      if (preset.readable !== undefined) setReadable(preset.readable);
      if (preset.guaranteeEach !== undefined) setGuaranteeEach(preset.guaranteeEach);
      clear();
    },
    [clear]
  );

  return {
    mode,
    selectMode,
    count,
    setCount,
    length,
    setLength,
    charsetOptions,
    setCharsetOptions,
    readable,
    setReadable,
    guaranteeEach,
    setGuaranteeEach,
    passphrase,
    setPassphrase,
    outputFormat,
    setOutputFormat,
    wrapArray,
    setWrapArray,
    config,
    strength,
    results,
    output,
    isGenerating,
    error,
    generationTime,
    hasSelectedCharset,
    generate,
    clear,
    reformat,
  };
}
