import { GrafanaTheme2 } from '@grafana/data';
import { CompletionItemGroup, CompletionItem } from '../types/completion';
export declare const flattenGroupItems: (groupedItems: CompletionItemGroup[]) => CompletionItem[];
export declare const calculateLongestLabel: (allItems: CompletionItem[]) => string;
export declare const calculateListSizes: (theme: GrafanaTheme2, allItems: CompletionItem[], longestLabel: string) => {
    listWidth: number;
    listHeight: number;
    itemHeight: number;
};
export declare const calculateItemHeight: (longestLabelHeight: number, theme: GrafanaTheme2) => number;
export declare const calculateListWidth: (longestLabelWidth: number, theme: GrafanaTheme2) => number;
export declare const calculateListHeight: (itemHeight: number, allItems: CompletionItem[]) => number;
