import { Container2D } from '../container-2d.class';
import { CellValue } from './cell-value.type';
import { Cells } from './cells.class';

export class Cell {
  static defaultRenderer(value: CellValue): string {
    let str = '';
    if (typeof value === 'string') {
      str = value;
    } else if (value === true) {
      str = '✓';
    } else if (value === false) {
      str = '✗';
    } else if (typeof value === 'number' || typeof value === 'bigint' || (value && typeof value === 'object')) {
      str = String(value);
    }
    return str;
  }

  constructor(protected readonly parent: Cells, public x: number, public y: number, protected _value: CellValue) {
    Container2D.checkCoordinates(x, y);
  }

  get value(): CellValue {
    return this._value;
  }

  set value(value: CellValue) {
    if (typeof value === 'function' || (value && typeof value === 'object') || typeof value === 'symbol') {
      value = String(value);
    }
    this._value = value;
  }
}
