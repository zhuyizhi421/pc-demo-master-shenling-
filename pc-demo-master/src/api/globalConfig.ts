/** 系统设置-全局配置 */

import axios from "axios"

import type {
  IGlobalConfigProductionParams,
  IGlobalConfigQualityParams,
  IGlobalConfigStyleParams,
  ILogisticsForm
} from "@/types/base-info/global-config"
import type { IResponse } from "@/types/common"

/** 全局配置-质量运营查询 */
export const queryQualityGlobalConfigDetail = async () => {
  const res = await axios.get<IResponse<IGlobalConfigQualityParams>>("/sys/config/global/quality")
  return res.data.data
}

/** 全局配置-质量运营更新 */
export const requestUpdateQualityGlobalConfig = async (
  params: Partial<IGlobalConfigQualityParams>
) => {
  const res = await axios.post<IResponse>("/sys/config/global/quality", params)
  return res.data.data
}

/** 全局配置-系统样式查询 */
export const querySystemStyleGlobalConfigDetail = async () => {
  const res = await axios.get<IResponse<IGlobalConfigStyleParams>>("/sys/config/global/style")
  return res.data.data
}

/** 全局配置-系统样式更新 */
export const requestUpdateSystemStyleGlobalConfig = async (
  params: Partial<IGlobalConfigStyleParams>
) => {
  const res = await axios.post<IResponse>("/sys/config/global/style", params)
  return res.data.data
}

/** 全局配置-生产运营查询 */
export const queryProductionGlobalConfigDetail = async () => {
  const res = await axios.get<IResponse<IGlobalConfigProductionParams>>(
    "/sys/config/global/production"
  )
  return res.data.data
}

/** 全局配置-生产运营更新 */
export const requestUpdateProductionGlobalConfig = async (
  params: Partial<IGlobalConfigProductionParams>
) => {
  const res = await axios.post<IResponse>("/sys/config/global/production", params)
  return res.data.data
}

/** 全局配置-物流运营查询 */
export const queryLogisticsGlobalConfigDetail = async () => {
  const res = await axios.get<IResponse<ILogisticsForm>>("/sys/config/global/logistics")
  return res.data.data
}

export const requestUpdateLogisticsGlobalConfig = async (params: Partial<ILogisticsForm>) => {
  const res = await axios.post<IResponse>("/sys/config/global/logistics", params)
  return res.data.data
}
