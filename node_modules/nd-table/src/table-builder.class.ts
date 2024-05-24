import { CellValue, CellValueOrValueWithOptions } from './cell/cell-value.type';
import { TableConfig } from './table-config.class';
import { TableSnapshot } from './table-snapshot.class';

/**
 * Table Data API
 */
export class TableBuilder extends TableConfig {
  /**
   * Create Table instance
   * @param columnHeaders optionally set columnHeaders
   */
  constructor(...columnHeaders: CellValueOrValueWithOptions[]) {
    super();
    if (columnHeaders.length) {
      this.setColumnHeaders(columnHeaders);
    }
  }

  /**
   * Current number of columns (the value of the highest 'x' position of any cells + 1)
   */
  get columns(): number {
    return this._cells.columns;
  }

  /**
   * Current number of rows (the value of the highest 'y' position of any cells + 1)
   */
  get rows(): number {
    return this._cells.rows;
  }

  /**
   * Append a row to the end of the table with the provided cell values (and possibly configuration)
   * @param values primitive value or { value, ...config }
   * @returns the Table
   */
  addRow(...values: CellValueOrValueWithOptions[]): this {
    return this.addRowWithHead(undefined, ...values);
  }

  /**
   * Append a row to the end of the table with the provided row header and cell values (and possibly configuration)
   * @param header primitive value or { value, ...config }
   * @param values primitive value or { value, ...config }
   * @returns the Table
   */
  addRowWithHead(header?: CellValueOrValueWithOptions, ...values: CellValueOrValueWithOptions[]): this {
    return this.replaceRowWithHead(this.rows, header, ...values);
  }

  /**
   * Sets { borderBottom: true } on the last row's config
   * @returns this Table
   */
  addSeparator(): this {
    return this.setRowConfig(this.rows - 1, { borderBottom: true });
  }

  /**
   * Clear the entire table, including values, configs, headers
   * @returns this Table
   */
  clear(): this {
    this._cells.clear();
    this._cells.configs.clear();
    return this;
  }

  /**
   * Removes a column
   * @param x 0-based coordinate index (-1 for row headers)
   * @returns this Table
   */
  deleteColumn(x: number): this {
    return this.deleteColumns(x, 1);
  }

  /**
   * Removes a range of columns
   * @param x first column to delete: 0-based coordinate index (-1 for row headers)
   * @param count number of columns to remove
   * @returns this Table
   */
  deleteColumns(x: number, count: number): this {
    this._cells.splice(true, x, count);
    this._cells.configs.splice(true, x, count);
    return this;
  }

  /**
   * Removes a row
   * @param y 0-based coordinate index (-1 for column headers)
   * @returns this Table
   */
  deleteRow(y: number): this {
    return this.deleteRows(y, 1);
  }

  /**
   * Removes a range of rows
   * @param y first row to delete: 0-based coordinate index (-1 for column headers)
   * @param count number of rows to remove
   * @returns this Table
   */
  deleteRows(y: number, count: number): this {
    this._cells.splice(false, y, count);
    this._cells.configs.splice(false, y, count);
    return this;
  }

  /**
   * Flips x and y axes
   * @returns this Table
   */
  flip(): this {
    this._cells.flip();
    this._cells.configs.flip();
    return this;
  }

  /**
   * Get cell value
   * @param x 0-based coordinate index (-1 for row header)
   * @param y 0 based coordinate index (-1 for column header)
   * @returns cell value
   */
  getCell(x: number, y: number): CellValue {
    return this._cells.getsert(x, y).value;
  }

  /**
   * Get column headers
   * @returns undefined (for no headers) or array of header values
   */
  getColumnHeaders(): CellValue[] | undefined {
    return this._cells.headerValues(false);
  }

  /**
   * Get row headers
   * @returns undefined (for no headers) or array of header values
   */
  getRowHeaders(): CellValue[] | undefined {
    return this._cells.headerValues(true);
  }

  /**
   * A snapshot of the table's current state
   */
  getSnapshot(): TableSnapshot {
    return new TableSnapshot(this);
  }

  /**
   * Inserts a column
   * @param x 0 based coordinate index (-1 for column header)
   * @returns this Table
   */
  insertColumn(x: number): this {
    return this.insertColumns(x, 1);
  }

  /**
   * Inserts a number of columns
   * @param x 0 based coordinate index (-1 for column header)
   * @param count number of columns to insert
   * @returns this Table
   */
  insertColumns(x: number, count: number): this {
    this._cells.splice(true, x, 0, count);
    this._cells.configs.splice(true, x, 0, count);
    return this;
  }

  /**
   * Inserts a row, adds cell values
   * @param y 0 based coordinate index (-1 for column header)
   * @param values primitive value or { value, ...config }
   * @returns this Table
   */
  insertRow(y: number, ...values: CellValueOrValueWithOptions[]): this {
    this.insertRows(y, 1);
    return this.replaceRow(y, ...values);
  }

  /**
   * Inserts a row, adds head and cell values
   * @param y 0 based coordinate index (-1 for column header)
   * @param header primitive value or { value, ...config }
   * @param values primitive value or { value, ...config }
   * @returns this Table
   */
  insertRowWithHead(y: number, header: CellValueOrValueWithOptions, ...values: CellValueOrValueWithOptions[]): this {
    this.insertRows(y, 1);
    return this.replaceRowWithHead(y, header, ...values);
  }

  /**
   * Inserts a number of empty rows at coordinate
   * @param y first row to delete: 0-based coordinate index (-1 for column headers)
   * @param count number of rows to insert
   * @returns this Table
   */
  insertRows(y: number, count: number): this {
    this._cells.splice(false, y, 0, count);
    this._cells.configs.splice(false, y, 0, count);
    return this;
  }

  /**
   * Replaces a row's content with provided cell values
   * @param y 0 based coordinate index (-1 for column header)
   * @param values primitive value or { value, ...config }
   * @returns this Table
   */
  replaceRow(y: number, ...values: CellValueOrValueWithOptions[]): this {
    return this.replaceRowWithHead(y, undefined, ...values);
  }

  /**
   * Replaces a row's content with provided header and cell values
   * @param y 0 based coordinate index (-1 for column header)
   * @param header primitive value or { value, ...config }
   * @param values primitive value or { value, ...config }
   * @returns this Table
   */
  replaceRowWithHead(y: number, header: CellValueOrValueWithOptions, ...values: CellValueOrValueWithOptions[]): this {
    this._cells.remove((cell) => cell.y === y);
    this.setCell(-1, y, header);
    const len = values.length;
    for (let x = 0; x < len; x++) {
      this.setCell(x, y, values[x]);
    }
    return this;
  }

  /**
   * Update cell value (and optionally: config)
   * @param x 0-based coordinate index (-1 for row header)
   * @param y 0 based coordinate index (-1 for column header)
   * @param value new value or { value, ...config }
   * @returns this Table
   */
  setCell(x: number, y: number, value: CellValueOrValueWithOptions): this {
    this._cells.upsert(x, y, value);
    return this;
  }

  /**
   * Update column headers (pass [] or null to delete headers)
   * @param newHeaders primitive value or { value, ...config }
   * @returns this Table
   */
  setColumnHeaders(newHeaders: CellValueOrValueWithOptions[] | null | undefined): this {
    this._cells.headersReplace(false, newHeaders);
    return this;
  }

  /**
   * Update column headers (pass [] or null to delete headers)
   * @param newHeaders primitive value or { value, ...config }
   * @returns this Table
   */
  setRowHeaders(newHeaders: CellValueOrValueWithOptions[] | null | undefined): this {
    this._cells.headersReplace(true, newHeaders);
    return this;
  }
}
