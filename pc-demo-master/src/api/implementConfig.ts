/** 系统配置-实施配置 */

import axios from "axios"

import type {
  ICustomFieldDatePickReq,
  ICustomFieldDatePickRes,
  ICustomFieldEmployeeSelectReq,
  ICustomFieldEmployeeSelectRes,
  ICustomFieldFileUpdateReq,
  ICustomFieldFileUpdateRes,
  ICustomFieldInputReq,
  ICustomFieldInputRes,
  ICustomFieldMultipleSelectReq,
  ICustomFieldMultipleSelectRes,
  ICustomFieldNumberStepReq,
  ICustomFieldNumberStepRes,
  ICustomFieldSingleSelectReq,
  ICustomFieldSingleSelectRes,
  ICustomFieldSwitchReq,
  ICustomFieldSwitchRes,
  IImplementConfigBaseParams,
  IImplementConfigMaterialFlowParams,
  IImplementConfigProductionParams,
  IImplementConfigQualityParams
} from "@/types/base-info/implement-config"
import type { IResponse } from "@/types/common"

/** 获取实施配置-物流运营配置 */
export const queryImplementConfigMaterialFlowDetail = async () => {
  const res =
    await axios.get<IResponse<IImplementConfigMaterialFlowParams>>("/sys/config/logistics")
  return res.data.data
}

/** 更新实施配置-物流运营配置 */
export const requestUpdateImplementConfigMaterialFlow = async (
  prams: IImplementConfigMaterialFlowParams
) => {
  const res = await axios.post<IResponse>("/sys/config/logistics", prams)
  return res.data.data
}

/** 获取实施配置-生产运营配置 */
export const queryImplementConfigProductionDetail = async () => {
  const res = await axios.get<IResponse<IImplementConfigProductionParams>>("/sys/config/production")
  return res.data.data
}

/** 更新实施配置-生产运营配置 */
export const requestUpdateImplementConfigProduction = async (
  prams: IImplementConfigProductionParams
) => {
  const res = await axios.post<IResponse>("/sys/config/production", prams)
  return res.data.data
}

/** 获取实施配置-质量运营配置 */
export const queryImplementConfigQualityDetail = async () => {
  const res = await axios.get<IResponse<IImplementConfigQualityParams>>("/sys/config/quality")
  return res.data.data
}

/** 更新实施配置-质量运营配置 */
export const requestUpdateImplementConfigQuality = async (prams: IImplementConfigQualityParams) => {
  const res = await axios.post<IResponse>("/sys/config/quality", prams)
  return res.data.data
}

/** 获取实施配置-基础配置 */
export const queryImplementConfigBaseDetail = async () => {
  const res = await axios.get<IResponse<IImplementConfigBaseParams>>("/sys/config/basic")
  return res.data.data
}

/** 更新实施配置-基础配置 */
export const requestUpdateImplementConfigBase = async (prams: IImplementConfigBaseParams) => {
  const res = await axios.post<IResponse>("/sys/config/basic", prams)
  return res.data.data
}

/**
 * 其他配置部分
 * */

/** 其他配置-查询所有表单类型下自定义字段 */
export const queryAllFormTypeCustomFields = async () => {
  const res = await axios.get<IResponse>(`/customizeField/list`)
  return res.data.data
}

/** 其他配置-查询单个表单类型下自定义字段 */
export const queryFormTypeCustomFields = async (fromType: number) => {
  const res = await axios.get<IResponse>(`/customizeField/list/${fromType}`)
  return res.data.data
}

/** 其他配置-删除自定义字段 */
export const requestDeleteCustomField = async (id: string) => {
  const res = await axios.delete<IResponse>(`/customizeField/delete/${id}`)
  return res.data.data
}

/** 其他配置-更新单行输入框设置 */
export const requestUpdateSingleInputSetting = async (params: ICustomFieldInputReq) => {
  const res = await axios.post<IResponse<ICustomFieldInputRes>>(
    "/customizeField/save/lineInput",
    params
  )
  return res.data.data
}

/** 其他配置-更新多行输入框设置 */
export const requestUpdateTextareaInputSetting = async (params: ICustomFieldInputReq) => {
  const res = await axios.post<IResponse<ICustomFieldInputRes>>(
    "/customizeField/save/textInput",
    params
  )
  return res.data.data
}

/** 其他配置-更新开关设置 */
export const requestUpdateSwitchSetting = async (params: ICustomFieldSwitchReq) => {
  const res = await axios.post<IResponse<ICustomFieldSwitchRes>>(
    "/customizeField/save/switch",
    params
  )
  return res.data.data
}

/** 其他配置-更新单选下拉框设置 */
export const requestUpdateSingleSelectSetting = async (params: ICustomFieldSingleSelectReq) => {
  const res = await axios.post<IResponse<ICustomFieldSingleSelectRes>>(
    "/customizeField/save/singleSelect",
    params
  )
  return res.data.data
}

/** 其他配置-更新多选下拉框设置 */
export const requestUpdateMultiSelectSetting = async (params: ICustomFieldMultipleSelectReq) => {
  const res = await axios.post<IResponse<ICustomFieldMultipleSelectRes>>(
    "/customizeField/save/multipleSelect",
    params
  )
  return res.data.data
}

/** 其他配置-更新数字步进器设置 */
export const requestUpdateNumberStepperSetting = async (params: ICustomFieldNumberStepReq) => {
  const res = await axios.post<IResponse<ICustomFieldNumberStepRes>>(
    "/customizeField/save/numberStep",
    params
  )
  return res.data.data
}

/** 其他配置-更新日期选择器设置 */
export const requestUpdateDatePickerSetting = async (params: ICustomFieldDatePickReq) => {
  const res = await axios.post<IResponse<ICustomFieldDatePickRes>>(
    "/customizeField/save/datePicker",
    params
  )
  return res.data.data
}

/** 其他配置-更新时间选择器设置 */
export const requestUpdateTimePickerSetting = async (params: ICustomFieldDatePickReq) => {
  const res = await axios.post<IResponse<ICustomFieldDatePickRes>>(
    "/customizeField/save/dateTimePicker",
    params
  )
  return res.data.data
}

/** 其他配置-更新文件上传设置 */
export const requestUpdateFileUploadSetting = async (params: ICustomFieldFileUpdateReq) => {
  const res = await axios.post<IResponse<ICustomFieldFileUpdateRes>>(
    "/customizeField/save/fileUploader",
    params
  )
  return res.data.data
}

/** 其他配置-更新选人设置 */
export const requestUpdateEmployeeSelectSetting = async (params: ICustomFieldEmployeeSelectReq) => {
  const res = await axios.post<IResponse<ICustomFieldEmployeeSelectRes>>(
    "/customizeField/save/employeeSelect",
    params
  )
  return res.data.data
}
