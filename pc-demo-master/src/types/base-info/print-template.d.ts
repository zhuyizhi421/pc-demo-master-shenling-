export interface IPrintTemplateListQuery {
  templateType?: string
}

export interface IPrintTemplateListItem {
  renderClassName: string // 模板渲染类全限定名
  templateId: string // 模板ID
  templateNo: string // 模板编号
  templatePath: string // 模板文件地址
  templateType: string // 模板分类
  thumbnailAddress: string // 模板缩略图地址
}
