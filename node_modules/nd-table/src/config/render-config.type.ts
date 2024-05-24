import { ConfigValue } from './config-value.type';
import { BorderProperty } from './config.class';

/**
 * Same as ConfigValue, but guaranteed to have the border properties with boolean value
 */
export type RenderConfig = (ConfigValue & { [key in BorderProperty]: boolean });
