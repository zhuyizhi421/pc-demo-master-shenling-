import axios from "axios"

import type { IResponse } from "@/types/common"
import type { IEquipmentMaintenanceItemInfo } from "@/types/maintain/equipment-manage/equipment-maintenance-item"

// 设备保养项详情
export const queryEquipmentMaintenanceItemDetail = async (id: string) => {
  const res = await axios.post<IResponse<IEquipmentMaintenanceItemInfo>>(
    "/equipmentMaintenanceItem/id",
    {
      id
    }
  )
  return res.data.data
}
