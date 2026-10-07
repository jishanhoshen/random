# Random String Generator

A modern, privacy-focused random string generator web tool built with React, TypeScript, Vite, and Tailwind CSS. All processing happens entirely in the browser using cryptographically secure random values—no data is sent to any server.

## Features

- **Flexible Generation**: Generate 1 to 10,000 strings, each 1 to 100 characters long
- **Character Options**: Include letters (uppercase/lowercase/both), numbers, and special characters
- **Human Readability Mode**: Omit visually similar characters (1, l, I, i, 0, O, o)
- **Multiple Output Formats**: Line breaks, comma-separated, or CSV/Array style with optional array wrapper
- **Privacy First**: All generation happens locally in your browser using `crypto.getRandomValues`
- **Persistent Settings**: Your preferences are saved to localStorage
- **Dark/Light Theme**: Toggle between dark and light modes
- **Responsive Design**: Mobile-first layout that works on all screen sizes
- **Accessibility**: Proper labels, keyboard navigation, and ARIA live regions

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling (v4 with @tailwindcss/postcss)
- **Vitest** - Unit testing
- **ESLint + Prettier** - Code quality and formatting

## Project Structure

```
src/
  components/
    GeneratorForm.tsx    - Main form with all input controls
    OptionsGroup.tsx     - Character type selection
    OutputPanel.tsx      - Results display with copy/download
    ThemeToggle.tsx      - Dark/light mode toggle
  hooks/
    useStringGenerator.ts - Main state management hook
    useLocalStorage.ts    - localStorage persistence hook
  lib/
    generateStrings.ts   - Pure string generation logic
    formatOutput.ts      - Output formatting logic
    charsets.ts          - Character set definitions
  test/
    setup.ts             - Vitest setup
  App.tsx                - Main application component
  main.tsx               - Application entry point
  index.css              - Tailwind directives
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev

# The app will be available at http://localhost:5173
```

### Building

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Run tests
npm run test

# Run tests with UI
npm run test:ui
```

### Linting and Formatting

```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint:fix

# Format code with Prettier
npm run format
```

## Key Implementation Details

### Cryptographically Secure Randomness

The generator uses `crypto.getRandomValues()` with rejection sampling to avoid modulo bias, ensuring each character has an equal probability of being selected.

### Pure Library Modules

The core logic is separated into framework-free modules:

- `generateStrings.ts` - Handles string generation with charset options
- `formatOutput.ts` - Formats output in 3 different styles
- `charsets.ts` - Defines character sets and ambiguous character filtering

These can be easily imported and used in non-React projects.

### Performance

For large generation jobs (e.g., 10,000 strings × 100 characters), the UI uses `setTimeout` to defer generation, keeping the interface responsive during generation.

### Accessibility

- All form controls have proper labels
- Error messages use `role="alert"` and `aria-live="polite"`
- Copy feedback is announced to screen readers
- Full keyboard navigation support

## License

MIT
