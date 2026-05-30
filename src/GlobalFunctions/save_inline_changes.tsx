import {   BufferGeometry, Euler, Material, Matrix4, Mesh, NormalBufferAttributes, Object3DEventMap, Quaternion, Vector3,   } from "three";
import { ElementOptions } from "types";


export default function save_inline_changes(l: Matrix4, deltaL: Matrix4,
  w: Matrix4, deltaW: Matrix4,
  el: ElementOptions,
  cuberef: React.MutableRefObject<Mesh<BufferGeometry<NormalBufferAttributes>, Material | Material[], Object3DEventMap>>,
  initscale: number[], 
){
    
    const position = new Vector3();
    const scale = new Vector3();
    const quaternion = new Quaternion()
    l.decompose(position, quaternion, scale);
    

    el.elementsizeX = String(scale.x * initscale[0])
    el.elementsizeY = String(scale.y * initscale[1])
    el.elementsizeZ = String(scale.z * initscale[2])


    const newEuler = new Euler()
     let rotationquanternion = new Quaternion()

    cuberef.current.getWorldQuaternion(rotationquanternion)

  

    newEuler.setFromQuaternion(rotationquanternion)

    
    // el.elementsizeX = String(scale.x + Number(el.elementsizeX)) 
    // el.elementsizeY = String(scale.y + Number(el.elementsizeY))
    // el.elementsizeZ = String(scale.z + Number(el.elementsizeZ))
    
    el.rotationx = String(newEuler.x*180/Math.PI)
    el.rotationy = String(newEuler.y*180/Math.PI)
    el.rotationz = String(newEuler.z*180/Math.PI)
    
     
  }
