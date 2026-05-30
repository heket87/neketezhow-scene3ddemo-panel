import { PropsWithChildren, ReactElement } from 'react';
import { PluginMeta } from '../../types/plugin';
export type PluginContextProviderProps = {
    meta: PluginMeta;
};
export declare function PluginContextProvider(props: PropsWithChildren<PluginContextProviderProps>): ReactElement;
