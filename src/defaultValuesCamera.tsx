import { CameraOptions } from "types";

export const defaultValuesCamera: CameraOptions = {
  id: 'perspective-camera',
  name: 'camera',
  type: 'PerspectiveCamera',
  enablecontrols: false,
  cameranear: '0.1',
  cameradistance: '100',
  cameraposx: '0',
  cameraposy: '0.5',
  cameraposz: '3',
  look_at_x: '0',
  look_at_y: '0',
  look_at_z: '0',
  fov: '60',
  camerafov: '60',
  aspect: '1.77',
  showresetcamerabutton: false,
  camera_reset_button_position: 'bottom-right',
  camera_reset_button_size: '36',
};
