import { Cell } from './cell/cell.class';
import { Config } from './config/config.class';
import { PreferencesValue } from './config/preferences-value.type';
import { TableRenderBorderData } from './table-render-border-data.class';
import { TableSnapshot } from './table-snapshot.class';

const numberishRx = /^[0-9\.\-,%\s]*$/;

/**
 * Render information for custom table formatters
 */
export class TableRenderData extends TableSnapshot {
  /** border information in a grid logic */
  readonly borders: TableRenderBorderData;

  /** processed cell values on (x, y) coordinates */
  readonly cellValueRendered: string[][] = [];

  /** processed cell values split into fixed-width lines on (x, y) coordinates */
  readonly cellValueRenderedMultiline: string[][][] = [];

  /** processed column width on (x) coordinate */
  readonly columnWidth: number[] = [];

  /** processed row height (line count) on (y) coordinate */
  readonly rowHeight: number[] = [];

  /**
   * Instantiate render data
   * @param snapshot Table data snapshot
   */
  constructor(snapshot: TableSnapshot, preferences: PreferencesValue) {
    super(snapshot);
    const {
      cellConfig, cellValue, cellValueRendered, cellValueRenderedMultiline, columnWidth, columns, rowHeight, rows, startX, startY
    } = this;
    for (let x = startX; x < columns; x++) {
      cellValueRendered[x] = [];
      cellValueRenderedMultiline[x] = [];
      for (let y = startY; y < rows; y++) {
        const renderConfig = cellConfig[x][y];
        const rendererFn = (renderConfig.renderer || Cell.defaultRenderer);
        const rendered = cellValueRendered[x][y] = rendererFn(cellValue[x][y], x, y, renderConfig, snapshot);
        if (!renderConfig.align) {
          if (x >= 0 && y >= 0 && preferences.numberAlign && rendered.match(numberishRx)) {
            renderConfig.align = Config.sanitizeAlign(preferences.numberAlign);
          } else {
            renderConfig.align = Config.sanitizeAlign(preferences.align);
          }
        }
        const maxHeight = Math.min(renderConfig.maxHeight || 1000, renderConfig.height || 1000);
        let renderedLines = rendered.split('\n');
        if (renderedLines.length > maxHeight) {
          renderedLines = renderedLines.slice(0, renderConfig.maxHeight);
        }
        rowHeight[y] = Math.max(rowHeight[y] || 0, renderedLines.length);
        const rerendered = renderedLines.join('\n');
        const maxWidth = Math.min(renderConfig.maxWidth || 1000, renderConfig.width || 1000);
        cellValueRenderedMultiline[x][y] = rerendered.split('\n').map((line) => {
          const origLen = line.length;
          const len = Math.min(maxWidth, origLen);
          columnWidth[x] = Math.max(columnWidth[x] || 0, len);
          return line.substring(0, len);
        });
      }
    }
    // render vertical & horizontal alignment in cellValueRenderedMultiline
    for (let x = startX; x < columns; x++) {
      for (let y = startY; y < rows; y++) {
        const { align, valign } = cellConfig[x][y];
        const lines = cellValueRenderedMultiline[x][y];
        const height = rowHeight[y];
        let count = 0;
        while (lines.length < height) {
          if (valign === 'bottom') {
            lines.unshift('');
          } else if (valign === 'middle') {
            if (count % 2) {
              lines.push('');
            } else {
              lines.unshift('');
            }
            count++;
          } else {
            lines.push('');
          }
        }
        count = 0;
        for (let i = 0; i < height; i++) {
          while (lines[i].length < columnWidth[x]) {
            if (align === 'right') {
              lines[i] = ' ' + lines[i];
            } else if (align === 'center') {
              if (count % 2) {
                lines[i] = ' ' + lines[i];
              } else {
                lines[i] += ' ';
              }
              count++;
            } else {
              lines[i] += ' ';
            }
          }
        }
      }
    }
    this.borders = new TableRenderBorderData(this);
  }
}
