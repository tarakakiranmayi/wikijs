import { ConfigValue } from '../config/config-value.type';
import { Configs } from '../config/configs.class';
import { Container2D } from '../container-2d.class';
import { CellValue, CellValueOrValueWithOptions } from './cell-value.type';
import { Cell } from './cell.class';

export class Cells extends Container2D<CellValue, Cell, Cells> {
  readonly configs = new Configs(this);

  constructor() {
    super(Cell, () => undefined);
  }

  get columns(): number {
    return this.max((cell) => cell.value == null ? 0 : cell.x + 1);
  }

  get rows(): number {
    return this.max((cell) => cell.value == null ? 0 : cell.y + 1);
  }

  get startX(): number {
    return this.headerValues(true) ? -1 : 0;
  }

  get startY(): number {
    return this.headerValues(false) ? -1 : 0;
  }

  headerValues(vertical: boolean): undefined | CellValue[] {
    const values: CellValue[] = [];
    const len = (vertical ? this.rows : this.columns);
    let foundCount = 0;
    for (let i = 0; i < len; i++) {
      values[i] = this.getsert((vertical ? -1 : i), (vertical ? i : -1)).value;
      values[i] != null && foundCount++;
    }
    return foundCount ? values : undefined;
  }

  headersReplace(vertical: boolean, newHeaders: CellValueOrValueWithOptions[] | null | undefined): void {
    if (newHeaders != null && !Array.isArray(newHeaders)) {
      throw new Error('"newHeaders" argument must be an array');
    }
    this.remove(vertical ? ((cell): boolean => cell.x === -1) : ((cell): boolean => cell.y === -1));
    newHeaders = newHeaders || [];
    for (let i = 0; i < newHeaders.length; i++) {
      this.upsert((vertical ? -1 : i), (vertical ? i : -1), newHeaders[i]);
    }
  }

  upsert(x: number, y: number, value: CellValueOrValueWithOptions): void {
    let options: ConfigValue | undefined;
    if (value && typeof value === 'object') {
      options = value;
      value = value.value;
    }
    super.upsert(x, y, value);
    if (options) {
      this.configs.upsert(x, y, options);
    }
  }
}
