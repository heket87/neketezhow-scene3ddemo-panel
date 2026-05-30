import { DataTransformerInfo } from '../../types/transformations';
import { GroupByFieldOptions } from './groupBy';
export declare const SHOW_NESTED_HEADERS_DEFAULT = true;
export interface GroupToNestedTableTransformerOptions {
    showSubframeHeaders?: boolean;
    fields: Record<string, GroupByFieldOptions>;
}
export declare const groupToNestedTable: DataTransformerInfo<GroupToNestedTableTransformerOptions>;
