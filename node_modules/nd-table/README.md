# nd-table
Node.js Table builder for:
- console/terminal (ascii, utf8, ansi)
- MarkDown (md)
- HTML
- JSON
- CSV, TSV
- pre-rendered data for your custom outputs

## Supported features
Depending on the output format:
- borders
- multiline cells
- horizontal and vertical cell alignments
- styles: color, bold, italic
See details at [Configuration options](#Configuration%20options)

## Install
```bash
npm install nd-table
```

### In your code
```javascript
import { Table } from 'nd-table';
```

Or, if you use `require()`:
```javascript
const Table = require('nd-table').Table;
```

## Usage
```javascript
const table = new Table('Column A', 'Column B'); // initialize table with optional column headers
table.addRowWithHead('First Row Head', 'abc def\nghi jkl mno pqr', 1); // add a row
table.addRowWithHead('Row Head', 'stu', 2); // add a row with row header
table.addRowWithHead('Another Row Head', { value: 'vwx', bold: true, color: 'red' }, 3); // Value is specified with options for "Column A"
table.addRow('yz', { value: 4, link: 'https://osnews.com/' }); // Specifies a link for "Column B". Supported in Markdown and HTML outputs
console.log(table.toString()); // print the table
//                    ┌──────────────────────────┐
//                    │ Column A        Column B │
// ┌──────────────────┼──────────────────────────┤
// │   First Row Head │ abc def                1 │
// │                  │ ghi jkl mno pqr          │
// │         Row Head │ stu                    2 │
// │ Another Row Head │ vwx                    3 │
// │                  │ yz                     4 │
// └──────────────────┴──────────────────────────┘
```

### Builder API
```javascript
Table.fromData(data[][]); // Builds a table from a 2-dimensional array of values
table.columns; // Current number of columns (the value of the highest 'x' position of any cells + 1)
table.rows; // Current number of rows (the value of the highest 'y' position of any cells + 1)
table.addRow(...values); // Append a row to the end of the table with values*
table.addRowWithHead(head, ...values); // Append a row to the end of the table with header and values*
table.addSeparator(); // Sets { borderBottom: true } on the last row's config
table.clear(); // Clear the entire table, including values, configs, headers
table.deleteColumn(x); // Removes a column
table.deleteColumns(x, count); // Removes a number of columns
table.deleteRow(y); // Removes a row
table.deleteRows(y, count); // Removes a number of rows
table.flip(); // Flips x and y axes
table.getCell(x, y); // Get cell value
table.getColumnHeaders(); // Get column headers
table.getRowHeaders(); // Get row headers
table.getSnapshot(); // A snapshot of the table's current state
table.insertColumn(x); // Inserts a column
table.insertColumns(x, count); // Inserts a number of columns
table.insertRow(y, ...values); // Inserts a row, adds cell values*
table.insertRowWithHead(y, head, ...values); // Inserts a row, adds head and cell values*
table.insertRows(y, count); // Inserts a number of empty rows
table.replaceRow(y, ...values); // Replaces a row's content with provided cell values*
table.replaceRowWithHead(y, head, ...values); // Replaces a row's content with provided header and cell values*
table.setCell(x, y, value); // Update cell value*
table.setColumnHeaders(newHeaders); // Update column headers (pass [] or null to delete headers)
table.setRowHeaders(newHeaders: CellValueOrValueWithOptions[] | null | undefined); // Update column headers (pass [] or null to delete headers)
```
#### Cell Value
- Value can be any primitive: `undefined`, `null`, `boolean`, `number`, `bigint`, or `string`
- Objects (including arrays), functions, and symbols will be stringified.
- Values (marked with `*` above) can be passed directly, or in combination with config options, like this:
```javascript
table.addRow({ value: 'My Cell Value', align: 'right', borderLeft: true }, 'Other Cell Value');
```

#### Coordinates: x, y
Columns and rows are in a 0-based index that excludes the optional headers
**x = -1** is the row header
**y = -1** is the column header

### Config API
```javascript
getCellConfig(x, y); // Get cell config
getCellRenderConfig(x, y); // Get meshed (cell > column > row > table) configuration for cell
getColumnConfig(x); // Get column config
getRowConfig(y); // Get row config
getTableConfig(); // Get table config
setCellConfig(x, y, config); // Update cell config
setColumnConfig(x, config); // Update column config
setRowConfig(y, config); // Update row config
setTableConfig(config); // Update table config
```
For setters (`setCellConfig`, `setColumnConfig`, `setRowConfig`) you may pass coordinate(s) for `x` and `y`:
- an integer
- string pattern that is a comma-separated list of indexes and/or ranges: '0..2,5' (from..to, to included)

#### Configuration options
```typescript
interface ConfigValue {
  align?: 'left' | 'center' | 'right'; // horizontal alignment of cell content (undefined = 'left')
  bold?: boolean; // style: bold cell content (undefined = false)
  borderBottom?: boolean; // bottom border (cell, column, row, or table). NOTE: neighbors will overlap
  borderLeft?: boolean; // left border (cell, column, row, or table). NOTE: neighbors will overlap
  borderRight?: boolean; // right border (cell, column, row, or table). NOTE: neighbors will overlap
  borderTop?: boolean; // top border of scope (cell, column, row, or table). NOTE: neighbors will overlap
  color?: 'black' | 'blue' | 'cyan' | 'default' | 'green' | 'magenta' | 'red' | 'white' | 'yellow'; // style: ANSI 8-color
  height?: number; // fix cell content height (in line count)
  italic?: boolean; // style: italic cell content
  link?: string; // cell content link
  maxHeight?: number; // max cell content height (in line count)
  maxWidth?: number; // max cell content width (in character count)
  renderer?: (value: CellValue, x: number, y: number, config: ConfigValue, table: TableSnapshot) => string; // cell renderer function
  valign?: (typeof CONFIG_VALIGN)[number]; // vertical alignment of multiline cell content
  width?: number; // fixed cell content width (in character count)
}

// When setting configuration, you may use shorthands for border* properties:
interface IncomingConfigValue extends ConfigValue {
  border?: boolean; // top + right + bottom + left
  horizontalBorder?: boolean; // top + bottom
  verticalBorder?: boolean; // right + left
}
```

#### Preferences
Preferences for defaults can be set on both the Table static (ex: `Table.setPreferences({ boldHeaders: true })`) or
for the instance (ex: `const table = (new Table()).setPreferences({ verticalBorders: true })`).
You can check the current values by getting a copy of the preferences: `table.getPreferences()`

##### Default preferences
```javascript
{
  align: 'left',
  boldHeaders: true,
  columnHeaderAlign: 'left',
  columnHeaderVAlign: 'bottom',
  headerBorders: true,
  horizontalBorders: false,
  numberAlign: 'right',
  rowHeaderAlign: 'right',
  rowHeaderVAlign: 'top',
  tableBorders: true,
  valign: 'top',
  verticalBorders: false
}
```

### Output API

#### Output methods
```javascript
// generic
table.toString(format?, options?); // Output Table string with selected (or default) format and options. Also triggered by String(table)
// or format-specific
table.toUTF8({ ansi: true, flavor: 'rounded', separatorSpaces: 3 }); // For terminal, uses UTF-8 box drowing characters for borders
table.toASCII({ ansi: true }); // For terminal with no UTF-8 support
table.toMarkdown(); // Markdown
table.toCSV(); // Excel compatbile CSV
table.toTSV(); // TSV (CSV with tab separation)
table.toHTML({ styles: true }); // HTML <table>
table.toJSON({ compact: true }); // JSON array of arrays
```

#### Default output format and options
If nothing is set, default format is `utf8`
```javascript
Table.setOutputFormat(format, options?); // Sets default output format and options for all Table instances that don't have their own default
table.setOutputFormat(format, options?); // Sets default output format and options for the Table instance
```

#### Custom builder output
Get pre-processed render data and use it with your own custom output formatter.
```javascript
myCustomOutput(table.toRenderData());
```
The render data is a mash of the TableSnapshot and these additional interfaces:
```typescript
interface TableSnapshot {
  cellConfig: RenderConfig[][]; // copy of original cell config on (x, y) coordinates
  cellValue: CellValue[][]; // copy of original cell values on (x, y) coordinates
  columnConfig: ConfigValue[]; // copy of original column config on (x) coordinate
  columnHeaders?: CellValue[]; // column header values (or undefined for no headers)
  columns: number; // number of columns (excluding header)
  rowConfig: ConfigValue[]; // copy of original row config on (y) coordinate
  rowHeaders?: CellValue[]; // row header values (or undefined for no headers)
  rows: number; // row count (excluding header)
  startX: number; // -1 when row headers are present, 0 otherwise
  startY: number; // -1 when column headers are present, 0 otherwise
  tableConfig: ConfigValue; // copy of original table config
}

interface TableRenderData extends TableSnapshot {
  borders: TableRenderBorderData; // border information in a grid logic
  cellValueRendered: string[][] = []; // processed cell values on (x, y) coordinates
  cellValueRenderedMultiline: string[][][] = []; // processed cell values split into fixed-width lines on (x, y) coordinates
  columnWidth: number[] = []; // processed column width on (x) coordinate
  rowHeight: number[] = []; // processed row height (line count) on (y) coordinate
}

interface TableRenderBorderData {
  /**
   * border grid and content logical description (sep = TLBRSeparator, i.e [TRBL, multiplier])
   * [sep, sep,   sep,   sep, sep, enter]
   * [sep, sep, line[i], sep, sep, enter] x lines.length
   * [sep, sep,   sep,   sep, sep, enter]
   **/
  readonly grid: (TLBRSeparator | string)[][][][] = []; // border grid and content logical description (sep = TLBRSeparator, i.e [TRBL, multiplier])
  readonly horizontal: boolean[][] = []; // Map of horizontal (top/bottom) borders on (x, y) coordinates (+ 1 closing row)
  readonly horizontalSerparation: boolean[] = []; // Indication of at least 1 horizontal border for each y coordinate (+ 1 closing row)
  readonly vertical: boolean[][] = []; // Map of vertical (left/right) borders on (x, y) coordinates (+ 1 closing column)
  readonly verticalSerparation: boolean[] = []; // Indication of at least 1 vertical border for each x coordinate (+ 1 closing column)
}
```
