import { Dimension, Dimensions, TimeZone } from '@grafana/data';
import { ActiveDimensions } from '../../../components/VizTooltip';
/** @deprecated */
export interface GraphDimensions extends Dimensions {
    xAxis: Dimension<number>;
    yAxis: Dimension<number>;
}
/** @deprecated */
export interface GraphTooltipContentProps {
    dimensions: GraphDimensions;
    activeDimensions: ActiveDimensions<GraphDimensions>;
    timeZone?: TimeZone;
}
