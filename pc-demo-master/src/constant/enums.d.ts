/** 全局枚举类型 */

/** 角色名称枚举（不包括新增角色名称） */
export enum EnumRoleName {
  ADMIN = "超级管理员",
  COMMON = "普通角色"
}

/** 操作类型枚举 */
export enum EnumOperationType {
  Create, // 新增
  Update, // 修改
  Review // 查看
}

/** MRO标识管理 */
export enum EnumMROIdentityManage {
  CLOSE,
  OPEN
}

/** MRO标识管理映射 */
export const EnumMROIdentityManageMap: Record<EnumMROIdentityManage, string> = {
  [EnumMROIdentityManage.CLOSE]: "关闭",
  [EnumMROIdentityManage.OPEN]: "开启"
} as const

/** MRO注册状态 */
export enum EnumMRORegisterStatus {
  NOT_REVIEWED = "0", // 未复核
  REVIEWED = "1" // 已复核
}

/** MRO注册状态映射 */
export const EnumMRORegisterStatusMap: Record<EnumMRORegisterStatus, string> = {
  [EnumMRORegisterStatus.NOT_REVIEWED]: "未复核",
  [EnumMRORegisterStatus.REVIEWED]: "已复核"
} as const

/** MRO当前位置 */
export enum EnumMROCurrentLocation {
  IN_STORE = "1", // 在库
  PRODUCTION_UNIT = "2", // 生产单位
  ON_THE_WAY = "3" // 在途
}

/** MRO当前位置映射 */
export const EnumMROCurrentLocationMap: Record<EnumMROCurrentLocation, string> = {
  [EnumMROCurrentLocation.IN_STORE]: "在库",
  [EnumMROCurrentLocation.PRODUCTION_UNIT]: "生产区域",
  [EnumMROCurrentLocation.ON_THE_WAY]: "在途"
} as const

/** MRO状态 */
export enum EnumMROStatus {
  NORMAL = 1, // 正常
  PENDING_VALIDATION = 10, // 待校验
  PENDING_MAINTENANCE = 15, // 待保养
  VALIDATION_EXCEPTION = 20, // 校验异常
  MAINTENANCE_EXCEPTION = 25, // 保养异常
  PENDING_REPAIR = 30, // 待维修
  PENDING_SCRAP = 35, // 待报废
  SCRAPPED = 40 // 已报废
}

/** MRO状态映射 */
export const EnumMROStatusMap: Record<EnumMROStatus, string> = {
  [EnumMROStatus.NORMAL]: "正常",
  [EnumMROStatus.PENDING_VALIDATION]: "待校验",
  [EnumMROStatus.PENDING_MAINTENANCE]: "待保养",
  [EnumMROStatus.VALIDATION_EXCEPTION]: "校验异常",
  [EnumMROStatus.MAINTENANCE_EXCEPTION]: "保养异常",
  [EnumMROStatus.PENDING_REPAIR]: "待维修",
  [EnumMROStatus.PENDING_SCRAP]: "待报废",
  [EnumMROStatus.SCRAPPED]: "已报废"
} as const

/** MRO校验任务状态 */
export enum EnumMROInspectionTaskStatus {
  PENDING = 1, // 待执行
  EXECUTING = 2, // 执行中
  FINISHED = 3 // 已完成
}

/** MRO校验任务状态映射 */
export const EnumMROInspectionTaskStatusMap: Record<EnumMROInspectionTaskStatus, string> = {
  [EnumMROInspectionTaskStatus.PENDING]: "待执行",
  [EnumMROInspectionTaskStatus.EXECUTING]: "执行中",
  [EnumMROInspectionTaskStatus.FINISHED]: "已完成"
} as const

/** MRO校验任务状态tag类型映射 */
export const EnumMROInspectionTaskStatusTagMap: Record<EnumMROInspectionTaskStatus, string> = {
  [EnumMROInspectionTaskStatus.EXPIRED]: "danger",
  [EnumMROInspectionTaskStatus.PENDING]: "warning",
  [EnumMROInspectionTaskStatus.EXECUTING]: "primary",
  [EnumMROInspectionTaskStatus.FINISHED]: "success"
} as const

/** MRO检验异常工单状态 */
export enum EnumMROInspectionExceptionStatus {
  PENDING = 0, // 待处理
  FINISHED = 1 // 已完成
}

/** MRO检验异常工单状态映射 */
export const EnumMROInspectionExceptionStatusMap: Record<EnumMROInspectionExceptionStatus, string> =
  {
    [EnumMROInspectionExceptionStatus.PENDING]: "待处理",
    [EnumMROInspectionExceptionStatus.FINISHED]: "已完成"
  } as const

/** MRO校验任务结果 */
export enum EnumMROInspectionTaskResult {
  NG = 0, // 不合格
  OK = 1, // 合格
  NOT_RESULT = 2 // 未出结果
}

/** MRO校验任务结果映射 */
export const EnumMROInspectionTaskResultMap: Record<EnumMROInspectionTaskResult, string> = {
  [EnumMROInspectionTaskResult.NG]: "NG",
  [EnumMROInspectionTaskResult.OK]: "OK",
  [EnumMROInspectionTaskResult.NOT_RESULT]: "未出结果"
} as const

/** MRO校验任务结果tag类型映射 */
export const EnumMROInspectionTaskResultTagMap: Record<EnumMROInspectionTaskResult, string> = {
  [EnumMROInspectionTaskResult.NG]: "danger",
  [EnumMROInspectionTaskResult.OK]: "success",
  [EnumMROInspectionTaskResult.NOT_RESULT]: "warning"
} as const

/** MRO检验标准类型 */
export enum EnumMROInspectionStandardType {
  NUMBER = 1, // 数值
  TEXT = 2 // 文本
}

/** MRO检验标准类型映射 */
export const EnumMROInspectionStandardTypeMap: Record<EnumMROInspectionStandardType, string> = {
  [EnumMROInspectionStandardType.NUMBER]: "数值",
  [EnumMROInspectionStandardType.TEXT]: "文本"
} as const

/** MRO校验异常工单反馈解决措施 */
export enum EnumMROInspectionFeedbackSolution {
  UNOBSTRUCTED = 1, // 无碍
  REPAIR = 2, // 需维修
  SCRAP = 3 // 需报废
}

/** MRO校验异常工单反馈解决措施映射 */
export const EnumMROInspectionFeedbackSolutionMap: Record<
  EnumMROInspectionFeedbackSolution,
  string
> = {
  [EnumMROInspectionFeedbackSolution.UNOBSTRUCTED]: "无碍",
  [EnumMROInspectionFeedbackSolution.REPAIR]: "需维修",
  [EnumMROInspectionFeedbackSolution.SCRAP]: "需报废"
} as const

/** MRO保养任务状态 */
export enum EnumMROMaintenanceTaskStatus {
  PENDING = 1, // 待执行
  EXECUTING = 2, // 执行中
  FINISHED = 3, // 已完成
  UNPUBLISHED = 4 // 未发布
}

/** MRO保养任务状态映射 */
export const EnumMROMaintenanceTaskStatusMap: Record<EnumMROMaintenanceTaskStatus, string> = {
  [EnumMROMaintenanceTaskStatus.PENDING]: "待执行",
  [EnumMROMaintenanceTaskStatus.EXECUTING]: "执行中",
  [EnumMROMaintenanceTaskStatus.FINISHED]: "已完成",
  [EnumMROMaintenanceTaskStatus.UNPUBLISHED]: "未发布"
} as const

/** MRO保养任务状态TAG类型 */
export const EnumMROMaintenanceTaskStatusTagTypeMap: Record<EnumMROMaintenanceTaskStatus, string> =
  {
    [EnumMROMaintenanceTaskStatus.EXPIRED]: "warning",
    [EnumMROMaintenanceTaskStatus.PENDING]: "danger",
    [EnumMROMaintenanceTaskStatus.EXECUTING]: "primary",
    [EnumMROMaintenanceTaskStatus.FINISHED]: "success",
    [EnumMROMaintenanceTaskStatus.UNPUBLISHED]: "danger"
  } as const

/** MRO保养任务结果 */
export enum EnumMROMaintenanceTaskResult {
  NG = 0, // 不合格
  OK = 1, // 合格
  NOT_RESULT = 2 // 未出结果
}

/** MRO保养任务结果映射 */
export const EnumMROMaintenanceTaskResultMap: Record<EnumMROMaintenanceTaskResult, string> = {
  [EnumMROMaintenanceTaskResult.NG]: "NG",
  [EnumMROMaintenanceTaskResult.OK]: "OK",
  [EnumMROMaintenanceTaskResult.NOT_RESULT]: "未出结果"
} as const

/** MRO保养任务结果tag类型映射 */
export const EnumMROMaintenanceTaskResultTagMap: Record<EnumMROMaintenanceTaskResult, string> = {
  [EnumMROMaintenanceTaskResult.NG]: "danger",
  [EnumMROMaintenanceTaskResult.OK]: "success",
  [EnumMROMaintenanceTaskResult.NOT_RESULT]: "warning"
} as const

/** MRO保养异常工单状态 */
export enum EnumMROMaintenanceExceptionStatus {
  PENDING = 0, // 待处理
  FINISHED = 1 // 已完成
}

/** MRO保养异常工单状态映射 */
export const EnumMROMaintenanceExceptionStatusMap: Record<
  EnumMROMaintenanceExceptionStatus,
  string
> = {
  [EnumMROMaintenanceExceptionStatus.PENDING]: "待处理",
  [EnumMROMaintenanceExceptionStatus.FINISHED]: "已完成"
} as const

/** MRO保养标准类型 */
export enum EnumMROMaintenanceStandardType {
  NUMBER = 1, // 数值
  TEXT = 2 // 文本
}

/** MRO保养标准类型映射 */
export const EnumMROMaintenanceStandardTypeMap: Record<EnumMROMaintenanceStandardType, string> = {
  [EnumMROMaintenanceStandardType.NUMBER]: "数值",
  [EnumMROMaintenanceStandardType.TEXT]: "文本"
} as const

/** MRO保养异常工单反馈解决措施 */
export enum EnumMROMaintenanceFeedbackSolution {
  UNOBSTRUCTED = 1, // 无碍
  REPAIR = 2, // 需维修
  SCRAP = 3 // 需报废
}

/** MRO保养异常工单反馈解决措施映射 */
export const EnumMROMaintenanceFeedbackSolutionMap: Record<
  EnumMROMaintenanceFeedbackSolution,
  string
> = {
  [EnumMROMaintenanceFeedbackSolution.UNOBSTRUCTED]: "无碍",
  [EnumMROMaintenanceFeedbackSolution.REPAIR]: "需维修",
  [EnumMROMaintenanceFeedbackSolution.SCRAP]: "需报废"
} as const

/** MRO异常工单来源类型 */
export enum EnumMROExceptionSourceType {
  VALIDATION_EXCEPTION = 1, // 校验异常
  MAINTENANCE_EXCEPTION = 2 // 保养异常
}

/** MRO异常工单来源类型映射 */
export const EnumMROExceptionSourceTypeMap: Record<EnumMROExceptionSourceType, string> = {
  [EnumMROExceptionSourceType.VALIDATION_EXCEPTION]: "MRO校验",
  [EnumMROExceptionSourceType.MAINTENANCE_EXCEPTION]: "MRO保养"
} as const

/** MRO维修状态 */
export enum EnumMRORepairStatus {
  UNREVIEWED = 0, // 未复核
  PENDING = 1, // 待维修
  FINISHED = 2 // 已完成
}

/** MRO维修状态映射 */
export const EnumMRORepairStatusMap: Record<EnumMRORepairStatus, string> = {
  [EnumMRORepairStatus.UNREVIEWED]: "未复核",
  [EnumMRORepairStatus.PENDING]: "待维修",
  [EnumMRORepairStatus.FINISHED]: "已完成"
} as const

/** MRO维修结果 */
export enum EnumMRORepairResult {
  SCRAPPED = 0, // 报废
  RESOLVED = 1, // 已解决
  NEXT_ROUND = 2 // 转下一轮维修
}

/** MRO维修结果映射 */
export const EnumMRORepairResultMap: Record<EnumMRORepairResult, string> = {
  [EnumMRORepairResult.SCRAPPED]: "报废",
  [EnumMRORepairResult.RESOLVED]: "已解决",
  [EnumMRORepairResult.NEXT_ROUND]: "转下一轮维修"
} as const

/** MRO维修方式 */
export enum EnumMRORepairMode {
  INTERNAL = 1, // 内部维修
  EXTERNAL = 2 // 委外维修
}

/** MRO维修方式映射 */
export const EnumMRORepairModeMap: Record<EnumMRORepairMode, string> = {
  [EnumMRORepairMode.INTERNAL]: "内部维修",
  [EnumMRORepairMode.EXTERNAL]: "委外维修"
} as const

/** MRO维修来源类型 */
export enum EnumMRORepairSourceType {
  VALIDATION_EXCEPTION = 1, // 校验异常
  MAINTENANCE_EXCEPTION = 2, // 保养异常
  MANUAL_CREATE = 3 // 手动创建
}

/** MRO维修来源类型映射 */
export const EnumMRORepairSourceTypeMap: Record<EnumMRORepairSourceType, string> = {
  [EnumMRORepairSourceType.VALIDATION_EXCEPTION]: "校验异常",
  [EnumMRORepairSourceType.MAINTENANCE_EXCEPTION]: "保养异常",
  [EnumMRORepairSourceType.MANUAL_CREATE]: "手动创建"
} as const

/** MRO报废申请流程进度 */
export enum EnumMROScrapProcessProgress {
  APPLYING = 1, // 申请中
  APPROVED = 2, // 已通过
  REJECTED = 3 // 未通过
}

/** MRO报废申请流程进度映射 */
export const EnumMROScrapProcessProgressMap: Record<EnumMROScrapProcessProgress, string> = {
  [EnumMROScrapProcessProgress.APPLYING]: "申请中",
  [EnumMROScrapProcessProgress.APPROVED]: "已通过",
  [EnumMROScrapProcessProgress.REJECTED]: "未通过"
} as const

/** MRO报废申请流程进度映射 */
export const EnumMROScrapProcessProgressTagMap: Record<EnumMROScrapProcessProgress, string> = {
  [EnumMROScrapProcessProgress.APPLYING]: "primary",
  [EnumMROScrapProcessProgress.APPROVED]: "success",
  [EnumMROScrapProcessProgress.REJECTED]: "danger"
} as const

/** MRO报废来源类型 */
export enum EnumMROScrapSourceType {
  VALIDATION_EXCEPTION = 1, // 校验异常
  MAINTENANCE_EXCEPTION = 2, // 保养异常
  REPAIR_SCRAP = 3, // 维修报废
  MANUAL_CREATE = 4 // 手动创建
}

/** MRO报废来源类型映射 */
export const EnumMROScrapSourceTypeMap: Record<EnumMROScrapSourceType, string> = {
  [EnumMROScrapSourceType.VALIDATION_EXCEPTION]: "校验异常",
  [EnumMROScrapSourceType.MAINTENANCE_EXCEPTION]: "保养异常",
  [EnumMROScrapSourceType.REPAIR_SCRAP]: "维修报废",
  [EnumMROScrapSourceType.MANUAL_CREATE]: "手动创建"
} as const

/** 物流运营-来料收货方式 */
export enum EnumIncomingMaterialsReceiveMode {
  RELEVANCE = 1, // 关联条码
  PRINT = 2 // 打印条码
}

/** 物流运营-来料收获方式映射 */
export const EnumIncomingMaterialsReceiveModeMap: Record<EnumIncomingMaterialsReceiveMode, string> =
  {
    [EnumIncomingMaterialsReceiveMode.RELEVANCE]: "关联条码",
    [EnumIncomingMaterialsReceiveMode.PRINT]: "打印条码"
  } as const

/** 物流运营-生产物料签收 */
export enum EnumProductionMaterialsSign {
  NO_SIGN = 1, // 无签收
  LINE_IN_STORE = 2, // 入线边库
  DIRECT_SIGN = 3 // 直接签收
}

/** 物流运营-生产物料签收映射 */
export const EnumProductionMaterialsSignMap: Record<EnumProductionMaterialsSign, string> = {
  [EnumProductionMaterialsSign.NO_SIGN]: "无签收",
  [EnumProductionMaterialsSign.LINE_IN_STORE]: "入线边库",
  [EnumProductionMaterialsSign.DIRECT_SIGN]: "直接签收"
} as const

/** 生产运营-生产调度方式 */
export enum EnumProductionScheduleMode {
  PRODUCTION_UNIT = 1, // 调度到生产单位
  WORK_STATION = 2 // 调度到工位
}

/** 生产运营-生产调度方式映射 */
export const EnumProductionScheduleModeMap: Record<EnumProductionScheduleMode, string> = {
  [EnumProductionScheduleMode.PRODUCTION_UNIT]: "调度到生产单位",
  [EnumProductionScheduleMode.WORK_STATION]: "调度到工位"
} as const

/** 质量运营-首检自检节点 */
export enum EnumFirstInspectionNode {
  START_TASK = 1, // 任务开启时
  PREPARE_PRODUCTION = 2, // 生产准备时
  NO_TRIGGER = 3 // 不触发
}

/** 质量运营-首检自检节点映射 */
export const EnumFirstInspectionNodeMap: Record<EnumFirstInspectionNode, string> = {
  // [EnumFirstInspectionNode.START_TASK]: "任务开启时",
  [EnumFirstInspectionNode.PREPARE_PRODUCTION]: "生产准备时",
  [EnumFirstInspectionNode.NO_TRIGGER]: "不触发"
} as const

/** 基础配置-默认关联条码方式 */
export enum EnumBarcodeDefaultRelevanceMode {
  EMPTY = 1, // 关联空条码
  NEW = 2, // 生成新条码
  EXTERNAL = 3, // 关联外部码
  MAIN_MATERIAL = 4 // 沿用主料码
}

/** 基础配置-默认关联条码方式映射 */
export const EnumBarcodeDefaultRelevanceModeMap: Record<EnumBarcodeDefaultRelevanceMode, string> = {
  [EnumBarcodeDefaultRelevanceMode.EMPTY]: "关联空条码",
  [EnumBarcodeDefaultRelevanceMode.NEW]: "生成新条码",
  [EnumBarcodeDefaultRelevanceMode.EXTERNAL]: "关联外部码",
  [EnumBarcodeDefaultRelevanceMode.MAIN_MATERIAL]: "沿用主料码"
} as const

/** 其他配置-自定义表单类型 */
export enum EnumCustomFormType {
  PRODUCT_INFO = 1, // 产品信息
  SALES_ORDER = 2, //销售订单
  PRODUCTION_ORDER = 3, //生产订单
  PURCHASE_ARRIVAL_ORDER = 4 //采购收货单
}

/** 其他配置-选择器类型 */
export enum EnumCustomFormComponentType {
  INPUT = 1, // 单行输入框
  TEXTAREA = 2, // 多行输入框
  SWITCH = 3, // 开关
  SELECT = 4, // 单选选择器
  MULTIPLE_SELECT = 5, // 多选选择器
  NUMBER_STEPPER = 6, // 数字进步器
  DATE_PICKER = 7, // 日期选择器
  TIME_PICKER = 8, // 时间选择器
  FILE_UPLOAD = 9, // 文件上传
  SELECT_USER = 10 // 选人组件
}

/** 其他配置-选择器类型映射 */
export const EnumCustomFormComponentTypeMap: Record<EnumCustomFormComponentType, string> = {
  [EnumCustomFormComponentType.INPUT]: "单行输入框",
  [EnumCustomFormComponentType.TEXTAREA]: "多行输入框",
  [EnumCustomFormComponentType.SWITCH]: "开关",
  [EnumCustomFormComponentType.SELECT]: "单选选择器",
  [EnumCustomFormComponentType.MULTIPLE_SELECT]: "多选选择器",
  [EnumCustomFormComponentType.NUMBER_STEPPER]: "数字进步器",
  [EnumCustomFormComponentType.DATE_PICKER]: "日期选择器",
  [EnumCustomFormComponentType.TIME_PICKER]: "时间选择器",
  [EnumCustomFormComponentType.FILE_UPLOAD]: "文件上传",
  [EnumCustomFormComponentType.SELECT_USER]: "选人组件"
} as const

/** 其他配置-自定义表单操作类型 */
export enum EnumCustomFormOperationType {
  PLUS = 1,
  MINUS = 2
}

/** 其他配置-自定义表单操作类型映射 */
export const EnumCustomFormOperationTypeMap: Record<EnumCustomFormOperationType, string> = {
  [EnumCustomFormOperationType.PLUS]: "+",
  [EnumCustomFormOperationType.MINUS]: "-"
} as const

/** 其他配置-自定义表单MIME类型 */
export enum EnumMIMEType {
  JPG,
  JPEG,
  PNG,
  SVG,
  PDF,
  XLS,
  XLSX,
  DOC,
  DOCX,
  TXT,
  RAR,
  ZIP
}

/** 其他配置-自定义表单MIME类型映射 */
export const EnumMIMETypeMap: Record<EnumMIMEType, string> = {
  [EnumMIMEType.JPG]: ".jpg",
  [EnumMIMEType.JPEG]: ".jpeg",
  [EnumMIMEType.PNG]: ".png",
  [EnumMIMEType.SVG]: ".svg",
  [EnumMIMEType.PDF]: ".pdf",
  [EnumMIMEType.XLS]: ".xls",
  [EnumMIMEType.XLSX]: ".xlsx",
  [EnumMIMEType.DOC]: ".doc",
  [EnumMIMEType.DOCX]: ".docx",
  [EnumMIMEType.TXT]: ".txt",
  [EnumMIMEType.RAR]: ".rar",
  [EnumMIMEType.ZIP]: ".zip"
} as const

/** 上传文件大小类型 */
export enum EnumFileSize {
  KB = "KB", // 千字节
  MB = "MB", // 兆字节
  GB = "GB", // 千兆字节
  TB = "TB" // 太字节
}

/** 上传文件大小类型映射 */
export const EnumFileSizeMap: Record<EnumFileSize, number> = {
  [EnumFileSize.KB]: 1024,
  [EnumFileSize.MB]: 1024 * 1024,
  [EnumFileSize.GB]: 1024 * 1024 * 1024,
  [EnumFileSize.TB]: 1024 * 1024 * 1024 * 1024
} as const

const isMac = navigator.userAgent.toUpperCase().indexOf("MAC") >= 0

/** 文件MIME类型映射 */
export const EnumFileMIMETypeMap: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".bmp": "image/bmp",
  ".mp3": "audio/mp3",
  ".mp4": "video/mp4",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".txt": "text/plain",
  ".rar": isMac ? "application/x-rar" : ".rar",
  ".zip": isMac ? "application/zip" : "application/x-zip-compressed"
}

export enum EnumSelectUser {
  Staff = "员工",
  Department = "部门",
  Post = "职位"
}

/** 选择用户类型 */
export const EnumSelectUserTypes = [
  {
    label: "按员工选择",
    value: "员工",
    type: 1
  },
  {
    label: "按部门选择",
    value: "部门",
    type: 2
  },
  {
    label: "按职位选择",
    value: "职位",
    type: 3
  }
]

export const EnumSelectUserWithoutSectionTypes = [
  {
    label: "按员工选择",
    value: "员工",
    type: 1
  },
  {
    label: "按职位选择",
    value: "职位",
    type: 3
  }
]

/** 在库检合格后剩余质保期类型 */
export enum EnumRemainingPeriodType {
  CUSTOM = 0, // 自定义
  PRODUCT = 1 // 产品质保期
}

/** 在库检合格后剩余质保期类型映射 */
export const EnumRemainingPeriodTypeMap: Record<EnumRemainingPeriodType, string> = {
  [EnumRemainingPeriodType.CUSTOM]: "自定义",
  [EnumRemainingPeriodType.PRODUCT]: "产品质保期"
} as const

/** 调用日志类型 */
export enum EnumExecutionLogType {
  DATA, // 同步主数据
  DIRECTIVE, // 同步指令
  PERFORMANCE // 同步实绩
}

/** 调用日志类型映射 */
export const EnumExecutionLogTypeMap: Record<EnumExecutionLogType, string> = {
  [EnumExecutionLogType.DATA]: "同步主数据",
  [EnumExecutionLogType.DIRECTIVE]: "同步指令",
  [EnumExecutionLogType.PERFORMANCE]: "同步实绩"
} as const

/** 生产报工记录-类型 */
export enum EnumProductionRecordType {
  QUANTITY = 1, // 按数量
  TIME = 2 // 按时长
}

/** 生产报工记录-类型映射 */
export const EnumProductionRecordTypeMap: Record<EnumProductionRecordType, string> = {
  [EnumProductionRecordType.QUANTITY]: "按数量",
  [EnumProductionRecordType.TIME]: "按时长"
} as const

/** 生产输出记录-来源类型 */
export enum EnumProductionOutputRecordSourceType {
  OUTPUT = 1, // 生产输出
  REVIEW_WITHDRAW = 2, // 评审-让步接收
  REVIEW_EASY_RETURN = 3 // 评审-简易返工
}

/** 生产输出记录-来源类型映射 */
export const EnumProductionOutputRecordSourceTypeMap: Record<
  EnumProductionOutputRecordSourceType,
  string
> = {
  [EnumProductionOutputRecordSourceType.OUTPUT]: "生产输出",
  [EnumProductionOutputRecordSourceType.REVIEW_WITHDRAW]: "评审-让步接收",
  [EnumProductionOutputRecordSourceType.REVIEW_EASY_RETURN]: "评审-简易返工"
} as const

/** 产品检验模式 */
export enum EnumProductInspectionMode {
  FREE = 1, // 免检
  SAMPLING = 2, // 抽检
  FULL = 3 // 全检
}

/** 产品检验模式映射 */
export const EnumProductInspectionModeMap: Record<EnumProductInspectionMode, string> = {
  [EnumProductInspectionMode.FREE]: "免检",
  [EnumProductInspectionMode.SAMPLING]: "抽检",
  [EnumProductInspectionMode.FULL]: "全检"
} as const

/** 产品检验类型 */
export enum EnumProductInspectionType {
  FIRST_SELF = 1, // 首检自检
  FIRST_SPECIAL = 2, // 首检专检
  POLLING_SELF = 3, // 巡检自检
  POLLING_SPECIAL = 4, // 巡检专检
  LAST_SELF = 5, // 末检自检
  LAST_SPECIAL = 6, // 末检专检
  PURCHASE_MATERIAL = 7, // 采购入库检
  FOREIGN_MATERIAL = 8, // 委外入库检
  PRODUCTION_IN = 9, // 生产入库检
  SHIPPING_OUT = 10, // 发货出库检
  RETURN_IN = 11, // 退货入库检
  IN_STOCK = 12, // 在库检
  FOREIGN_RETURN_IN = 13 // 委外退料入库检
}

/** 产品检验类型映射 */
export const EnumProductInspectionTypeMap: Record<EnumProductInspectionType, string> = {
  [EnumProductInspectionType.FIRST_SELF]: "首检自检",
  [EnumProductInspectionType.FIRST_SPECIAL]: "首检专检",
  [EnumProductInspectionType.POLLING_SELF]: "巡检自检",
  [EnumProductInspectionType.POLLING_SPECIAL]: "巡检专检",
  [EnumProductInspectionType.LAST_SELF]: "末检自检",
  [EnumProductInspectionType.LAST_SPECIAL]: "末检专检",
  [EnumProductInspectionType.PURCHASE_MATERIAL]: "采购入库检",
  [EnumProductInspectionType.FOREIGN_MATERIAL]: "委外入库检",
  [EnumProductInspectionType.PRODUCTION_IN]: "生产入库检",
  [EnumProductInspectionType.SHIPPING_OUT]: "发货出库检",
  [EnumProductInspectionType.RETURN_IN]: "退货入库检",
  [EnumProductInspectionType.IN_STOCK]: "在库检",
  [EnumProductInspectionType.FOREIGN_RETURN_IN]: "委外退料入库检"
} as const

/** 产品非过程检抽检方式 */
export enum EnumProductionSamplingMethod {
  PERCENTAGE = 1, // 按比例抽检
  GRADIENT = 2 // 按梯度抽检
}

/** 产品非过程检抽检方式映射 */
export const EnumProductionSamplingMethodMap: Record<EnumProductionSamplingMethod, string> = {
  [EnumProductionSamplingMethod.PERCENTAGE]: "按比例",
  [EnumProductionSamplingMethod.GRADIENT]: "按梯度"
} as const

/** 过程检-检验控制 */
export enum EnumProcessInspectionControl {
  EMPTY = 0, // 空
  NO_CONTROL = 1, // 不控
  WEAK_CONTROL = 2, // 弱控
  STRONG_CONTROL = 3 // 强控
}

/** 过程检-检验控制映射 */
export const EnumProcessInspectionControlMap: Record<EnumProcessInspectionControl, string> = {
  [EnumProcessInspectionControl.EMPTY]: "空",
  [EnumProcessInspectionControl.NO_CONTROL]: "不控",
  [EnumProcessInspectionControl.WEAK_CONTROL]: "弱控",
  [EnumProcessInspectionControl.STRONG_CONTROL]: "强控"
} as const

/** 过程检-检验模式 */
export enum EnumProcessInspectionMode {
  FREE = 1, // 免检
  SAMPLING = 2 // 抽检
}

/** 过程检-检验模式映射 */
export const EnumProcessInspectionModeMap: Record<EnumProcessInspectionMode, string> = {
  [EnumProcessInspectionMode.FREE]: "免检",
  [EnumProcessInspectionMode.SAMPLING]: "抽检"
} as const

/** 条码类型 */
export enum EnumBarcodeType {
  EMPTY = 0, // 未绑定
  PRODUCT = 1, // 产品
  VEHICLE = 2, // 载具
  DEVICE = 5, // 设备
  MRO = 7, // MRO
  EMPLOYEE = 8, // 员工
  AREA = 10, // 区域
  PACKAGE = 11 // 包装容器
}

/** 条码类型映射 */
export const EnumBarcodeTypeMap: Record<EnumBarcodeType, string> = {
  [EnumBarcodeType.EMPTY]: "未绑定",
  [EnumBarcodeType.PRODUCT]: "产品",
  [EnumBarcodeType.VEHICLE]: "载具",
  [EnumBarcodeType.DEVICE]: "设备",
  [EnumBarcodeType.MRO]: "MRO",
  [EnumBarcodeType.EMPLOYEE]: "员工",
  [EnumBarcodeType.AREA]: "区域",
  [EnumBarcodeType.PACKAGE]: "包装容器"
} as const

/** 工艺类型 */
export enum EnumCraftType {
  SINGLE = 1, // 单工艺
  GROUP = 2, // 工艺组
  AND = 3 // 且工艺
}

/** 工艺类型映射 */
export const EnumCraftTypeMap: Record<EnumCraftType, string> = {
  [EnumCraftType.SINGLE]: "单工艺",
  [EnumCraftType.GROUP]: "工艺组",
  [EnumCraftType.AND]: "且工艺"
} as const

/** 工艺业务类型 */
export enum EnumCraftBizType {
  // 加工，包装
  PROCESS = 1,
  PACK = 2
}

export const EnumCraftBizTypeMap: Record<EnumCraftBizType, string> = {
  [EnumCraftBizType.PROCESS]: "加工",
  [EnumCraftBizType.PACK]: "包装"
} as const

/** 工艺状态 */
export enum EnumCraftStatus {
  DESIGN = 1, // 设计中
  PUBLISHED = 2, // 已发布
  INVALID = 3 // 已作废
}

/** 工艺状态映射 */
export const EnumCraftStatusMap: Record<EnumCraftStatus, string> = {
  [EnumCraftStatus.DESIGN]: "未发布",
  [EnumCraftStatus.PUBLISHED]: "已发布",
  [EnumCraftStatus.INVALID]: "已作废"
} as const

/** 工艺路线-子工艺列表父级类型 */
export enum EnumParentCraftType {
  CRAFT_ROUTE = 1, // 工艺路线
  CRAFT_GROUP = 2, // 工艺组
  CRAFT_AND = 3 // 且工艺
}

/** 工艺路线-包装规范容器 */
export enum EnumPackContainerType {
  BAG = 1, // 包
  PACKAGE = 2, // 袋
  BOX = 3 // 箱
}

/** 工艺路线-包装规范映射 */
export const EnumPackContainerTypeMap: Record<EnumPackContainerType, string> = {
  [EnumPackContainerType.BAG]: "包",
  [EnumPackContainerType.PACKAGE]: "袋",
  [EnumPackContainerType.BOX]: "箱"
} as const

/** 首检触发方式 */
export enum EnumFirstInspectionTriggerType {
  // 1-换天，2-换班，3-换型，4-换单，5-更换MRO
  DAY = 1,
  // BATCH = 2,
  MODEL = 3,
  ORDER = 4,
  MRO = 5
}

/** 首检触发方式映射 */
export const EnumFirstInspectionTriggerTypeMap: Record<EnumFirstInspectionTriggerType, string> = {
  [EnumFirstInspectionTriggerType.DAY]: "换天",
  // [EnumFirstInspectionTriggerType.BATCH]: "换班",
  [EnumFirstInspectionTriggerType.MODEL]: "换型",
  [EnumFirstInspectionTriggerType.ORDER]: "换单",
  [EnumFirstInspectionTriggerType.MRO]: "更换MRO"
} as const

/** 生产订单类型 */
export enum EnumProductionOrderType {
  QUANTITY = 1, // 量产
  REPAIR = 5, // 返工
  TEST = 10, // 试制
  REMODEL = 15 // 改制
}

/** 生产订单类型映射 */
export const EnumProductionOrderTypeMap: Record<EnumProductionOrderType, string> = {
  [EnumProductionOrderType.QUANTITY]: "量产",
  [EnumProductionOrderType.REPAIR]: "返工",
  [EnumProductionOrderType.TEST]: "试制",
  [EnumProductionOrderType.REMODEL]: "改制"
} as const

/** 生产订单状态 */
export enum EnumProductionOrderStatus {
  REVIEW = 1, // 已复核
  UN_REVIEW = 5, // 未复核
  SETTLE = 9, // 已结案
  VOID = 3 // 已作废
}

/** 生产订单状态映射 */
export const EnumProductionOrderStatusMap: Record<EnumProductionOrderStatus, string> = {
  [EnumProductionOrderStatus.REVIEW]: "已复核",
  [EnumProductionOrderStatus.UN_REVIEW]: "未复核",
  [EnumProductionOrderStatus.SETTLE]: "已结案",
  [EnumProductionOrderStatus.VOID]: "已作废"
} as const

export const EnumProductionOrderStatusTagMap: Record<EnumProductionOrderStatus, string> = {
  [EnumProductionOrderStatus.REVIEW]: "success",
  [EnumProductionOrderStatus.UN_REVIEW]: "danger",
  [EnumProductionOrderStatus.SETTLE]: "warning",
  [EnumProductionOrderStatus.VOID]: "info"
} as const

/** 生产订单来源 */
export enum EnumProductionOrderSource {
  MES = 1, // MES
  ERP = 2 // ERP
}

/** 生产订单来源映射 */
export const EnumProductionOrderSourceMap: Record<EnumProductionOrderSource, string> = {
  [EnumProductionOrderSource.MES]: "MES",
  [EnumProductionOrderSource.ERP]: "ERP"
} as const

/** 生产方式 */
export enum EnumProductionType {
  CUSTOM = 1, // 自制
  OUTSOURCING = 2 // 委外
}

/** 生产方式映射 */
export const EnumProductionTypeMap: Record<EnumProductionType, string> = {
  [EnumProductionType.CUSTOM]: "自制",
  [EnumProductionType.OUTSOURCING]: "委外"
} as const

/** 销售订单优先级 */
export enum EnumSaleOrderPriority {
  LOW = 10, // 低
  NORMAL = 20, // 中
  HIGH = 30 // 高
}

/** 销售订单优先级映射 */
export const EnumSaleOrderPriorityMap: Record<EnumSaleOrderPriority, string> = {
  [EnumSaleOrderPriority.LOW]: "低",
  [EnumSaleOrderPriority.NORMAL]: "中",
  [EnumSaleOrderPriority.HIGH]: "高"
} as const

/** 委外订单状态 */
export enum EnumOutsourcingOrderStatus {
  UN_REVIEW = 5, // 未复核
  REVIEWED = 6, // 已复核
  RECEIVED = 8, // 已收货
  SETTLE = 10 // 已结案
}

/** 委外订单状态映射 */
export const EnumOutsourcingOrderStatusMap: Record<EnumOutsourcingOrderStatus, string> = {
  [EnumOutsourcingOrderStatus.UN_REVIEW]: "未复核",
  [EnumOutsourcingOrderStatus.REVIEWED]: "已复核",
  [EnumOutsourcingOrderStatus.RECEIVED]: "已收货",
  [EnumOutsourcingOrderStatus.SETTLE]: "已结案"
} as const

export const EnumOutsourcingOrderStatusTagMap: Record<EnumOutsourcingOrderStatus, string> = {
  [EnumOutsourcingOrderStatus.UN_REVIEW]: "danger",
  [EnumOutsourcingOrderStatus.REVIEWED]: "warning",
  [EnumOutsourcingOrderStatus.RECEIVED]: "primary",
  [EnumOutsourcingOrderStatus.SETTLE]: "success"
} as const

/** 委外退料单状态 */
export enum EnumOutsourcingReturnOrderStatus {
  UN_RECHECK = 5, // 未复核
  UN_RECEIPT = 6, // 未收货
  PROCESSING = 7, // 进行中
  SETTLE = 10 // 已结案
}

/** 委外退料单状态映射 */
export const EnumOutsourcingReturnOrderStatusMap: Record<EnumOutsourcingReturnOrderStatus, string> =
  {
    [EnumOutsourcingReturnOrderStatus.UN_RECHECK]: "未复核",
    [EnumOutsourcingReturnOrderStatus.UN_RECEIPT]: "未收货",
    [EnumOutsourcingReturnOrderStatus.PROCESSING]: "进行中",
    [EnumOutsourcingReturnOrderStatus.SETTLE]: "已结案"
  } as const

export const EnumOutsourcingReturnOrderStatusTagMap: Record<
  EnumOutsourcingReturnOrderStatus,
  string
> = {
  [EnumOutsourcingReturnOrderStatus.UN_RECHECK]: "danger",
  [EnumOutsourcingReturnOrderStatus.UN_RECEIPT]: "warning",
  [EnumOutsourcingReturnOrderStatus.PROCESSING]: "primary",
  [EnumOutsourcingReturnOrderStatus.SETTLE]: "success"
} as const

/** 委外类型 */
export enum EnumOutsourcingType {
  ORDER = 3, // 订单委外
  PROCESS = 4 // 工序委外
}

/** 委外类型映射 */
export const EnumOutsourcingTypeMap: Record<EnumOutsourcingType, string> = {
  [EnumOutsourcingType.ORDER]: "订单委外",
  [EnumOutsourcingType.PROCESS]: "工序委外"
} as const

/** 采购订单状态 */
export enum EnumPurchaseOrderStatus {
  UN_RECHECK = -1, // 未复核
  UN_RECEIPT = 0, // 未到货
  PROCESSING = 1, // 进行中
  SETTLE = 2 // 已结案
}

/** 采购订单状态映射 */
export const EnumPurchaseOrderStatusMap: Record<EnumPurchaseOrderStatus, string> = {
  [EnumPurchaseOrderStatus.UN_RECHECK]: "未复核",
  [EnumPurchaseOrderStatus.UN_RECEIPT]: "未到货",
  [EnumPurchaseOrderStatus.PROCESSING]: "进行中",
  [EnumPurchaseOrderStatus.SETTLE]: "已结案"
} as const

export const EnumPurchaseOrderStatusTagMap: Record<EnumPurchaseOrderStatus, string> = {
  [EnumPurchaseOrderStatus.UN_RECHECK]: "danger",
  [EnumPurchaseOrderStatus.UN_RECEIPT]: "warning",
  [EnumPurchaseOrderStatus.PROCESSING]: "primary",
  [EnumPurchaseOrderStatus.SETTLE]: "success"
} as const

/** 销售订单状态 */
export enum EnumSaleOrderStatus {
  UN_SHIPPED = 0, // 未发货
  PROCESSING = 1, // 进行中
  SHIPPED = 2, // 已结案
  Un_Review = 3 // 未复核
}

/** 销售订单状态映射 */
export const EnumSaleOrderStatusMap: Record<EnumSaleOrderStatus, string> = {
  [EnumSaleOrderStatus.UN_SHIPPED]: "未发货",
  [EnumSaleOrderStatus.PROCESSING]: "进行中",
  [EnumSaleOrderStatus.SHIPPED]: "已结案",
  [EnumSaleOrderStatus.Un_Review]: "未复核"
} as const

export const EnumSaleOrderStatusTagMap: Record<EnumSaleOrderStatus, string> = {
  [EnumSaleOrderStatus.UN_SHIPPED]: "danger",
  [EnumSaleOrderStatus.PROCESSING]: "primary",
  [EnumSaleOrderStatus.SHIPPED]: "success",
  [EnumSaleOrderStatus.Un_Review]: "warning"
} as const

/** 领料用途 */
export enum EnumGetMaterialPurpose {
  PRODUCTION = 1, // 生产-任务
  OUTSOURCING = 2, // 委外
  PACK = 3, // 包装
  DELIVERY = 4 // 发货
}

/** 领料用途映射 */
export const EnumGetMaterialPurposeMap: Record<EnumGetMaterialPurpose, string> = {
  [EnumGetMaterialPurpose.PRODUCTION]: "生产-任务",
  [EnumGetMaterialPurpose.OUTSOURCING]: "委外",
  [EnumGetMaterialPurpose.PACK]: "包装",
  [EnumGetMaterialPurpose.DELIVERY]: "发货"
} as const

/** 领料计划单状态 */
export enum EnumPreparationMaterialPlanStatus {
  UN_RECHECK = 1, // 待复核
  RECHECK = 2, // 已复核
  SETTLE = 10 // 已结案
}

/** 领料计划单状态映射 */
export const EnumPreparationMaterialPlanStatusMap: Record<
  EnumPreparationMaterialPlanStatus,
  string
> = {
  [EnumPreparationMaterialPlanStatus.UN_RECHECK]: "待复核",
  [EnumPreparationMaterialPlanStatus.RECHECK]: "已复核",
  [EnumPreparationMaterialPlanStatus.SETTLE]: "已结案"
} as const

export const EnumPreparationMaterialPlanStatusTagMap: Record<
  EnumPreparationMaterialPlanStatus,
  string
> = {
  [EnumPreparationMaterialPlanStatus.UN_RECHECK]: "danger",
  [EnumPreparationMaterialPlanStatus.RECHECK]: "primary",
  [EnumPreparationMaterialPlanStatus.SETTLE]: "success"
} as const

export enum EnumPreparationMaterialTaskStatus {
  // 1=未领料 2=领料中 10=已结案
  UN_PREPARE = 1,
  PREPARING = 2,
  SETTLE = 10
}

/** 领料任务状态映射 */
export const EnumPreparationMaterialTaskStatusMap: Record<
  EnumPreparationMaterialTaskStatus,
  string
> = {
  [EnumPreparationMaterialTaskStatus.UN_PREPARE]: "未领料",
  [EnumPreparationMaterialTaskStatus.PREPARING]: "领料中",
  [EnumPreparationMaterialTaskStatus.SETTLE]: "已结案"
} as const

export const EnumPreparationMaterialTaskStatusTagMap: Record<
  EnumPreparationMaterialTaskStatus,
  string
> = {
  [EnumPreparationMaterialTaskStatus.UN_PREPARE]: "danger",
  [EnumPreparationMaterialTaskStatus.PREPARING]: "primary",
  [EnumPreparationMaterialTaskStatus.SETTLE]: "success"
} as const

/** 领料计划单类型 */
export enum EnumPreparationMaterialPlanType {
  NORMAL = 1, // 正常领料
  OVER = 2 // 超领领料
}

/** 领料计划单类型映射 */
export const EnumPreparationMaterialPlanTypeMap: Record<EnumPreparationMaterialPlanType, string> = {
  [EnumPreparationMaterialPlanType.NORMAL]: "正常领料",
  [EnumPreparationMaterialPlanType.OVER]: "超领领料"
} as const

/** 生产任务状态 */
export enum EnumProductionTaskStatus {
  REVIEWED = 1, // 未开始
  RUNNING = 6, // 进行中
  PAUSE = 8, // 已暂停
  COMPLETED = 9 // 已结案
}

/** 生产任务状态映射 */
export const EnumProductionTaskStatusMap: Record<EnumProductionTaskStatus, string> = {
  [EnumProductionTaskStatus.REVIEWED]: "未开始",
  [EnumProductionTaskStatus.RUNNING]: "进行中",
  [EnumProductionTaskStatus.PAUSE]: "已暂停",
  [EnumProductionTaskStatus.COMPLETED]: "已结案"
} as const

/** 工艺流程类型 */
export enum EnumCraftFlowType {
  COPY_CRAFT = 1, // 复制工艺路线
  ORDER_CRAFT = 2 // 订单工艺
}

/** 工艺流程类型映射 */
export const EnumCraftFlowTypeMap: Record<EnumCraftFlowType, string> = {
  [EnumCraftFlowType.COPY_CRAFT]: "复制工艺路线",
  [EnumCraftFlowType.ORDER_CRAFT]: "订单工艺"
} as const

/** 采购退货状态 */
export enum EnumPurchaseReturnStatus {
  UN_START = 0, // 未开始
  PROCESSING = 1, // 进行中
  SETTLE = 2 // 已结案
}

/** 采购退货状态映射 */
export const EnumPurchaseReturnStatusMap: Record<EnumPurchaseReturnStatus, string> = {
  [EnumPurchaseReturnStatus.UN_START]: "未开始",
  [EnumPurchaseReturnStatus.PROCESSING]: "进行中",
  [EnumPurchaseReturnStatus.SETTLE]: "已结案"
} as const

export const EnumPurchaseReturnStatusTagMap: Record<EnumPurchaseReturnStatus, string> = {
  [EnumPurchaseReturnStatus.UN_START]: "danger",
  [EnumPurchaseReturnStatus.PROCESSING]: "primary",
  [EnumPurchaseReturnStatus.SETTLE]: "success"
} as const

/** 机器标准类型 */
export enum EnumMachineStandardType {
  MODEL = 1, // 按设备模型
  DEVICE = 2 // 按设备
}

/** 机器标准类型映射 */
export const EnumMachineStandardTypeMap: Record<EnumMachineStandardType, string> = {
  [EnumMachineStandardType.MODEL]: "按设备模型",
  [EnumMachineStandardType.DEVICE]: "按设备"
} as const

/** 文档状态 */
export enum EnumDocumentStatus {
  Normal = 1, // 正常
  Review = 2, // 审核中
  Cancelled = -1 // 已作废
}

/** 文档状态映射 */
export const EnumDocumentStatusMap: Record<EnumDocumentStatus, string> = {
  [EnumDocumentStatus.Normal]: "正常",
  [EnumDocumentStatus.Review]: "审核中",
  [EnumDocumentStatus.Cancelled]: "已作废"
} as const

/** 文档状态tag映射 */
export const EnumDocumentStatusTagMap: Record<EnumDocumentStatus, string> = {
  [EnumDocumentStatus.Normal]: "success",
  [EnumDocumentStatus.Review]: "warning",
  [EnumDocumentStatus.Cancelled]: "danger"
}

/** 产品出库类型 */
export enum EnumProductOutStockType {
  DELIVERY = 1, // 发货出库
  // MRO = 2, // MRO出库
  TRANSFER = 3, // 调拨出库
  PRODUCTION_GET_MATERIAL = 4, // 生产领料出库
  OTHER = 5, // 杂项出库
  OUTSOURCING_GET_MATERIAL = 6, // 委外领料出库
  PURCHASE_RETURN = 7, // 采购退货出库
  LOST = 8, // 盘亏出库
  // DELIVERY_MATERIAL = 9, // 领料委外配送出库
  // MATERIAL = 10, // 领料出库
  PACKAGE_GET_MATERIAL = 11 // 包装领料出库
}

/** 产品出库类型映射 */
export const EnumProductOutStockTypeMap: Record<EnumProductOutStockType, string> = {
  [EnumProductOutStockType.DELIVERY]: "发货出库",
  // [EnumProductOutStockType.MRO]: "MRO出库",
  [EnumProductOutStockType.TRANSFER]: "调拨出库",
  [EnumProductOutStockType.PRODUCTION_GET_MATERIAL]: "生产领料出库",
  [EnumProductOutStockType.OTHER]: "杂项出库",
  [EnumProductOutStockType.OUTSOURCING_GET_MATERIAL]: "委外领料出库",
  [EnumProductOutStockType.PURCHASE_RETURN]: "采购退货出库",
  [EnumProductOutStockType.LOST]: "盘亏出库",
  // [EnumProductOutStockType.DELIVERY_MATERIAL]: "领料委外配送出库",
  // [EnumProductOutStockType.MATERIAL]: "领料出库",
  [EnumProductOutStockType.PACKAGE_GET_MATERIAL]: "包装领料出库"
} as const

export const outboundTypeDefinitions = [
  { value: EnumProductOutStockType.PURCHASE_RETURN, label: "采购退货出库" },
  { value: EnumProductOutStockType.PRODUCTION_GET_MATERIAL, label: "生产领料出库" },
  { value: EnumProductOutStockType.OUTSOURCING_GET_MATERIAL, label: "委外领料出库" },
  { value: EnumProductOutStockType.PACKAGE_GET_MATERIAL, label: "包装领料出库" },
  { value: EnumProductOutStockType.DELIVERY, label: "发货出库" },
  { value: EnumProductOutStockType.TRANSFER, label: "调拨出库" },
  { value: EnumProductOutStockType.LOST, label: "盘亏出库" },
  { value: EnumProductOutStockType.OTHER, label: "杂项出库" }
]

/** 批次模型类型 */
export enum EnumBatchModelType {
  Purchase = 1, // 采购批次
  Production = 2, // 生产批次
  Return = 3, // 退货批次
  Inventory = 4, // 盘点批次
  Merge = 5, // 合并批次
  Other = 6 // 其他批次
}

/** 批次模型类型映射 */
export const EnumBatchModelTypeMap: Record<EnumBatchModelType, string> = {
  [EnumBatchModelType.Purchase]: "采购批次",
  [EnumBatchModelType.Production]: "生产批次",
  [EnumBatchModelType.Return]: "退货批次",
  [EnumBatchModelType.Inventory]: "盘点批次",
  [EnumBatchModelType.Merge]: "合并批次",
  [EnumBatchModelType.Other]: "其他批次"
}

/** 入库类型 */
export enum EnumInboundType {
  PURCHASE = 1, // 采购入库
  // MRO = 2, // MRO入库
  TRANSFER = 3, // 调拨入库
  RETURN = 4, // 退货入库
  PRODUCTION_MATERIAL_RETURN = 5, // 生产退料入库
  PRODUCTION = 6, // 生产入库
  OTHER = 7, // 杂项入库
  GAIN = 8, // 盘盈入库
  // OTHER_IN = 9, // 备料配送入库
  OTHER_SIGN = 10, // 备料签收入库
  OUTSOURCING = 15, // 委外入库
  OUTSOURCING_RETURN = 16, // 委外退料入库
  PACKAGE_MATERIAL_RETURN = 17, // 包装退料入库
  PACKAGE_RETURN = 18 // 包装入库
}

/** 入库类型映射 */
export const EnumInboundTypeMap: Record<EnumInboundType, string> = {
  [EnumInboundType.PURCHASE]: "采购入库",
  [EnumInboundType.TRANSFER]: "调拨入库",
  [EnumInboundType.RETURN]: "退货入库",
  [EnumInboundType.PRODUCTION_MATERIAL_RETURN]: "生产退料入库",
  [EnumInboundType.PRODUCTION]: "生产入库",
  [EnumInboundType.OTHER]: "杂项入库",
  [EnumInboundType.GAIN]: "盘盈入库",
  // [EnumInboundType.OTHER_IN]: "备料配送入库",
  [EnumInboundType.OTHER_SIGN]: "备料签收入库",
  [EnumInboundType.OUTSOURCING]: "委外入库",
  [EnumInboundType.OUTSOURCING_RETURN]: "委外退料入库",
  [EnumInboundType.PACKAGE_MATERIAL_RETURN]: "包装退料入库",
  [EnumInboundType.PACKAGE_RETURN]: "包装入库"
} as const

export const inboundTypeDefinitions = [
  { value: EnumInboundType.PURCHASE, label: "采购入库" },
  { value: EnumInboundType.PRODUCTION, label: "生产入库" },
  { value: EnumInboundType.OUTSOURCING, label: "委外入库" },
  { value: EnumInboundType.PACKAGE_RETURN, label: "包装入库" },
  { value: EnumInboundType.RETURN, label: "退货入库" },
  { value: EnumInboundType.OTHER_SIGN, label: "备料签收入库" },
  { value: EnumInboundType.PRODUCTION_MATERIAL_RETURN, label: "生产退料入库" },
  { value: EnumInboundType.OUTSOURCING_RETURN, label: "委外退料入库" },
  { value: EnumInboundType.PACKAGE_MATERIAL_RETURN, label: "包装退料入库" },
  { value: EnumInboundType.TRANSFER, label: "调拨入库" },
  { value: EnumInboundType.GAIN, label: "盘盈入库" },
  { value: EnumInboundType.OTHER, label: "杂项入库" }
]

export enum EnumUnqualifiedOriginType {
  First_self = 1, // 首检自检
  First_special = 2, // 首检专检
  Patrol_self = 3, // 巡检自检
  Patrol_special = 4, // 巡检专检
  Last_self = 5, // 末检自检
  Last_special = 6, // 末检专检
  Purchase_material = 7, // 采购来料检
  Foreign_material = 8, // 委外来料检
  Production_in = 9, // 生产入库检
  Delivery_out = 10, // 发货出库检
  Return_In = 11, // 退货入库检
  In_stock = 12, // 在库检
  Foreign_return_in = 13, // 委外退料入库检
  Manual_create = 100, // 手动创建
  Defective_registration = 111, // 不合格登记
  Easy_return = 112 // 简易返工
}

/** 不合格品来源类型映射 */
export const EnumUnqualifiedOriginTypeMap: Record<EnumUnqualifiedOriginType, string> = {
  [EnumUnqualifiedOriginType.First_self]: "首检自检",
  [EnumUnqualifiedOriginType.First_special]: "首检专检",
  [EnumUnqualifiedOriginType.Patrol_self]: "巡检自检",
  [EnumUnqualifiedOriginType.Patrol_special]: "巡检专检",
  [EnumUnqualifiedOriginType.Last_self]: "末检自检",
  [EnumUnqualifiedOriginType.Last_special]: "末检专检",
  [EnumUnqualifiedOriginType.Purchase_material]: "采购来料检",
  [EnumUnqualifiedOriginType.Foreign_material]: "委外来料检",
  [EnumUnqualifiedOriginType.Production_in]: "生产入库检",
  [EnumUnqualifiedOriginType.Delivery_out]: "发货出库检",
  [EnumUnqualifiedOriginType.Return_In]: "退货入库检",
  [EnumUnqualifiedOriginType.In_stock]: "在库检",
  [EnumUnqualifiedOriginType.Foreign_return_in]: "委外退料入库检",
  [EnumUnqualifiedOriginType.Manual_create]: "手动创建",
  [EnumUnqualifiedOriginType.Defective_registration]: "不合格登记",
  [EnumUnqualifiedOriginType.Easy_return]: "简易返工"
} as const

/** 载具类别  */
export enum EnumVehicleType {
  Box = 1, // 箱
  Tray = 2 // 托
}

/** 载具类别映射 */
export const EnumVehicleTypeMap = {
  [EnumVehicleType.Box]: "箱",
  [EnumVehicleType.Tray]: "托"
} as const

export enum EnumDeviceTaskStatusType {
  Normal = 0,
  WaitMaintain = 21,
  WaitPatrol = 11,
  WaitSpotCheck = 1,
  MaintainException = 22,
  PatrolException = 12,
  SpotCheckException = 2,
  WaitRepair = 31,
  WaitScrap = 32,
  Scraped = 33
}

export enum EnumDeviceUseStatusType {
  Stopping,
  Useing
}

export enum EnumEquipmentSpotTaskType {
  Expired = 0,
  Wait = 1,
  Executing,
  Finished
}

export const EnumEquipmentSpotTaskTypeMap: Record<EnumEquipmentSpotTaskType, string> = {
  [EnumEquipmentSpotTaskType.Executing]: "执行中",
  [EnumEquipmentSpotTaskType.Finished]: "已完成",
  [EnumEquipmentSpotTaskType.Expired]: "已过期",
  [EnumEquipmentSpotTaskType.Wait]: "待执行"
} as const

export const EnumEquipmentSpotTaskTagTypeMap: Record<EnumEquipmentSpotTaskType, string> = {
  [EnumEquipmentSpotTaskType.Executing]: "primary",
  [EnumEquipmentSpotTaskType.Finished]: "success",
  [EnumEquipmentSpotTaskType.Expired]: "danger",
  [EnumEquipmentSpotTaskType.Wait]: "warning"
} as const

export enum EnumEquipmentExceptionSourceType {
  SpotCheck = 1,
  Patrol,
  Maintain
}

export const EnumEquipmentExceptionSourceTypeMap: Record<EnumEquipmentExceptionSourceType, string> =
  {
    [EnumEquipmentExceptionSourceType.SpotCheck]: "点检",
    [EnumEquipmentExceptionSourceType.Patrol]: "巡检",
    [EnumEquipmentExceptionSourceType.Maintain]: "保养"
  } as const

export enum EnumEquipmentMaintainPlanStatusType {
  Expired,
  Unpublished,
  Published
}

export const EnumEquipmentMaintainPlanStatusTypeMap: Record<
  EnumEquipmentMaintainPlanStatusType,
  string
> = {
  [EnumEquipmentMaintainPlanStatusType.Expired]: "已过期",
  [EnumEquipmentMaintainPlanStatusType.Unpublished]: "未发布",
  [EnumEquipmentMaintainPlanStatusType.Published]: "已发布"
} as const

export const EnumEquipmentMaintainPlanStatusTagTypeMap: Record<
  EnumEquipmentMaintainPlanStatusType,
  string
> = {
  [EnumEquipmentMaintainPlanStatusType.Expired]: "danger",
  [EnumEquipmentMaintainPlanStatusType.Unpublished]: "warning",
  [EnumEquipmentMaintainPlanStatusType.Published]: "success"
} as const

export enum EnumEquipmentMaintenanceYearPlanStatusType {
  Unreviewed,
  Reviewed,
  Voided
}

export const EnumEquipmentMaintenanceYearPlanStatusTypeMap: Record<
  EnumEquipmentMaintenanceYearPlanStatusType,
  string
> = {
  [EnumEquipmentMaintenanceYearPlanStatusType.Unreviewed]: "未复核",
  [EnumEquipmentMaintenanceYearPlanStatusType.Reviewed]: "已复核",
  [EnumEquipmentMaintenanceYearPlanStatusType.Voided]: "已作废"
} as const

export const EnumEquipmentMaintenanceYearPlanStatusTagTypeMap: Record<
  EnumEquipmentMaintenanceYearPlanStatusType,
  string
> = {
  [EnumEquipmentMaintenanceYearPlanStatusType.Unreviewed]: "warning",
  [EnumEquipmentMaintenanceYearPlanStatusType.Reviewed]: "success",
  [EnumEquipmentMaintenanceYearPlanStatusType.Voided]: "info"
} as const

export enum EnumEquipmentRepairSolution {
  Repair = 1,
  Scrap
}

export const EnumEquipmentRepairSolutionMap: Record<EnumEquipmentRepairSolution, string> = {
  [EnumEquipmentRepairSolution.Repair]: "修复",
  [EnumEquipmentRepairSolution.Scrap]: "报废"
} as const

export enum EnumEquipmentRepairSourceType {
  SpotCheck = 1,
  Patrol,
  Maintain,
  Manual
}

export const EnumEquipmentRepairSourceTypeMap: Record<EnumEquipmentRepairSourceType, string> = {
  [EnumEquipmentRepairSourceType.SpotCheck]: "点检异常",
  [EnumEquipmentRepairSourceType.Patrol]: "巡检异常",
  [EnumEquipmentRepairSourceType.Maintain]: "保养异常",
  [EnumEquipmentRepairSourceType.Manual]: "手动创建"
} as const

export enum EnumEquipmentScrapStatusType {
  Applying = 1,
  Passed,
  Failed
}

export const EnumEquipmentScrapStatusTypeMap: Record<EnumEquipmentRepairSourceType, string> = {
  [EnumEquipmentScrapStatusType.Applying]: "申请中",
  [EnumEquipmentScrapStatusType.Passed]: "已通过",
  [EnumEquipmentScrapStatusType.Failed]: "未通过"
}

export const EnumEquipmentScrapStatusTagTypeMap: Record<EnumEquipmentRepairSourceType, string> = {
  [EnumEquipmentScrapStatusType.Applying]: "warning",
  [EnumEquipmentScrapStatusType.Passed]: "success",
  [EnumEquipmentScrapStatusType.Failed]: "danger"
} as const

export enum EnumEquipmentScrapSourceType {
  Maintain = 1,
  Repair,
  Manual
}

export const EnumEquipmentScrapSourceTypeMap: Record<EnumEquipmentScrapSourceType, string> = {
  [EnumEquipmentScrapSourceType.Maintain]: "保养",
  [EnumEquipmentScrapSourceType.Repair]: "维修",
  [EnumEquipmentScrapSourceType.Manual]: "手动创建"
}

/** 仓库类型枚举 */
export const EnumWarehouseType = {
  Raw_material: 1, // 原料库
  Product: 2, // 成品库
  Semi_product: 3, // 半成品库
  Line_side: 4, // 线边库
  Defective_product: 5, // 不合格品库
  Scrap: 6, // 报废库
  MRO: 7, // MRO库
  EPC_full_check: 8 // EPC全检库
}

/** 仓库类型映射 */
export const EnumWarehouseTypeMap: Record<EnumWarehouseType, string> = {
  [EnumWarehouseType.Raw_material]: "原料库",
  [EnumWarehouseType.Product]: "成品库",
  [EnumWarehouseType.Semi_product]: "半成品库",
  [EnumWarehouseType.Line_side]: "线边库",
  [EnumWarehouseType.Defective_product]: "不合格品库",
  [EnumWarehouseType.Scrap]: "报废库",
  [EnumWarehouseType.MRO]: "MRO库",
  [EnumWarehouseType.EPC_full_check]: "EPC全检库"
} as const

/** 发货订单状态 */
export enum EnumDeliveryPlanStatus {
  Reviewed = 1, // 未开始，已复核
  Not_reviewed = 5, // 未复核
  Underway = 6, // 进行中
  Settled = 9 // 已结案
}

/** 发货订单状态映射 */
export const EnumDeliveryPlanStatusMap: Record<EnumDeliveryPlanStatus, string> = {
  [EnumDeliveryPlanStatus.Not_reviewed]: "未复核",
  [EnumDeliveryPlanStatus.Reviewed]: "未开始",
  [EnumDeliveryPlanStatus.Underway]: "进行中",
  [EnumDeliveryPlanStatus.Settled]: "已结案"
} as const

export const EnumDeliveryPlanStatusTagMap: Record<EnumDeliveryPlanStatus, string> = {
  [EnumDeliveryPlanStatus.Not_reviewed]: "warning",
  [EnumDeliveryPlanStatus.Reviewed]: "danger",
  [EnumDeliveryPlanStatus.Underway]: "primary",
  [EnumDeliveryPlanStatus.Settled]: "success"
} as const

/** 退货订单状态 */
export enum EnumReturnPlanStatus {
  Unfinished = 0, // 未结
  Finished = 1 // 已结
}

/** 退货订单状态映射 */
export const EnumReturnPlanStatusMap: Record<EnumReturnPlanStatus, string> = {
  [EnumReturnPlanStatus.Unfinished]: "未结",
  [EnumReturnPlanStatus.Finished]: "已结"
} as const

export const EnumReturnPlanStatusTagMap: Record<EnumReturnPlanStatus, string> = {
  [EnumReturnPlanStatus.Unfinished]: "danger",
  [EnumReturnPlanStatus.Finished]: "success"
} as const

/** 退货订单检验结果枚举 */
export enum EnumReturnResultType {
  Not_out = 0, // 结果未出
  Pass = 1, // 合格
  Fail = 2 // 不合格
}

/** 退货订单检验结果枚举映射 */
export const EnumReturnResultTypeMap: Record<EnumReturnResultType, string> = {
  [EnumReturnResultType.Not_out]: "结果未出",
  [EnumReturnResultType.Pass]: "合格",
  [EnumReturnResultType.Fail]: "不合格"
} as const

/** 仓库调拨状态 */
export enum EnumWarehouseAllotStatus {
  Un_start = 0, // 未开始
  Doing = 1, // 进行中
  Finished = 2 // 已结案
}

/** 仓库调拨状态映射 */
export const EnumWarehouseAllotStatusMap: Record<EnumWarehouseAllotStatus, string> = {
  [EnumWarehouseAllotStatus.Un_start]: "未开始",
  [EnumWarehouseAllotStatus.Doing]: "进行中",
  [EnumWarehouseAllotStatus.Finished]: "已结案"
} as const

export const EnumWarehouseAllotStatusTagMap: Record<EnumWarehouseAllotStatus, string> = {
  [EnumWarehouseAllotStatus.Un_start]: "danger",
  [EnumWarehouseAllotStatus.Doing]: "primary",
  [EnumWarehouseAllotStatus.Finished]: "success"
} as const

/** 仓库盘点单状态枚举 */
export enum EnumWarehouseCheckStatus {
  Un_publish = 0, // 未发布
  Published = 1, // 已发布
  Settled = 2 // 已结案
}

/** 仓库盘点单状态枚举映射 */
export const EnumWarehouseCheckStatusMap: Record<EnumWarehouseCheckStatus, string> = {
  [EnumWarehouseCheckStatus.Un_publish]: "未发布",
  [EnumWarehouseCheckStatus.Published]: "已发布",
  [EnumWarehouseCheckStatus.Settled]: "已结案"
} as const

export const EnumWarehouseCheckStatusTagMap: Record<EnumWarehouseCheckStatus, string> = {
  [EnumWarehouseCheckStatus.Un_publish]: "danger",
  [EnumWarehouseCheckStatus.Published]: "primary",
  [EnumWarehouseCheckStatus.Settled]: "success"
} as const

export enum EnumUnqualifiedReviewStatus {
  Un_start = -1, // 未开始
  Un_review = 0, // 未评审
  Reviewed = 1 // 已评审
}

export const EnumUnqualifiedReviewStatusMap: Record<EnumUnqualifiedReviewStatus, string> = {
  [EnumUnqualifiedReviewStatus.Un_start]: "未开始",
  [EnumUnqualifiedReviewStatus.Un_review]: "未评审",
  [EnumUnqualifiedReviewStatus.Reviewed]: "已评审"
} as const

/** 包装订单状态 */
export enum EnumPackOrderStatus {
  UN_START = 1, // 未开始
  UNDERWAY = 6, // 进行中
  PAUSE = 8, // 已暂停
  SETTLE = 9 // 已结案
}

/** 包装订单状态映射 */
export const EnumPackOrderStatusMap: Record<EnumPackOrderStatus, string> = {
  [EnumPackOrderStatus.UN_START]: "未开始",
  [EnumPackOrderStatus.UNDERWAY]: "进行中",
  [EnumPackOrderStatus.PAUSE]: "已暂停",
  [EnumPackOrderStatus.SETTLE]: "已结案"
} as const

/** 发货订单状态 */
export enum EnumDeliveryOrderStatus {
  UN_START = 1, // 未开始
  UN_REVIEW = 5, // 未复核
  UNDERWAY = 6, // 进行中
  SETTLE = 9 // 已结案
}

/** 发货订单状态映射 */
export const EnumDeliveryOrderStatusMap: Record<EnumDeliveryOrderStatus, string> = {
  [EnumDeliveryOrderStatus.UN_START]: "未开始",
  [EnumDeliveryOrderStatus.UN_REVIEW]: "未复核",
  [EnumDeliveryOrderStatus.UNDERWAY]: "进行中",
  [EnumDeliveryOrderStatus.SETTLE]: "已结案"
} as const

/** 系统故障类型业务分类枚举 */
export enum EnumSystemFaultType {
  Equipment = 1,
  Mro,
  Product,
  Andon
}

// 追溯/追踪
export enum TraceDirectionEnum {
  向前 = -1,
  向后 = 1,
  全向 = 0
}
export const traceDirectionNameMap: { [key in TraceDirectionEnum]: string } = {
  "-1": "追溯",
  "0": "追踪追溯",
  "1": "追踪"
}

export const EnumResultNameMap: Record<string, string> = {
  3: "让步接收",
  5: "返工",
  4: "报废",
  7: "改制",
  10: "简易返工",
  9: "工废",
  8: "料废",
  6: "退货",
  11: "退补"
} as const

/** 导入数据状态枚举 */
export enum EnumImportDataStatus {
  PENDING = "PENDING", // 等待中
  PROCESSING = "PROCESSING", // 执行中
  SUCCESS = "SUCCESS", // 成功
  FAILED = "FAILED", // 失败
  REJECTED = "REJECTED" // 被拒绝
}

/** 导入数据状态枚举映射 */
export const EnumImportDataStatusMap: Record<EnumImportDataStatus, string> = {
  [EnumImportDataStatus.PENDING]: "等待中",
  [EnumImportDataStatus.PROCESSING]: "执行中",
  [EnumImportDataStatus.SUCCESS]: "成功",
  [EnumImportDataStatus.FAILED]: "失败",
  [EnumImportDataStatus.REJECTED]: "被拒绝"
} as const

/** 不合格品统计分析报表状态枚举 */
export enum EnumNonconformingAnalysisReportStatus {
  Reviewed = 1,
  UnReviewed = 2
}

/** 不合格品统计分析报表状态枚举映射 */
export const EnumNonconformingAnalysisReportStatusMap: Record<
  EnumNonconformingAnalysisReportStatus,
  string
> = {
  [EnumNonconformingAnalysisReportStatus.Reviewed]: "已评审",
  [EnumNonconformingAnalysisReportStatus.UnReviewed]: "未评审"
} as const
