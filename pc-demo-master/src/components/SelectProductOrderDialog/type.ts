import type { IProductionOrderPageItem } from "@/types/production-manage/product-order"
export interface IProductOrderDialogProps {
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
   * 表格行唯一标识，默认为id
   */
  rowKey?: string

  /**
   * 生产方式 1自制 2委外
   */
  productionMethod?: number

  /**
   * 是否只显示已复核状态的订单
   */
  onlyReviewed?: boolean

  /**
   * type/types的用途，是否查结果产品包含返工或改制的订单
   */
  containRewordOrReform?: boolean

  /**
   * 确认前额外校验，返回 false 时阻止确认
   */
  beforeConfirm?: () => boolean
}

export interface IProductOrderDialogEmits {
  (e: "update:modelValue", show: boolean): void
  (e: "success", data: IProductionOrderPageItem[]): void
  (e: "cancel"): void
}

export interface IProductOrderDialogEvents {
  "update:modelValue": (show: boolean) => void
  success?: (data: IProductionOrderPageItem[]) => void
  cancel?: () => void
}
