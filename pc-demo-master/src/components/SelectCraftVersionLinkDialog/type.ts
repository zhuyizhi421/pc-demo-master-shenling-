import { type TechProcessInfo } from "@/api/craft"

export interface ICraftVersionLinkDialogProps {
  /**
   * 弹窗是否显示
   */
  modelValue: boolean

  /**
   * 表格是否多选，默认为单选
   */
  multiple?: boolean

  /**
   * 产品编号
   */
  productNo: string

  /**
   * 选中的工艺id
   */
  selectedList?: any[]

  /**
   * 不能选中的工艺id
   */
  disabledIds?: string[]
}

export interface ICraftVersionLinkDialogEmits {
  (e: "update:modelValue", show: boolean): void
  (e: "success", data: TechProcessInfo[]): void
}

export interface ICraftVersionLinkDialogEvents {
  "update:modelValue": (show: boolean) => void
  success?: (data: TechProcessInfo[]) => void
}
