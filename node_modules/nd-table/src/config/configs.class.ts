import { Cells } from '../cell/cells.class';
import { Container2D } from '../container-2d.class';
import { Table } from '../table.class';
import { ConfigValue } from './config-value.type';
import { Config } from './config.class';
import { IncomingConfigValue } from './incoming-config-value.type';
import { Preferences } from './preferences.class';

export class Configs extends Container2D<ConfigValue, Config, Configs> {
  readonly preferences: Preferences;

  readonly table = new Config(this, undefined!, undefined!, {});

  protected _columns: Config[] = [];
  protected _rows: Config[] = [];

  constructor(readonly cells: Cells) {
    super(Config, () => ({}));
    this.preferences = new Preferences(Table.getPreferences());
  }

  clear(): void {
    this.table.clear();
    this._columns.length = 0;
    delete this._columns[-1];
    this._rows.length = 0;
    delete this._rows[-1];
    super.clear();
  }

  flip(): void {
    this.table.flipBorders();
    const { columns, rows, startX, startY } = this.cells;
    for (let x = startX; x < columns; x++) {
      this._columns[x]?.flipBorders();
    }
    for (let y = startY; y < rows; y++) {
      this._rows[y]?.flipBorders();
    }
    [this._columns, this._rows] = [this._rows, this._columns];
    [this._columns[-1], ...this._columns, this._rows[-1], ...this._rows].forEach((item) => {
      if (item) {
        [item.x, item.y] = [item.y, item.x];
      }
    });
    this._list.forEach((config) => config.flipBorders());
    super.flip();
  }

  getColumn(x: number): Config {
    Container2D.checkCoordinate(x);
    return this._columns[x] = (this._columns[x] || new Config(this, x, undefined!, {}));
  }

  getRow(y: number): Config {
    Container2D.checkCoordinate(y);
    return this._rows[y] = (this._rows[y] || new Config(this, undefined!, y, {}));
  }

  setColumn(x: number, config: IncomingConfigValue): void {
    this.getColumn(x).value = config;
  }

  setRow(y: number, config: IncomingConfigValue): void {
    this.getRow(y).value = config;
  }

  splice(vertical: boolean, i: number, remove: number, insert = 0): void {
    super.splice(vertical, i, remove, insert);
    remove = remove > 0 ? Math.floor(remove) : 0;
    insert = insert > 0 ? Math.floor(insert) : 0;
    const meta = vertical ? this._columns : this._rows;
    if (remove) {
      if (i === -1) {
        delete meta[-1];
        remove--;
        insert && insert--;
      }
    }
    if (remove || insert) {
      meta.splice(i, remove, ...Array(insert));
      const axis = vertical ? 'x' : 'y';
      for (let ii = i - remove + insert; ii < meta.length; ii++) {
        if (meta[ii]) {
          meta[ii][axis] = ii;
        }
      }
    }
  }
}
