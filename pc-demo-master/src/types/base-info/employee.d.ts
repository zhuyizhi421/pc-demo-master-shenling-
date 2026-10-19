export interface IEmployeePageListParams {
  depId?: string
  depIds?: string[]
  empNo?: string
  id?: string
  idList?: string[]
  isAccountOpen?: boolean
  jobId?: string
  licenseId?: string
  name?: string
  pageNum: number
  pageSize: number
  positionId?: string
}

export interface IEmployeeListItem {
  barcode: string
  barcodeId: string
  bindNickname: string
  bindUserId: string
  bindUsername: string
  createBy: string
  createTime: string
  depId: string
  depName: string
  email: string
  empNo: string
  id: string
  jobList: IJobListItem[]
  licenseList: ILicenseListItem[]
  name: string
  phone: string
  positionList: IPositionListItem[]
  remark: string
  status: number
  updateBy: string
  updateTime: string
}

export interface IEmployeeCreateParams {
  name?: string
  depId?: string
  id?: string
  email?: string
  empNo?: string
  jobIdList?: string[]
  phone?: string
  positionIdList?: string[]
  remark?: string
  status?: number
  barcode?: string
  autoGenerateCode: boolean
}

export interface IPositionListItem {
  code: string
  createBy: string
  createTime: string
  id: string
  name: string
  remark: string
  updateBy: string
  updateTime: string
}

export interface ILicenseListItem {
  autoFreeze: number
  createBy: string
  createTime: string
  equipmentBizIdList: string[]
  equipmentBizIds: string
  equipmentBizNames: string
  equipmentType: number
  id: string
  idleMaxDays: number
  jobId: string
  jobName: string
  licenseName: string
  preNoticeDays: number
  updateBy: string
  updateTime: string
}

export interface IJobListItem {
  createBy: string
  createTime: string
  id: string
  jobName: string
  licenseApplyProcessId: string
  licenseApplyProcessName: string
  licenseUnfreezeProcessId: string
  licenseUnfreezeProcessName: string
  updateBy: string
  updateTime: string
}

export interface ILicenseItemDetail {
  empId: string
  licenseId: string
  licenseName: string
  autoFreeze: number
  idleMaxDays: number
  preNoticeDays: number
  equipmentType: number
  equipmentBizIds: any
  licenseJobId: string
  licenseJobName: string
  licenseStatus: number
  licenseExpireTime: string
}

export interface ILicenseApplyParams {
  applyType: number // 申请类型 1-新增 2-解冻
  empIds: string[]
  licenseIds: string[]
}

export interface ILicenseApplyFreezeParams {
  empId: string
  licenseId: string
}

export interface IEmployeeRelateListItem {
  empId: string
  name: string
  empNo: string
  bindUsername: string
  bindNickname: string
}

export interface IDepartmentListItem {
  id: string
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
  depName: string
  depCode: string
  parentDepId: string
  depType: number // 部门类型(1-销售部门 2-采购部门 3-服务部门 4-工作中心 5-生产部门 6-会计部门 8-装运部门 10-项目管理部)
  remark: string
}

export interface IDepartmentTreeItem extends IDepartmentListItem {
  children: IDepartmentTreeItem[]
  label: string
}

export interface IDepartmentUpdateParams {
  id: string
  depName?: string
  depType?: number // 1-销售部门 2-采购部门 3-服务部门 4-工作中心 5-生产部门 6-会计部门 8-装运部门 10-项目管理部
  remark?: string
}

export interface IDepartmentCreateParams {
  depName: string
  depType: number // 1-销售部门 2-采购部门 3-服务部门 4-工作中心 5-生产部门 6-会计部门 8-装运部门 10-项目管理部
  parentDepId: string
  remark?: string
  depCode?: string
}

export interface IDepartmentType {
  depTypeName: string
  depTypeNo: number
}

export interface IPositionListParams {
  pageNum: number
  pageSize: number
  name?: string
}

export interface IPositionCreateParams {
  name: string
  remark?: string
  code?: string
}

export interface IPositionUpdateParams extends IPositionCreateParams {
  id: string
}

export interface ILicenseCascade {
  jobId: string
  jobName: string
  licenseNodes: {
    licenseId: string
    jobId: string
    licenseName: string
  }[]
}

export interface ILicenseApplySearchParams {
  pageNum: number
  pageSize: number
  empName?: string
  empNo?: string
  applyType?: number // 申请类型 1-新增 2-解冻
  licenseId?: string
  processInstanceId?: string // 流程实例ID
}

export interface ILicenseApplyListItem {
  id: string
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
  processInstanceId: string
  applyType: number
  applyStatus: number
  submitterName: string
  applyEmpIds: string[]
  applyEmpNos: string[]
  applyEmpNames: string[]
  applyEmpDepNames: string[]
  licenseId: string
  licenseName: string
  licenseJobId: string
  licenseJobName: string
}

export interface ILicenseUpdateParams {
  autoFreeze: number //0-关闭  1-开启
  equipmentBizIds?: string // 设备型号ID集或者设备ID集,英文逗号分割
  equipmentType: number //1-所有  2-特定设备类型  3-特定设备
  idleMaxDays?: number
  id?: string
  jobId?: string
  licenseName: string
  preNoticeDays?: number
}

export interface ILicenseDetail {
  id: string
  jobId: string
  jobName: string
  licenseName: string
  autoFreeze: number
  idleMaxDays: number
  preNoticeDays: number
  equipmentType: number
  equipmentBizIds: string
  equipmentModelList: {
    modelName: string
    id: string
  }[]
  equipmentList: {
    equipmentName: string
    id: string
  }[]
  fileResourceList: FileResourceVo[]
}

export interface FileResourceVo {
  createBy: string //创建人ID
  createTime: string //($date-time) //创建时间
  deploymentId?: string
  directoryName: string //文档类型
  extension: string
  fileName: string
  fileSize?: string //文件大小展示字段
  fileStatus: integer //($int32) //文件的状态, 0修订中，1正常，2审核中
  hash: string
  id: string //ID
  path?: string
  size: string
  sourceName: string
  updateBy?: string //更新人ID
  updateTime?: string //($date-time) //更新时间
  version: string
  fileId?: string
}

export interface IFileItem {
  fileName: string
  filePath: string
  fileId: string
}

export interface ILicensePageSearchParams {
  jobId?: string
  licenseName?: string
  pageNum: number
  pageSize: number
}

export interface IWorkLocationTree {
  entityCode: string // 实体编号
  entityId: string // 实体ID
  entityName: string // 实体名称
  entityType: number // 实体类型 1公司 2工厂 3区域 4生产单位
  id: string // ID
  isEnable: boolean // 是否启用
  levelName: string // 层级名称 公司/工厂/区域/生产/仓库/检验/库位 等
  parentId: string // 父级ID
  children: IWorkLocationTree[] // 子节点
}

export interface ILicenseEmployeeDetail {
  barcode: string //标签码
  barcodeId: string //标签码ID(外键)
  depId: string //部门ID
  depName: string //部门名称
  empId: string //员工ID
  empName: string //员工名字
  empNo: string //员工工号
  id: string //主键ID
  isFreeze: boolean //是否冻结
  isTraining: boolean //是否培训
}
