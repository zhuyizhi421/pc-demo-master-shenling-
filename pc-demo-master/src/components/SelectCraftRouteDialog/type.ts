import type { ICraftRouteItem } from "@/types/base-info/craftRoute"

export interface ICraftRouteDialogProps {
  /**
   * 弹窗是否显示
   */
  modelValue: boolean

  /**
   * 表格行唯一标识，默认为id
   */
  rowKey?: string

  /**
   * 表格是否多选，默认为单选
   */
  multiple?: boolean

  /**
   * 已选中行rowKey
   */
  selectedRowKeys: string[]

  /**
   * 产品编号
   */
  queryProductNo?: string

  /**
   * 工艺路线状态
   */
  publishStatus?: number

  /**
   * 状态查询项是否禁用
   */
  disabledStatus?: boolean

  /**
   * 产品编号查询项是否禁用
   */
  disabledNo?: boolean
}

export interface ICraftRouteDialogEmits {
  (e: "update:modelValue", show: boolean): void
  (e: "success", data: ICraftRouteItem[]): void
}

export interface ICraftRouteDialogEvents {
  "update:modelValue": (show: boolean) => void
  success?: (data: ICraftRouteItem[]) => void
}
