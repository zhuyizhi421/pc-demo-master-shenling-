export type ICustomTitleProps = {
  /**
   * 标题文本
   */
  title?: string

  /**
   * 标题颜色，配置显示短杆时，也为短杆颜色
   */
  color?: string

  /**
   * 标题字号大小
   */
  size?: number

  /**
   * 标题字体粗细
   */
  weight?: string | number

  /**
   * 是否是表格标题，true为表格标题，false为详情标题
   */
  isTableTitle?: boolean

  /**
   * 是否标题文字前显示短杆，true显示，false不显示
   */
  showShortBar?: boolean
}
