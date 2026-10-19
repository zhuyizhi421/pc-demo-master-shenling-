import axios from "axios"

import type { IResponse } from "@/types/common"
import type { IEquipmentSpotItemInfo } from "@/types/maintain/equipment-manage/equipment-spot-item"

export const queryEquipmentSpotItemDetail = async (id: string) => {
  const res = await axios.post<IResponse<IEquipmentSpotItemInfo>>("/equipmentSpotItem/id", {
    id
  })
  return res.data.data
}
