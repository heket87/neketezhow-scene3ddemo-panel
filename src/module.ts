import { PanelPlugin } from '@grafana/data';
import { Scene3D } from './scene3d';
import { addEditor } from './editor';
import { Options } from './types';

export const plugin = new PanelPlugin<Options>(Scene3D);

plugin.useFieldConfig({
  }).setPanelOptions((builder) => addEditor(builder));
