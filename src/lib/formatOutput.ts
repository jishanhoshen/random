export type OutputFormat = 'linebreak' | 'comma' | 'csv';

export interface FormatOptions {
  format: OutputFormat;
  wrapArray?: boolean;
}

export function formatOutput(strings: string[], options: FormatOptions): string {
  if (strings.length === 0) {
    return '';
  }

  switch (options.format) {
    case 'linebreak':
      return strings.join('\n');

    case 'comma':
      return strings.join(', ');

    case 'csv': {
      const quoted = strings.map((s) => `"${s.replace(/"/g, '\\"')}"`);
      if (options.wrapArray) {
        return `[${quoted.join(', ')}]`;
      }
      return quoted.join(', ');
    }

    default:
      return strings.join('\n');
  }
}
