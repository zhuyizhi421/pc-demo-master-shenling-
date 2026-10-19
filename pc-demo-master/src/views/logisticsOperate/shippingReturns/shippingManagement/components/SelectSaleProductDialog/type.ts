import type { ISaleOrderProductListItem } from "@/types/logistics/delivery"

export type IProductDialogProps = {
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
   *  1: 有库存，0: 无库存
   */
  inventory?: number

  /**
   * 销售订单id
   */
  saleId?: string

  /**
   * 销售订单编号
   */
  saleCode?: string
}

export type IProductDialogEmits = {
  (e: "update:modelValue", value: boolean): void
  (e: "success", data: ISaleOrderProductListItem[]): void
}

export type IProductDialogEvents = {
  "update:modelValue": (value: boolean) => void
  success?: (data: ISaleOrderProductListItem[]) => void
}
