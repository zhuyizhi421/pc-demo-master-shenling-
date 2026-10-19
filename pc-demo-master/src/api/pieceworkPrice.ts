type PriceStatus = "NOT_EFFECTIVE" | "EFFECTIVE" | "INVALID"

export interface IPriceOptionItem {
  label: string
  value: string
}

export interface IPieceworkProductSelectItem {
  id: string
  productNo: string
  productName: string
  productDesc: string
  productCategoryNo: string
  productCategoryName: string
}

export interface IPieceworkCraftSelectItem {
  id: string
  craftNo: string
  craftName: string
  craftDesc: string
}

export interface IPieceworkPriceItem {
  id: string
  productNo: string
  productName: string
  productCategoryNo: string
  productCategoryName: string
  craftNo: string
  craftName: string
  price: number
  status: PriceStatus
  effectiveDate: string
  createBy: string
  createTime: string
  auditBy?: string
  auditTime?: string
  invalidBy?: string
  invalidTime?: string
}

export interface IPriceListParams {
  pageNum: number
  pageSize: number
  productNo?: string
  productName?: string
  craftNo?: string
  craftName?: string
  statusList?: PriceStatus[]
}

export interface IPriceHistoryListParams {
  pageNum: number
  pageSize: number
  productNo?: string
  craftNo?: string
}

export interface IPriceCreateParams {
  productNo: string
  productName: string
  productCategoryNo: string
  productCategoryName: string
  craftNo: string
  craftName: string
  price: number
  effectiveDate: string
}

export interface IPriceUpdateParams extends IPriceCreateParams {
  id: string
}

export interface IPriceReportDetailItem {
  id: string
  workDate: string
  lineName: string
  teamName: string
  employeeName: string
  productNo: string
  productName: string
  craftName: string
  price: number
  outputQty: number
  totalPrice: number
}

export interface IPriceReportSummaryItem {
  id: string
  lineName: string
  teamName: string
  totalPrice: number
}

export interface IPriceReportParams {
  startDate: string
  endDate: string
  lineName?: string
  teamName?: string
}

const productSelectList: IPieceworkProductSelectItem[] = [
  {
    id: "pm1",
    productNo: "GR-HSG-001",
    productName: "减速器壳体总成A型",
    productDesc: "减速器壳体总成A型",
    productCategoryNo: "CAT-HSG",
    productCategoryName: "壳体总成"
  },
  {
    id: "pm4",
    productNo: "WIP-PACK-001",
    productName: "减速器壳体包装件",
    productDesc: "减速器壳体包装件",
    productCategoryNo: "CAT-WIP",
    productCategoryName: "过程件"
  },
  {
    id: "pm6",
    productNo: "WIP-MACH-003",
    productName: "减速器壳体机加工件",
    productDesc: "减速器壳体机加工件",
    productCategoryNo: "CAT-WIP",
    productCategoryName: "过程件"
  }
]

const craftSelectList: IPieceworkCraftSelectItem[] = [
  {
    id: "cr1",
    craftNo: "CR-001",
    craftName: "演示工艺路线",
    craftDesc: "演示工艺路线"
  },
  {
    id: "cr2",
    craftNo: "CR-002",
    craftName: "GR-HSG-001 Route V1.1",
    craftDesc: "GR-HSG-001 Route V1.1"
  },
  {
    id: "cr3",
    craftNo: "CR-003",
    craftName: "GR-HSG-001 Route V2.0",
    craftDesc: "GR-HSG-001 Route V2.0"
  }
]

const productMap = {
  "GR-HSG-001": { productName: "减速器壳体总成A型", productCategoryNo: "CAT-HSG", productCategoryName: "壳体总成" },
  "WIP-PACK-001": { productName: "减速器壳体包装件", productCategoryNo: "CAT-WIP", productCategoryName: "过程件" },
  "WIP-MACH-003": { productName: "减速器壳体机加工件", productCategoryNo: "CAT-WIP", productCategoryName: "过程件" }
}

const craftMap = {
  "CR-001": { craftName: "演示工艺路线" },
  "CR-002": { craftName: "GR-HSG-001 Route V1.1" },
  "CR-003": { craftName: "GR-HSG-001 Route V2.0" }
}

let idSeed = 100
const createId = () => `price-${idSeed++}`

const now = () => new Date().toISOString().slice(0, 19).replace("T", " ")

let priceList: IPieceworkPriceItem[] = [
  {
    id: createId(),
    productNo: "GR-HSG-001",
    productName: productMap["GR-HSG-001"].productName,
    productCategoryNo: productMap["GR-HSG-001"].productCategoryNo,
    productCategoryName: productMap["GR-HSG-001"].productCategoryName,
    craftNo: "CR-001",
    craftName: craftMap["CR-001"].craftName,
    price: 12.8,
    status: "EFFECTIVE",
    effectiveDate: "2026-07-01",
    createBy: "系统登录人",
    createTime: "2026-07-01 14:57:23",
    auditBy: "审核人",
    auditTime: "2026-07-01 15:10:00"
  },
  {
    id: createId(),
    productNo: "GR-HSG-001",
    productName: productMap["GR-HSG-001"].productName,
    productCategoryNo: productMap["GR-HSG-001"].productCategoryNo,
    productCategoryName: productMap["GR-HSG-001"].productCategoryName,
    craftNo: "CR-002",
    craftName: craftMap["CR-002"].craftName,
    price: 14.6,
    status: "NOT_EFFECTIVE",
    effectiveDate: "2026-07-15",
    createBy: "系统登录人",
    createTime: "2026-07-01 14:57:23"
  },
  {
    id: createId(),
    productNo: "GR-HSG-001",
    productName: productMap["GR-HSG-001"].productName,
    productCategoryNo: productMap["GR-HSG-001"].productCategoryNo,
    productCategoryName: productMap["GR-HSG-001"].productCategoryName,
    craftNo: "CR-003",
    craftName: craftMap["CR-003"].craftName,
    price: 16.2,
    status: "INVALID",
    effectiveDate: "2026-06-20",
    createBy: "系统登录人",
    createTime: "2026-06-18 11:10:00",
    auditBy: "审核人",
    auditTime: "2026-06-18 14:15:00",
    invalidBy: "系统登录人",
    invalidTime: "2026-07-01 16:00:00"
  },
  {
    id: createId(),
    productNo: "GR-HSG-001",
    productName: productMap["GR-HSG-001"].productName,
    productCategoryNo: productMap["GR-HSG-001"].productCategoryNo,
    productCategoryName: productMap["GR-HSG-001"].productCategoryName,
    craftNo: "CR-001",
    craftName: craftMap["CR-001"].craftName,
    price: 11.6,
    status: "INVALID",
    effectiveDate: "2026-05-01",
    createBy: "系统登录人",
    createTime: "2026-04-28 09:20:00",
    auditBy: "审核人",
    auditTime: "2026-04-28 10:00:00",
    invalidBy: "审核人",
    invalidTime: "2026-07-01"
  },
  {
    id: createId(),
    productNo: "GR-HSG-001",
    productName: productMap["GR-HSG-001"].productName,
    productCategoryNo: productMap["GR-HSG-001"].productCategoryNo,
    productCategoryName: productMap["GR-HSG-001"].productCategoryName,
    craftNo: "CR-001",
    craftName: craftMap["CR-001"].craftName,
    price: 10.8,
    status: "INVALID",
    effectiveDate: "2026-03-01",
    createBy: "系统登录人",
    createTime: "2026-02-25 11:30:00",
    auditBy: "审核人",
    auditTime: "2026-02-25 14:05:00",
    invalidBy: "审核人",
    invalidTime: "2026-05-01"
  },
  {
    id: createId(),
    productNo: "GR-HSG-001",
    productName: productMap["GR-HSG-001"].productName,
    productCategoryNo: productMap["GR-HSG-001"].productCategoryNo,
    productCategoryName: productMap["GR-HSG-001"].productCategoryName,
    craftNo: "CR-002",
    craftName: craftMap["CR-002"].craftName,
    price: 13.2,
    status: "INVALID",
    effectiveDate: "2026-04-15",
    createBy: "系统登录人",
    createTime: "2026-04-10 10:18:00",
    auditBy: "审核人",
    auditTime: "2026-04-10 14:18:00",
    invalidBy: "系统登录人",
    invalidTime: "2026-07-15"
  }
]

const reportDetailMockList: IPriceReportDetailItem[] = [
  {
    id: "r1",
    workDate: "2026-07-01",
    lineName: "壳体装配线",
    teamName: "白班",
    employeeName: "张伟,李强,王磊",
    productNo: "GR-HSG-001",
    productName: "减速器壳体总成A型",
    craftName: "演示工艺路线",
    price: 12.8,
    outputQty: 42,
    totalPrice: 537.6
  },
  {
    id: "r2",
    workDate: "2026-07-02",
    lineName: "壳体装配线",
    teamName: "白班",
    employeeName: "张伟,李强,王磊",
    productNo: "GR-HSG-001",
    productName: "减速器壳体总成A型",
    craftName: "GR-HSG-001 Route V1.1",
    price: 14.6,
    outputQty: 68,
    totalPrice: 992.8
  },
  {
    id: "r3",
    workDate: "2026-07-02",
    lineName: "机加工线",
    teamName: "夜班",
    employeeName: "刘波,马超,罗远",
    productNo: "GR-HSG-001",
    productName: "减速器壳体总成A型",
    craftName: "GR-HSG-001 Route V2.0",
    price: 16.2,
    outputQty: 36,
    totalPrice: 583.2
  }
]

const delay = async () =>
  new Promise((resolve) => {
    setTimeout(resolve, 120)
  })

const normalize = (value?: string) => String(value || "").trim().toLowerCase()

const validateEffectiveDate = (
  params: Pick<IPieceworkPriceItem, "productNo" | "craftNo" | "effectiveDate"> & { excludeId?: string }
) => {
  const matchedList = priceList.filter(
    (item) =>
      item.productNo === params.productNo &&
      item.craftNo === params.craftNo &&
      item.id !== params.excludeId
  )
  if (!matchedList.length) return

  const maxEffectiveDate = matchedList
    .map((item) => item.effectiveDate)
    .sort((a, b) => +new Date(b) - +new Date(a))[0]
  if (+new Date(params.effectiveDate) <= +new Date(maxEffectiveDate)) {
    throw new Error("相同产品和工序已存在工价，新工价生效日期必须晚于历史生效日期")
  }
}

const buildCsvFile = (header: string[], rows: Array<(string | number)[]>, filename: string) => {
  const csvRows = [header.join(","), ...rows.map((row) => row.map((col) => `"${col}"`).join(","))]
  return {
    fileName: filename,
    fileBlob: new Blob([`\ufeff${csvRows.join("\n")}`], { type: "text/csv;charset=utf-8;" })
  }
}

export const pieceworkPriceStatusMap: Record<PriceStatus, string> = {
  NOT_EFFECTIVE: "未生效",
  EFFECTIVE: "已生效",
  INVALID: "作废"
}

export async function getPieceworkProductOptions() {
  await delay()
  return productSelectList.map((item) => ({
    label: `${item.productNo} ${item.productName}`,
    value: item.productNo
  }))
}

export async function getPieceworkCraftOptions() {
  await delay()
  return craftSelectList.map((item) => ({
    label: `${item.craftNo} ${item.craftName}`,
    value: item.craftNo
  }))
}

export async function getPieceworkProductSelectList() {
  await delay()
  return productSelectList
}

export async function getPieceworkCraftSelectList() {
  await delay()
  return craftSelectList
}

export async function queryPieceworkPriceList(params: IPriceListParams) {
  await delay()
  const list = priceList
    .filter((item) => {
      if (params.productNo && !normalize(item.productNo).includes(normalize(params.productNo))) return false
      if (params.productName && !normalize(item.productName).includes(normalize(params.productName))) {
        return false
      }
      if (params.craftNo && !normalize(item.craftNo).includes(normalize(params.craftNo))) return false
      if (params.craftName && !normalize(item.craftName).includes(normalize(params.craftName))) return false
      if (params.statusList?.length && !params.statusList.includes(item.status)) return false
      return true
    })
    .sort((a, b) => +new Date(b.createTime) - +new Date(a.createTime))

  const start = (params.pageNum - 1) * params.pageSize
  const records = list.slice(start, start + params.pageSize)
  return {
    records,
    total: list.length
  }
}

export async function queryPieceworkPriceHistoryList(params: IPriceHistoryListParams) {
  await delay()
  const list = priceList
    .filter((item) => {
      if (params.productNo && item.productNo !== params.productNo) return false
      if (params.craftNo && item.craftNo !== params.craftNo) return false
      return true
    })
    .sort((a, b) => {
      const effectiveDateDiff = +new Date(b.effectiveDate) - +new Date(a.effectiveDate)
      if (effectiveDateDiff !== 0) return effectiveDateDiff
      return +new Date(b.createTime) - +new Date(a.createTime)
    })

  const start = (params.pageNum - 1) * params.pageSize
  return {
    records: list.slice(start, start + params.pageSize),
    total: list.length
  }
}

export async function createPieceworkPrice(params: IPriceCreateParams) {
  await delay()
  validateEffectiveDate(params)
  const record: IPieceworkPriceItem = {
    id: createId(),
    ...params,
    status: "NOT_EFFECTIVE",
    createBy: "系统登录人",
    createTime: now()
  }
  priceList = [record, ...priceList]
  return record
}

export async function updatePieceworkPrice(params: IPriceUpdateParams) {
  await delay()
  const target = priceList.find((item) => item.id === params.id)
  if (!target) throw new Error("工价记录不存在")
  if (target.status !== "NOT_EFFECTIVE") throw new Error("仅未生效状态允许修改")
  validateEffectiveDate({ ...params, excludeId: params.id })
  Object.assign(target, params)
  return target
}

export async function deletePieceworkPrice(id: string) {
  await delay()
  const target = priceList.find((item) => item.id === id)
  if (!target) throw new Error("工价记录不存在")
  if (target.status !== "NOT_EFFECTIVE") throw new Error("仅未生效状态允许删除")
  priceList = priceList.filter((item) => item.id !== id)
}

export async function auditPieceworkPriceBatch(ids: string[], auditBy = "审核人") {
  await delay()
  if (!ids.length) throw new Error("请选择需要审核的工价")
  const nowTime = now()
  const toAuditList = priceList.filter((item) => ids.includes(item.id))
  if (!toAuditList.length) throw new Error("未找到可审核工价")

  toAuditList.forEach((target) => {
    if (target.status !== "NOT_EFFECTIVE") {
      throw new Error("仅未生效状态允许审核")
    }
  })

  toAuditList.forEach((target) => {
    target.status = "EFFECTIVE"
    target.auditBy = auditBy
    target.auditTime = nowTime

    priceList
      .filter(
        (item) =>
          item.id !== target.id &&
          item.productNo === target.productNo &&
          item.craftNo === target.craftNo &&
          item.status === "EFFECTIVE"
      )
      .forEach((oldItem) => {
        oldItem.status = "INVALID"
        oldItem.invalidBy = auditBy
        oldItem.invalidTime = target.effectiveDate
      })
  })
}

export async function invalidPieceworkPriceBatch(ids: string[], invalidBy = "系统登录人") {
  await delay()
  if (!ids.length) throw new Error("请选择需要作废的工价")
  const nowTime = now()
  const selectedList = priceList.filter((item) => ids.includes(item.id))
  if (!selectedList.length) throw new Error("未找到可作废工价")
  selectedList.forEach((target) => {
    if (target.status !== "EFFECTIVE") {
      throw new Error("仅已生效状态允许作废")
    }
  })
  selectedList.forEach((target) => {
    target.status = "INVALID"
    target.invalidBy = invalidBy
    target.invalidTime = nowTime
  })
}

export async function exportPieceworkPriceList(params: Omit<IPriceListParams, "pageNum" | "pageSize">) {
  await delay()
  const data = await queryPieceworkPriceList({
    ...params,
    pageNum: 1,
    pageSize: 10000
  })
  return buildCsvFile(
    [
      "产品编号",
      "产品名称",
      "产品类别编号",
      "工艺编号",
      "工艺名称",
      "工价",
      "状态",
      "生效日期",
      "作废日期",
      "创建人",
      "创建日期",
      "审核人",
      "审核日期",
      "作废人",
      "作废时间"
    ],
    data.records.map((item) => [
      item.productNo,
      item.productName,
      item.productCategoryNo,
      item.craftNo,
      item.craftName,
      item.price,
      pieceworkPriceStatusMap[item.status],
      item.effectiveDate,
      item.invalidTime || "",
      item.createBy,
      item.createTime,
      item.auditBy || "",
      item.auditTime || "",
      item.invalidBy || "",
      item.invalidTime || ""
    ]),
    `工价配置_${Date.now()}.csv`
  )
}

export async function queryPieceworkPriceReport(params: IPriceReportParams) {
  await delay()
  const detailList = reportDetailMockList.filter((item) => {
    if (params.startDate && +new Date(item.workDate) < +new Date(params.startDate)) return false
    if (params.endDate && +new Date(item.workDate) > +new Date(params.endDate)) return false
    if (params.lineName && !normalize(item.lineName).includes(normalize(params.lineName))) return false
    if (params.teamName && !normalize(item.teamName).includes(normalize(params.teamName))) return false
    return true
  })
  const summaryMap = new Map<string, IPriceReportSummaryItem>()
  detailList.forEach((item) => {
    const key = `${item.lineName}-${item.teamName}`
    const old = summaryMap.get(key)
    if (old) {
      old.totalPrice += item.totalPrice
      return
    }
    summaryMap.set(key, {
      id: key,
      lineName: item.lineName,
      teamName: item.teamName,
      totalPrice: item.totalPrice
    })
  })

  return {
    summaryList: [...summaryMap.values()],
    detailList
  }
}

export async function exportPieceworkPriceReport(params: IPriceReportParams) {
  const reportData = await queryPieceworkPriceReport(params)
  return buildCsvFile(
    ["日期", "产线", "班次", "员工姓名", "产品编号", "产品名称", "工序名称", "工价", "生产数", "总价"],
    reportData.detailList.map((item) => [
      item.workDate,
      item.lineName,
      item.teamName,
      item.employeeName,
      item.productNo,
      item.productName,
      item.craftName,
      item.price,
      item.outputQty,
      item.totalPrice
    ]),
    `工资计件报表_${Date.now()}.csv`
  )
}
