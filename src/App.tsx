import { useEffect } from "react";
import { useStringGenerator } from "./hooks/useStringGenerator";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { ThemeToggle } from "./components/ThemeToggle";
import { GeneratorForm } from "./components/GeneratorForm";
import { OutputPanel } from "./components/OutputPanel";

function App() {
  const [isDark, setIsDark] = useLocalStorage("theme", false);
  const g = useStringGenerator();
  const { outputFormat, wrapArray, reformat } = g;

  useEffect(() => {
    reformat();
  }, [outputFormat, wrapArray, reformat]);

  const handleDownload = () => {
    const url = URL.createObjectURL(new Blob([g.output], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "random-strings.txt";
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
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">Password generator</h1>
          <p className="mt-2 max-w-xl text-muted">
            Make strong passwords, PINs and passphrases in your browser. Nothing is sent to a server
            and nothing is saved.
          </p>
        </div>
        <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
      </header>

      <main className="grid items-start gap-6 lg:grid-cols-[26rem_1fr]">
        <GeneratorForm g={g} />
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
        <h2 className="mb-3 text-xl font-bold text-ink">Which type should I pick?</h2>
        <p className="mb-3">
          Use <span className="font-semibold text-ink">Strong</span> for email, banking and anything
          you can recover from only with great effort. Use{" "}
          <span className="font-semibold text-ink">Standard</span> when a site rejects symbols. A{" "}
          <span className="font-semibold text-ink">passphrase</span> suits passwords you must type
          by hand, like a device login or a password manager&apos;s master password. A{" "}
          <span className="font-semibold text-ink">PIN</span> is only for places that lock you out
          after a few wrong guesses.
        </p>
        <p>
          Everything is generated in your browser with its secure random number generator. Passwords
          are never sent anywhere or stored. Only your settings are remembered on this device. The
          strength figure is the amount of randomness in the password, not a promise about how long
          it would take to crack.
        </p>
      </section>
    </div>
  );
}

export default App;
