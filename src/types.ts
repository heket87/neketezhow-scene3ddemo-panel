import { HslColor } from "react-colorful";
import { PerspectiveCamera } from "three";

export type TransformMode = "translate" | "rotate" | "scale";
export type ViewBindableCamera = PerspectiveCamera;

export interface CenterPosition {
  x: string;
  y: string;
  data?: string;
}

export interface CenterPosition3d {
  x: string;
  y: string;
  z: string;
  data?: string;
  usegradient?: boolean;
}

export interface GradientPoint {
  x: number;
  y: number;
  data: number;
  lowvalue: number;
  highvalue: number;
  lowvaluecolor: HslColor;
  highvaluecolor: HslColor;
}

export interface LinksOptions {
  name?: string;
  link?: string;
  open_in_current?: boolean;
}

export interface BevelSettings {
  bevelEnabled: boolean;
  steps: string;
  bevelThickness: string;
  bevelSize: string;
  beveloffset: string;
  bevelSegments: string;
}

export interface VisibilitySettings {
  visible_mode?: "regex" | "threshold";
  visible_threshold_value?: string;
  visible_threshold_op?: string;
  visible_query?: string;
  visible?: boolean;
  visible_regex?: string;
}

export type Line3DLinkedElement = {
  elementId?: string;
  data?: string;
  usegradient?: boolean;
};

export interface ElementOptions {
  id: string;
  name?: string;
  type?: string;
  value?: string;
  color?: string;
  opacity?: string;

  visibility?: VisibilitySettings;
  enablecolorquery?: boolean;
  colorquery?: string;

  position_mode?: "manual" | "reference";
  position_reference_target_id?: string;
  position_offsetx?: string | number;
  position_offsety?: string | number;
  position_offsetz?: string | number;

  elementaxisx?: string;
  elementaxisy?: string;
  elementaxisz?: string;
  rotationx?: string;
  rotationy?: string;
  rotationz?: string;
  elementsizeX?: string;
  elementsizeY?: string;
  elementsizeZ?: string;
  radiuis?: string;
  segmentswidth?: string;
  segmentsheight?: string;
  useelementsizeXquery?: boolean;
  useelementsizeYquey?: boolean;
  useelementsizeZquey?: boolean;
  useelementsradiusquey?: boolean;

  points?: CenterPosition[];
  center?: CenterPosition;
  points3d?: CenterPosition3d[];
  line3d_radius_query?: string;
  line3d_radius?: string;
  line3d_tube_segments?: string;
  line3d_radial_segments?: string;
  line3d_closed?: boolean;
  line3d_smooth?: boolean;
  line3d_set_points_manually?: boolean;
  line3d_connected_elements?: Line3DLinkedElement[];

  elementurl?: string;
  traverse?: boolean;
  subelements?: SubElementOptions[];

  gradientcolor?: GradientColor;
  usegradient?: boolean;

  bordersforelement?: boolean;
  bordersforelementwidth?: string;
  bordersforelementcolor?: string;
  double_side?: boolean;

  make_clikable?: boolean;
  open_in_current?: boolean;
  link?: string;
  hover?: boolean;
  hovercolor?: string;
  helpwindow?: boolean;
  addText?: boolean;
  textsettings?: TextSettings;
  text_of_element_width?: string;

  enablecenter?: boolean;
  keybind?: string;
  bevel?: BevelSettings;
  font?: string;
  fontsize?: string;
  font_aligh?: string;
  smooth?: string;
  lineHeight?: string;
  letterSpacing?: string;
  center_grid_color?: string;
  extrudex?: boolean;
  extrudey?: boolean;
  extrudez?: boolean;
}

export interface SubElementOptions {
  name?: string;
  color?: string;
  value?: string;
  opacity?: string;
  visibility?: VisibilitySettings;
  changesubcolor?: boolean;
  enablecolorquery?: boolean;
  colorquery?: string;
  usegradient?: boolean;
  double_side?: boolean;
  use_query_for_visible?: boolean;
  addText?: boolean;
  textsettings?: TextSettings;
  excludefromhover?: boolean;
  clickable?: boolean;
  link?: string;
  open_in_current?: boolean;
  return_to_base_color?: boolean;
}

export interface Subs {
  name: string;
}

export interface AxesHelper {
  position: any;
  marginx: string;
  marginy: string;
  size: string;
  points_size: string;
}

export interface GradientColor {
  lowvalueforgradient?: string;
  highvalueforgradient?: string;
  gradientsaturation?: string;
  gradinetlightnes?: string;
  points?: CenterPosition[];
  gradientstep?: string;
  width?: string;
  height?: string;
  opacity?: string;
  lowvaluegradientcolor?: HslColor;
  highvaluegradientcolor?: HslColor;
  gradienttype?: string;
  krigingRange?: string;
  krigingNugget?: string;
  krigingSill?: string;
  rbfFunction?: string;
  rbfEpsilon?: string;
  rbfSmooth?: string;
  show_legend?: boolean;
  legend_position?: string;
  legend_steps?: string;
  legend_width?: string;
  legend_height?: string;
  legend_title?: string;
}

export interface GlobalTextSettings {
  use_real_center_for_text?: boolean;
  textsize?: string;
  textcolor?: string;
  textmaxwidth?: string;
  textstatic?: boolean;
  bordersfortextwidth?: string;
  bordersfortextcolor?: string;
  backtextcolor?: string;
  show_if_condition_match?: boolean;
  leader_line?: boolean;
  leader_line_color_custom?: boolean;
  leader_line_color?: string;
  leader_line_width?: string;
}

export interface TextSettings {
  use_real_center_for_text?: boolean;
  useGlobalTextSettings: boolean;
  textsize?: string;
  textcolor?: string;
  textmaxwidth?: string;
  text?: string;
  backtextcolor?: string;
  backtextcolor_enablequery?: boolean;
  backtextcolorquery?: string;
  backtextcolor_usegradient?: boolean;
  textpositionx?: string;
  textpositiony?: string;
  textpositionz?: string;
  textstatic?: boolean;
  bordersfortext?: boolean;
  bordersfortextwidth?: string;
  bordersfortextcolor?: string;
  visibility?: VisibilitySettings;
  leader_line?: boolean;
  leader_line_color_custom?: boolean;
  leader_line_color?: string;
  leader_line_width?: string;
  text_make_clickable?: boolean;
  text_link?: string;
  text_open_in_current?: boolean;
  show_if_condition_match?: boolean;
}

export interface Options {
  add_pivot_controls?: boolean;
  add_common_gradient?: boolean;
  add_global_text?: boolean;
  helpwindow_position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  helpwindow_size?: "string";
  globaltext?: GlobalTextSettings;
  gradientcolor?: GradientColor;

  usebackgroundimage?: boolean;
  imageurl?: string;
  changebackgroundcolor?: boolean;
  backgroundcolor?: string;
  ambient_light_color?: string;
  ambient_light_intensity?: number;
  elements?: ElementOptions[];
  controlsize?: string;
  orientation?: string;
  enablecontrols?: boolean;
  cameras?: CameraOptions[];
  add_debug?: boolean;
  use_dynamic_dpr?: boolean;
  dpr_moving?: number;
  dpr_idle?: number;
  canvas_antialias?: boolean;
  canvas_power_preference?: string;
  canvas_adaptive_dpr?: boolean;
  canvas_adaptive_dpr_min?: number;
  enable_links?: boolean;
  links?: LinksOptions[];
  links_position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  links_size?: "small" | "medium" | "large";
  links_color?: string;
  links_bgcolor?: string;
  links_bordercolor?: string;
  links_borderwidth?: string;
}

export interface CameraOptions {
  id?: string;
  name: string;
  type: "PerspectiveCamera";
  enablecontrols: boolean;
  cameranear: string;
  cameradistance: string;
  cameraposx: string;
  cameraposy: string;
  cameraposz: string;
  look_at_x: string;
  look_at_y: string;
  look_at_z: string;
  fov: string;
  camerafov?: string;
  aspect: string;
  AxesHelper?: AxesHelper;
  add_axis_helper?: boolean;
  showresetcamerabutton?: boolean;
  camera_reset_button_position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  camera_reset_button_size?: string;
}
