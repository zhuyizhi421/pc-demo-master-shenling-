import type { IRequestPageParams } from "@/types/common"

export interface ICraftTypePageListParams
  extends IRequestPageParams<
    Partial<{
      craftTypeNo: string
      craftTypeName: string
    }>
  > {}

export interface ICraftTypeItem {
  id: string
  craftTypeNo: string
  craftTypeName: string
  remark: string
  needLoadBindIronTag?: number
  createBy?: string
  createTime?: string
  updateBy?: string
  updateTime?: string
}

export interface ICraftTypeCreateParams {
  craftTypeNo?: string
  craftTypeName: string
  remark?: string
  needLoadBindIronTag: number
}

export interface ICraftTypeUpdateParams extends ICraftTypeCreateParams {
  id: string
}
