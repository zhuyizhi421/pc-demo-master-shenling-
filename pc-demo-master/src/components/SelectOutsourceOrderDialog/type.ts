import { EnumOutsourcingOrderStatus } from "@/constant/enums"
import type { DelegateOrder } from "@/types/logistics/delegate"

export interface IOutsourceOrderDialogProps {
  /**
   * 弹窗是否显示
   */
  modelValue: boolean

  /**
   * 已选中行rowKey
   */
  selectedRowKeys: string[]

  /**
   * 表格是否多选，默认为单选
   */
  multiple?: boolean

  /**
   * 表格行唯一标识，默认为no
   */
  rowKey?: string

  /**
   * 委外订单状态
   */
  status?: EnumOutsourcingOrderStatus[]
}

export interface IOutsourceOrderDialogEmits {
  (e: "update:modelValue", val: boolean): void
  (e: "success", data: DelegateOrder[]): void
}

export interface IOutsourceOrderDialogEvents {
  "update:modelValue": (val: boolean) => void
  success?: (data: DelegateOrder[]) => void
}
