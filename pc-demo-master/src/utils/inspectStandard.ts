export const typeNumberHandle = (
  inspectionStandard: {
    standardType: number
    standardDesc: string
    standardMaxInclusive: boolean | number
    standardMax: number | string | null
    standardMinInclusive: boolean | number
    standardMin: number | string | null
    quantitativeMode?: "lower" | "upper" | "range"
    standardValue?: number | string | null
    upperTolerance?: number | string | null
    lowerTolerance?: number | string | null
    upperToleranceSign?: "+" | "-"
    lowerToleranceSign?: "+" | "-"
    unitName?: string
  },
  showUnitName: boolean = false
) => {
  try {
    if (inspectionStandard?.standardType) {
      const {
        standardType,
        standardDesc,
        standardMaxInclusive,
        standardMax,
        standardMinInclusive,
        standardMin,
        unitName
      } = inspectionStandard
      if (standardType === 2) {
        return standardDesc
      } else if (standardType === 1) {
        const unitSuffix = showUnitName ? unitName || "" : ""
        const hasMin = !["undefined", "object"].includes(typeof standardMin) && standardMin !== ""
        const hasMax = !["undefined", "object"].includes(typeof standardMax) && standardMax !== ""
        const hasStandardValue =
          !["undefined", "object"].includes(typeof inspectionStandard.standardValue) &&
          inspectionStandard.standardValue !== ""
        const hasUpperTolerance =
          !["undefined", "object"].includes(typeof inspectionStandard.upperTolerance) &&
          inspectionStandard.upperTolerance !== ""
        const hasLowerTolerance =
          !["undefined", "object"].includes(typeof inspectionStandard.lowerTolerance) &&
          inspectionStandard.lowerTolerance !== ""

        if (inspectionStandard.quantitativeMode === "lower" && hasMin) {
          return `${standardMinInclusive ? ">=" : ">"} ${standardMin}${unitSuffix}`
        }

        if (inspectionStandard.quantitativeMode === "upper" && hasMax) {
          return `${standardMaxInclusive ? "<=" : "<"} ${standardMax}${unitSuffix}`
        }

        if (
          inspectionStandard.quantitativeMode === "range" &&
          hasStandardValue &&
          hasUpperTolerance &&
          hasLowerTolerance
        ) {
          const upperSign = inspectionStandard.upperToleranceSign || "+"
          const lowerSign = inspectionStandard.lowerToleranceSign || "-"
          return `${inspectionStandard.standardValue} ${upperSign}${inspectionStandard.upperTolerance}/${lowerSign}${inspectionStandard.lowerTolerance}${unitSuffix}`
        }

        let str = ""
        if (hasMin) {
          str += ` ${standardMin}${unitSuffix} ${standardMinInclusive ? "<=" : "<"} `
        }
        str += "n"
        if (hasMax) {
          str += ` ${standardMaxInclusive ? "<=" : "<"} ${standardMax}${unitSuffix}`
        }
        return str
      }
    }
    return ""
  } catch (error) {
    console.log("getStandardString::error", error)
  }
  return ""
}
