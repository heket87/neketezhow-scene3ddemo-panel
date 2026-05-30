import { Html } from "@react-three/drei";
import React from "react";
import { useThree } from "@react-three/fiber";


export default function StatPanel({canvas}: {canvas: React.RefObject<HTMLCanvasElement>}){
    const {gl} = useThree()
    const debugInfo = gl.extensions.get('WEBGL_debug_renderer_info');
    let vendor = gl.getContext().getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
    let model = gl.getContext().getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
    let width = Number(canvas.current?.offsetWidth)/2
    let height = Number(canvas.current?.offsetHeight)/2
    return (<Html position={[0,height/2,0]}><pre style={{overflowWrap: 'break-word',  whiteSpace: 'pre-line', width: width}}>model: {model} {"\n"}
    vendor: {vendor}
</pre></Html>)
}
