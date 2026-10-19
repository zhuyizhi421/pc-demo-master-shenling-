import { ElMessage } from "element-plus"

import { isEffectiveValue } from "./common"

/**
 * 判断path是否为外链
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path: string): boolean {
  return /^(https?:|mailto:|tel:)/.test(path)
}

// 返回项目路径
export function getNormalPath(p: string): string {
  if (p.length === 0 || !p || p == "undefined") {
    return p
  }
  const res = p.replace("//", "/")
  if (res[res.length - 1] === "/") {
    return res.slice(0, res.length - 1)
  }
  return res
}

export function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c == "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function randomId() {
  return "_" + (new Date().valueOf() * Math.random()).toString(36).substr(2).replace(".", "")
}

export function timeIsOverlap(events: any, target: any): boolean {
  try {
    const timeline: any[] = []
    const Gap = 10 // 错开一点时间避免有的开始时间和结束重合后，判断为重合
    for (const event of events) {
      timeline.push([dayjs(event.beginTime).valueOf() + Gap, 1])
      timeline.push([dayjs(event.endTime).valueOf(), -1])
    }
    // Add target event
    timeline.push([dayjs(target.beginTime).valueOf() + Gap, 1])
    timeline.push([dayjs(target.endTime).valueOf(), -1])

    timeline.sort((a, b) => a[0] - b[0])

    let count = 0
    for (const [time, type] of timeline) {
      count += type
      if (count > 1) {
        return true
      }
    }
    return false
  } catch (e) {
    console.log("timeIsOverlap::error", e)
    return false
  }
}

export type PromiseType<T> = (args: any[]) => Promise<T>

export type UnPromisify<T> = T extends PromiseType<infer U> ? U : never

/**
 * @description: 用于检验时返回对应显示的内容，文本或者数值
 *
 */
export function getStandardString(inspectionStandard: {
  standardType: number
  standardDesc: string
  standardMaxInclusive: boolean
  standardMax: number | string
  standardMinInclusive: boolean
  standardMin: number | string
}) {
  try {
    if (inspectionStandard?.standardType) {
      const {
        standardType,
        standardDesc,
        standardMaxInclusive,
        standardMax,
        standardMinInclusive,
        standardMin
      } = inspectionStandard
      if (standardType === 2) {
        return standardDesc
      } else if (standardType === 1) {
        let str = ""
        if (!["undefined", "object"].includes(typeof standardMin) && standardMin !== "") {
          str += ` ${standardMin} ${standardMinInclusive ? "<=" : "<"} `
        }
        str += "n"
        if (!["undefined", "object"].includes(typeof standardMax) && standardMax !== "") {
          str += ` ${standardMaxInclusive ? "<=" : "<"} ${standardMax}`
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

/**
 * @description: 用于判断数值检验是否合理，不能空区间，允许单区间
 */
export function isNumberStandardValid(
  max: number | string | null | undefined,
  min: number | string | null | undefined,
  maxInclusive: boolean,
  minInclusive: boolean
) {
  if (!isEffectiveValue(max) && !isEffectiveValue(min)) {
    ElMessage.error("数值上限、下限必须有一个为有效值")
    return false
  } else if (isEffectiveValue(max) && isEffectiveValue(min)) {
    const _max = Number(max)
    const _min = Number(min)
    if (_min > _max) {
      ElMessage.error("最小值不能大于最大值")
      return false
    } else if (_min === _max) {
      if (!maxInclusive || !minInclusive) {
        ElMessage.error("不能为空区间")
        return false
      }
    }
  }

  return true
}

/**
 *
 *
 * 规范化检验标准数据，以免传给后端出问题
 */
export function modifyStandardData(inspectionStandard: {
  standardType: number
  standardDesc: string
  standardMaxInclusive: number
  standardMax: number
  standardMinInclusive: number
  standardMin: number
  unitId: string
}) {
  try {
    if (inspectionStandard?.standardType) {
      const { standardType, standardDesc, standardMax, standardMin } = inspectionStandard
      if (standardType === 2) {
        return {
          standardType,
          standardDesc
        }
      } else if (standardType === 1) {
        return {
          standardType,
          standardMax,
          standardMin,
          standardMaxInclusive: inspectionStandard.standardMaxInclusive,
          standardMinInclusive: inspectionStandard.standardMinInclusive,
          unitId: inspectionStandard.unitId
        }
      }
    }
  } catch (error) {
    /* empty */
  }
  return inspectionStandard
}

/** 计算文本内容宽度 */
export const getTextWidth = (() => {
  // 单例 Canvas 和 Context
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  return (
    text: string,
    fontSize = 14,
    fontFamily = "Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif"
  ) => {
    ctx!.font = `${fontSize}px ${fontFamily}`
    return ctx!.measureText(text).width
  }
})()

/** 获取动态表单label宽度 */
export const getDynamicFormLabelWidth = (
  label: string,
  options = {
    requiredIcon: true,
    placeholderLength: 2,
    fontSize: 14
  } as {
    requiredIcon?: boolean
    placeholderLength?: number
    fontSize?: number
  }
) => {
  const { requiredIcon = true, placeholderLength = 2, fontSize = 14 } = options

  const placeholder = "占".repeat(placeholderLength)
  const requiredIconWidth = requiredIcon ? 22 : 0
  const width = getTextWidth(label + placeholder, fontSize)
  return width + requiredIconWidth + "px"
}
