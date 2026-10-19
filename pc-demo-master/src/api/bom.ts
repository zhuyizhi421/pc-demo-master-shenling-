import axios from "axios"

import type { IListPageResult } from "@/types/common"

import type { IRes } from "./interceptor"

/**
 * 产品单位
 */
export interface IProductUnit {
  unitId: string
  unitName: string
  unitCode?: string
  isDefaultUnit?: number
}

/**
 * BOM列表项
 */
export interface IBomItem {
  id: string
  productId: string
  productCode: string
  productName: string
  source: "ERP" | "系统"
  version: string
  status: "unpublished" | "published" | "disabled"
  effectiveTime: string
  createTime: string
  createBy?: string
  updateTime?: string
  updateBy?: string
  remark?: string
}

/**
 * BOM查询参数
 */
export interface IBomParams {
  pageNum: number
  pageSize: number
  productCode?: string
  productName?: string
  source?: string
  status?: string
}

/**
 * BOM明细项
 */
export interface IBomItemDetail {
  id?: string
  productId: string
  productCode: string
  productName: string
  unitId: string
  unitName: string
  unitList: IProductUnit[]
  baseQuantity: number
  composeQuantity: number
}

/**
 * BOM表单数据
 */
export interface IBomFormData {
  id?: string
  productId: string
  productCode: string
  productName: string
  version: string
  effectiveTime: string
  remark?: string
  items: IBomItemDetail[]
}

/**
 * BOM升级数据
 */
export interface IBomUpgradeData {
  originalId: string
  version: string
  effectiveTime: string
}

/**
 * BOM详情
 */
export interface IBomDetail extends IBomItem {
  items: IBomItemDetail[]
}

/**
 * 查询BOM列表
 */
export const queryBomPageList = async (params: IBomParams): Promise<IListPageResult<IBomItem>> => {
  const res = await axios.post<IRes<IListPageResult<IBomItem>>>("/bom/pageList", params)
  return res.data.data
}

/**
 * 获取BOM详情
 */
export const getBomDetail = async (id: string): Promise<IBomDetail> => {
  const res = await axios.get<IRes<IBomDetail>>(`/bom/detail/${id}`)
  return res.data.data
}

/**
 * 创建BOM
 */
export const createBom = async (data: IBomFormData): Promise<void> => {
  await axios.post("/bom/create", data)
}

/**
 * 更新BOM
 */
export const updateBom = async (data: IBomFormData): Promise<void> => {
  await axios.post("/bom/update", data)
}

/**
 * 删除BOM
 */
export const deleteBom = async (id: string): Promise<void> => {
  await axios.delete(`/bom/delete/${id}`)
}

/**
 * 发布BOM
 */
export const publishBom = async (id: string): Promise<void> => {
  await axios.post(`/bom/publish/${id}`)
}

/**
 * 停用BOM
 */
export const disableBom = async (id: string): Promise<void> => {
  await axios.post(`/bom/disable/${id}`)
}

/**
 * 升级BOM
 */
export const upgradeBom = async (data: IBomUpgradeData): Promise<void> => {
  await axios.post("/bom/upgrade", data)
}

/**
 * 检查BOM版本是否重复
 * @param productId 产品ID
 * @param version 版本号
 * @param excludeId 需要排除的BOM ID（编辑时使用）
 */
export const checkBomVersion = async (productId: string, version: string, excludeId?: string): Promise<boolean> => {
  const res = await axios.get<IRes<boolean>>("/bom/checkVersion", {
    params: { productId, version, excludeId }
  })
  return res.data.data
}

/**
 * 搜索产品
 */
export const searchProduct = async (
  keyword: string
): Promise<
  Array<{
    id: string
    code: string
    name: string
    productModelUnitList?: IProductUnit[]
  }>
> => {
  const res = await axios.get<IRes<Array<{
    id: string
    code: string
    name: string
    productModelUnitList?: IProductUnit[]
  }>>>('/bom/searchProduct', {
    params: { keyword }
  })
  return res.data.data
}

/**
 * BOM子件项（带版本信息）
 */
export interface IBomItemWithVersion extends IBomItemDetail {
  bomVersion: string
}

/**
 * 根据产品ID获取BOM子件列表
 */
export const getBomItemsByProductId = async (productId: string): Promise<{
  bomId: string
  productId: string
  productCode: string
  productName: string
  version: string
  status: string
  items: IBomItemWithVersion[]
} | null> => {
  const res = await axios.get<IRes<{
    bomId: string
    productId: string
    productCode: string
    productName: string
    version: string
    status: string
    items: IBomItemWithVersion[]
  } | null>>('/bom/getBomItemsByProductId', {
    params: { productId }
  })
  return res.data.data
}
