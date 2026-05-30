import { FieldConfigSource,PanelData } from "@grafana/data"
import getDatalatest from "../GlobalFunctions/getDatalatest"
import { Options, SubElementOptions } from "types"

/**
 * Returns the computed background color for the subelement text window.
 * Mirrors the logic of changecolor.tsx but for backtextcolor_* fields,
 * and returns a CSS color string instead of applying a material.
 */
export default function changesubtextbackgroundcolor(
  subelement: SubElementOptions,
  data: PanelData,
  fieldConfig: FieldConfigSource<any>,
  globaloptions: Options
): string {
  const baseColor = subelement.textsettings?.backtextcolor || ''
  if (!subelement.textsettings?.backtextcolor_enablequery || !subelement.textsettings?.backtextcolorquery) {
    return baseColor
  }

  const dataKey = String(subelement.textsettings?.backtextcolorquery)
  let resultcolor: any = 'defaultcolor'
  let matchoverride = false

  // ── Panel-level gradient ──────────────────────────────────────────────────
  if (
    subelement.textsettings?.backtextcolor_usegradient &&
    globaloptions.gradientcolor?.highvaluegradientcolor &&
    globaloptions.gradientcolor?.lowvaluegradientcolor
  ) {
    const gc = globaloptions.gradientcolor
    const hue =
      (((Number(getDatalatest(dataKey, data)) - Number(gc.lowvalueforgradient)) *
        (gc.highvaluegradientcolor!.h - gc.lowvaluegradientcolor!.h)) /
        (Number(gc.highvalueforgradient) - Number(gc.lowvalueforgradient))) +
      gc.lowvaluegradientcolor!.h
    return `hsl(${hue},${gc.highvaluegradientcolor!.s}%,${gc.highvaluegradientcolor!.l}%)`
  }

  // ── Threshold: field overrides ────────────────────────────────────────────
  const fieldName = dataKey.split(':')[1] || ''

  for (let kk = 0; kk < fieldConfig.overrides.length; kk++) {
    if (RegExp(fieldConfig.overrides[kk].matcher.options).test(fieldName)) {
      matchoverride = true
      for (let zz = 0; zz < fieldConfig.overrides[kk].properties.length; zz++) {
        if (fieldConfig.overrides[kk].properties[zz].id === 'thresholds') {
          const steps = fieldConfig.overrides[kk].properties[zz].value.steps
          thresloopover: for (let pf = steps.length - 1; pf >= 0; pf--) {
            if (Number(getDatalatest(dataKey, data)) >= Number(steps[pf].value)) {
              resultcolor = steps[pf].color
              break thresloopover
            }
          }
        }
      }
    }
  }

  // ── Threshold: panel defaults ─────────────────────────────────────────────
  if (!matchoverride && fieldConfig.defaults.thresholds) {
    const steps = fieldConfig.defaults.thresholds.steps
    thresloop: for (let kz = steps.length - 1; kz >= 0; kz--) {
      if (Number(getDatalatest(dataKey, data)) >= Number(steps[kz].value)) {
        resultcolor = steps[kz].color
        break thresloop
      }
    }
  }

  return resultcolor === 'defaultcolor' ? baseColor : resultcolor
}
