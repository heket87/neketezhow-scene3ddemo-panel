import { PanelOptionsEditorBuilder} from '@grafana/data';

import { Options } from './types';





import { CameraEditor } from './Editors/EditorCameras';
import { ColorEditor } from './Editors/ColorDimensionEditor';
import { ElementsEditor } from './Editors/ElementsEditor';



import { defaultValuesCamera } from 'defaultValuesCamera';
import { defaultValuesElement } from 'defaultValuesElement';
import { CommonGradient } from 'Editors/CommonGradientEditor';
import { GlobalTextEditor } from 'Editors/GlobalTextEditor';
import { LinksDefaultValue, LinksEditor } from 'Editors/LinksEditor';

//import { ColorDimensionEditor } from 'ColorDimensionEditor';




//import {NumberInput} from 'NumberInput'



export function addEditor(builder: PanelOptionsEditorBuilder<Options>) {
  
  builder

 
 
      
    
    .addCustomEditor({
      id: 'elements',
      path: 'elements',
      name: 'Elements Configuration',
      defaultValue: [defaultValuesElement],
      editor: ElementsEditor,
    })
    
    .addBooleanSwitch({
      path: 'enable_links',
      name: 'Add fast links list'
      
    })
    .addSelect({
      path: 'links_position',
      name: 'Fast links list position',
      defaultValue: 'bottom-right',
      showIf: c => c.enable_links,
      settings: {
        options: [
          { value: 'top-left',     label: 'Top-left' },
          { value: 'top-right',    label: 'Top-right' },
          { value: 'bottom-left',  label: 'Bottom-left' },
          { value: 'bottom-right', label: 'Bottom-right' },
        ],
      },
    })
    .addSelect({
      path: 'links_size',
      name: 'Fast links list size',
      defaultValue: 'small',
      showIf: c => c.enable_links,
      settings: {
        options: [
          { value: 'small',     label: 'small' },
          { value: 'medium',    label: 'medium' },
          { value: 'large',  label: 'large' }
  
        ],
      },
    })
    .addCustomEditor({
      id: 'links_color',
      category: ['Canvas'],
      path: 'links_color',
      name: 'Font color of links list',
      editor: ColorEditor,
      defaultValue: '#ccccdc',
      showIf: c => c.enable_links
    })
    .addCustomEditor({
      id: 'links_bgcolor',
      category: ['Canvas'],
      path: 'links_bgcolor',
      name: 'Background color of links list',
      editor: ColorEditor,
      defaultValue: '#00000008',
      showIf: c => c.enable_links
    })
    .addCustomEditor({
      id: 'links_bordercolor',
      category: ['Canvas'],
      path: 'links_bordercolor',
      name: 'Borders color of links list',
      editor: ColorEditor,
      defaultValue: '#ffffff00',
      showIf: c => c.enable_links
    })

    .addTextInput({
      path: 'links_borderwidth',
      name: 'Borders width of links list',
      category: ['Canvas'],
      defaultValue: '0.1',
      showIf: c => !!c.enable_links,
    })
    .addCustomEditor({
      id: 'links',
      path: 'links',
      name: 'Fast links settings',
      
      defaultValue: [LinksDefaultValue],
      editor: LinksEditor,
      showIf: c => c.enable_links,

    })


    .addCustomEditor({
      id: 'cameras',
      path: 'cameras',
      name: 'Camera settings',
      
      defaultValue: [defaultValuesCamera],
      editor: CameraEditor,

    })
    .addBooleanSwitch({
      path: 'changebackgroundcolor',
      name: 'Change background color',
      category: ['Canvas'],
      showIf: c => !c.usebackgroundimage
    })
    .addBooleanSwitch({
      path: 'usebackgroundimage',
      name: 'Use background image',
      category: ['Canvas'],
      showIf: c => !c.changebackgroundcolor
    })
    .addTextInput({
      path: 'imageurl',
      name: 'Image path',
      category: ['Canvas'],
      showIf: c => c.usebackgroundimage
    })

    .addCustomEditor({
      id: 'backgroundcolor',
      category: ['Canvas'],
      path: 'backgroundcolor',
      name: 'Background color',
      editor: ColorEditor,
      defaultValue: '',
      showIf: c => c.changebackgroundcolor
    })

    .addCustomEditor({
      id: 'ambient_light_color',
      category: ['Lighting'],
      path: 'ambient_light_color',
      name: 'Default ambient light color',
      editor: ColorEditor,
      defaultValue: '#ffffff',
    })
    .addNumberInput({
      path: 'ambient_light_intensity',
      name: 'Default ambient light intensity',
      description: 'Controls the built-in ambient light that is always present in the demo scene.',
      category: ['Lighting'],
      defaultValue: 1,
      settings: {
        min: 0,
        step: 0.1,
      },
    })

 
    .addBooleanSwitch({
      path: 'canvas_antialias',
      name: 'Antialiasing (MSAA)',
      description: 'Disabling improves FPS significantly, especially on HiDPI screens. Requires page reload.',
      category: ['Canvas'],
      defaultValue: true,
    })
    .addSelect({
      path: 'canvas_power_preference',
      name: 'GPU power preference',
      description: 'high-performance forces the dedicated GPU on dual-GPU systems (biggest FPS gain on laptops)',
      category: ['Canvas'],
      defaultValue: 'default',
      settings: {
        options: [
          { value: 'default',          label: 'Default' },
          { value: 'high-performance', label: 'High performance (dedicated GPU)' },
          { value: 'low-power',        label: 'Low power (integrated GPU)' },
        ],
      },
    })
    .addBooleanSwitch({
      path: 'use_dynamic_dpr',
      name: 'Dynamic DPR',
      description: 'Lower DPR while camera moves (performance), restore on stop (quality)',
      category: ['Canvas'],
      defaultValue: false,
    })
    .addNumberInput({
      path: 'dpr_moving',
      name: 'DPR while moving',
      description: 'Device pixel ratio during camera movement (e.g. 1)',
      category: ['Canvas'],
      defaultValue: 1,
      showIf: c => (c.use_dynamic_dpr && !c.canvas_adaptive_dpr),
    })
    .addNumberInput({
      path: 'dpr_idle',
      name: 'DPR at rest',
      description: 'Device pixel ratio when camera stops (e.g. 1.5 or 2)',
      category: ['Canvas'],
      defaultValue: 1.5,
      showIf: c => (c.use_dynamic_dpr && !c.canvas_adaptive_dpr),
    })
    .addBooleanSwitch({
      path: 'canvas_adaptive_dpr',
      name: 'Adaptive DPR (auto)',
      description: 'Automatically lower DPR when FPS drops, restore when FPS recovers',
      category: ['Canvas'],
      defaultValue: false,
    })
    .addNumberInput({
      path: 'canvas_adaptive_dpr_min',
      name: 'Adaptive DPR minimum factor',
      description: 'Minimum quality factor (0.5 = half DPR). Lower = more FPS, less quality.',
      category: ['Canvas'],
      defaultValue: 0.5,
      showIf: c => c.canvas_adaptive_dpr,
    })
    .addBooleanSwitch({
      path: 'add_debug',
      name: 'Add debug',
      category: ['Canvas'],
     
    })

    .addBooleanSwitch({
      path: 'add_pivot_controls',
      name: 'Add control elements',
       defaultValue: false,
      category: ['Canvas'],
    })
    .addTextInput({
      path: 'controlsize',
      name: 'Size of control elements',
      category: ['Canvas'],
      showIf: c => c.add_pivot_controls
    })
.addCustomEditor({
      id: 'globaltext',
      path: 'globaltext',
      name: 'Global text settings',
      defaultValue: { textsize: '14', textcolor: '#ffffff', textmaxwidth: '200', show_if_condition_match: true,
        textstatic: false, backtextcolor: 'transparent', bordersfortextcolor: '#ffffff', bordersfortextwidth: '0' },
      editor: GlobalTextEditor,
    })
    .addSelect({
      path: 'helpwindow_position',
      name: 'Help-info panel position',
      description: 'Corner where the auxiliary info panel appears when hovering over elements with "Help window" enabled',
      defaultValue: 'top-right',
      settings: {
        options: [
          { value: 'top-left',     label: 'Top-left' },
          { value: 'top-right',    label: 'Top-right' },
          { value: 'bottom-left',  label: 'Bottom-left' },
          { value: 'bottom-right', label: 'Bottom-right' },
        ],
      },
    })
    .addTextInput({
      path: 'helpwindow_size',
      name: 'Help info size',
      description: 'size of help info (any html units)'
    })
    .addBooleanSwitch({
      path: 'add_common_gradient',
      name: 'Add gradient'
      
    })
      .addCustomEditor({
      id: 'gradientcolor',
      path: 'gradientcolor',
      name: 'Gradient settings',
      
      defaultValue: {position: 'top-right',marginx: '0', marginy: '0',size: '2',
        points_size: '2'
      },
      showIf: c => c.add_common_gradient,
      editor: CommonGradient
    })


}
