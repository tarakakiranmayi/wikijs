import { CellValue } from '../cell/cell-value.type';
import { TableSnapshot } from '../table-snapshot.class';
import { Align, Color, VAlign } from './config.class';

/**
 * Config for cell or bulk config suggestion for column, row, or table (will trickle down, unless overridden)
 */
export interface ConfigValue {
  /** horizontal alignment of cell content */
  align?: Align;

  /** style: bold cell content */
  bold?: boolean;

  /** bottom border (cell, column, row, or table). NOTE: neighbors will overlap */
  borderBottom?: boolean;

  /** left border (cell, column, row, or table). NOTE: neighbors will overlap */
  borderLeft?: boolean;

  /** right border (cell, column, row, or table). NOTE: neighbors will overlap */
  borderRight?: boolean;

  /** top border of scope (cell, column, row, or table). NOTE: neighbors will overlap */
  borderTop?: boolean;

  /** style: cell content color */
  color?: Color;

  /** fix cell content height (in line count) */
  height?: number;

  /** style: italic cell content */
  italic?: boolean;

  /** cell content link */
  link?: string;

  /** max cell content height (in line count) */
  maxHeight?: number;

  /** max cell content width (in character count) */
  maxWidth?: number;

  /**
   * Custom cell value parser to string
   * @param value original value
   * @param x coordinate
   * @param y coordinate
   * @param options blended cell options
   * @param table table snapshot
   * @returns string value
   */
  renderer?: (value: CellValue, x: number, y: number, config: ConfigValue, table: TableSnapshot) => string;

  /** vertical alignment of multiline cell content */
  valign?: VAlign;

  /** fixed cell content width (in character count) */
  width?: number;
}
