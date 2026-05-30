import { Field } from '../../types/dataFrame';
import { FieldMatcherInfo, FrameMatcherInfo } from '../../types/transformations';
export declare const alwaysFieldMatcher: (field: Field) => boolean;
export declare const notTimeFieldMatcher: (field: Field) => boolean;
export declare function getFieldPredicateMatchers(): FieldMatcherInfo[];
export declare function getFramePredicateMatchers(): FrameMatcherInfo[];
