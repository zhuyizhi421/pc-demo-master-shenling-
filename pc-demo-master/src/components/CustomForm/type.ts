import type { FormItemRule } from "element-plus"
import type { Component } from "vue"

import type { ICustomRecursionConfig } from "@/components/CustomRecursion/type"

export type ICustomFormConfigItem = {
  /**
   * 表单项渲染组件类型，可以是字符串或组件对象
   */
  componentType: string | Component

  /**
   * 是否为非form-item, 即不渲染成form-item，默认为false
   */
  special?: boolean

  /**
   *  表单项字段名，form-item必填
   */
  field?: string

  /**
   * 表单项标题，form-item必填
   */
  label?: string

  /**
   * 表单项是否隐藏显示，默认为false
   */
  hidden?: boolean | globalThis.Ref<boolean>

  /**
   * 表单项跨列数量，默认为1
   */
  colspan?: number

  /**
   * 表单项验证规则，参考element-plus文档
   */
  rules?: FormItemRule[]

  /**
   * 表单项属性，参考对应组件文档
   */
  props?: Record<string, any>

  /**
   * 表单项事件，参考对应组件文档
   */
  events?: Record<string, any>

  /**
   * 表单项label插槽
   */
  labelSlots?: string

  /**
   * 表单项插槽，参考对应组件文档
   * 注意：
   *    slots下的插槽对应键值必须唯一，建议使用 `${field}-${slotsKey}`拼接结果作为插槽名，
   *    例如：{ prefix: `${field}-prefix`, suffix: `${field}-suffix` }
   */
  slots?: Record<string, string | undefined>

  /**
   * 表单项子组件配置
   */
  children?: ICustomRecursionConfig | ICustomRecursionConfig[]
}

export type ICustomFormProps = {
  /**
   * 绑定表单数据对象
   */
  modelValue: Record<string, any>

  /**
   * 表单配置项
   */
  configs: ICustomFormConfigItem[]

  /**
   * 表单列数
   */
  columns?: number

  /**
   * 表单项标签宽度
   */
  labelWidth?: number

  /**
   * 表单项标签位置
   */
  labelPosition?: "left" | "right" | "top"
}

export type ICustomFormEmits = { (e: "update:modelValue", value: Record<string, any>): void }
