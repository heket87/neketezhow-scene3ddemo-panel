import { ElementOptions } from "types";

export default function set_elements_material_urls(el: ElementOptions[]){
    let urls: string[] = []
    el.map((element)=>{
        urls.push(String(element.elementurl))
    })
    return urls
}
