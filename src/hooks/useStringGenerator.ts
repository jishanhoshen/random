import { useState, useCallback, useEffect } from 'react';
import { generateStrings } from '../lib/generateStrings';
import type { CharsetOptions } from '../lib/generateStrings';
import { formatOutput } from '../lib/formatOutput';
import type { OutputFormat } from '../lib/formatOutput';

const DEFAULT_COUNT = 10;
const DEFAULT_LENGTH = 16;
const DEFAULT_CHARSET_OPTIONS: CharsetOptions = {
  letters: true,
  numbers: true,
  special: false,
  letterCase: 'both',
};

const SETTINGS_KEY = 'generatorSettings';

function loadSettings(): Record<string, unknown> {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}');
  } catch {
    return {};
  }
}

const clampNum = (v: unknown, min: number, max: number, fallback: number) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.max(min, Math.min(max, v)) : fallback;

export function useStringGenerator() {
  const [saved] = useState(loadSettings);
  const [count, setCountRaw] = useState(() => clampNum(saved.count, 1, 10000, DEFAULT_COUNT));
  const [length, setLengthRaw] = useState(() => clampNum(saved.length, 1, 64, DEFAULT_LENGTH));
  const [charsetOptions, setCharsetOptions] = useState<CharsetOptions>(() => ({
    ...DEFAULT_CHARSET_OPTIONS,
    ...((saved.charsetOptions as Partial<CharsetOptions>) ?? {}),
  }));
  const [readable, setReadable] = useState(() => saved.readable === true);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>(
    () => (saved.outputFormat as OutputFormat) ?? 'linebreak',
  );
  const [wrapArray, setWrapArray] = useState(() => saved.wrapArray === true);

  useEffect(() => {
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({ count, length, charsetOptions, readable, outputFormat, wrapArray }),
      );
    } catch {
      /* storage unavailable */
    }
  }, [count, length, charsetOptions, readable, outputFormat, wrapArray]);
  const [results, setResults] = useState<string[]>([]);
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState<number>(0);

  const hasSelectedCharset =
    charsetOptions.letters || charsetOptions.numbers || charsetOptions.special;

  const generate = useCallback(() => {
    if (!hasSelectedCharset) {
      setError('At least one character type must be selected');
      return;
    }

    setError(null);
    setIsGenerating(true);

    const startTime = performance.now();

    setTimeout(() => {
      try {
        const generated = generateStrings({
          count,
          length,
          charsetOptions,
          readable,
        });
        setResults(generated);
        setOutput(
          formatOutput(generated, {
            format: outputFormat,
            wrapArray,
          }),
        );
        setGenerationTime(performance.now() - startTime);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Generation failed');
      } finally {
        setIsGenerating(false);
      }
    }, 0);
  }, [count, length, charsetOptions, readable, outputFormat, wrapArray, hasSelectedCharset]);

  const clear = useCallback(() => {
    setResults([]);
    setOutput('');
    setGenerationTime(0);
    setError(null);
  }, []);

  const reformat = useCallback(() => {
    if (results.length > 0) {
      setOutput(
        formatOutput(results, {
          format: outputFormat,
          wrapArray,
        }),
      );
    }
  }, [results, outputFormat, wrapArray]);

  const updateCount = useCallback((value: number) => {
    const clamped = Math.max(1, Math.min(10000, value));
    setCountRaw(clamped);
  }, []);

  const updateLength = useCallback((value: number) => {
    const clamped = Math.max(1, Math.min(64, value));
    setLengthRaw(clamped);
  }, []);

  return {
    count,
    setCount: updateCount,
    length,
    setLength: updateLength,
    charsetOptions,
    setCharsetOptions,
    readable,
    setReadable,
    outputFormat,
    setOutputFormat,
    wrapArray,
    setWrapArray,
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
