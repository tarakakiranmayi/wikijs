import { TableRenderData } from '../table-render-data.class';

const dblQuoteRx = /\"/g;
const nonSimpleRx = /[^a-z_0-9]/i;

export function outputFormatterCSV(renderData: TableRenderData, options?: { tsv?: boolean; }): string {
  const { cellValueRendered, columns, rows, startX, startY } = renderData;
  let out = '';
  const separator = options?.tsv ? '\t' : ',';
  for (let y = startY; y < rows; y++) {
    for (let x = startX; x < columns; x++) {
      const rendered = cellValueRendered[x][y];
      const content = rendered.match(nonSimpleRx) ? `"${rendered.replace(dblQuoteRx, '""')}"` : rendered;
      out += (x > startX ? separator : '') + content;
    }
    out += '\n';
  }
  return out;
}
