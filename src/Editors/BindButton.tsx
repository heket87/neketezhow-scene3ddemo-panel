import { Button, Field, Input } from "@grafana/ui"
import { CollapsElement } from "./Collapsesible"
import React from "react"
import { ElementOptions } from "types"

   export default function BindButton({b, value, onChange}: {
    b: ElementOptions, value: ElementOptions[], onChange: any
   }){
   const [listening, setListening] = React.useState(false)

    const [pressedKey, setPressedKey] = React.useState<string | null>(null)
    
    React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (listening) {
        setPressedKey(e.key)
        setListening(false)
      }
    }

    if (listening) {
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [listening])
  return             <CollapsElement label={"Button for editing"}>
            <Field label={"Key to edit element"}>
              <>
              <Button         onClick={() => {
          setPressedKey(null)
          setListening(true)
        }}
 >Click to assign key</Button>
              {listening && <p>Waiting for key press...</p>}
              
              <Input value={pressedKey || String(b.keybind)}/>

              <Button onClick={()=>{b.keybind = String(pressedKey); onChange(value) }} icon="save">Apply</Button>
              </></Field>
            </CollapsElement>
}
