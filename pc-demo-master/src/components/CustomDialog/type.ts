export interface ICustomDialogProps {
  /**
   * 是否显示弹窗
   */
  modelValue: boolean

  /**
   * 弹窗标题
   */
  title?: string

  /**
   * 弹窗尺寸大小，可选值为 'mini' | 'default' | 'medium | 'large', 默认为 'default'。
   */
  size?: string

  /**
   * Dialog 自身是否插入至 body 元素上，嵌套的 Dialog 必须指定该属性并赋值为 true。默认为 false。
   */
  appendToBody?: boolean

  /**
   * 是否需要遮罩层，默认为 true。
   */
  modal?: boolean

  /**
   * 是否显示加载中，默认为 false。
   */
  loading?: boolean
}

export interface ICustomDialogEmits {
  (e: "update:modelValue", value: boolean): void

  /**
   * 弹窗关闭时触发
   */
  (e: "close"): void
}
