import type { Component, Ref } from "vue"

export type ICustomRecursionConfig = {
  /**
   * 表单项渲染组件类型，可以是字符串或组件对象
   */
  componentType: string | Component

  /**
   * 组件是否隐藏显示，默认为false
   */
  hidden?: boolean | globalThis.Ref<boolean>

  /**
   * 组件属性，参考对应组件文档
   */
  props?: {
    /**
     *  组件双向绑定值
     */
    modelValue?: string | number | boolean | object
    /**
     * 组件子组件配置
     */
    customChildren?:
      | ICustomRecursionConfig
      | ICustomRecursionConfig[]
      | Ref<ICustomRecursionConfig | ICustomRecursionConfig[]>
  } & Record<string, any>

  /**
   * 组件事件，参考对应组件文档
   */
  events?: Record<string, any>

  /**
   * 组件插槽，参考对应组件文档
   * 注意：
   *    slots下的插槽对应键值必须唯一
   */
  slots?: Record<string, string | undefined>

  /**
   * 组件其他属性兼容拓展
   */
  [key: string]: any
}
