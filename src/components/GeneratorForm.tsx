import { useMemo, useState } from "react";
import type { useStringGenerator } from "../hooks/useStringGenerator";
import type { CharsetOptions } from "../lib/generateStrings";
import { CHARSETS } from "../lib/charsets";
import { MODES, MODE_ORDER, generateForConfig } from "../lib/modes";

type Generator = ReturnType<typeof useStringGenerator>;

const label = "mb-2 block text-sm font-semibold text-ink";
const numberInput =
  "w-full rounded-lg border border-line bg-paper px-3 py-2.5 font-mono text-base text-ink";

function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`rounded-lg border px-3 py-2.5 text-sm font-semibold ${
        on
          ? "border-accent bg-accent text-accent-ink"
          : "border-line bg-paper text-muted hover:border-accent"
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
  wrap = false,
}: {
  name: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  wrap?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={name}
      className={`rounded-lg border border-line bg-paper p-1 ${wrap ? "flex flex-wrap gap-1" : "grid auto-cols-fr grid-flow-col gap-1"}`}
    >
      {options.map((o) => (
        <label
          key={o.value}
          className={`cursor-pointer rounded-md px-3 py-2 text-center text-sm font-semibold has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent ${
            value === o.value ? "bg-accent text-accent-ink" : "text-muted hover:text-ink"
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

function Check({
  checked,
  onChange,
  title,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 size-4 accent-[var(--accent)]"
      />
      <span>
        <span className="font-semibold text-ink">{title}</span>
        {hint && <span className="block text-muted">{hint}</span>}
      </span>
    </label>
  );
}

function Slider({
  id,
  text,
  value,
  min,
  max,
  onChange,
}: {
  id: string;
  text: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-end gap-x-4 gap-y-2">
      <label htmlFor={id} className={`${label} !mb-0`}>
        {text}
      </label>
      <input
        aria-label={`${text} value`}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value);
          if (!isNaN(n)) onChange(n);
        }}
        className={`${numberInput} w-20`}
      />
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="col-span-2 w-full"
      />
    </div>
  );
}

export function ColoredString({ value }: { value: string }) {
  return (
    <>
      {value.split("").map((ch, i) => (
        <span
          key={i}
          className={/\d/.test(ch) ? "text-num" : /[a-z]/i.test(ch) ? "text-ink" : "text-sym"}
        >
          {ch}
        </span>
      ))}
    </>
  );
}

export function GeneratorForm({ g }: { g: Generator }) {
  const [tick, setTick] = useState(0);
  const o = g.charsetOptions;
  const info = MODES[g.mode];
  const isCustom = g.mode === "custom";
  const isPass = g.mode === "passphrase";
  const showSymbols = g.mode === "strong" || (isCustom && o.special);

  const sample = useMemo(() => {
    try {
      return generateForConfig({ ...g.config, count: 1, length: Math.min(g.config.length, 40) })[0];
    } catch {
      return "";
    }
    // tick re-rolls the sample on demand
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [g.config, tick]);

  const set = (patch: Partial<CharsetOptions>) => g.setCharsetOptions({ ...o, ...patch });
  const setPass = (patch: Partial<typeof g.passphrase>) =>
    g.setPassphrase({ ...g.passphrase, ...patch });

  const { bits, label: strengthLabel, level } = g.strength;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <div className="mb-5">
        <Segmented
          wrap
          name="Type"
          value={g.mode}
          onChange={g.selectMode}
          options={MODE_ORDER.map((m) => ({ value: m, label: MODES[m].label }))}
        />
        <p className="mt-2 text-sm text-muted">{info.hint}</p>
      </div>

      <div className="mb-6 rounded-xl bg-paper p-4">
        <div className="mb-1 flex items-center justify-between text-sm text-muted">
          <span>Sample</span>
          <button
            type="button"
            onClick={() => setTick((t) => t + 1)}
            className="font-semibold text-accent hover:underline"
          >
            Try another
          </button>
        </div>
        <div className="min-h-8 break-all font-mono text-lg">
          {sample ? (
            <ColoredString value={sample} />
          ) : (
            <span className="text-sm text-muted">Choose at least one character type.</span>
          )}
        </div>
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-semibold text-ink">{strengthLabel}</span>
            <span className="text-muted">about {Math.round(bits)} bits</span>
          </div>
          <div
            role="meter"
            aria-label="Password strength"
            aria-valuemin={0}
            aria-valuemax={110}
            aria-valuenow={Math.round(bits)}
            aria-valuetext={`${strengthLabel}, about ${Math.round(bits)} bits`}
            className="h-2 overflow-hidden rounded-full bg-line"
          >
            <div className="h-full rounded-full bg-accent" style={{ width: `${level * 100}%` }} />
          </div>
          {g.mode === "pin" && (
            <p className="mt-2 text-sm text-muted">
              A short PIN is only safe where wrong guesses are limited, like a phone or ATM.
            </p>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {isPass ? (
          <>
            <Slider
              id="words"
              text="Number of words"
              value={g.passphrase.words}
              min={3}
              max={10}
              onChange={(n) => setPass({ words: n })}
            />
            <div>
              <span className={label}>Separator</span>
              <Segmented
                name="Separator"
                value={g.passphrase.separator}
                onChange={(v) => setPass({ separator: v })}
                options={[
                  { value: "-", label: "Dash" },
                  { value: ".", label: "Dot" },
                  { value: "_", label: "Underscore" },
                  { value: " ", label: "Space" },
                ]}
              />
            </div>
            <div className="space-y-3">
              <Check
                checked={g.passphrase.capitalize}
                onChange={(v) => setPass({ capitalize: v })}
                title="Capitalize each word"
              />
              <Check
                checked={g.passphrase.appendNumber}
                onChange={(v) => setPass({ appendNumber: v })}
                title="Add a number at the end"
                hint="For sites that require a digit."
              />
            </div>
          </>
        ) : (
          <Slider
            id="length"
            text="Length"
            value={g.length}
            min={info.minLength}
            max={info.maxLength}
            onChange={g.setLength}
          />
        )}

        {isCustom && (
          <fieldset>
            <legend className={label}>Characters</legend>
            <div className="grid grid-cols-3 gap-2">
              <Toggle on={o.letters} onClick={() => set({ letters: !o.letters })}>
                Letters
              </Toggle>
              <Toggle on={o.numbers} onClick={() => set({ numbers: !o.numbers })}>
                Numbers
              </Toggle>
              <Toggle on={o.special} onClick={() => set({ special: !o.special })}>
                Symbols
              </Toggle>
            </div>
            {o.letters && (
              <div className="mt-3">
                <Segmented
                  name="Letter case"
                  value={o.letterCase}
                  onChange={(v) => set({ letterCase: v })}
                  options={[
                    { value: "both", label: "Aa" },
                    { value: "lowercase", label: "aa" },
                    { value: "uppercase", label: "AA" },
                  ]}
                />
              </div>
            )}
            <div className="mt-4">
              <Check
                checked={g.guaranteeEach}
                onChange={g.setGuaranteeEach}
                title="Use every selected type at least once"
                hint="Helps with sites that require a digit, a symbol or both cases."
              />
            </div>
          </fieldset>
        )}

        {showSymbols && (
          <div>
            <label htmlFor="symbols" className={label}>
              Allowed symbols
            </label>
            <div className="flex gap-2">
              <input
                id="symbols"
                value={o.customSymbols ?? ""}
                onChange={(e) => set({ customSymbols: e.target.value })}
                placeholder={CHARSETS.special}
                spellCheck={false}
                className={`${numberInput} min-w-0 flex-1`}
              />
              <button
                type="button"
                onClick={() => set({ customSymbols: "" })}
                className="rounded-lg border border-line px-3 text-sm font-semibold text-muted hover:border-accent hover:text-ink"
              >
                Reset
              </button>
            </div>
            <p className="mt-1 text-sm text-muted">
              Remove any symbol a site rejects. Empty uses the default set.
            </p>
          </div>
        )}

        {!isPass && !isCustom && g.mode !== "pin" && (
          <Check
            checked={g.readable}
            onChange={g.setReadable}
            title="Skip look-alike characters"
            hint="Leaves out 1, l, I, i, 0, O and o."
          />
        )}
        {isCustom && (
          <Check
            checked={g.readable}
            onChange={g.setReadable}
            title="Skip look-alike characters"
            hint="Leaves out 1, l, I, i, 0, O and o."
          />
        )}

        <div>
          <label htmlFor="count" className={label}>
            How many ({info.maxCount.toLocaleString()} at most)
          </label>
          <input
            id="count"
            type="number"
            min={1}
            max={info.maxCount}
            value={g.count}
            onChange={(e) => {
              const n = parseInt(e.target.value);
              if (!isNaN(n)) g.setCount(n);
            }}
            className={numberInput}
          />
        </div>

        {isCustom && (
          <div>
            <span className={label}>Output format</span>
            <Segmented
              name="Output format"
              value={g.outputFormat}
              onChange={g.setOutputFormat}
              options={[
                { value: "linebreak", label: "Lines" },
                { value: "comma", label: "Commas" },
                { value: "csv", label: "Array" },
              ]}
            />
            {g.outputFormat === "csv" && (
              <div className="mt-3">
                <Check checked={g.wrapArray} onChange={g.setWrapArray} title="Wrap in [ ]" />
              </div>
            )}
          </div>
        )}
      </div>

      {g.error && (
        <p
          role="alert"
          className="mt-5 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400"
        >
          {g.error}
        </p>
      )}

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={g.generate}
          disabled={!g.hasSelectedCharset || g.isGenerating}
          className="flex-1 rounded-lg bg-accent px-4 py-3 font-bold text-accent-ink hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {g.isGenerating ? "Generating…" : g.count > 1 ? "Generate" : "Generate password"}
        </button>
        <button
          type="button"
          onClick={g.clear}
          className="rounded-lg border border-line px-4 py-3 font-semibold text-muted hover:border-accent hover:text-ink"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
