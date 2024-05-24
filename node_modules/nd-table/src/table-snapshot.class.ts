import { CellValue } from './cell/cell-value.type';
import { ConfigValue } from './config/config-value.type';
import { RenderConfig } from './config/render-config.type';
import { TableBuilder } from './table-builder.class';

export class TableSnapshot {
  /** copy of original cell config on (x, y) coordinates */
  readonly cellConfig!: RenderConfig[][];

  /** copy of original cell values on (x, y) coordinates */
  readonly cellValue!: CellValue[][];

  /** copy of original column config on (x) coordinate */
  readonly columnConfig!: ConfigValue[];

  /** column header values (or undefined for no headers) */
  readonly columnHeaders?: CellValue[];

  /** number of columns (excluding header) */
  readonly columns!: number;

  /** copy of original row config on (y) coordinate */
  readonly rowConfig!: ConfigValue[];

  /** row header values (or undefined for no headers) */
  readonly rowHeaders?: CellValue[];

  /** row count (excluding header) */
  readonly rows!: number;

  /** -1 when row headers are present, 0 otherwise */
  readonly startX!: number;

  /** -1 when column headers are present, 0 otherwise */
  readonly startY!: number;

  /** copy of original table config */
  readonly tableConfig!: ConfigValue;

  constructor(table: TableBuilder | TableSnapshot) {
    if (table instanceof TableSnapshot) {
      Object.assign(this, table); // clone
    } else {
      this.columns = table.columns;
      this.rows = table.rows;
      this.columnHeaders = table.getColumnHeaders();
      this.startY = this.columnHeaders ? -1 : 0;
      this.rowHeaders = table.getRowHeaders();
      this.startX = this.rowHeaders ? -1 : 0;
      this.tableConfig = table.getTableConfig();
      this.cellConfig = [];
      this.cellValue = [];
      this.columnConfig = [];
      for (let x = this.startX; x < this.columns; x++) {
        this.columnConfig[x] = table.getColumnConfig(x);
        this.cellConfig[x] = [];
        this.cellValue[x] = [];
        for (let y = this.startY; y < this.rows; y++) {
          this.cellConfig[x][y] = table.getCellRenderConfig(x, y);
          this.cellValue[x][y] = table.getCell(x, y);
        }
      }
      this.rowConfig = [];
      for (let y = this.startY; y < this.rows; y++) {
        this.rowConfig[y] = table.getRowConfig(y);
      }
    }
  }
}
