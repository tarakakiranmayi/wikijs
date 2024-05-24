import { TableRenderData } from '../table-render-data.class';
import { outputFormatterUTF8 } from './output-formatter-utf8';

export function outputFormatterASCII(
  renderData: TableRenderData,
  options?: Omit<Parameters<typeof outputFormatterUTF8>[1], 'flavor'>
): string {
  return outputFormatterUTF8(renderData, Object.assign({ flavor: 'ascii' }, options) as Parameters<typeof outputFormatterUTF8>[1]);
}
