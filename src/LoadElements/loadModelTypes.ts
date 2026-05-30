import { MeshStandardMaterial } from "three";

export interface subelement {
  name: string;
  uuid: string;
  material: any;
  positionx: number;
  positiony: number;
  positionz: number;
  addtext: boolean;
  defmat: MeshStandardMaterial;
  text?: string;
  textsize?: string;
  textwidth?: string;
  textcolor?: string;
  borderWidth?: string;
  bordercolor?: string;
  backgroundColor?: string;
}
