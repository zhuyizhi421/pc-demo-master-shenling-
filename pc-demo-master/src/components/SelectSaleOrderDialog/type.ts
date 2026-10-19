import type { ISaleOrderItem } from "@/types/production-manage/product-order"

export interface ISaleOrderDialogProps {
  /**
   * 弹窗是否显示
   */
  modelValue: boolean

  /**
   * 产品模型id
   */
  productId: string

  /**
   * 已选中行rowKey
   */
  selectedRowKeys: string[]

  /**
   * 表格是否多选，默认为单选
   */
  multiple?: boolean

  /**
   * 表格行唯一标识，默认为id
   */
  rowKey?: string
}

export interface ISaleOrderDialogEmits {
  (e: "update:modelValue", val: boolean): void
  (e: "success", data: ISaleOrderItem[]): void
}

export interface ISaleOrderDialogEvents {
  "update:modelValue": (val: boolean) => void
  success?: (data: ISaleOrderItem[]) => void
}
