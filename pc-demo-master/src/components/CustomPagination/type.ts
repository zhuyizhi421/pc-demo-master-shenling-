export type IPaginationProps = {
  /**
   * 当前页数
   */
  currentPage: number

  /**
   * 每页显示条数
   */
  pageSize: number

  /**
   * 总条数
   */
  total: number

  /**
   *  自定义每页显示条数的选项，默认值为 [20, 30, 50, 100]
   */
  pageSizes?: number[]

  /**
   * 是否显示分页器的上边框, 默认为 true
   */
  border?: boolean
}

export type IPaginationEmits = {
  (e: "update:pageSize", pageSize: number): void
  (e: "update:currentPage", currentPage: number): void
  (e: "change", currentPage: number, pageSize: number): void
}
