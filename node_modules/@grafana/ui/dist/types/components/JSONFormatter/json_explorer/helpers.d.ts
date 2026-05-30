export declare function formatString(str: string): string;
export declare function isObject(value: unknown): boolean;
export declare function getObjectName(object: object): string;
export declare function getType(object: object): string;
export declare function getValuePreview(object: object, value: string): string;
export declare function getPreview(obj: object): string;
export declare function cssClass(className: string): string;
export declare function createElement<T extends keyof HTMLElementTagNameMap>(type: T, className?: string, content?: Element | string): HTMLElementTagNameMap[T];
