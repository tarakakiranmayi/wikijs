import { ConfigValue } from './config-value.type';
import { Configs } from './configs.class';
import { IncomingConfigValue } from './incoming-config-value.type';
import { RenderConfig } from './render-config.type';

export const CONFIG_ALIGN = ['center', 'left', 'right'] as const;
const CONFIG_BORDERS = ['borderBottom', 'borderLeft', 'borderRight', 'borderTop'] as const;
const CONFIG_COLORS = ['black', 'blue', 'cyan', 'default', 'green', 'magenta', 'red', 'white', 'yellow'] as const;
export const CONFIG_VALIGN = ['bottom', 'middle', 'top'] as const;
const CONFIG_SIZES = ['height', 'maxHeight', 'maxWidth', 'width'] as const;

export type Align = (typeof CONFIG_ALIGN)[number]
export type BorderProperty = (typeof CONFIG_BORDERS)[number];
export type Color = (typeof CONFIG_COLORS)[number]
export type VAlign = (typeof CONFIG_VALIGN)[number]

const CONFIG_BORDER_FLIP_PAIRS: { [key in BorderProperty]: BorderProperty } = {
  borderBottom: 'borderRight',
  borderLeft: 'borderTop',
  borderRight: 'borderBottom',
  borderTop: 'borderLeft'
};

/** [axis, isStarter, prop-of-cells-for-edge] */
const CONFIG_BORDER_REFS: { [key in BorderProperty]: ['x' | 'y', boolean, 'columns' | 'rows' | 'startX' | 'startY'] } = {
  borderBottom: ['y', false, 'rows'],
  borderLeft: ['x', true, 'startX'],
  borderRight: ['x', false, 'columns'],
  borderTop: ['y', true, 'startY']
};

export class Config {
  static sanitizeAlign(input: Align, fallback: Align = 'left'): Align {
    const lc = String(input).toLowerCase() as Align;
    return CONFIG_ALIGN.includes(lc) ? lc : fallback;
  }

  static sanitizeVAlign(input: VAlign, fallback: VAlign = 'top'): VAlign {
    const lc = String(input).toLowerCase() as VAlign;
    return CONFIG_VALIGN.includes(lc) ? lc : fallback;
  }

  constructor(protected readonly parent: Configs, public x: number, public y: number, protected _value: ConfigValue) {}

  get renderConfig(): RenderConfig {
    const columnConfig = this.parent.getColumn(this.x).value;
    const rowConfig = this.parent.getRow(this.y).value;
    const mesh = Object.assign(this.parent.table.value, rowConfig, columnConfig, this.value);
    const { startX, startY } = this.parent.cells;
    mesh.borderBottom = this.parent.getsert(this.x, this.y + 1).borderValue('borderTop') || this.borderValue('borderBottom');
    mesh.borderLeft = (this.x > startX ?
      this.parent.getsert(this.x - 1, this.y).borderValue('borderRight') : undefined) || this.borderValue('borderLeft');
    mesh.borderRight = this.parent.getsert(this.x + 1, this.y).borderValue('borderLeft') || this.borderValue('borderRight');
    mesh.borderTop = (this.y > startY ?
      this.parent.getsert(this.x, this.y - 1).borderValue('borderBottom') : undefined) || this.borderValue('borderTop');
    return mesh as RenderConfig;
  }

  /** read and add defaults */
  get value(): ConfigValue {
    const preferences = this.parent.preferences.value;
    const defaults: ConfigValue = {};
    if (this.x == null && this.y == null) { // table
      defaults.borderTop = defaults.borderRight = defaults.borderLeft = defaults.borderBottom = !!preferences.tableBorders;
      defaults.valign = Config.sanitizeVAlign(preferences.valign);
    } else if (this.x == null) { // row
      if (this.y === -1) { // header
        defaults.align = Config.sanitizeAlign(preferences.columnHeaderAlign);
        defaults.bold = !!preferences.boldHeaders;
        defaults.borderBottom = !!preferences.headerBorders;
        defaults.valign = Config.sanitizeVAlign(preferences.columnHeaderVAlign);
      } else if (this.y > 0) {
        defaults.borderTop = !!preferences.horizontalBorders;
      }
    } else if (this.y == null) { // column
      if (this.x === -1) { // header
        defaults.align = Config.sanitizeAlign(preferences.rowHeaderAlign);
        defaults.bold = !!preferences.boldHeaders;
        defaults.borderRight = !!preferences.headerBorders;
        defaults.valign = Config.sanitizeVAlign(preferences.rowHeaderVAlign);
      } else if (this.x > 0) {
        defaults.borderLeft = !!preferences.verticalBorders;
      }
    } else if (this.x === -1 && this.y === -1) { // no top/left borders for -1,-1 by default
      defaults.borderLeft = false;
      defaults.borderTop = false;
    }
    return Object.assign(defaults, this._value);
  }

  /** sanitze and update */
  set value(config: IncomingConfigValue) {
    const sane: ConfigValue = {};
    if (config && typeof config === 'object') {
      if ('align' in config) {
        const align = config.align;
        sane.align = CONFIG_ALIGN.includes(align!) ? align : undefined;
      }
      if ('valign' in config) {
        const valign = config.valign;
        sane.valign = CONFIG_VALIGN.includes(valign!) ? valign : undefined;
      }
      if ('color' in config) {
        const color = config.color;
        sane.color = CONFIG_COLORS.includes(color!) ? color : undefined;
      }
      if ('link' in config) {
        sane.link = typeof config.link === 'string' && config.link.trim() || undefined;
      }
      for (const booleanKey of ['bold', ...CONFIG_BORDERS, 'italic'] as const) {
        if (booleanKey in config) {
          sane[booleanKey] = config[booleanKey] == null ? undefined : !!config[booleanKey];
        }
      }
      const shorthands: { [shorthand in keyof IncomingConfigValue]: BorderProperty[] } = {
        border: ['borderTop', 'borderRight', 'borderBottom', 'borderLeft'],
        horizontalBorder: ['borderTop', 'borderBottom'],
        verticalBorder: ['borderRight', 'borderLeft']
      };
      for (const [shorthand, keys] of Object.entries(shorthands) as [keyof IncomingConfigValue, BorderProperty[]][]) {
        if (shorthand in config) {
          for (const key of keys) {
            if (!(key in sane)) {
              sane[key] = config[shorthand] == null ? undefined : !!config[shorthand];
            }
          }
        }
      }
      for (const key of CONFIG_SIZES) {
        if (key in config) {
          const nval = Math.round(+config[key]!);
          sane[key] = nval > 0 ? nval : undefined;
        }
      }
      if ('renderer' in config) {
        const fn = config.renderer;
        sane.renderer = typeof fn === 'function' ? fn : undefined;
      }
    }
    Object.assign(this._value, sane);
  }

  borderValue(prop: BorderProperty): boolean {
    const [axis, isStarter, edgeProp] = CONFIG_BORDER_REFS[prop];
    const isEdge = (this[axis] === this.parent.cells[edgeProp] - (isStarter ? 0 : 1));
    return (this.value[prop] ??
      (axis === 'x' || isEdge ? this.parent.getColumn(this.x).value[prop] : undefined) ??
      (axis === 'y' || isEdge ? this.parent.getRow(this.y).value[prop] : undefined) ??
      (isEdge ? this.parent.table.value[prop] : undefined)) ||
      false;
  }

  clear(): void {
    for (const key of Object.keys(this._value) as (keyof ConfigValue)[]) {
      delete this._value[key];
    }
  }

  flipBorders(): void {
    const tmp: ConfigValue = {};
    for (const key of Object.keys(CONFIG_BORDER_FLIP_PAIRS) as BorderProperty[]) {
      if (this._value[key] != null) {
        tmp[CONFIG_BORDER_FLIP_PAIRS[key]] = this._value[key];
        delete this._value[key];
      }
    }
    Object.assign(this._value, tmp);
  }
}
