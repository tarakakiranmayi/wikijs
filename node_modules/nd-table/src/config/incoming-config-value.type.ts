import { ConfigValue } from './config-value.type';

/**
 * Config for cell or bulk config suggestion for column, row, or table (will trickle down, unless overridden)
 * Shortcuts are allowed for border
 */
export interface IncomingConfigValue extends ConfigValue {
  /** border shorthand, includes: top, right, bottom, left */
  border?: boolean;

  /** border shorthand, includes: top, bottom */
  horizontalBorder?: boolean;

  /** border shorthand, includes: right, left */
  verticalBorder?: boolean;
}
