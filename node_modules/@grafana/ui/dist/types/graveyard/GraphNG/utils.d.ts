import { DataFrame, Field, FieldConfig, FieldType, TimeRange } from '@grafana/data';
import { GraphFieldConfig } from '@grafana/schema';
import { XYFieldMatchers } from './types';
export declare function getRefField(frame: DataFrame, refFieldName?: string | null): Field<any> | undefined;
export declare function preparePlotFrame(frames: DataFrame[], dimFields: XYFieldMatchers, timeRange?: TimeRange | null): DataFrame | null;
export declare function buildScaleKey(config: FieldConfig<GraphFieldConfig>, fieldType: FieldType): string;
