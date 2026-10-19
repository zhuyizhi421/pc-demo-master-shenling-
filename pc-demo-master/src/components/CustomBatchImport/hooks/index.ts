import type { AppContext, ComponentInternalInstance, Reactive, Ref } from "vue"
import { getCurrentInstance, h, render } from "vue"

import BatchImport from "@/components/CustomBatchImport/index.vue"

// 使用 InstanceType 获取 ElDialog 组件实例的类型
type BatchImportInstance = InstanceType<typeof BatchImport>

// 从组件实例中提取 Props 类型
type BatchImportProps = BatchImportInstance["$props"] & {}

export function useImportDialog(
  options: BatchImportProps | Ref<BatchImportProps> | Reactive<BatchImportProps>
) {
  const appContext = getCurrentInstance?.()?.appContext

  let dialogInstance: ComponentInternalInstance | null = null
  let fragment: Element | null = null
  // 关闭并卸载组件
  const closeAfter = () => {
    if (fragment) {
      // 不需要removeChild，因为render(null, container)会自动卸载组件
      render(null, fragment as unknown as Element) // 卸载组件
      fragment.textContent = "" // 清空文档片段
      fragment = null
    }
    dialogInstance = null
  }
  function closeImportDialog() {
    if (dialogInstance) dialogInstance?.exposed?.setShow(true)
  }

  // 创建并挂载组件
  function openImportDialog() {
    if (dialogInstance) {
      closeImportDialog()
      closeAfter()
    }

    fragment = document.createDocumentFragment() as unknown as Element
    const props = (options as Ref<BatchImportProps>).value || options

    // 异步组件
    const vNode = h(BatchImport, {
      ...props
    })
    vNode.appContext = appContext as AppContext // 挂载全局上下文，通过h 函数渲染的组件里面的全局注册的组件，指令可以使用
    render(vNode, fragment)
    dialogInstance = vNode.component
    dialogInstance?.exposed?.setShow(true) // 打开弹窗

    document.body.appendChild(fragment)
  }

  onUnmounted(() => {
    closeImportDialog()
    closeAfter()
  })

  return { openImportDialog, closeImportDialog }
}

export {
  EnumFailPathType,
  EnumImportPathType,
  EnumTemplatePathType,
  type ImportResult
} from "./type"
