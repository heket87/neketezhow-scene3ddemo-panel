import {  Group,  Object3DEventMap, Vector3 } from "three";
import { ElementOptions } from "types";

export default function save_inline_position(pivotref: React.RefObject<Group<Object3DEventMap>>,
    el: ElementOptions,
   
){
    let target = new Vector3()
    pivotref.current?.getWorldPosition(target)
    
    el.elementaxisx = String(target.x)
    el.elementaxisy = String(target.y)
    el.elementaxisz = String(target.z)

}
