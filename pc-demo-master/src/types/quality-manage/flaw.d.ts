/** 查询缺陷列表请求参数 */
export interface IFlawListParams {
  flawName?: string
  flawGradeId?: string
  flawNo?: string
  pageNum?: number
  pageSize?: number
}

/** 查询缺陷列表返回列表 */
export interface IFlawListItem {
  createTime: string
  flawGradeId: string
  flawGradeName: string
  flawName: string
  flawNo: string
  id: string
  isEnabled: boolean
  remarks: string
}

export interface IFlawGradeListParams {
  gradeName?: string
}

export interface IFlawGradeListItem {
  createBy: string
  createTime: string
  gradeName: string
  gradeNo: string
  id: string
  remarks: string
  updateBy: string
  updateTime: string
}
