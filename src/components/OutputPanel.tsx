import { useState } from "react";

interface OutputPanelProps {
  output: string;
  onDownload: () => void;
  stringCount: number;
  totalChars: number;
  generationTime: number;
}

const btn =
  "rounded-lg border border-line px-3.5 py-2 text-sm font-semibold text-ink hover:border-accent disabled:cursor-not-allowed disabled:opacity-40";

export function OutputPanel({
  output,
  onDownload,
  stringCount,
  totalChars,
  generationTime,
}: OutputPanelProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = output;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const hasOutput = output.length > 0;

  return (
    <div className="flex h-full min-h-[24rem] flex-col rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-ink">Result</h2>
        <div className="flex gap-2">
          <button type="button" onClick={copy} disabled={!hasOutput} className={btn}>
            <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
          </button>
          <button type="button" onClick={onDownload} disabled={!hasOutput} className={btn}>
            Download .txt
          </button>
        </div>
      </div>

      {hasOutput ? (
        <>
          <textarea
            readOnly
            value={output}
            aria-label="Generated strings"
            spellCheck={false}
            onFocus={(e) => e.currentTarget.select()}
            className="min-h-72 w-full flex-1 resize-y rounded-xl border border-line bg-paper p-4 font-mono text-sm leading-relaxed text-ink"
          />
          <p className="mt-3 text-sm text-muted">
            {stringCount.toLocaleString()} {stringCount === 1 ? "result" : "results"},{" "}
            {totalChars.toLocaleString()} characters, generated in{" "}
            {Math.max(1, Math.round(generationTime))} ms
          </p>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-line p-8 text-center">
          <p className="max-w-xs text-muted">
            Choose a type and press <span className="font-semibold text-ink">Generate</span>. Your
            password appears here, ready to copy.
          </p>
        </div>
      )}
    </div>
  );
}
