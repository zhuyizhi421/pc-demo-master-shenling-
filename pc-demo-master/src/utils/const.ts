export const outboundRuleType: Record<string, string> = {
  0: "无",
  1: "建议先进先出",
  2: "建议后进先出",
  3: "强制先进先出",
  4: "强制后进先出"
}

export const purchaseStatusType: Record<string | number, string> = {
  "-1": "未复核",
  "0": "未发货",
  "1": "进行中",
  "2": "已结案"
}

export const saleStatusType: Record<string, string> = {
  0: "未发货",
  1: "进行中",
  2: "已完成"
}

// 当前位置
export const locationType: Record<string, string> = {
  1: "在库",
  2: "流转中",
  3: "生产中",
  4: "在途"
}

export const purchaseTypeEnum: Record<string | number, string> = {
  1: "采购",
  2: "委外"
}
// 1-首检自检、2-首检专检、3-巡检自检、4-巡检专检、5-末检自检、6-末检专检)
export const inspectProcessTypeEnum: Record<string, string> = {
  1: "首检自检",
  2: "首检专检",
  3: "巡检自检",
  4: "巡检专检",
  5: "末检自检",
  6: "末检专检"
}
export const inspectTypeEnum: Record<string, string> = {
  7: "采购入库检",
  8: "委外入库检",
  9: "生产入库检",
  10: "发货出库检",
  11: "退货入库检",
  12: "在库检",
  13: "委外退料入库检"
}
