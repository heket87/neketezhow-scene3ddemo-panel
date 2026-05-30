import { DataFrame } from '@grafana/data';
type InsertMode = (prev: number, next: number, threshold: number) => number;
interface NullInsertOptions {
    frame: DataFrame;
    refFieldName?: string | null;
    refFieldPseudoMax?: number;
    refFieldPseudoMin?: number;
    insertMode?: InsertMode;
}
/** @deprecated */
export declare function applyNullInsertThreshold(opts: NullInsertOptions): DataFrame;
export {};
