import { useEffect } from 'react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isDark}
      className="rounded-full border border-line bg-panel px-4 py-2 text-sm font-semibold text-ink hover:border-accent"
    >
      {isDark ? 'Light mode' : 'Dark mode'}
    </button>
  );
}
