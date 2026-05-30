import { DataFrame, EventBus } from '@grafana/data';
import { UPlotConfigBuilder } from '../config/UPlotConfigBuilder';
interface EventBusPluginProps {
    config: UPlotConfigBuilder;
    eventBus: EventBus;
    frame?: DataFrame;
}
/**
 * @alpha
 */
export declare const EventBusPlugin: ({ config, eventBus, frame }: EventBusPluginProps) => null;
export {};
