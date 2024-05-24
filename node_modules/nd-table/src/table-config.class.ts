import { Cells } from './cell/cells.class';
import { configMulticoord } from './config/config-multicoord';
import { ConfigValue } from './config/config-value.type';
import { IncomingConfigValue } from './config/incoming-config-value.type';
import { PreferencesValue } from './config/preferences-value.type';
import { Preferences } from './config/preferences.class';
import { RenderConfig } from './config/render-config.type';

/**
 * Table Config API
 */
export class TableConfig {
  protected static readonly _preferences = new Preferences();

  protected readonly _cells = new Cells();

  /**
   * Create TableConfig instance
   */
  constructor() {
    Object.defineProperty(this, '_cells', { enumerable: false, configurable: false, writable: false, value: this._cells });
  }

  /**
   * Get cell config
   * @param x 0-based coordinate index (-1 for row header)
   * @param y 0 based coordinate index (-1 for column header)
   * @returns cell config
   */
  getCellConfig(x: number, y: number): ConfigValue {
    return this._cells.configs.getsert(x, y).value;
  }

  /**
   * Get meshed (cell > column > row > table) configuration for cell
   * @param x 0-based coordinate index (-1 for row header)
   * @param y 0 based coordinate index (-1 for column header)
   * @returns cell render config
   */
  getCellRenderConfig(x: number, y: number): RenderConfig {
    return this._cells.configs.getsert(x, y).renderConfig;
  }

  /**
   * Get column config
   * @param x 0-based coordinate index (-1 for row header)
   * @returns column config
   */
  getColumnConfig(x: number): ConfigValue {
    return this._cells.configs.getColumn(x).value;
  }

  /**
   * Get generic table preferences
   * @returns preferences object
   */
  getPreferences(): PreferencesValue {
    return this._cells.configs.preferences.value;
  }

  /**
   * Get row config
   * @param y 0 based coordinate index (-1 for column header)
   * @returns row config
   */
  getRowConfig(y: number): ConfigValue {
    return this._cells.configs.getRow(y).value;
  }

  /**
   * Get table config
   * @returns table config
   */
  getTableConfig(): ConfigValue {
    return this._cells.configs.table.value;
  }

  /**
   * Update cell config
   * @param x 0-based coordinate index (-1 for row header) or pattern like: '0..2,5' (from..to, to included)
   * @param y 0 based coordinate index (-1 for column header) or pattern like: '0..2,5' (from..to, to included)
   * @param config updates
   * @returns this Table
   */
  setCellConfig(x: number | string, y: number | string, config: IncomingConfigValue): this {
    const xs = configMulticoord(x);
    const ys = configMulticoord(y);
    for (const _x of xs) {
      for (const _y of ys) {
        this._cells.configs.upsert(_x, _y, config);
      }
    }
    return this;
  }

  /**
   * Update column config
   * @param x 0-based coordinate index (-1 for row header) or pattern like: '0..2,5' (from..to, to included)
   * @param config updates
   * @returns this Table
   */
  setColumnConfig(x: number | string, config: IncomingConfigValue): this {
    const xs = configMulticoord(x);
    for (const _x of xs) {
      this._cells.configs.setColumn(_x, config);
    }
    return this;
  }

  /**
   * Update generic table preferences
   * @param preferences updates
   * @returns this Table
   */
  setPreferences(preferences: Partial<PreferencesValue>): this {
    this._cells.configs.preferences.value = preferences;
    return this;
  }

  /**
   * Update row config
   * @param y 0 based coordinate index (-1 for column header) or pattern like: '0..2,5' (from..to, to included)
   * @param config updates
   * @returns this Table
   */
  setRowConfig(y: number | string, config: IncomingConfigValue): this {
    const ys = configMulticoord(y);
    for (const _y of ys) {
      this._cells.configs.setRow(_y, config);
    }
    return this;
  }

  /**
   * Update table config
   * @param config updates
   * @returns this Table
   */
  setTableConfig(config: IncomingConfigValue): this {
    this._cells.configs.table.value = config;
    return this;
  }
}
