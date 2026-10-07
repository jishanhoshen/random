import { useMemo, useState } from 'react';
import type { OutputFormat } from '../lib/formatOutput';
import { generateStrings } from '../lib/generateStrings';
import type { CharsetOptions } from '../lib/generateStrings';

interface GeneratorFormProps {
  count: number;
  onCountChange: (value: number) => void;
  length: number;
  onLengthChange: (value: number) => void;
  charsetOptions: CharsetOptions;
  onCharsetOptionsChange: (options: CharsetOptions) => void;
  readable: boolean;
  onReadableChange: (value: boolean) => void;
  outputFormat: OutputFormat;
  onOutputFormatChange: (format: OutputFormat) => void;
  wrapArray: boolean;
  onWrapArrayChange: (value: boolean) => void;
  onGenerate: () => void;
  onClear: () => void;
  isGenerating: boolean;
  hasSelectedCharset: boolean;
  error: string | null;
}

const label = 'mb-2 block text-sm font-semibold text-ink';
const numberInput =
  'w-full rounded-lg border border-line bg-paper px-3 py-2.5 font-mono text-base text-ink';

function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`rounded-lg border px-3 py-2.5 text-sm font-semibold ${
        on ? 'border-accent bg-accent text-accent-ink' : 'border-line bg-paper text-muted hover:border-accent'
      }`}
    >
      {children}
    </button>
  );
}

function Segmented<T extends string>({
  name,
  value,
  options,
  onChange,
}: {
  name: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={name} className="grid auto-cols-fr grid-flow-col gap-1 rounded-lg border border-line bg-paper p-1">
      {options.map((o) => (
        <label
          key={o.value}
          className={`cursor-pointer rounded-md px-2 py-2 text-center text-sm font-semibold has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent ${
            value === o.value ? 'bg-panel text-ink shadow-sm' : 'text-muted'
          }`}
        >
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
            className="sr-only"
          />
          {o.label}
        </label>
      ))}
    </div>
  );
}

export function ColoredString({ value }: { value: string }) {
  return (
    <>
      {value.split('').map((ch, i) => (
        <span key={i} className={/\d/.test(ch) ? 'text-num' : /[a-z]/i.test(ch) ? 'text-ink' : 'text-sym'}>
          {ch}
        </span>
      ))}
    </>
  );
}

export function GeneratorForm(p: GeneratorFormProps) {
  const [tick, setTick] = useState(0);
  const o = p.charsetOptions;

  const sample = useMemo(() => {
    try {
      return generateStrings({
        count: 1,
        length: Math.min(p.length, 28),
        charsetOptions: o,
        readable: p.readable,
      })[0];
    } catch {
      return '';
    }
    // tick re-rolls the sample on demand
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.length, o, p.readable, tick]);

  const set = (patch: Partial<CharsetOptions>) => p.onCharsetOptionsChange({ ...o, ...patch });

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <div className="mb-6 rounded-xl bg-paper p-4">
        <div className="mb-1 flex items-center justify-between text-sm text-muted">
          <span>Sample</span>
          <button type="button" onClick={() => setTick((t) => t + 1)} className="font-semibold text-accent hover:underline">
            Try another
          </button>
        </div>
        <div className="min-h-8 break-all font-mono text-lg" aria-live="off">
          {sample ? <ColoredString value={sample} /> : <span className="text-sm text-muted">Choose at least one character type.</span>}
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-[1fr_auto] items-end gap-x-4 gap-y-2">
          <label htmlFor="length" className={`${label} !mb-0`}>
            Length of each string
          </label>
          <input
            id="length-num"
            aria-label="Length value"
            type="number"
            min={1}
            max={64}
            value={p.length}
            onChange={(e) => {
              const n = parseInt(e.target.value);
              if (!isNaN(n)) p.onLengthChange(n);
            }}
            className={`${numberInput} w-20`}
          />
          <input
            id="length"
            type="range"
            min={1}
            max={64}
            value={p.length}
            onChange={(e) => p.onLengthChange(Number(e.target.value))}
            className="col-span-2 w-full"
          />
        </div>

        <div>
          <label htmlFor="count" className={label}>
            How many strings (1 to 10,000)
          </label>
          <input
            id="count"
            type="number"
            min={1}
            max={10000}
            value={p.count}
            onChange={(e) => {
              const n = parseInt(e.target.value);
              if (!isNaN(n)) p.onCountChange(n);
            }}
            className={numberInput}
          />
        </div>

        <fieldset>
          <legend className={label}>Characters</legend>
          <div className="grid grid-cols-3 gap-2">
            <Toggle on={o.letters} onClick={() => set({ letters: !o.letters })}>Letters</Toggle>
            <Toggle on={o.numbers} onClick={() => set({ numbers: !o.numbers })}>Numbers</Toggle>
            <Toggle on={o.special} onClick={() => set({ special: !o.special })}>Symbols</Toggle>
          </div>
          {o.letters && (
            <div className="mt-3">
              <Segmented
                name="Letter case"
                value={o.letterCase}
                onChange={(v) => set({ letterCase: v })}
                options={[
                  { value: 'both', label: 'Aa' },
                  { value: 'lowercase', label: 'aa' },
                  { value: 'uppercase', label: 'AA' },
                ]}
              />
            </div>
          )}
          <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm">
            <input type="checkbox" checked={p.readable} onChange={(e) => p.onReadableChange(e.target.checked)} className="mt-1 size-4 accent-[var(--accent)]" />
            <span>
              <span className="font-semibold text-ink">Skip look-alike characters</span>
              <span className="block text-muted">Leaves out 1, l, I, i, 0, O and o so strings are easy to read aloud.</span>
            </span>
          </label>
        </fieldset>

        <div>
          <span className={label}>Output format</span>
          <Segmented
            name="Output format"
            value={p.outputFormat}
            onChange={p.onOutputFormatChange}
            options={[
              { value: 'linebreak', label: 'Lines' },
              { value: 'comma', label: 'Commas' },
              { value: 'csv', label: 'Array' },
            ]}
          />
          {p.outputFormat === 'csv' && (
            <label className="mt-3 flex cursor-pointer items-center gap-3 text-sm text-ink">
              <input type="checkbox" checked={p.wrapArray} onChange={(e) => p.onWrapArrayChange(e.target.checked)} className="size-4 accent-[var(--accent)]" />
              Wrap in [ ]
            </label>
          )}
        </div>
      </div>

      {p.error && (
        <p role="alert" className="mt-5 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {p.error}
        </p>
      )}

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={p.onGenerate}
          disabled={!p.hasSelectedCharset || p.isGenerating}
          className="flex-1 rounded-lg bg-accent px-4 py-3 font-bold text-accent-ink hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {p.isGenerating ? 'Generating…' : 'Generate strings'}
        </button>
        <button type="button" onClick={p.onClear} className="rounded-lg border border-line px-4 py-3 font-semibold text-muted hover:border-accent hover:text-ink">
          Clear
        </button>
      </div>
    </div>
  );
}
