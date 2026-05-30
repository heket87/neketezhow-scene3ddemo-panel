export default function setTransformMode(mode: string,setMode: React.Dispatch<any>){

    if (mode === "translate"){
    setMode("rotate")} else if (mode === "rotate"){
      setMode("scale")
    } else if (mode === "scale") {
        setMode("translate")
    }

}
