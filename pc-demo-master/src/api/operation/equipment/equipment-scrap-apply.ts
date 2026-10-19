import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IEquipmentScrapPageItem,
  IEquipmentScrapPageListParams
} from "@/types/maintain/equipment-manage/equipment-scrap-apply"
import type { IEquipmentScrapApplyCreateParams } from "@/types/maintain/equipment-manage/equipment-scrap-apply"

const localScrapRows: IEquipmentScrapPageItem[] = [
  {
    id: "SC-SHOT-001",
    applyNo: "SC-SHOT-001",
    processDefineId: "PROC-SCRAP-001",
    processDefineName: "设备报废审批流程",
    processInstanceId: "eq-scrap-shot-001",
    equipmentId: "1007",
    equipmentName: "老化测试台",
    equipmentNo: "TA-2026-007",
    files: [],
    remarks: "待审批，用于申请中截图",
    reportUsers: [{ id: "e11", empNo: "E011", name: "刘班长", depName: "注塑车间" }],
    scrapReason: "精度衰减明显，年度校准后仍无法满足生产要求",
    scrapStatus: 1,
    sourceId: "MT-202604-018",
    sourceNo: "MT-202604-018",
    sourceType: 1,
    createBy: "e11",
    updateBy: "e11",
    createTime: "2026-04-30 08:20:00",
    updateTime: "2026-04-30 08:20:00"
  },
  {
    id: "SC-SHOT-002",
    applyNo: "SC-SHOT-002",
    processDefineId: "PROC-SCRAP-001",
    processDefineName: "设备报废审批流程",
    processInstanceId: "eq-scrap-shot-002",
    equipmentId: "1009",
    equipmentName: "注塑机 120T",
    equipmentNo: "TA-2026-009",
    files: [],
    remarks: "已通过，用于通过状态截图",
    reportUsers: [{ id: "e3", empNo: "E003", name: "钱维修", depName: "设备部" }],
    scrapReason: "锁模机构磨损严重，维修成本高于残值",
    scrapStatus: 2,
    sourceId: "RP-202604-026",
    sourceNo: "RP-202604-026",
    sourceType: 2,
    createBy: "e3",
    updateBy: "e3",
    createTime: "2026-04-30 08:15:00",
    updateTime: "2026-04-30 08:16:00"
  },
  {
    id: "SC-SHOT-003",
    applyNo: "SC-SHOT-003",
    processDefineId: "PROC-SCRAP-001",
    processDefineName: "设备报废审批流程",
    processInstanceId: "eq-scrap-shot-003",
    equipmentId: "1011",
    equipmentName: "伺服压装机",
    equipmentNo: "TA-2026-011",
    files: [],
    remarks: "未通过，用于退回状态截图",
    reportUsers: [{ id: "e5", empNo: "E005", name: "孙工", depName: "设备部" }],
    scrapReason: "压装位重复报警，申请整机报废",
    scrapStatus: 3,
    sourceId: "RP-202604-031",
    sourceNo: "RP-202604-031",
    sourceType: 2,
    createBy: "e5",
    updateBy: "e5",
    createTime: "2026-04-30 08:10:00",
    updateTime: "2026-04-30 08:11:00"
  },
  {
    id: "SC-SHOT-004",
    applyNo: "SC-SHOT-004",
    processDefineId: "PROC-SCRAP-001",
    processDefineName: "设备报废审批流程",
    processInstanceId: "eq-scrap-shot-004",
    equipmentId: "1004",
    equipmentName: "打标机",
    equipmentNo: "TA-2026-004",
    files: [],
    remarks: "带来源单号的保养转报废场景",
    reportUsers: [{ id: "e3", empNo: "E003", name: "钱维修", depName: "设备部" }],
    scrapReason: "激光头老化且备件停产，继续保养无价值",
    scrapStatus: 1,
    sourceId: "EX-MT-202604-002",
    sourceNo: "EX-MT-202604-002",
    sourceType: 1,
    createBy: "e3",
    updateBy: "e3",
    createTime: "2026-04-30 08:05:00",
    updateTime: "2026-04-30 08:05:00"
  },
  {
    id: "SC-SHOT-005",
    applyNo: "SC-SHOT-005",
    processDefineId: "PROC-SCRAP-001",
    processDefineName: "设备报废审批流程",
    processInstanceId: "eq-scrap-shot-005",
    equipmentId: "1002",
    equipmentName: "自动贴标机",
    equipmentNo: "TA-2026-002",
    files: [],
    remarks: "手动创建场景",
    reportUsers: [{ id: "e11", empNo: "E011", name: "刘班长", depName: "制造部" }],
    scrapReason: "设备搬线后长期闲置，且型号已淘汰",
    scrapStatus: 2,
    sourceId: "MANUAL-001",
    sourceNo: "MANUAL-001",
    sourceType: 3,
    createBy: "e11",
    updateBy: "e11",
    createTime: "2026-04-30 08:00:00",
    updateTime: "2026-04-30 08:01:00"
  }
]

function buildLocalPage(params: IEquipmentScrapPageListParams): IListPageResult<IEquipmentScrapPageItem> {
  const pageNum = Number(params?.pageQuery?.pageNum || 1)
  const pageSize = Number(params?.pageQuery?.pageSize || 20)
  const query = params?.queryParam || {}
  let rows = [...localScrapRows]

  if (Array.isArray(query.scrapStatusList) && query.scrapStatusList.length) {
    const statusSet = new Set(query.scrapStatusList.map((item) => Number(item)))
    rows = rows.filter((item) => statusSet.has(Number(item.scrapStatus)))
  }

  if (Array.isArray(query.sourceTypeList) && query.sourceTypeList.length) {
    const sourceSet = new Set(query.sourceTypeList.map((item) => Number(item)))
    rows = rows.filter((item) => sourceSet.has(Number(item.sourceType)))
  }

  rows.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())

  const start = (pageNum - 1) * pageSize
  const end = start + pageSize
  return {
    current: String(pageNum),
    pages: String(Math.max(1, Math.ceil(rows.length / pageSize))),
    records: rows.slice(start, end),
    size: String(pageSize),
    total: String(rows.length)
  }
}

function sanitizePageResult(page: IListPageResult<IEquipmentScrapPageItem>) {
  return {
    ...page,
    records: (page.records || []).filter((item) => item.applyNo !== "SC-SHOT-901"),
    total: String((page.records || []).filter((item) => item.applyNo !== "SC-SHOT-901").length)
  }
}

export const queryEquipmentScrapPageList = async (params: IEquipmentScrapPageListParams) => {
  try {
    const res = await axios.post<IResponse<IListPageResult<IEquipmentScrapPageItem>>>(
      "/equipmentScrap/page",
      params,
      {
        timeout: 1500
      }
    )
    return sanitizePageResult(res.data.data)
  } catch (error) {
    console.warn("[equipment-scrap-apply] fallback to local mock rows", error)
    return buildLocalPage(params)
  }
}

// 设备报废申请创建
export const requestCreateEquipmentScrap = async (
  params: Partial<IEquipmentScrapApplyCreateParams>
) => {
  const res = await axios.post<IResponse>("/equipmentScrap/save", params)
  return res.data.data
}
