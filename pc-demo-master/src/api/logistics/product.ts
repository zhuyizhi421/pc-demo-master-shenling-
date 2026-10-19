import axios from "axios"

import type { ProductModel } from "@/types/logistics/product"

import type { IRes } from "../interceptor"

// 获取产品模型列表
export async function getLogPurchaseProductSearch(purchaseId: string) {
  const res = await axios.get<IRes<ProductModel[]>>(`/logistics/purchase/${purchaseId}/product`)
  return res.data.data
}
