import { EnumProductionTaskStatus } from "@/constant/enums"
import type { IProductionTaskPageItem } from "@/types/production-manage/product-task"

export interface IProductTaskDialogProps {
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
  status?: EnumProductionTaskStatus[]
}

export interface IProductTaskDialogEmits {
  (e: "update:modelValue", val: boolean): void
  (e: "success", data: IProductionTaskPageItem[]): void
}

export interface IProductTaskDialogEvents {
  "update:modelValue": (val: boolean) => void
  success?: (data: IProductionTaskPageItem[]) => void
}
