import type { IWarehouseCheckProductListItem } from "@/types/logistics/warehouse-check"

export type IProductInventoryDialogProps = {
  /**
   * 弹窗是否显示
   */
  modelValue: boolean

  /**
   * 已选中行rowKey
   */
  selectedRowKeys: string[]

  /**
   * 仓库id
   */
  facilityId: string

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
}

export type IProductInventoryDialogEmits = {
  (e: "update:modelValue", value: boolean): void
  (e: "success", data: IWarehouseCheckProductListItem[]): void
}

export type IProductInventoryDialogEvents = {
  "update:modelValue": (value: boolean) => void
  success?: (data: IWarehouseCheckProductListItem[]) => void
}
