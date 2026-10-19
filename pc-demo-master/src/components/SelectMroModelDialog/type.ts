import type { IMroModelPageListItem } from "@/types/maintain/mro-manage/mro-model"

export interface IMroModelDialogProps {
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
   * 标识管理过滤
   */
  identityManage?: number

  /**
   * 表格行唯一标识，默认为id
   */
  rowKey?: string
}

export interface IMroModelDialogEmits {
  (e: "update:modelValue", val: boolean): void
  (e: "success", data: IMroModelPageListItem[]): void
}

export interface IMroModelDialogEvents {
  "update:modelValue": (val: boolean) => void
  success?: (data: IMroModelPageListItem[]) => void
}
