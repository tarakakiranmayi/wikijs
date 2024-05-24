import { OutputFormat } from './output-formatter.type';
import { outputFormatters } from './output-formatters.const';

export function outputFormatSane(format: OutputFormat): OutputFormat {
  const lc = String(format) as OutputFormat;
  return outputFormatters[lc] ? lc : 'utf8';
}
