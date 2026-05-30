import { DecimalCount } from '../types/displayValue';
import { FormattedValue } from './valueFormats';
export declare function toPercent(size: number | null, decimals: DecimalCount): FormattedValue;
export declare function toPercentUnit(size: number | null, decimals: DecimalCount): FormattedValue;
export declare function toHex0x(value: number | null, decimals: DecimalCount): FormattedValue;
export declare function toHex(value: number | null, decimals: DecimalCount): FormattedValue;
export declare function sci(value: number | null, decimals: DecimalCount): FormattedValue;
