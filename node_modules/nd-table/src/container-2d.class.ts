
interface Node2D<TV> { x: number; y: number; value: TV }

type DataClass<TV, T extends Node2D<TV>, TP> = {
  new(parent: TP, x: number, y: number, value: TV): T;
  constructor: Function;
};

export abstract class Container2D<TV, T extends Node2D<TV>, TP> {
  static checkCoordinate(coord: number): void {
    if (!Number.isInteger(coord) || coord < -1) {
      throw new Error(`Table coordinate must be integer and >= -1. Received: ${coord})`);
    }
  }

  static checkCoordinates(x: number, y: number): void {
    Container2D.checkCoordinate(x);
    Container2D.checkCoordinate(y);
  }

  protected readonly _list: T[] = [];

  constructor(protected readonly DataClass: DataClass<TV, T, TP>, protected readonly defaultValueFn: () => TV) {}

  clear(): void {
    this._list.length = 0;
  }

  count(matchFn: (item: T) => boolean): number {
    return this.filter(matchFn).length;
  }

  filter(matchFn: (item: T) => boolean): T[] {
    return this._list.filter(matchFn);
  }

  flip(): void {
    this._list.forEach((item) => {
      [item.x, item.y] = [item.y, item.x];
    });
    this.sort();
  }

  getsert(x: number, y: number): T {
    Container2D.checkCoordinates(x, y);
    let item = this._list.find((item) => item.x === x && item.y === y);
    if (!item) {
      this._list.push(item = new this.DataClass(this as any as TP, x, y, this.defaultValueFn()));
      this.sort();
    }
    return item;
  }

  indices(matchFn: (item: T) => boolean): number[] {
    const indices: number[] = [];
    for (let i = this._list.length - 1; i >= 0; i--) {
      if (matchFn(this._list[i])) {
        indices.push(i);
      }
    }
    return indices.sort((a, b) => a > b ? -1 : 1);
  }

  max(numberValFn: (item: T) => number, min = 0): number {
    let max = min;
    const maxFn = (item: T): void => {
      const n = numberValFn(item);
      if (n > max) {
        max = n;
      }
    };
    this._list.forEach(maxFn);
    return max;
  }

  remove(matchFn: (item: T) => boolean): void {
    this.indices(matchFn).forEach((index) => this._list.splice(index, 1));
  }

  splice(vertical: boolean, i: number, remove: number, insert = 0): void {
    Container2D.checkCoordinate(i);
    remove = remove > 0 ? Math.floor(remove) : 0;
    insert = insert > 0 ? Math.floor(insert) : 0;
    const axis = vertical ? 'x' : 'y';
    this.remove((cell) => cell[axis] >= i && cell[axis] < i + remove);
    const diff = insert - remove + (i === -1 ? 1 : 0);
    this.filter((cell) => cell[axis] >= i).forEach((cell) => cell[axis] += diff);
  }

  upsert(x: number, y: number, value: TV): void {
    this.getsert(x, y).value = value;
  }

  protected sort(): void {
    this._list.sort((a, b) => a.y === b.y ? (a.x! < b.x! ? -1 : 1) : (a.y! < b.y! ? -1 : 1));
  }
}
