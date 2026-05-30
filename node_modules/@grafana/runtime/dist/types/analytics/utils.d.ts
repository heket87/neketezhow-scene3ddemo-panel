import { MetaAnalyticsEventPayload } from './types';
/**
 * Helper function to report meta analytics to the {@link EchoSrv}.
 *
 * @public
 */
export declare const reportMetaAnalytics: (payload: MetaAnalyticsEventPayload) => void;
/**
 * Helper function to report pageview events to the {@link EchoSrv}.
 *
 * @public
 */
export declare const reportPageview: () => void;
/**
 * Helper function to report interaction events to the {@link EchoSrv}.
 *
 * @public
 */
export declare const reportInteraction: (interactionName: string, properties?: Record<string, unknown>) => void;
/**
 * Helper function to report experimentview events to the {@link EchoSrv}.
 *
 * @public
 */
export declare const reportExperimentView: (id: string, group: string, variant: string) => void;
