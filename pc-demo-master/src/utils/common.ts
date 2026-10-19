import { ElMessage } from "element-plus"

import { getMockSharedBaseUrl, isModuleMockEnabled } from "@/utils/moduleMockEnv"

/**
 * @method 精度转换
 * @params number 需转换的数字(string 或 number) decimalNumber 小数保留位数
 * @returns 转化后数字的字符串
 */
// export const precisionConversion = (number: number | string, decimalNumber: number | string) => {
//   return (
//     Math.round((Number(number) || 0) * Math.pow(10, Number(decimalNumber) || 0)) /
//     Math.pow(10, Number(decimalNumber) || 0)
//   )
// }

export const precisionConversion = (
  number: number | string,
  decimalNumber: number,
  isFixed: boolean = true
) => {
  const factor = 10 ** (decimalNumber ?? 0)
  const num = Math.round((Number(number) || 0) * factor) / factor
  return isFixed ? num.toFixed(decimalNumber ?? 0) : num.toString()
}

/** 下载文件
 * @params res 响应对象
 */
export const downloadFile = (res: any) => {
  const dispositionHeader = res.headers["content-disposition"]
  const fileNameMatch = dispositionHeader.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\n]*)/i)
  let fileName = fileNameMatch && fileNameMatch[1]
  if (fileName) {
    fileName = decodeURIComponent(fileName)
    const a = document.createElement("a")
    a.href = URL.createObjectURL(res.data)
    a.style.display = "none"
    document.body.appendChild(a)
    a.download = fileName
    a.click()
    document.body.removeChild(a)
  }
}

const imageEnvPath = import.meta.env.VITE_IMAGE_PATH

export const getImageEnvPath = () => {
  return imageEnvPath
}

const localKeyByProductName = import.meta.env.VITE_PRODUCT_NAME

export const getLocalKeyByProjectName = () => {
  return localKeyByProductName
}

/** 图片路径格式化，拼接通用前缀，用于显示预览 */
export const formatImgUrlPreview = (url: string) => {
  if (!url) {
    return ""
  }

  if (url.startsWith("http") || url.startsWith("data:")) {
    return url
  }
  if (isModuleMockEnabled() && url.startsWith("/mock-upload/")) {
    return `${getMockSharedBaseUrl()}${url}`
  }
  return imageEnvPath + url
}

/** 图片路径格式化，去除通用前缀，提交到后端 */
export const formatImgUrlSubmit = (url: string) => {
  if (!url) {
    return ""
  }

  if (url.startsWith(imageEnvPath)) {
    return url.replace(imageEnvPath, "")
  }
  return url
}

/** 百分比格式化 */
export const formatPercent = (num: number | string) => {
  if (num || num === 0 || num === "0") {
    return num + "次"
  }
  return ""
}

export const validateInput = (inputValue: string | number, integerLen = 6, decimalsLen = 2) => {
  const validateNum = JSON.parse(JSON.stringify(inputValue)).toString()
  // 移除非数字和小数点之外的字符
  let inputValue2
  if (decimalsLen == 0) {
    inputValue2 = validateNum.replace(/[^\d]/g, "")
  } else {
    inputValue2 = validateNum.replace(/[^\d.]/g, "").replace(/^\./g, "")
  }
  // 确保小数点只出现一次
  const dotIndex = inputValue2.indexOf(".")
  if (dotIndex !== -1 && inputValue2.indexOf(".", dotIndex + 1) !== -1) {
    inputValue2 =
      inputValue2.slice(0, dotIndex + 1) + inputValue2.slice(dotIndex + 1).replace(".", "")
  }

  // 限制整数部分为6位，小数部分为2位
  const parts = inputValue2.split(".")
  if (parts[0].length) {
    parts[0] = Number(parts[0]).toString()
  }
  if (parts[0].length > integerLen) {
    parts[0] = parts[0].slice(0, integerLen)
  }
  if (parts.length > 1 && parts[1].length > decimalsLen) {
    parts[1] = parts[1].slice(0, decimalsLen)
  }

  // 合并整数和小数部分
  return parts.join(".")
}

/**
 * 判断值是否有意义
 * 即：undefined、null、""、NaN属于无意义值，其余值均有意义
 *  */
export const isEffectiveValue = (value: any) => {
  return !!value || value === 0 || value === false
}

// 获取一天的结束时间
export const getEndOfDay = (date?: string | number | Date): string => {
  // 如果没有传入参数，使用当前日期
  const targetDate = date ? new Date(date) : new Date()

  // 设置时间为23:59:59
  targetDate.setHours(23, 59, 59, 999)

  // 格式化日期
  const year = targetDate.getFullYear()
  const month = String(targetDate.getMonth() + 1).padStart(2, "0")
  const day = String(targetDate.getDate()).padStart(2, "0")
  const hours = String(targetDate.getHours()).padStart(2, "0")
  const minutes = String(targetDate.getMinutes()).padStart(2, "0")
  const seconds = String(targetDate.getSeconds()).padStart(2, "0")

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

export const sleep = (time: number) => {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      clearTimeout(timer)
      resolve(true)
    }, time)
  })
}

/**
 * 计算日期
 * @param type 类型
 * @param value 值
 */
export const calculateDate = (
  type: "day" | "week" | "month" | "year",
  value: number | [number, number]
): Date | [Date, Date] => {
  const now = new Date()

  // 获取时间单位对应的天数
  const getDaysByType = (type: "day" | "week" | "month" | "year") => {
    switch (type) {
      case "day":
        return 1
      case "week":
        return 7
      case "month":
        return 30
      case "year":
        return 365
      default:
        return 1
    }
  }

  const daysPerUnit = getDaysByType(type)

  // 创建日期的辅助函数
  const createDate = (value: number, isEnd: boolean = false): Date => {
    const date = new Date(now)
    const totalDays = value * daysPerUnit

    // 对于非day类型，第一个值或单值需要往后一天
    if (type !== "day" && !isEnd) {
      date.setDate(date.getDate() + totalDays + 1)
    } else {
      date.setDate(date.getDate() + totalDays)
    }

    if (isEnd) {
      // 结束日期设置为23:59:59
      date.setHours(23, 59, 59, 999)
    } else {
      // 开始日期设置为00:00:00
      date.setHours(0, 0, 0, 0)
    }

    return date
  }

  // 处理单个值的情况
  if (typeof value === "number") {
    return createDate(value)
  }

  // 处理数组值的情况（日期范围）
  if (Array.isArray(value)) {
    if (value.length === 2) {
      const [startValue, endValue] = value
      const startDate = createDate(startValue, false)
      const endDate = createDate(endValue, true)
      return [startDate, endDate]
    } else if (value.length === 1) {
      return createDate(value[0])
    }
  }

  // 默认返回今天
  return createDate(0)
}

/**
 * 防止重复点击
 * @param fn 执行函数
 * @param args 执行函数参数收集
 */
export const onPreventReClick = <T extends unknown[]>(
  fn: (...args: T) => void,
  ...args: T
): (() => void) => {
  let isExecution = false
  if (typeof fn === "function") {
    const callback = async () => {
      if (isExecution) {
        ElMessage({
          type: "warning",
          message: "请勿重复操作",
          grouping: true
        })
        return
      }

      isExecution = true
      try {
        await fn(...args)
      } finally {
        isExecution = false
      }
    }

    return callback
  }
  return () => {}
}
