import type { IPositionListItem } from "@/types/base-info/employee"
import type { IPaginationSearch } from "@/types/common"

export interface IDepartmentWorkItem {
  id: string
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
  depName: string
  depCode: string
  parentDepId: string | null
  parentName: string
  parentCode: string
  remark: string
  positionList: IPositionListItem[]
}

export interface IDepartmentWorkItemPageParams extends IPaginationSearch {
  depName?: string
  depCode?: string
  parentDepId?: string
}

export interface IDepartmentWorkItemCreateParams {
  depName: string
  depCode?: string
  parentDepId?: string | null
  remark?: string
  positionIdList: string[]
}

export interface IDepartmentWorkItemUpdateParams extends IDepartmentWorkItemCreateParams {
  id: string
}
