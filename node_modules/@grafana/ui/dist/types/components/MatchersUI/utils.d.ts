import { DataFrame, Field, SelectableValue, FieldNamePickerBaseNameMode } from '@grafana/data';
/**
 * @internal
 */
export interface FrameFieldsDisplayNames {
    display: Set<string>;
    raw: Set<string>;
    fields: Map<string, Field>;
}
/**
 * @internal
 */
export declare function frameHasName(name: string | undefined, names: FrameFieldsDisplayNames): boolean;
/**
 * Returns the distinct names in a set of frames
 */
export declare function getFrameFieldsDisplayNames(data: DataFrame[], filter?: (field: Field) => boolean): FrameFieldsDisplayNames;
/**
 * @internal
 */
export declare function useFieldDisplayNames(data: DataFrame[], filter?: (field: Field) => boolean): FrameFieldsDisplayNames;
/**
 * @internal
 */
export declare function useSelectOptions(displayNames: FrameFieldsDisplayNames, currentName?: string, firstItem?: SelectableValue<string>, fieldType?: string, baseNameMode?: FieldNamePickerBaseNameMode): Array<SelectableValue<string>>;
