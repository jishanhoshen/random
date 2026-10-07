import { useEffect } from 'react';
import { useStringGenerator } from './hooks/useStringGenerator';
import { useLocalStorage } from './hooks/useLocalStorage';
import { ThemeToggle } from './components/ThemeToggle';
import { GeneratorForm } from './components/GeneratorForm';
import { OutputPanel } from './components/OutputPanel';

function App() {
  const [isDark, setIsDark] = useLocalStorage('theme', false);
  const g = useStringGenerator();
  const { outputFormat, wrapArray, reformat } = g;

  useEffect(() => {
    reformat();
  }, [outputFormat, wrapArray, reformat]);

  const handleDownload = () => {
    const url = URL.createObjectURL(new Blob([g.output], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'random-strings.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalChars = g.results.reduce((sum, s) => sum + s.length, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">Random string generator</h1>
          <p className="mt-2 max-w-xl text-muted">
            Make tokens, test data and IDs in your browser. Nothing is sent to a server.
          </p>
        </div>
        <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
      </header>

      <main className="grid items-start gap-6 lg:grid-cols-[26rem_1fr]">
        <GeneratorForm
          count={g.count}
          onCountChange={g.setCount}
          length={g.length}
          onLengthChange={g.setLength}
          charsetOptions={g.charsetOptions}
          onCharsetOptionsChange={g.setCharsetOptions}
          readable={g.readable}
          onReadableChange={g.setReadable}
          outputFormat={g.outputFormat}
          onOutputFormatChange={g.setOutputFormat}
          wrapArray={g.wrapArray}
          onWrapArrayChange={g.setWrapArray}
          onGenerate={g.generate}
          onClear={g.clear}
          isGenerating={g.isGenerating}
          hasSelectedCharset={g.hasSelectedCharset}
          error={g.error}
        />
        <div className="lg:sticky lg:top-6">
          <OutputPanel
            output={g.output}
            onDownload={handleDownload}
            stringCount={g.results.length}
            totalChars={totalChars}
            generationTime={g.generationTime}
          />
        </div>
      </main>

      <section className="mt-12 max-w-2xl text-muted">
        <h2 className="mb-3 text-xl font-bold text-ink">How it works</h2>
        <p className="mb-3">
          Set how many strings you need and how long each one is, choose the character types, then press Generate. Copy
          the result or download it as a text file.
        </p>
        <p>
          Strings are built with your browser&apos;s cryptographically secure random number generator, so they are
          suitable for API keys and tokens. Up to 10,000 strings of 64 characters each.
        </p>
      </section>
    </div>
  );
}

export default App;
