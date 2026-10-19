import type { IRequestPageParams } from "@/types/common"

export interface IDefectReviewTaskDivideItem {
  barcode: string
  productId: number
  productModelCode: string
  productModelId: number
  productModelName: string
  quantity: number
  reviewResult: number
  unitId: number
  unitName: string
}

export interface IDefectReviewTaskDefectItem {
  defectReviewTaskId: string
  flawGradeName: string
  flawId: string
  flawName: string
  id: string
  quantity: number
  unitId: string
  unitName: string
}

export interface IDefectReviewTaskTargetItem {
  barcode: string
  productId: number
  productModelCode: string
  productModelId: number
  productModelName: string
  quantity: number
  unitId: number
  unitName: string
}

export interface IDefectReviewTaskSearch
  extends IRequestPageParams<
    Partial<{
      barcode: string
      createTimeStart: string
      createTimeEnd: string
      dispatcherTaskCode: string
      productModelName: string
      inspectTaskNo: string
      reviewTaskNo: string
      originType: number
      pageNum: number
      pageSize: number
      productId: string
      reviewResult: number // 3-让步接收 4-报废 5-返工 6-验退
      reviewResultList: number[]
      reviewStatus: number // -1-待执行 0-进行中 1-已完成
    }>
  > {}
