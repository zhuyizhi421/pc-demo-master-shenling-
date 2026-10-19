import { EnumDocumentStatus } from "@/constant/enums"
import type { IFileResourcePageItem } from "@/types/base-info/file"

export interface IDocumentDialogProps {
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
   * 文档状态列表，用于筛选
   */
  statusList?: EnumDocumentStatus[]
}

export interface IDocumentDialogEmits {
  (e: "update:modelValue", val: boolean): void
  (e: "success", data: IFileResourcePageItem[]): void
}

export interface IDocumentDialogEvents {
  "update:modelValue": (val: boolean) => void
  success?: (data: IFileResourcePageItem[]) => void
}
