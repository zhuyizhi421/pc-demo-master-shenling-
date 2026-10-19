export interface TsesEmpLicenseTrainingTaskQueryDTO {
  pageQuery: {
    pageNum: number
    pageSize: number
  }
  queryParam: {
    isClosed?: boolean
    licenseName: string
    trainingStatus?: number
  }
}

export interface TsesEmpLicenseTrainingTaskVO {
  createTime: string
  empLicenseId: string
  fileIds: number[]
  fileList: {
    createBy: string
    createTime: string
    deploymentId: string
    directoryName: string
    extension: string
    fileName: string
    fileSize: string
    fileStatus: number
    hash: string
    id: string
    path: string
    size: string
    sourceName: string
    updateBy: string
    updateTime: string
    version: string
  }[]
  id: string
  licenseName: string
  remarkFileIds: string[]
  remarkFileList: {
    createBy: string
    createTime: string
    deploymentId: string
    directoryName: string
    extension: string
    fileName: string
    fileSize: string
    fileStatus: number
    hash: string
    id: string
    path: string
    size: string
    sourceName: string
    updateBy: string
    updateTime: string
    version: string
  }[]
  remarks: string
  trainingEmployeeIds: number[]
  trainingEmployeeList: TsesEmpEmployee[]
  trainingNo: string
  trainingStatus: number
}

export interface TsesEmpEmployee {
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
  jobList: {
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
  }[]
  licenseList: {
    autoFreeze: number
    createBy: string
    createTime: string
    equipmentBizIdList: number[]
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
  }[]
  name: string
  phone: string
  positionList: {
    code: string
    createBy: string
    createTime: string
    id: string
    name: string
    remark: string
    updateBy: string
    updateTime: string
  }[]
  remark: string
  status: number
  updateBy: string
  updateTime: string
}
