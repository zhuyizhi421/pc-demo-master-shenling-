/**
 * 全局通用类型定义文件
 */

import { type RouteLocationNormalizedLoaded } from "vue-router"

import type { IColumnSortInfo } from "@/components/CustomTable/type"

/** 通用分页搜索参数类型 */
export type IPaginationSearch = {
  pageNum: number
  pageSize: number
}

/** 通用分页参数类型 */
export type IPagination = IPaginationSearch & {
  total: number
}

/** 请求响应体 */
export interface IResponse<T = unknown> {
  code: number
  data: T
  message: string
  success: boolean
}

/** 通用列表分页类型 */
export type IListPageResult<T> = {
  current: string
  pages: string
  records: T[]
  size: string
  total: string
}

/** 通用下拉选项类型 */
export type IOptionItem = {
  label: string
  value: string
}

/** 通用路由元参数类型 */
export interface IRoute extends RouteLocationNormalizedLoaded {
  title?: string
}

export interface Options {
  label: string
  value: string | number | undefined
}

/** 通用分页请求参数类型 */
export interface IRequestPageParams<T> {
  dateRange?: {
    endDate?: string
    startDate?: string
  }
  pageQuery: {
    pageNum: number
    pageSize: number
  }
  queryParam?: T
  sort?: {
    field: string
    order: string
  }[]
}

export interface ICommonStandard {
  standardDesc: string
  standardMax: number
  standardMaxInclusive: number
  standardMin: number
  standardMinInclusive: number
  standardType: number
  unitId: string
  unitName: string
}

export interface IOption {
  label: string
  value: string | number
}

export interface IPhoto {
  fileName: string
  fileId: string
  fileUrl: string
}

/**
 * 动态表格（即包含动态列配置的）请求参数类型
 */
export interface IRequestDynamicPageParams<T> {
  pageQuery: {
    pageNum: number
    pageSize: number
  }
  queryParam: T
  sort?: IColumnSortInfo[]
}
