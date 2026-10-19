import { EnumSelectUser } from "@/constant/enums"

export interface ISelectPersonProps {
  /**
   * 是否显示弹窗
   */
  modelValue: boolean

  /**
   * 弹窗选择类型
   */
  type: EnumSelectUser

  /**
   * 当前选中项id
   */
  selectedIds: string[]

  /**
   * 是否开启多选
   */
  multiple?: boolean
}

export interface ISelectPersonEmits {
  (e: "update:modelValue", value: boolean): void
  (e: "success", value: ITree[]): void
}

export interface ITree {
  id: string
  label: string
  no: string
  nodeType: number // 节点类型
  depName?: string // 人员所在部门名称
  children: ITree[]
}
