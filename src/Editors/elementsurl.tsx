import { ElementOptions } from "types";

export default function set_elements_url(el: ElementOptions[]){
    let urls: string[] = []
    el.map((element)=>{
        urls.push(String(element.elementurl))
    })
    return urls
}
