import { PanelData } from "@grafana/data"
import getDatalatest from "GlobalFunctions/getDatalatest"
import { ElementOptions, GlobalTextSettings, SubElementOptions } from "types"

  export default function Visibility(text: boolean,data: PanelData,   type: string, element: ElementOptions|SubElementOptions, returnbool: Boolean, globaltextoptions?: GlobalTextSettings  ){
  if (type === 'subelement'){
   
    if (text){
  if (element?.textsettings?.visibility?.visible_query !=='static' ) {
    const rawVal = getDatalatest(element?.textsettings?.visibility?.visible_query|| '', data)
    const mode = element?.textsettings?.visibility?.visible_mode ?? 'threshold'
    let shouldHide = false
    if (mode === 'regex') {
      const rx = element?.textsettings?.visibility?.visible_regex ? new RegExp(element.textsettings?.visibility?.visible_regex) : null
      shouldHide = !!(rx && rx.test(String(rawVal)))
    } else {
      const numVal = Number(rawVal)
      const threshold = Number(element?.textsettings?.visibility?.visible_threshold_value ?? 0)
      const op = element?.textsettings?.visibility?.visible_threshold_op ?? '<'
      switch (op) {
        case '<':  shouldHide = numVal <  threshold; break
        case '<=': shouldHide = numVal <= threshold; break
        case '>':  shouldHide = numVal >  threshold; break
        case '>=': shouldHide = numVal >= threshold; break
        case '==': shouldHide = numVal === threshold; break
        case '!=': shouldHide = numVal !== threshold; break
      }
    }
    if (returnbool){
        return !shouldHide
    }
    else {
    return shouldHide ? 'hidden' : 'visible'}
  } else {
    if (element.textsettings.useGlobalTextSettings && globaltextoptions  ){
      if (globaltextoptions.textstatic) {
        return 'visible'
      } else {
        return 'hidden'
      }
      
    } else {
      if (element.textsettings.visibility.visible) {
        return 'visible'
      } else {
        return 'hidden'
      }

    }
  }
} else {
    if (element?.visibility?.visible_query !=='static' ) {
        const rawVal = getDatalatest(element?.visibility?.visible_query|| '', data)
        const mode = element?.visibility?.visible_mode ?? 'threshold'
        let shouldHide = false
        if (mode === 'regex') {
          const rx = element?.visibility?.visible_regex ? new RegExp(element.visibility?.visible_regex) : null
          shouldHide = !!(rx && rx.test(String(rawVal)))
        } else {
          const numVal = Number(rawVal)
          const threshold = Number(element?.visibility?.visible_threshold_value ?? 0)
          const op = element?.visibility?.visible_threshold_op ?? '<'
          switch (op) {
            case '<':  shouldHide = numVal <  threshold; break
            case '<=': shouldHide = numVal <= threshold; break
            case '>':  shouldHide = numVal >  threshold; break
            case '>=': shouldHide = numVal >= threshold; break
            case '==': shouldHide = numVal === threshold; break
            case '!=': shouldHide = numVal !== threshold; break
          }
        }
        return !shouldHide
      } else {
        return element.visibility?.visible
      }
}

} else {
    if (text){
        if (element?.textsettings?.visibility?.visible_query !=='static' ) {
          const rawVal = getDatalatest(element?.textsettings?.visibility?.visible_query|| '', data)
          const mode = element?.textsettings?.visibility?.visible_mode ?? 'threshold'
          let shouldHide = false
          if (mode === 'regex') {
            const rx = element?.textsettings?.visibility?.visible_regex ? new RegExp(element?.textsettings?.visibility?.visible_regex) : null
            shouldHide = !!(rx && rx.test(String(rawVal)))
          } else {
            const numVal = Number(rawVal)
            const threshold = Number(element?.textsettings?.visibility?.visible_threshold_value ?? 0)
            const op = element?.textsettings?.visibility?.visible_threshold_op ?? '<'
            switch (op) {
              case '<':  shouldHide = numVal <  threshold; break
              case '<=': shouldHide = numVal <= threshold; break
              case '>':  shouldHide = numVal >  threshold; break
              case '>=': shouldHide = numVal >= threshold; break
              case '==': shouldHide = numVal === threshold; break
              case '!=': shouldHide = numVal !== threshold; break
            }
          }
          if (returnbool){
            return !shouldHide
        } else {
          return shouldHide ? 'hidden' : 'visible'}
        } else {
          if (element?.textsettings?.useGlobalTextSettings && globaltextoptions) {
            return globaltextoptions.textstatic ? 'visible' : 'hidden'
          }
          return element.textsettings?.visibility?.visible ? 'visible' : 'hidden'
        }
      } else {
          if (element?.visibility?.visible_query !=='static' ) {
              const rawVal = getDatalatest(element?.visibility?.visible_query|| '', data)
              const mode = element?.visibility?.visible_mode ?? 'threshold'
              let shouldHide = false
              if (mode === 'regex') {
                const rx = element?.visibility?.visible_regex ? new RegExp(element?.visibility?.visible_regex) : null
                shouldHide = !!(rx && rx.test(String(rawVal)))
              } else {
                const numVal = Number(rawVal)
                const threshold = Number(element?.visibility?.visible_threshold_value ?? 0)
                const op = element?.visibility?.visible_threshold_op ?? '<'
                switch (op) {
                  case '<':  shouldHide = numVal <  threshold; break
                  case '<=': shouldHide = numVal <= threshold; break
                  case '>':  shouldHide = numVal >  threshold; break
                  case '>=': shouldHide = numVal >= threshold; break
                  case '==': shouldHide = numVal === threshold; break
                  case '!=': shouldHide = numVal !== threshold; break
                }
              }
              return !shouldHide
            } else {
              return element?.visibility.visible
            }
      }
}
  }
