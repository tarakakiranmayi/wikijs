import { outputFormatters } from './output-formatters.const';

export type OutputFormatters = typeof outputFormatters;

export type OutputFormat = keyof OutputFormatters;
