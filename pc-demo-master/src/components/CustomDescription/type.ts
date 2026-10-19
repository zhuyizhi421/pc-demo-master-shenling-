export type ICustomDescriptionData = Record<string, any>

export type ICustomDescriptionConfig = {
  /**
   * 当前项字段名
   */
  field: string

  /**
   * 当前项标签名
   */
  label: string

  /**
   * 当前项是否隐藏显示，默认为false
   */
  hidden?: boolean | (() => boolean) | globalThis.Ref<boolean>

  /**
   * 当前项跨列的数量，默认为1
   */
  colspan?: number

  /**
   * 当前项格式化函数
   * 注意:
   *    formatter参数适用于格式化content插槽默认内容，当配置slots.content时，该参数无效。
   * @param params.field  字段名
   * @param params.data   数据对象
   * @returns  格式化后的内容
   */
  formatter?: (params: { field: string; data: ICustomDescriptionData }) => any

  /**
   * 当前项的插槽配置，包括 label 和 content具名插槽
   *
   * 注意：
   * slots下的插槽对应键值必须唯一，建议使用 `${field}-${slotsKey}`拼接结果作为插槽名，
   * 例如：{ label: `${field}-label`, content: `${field}-content`
   */
  slots?: { label?: string; content?: string }
}

export type ICustomDescriptionProps = {
  /**
   * 绑定描述组件的数据对象
   */
  data: ICustomDescriptionData

  /**
   * 描述组件的配置
   */
  configs: ICustomDescriptionConfig[]

  /**
   * 设置列数
   */
  columns?: number

  /**
   * 统一设置标题label的宽度
   */
  labelWidth?: number
}
