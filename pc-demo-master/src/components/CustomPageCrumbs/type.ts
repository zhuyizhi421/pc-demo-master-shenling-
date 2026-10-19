export type IKey = string | number

export interface IPageCrumbsItem {
  key: IKey // 页面路径唯一标识
  name: string // 页面名称
  children?: IPageCrumbsItem[] // 包含子页面信息
  confirmConfig?: IConfirmConfig // 二次确认配置
}

export interface IConfirmConfig {
  enabled?: boolean // 是否启用二次确认
  title?: string // 确认框标题
  message?: string // 确认框内容
  confirmText?: string // 确认按钮文本
  cancelText?: string // 取消按钮文本
  type?: "warning" | "info" | "success" | "error" // 确认框类型
}

export interface ICustomPageCrumbsProps {
  modelValue: IKey // 当前打开页面路径标识
  data: IPageCrumbsItem[] // 所有页面路径数据树
  globalConfirmConfig?: IConfirmConfig // 全局二次确认配置，优先级低于单个项的配置
}
