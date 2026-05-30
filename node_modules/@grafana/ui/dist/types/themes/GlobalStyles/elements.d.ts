import { GrafanaTheme2, ThemeTypographyVariant } from '@grafana/data';
export declare function getElementStyles(theme: GrafanaTheme2): import("@emotion/utils").SerializedStyles;
export declare function getVariantStyles(variant: ThemeTypographyVariant): {
    margin: number;
    fontSize: string;
    lineHeight: number;
    fontWeight: number;
    letterSpacing: string | undefined;
    fontFamily: string;
    marginBottom: string;
};
