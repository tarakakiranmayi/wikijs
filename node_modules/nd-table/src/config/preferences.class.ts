import { CONFIG_ALIGN, CONFIG_VALIGN } from './config.class';
import { PreferencesValue } from './preferences-value.type';

const defaultPreferences: PreferencesValue = {
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
};

export class Preferences {
  protected readonly _value = Object.assign({}, defaultPreferences);

  constructor(override?: Partial<PreferencesValue>) {
    if (override) {
      this.value = override;
    }
  }

  /** Get a copy of preferences */
  get value(): PreferencesValue {
    return Object.assign({}, this._value);
  }

  /** sanitze and update */
  set value(preferences: Partial<PreferencesValue>) {
    const sane: Partial<PreferencesValue> = {};
    if (preferences && typeof preferences === 'object') {
      for (const alignKey of ['align', 'columnHeaderAlign', 'rowHeaderAlign'] as const) {
        if (alignKey in preferences && preferences[alignKey] != null) {
          sane[alignKey] = CONFIG_ALIGN.includes(preferences[alignKey]!) ? preferences[alignKey] : undefined;
        }
      }
      for (const valignKey of ['valign', 'columnHeaderVAlign', 'rowHeaderVAlign'] as const) {
        if (valignKey in preferences && preferences[valignKey] != null) {
          sane[valignKey] = CONFIG_VALIGN.includes(preferences[valignKey]!) ? preferences[valignKey] : undefined;
        }
      }
      for (const booleanKey of ['boldHeaders', 'headerBorders', 'horizontalBorders', 'tableBorders', 'verticalBorders'] as const) {
        if (booleanKey in preferences && preferences[booleanKey] != null) {
          sane[booleanKey] = !!preferences[booleanKey];
        }
      }
    }
    Object.assign(this._value, preferences);
  }
}
