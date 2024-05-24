import { CellValue } from '../cell/cell-value.type';
import { TableRenderData } from '../table-render-data.class';

export function outputFormatterJSON(renderData: TableRenderData, options?: { compact?: boolean }): string {
  const { cellValue, columns, rows, startX, startY } = renderData;
  const out: CellValue[][] = [];
  for (let y = startY; y < rows; y++) {
    const row: CellValue[] = [];
    for (let x = startX; x < columns; x++) {
      row.push(cellValue[x][y]);
    }
    out.push(row);
  }
  return JSON.stringify(out, null, options?.compact ? undefined : 2);
}
