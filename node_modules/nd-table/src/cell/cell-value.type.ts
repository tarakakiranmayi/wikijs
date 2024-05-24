import { ConfigValue } from '../config/config-value.type';

export type CellValue = undefined | null | boolean | string | number | bigint;

export type CellValueOrValueWithOptions = CellValue | ({ value: CellValue } & ConfigValue);
