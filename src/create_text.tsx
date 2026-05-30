import { FieldConfigSource, PanelData, ScopedVars } from "@grafana/data"
import checkmappingoverride from "checkmapping"
import getDatalatest from "./GlobalFunctions/getDatalatest"

/**
 * Evaluates an expression inside {}.
 *
 * Supported syntax:
 *   {Value}              — raw value
 *   {Value * 1000}       — math: +  -  *  /  ^  %
 *   {Value:.2f}          — decimal format (2 places)
 *   {Value / 100:.1f}    — math + format combined
 */
function evaluateTextExpr(expr: string, data: PanelData, fieldconfig: FieldConfigSource): string {
  // Optional decimal format specifier at the end: ":.Nf" or ":Nf"
  let formatDecimals: number | null = null
  let mainExpr = expr
  const fmtMatch = expr.match(/:\.?(\d+)f$/)
  if (fmtMatch) {
    formatDecimals = parseInt(fmtMatch[1], 10)
    mainExpr = expr.slice(0, expr.lastIndexOf(':'))
  }

  // Optional math operation: "fieldName op number"  (lazy match so field name stops at first operator)
  const mathMatch = mainExpr.match(/^(.+?)\s*([+\-*\/^%])\s*([-\d.]+)$/)

  let rawValue: any
  let fieldName: string

  if (mathMatch) {
    fieldName = mathMatch[1].trim()
    const op = mathMatch[2]
    const operand = parseFloat(mathMatch[3])
    rawValue = getDatalatest(fieldName, data)
    const numVal = parseFloat(rawValue)
    if (!isNaN(numVal) && !isNaN(operand)) {
      switch (op) {
        case '+': rawValue = numVal + operand; break
        case '-': rawValue = numVal - operand; break
        case '*': rawValue = numVal * operand; break
        case '/': rawValue = operand !== 0 ? numVal / operand : rawValue; break
        case '^': rawValue = Math.pow(numVal, operand); break
        case '%': rawValue = operand !== 0 ? numVal % operand : rawValue; break
      }
    }
  } else {
    fieldName = mainExpr.trim()
    rawValue = getDatalatest(fieldName, data)
  }

  // Apply decimal formatting
  if (formatDecimals !== null) {
    const numVal = parseFloat(rawValue)
    if (!isNaN(numVal)) {
      rawValue = numVal.toFixed(formatDecimals)
    }
  }

  // Apply Grafana value mappings (pass the field name for byName/byRegexp matching)
  return checkmappingoverride(rawValue, fieldName, fieldconfig)
}

export default function create_text(
  text: String,
  replaceVariables: (value: string, scopedVars?: ScopedVars, format?: string | Function) => string,
  data: PanelData,
  fieldconfig: FieldConfigSource<any>
) {
  // First pass: Grafana template variables ($varName)
  let result = replaceVariables(String(text))

  // Second pass: data field substitutions with optional math / formatting
  result = result.replace(/\{[^}]*\}/g, function(match: string) {
    return evaluateTextExpr(match.slice(1, -1), data, fieldconfig)
  })

  return result
}
