export interface IPagedAPIParams<T> {
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

export interface IPagedAPIRes<T> {
  current: number
  pages: number
  records: T[]
  size: number
  total: number
}
