import { CodeType, CodeTypeToNameMap } from "@/api/code"

export const separatorTypeOptions = [
  {
    label: "-",
    value: "-"
  },
  {
    label: "_",
    value: "_"
  },
  {
    label: ".",
    value: "."
  },
  {
    label: "/",
    value: "/"
  },
  {
    label: "!",
    value: "!"
  },
  {
    label: "@",
    value: "@"
  },
  {
    label: "空格",
    value: " "
  }
] as const

export const yearMonthDayWeekOptions = [
  {
    label: "yyyy",
    value: "yyyy"
  },
  {
    label: "yy",
    value: "yy"
  },
  {
    label: "MM",
    value: "MM"
  },
  {
    label: "dd",
    value: "dd"
  },
  {
    label: "ww",
    value: "ww"
  }
] as const

export const hourMinuteSecondOptions = [
  {
    label: "HH",
    value: "HH"
  },
  {
    label: "mm",
    value: "mm"
  },
  {
    label: "ss",
    value: "ss"
  }
]

export const resetTypeOptions = [
  {
    label: "不复位",
    value: "0"
  },
  {
    label: "按天",
    value: "1"
  },
  {
    label: "按月",
    value: "2"
  },
  {
    label: "按年",
    value: "3"
  },
  {
    label: "按周",
    value: "4"
  }
] as const
// 随机码:组成元素(逗号隔开)(1数字2小写字母3大写字母)
export const randomCodeOptions = [
  {
    label: "数字",
    value: 1
  },
  {
    label: "小写字母",
    value: 2
  },
  {
    label: "大写字母",
    value: 3
  }
] as const

export const codeTypeOptions = [
  {
    label: CodeTypeToNameMap[CodeType.Fixed],
    value: CodeType.Fixed
  },
  {
    label: CodeTypeToNameMap[CodeType.Separator],
    value: CodeType.Separator
  },
  {
    label: CodeTypeToNameMap[CodeType.YearMonthDayWeek],
    value: CodeType.YearMonthDayWeek
  },
  {
    label: CodeTypeToNameMap[CodeType.HourMinuteSecond],
    value: CodeType.HourMinuteSecond
  },
  {
    label: CodeTypeToNameMap[CodeType.SerialNumber],
    value: CodeType.SerialNumber
  },
  {
    label: CodeTypeToNameMap[CodeType.Random],
    value: CodeType.Random
  }
] as const
