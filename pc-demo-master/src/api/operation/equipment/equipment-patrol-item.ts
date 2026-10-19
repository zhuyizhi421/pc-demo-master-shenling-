import axios from "axios"

import type { IResponse } from "@/types/common"
import type { IEquipmentPatrolItemInfo } from "@/types/maintain/equipment-manage/equipment-patrol-item"

// 设备巡检项详情
export const queryEquipmentPatrolItemDetail = async (id: string) => {
  const res = await axios.post<IResponse<IEquipmentPatrolItemInfo>>("/equipmentPatrolItem/id", {
    id
  })
  return res.data.data
}
