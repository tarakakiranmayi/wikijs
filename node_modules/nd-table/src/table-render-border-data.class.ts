import { TableRenderData } from './table-render-data.class';
import { TRBL } from './trbl.type';

type TLBRSeparator = [TRBL, number];

/**
 * Border data
 */
export class TableRenderBorderData {
  /**
   * border grid and content logical description (sep = TLBRSeparator, i.e [TRBL, multiplier])
   * edge  pad  content  pad  edge  eol
   * [sep, sep,   sep,   sep, sep, enter]
   * [sep, sep, line[i], sep, sep, enter] x lines.length
   * [sep, sep,   sep,   sep, sep, enter]
   **/
  readonly grid: (TLBRSeparator | string)[][][][] = [];

  /** Map of horizontal (top/bottom) borders on (x, y) coordinates (+ 1 closing row) */
  readonly horizontal: boolean[][] = [];

  /** Indication of at least 1 horizontal border for each y coordinate (+ 1 closing row) */
  readonly horizontalSerparation: boolean[] = [];

  /** Map of vertical (left/right) borders on (x, y) coordinates (+ 1 closing column) */
  readonly vertical: boolean[][] = [];

  /** Indication of at least 1 vertical border for each x coordinate (+ 1 closing column) */
  readonly verticalSerparation: boolean[] = [];

  /**
   * Instantiate border info object, set minimum data
   * @param renderData data source
   */
  constructor(renderData: TableRenderData) {
    const { cellConfig, cellValueRenderedMultiline, columnWidth, columns, rows, startX, startY } = renderData;
    for (let x = startX; x < columns; x++) {
      this.horizontal[x] = [];
      this.vertical[x] = [];
      this.grid[x] = [];
    }
    this.horizontal[columns] = [];
    this.vertical[columns] = [];
    for (let x = startX; x <= columns; x++) {
      for (let y = startY; y <= rows; y++) {
        this.horizontal[x][y] = cellConfig[x]?.[y - 1]?.borderBottom || cellConfig[x]?.[y]?.borderTop || false;
        this.horizontalSerparation[y] = this.horizontalSerparation[y] || this.horizontal[x][y];
        this.vertical[x][y] = cellConfig[x - 1]?.[y]?.borderRight || cellConfig[x]?.[y]?.borderLeft || false;
        this.verticalSerparation[x] = this.verticalSerparation[x] || this.vertical[x][y];
      }
    }
    // build the grid
    for (let x = startX; x < columns; x++) {
      const hasLeftPadding = this.verticalSerparation[x] || x > startX;
      const hasRightPadding = this.verticalSerparation[x + 1];
      const lineEnd = (x === columns - 1 ? '\n' : '');
      for (let y = startY; y < rows; y++) {
        const lines = cellValueRenderedMultiline[x][y];
        const grid = (this.grid[x][y] = []) as (TLBRSeparator | string)[][];
        const hasTopBorder = this.horizontal[x][y];
        const hasBottomBorder = this.horizontal[x][y + 1];
        const hasLeftBorder = this.vertical[x][y];
        const hasRightBorder = this.vertical[x + 1]?.[y];
        if (this.horizontalSerparation[y]) {
          grid.push([
            (this.verticalSerparation[x] ? [this.crossingID(x, y), 1] : ''),
            (hasLeftPadding ? [(hasTopBorder ? 5 : 0), 1] : ''),
            [(hasTopBorder ? 5 : 0), columnWidth[x]],
            (hasRightPadding ? [(hasTopBorder ? 5 : 0), 1] : ''),
            (lineEnd && this.verticalSerparation[x + 1] ? [this.crossingID(x + 1, y), 1] : ''),
            lineEnd
          ]);
        }
        const len = lines.length;
        for (let i = 0; i < len; i++) {
          grid.push([
            (this.verticalSerparation[x] ? [(hasLeftBorder ? 10 : 0), 1] : ''),
            (hasLeftPadding ? [0, 1] : ''),
            lines[i],
            (hasRightPadding ? [0, 1] : ''),
            (lineEnd && this.verticalSerparation[x + 1] ? [(hasRightBorder ? 10 : 0), 1] : ''),
            lineEnd
          ]);
        }
        if (y === rows - 1 && this.horizontalSerparation[y + 1]) {
          grid.push([
            (this.verticalSerparation[x] ? [this.crossingID(x, y + 1), 1] : ''),
            (hasLeftPadding ? [(hasBottomBorder ? 5 : 0), 1] : ''),
            [(hasBottomBorder ? 5 : 0), columnWidth[x]],
            (hasRightPadding ? [(hasBottomBorder ? 5 : 0), 1] : ''),
            (lineEnd && this.verticalSerparation[x + 1] ? [this.crossingID(x + 1, y + 1), 1] : ''),
            lineEnd
          ]);
        }
      }
    }
  }

  /**
   * Get the Top|Left|Bottom|Right bitmask value for crossing
   * @param x coordinate
   * @param y coordinate
   * @returns TRBL position
   */
  crossingID(x: number, y: number): TRBL {
    const vertical = this.vertical[x];
    const horizontal = this.horizontal[x];
    const horizontalPre = this.horizontal[x - 1];
    return (vertical && vertical[y - 1] ? 8 : 0) +
      (horizontal && horizontal[y] && x < this.horizontal.length - 1 ? 4 : 0) +
      (vertical && vertical[y] && y < vertical.length - 1 ? 2 : 0) +
      (horizontalPre && horizontalPre[y] ? 1 : 0) as TRBL;
  }
}
