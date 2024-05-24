import { TableRenderData } from '../table-render-data.class';
import { outputFormatterCSV } from './output-formatter-csv';

export function outputFormatterTSV(renderData: TableRenderData, options?: Omit<Parameters<typeof outputFormatterCSV>[1], 'tsv'>): string {
  return outputFormatterCSV(renderData, Object.assign({ tsv: true }, options));
}
