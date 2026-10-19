import type { IProductModelListItem } from "@/api/product"

export interface IProductDialogProps {
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
   * 产品模型id列表
   */
  filterProductModelIds?: string[]

  /**
   * 状态是否启用
   */
  enable?: boolean // 是否启用
}

export interface IProductDialogEmits {
  (e: "update:modelValue", val: boolean): void
  (e: "success", data: IProductModelListItem[]): void
}

export interface IProductDialogEvents {
  "update:modelValue": (val: boolean) => void
  success?: (data: IProductModelListItem[]) => void
}
