export interface ICustomDrawerProps {
  /**
   * 是否显示抽屉
   */
  modelValue: boolean

  /**
   * 抽屉标题
   */
  title?: string

  /**
   * 抽屉尺寸大小，可选值为 'mini' | 'default' | 'medium | 'large', 默认为 'default'。
   */
  size?: string

  /**
   * Drawer 自身是否插入至 body 元素上，嵌套结构的 Drawer（包含嵌套弹窗） 推荐指定该属性并赋值为 true。默认为 false。
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

export interface ICustomDrawerEmits {
  (e: "update:modelValue", value: boolean): void

  /**
   * 抽屉关闭时触发
   */
  (e: "close"): void
}
