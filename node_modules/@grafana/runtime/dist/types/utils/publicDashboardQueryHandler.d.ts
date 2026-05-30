import { Observable } from 'rxjs';
import { DataQuery, DataQueryRequest, DataQueryResponse } from '@grafana/data';
export declare function publicDashboardQueryHandler(request: DataQueryRequest<DataQuery>): Observable<DataQueryResponse>;
