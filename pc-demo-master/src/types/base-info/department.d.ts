export interface IDepartmentItem {
  createBy: string // 创建人ID
  createTime: string // 创建时间
  depCode: string // 部门编号
  depName: string // 部门名称
  depType: number // 部门类型(1-销售部门 2-采购部门 3-服务部门 4-工作中心 5-生产部门 6-会计部门 8-装运部门 10-项目管理部)
  id: string // 主键ID
  parentDepId: string // 上级部门id
  remark: string // 备注
  updateBy: string // 更新人ID
  updateTime: string // 更新时间
}
