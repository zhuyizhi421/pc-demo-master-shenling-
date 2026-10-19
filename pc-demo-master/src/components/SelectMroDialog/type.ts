import type { IMroInfoPageListItem } from "@/types/maintain/mro-manage/mro-info"

export type IMroDialogProps = {
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
   * 指定MRO分类
   */
  fixedMroCate?: string

  /**
   * 弹窗标题
   */
  title?: string

  /**
   * 指定 MRO 状态 (如 enabled)
   */
  ledgerStatus?: string

  /**
   * 是否选择开启标识管理
   */
  identityManage?: boolean
}

export type IMroDialogEmits = {
  (e: "update:modelValue", show: boolean): void
  (e: "success", data: IMroInfoPageListItem[]): void
}

export type IMroDialogEvents = {
  "update:modelValue": (show: boolean) => void
  success?: (data: IMroInfoPageListItem[]) => void
}
