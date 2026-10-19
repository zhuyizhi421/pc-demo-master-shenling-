import { basicConfigRoutes, noAuthRoutes, type RouteConfig } from "@/router"

type StaticMethod = "get" | "post" | "put" | "delete" | "patch"

export interface StaticMockRequest {
  url?: string
  method?: string
  data?: unknown
  params?: unknown
}

const now = "2026-07-01 08:30:00"

const toBool = (value: unknown) => {
  const normalized = String(value ?? "")
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .toLowerCase()
  return normalized === "true" || normalized === "1" || normalized === "yes"
}

export const isStaticMockEnabled = () => toBool(import.meta.env.VITE_STATIC_MOCK)

const ok = <T>(data: T) => ({
  code: 0,
  data,
  message: "success",
  success: true,
  timestamp: now
})

const parseMaybeJson = <T = any>(value: unknown): T => {
  if (typeof value !== "string") return value as T
  if (!value) return {} as T
  try {
    return JSON.parse(value) as T
  } catch {
    return value as T
  }
}

const getPageQuery = (data: any, params: any) => {
  const source = data?.pageQuery || data?.pageQueryVO || data || params || {}
  return {
    pageNum: Number(source.pageNum || source.current || 1),
    pageSize: Number(source.pageSize || source.size || 20)
  }
}

const page = <T>(records: T[], pageNum = 1, pageSize = 20) => {
  const total = records.length
  return {
    current: String(pageNum),
    pages: String(Math.max(1, Math.ceil(total / pageSize) || 1)),
    records: records.slice((pageNum - 1) * pageSize, pageNum * pageSize),
    size: String(pageSize),
    total: String(total)
  }
}

const emptyPage = (data: any, params: any) => {
  const { pageNum, pageSize } = getPageQuery(data, params)
  return page([], pageNum, pageSize)
}

const normalizePath = (rawUrl = "") => {
  const path = String(rawUrl || "/").split("?")[0]
  if (path === "/api") return "/"
  if (path.startsWith("/api/")) return path.slice(4)
  return path.startsWith("/") ? path : `/${path}`
}

const collectMenuCodes = (routes: RouteConfig[], codes = new Set<string>()) => {
  routes.forEach((route) => {
    if (route.meta?.menuCode) {
      codes.add(route.meta.menuCode)
    }
    if (route.children?.length) {
      collectMenuCodes(route.children, codes)
    }
  })
  return codes
}

const pcMenuCodes = Array.from(collectMenuCodes([...noAuthRoutes, ...basicConfigRoutes]))
const pcPermissionCodes = Array.from(
  new Set([
    ...pcMenuCodes.flatMap((code) => [
      `${code}_query`,
      `${code}_update`,
      `${code}_delete`,
      `${code}_add`,
      `${code}_check`,
      `${code}_detail`,
      `${code}_disable_enable`
    ]),
    "CraftworkInfo_query",
    "CraftworkInfo_update"
  ])
)

const users = [
  {
    id: "1",
    userId: "1",
    empId: "1",
    empName: "本地演示用户",
    empNo: "EMP001",
    depId: "1",
    depName: "演示部门",
    username: "admin",
    nickname: "本地演示用户",
    roleList: [{ id: "1", roleName: "管理员", roleCode: "admin" }]
  }
]

const tenants = [
  {
    id: "1",
    name: "本地静态组织",
    tenantName: "本地静态组织",
    remark: "local static data",
    createBy: "1",
    createTime: now,
    updateBy: "1",
    updateTime: now
  }
]

const loginUser = {
  id: "1",
  empId: "1",
  empName: "本地演示用户",
  empNo: "EMP001",
  nickname: "本地演示用户",
  username: "admin",
  tenantId: "1",
  roleCodes: ["生产主管"],
  roleList: [{ id: "2", roleName: "生产主管", roleCode: "生产主管" }],
  permissionCodes: pcPermissionCodes,
  deviceMenuCodes: {
    PAD: [],
    PC: pcMenuCodes,
    PDA: [],
    MC: []
  }
}

const styleConfig = {
  companyName: "本地静态演示",
  systemName: "文智 MES",
  systemShortName: "MES",
  logoFileList: [{ imageFileId: "logo", imageUrl: "/favicon.png", isSelected: true }],
  loginBackgroundList: [{ imageFileId: "bg", imageUrl: "/产品.png", isSelected: true }]
}

const globalProductionConfig = {
  productionTaskAutoCloseIntervalDays: 7
}

const saleOrderQueryConfig = {
  queryInfo: {
    queryKey: "SaleOrder",
    queryName: "销售订单查询",
    description: null
  },
  columns: [
    { fieldName: "saleCode", displayName: "销售单号", visible: 1, sortable: 1, sortType: "STANDARD", sortField: "saleCode", defaultStandardSort: null, filterable: 1, filterType: "FUZZY", enumValues: null, orderNum: 10 },
    { fieldName: "dataSource", displayName: "来源", visible: 1, sortable: 1, sortType: "STANDARD", sortField: "dataSource", defaultStandardSort: null, filterable: 1, filterType: "ENUM", enumValues: [{ label: "MES", value: 1 }, { label: "ERP", value: 2 }], orderNum: 20 },
    { fieldName: "saleStatus", displayName: "状态", visible: 1, sortable: 1, sortType: "STANDARD", sortField: "saleStatus", defaultStandardSort: null, filterable: 1, filterType: "ENUM", enumValues: [{ label: "未发货", value: 0 }, { label: "进行中", value: 1 }, { label: "已完成", value: 2 }], orderNum: 30 },
    { fieldName: "customerAbbr", displayName: "客户简称", visible: 1, sortable: 1, sortType: "STANDARD", sortField: "customerAbbr", defaultStandardSort: null, filterable: 1, filterType: "FUZZY", enumValues: null, orderNum: 40 },
    { fieldName: "customerName", displayName: "客户全称", visible: 1, sortable: 1, sortType: "STANDARD", sortField: "customerName", defaultStandardSort: null, filterable: 1, filterType: "FUZZY", enumValues: null, orderNum: 50 },
    { fieldName: "saleContent", displayName: "销售内容", visible: 1, sortable: 0, sortType: null, sortField: null, defaultStandardSort: null, filterable: 1, filterType: "FUZZY", enumValues: null, orderNum: 60 },
    { fieldName: "priority", displayName: "优先级", visible: 1, sortable: 1, sortType: "STANDARD", sortField: "priority", defaultStandardSort: null, filterable: 1, filterType: "ENUM", enumValues: [{ label: "低", value: 10 }, { label: "中", value: 20 }, { label: "高", value: 30 }], orderNum: 70 },
    { fieldName: "planDeliveryTime", displayName: "计划交货日期", visible: 1, sortable: 1, sortType: "STANDARD", sortField: "planDeliveryTime", defaultStandardSort: null, filterable: 1, filterType: "TIME_RANGE", enumValues: null, orderNum: 80 },
    { fieldName: "createTime", displayName: "创建时间", visible: 1, sortable: 1, sortType: "STANDARD", sortField: "createTime", defaultStandardSort: "desc", filterable: 1, filterType: "TIME_RANGE", enumValues: null, orderNum: 90 },
    { fieldName: "statementTime", displayName: "结案时间", visible: 1, sortable: 1, sortType: "STANDARD", sortField: "statementTime", defaultStandardSort: null, filterable: 1, filterType: "TIME_RANGE", enumValues: null, orderNum: 100 },
    { fieldName: "remarks", displayName: "备注", visible: 1, sortable: 0, sortType: null, sortField: null, defaultStandardSort: null, filterable: 1, filterType: "FUZZY", enumValues: null, orderNum: 110 }
  ]
}

const purchaseOrderQueryConfig = {
  queryInfo: {
    queryKey: "PurchaseOrder",
    queryName: "采购订单查询",
    description: null
  },
  columns: [
    { fieldName: "purchaseCode", displayName: "采购单号", visible: 1, sortable: 1, sortType: "STANDARD", sortField: "purchaseCode", defaultStandardSort: null, filterable: 1, filterType: "FUZZY", enumValues: null, orderNum: 10 },
    { fieldName: "dataSource", displayName: "来源", visible: 1, sortable: 1, sortType: "STANDARD", sortField: "dataSource", defaultStandardSort: null, filterable: 1, filterType: "ENUM", enumValues: [{ label: "MES", value: 1 }, { label: "ERP", value: 2 }], orderNum: 20 },
    { fieldName: "purchaseStatus", displayName: "状态", visible: 1, sortable: 1, sortType: "STANDARD", sortField: "purchaseStatus", defaultStandardSort: null, filterable: 1, filterType: "ENUM", enumValues: [{ label: "待收货", value: 0 }, { label: "部分收货", value: 1 }, { label: "已完成", value: 2 }, { label: "已结案", value: 3 }], orderNum: 30 },
    { fieldName: "supplierName", displayName: "供应商名称", visible: 1, sortable: 1, sortType: "STANDARD", sortField: "supplierName", defaultStandardSort: null, filterable: 1, filterType: "FUZZY", enumValues: null, orderNum: 40 },
    { fieldName: "supplierCode", displayName: "供应商编号", visible: 1, sortable: 1, sortType: "STANDARD", sortField: "supplierCode", defaultStandardSort: null, filterable: 1, filterType: "FUZZY", enumValues: null, orderNum: 50 },
    { fieldName: "purchaseContent", displayName: "采购内容", visible: 1, sortable: 0, sortType: null, sortField: null, defaultStandardSort: null, filterable: 1, filterType: "FUZZY", enumValues: null, orderNum: 60 },
    { fieldName: "eta", displayName: "预计收货日期", visible: 1, sortable: 1, sortType: "STANDARD", sortField: "eta", defaultStandardSort: null, filterable: 1, filterType: "TIME_RANGE", enumValues: null, orderNum: 70 },
    { fieldName: "createTime", displayName: "创建时间", visible: 1, sortable: 1, sortType: "STANDARD", sortField: "createTime", defaultStandardSort: null, filterable: 1, filterType: "TIME_RANGE", enumValues: null, orderNum: 80 },
    { fieldName: "checkTime", displayName: "复核时间", visible: 1, sortable: 1, sortType: "STANDARD", sortField: "checkTime", defaultStandardSort: null, filterable: 1, filterType: "TIME_RANGE", enumValues: null, orderNum: 90 },
    { fieldName: "statementTime", displayName: "结案时间", visible: 1, sortable: 1, sortType: "STANDARD", sortField: "statementTime", defaultStandardSort: null, filterable: 1, filterType: "TIME_RANGE", enumValues: null, orderNum: 100 },
    { fieldName: "remarks", displayName: "备注", visible: 1, sortable: 0, sortType: null, sortField: null, defaultStandardSort: null, filterable: 1, filterType: "FUZZY", enumValues: null, orderNum: 110 }
  ]
}

const productionOrderQueryConfig = {
  queryInfo: {
    queryKey: "ProductionOrder",
    queryName: "生产订单查询",
    description: null
  },
  columns: [
    { fieldName: "no", displayName: "订单编号", visible: 1, sortable: 1, sortType: "STANDARD", sortField: "no", defaultStandardSort: null, filterable: 1, filterType: "FUZZY", enumValues: null, orderNum: 10 },
    { fieldName: "saleCode", displayName: "ERP工单号", visible: 1, sortable: 0, sortType: null, sortField: null, defaultStandardSort: null, filterable: 1, filterType: "EXACT", enumValues: null, orderNum: 20 },
    {
      fieldName: "type",
      displayName: "类型",
      visible: 1,
      sortable: 1,
      sortType: "STANDARD",
      sortField: "type",
      defaultStandardSort: null,
      filterable: 1,
      filterType: "ENUM",
      enumValues: [
        { label: "量产", value: 1 },
        { label: "返工", value: 5 },
        { label: "试制", value: 10 },
        { label: "改制", value: 15 }
      ],
      orderNum: 30
    },
    {
      fieldName: "source",
      displayName: "来源",
      visible: 1,
      sortable: 1,
      sortType: "STANDARD",
      sortField: "source",
      defaultStandardSort: null,
      filterable: 1,
      filterType: "ENUM",
      enumValues: [
        { label: "MES", value: 1 },
        { label: "ERP", value: 2 }
      ],
      orderNum: 40
    },
    {
      fieldName: "status",
      displayName: "状态",
      visible: 1,
      sortable: 1,
      sortType: "STANDARD",
      sortField: "status",
      defaultStandardSort: null,
      filterable: 1,
      filterType: "ENUM",
      enumValues: [
        { label: "已复核", value: 1 },
        { label: "未复核", value: 5 },
        { label: "已结案", value: 9 }
      ],
      orderNum: 50
    },
    { fieldName: "productModelName", displayName: "产品名称", visible: 1, sortable: 1, sortType: "STANDARD", sortField: "product_model_name", defaultStandardSort: null, filterable: 1, filterType: "FUZZY", enumValues: null, orderNum: 60 },
    { fieldName: "productModelSpec", displayName: "产品规格", visible: 1, sortable: 0, sortType: null, sortField: null, defaultStandardSort: null, filterable: 1, filterType: "FUZZY", enumValues: null, orderNum: 65 },
    { fieldName: "productModelCode", displayName: "产品编号", visible: 1, sortable: 1, sortType: "STANDARD", sortField: "product_model_code", defaultStandardSort: null, filterable: 1, filterType: "FUZZY", enumValues: null, orderNum: 70 },
    { fieldName: "deliveryDate", displayName: "交货日期", visible: 1, sortable: 1, sortType: "STANDARD", sortField: "delivery_date", defaultStandardSort: null, filterable: 1, filterType: "TIMERANGE", enumValues: null, orderNum: 80 },
    { fieldName: "orderAmount", displayName: "订单数量", visible: 1, sortable: 0, sortType: null, sortField: null, defaultStandardSort: null, filterable: 0, filterType: null, enumValues: null, orderNum: 90 },
    { fieldName: "scheduledQuantity", displayName: "排产数量", visible: 1, sortable: 0, sortType: null, sortField: null, defaultStandardSort: null, filterable: 0, filterType: null, enumValues: null, orderNum: 100 },
    { fieldName: "completeAmount", displayName: "完工数量", visible: 1, sortable: 0, sortType: null, sortField: null, defaultStandardSort: null, filterable: 0, filterType: null, enumValues: null, orderNum: 110 },
    { fieldName: "unitName", displayName: "单位", visible: 1, sortable: 0, sortType: null, sortField: null, defaultStandardSort: null, filterable: 0, filterType: null, enumValues: null, orderNum: 120 },
    { fieldName: "productionProgress", displayName: "生产进度", visible: 1, sortable: 0, sortType: null, sortField: null, defaultStandardSort: null, filterable: 0, filterType: null, enumValues: null, orderNum: 130 },
    { fieldName: "createTime", displayName: "创建时间", visible: 1, sortable: 1, sortType: "STANDARD", sortField: "create_time", defaultStandardSort: "desc", filterable: 1, filterType: "TIMERANGE", enumValues: null, orderNum: 140 },
    { fieldName: "remark", displayName: "备注", visible: 1, sortable: 0, sortType: null, sortField: null, defaultStandardSort: null, filterable: 1, filterType: "FUZZY", enumValues: null, orderNum: 150 }
  ]
}

const factoryProperty = (
  levelTag: string,
  {
    isInspection = false,
    isProduction = false,
    isStorage = false,
    isStorageLocation = false
  }: {
    isInspection?: boolean
    isProduction?: boolean
    isStorage?: boolean
    isStorageLocation?: boolean
  } = {}
) => ({
  isInspection: isInspection ? 1 : 0,
  isProduction: isProduction ? 1 : 0,
  isStorage: isStorage ? 1 : 0,
  isStorageLocation: isStorageLocation ? 1 : 0,
  levelTag
})

const jiangdiCraftIdForName = (name: string) => {
  const normalized = String(name || "").trim()
  let hash = 0
  for (const char of normalized) {
    hash = (hash * 31 + char.charCodeAt(0)) % 100000
  }
  return `t-jd-op-${String(hash).padStart(5, "0")}`
}

const jiangdiCraftTypeForName = (name: string) => {
  const text = String(name || "")
  if (/装配/.test(text)) return { craftTypeId: "ct1", craftTypeNo: "CT-001", craftTypeName: "装配" }
  if (/清洗|检验|检测|打磨|下架/.test(text)) return { craftTypeId: "ct3", craftTypeNo: "CT-003", craftTypeName: "辅助检测" }
  return { craftTypeId: "ct2", craftTypeNo: "CT-002", craftTypeName: "机加工" }
}

const jiangdiLineRoutes = [
  {
    line: "8A差壳",
    productName: "8A差壳",
    productCode: "JD-8A-DC",
    balanceRate: "79.85%",
    operations: [
      { name: "差座精车大端", standardTime: 270, cycleTime: 135, workerNum: 1 },
      { name: "差座粗精车小端", standardTime: 105, cycleTime: 105, workerNum: 1 },
      { name: "差座钻法兰孔、锪凹平面、锪凸平面、倒角", standardTime: 390, cycleTime: 130, workerNum: 1 },
      { name: "差盖精车大端", standardTime: 210, cycleTime: 105, workerNum: 1 },
      { name: "差盖粗精车小端", standardTime: 90, cycleTime: 90, workerNum: 1 },
      { name: "差盖钻法兰孔、锪平面、倒角", standardTime: 216, cycleTime: 108, workerNum: 1 },
      { name: "清洗", standardTime: 17, cycleTime: 63.75, workerNum: 1 },
      { name: "装配壳总成", standardTime: 31.25, cycleTime: 31.25, workerNum: 1 },
      { name: "检验端面跳动、下架", standardTime: 15.5, cycleTime: 15.5, workerNum: 1 },
      { name: "钻镗十字孔", standardTime: 210, cycleTime: 105, workerNum: 1 }
    ]
  },
  {
    line: "3A差壳",
    productName: "3A差壳",
    productCode: "JD-3A-DC",
    balanceRate: "78.98%",
    operations: [
      { name: "差座精车大端", standardTime: 220, cycleTime: 220, workerNum: 1 },
      { name: "差盖精车大端", standardTime: 195, cycleTime: 195, workerNum: 1 },
      { name: "差座差盖粗精车小端", standardTime: 206, cycleTime: 206, workerNum: 1 },
      { name: "差座钻法兰孔、锪平面、倒角", standardTime: 210, cycleTime: 195, workerNum: 1 },
      { name: "差盖钻法兰孔、锪平面、倒角", standardTime: 390, cycleTime: 390, workerNum: 1 },
      { name: "清洗", standardTime: 17, cycleTime: 85, workerNum: 1 },
      { name: "装配壳总成", standardTime: 68, cycleTime: 68, workerNum: 1 },
      { name: "钻镗十字孔", standardTime: 165, cycleTime: 195, workerNum: 1 },
      { name: "精车外圆", standardTime: 195, cycleTime: 195, workerNum: 1 }
    ]
  },
  {
    line: "N350HL差壳线",
    productName: "N350HL-CF3差壳",
    productCode: "JD-N350HL-CF3",
    balanceRate: "79.46%",
    operations: [
      { name: "粗车外圆", standardTime: 223, cycleTime: 260, workerNum: 1 },
      { name: "粗车小端轴颈", standardTime: 217, cycleTime: 217, workerNum: 1 },
      { name: "半精车小端轴颈", standardTime: 244, cycleTime: 244, workerNum: 1 },
      { name: "半精车大端轴颈", standardTime: 240, cycleTime: 269, workerNum: 1 },
      { name: "粗精车内球面", standardTime: 218, cycleTime: 269, workerNum: 1 },
      { name: "精镗内腔及一字孔", standardTime: 263, cycleTime: 263, workerNum: 1 },
      { name: "精车外圆", standardTime: 173, cycleTime: 188, workerNum: 1 },
      { name: "钻法兰孔", standardTime: 181, cycleTime: 181, workerNum: 1 },
      { name: "倒角", standardTime: 18, cycleTime: 18, workerNum: 1 },
      { name: "精锪内端面", standardTime: 138, cycleTime: 138, workerNum: 1 }
    ]
  },
  {
    line: "11CFA-1差壳线",
    productName: "11CFA-1差壳",
    productCode: "JD-11CFA1-DC",
    balanceRate: "75.60%",
    operations: [
      { name: "精车大端", standardTime: 269, cycleTime: 273, workerNum: 1 },
      { name: "精车反端", standardTime: 255, cycleTime: 255, workerNum: 1 },
      { name: "粗精车内球面", standardTime: 273, cycleTime: 273, workerNum: 1 },
      { name: "钻法兰孔、锪平面", standardTime: 240, cycleTime: 240, workerNum: 1 },
      { name: "钻镗一字孔及销孔", standardTime: 251, cycleTime: 251, workerNum: 1 },
      { name: "精车外圆", standardTime: 211, cycleTime: 211, workerNum: 1 },
      { name: "精锪内端面", standardTime: 141, cycleTime: 141, workerNum: 1 },
      { name: "倒角", standardTime: 51, cycleTime: 156, workerNum: 1 },
      { name: "钻通销孔", standardTime: 58, cycleTime: 58, workerNum: 1 },
      { name: "打磨", standardTime: 47, cycleTime: 47, workerNum: 1 }
    ]
  },
  {
    line: "N350减壳",
    productName: "N350HL",
    productCode: "JD-N350HL-JK",
    balanceRate: "72.35%",
    operations: [
      { name: "精车法兰面、止口", standardTime: 135, cycleTime: 135, workerNum: 1 },
      { name: "钻法兰面及四凸台各孔、攻四凸台螺纹孔", standardTime: 145, cycleTime: 145, workerNum: 1 },
      { name: "粗镗主动齿轮轴承孔", standardTime: 100, cycleTime: 120, workerNum: 1 },
      { name: "装配轴承盖", standardTime: 20, cycleTime: 20, workerNum: 1 },
      { name: "粗镗被动齿轮轴承孔", standardTime: 100, cycleTime: 100, workerNum: 1 },
      { name: "精镗主被动齿轮轴承孔", standardTime: 170, cycleTime: 170, workerNum: 1 },
      { name: "气密检测", standardTime: 45, cycleTime: 45, workerNum: 1 }
    ]
  },
  {
    line: "8A减壳",
    productName: "8C1",
    productCode: "JD-8C1-JK",
    balanceRate: "75.57%",
    operations: [
      { name: "精车法兰面、止口", standardTime: 100, cycleTime: 110, workerNum: 1 },
      { name: "钻法兰面孔", standardTime: 100, cycleTime: 100, workerNum: 1 },
      { name: "车平面攻丝", standardTime: 100, cycleTime: 100, workerNum: 1 },
      { name: "清洗螺纹孔", standardTime: 25, cycleTime: 50, workerNum: 1 },
      { name: "装配轴承盖", standardTime: 30, cycleTime: 30, workerNum: 1 },
      { name: "粗镗主被动齿轮孔、车端面", standardTime: 150, cycleTime: 75, workerNum: 2 },
      { name: "精镗主被动齿轮孔、车端面", standardTime: 190, cycleTime: 95, workerNum: 1 },
      { name: "镗丝", standardTime: 130, cycleTime: 65, workerNum: 1 },
      { name: "套车外圆、钻孔、倒角、攻丝", standardTime: 100, cycleTime: 100, workerNum: 1 },
      { name: "气密检测", standardTime: 70, cycleTime: 70, workerNum: 1 }
    ]
  },
  {
    line: "3A减壳",
    productName: "3CE",
    productCode: "JD-3CE-JK",
    balanceRate: "67.00%",
    operations: [
      { name: "精车法兰面、止口", standardTime: 100, cycleTime: 105, workerNum: 1 },
      { name: "铣小端平面", standardTime: 90, cycleTime: 90, workerNum: 1 },
      { name: "钻法兰面及四凸台各孔、攻四凸台螺纹孔", standardTime: 128, cycleTime: 128, workerNum: 1 },
      { name: "粗镗主动齿轮轴承孔", standardTime: 115, cycleTime: 120, workerNum: 1 },
      { name: "装配轴承盖", standardTime: 20, cycleTime: 20, workerNum: 1 },
      { name: "粗镗被动齿轮轴承孔", standardTime: 115, cycleTime: 115, workerNum: 1 },
      { name: "精镗主被动齿轮轴承孔", standardTime: 180, cycleTime: 180, workerNum: 1 },
      { name: "气密检测", standardTime: 70, cycleTime: 70, workerNum: 1 }
    ]
  },
  {
    line: "8A轮芯线",
    productName: "8A轮芯",
    productCode: "JD-8A-LX",
    balanceRate: "93.43%",
    operations: [
      { name: "精车内孔及端面", standardTime: 227, cycleTime: 142.2, workerNum: 1 },
      { name: "精车端面及止口", standardTime: 96, cycleTime: 96, workerNum: 1 },
      { name: "钻、铰孔、倒角及攻丝", standardTime: 373, cycleTime: 163.7, workerNum: 1 }
    ]
  },
  {
    line: "11A轮芯线",
    productName: "11A轮芯",
    productCode: "JD-11A-LX",
    balanceRate: "80.51%",
    operations: [
      { name: "精车内孔及端面", standardTime: 195, cycleTime: 102.8, workerNum: 1 },
      { name: "钻孔、铰孔、攻丝", standardTime: 217, cycleTime: 144, workerNum: 1 },
      { name: "倒角", standardTime: 244, cycleTime: 244, workerNum: 1 },
      { name: "压螺栓", standardTime: 15, cycleTime: 101, workerNum: 1 },
      { name: "精车外圆", standardTime: 87, cycleTime: 87, workerNum: 1 }
    ]
  },
  {
    line: "2020轮芯线",
    productName: "2020轮芯",
    productCode: "JD-2020-LX",
    balanceRate: "77.72%",
    operations: [
      { name: "精车内孔及端面", standardTime: 195, cycleTime: 102, workerNum: 1 },
      { name: "精车反端", standardTime: 55, cycleTime: 55, workerNum: 1 },
      { name: "钻铰孔及攻丝", standardTime: 277, cycleTime: 184, workerNum: 1 },
      { name: "钻铰孔及攻丝", standardTime: 277, cycleTime: 184, workerNum: 1 }
    ]
  },
  {
    line: "8A轴承座线",
    productName: "8A轴承座",
    productCode: "JD-8A-ZCZ",
    balanceRate: "87.50%",
    operations: [
      { name: "精车各处", standardTime: 310, cycleTime: 120, workerNum: 1 },
      { name: "钻法兰面孔", standardTime: 60, cycleTime: 90, workerNum: 1 },
      { name: "钻斜油孔", standardTime: 35, cycleTime: 35, workerNum: 1 }
    ]
  },
  {
    line: "1027轴承座线",
    productName: "1027轴承座",
    productCode: "JD-1027-ZCZ",
    balanceRate: "86.21%",
    operations: [
      { name: "精车大端", standardTime: 246, cycleTime: 145, workerNum: 1 },
      { name: "精车反端", standardTime: 113, cycleTime: 113, workerNum: 1 },
      { name: "钻孔及倒角", standardTime: 95, cycleTime: 105, workerNum: 1 }
    ]
  },
  {
    line: "BT1230/BT13250套管线",
    productName: "铸件套管",
    productCode: "JD-BT-TG",
    balanceRate: "79.53%",
    operations: [
      { name: "钻φ10.3法兰面孔", standardTime: 258, cycleTime: 258, workerNum: 1 },
      { name: "铣法兰面孔反面", standardTime: 219, cycleTime: 438, workerNum: 2 },
      { name: "钻φ8.5凸缘头孔", standardTime: 258, cycleTime: 258, workerNum: 1 },
      { name: "打磨孔反面飞边毛刺", standardTime: 134, cycleTime: 134, workerNum: 1 },
      { name: "气密检测", standardTime: 110, cycleTime: 110, workerNum: 1 },
      { name: "钻镗衬套孔及铣平面", standardTime: 238.33, cycleTime: 492, workerNum: 1 },
      { name: "铣衬套孔反面及倒角", standardTime: 223, cycleTime: 223, workerNum: 1 }
    ]
  }
].map((line, lineIndex) => ({
  ...line,
  id: `jd-line-${String(lineIndex + 1).padStart(2, "0")}`,
  productionUnitId: `pu-jd-${String(lineIndex + 1).padStart(2, "0")}`,
  productionUnitCode: `PU-JD-${String(lineIndex + 1).padStart(2, "0")}`,
  routeId: lineIndex === 0 ? "cr1" : `cr-jd-${String(lineIndex + 1).padStart(2, "0")}`,
  techVersionId: lineIndex === 0 ? "tv1" : `tv-jd-${String(lineIndex + 1).padStart(2, "0")}`,
  techId: jiangdiCraftIdForName(line.operations[0]?.name || line.line),
  routeNo: lineIndex === 0 ? "CR-001" : `CR-JD-${String(lineIndex + 1).padStart(3, "0")}`,
  operations: line.operations.map((operation, operationIndex) => ({
    ...operation,
    processSerial: String((operationIndex + 1) * 10),
    workstationId: `ws-jd-${String(lineIndex + 1).padStart(2, "0")}-${String(operationIndex + 1).padStart(2, "0")}`,
    workstationCode: `WS-JD-${String(lineIndex + 1).padStart(2, "0")}-${String(operationIndex + 1).padStart(2, "0")}`
  }))
}))

const jiangdiCraftRows = Array.from(
  new Map(
    jiangdiLineRoutes.flatMap((line) =>
      line.operations.map((operation) => {
        const craftType = jiangdiCraftTypeForName(operation.name)
        return [
          operation.name,
          {
            id: jiangdiCraftIdForName(operation.name),
            no: `T-JD-${jiangdiCraftIdForName(operation.name).replace("t-jd-op-", "")}`,
            name: operation.name,
            remarks: `来源：${line.line}，标准工时 ${operation.standardTime} 秒，工位节拍 ${operation.cycleTime} 秒`,
            bizType: 1,
            status: 1,
            techDetailId: 1,
            techType: 1,
            versions: 1,
            productModelId: `pm-${line.id}`,
            productModelName: line.productName,
            createBy: "1",
            createTime: now,
            updateBy: "1",
            updateTime: now,
            ...craftType
          }
        ] as const
      })
    )
  ).values()
)

const factoryModelRows = [
  {
    id: "factory-root",
    entityId: "factory-root",
    entityCode: "FACTORY_ROOT",
    entityName: "主工厂",
    levelTag: "factory",
    parentId: "",
    parentCode: "",
    parentName: "",
    isEnable: true,
    isInspection: false,
    isProduction: false,
    isStorage: false,
    isStorageLocation: false,
    warehouseType: 0,
    inspectionType: 0,
    propertyVO: factoryProperty("factory")
  },
  {
    id: "wh-rm-01",
    entityId: "wh-rm-01",
    entityCode: "WH-RM-01",
    entityName: "一号原料库",
    levelTag: "warehouse",
    parentId: "factory-root",
    parentCode: "FACTORY_ROOT",
    parentName: "主工厂",
    isEnable: true,
    isInspection: false,
    isProduction: false,
    isStorage: true,
    isStorageLocation: false,
    warehouseType: 1,
    inspectionType: 0,
    storageBarcode: "WH-RM-01-BC",
    propertyVO: factoryProperty("warehouse", { isStorage: true })
  },
  {
    id: "wh-fg-02",
    entityId: "wh-fg-02",
    entityCode: "WH-FG-02",
    entityName: "二号成品库",
    levelTag: "warehouse",
    parentId: "factory-root",
    parentCode: "FACTORY_ROOT",
    parentName: "主工厂",
    isEnable: true,
    isInspection: false,
    isProduction: false,
    isStorage: true,
    isStorageLocation: false,
    warehouseType: 2,
    inspectionType: 0,
    storageBarcode: "WH-FG-02-BC",
    propertyVO: factoryProperty("warehouse", { isStorage: true })
  },
  {
    id: "wh-sfg-03",
    entityId: "wh-sfg-03",
    entityCode: "WH-SFG-03",
    entityName: "三号半成品库",
    levelTag: "warehouse",
    parentId: "factory-root",
    parentCode: "FACTORY_ROOT",
    parentName: "主工厂",
    isEnable: true,
    isInspection: false,
    isProduction: false,
    isStorage: true,
    isStorageLocation: false,
    warehouseType: 3,
    inspectionType: 0,
    storageBarcode: "WH-SFG-03-BC",
    propertyVO: factoryProperty("warehouse", { isStorage: true })
  },
  {
    id: "wh-mro-04",
    entityId: "wh-mro-04",
    entityCode: "WH-MRO-04",
    entityName: "四号MRO库",
    levelTag: "warehouse",
    parentId: "factory-root",
    parentCode: "FACTORY_ROOT",
    parentName: "主工厂",
    isEnable: true,
    isInspection: false,
    isProduction: false,
    isStorage: true,
    isStorageLocation: false,
    warehouseType: 7,
    inspectionType: 0,
    storageBarcode: "WH-MRO-04-BC",
    propertyVO: factoryProperty("warehouse", { isStorage: true })
  },
  {
    id: "area-n",
    entityId: "area-n",
    entityCode: "AREA-N",
    entityName: "北区",
    levelTag: "productionArea",
    parentId: "factory-root",
    parentCode: "FACTORY_ROOT",
    parentName: "主工厂",
    isEnable: true,
    isInspection: false,
    isProduction: true,
    isStorage: false,
    isStorageLocation: false,
    warehouseType: 0,
    inspectionType: 0,
    leader: "生产主管A",
    propertyVO: factoryProperty("productionArea", { isProduction: true })
  },
  {
    id: "area-s",
    entityId: "area-s",
    entityCode: "AREA-S",
    entityName: "南区",
    levelTag: "productionArea",
    parentId: "factory-root",
    parentCode: "FACTORY_ROOT",
    parentName: "主工厂",
    isEnable: true,
    isInspection: false,
    isProduction: true,
    isStorage: false,
    isStorageLocation: false,
    warehouseType: 0,
    inspectionType: 0,
    leader: "生产主管B",
    propertyVO: factoryProperty("productionArea", { isProduction: true })
  },
  {
    id: "area-jk",
    entityId: "area-jk",
    entityCode: "AREA-JK",
    entityName: "减壳车间",
    levelTag: "productionArea",
    parentId: "factory-root",
    parentCode: "FACTORY_ROOT",
    parentName: "主工厂",
    isEnable: true,
    isInspection: false,
    isProduction: true,
    isStorage: false,
    isStorageLocation: false,
    warehouseType: 0,
    inspectionType: 0,
    leader: "车间主任A",
    propertyVO: factoryProperty("productionArea", { isProduction: true })
  },
  {
    id: "lab-01",
    entityId: "lab-01",
    entityCode: "LAB-01",
    entityName: "中心实验室",
    levelTag: "laboratory",
    parentId: "factory-root",
    parentCode: "FACTORY_ROOT",
    parentName: "主工厂",
    isEnable: true,
    isInspection: true,
    isProduction: false,
    isStorage: false,
    isStorageLocation: false,
    warehouseType: 0,
    inspectionType: 1,
    propertyVO: factoryProperty("laboratory", { isInspection: true })
  },
  ...jiangdiLineRoutes.map((line) => ({
    id: line.productionUnitId,
    entityId: line.productionUnitId,
    entityCode: line.productionUnitCode,
    entityName: line.line,
    levelTag: "productionUnit",
    parentId: "area-jk",
    parentCode: "AREA-JK",
    parentName: "减壳车间",
    isEnable: true,
    isInspection: false,
    isProduction: true,
    isStorage: false,
    isStorageLocation: false,
    warehouseType: 0,
    inspectionType: 0,
    propertyVO: factoryProperty("productionUnit", { isProduction: true })
  })),
  ...jiangdiLineRoutes.flatMap((line) =>
    line.operations.map((operation) => ({
      id: operation.workstationId,
      entityId: operation.workstationId,
      entityCode: operation.workstationCode,
      entityName: operation.name,
      levelTag: "workstation",
      parentId: line.productionUnitId,
      parentCode: line.productionUnitCode,
      parentName: line.line,
      isEnable: true,
      isInspection: false,
      isProduction: true,
      isStorage: false,
      isStorageLocation: false,
      warehouseType: 0,
      inspectionType: 0,
      propertyVO: factoryProperty("workstation", { isProduction: true })
    }))
  ),
  ...[
    ["pu-1", "area-n", "总装一单元", "PU-ZZ-01", "北区", "AREA-N"],
    ["pu-2", "area-n", "总装二单元", "PU-ZZ-02", "北区", "AREA-N"],
    ["pu-3", "area-n", "机加单元", "PU-JJ-01", "北区", "AREA-N"],
    ["pu-4", "area-n", "焊接单元", "PU-HJ-01", "北区", "AREA-N"],
    ["pu-5", "area-s", "南区单元A", "PU-S-A", "南区", "AREA-S"],
    ["pu-6", "area-s", "南区单元B", "PU-S-B", "南区", "AREA-S"],
    ["pu-7", "area-s", "南区单元C", "PU-S-C", "南区", "AREA-S"]
  ].map(([id, parentId, entityName, entityCode, parentName, parentCode]) => ({
    id,
    entityId: id,
    entityCode,
    entityName,
    levelTag: "productionUnit",
    parentId,
    parentCode,
    parentName,
    isEnable: true,
    isInspection: false,
    isProduction: true,
    isStorage: false,
    isStorageLocation: false,
    warehouseType: 0,
    inspectionType: 0,
    propertyVO: factoryProperty("productionUnit", { isProduction: true })
  })),
  ...[
    ["wh-rm-01-loc-01", "wh-rm-01", "一号区-01位", "LOC-RM-01-01", "一号原料库", "WH-RM-01"],
    ["wh-rm-01-loc-02", "wh-rm-01", "一号区-02位", "LOC-RM-01-02", "一号原料库", "WH-RM-01"],
    ["wh-rm-01-loc-03", "wh-rm-01", "一号区-03位", "LOC-RM-01-03", "一号原料库", "WH-RM-01"],
    ["wh-fg-02-loc-01", "wh-fg-02", "二号区-01位", "LOC-FG-02-01", "二号成品库", "WH-FG-02"],
    ["wh-fg-02-loc-02", "wh-fg-02", "二号区-02位", "LOC-FG-02-02", "二号成品库", "WH-FG-02"],
    ["wh-fg-02-loc-03", "wh-fg-02", "二号区-03位", "LOC-FG-02-03", "二号成品库", "WH-FG-02"],
    ["wh-sfg-03-loc-01", "wh-sfg-03", "三号区-01位", "LOC-SFG-03-01", "三号半成品库", "WH-SFG-03"],
    ["wh-sfg-03-loc-02", "wh-sfg-03", "三号区-02位", "LOC-SFG-03-02", "三号半成品库", "WH-SFG-03"],
    ["wh-mro-04-loc-01", "wh-mro-04", "四号区-01位", "LOC-MRO-04-01", "四号MRO库", "WH-MRO-04"],
    ["wh-mro-04-loc-02", "wh-mro-04", "四号区-02位", "LOC-MRO-04-02", "四号MRO库", "WH-MRO-04"],
    ["wh-mro-04-loc-03", "wh-mro-04", "四号区-03位", "LOC-MRO-04-03", "四号MRO库", "WH-MRO-04"]
  ].map(([id, parentId, entityName, entityCode, parentName, parentCode]) => ({
    id,
    entityId: id,
    entityCode,
    entityName,
    levelTag: "location",
    parentId,
    parentCode,
    parentName,
    isEnable: true,
    isInspection: false,
    isProduction: false,
    isStorage: false,
    isStorageLocation: true,
    warehouseType: 0,
    inspectionType: 0,
    barcode: `${entityCode}-BC`,
    propertyVO: factoryProperty("location", { isStorageLocation: true })
  }))
]

const factoryModels = factoryModelRows

const buildFactoryTree = (parentId = ""): any[] =>
  factoryModelRows
    .filter((item) => String(item.parentId || "") === String(parentId || ""))
    .map((item) => ({
      ...item,
      children: buildFactoryTree(item.entityId)
    }))

const factoryTree = buildFactoryTree("")

const warehouses = [
  {
    id: "1",
    facilityCode: "WH-001",
    facilityName: "本地演示仓库",
    isEnable: true,
    parentId: "0",
    warehouseType: 1
  }
]

const getDemoProductSpecByCode = (code = "") => {
  const specMap: Record<string, string> = {
    "GR-HSG-001": "A型 380x260x180",
    "GR-SHAFT-002": "B型 Φ80x420",
    "AXLE-BRKT-003": "C型 加强筋",
    "JD-N350HL-JK": "N350HL 减壳",
    "JD-8C1-JK": "8A 差壳",
    "JD-3CE-JK": "3A 差壳",
    "FG-HUB-002": "B型 18寸",
    "FG-BR-003": "C型 加强筋",
    "RM-IRON-001": "QT450-10",
    "RM-AL-002": "6061-T6",
    "RM-RS-003": "50kg/袋",
    "MRO-CUT-001": "月度保养套装"
  }
  return specMap[String(code || "")] || "标准规格"
}

const products = [
  {
    id: "pm1",
    productModelId: "pm1",
    productModelCode: "GR-HSG-001",
    productModelNo: "GR-HSG-001",
    productModelName: "减速器壳体总成A型",
    productModelSpec: getDemoProductSpecByCode("GR-HSG-001"),
    name: "减速器壳体总成A型",
    code: "GR-HSG-001",
    specification: getDemoProductSpecByCode("GR-HSG-001"),
    productCategoryName: "壳体类",
    unitId: "1",
    unitName: "件",
    productModelUnitList: [
      {
        unitId: "1",
        unitName: "件",
        conversionBasis: 1,
        isDefaultUnit: true
      }
    ]
  }
]

const productCategories = [
  {
    id: "pcat-1",
    productCategoryId: "pcat-1",
    productCategoryCode: "CAT-001",
    productCategoryName: "壳体类",
    categoryCode: "CAT-001",
    categoryName: "壳体类",
    parentId: "0",
    label: "壳体类",
    value: "pcat-1",
    children: []
  }
]

const units = [
  {
    id: "1",
    unitId: "1",
    unitName: "件",
    unitCode: "PCS",
    decimalNumber: 0,
    remarks: "基础件数单位",
    label: "件",
    value: "1",
    createBy: 1,
    createTime: now,
    updateBy: 1,
    updateTime: now
  },
  {
    id: "2",
    unitId: "2",
    unitName: "套",
    unitCode: "SET",
    decimalNumber: 0,
    remarks: "总成套件单位",
    label: "套",
    value: "2",
    createBy: 1,
    createTime: now,
    updateBy: 1,
    updateTime: now
  },
  {
    id: "3",
    unitId: "3",
    unitName: "分钟",
    unitCode: "MIN",
    decimalNumber: 0,
    remarks: "工时单位",
    label: "分钟",
    value: "3",
    createBy: 1,
    createTime: now,
    updateBy: 1,
    updateTime: now
  },
  {
    id: "4",
    unitId: "4",
    unitName: "mm",
    unitCode: "MM",
    decimalNumber: 2,
    remarks: "尺寸检验单位",
    label: "mm",
    value: "4",
    createBy: 1,
    createTime: now,
    updateBy: 1,
    updateTime: now
  },
  {
    id: "5",
    unitId: "5",
    unitName: "kg",
    unitCode: "KG",
    decimalNumber: 3,
    remarks: "重量单位",
    label: "kg",
    value: "5",
    createBy: 1,
    createTime: now,
    updateBy: 1,
    updateTime: now
  }
]

const craftRouteCreateTime = "2026-07-01 14:57:23"
const craftRouteProduct = products[0]
const craftRouteUnit = {
  id: "1",
  unitId: "1",
  unitCode: "PCS",
  unitName: "件",
  decimalNumber: 0,
  remarks: "基础件数单位",
  createBy: 1,
  createTime: craftRouteCreateTime,
  updateBy: 1,
  updateTime: craftRouteCreateTime
}
const alignedCrafts = [
  ...jiangdiCraftRows
]
const buildCraftRouteTech = (craft: (typeof alignedCrafts)[number]) => ({
  ...craft,
  remarks: "",
  status: 1,
  techDetailId: 1,
  techType: 1,
  versions: 1,
  createBy: 1,
  createTime: craftRouteCreateTime,
  updateBy: 1,
  updateTime: craftRouteCreateTime
})
const buildCraftRouteTechVersion = (
  techVersionId: string,
  craft: (typeof alignedCrafts)[number],
  routeName: string,
  version: string,
  remarks = "",
  productModel = craftRouteProduct
) => ({
  id: techVersionId,
  name: `${productModel.productModelName}-${routeName}`,
  no: `TV-${techVersionId.toUpperCase()}`,
  version,
  nature: 1,
  queryProductName: productModel.productModelName,
  queryProductNo: productModel.productModelCode,
  remarks,
  sourceType: 1,
  status: 1,
  techDetailId: 1,
  techId: craft.id,
  techNo: craft.no,
  type: 1,
  bizType: 2,
  createBy: 1,
  createTime: craftRouteCreateTime,
  updateBy: 1,
  updateTime: craftRouteCreateTime,
  validityStart: "",
  validityEnd: ""
})
const buildJiangdiRouteProduct = (line: (typeof jiangdiLineRoutes)[number]) => ({
  id: `pm-${line.id}`,
  code: line.productCode,
  name: line.productName,
  productModelCode: line.productCode,
  productModelName: line.productName,
  productModelSpec: getDemoProductSpecByCode(line.productCode),
  specification: getDemoProductSpecByCode(line.productCode),
  defaultUnitId: 1,
  defaultUnitName: "件",
  unitName: "件",
  productCategoryCode: "CAT-JD",
  productCategoryId: 1,
  productCategoryName: "减壳车间产品",
  productModelUnitList: craftRouteProduct.productModelUnitList,
  productType: 1,
  remark: `来源：江底公司各生产线平衡率统计-2023，平衡率 ${line.balanceRate}`,
  status: 1,
  createBy: 1,
  createTime: craftRouteCreateTime,
  updateBy: 1,
  updateTime: craftRouteCreateTime
})
const staticCraftRoutes: any[] = jiangdiLineRoutes.map((line, index) => ({
  routeId: line.routeId,
  techVersionId: line.techVersionId,
  techId: line.techId,
  name: `${line.line}工艺路线`,
  no: line.routeNo,
  version: "1.0",
  remarks: `根据${line.line}平衡率表模拟，产品：${line.productName}，平衡率：${line.balanceRate}`,
  line
})).map((item, index) => {
  const craft = alignedCrafts.find((row) => row.id === item.techId) || alignedCrafts[0]
  const routeProduct = buildJiangdiRouteProduct(item.line)
  const publishStatus = index === 0 ? 2 : 1
  return {
    id: item.routeId,
    techVersionId: item.techVersionId,
    name: item.name,
    no: item.no,
    remarks: item.remarks,
    status: 1,
    publishStatus,
    sourceType: 1,
    productModel: {
      id: routeProduct.id,
      code: routeProduct.productModelCode,
      name: routeProduct.productModelName,
      specification: routeProduct.specification,
      defaultUnitId: 1,
      defaultUnitName: routeProduct.unitName,
      productCategoryCode: routeProduct.productCategoryCode,
      productCategoryId: 1,
      productCategoryName: routeProduct.productCategoryName,
      productModelUnitList: routeProduct.productModelUnitList,
      productType: 1,
      remark: routeProduct.remark,
      status: 1,
      createBy: 1,
      createTime: craftRouteCreateTime,
      updateBy: 1,
      updateTime: craftRouteCreateTime
    },
    productModelUnitList: routeProduct.productModelUnitList,
    unitItem: craftRouteUnit,
    tech: buildCraftRouteTech(craft),
    techDetail: {
      id: 1,
      nodeCount: 4,
      enableProductModelIds: [1],
      createBy: 1,
      createTime: craftRouteCreateTime,
      updateBy: 1,
      updateTime: craftRouteCreateTime
    },
    techVersion: buildCraftRouteTechVersion(item.techVersionId, craft, item.name, item.version, item.remarks, routeProduct),
    createBy: "1",
    createTime: craftRouteCreateTime,
    updateBy: "1",
    updateTime: craftRouteCreateTime
  }
})

staticCraftRoutes.push(
  {
    id: "cr-rework-1",
    techVersionId: "tv-rework-1",
    name: "通用返工工艺模板",
    no: "RW-CR-001",
    remarks: "用于返工订单的通用处理流程，不绑定具体产品",
    status: 1,
    publishStatus: 2,
    routePurpose: "rework-template",
    sourceType: 1,
    productModel: null as any,
    productModelUnitList: [],
    unitItem: null as any,
    tech: buildCraftRouteTech(alignedCrafts[0]),
    techDetail: {
      id: 1,
      nodeCount: 4,
      enableProductModelIds: [],
      createBy: 1,
      createTime: craftRouteCreateTime,
      updateBy: 1,
      updateTime: craftRouteCreateTime
    },
    techVersion: {
      id: "tv-rework-1",
      name: "通用返工工艺模板",
      no: "TV-REWORK-001",
      version: "1.0",
      nature: 1,
      queryProductName: "",
      queryProductNo: "",
      remarks: "用于返工订单的通用处理流程，不绑定具体产品",
      sourceType: 1,
      status: 1,
      techDetailId: 1,
      techId: alignedCrafts[0].id,
      techNo: alignedCrafts[0].no,
      type: 1,
      bizType: 2,
      createBy: 1,
      createTime: craftRouteCreateTime,
      updateBy: 1,
      updateTime: craftRouteCreateTime,
      validityStart: "",
      validityEnd: ""
    },
    createBy: "1",
    createTime: craftRouteCreateTime,
    updateBy: "1",
    updateTime: craftRouteCreateTime
  },
  {
    id: "cr-rework-2",
    techVersionId: "tv-rework-2",
    name: "返工补加工模板",
    no: "RW-CR-002",
    remarks: "返工补加工、复检、返修确认流程",
    status: 1,
    publishStatus: 1,
    routePurpose: "rework-template",
    sourceType: 1,
    productModel: null as any,
    productModelUnitList: [],
    unitItem: null as any,
    tech: buildCraftRouteTech(alignedCrafts[1] || alignedCrafts[0]),
    techDetail: {
      id: 1,
      nodeCount: 3,
      enableProductModelIds: [],
      createBy: 1,
      createTime: craftRouteCreateTime,
      updateBy: 1,
      updateTime: craftRouteCreateTime
    },
    techVersion: {
      id: "tv-rework-2",
      name: "返工补加工模板",
      no: "TV-REWORK-002",
      version: "1.0",
      nature: 1,
      queryProductName: "",
      queryProductNo: "",
      remarks: "返工补加工、复检、返修确认流程",
      sourceType: 1,
      status: 1,
      techDetailId: 1,
      techId: alignedCrafts[1]?.id || alignedCrafts[0].id,
      techNo: alignedCrafts[1]?.no || alignedCrafts[0].no,
      type: 1,
      bizType: 2,
      createBy: 1,
      createTime: craftRouteCreateTime,
      updateBy: 1,
      updateTime: craftRouteCreateTime,
      validityStart: "",
      validityEnd: ""
    },
    createBy: "1",
    createTime: craftRouteCreateTime,
    updateBy: "1",
    updateTime: craftRouteCreateTime
  }
)

const buildStaticTechProcess = (
  techVersionId: string,
  processSerial: string,
  techId: string,
  sortNum: number,
  preSerial = "",
  operation?: {
    name: string
    standardTime: number
    cycleTime: number
    workerNum: number
    workstationId: string
    workstationCode: string
  },
  line?: (typeof jiangdiLineRoutes)[number]
) => {
  const craft = alignedCrafts.find((row) => row.id === techId) || alignedCrafts[0]
  return {
    id: `tp-${techVersionId}-${processSerial}`,
    name: operation?.name || craft.name,
    craftTypeId: craft.craftTypeId,
    craftTypeNo: craft.craftTypeNo,
    craftTypeName: craft.craftTypeName,
    nature: 1,
    bizTypeName: "生产加工",
    bizType: 1,
    preProcessList: preSerial ? [{ id: `tp-${techVersionId}-${preSerial}`, processSerial: preSerial }] : [],
    processSerial,
    reportType: 1,
    sortNum,
    techId: craft.id,
    techNo: craft.no,
    techVersionId,
    isReverseTime: 0,
    type: 1,
    status: 1,
    outputType: 1,
    productionSchedulingType: 1,
    defaultCodeRelationType: 1,
    codeRelate: 0,
    vehicleRelate: 0,
    standardTime: operation?.standardTime,
    ctTime: operation?.cycleTime,
    workerNum: operation?.workerNum,
    productionUnitId: line?.productionUnitId,
    productionUnitName: line?.line,
    workstationId: operation?.workstationId,
    workstationCode: operation?.workstationCode,
    workstationName: operation?.name
  }
}
const staticTechProcessesByVersion: Record<string, any[]> = {
  ...Object.fromEntries(
    jiangdiLineRoutes.map((line) => [
      line.techVersionId,
      line.operations.map((operation, index) =>
        buildStaticTechProcess(
          line.techVersionId,
          operation.processSerial,
          jiangdiCraftIdForName(operation.name),
          index + 1,
          index === 0 ? "" : line.operations[index - 1].processSerial,
          operation,
          line
        )
      )
    ])
  )
}
staticTechProcessesByVersion["tv-rework-1"] = [
  buildStaticTechProcess("tv-rework-1", "10", alignedCrafts[0].id, 1, "", {
    name: "返工判定",
    standardTime: 30,
    cycleTime: 30,
    workerNum: 1,
    workstationId: "ws-jk-8a-10",
    workstationCode: "WS-JK-8A-10"
  }),
  buildStaticTechProcess("tv-rework-1", "20", alignedCrafts[1]?.id || alignedCrafts[0].id, 2, "10", {
    name: "返工处理",
    standardTime: 120,
    cycleTime: 120,
    workerNum: 1,
    workstationId: "ws-jk-8a-20",
    workstationCode: "WS-JK-8A-20"
  }),
  buildStaticTechProcess("tv-rework-1", "30", alignedCrafts[2]?.id || alignedCrafts[0].id, 3, "20", {
    name: "返工复检",
    standardTime: 45,
    cycleTime: 45,
    workerNum: 1,
    workstationId: "ws-jk-8a-30",
    workstationCode: "WS-JK-8A-30"
  })
]
staticTechProcessesByVersion["tv-rework-2"] = [
  buildStaticTechProcess("tv-rework-2", "10", alignedCrafts[0].id, 1, "", {
    name: "返工确认",
    standardTime: 25,
    cycleTime: 25,
    workerNum: 1,
    workstationId: "ws-jk-3a-10",
    workstationCode: "WS-JK-3A-10"
  }),
  buildStaticTechProcess("tv-rework-2", "20", alignedCrafts[1]?.id || alignedCrafts[0].id, 2, "10", {
    name: "补加工",
    standardTime: 150,
    cycleTime: 150,
    workerNum: 1,
    workstationId: "ws-jk-3a-20",
    workstationCode: "WS-JK-3A-20"
  }),
  buildStaticTechProcess("tv-rework-2", "30", alignedCrafts[2]?.id || alignedCrafts[0].id, 3, "20", {
    name: "终检确认",
    standardTime: 60,
    cycleTime: 60,
    workerNum: 1,
    workstationId: "ws-jk-3a-30",
    workstationCode: "WS-JK-3A-30"
  })
]
const processNameBySerial: Record<string, string> = Object.fromEntries(
  Object.values(staticTechProcessesByVersion)
    .flat()
    .map((process) => [String(process.processSerial), String(process.name)])
)
const buildStaticProcessControlPlan = (techVersionId: string) => {
  const route =
    staticCraftRoutes.find((item) => String(item.techVersionId) === String(techVersionId)) ||
    staticCraftRoutes[0]
  const productModel = route?.productModel || {}
  return (staticTechProcessesByVersion[techVersionId] || []).map((process, index) => {
    const isQualitative = index === 0 || process.processSerial === "40"
    return {
      id: `pcp-${techVersionId}-${process.processSerial}`,
      productModelId: String(productModel.id || ""),
      productModelName: String(productModel.name || productModel.productModelName || ""),
      processSerial: process.processSerial,
      inspectItemCode: `IC-${process.processSerial}`,
      inspectItemName: `${process.name}检验`,
      methodDesc: isQualitative ? "目视检查外观状态和作业完成情况" : "按工艺卡测量关键尺寸",
      standardType: isQualitative ? 2 : 1,
      inspectionStandard: isQualitative
        ? { standardType: 2, standardDesc: "外观完好、无磕碰划伤", unitId: "", unitName: "" }
        : {
            standardType: 1,
            standardDesc: "关键尺寸100±0.5mm",
            standardMax: 100.5,
            standardMaxInclusive: 1,
            standardMin: 99.5,
            standardMinInclusive: 1,
            quantitativeMode: "range",
            standardValue: 100,
            upperTolerance: 0.5,
            lowerTolerance: 0.5,
            unitId: "4",
            unitName: "mm"
          },
      isSpc: isQualitative ? 0 : 1,
      inspectionConditionList: [{ id: `cond-${techVersionId}-${process.processSerial}`, inspectMethod: index === 0 ? 1 : 3, triggerCondition: index === 0 ? 1 : 2, sampleNum: index === 0 ? 5 : 3 }],
      isSampleReturn: index < 2 ? 1 : 0,
      remark: index === 0 ? "首件必检" : "按控制计划执行",
      imageIds: [],
      imageUrls: [],
      laboratoryId: `lab-${String(index + 1).padStart(3, "0")}`
    }
  })
}

const staticProductUnits = [
  {
    id: "1",
    unitId: "1",
    unitName: "件",
    unitCode: "PCS",
    decimalNumber: 0,
    remarks: "计件单位",
    label: "件",
    value: "1",
    createBy: 1,
    createTime: now,
    updateBy: 1,
    updateTime: now
  },
  {
    id: "2",
    unitId: "2",
    unitName: "箱",
    unitCode: "BOX",
    decimalNumber: 0,
    remarks: "包装箱",
    label: "箱",
    value: "2",
    createBy: 1,
    createTime: now,
    updateBy: 1,
    updateTime: now
  },
  {
    id: "3",
    unitId: "3",
    unitName: "千克",
    unitCode: "KG",
    decimalNumber: 2,
    remarks: "重量单位",
    label: "千克",
    value: "3",
    createBy: 1,
    createTime: now,
    updateBy: 1,
    updateTime: now
  },
  {
    id: "4",
    unitId: "4",
    unitName: "套",
    unitCode: "SET",
    decimalNumber: 0,
    remarks: "成套单位",
    label: "套",
    value: "4",
    createBy: 1,
    createTime: now,
    updateBy: 1,
    updateTime: now
  }
]

const staticProductCategories = [
  { id: "pc-finished", name: "成品", code: "FG", parentId: "0", status: 1, remark: "减速器壳体、轮芯、轮毂等成品管理" },
  { id: "pc-raw", name: "原材料", code: "RM", parentId: "0", status: 1, remark: "随机模拟原材料与外购件管理" },
  { id: "pc-semi", name: "半成品", code: "WIP", parentId: "0", status: 1, remark: "随机模拟半成品和在制品管理" },
  { id: "pc-mro", name: "MRO", code: "MRO", parentId: "0", status: 1, remark: "维修运维耗材和工具管理" },
  { id: "pc-finished-wheel-core", name: "轮芯", code: "FG-LX", parentId: "pc-finished", status: 1, remark: "成品-轮芯" },
  { id: "pc-finished-reducer-shell", name: "减壳", code: "FG-JK", parentId: "pc-finished", status: 1, remark: "成品-减速器壳体" },
  { id: "pc-finished-diff-housing", name: "差壳", code: "FG-DK", parentId: "pc-finished", status: 1, remark: "成品-差速器壳体" },
  { id: "pc-finished-wheel-hub", name: "轮毂", code: "FG-LG", parentId: "pc-finished", status: 1, remark: "成品-轮毂" },
  { id: "pc-finished-sleeve", name: "套管", code: "FG-TG", parentId: "pc-finished", status: 1, remark: "成品-套管" },
  { id: "pc-finished-bearing-seat", name: "轴承座", code: "FG-ZCZ", parentId: "pc-finished", status: 1, remark: "成品-轴承座" },
  { id: "pc-raw-steel", name: "球墨铸铁锭", code: "RM-001", parentId: "pc-raw", status: 1, remark: "原材料-随机模拟" },
  { id: "pc-raw-aluminum", name: "铝合金棒料", code: "RM-002", parentId: "pc-raw", status: 1, remark: "原材料-随机模拟" },
  { id: "pc-raw-resin-sand", name: "树脂砂", code: "RM-003", parentId: "pc-raw", status: 1, remark: "原材料-随机模拟" },
  { id: "pc-raw-shot", name: "抛丸钢丸", code: "RM-004", parentId: "pc-raw", status: 1, remark: "原材料-随机模拟" },
  { id: "pc-raw-coating", name: "防锈涂料", code: "RM-005", parentId: "pc-raw", status: 1, remark: "原材料-随机模拟" },
  { id: "pc-semi-blank", name: "壳体毛坯", code: "WIP-001", parentId: "pc-semi", status: 1, remark: "半成品-随机模拟" },
  { id: "pc-mro-cutting", name: "刀具与量具", code: "MRO-001", parentId: "pc-mro", status: 1, remark: "MRO-工装" },
  { id: "pc-mro-fastener", name: "紧固件耗材", code: "MRO-002", parentId: "pc-mro", status: 1, remark: "MRO-耗材" }
].map((item) => ({
  ...item,
  productCategoryId: item.id,
  productCategoryCode: item.code,
  productCategoryName: item.name,
  categoryCode: item.code,
  categoryName: item.name,
  label: item.name,
  value: item.id,
  createBy: 1,
  createTime: now,
  updateBy: 1,
  updateTime: now
}))

const staticProductTypes = [
  { id: "1", productType: "总成品", isConfig: 1, createBy: "1", createTime: now, updateBy: "1", updateTime: now },
  { id: "2", productType: "半成品", isConfig: 1, createBy: "1", createTime: now, updateBy: "1", updateTime: now },
  { id: "3", productType: "原材料", isConfig: 1, createBy: "1", createTime: now, updateBy: "1", updateTime: now },
  { id: "4", productType: "外购件", isConfig: 1, createBy: "1", createTime: now, updateBy: "1", updateTime: now },
  { id: "5", productType: "系统过程产物", isConfig: 1, createBy: "1", createTime: now, updateBy: "1", updateTime: now },
  { id: "6", productType: "MRO", isConfig: 1, createBy: "1", createTime: now, updateBy: "1", updateTime: now }
]

const makeStaticProductUnits = (productModelId: string, defaultUnitId = "1") =>
  staticProductUnits.slice(0, defaultUnitId === "3" ? 3 : 2).map((unit, index) => ({
    id: `${productModelId}-unit-${unit.id}`,
    productModelId,
    unitId: unit.id,
    unitName: unit.unitName,
    unitCode: unit.unitCode,
    conversionRate: index === 0 ? 1 : unit.id === "2" ? 10 : 1000,
    conversionBasis: index === 0 ? 1 : unit.id === "2" ? 10 : 1000,
    isDefault: unit.id === defaultUnitId,
    isDefaultUnit: unit.id === defaultUnitId ? 1 : 0,
    status: 1,
    createBy: 1,
    createTime: now,
    updateBy: 1,
    updateTime: now
  }))

const staticProducts = [
  {
    id: "pm1",
    name: "减速器壳体总成A型",
    code: "GR-HSG-001",
    productCategoryId: "pc-finished-diff-housing",
    productType: 1,
    drawingNumber: "DRW-GR-HSG-001",
    specification: "A型 380x260x180",
    remark: "冲压车间主推成品"
  },
  {
    id: "pm2",
    name: "轮毂总成B型",
    code: "FG-HUB-002",
    productCategoryId: "pc-finished-wheel-hub",
    productType: 1,
    drawingNumber: "DRW-FG-HUB-002",
    specification: "B型 18寸",
    remark: "轮毂总成演示数据"
  },
  {
    id: "pm3",
    name: "轴承座总成C型",
    code: "FG-BR-003",
    productCategoryId: "pc-finished-bearing-seat",
    productType: 1,
    drawingNumber: "DRW-FG-BR-003",
    specification: "C型 加强筋",
    remark: "轴承座产品"
  },
  {
    id: "pm4",
    name: "壳体毛坯件",
    code: "WIP-RAW-001",
    productCategoryId: "pc-semi-blank",
    productType: 2,
    drawingNumber: "DRW-WIP-RAW-001",
    specification: "铸造毛坯",
    remark: "加工前半成品"
  },
  {
    id: "pm5",
    name: "球墨铸铁锭",
    code: "RM-IRON-001",
    productCategoryId: "pc-raw-steel",
    productType: 3,
    defaultUnitId: "3",
    drawingNumber: "MAT-RM-IRON",
    specification: "QT450-10",
    remark: "铸造用原材料"
  },
  {
    id: "pm6",
    name: "铝合金棒料",
    code: "RM-AL-002",
    productCategoryId: "pc-raw-aluminum",
    productType: 3,
    defaultUnitId: "3",
    drawingNumber: "MAT-RM-AL",
    specification: "6061-T6",
    remark: "机加工用棒料"
  },
  {
    id: "pm7",
    name: "树脂砂",
    code: "RM-RS-003",
    productCategoryId: "pc-raw-resin-sand",
    productType: 3,
    defaultUnitId: "3",
    drawingNumber: "MAT-RM-RS",
    specification: "50kg/袋",
    remark: "铸造型砂"
  },
  {
    id: "pm8",
    name: "刀具保养包",
    code: "MRO-CUT-001",
    productCategoryId: "pc-mro-cutting",
    productType: 6,
    defaultUnitId: "4",
    drawingNumber: "MRO-CUT-001",
    specification: "月度保养套装",
    remark: "MRO维护用耗材"
  }
].map((item) => {
  const category = staticProductCategories.find((categoryItem) => categoryItem.id === item.productCategoryId)
  const defaultUnitId = item.defaultUnitId || "1"
  const defaultUnit = staticProductUnits.find((unit) => unit.id === defaultUnitId) || staticProductUnits[0]
  const unitList = makeStaticProductUnits(item.id, defaultUnitId)
  return {
    ...item,
    productModelId: item.id,
    productModelCode: item.code,
    productModelNo: item.code,
    productModelName: item.name,
    productModelSpec: item.specification,
    productCategoryCode: category?.code || "",
    productCategoryName: category?.name || "",
    defaultUnitId,
    defaultUnitName: defaultUnit.unitName,
    unitId: defaultUnit.id,
    unitName: defaultUnit.unitName,
    productModelUnitList: unitList,
    status: 1,
    isKeyMaterial: item.productType === 3,
    isReversal: 0,
    period: item.productType === 1 ? 180 : 365,
    minStock: item.productType === 3 ? 500 : 20,
    safeStock: item.productType === 3 ? 1200 : 50,
    needCheck: item.productType !== 6,
    customizedFields: [],
    customizeFields: [],
    productModelDocList: [
      {
        id: `${item.id}-doc-1`,
        productModelId: item.id,
        fileId: `${item.id}-drawing`,
        documentSourceType: 1,
        createBy: "1",
        createTime: now,
        updateBy: "1",
        updateTime: now
      }
    ],
    createBy: 1,
    createTime: now,
    updateBy: 1,
    updateTime: now
  }
})

const staticProductInspectItems = [
  {
    id: "pi-1",
    productModelId: "pm1",
    inspectItemId: "qi-size-1",
    inspectItemName: "关键孔位尺寸",
    inspectItemCode: "QI-SIZE-001",
    inspectType: 1,
    qaInspectType: "1",
    qaInspectTypeName: "采购入库检",
    inspectControl: 1,
    inspectRate: 100,
    inspectSiteList: [1],
    laboratoryIdList: [],
    methodDesc: "游标卡尺测量",
    standardType: 1,
    standardDesc: "50±0.05mm",
    standardValue: 50,
    standardMin: 49.95,
    standardMax: 50.05,
    standardMinInclusive: 1,
    standardMaxInclusive: 1,
    quantitativeMode: "range",
    upperTolerance: 0.05,
    lowerTolerance: 0.05,
    upperToleranceSign: "+",
    lowerToleranceSign: "-",
    spcControl: true,
    spcLowerSpec: 49.95,
    spcUpperSpec: 50.05,
    inspectionMode: 2,
    samplingMethod: 1,
    samplingRatio: 10,
    sampleNum: 3,
    gradientModelId: "gm-1",
    isSampleReturn: false,
    status: 1,
    unitId: "1",
    unitName: "件",
    imageIds: [],
    imageUrls: [],
    createBy: "1",
    createTime: now,
    updateBy: "1",
    updateTime: now
  },
  {
    id: "pi-2",
    productModelId: "pm1",
    inspectItemId: "qi-appearance-1",
    inspectItemName: "外观划伤",
    inspectItemCode: "QI-APP-001",
    inspectType: 3,
    qaInspectType: "3",
    qaInspectTypeName: "生产入库检",
    inspectControl: 1,
    inspectRate: 100,
    inspectSiteList: [1],
    laboratoryIdList: [],
    methodDesc: "目视检查",
    standardType: 2,
    standardDesc: "表面无明显划伤、磕碰、锈蚀",
    standardMin: 0,
    standardMax: 0,
    standardMinInclusive: 1,
    standardMaxInclusive: 1,
    spcControl: false,
    spcLowerSpec: 0,
    spcUpperSpec: 0,
    inspectionMode: 2,
    samplingMethod: 2,
    samplingRatio: 100,
    sampleNum: 5,
    isSampleReturn: true,
    status: 1,
    unitId: "1",
    unitName: "件",
    imageIds: [],
    imageUrls: [],
    createBy: "1",
    createTime: now,
    updateBy: "1",
    updateTime: now
  },
  {
    id: "pi-3",
    productModelId: "pm5",
    inspectItemId: "qi-material-1",
    inspectItemName: "材质牌号",
    inspectItemCode: "QI-MAT-001",
    inspectType: 1,
    qaInspectType: "1",
    qaInspectTypeName: "采购入库检",
    inspectControl: 1,
    inspectRate: 100,
    inspectSiteList: [1],
    laboratoryIdList: [],
    methodDesc: "核对质保书",
    standardType: 2,
    standardDesc: "QT450-10，质保书与炉批号一致",
    standardMin: 0,
    standardMax: 0,
    standardMinInclusive: 1,
    standardMaxInclusive: 1,
    spcControl: false,
    spcLowerSpec: 0,
    spcUpperSpec: 0,
    inspectionMode: 2,
    samplingMethod: 1,
    samplingRatio: 5,
    sampleNum: 1,
    isSampleReturn: false,
    status: 1,
    unitId: "3",
    unitName: "千克",
    imageIds: [],
    imageUrls: [],
    createBy: "1",
    createTime: now,
    updateBy: "1",
    updateTime: now
  }
]

const staticBomRows = [
  {
    id: "bom-1",
    productId: "pm1",
    productCode: "GR-HSG-001",
    productName: "减速器壳体总成A型",
    source: "系统",
    version: "V1.0",
    status: "published",
    effectiveTime: "2026-07-01 08:00:00",
    createTime: now,
    createBy: "admin",
    updateTime: now,
    updateBy: "admin",
    remark: "减速器壳体总成标准BOM"
  },
  {
    id: "bom-2",
    productId: "pm2",
    productCode: "FG-HUB-002",
    productName: "轮毂总成B型",
    source: "ERP",
    version: "V2.1",
    status: "published",
    effectiveTime: "2026-06-20 08:00:00",
    createTime: now,
    createBy: "ERP",
    updateTime: now,
    updateBy: "ERP",
    remark: "ERP同步BOM"
  },
  {
    id: "bom-3",
    productId: "pm3",
    productCode: "FG-BR-003",
    productName: "轴承座总成C型",
    source: "系统",
    version: "V0.9",
    status: "unpublished",
    effectiveTime: "2026-07-10 08:00:00",
    createTime: now,
    createBy: "admin",
    updateTime: now,
    updateBy: "admin",
    remark: "待发布演示BOM"
  }
]

const staticBomItems: Record<string, any[]> = {
  "bom-1": [
    { id: "bom-1-item-1", productId: "pm4", productCode: "WIP-RAW-001", productName: "壳体毛坯件", unitId: "1", unitName: "件", unitList: makeStaticProductUnits("pm4"), baseQuantity: 1, composeQuantity: 1, bomVersion: "V1.0" },
    { id: "bom-1-item-2", productId: "pm5", productCode: "RM-IRON-001", productName: "球墨铸铁锭", unitId: "3", unitName: "千克", unitList: makeStaticProductUnits("pm5", "3"), baseQuantity: 12.5, composeQuantity: 12.5, bomVersion: "V1.0" },
    { id: "bom-1-item-3", productId: "pm7", productCode: "RM-RS-003", productName: "树脂砂", unitId: "3", unitName: "千克", unitList: makeStaticProductUnits("pm7", "3"), baseQuantity: 3, composeQuantity: 3, bomVersion: "V1.0" }
  ],
  "bom-2": [
    { id: "bom-2-item-1", productId: "pm6", productCode: "RM-AL-002", productName: "铝合金棒料", unitId: "3", unitName: "千克", unitList: makeStaticProductUnits("pm6", "3"), baseQuantity: 8, composeQuantity: 8, bomVersion: "V2.1" }
  ],
  "bom-3": [
    { id: "bom-3-item-1", productId: "pm5", productCode: "RM-IRON-001", productName: "球墨铸铁锭", unitId: "3", unitName: "千克", unitList: makeStaticProductUnits("pm5", "3"), baseQuantity: 9.5, composeQuantity: 9.5, bomVersion: "V0.9" }
  ]
}

const productInboundRecords = [
  {
    barcode: "BC-INV-1",
    barcodeId: "bcid-1",
    decimalNumber: 2,
    facilityId: "1",
    facilityName: "一号仓",
    inboundDetailCode: "DTL-1",
    inboundDetailId: "ind-1",
    inboundId: "in-1",
    inboundTime: "2026-07-01 09:10:00",
    inboundType: 6,
    locationId: "loc-1",
    locationName: "A-01",
    operatorId: "1",
    operatorName: "管理员",
    otherReasonContent: "",
    productId: "prod-1",
    productModelCode: "GR-HSG-001",
    productModelId: "pm1",
    productModelName: "减速器壳体总成A型",
    quantity: 11,
    unitId: "1",
    unitName: "件"
  },
  {
    barcode: "BC-INV-2",
    barcodeId: "bcid-2",
    decimalNumber: 2,
    facilityId: "1",
    facilityName: "一号仓",
    inboundDetailCode: "DTL-2",
    inboundDetailId: "ind-2",
    inboundId: "in-2",
    inboundTime: "2026-07-01 10:25:00",
    inboundType: 3,
    locationId: "loc-2",
    locationName: "B-02",
    operatorId: "1",
    operatorName: "管理员",
    otherReasonContent: "",
    productId: "prod-2",
    productModelCode: "RM-IRON-001",
    productModelId: "pm5",
    productModelName: "球墨铸铁锭",
    quantity: 12,
    unitId: "1",
    unitName: "件"
  }
]

const productOutboundRecords = [
  {
    barcode: "BC-INV-3",
    barcodeId: "bcid-3",
    decimalNumber: 2,
    facilityId: "1",
    facilityName: "一号仓",
    inboundDetailCode: "DTL-3",
    inboundDetailId: "outd-1",
    inboundId: "out-1",
    inboundTime: "2026-07-01 11:30:00",
    inboundType: 4,
    locationId: "loc-1",
    locationName: "A-01",
    operatorId: "1",
    operatorName: "管理员",
    otherReasonContent: "",
    outboundDetailCode: "DTL-3",
    outboundDetailId: "outd-1",
    outboundId: "out-1",
    outboundTime: "2026-07-01 11:30:00",
    outboundType: 4,
    productId: "prod-3",
    productModelCode: "RM-IRON-001",
    productModelId: "pm5",
    productModelName: "球墨铸铁锭",
    quantity: 13,
    unitId: "1",
    unitName: "件"
  },
  {
    barcode: "BC-INV-4",
    barcodeId: "bcid-4",
    decimalNumber: 2,
    facilityId: "1",
    facilityName: "一号仓",
    inboundDetailCode: "DTL-4",
    inboundDetailId: "outd-2",
    inboundId: "out-2",
    inboundTime: "2026-07-01 14:05:00",
    inboundType: 1,
    locationId: "loc-3",
    locationName: "C-03",
    operatorId: "1",
    operatorName: "管理员",
    otherReasonContent: "",
    outboundDetailCode: "DTL-4",
    outboundDetailId: "outd-2",
    outboundId: "out-2",
    outboundTime: "2026-07-01 14:05:00",
    outboundType: 1,
    productId: "prod-4",
    productModelCode: "GR-HSG-001",
    productModelId: "pm1",
    productModelName: "减速器壳体总成A型",
    quantity: 14,
    unitId: "1",
    unitName: "件"
  }
]

const productBatchRows = [
  {
    id: 9001,
    batchNo: "BATCH-2026-001",
    batchQuantity: 200,
    batchType: 2,
    createTime: "2026-07-01 09:30:00",
    decimalNumber: 2,
    productModelCode: "GR-HSG-001",
    productModelId: 101,
    productModelName: "减速器壳体总成A型",
    unitId: 1,
    unitName: "件",
    productionInfo: {
      executionCode: "SCH-2026-001",
      processSerial: "10",
      productionOrderNo: "MOCK-ORDER-001",
      reportTime: "2026-07-01 14:57:23",
      techVersionNo: "CR-001"
    }
  },
  {
    id: 9002,
    batchNo: "BATCH-RM-002",
    batchQuantity: 500,
    batchType: 1,
    createTime: "2026-07-01 10:20:00",
    decimalNumber: 2,
    productModelCode: "RM-IRON-001",
    productModelId: 107,
    productModelName: "球墨铸铁锭",
    unitId: 1,
    unitName: "件",
    purchaseInfo: {
      arrivalTime: "2026-07-01 10:20:00",
      purchaseCode: "PO-2026-001",
      purchaseType: 1,
      supplierName: "演示供应商"
    }
  }
]

const productScrapRows = [
  {
    id: "scr-1",
    no: "BF-2026-001",
    createTime: "2026-07-01 15:10:00",
    remarks: "mock 报废单",
    attachmentId: "",
    attachmentUrl: "",
    vehicleBarcodes: "VEH-001",
    productList: [
      {
        barcode: "BC-SCR-1",
        defaultQuantity: 2,
        defaultUnitName: "件",
        productId: "prod-scr-1",
        productModelCode: "GR-HSG-001",
        productModelName: "减速器壳体总成A型"
      }
    ],
    reportUser: { name: "张三" }
  },
  {
    id: "scr-2",
    no: "BF-2026-002",
    createTime: "2026-07-02 10:40:00",
    remarks: "不合格品报废",
    attachmentId: "",
    attachmentUrl: "",
    vehicleBarcodes: "VEH-002",
    productList: [
      {
        barcode: "BC-SCR-2",
        defaultQuantity: 1,
        defaultUnitName: "件",
        productId: "prod-scr-2",
        productModelCode: "RM-IRON-001",
        productModelName: "球墨铸铁锭"
      }
    ],
    reportUser: { name: "李四" }
  }
]

const documentDirectoryRows = [
  {
    id: "0",
    directoryName: "所有文档类型",
    parentId: "",
    parentDirectoryName: "",
    remarks: "",
    processDefineId: "",
    reviseProcessDefineId: "",
    cancellationProcessDefineId: "",
    uploadPermissionRoleCodes: [],
    revisePermissionRoleCodes: [],
    cancelPermissionRoleCodes: []
  },
  {
    id: "doc-quality",
    directoryName: "质量文档",
    parentId: "0",
    parentDirectoryName: "所有文档类型",
    remarks: "质量体系文档",
    processDefineId: "",
    reviseProcessDefineId: "",
    cancellationProcessDefineId: "",
    uploadPermissionRoleCodes: [],
    revisePermissionRoleCodes: [],
    cancelPermissionRoleCodes: []
  },
  {
    id: "doc-work-guide",
    directoryName: "作业指导书",
    parentId: "doc-quality",
    parentDirectoryName: "质量文档",
    remarks: "现场作业指导文档",
    processDefineId: "",
    reviseProcessDefineId: "",
    cancellationProcessDefineId: "",
    uploadPermissionRoleCodes: [],
    revisePermissionRoleCodes: [],
    cancelPermissionRoleCodes: []
  },
  {
    id: "doc-equipment",
    directoryName: "设备文档",
    parentId: "doc-quality",
    parentDirectoryName: "质量文档",
    remarks: "设备相关文档",
    processDefineId: "",
    reviseProcessDefineId: "",
    cancellationProcessDefineId: "",
    uploadPermissionRoleCodes: [],
    revisePermissionRoleCodes: [],
    cancelPermissionRoleCodes: []
  }
]

const documentResourceRows = [
  {
    id: "document-1",
    fileId: "file-shenling-docx",
    fileName: "申玲",
    sourceName: "申玲.docx",
    directoryId: "doc-work-guide",
    directoryName: "作业指导书",
    extension: "docx",
    version: "V1",
    fileStatus: 1,
    workflowStatus: 1,
    size: "20480",
    hash: "hash-file-shenling-docx",
    path: "/mock-documents/申玲.docx",
    uploadTime: "2026-07-01 08:30:00",
    createBy: "1",
    createTime: "2026-07-01 08:30:00",
    updateBy: "1",
    updateTime: "2026-07-01 08:30:00",
    documentSourceType: 1,
    controlType: 1,
    effectiveTime: "",
    expireDate: "",
    changeReason: "",
    locationRelations: [],
    productRelations: [],
    historyVersions: []
  },
  {
    id: "document-cancelled-1",
    fileId: "file-old-guide-docx",
    fileName: "旧版作业指导书",
    sourceName: "旧版作业指导书.docx",
    directoryId: "doc-work-guide",
    directoryName: "作业指导书",
    extension: "docx",
    version: "V0",
    fileStatus: -1,
    workflowStatus: -1,
    size: "10240",
    hash: "hash-file-old-guide-docx",
    path: "/mock-documents/旧版作业指导书.docx",
    uploadTime: "2026-06-20 10:00:00",
    createBy: "1",
    createTime: "2026-06-20 10:00:00",
    updateBy: "1",
    updateTime: "2026-06-25 10:00:00",
    documentSourceType: 1,
    controlType: 1,
    effectiveTime: "",
    expireDate: "",
    changeReason: "历史作废示例",
    locationRelations: [],
    productRelations: [],
    historyVersions: []
  }
]

const commonFile = {
  id: "1",
  fileName: "demo.png",
  sourceName: "demo.png",
  extension: "png",
  path: "/产品.png",
  url: "/产品.png",
  fileUrl: "/产品.png",
  createTime: now,
  updateTime: now
}

let idSeq = 1000

const nextId = (prefix: string) => {
  idSeq += 1
  return `${prefix}-${idSeq}`
}

const toArrayIdSet = (value: unknown) => {
  if (!Array.isArray(value)) return new Set<string>()
  return new Set(value.map((item) => String(item)))
}

const createTimeRange = (hour = 12) => {
  const start = new Date(now.replace(" ", "T"))
  const end = new Date(start.getTime() + hour * 60 * 60 * 1000)
  return {
    beginTime: start.toISOString().replace(".000Z", "+00:00"),
    endTime: end.toISOString().replace(".000Z", "+00:00")
  }
}

const defaultTechProcess = (id = "tp-1") => ({
  id,
  no: `OP-${String(id).replace(/[^0-9]/g, "") || "001"}`,
  name: "订单工艺",
  orderProcessType: 2,
  techVersionId: "tv1",
  techVersion: {
    id: "tv1",
    sourceType: 2,
    status: 1,
    type: 1,
    bizType: 1
  },
  updateTime: now
})

const demoRouteTechProcess = (id = "tp-demo-route") => ({
  ...defaultTechProcess(id),
  id,
  no: "CR-001",
  name: "演示工艺路线",
  orderProcessType: 1,
  sourceProcessId: "cr1",
  sourceVersion: "1.0",
  sourceNo: "CR-001",
  techVersionId: "tv1",
  techVersion: {
    id: "tv1",
    version: "1.0",
    versionNo: "1.0",
    sourceType: 1,
    status: 1,
    type: 1,
    bizType: 1
  }
})

const buildOrderProductModel = (
  productModelId: string,
  productModelCode: string,
  productModelName: string,
  unitId = "1",
  unitName = "件"
) => ({
  id: productModelId,
  name: productModelName,
  code: productModelCode,
  defaultUnitId: unitId,
  defaultUnitName: unitName,
  drawingNumber: `DRW-${productModelCode}`,
  isKeyMaterial: false,
  isReversal: 0,
  period: 365,
  productCategoryCode: "CAT-001",
  productCategoryId: "pcat-1",
  productCategoryName: "壳体类",
  productModelUnitList: [{ unitId, unitName, conversionBasis: 1, isDefaultUnit: true }],
  productType: 1,
  remark: "",
  specification: getDemoProductSpecByCode(productModelCode),
  status: 1,
  createBy: "1",
  createTime: now,
  updateBy: "1",
  updateTime: now
})

const buildOrderMaterials = (
  orderId: string,
  productModelId: string,
  productModelCode: string,
  orderAmount: number,
  unitId = "1",
  unitName = "件",
  decimalNumber = 0
) => [
  {
    id: `${orderId}-mat-1`,
    productModelId: `${productModelId}-raw-1`,
    productModelCode: `${productModelCode}-MAT-A`,
    productModelName: "壳体毛坯",
    processSerials: ["10"],
    flowNodeIds: ["10"],
    baseAmount: 1,
    totalAmount: orderAmount,
    availAmount: orderAmount,
    exceedAmount: 0,
    unitCode: "PCS",
    unitId,
    unitName,
    decimalNumber
  },
  {
    id: `${orderId}-mat-2`,
    productModelId: `${productModelId}-raw-2`,
    productModelCode: `${productModelCode}-MAT-B`,
    productModelName: "紧固件包",
    processSerials: ["20"],
    flowNodeIds: ["20"],
    baseAmount: 2,
    totalAmount: orderAmount * 2,
    availAmount: orderAmount * 2,
    exceedAmount: 0,
    unitCode: "PCS",
    unitId,
    unitName,
    decimalNumber
  }
]

const buildOrderSerialInfos = (
  orderId: string,
  orderAmount: number,
  completeAmount: number,
  productionProgress: number,
  unitId = "1",
  unitName = "件",
  decimalNumber = 0,
  processRows = staticTechProcessesByVersion.tv1.slice(0, 2)
) =>
  processRows.map((process, index) => {
    const processSerial = String(process.processSerial || "")
    const processName = processNameBySerial[processSerial] || process.name || `Process ${processSerial}`
    return {
      id: `${orderId}-serial-${processSerial}`,
      serial: processSerial,
      processSerial,
      processName,
      techName: processName,
      nature: 1,
      amountInOrder: orderAmount,
      finishAmount: Math.max(0, completeAmount - index * 5),
      totalAmount: productionProgress,
      bizType: 1,
      unitId,
      unitName,
      decimalNumber
    }
  })

const buildOrderSaleVO = (saleId: string, saleCode: string, saleContent: string) => ({
  id: saleId,
  saleCode,
  saleContent,
  customerId: "cus-1",
  customerCode: "CUS-001",
  customerName: "演示客户有限公司",
  customerAbbr: "演示客户",
  priority: 20,
  dataSource: 1,
  createTime: now,
  remarks: ""
})

const salesOrders = [
  {
    id: "sale-1",
    saleCode: "SO-001",
    saleContent: "减速器壳体总成A型 x 200",
    saleStatus: 0,
    customerId: "cus-1",
    customerCode: "CUS-001",
    customerName: "演示客户有限公司",
    customerAbbr: "演示客户",
    priority: 20,
    dataSource: 1,
    planDeliveryTime: now,
    createTime: now,
    remarks: "本地静态销售订单",
    saleDetailVOList: [
      {
        id: "sale-detail-1",
        saleId: "sale-1",
        productModelId: "pm1",
        productModelCode: "GR-HSG-001",
        productModelName: "减速器壳体总成A型",
        productModelNo: "GR-HSG-001",
        planQty: 200,
        deliveryQty: 20,
        unDeliveryQty: 180,
        unitId: "1",
        unitName: "件",
        decimalNumber: 0
      }
    ]
  }
]

const withProductSpecFields = <T extends Record<string, any>>(row: T): T => {
  const productModelCode = String(row.productModelCode || row.productModelNo || row.productModel?.code || "")
  const productModelSpec = String(
    row.productModelSpec || row.specification || row.productModel?.specification || getDemoProductSpecByCode(productModelCode)
  )
  return {
    ...row,
    productModelSpec,
    productModel: row.productModel
      ? {
          ...row.productModel,
          specification: row.productModel.specification || productModelSpec
        }
      : row.productModel
  }
}

const withProductionTaskOrderFields = <T extends Record<string, any>>(task: T): T => {
  const orderTypeById: Record<string, number> = {
    "po-1": 1,
    "po-2": 1,
    "po-3": 10,
    "po-4": 5
  }
  return {
    ...task,
    productionOrderType: task.productionOrderType ?? orderTypeById[String(task.productionOrderId || "")] ?? 1
  }
}

// localStorage 持久化辅助函数
const STORAGE_KEY_PRODUCTION_REPORTS = 'pc-production-reports'
const STORAGE_KEY_PRODUCTION_REPORT_REVIEWS = 'pc-production-report-reviews'

const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error(`Error loading ${key} from localStorage:`, e)
  }
  return defaultValue
}

const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e)
  }
}

// 默认的报工记录数据
const defaultProductionReports = [
  {
    id: "pr-1",
    productionTaskId: "pt-1",
    productionTaskNo: "RW-1",
    productionExecutionNo: "REPORT-001",
    productionExecutionId: "pe-1",
    productModelName: "减速器壳体总成A型",
    productModelCode: "GR-HSG-001",
    productModelId: "pm-1",
    reportQty: 30,
    qualifiedQty: 29,
    defectiveQty: 1,
    reportTime: "2026-10-08 09:30:00",
    sourceNo: "MOCK-ORDER-001",
    productionOrderNo: "MOCK-ORDER-001",
    productionOrderId: "po-1",
    processSerial: "1",
    techName: "工序-加工",
    unitName: "件",
    unitId: "1",
    facilityName: "本地演示工厂",
    executionBatch: 1,
    workStationName: "工作站1",
    rotationName: "王五",
    reviewedQty: null,
    createTime: now
  },
  {
    id: "pr-2",
    productionTaskId: "pt-2",
    productionTaskNo: "RW-2",
    productionExecutionNo: "REPORT-002",
    productionExecutionId: "pe-2",
    productModelName: "减速器壳体B型",
    productModelCode: "GR-HSG-002",
    productModelId: "pm-2",
    reportQty: 50,
    qualifiedQty: 48,
    defectiveQty: 2,
    reportTime: "2026-10-08 10:45:00",
    sourceNo: "MOCK-ORDER-002",
    productionOrderNo: "MOCK-ORDER-002",
    productionOrderId: "po-2",
    processSerial: "1",
    techName: "工序-加工",
    unitName: "件",
    unitId: "1",
    facilityName: "本地演示工厂",
    executionBatch: 1,
    workStationName: "工作站2",
    rotationName: "张三",
    reviewedQty: null,
    createTime: now
  },
  {
    id: "pr-3",
    productionTaskId: "pt-1",
    productionTaskNo: "RW-1",
    productionExecutionNo: "REPORT-003",
    productionExecutionId: "pe-1",
    productModelName: "减速器壳体总成A型",
    productModelCode: "GR-HSG-001",
    productModelId: "pm-1",
    reportQty: 20,
    qualifiedQty: 20,
    defectiveQty: 0,
    reportTime: "2026-10-08 14:20:00",
    sourceNo: "MOCK-ORDER-001",
    productionOrderNo: "MOCK-ORDER-001",
    productionOrderId: "po-1",
    processSerial: "2",
    techName: "工序-精加工",
    unitName: "件",
    unitId: "1",
    facilityName: "本地演示工厂",
    executionBatch: 1,
    workStationName: "工作站1",
    rotationName: "李四",
    reviewedQty: null,
    createTime: now
  }
]

// 默认的审核记录数据
const defaultProductionReportReviews: any[] = []

const state = {
  productionOrders: [
    {
      id: "2",
      no: "WO2024090002",
      source: 2,
      type: 1,
      status: 1,
      saleCode: "",
      orderAmount: 2000,
      productModelId: "pm1",
      productModelCode: "GR-HSG-001",
      productModelName: "减速器壳体总成A型",
      productModelNo: "GR-HSG-001",
      scheduledQuantity: 0,
      completeAmount: 0,
      productionProgress: 0,
      decimalNumber: 0,
      unitName: "件",
      unitId: "1",
      unitItem: { id: "1", unitCode: "PCS", unitName: "件", decimalNumber: 0 },
      techProcessId: "tp-1",
      deliveryDate: "2024-12-31",
      remark: "",
      createTime: now,
      updateTime: now
    },
    {
      id: "po-1",
      no: "MOCK-ORDER-001",
      source: 1,
      type: 1,
      status: 5,
      saleCode: "SO-001",
      orderAmount: 120,
      productModelId: "pm1",
      productModelCode: "GR-HSG-001",
      productModelName: "减速器壳体A",
      productModelNo: "GR-HSG-001",
      scheduledQuantity: 80,
      completeAmount: 30,
      productionProgress: 0.25,
      decimalNumber: 0,
      unitName: "件",
      unitId: "1",
      unitItem: { id: "1", unitCode: "PCS", unitName: "件", decimalNumber: 0 },
      techProcessId: "tp-1",
      techProcess: defaultTechProcess("tp-1"),
      productModel: buildOrderProductModel("pm1", "GR-HSG-001", "减速器壳体A"),
      specifiedInboundWarehouseId: "wh-1",
      specifiedInboundWarehouseName: "Main Warehouse",
      deliveryDate: "2026-04-30",
      saleId: "sale-1",
      saleContent: "SO-001 / 减速器壳体A x 120",
      saleVOList: [buildOrderSaleVO("sale-1", "SO-001", "SO-001 / 减速器壳体A x 120")],
      materials: buildOrderMaterials("po-1", "pm1", "GR-HSG-001", 120),
      serialInfos: buildOrderSerialInfos("po-1", 120, 30, 0.25, "1", "件", 0, staticTechProcessesByVersion.tv1),
      fileIds: [],
      files: [],
      productionMethod: 1,
      archiveTime: "",
      cachedProcessId: "",
      taskId: "tp-1",
      techProcessVersionStatus: 2,
      bizType: 1,
      remark: "MES模拟生产订单，待复核",
      createBy: "1",
      createByName: "Mock Admin",
      createTime: "2026-04-01 09:10:00",
      updateBy: "1",
      updateTime: "2026-04-01 09:10:00"
    },
    {
      id: "po-2",
      no: "MOCK-ORDER-002",
      source: 1,
      type: 1,
      status: 1,
      saleCode: "SO-001",
      orderAmount: 200,
      productModelId: "pm2",
      productModelCode: "GR-SHAFT-002",
      productModelName: "输出轴B",
      productModelNo: "GR-SHAFT-002",
      scheduledQuantity: 160,
      completeAmount: 96,
      productionProgress: 0.48,
      decimalNumber: 0,
      unitName: "件",
      unitId: "1",
      unitItem: { id: "1", unitCode: "PCS", unitName: "件", decimalNumber: 0 },
      techProcessId: "tp-demo-route-po-2",
      techVersionId: "tv1",
      techProcess: demoRouteTechProcess("tp-demo-route-po-2"),
      productModel: buildOrderProductModel("pm2", "GR-SHAFT-002", "输出轴B"),
      specifiedInboundWarehouseId: "wh-1",
      specifiedInboundWarehouseName: "Main Warehouse",
      deliveryDate: "2026-05-08",
      saleId: "sale-1",
      saleContent: "SO-001 / 输出轴B x 200",
      saleVOList: [],
      materials: buildOrderMaterials("po-2", "pm2", "GR-SHAFT-002", 200),
      serialInfos: buildOrderSerialInfos("po-2", 200, 96, 0.48, "1", "件", 0, staticTechProcessesByVersion.tv1),
      fileIds: [],
      files: [],
      productionMethod: 1,
      archiveTime: "",
      cachedProcessId: "cr1",
      taskId: "tp-demo-route-po-2",
      techProcessVersionStatus: 2,
      bizType: 1,
      remark: "已复核量产订单",
      createBy: "1",
      createByName: "Mock Admin",
      createTime: "2026-04-03 14:25:00",
      updateBy: "1",
      updateTime: "2026-04-03 14:25:00"
    },
    {
      id: "po-3",
      no: "ERP-ORDER-003",
      source: 2,
      type: 1,
      status: 1,
      saleCode: "SO-ERP-003",
      orderAmount: 80,
      productModelId: "pm3",
      productModelCode: "AXLE-BRKT-003",
      productModelName: "车桥支架C",
      productModelNo: "AXLE-BRKT-003",
      scheduledQuantity: 40,
      completeAmount: 12,
      productionProgress: 0.15,
      decimalNumber: 0,
      unitName: "件",
      unitId: "1",
      unitItem: { id: "1", unitCode: "PCS", unitName: "件", decimalNumber: 0 },
      techProcessId: "tp-demo-route-po-3",
      techVersionId: "tv1",
      techProcess: demoRouteTechProcess("tp-demo-route-po-3"),
      productModel: buildOrderProductModel("pm3", "AXLE-BRKT-003", "车桥支架C"),
      specifiedInboundWarehouseId: "wh-1",
      specifiedInboundWarehouseName: "Main Warehouse",
      deliveryDate: "2026-05-16",
      saleId: "sale-1",
      saleContent: "SO-ERP-003 / 车桥支架C x 80",
      saleVOList: [],
      materials: buildOrderMaterials("po-3", "pm3", "AXLE-BRKT-003", 80),
      serialInfos: buildOrderSerialInfos("po-3", 80, 12, 0.15, "1", "件", 0, staticTechProcessesByVersion.tv1),
      fileIds: [],
      files: [],
      productionMethod: 1,
      archiveTime: "",
      cachedProcessId: "cr1",
      taskId: "tp-demo-route-po-3",
      techProcessVersionStatus: 2,
      bizType: 1,
      remark: "ERP来源生产订单",
      createBy: "1",
      createByName: "Mock Admin",
      createTime: "2026-04-05 10:18:00",
      updateBy: "1",
      updateTime: "2026-04-05 10:18:00"
    },
    {
      id: "po-4",
      no: "MOCK-REWORK-004",
      source: 1,
      type: 5,
      status: 9,
      saleCode: "SO-RW-004",
      orderAmount: 18,
      productModelId: "pm1",
      productModelCode: "GR-HSG-001",
      productModelName: "减速器壳体A",
      productModelNo: "GR-HSG-001",
      scheduledQuantity: 18,
      completeAmount: 18,
      productionProgress: 1,
      decimalNumber: 0,
      unitName: "件",
      unitId: "1",
      unitItem: { id: "1", unitCode: "PCS", unitName: "件", decimalNumber: 0 },
      techProcessId: "tp-4",
      techProcess: defaultTechProcess("tp-4"),
      productModel: buildOrderProductModel("pm1", "GR-HSG-001", "减速器壳体A"),
      specifiedInboundWarehouseId: "wh-1",
      specifiedInboundWarehouseName: "Main Warehouse",
      deliveryDate: "2026-04-22",
      saleId: "sale-1",
      saleContent: "SO-RW-004 / 减速器壳体A x 18",
      saleVOList: [],
      materials: buildOrderMaterials("po-4", "pm1", "GR-HSG-001", 18),
      serialInfos: buildOrderSerialInfos("po-4", 18, 18, 1),
      fileIds: [],
      files: [],
      productionMethod: 1,
      archiveTime: "2026-04-22 17:20:00",
      cachedProcessId: "",
      originalOrderNo: "MOCK-ORDER-001",
      orderId: "po-1",
      taskId: "tp-4",
      techProcessVersionStatus: 2,
      bizType: 1,
      remark: "已结案返工订单",
      createBy: "1",
      createByName: "Mock Admin",
      createTime: "2026-03-28 16:40:00",
      updateBy: "1",
      updateTime: "2026-03-28 16:40:00"
    },
    {
      id: "po-5",
      no: "MOCK-ORDER-005",
      source: 1,
      type: 1,
      status: 1,
      saleCode: "SO-005",
      orderAmount: 150,
      productModelId: "pm-jk-n350",
      productModelCode: "JD-N350HL-JK",
      productModelName: "N350减壳",
      productModelNo: "JD-N350HL-JK",
      scheduledQuantity: 40,
      completeAmount: 20,
      productionProgress: 0.13,
      decimalNumber: 0,
      unitName: "件",
      unitId: "1",
      unitItem: { id: "1", unitCode: "PCS", unitName: "件", decimalNumber: 0 },
      techProcessId: "tp-demo-route-po-5",
      techVersionId: "tv1",
      techProcess: demoRouteTechProcess("tp-demo-route-po-5"),
      productModel: buildOrderProductModel("pm-jk-n350", "JD-N350HL-JK", "N350减壳"),
      specifiedInboundWarehouseId: "wh-1",
      specifiedInboundWarehouseName: "Main Warehouse",
      deliveryDate: "2026-07-20",
      saleId: "sale-5",
      saleContent: "SO-005 / N350减壳 x 150",
      saleVOList: [],
      materials: buildOrderMaterials("po-5", "pm-jk-n350", "JD-N350HL-JK", 150),
      serialInfos: buildOrderSerialInfos("po-5", 150, 20, 0.13, "1", "件", 0, staticTechProcessesByVersion.tv1),
      fileIds: [],
      files: [],
      productionMethod: 1,
      archiveTime: "",
      cachedProcessId: "cr1",
      taskId: "tp-demo-route-po-5",
      techProcessVersionStatus: 2,
      bizType: 1,
      remark: "可排产订单-N350减壳",
      createBy: "1",
      createByName: "Mock Admin",
      createTime: "2026-07-01 09:00:00",
      updateBy: "1",
      updateTime: "2026-07-01 09:00:00"
    },
    {
      id: "po-6",
      no: "MOCK-ORDER-006",
      source: 1,
      type: 1,
      status: 1,
      saleCode: "SO-006",
      orderAmount: 100,
      productModelId: "pm-jk-8a",
      productModelCode: "JD-8C1-JK",
      productModelName: "8A差壳",
      productModelNo: "JD-8C1-JK",
      scheduledQuantity: 20,
      completeAmount: 0,
      productionProgress: 0,
      decimalNumber: 0,
      unitName: "件",
      unitId: "1",
      unitItem: { id: "1", unitCode: "PCS", unitName: "件", decimalNumber: 0 },
      techProcessId: "tp-demo-route-po-6",
      techVersionId: "tv1",
      techProcess: demoRouteTechProcess("tp-demo-route-po-6"),
      productModel: buildOrderProductModel("pm-jk-8a", "JD-8C1-JK", "8A差壳"),
      specifiedInboundWarehouseId: "wh-1",
      specifiedInboundWarehouseName: "Main Warehouse",
      deliveryDate: "2026-07-22",
      saleId: "sale-6",
      saleContent: "SO-006 / 8A差壳 x 100",
      saleVOList: [],
      materials: buildOrderMaterials("po-6", "pm-jk-8a", "JD-8C1-JK", 100),
      serialInfos: buildOrderSerialInfos("po-6", 100, 0, 0, "1", "件", 0, staticTechProcessesByVersion.tv1),
      fileIds: [],
      files: [],
      productionMethod: 1,
      archiveTime: "",
      cachedProcessId: "cr1",
      taskId: "tp-demo-route-po-6",
      techProcessVersionStatus: 2,
      bizType: 1,
      remark: "可排产订单-8A差壳",
      createBy: "1",
      createByName: "Mock Admin",
      createTime: "2026-07-02 10:20:00",
      updateBy: "1",
      updateTime: "2026-07-02 10:20:00"
    },
    {
      id: "po-7",
      no: "MOCK-ORDER-007",
      source: 1,
      type: 1,
      status: 1,
      saleCode: "SO-007",
      orderAmount: 80,
      productModelId: "pm-jk-3a",
      productModelCode: "JD-3CE-JK",
      productModelName: "3A差壳",
      productModelNo: "JD-3CE-JK",
      scheduledQuantity: 10,
      completeAmount: 0,
      productionProgress: 0,
      decimalNumber: 0,
      unitName: "件",
      unitId: "1",
      unitItem: { id: "1", unitCode: "PCS", unitName: "件", decimalNumber: 0 },
      techProcessId: "tp-demo-route-po-7",
      techVersionId: "tv1",
      techProcess: demoRouteTechProcess("tp-demo-route-po-7"),
      productModel: buildOrderProductModel("pm-jk-3a", "JD-3CE-JK", "3A差壳"),
      specifiedInboundWarehouseId: "wh-1",
      specifiedInboundWarehouseName: "Main Warehouse",
      deliveryDate: "2026-07-24",
      saleId: "sale-7",
      saleContent: "SO-007 / 3A差壳 x 80",
      saleVOList: [],
      materials: buildOrderMaterials("po-7", "pm-jk-3a", "JD-3CE-JK", 80),
      serialInfos: buildOrderSerialInfos("po-7", 80, 0, 0, "1", "件", 0, staticTechProcessesByVersion.tv1),
      fileIds: [],
      files: [],
      productionMethod: 1,
      archiveTime: "",
      cachedProcessId: "cr1",
      taskId: "tp-demo-route-po-7",
      techProcessVersionStatus: 2,
      bizType: 1,
      remark: "可排产订单-3A差壳",
      createBy: "1",
      createByName: "Mock Admin",
      createTime: "2026-07-03 11:15:00",
      updateBy: "1",
      updateTime: "2026-07-03 11:15:00"
    },
    {
      id: "po-8",
      no: "MOCK-ORDER-008",
      source: 1,
      type: 1,
      status: 1,
      saleCode: "SO-008",
      orderAmount: 200,
      productModelId: "pm1",
      productModelCode: "GR-HSG-001",
      productModelName: "减速器壳体A",
      productModelNo: "GR-HSG-001",
      scheduledQuantity: 50,
      completeAmount: 30,
      productionProgress: 0.15,
      decimalNumber: 0,
      unitName: "件",
      unitId: "1",
      unitItem: { id: "1", unitCode: "PCS", unitName: "件", decimalNumber: 0 },
      techProcessId: "tp-demo-route-po-8",
      techVersionId: "tv1",
      techProcess: demoRouteTechProcess("tp-demo-route-po-8"),
      productModel: buildOrderProductModel("pm1", "GR-HSG-001", "减速器壳体A"),
      specifiedInboundWarehouseId: "wh-1",
      specifiedInboundWarehouseName: "Main Warehouse",
      deliveryDate: "2026-07-25",
      saleId: "sale-8",
      saleContent: "SO-008 / 减速器壳体A x 200",
      saleVOList: [],
      materials: buildOrderMaterials("po-8", "pm1", "GR-HSG-001", 200),
      serialInfos: buildOrderSerialInfos("po-8", 200, 30, 0.15, "1", "件", 0, staticTechProcessesByVersion.tv1),
      fileIds: [],
      files: [],
      productionMethod: 1,
      archiveTime: "",
      cachedProcessId: "cr1",
      taskId: "tp-demo-route-po-8",
      techProcessVersionStatus: 2,
      bizType: 1,
      remark: "可排产订单-减速器壳体",
      createBy: "1",
      createByName: "Mock Admin",
      createTime: "2026-07-04 13:40:00",
      updateBy: "1",
      updateTime: "2026-07-04 13:40:00"
    },
    {
      id: "po-9",
      no: "MOCK-ORDER-009",
      source: 2,
      type: 1,
      status: 1,
      saleCode: "SO-ERP-009",
      orderAmount: 60,
      productModelId: "pm-jk-n350-2",
      productModelCode: "JD-N350HL-JK",
      productModelName: "N350减壳",
      productModelNo: "JD-N350HL-JK",
      scheduledQuantity: 0,
      completeAmount: 0,
      productionProgress: 0,
      decimalNumber: 0,
      unitName: "件",
      unitId: "1",
      unitItem: { id: "1", unitCode: "PCS", unitName: "件", decimalNumber: 0 },
      techProcessId: "tp-demo-route-po-9",
      techVersionId: "tv1",
      techProcess: demoRouteTechProcess("tp-demo-route-po-9"),
      productModel: buildOrderProductModel("pm-jk-n350-2", "JD-N350HL-JK", "N350减壳"),
      specifiedInboundWarehouseId: "wh-1",
      specifiedInboundWarehouseName: "Main Warehouse",
      deliveryDate: "2026-07-28",
      saleId: "sale-9",
      saleContent: "SO-ERP-009 / N350减壳 x 60",
      saleVOList: [],
      materials: buildOrderMaterials("po-9", "pm-jk-n350-2", "JD-N350HL-JK", 60),
      serialInfos: buildOrderSerialInfos("po-9", 60, 0, 0, "1", "件", 0, staticTechProcessesByVersion.tv1),
      fileIds: [],
      files: [],
      productionMethod: 1,
      archiveTime: "",
      cachedProcessId: "cr1",
      taskId: "tp-demo-route-po-9",
      techProcessVersionStatus: 2,
      bizType: 1,
      remark: "可排产订单-ERP急单",
      createBy: "1",
      createByName: "Mock Admin",
      createTime: "2026-07-05 15:05:00",
      updateBy: "1",
      updateTime: "2026-07-05 15:05:00"
    },
    {
      id: "po-10",
      no: "MOCK-ORDER-010",
      source: 1,
      type: 1,
      status: 1,
      saleCode: "SO-010",
      orderAmount: 120,
      productModelId: "pm-jk-8a-2",
      productModelCode: "JD-8C1-JK",
      productModelName: "8A差壳",
      productModelNo: "JD-8C1-JK",
      scheduledQuantity: 0,
      completeAmount: 0,
      productionProgress: 0,
      decimalNumber: 0,
      unitName: "件",
      unitId: "1",
      unitItem: { id: "1", unitCode: "PCS", unitName: "件", decimalNumber: 0 },
      techProcessId: "tp-demo-route-po-10",
      techVersionId: "tv1",
      techProcess: demoRouteTechProcess("tp-demo-route-po-10"),
      productModel: buildOrderProductModel("pm-jk-8a-2", "JD-8C1-JK", "8A差壳"),
      specifiedInboundWarehouseId: "wh-1",
      specifiedInboundWarehouseName: "Main Warehouse",
      deliveryDate: "2026-07-30",
      saleId: "sale-10",
      saleContent: "SO-010 / 8A差壳 x 120",
      saleVOList: [],
      materials: buildOrderMaterials("po-10", "pm-jk-8a-2", "JD-8C1-JK", 120),
      serialInfos: buildOrderSerialInfos("po-10", 120, 0, 0, "1", "件", 0, staticTechProcessesByVersion.tv1),
      fileIds: [],
      files: [],
      productionMethod: 1,
      archiveTime: "",
      cachedProcessId: "cr1",
      taskId: "tp-demo-route-po-10",
      techProcessVersionStatus: 2,
      bizType: 1,
      remark: "可排产订单-8A差壳-1",
      createBy: "1",
      createByName: "Mock Admin",
      createTime: "2026-07-06 09:30:00",
      updateBy: "1",
      updateTime: "2026-07-06 09:30:00"
    },
    {
      id: "po-11",
      no: "MOCK-ORDER-011",
      source: 1,
      type: 1,
      status: 1,
      saleCode: "SO-011",
      orderAmount: 90,
      productModelId: "pm-jk-8a-3",
      productModelCode: "JD-8C1-JK",
      productModelName: "8A差壳",
      productModelNo: "JD-8C1-JK",
      scheduledQuantity: 15,
      completeAmount: 0,
      productionProgress: 0,
      decimalNumber: 0,
      unitName: "件",
      unitId: "1",
      unitItem: { id: "1", unitCode: "PCS", unitName: "件", decimalNumber: 0 },
      techProcessId: "tp-demo-route-po-11",
      techVersionId: "tv1",
      techProcess: demoRouteTechProcess("tp-demo-route-po-11"),
      productModel: buildOrderProductModel("pm-jk-8a-3", "JD-8C1-JK", "8A差壳"),
      specifiedInboundWarehouseId: "wh-1",
      specifiedInboundWarehouseName: "Main Warehouse",
      deliveryDate: "2026-08-02",
      saleId: "sale-11",
      saleContent: "SO-011 / 8A差壳 x 90",
      saleVOList: [],
      materials: buildOrderMaterials("po-11", "pm-jk-8a-3", "JD-8C1-JK", 90),
      serialInfos: buildOrderSerialInfos("po-11", 90, 0, 0, "1", "件", 0, staticTechProcessesByVersion.tv1),
      fileIds: [],
      files: [],
      productionMethod: 1,
      archiveTime: "",
      cachedProcessId: "cr1",
      taskId: "tp-demo-route-po-11",
      techProcessVersionStatus: 2,
      bizType: 1,
      remark: "可排产订单-8A差壳-2",
      createBy: "1",
      createByName: "Mock Admin",
      createTime: "2026-07-07 14:10:00",
      updateBy: "1",
      updateTime: "2026-07-07 14:10:00"
    },
    {
      id: "po-12",
      no: "MOCK-ORDER-012",
      source: 1,
      type: 1,
      status: 1,
      saleCode: "SO-012",
      orderAmount: 110,
      productModelId: "pm-jk-8a-4",
      productModelCode: "JD-8C1-JK",
      productModelName: "8A差壳",
      productModelNo: "JD-8C1-JK",
      scheduledQuantity: 0,
      completeAmount: 0,
      productionProgress: 0,
      decimalNumber: 0,
      unitName: "件",
      unitId: "1",
      unitItem: { id: "1", unitCode: "PCS", unitName: "件", decimalNumber: 0 },
      techProcessId: "tp-demo-route-po-12",
      techVersionId: "tv1",
      techProcess: demoRouteTechProcess("tp-demo-route-po-12"),
      productModel: buildOrderProductModel("pm-jk-8a-4", "JD-8C1-JK", "8A差壳"),
      specifiedInboundWarehouseId: "wh-1",
      specifiedInboundWarehouseName: "Main Warehouse",
      deliveryDate: "2026-08-05",
      saleId: "sale-12",
      saleContent: "SO-012 / 8A差壳 x 110",
      saleVOList: [],
      materials: buildOrderMaterials("po-12", "pm-jk-8a-4", "JD-8C1-JK", 110),
      serialInfos: buildOrderSerialInfos("po-12", 110, 0, 0, "1", "件", 0, staticTechProcessesByVersion.tv1),
      fileIds: [],
      files: [],
      productionMethod: 1,
      archiveTime: "",
      cachedProcessId: "cr1",
      taskId: "tp-demo-route-po-12",
      techProcessVersionStatus: 2,
      bizType: 1,
      remark: "可排产订单-8A差壳",
      createBy: "1",
      createByName: "Mock Admin",
      createTime: "2026-07-08 10:00:00",
      updateBy: "1",
      updateTime: "2026-07-08 10:00:00"
    },
    {
      id: "po-13",
      no: "MOCK-ORDER-013",
      source: 1,
      type: 1,
      status: 1,
      saleCode: "SO-013",
      isUrgent: true,
      urgent: true,
      isUrgentInsert: true,
      urgentReason: "客户紧急交付",
      priority: 3,
      orderAmount: 75,
      productModelId: "pm-jk-3a-2",
      productModelCode: "JD-3CE-JK",
      productModelName: "3A差壳",
      productModelNo: "JD-3CE-JK",
      scheduledQuantity: 0,
      completeAmount: 0,
      productionProgress: 0,
      decimalNumber: 0,
      unitName: "件",
      unitId: "1",
      unitItem: { id: "1", unitCode: "PCS", unitName: "件", decimalNumber: 0 },
      techProcessId: "tp-demo-route-po-13",
      techVersionId: "tv1",
      techProcess: demoRouteTechProcess("tp-demo-route-po-13"),
      productModel: buildOrderProductModel("pm-jk-3a-2", "JD-3CE-JK", "3A差壳"),
      specifiedInboundWarehouseId: "wh-1",
      specifiedInboundWarehouseName: "Main Warehouse",
      deliveryDate: "2026-08-06",
      saleId: "sale-13",
      saleContent: "SO-013 / 3A差壳 x 75",
      saleVOList: [],
      materials: buildOrderMaterials("po-13", "pm-jk-3a-2", "JD-3CE-JK", 75),
      serialInfos: buildOrderSerialInfos("po-13", 75, 0, 0, "1", "件", 0, staticTechProcessesByVersion.tv1),
      fileIds: [],
      files: [],
      productionMethod: 1,
      archiveTime: "",
      cachedProcessId: "cr1",
      taskId: "tp-demo-route-po-13",
      techProcessVersionStatus: 2,
      bizType: 1,
      remark: "可排产订单-3A差壳",
      createBy: "1",
      createByName: "Mock Admin",
      createTime: "2026-07-08 11:20:00",
      updateBy: "1",
      updateTime: "2026-07-08 11:20:00"
    },
    {
      id: "po-void-1",
      no: "PO20240901006",
      source: 1,
      type: 1,
      status: 3,
      saleCode: "SO-VOID-001",
      orderAmount: 500,
      productModelId: "pm1",
      productModelCode: "GR-HSG-001",
      productModelName: "减速器壳体A",
      productModelNo: "GR-HSG-001",
      scheduledQuantity: 0,
      completeAmount: 0,
      productionProgress: 0,
      decimalNumber: 0,
      unitName: "件",
      unitId: "1",
      unitItem: { id: "1", unitCode: "PCS", unitName: "件", decimalNumber: 0 },
      techProcessId: "tp-1",
      techProcess: defaultTechProcess("tp-1"),
      productModel: buildOrderProductModel("pm1", "GR-HSG-001", "减速器壳体A"),
      specifiedInboundWarehouseId: "wh-1",
      specifiedInboundWarehouseName: "Main Warehouse",
      deliveryDate: "2026-05-30",
      saleId: "sale-void-1",
      saleContent: "SO-VOID-001 / 减速器壳体A x 500",
      saleVOList: [],
      materials: buildOrderMaterials("po-void-1", "pm1", "GR-HSG-001", 500),
      serialInfos: buildOrderSerialInfos("po-void-1", 500, 0, 0, "1", "件", 0, staticTechProcessesByVersion.tv1),
      fileIds: [],
      files: [],
      productionMethod: 1,
      archiveTime: "2026-06-01 10:00:00",
      cachedProcessId: "",
      taskId: "",
      techProcessVersionStatus: 2,
      bizType: 1,
      remark: "已作废订单",
      createBy: "1",
      createByName: "Mock Admin",
      createTime: "2026-05-01 08:00:00",
      updateBy: "1",
      updateTime: "2026-06-01 10:00:00"
    }
  ].map(withProductSpecFields),
  productionTasks: [
    {
      id: "pt-1",
      no: "RW-1",
      taskNo: "RW-1",
      status: 1,
      isUrgent: true,
      urgent: true,
      urgentReason: "客户紧急交付",
      priority: 3,
      productionOrderPriority: 3,
      productionOrderId: "po-1",
      productionOrderNo: "MOCK-ORDER-001",
      productionOrderPlanId: "plan-po-1-1",
      schedulingProductionTaskId: "",
      productModelId: "pm1",
      productModelName: "减速器壳体总成A型",
      productModelNo: "GR-HSG-001",
      drawingNumber: "",
      processSerial: "1",
      techName: "工序-加工",
      techNo: "1",
      techProcessId: "tp-1",
      techProcessNo: "OP-001",
      techVersionId: "tv1",
      version: "1.0",
      entityId: ["1"],
      entityName: "本地演示工厂",
      areaId: "area-1",
      areaName: "本地演示区域",
      facilityId: "",
      facilityName: "",
      taskAmount: 30,
      completeAmount: 10,
      productionProgress: 0.33,
      unitId: "1",
      unitName: "件",
      decimalNumber: 2,
      planBeginTime: createTimeRange().beginTime,
      planEndTime: createTimeRange().endTime,
      beginTime: "",
      endTime: "",
      createTime: now,
      updateTime: now,
      createBy: "1",
      updateBy: "1",
      archiveMan: "",
      archiveManName: "",
      hasChildren: false,
      remarks: "",
      nodeId: "",
      bizType: 1,
      needLoadBindIronTag: 0
    },
    {
      id: "pt-2",
      no: "RW-2",
      taskNo: "RW-2",
      status: 251,
      isUrgent: false,
      urgent: false,
      priority: 1,
      productionOrderPriority: 1,
      productionOrderId: "po-2",
      productionOrderNo: "MOCK-ORDER-002",
      productionOrderPlanId: "plan-po-2-1",
      schedulingProductionTaskId: "",
      productModelId: "pm1",
      productModelName: "减速器壳体总成A型",
      productModelNo: "GR-HSG-001",
      drawingNumber: "",
      processSerial: "1",
      techName: "工序-加工",
      techNo: "1",
      techProcessId: "tp-1",
      techProcessNo: "OP-001",
      techVersionId: "tv1",
      version: "1.0",
      entityId: ["1"],
      entityName: "本地演示工厂",
      areaId: "area-1",
      areaName: "本地演示区域",
      facilityId: "",
      facilityName: "",
      taskAmount: 40,
      completeAmount: 0,
      productionProgress: 0,
      unitId: "1",
      unitName: "件",
      decimalNumber: 2,
      planBeginTime: createTimeRange(24).beginTime,
      planEndTime: createTimeRange(24).endTime,
      beginTime: "",
      endTime: "",
      createTime: now,
      updateTime: now,
      createBy: "1",
      updateBy: "1",
      archiveMan: "",
      archiveManName: "",
      hasChildren: false,
      remarks: "未发布排产任务",
      nodeId: "uns-po-2-1",
      bizType: 1,
      needLoadBindIronTag: 0
    }
  ].map((task) => withProductSpecFields(withProductionTaskOrderFields(task))),
  // 从 localStorage 加载报工记录，如果没有则使用默认数据
  productionReports: loadFromLocalStorage(STORAGE_KEY_PRODUCTION_REPORTS, defaultProductionReports),
  // 从 localStorage 加载审核记录
  productionReportReviews: loadFromLocalStorage(STORAGE_KEY_PRODUCTION_REPORT_REVIEWS, defaultProductionReportReviews),
  productionOrderReAddRecords: [
    {
      recordId: "poadd-1",
      orderId: "po-1",
      orderNo: "MOCK-ORDER-001",
      source: 1,
      status: 0,
      productModelId: "pm1",
      productModelCode: "GR-HSG-001",
      productModelName: "减速器壳体总成A型",
      orderAmount: 100,
      addAmount: 20,
      unitId: "1",
      unitName: "件",
      deliveryDate: "2026-08-05",
      createTime: now,
      remark: "本地补产记录"
    }
  ],
  schedulingRotations: [
    {
      id: "r-1",
      rotationCode: "BC001",
      rotationName: "白班",
      rotationStatus: 1,
      remark: "默认班次",
      rotationTime: "08:00-20:00",
      startTime: "08:00",
      endTime: "20:00",
      createTime: now,
      updateTime: now
    },
    {
      id: "r-2",
      rotationCode: "BC002",
      rotationName: "夜班",
      rotationStatus: 1,
      remark: "默认班次",
      rotationTime: "20:00-08:00",
      startTime: "20:00",
      endTime: "08:00",
      createTime: now,
      updateTime: now
    }
  ],
  schedulingTeams: [
    {
      id: "tm-1",
      teamName: "一组",
      teamCode: "G001",
      teamStatus: 1,
      memberNumber: 8,
      leaderIds: ["1"],
      leaderList: [{ id: "1", name: "本地演示用户" }],
      leaderNames: "本地演示用户",
      remark: "默认班组",
      createTime: now,
      updateTime: now
    },
    {
      id: "tm-2",
      teamName: "二组",
      teamCode: "G002",
      teamStatus: 1,
      memberNumber: 7,
      leaderIds: ["1"],
      leaderList: [{ id: "1", name: "本地演示用户" }],
      leaderNames: "本地演示用户",
      remark: "替补班组",
      createTime: now,
      updateTime: now
    }
  ],
  schedulingPlans: [
    {
      id: "sc-1",
      schedulingName: "默认排班计划",
      schedulingCode: "PB001",
      startDate: "2026-04-01",
      endDate: "2026-04-30",
      productionUnitId: "pu-1",
      remark: "mock",
      status: 1,
      createTime: now,
      updateTime: now,
      detailList: [
        { id: "scr-1", cycleType: 2, rotationId: "r-1", teamId: "tm-1", weeklyRule: [1, 2, 3, 4, 5] },
        { id: "scr-2", cycleType: 2, rotationId: "r-2", teamId: "tm-2", weeklyRule: [6, 7] }
      ]
    },
    {
      id: "sc-2",
      schedulingName: "五一假期排班",
      schedulingCode: "PB002",
      startDate: "2026-05-01",
      endDate: "2026-05-05",
      productionUnitId: "pu-2",
      remark: "假期排班",
      status: 1,
      createTime: now,
      updateTime: now,
      detailList: [{ id: "scr-3", cycleType: 1, rotationId: "r-1", teamId: "tm-1", weeklyRule: [] }]
    },
    {
      id: "sc-3",
      schedulingName: "北区生产线排班",
      schedulingCode: "PB003",
      startDate: "2026-04-15",
      endDate: "2026-05-15",
      productionUnitId: "pu-3",
      remark: "北区",
      status: 1,
      createTime: now,
      updateTime: now,
      detailList: [
        { id: "scr-4", cycleType: 2, rotationId: "r-1", teamId: "tm-1", weeklyRule: [1, 3, 5] },
        { id: "scr-5", cycleType: 2, rotationId: "r-2", teamId: "tm-2", weeklyRule: [2, 4, 6] }
      ]
    },
    {
      id: "sc-4",
      schedulingName: "南区生产线排班",
      schedulingCode: "PB004",
      startDate: "2026-04-20",
      endDate: "2026-05-20",
      productionUnitId: "pu-5",
      remark: "南区",
      status: 1,
      createTime: now,
      updateTime: now,
      detailList: [
        { id: "scr-6", cycleType: 2, rotationId: "r-1", teamId: "tm-2", weeklyRule: [1, 2, 3, 4, 5] },
        { id: "scr-7", cycleType: 2, rotationId: "r-2", teamId: "tm-1", weeklyRule: [6, 7] }
      ]
    }
  ],
  schedulingModels: [
    {
      id: "sm-1",
      modelName: "常规两班倒",
      modelCode: "SM-001",
      remark: "mock",
      createTime: now,
      updateTime: now,
      ruleList: [
        { id: "smr-1", cycleType: 2, rotationId: "r-1", weeklyRule: [1, 2, 3, 4, 5] },
        { id: "smr-2", cycleType: 2, rotationId: "r-2", weeklyRule: [6, 7] }
      ]
    }
  ],
  scheduleProcessOverrides: new Map<string, any>(),
  scheduleRowToTaskId: new Map<string, string>(),
  saleOrders: salesOrders,
  deliveryPlans: [
    {
      id: "dp-1",
      deliveryPlanNo: "DP-001",
      deliveryStatus: 1,
      customerName: "演示客户有限公司",
      productModelId: "pm1",
      productModelCode: "GR-HSG-001",
      productModelName: "减速器壳体总成A型",
      planQty: 60,
      deliveryQty: 0,
      unitId: "1",
      unitName: "件",
      createTime: now,
      updateTime: now
    }
  ],
  packageTasks: [
    {
      id: "pack-1",
      taskNo: "PACK-001",
      deliveryPlanId: "dp-1",
      deliveryPlanNo: "DP-001",
      productModelId: "pm1",
      productModelCode: "GR-HSG-001",
      productModelName: "减速器壳体总成A型",
      packageQty: 60,
      completeQty: 10,
      status: 1,
      unitId: "1",
      unitName: "件",
      planBeginTime: createTimeRange(8).beginTime,
      planEndTime: createTimeRange(8).endTime,
      createTime: now,
      updateTime: now
    }
  ],
  packageScheduleByPlan: new Map<string, any>()
}

state.packageScheduleByPlan.set("dp-1", {
  deliveryPlanId: "dp-1",
  idList: ["pack-1"],
  scheduleTaskList: [state.packageTasks[0]]
})

const genericRows: Record<string, any[]> = {
  "/equipmentRepair": [
    {
      id: "repair-1",
      repairNo: "WX-001",
      repairStatus: 1,
      repairResult: 1,
      repairMode: 1,
      sourceType: 1,
      reportUnit: "本地演示区域",
      reportUserName: "本地演示用户",
      equipmentId: "eq-1",
      equipmentNo: "EQ-001",
      equipmentName: "本地演示设备",
      faultDesc: "本地静态故障描述",
      planBeginTime: now,
      planEndTime: now,
      createTime: now
    }
  ],
  "/equipmentSpotTask": [
    {
      id: "spot-task-1",
      taskNo: "DJ-001",
      taskStatus: 1,
      equipmentId: "eq-1",
      equipmentNo: "EQ-001",
      equipmentName: "本地演示设备",
      areaName: "本地演示区域",
      planBeginTime: now,
      planEndTime: now,
      createTime: now
    }
  ],
  "/equipmentPatrolTask": [
    {
      id: "patrol-task-1",
      taskNo: "XJ-001",
      taskStatus: 1,
      equipmentId: "eq-1",
      equipmentNo: "EQ-001",
      equipmentName: "本地演示设备",
      areaName: "本地演示区域",
      planBeginTime: now,
      planEndTime: now,
      createTime: now
    }
  ],
  "/equipmentMaintenanceTask": [
    {
      id: "maintenance-task-1",
      taskNo: "BY-001",
      taskStatus: 1,
      equipmentId: "eq-1",
      equipmentNo: "EQ-001",
      equipmentName: "本地演示设备",
      areaName: "本地演示区域",
      planBeginTime: now,
      planEndTime: now,
      createTime: now
    }
  ],
  "/equipmentScrap": [
    {
      id: "scrap-1",
      applyNo: "BF-001",
      status: 1,
      equipmentId: "eq-1",
      equipmentNo: "EQ-001",
      equipmentName: "本地演示设备",
      applyUserName: "本地演示用户",
      applyTime: now,
      createTime: now
    }
  ],
  "/equipment/": [
    {
      id: "eq-1",
      equipmentId: "eq-1",
      equipmentNo: "EQ-001",
      equipmentName: "本地演示设备",
      equipmentModelName: "标准设备型号",
      equipmentTypeName: "加工设备",
      areaName: "本地演示区域",
      status: 1,
      createTime: now
    }
  ],
  "/equipmentModel": [
    {
      id: "eq-model-1",
      equipmentModelNo: "EQM-001",
      equipmentModelName: "标准设备型号",
      equipmentTypeName: "加工设备",
      status: 1,
      createTime: now
    }
  ],
  "/equipmentCategory": [
    {
      id: "eq-cate-1",
      categoryNo: "EQC-001",
      categoryName: "加工设备",
      parentId: "0",
      createTime: now
    }
  ],
  "/mroRepair": [
    {
      id: "mro-repair-1",
      repairNo: "MRO-WX-001",
      no: "MRO-WX-001",
      status: 1,
      repairStatus: 1,
      mroInformationId: "mro-1",
      mroNo: "MRO-001",
      mroName: "本地演示 MRO",
      mroModelName: "工装夹具",
      reportUserName: "本地演示用户",
      createTime: now
    }
  ],
  "/mroInspectionTask": [
    {
      id: "mro-verify-task-1",
      taskNo: "MRO-JY-001",
      status: 1,
      mroInformationId: "mro-1",
      mroNo: "MRO-001",
      mroName: "本地演示 MRO",
      planBeginTime: now,
      planEndTime: now,
      createTime: now
    }
  ],
  "/mroMaintenanceTask": [
    {
      id: "mro-upkeep-task-1",
      taskNo: "MRO-BY-001",
      status: 1,
      mroInformationId: "mro-1",
      mroNo: "MRO-001",
      mroName: "本地演示 MRO",
      planBeginTime: now,
      planEndTime: now,
      createTime: now
    }
  ],
  "/mroPickupOrder": [
    {
      id: "mro-pickup-1",
      no: "MRO-LY-001",
      status: 1,
      pickupUserName: "本地演示用户",
      warehouseName: "本地演示仓库",
      createTime: now
    }
  ],
  "/mroReturnOrder": [
    {
      id: "mro-return-1",
      no: "MRO-GH-001",
      status: 1,
      returnUserName: "本地演示用户",
      warehouseName: "本地演示仓库",
      createTime: now
    }
  ],
  "/mro/": [
    {
      id: "mro-1",
      mroInformationId: "mro-1",
      mroNo: "MRO-001",
      mroName: "本地演示 MRO",
      mroModelName: "工装夹具",
      mroSerialNo: "MRO-SN-001",
      warehouseName: "本地演示仓库",
      ledgerStatus: 1,
      createTime: now
    }
  ],
  "/mroModel": [
    {
      id: "mro-model-1",
      mroModelNo: "MRO-M-001",
      mroModelName: "工装夹具",
      mroClassifyName: "夹具类",
      mroTypeName: "通用夹具",
      identityManage: 1,
      createTime: now
    }
  ],
  "/mroClassify": [
    {
      id: "mro-classify-1",
      classifyNo: "MROC-001",
      classifyName: "夹具类",
      parentId: "0",
      createTime: now
    }
  ],
  "/mroType": [
    {
      id: "mro-type-1",
      typeNo: "MROT-001",
      typeName: "通用夹具",
      classifyName: "夹具类",
      createTime: now
    }
  ],
  "/qa": [
    {
      id: "qa-1",
      taskNo: "QA-001",
      productModelName: "减速器壳体总成A型",
      productModelCode: "GR-HSG-001",
      inspectResult: 2,
      status: 1,
      createTime: now
    }
  ],
  "/craftType": [
    {
      id: "ct1",
      craftTypeNo: "CT-001",
      craftTypeName: "装配",
      bizType: 1,
      status: 1,
      createTime: now
    },
    {
      id: "ct2",
      craftTypeNo: "CT-002",
      craftTypeName: "机加工",
      bizType: 1,
      status: 1,
      createTime: now
    },
    {
      id: "ct3",
      craftTypeNo: "CT-003",
      craftTypeName: "辅助检测",
      bizType: 1,
      status: 1,
      createTime: now
    }
  ],
  "/tech": jiangdiCraftRows,
  "/bom": [
    {
      id: "bom-1",
      bomNo: "BOM-001",
      productModelId: "pm1",
      productModelCode: "GR-HSG-001",
      productModelName: "减速器壳体总成A型",
      version: "V1.0",
      status: 1,
      createTime: now
    }
  ],
  "/vehicle": [
    {
      id: "vehicle-1",
      no: "VEH-001",
      name: "本地演示载具",
      vehicleNo: "VEH-001",
      vehicleName: "本地演示载具",
      status: 1,
      createTime: now
    }
  ],
  "/andon": [
    {
      id: "andon-1",
      no: "ANDON-001",
      andonNo: "ANDON-001",
      andonName: "本地演示 Andon",
      status: 1,
      createTime: now
    }
  ]
}

const getGenericRows = (path: string) => {
  const matched = Object.keys(genericRows)
    .sort((a, b) => b.length - a.length)
    .find((prefix) => path.startsWith(prefix))
  return matched ? genericRows[matched] : []
}

const fileList = [
  {
    ...commonFile,
    id: "file-1",
    fileName: "现场照片.png",
    sourceName: "现场照片.png",
    size: "1024"
  }
]

const standardRange = (desc: string, unitName = "mm") => ({
  standardDesc: desc,
  standardMin: 9.8,
  standardMinInclusive: 1,
  standardMax: 10.2,
  standardMaxInclusive: 1,
  standardType: 1,
  unitId: unitName ? `UNIT-${unitName}` : "",
  unitName
})

const qualitySampleItems = (taskId: string, sampleId: string, offset: number) => [
  {
    id: `${taskId}${sampleId}${offset}1`,
    taskId,
    sampleId,
    inspectItemCode: `ITEM-${taskId}-${offset}1`,
    inspectItemName: "尺寸检验",
    inspectItemImageUrl: "",
    methodDesc: "游标卡尺测量",
    standardDesc: "10±0.2",
    standardMin: 9.8,
    standardMinInclusive: 1,
    standardMax: 10.2,
    standardMaxInclusive: 1,
    standardType: 1,
    unitId: "UNIT-MM",
    unitName: "mm",
    isSampleReturn: 1,
    actualValue: "",
    itemResult: 0,
    remark: "",
    remarks: "",
    remarkImageIds: "",
    remarkImageUrls: "",
    submitterName: "",
    createTime: now,
    inspectionTime: ""
  },
  {
    id: `${taskId}${sampleId}${offset}2`,
    taskId,
    sampleId,
    inspectItemCode: `ITEM-${taskId}-${offset}2`,
    inspectItemName: "外观检验",
    inspectItemImageUrl: "",
    methodDesc: "目检",
    standardDesc: "无毛刺、无磕碰",
    standardMin: 0,
    standardMinInclusive: 1,
    standardMax: 0,
    standardMaxInclusive: 1,
    standardType: 3,
    unitId: "",
    unitName: "",
    isSampleReturn: 0,
    actualValue: "",
    itemResult: 0,
    remark: "",
    remarks: "",
    remarkImageIds: "",
    remarkImageUrls: "",
    submitterName: "",
    createTime: now,
    inspectionTime: ""
  }
]

const buildQualitySamples = (taskId: string, productModelName: string) => [
  {
    id: `${taskId}01`,
    sampleStatus: 0,
    productModelId: "pm1",
    productModelName,
    seqNo: 1,
    taskId,
    sampleItemDTOList: qualitySampleItems(taskId, "01", 1)
  },
  {
    id: `${taskId}02`,
    sampleStatus: 0,
    productModelId: "pm1",
    productModelName,
    seqNo: 2,
    taskId,
    sampleItemDTOList: qualitySampleItems(taskId, "02", 2)
  }
]

const qualityProcessTasks: any[] = [
  {
    id: "201",
    createTime: now,
    dispatcherTaskCode: "DISP-201",
    dispatcherTaskId: "D-201",
    expired: 0,
    facilityId: "F-01",
    facilityName: "一号产线",
    inspectTaskNo: "PI-201",
    inspectType: 1,
    productModelCode: "GR-HSG-001",
    productModelId: "pm1",
    productModelName: "减速器壳体总成A型",
    productionTaskNo: "PROD-201",
    sampleNum: 2,
    taskCompleteBy: "",
    taskCompleteByName: "",
    taskCompleteTime: "",
    taskResult: 0,
    taskStatus: 1,
    techName: "标准工艺A",
    techProcessSerial: "001",
    workstationId: "WS-01",
    workstationName: "总装工位",
    entityName: "制造中心",
    decimalNumber: 2,
    codeRelate: 1,
    instanceRelate: 1,
    samples: buildQualitySamples("201", "减速器壳体总成A型")
  },
  {
    id: "202",
    createTime: now,
    dispatcherTaskCode: "DISP-202",
    dispatcherTaskId: "D-202",
    expired: 0,
    facilityId: "F-02",
    facilityName: "二号产线",
    inspectTaskNo: "PI-202",
    inspectType: 3,
    productModelCode: "GR-HSG-002",
    productModelId: "pm2",
    productModelName: "减速器端盖B型",
    productionTaskNo: "PROD-202",
    sampleNum: 2,
    taskCompleteBy: "1",
    taskCompleteByName: "本地演示用户",
    taskCompleteTime: now,
    taskResult: 1,
    taskStatus: 3,
    techName: "标准工艺B",
    techProcessSerial: "002",
    workstationId: "WS-02",
    workstationName: "加工工位",
    entityName: "制造中心",
    decimalNumber: 2,
    codeRelate: 1,
    instanceRelate: 1,
    samples: buildQualitySamples("202", "减速器端盖B型")
  }
]

const qualityNonProcessTasks: any[] = [
  {
    id: "301",
    inspectTaskNo: "NPI-301",
    bizId: "BIZ-301",
    bizCode: "CG-IN-301",
    inspectType: 4,
    productModelId: "pm1",
    productModelCode: "GR-HSG-001",
    productModelName: "减速器壳体总成A型",
    productTotalQuantity: 60,
    unitId: "1",
    unitName: "件",
    decimalNumber: 2,
    suggestSampleQuantity: 2,
    sampleNum: 2,
    taskStatus: 1,
    taskResult: 0,
    createTime: now,
    taskCompleteTime: "",
    taskCompleteBy: "",
    taskCompleteByName: "",
    samples: buildQualitySamples("301", "减速器壳体总成A型")
  },
  {
    id: "302",
    inspectTaskNo: "NPI-302",
    bizId: "BIZ-302",
    bizCode: "FH-OUT-302",
    inspectType: 6,
    productModelId: "pm2",
    productModelCode: "GR-HSG-002",
    productModelName: "减速器端盖B型",
    productTotalQuantity: 45,
    unitId: "1",
    unitName: "件",
    decimalNumber: 2,
    suggestSampleQuantity: 2,
    sampleNum: 2,
    taskStatus: 3,
    taskResult: 2,
    createTime: now,
    taskCompleteTime: now,
    taskCompleteBy: "1",
    taskCompleteByName: "本地演示用户",
    samples: buildQualitySamples("302", "减速器端盖B型")
  }
]

const qualityTaskProducts = new Map<string, any[]>([
  [
    "301",
    [
      {
        barcode: "BC-301-1",
        productId: "P-301-1",
        productModelCode: "GR-HSG-001",
        productModelId: "pm1",
        productModelName: "减速器壳体总成A型",
        quantity: 1,
        unitId: "1",
        unitName: "件",
        vehicleId: "VEH-001",
        vehicleBarcode: "VB-301-1",
        sampleNum: 2,
        decimalNumber: 2
      }
    ]
  ],
  [
    "302",
    [
      {
        barcode: "BC-302-1",
        productId: "P-302-1",
        productModelCode: "GR-HSG-002",
        productModelId: "pm2",
        productModelName: "减速器端盖B型",
        quantity: 1,
        unitId: "1",
        unitName: "件",
        vehicleId: "VEH-002",
        vehicleBarcode: "VB-302-1",
        sampleNum: 2,
        decimalNumber: 2
      }
    ]
  ]
])

const qualityReviewTasks: any[] = [
  {
    id: 401,
    reviewTaskNo: "DR-401",
    inspectTaskId: 302,
    inspectTaskNo: "NPI-302",
    dispatcherTaskCode: "DISP-302",
    dispatcherTaskId: 302,
    originType: 1,
    productModelCode: "GR-HSG-002",
    productModelId: 2,
    productModelName: "减速器端盖B型",
    quantity: 2,
    unitId: 1,
    unitName: "件",
    decimalNumber: 2,
    reviewStatus: 1,
    reviewResults: [1],
    completeBy: 0,
    completeByName: "",
    reviewCompleteTime: "",
    techName: "标准工艺B",
    workstationId: 1,
    workstationName: "加工工位",
    createTime: now
  }
]

const qualityReviewTargets = [
  {
    id: "rt-1",
    reviewTaskId: "401",
    productId: "P-302-1",
    barcode: "BC-302-1",
    productModelCode: "GR-HSG-002",
    productModelName: "减速器端盖B型",
    quantity: 1,
    unitName: "件",
    reviewResult: 0,
    disposalMethod: ""
  }
]

const qualityReviewDefects = [
  {
    id: "flaw-register-1",
    reviewTaskId: "401",
    flawId: "flaw-1",
    flawName: "外观划伤",
    flawGradeId: "grade-1",
    gradeName: "外观类",
    flawLevelId: "level-1",
    levelName: "轻微",
    quantity: 1,
    remarks: "表面轻微划伤",
    createTime: now
  }
]

const qualityFlawGrades = [
  { id: "grade-1", gradeName: "外观类", remarks: "外观缺陷", createTime: now, updateTime: now },
  { id: "grade-2", gradeName: "尺寸类", remarks: "尺寸缺陷", createTime: now, updateTime: now }
]

const qualityFlawLevels = [
  { id: "level-1", levelName: "轻微", levelNo: "L1", remarks: "可返修", createBy: "1", createTime: now, updateBy: "1", updateTime: now },
  { id: "level-2", levelName: "严重", levelNo: "L2", remarks: "需评审", createBy: "1", createTime: now, updateBy: "1", updateTime: now }
]

const qualityFlaws = [
  {
    id: "flaw-1",
    flawName: "外观划伤",
    flawGradeId: "grade-1",
    gradeName: "外观类",
    enabledStatus: true,
    remarks: "表面划伤",
    createTime: now,
    updateTime: now
  },
  {
    id: "flaw-2",
    flawName: "孔径超差",
    flawGradeId: "grade-2",
    gradeName: "尺寸类",
    enabledStatus: true,
    remarks: "关键尺寸异常",
    createTime: now,
    updateTime: now
  }
]

const qualityGradientModels: any[] = [
  {
    id: "gm-1",
    modelId: "gm-1",
    modelName: "AQL 默认梯度",
    modelNo: "GM-001",
    enabledStatus: true,
    samplingMethod: 1,
    remarks: "本地静态梯度模型",
    createTime: now,
    updateTime: now,
    gradientModelItems: [
      { id: "gmi-1", modelId: "gm-1", lowerLimit: 1, upperLimit: 50, sampleQuantity: 2 },
      { id: "gmi-2", modelId: "gm-1", lowerLimit: 51, upperLimit: 200, sampleQuantity: 5 }
    ]
  }
]

const equipmentModels = [
  {
    id: "2001",
    modelNo: "MD-001",
    deviceModel: "JS-120T",
    modelName: "注塑机 120T",
    equipmentModelNo: "MD-001",
    equipmentModelName: "注塑机 120T",
    equipmentCategoryId: "3001",
    equipmentCategoryName: "加工设备",
    patrolExecuteDepartmentName: "设备部",
    patrolExecutePositionName: "巡检员",
    maintenanceExecuteDepartmentName: "设备部",
    maintenanceExecutePositionName: "保养员",
    repairDepartments: [{ id: "RP-01", depName: "设备部", positionName: "机修工", name: "机修工" }],
    modelStatus: 1,
    status: 1,
    remarks: "注塑产线主机",
    createTime: now,
    updateTime: now
  },
  {
    id: "2002",
    modelNo: "MD-002",
    deviceModel: "TB-220",
    modelName: "自动贴标机",
    equipmentModelNo: "MD-002",
    equipmentModelName: "自动贴标机",
    equipmentCategoryId: "3003",
    equipmentCategoryName: "装配设备",
    patrolExecuteDepartmentName: "制造部",
    patrolExecutePositionName: "线边巡检员",
    maintenanceExecuteDepartmentName: "设备部",
    maintenanceExecutePositionName: "保养员",
    repairDepartments: [{ id: "RP-02", depName: "设备部", positionName: "电气工程师", name: "电气工程师" }],
    modelStatus: 1,
    status: 1,
    remarks: "包装段设备",
    createTime: now,
    updateTime: now
  },
  {
    id: "2003",
    modelNo: "MD-003",
    deviceModel: "AOI-X5",
    modelName: "AOI视觉检测机",
    equipmentModelNo: "MD-003",
    equipmentModelName: "AOI视觉检测机",
    equipmentCategoryId: "3002",
    equipmentCategoryName: "检测设备",
    patrolExecuteDepartmentName: "质量部",
    patrolExecutePositionName: "巡检员",
    maintenanceExecuteDepartmentName: "设备部",
    maintenanceExecutePositionName: "保养员",
    repairDepartments: [{ id: "RP-03", depName: "设备部", positionName: "视觉工程师", name: "视觉工程师" }],
    modelStatus: 1,
    status: 1,
    remarks: "外观检测设备",
    createTime: now,
    updateTime: now
  },
  {
    id: "2004",
    modelNo: "MD-004",
    deviceModel: "LG-20W",
    modelName: "激光打标机",
    equipmentModelNo: "MD-004",
    equipmentModelName: "激光打标机",
    equipmentCategoryId: "3001",
    equipmentCategoryName: "加工设备",
    patrolExecuteDepartmentName: "设备部",
    patrolExecutePositionName: "巡检员",
    maintenanceExecuteDepartmentName: "设备部",
    maintenanceExecutePositionName: "保养员",
    repairDepartments: [{ id: "RP-04", depName: "设备部", positionName: "电气工程师", name: "电气工程师" }],
    modelStatus: 1,
    status: 1,
    remarks: "打码工序设备",
    createTime: now,
    updateTime: now
  },
  {
    id: "2005",
    modelNo: "MD-005",
    deviceModel: "YA-08",
    modelName: "伺服压装机",
    equipmentModelNo: "MD-005",
    equipmentModelName: "伺服压装机",
    equipmentCategoryId: "3003",
    equipmentCategoryName: "装配设备",
    patrolExecuteDepartmentName: "制造部",
    patrolExecutePositionName: "巡检员",
    maintenanceExecuteDepartmentName: "设备部",
    maintenanceExecutePositionName: "机修工",
    repairDepartments: [{ id: "RP-05", depName: "设备部", positionName: "机修工", name: "机修工" }],
    modelStatus: 1,
    status: 1,
    remarks: "装配线关键工位",
    createTime: now,
    updateTime: now
  },
  {
    id: "2006",
    modelNo: "MD-006",
    deviceModel: "LH-12C",
    modelName: "老化测试台",
    equipmentModelNo: "MD-006",
    equipmentModelName: "老化测试台",
    equipmentCategoryId: "3002",
    equipmentCategoryName: "检测设备",
    patrolExecuteDepartmentName: "质量部",
    patrolExecutePositionName: "测试员",
    maintenanceExecuteDepartmentName: "设备部",
    maintenanceExecutePositionName: "保养员",
    repairDepartments: [{ id: "RP-06", depName: "设备部", positionName: "机修工", name: "机修工" }],
    modelStatus: 1,
    status: 1,
    remarks: "可靠性测试设备",
    createTime: now,
    updateTime: now
  }
]

const equipmentInfoRows: any[] = [
  ["1001", "TA-2026-001", "注塑机1", "2001", "注塑车间/一区/A01工位", "BC-EQ-001", "主力生产设备"],
  ["1002", "TA-2026-002", "贴标机1", "2002", "包装车间/二区/B03工位", "BC-EQ-002", "已到月度保养窗口"],
  ["1003", "TA-2026-003", "AOI检测机1", "2003", "检测车间/一区/C02工位", "BC-EQ-003", "本周巡检未完成"],
  ["1004", "TA-2026-004", "打标机1", "2004", "打码车间/三区/D06工位", "BC-EQ-004", "点检发现激光头偏移"],
  ["1005", "TA-2026-005", "压装机1", "2005", "装配车间/一区/E01工位", "BC-EQ-005", "已提交维修申请"],
  ["1006", "TA-2026-006", "压装机2", "2005", "装配车间/二区/E08工位", "BC-EQ-006", "维修工单已接单"],
  ["1007", "TA-2026-007", "老化测试台1", "2006", "实验室/可靠性区/F02工位", "BC-EQ-007", "已发起报废审批"],
  ["1008", "TA-2026-008", "贴标机2", "2002", "包装车间/备用区/B99工位", "BC-EQ-008", "产线调整，暂时停用"],
  ["1009", "TA-2026-009", "注塑机2", "2001", "仓库/待处置区/Z01工位", "BC-EQ-009", "已完成报废处置"]
].map(([id, equipmentNo, equipmentName, equipmentModelId, areaName, barCode, remarks]) => {
  const equipmentModel = equipmentModels.find((item) => item.id === equipmentModelId) || equipmentModels[0]
  return {
    id,
    equipmentId: id,
    equipmentNo,
    equipmentName,
    equipmentModelId,
    equipmentModelNo: equipmentModel.modelNo,
    equipmentModelName: equipmentModel.modelName,
    equipmentTypeNo: equipmentModel.modelNo,
    equipmentTypeName: equipmentModel.modelName,
    equipmentCategoryId: equipmentModel.equipmentCategoryId,
    equipmentCategoryName: equipmentModel.equipmentCategoryName,
    equipmentModel,
    areaName,
    fmEntityNames: areaName,
    equipmentStatus: id === "1008" || id === "1009" ? 0 : 1,
    status: id === "1008" || id === "1009" ? 0 : 1,
    enableStatus: id !== "1008" && id !== "1009",
    maintenanceStatus: id === "1002" ? 11 : 1,
    patrolStatus: id === "1003" ? 14 : 1,
    spotStatus: id === "1004" ? 26 : id === "1006" ? 17 : 1,
    repairStatus: id === "1005" ? 29 : id === "1009" ? 35 : 1,
    scrapStatus: id === "1007" ? 32 : id === "1009" ? 35 : 1,
    barCode,
    barCodeId: "",
    remarks,
    createBy: "1",
    updateBy: "1",
    createTime: now,
    updateTime: now
  }
})

const equipmentCategories = [
  {
    id: "3000",
    categoryNo: "CAT-ROOT",
    categoryName: "设备分类",
    parentId: "0",
    parentCategoryName: "全部设备分类",
    remarks: "设备分类",
    record: [],
    subDirs: [
      {
        id: "3001",
        categoryNo: "CAT-MACH",
        categoryName: "加工设备",
        parentId: "3000",
        parentCategoryName: "设备分类",
        remarks: "加工类设备",
        record: [],
        subDirs: []
      },
      {
        id: "3002",
        categoryNo: "CAT-QC",
        categoryName: "检测设备",
        parentId: "3000",
        parentCategoryName: "设备分类",
        remarks: "检测类设备",
        record: [],
        subDirs: []
      },
      {
        id: "3003",
        categoryNo: "CAT-ASM",
        categoryName: "装配设备",
        parentId: "3000",
        parentCategoryName: "设备分类",
        remarks: "装配类设备",
        record: [],
        subDirs: []
      }
    ]
  }
]

const equipmentCategoryHierarchyRoot = {
  id: "0",
  categoryNo: "CAT-ALL",
  categoryName: "全部设备分类",
  parentId: "",
  parentCategoryName: "",
  remarks: "全部设备分类",
  record: [],
  subDirs: equipmentCategories
}

const flattenEquipmentCategories = (nodes: any[]): any[] =>
  nodes.flatMap((node) => [node, ...flattenEquipmentCategories(node.subDirs || [])])

const flatEquipmentCategories = flattenEquipmentCategories(equipmentCategories)

const equipmentInspectItems = (taskId: string, type: "patrol" | "spot" | "maintenance") => {
  const isMaintenance = type === "maintenance"
  return [
    {
      id: `${taskId}-item-1`,
      equipmentConfigId: `${type}-config-1`,
      equipmentConfigName: isMaintenance ? "一级保养项目" : "安全防护检查",
      patrolTaskId: taskId,
      spotTaskId: taskId,
      maintenanceTaskId: taskId,
      inspectionName: "安全防护检查",
      inspectionNo: `CHK-${taskId}-01`,
      inspectionMethod: "现场检查",
      maintenanceName: "导轨润滑",
      maintenanceNo: `MT-${taskId}-01`,
      maintenanceMethod: "清洁后补充润滑脂",
      methodRequire: "按点检标准执行",
      maintenanceTypeId: "12001",
      maintenanceTypeName: "一级保养",
      inspectionStandard: standardRange("防护门关闭可靠", ""),
      maintenanceStandard: standardRange("润滑均匀无异响", ""),
      practicalValue: "",
      inspectionResult: 2,
      maintenanceResult: 2,
      inspectionTime: "",
      maintenanceTime: "",
      inspectionUsers: [],
      maintenanceUsers: [],
      remarks: "",
      files: [],
      remarkFiles: []
    },
    {
      id: `${taskId}-item-2`,
      equipmentConfigId: `${type}-config-2`,
      equipmentConfigName: isMaintenance ? "二级保养项目" : "运行状态检查",
      patrolTaskId: taskId,
      spotTaskId: taskId,
      maintenanceTaskId: taskId,
      inspectionName: "运行状态检查",
      inspectionNo: `CHK-${taskId}-02`,
      inspectionMethod: "听音并记录",
      maintenanceName: "电气柜除尘",
      maintenanceNo: `MT-${taskId}-02`,
      maintenanceMethod: "断电后清洁",
      methodRequire: "按保养标准执行",
      maintenanceTypeId: "12002",
      maintenanceTypeName: "二级保养",
      inspectionStandard: standardRange("运行平稳无报警", ""),
      maintenanceStandard: standardRange("柜内无明显积尘", ""),
      practicalValue: "",
      inspectionResult: 2,
      maintenanceResult: 2,
      inspectionTime: "",
      maintenanceTime: "",
      inspectionUsers: [],
      maintenanceUsers: [],
      remarks: "",
      files: [],
      remarkFiles: []
    }
  ]
}

const buildEquipmentTask = (id: string, prefix: string, equipment: any, sourceType = 4) => ({
  id,
  taskNo: `${prefix}-${id}`,
  taskStatus: 1,
  inspectionResult: 2,
  maintenanceResult: 2,
  sourceType,
  taskSource: "manual_create",
  equipmentId: equipment.id,
  equipmentNo: equipment.equipmentNo,
  equipmentName: equipment.equipmentName,
  equipmentModelId: equipment.equipmentModelId,
  equipmentTypeNo: equipment.equipmentTypeNo,
  equipmentTypeName: equipment.equipmentTypeName,
  areaName: equipment.areaName,
  executeDepartmentId: "DP-01",
  executeDepartmentName: "设备部",
  executePositionId: "POS-01",
  executePositionName: "巡检员",
  planStartTime: now,
  planEndTime: now,
  planBeginTime: now,
  createTime: now,
  updateTime: now,
  remarks: "本地静态演示任务"
})

const equipmentPatrolTasks = [
  { ...buildEquipmentTask("5001", "XJ", equipmentInfoRows[0], 4), items: equipmentInspectItems("5001", "patrol") },
  { ...buildEquipmentTask("5002", "XJ", equipmentInfoRows[1], 2), taskStatus: 3, items: equipmentInspectItems("5002", "patrol") },
  { ...buildEquipmentTask("5003", "XJ", equipmentInfoRows[2], 2), items: equipmentInspectItems("5003", "patrol") }
]

const equipmentSpotTasks = [
  { ...buildEquipmentTask("5101", "DJ", equipmentInfoRows[0], 4), taskType: 1, rotationId: "shift-1", rotationName: "白班", items: equipmentInspectItems("5101", "spot") },
  { ...buildEquipmentTask("5102", "DJ", equipmentInfoRows[1], 1), taskType: 2, rotationId: "shift-2", rotationName: "夜班", taskStatus: 3, items: equipmentInspectItems("5102", "spot") },
  { ...buildEquipmentTask("5103", "DJ", equipmentInfoRows[2], 1), taskType: 1, rotationId: "shift-1", rotationName: "白班", items: equipmentInspectItems("5103", "spot") }
]

const buildMaintenanceItem = (
  id: string,
  taskId: string,
  equipmentConfigId: string,
  maintenanceNo: string,
  maintenanceName: string,
  maintenanceMethod: string,
  standard: any,
  exceptionTaskId = "",
  exceptionTaskNo = ""
) => ({
  id,
  maintenanceTaskId: taskId,
  equipmentConfigId,
  equipmentConfigName: "",
  exceptionTaskId,
  exceptionTaskNo,
  files: [],
  maintenanceMethod,
  methodRequire: maintenanceMethod,
  maintenanceName,
  maintenanceNo,
  maintenanceResult: 2,
  maintenanceStandard: standard,
  maintenanceTime: "",
  maintenanceTypeId: "12001",
  maintenanceTypeName: "一级保养",
  maintenanceUserName: "",
  maintenanceUsers: [],
  practicalValue: "",
  remarkFiles: [],
  remarks: "",
  inspectionResult: 2
})

const equipmentMaintenanceTasks = [
  {
    ...buildEquipmentTask("21", "MT-MOCK", equipmentInfoRows[1], 4),
    taskNo: "MT-MOCK-001",
    areaName: "包装车间/二区/B03工位",
    barCode: "BC-EQ-002",
    createBy: "1",
    createTime: "2026-04-12T02:00:00.000Z",
    equipmentModelId: "2002",
    equipmentName: "自动贴标机",
    equipmentNo: "TA-2026-002",
    equipmentTypeNo: "MD-002",
    equipmentTypeName: "自动贴标机",
    executeDepartmentName: "设备部",
    executePosition: "设备部-保养员",
    executePositionName: "保养员",
    maintenanceStatus: 1,
    maintenanceTypeId: "12001",
    maintenanceTypeName: "一级保养",
    planDate: "2026-04-12T02:00:00.000Z",
    planStartTime: "2026-04-12T02:00:00.000Z",
    planEndTime: "2026-04-12T10:00:00.000Z",
    taskStatus: 1,
    items: [
      buildMaintenanceItem("2101", "21", "9007", "UP-101", "标签传感器清洁", "使用无尘布清洁标签检测传感器", {
        standardType: 2,
        standardDesc: "传感器表面无污渍、识别正常",
        standardMin: -1,
        standardMinInclusive: 0,
        standardMax: -1,
        standardMaxInclusive: 0,
        unitId: "",
        unitName: ""
      }),
      buildMaintenanceItem("2102", "21", "9008", "UP-102", "标签剥离张力检查", "停机后校验标压和收等轴", {
        standardType: 1,
        standardDesc: "张力值 8-12N",
        standardMin: 8,
        standardMinInclusive: 1,
        standardMax: 12,
        standardMaxInclusive: 1,
        unitId: "N",
        unitName: "N"
      }, "41", "EX-MT-202604-001")
    ]
  },
  {
    ...buildEquipmentTask("22", "MT-PAD", equipmentInfoRows[3], 4),
    taskNo: "MT-PAD-001",
    areaName: "打码车间/三区/D06工位",
    barCode: "BC-EQ-004",
    createBy: "1",
    createTime: "2026-04-27T06:00:00.000Z",
    equipmentModelId: "2004",
    equipmentName: "打标机1",
    equipmentNo: "TA-2026-004",
    equipmentTypeNo: "MD-004",
    equipmentTypeName: "激光打标机",
    executeDepartmentName: "设备部",
    executePosition: "设备部-保养员",
    executePositionName: "保养员",
    maintenanceStatus: 1,
    maintenanceTypeId: "12001",
    maintenanceTypeName: "一级保养",
    planDate: "2026-04-27T06:00:00.000Z",
    planStartTime: "2026-04-27T06:00:00.000Z",
    planEndTime: "2026-04-27T10:00:00.000Z",
    remarks: "PAD设备保养反馈测试数据",
    taskStatus: 1,
    items: [
      buildMaintenanceItem("2201", "22", "9009", "UP-401", "激光头清洁", "无尘布配合专用清洗擦拭", {
        standardType: 2,
        standardDesc: "光斑清晰、镜面无污染",
        standardMin: -1,
        standardMinInclusive: 0,
        standardMax: -1,
        standardMaxInclusive: 0,
        unitId: "",
        unitName: ""
      }, "42", "EX-MT-202604-002"),
      buildMaintenanceItem("2202", "22", "9010", "UP-402", "振镜系统检查", "停机状态下核对打标路径", {
        standardType: 1,
        standardDesc: "定位误差 0-0.2mm",
        standardMin: 0,
        standardMinInclusive: 1,
        standardMax: 0.2,
        standardMaxInclusive: 1,
        unitId: "mm",
        unitName: "mm"
      }, "42", "EX-MT-202604-002")
    ]
  }
].map((task) => ({
  ...task,
  itemList: task.items,
  departments: [],
  schedulingRotations: [],
  maintenanceResult: 2,
  inspectionResult: 2,
  taskSource: "manual_create",
  taskSourceName: "manual_create",
  submitterName: "admin",
  updateBy: "1",
  updateTime: now
}))

const equipmentMaintenanceTypes = [
  {
    id: "12001",
    maintenanceTypeCode: "MT-001",
    maintenanceTypeName: "一级保养",
    remarks: "适用于常规周期保养",
    createBy: "系统管理员",
    createTime: "2026-04-01T01:00:00.000Z",
    updateBy: "系统管理员",
    updateTime: "2026-04-01T01:00:00.000Z"
  },
  {
    id: "12002",
    maintenanceTypeCode: "MT-002",
    maintenanceTypeName: "二级保养",
    remarks: "适用于深度保养",
    createBy: "系统管理员",
    createTime: "2026-04-01T01:10:00.000Z",
    updateBy: "系统管理员",
    updateTime: "2026-04-01T01:10:00.000Z"
  }
]

const equipmentMaintenanceYearPlans = [
  {
    id: "71",
    planNo: "YMP-2026-001",
    planYear: "2026",
    planName: "2026年度设备保养计划",
    status: 1,
    totalCount: 3,
    remarks: "年度基准计划",
    createBy: "系统管理员",
    createTime: "2026-01-02T01:00:00.000Z",
    updateBy: "系统管理员",
    updateTime: "2026-04-20T02:00:00.000Z",
    reviewBy: "系统管理员",
    reviewTime: "2026-01-03T02:00:00.000Z",
    voidBy: "",
    voidTime: "",
    voidReason: "",
    details: [
      {
        equipmentId: "1001",
        areaName: "注塑车间",
        equipmentNo: "TA-2026-001",
        equipmentName: "注塑机1",
        equipmentTypeNo: "MD-001",
        equipmentTypeName: "注塑机",
        month1: true,
        month2: false,
        month3: false,
        month4: true,
        month5: false,
        month6: false,
        month7: true,
        month8: false,
        month9: false,
        month10: true,
        month11: false,
        month12: false
      },
      {
        equipmentId: "1002",
        areaName: "包装车间",
        equipmentNo: "TA-2026-002",
        equipmentName: "贴标机1",
        equipmentTypeNo: "MD-002",
        equipmentTypeName: "贴标机",
        month1: false,
        month2: true,
        month3: false,
        month4: false,
        month5: true,
        month6: false,
        month7: false,
        month8: true,
        month9: false,
        month10: false,
        month11: true,
        month12: false
      },
      {
        equipmentId: "1003",
        areaName: "检测车间",
        equipmentNo: "TA-2026-003",
        equipmentName: "AOI检测机1",
        equipmentTypeNo: "MD-003",
        equipmentTypeName: "AOI检测机",
        month1: false,
        month2: false,
        month3: true,
        month4: false,
        month5: false,
        month6: true,
        month7: false,
        month8: false,
        month9: true,
        month10: false,
        month11: false,
        month12: true
      }
    ]
  },
  {
    id: "72",
    planNo: "YMP-2025-001",
    planYear: "2025",
    planName: "2025年度设备保养计划",
    status: 2,
    totalCount: 2,
    remarks: "历史计划已作废",
    createBy: "系统管理员",
    createTime: "2025-01-02T01:00:00.000Z",
    updateBy: "系统管理员",
    updateTime: "2025-08-01T07:00:00.000Z",
    reviewBy: "系统管理员",
    reviewTime: "2025-01-03T03:00:00.000Z",
    voidBy: "系统管理员",
    voidTime: "2025-08-01T07:00:00.000Z",
    voidReason: "旧版本计划失效，已由新版本替换",
    details: [
      {
        equipmentId: "1001",
        areaName: "注塑车间",
        equipmentNo: "TA-2026-001",
        equipmentName: "注塑机1",
        equipmentTypeNo: "MD-001",
        equipmentTypeName: "注塑机",
        month1: true,
        month2: true,
        month3: true,
        month4: false,
        month5: false,
        month6: false,
        month7: false,
        month8: false,
        month9: false,
        month10: false,
        month11: false,
        month12: false
      },
      {
        equipmentId: "1005",
        areaName: "装配车间",
        equipmentNo: "TA-2026-005",
        equipmentName: "压装机1",
        equipmentTypeNo: "MD-005",
        equipmentTypeName: "伺服压装机",
        month1: false,
        month2: false,
        month3: true,
        month4: false,
        month5: false,
        month6: true,
        month7: false,
        month8: false,
        month9: true,
        month10: false,
        month11: false,
        month12: true
      }
    ]
  }
]

const equipmentMaintenanceMonthPlans = [
  {
    id: "32",
    planNo: "MMP-202605-001",
    planMonth: "2026-05",
    planName: "2026年05月包装车间/二区/B03工位设备保养月计划",
    areaName: "包装车间",
    sourceType: "年计划手动拆分",
    sourceYearPlanId: "71",
    sourceYearPlanNo: "YMP-2026-001",
    sourceYearPlanName: "2026年度设备保养计划",
    totalCount: 1,
    status: 1,
    remarks: "已复核示例",
    createBy: "系统管理员",
    createTime: "2026-05-02T01:00:00.000Z",
    updateBy: "系统管理员",
    updateTime: "2026-05-03T02:30:00.000Z",
    reviewBy: "系统管理员",
    reviewTime: "2026-05-03T02:30:00.000Z",
    voidBy: "",
    voidTime: "",
    voidReason: "",
    details: [{ equipmentId: "1002", equipmentNo: "TA-2026-002", equipmentName: "贴标机", equipmentTypeNo: "MD-002", equipmentTypeName: "自动贴标机" }],
    weekSplitStates: []
  },
  {
    id: "35",
    planNo: "MMP-202604-002",
    planMonth: "2026-04",
    planName: "2026年4月装配车间设备保养月计划",
    areaName: "装配车间",
    sourceType: "年计划手动拆分",
    sourceYearPlanId: "71",
    sourceYearPlanNo: "YMP-2026-001",
    sourceYearPlanName: "2026年度设备保养计划",
    totalCount: 2,
    status: 1,
    remarks: "补充周计划拆分假数据",
    createBy: "系统管理员",
    createTime: "2026-04-05T01:00:00.000Z",
    updateBy: "系统管理员",
    updateTime: "2026-04-06T03:30:00.000Z",
    reviewBy: "系统管理员",
    reviewTime: "2026-04-06T03:30:00.000Z",
    voidBy: "",
    voidTime: "",
    voidReason: "",
    details: [
      { equipmentId: "1005", equipmentNo: "TA-2026-005", equipmentName: "压装机", equipmentTypeNo: "MD-005", equipmentTypeName: "伺服压装机" },
      { equipmentId: "1006", equipmentNo: "TA-2026-006", equipmentName: "压装机", equipmentTypeNo: "MD-005", equipmentTypeName: "伺服压装机" }
    ],
    weekSplitStates: []
  },
  {
    id: "34",
    planNo: "MMP-202604-001",
    planMonth: "2026-04",
    planName: "2026年4月注塑车间设备保养月计划",
    areaName: "注塑车间",
    sourceType: "年计划手动拆分",
    sourceYearPlanId: "71",
    sourceYearPlanNo: "YMP-2026-001",
    sourceYearPlanName: "2026年度设备保养计划",
    totalCount: 2,
    status: 1,
    remarks: "用于周计划拆分演示",
    createBy: "系统管理员",
    createTime: "2026-04-02T01:00:00.000Z",
    updateBy: "系统管理员",
    updateTime: "2026-04-03T02:00:00.000Z",
    reviewBy: "系统管理员",
    reviewTime: "2026-04-03T02:00:00.000Z",
    voidBy: "",
    voidTime: "",
    voidReason: "",
    details: [
      { equipmentId: "1001", equipmentNo: "TA-2026-001", equipmentName: "注塑机", equipmentTypeNo: "MD-001", equipmentTypeName: "注塑机" },
      { equipmentId: "1004", equipmentNo: "TA-2026-004", equipmentName: "打标机", equipmentTypeNo: "MD-004", equipmentTypeName: "激光打标机" }
    ],
    weekSplitStates: []
  },
  {
    id: "31",
    planNo: "MMP-202603-001",
    planMonth: "2026-03",
    planName: "2026年03月注塑车间/一区/A01工位设备保养月计划",
    areaName: "注塑车间",
    sourceType: "年计划手动拆分",
    sourceYearPlanId: "71",
    sourceYearPlanNo: "YMP-2026-001",
    sourceYearPlanName: "2026年度设备保养计划",
    totalCount: 1,
    status: 0,
    remarks: "待确认设备范围",
    createBy: "系统管理员",
    createTime: "2026-03-02T01:00:00.000Z",
    updateBy: "系统管理员",
    updateTime: "2026-03-02T01:00:00.000Z",
    reviewBy: "",
    reviewTime: "",
    voidBy: "",
    voidTime: "",
    voidReason: "",
    details: [{ equipmentId: "1001", equipmentNo: "TA-2026-001", equipmentName: "注塑机", equipmentTypeNo: "MD-001", equipmentTypeName: "注塑机" }],
    weekSplitStates: []
  },
  {
    id: "33",
    planNo: "MMP-202509-001",
    planMonth: "2025-09",
    planName: "2025年09月装配车间/一区/E01工位设备保养月计划",
    areaName: "装配车间",
    sourceType: "年计划手动拆分",
    sourceYearPlanId: "72",
    sourceYearPlanNo: "YMP-2025-001",
    sourceYearPlanName: "2025年度设备保养计划",
    totalCount: 1,
    status: 2,
    remarks: "历史作废示例",
    createBy: "系统管理员",
    createTime: "2025-09-01T01:00:00.000Z",
    updateBy: "系统管理员",
    updateTime: "2025-09-12T08:00:00.000Z",
    reviewBy: "系统管理员",
    reviewTime: "2025-09-02T02:00:00.000Z",
    voidBy: "系统管理员",
    voidTime: "2025-09-12T08:00:00.000Z",
    voidReason: "历史计划失效",
    details: [{ equipmentId: "1005", equipmentNo: "TA-2026-005", equipmentName: "压装机", equipmentTypeNo: "MD-005", equipmentTypeName: "伺服压装机" }],
    weekSplitStates: []
  }
]

const equipmentMaintenanceWeekPlans = [
  {
    id: "9901",
    planNo: "WMP-20260427-001",
    naturalWeekLabel: "2026年第18周",
    planStartDate: "2026-04-27",
    planEndDate: "2026-05-03",
    planName: "2026年第18周包装车间设备保养周计划",
    areaName: "包装车间",
    sourceType: "月计划拆分",
    defaultMaintenanceTypeId: "12001",
    defaultMaintenanceTypeName: "一级保养",
    totalCount: 1,
    status: 0,
    remarks: "跨月周计划示例",
    createBy: "系统管理员",
    createTime: "2026-04-26T01:00:00.000Z",
    updateBy: "系统管理员",
    updateTime: "2026-04-26T01:00:00.000Z",
    reviewBy: "",
    reviewTime: "",
    voidBy: "",
    voidTime: "",
    voidReason: "",
    sourceMonthPlanNos: "MMP-202605-001",
    sourcePlans: [
      {
        sourceMonthPlanId: "32",
        sourceMonthPlanNo: "MMP-202605-001",
        sourceMonthPlanName: "2026年05月包装车间设备保养月计划",
        sourcePlanMonth: "2026-05"
      }
    ],
    details: [
      {
        equipmentId: "1002",
        equipmentNo: "TA-2026-002",
        equipmentName: "自动贴标机",
        equipmentTypeNo: "MD-002",
        equipmentTypeName: "自动贴标机",
        maintenanceTypeId: "12001",
        maintenanceTypeName: "一级保养",
        executionDate: "",
        remarks: ""
      }
    ]
  },
  {
    id: "9902",
    planNo: "WMP-20260330-001",
    naturalWeekLabel: "2026年第14周",
    planStartDate: "2026-03-30",
    planEndDate: "2026-04-05",
    planName: "2026年第14周注塑车间设备保养周计划",
    areaName: "注塑车间",
    sourceType: "月计划拆分",
    defaultMaintenanceTypeId: "12001",
    defaultMaintenanceTypeName: "一级保养",
    totalCount: 1,
    status: 1,
    remarks: "已复核示例",
    createBy: "系统管理员",
    createTime: "2026-03-29T01:00:00.000Z",
    updateBy: "系统管理员",
    updateTime: "2026-03-30T02:00:00.000Z",
    reviewBy: "系统管理员",
    reviewTime: "2026-03-30T02:00:00.000Z",
    voidBy: "",
    voidTime: "",
    voidReason: "",
    sourceMonthPlanNos: "MMP-202603-001",
    sourcePlans: [
      {
        sourceMonthPlanId: "31",
        sourceMonthPlanNo: "MMP-202603-001",
        sourceMonthPlanName: "2026年03月注塑车间设备保养月计划",
        sourcePlanMonth: "2026-03"
      }
    ],
    details: [
      {
        equipmentId: "1001",
        equipmentNo: "TA-2026-001",
        equipmentName: "注塑机",
        equipmentTypeNo: "MD-001",
        equipmentTypeName: "注塑机",
        maintenanceTypeId: "12001",
        maintenanceTypeName: "一级保养",
        executionDate: "2026-04-01",
        remarks: ""
      }
    ]
  }
]

const equipmentConfigRows = equipmentInfoRows.flatMap((equipment, equipmentIndex) => {
  const typeOffset = equipmentIndex * 10
  const common = {
    equipmentId: equipment.id,
    equipmentModelId: equipment.equipmentModelId,
    equipmentNo: equipment.equipmentNo,
    equipmentName: equipment.equipmentName,
    createBy: 1,
    createTime: now,
    updateBy: 1,
    updateTime: now,
    fileResource: [],
    remarks: "静态模拟设备配置"
  }
  const inspectionDepartments = [{ id: "DP-01", depName: "设备部" }]
  const ngDepartments = [{ id: "DP-01", depName: "设备部" }]

  return [
    {
      ...common,
      id: `900${typeOffset + 1}`,
      mconfigId: `MCFG-${equipment.id}-SPOT`,
      mconfigName: "安全防护检查",
      configName: "安全防护检查",
      configType: 1,
      mconfigType: 1,
      spotItem: {
        fileDesc: "",
        files: [],
        inspectionCode: `SP-${equipment.id}-01`,
        inspectionFrequency: 1,
        inspectionTiming: ["beforeShift", "duringShift"],
        inspectionName: "安全防护检查",
        inspectionStandard: standardRange("防护门关闭可靠", ""),
        method: "目视检查并确认联锁有效",
        ngDepartments,
        remarks: ""
      },
      patrolItem: {},
      maintenanceItem: {},
      specificationJson: {}
    },
    {
      ...common,
      id: `900${typeOffset + 4}`,
      mconfigId: `MCFG-${equipment.id}-SPOT-RUN`,
      mconfigName: "运行状态点检",
      configName: "运行状态点检",
      configType: 1,
      mconfigType: 1,
      spotItem: {
        fileDesc: "",
        files: [],
        inspectionCode: `SP-${equipment.id}-02`,
        inspectionFrequency: 2,
        inspectionTiming: ["beforeShift", "duringShift", "afterShift"],
        inspectionName: "运行状态点检",
        inspectionStandard: standardRange("运行平稳无报警", ""),
        method: "听音并查看设备报警状态",
        ngDepartments,
        remarks: ""
      },
      patrolItem: {},
      maintenanceItem: {},
      specificationJson: {}
    },
    {
      ...common,
      id: `900${typeOffset + 2}`,
      mconfigId: `MCFG-${equipment.id}-PATROL`,
      mconfigName: "运行状态检查",
      configName: "运行状态检查",
      configType: 2,
      mconfigType: 2,
      patrolItem: {
        fileDesc: "",
        files: [],
        inspectionCode: `CHK-${equipment.id}-02`,
        inspectionDepartments,
        inspectionFrequency: 1,
        inspectionName: "运行状态检查",
        inspectionStandard: standardRange("运行平稳无报警", ""),
        method: "听音并查看设备报警状态",
        ngDepartments,
        remarks: ""
      },
      spotItem: {},
      maintenanceItem: {},
      specificationJson: {}
    },
    {
      ...common,
      id: `900${typeOffset + 3}`,
      mconfigId: `MCFG-${equipment.id}-MAINT`,
      mconfigName: equipmentIndex === 1 ? "二级保养项目" : "一级保养项目",
      configName: equipmentIndex === 1 ? "二级保养项目" : "一级保养项目",
      configType: 3,
      mconfigType: 3,
      maintenanceItem: {
        fileDesc: "",
        fileIds: [],
        id: `MI-${equipment.id}`,
        inspectionStandard: standardRange(equipmentIndex === 1 ? "柜内无明显积尘" : "润滑均匀无异响", ""),
        maintenanceCode: `MT-${equipment.id}-01`,
        maintenanceTypeId: equipmentIndex === 1 ? "12002" : "12001",
        maintenanceTypeName: equipmentIndex === 1 ? "二级保养" : "一级保养",
        maintenanceDepartmentIds: ["DP-01"],
        maintenanceDepartments: inspectionDepartments,
        maintenanceFrequency: 1,
        maintenanceName: equipmentIndex === 1 ? "电气柜除尘" : "导轨润滑",
        method: equipmentIndex === 1 ? "断电后清洁电气柜" : "清洁后补充润滑脂",
        ngDepartmentIds: ["DP-01"],
        ngDepartments,
        remarks: ""
      },
      spotItem: {},
      patrolItem: {},
      specificationJson: {}
    }
  ]
})

const mockEquipmentFault = {
  id: "sf-device-1",
  faultId: "sf-device-1",
  faultCode: "SF-DEV-001",
  faultName: "轴承异响",
  faultType: 1,
  categoryId: "sfc-device",
  categoryName: "设备故障",
  severity: 2
}

const buildEquipmentException = (id: string, sourceType: number, task: any, overrides: Record<string, any> = {}) => ({
  id,
  taskNo: `EX-${id}`,
  taskStatus: overrides.taskStatus ?? 0,
  createBy: "Mock Admin",
  createTime: now,
  updateBy: "Mock Admin",
  updateTime: now,
  sourceType,
  sourceId: task.id,
  sourceNo: task.taskNo,
  sourceTaskId: task.id,
  sourceTaskNo: task.taskNo,
  sourceName: task.equipmentConfigName || (sourceType === 3 ? "设备保养任务" : "设备检查任务"),
  sourceItemIds: task.items?.slice(0, 1).map((item: any) => item.id) || [],
  equipmentId: task.equipmentId,
  equipmentNo: task.equipmentNo,
  equipmentName: task.equipmentName,
  equipmentTypeNo: task.equipmentTypeNo,
  equipmentTypeName: task.equipmentTypeName,
  areaName: task.areaName,
  reportUsers: [{ id: "1", empNo: "EMP001", name: "本地演示用户" }],
  exceptionHandlePositionName: "设备部 / 维修工程师",
  exceptionHandlePositionList: [{ depId: "DP-01", depName: "设备部", positionId: "POS-03", positionName: "维修工程师" }],
  assignableResponsibleUsers: [
    { id: "e3", empNo: "E003", name: "钱维修", depId: "DP-01", depName: "设备部" },
    { id: "e4", empNo: "E004", name: "孙设备", depId: "DP-01", depName: "设备部" }
  ],
  responsibleUsers: overrides.responsibleUsers || [{ id: "e3", empNo: "E003", name: "钱维修" }],
  handleUsers: overrides.handleUsers || [],
  faults: [mockEquipmentFault],
  faultDescription: overrides.faultDescription || "设备运行过程中出现异常，需要处理确认",
  analysis: overrides.analysis || "",
  solution: overrides.solution ?? "",
  solutionMeasures: overrides.solutionMeasures || "",
  deactive: 0,
  completeTime: overrides.completeTime || "",
  remarks: overrides.remarks || "静态模拟异常工单",
  attachmentFileList: [],
  ...overrides
})

const equipmentExceptionRows = [
  buildEquipmentException("SP-5101", 1, equipmentSpotTasks[0], {
    sourceName: "安全防护检查",
    faultDescription: "防护门联锁触发不稳定",
    remarks: "点检发现异常，待维修确认"
  }),
  buildEquipmentException("XJ-5001", 2, equipmentPatrolTasks[0], {
    sourceName: "运行状态检查",
    faultDescription: "主轴区域存在间歇性异响",
    analysis: "轴承润滑不足",
    solution: 1,
    solutionMeasures: "补充润滑脂并观察运行状态",
    taskStatus: 1,
    handleUsers: [{ id: "e3", empNo: "E003", name: "钱维修" }],
    completeTime: now,
    remarks: "巡检异常已处理"
  }),
  {
    analysis: "可能为日常清洁不及时，同时振镜标定偏移",
    areaName: "打码车间/三区/D06工位",
    assignableResponsibleUsers: [],
    attachmentFileList: [
      {
        id: "eq-ex-file-seed-1",
        fileId: "seed-1",
        fileName: "exception-seed-1.png",
        sourceName: "exception-seed-1.png",
        path: "/mock-upload/seed-1.png",
        extension: ".png",
        size: "1024",
        createBy: "1",
        createTime: "2026-04-27T08:20:00.000Z",
        updateBy: "1",
        updateTime: "2026-04-27T08:20:00.000Z",
        deploymentId: "",
        hash: "",
        version: "1"
      }
    ],
    completeTime: "2026-04-27T08:20:00.000Z",
    createBy: "1",
    createTime: "2026-04-27T07:10:00.000Z",
    deactive: 0,
    equipmentId: "1004",
    equipmentMaintenanceId: "22",
    equipmentMaintenanceNo: "MT-PAD-001",
    equipmentName: "打标机",
    equipmentNo: "TA-2026-004",
    equipmentRepairId: "",
    equipmentRepairNo: "",
    equipmentTypeName: "激光打标机",
    equipmentTypeNo: "MD-004",
    exceptionHandlePositionList: [{ depName: "设备部", positionName: "电气工程师" }],
    exceptionHandlePositionName: "设备部-电气工程师",
    faultDescription: "激光头表面有灰尘，打标清晰度不稳定",
    faults: [],
    handleUsers: [{ id: "e3", empNo: "E003", name: "钱维修" }],
    id: "42",
    remarks: "PAD设备保养异常工单已反馈示例",
    reportUsers: [{ id: "e3", empNo: "E003", name: "钱维修" }],
    responsibleUsers: [{ id: "e3", empNo: "E003", name: "钱维修" }],
    solution: 2,
    solutionMeasures: "已清洁激光头并重新校准振镜路径",
    sourceId: "2201",
    sourceItemIds: ["2201", "2202"],
    sourceName: "设备保养",
    sourceNo: "MT-PAD-001",
    sourceTaskId: "22",
    sourceTaskNo: "MT-PAD-001",
    sourceType: 3,
    taskNo: "EX-MT-202604-002",
    taskStatus: 1,
    updateBy: "1",
    updateTime: "2026-04-27T08:20:00.000Z"
  },
  {
    analysis: "",
    areaName: "包装车间/二区/B03工位",
    assignableResponsibleUsers: [],
    attachmentFileList: [],
    completeTime: "",
    createBy: "1",
    createTime: "2026-04-16T01:00:00.000Z",
    deactive: 0,
    equipmentId: "1002",
    equipmentMaintenanceId: "21",
    equipmentMaintenanceNo: "MT-MOCK-001",
    equipmentName: "自动贴标机",
    equipmentNo: "TA-2026-002",
    equipmentRepairId: "",
    equipmentRepairNo: "",
    equipmentTypeName: "自动贴标机",
    equipmentTypeNo: "MD-002",
    exceptionHandlePositionList: [{ depName: "制造部", positionName: "班组长" }],
    exceptionHandlePositionName: "制造部-班组长",
    faultDescription: "标签剥离张力检查项执行异常",
    faults: [],
    handleUsers: [],
    id: "41",
    remarks: "标签剥离张力检查项执行异常",
    reportUsers: [{ id: "e11", empNo: "E011", name: "刘班长" }],
    responsibleUsers: [],
    solution: "",
    solutionMeasures: "",
    sourceId: "2102",
    sourceItemIds: ["2102"],
    sourceName: "设备保养",
    sourceNo: "MT-MOCK-001",
    sourceTaskId: "21",
    sourceTaskNo: "MT-MOCK-001",
    sourceType: 3,
    taskNo: "EX-MT-202604-001",
    taskStatus: 0,
    updateBy: "1",
    updateTime: "2026-04-16T01:00:00.000Z"
  }
]

const equipmentRepairRows: any[] = [
  {
    id: "5301",
    repairNo: "WX-5301",
    repairStatus: 1,
    repairResult: 0,
    repairMode: 1,
    sourceType: 1,
    sourceNo: "XJ-5001",
    reportUnit: "注塑车间",
    reportUserId: "1",
    reportUserName: "本地演示用户",
    reportTime: now,
    contactPhone: "13800000000",
    equipmentId: "1001",
    equipmentNo: "TA-2026-001",
    equipmentName: "注塑机 120T",
    equipmentTypeName: "注塑机 120T",
    areaName: "注塑车间",
    faultCategoryId: "fault-1",
    faultCategoryName: "机械故障",
    faultLevel: 2,
    faultDesc: "运行异响",
    faultDescription: "运行时导轨区域异响，需要维修处理",
    analysis: "导轨润滑不足，局部磨损",
    solutionMeasures: "补充润滑脂并复检运行状态",
    repairUserId: "e3",
    repairUserName: "钱维修",
    responsibleUser: { id: "e3", empNo: "E003", name: "钱维修" },
    handleUser: { id: "e3", empNo: "E003", name: "钱维修" },
    handleDepartment: { id: "DP-01", depName: "设备部" },
    repairStartTime: now,
    repairEndTime: "",
    receiveTime: now,
    files: fileList,
    mroList: [],
    createTime: now,
    updateTime: now
  }
]

const equipmentScrapRows = [
  {
    id: "SC-001",
    applyNo: "SC-001",
    processDefineId: "PROC-SCRAP-001",
    processDefineName: "设备报废审批流程",
    processInstanceId: "eq-scrap-001",
    equipmentId: "1002",
    equipmentName: "自动贴标机",
    equipmentNo: "TA-2026-002",
    files: fileList,
    remarks: "本地静态设备报废申请",
    reportUsers: [{ id: "1", empNo: "EMP001", name: "本地演示用户", depName: "设备部" }],
    scrapReason: "设备老化，维修成本高",
    scrapStatus: 1,
    sourceId: "WX-5301",
    sourceNo: "WX-5301",
    sourceType: 2,
    createBy: "1",
    updateBy: "1",
    createTime: now,
    updateTime: now
  }
]

const mroTypeRows = [
  {
    id: "mt1",
    level: 1,
    nodeType: "type",
    mroTypeNo: "MROT-001",
    mroTypeName: "加工工具类",
    typeNo: "MROT-001",
    typeName: "加工工具类",
    classifyName: "加工工具类",
    mroCategoryNo: "MROT-001",
    mroCategoryName: "加工工具类",
    mroTypeId: "mt1",
    mroTypeIdSelf: "mt1",
    mroTypeNameSelf: "加工工具类",
    parentId: "0",
    parentName: "",
    verifyAdvanceDays: 3,
    maintenanceAdvanceDays: 5,
    repairProcessId: "PROC-MRO-REPAIR",
    repairProcessName: "MRO维修流程",
    scrapProcessId: "PROC-MRO-SCRAP",
    scrapProcessName: "MRO报废流程",
    exceptionHandlePositionList: [
      { depId: "d2", depName: "设备部", positionId: "p2", positionName: "保养员" }
    ],
    repairPositionList: [
      { depId: "d2", depName: "设备部", positionId: "p3", positionName: "维修员" }
    ],
    remark: "刀具、夹具、量具等加工工具",
    createBy: "1",
    updateBy: "1",
    createTime: now,
    updateTime: now
  },
  {
    id: "mt2",
    level: 1,
    nodeType: "type",
    mroTypeNo: "MROT-002",
    mroTypeName: "辅具耗材类",
    typeNo: "MROT-002",
    typeName: "辅具耗材类",
    classifyName: "辅具耗材类",
    mroCategoryNo: "MROT-002",
    mroCategoryName: "辅具耗材类",
    mroTypeId: "mt2",
    mroTypeIdSelf: "mt2",
    mroTypeNameSelf: "辅具耗材类",
    parentId: "0",
    parentName: "",
    verifyAdvanceDays: 2,
    maintenanceAdvanceDays: 7,
    repairProcessId: "PROC-MRO-REPAIR",
    repairProcessName: "MRO维修流程",
    scrapProcessId: "PROC-MRO-SCRAP",
    scrapProcessName: "MRO报废流程",
    exceptionHandlePositionList: [
      { depId: "d4", depName: "生产部", positionId: "p4", positionName: "班组长" }
    ],
    repairPositionList: [
      { depId: "d2", depName: "设备部", positionId: "p3", positionName: "维修员" }
    ],
    remark: "周转辅具、包装辅具和日常耗材",
    createBy: "1",
    updateBy: "1",
    createTime: now,
    updateTime: now
  }
]

const mroClassifyRows = [
  {
    id: "mc1",
    level: 2,
    nodeType: "classify",
    mroCategoryNo: "MROC-001",
    mroCategoryName: "刀具",
    mroTypeId: "mt1",
    mroTypeNo: "MROT-001",
    mroTypeName: "加工工具类",
    parentId: "mt1",
    parentName: "加工工具类",
    verifyAdvanceDays: 3,
    maintenanceAdvanceDays: 5,
    repairProcessId: "PROC-MRO-REPAIR",
    repairProcessName: "MRO维修流程",
    scrapProcessId: "PROC-MRO-SCRAP",
    scrapProcessName: "MRO报废流程",
    exceptionHandlePositionList: [
      { depId: "d2", depName: "设备部", positionId: "p2", positionName: "保养员" }
    ],
    repairPositionList: [
      { depId: "d2", depName: "设备部", positionId: "p3", positionName: "维修员" }
    ],
    remark: "铣刀、钻头等刀具",
    createBy: "1",
    updateBy: "1",
    createTime: now,
    updateTime: now
  },
  {
    id: "mc2",
    level: 2,
    nodeType: "classify",
    mroCategoryNo: "MROC-002",
    mroCategoryName: "夹具",
    mroTypeId: "mt1",
    mroTypeNo: "MROT-001",
    mroTypeName: "加工工具类",
    parentId: "mt1",
    parentName: "加工工具类",
    verifyAdvanceDays: 5,
    maintenanceAdvanceDays: 7,
    repairProcessId: "PROC-MRO-REPAIR",
    repairProcessName: "MRO维修流程",
    scrapProcessId: "PROC-MRO-SCRAP",
    scrapProcessName: "MRO报废流程",
    exceptionHandlePositionList: [
      { depId: "d4", depName: "生产部", positionId: "p4", positionName: "班组长" }
    ],
    repairPositionList: [
      { depId: "d2", depName: "设备部", positionId: "p3", positionName: "维修员" }
    ],
    remark: "定位夹具、压装夹具",
    createBy: "1",
    updateBy: "1",
    createTime: now,
    updateTime: now
  },
  {
    id: "mc3",
    level: 2,
    nodeType: "classify",
    mroCategoryNo: "MROC-003",
    mroCategoryName: "量具",
    mroTypeId: "mt1",
    mroTypeNo: "MROT-001",
    mroTypeName: "加工工具类",
    parentId: "mt1",
    parentName: "加工工具类",
    verifyAdvanceDays: 10,
    maintenanceAdvanceDays: 15,
    repairProcessId: "PROC-MRO-REPAIR",
    repairProcessName: "MRO维修流程",
    scrapProcessId: "PROC-MRO-SCRAP",
    scrapProcessName: "MRO报废流程",
    exceptionHandlePositionList: [
      { depId: "d1", depName: "质量部", positionId: "p1", positionName: "检验员" }
    ],
    repairPositionList: [
      { depId: "d2", depName: "设备部", positionId: "p3", positionName: "维修员" }
    ],
    remark: "检具、卡尺、塞规",
    createBy: "1",
    updateBy: "1",
    createTime: now,
    updateTime: now
  },
  {
    id: "mc4",
    level: 2,
    nodeType: "classify",
    mroCategoryNo: "MROC-004",
    mroCategoryName: "清洁耗材",
    mroTypeId: "mt2",
    mroTypeNo: "MROT-002",
    mroTypeName: "辅具耗材类",
    parentId: "mt2",
    parentName: "辅具耗材类",
    verifyAdvanceDays: 2,
    maintenanceAdvanceDays: 7,
    repairProcessId: "PROC-MRO-REPAIR",
    repairProcessName: "MRO维修流程",
    scrapProcessId: "PROC-MRO-SCRAP",
    scrapProcessName: "MRO报废流程",
    exceptionHandlePositionList: [
      { depId: "d4", depName: "生产部", positionId: "p4", positionName: "班组长" }
    ],
    repairPositionList: [
      { depId: "d2", depName: "设备部", positionId: "p3", positionName: "维修员" }
    ],
    remark: "擦拭布、清洗剂",
    createBy: "1",
    updateBy: "1",
    createTime: now,
    updateTime: now
  },
  {
    id: "mc5",
    level: 2,
    nodeType: "classify",
    mroCategoryNo: "MROC-005",
    mroCategoryName: "包装辅具",
    mroTypeId: "mt2",
    mroTypeNo: "MROT-002",
    mroTypeName: "辅具耗材类",
    parentId: "mt2",
    parentName: "辅具耗材类",
    verifyAdvanceDays: 2,
    maintenanceAdvanceDays: 7,
    repairProcessId: "PROC-MRO-REPAIR",
    repairProcessName: "MRO维修流程",
    scrapProcessId: "PROC-MRO-SCRAP",
    scrapProcessName: "MRO报废流程",
    exceptionHandlePositionList: [
      { depId: "d4", depName: "生产部", positionId: "p4", positionName: "班组长" }
    ],
    repairPositionList: [
      { depId: "d2", depName: "设备部", positionId: "p3", positionName: "维修员" }
    ],
    remark: "托盘、周转箱、包装治具",
    createBy: "1",
    updateBy: "1",
    createTime: now,
    updateTime: now
  }
]

const mroClassifyAllRows = [...mroTypeRows, ...mroClassifyRows]
const mroClassifyTreeRows = mroTypeRows.map((type) => ({
  ...type,
  children: mroClassifyRows.filter((item) => String(item.parentId) === String(type.id)).map((item) => ({
    ...item,
    children: []
  }))
}))

const mroModels = [
  {
    id: "m1",
    mroModelId: "m1",
    mroModelNo: "MRO-MD-001",
    mroModelName: "铣刀夹具",
    mroSpec: "Φ20",
    mroClassifyId: "mc1",
    mroClassifyName: "刀具",
    mroTypeId: "mt1",
    mroTypeName: "加工刀具",
    mroCategoryName: "加工刀具",
    identityManage: 1,
    checkManage: 1,
    maintenanceManage: 1,
    lifeManage: 1,
    checkExecuteDepartmentId: "d1",
    checkExecuteDepartmentName: "质量部",
    checkExecutePositionId: "p1",
    checkExecutePositionName: "检验员",
    maintenanceExecuteDepartmentId: "d2",
    maintenanceExecuteDepartmentName: "设备部",
    maintenanceExecutePositionId: "p2",
    maintenanceExecutePositionName: "保养员",
    createTime: now,
    updateTime: now
  }
]

const mroInfos = [
  {
    id: "i1",
    mroInformationId: "i1",
    mroModelId: "m1",
    mroNo: "MRO-001",
    mroName: "铣刀夹具-001",
    mroModelNo: "MRO-MD-001",
    mroModelName: "铣刀夹具",
    mroSpec: "Φ20",
    mroClassifyName: "刀具",
    mroTypeName: "加工刀具",
    mroCategoryName: "加工刀具",
    mroSerialNo: "MRO-SN-001",
    barcode: "MB-001",
    barCode: "MB-001",
    warehouseId: "1",
    warehouseName: "本地演示仓库",
    curLocation: 1,
    ledgerStatus: 1,
    currentLife: 80,
    totalLife: 100,
    createTime: now,
    updateTime: now
  }
]

const mroModelConfigStore = new Map<string, Record<string, any>>()
const mroInfoConfigStore = new Map<string, Record<string, any>>()
let mroConfigIdSeq = 1

const nextMroConfigId = (prefix: string) => `${prefix}-${++mroConfigIdSeq}`

const findMroModel = (id: string) => {
  const category = mroClassifyAllRows.find((item) => String(item.id) === String(id))
  const row = category
    ? {
        ...mroModels[0],
        id: category.id,
        mroModelId: category.id,
        mroModelNo: category.mroCategoryNo,
        mroModelName: `${category.mroCategoryName}初始化配置`,
        mroSpec: "通用",
        mroCategoryId: category.id,
        mroCategoryName: category.mroCategoryName,
        mroClassifyId: category.id,
        mroClassifyName: category.mroCategoryName,
        mroTypeId: category.mroTypeId,
        mroTypeName: category.mroTypeName,
        checkManage: 1,
        maintenanceManage: 1,
        lifeManage: 1
      }
    : mroModels.find((item) => String(item.id) === String(id)) || mroModels[0]
  if (!row) return undefined
  return {
    ...row,
    checkManage: Number(row.checkManage ?? 1),
    maintenanceManage: Number(row.maintenanceManage ?? 1),
    lifeManage: Number(row.lifeManage ?? 1),
    checkExecuteDepartmentId: String(row.checkExecuteDepartmentId || ""),
    checkExecuteDepartmentName: row.checkExecuteDepartmentName || "",
    checkExecutePositionId: String(row.checkExecutePositionId || ""),
    checkExecutePositionName: row.checkExecutePositionName || "",
    maintenanceExecuteDepartmentId: String(row.maintenanceExecuteDepartmentId || ""),
    maintenanceExecuteDepartmentName: row.maintenanceExecuteDepartmentName || "",
    maintenanceExecutePositionId: String(row.maintenanceExecutePositionId || ""),
    maintenanceExecutePositionName: row.maintenanceExecutePositionName || ""
  }
}

const normalizeCheckStandardValue = (value: Record<string, any> = {}) => {
  const standardType = Number(value.standardType || 2)
  if (standardType === 1) {
    return {
      standardType: 1,
      standardMin: value.standardMin ?? null,
      standardMinInclusive: Number(value.standardMinInclusive ?? 1),
      standardMax: value.standardMax ?? null,
      standardMaxInclusive: Number(value.standardMaxInclusive ?? 1),
      unitId: value.unitId || "",
      unitName: value.unitName || "",
      standardDesc: value.standardDesc || "",
      quantitativeMode: value.quantitativeMode,
      standardValue: value.standardValue ?? null,
      upperTolerance: value.upperTolerance ?? null,
      lowerTolerance: value.lowerTolerance ?? null,
      upperToleranceSign: value.upperToleranceSign || "+",
      lowerToleranceSign: value.lowerToleranceSign || "-"
    }
  }
  return {
    standardType: 2,
    standardDesc: value.standardDesc || ""
  }
}

const buildMockConfigFile = (id: string, fileName: string, extension: string, fileDesc = "") => ({
  id,
  deploymentId: id,
  fileId: id,
  fileName,
  sourceName: fileName,
  fileDesc: fileDesc || fileName,
  extension,
  path: "/favicon.png",
  fileSize: "1024",
  fileStatus: 1,
  documentSourceType: 2,
  createBy: "1",
  createTime: now,
  updateTime: now
})

const getDefaultMockModelConfigRows = (mroModelId: string) => {
  const normalizedModelId = String(mroModelId || "")
  const model = findMroModel(normalizedModelId)
  if (!model?.id) return []

  return [
    {
      id: `mock-verify-${model.id}-1`,
      mroItemType: 1,
      mroModelId: model.id,
      configItemName: "外观校验",
      configItemNo: "VERIFY-001",
      detectMethod: "目视检查",
      configFrequency: 7,
      fileDesc: "外观检查标准文件",
      verifyType: "day",
      verifyOrg: "质保部",
      checkStandardValue: {
        standardType: 2,
        standardDesc: "外观无缺口、无明显划痕"
      }
    },
    {
      id: `mock-verify-${model.id}-2`,
      mroItemType: 1,
      mroModelId: model.id,
      configItemName: "寿命校验",
      configItemNo: "VERIFY-002",
      detectMethod: "记录核对",
      configFrequency: 20,
      fileDesc: "寿命核对记录",
      verifyType: "count",
      verifyOrg: "设备部",
      checkStandardValue: {
        standardType: 1,
        standardMin: 0,
        standardMinInclusive: 1,
        standardMax: 100,
        standardMaxInclusive: 1,
        unitName: "次"
      }
    },
    {
      id: `mock-maintenance-${model.id}-1`,
      mroItemType: 2,
      mroModelId: model.id,
      configItemName: "外观清洁",
      configItemNo: "MT-001",
      detectMethod: "清洁保养",
      configFrequency: 2,
      fileDesc: "清洁保养作业说明",
      maintenanceType: "week",
      checkStandardValue: {
        standardType: 2,
        standardDesc: "设备状态良好"
      }
    },
    {
      id: `mock-maintenance-${model.id}-2`,
      mroItemType: 2,
      mroModelId: model.id,
      configItemName: "关键部位润滑",
      configItemNo: "MT-002",
      detectMethod: "润滑处理",
      configFrequency: 10,
      fileDesc: "润滑保养作业说明",
      maintenanceType: "count",
      checkStandardValue: {
        standardType: 2,
        standardDesc: "关键部位润滑到位"
      }
    },
    {
      id: `mock-file-${model.id}-1`,
      mroItemType: 3,
      mroModelId: model.id,
      configItemName: "维护作业指导文件",
      configItemNo: "FILE-001",
      files: [
        buildMockConfigFile(
          `mock-file-${model.id}-a`,
          `${model.mroModelName || "MRO"}-维护作业指导.pdf`,
          "pdf",
          "维护作业指导文件"
        ),
        buildMockConfigFile(
          `mock-file-${model.id}-b`,
          `${model.mroModelName || "MRO"}-设备示意图.png`,
          "png",
          "设备示意图"
        )
      ]
    }
  ]
}

const normalizeModelConfigRow = (row: Record<string, any>) => {
  const model = findMroModel(String(row?.mroModelId || "")) || { id: row?.mroModelId || "" }
  const configType = Number(row?.mroItemType || 1)
  const isVerifyConfig = configType === 1
  const isMaintenanceConfig = configType === 2
  const files = Array.isArray(row?.files) ? row.files : []
  const defaultExecuteDepartmentId = isMaintenanceConfig
    ? model.maintenanceExecuteDepartmentId
    : model.checkExecuteDepartmentId
  const defaultExecuteDepartmentName = isMaintenanceConfig
    ? model.maintenanceExecuteDepartmentName
    : model.checkExecuteDepartmentName
  const defaultExecutePositionId = isMaintenanceConfig
    ? model.maintenanceExecutePositionId
    : model.checkExecutePositionId
  const defaultExecutePositionName = isMaintenanceConfig
    ? model.maintenanceExecutePositionName
    : model.checkExecutePositionName

  return {
    id: String(row?.id || nextMroConfigId("model-cfg")),
    mroItemType: configType,
    mroModelId: String(row?.mroModelId || ""),
    mroModelName: row?.mroModelName || model.mroModelName || "",
    configItemId: row?.configItemId || "",
    configItemName: row?.configItemName || "",
    configItemNo: String(row?.configItemNo || "").trim(),
    methodRequire: row?.detectMethod || row?.methodRequire || "",
    detectMethod: row?.detectMethod || row?.methodRequire || "",
    executeDepartmentId: String(row?.executeDepartmentId || defaultExecuteDepartmentId || ""),
    executeDepartmentName: row?.executeDepartmentName || defaultExecuteDepartmentName || "",
    executePositionId: String(row?.executePositionId || defaultExecutePositionId || ""),
    executePositionName: row?.executePositionName || defaultExecutePositionName || "",
    maintenanceType: isMaintenanceConfig
      ? row?.maintenanceType === "count"
        ? "count"
        : "week"
      : row?.maintenanceType,
    configFrequency: Number(row?.configFrequency || 1),
    verifyType: isVerifyConfig ? (row?.verifyType === "count" ? "count" : "day") : row?.verifyType,
    verifyOrg: isVerifyConfig ? String(row?.verifyOrg || "") : row?.verifyOrg || "",
    remarks: row?.remarks || "",
    fileDesc: row?.fileDesc || "",
    checkStandardValue: normalizeCheckStandardValue(row?.checkStandardValue || {}),
    configDepartments: Array.isArray(row?.configDepartments) ? row.configDepartments : [],
    ngDepartments: Array.isArray(row?.ngDepartments) ? row.ngDepartments : [],
    files,
    createBy: row?.createBy || "1",
    createTime: row?.createTime || now,
    updateBy: row?.updateBy || "1",
    updateTime: now
  }
}

const getModelConfigRows = (mroModelId: string, mroItemType?: number) => {
  const rows = Array.from(mroModelConfigStore.values())
    .map(normalizeModelConfigRow)
    .filter((item) => {
      if (String(item.mroModelId || "") !== String(mroModelId || "")) return false
      if (mroItemType !== undefined && Number(item.mroItemType) !== Number(mroItemType)) return false
      return true
    })

  const sourceRows =
    rows.length > 0
      ? rows
      : getDefaultMockModelConfigRows(mroModelId)
          .map(normalizeModelConfigRow)
          .filter((item) => {
            if (mroItemType !== undefined && Number(item.mroItemType) !== Number(mroItemType)) return false
            return true
          })

  return sourceRows
}

const replaceModelConfigs = (body: Record<string, any>) => {
  const mroModelId = String(body?.id || body?.mroModelId || "")
  Array.from(mroModelConfigStore.keys()).forEach((key) => {
    const row = mroModelConfigStore.get(key)
    if (String(row?.mroModelId || "") === mroModelId) {
      mroModelConfigStore.delete(key)
    }
  })

  ;(Array.isArray(body?.data) ? body.data : []).forEach((item: Record<string, any>) => {
    const normalized = normalizeModelConfigRow({
      ...item,
      id: item?.id || nextMroConfigId("model-cfg"),
      mroModelId
    })
    mroModelConfigStore.set(String(normalized.id), normalized)
  })
}

const buildDefaultInfoConfigRows = (mroId: string) => {
  const info = mroInfos.find((item) => String(item.id) === String(mroId))
  if (!info) return []

  return getModelConfigRows(String(info.mroModelId || ""), undefined).map((item) => ({
    ...item,
    id: `info-${item.id}`,
    mroId,
    mroModelConfId: item.id
  }))
}

const getInfoConfigRows = (mroId: string, mroItemType?: number) => {
  let rows = Array.from(mroInfoConfigStore.values())
    .map((item) => normalizeModelConfigRow({ ...item, mroModelId: item.mroModelId || "" }))
    .filter((item) => String(item.mroId || "") === String(mroId || ""))

  if (rows.length === 0) {
    rows = buildDefaultInfoConfigRows(mroId)
  }

  if (mroItemType !== undefined) {
    rows = rows.filter((item) => Number(item.mroItemType) === Number(mroItemType))
  }

  return rows
}

const mroTaskItems = (taskId: string, type: "inspection" | "maintenance") => [
  {
    id: `${taskId}-item-1`,
    inspectionTaskId: taskId,
    maintenanceTaskId: taskId,
    mroItemConfigId: "mic-1",
    mroItemConfigName: type === "inspection" ? "外观校验" : "清洁保养",
    inspectionName: "外观校验",
    inspectionNo: `CHK-${taskId}-01`,
    inspectionMethod: "目视检查",
    maintenanceName: "清洁保养",
    maintenanceNo: `MNT-${taskId}-01`,
    maintenanceMethod: "清洁并涂防锈油",
    inspectionStandard: standardRange("表面无磕碰、无明显划痕", ""),
    maintenanceStandard: standardRange("表面洁净无锈蚀", ""),
    inspectionResult: 2,
    maintenanceResult: 2,
    practicalValue: "",
    remarks: "",
    inspectionTime: "",
    maintenanceTime: "",
    inspectionUsers: [],
    maintenanceUsers: [],
    files: [],
    remarkFiles: []
  },
  {
    id: `${taskId}-item-2`,
    inspectionTaskId: taskId,
    maintenanceTaskId: taskId,
    mroItemConfigId: "mic-2",
    mroItemConfigName: type === "inspection" ? "寿命校验" : "寿命复核",
    inspectionName: "寿命校验",
    inspectionNo: `CHK-${taskId}-02`,
    inspectionMethod: "记录核对",
    maintenanceName: "寿命复核",
    maintenanceNo: `MNT-${taskId}-02`,
    maintenanceMethod: "核对使用次数",
    inspectionStandard: standardRange("剩余寿命不低于20次", "次"),
    maintenanceStandard: standardRange("剩余寿命不低于20次", "次"),
    inspectionResult: 2,
    maintenanceResult: 2,
    practicalValue: "",
    remarks: "",
    inspectionTime: "",
    maintenanceTime: "",
    inspectionUsers: [],
    maintenanceUsers: [],
    files: [],
    remarkFiles: []
  }
]

const mroInspectionTasks = [
  {
    id: "6101",
    taskNo: "MRO-VERIFY-6101",
    inspectionNo: "MRO-VERIFY-6101",
    mroInformationId: "i1",
    mroModelId: "m1",
    mroNo: "MRO-001",
    mroModelNo: "MRO-MD-001",
    mroModelName: "铣刀夹具",
    mroSpec: "Φ20",
    mroClassifyName: "刀具",
    mroTypeName: "加工刀具",
    taskSource: "manual_create",
    planStartTime: now,
    departments: "质量部",
    executePosition: "质量部-检验员",
    taskStatus: 1,
    inspectionStatus: 1,
    inspectionResult: 2,
    createTime: now,
    updateTime: now,
    items: mroTaskItems("6101", "inspection")
  }
]

const mroMaintenanceTasks = [
  {
    id: "6201",
    taskNo: "MRO-MAINTAIN-6201",
    mroInformationId: "i1",
    mroModelId: "m1",
    mroNo: "MRO-001",
    mroModelNo: "MRO-MD-001",
    mroModelName: "铣刀夹具",
    mroSpec: "Φ20",
    mroClassifyName: "刀具",
    mroTypeName: "加工刀具",
    taskSource: "manual_create",
    planStartTime: now,
    departments: "设备部",
    executePosition: "设备部-保养员",
    taskStatus: 1,
    maintenanceStatus: 1,
    inspectionResult: 2,
    maintenanceResult: 2,
    createTime: now,
    updateTime: now,
    items: mroTaskItems("6201", "maintenance")
  }
]

const mroRepairRows: any[] = [
  {
    id: "6301",
    mroInformationId: "i1",
    mroModelId: "m1",
    repairNo: "MRO-RP-6301",
    repairStatus: 1,
    repairResult: 0,
    sourceType: 3,
    sourceNo: "",
    createTime: now,
    updateTime: now,
    mroNo: "MRO-001",
    barcode: "MB-001",
    mroName: "铣刀夹具-001",
    mroModelName: "铣刀夹具",
    mroModelNo: "MRO-MD-001",
    mroSpec: "Φ20",
    mroClassifyName: "刀具",
    mroCategoryName: "加工刀具",
    mroTypeName: "加工刀具",
    reportUser: { id: "1", empNo: "EMP001", name: "本地演示用户" },
    reportUserName: "本地演示用户",
    handleUser: { id: "e3", empNo: "E003", name: "钱维修" },
    responsibleUser: { id: "e3", empNo: "E003", name: "钱维修" },
    handleDepartment: { id: "DP-01", depName: "设备部" },
    handlePositionName: "维修工程师",
    handlePosition: "设备部-维修工程师",
    repairBeforeLife: 20,
    currentLife: 20,
    totalLife: 100,
    repairRound: 1,
    repairMode: 1,
    repairReason: "刀片刃口磨损，切削纹路异常",
    faultDescription: "刀片刃口磨损，切削纹路异常",
    analysis: "连续加工后寿命下降，已影响表面质量",
    solutionMeasures: "重新修磨刃口并复测寿命值",
    files: fileList,
    remarks: "本地静态 MRO 维修单"
  }
]

const mroPickupOrders = [
  {
    id: "6401",
    no: "MRO-LY-6401",
    orderNo: "MRO-LY-6401",
    status: 1,
    pickupUserName: "本地演示用户",
    warehouseId: "1",
    warehouseName: "本地演示仓库",
    mroNo: "MRO-001",
    mroName: "铣刀夹具-001",
    createTime: now,
    updateTime: now,
    items: [{ ...mroInfos[0], quantity: 1, unitName: "件" }]
  }
]

const mroReturnOrders = [
  {
    id: "6501",
    no: "MRO-GH-6501",
    orderNo: "MRO-GH-6501",
    status: 1,
    returnUserName: "本地演示用户",
    warehouseId: "1",
    warehouseName: "本地演示仓库",
    mroNo: "MRO-001",
    mroName: "铣刀夹具-001",
    createTime: now,
    updateTime: now,
    items: [{ ...mroInfos[0], quantity: 1, unitName: "件" }]
  }
]

const mroScrapRows = [
  {
    id: "6601",
    applyNo: "MRO-SC-6601",
    sourceNo: "MRO-RP-6301",
    sourceType: 4,
    scrapStatus: 1,
    scrapReason: "寿命低于安全线，申请报废",
    mroInformationId: "i1",
    mroNo: "MRO-001",
    mroModelId: "m1",
    mroModelName: "铣刀夹具",
    mroModelNo: "MRO-MD-001",
    mroClassifyName: "刀具",
    mroCategoryName: "加工刀具",
    reportUser: { id: "1", empNo: "EMP001", name: "本地演示用户" },
    reportUserDepartment: { id: "DP-01", depName: "设备部" },
    files: fileList,
    createTime: now,
    updateTime: now
  }
]

const employeeRows = users.map((user) => ({
  ...user,
  name: user.empName,
  label: `${user.empNo} / ${user.empName}`,
  value: user.empId,
  barcode: "EMP-BC-001",
  barcodeId: "emp-bc-1",
  bindNickname: user.nickname,
  bindUserId: user.userId,
  mobile: "13800000000",
  phone: "13800000000",
  email: "admin@example.com",
  status: 1,
  isEnable: true,
  createTime: now,
  updateTime: now
}))

const departmentRows = [
  {
    id: "1",
    depId: "1",
    depName: "演示部门",
    departmentName: "演示部门",
    name: "演示部门",
    label: "演示部门",
    value: "1",
    parentId: "0",
    children: []
  },
  {
    id: "DP-01",
    depId: "DP-01",
    depName: "设备部",
    departmentName: "设备部",
    name: "设备部",
    label: "设备部",
    value: "DP-01",
    parentId: "0",
    children: []
  }
]

const positionRows = [
  { id: "POS-01", positionName: "巡检员", name: "巡检员", label: "巡检员", value: "POS-01", depId: "DP-01" },
  { id: "POS-02", positionName: "保养员", name: "保养员", label: "保养员", value: "POS-02", depId: "DP-01" }
]

const orgPositions = [
  { id: "p1", name: "班长", positionName: "班长", code: "POS-001", remark: "生产班组管理", createBy: "1", createTime: now, updateBy: "1", updateTime: now },
  { id: "p2", name: "操作工", positionName: "操作工", code: "POS-002", remark: "生产一线", createBy: "1", createTime: now, updateBy: "1", updateTime: now },
  { id: "p3", name: "车间主任", positionName: "车间主任", code: "POS-003", remark: "设备及现场协调", createBy: "1", createTime: now, updateBy: "1", updateTime: now },
  { id: "p4", name: "工艺工程师", positionName: "工艺工程师", code: "POS-004", remark: "工艺路线与控制计划", createBy: "1", createTime: now, updateBy: "1", updateTime: now },
  { id: "p5", name: "质检组长", positionName: "质检组长", code: "POS-005", remark: "质量检验与问题协调", createBy: "1", createTime: now, updateBy: "1", updateTime: now },
  { id: "p6", name: "仓库组长", positionName: "仓库组长", code: "POS-006", remark: "仓储物流管理", createBy: "1", createTime: now, updateBy: "1", updateTime: now },
  { id: "p7", name: "生产主管", positionName: "生产主管", code: "POS-007", remark: "生产计划与调度", createBy: "1", createTime: now, updateBy: "1", updateTime: now },
  { id: "p8", name: "生产经理", positionName: "生产经理", code: "POS-008", remark: "生产全面管理", createBy: "1", createTime: now, updateBy: "1", updateTime: now },
  { id: "p9", name: "仓库经理", positionName: "仓库经理", code: "POS-009", remark: "仓储全面管理", createBy: "1", createTime: now, updateBy: "1", updateTime: now }
]

const orgJobs = [
  { id: "j1", jobName: "工艺员", licenseApplyProcessId: "", licenseApplyProcessName: "", licenseUnfreezeProcessId: "", licenseUnfreezeProcessName: "", createBy: "1", createTime: now, updateBy: "1", updateTime: now },
  { id: "j2", jobName: "设备维修工", licenseApplyProcessId: "", licenseApplyProcessName: "", licenseUnfreezeProcessId: "", licenseUnfreezeProcessName: "", createBy: "1", createTime: now, updateBy: "1", updateTime: now },
  { id: "j3", jobName: "计划调度员", licenseApplyProcessId: "", licenseApplyProcessName: "", licenseUnfreezeProcessId: "", licenseUnfreezeProcessName: "", createBy: "1", createTime: now, updateBy: "1", updateTime: now },
  { id: "j4", jobName: "质检员", licenseApplyProcessId: "", licenseApplyProcessName: "", licenseUnfreezeProcessId: "", licenseUnfreezeProcessName: "", createBy: "1", createTime: now, updateBy: "1", updateTime: now },
  { id: "j5", jobName: "MRO管理员", licenseApplyProcessId: "", licenseApplyProcessName: "", licenseUnfreezeProcessId: "", licenseUnfreezeProcessName: "", createBy: "1", createTime: now, updateBy: "1", updateTime: now },
  { id: "j6", jobName: "仓储员", licenseApplyProcessId: "", licenseApplyProcessName: "", licenseUnfreezeProcessId: "", licenseUnfreezeProcessName: "", createBy: "1", createTime: now, updateBy: "1", updateTime: now },
  { id: "j7", jobName: "班组长", licenseApplyProcessId: "", licenseApplyProcessName: "", licenseUnfreezeProcessId: "", licenseUnfreezeProcessName: "", createBy: "1", createTime: now, updateBy: "1", updateTime: now },
  { id: "j8", jobName: "普通员工", licenseApplyProcessId: "", licenseApplyProcessName: "", licenseUnfreezeProcessId: "", licenseUnfreezeProcessName: "", createBy: "1", createTime: now, updateBy: "1", updateTime: now }
]

const getStaticJobNo = (jobId: string) => {
  const sequence = String(jobId).replace(/\D/g, "").padStart(3, "0")
  return sequence ? `JOB-${sequence}` : String(jobId)
}

const orgLicenses = [
  { id: "l1", licenseId: "l1", licenseName: "叉车证", jobId: "j1", jobName: "工艺员", autoFreeze: 1, idleMaxDays: 90, preNoticeDays: 7, equipmentType: 1, equipmentBizIds: "", equipmentBizIdList: [], equipmentBizNames: "所有设备", createBy: "1", createTime: now, updateBy: "1", updateTime: now, equipmentModelList: [], equipmentList: [], fileResourceList: [] },
  { id: "l4", licenseId: "l4", licenseName: "低压电工证", jobId: "j2", jobName: "设备维修工", autoFreeze: 1, idleMaxDays: 90, preNoticeDays: 7, equipmentType: 1, equipmentBizIds: "", equipmentBizIdList: [], equipmentBizNames: "所有设备", createBy: "1", createTime: now, updateBy: "1", updateTime: now, equipmentModelList: [], equipmentList: [], fileResourceList: [] },
  { id: "l7", licenseId: "l7", licenseName: "生产调度员证", jobId: "j3", jobName: "计划调度员", autoFreeze: 0, idleMaxDays: 90, preNoticeDays: 7, equipmentType: 1, equipmentBizIds: "", equipmentBizIdList: [], equipmentBizNames: "所有设备", createBy: "1", createTime: now, updateBy: "1", updateTime: now, equipmentModelList: [], equipmentList: [], fileResourceList: [] },
  { id: "l11", licenseId: "l11", licenseName: "质检员资格证", jobId: "j4", jobName: "质检员", autoFreeze: 1, idleMaxDays: 90, preNoticeDays: 7, equipmentType: 1, equipmentBizIds: "", equipmentBizIdList: [], equipmentBizNames: "所有设备", createBy: "1", createTime: now, updateBy: "1", updateTime: now, equipmentModelList: [], equipmentList: [], fileResourceList: [] },
  { id: "l13", licenseId: "l13", licenseName: "MRO工具管理员证", jobId: "j5", jobName: "MRO管理员", autoFreeze: 1, idleMaxDays: 90, preNoticeDays: 7, equipmentType: 1, equipmentBizIds: "", equipmentBizIdList: [], equipmentBizNames: "所有设备", createBy: "1", createTime: now, updateBy: "1", updateTime: now, equipmentModelList: [], equipmentList: [], fileResourceList: [] },
  { id: "l15", licenseId: "l15", licenseName: "WMS仓储操作证", jobId: "j6", jobName: "仓储员", autoFreeze: 1, idleMaxDays: 90, preNoticeDays: 7, equipmentType: 1, equipmentBizIds: "", equipmentBizIdList: [], equipmentBizNames: "所有设备", createBy: "1", createTime: now, updateBy: "1", updateTime: now, equipmentModelList: [], equipmentList: [], fileResourceList: [] },
  { id: "l17", licenseId: "l17", licenseName: "班组安全员证", jobId: "j7", jobName: "班组长", autoFreeze: 0, idleMaxDays: 90, preNoticeDays: 7, equipmentType: 1, equipmentBizIds: "", equipmentBizIdList: [], equipmentBizNames: "所有设备", createBy: "1", createTime: now, updateBy: "1", updateTime: now, equipmentModelList: [], equipmentList: [], fileResourceList: [] },
  { id: "l18", licenseId: "l18", licenseName: "精益生产员工证", jobId: "j8", jobName: "普通员工", autoFreeze: 1, idleMaxDays: 90, preNoticeDays: 7, equipmentType: 1, equipmentBizIds: "", equipmentBizIdList: [], equipmentBizNames: "所有设备", createBy: "1", createTime: now, updateBy: "1", updateTime: now, equipmentModelList: [], equipmentList: [], fileResourceList: [] }
].map((item) => ({ ...item, jobNo: getStaticJobNo(item.jobId) }))

const orgDepartments = [
  { id: "d1", depId: "d1", depName: "工艺部", depCode: "DEP-001", parentDepId: null, depType: 1, remark: "产品生产工艺、控制计划过程设计与开发；减壳车间各产线工艺路线维护", createBy: "1", updateBy: "1", createTime: now, updateTime: now },
  { id: "d2", depId: "d2", depName: "设备部", depCode: "DEP-002", parentDepId: null, depType: 1, remark: "设备维修、保养、调试；输入：维修单、保养单、调机任务；输出：维修/保养/调机记录", createBy: "1", updateBy: "1", createTime: now, updateTime: now },
  { id: "d3", depId: "d3", depName: "生产部", depCode: "DEP-003", parentDepId: null, depType: 1, remark: "生产计划安排与交付；物料短缺跟踪、临时计划变更；异常返工交付", createBy: "1", updateBy: "1", createTime: now, updateTime: now },
  { id: "d4", depId: "d4", depName: "质保部", depCode: "DEP-004", parentDepId: null, depType: 1, remark: "车间质量问题收集与协调；不合格品统计分析与改进；首末检监督、在制品抽检", createBy: "1", updateBy: "1", createTime: now, updateTime: now },
  { id: "d5", depId: "d5", depName: "工具工艺室", depCode: "DEP-005", parentDepId: null, depType: 1, remark: "MRO保养；MRO采购计划、登记与领用；输出：MRO保养记录、MRO台账", createBy: "1", updateBy: "1", createTime: now, updateTime: now },
  { id: "d6", depId: "d6", depName: "仓储物流部", depCode: "DEP-006", parentDepId: null, depType: 1, remark: "原材料与外购件库存；备料、补料、退料；使用WMS管理库存", createBy: "1", updateBy: "1", createTime: now, updateTime: now },
  { id: "d31", depId: "d31", depName: "Assembly Line 1", depCode: "DEP-003-01", parentDepId: "d3", depType: 1, remark: "Assembly line work unit 1", createBy: "1", updateBy: "1", createTime: now, updateTime: now },
  { id: "d32", depId: "d32", depName: "Assembly Line 2", depCode: "DEP-003-02", parentDepId: "d3", depType: 1, remark: "Assembly line work unit 2", createBy: "1", updateBy: "1", createTime: now, updateTime: now },
  { id: "d41", depId: "d41", depName: "Incoming Inspection", depCode: "DEP-004-01", parentDepId: "d4", depType: 1, remark: "Incoming inspection work unit", createBy: "1", updateBy: "1", createTime: now, updateTime: now },
  { id: "d42", depId: "d42", depName: "Process Inspection", depCode: "DEP-004-02", parentDepId: "d4", depType: 1, remark: "Process inspection work unit", createBy: "1", updateBy: "1", createTime: now, updateTime: now }
]

const orgDepartmentPositions: Record<string, string[]> = {
  d1: ["p4"],
  d2: ["p3"],
  d3: ["p1", "p2"],
  d4: ["p5"],
  d5: ["p4"],
  d6: ["p6"],
  d31: ["p1", "p2"],
  d32: ["p1", "p2"],
  d41: ["p5"],
  d42: ["p5"]
}

const orgDepartmentTypes = [
  { depTypeName: "生产部门", depTypeNo: 5 },
  { depTypeName: "采购部门", depTypeNo: 2 },
  { depTypeName: "服务部门", depTypeNo: 3 }
]

const orgFirstLicenseByJob = (jobId: string) => orgLicenses.find((item) => item.jobId === jobId) || orgLicenses[0]

const orgEmployee = (id: string, name: string, empNo: string, depId: string, jobId: string, positionId = "p1") => {
  const dep = orgDepartments.find((item) => item.id === depId)
  const job = orgJobs.find((item) => item.id === jobId) || orgJobs[0]
  const position = orgPositions.find((item) => item.id === positionId)
  const license = orgFirstLicenseByJob(jobId)
  return {
    id,
    empId: id,
    name,
    empName: name,
    empNo,
    depId,
    depName: dep?.depName || "",
    status: 1,
    barcode: `EMP-${empNo.replace(/\D/g, "").padStart(4, "0")}`,
    barcodeId: "",
    bindNickname: id === "e1" ? "管理员" : "",
    bindUserId: id === "e1" ? "1" : "",
    bindUsername: id === "e1" ? "admin" : "",
    createBy: "1",
    createTime: now,
    updateBy: "1",
    updateTime: now,
    email: "",
    phone: "",
    remark: "",
    jobList: [job],
    positionList: position ? [position] : [],
    licenseList: license ? [license] : [],
    label: `${empNo} / ${name}`,
    value: id
  }
}

const orgEmployees = [
  orgEmployee("e1", "王工艺", "E001", "d1", "j1", "p4"),
  orgEmployee("e2", "赵工艺", "E002", "d1", "j1", "p4"),
  orgEmployee("e3", "钱维修", "E003", "d2", "j2", "p3"),
  orgEmployee("e4", "陈设备", "E004", "d2", "j2", "p3"),
  orgEmployee("e5", "孙调度", "E005", "d3", "j3", "p1"),
  orgEmployee("e6", "李质检", "E006", "d4", "j4", "p5"),
  orgEmployee("e7", "周质检", "E007", "d4", "j4", "p5"),
  orgEmployee("e8", "吴工具", "E008", "d5", "j5", "p4"),
  orgEmployee("e9", "郑仓储", "E009", "d6", "j6", "p6"),
  orgEmployee("e11", "刘班长", "E011", "d3", "j7", "p1"),
  orgEmployee("e13", "张一", "E013", "d31", "j8", "p2"),
  orgEmployee("e14", "李二", "E014", "d32", "j8", "p2")
]

const supplierRows = [
  {
    id: "sup-1",
    supplierCode: "SUP-001",
    supplierName: "演示供应商有限公司",
    supplierAbbr: "演示供应商",
    contact: "王供应",
    contactPhone: "13900000000",
    status: 1,
    createTime: now
  }
]

const customerRows = [
  {
    id: "cus-1",
    customerCode: "CUS-001",
    customerName: "演示客户有限公司",
    customerAbbr: "演示客户",
    contact: "赵客户",
    contactPhone: "13700000000",
    status: 1,
    createTime: now
  }
]

const purchaseOrders = [
  {
    id: "pur-1",
    purchaseNo: "PO-001",
    purchaseCode: "PO-001",
    orderNo: "PO-001",
    purchaseStatus: 1,
    status: 1,
    supplierId: "sup-1",
    supplierCode: "SUP-001",
    supplierName: "演示供应商有限公司",
    productModelId: "pm1",
    productModelCode: "GR-HSG-001",
    productModelName: "减速器壳体总成A型",
    purchaseQuantity: 120,
    orderQuantity: 120,
    arrivalQuantity: 30,
    inboundQuantity: 20,
    unitId: "1",
    unitName: "件",
    planArrivalTime: now,
    createTime: now,
    updateTime: now,
    details: [
      {
        id: "pur-detail-1",
        purchaseId: "pur-1",
        productModelId: "pm1",
        productModelCode: "GR-HSG-001",
        productModelName: "减速器壳体总成A型",
        purchaseQuantity: 120,
        arrivalQuantity: 30,
        inboundQuantity: 20,
        unitId: "1",
        unitName: "件"
      }
    ]
  }
]

const inventoryRows = [
  {
    id: "inv-1",
    warehouseId: "1",
    warehouseName: "本地演示仓库",
    productModelId: "pm1",
    productModelCode: "GR-HSG-001",
    productModelName: "减速器壳体总成A型",
    lotNo: "LOT-001",
    quantity: 88,
    availableQuantity: 80,
    lockedQuantity: 8,
    unitId: "1",
    unitName: "件",
    createTime: now
  }
]

const delegateOrders = [
  {
    id: "del-1",
    delegateOrderNo: "WO-001",
    orderNo: "WO-001",
    status: 1,
    supplierId: "sup-1",
    supplierName: "演示供应商有限公司",
    productionOrderId: "po-1",
    productionOrderNo: "MOCK-ORDER-001",
    productModelId: "pm1",
    productModelCode: "GR-HSG-001",
    productModelName: "减速器壳体总成A型",
    orderAmount: 20,
    completeAmount: 5,
    unitId: "1",
    unitName: "件",
    createTime: now,
    updateTime: now
  }
]

const vehicleCategoryRows = [
  { id: "0", categoryNo: "ROOT", categoryName: "全部载具分类", parentId: "", remarks: "", createTime: now, updateTime: now },
  { id: "vc-1", categoryNo: "VC-001", categoryName: "周转箱", parentId: "0", remarks: "默认类型", createTime: now, updateTime: now },
  { id: "vc-2", categoryNo: "VC-002", categoryName: "托盘", parentId: "0", remarks: "默认类型", createTime: now, updateTime: now }
]

const vehicleModelRows = [
  {
    id: "vm-1",
    modelNo: "VM-001",
    modelName: "标准周转箱",
    vehicleModelNo: "VM-001",
    vehicleModelName: "标准周转箱",
    vehicleCategoryId: "vc-1",
    vehicleCategoryName: "周转箱",
    modelStatus: 1,
    remarks: "默认型号",
    type: 1,
    modelImg: "",
    modelImgPath: "",
    repairProcdefId: "default",
    repairProcdefName: "默认审批流",
    scrapProcdefId: "mro-scrap",
    scrapProcdefName: "MRO报废流程",
    status: 1,
    createBy: "1",
    updateBy: "1",
    createTime: now,
    updateTime: now
  },
  {
    id: "vm-2",
    modelNo: "VM-002",
    modelName: "标准托盘",
    vehicleModelNo: "VM-002",
    vehicleModelName: "标准托盘",
    vehicleCategoryId: "vc-2",
    vehicleCategoryName: "托盘",
    modelStatus: 1,
    remarks: "默认型号",
    type: 2,
    modelImg: "",
    modelImgPath: "",
    repairProcdefId: "mro-repair",
    repairProcdefName: "MRO维修流程",
    scrapProcdefId: "mro-scrap",
    scrapProcdefName: "MRO报废流程",
    status: 1,
    createBy: "1",
    updateBy: "1",
    createTime: now,
    updateTime: now
  }
]

const vehicleRows = [
  {
    id: "veh-1",
    no: "V-001",
    name: "一号周转箱",
    vehicleNo: "V-001",
    vehicleName: "一号周转箱",
    vehicleModelId: "vm-1",
    vehicleModelName: "标准周转箱",
    vehicleModelNo: "VM-001",
    vehicleCategoryId: "vc-1",
    vehicleCategoryName: "周转箱",
    barcode: "VH-001",
    barcodeId: "vhb-1",
    parentId: "",
    repairProcdefId: "default",
    repairProcdefName: "默认审批流",
    scrapProcdefId: "mro-scrap",
    scrapProcdefName: "MRO报废流程",
    repairTaskStatus: "none",
    scrapTaskStatus: "none",
    ledgerStatus: "enabled",
    loadProductCount: 2,
    bindProducts: [
      {
        productId: "vp-1",
        productModelId: "pm1",
        productModelCode: "GR-HSG-001",
        productModelName: "减速器壳体总成A型",
        barcodeId: "pb-v1-001",
        barcode: "PBC-V1-001",
        defaultQuantity: 12,
        decimalNumber: 0,
        defaultUnitId: "1",
        defaultUnitName: "件"
      },
      {
        productId: "vp-2",
        productModelId: "pm2",
        productModelCode: "GR-HSG-002",
        productModelName: "减速器壳体总成B型",
        barcodeId: "pb-v1-002",
        barcode: "PBC-V1-002",
        defaultQuantity: 8,
        decimalNumber: 0,
        defaultUnitId: "1",
        defaultUnitName: "件"
      }
    ],
    status: 1,
    remarks: "默认载具",
    type: 1,
    createBy: "1",
    updateBy: "1",
    createTime: now,
    updateTime: now
  },
  {
    id: "veh-2",
    no: "V-002",
    name: "二号托盘",
    vehicleNo: "V-002",
    vehicleName: "二号托盘",
    vehicleModelId: "vm-2",
    vehicleModelName: "标准托盘",
    vehicleModelNo: "VM-002",
    vehicleCategoryId: "vc-2",
    vehicleCategoryName: "托盘",
    barcode: "VH-002",
    barcodeId: "vhb-2",
    parentId: "",
    repairProcdefId: "mro-repair",
    repairProcdefName: "MRO维修流程",
    scrapProcdefId: "mro-scrap",
    scrapProcdefName: "MRO报废流程",
    repairTaskStatus: "pending",
    scrapTaskStatus: "none",
    ledgerStatus: "enabled",
    loadProductCount: 1,
    bindProducts: [
      {
        productId: "vp-3",
        productModelId: "pm1",
        productModelCode: "GR-HSG-001",
        productModelName: "减速器壳体总成A型",
        barcodeId: "pb-v2-001",
        barcode: "PBC-V2-001",
        defaultQuantity: 20,
        decimalNumber: 0,
        defaultUnitId: "1",
        defaultUnitName: "件"
      }
    ],
    status: 1,
    remarks: "默认载具",
    type: 2,
    createBy: "1",
    updateBy: "1",
    createTime: now,
    updateTime: now
  }
]

const andonCategoryRows = [
  {
    id: "ac-1",
    categoryNo: "AC-EQ-001",
    categoryName: "设备异常",
    parentId: "0",
    remarks: "设备停机、故障、报警类Andon",
    createBy: "1",
    createTime: "2026-04-01 09:00:00",
    updateBy: "1",
    updateTime: "2026-04-01 09:00:00"
  },
  {
    id: "ac-2",
    categoryNo: "AC-MAT-002",
    categoryName: "物料异常",
    parentId: "0",
    remarks: "缺料、错料、配送异常",
    createBy: "1",
    createTime: "2026-04-01 09:10:00",
    updateBy: "1",
    updateTime: "2026-04-01 09:10:00"
  },
  {
    id: "ac-3",
    categoryNo: "AC-QLT-003",
    categoryName: "质量异常",
    parentId: "0",
    remarks: "过程质量异常",
    createBy: "1",
    createTime: "2026-04-01 09:20:00",
    updateBy: "1",
    updateTime: "2026-04-01 09:20:00"
  }
]

const sysFaultCategoryRows = [
  {
    id: "sfc-andon-1",
    categoryNo: "AFC-EQ-001",
    categoryName: "设备故障",
    faultType: 4,
    remarks: "设备类安灯故障",
    createBy: "1",
    createTime: "2026-04-01 10:00:00",
    updateBy: "1",
    updateTime: "2026-04-01 10:00:00"
  },
  {
    id: "sfc-andon-2",
    categoryNo: "AFC-MAT-002",
    categoryName: "物料故障",
    faultType: 4,
    remarks: "物料类安灯故障",
    createBy: "1",
    createTime: "2026-04-01 10:10:00",
    updateBy: "1",
    updateTime: "2026-04-01 10:10:00"
  },
  {
    id: "sfc-device-1",
    categoryNo: "DFC-MECH-001",
    categoryName: "机械故障",
    faultType: 1,
    remarks: "设备管理使用",
    createBy: "1",
    createTime: "2026-04-01 10:20:00",
    updateBy: "1",
    updateTime: "2026-04-01 10:20:00"
  }
]

const sysFaultRows = [
  {
    id: "sf-andon-1",
    faultType: 4,
    faultCategoryId: "sfc-andon-1",
    faultCategoryName: "设备故障",
    faultNo: "AF-EQ-001",
    faultName: "设备停机",
    isEnabled: true,
    remarks: "设备无法继续生产",
    createBy: "1",
    createTime: "2026-04-01 11:00:00",
    updateBy: "1",
    updateTime: "2026-04-01 11:00:00"
  },
  {
    id: "sf-andon-2",
    faultType: 4,
    faultCategoryId: "sfc-andon-1",
    faultCategoryName: "设备故障",
    faultNo: "AF-EQ-002",
    faultName: "设备异响",
    isEnabled: true,
    remarks: "运行中有异常声响",
    createBy: "1",
    createTime: "2026-04-01 11:05:00",
    updateBy: "1",
    updateTime: "2026-04-01 11:05:00"
  },
  {
    id: "sf-andon-3",
    faultType: 4,
    faultCategoryId: "sfc-andon-2",
    faultCategoryName: "物料故障",
    faultNo: "AF-MAT-001",
    faultName: "工位缺料",
    isEnabled: false,
    remarks: "线边物料不足",
    createBy: "1",
    createTime: "2026-04-01 11:10:00",
    updateBy: "1",
    updateTime: "2026-04-01 11:10:00"
  },
  {
    id: "sf-device-1",
    faultType: 1,
    faultCategoryId: "sfc-device-1",
    faultCategoryName: "机械故障",
    faultNo: "DF-MECH-001",
    faultName: "轴承异响",
    isEnabled: true,
    remarks: "设备故障基础数据",
    createBy: "1",
    createTime: "2026-04-01 11:20:00",
    updateBy: "1",
    updateTime: "2026-04-01 11:20:00"
  }
]

const andonBindFaultRows = [
  {
    id: "abf-1",
    andonId: "am-1",
    bindType: 2,
    faultCategoryId: "sfc-andon-1",
    faultCategoryName: "设备故障",
    faultId: "sf-andon-1",
    faultName: "设备停机",
    faultNo: "AF-EQ-001"
  },
  {
    id: "abf-2",
    andonId: "am-1",
    bindType: 1,
    faultCategoryId: "sfc-andon-1",
    faultCategoryName: "设备故障",
    faultId: "",
    faultName: "",
    faultNo: ""
  },
  {
    id: "abf-3",
    andonId: "am-2",
    bindType: 2,
    faultCategoryId: "sfc-andon-2",
    faultCategoryName: "物料故障",
    faultId: "sf-andon-3",
    faultName: "工位缺料",
    faultNo: "AF-MAT-001"
  }
]

const andonModelRows = [
  {
    id: "am-1",
    andonNo: "ANDON-EQ-001",
    andonName: "设备停机Andon",
    categoryId: "ac-1",
    categoryName: "设备异常",
    andonCategoryId: "ac-1",
    andonCategoryName: "设备异常",
    alarmModelId: "alarm-1",
    handlerType: 1,
    handlerIds: ["1"],
    handlerList: [{ id: "1", name: "本地演示用户" }],
    isAutoConfirm: false,
    isEnabled: true,
    status: 1,
    needAlarmModel: true,
    needFeedback: true,
    remarks: "冲压设备停机时触发",
    bindFaultList: andonBindFaultRows.filter((item) => item.andonId === "am-1"),
    createTime: "2026-04-01 13:00:00",
    updateTime: "2026-04-01 13:00:00"
  },
  {
    id: "am-2",
    andonNo: "ANDON-MAT-002",
    andonName: "工位缺料Andon",
    categoryId: "ac-2",
    categoryName: "物料异常",
    andonCategoryId: "ac-2",
    andonCategoryName: "物料异常",
    alarmModelId: "",
    handlerType: 2,
    handlerIds: ["dep-1"],
    handlerList: [{ id: "dep-1", name: "生产运营部" }],
    isAutoConfirm: true,
    isEnabled: true,
    status: 1,
    needAlarmModel: false,
    needFeedback: false,
    remarks: "线边物料不足时触发",
    bindFaultList: andonBindFaultRows.filter((item) => item.andonId === "am-2"),
    createTime: "2026-04-01 13:10:00",
    updateTime: "2026-04-01 13:10:00"
  },
  {
    id: "am-3",
    andonNo: "ANDON-QLT-003",
    andonName: "质量异常Andon",
    categoryId: "ac-3",
    categoryName: "质量异常",
    andonCategoryId: "ac-3",
    andonCategoryName: "质量异常",
    alarmModelId: "alarm-1",
    handlerType: 3,
    handlerIds: ["pos-1"],
    handlerList: [{ id: "pos-1", name: "质量工程师" }],
    isAutoConfirm: false,
    isEnabled: false,
    status: 0,
    needAlarmModel: true,
    needFeedback: true,
    remarks: "待启用的质量异常Andon",
    bindFaultList: [],
    createTime: "2026-04-01 13:20:00",
    updateTime: "2026-04-01 13:20:00"
  }
]

const andonRecordRows = [
  {
    id: "ar-1",
    no: "AR-20260401-001",
    recordNo: "AR-20260401-001",
    andonRecordNo: "AR-20260401-001",
    status: 614,
    recordStatus: 614,
    andonFeedback: 1,
    andonFeedbackId: "feedback-1",
    andonId: "am-1",
    andonNo: "ANDON-EQ-001",
    andonName: "设备停机Andon",
    andonCategoryId: "ac-1",
    andonCategoryName: "设备异常",
    andonFaultCategoryId: "sfc-andon-1",
    andonFaultCategoryName: "设备故障",
    andonFaultId: "sf-andon-1",
    andonFaultName: "设备停机",
    andonTriggerTime: "2026-04-01 14:12:00",
    triggerTime: "2026-04-01 14:12:00",
    productionTaskNo: "RW-1",
    entityId: "area-n",
    entityName: "北区",
    equipmentId: "eq-1",
    equipmentName: "冲压机-01",
    facilityId: "area-n",
    facilityName: "北区",
    workStationId: "area-n",
    workStationName: "北区",
    triggerUserName: "本地演示用户",
    faultDesc: "冲压机突然停机",
    remarks: "已维修并确认",
    createTime: "2026-04-01 14:12:00",
    updateTime: "2026-04-01 15:05:00",
    andonRecordItem: [
      {
        id: "ari-1",
        andonRecordId: "ar-1",
        type: 631,
        andonExecuteTime: "2026-04-01 14:12:00",
        entityId: "area-n",
        entityName: "北区",
        equipmentId: "eq-1",
        equipmentName: "冲压机-01",
        triggerTypeName: "手动触发",
        andonExecuteEmpId: "1",
        andonExecuteEmpName: "本地演示用户",
        andonConsumeTime: "0分钟",
        andonExecuteResult: 621,
        andonFaultName: "设备停机",
        andonFaultCategoryName: "设备故障",
        createTime: "2026-04-01 14:12:00"
      },
      {
        id: "ari-2",
        andonRecordId: "ar-1",
        type: 632,
        andonExecuteTime: "2026-04-01 14:18:00",
        entityId: "area-n",
        entityName: "北区",
        equipmentId: "eq-1",
        equipmentName: "冲压机-01",
        triggerTypeName: "手动触发",
        andonExecuteEmpId: "1",
        andonExecuteEmpName: "钱维修",
        andonConsumeTime: "6分钟",
        andonExecuteResult: 622,
        andonFaultName: "设备停机",
        andonFaultCategoryName: "设备故障",
        createTime: "2026-04-01 14:18:00"
      },
      {
        id: "ari-3",
        andonRecordId: "ar-1",
        type: 634,
        andonExecuteTime: "2026-04-01 14:56:00",
        entityId: "area-n",
        entityName: "北区",
        equipmentId: "eq-1",
        equipmentName: "冲压机-01",
        triggerTypeName: "手动触发",
        andonExecuteEmpId: "1",
        andonExecuteEmpName: "钱维修",
        andonConsumeTime: "38分钟",
        andonExecuteResult: 623,
        andonFaultName: "设备停机",
        andonFaultCategoryName: "设备故障",
        createTime: "2026-04-01 14:56:00"
      },
      {
        id: "ari-4",
        andonRecordId: "ar-1",
        type: 633,
        andonExecuteTime: "2026-04-01 15:05:00",
        entityId: "area-n",
        entityName: "北区",
        equipmentId: "eq-1",
        equipmentName: "冲压机-01",
        triggerTypeName: "手动触发",
        andonExecuteEmpId: "1",
        andonExecuteEmpName: "本地演示用户",
        andonConsumeTime: "9分钟",
        andonExecuteResult: 623,
        andonFaultName: "设备停机",
        andonFaultCategoryName: "设备故障",
        createTime: "2026-04-01 15:05:00"
      }
    ]
  },
  {
    id: "ar-2",
    no: "AR-20260401-002",
    recordNo: "AR-20260401-002",
    andonRecordNo: "AR-20260401-002",
    status: 612,
    recordStatus: 612,
    andonFeedback: 0,
    andonFeedbackId: "",
    andonId: "am-2",
    andonNo: "ANDON-MAT-002",
    andonName: "工位缺料Andon",
    andonCategoryId: "ac-2",
    andonCategoryName: "物料异常",
    andonFaultCategoryId: "sfc-andon-2",
    andonFaultCategoryName: "物料故障",
    andonFaultId: "sf-andon-3",
    andonFaultName: "工位缺料",
    andonTriggerTime: "2026-04-01 15:30:00",
    triggerTime: "2026-04-01 15:30:00",
    productionTaskNo: "RW-2",
    entityId: "area-s",
    entityName: "南区",
    equipmentId: "",
    equipmentName: "",
    facilityId: "area-s",
    facilityName: "南区",
    workStationId: "area-s",
    workStationName: "南区",
    triggerUserName: "本地演示用户",
    faultDesc: "线边紧固件包不足",
    remarks: "处理中",
    createTime: "2026-04-01 15:30:00",
    updateTime: "2026-04-01 15:42:00",
    andonRecordItem: [
      {
        id: "ari-5",
        andonRecordId: "ar-2",
        type: 631,
        andonExecuteTime: "2026-04-01 15:30:00",
        entityId: "area-s",
        entityName: "南区",
        equipmentId: "",
        equipmentName: "",
        triggerTypeName: "手动触发",
        andonExecuteEmpId: "1",
        andonExecuteEmpName: "本地演示用户",
        andonConsumeTime: "0分钟",
        andonExecuteResult: 621,
        andonFaultName: "工位缺料",
        andonFaultCategoryName: "物料故障",
        createTime: "2026-04-01 15:30:00"
      }
    ]
  }
]

const alarmRows = [
  {
    id: "alarm-1",
    alarmModelNo: "ALM-001",
    alarmModelName: "设备停机报警",
    modelNo: "ALM-001",
    modelName: "设备停机报警",
    alarmType: 1,
    status: 1,
    isEnabled: true,
    totalLevel: 2,
    remarks: "Andon超时未处理时通知",
    createTime: now
  }
]

const codeRows = [
  { id: "code-1", codeModelNo: "CODE-001", codeModelName: "产品条码规则", moduleName: "产品", codeTypeName: "产品条码", status: 1, createTime: now }
]

const barcodeRows = [
  { id: "barcode-1", barcode: "BC-DEMO-001", bizTypeName: "产品", productModelName: "减速器壳体总成A型", status: 1, createTime: now }
]

const inspectCategoryRows = [
  { id: "ic-1", categoryCode: "IC-001", categoryName: "尺寸类", parentId: "0", enabledStatus: true, createTime: now, children: [] }
]

const inspectTemplateRows = [
  {
    id: "it-1",
    templateCode: "IT-001",
    templateName: "通用尺寸检验模板",
    categoryName: "尺寸类",
    enabledStatus: true,
    inspectItemList: qualitySampleItems("901", "01", 1),
    createTime: now
  }
]

const reportRows = [
  {
    id: "report-1",
    date: "2026-07-01",
    reportDate: "2026-07-01",
    productModelCode: "GR-HSG-001",
    productModelName: "减速器壳体总成A型",
    planQuantity: 120,
    completeQuantity: 96,
    completionRate: 80,
    inspectQuantity: 30,
    unqualifiedQuantity: 2,
    unqualifiedRate: 6.67,
    purchaseQuantity: 120,
    arrivalQuantity: 100,
    arrivalRate: 83.33,
    createTime: now
  }
]

const qualityUnqualifiedRateTotalRows = [
  {
    id: "qurt-1",
    decimalNumber: 2,
    index: 1,
    productionArea: "本地演示工厂",
    productionCount: 120,
    qualifiedCount: 116,
    unitName: "件",
    unqualifiedCount: 4,
    unqualifiedRate: 3.33
  },
  {
    id: "qurt-2",
    decimalNumber: 2,
    index: 2,
    productionArea: "装配一线",
    productionCount: 80,
    qualifiedCount: 78,
    unitName: "件",
    unqualifiedCount: 2,
    unqualifiedRate: 2.5
  }
]

const qualityUnqualifiedRateDetailRows = [
  {
    id: "qurd-1",
    decimalNumber: 2,
    drawingNumber: "DRW-GR-HSG-001",
    index: 1,
    productCode: "GR-HSG-001",
    productName: "减速器壳体总成A型",
    productionArea: "本地演示工厂",
    productionOrder: "MOCK-ORDER-001",
    productionQty: 120,
    qualifiedQty: 116,
    specification: "A型",
    unitName: "件",
    unqualifiedQty: 4
  },
  {
    id: "qurd-2",
    decimalNumber: 2,
    drawingNumber: "DRW-GR-HSG-002",
    index: 2,
    productCode: "GR-HSG-002",
    productName: "减速器壳体总成B型",
    productionArea: "装配一线",
    productionOrder: "MOCK-ORDER-002",
    productionQty: 80,
    qualifiedQty: 78,
    specification: "B型",
    unitName: "件",
    unqualifiedQty: 2
  }
]

const dailyCompletionRateRows = [
  {
    id: "dcr-1",
    completionRate: 86.67,
    facilityName: "本地演示工厂",
    facilityId: "1",
    time: "2026-07-01"
  },
  {
    id: "dcr-2",
    completionRate: 75,
    facilityName: "装配一线",
    facilityId: "2",
    time: "2026-07-01"
  }
]

const dailyCompletionRateDetailRows = [
  {
    id: "dcrd-1",
    completedQuantity: 26,
    completionRate: 86.67,
    orderNo: "MOCK-ORDER-001",
    plannedQuantity: 30,
    productModelName: "减速器壳体总成A型",
    productModelNo: "GR-HSG-001",
    taskNo: "RW-1",
    unitName: "件"
  },
  {
    id: "dcrd-2",
    completedQuantity: 30,
    completionRate: 75,
    orderNo: "MOCK-ORDER-002",
    plannedQuantity: 40,
    productModelName: "减速器壳体总成B型",
    productModelNo: "GR-HSG-002",
    taskNo: "RW-2",
    unitName: "件"
  }
]

const planProductionRateDetailRows = [
  {
    id: "pprd-1",
    completeQty: 26,
    completionRate: 86.67,
    date: "2026-07-01",
    entityIds: ["1"],
    entityName: "本地演示工厂",
    planProcessingQty: 30,
    planStartTime: "2026-07-01 08:30:00",
    productCode: "GR-HSG-001",
    productName: "减速器壳体总成A型",
    remark: "本地静态演示",
    taskId: "task-1"
  },
  {
    id: "pprd-2",
    completeQty: 30,
    completionRate: 75,
    date: "2026-07-01",
    entityIds: ["2"],
    entityName: "装配一线",
    planProcessingQty: 40,
    planStartTime: "2026-07-01 13:30:00",
    productCode: "GR-HSG-002",
    productName: "减速器壳体总成B型",
    remark: "本地静态演示",
    taskId: "task-2"
  }
]

const planProductionRateTotalRows = [
  {
    id: "pprt-1",
    entityName: "本地演示工厂",
    monthCompletionRate: [{ monthCompletionRate: 86.67, monthDate: "2026年07月" }],
    yearCompletionRate: [{ yearCompletionRate: 82.5, year: "2026年" }]
  },
  {
    id: "pprt-2",
    entityName: "装配一线",
    monthCompletionRate: [{ monthCompletionRate: 75, monthDate: "2026年07月" }],
    yearCompletionRate: [{ yearCompletionRate: 79.8, year: "2026年" }]
  }
]

const purchaseArrivalRateRows = [
  {
    id: "par-1",
    actualArrivalTime: "2026-07-01 09:20:00",
    arrivalQuantity: 100,
    closingTime: "2026-07-01 10:00:00",
    diffDays: 0,
    drawingNumber: "DRW-MAT-001",
    expectedArrivalTime: "2026-07-01 12:00:00",
    index: 1,
    productName: "铝合金毛坯",
    productNo: "MAT-AL-001",
    purchaseOrderNo: "PUR-20260701-001",
    purchaseQuantity: 100,
    specification: "A型",
    status: "按期到货",
    supplierCode: "SUP-001",
    supplierName: "演示供应商有限公司",
    unitName: "件"
  },
  {
    id: "par-2",
    actualArrivalTime: "2026-07-02 15:30:00",
    arrivalQuantity: 20,
    closingTime: "2026-07-02 16:00:00",
    diffDays: 1,
    drawingNumber: "DRW-MAT-002",
    expectedArrivalTime: "2026-07-01 18:00:00",
    index: 2,
    productName: "标准紧固件",
    productNo: "MAT-BOLT-001",
    purchaseOrderNo: "PUR-20260701-002",
    purchaseQuantity: 30,
    specification: "M8",
    status: "超期到货",
    supplierCode: "SUP-002",
    supplierName: "本地辅料供应商",
    unitName: "套"
  }
]

const purchaseArrivalRateTotal = {
  onTimeArrivalItemCount: 1,
  onTimeArrivalRate: 50,
  onTimeNotArrivalItemCount: 0,
  overdueArrivalItemCount: 1,
  overdueNotArrivalItemCount: 0,
  targetOverdueArrivalRate: 95,
  totalPurchaseOrderItemCount: 2
}

const getOrderScheduledQuantity = (orderId: string) =>
  state.productionTasks
    .filter((task) => String(task.productionOrderId) === String(orderId) && Number(task.status) !== 251)
    .reduce((sum, task) => sum + Number(task.taskAmount || 0), 0)

const withComputedOrderFields = (order: any) => {
  if (!order) return order
  const scheduledQuantity =
    order.scheduledQuantity !== undefined ? Number(order.scheduledQuantity || 0) : getOrderScheduledQuantity(order.id)
  // 为所有订单生成日计划单号（此页面为生产日计划，所有记录都已拆分）
  // 根据订单创建时间和ID生成日计划单号
  const createTime = order.createTime || ""
  const dateMatch = createTime.match(/^(\d{4})-(\d{2})-(\d{2})/)
  let dailyPlanNo = ""
  if (dateMatch) {
    const dateStr = dateMatch[1] + dateMatch[2] + dateMatch[3]
    // 使用订单ID生成序号
    const idNum = order.id ? parseInt(order.id.replace(/\D/g, "")) || Math.abs(order.id.charCodeAt(0)) : 1
    const seq = String(idNum % 1000).padStart(3, "0")
    dailyPlanNo = `DP${dateStr}${seq}`
  } else {
    // 如果没有创建时间，使用默认格式
    dailyPlanNo = `DP202609${String(Math.abs(order.id?.charCodeAt(0) || 1) % 1000).padStart(3, "0")}`
  }
  // 根据ERP工单号自动判断来源：有ERP工单号则为ERP来源，否则为MES来源
  const source = order.saleCode && order.saleCode.trim() ? 2 : 1
  // 自动调整生产进度与工单状态保持一致
  // 未复核(5)：生产进度必须为0；作废(3)：生产进度为0；其他状态（已复核1、结案9）：保持原值
  const status = order.status ? Number(order.status) : 5
  let productionProgress = Number(order.productionProgress) || 0
  if (status === 5) {
    // 未复核状态，生产进度必须为0
    productionProgress = 0
  } else if (status === 3) {
    // 作废状态，生产进度为0
    productionProgress = 0
  }
  // 已复核(1)和结案(9)状态保持原值
  return {
    ...order,
    dailyPlanNo,
    source,
    productionProgress,
    scheduledQuantity,
    planAmount: scheduledQuantity,
    techProcess:
      order.techProcess && Object.keys(order.techProcess || {}).length
        ? order.techProcess
        : order.techProcessId
          ? defaultTechProcess(order.techProcessId)
          : {}
  }
}

const readDynamicFilterValue = (input: any) => {
  if (input && typeof input === "object" && !Array.isArray(input)) {
    if (Object.prototype.hasOwnProperty.call(input, "value")) return input.value
    if (Object.prototype.hasOwnProperty.call(input, "startTime")) {
      return [input.startTime || "", input.endTime || ""]
    }
  }
  return input
}

const hasFilterValue = (value: any) => {
  if (value === undefined || value === null) return false
  if (Array.isArray(value)) return value.some((item) => item !== undefined && item !== null && item !== "")
  return String(value).trim() !== ""
}

const stringIncludes = (value: unknown, keyword: unknown) => {
  const text = String(value ?? "").toLowerCase()
  const needle = String(keyword ?? "").trim().toLowerCase()
  return !needle || text.includes(needle)
}

const numberInFilter = (value: unknown, filterValue: unknown) => {
  if (!hasFilterValue(filterValue)) return true
  const values = Array.isArray(filterValue) ? filterValue : [filterValue]
  return values.map((item) => Number(item)).includes(Number(value))
}

const inTimeRange = (value: unknown, filterValue: unknown) => {
  if (!Array.isArray(filterValue)) return true
  const [start, end] = filterValue
  const current = String(value || "")
  if (start && current < String(start)) return false
  if (end && current > String(end)) return false
  return true
}

const getQueryValue = (queryParam: Record<string, any>, ...keys: string[]) => {
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(queryParam || {}, key)) continue
    const value = readDynamicFilterValue(queryParam[key])
    if (hasFilterValue(value)) return value
  }
  return undefined
}

const filterProductInOutRows = (rows: any[], queryParam: Record<string, any> = {}) =>
  rows.filter((row) => {
    const barcode = getQueryValue(queryParam, "barcode")
    if (barcode !== undefined && !stringIncludes(row.barcode, barcode)) return false

    const productName = getQueryValue(queryParam, "productName", "productModelName")
    if (productName !== undefined && !stringIncludes(row.productModelName, productName)) return false

    const locationId = getQueryValue(queryParam, "locationId", "locationIdStr")
    if (locationId !== undefined) {
      const values = String(locationId).split(",").filter(Boolean)
      if (values.length && !values.includes(String(row.locationId))) return false
    }

    const inboundType = getQueryValue(queryParam, "inboundType")
    if (inboundType !== undefined && !numberInFilter(row.inboundType, inboundType)) return false

    const outboundType = getQueryValue(queryParam, "outboundType")
    if (outboundType !== undefined && !numberInFilter(row.outboundType, outboundType)) return false

    return true
  })

const filterProductBatchRows = (queryParam: Record<string, any> = {}) =>
  productBatchRows.filter((row) => {
    const batchNo = getQueryValue(queryParam, "batchNo")
    if (batchNo !== undefined && !stringIncludes(row.batchNo, batchNo)) return false

    const batchType = getQueryValue(queryParam, "batchType")
    if (batchType !== undefined && !numberInFilter(row.batchType, batchType)) return false

    const productModelName = getQueryValue(queryParam, "productModelName")
    if (productModelName !== undefined && !stringIncludes(row.productModelName, productModelName)) return false

    const productModelCode = getQueryValue(queryParam, "productModelCode")
    if (productModelCode !== undefined && !stringIncludes(row.productModelCode, productModelCode)) return false

    const productionOrderNo = getQueryValue(queryParam, "productionOrderNo")
    if (productionOrderNo !== undefined && !stringIncludes(row.productionInfo?.productionOrderNo, productionOrderNo)) return false

    const processSerial = getQueryValue(queryParam, "processSerial", "techVersionNo")
    if (
      processSerial !== undefined &&
      !stringIncludes(row.productionInfo?.processSerial || row.productionInfo?.techVersionNo, processSerial)
    ) {
      return false
    }

    return true
  })

const filterProductScrapRows = (queryParam: Record<string, any> = {}) =>
  productScrapRows.filter((row) => {
    const scrapRecordNo = getQueryValue(queryParam, "scrapRecordNo", "no")
    if (scrapRecordNo !== undefined && !stringIncludes(row.no, scrapRecordNo)) return false

    const vehicleBarcode = getQueryValue(queryParam, "vehicleBarcode")
    if (vehicleBarcode !== undefined && !stringIncludes(row.vehicleBarcodes, vehicleBarcode)) return false

    const productModelCode = getQueryValue(queryParam, "productModeCode", "productModelCode")
    if (productModelCode !== undefined && !row.productList.some((item: any) => stringIncludes(item.productModelCode, productModelCode))) return false

    const productModelName = getQueryValue(queryParam, "productModeName", "productModelName")
    if (productModelName !== undefined && !row.productList.some((item: any) => stringIncludes(item.productModelName, productModelName))) return false

    return true
  })

const filterProductionOrders = (rows: any[], queryParam: Record<string, any> = {}) =>
  rows.filter((row) => {
    // 日计划单号过滤
    const dailyPlanNo = getQueryValue(queryParam, "dailyPlanNo")
    if (dailyPlanNo !== undefined && !stringIncludes(row.dailyPlanNo, dailyPlanNo)) return false

    const no = getQueryValue(queryParam, "no")
    if (no !== undefined && !stringIncludes(row.no, no)) return false

    const saleCode = getQueryValue(queryParam, "saleCode")
    if (saleCode !== undefined && !stringIncludes(row.saleCode, saleCode)) return false

    const type = getQueryValue(queryParam, "type", "types")
    if (type !== undefined && !numberInFilter(row.type, type)) return false

    const source = getQueryValue(queryParam, "source")
    if (source !== undefined && !numberInFilter(row.source, source)) return false

    const status = getQueryValue(queryParam, "status", "statusList")
    if (status !== undefined && !numberInFilter(row.status, status)) return false

    // 生产进度过滤：0-未开始，1-部分完成，2-全部完成
    const productionProgress = getQueryValue(queryParam, "productionProgress")
    if (productionProgress !== undefined) {
      let rowProgress = 0
      if (!row.productionProgress || row.productionProgress === 0) rowProgress = 0
      else if (row.productionProgress >= 1) rowProgress = 2
      else rowProgress = 1
      if (rowProgress !== Number(productionProgress)) return false
    }

    const productModelName = getQueryValue(queryParam, "productModelName")
    if (productModelName !== undefined && !stringIncludes(row.productModelName, productModelName)) return false

    const productModelCode = getQueryValue(queryParam, "productModelCode", "productModelNo")
    if (productModelCode !== undefined && !stringIncludes(row.productModelCode, productModelCode)) return false

    const deliveryDate = getQueryValue(queryParam, "deliveryDate")
    if (deliveryDate !== undefined && !inTimeRange(row.deliveryDate, deliveryDate)) return false

    const createTime = getQueryValue(queryParam, "createTime")
    if (createTime !== undefined && !inTimeRange(row.createTime, createTime)) return false

    const remark = getQueryValue(queryParam, "remark")
    if (remark !== undefined && !stringIncludes(row.remark, remark)) return false

    return true
  })

const productionOrderSortFieldMap: Record<string, string> = {
  no: "no",
  type: "type",
  source: "source",
  status: "status",
  product_model_name: "productModelName",
  product_model_code: "productModelCode",
  delivery_date: "deliveryDate",
  create_time: "createTime"
}

const sortProductionOrders = (rows: any[], sort: any[] = []) => {
  const sortList = Array.isArray(sort) ? sort.filter((item) => item?.order) : []
  if (!sortList.length) return rows

  return [...rows].sort((a, b) => {
    for (const item of sortList) {
      const field = productionOrderSortFieldMap[item.sortField] || item.filedName || item.fieldName
      const direction = String(item.order).toLowerCase() === "asc" ? 1 : -1
      const av = a?.[field]
      const bv = b?.[field]
      if (av === bv) continue
      if (av === undefined || av === null) return 1
      if (bv === undefined || bv === null) return -1
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * direction
      return String(av).localeCompare(String(bv), "zh-Hans-CN", { numeric: true }) * direction
    }
    return 0
  })
}

const queryProductionOrderRows = (body: any = {}) => {
  const rows = state.productionOrders.map(withComputedOrderFields)
  return sortProductionOrders(filterProductionOrders(rows, body?.queryParam || {}), body?.sort || [])
}

const normalizeSchedulingRule = (rule: any = {}, index = 0, ownerId = "rule") => ({
  id: rule.id || `${ownerId}-rule-${index + 1}`,
  cycleType: Number(rule.cycleType || 2),
  rotationId: rule.rotationId || (index % 2 === 0 ? "r-1" : "r-2"),
  weeklyRule: Array.isArray(rule.weeklyRule) && rule.weeklyRule.length ? rule.weeklyRule : index % 2 === 0 ? [1, 2, 3, 4, 5] : [6, 7],
  teamId: rule.teamId || (index % 2 === 0 ? "tm-1" : "tm-2")
})

const normalizeSchedulingTeam = (team: any = {}) => {
  const leaderList =
    Array.isArray(team.leaderList) && team.leaderList.length
      ? team.leaderList
      : (Array.isArray(team.leaderIds) ? team.leaderIds : []).map((id: string) => {
          const employee = employeeRows.find((item) => String(item.empId || item.id) === String(id))
          return { id: String(id), name: employee?.empName || employee?.name || String(id) }
        })
  return {
    ...team,
    leaderList,
    leaderNames: leaderList.map((item: any) => item.name).filter(Boolean).join(",")
  }
}

const enrichSchedulingRecord = (record: any = {}) => {
  const rotation: any = state.schedulingRotations.find((item: any) => String(item.id) === String(record.rotationId)) || {}
  const team = normalizeSchedulingTeam(
    state.schedulingTeams.find((item: any) => String(item.id) === String(record.teamId)) || {}
  )
  return {
    ...record,
    rotationCode: rotation.rotationCode || "",
    rotationName: rotation.rotationName || "",
    startTime: rotation.startTime || record.startTime || "",
    endTime: rotation.endTime || record.endTime || "",
    teamCode: team.teamCode || "",
    teamName: team.teamName || "",
    memberNumber: team.memberNumber ?? record.memberNumber ?? 0,
    leaderList: team.leaderList || []
  }
}

const filterSchedulingPlans = (body: any = {}) => {
  const unitIds = Array.isArray(body.productionUnitIdList) ? body.productionUnitIdList.map(String) : []
  return state.schedulingPlans.filter((row: any) => {
    if (unitIds.length && !unitIds.includes(String(row.productionUnitId))) return false
    if (body.schedulingName && !String(row.schedulingName || "").includes(String(body.schedulingName))) return false
    if (body.startDate && String(row.startDate || "") < String(body.startDate)) return false
    if (body.endDate && String(row.endDate || "") > String(body.endDate)) return false
    return true
  })
}

const resolveSchedulingStatic = (path: string, data: any, method: StaticMethod, pageNum: number, pageSize: number) => {
  if (path === "/scheduling/rotation" && method === "get") return state.schedulingRotations
  if (path === "/scheduling/rotation/enabled" && method === "get") {
    return state.schedulingRotations.filter((item: any) => Number(item.rotationStatus) === 1)
  }
  if (path === "/scheduling/rotation" && method === "post") {
    const id = nextId("r")
    const startTime = data.startTime || "08:00"
    const endTime = data.endTime || "20:00"
    state.schedulingRotations.push({
      id,
      rotationCode: data.rotationCode || `BC${idSeq}`,
      rotationName: data.rotationName || "新班次",
      rotationStatus: Number(data.rotationStatus ?? 1),
      remark: data.remark || "",
      rotationTime: `${startTime}-${endTime}`,
      startTime,
      endTime,
      createTime: now,
      updateTime: now
    })
    return null
  }
  const rotationById = path.match(/^\/scheduling\/rotation\/([^/]+)$/)
  if (rotationById && method === "put") {
    const id = String(rotationById[1])
    state.schedulingRotations = state.schedulingRotations.map((item: any) => {
      if (String(item.id) !== id) return item
      const startTime = data.startTime || item.startTime
      const endTime = data.endTime || item.endTime
      return { ...item, ...data, startTime, endTime, rotationTime: `${startTime}-${endTime}`, updateTime: now }
    })
    return null
  }
  if (rotationById && method === "delete") {
    const id = String(rotationById[1])
    state.schedulingRotations = state.schedulingRotations.filter((item: any) => String(item.id) !== id)
    return null
  }
  const rotationSwitch = path.match(/^\/scheduling\/rotation\/([^/]+)\/(enable|disable)$/)
  if (rotationSwitch && method === "put") {
    const id = String(rotationSwitch[1])
    state.schedulingRotations = state.schedulingRotations.map((item: any) =>
      String(item.id) === id ? { ...item, rotationStatus: rotationSwitch[2] === "enable" ? 1 : 0, updateTime: now } : item
    )
    return null
  }
  if (/^\/scheduling\/rotation\/[^/]+\/stopPeriod$/.test(path) && method === "get") return []

  if (path === "/scheduling/team" && method === "get") return state.schedulingTeams.map(normalizeSchedulingTeam)
  if (path === "/scheduling/team/enabled" && method === "get") {
    return state.schedulingTeams.filter((item: any) => Number(item.teamStatus) === 1).map(normalizeSchedulingTeam)
  }
  if (path === "/scheduling/team" && method === "post") {
    const id = nextId("tm")
    state.schedulingTeams.push(
      normalizeSchedulingTeam({
        id,
        teamName: data.teamName || "新班组",
        teamCode: data.teamCode || `G${idSeq}`,
        teamStatus: 1,
        memberNumber: Number(data.memberNumber || 0),
        leaderIds: Array.isArray(data.leaderIds) ? data.leaderIds : [],
        remark: data.remark || "",
        createTime: now,
        updateTime: now
      })
    )
    return null
  }
  const teamById = path.match(/^\/scheduling\/team\/([^/]+)$/)
  if (teamById && method === "put") {
    const id = String(teamById[1])
    state.schedulingTeams = state.schedulingTeams.map((item: any) =>
      String(item.id) === id ? normalizeSchedulingTeam({ ...item, ...data, updateTime: now }) : item
    )
    return null
  }
  if (teamById && method === "delete") {
    const id = String(teamById[1])
    state.schedulingTeams = state.schedulingTeams.filter((item: any) => String(item.id) !== id)
    return null
  }
  const teamSwitch = path.match(/^\/scheduling\/team\/([^/]+)\/(enable|disable)$/)
  if (teamSwitch && method === "put") {
    const id = String(teamSwitch[1])
    state.schedulingTeams = state.schedulingTeams.map((item: any) =>
      String(item.id) === id ? { ...item, teamStatus: teamSwitch[2] === "enable" ? 1 : 0, updateTime: now } : item
    )
    return null
  }

  if (path === "/scheduling/schedule/search" && method === "post") return page(filterSchedulingPlans(data), pageNum, pageSize)
  if (path === "/scheduling/schedule" && method === "post") {
    const unitIds = Array.isArray(data.productionUnitIdList) ? data.productionUnitIdList : []
    unitIds.forEach((productionUnitId: string) => {
      const id = nextId("sc")
      state.schedulingPlans.push({
        id,
        schedulingName: data.schedulingName || "新排班计划",
        schedulingCode: data.schedulingCode || `PB${idSeq}`,
        startDate: data.startDate || "",
        endDate: data.endDate || "",
        productionUnitId,
        remark: data.remark || "",
        status: 1,
        createTime: now,
        updateTime: now,
        detailList: (Array.isArray(data.detailList) ? data.detailList : []).map((item: any, index: number) =>
          normalizeSchedulingRule({ ...item, id: item?.id || `${id}-record-${index + 1}` }, index, id)
        )
      })
    })
    return null
  }
  const scheduleRecord = path.match(/^\/scheduling\/schedule\/([^/]+)\/shiftRecord$/)
  if (scheduleRecord && method === "get") {
    const schedule = state.schedulingPlans.find((item: any) => String(item.id) === String(scheduleRecord[1]))
    return (schedule?.detailList || []).map(enrichSchedulingRecord)
  }

  if (path === "/scheduling/model" && method === "get") return state.schedulingModels
  if (path === "/scheduling/model" && method === "post") {
    const id = nextId("sm")
    state.schedulingModels.push({
      id,
      modelName: data.modelName || "新排班模型",
      modelCode: `SM-${idSeq}`,
      remark: data.remark || "",
      createTime: now,
      updateTime: now,
      ruleList: (Array.isArray(data.ruleList) ? data.ruleList : []).map((item: any, index: number) =>
        normalizeSchedulingRule({ ...item, id: item?.id || `${id}-rule-${index + 1}` }, index, id)
      )
    })
    return null
  }
  const modelById = path.match(/^\/scheduling\/model\/([^/]+)$/)
  if (modelById && method === "put") {
    const id = String(modelById[1])
    state.schedulingModels = state.schedulingModels.map((item: any) =>
      String(item.id) === id
        ? {
            ...item,
            ...data,
            ruleList: Array.isArray(data.ruleList)
              ? data.ruleList.map((rule: any, index: number) =>
                  normalizeSchedulingRule({ ...rule, id: rule?.id || `${id}-rule-${index + 1}` }, index, id)
                )
              : item.ruleList,
            updateTime: now
          }
        : item
    )
    return null
  }
  if (modelById && method === "delete") {
    const id = String(modelById[1])
    state.schedulingModels = state.schedulingModels.filter((item: any) => String(item.id) !== id)
    return null
  }
  const modelRule = path.match(/^\/scheduling\/model\/([^/]+)\/rule$/)
  if (modelRule && method === "get") {
    const model = state.schedulingModels.find((item: any) => String(item.id) === String(modelRule[1]))
    return model?.ruleList || []
  }

  return undefined
}

const resolveProductRecordStatic = (path: string, data: any, params: any, pageNum: number, pageSize: number) => {
  const queryParam = getStaticQueryParam(data, params)

  if (path === "/logistics/inOutRecord/product/inbound") {
    return page(filterProductInOutRows(productInboundRecords, queryParam), pageNum, pageSize)
  }

  if (path === "/logistics/inOutRecord/product/outbound") {
    return page(filterProductInOutRows(productOutboundRecords, queryParam), pageNum, pageSize)
  }

  if (path === "/logistics/batch/search") {
    return page(filterProductBatchRows(queryParam), pageNum, pageSize)
  }

  const batchById = path.match(/^\/logistics\/batch\/([^/]+)$/)
  if (batchById) {
    const id = String(batchById[1])
    return cloneStatic(productBatchRows.find((row) => String(row.id) === id) || productBatchRows[0])
  }

  if (path === "/product/scrap/page") {
    const query = data?.queryParam || queryParam
    return page(filterProductScrapRows(query), pageNum, pageSize)
  }

  if (path === "/product/scrap/detail") {
    const id = String(params?.id || data?.id || "")
    return cloneStatic(productScrapRows.find((row) => String(row.id) === id) || productScrapRows[0])
  }

  return undefined
}

const buildDocumentDirectoryTree = (idValue: unknown = "0"): any => {
  const targetId = String(idValue || "0")
  const row = documentDirectoryRows.find((item) => String(item.id) === targetId) || documentDirectoryRows[0]
  return {
    ...row,
    subDirs: documentDirectoryRows
      .filter((item) => String(item.parentId || "") === String(row.id))
      .map((item) => buildDocumentDirectoryTree(item.id))
  }
}

const collectDocumentDirectoryIds = (idValue: unknown = "0") => {
  const targetId = String(idValue || "0")
  const ids = new Set<string>([targetId])
  const appendChildren = (parentId: string) => {
    documentDirectoryRows
      .filter((item) => String(item.parentId || "") === parentId)
      .forEach((item) => {
        ids.add(String(item.id))
        appendChildren(String(item.id))
      })
  }
  appendChildren(targetId)
  return ids
}

const filterDocumentRows = (queryParam: Record<string, any> = {}) =>
  documentResourceRows.filter((row) => {
    const directoryId = getQueryValue(queryParam, "directoryId")
    if (directoryId !== undefined && String(directoryId) !== "0") {
      const directoryIds = collectDocumentDirectoryIds(directoryId)
      if (!directoryIds.has(String(row.directoryId || ""))) return false
    }

    const fileName = getQueryValue(queryParam, "fileName")
    if (fileName !== undefined && !stringIncludes(row.fileName, fileName)) return false

    const extension = getQueryValue(queryParam, "extension")
    if (extension !== undefined && !stringIncludes(row.extension, String(extension).replace(".", ""))) return false

    const statusList = getQueryValue(queryParam, "statusList")
    if (statusList !== undefined && !numberInFilter(row.fileStatus, statusList)) return false

    return true
  })

const findDocumentRow = (idValue: unknown) => {
  const targetId = String(idValue || "")
  return (
    documentResourceRows.find(
      (item) => String(item.id) === targetId || String(item.fileId) === targetId
    ) || documentResourceRows[0]
  )
}

const resolveDocumentStatic = (path: string, data: any, params: any, pageNum: number, pageSize: number) => {
  if (path === "/directory/Hierarchy") return buildDocumentDirectoryTree(data?.id || params?.id || "0")
  if (path === "/directory/id") {
    const idValue = data?.id || params?.id || "0"
    return documentDirectoryRows.find((item) => String(item.id) === String(idValue)) || documentDirectoryRows[0]
  }
  if (path === "/directory/saveOrUpdate" || path === "/directory/delete") return null

  if (path === "/fileResource/page") {
    return page(filterDocumentRows(data?.queryParam || data || params || {}), pageNum, pageSize)
  }
  if (path === "/fileResource/listById") {
    const ids = Array.isArray(data?.idList) ? data.idList : []
    return ids.map((id: unknown) => findDocumentRow(id)).filter(Boolean)
  }
  if (path === "/fileResource/filePathHandler" || path.startsWith("/fileResource/filePathHandler/")) {
    return findDocumentRow(lastPathPart(path) || params?.fileId || data?.fileId)
  }
  if (path === "/fileResource/historyList") {
    const row = findDocumentRow(data?.id || params?.id)
    return row?.historyVersions || []
  }
  if (path === "/fileResource/flowRecord") return []
  if (path === "/fileResource/download") return findDocumentRow(params?.fileId || data?.fileId)
  if (path === "/fileResource/upload") return ["file-upload-1"]
  if (
    path === "/fileResource/batchSave" ||
    path === "/fileResource/editName" ||
    path === "/fileResource/updateRelations" ||
    path === "/fileResource/saveOrUpdate" ||
    path === "/fileResource/deleteHistoryFile"
  ) {
    return null
  }
  if (path === "/fileResource/cancellation") {
    const ids = new Set((Array.isArray(data?.idList) ? data.idList : []).map((item: unknown) => String(item)))
    documentResourceRows.forEach((row) => {
      if (ids.has(String(row.id))) {
        row.fileStatus = -1
        row.workflowStatus = -1
        row.updateTime = now
      }
    })
    return null
  }

  return undefined
}

const filterFactoryModelRows = (queryParam: Record<string, any> = {}) => {
  const parentId = String(queryParam.parentId ?? "")
  const normalizedParentId = !parentId || parentId === "0" ? "factory-root" : parentId
  const name = String(queryParam.name || "").trim()
  const code = String(queryParam.code || "").trim()
  return factoryModelRows.filter((row) => {
    if (String(row.parentId || "") !== normalizedParentId) return false
    if (name && !String(row.entityName || "").includes(name)) return false
    if (code && !String(row.entityCode || "").includes(code)) return false
    return true
  })
}

const filterFactoryModelListRows = (queryParam: Record<string, any> = {}) =>
  factoryModelRows.filter((row) => {
    if (queryParam.parentId && String(row.parentId || "") !== String(queryParam.parentId)) return false
    if (queryParam.name && !String(row.entityName || "").includes(String(queryParam.name))) return false
    if (queryParam.code && !String(row.entityCode || "").includes(String(queryParam.code))) return false
    if (queryParam.levelTag && String(row.levelTag || "") !== String(queryParam.levelTag)) return false
    if (queryParam.isEnable !== undefined && Boolean(row.isEnable) !== Boolean(queryParam.isEnable)) return false
    if (queryParam.isInspection !== undefined && Boolean(row.isInspection) !== Boolean(queryParam.isInspection)) return false
    if (queryParam.isProduction !== undefined && Boolean(row.isProduction) !== Boolean(queryParam.isProduction)) return false
    if (queryParam.isStorage !== undefined && Boolean(row.isStorage) !== Boolean(queryParam.isStorage)) return false
    if (queryParam.isStorageLocation !== undefined && Boolean(row.isStorageLocation) !== Boolean(queryParam.isStorageLocation)) return false
    return true
  })

const factoryChildTypeMap: Record<string, any[]> = {
  "": [
    { id: "factory-child-warehouse", tagName: "warehouse", storagePermit: 1, locationPermit: 0, productionPermit: 0, inspectionPermit: 0 },
    { id: "factory-child-productionArea", tagName: "productionArea", storagePermit: 0, locationPermit: 0, productionPermit: 1, inspectionPermit: 0 },
    { id: "factory-child-laboratory", tagName: "laboratory", storagePermit: 0, locationPermit: 0, productionPermit: 0, inspectionPermit: 1 }
  ],
  "factory-root": [
    { id: "factory-child-warehouse", tagName: "warehouse", storagePermit: 1, locationPermit: 0, productionPermit: 0, inspectionPermit: 0 },
    { id: "factory-child-productionArea", tagName: "productionArea", storagePermit: 0, locationPermit: 0, productionPermit: 1, inspectionPermit: 0 },
    { id: "factory-child-laboratory", tagName: "laboratory", storagePermit: 0, locationPermit: 0, productionPermit: 0, inspectionPermit: 1 }
  ],
  "wh-rm-01": [{ id: "warehouse-child-location", tagName: "location", storagePermit: 0, locationPermit: 1, productionPermit: 0, inspectionPermit: 0 }],
  "wh-fg-02": [{ id: "warehouse-child-location", tagName: "location", storagePermit: 0, locationPermit: 1, productionPermit: 0, inspectionPermit: 0 }],
  "wh-sfg-03": [{ id: "warehouse-child-location", tagName: "location", storagePermit: 0, locationPermit: 1, productionPermit: 0, inspectionPermit: 0 }],
  "wh-mro-04": [{ id: "warehouse-child-location", tagName: "location", storagePermit: 0, locationPermit: 1, productionPermit: 0, inspectionPermit: 0 }],
  "area-jk": [{ id: "productionArea-child-productionUnit", tagName: "productionUnit", storagePermit: 0, locationPermit: 0, productionPermit: 1, inspectionPermit: 0 }],
  ...Object.fromEntries(
    jiangdiLineRoutes.map((line) => [
      line.productionUnitId,
      [{ id: "productionUnit-child-workstation", tagName: "workstation", storagePermit: 0, locationPermit: 0, productionPermit: 1, inspectionPermit: 0 }]
    ])
  )
}

const buildFactoryLeafTree = (leafType: number) => {
  if (leafType === 1) {
    // 生产类型：直接返回生产区域节点，不包含根节点
    const productionAreas = factoryModelRows.filter((row) => row.levelTag === "productionArea")
    return productionAreas.map((area) => ({
      ...area,
      children: undefined
    }))
  }
  if (leafType === 2) {
    const storageIds = new Set(factoryModelRows.filter((row) => row.isStorage).map((row) => row.entityId))
    return factoryTree.map((root) => ({
      ...root,
      children: root.children.filter((child: any) => storageIds.has(child.entityId))
    }))
  }
  if (leafType === 3) {
    const inspectIds = new Set(factoryModelRows.filter((row) => row.isInspection).map((row) => row.entityId))
    return factoryTree.map((root) => ({
      ...root,
      children: root.children.filter((child: any) => inspectIds.has(child.entityId))
    }))
  }
  return factoryTree
}

const filterJiangdiCraftRows = (query: Record<string, any> = {}) =>
  jiangdiCraftRows.filter((row) => {
    if (query.name && !String(row.name || "").includes(String(query.name))) return false
    if (query.no && !String(row.no || "").includes(String(query.no))) return false
    if (query.craftTypeId && String(row.craftTypeId || "") !== String(query.craftTypeId)) return false
    if (query.craftTypeName && !String(row.craftTypeName || "").includes(String(query.craftTypeName))) return false
    return true
  })

const filterAndonModels = (queryParam: Record<string, any> = {}) =>
  andonModelRows.filter((row) => {
    const categoryId = String(queryParam.categoryId || "")
    if (categoryId && categoryId !== "0" && String(row.categoryId) !== categoryId) return false
    if (queryParam.andonName && !String(row.andonName || "").includes(String(queryParam.andonName))) return false
    if (queryParam.isEnabled !== undefined && Boolean(row.isEnabled) !== Boolean(queryParam.isEnabled)) return false
    return true
  })

const filterSystemFaultCategories = (queryParam: Record<string, any> = {}) =>
  sysFaultCategoryRows.filter((row) => {
    if (queryParam.faultType !== undefined && Number(row.faultType) !== Number(queryParam.faultType)) return false
    if (queryParam.categoryName && !String(row.categoryName || "").includes(String(queryParam.categoryName))) return false
    if (queryParam.categoryNo && !String(row.categoryNo || "").includes(String(queryParam.categoryNo))) return false
    return true
  })

const filterSystemFaultRows = (queryParam: Record<string, any> = {}) =>
  sysFaultRows.filter((row) => {
    if (queryParam.faultType !== undefined && Number(row.faultType) !== Number(queryParam.faultType)) return false
    if (queryParam.faultCategoryId && String(row.faultCategoryId) !== String(queryParam.faultCategoryId)) return false
    if (queryParam.faultName && !String(row.faultName || "").includes(String(queryParam.faultName))) return false
    if (queryParam.faultNo && !String(row.faultNo || "").includes(String(queryParam.faultNo))) return false
    if (queryParam.isEnabled !== undefined && Boolean(row.isEnabled) !== Boolean(queryParam.isEnabled)) return false
    return true
  })

const buildSystemFaultTree = (faultType: number) =>
  filterSystemFaultCategories({ faultType }).map((category) => ({
    ...category,
    faultTreeNodeList: filterSystemFaultRows({ faultType, faultCategoryId: category.id }).map((fault) => ({
      id: fault.id,
      name: fault.faultName,
      faultName: fault.faultName,
      faultNo: fault.faultNo,
      faultCategoryId: fault.faultCategoryId,
      faultCategoryName: fault.faultCategoryName,
      faultType: fault.faultType,
      faultTreeNodeList: []
    }))
  }))

const buildAndonCascadeTree = () =>
  andonCategoryRows.map((category) => ({
    id: category.id,
    name: category.categoryName,
    categoryName: category.categoryName,
    andonTreeNodeList: andonModelRows
      .filter((model) => String(model.categoryId) === String(category.id))
      .map((model) => ({
        id: model.id,
        name: model.andonName,
        andonName: model.andonName,
        andonNo: model.andonNo,
        andonTreeNodeList: []
      }))
  }))

const filterAndonRecords = (queryParam: Record<string, any> = {}) =>
  andonRecordRows.filter((row) => {
    if (queryParam.andonId && String(row.andonId) !== String(queryParam.andonId)) return false
    if (queryParam.entityId && String(row.entityId) !== String(queryParam.entityId)) return false
    if (queryParam.andonFaultId && String(row.andonFaultId) !== String(queryParam.andonFaultId)) return false
    if (queryParam.no && !String(row.no || "").includes(String(queryParam.no))) return false
    if (queryParam.andonTriggerTimeStart && String(row.andonTriggerTime || "") < String(queryParam.andonTriggerTimeStart)) return false
    if (queryParam.andonTriggerTimeEnd && String(row.andonTriggerTime || "") > String(queryParam.andonTriggerTimeEnd)) return false
    return true
  })

const buildVehicleCategoryTree = (rootId = "0") => {
  const map = new Map<string, any>()
  vehicleCategoryRows.forEach((item) => {
    map.set(String(item.id), { ...item, subDirs: [] })
  })
  map.forEach((node) => {
    if (!node.parentId) return
    const parent = map.get(String(node.parentId))
    if (parent) parent.subDirs.push(node)
  })
  return map.get(String(rootId)) || map.get("0")
}

const getVehicleCategoryName = (categoryId: string) =>
  vehicleCategoryRows.find((item) => String(item.id) === String(categoryId))?.categoryName || "全部载具分类"

const enrichVehicleModel = (row: any = {}) => {
  const categoryName = getVehicleCategoryName(String(row.vehicleCategoryId || "0"))
  return {
    ...row,
    vehicleModelNo: row.modelNo || row.vehicleModelNo || "",
    vehicleModelName: row.modelName || row.vehicleModelName || "",
    vehicleCategoryName: row.vehicleCategoryName || categoryName,
    modelStatus: Number(row.modelStatus ?? row.status ?? 1),
    status: Number(row.status ?? row.modelStatus ?? 1)
  }
}

const getVehicleLedgerStatus = (row: any = {}) => {
  if (row.ledgerStatus === "enabled" || row.ledgerStatus === "disabled" || row.ledgerStatus === "scrapped") return row.ledgerStatus
  if (row.scrapTaskStatus === "completed") return "scrapped"
  return Number(row.status) === 0 ? "disabled" : "enabled"
}

const enrichVehicleRow = (row: any = {}) => {
  const model = enrichVehicleModel(vehicleModelRows.find((item) => String(item.id) === String(row.vehicleModelId)) || {})
  const bindProducts = Array.isArray(row.bindProducts) ? row.bindProducts : []
  return {
    ...row,
    vehicleModelName: model.modelName || row.vehicleModelName || "",
    vehicleModelNo: model.modelNo || row.vehicleModelNo || "",
    vehicleCategoryId: model.vehicleCategoryId || row.vehicleCategoryId || "0",
    vehicleCategoryName: model.vehicleCategoryName || row.vehicleCategoryName || "全部载具分类",
    repairProcdefId: model.repairProcdefId || row.repairProcdefId || "",
    repairProcdefName: model.repairProcdefName || row.repairProcdefName || "",
    scrapProcdefId: model.scrapProcdefId || row.scrapProcdefId || "",
    scrapProcdefName: model.scrapProcdefName || row.scrapProcdefName || "",
    repairTaskStatus: row.repairTaskStatus || "none",
    scrapTaskStatus: row.scrapTaskStatus || "none",
    bindProducts,
    loadProductCount: bindProducts.length,
    ledgerStatus: getVehicleLedgerStatus(row)
  }
}

const filterVehicleModels = (queryParam: Record<string, any> = {}) =>
  vehicleModelRows.map(enrichVehicleModel).filter((row) => {
    if (queryParam.vehicleCategoryId && String(queryParam.vehicleCategoryId) !== "0" && String(row.vehicleCategoryId) !== String(queryParam.vehicleCategoryId)) return false
    if (queryParam.modelName && !String(row.modelName || "").includes(String(queryParam.modelName))) return false
    if (queryParam.modelNo && !String(row.modelNo || "").includes(String(queryParam.modelNo))) return false
    return true
  })

const filterVehicles = (queryParam: Record<string, any> = {}) =>
  vehicleRows.map(enrichVehicleRow).filter((row) => {
    if (queryParam.name && !String(row.name || "").includes(String(queryParam.name))) return false
    if (queryParam.no && !String(row.no || "").includes(String(queryParam.no))) return false
    if (queryParam.vehicleModelNo && String(row.vehicleModelNo || "") !== String(queryParam.vehicleModelNo)) return false
    if (queryParam.barcode && !String(row.barcode || "").includes(String(queryParam.barcode))) return false
    if (queryParam.ledgerStatus && row.ledgerStatus !== queryParam.ledgerStatus) return false
    if (queryParam.productBarcode) {
      const barcodes = (row.bindProducts || []).map((item: any) => item.barcode).join(",")
      if (!barcodes.includes(String(queryParam.productBarcode))) return false
    }
    return true
  })

const resolveVehicleStatic = (path: string, data: any, params: any, method: StaticMethod, pageNum: number, pageSize: number, idValue: string) => {
  const queryParam = data?.queryParam || data || params || {}

  if (path === "/vehicleCategory/TreeList" || path === "/vehicleCategory/Hierarchy" || path === "/vehicleCategory/list") {
    if (path === "/vehicleCategory/TreeList") return buildVehicleCategoryTree(String(params?.id || data?.id || "0"))
    return vehicleCategoryRows.filter((item) => String(item.id) !== "0")
  }
  if (path === "/vehicleCategory/page") return page(vehicleCategoryRows.filter((item) => String(item.id) !== "0"), pageNum, pageSize)
  if (path === "/vehicleCategory/saveOrUpdate" && method === "post") {
    const id = data.id ? String(data.id) : nextId("vc")
    const existedIndex = vehicleCategoryRows.findIndex((item) => String(item.id) === id)
    const nextRow = {
      ...(vehicleCategoryRows[existedIndex] || {}),
      id,
      categoryName: data.categoryName || "",
      categoryNo: data.categoryNo || `VC-${String(vehicleCategoryRows.length).padStart(3, "0")}`,
      parentId: data.parentId ?? "0",
      remarks: data.remarks || "",
      createTime: vehicleCategoryRows[existedIndex]?.createTime || now,
      updateTime: now
    }
    if (existedIndex >= 0) vehicleCategoryRows.splice(existedIndex, 1, nextRow)
    else vehicleCategoryRows.push(nextRow)
    return null
  }
  if (path.startsWith("/vehicleCategory/delete/") && method === "delete") {
    const id = lastPathPart(path)
    const index = vehicleCategoryRows.findIndex((item) => String(item.id) === id)
    if (index >= 0 && id !== "0") vehicleCategoryRows.splice(index, 1)
    vehicleModelRows.forEach((item) => {
      if (String(item.vehicleCategoryId) === id) {
        item.vehicleCategoryId = "0"
        item.vehicleCategoryName = "全部载具分类"
      }
    })
    return null
  }

  if (path === "/vehicleModel/page") return page(filterVehicleModels(queryParam), pageNum, pageSize)
  if (path === "/vehicleModel/list") return filterVehicleModels(queryParam)
  if (path === "/vehicleModel/saveOrUpdate" && method === "post") {
    const id = data.id ? String(data.id) : nextId("vm")
    const existedIndex = vehicleModelRows.findIndex((item) => String(item.id) === id)
    const categoryId = String(data.vehicleCategoryId || vehicleModelRows[existedIndex]?.vehicleCategoryId || "0")
    const nextRow = enrichVehicleModel({
      ...(vehicleModelRows[existedIndex] || {}),
      id,
      modelName: data.modelName || vehicleModelRows[existedIndex]?.modelName || "",
      modelNo: data.modelNo || vehicleModelRows[existedIndex]?.modelNo || `VM-${String(vehicleModelRows.length + 1).padStart(3, "0")}`,
      vehicleCategoryId: categoryId,
      vehicleCategoryName: getVehicleCategoryName(categoryId),
      remarks: data.remarks || vehicleModelRows[existedIndex]?.remarks || "",
      modelImg: data.modelImg || vehicleModelRows[existedIndex]?.modelImg || "",
      modelImgPath: data.modelImgPath || vehicleModelRows[existedIndex]?.modelImgPath || "",
      repairProcdefId: data.repairProcdefId || vehicleModelRows[existedIndex]?.repairProcdefId || "",
      repairProcdefName: data.repairProcdefName || vehicleModelRows[existedIndex]?.repairProcdefName || "",
      scrapProcdefId: data.scrapProcdefId || vehicleModelRows[existedIndex]?.scrapProcdefId || "",
      scrapProcdefName: data.scrapProcdefName || vehicleModelRows[existedIndex]?.scrapProcdefName || "",
      type: Number(data.type ?? vehicleModelRows[existedIndex]?.type ?? 1),
      modelStatus: Number(data.modelStatus ?? vehicleModelRows[existedIndex]?.modelStatus ?? 1),
      createBy: vehicleModelRows[existedIndex]?.createBy || "1",
      updateBy: "1",
      createTime: vehicleModelRows[existedIndex]?.createTime || now,
      updateTime: now
    })
    if (existedIndex >= 0) vehicleModelRows.splice(existedIndex, 1, nextRow)
    else vehicleModelRows.push(nextRow)
    return null
  }
  if (path.startsWith("/vehicleModel/delete/") && method === "delete") {
    const id = lastPathPart(path)
    const index = vehicleModelRows.findIndex((item) => String(item.id) === id)
    if (index >= 0) vehicleModelRows.splice(index, 1)
    return null
  }
  if (path.startsWith("/vehicleModel/")) return /^\/vehicleModel\/[^/]+$/.test(path) ? enrichVehicleModel(findRow(vehicleModelRows, idValue) || {}) : null

  if (path === "/vehicle/page") return page(filterVehicles(queryParam), pageNum, pageSize)
  if (path === "/vehicle/saveOrUpdate" && method === "post") {
    const id = data.id ? String(data.id) : nextId("veh")
    const existedIndex = vehicleRows.findIndex((item) => String(item.id) === id)
    const model = enrichVehicleModel(vehicleModelRows.find((item) => String(item.id) === String(data.vehicleModelId || vehicleRows[existedIndex]?.vehicleModelId)) || {})
    const nextRow = enrichVehicleRow({
      ...(vehicleRows[existedIndex] || {}),
      id,
      name: data.name || vehicleRows[existedIndex]?.name || "",
      no: data.no || vehicleRows[existedIndex]?.no || `V-${String(vehicleRows.length + 1).padStart(3, "0")}`,
      status: Number(data.status ?? vehicleRows[existedIndex]?.status ?? 1),
      remarks: data.remarks ?? vehicleRows[existedIndex]?.remarks ?? "",
      barcode: data.autoGenerateCode && !data.barcode ? `VH-${String(vehicleRows.length + 1).padStart(3, "0")}` : data.barcode ?? vehicleRows[existedIndex]?.barcode ?? "",
      barcodeId: vehicleRows[existedIndex]?.barcodeId || `vhb-${id}`,
      parentId: vehicleRows[existedIndex]?.parentId || "",
      vehicleModelId: model.id || data.vehicleModelId || "",
      vehicleModelName: model.modelName || "",
      vehicleModelNo: model.modelNo || "",
      vehicleCategoryId: model.vehicleCategoryId || "0",
      vehicleCategoryName: model.vehicleCategoryName || "全部载具分类",
      repairTaskStatus: data.repairTaskStatus || vehicleRows[existedIndex]?.repairTaskStatus || "none",
      scrapTaskStatus: data.scrapTaskStatus || vehicleRows[existedIndex]?.scrapTaskStatus || "none",
      bindProducts: vehicleRows[existedIndex]?.bindProducts || [],
      type: Number(model.type || vehicleRows[existedIndex]?.type || 1),
      createBy: vehicleRows[existedIndex]?.createBy || "1",
      updateBy: "1",
      createTime: vehicleRows[existedIndex]?.createTime || now,
      updateTime: now
    })
    if (existedIndex >= 0) vehicleRows.splice(existedIndex, 1, nextRow)
    else vehicleRows.unshift(nextRow)
    return null
  }
  if (path.startsWith("/vehicle/delete/") && method === "delete") {
    const id = lastPathPart(path)
    const index = vehicleRows.findIndex((item) => String(item.id) === id)
    if (index >= 0) vehicleRows.splice(index, 1)
    return null
  }
  const unloadMatch = path.match(/^\/vehicle\/unload\/([^/]+)$/)
  if (unloadMatch && method === "put") {
    const vehicle = vehicleRows.find((item) => String(item.id) === String(unloadMatch[1]))
    if (!vehicle) return null
    const productIds = new Set((Array.isArray(data.productIds) ? data.productIds : []).map(String))
    const boxIds = new Set((Array.isArray(data.boxIds) ? data.boxIds : []).map(String))
    vehicle.bindProducts = (vehicle.bindProducts || []).filter(
      (item: any) => !productIds.has(String(item.productId)) && !boxIds.has(String(item.boxId))
    )
    vehicle.updateTime = now
    return null
  }
  if (/^\/vehicle\/[^/]+$/.test(path)) return enrichVehicleRow(findRow(vehicleRows, idValue) || {})
  if (path.startsWith("/vehicle/")) return null

  return undefined
}

const buildOrderTechProcess = (params: any = {}) => defaultTechProcess(String(params.processId || nextId("tp")))

const getStaticTechStandardProcesses = (techVersionId: string, processId = "") => {
  const processes = staticTechProcessesByVersion[techVersionId] || staticTechProcessesByVersion.tv1
  if (!processId) return processes
  const currentProcess = processes.find(
    (process) => String(process.id) === String(processId) || String(process.processSerial) === String(processId)
  )
  return currentProcess ? [currentProcess] : processes
}

const staticProcessLicenseIds = ["l1", "l18", "l11", "l13", "l17"]
const staticProcessMroIds = ["m1", "m1", "m1", "m1", "m1"]

const buildStaticTechStandardManRows = (techVersionId: string, processId = "") =>
  getStaticTechStandardProcesses(techVersionId, processId).map((process, index) => {
    const licenseId = staticProcessLicenseIds[index] || staticProcessLicenseIds[0]
    const license = orgLicenses.find((item) => String(item.id) === String(licenseId)) || orgLicenses[0]
    return {
      id: `man-${techVersionId}-${process.processSerial}`,
      count: Number(process.workerNum || (index === 1 ? 2 : 1)),
      type: 3,
      refId: licenseId,
      processSerial: process.processSerial,
      license: {
        ...license,
        id: licenseId,
        licenseId,
        licenseName: license?.licenseName || `上岗证-${licenseId}`,
        jobId: license?.jobId || "",
        jobNo: license?.jobNo || getStaticJobNo(license?.jobId || ""),
        jobName: license?.jobName || ""
      }
    }
  })

const buildStaticTechStandardMroRows = (techVersionId: string, processId = "") =>
  getStaticTechStandardProcesses(techVersionId, processId).map((process, index) => {
    const mroModelId = staticProcessMroIds[index] || staticProcessMroIds[0]
    const mroModel = findMroModel(mroModelId)
    return {
      id: `mro-${techVersionId}-${process.processSerial}`,
      mroModelId,
      quantity: index === 1 ? 2 : 1,
      baseUseLife: index === 0 ? 20 : 10,
      processSerial: process.processSerial,
      mroModelVo: {
        ...mroModel,
        id: mroModelId,
        mroModelId,
        mroModelName: mroModel?.mroModelName || "MRO信息A",
        mroModelNo: mroModel?.mroModelNo || "MRO-MD-001",
        mroCategoryName: mroModel?.mroCategoryName || "",
        mroSpec: mroModel?.mroSpec || "",
        mroTypeName: mroModel?.mroClassifyName || mroModel?.mroTypeName || "",
        lifeManage: Number(mroModel?.lifeManage ?? 1),
        decimalNumber: Number(mroModel?.decimalNumber ?? 0)
      }
    }
  })

const buildStaticTechStandardProdUnitRows = (techVersionId: string, processId = "") =>
  getStaticTechStandardProcesses(techVersionId, processId).map((process, index) => {
    const facilityId = String(process.workstationId || process.productionUnitId || "area-jk")
    const facility = factoryModelRows.find((item) => String(item.id) === String(facilityId)) || factoryModelRows[0]
    return {
      id: `prod-unit-${techVersionId}-${process.processSerial}`,
      facilityId,
      abstractAreaId: facilityId,
      preChangeTime: index === 0 ? 10 : 5,
      postChangeTime: index === getStaticTechStandardProcesses(techVersionId).length - 1 ? 10 : 5,
      ctTime: Number(process.ctTime || process.standardTime || 60),
      lossTime: [2, 5, 8, 5][index] || 3,
      workerNum: Number(process.workerNum || 1),
      priority: index + 1,
      processSerial: process.processSerial,
      fmEntity: {
        id: facilityId,
        entityId: facilityId,
        entityName: facility?.entityName || `生产区域-${facilityId}`,
        entityCode: facility?.entityCode || facilityId
      }
    }
  })

const findProductionOrder = (id: string) =>
  state.productionOrders.find((order) => String(order.id) === String(id))

const filterReAddRecords = (rows: any[], queryParam: any = {}) => {
  const orderNo = String(queryParam.orderNo || "").trim()
  const productModelCode = String(queryParam.productModelCode || "").trim()
  const status = queryParam.status
  return rows.filter((row) => {
    if (orderNo && !String(row.orderNo || "").includes(orderNo)) return false
    if (productModelCode && !String(row.productModelCode || "").includes(productModelCode)) return false
    if (status !== undefined && status !== null && status !== "" && Number(row.status) !== Number(status)) {
      return false
    }
    return true
  })
}

const buildProductionOrderPlanPreview = (body: any = {}) => {
  const source = String(body.source || "productionOrder")
  const orderIds = Array.isArray(body.orderIds)
    ? body.orderIds
    : Array.isArray(body.idList)
      ? body.idList
      : state.productionOrders.map((order) => order.id)
  return orderIds.map((orderId: string) => {
    const order = findProductionOrder(String(orderId)) || state.productionOrders[0]
    return {
      entityId: "1",
      entityName: "本地演示工厂",
      level: 1,
      list: [
        {
          entityId: "1",
          taskId: `plan-${order?.id || orderId}-1`,
          taskType: 1,
          beginTime: createTimeRange().beginTime,
          endTime: createTimeRange().endTime,
          source,
          orderId: order?.id || orderId,
          orderNo: order?.no || "",
          productModelName: order?.productModelName || ""
        }
      ]
    }
  })
}

const buildSchedulePlanByOrderItem = (orderId: string) => {
  const order = findProductionOrder(orderId) || state.productionOrders[0]
  const techVersionId = String(
    order?.techVersionId || order?.techProcess?.techVersionId || order?.techProcess?.techVersion?.id || "tv1"
  )
  const processes = staticTechProcessesByVersion[techVersionId] || staticTechProcessesByVersion.tv1
  const safeAmt = Number(order?.orderAmount ?? 100)
  const amount = Number.isFinite(safeAmt) && safeAmt > 0 ? safeAmt : 100
  const unitId = String(order?.unitId || "1")
  const unitName = String(order?.unitName || "件")
  const productModel =
    order?.productModel ||
    buildOrderProductModel(
      String(order?.productModelId || "pm1"),
      String(order?.productModelCode || "GR-HSG-001"),
      String(order?.productModelName || "减速器壳体总成A型"),
      unitId,
      unitName
    )

  return {
    orderId: String(order?.id || orderId),
    orderNo: String(order?.no || ""),
    drawingNumber: String(order?.drawingNumber || productModel.drawingNumber || ""),
    productModelCode: String(order?.productModelCode || productModel.code || ""),
    productModelName: String(order?.productModelName || productModel.name || ""),
    orderPlanSerialVoList: processes.map((process) => {
      const processSerial = String(process.processSerial || "")
      const techName = String(process.name || processNameBySerial[processSerial] || `工序${processSerial}`)
      const facilityId = String(process.workstationId || process.productionUnitId || "area-jk")
      const facility = factoryModelRows.find((item) => String(item.id) === facilityId)
      return {
        id: `ops-${order?.id || orderId}-${processSerial}`,
        processSerial,
        techName,
        planAmount: amount,
        availableAmount: amount,
        unPublishAmount: amount,
        type: 1,
        children: [],
        techVersionId,
        productBaseAmount: 1,
        prodUnits: [
          {
            id: `prod-unit-${techVersionId}-${processSerial}`,
            facilityId,
            abstractAreaId: facilityId,
            ctTime: Number(process.ctTime || process.standardTime || 60),
            workerNum: Number(process.workerNum || 1),
            priority: 1,
            processSerial,
            fmEntity: {
              id: facilityId,
              entityId: facilityId,
              entityName: facility?.entityName || process.workstationName || process.productionUnitName || "生产工位",
              entityCode: facility?.entityCode || process.workstationCode || facilityId
            }
          }
        ],
        productModel,
        unitItem: {
          id: unitId,
          unitName,
          decimalNumber: Number(order?.decimalNumber ?? 2),
          unitCode: "PCS",
          createBy: "1",
          createTime: now,
          remarks: "",
          updateBy: "1",
          updateTime: now
        }
      }
    })
  }
}

const buildUnpublishedScheduleByOrder = (orderId: string) => {
  const order = findProductionOrder(orderId) || state.productionOrders[0]
  const rowId = `uns-${order?.id || orderId}-1`
  const override = state.scheduleProcessOverrides.get(rowId) || {}
  const { beginTime, endTime } = createTimeRange(16)
  return {
    orderId: String(order?.id || orderId),
    orderNo: String(order?.no || ""),
    productModelName: String(order?.productModelName || ""),
    processList: [
      {
        id: rowId,
        planId: `plan-${order?.id || orderId}-1`,
        serial: 1,
        techName: "工序-加工",
        mainProductQuantity: override.planAmount ?? Number(order?.orderAmount || 0),
        entityIdList: override.entityIdList || ["1"],
        entityName: "本地演示工厂",
        beginTime: override.planBeginTime || beginTime,
        endTime: override.planEndTime || endTime,
        status: override.status || 251
      }
    ]
  }
}

const publishSchedulingTasks = (taskIdList: unknown, t: string) => {
  const rows = Array.isArray(taskIdList) && taskIdList.length ? taskIdList.map((id) => String(id)) : []
  const publishIds = rows.length ? new Set(rows) : null
  for (const [rowId, override] of state.scheduleProcessOverrides.entries()) {
    if (publishIds && !publishIds.has(rowId)) continue
    const orderId = String(rowId.match(/^uns-(.+)-\d+$/)?.[1] || "")
    const order = findProductionOrder(orderId)
    if (!order) continue
    const existedTaskId = state.scheduleRowToTaskId.get(rowId)
    const taskId = existedTaskId || nextId("pt")
    const amount = Number(override.planAmount ?? order.orderAmount ?? 0)
    const nextTask = {
      ...state.productionTasks[0],
      id: taskId,
      no: `RW-${String(taskId).replace(/^pt-/, "")}`,
      taskNo: `RW-${String(taskId).replace(/^pt-/, "")}`,
      status: 1,
      productionOrderId: String(order.id),
      productionOrderNo: String(order.no || ""),
      productModelId: String(order.productModelId || ""),
      productModelName: String(order.productModelName || ""),
      productModelNo: String(order.productModelCode || ""),
      taskAmount: amount,
      completeAmount: 0,
      productionProgress: 0,
      entityId: override.entityIdList || ["1"],
      entityName: "本地演示工厂",
      planBeginTime: override.planBeginTime || now,
      planEndTime: override.planEndTime || now,
      nodeId: rowId,
      updateTime: t
    }
    const idx = state.productionTasks.findIndex((task) => String(task.id) === String(taskId))
    if (idx > -1) {
      state.productionTasks[idx] = nextTask
    } else {
      state.productionTasks.push(nextTask)
    }
    state.scheduleRowToTaskId.set(rowId, taskId)
    state.scheduleProcessOverrides.delete(rowId)
  }
  state.productionTasks = state.productionTasks.map((task) =>
    Number(task.status) === 251 && (!publishIds || publishIds.has(String(task.nodeId)))
      ? { ...task, status: 1, updateTime: t }
      : task
  )
}

const firstId = (data: any, params: any) => String(data?.id || params?.id || data?.taskId || params?.taskId || "1")

const shouldReturnSuccess = (path: string, method: StaticMethod) => {
  if (method === "delete" || method === "put" || method === "patch") return true
  return [
    "submit",
    "complete",
    "save",
    "create",
    "update",
    "delete",
    "upload",
    "feedback",
    "cancel",
    "lock",
    "unlock",
    "close",
    "register",
    "assign",
    "confirm",
    "bind",
    "print",
    "import",
    "export",
    "enable",
    "disable"
  ].some((key) => path.toLowerCase().includes(key.toLowerCase()))
}

const findRow = <T extends { id?: unknown }>(rows: T[], idValue: unknown) =>
  rows.find((row) => String(row.id) === String(idValue)) || rows[0]

const normalizeOrgParentDepId = (parentDepId: any) => {
  if (parentDepId === undefined) return undefined
  if (parentDepId === null) return null
  const value = String(parentDepId).trim()
  if (!value || value === "0") return null
  return value
}

const orgDepartmentPositionList = (depId: string) =>
  (orgDepartmentPositions[depId] || [])
    .map((id) => orgPositions.find((position) => position.id === id))
    .filter(Boolean)

const orgDepartmentRow = (dep: any) => {
  const parent = dep?.parentDepId ? orgDepartments.find((item) => item.id === dep.parentDepId) : null
  return {
    ...dep,
    parentDepId: dep?.parentDepId ?? null,
    parentName: parent?.depName || "",
    parentCode: parent?.depCode || "",
    positionList: orgDepartmentPositionList(dep.id)
  }
}

const orgDepartmentTreeNodes = (parentDepId: string | null): any[] =>
  orgDepartments
    .filter((dep) => dep.parentDepId === parentDepId)
    .map((dep) => ({
      depId: dep.id,
      depName: dep.depName,
      parentDepId: dep.parentDepId,
      empId: "",
      empName: "",
      empNo: "",
      employeeNodes: [],
      childDepartmentNodes: orgDepartmentTreeNodes(dep.id)
    }))

const orgDepartmentEmployeeTreeNodes = (parentDepId: string | null): any[] =>
  orgDepartments
    .filter((dep) => dep.parentDepId === parentDepId)
    .map((dep) => ({
      depId: dep.id,
      depName: dep.depName,
      parentDepId: dep.parentDepId,
      empId: "",
      empName: "",
      empNo: "",
      employeeNodes: orgEmployees
        .filter((emp) => emp.depId === dep.id)
        .map((emp) => ({ depId: dep.id, empId: emp.id, empName: emp.name || emp.empName, empNo: emp.empNo })),
      childDepartmentNodes: orgDepartmentEmployeeTreeNodes(dep.id)
    }))

const resolveStaffOrgStatic = (
  path: string,
  data: any,
  params: any,
  method: StaticMethod,
  pageNum: number,
  pageSize: number
) => {
  if (!path.startsWith("/emp/") && !path.startsWith("/employee/") && !path.startsWith("/department/") && !path.startsWith("/position/") && !path.startsWith("/job/") && !path.startsWith("/license/")) {
    return undefined
  }

  const query = params || {}
  const body = data || {}
  const idValue = String(query.id || body.id || "")

  if (path === "/emp/getDepartmentPaged") {
    const parentDepId = normalizeOrgParentDepId(query.parentDepId)
    let rows: any[] = orgDepartments.map(orgDepartmentRow)
    if (parentDepId !== undefined) rows = rows.filter((item) => item.parentDepId === parentDepId)
    if (query.depName) rows = rows.filter((item) => String(item.depName || "").includes(String(query.depName)))
    if (query.depCode) rows = rows.filter((item) => String(item.depCode || "").includes(String(query.depCode)))
    return page(rows, pageNum, pageSize)
  }
  if (path === "/emp/getDepartmentById") {
    const dep = orgDepartments.find((item) => item.id === idValue)
    return dep ? orgDepartmentRow(dep) : null
  }
  if (path === "/emp/getDepartment") return orgDepartments
  if (path === "/emp/listSelectableDepartmentTypeOptions") return orgDepartmentTypes
  if (path === "/emp/deleteDepartment" || path === "/emp/createDepartment" || path === "/emp/updateDepartment") return null

  if (path === "/emp/getEmployeePaged") {
    let rows = [...orgEmployees]
    if (body.depId) rows = rows.filter((item) => item.depId === body.depId)
    if (body.name) rows = rows.filter((item) => String(item.name || item.empName || "").includes(String(body.name)))
    if (body.empNo) rows = rows.filter((item) => String(item.empNo || "").includes(String(body.empNo)))
    if (body.isAccountOpen !== undefined) rows = rows.filter((item) => Boolean(item.bindUserId) === Boolean(body.isAccountOpen))
    return page(rows, pageNum, pageSize)
  }
  if (path === "/emp/getEmployeeList") {
    const ids = Array.isArray(body.idList) ? body.idList.map(String) : []
    return ids.length ? orgEmployees.filter((item) => ids.includes(item.id)) : orgEmployees
  }
  if (path === "/emp/getEmployeeById") return orgEmployees.find((item) => item.id === idValue) || orgEmployees[0]
  if (path.includes("EmployeeUserAccount") || path.includes("Employee") || path.includes("employee")) {
    return shouldReturnSuccess(path, method) ? null : orgEmployees
  }

  if (path === "/emp/job/getSelectOptions" || path === "/emp/job/getAllJobs") return orgJobs
  if (path === "/emp/job/getById") return orgJobs.find((item) => item.id === idValue) || orgJobs[0]
  if (path.startsWith("/emp/job/")) return null

  if (path === "/emp/position/getSelectOptions") return orgPositions
  if (path === "/emp/position/getPaged") return page(orgPositions, pageNum, pageSize)
  if (path.startsWith("/emp/position/")) return null

  if (path === "/emp/license/getCascadeSelectOptions") return { jobList: orgJobs, licenseList: orgLicenses }
  if (path === "/emp/license/getPaged") return page(orgLicenses, pageNum, pageSize)
  if (path === "/emp/license/getOneById") return orgLicenses.find((item) => item.id === idValue) || orgLicenses[0]
  if (path === "/emp/license/getLicenseDetailByEmpId") return orgLicenses.slice(0, 2)
  if (path === "/emp/license/getLicenseApplyRecordsPaged") return page([], pageNum, pageSize)
  if (path === "/emp/license/flowEnable") return true
  if (path.startsWith("/emp/license/")) return shouldReturnSuccess(path, method) ? null : []

  if (path === "/emp/component/selectEmployee/listDepartmentAndEmployeeTrees") return orgDepartmentEmployeeTreeNodes(null)
  if (path === "/emp/component/selectEmployee/queryEmployees") {
    return orgEmployees.map((emp) => ({ depId: emp.depId, empId: emp.id, empName: emp.name || emp.empName, empNo: emp.empNo }))
  }
  if (path === "/emp/component/selectDepartment/listDepartmentTrees") return orgDepartmentTreeNodes(null)
  if (path === "/emp/component/selectDepartment/queryDepartments") {
    return orgDepartments.map((dep) => ({ depId: dep.id, depName: dep.depName, parentDepId: dep.parentDepId, empId: "", empName: "", empNo: "", employeeNodes: [], childDepartmentNodes: [] }))
  }
  if (path === "/emp/component/selectPosition/queryPositions") {
    const q = String(query.positionName || "")
    return orgPositions
      .filter((item) => !q || String(item.name || "").includes(q))
      .map((item) => ({ positionId: item.id, positionName: item.name, positionCode: item.code }))
  }

  return undefined
}

const listByIds = <T extends { id?: unknown }>(rows: T[], idList: unknown) => {
  const ids = toArrayIdSet(idList)
  return rows.filter((row) => ids.has(String(row.id)))
}

const lastPathPart = (path: string) => path.split("/").filter(Boolean).pop() || ""

const normalizeProductCategoryParentId = (parentId: any) => {
  if (parentId === undefined || parentId === null || String(parentId).trim() === "") return "0"
  return String(parentId)
}

const productCategoryParentMeta = (parentId: any) => {
  const normalized = normalizeProductCategoryParentId(parentId)
  if (normalized === "0") return { parentName: "", parentCode: "" }
  const parent = staticProductCategories.find((item) => String(item.id) === normalized)
  return { parentName: parent?.name || "", parentCode: parent?.code || "" }
}

const productCategoryRow = (category: any) => ({
  ...category,
  ...productCategoryParentMeta(category.parentId)
})

const productCategoryTreeByParent = (parentId = "0"): any[] =>
  staticProductCategories
    .filter((item) => String(item.parentId || "0") === String(parentId))
    .map((item) => ({
      id: item.id,
      name: item.name,
      code: item.code,
      parentId: item.parentId,
      status: Number(item.status || 1),
      children: productCategoryTreeByParent(item.id)
    }))

const filterStaticProductCategories = (query: any) => {
  const parentId = normalizeProductCategoryParentId(query?.parentId)
  return staticProductCategories
    .filter((item) => String(item.parentId || "0") === parentId)
    .filter((item) => {
      if (query?.name && !String(item.name || "").includes(String(query.name))) return false
      if (query?.code && !String(item.code || "").includes(String(query.code))) return false
      return true
    })
    .map(productCategoryRow)
}

const filterStaticProducts = (body: any) =>
  staticProducts.filter((item) => {
    if (body?.name && !String(item.name || "").includes(String(body.name))) return false
    if (body?.code && !String(item.code || "").includes(String(body.code))) return false
    if (body?.productCategoryId && String(item.productCategoryId) !== String(body.productCategoryId)) return false
    if (Array.isArray(body?.productTypes) && body.productTypes.length) {
      if (!body.productTypes.map((type: unknown) => Number(type)).includes(Number(item.productType))) return false
    }
    if (body?.productType !== undefined && body?.productType !== null && body?.productType !== "") {
      if (Number(item.productType) !== Number(body.productType)) return false
    }
    if (body?.status !== undefined && body?.status !== null && body?.status !== "") {
      if (Number(item.status) !== Number(body.status)) return false
    }
    if (Array.isArray(body?.filterProductModelIds) && body.filterProductModelIds.length) {
      if (body.filterProductModelIds.map(String).includes(String(item.id))) return false
    }
    return true
  })

const staticProductById = (idValue: unknown) =>
  staticProducts.find((item) => String(item.id) === String(idValue)) || staticProducts[0]

const staticProductInspectItemsByModel = (productModelId: unknown, inspectType?: unknown, searchKey?: unknown) =>
  staticProductInspectItems.filter((item) => {
    if (productModelId && String(item.productModelId) !== String(productModelId)) return false
    if (inspectType !== undefined && inspectType !== null && inspectType !== "" && Number(item.inspectType) !== Number(inspectType)) return false
    if (searchKey) {
      const key = String(searchKey)
      if (!String(item.inspectItemName || "").includes(key) && !String(item.inspectItemCode || "").includes(key)) return false
    }
    return true
  }).map((item) => {
    const row = item as any
    return {
      ...row,
      samplingConfigs: row.samplingConfigs || [
      {
        inspectionMode: Number(row.inspectionMode || 2),
        inspectType: Number(row.inspectType || 0),
        samplingMethod: Number(row.samplingMethod || 1),
        samplingRatio: row.samplingRatio,
        gradientModelId: String(row.gradientModelId || "")
      }
    ]
    }
  })

const staticBomDetail = (idValue: unknown) => {
  const row = staticBomRows.find((item) => String(item.id) === String(idValue)) || staticBomRows[0]
  return {
    ...row,
    items: staticBomItems[row.id] || []
  }
}

const resolveProductManagementStatic = (
  path: string,
  data: any,
  params: any,
  method: StaticMethod,
  pageNum: number,
  pageSize: number
) => {
  const query = params || {}
  const body = data || {}

  if (path === "/sys/product/config/list") return staticProductTypes

  if (path === "/product/category/getCategoryTree") return productCategoryTreeByParent("0")
  if (path === "/product/category/getPaged") return page(filterStaticProductCategories(query), pageNum, pageSize)
  if (path === "/product/category/getCategorySelectOptions") {
    return staticProductCategories.map(productCategoryRow)
  }
  if (path === "/product/category/changeStatus" || path.startsWith("/product/category/")) {
    return shouldReturnSuccess(path, method) ? null : staticProductCategories.map(productCategoryRow)
  }

  if (path === "/product/model/getPaged" || path === "/product/model/productWithProcess/page") {
    return page(filterStaticProducts(body), pageNum, pageSize)
  }
  if (path === "/product/model/getByIdList") {
    const ids = Array.isArray(body.idList) ? body.idList.map(String) : []
    return ids.length ? staticProducts.filter((item) => ids.includes(String(item.id))) : staticProducts
  }
  if (path === "/product/model/getById") return staticProductById(query.productModelId || query.id || body.productModelId || body.id)
  if (path === "/product/getProductInfosByIdsForProductionReport") {
    const ids = Array.isArray(body.idList) ? body.idList.map(String) : []
    return ids.length ? staticProducts.filter((item) => ids.includes(String(item.id))) : staticProducts.slice(0, 3)
  }
  if (path === "/product/model/getInspectTypeConfigList") {
    const productModelId = String(query.productModelId || body.productModelId || "pm1")
    return [1, 2, 3, 4, 5, 6].map((inspectType) => ({
      id: `${productModelId}-inspect-type-${inspectType}`,
      productModelId,
      inspectType,
      controlPattern: 1,
      inspectPattern: 1,
      inspectionMode: 2,
      samplingMethod: inspectType === 3 ? 2 : 1,
      samplingRatio: inspectType === 3 ? 100 : 10,
      sampleNum: inspectType === 3 ? 5 : 3,
      gradientModelId: "gm-1",
      needCheck: true,
      isSampleReturn: inspectType !== 1,
      createBy: 1,
      createTime: now,
      updateBy: 1,
      updateTime: now
    }))
  }
  if (path === "/product/model/inspectItemDetail/v3/getList" || path === "/product/model/inspectItemDetail/getList") {
    return staticProductInspectItemsByModel(query.productModelId || body.productModelId, query.inspectType || body.inspectType, query.searchKey || body.searchKey)
  }
  if (path.startsWith("/product/model/inspectItemDetail/") || path.startsWith("/product/model/inspectType/")) return null

  if (path === "/product/model/doc/v3/getDocIdList") {
    const product = staticProductById(query.productModelId || body.productModelId)
    return product.productModelDocList || []
  }
  if (path.startsWith("/product/model/doc/")) return null

  if (path === "/product/model/unit/getUnitList") {
    const product = staticProductById(query.productModelId || body.productModelId)
    return product.productModelUnitList || []
  }
  if (path === "/product/model/unit/getUnitSelectOptions") return staticProductUnits
  if (path.startsWith("/product/model/unit/")) return null

  if (path === "/product/model/safetyStockConfig/listSafetyStockConfigs") {
    const product = staticProductById(query.productModelId || body.productModelId)
    return [
      {
        id: `${product.id}-safe-stock`,
        productModelId: product.id,
        productModelCode: product.code,
        productModelName: product.name,
        minStock: product.minStock,
        safeStock: product.safeStock,
        unitId: product.defaultUnitId,
        unitName: product.defaultUnitName,
        createTime: now,
        updateTime: now
      }
    ]
  }
  if (path === "/product/model/partnerPartMapping/getSelectablePartnerList") {
    return [
      { id: "partner-1", partnerId: "partner-1", partnerName: "演示供应商", partnerCode: "SUP-001" },
      { id: "partner-2", partnerId: "partner-2", partnerName: "演示客户", partnerCode: "CUS-001" }
    ]
  }
  if (path === "/product/model/partnerPartMapping/listPartnerPartMappingConfigs") {
    const product = staticProductById(query.productModelId || body.productModelId)
    return [
      {
        id: `${product.id}-partner-map`,
        productModelId: product.id,
        partnerId: "partner-1",
        partnerName: "演示供应商",
        partnerPartNo: `${product.code}-SUP`,
        partnerPartName: product.name
      }
    ]
  }
  if (path.startsWith("/product/model/partnerPartMapping/") || path.startsWith("/product/model/safetyStockConfig/")) return null
  if (path.startsWith("/product/model/")) return shouldReturnSuccess(path, method) ? null : staticProducts

  if (path === "/bom/pageList") {
    const rows = staticBomRows.filter((item) => {
      if (body.productCode && !String(item.productCode || "").includes(String(body.productCode))) return false
      if (body.productName && !String(item.productName || "").includes(String(body.productName))) return false
      if (body.source && String(item.source) !== String(body.source)) return false
      if (body.status && String(item.status) !== String(body.status)) return false
      return true
    })
    return page(rows, pageNum, pageSize)
  }
  if (path.startsWith("/bom/detail/")) return staticBomDetail(lastPathPart(path))
  if (path === "/bom/searchProduct") {
    const keyword = String(query.keyword || "")
    return staticProducts
      .filter((item) => !keyword || String(item.name).includes(keyword) || String(item.code).includes(keyword))
      .map((item) => ({
        id: item.id,
        code: item.code,
        name: item.name,
        productModelUnitList: item.productModelUnitList
      }))
  }
  if (path === "/bom/getBomItemsByProductId") {
    const matched = staticBomRows.find((item) => String(item.productId) === String(query.productId || body.productId))
    return matched
      ? {
          bomId: matched.id,
          productId: matched.productId,
          productCode: matched.productCode,
          productName: matched.productName,
          version: matched.version,
          status: matched.status,
          items: staticBomItems[matched.id] || []
        }
      : null
  }
  if (path === "/bom/checkVersion") return false
  if (path.startsWith("/bom/")) return shouldReturnSuccess(path, method) ? null : page(staticBomRows, pageNum, pageSize)

  return undefined
}

const taskIdFromRequest = (data: any, params: any, fallback = "201") =>
  String(data?.taskId || params?.taskId || data?.id || params?.id || fallback)

const qualitySamplesByTaskId = (taskId: string) => {
  const task =
    qualityProcessTasks.find((item) => String(item.id) === String(taskId)) ||
    qualityNonProcessTasks.find((item) => String(item.id) === String(taskId))
  return task?.samples || []
}

const qualityAttachmentsByTaskId = (taskId: string) =>
  taskId ? [{ ...commonFile, id: `qa-file-${taskId}`, attachmentName: "检验附件.png", attachmentUrl: commonFile.url }] : []

const qualitySampleIdSummary = (taskId: string) => {
  const samples = qualitySamplesByTaskId(taskId)
  return {
    fullInspectionFinished: 0,
    inspectPattern: 1,
    inspectionResult: 0,
    sampleStatusList: samples.map((sample: any) => ({
      sampleId: String(sample.id),
      sampleStatus: Number(sample.sampleStatus || 0),
      seqNo: String(sample.seqNo || "")
    })),
    taskStatus: 1
  }
}

const resolveQualityStatic = (path: string, data: any, params: any, pageNum: number, pageSize: number) => {
  const taskId = taskIdFromRequest(data, params)

  if (path === "/pc/qa/inspectTask/process/getInspectTaskListPaged") {
    return page(qualityProcessTasks, pageNum, pageSize)
  }
  if (path === "/pc/qa/inspectTask/process/getInspectTaskDetailById") {
    return findRow(qualityProcessTasks, taskId)
  }
  if (path === "/pc/qa/inspectTask/process/getPCProcessInspectSampleResultPanelNeedInfo") {
    return qualitySamplesByTaskId(taskId)
  }
  if (path === "/pc/qa/inspectTask/attachment/list" || path === "/qa/inspectTask/attachment/list") {
    return qualityAttachmentsByTaskId(taskId)
  }
  if (path === "/pc/qa/inspectTask/attachment/upload" || path === "/qa/inspectTask/attachment/upload") {
    return true
  }
  if (path.startsWith("/pc/qa/inspectTask/getInspectInstancesById/")) {
    return qualityTaskProducts.get(lastPathPart(path)) || qualityTaskProducts.get("301") || []
  }

  if (path === "/pc/qa/inspectTask/getPCInspectTaskListPaged" || path === "/qa/inspectTask/getInspectTaskListPaged") {
    return page(qualityNonProcessTasks, pageNum, pageSize)
  }
  if (path === "/pc/qa/inspectTask/getInspectTaskDetailById" || path === "/qa/inspectTask/getInspectTaskDetailById") {
    return findRow(qualityNonProcessTasks, taskId)
  }
  if (
    path === "/pc/qa/inspectTask/listTaskSampleAndSampleItemByTaskId" ||
    path === "/qa/inspectTask/listTaskSampleAndSampleItemByTaskId"
  ) {
    return qualitySamplesByTaskId(taskId)
  }
  if (path === "/pc/qa/inspectTask/getTaskProductByTaskId" || path === "/qa/inspectTask/getTaskProductByTaskId") {
    return qualityTaskProducts.get(taskId) || []
  }
  if (path === "/qa/inspectTask/getInspectSampleIdList") return qualitySampleIdSummary(taskId)
  if (path === "/qa/inspectTask/getInspectSampleResultPanelNeedInfo") return qualitySamplesByTaskId(taskId)
  if (path === "/qa/inspectTask/getSettingInfoById") {
    const task = findRow(qualityNonProcessTasks, taskId)
    return {
      controlPattern: 1,
      gradientModelItem: qualityGradientModels[0],
      inspectPattern: 1,
      needInspect: true,
      productModelCode: task.productModelCode,
      productModelId: task.productModelId,
      productModelName: task.productModelName,
      productTotalQuantity: task.productTotalQuantity,
      sampleNum: task.sampleNum,
      samplingMethod: 1,
      samplingRatio: 10,
      suggestSampleQuantity: task.suggestSampleQuantity,
      unitId: task.unitId,
      unitName: task.unitName,
      decimalNumber: task.decimalNumber
    }
  }
  if (path.includes("/qa/inspectTask/process/close") || path.includes("/qa/inspectTask/process/resume")) return null

  if (path === "/qa/defectReviewTask/listReviewTaskPaged") return page(qualityReviewTasks, pageNum, pageSize)
  if (path === "/qa/defectReviewTask/listReviewTaskProduct") return qualityReviewTargets
  if (path === "/qa/defectReviewFlawRegister/listFlawRegister") return qualityReviewDefects
  if (path === "/qa/defectReviewTask/listReviewTaskSplitProductResult") return qualityReviewTargets
  if (path.includes("/qa/defectReviewTask/submit") || path.includes("/qa/defectReviewFlawRegister/submit")) return true

  if (path === "/qa/flawGrade/list") return qualityFlawGrades
  if (path === "/qa/flawLevel/list") return qualityFlawLevels
  if (path === "/qa/flaw/listPaged") return page(qualityFlaws, pageNum, pageSize)
  if (path.startsWith("/qa/flaw") || path.startsWith("/qa/flawGrade") || path.startsWith("/qa/flawLevel")) return null

  if (path === "/qa/gradientModel/getListPaged") return page(qualityGradientModels, pageNum, pageSize)
  if (path === "/qa/gradientModel/getById") return findRow(qualityGradientModels, params?.modelId || data?.modelId || "gm-1")
  if (path === "/qa/gradientModel/getAvailableList") return qualityGradientModels
  if (path.startsWith("/qa/gradientModel/")) return null

  return undefined
}

const resolveEquipmentTaskItems = (rows: any[], idValue: unknown) => {
  const task = findRow(rows, idValue)
  return task?.items || []
}

const cloneStatic = <T>(value: T): T => JSON.parse(JSON.stringify(value))

const getStaticQueryParam = (data: any, params: any) => data?.queryParam || data?.query || params || data || {}

const buildEquipmentCategoryHierarchy = (idValue?: unknown) => {
  const id = String(idValue || "0")
  if (id && id !== "0") {
    return cloneStatic(flatEquipmentCategories.find((item) => String(item.id) === id) || equipmentCategories[0])
  }
  return cloneStatic(equipmentCategoryHierarchyRoot)
}

const filterEquipmentInfoRows = (queryParam: Record<string, any> = {}) =>
  equipmentInfoRows.filter((row) => {
    const equipmentNo = getQueryValue(queryParam, "equipmentNo")
    if (equipmentNo !== undefined && !stringIncludes(row.equipmentNo, equipmentNo)) return false

    const equipmentName = getQueryValue(queryParam, "equipmentName")
    if (equipmentName !== undefined && !stringIncludes(row.equipmentName, equipmentName)) return false

    const equipmentCategoryId = getQueryValue(queryParam, "equipmentCategoryId", "categoryId")
    if (equipmentCategoryId !== undefined && String(row.equipmentCategoryId) !== String(equipmentCategoryId)) return false

    return true
  })

const filterMaintenanceTypes = (queryParam: Record<string, any> = {}) =>
  equipmentMaintenanceTypes.filter((row) => {
    const code = getQueryValue(queryParam, "maintenanceTypeCode")
    if (code !== undefined && !stringIncludes(row.maintenanceTypeCode, code)) return false

    const name = getQueryValue(queryParam, "maintenanceTypeName")
    if (name !== undefined && !stringIncludes(row.maintenanceTypeName, name)) return false

    return true
  })

const filterMaintenanceYearPlans = (queryParam: Record<string, any> = {}) =>
  equipmentMaintenanceYearPlans.filter((row) => {
    const planName = getQueryValue(queryParam, "planName")
    if (planName !== undefined && !stringIncludes(row.planName, planName)) return false

    const planYear = getQueryValue(queryParam, "planYear")
    if (planYear !== undefined && !stringIncludes(row.planYear, planYear)) return false

    const status = getQueryValue(queryParam, "status")
    if (status !== undefined && !numberInFilter(row.status, status)) return false

    return true
  }).sort((a, b) => String(b.planYear).localeCompare(String(a.planYear)) || Number(b.id) - Number(a.id))

const filterMaintenanceMonthPlans = (queryParam: Record<string, any> = {}) =>
  equipmentMaintenanceMonthPlans.filter((row) => {
    const planMonth = getQueryValue(queryParam, "planMonth")
    if (planMonth !== undefined && !stringIncludes(row.planMonth, planMonth)) return false

    const areaName = getQueryValue(queryParam, "areaName")
    if (areaName !== undefined && !stringIncludes(row.areaName, areaName)) return false

    const planName = getQueryValue(queryParam, "planName")
    if (planName !== undefined && !stringIncludes(row.planName, planName)) return false

    const status = getQueryValue(queryParam, "status")
    if (status !== undefined && !numberInFilter(row.status, status)) return false

    const sourceYearPlanNo = getQueryValue(queryParam, "sourceYearPlanNo")
    if (sourceYearPlanNo !== undefined && !stringIncludes(row.sourceYearPlanNo, sourceYearPlanNo)) return false

    return true
  }).sort((a, b) => String(b.planMonth).localeCompare(String(a.planMonth)) || Number(b.id) - Number(a.id))

const filterMaintenanceWeekPlans = (queryParam: Record<string, any> = {}) =>
  equipmentMaintenanceWeekPlans.filter((row) => {
    const naturalWeekLabel = getQueryValue(queryParam, "naturalWeekLabel")
    if (naturalWeekLabel !== undefined && !stringIncludes(row.naturalWeekLabel, naturalWeekLabel)) return false

    const areaName = getQueryValue(queryParam, "areaName")
    if (areaName !== undefined && !stringIncludes(row.areaName, areaName)) return false

    const planName = getQueryValue(queryParam, "planName")
    if (planName !== undefined && !stringIncludes(row.planName, planName)) return false

    const status = getQueryValue(queryParam, "status")
    if (status !== undefined && !numberInFilter(row.status, status)) return false

    const sourceMonthPlanNo = getQueryValue(queryParam, "sourceMonthPlanNo")
    if (sourceMonthPlanNo !== undefined && !stringIncludes(row.sourceMonthPlanNos, sourceMonthPlanNo)) return false

    return true
  }).sort((a, b) => String(b.planStartDate).localeCompare(String(a.planStartDate)) || Number(b.id) - Number(a.id))

const filterEquipmentConfigs = (queryParam: Record<string, any> = {}) =>
  equipmentConfigRows.filter((row) => {
    const equipmentId = getQueryValue(queryParam, "equipmentId")
    if (equipmentId !== undefined && String(row.equipmentId) !== String(equipmentId)) return false

    const equipmentModelId = getQueryValue(queryParam, "equipmentModelId")
    if (equipmentModelId !== undefined && String(row.equipmentModelId) !== String(equipmentModelId)) return false

    const configType = getQueryValue(queryParam, "configType")
    if (configType !== undefined && !numberInFilter(row.configType, configType)) return false

    const mconfigType = getQueryValue(queryParam, "mconfigType")
    if (mconfigType !== undefined && !numberInFilter(row.mconfigType || row.configType, mconfigType)) return false

    const configName = getQueryValue(queryParam, "configName")
    if (configName !== undefined && !stringIncludes(row.configName || row.mconfigName, configName)) return false

    return true
  })

const filterEquipmentExceptions = (queryParam: Record<string, any> = {}) =>
  equipmentExceptionRows.filter((row) => {
    const sourceType = getQueryValue(queryParam, "sourceType")
    if (sourceType !== undefined && !numberInFilter(row.sourceType, sourceType)) return false

    const taskNo = getQueryValue(queryParam, "taskNo")
    if (taskNo !== undefined && !stringIncludes(row.taskNo, taskNo)) return false

    const taskStatus = getQueryValue(queryParam, "taskStatus")
    if (taskStatus !== undefined && !numberInFilter(row.taskStatus, taskStatus)) return false

    const equipmentNo = getQueryValue(queryParam, "equipmentNo")
    if (equipmentNo !== undefined && !stringIncludes(row.equipmentNo, equipmentNo)) return false

    const equipmentName = getQueryValue(queryParam, "equipmentName")
    if (equipmentName !== undefined && !stringIncludes(row.equipmentName, equipmentName)) return false

    const equipmentTypeName = getQueryValue(queryParam, "equipmentTypeName")
    if (equipmentTypeName !== undefined && !stringIncludes(row.equipmentTypeName, equipmentTypeName)) return false

    const areaName = getQueryValue(queryParam, "areaName")
    if (areaName !== undefined && !stringIncludes(row.areaName, areaName)) return false

    return true
  }).sort((a, b) => new Date(b.createTime || 0).getTime() - new Date(a.createTime || 0).getTime())

const maintenanceTaskRows = () =>
  [...equipmentMaintenanceTasks].sort(
    (a, b) => new Date(b.createTime || 0).getTime() - new Date(a.createTime || 0).getTime()
  )

const buildMaintenanceMonthSplitPreview = (yearPlanId: unknown, planMonth: unknown) => {
  const sourcePlan = equipmentMaintenanceYearPlans.find((plan) => String(plan.id) === String(yearPlanId))
  const month = Number(String(planMonth || "").split("-")[1] || 0)
  const monthKey = `month${month}`
  if (!sourcePlan || month < 1 || month > 12) return []

  const grouped = new Map<string, any[]>()
  ;(sourcePlan.details || [])
    .filter((detail: any) => Boolean(detail[monthKey]))
    .forEach((detail: any) => {
      const areaName = String(detail.areaName || "未分配区域").split("/")[0]
      const rows = grouped.get(areaName) || []
      rows.push(detail)
      grouped.set(areaName, rows)
    })

  return Array.from(grouped.entries()).map(([areaName, rows]) => ({
    areaName,
    equipmentCount: rows.length,
    planName: `${String(planMonth || "").replace("-", "年")}月${areaName}设备保养月计划`
  }))
}

const buildMaintenanceWeekSplitPreview = (monthPlanId: unknown) => {
  const sourcePlan = equipmentMaintenanceMonthPlans.find((plan) => String(plan.id) === String(monthPlanId))
  if (!sourcePlan) return []

  const generatedRows = equipmentMaintenanceWeekPlans.filter((plan) =>
    (plan.sourcePlans || []).some((source: any) => String(source.sourceMonthPlanId) === String(monthPlanId))
  )
  if (generatedRows.length) {
    return generatedRows.map((plan) => ({
      naturalWeekLabel: plan.naturalWeekLabel,
      planStartDate: plan.planStartDate,
      planEndDate: plan.planEndDate,
      planName: plan.planName,
      equipmentCount: plan.totalCount,
      actionType: "keep",
      processStatus: "generated",
      processStatusLabel: "已生成",
      submitAction: "保留",
      canSelectAction: true,
      weekPlanId: plan.id,
      weekPlanNo: plan.planNo
    }))
  }

  return [
    {
      naturalWeekLabel: `${String(sourcePlan.planMonth).slice(0, 4)}年第1周`,
      planStartDate: `${sourcePlan.planMonth}-01`,
      planEndDate: `${sourcePlan.planMonth}-07`,
      planName: `${sourcePlan.planMonth.replace("-", "年")}月${sourcePlan.areaName}设备保养周计划`,
      equipmentCount: sourcePlan.totalCount,
      actionType: "create",
      processStatus: "",
      processStatusLabel: "未处理",
      submitAction: "生成",
      canSelectAction: true
    }
  ]
}

const resolveEquipmentStatic = (path: string, data: any, params: any, pageNum: number, pageSize: number) => {
  const idValue = data?.id || params?.id || "1001"
  const queryParam = getStaticQueryParam(data, params)

  if (path === "/equipment/page") return page(filterEquipmentInfoRows(queryParam), pageNum, pageSize)
  if (path === "/equipment/listByIds") return listByIds(equipmentInfoRows, data?.idList)
  if (path === "/equipment/id") return findRow(equipmentInfoRows, idValue)
  if (path === "/equipment/activate" || path === "/equipment/deactivate" || path === "/equipment/save" || path === "/equipment/update") return null

  if (path === "/equipmentModel/page") return page(equipmentModels, pageNum, pageSize)
  if (path === "/equipmentModel/list") return equipmentModels
  if (path === "/equipmentModel/getFaultsByEquipmentId") return [mockEquipmentFault]
  if (path.startsWith("/equipmentModel/")) return null
  if (path === "/equipmentCategory/Hierarchy") return buildEquipmentCategoryHierarchy(data?.id || params?.id)
  if (path === "/equipmentCategory/id") return findRow(flatEquipmentCategories, idValue)
  if (path.startsWith("/equipmentCategory/")) return null

  if (path === "/equipmentPatrolTask/page") return page(equipmentPatrolTasks, pageNum, pageSize)
  if (path === "/equipmentPatrolTask/id") return findRow(equipmentPatrolTasks, idValue)
  if (path === "/equipmentPatrolTask/create" || path === "/equipmentPatrolTask/update") return { id: String(idValue || "5001") }
  if (path === "/equipmentPatrolTask/check" || path === "/equipmentPatrolTask/void" || path === "/equipmentPatrolTask/delete") return null
  if (path === "/equipmentPatrolItem/id") {
    return equipmentPatrolTasks.flatMap((task) => task.items).find((item) => String(item.id) === String(idValue)) || equipmentPatrolTasks[0].items[0]
  }

  if (path === "/equipmentSpotTask/page") return page(equipmentSpotTasks, pageNum, pageSize)
  if (path === "/equipmentSpotTask/id") return findRow(equipmentSpotTasks, idValue)
  if (path === "/equipmentSpotTask/create" || path === "/equipmentSpotTask/update") return { id: String(idValue || "5101") }
  if (path === "/equipmentSpotTask/check" || path === "/equipmentSpotTask/void" || path === "/equipmentSpotTask/delete") return null
  if (path === "/equipmentSpotItem/id") {
    return equipmentSpotTasks.flatMap((task) => task.items).find((item) => String(item.id) === String(idValue)) || equipmentSpotTasks[0].items[0]
  }

  if (path === "/equipmentMaintenanceTask/page") return page(maintenanceTaskRows(), pageNum, pageSize)
  if (path === "/equipmentMaintenanceTask/id") return findRow(equipmentMaintenanceTasks, idValue)
  if (path === "/equipmentMaintenanceTask/create" || path === "/equipmentMaintenanceTask/update") return { id: String(idValue || "5201") }
  if (path === "/equipmentMaintenanceTask/check" || path === "/equipmentMaintenanceTask/void" || path === "/equipmentMaintenanceTask/delete") return null
  if (path === "/equipmentMaintenanceItem/id") {
    return (
      equipmentMaintenanceTasks.flatMap((task) => task.items).find((item) => String(item.id) === String(idValue)) ||
      equipmentMaintenanceTasks[0].items[0]
    )
  }

  if (path === "/equipmentExceptionTask/page") return page(filterEquipmentExceptions(queryParam), pageNum, pageSize)
  if (path === "/equipmentExceptionTask/id") return findRow(equipmentExceptionRows, idValue)
  if (/^\/equipmentExceptionTask\/[^/]+\/sysFault$/.test(path)) return [mockEquipmentFault]
  if (path === "/equipmentExceptionTask/feedback" || path === "/equipmentExceptionTask/assignResponsible") return null

  if (path === "/equipmentMaintenanceType/page") return page(filterMaintenanceTypes(queryParam), pageNum, pageSize)
  if (path === "/equipmentMaintenanceType/list") return equipmentMaintenanceTypes
  if (path === "/equipmentMaintenanceType/id") return findRow(equipmentMaintenanceTypes, idValue)
  if (path.startsWith("/equipmentMaintenanceType/")) return null

  if (path === "/equipmentMaintenanceYearPlan/page") return page(filterMaintenanceYearPlans(queryParam), pageNum, pageSize)
  if (path === "/equipmentMaintenanceYearPlan/id") return findRow(equipmentMaintenanceYearPlans, idValue)
  if (path.startsWith("/equipmentMaintenanceYearPlan/")) return null

  if (path === "/equipmentMaintenancePlan/page") return page(filterMaintenanceMonthPlans(queryParam), pageNum, pageSize)
  if (path === "/equipmentMaintenancePlan/id") return findRow(equipmentMaintenanceMonthPlans, idValue)
  if (path === "/equipmentMaintenancePlan/previewSplit") return buildMaintenanceMonthSplitPreview(data?.yearPlanId, data?.planMonth)
  if (path.startsWith("/equipmentMaintenancePlan/")) return null

  if (path === "/equipmentMaintenanceWeekPlan/page") return page(filterMaintenanceWeekPlans(queryParam), pageNum, pageSize)
  if (path === "/equipmentMaintenanceWeekPlan/id") return findRow(equipmentMaintenanceWeekPlans, idValue)
  if (path === "/equipmentMaintenanceWeekPlan/previewSplitFromMonthPlan") return buildMaintenanceWeekSplitPreview(data?.monthPlanId)
  if (path.startsWith("/equipmentMaintenanceWeekPlan/")) return null

  if (path === "/equipmentConfig/page") return page(filterEquipmentConfigs(queryParam), pageNum, pageSize)
  if (path === "/equipmentConfig/list") return filterEquipmentConfigs(queryParam)
  if (path === "/equipmentConfig/listByIds") return listByIds(equipmentConfigRows, data?.idList)
  if (path.startsWith("/equipmentConfig/")) return null

  if (path === "/equipmentModelConfig/page") return page(filterEquipmentConfigs(queryParam), pageNum, pageSize)
  if (path === "/equipmentModelConfig/update" || path === "/equipmentModelConfig/delete") return null

  if (path === "/equipmentRepair/page" || path === "/equipmentRepair/getPage") return page(equipmentRepairRows, pageNum, pageSize)
  if (path === "/equipmentRepair/id") return findRow(equipmentRepairRows, idValue)
  if (path.startsWith("/equipmentRepair/")) return null

  if (path === "/equipmentScrap/page") return page(equipmentScrapRows, pageNum, pageSize)
  if (path === "/equipmentScrap/save") return null
  if (path.includes("completePatrolTask") || path.includes("completeSpotTask") || path.includes("completeMaintenanceItem")) return null

  if (path.endsWith("/items")) return resolveEquipmentTaskItems(equipmentPatrolTasks, idValue)

  return undefined
}

const resolveMroStatic = (path: string, data: any, params: any, pageNum: number, pageSize: number) => {
  const idValue = data?.id || params?.id || "i1"

  if (path === "/mro/page") return page(mroInfos, pageNum, pageSize)
  if (path === "/mro/listByIds") return listByIds(mroInfos, data?.idList)
  if (path === "/mro/getById") {
    const info = findRow(mroInfos, idValue)
    if (!info) return undefined
    return {
      ...info,
      mroModelVo: findMroModel(String(info.mroModelId || ""))
    }
  }
  if (path === "/mro/archive" || path === "/mro/unarchive" || path === "/mro/scrap" || path === "/mro/bindBarcode") return null
  if (path === "/mroInformationConfig/page") {
    const query = data?.queryParam ?? {}
    const mroId = String(query?.mroId || idValue || "i1")
    const mroItemType = Number(query?.mroItemType ?? 1)
    return page(getInfoConfigRows(mroId, mroItemType), pageNum, pageSize)
  }
  if (path === "/mroInformationConfig/save") return null

  if (path === "/mroModel/page") return page(mroModels.map((item) => findMroModel(String(item.id))), pageNum, pageSize)
  if (path === "/mroModel/getOne") return findMroModel(idValue)
  if (path === "/mroModelItemConfig/page") {
    const query = data?.queryParam ?? {}
    const mroModelId = String(query?.mroModelId ?? "m1")
    const mroItemType = Number(query?.mroItemType ?? 1)
    return page(getModelConfigRows(mroModelId, mroItemType), pageNum, pageSize)
  }
  if (path === "/mroModelItemConfig/update") {
    replaceModelConfigs(data || {})
    return null
  }
  if (path.startsWith("/mroModel/") || path.startsWith("/mroModelItemConfig/")) return null

  if (path === "/mroInspectionTask/page") return page(mroInspectionTasks, pageNum, pageSize)
  if (path === "/mroInspectionTask/id") return findRow(mroInspectionTasks, idValue)
  if (path === "/mroInspectionTask/create" || path === "/mroInspectionTask/update") return { id: String(idValue || "6101") }
  if (path === "/mroInspectionTask/check" || path === "/mroInspectionTask/void" || path === "/mroInspectionTask/start" || path === "/mroInspectionTask/complete" || path === "/mroInspectionTask/delete") return null
  if (path === "/mroInspectionTaskItem/page") {
    const taskId = data?.queryParam?.inspectionTaskId || data?.inspectionTaskId || data?.taskId || "6101"
    return page(resolveEquipmentTaskItems(mroInspectionTasks, taskId), pageNum, pageSize)
  }
  if (path === "/mroInspectionTaskItem/id") {
    return mroInspectionTasks.flatMap((task) => task.items).find((item) => String(item.id) === String(idValue)) || mroInspectionTasks[0].items[0]
  }
  if (path.startsWith("/mroInspectionTask/attachment")) return []

  if (path === "/mroMaintenanceTask/page") return page(mroMaintenanceTasks, pageNum, pageSize)
  if (path === "/mroMaintenanceTask/id") return findRow(mroMaintenanceTasks, idValue)
  if (path === "/mroMaintenanceTask/create" || path === "/mroMaintenanceTask/update") return { id: String(idValue || "6201") }
  if (path === "/mroMaintenanceTask/check" || path === "/mroMaintenanceTask/void" || path === "/mroMaintenanceTask/start" || path === "/mroMaintenanceTask/complete" || path === "/mroMaintenanceTask/delete") return null
  if (path === "/mroMaintenanceTaskItem/page") {
    const taskId = data?.queryParam?.maintenanceTaskId || data?.maintenanceTaskId || data?.taskId || "6201"
    return page(resolveEquipmentTaskItems(mroMaintenanceTasks, taskId), pageNum, pageSize)
  }
  if (path === "/mroMaintenanceTaskItem/id") {
    return mroMaintenanceTasks.flatMap((task) => task.items).find((item) => String(item.id) === String(idValue)) || mroMaintenanceTasks[0].items[0]
  }

  if (path === "/mroRepair/page" || path === "/mroRepair/getPage") return page(mroRepairRows, pageNum, pageSize)
  if (path === "/mroRepair/id") return findRow(mroRepairRows, idValue)
  if (path.startsWith("/mroRepair/")) return null

  if (path === "/mroPickupOrder/page") return page(mroPickupOrders, pageNum, pageSize)
  if (path === "/mroPickupOrder/id") return findRow(mroPickupOrders, idValue)
  if (path === "/mroPickupOrder/check") return { linkedMroOutboundNo: "MRO-OUT-001" }
  if (path === "/mroPickupOrder/terminalSubmit") return { id: "6401", linkedMroOutboundNo: "MRO-OUT-001" }
  if (path.startsWith("/mroPickupOrder/")) return null

  if (path === "/mroReturnOrder/page") return page(mroReturnOrders, pageNum, pageSize)
  if (path === "/mroReturnOrder/id") return findRow(mroReturnOrders, idValue)
  if (path === "/mroReturnOrder/check") return { linkedMroInboundNo: "MRO-IN-001" }
  if (path === "/mroReturnOrder/terminalSubmit") return { id: "6501", linkedMroInboundNo: "MRO-IN-001" }
  if (path.startsWith("/mroReturnOrder/")) return null

  if (path === "/mroScrap/page") return page(mroScrapRows, pageNum, pageSize)
  if (path === "/mroScrap/save") return null

  if (path === "/mroClassify/tree") return mroClassifyTreeRows
  if (path === "/mroClassify/list" || path === "/mroCategory/list") return mroClassifyAllRows
  if (path === "/mroClassify/getOne" || path === "/mroCategory/getOne") {
    return findRow(mroClassifyAllRows, idValue) || mroClassifyAllRows[0]
  }
  if (path === "/mroClassify/page" || path === "/mroCategory/page") {
    const query = data?.queryParam ?? {}
    const parentId = String(query?.parentId ?? "0")
    const categoryNo = String(query?.mroCategoryNo || "").trim().toLowerCase()
    const categoryName = String(query?.mroCategoryName || "").trim().toLowerCase()
    const typeId = String(query?.mroTypeId || "").trim()
    const rows = mroClassifyAllRows.filter((item) => {
      if (String(item.parentId || "0") !== parentId) return false
      if (typeId && String(item.mroTypeId || item.id) !== typeId) return false
      if (categoryNo && !String(item.mroCategoryNo || "").toLowerCase().includes(categoryNo)) return false
      if (categoryName && !String(item.mroCategoryName || "").toLowerCase().includes(categoryName)) return false
      return true
    })
    return page(rows, pageNum, pageSize)
  }
  if (path === "/mroClassify/create" || path === "/mroClassify/update" || path === "/mroClassify/deleteById") return null
  if (path === "/mroType/page") return page(mroTypeRows, pageNum, pageSize)
  if (path === "/mroType/getOne") return findRow(mroTypeRows, idValue) || mroTypeRows[0]
  if (path === "/mroType/createType" || path === "/mroType/updateMroType" || path === "/mroType/deleteTypeById") return null

  return undefined
}

const resolveOtherStatic = (path: string, data: any, params: any, method: StaticMethod, pageNum: number, pageSize: number) => {
  const idValue = data?.id || params?.id || lastPathPart(path)

  if (path === "/foreign/customer/search" || path === "/foreign/customer/page") return page(customerRows, pageNum, pageSize)
  if (path === "/foreign/customer" || path.startsWith("/foreign/customer/")) {
    if (path === "/foreign/customer/state") return null
    if (/^\/foreign\/customer\/[^/]+$/.test(path)) {
      return findRow(customerRows, idValue)
    }
    return null
  }
  if (path.includes("/supplier") || path.includes("/foreign/supplier")) {
    if (path.toLowerCase().includes("page") || path.toLowerCase().includes("search")) {
      return page(supplierRows, pageNum, pageSize)
    }
    if (path.toLowerCase().includes("list") || path.toLowerCase().includes("select")) return supplierRows
    if (path.toLowerCase().includes("id") || /^\/foreign\/supplier\/[^/]+$/.test(path)) return findRow(supplierRows, idValue)
    return null
  }

  if (path === "/pc/qa/inspectItemCategory/page") return page(inspectCategoryRows, pageNum, pageSize)
  if (path === "/pc/qa/inspectItemCategory/listAll" || path === "/pc/qa/inspectItemCategory/getCategoryTree") {
    return inspectCategoryRows
  }
  if (/^\/pc\/qa\/inspectItemCategory\/[^/]+$/.test(path)) return findRow(inspectCategoryRows, idValue)
  if (path.startsWith("/pc/qa/inspectItemCategory/")) return null
  if (path === "/pc/qa/inspectItemTemplate/page") return page(inspectTemplateRows, pageNum, pageSize)
  if (path === "/pc/qa/inspectItemTemplate/listByIds") return listByIds(inspectTemplateRows, data?.idList)
  if (/^\/pc\/qa\/inspectItemTemplate\/[^/]+$/.test(path)) return findRow(inspectTemplateRows, idValue)
  if (path.startsWith("/pc/qa/inspectItemTemplate/")) return null

  if (path === "/alarm/model/listPaged") return page(alarmRows, pageNum, pageSize)
  if (path === "/alarm/model/list") return alarmRows
  if (path === "/alarm/model/getOneById") return findRow(alarmRows, params?.alarmModelId || data?.alarmModelId || idValue)
  if (path.startsWith("/alarm/model/")) return null
  if (path === "/code/getAll" || path === "/code/getAllCodeItem") return codeRows
  if (path === "/code/getAllCodeModule") return [{ id: "module-1", moduleName: "产品", moduleCode: "PRODUCT" }]
  if (path === "/code/getCodeTypeByModule") return [{ id: "type-1", typeName: "产品条码", typeCode: "PRODUCT_BARCODE" }]
  if (path.includes("/code/")) return path.toLowerCase().includes("get") ? codeRows : null
  if (path === "/sys/barcode/search") return page(barcodeRows, pageNum, pageSize)
  if (path.startsWith("/sys/barcode/") || path.startsWith("/sys/printServer/")) return path.includes("preview") ? { url: "" } : null
  if (path === "/calendar/date") return { workDate: "2026-07-01", isWorkDay: true }
  if (path === "/calendar/holiday") return []
  if (path.startsWith("/calendar/")) return null
  if (path === "/sysFault/listPaged") return page(filterSystemFaultRows(params || data || {}), pageNum, pageSize)
  if (path === "/sysFault/listByIds") return listByIds(sysFaultRows, data?.idList)
  if (path === "/sysFault/getFaultCascadeTree") return buildSystemFaultTree(Number(params?.faultType || data?.faultType || 4))
  if (path === "/sysFaultCategory/listAll") return filterSystemFaultCategories(params || data || {})
  if (path === "/sysFaultCategory/listPaged") return page(filterSystemFaultCategories(params || data || {}), pageNum, pageSize)
  if (path === "/sysFaultCategory/listByIds") return listByIds(sysFaultCategoryRows, data?.idList)
  if (path.includes("/sysFault")) return path.toLowerCase().includes("page") ? page(filterSystemFaultRows(params || data || {}), pageNum, pageSize) : null

  if (path === "/logistics/sale/search" || path === "/logistics/sale/dynamicSearch") {
    return page(state.saleOrders, pageNum, pageSize)
  }
  if (/^\/logistics\/sale\/[^/]+$/.test(path)) return findRow(state.saleOrders, idValue)
  if (path === "/logistics/sale/checkFinish" || path.startsWith("/logistics/sale/") || path === "/logistics/sale/check" || path === "/logistics/sale/unCheck") {
    return path.includes("checkFinish") ? [] : null
  }

  if (path === "/logistics/purchase/search" || path === "/logistics/purchase/dynamicSearch") {
    return page(purchaseOrders, pageNum, pageSize)
  }
  if (/^\/logistics\/purchase\/[^/]+$/.test(path)) return findRow(purchaseOrders, idValue)
  if (/^\/logistics\/purchase\/[^/]+\/detail$/.test(path)) return findRow(purchaseOrders, path.split("/")[3])?.details || []
  if (/^\/logistics\/purchase\/[^/]+\/product$/.test(path)) return products
  if (/^\/logistics\/purchase\/[^/]+\/(arrival|inbound|returnOutbound|inspectionRecord)$/.test(path)) {
    return [
      {
        id: "log-rec-1",
        no: "LOG-001",
        productModelId: "pm1",
        productModelCode: "GR-HSG-001",
        productModelName: "减速器壳体总成A型",
        quantity: 20,
        unitName: "件",
        createTime: now
      }
    ]
  }
  if (path === "/logistics/purchase/receipt/instances") return [{ id: "inst-1", barcode: "BC-PUR-001", quantity: 1 }]
  if (path === "/logistics/purchase/inbound/details") return { id: "inbound-1", records: inventoryRows }
  if (path === "/logistics/purchase/return/pagePurchaseReturnTask") return page(purchaseOrders, pageNum, pageSize)
  if (path.includes("/logistics/purchase/return/")) {
    if (path.includes("getPurchaseReturnTaskById")) return findRow(purchaseOrders, idValue)
    if (path.includes("getPurchaseReturnTaskDetail") || path.includes("getPurchaseReturnOutboundRecord")) return purchaseOrders[0].details
    return null
  }
  if (path.startsWith("/logistics/purchase")) return null

  if (path === "/logistics/delivery/unplannedDeliverySale") return page(state.saleOrders, pageNum, pageSize)
  if (path === "/logistics/delivery/getProductForDelivery") return page(products, pageNum, pageSize)
  if (
    path === "/logistics/delivery/getPackSpecVoListByDeliveryId" ||
    path === "/logistics/delivery/getTechProductList" ||
    path === "/logistics/delivery/saleProductList" ||
    path.startsWith("/logistics/delivery/getProductListById")
  ) {
    return products
  }
  if (/^\/logistics\/delivery\/[^/]+$/.test(path)) return findRow(state.deliveryPlans, idValue)
  if (/^\/logistics\/delivery\/[^/]+\/(detail|outbound|pack|delivery)$/.test(path)) {
    return [
      {
        id: "dp-detail-1",
        deliveryPlanId: "dp-1",
        productModelId: "pm1",
        productModelCode: "GR-HSG-001",
        productModelName: "减速器壳体总成A型",
        quantity: 60,
        unitName: "件",
        createTime: now
      }
    ]
  }
  if (path.startsWith("/logistics/delivery/")) return shouldReturnSuccess(path, "post") ? null : []

  if (path.includes("/logistics/warehouse") || path.includes("/warehouseInventory") || path.includes("/inventory")) {
    const rows: any[] = path.toLowerCase().includes("inventory") ? inventoryRows : warehouses
    if (path.toLowerCase().includes("page") || path.toLowerCase().includes("search")) {
      return page(rows, pageNum, pageSize)
    }
    if (path.toLowerCase().includes("list")) return rows
    return null
  }
  if (path.includes("/warehouseCheck") || path.includes("/depot") || path.includes("/allocate")) {
    return path.toLowerCase().includes("page") || path.toLowerCase().includes("search")
      ? page(inventoryRows, pageNum, pageSize)
      : inventoryRows
  }

  if (path === "/delegate/productionOrder/page") return page(delegateOrders, pageNum, pageSize)
  if (path === "/delegate/productionOrder/listByIds") return listByIds(delegateOrders, data?.idList)
  if (/^\/delegate\/productionOrder\/[^/]+$/.test(path)) return findRow(delegateOrders, idValue)
  if (path.includes("/delegate/productionOrder/")) {
    if (path.toLowerCase().includes("materials") || path.toLowerCase().includes("material")) return page(products, pageNum, pageSize)
    if (path.toLowerCase().includes("products") || path.toLowerCase().includes("outputs")) return page(products, pageNum, pageSize)
    if (path.toLowerCase().includes("records") || path.toLowerCase().includes("info")) return page(inventoryRows, pageNum, pageSize)
    return null
  }
  if (path.includes("/delegate/return")) {
    return path.toLowerCase().includes("page") ? page(delegateOrders, pageNum, pageSize) : delegateOrders
  }

  const vehicleStatic = resolveVehicleStatic(path, data, params, method, pageNum, pageSize, idValue)
  if (vehicleStatic !== undefined) return vehicleStatic

  if (path === "/andon/category/listAll") return andonCategoryRows
  if (path === "/andon/category/create" || path === "/andon/category/update" || path === "/andon/category/delete") return null
  if (path === "/andon/model/listPaged") return page(filterAndonModels(params || data || {}), pageNum, pageSize)
  if (path === "/andon/model/getAndonById") return findRow(andonModelRows, params?.id || data?.id || idValue)
  if (path === "/andon/model/getAndonCascadeTree") return buildAndonCascadeTree()
  if (path === "/andon/model/create" || path === "/andon/model/update" || path === "/andon/model/delete" || path === "/andon/model/updateEnabledStatus") return null
  if (path === "/andonCategory/Hierarchy" || path === "/andonCategory/list") return andonCategoryRows
  if (path === "/andonCategory/page") return page(andonCategoryRows, pageNum, pageSize)
  if (path.startsWith("/andonCategory/")) return null
  if (path === "/andonModel/page") return page(andonModelRows, pageNum, pageSize)
  if (path === "/andonModel/list") return andonModelRows
  if (path.startsWith("/andonModel/")) return /^\/andonModel\/[^/]+$/.test(path) ? findRow(andonModelRows, idValue) : null
  if (path === "/andonRecord/page") return page(filterAndonRecords(data?.queryParam || data || {}), pageNum, pageSize)
  if (/^\/andonRecord\/andonFeedback\/[^/]+$/.test(path)) {
    return {
      id: "feedback-1",
      andonRecordId: idValue,
      userIds: "1",
      repairEmpId: "1",
      repairEmpName: "钱维修",
      faultReason: "气压保护导致设备停机",
      faultDesc: "冲压机突然停机，检查后发现气压保护触发",
      faultHandlerMethod: "复位气压保护并检查传感器",
      remark: "已恢复生产",
      mroList: [
        {
          id: "feedback-mro-1",
          mroNo: "MRO-MD-001",
          barcode: "MRO-BC-001",
          stocks: 2,
          lifeSpan: 0.8,
          decimalNumber: 0,
          mroModelVo: {
            mroModelName: "液压密封圈",
            mroCategoryName: "备品备件",
            unitModelName: "件"
          }
        }
      ]
    }
  }
  if (path === "/andonRecord/andonFeedback/saveOrUpdate") return null
  if (/^\/andonRecord\/[^/]+$/.test(path)) return findRow(andonRecordRows, idValue)
  if (path.startsWith("/andonRecord/")) return null

  if (path === "/quality/report/unqualifiedRate/total") return page(qualityUnqualifiedRateTotalRows, pageNum, pageSize)
  if (path === "/quality/report/unqualifiedRate/detail") return page(qualityUnqualifiedRateDetailRows, pageNum, pageSize)
  if (path === "/production/report/dailyCompletionRateReport") return page(dailyCompletionRateRows, pageNum, pageSize)
  if (path === "/production/report/dailyCompletionRateReport/detail") return dailyCompletionRateDetailRows
  if (path === "/plan/report/productionRate/detail") return page(planProductionRateDetailRows, pageNum, pageSize)
  if (path === "/plan/report/productionRate/totalPage") return page(planProductionRateTotalRows, pageNum, pageSize)
  if (path === "/purchase/report/page") return page(purchaseArrivalRateRows, pageNum, pageSize)
  if (path === "/purchase/report/total") return purchaseArrivalRateTotal
  if (path.includes("/quality/report/")) return page(qualityUnqualifiedRateDetailRows, pageNum, pageSize)
  if (path.includes("/purchase/report/") || path.includes("/report/purchase")) return page(purchaseArrivalRateRows, pageNum, pageSize)
  // 生产报工记录 - 优先处理
  if (path.startsWith("/production/report")) return undefined // 交给resolveStaticMockRequest处理

  if (path.includes("/packSpec") || path.includes("/packageSpec")) return page([{ id: "ps-1", specNo: "PS-001", specName: "标准包装", createTime: now }], pageNum, pageSize)
  if (path.includes("/packageProcess")) return page([{ id: "pp-1", processNo: "PP-001", processName: "装箱", createTime: now }], pageNum, pageSize)
  if (path.includes("/bom/")) return path.toLowerCase().includes("detail") ? genericRows["/bom"]?.[0] || {} : page(genericRows["/bom"] || [], pageNum, pageSize)

  return undefined
}

export const resolveStaticMockRequest = ({ url, method = "get", data, params }: StaticMockRequest) => {
  const path = normalizePath(url)
  const requestData = parseMaybeJson<any>(data)
  const requestParams = parseMaybeJson<any>(params)
  const requestMethod = method.toLowerCase() as StaticMethod
  const { pageNum, pageSize } = getPageQuery(requestData, requestParams)
  const id = firstId(requestData, requestParams)

  if (path === "/group/user/login" || path === "/group/user/loginByScanEmployeeBarcode") {
    return ok("Bearer static-demo-token")
  }
  if (path === "/user/logout") return ok(null)
  if (path === "/user/getLoginUserDetailsByUsername") return ok(loginUser)
  if (path === "/tenant/list") return ok(tenants)
  if (path === "/sys/config/global/style") return ok(styleConfig)
  if (path === "/sys/config/global/production") {
    if (requestMethod === "post") {
      Object.assign(globalProductionConfig, requestData || {})
      return ok(null)
    }
    return ok(globalProductionConfig)
  }
  if (path === "/query-config/query") {
    const urlQuery = new URLSearchParams(String(url || "").split("?")[1] || "")
    const queryKey = String(requestParams?.queryKey || urlQuery.get("queryKey") || "")
    if (queryKey === "ProductionOrder") return ok(productionOrderQueryConfig)
    if (queryKey === "SaleOrder") return ok(saleOrderQueryConfig)
    if (queryKey === "PurchaseOrder") return ok(purchaseOrderQueryConfig)
    return ok({ queryInfo: { queryKey, queryName: queryKey, description: null }, columns: [] })
  }

  const productManagementStatic = resolveProductManagementStatic(path, requestData, requestParams, requestMethod, pageNum, pageSize)
  if (productManagementStatic !== undefined) return ok(productManagementStatic)

  const staffOrgStatic = resolveStaffOrgStatic(path, requestData, requestParams, requestMethod, pageNum, pageSize)
  if (staffOrgStatic !== undefined) return ok(staffOrgStatic)

  if (path === "/user/getUserInfoByIdOrName") return ok(users[0])
  if (path.includes("/user/") && path.toLowerCase().includes("paged")) return ok(page(users, pageNum, pageSize))
  if (path.includes("/user/") && path.toLowerCase().includes("list")) return ok(users)
  if (path === "/role/getRoleListWithUsers") return ok([{ id: "1", roleName: "管理员", roleCode: "admin", userList: users }])
  if (path.includes("/role/")) return ok([])
  if (path.includes("/emp/") || path.includes("/employee/")) {
    if (path.toLowerCase().includes("page") || path.toLowerCase().includes("paged")) {
      return ok(page(employeeRows, pageNum, pageSize))
    }
    if (path.toLowerCase().includes("department")) return ok(departmentRows)
    if (path.toLowerCase().includes("position") || path.toLowerCase().includes("job")) return ok(positionRows)
    if (path.toLowerCase().includes("byid") || path.toLowerCase().includes("id")) return ok(employeeRows[0])
    return ok(employeeRows)
  }
  if (path.includes("/department/")) return ok(departmentRows)
  if (path.includes("/position/") || path.includes("/job/")) return ok(positionRows)

  if (path === "/fm/getModelList" || path === "/fm/list") return ok(filterFactoryModelListRows(requestParams || requestData || {}))
  if (path === "/fm/getModelTree") return ok(factoryTree)
  if (path.startsWith("/fm/getModelTreeByLeafType")) {
    const leafType = Number(lastPathPart(path) || 0)
    return ok(buildFactoryLeafTree(leafType))
  }
  if (path.includes("/fm/tree")) return ok(factoryTree)
  if (path === "/fm/levelTag/next") return ok(factoryChildTypeMap[String(requestParams?.parentId || requestData?.parentId || "")] || [])
  if (path === "/fm/getEquipment/" || path.startsWith("/fm/getEquipment/")) {
    return ok([{ id: "eq-1", equipmentNo: "EQ-001", code: "EQ-001", name: "冲压机-01" }])
  }
  if (path === "/fm/updateEquipment" || path === "/fm/create" || path === "/fm/update" || path.startsWith("/fm/enable/") || path.startsWith("/fm/disable/") || path.startsWith("/fm/location/")) return ok(null)
  if (path.startsWith("/fm/page")) return ok(page(filterFactoryModelRows(requestData?.queryParam || requestData || {}), pageNum, pageSize))
  if (/^\/fm\/[^/]+$/.test(path)) {
    const targetId = lastPathPart(path)
    return ok(factoryModelRows.find((row) => String(row.id) === targetId || String(row.entityId) === targetId) || factoryModelRows[0])
  }

  const schedulingStatic = resolveSchedulingStatic(path, requestData, requestMethod, pageNum, pageSize)
  if (schedulingStatic !== undefined) return ok(schedulingStatic)

  const productRecordStatic = resolveProductRecordStatic(path, requestData, requestParams, pageNum, pageSize)
  if (productRecordStatic !== undefined) return ok(productRecordStatic)

  const documentStatic = resolveDocumentStatic(path, requestData, requestParams, pageNum, pageSize)
  if (documentStatic !== undefined) return ok(documentStatic)

  if (path.includes("/logistics/warehouse/search") || path.includes("/warehouse/page")) {
    return ok(page(warehouses, pageNum, pageSize))
  }
  if (path.includes("/logistics/pda/common/warehouse") || path.includes("/warehouse/list")) return ok(warehouses)
  if (path.includes("/warehouseLocation") || path.includes("/location")) return ok([])

  if (path.includes("/product/category/getCategoryTree")) return ok(productCategories)
  if (path.includes("/product/category/getPaged")) return ok(page(productCategories, pageNum, pageSize))
  if (path.includes("/product/model/getPaged") || path.includes("/product/model/productWithProcess/page")) {
    return ok(page(products, pageNum, pageSize))
  }
  if (path.includes("/product/model/getById")) return ok(products[0])
  if (path.includes("/product/model/getByIdList")) return ok(products)
  if (path.includes("/product/model/unit/getUnitList")) return ok(page(units, pageNum, pageSize))
  if (path.includes("/product/model/unit/getUnitSelectOptions") || path.includes("/unit")) return ok(units)
  if (path.includes("/product/model/inspectItemDetail") || path.includes("/inspectOption")) return ok([])
  if (path.includes("/product/")) return ok([])

  if (path === "/tech/page") {
    const query = requestData?.queryParam || requestData || {}
    return ok(page(filterJiangdiCraftRows(query), pageNum, pageSize))
  }
  if (path === "/tech/list") {
    const query = requestData?.queryParam || requestData || {}
    return ok(filterJiangdiCraftRows(query))
  }
  if (path === "/tech/create") {
    return ok({ id: nextId("tech"), no: String(requestData?.no || `T-JD-${idSeq}`), ...requestData })
  }
  if (path === "/tech/update" || path.startsWith("/tech/delete/")) return ok(null)

  if (path === "/tech_process/page") {
    const query = requestData?.queryParam || requestData || {}
    const rows = staticCraftRoutes.filter((route) => {
      if (query.routePurpose) {
        if (String(route.routePurpose || "standard") !== String(query.routePurpose)) return false
      } else if (String(route.routePurpose || "standard") === "rework-template") {
        return false
      }
      const productName = String(route.productModel?.name || "")
      const productNo = String(route.productModel?.code || "")
      const routeNo = String(route.no || "")
      if (query.queryProductName && !productName.includes(String(query.queryProductName))) return false
      if (query.queryProductNo && !productNo.includes(String(query.queryProductNo))) return false
      if (query.exactProductNo && productNo !== String(query.exactProductNo)) return false
      if (query.techProcessNo && !routeNo.includes(String(query.techProcessNo))) return false
      if (query.sourceType !== undefined && query.sourceType !== "" && Number(route.sourceType) !== Number(query.sourceType)) return false
      if (Array.isArray(query.publishStatusList) && query.publishStatusList.length) {
        return query.publishStatusList.map((item: unknown) => Number(item)).includes(Number(route.publishStatus))
      }
      if (query.publishStatus !== undefined && query.publishStatus !== "" && Number(route.publishStatus) !== Number(query.publishStatus)) return false
      return true
    })
    return ok(page(rows, pageNum, pageSize))
  }
  if (path === "/tech_process/listByIds") {
    const ids = toArrayIdSet(requestData.idList)
    return ok(staticCraftRoutes.filter((route) => ids.has(String(route.id))))
  }
  if (path === "/tech_process/saveOrUpdate") {
    const processId = String(requestData?.processId || "")
    const isReworkTemplate = String(requestData?.routePurpose || "") === "rework-template"
    if (processId) {
      const route = staticCraftRoutes.find((item) => String(item.id) === processId)
      if (!route) return ok(null)
      Object.assign(route, {
        remarks: requestData?.remarks !== undefined ? String(requestData.remarks || "") : route.remarks,
        no: requestData?.no ? String(requestData.no) : route.no,
        routePurpose: requestData?.routePurpose || route.routePurpose,
        updateTime: now
      })
      return ok(route)
    }

    const routeId = nextId(isReworkTemplate ? "cr-rework" : "cr")
    const techVersionId = nextId(isReworkTemplate ? "tv-rework" : "tv")
    const product =
      !isReworkTemplate && requestData?.productionModelId
        ? products.find((item: any) => String(item.id) === String(requestData.productionModelId))
        : undefined
    const routeProduct = product
      ? {
          id: product.id,
          code: product.productModelCode,
          name: product.productModelName,
          specification: product.productModelSpec,
          defaultUnitId: product.defaultUnitId,
          defaultUnitName: product.defaultUnitName,
          productModelUnitList: product.productModelUnitList || []
        }
      : null
    const craft = alignedCrafts[0]
    const route = {
      id: routeId,
      techVersionId,
      name: isReworkTemplate ? "新建返工工艺模板" : routeProduct?.name || "新建工艺路线",
      no: String(requestData?.no || "").trim() || (isReworkTemplate ? `RW-CR-${idSeq}` : `CR-${idSeq}`),
      remarks: String(requestData?.remarks || ""),
      status: 1,
      publishStatus: 1,
      routePurpose: requestData?.routePurpose || "standard",
      sourceType: 1,
      productModel: routeProduct,
      productModelUnitList: routeProduct?.productModelUnitList || [],
      unitItem: routeProduct ? craftRouteUnit : null,
      tech: buildCraftRouteTech(craft),
      techDetail: {
        id: 1,
        nodeCount: 0,
        enableProductModelIds: routeProduct?.id ? [routeProduct.id] : [],
        createBy: 1,
        createTime: now,
        updateBy: 1,
        updateTime: now
      },
      techVersion: {
        id: techVersionId,
        name: isReworkTemplate ? "新建返工工艺模板" : routeProduct?.name || "新建工艺路线",
        no: `TV-${String(techVersionId).toUpperCase()}`,
        version: "1.0",
        nature: 1,
        queryProductName: routeProduct?.name || "",
        queryProductNo: routeProduct?.code || "",
        remarks: String(requestData?.remarks || ""),
        sourceType: 1,
        status: 1,
        techDetailId: 1,
        techId: craft.id,
        techNo: craft.no,
        type: 1,
        bizType: 2,
        createBy: 1,
        createTime: now,
        updateBy: 1,
        updateTime: now,
        validityStart: "",
        validityEnd: ""
      },
      createBy: "1",
      createTime: now,
      updateBy: "1",
      updateTime: now
    }
    staticCraftRoutes.unshift(route as any)
    staticTechProcessesByVersion[techVersionId] = []
    return ok(route)
  }
  if (path === "/tech_process/publish" || path.startsWith("/tech_process/delete/") || path.startsWith("/tech_process/deprecated/")) return ok(null)
  if (path === "/tech_process/snapshot") {
    return ok({
      ...staticCraftRoutes.find((route) => String(route.id) === String(requestData.techProcId)) || staticCraftRoutes[0],
      id: "cr-copy",
      techVersionId: "tv-copy",
      no: String(requestData.no || "CR-002-COPY"),
      remarks: String(requestData.remarks || ""),
      publishStatus: 1,
      sourceType: 3
    })
  }
  if (path.startsWith("/tech_process/processList/")) {
    const techVersionId = lastPathPart(path)
    return ok(staticTechProcessesByVersion[techVersionId] || staticTechProcessesByVersion.tv2)
  }
  if (path.startsWith("/tech_process/sonProcessInfo/")) {
    const techVersionId = lastPathPart(path)
    return ok(
      staticCraftRoutes.find((route) => String(route.techVersionId) === String(techVersionId)) ||
        staticCraftRoutes.find((route) => String(route.id) === String(techVersionId)) ||
        staticCraftRoutes[0]
    )
  }
  if (path.startsWith("/tech_process/processControlPlan/list/")) {
    return ok(buildStaticProcessControlPlan(lastPathPart(path)))
  }
  if (path === "/tech_process/processControlPlan/save" || path === "/tech_process/processControlPlan/import") return ok(null)
  if (path.startsWith("/tech_process/processControlPlan/export/")) return ok(null)
  if (/^\/tech_process\/[^/]+$/.test(path)) {
    const targetId = lastPathPart(path)
    return ok(staticCraftRoutes.find((route) => String(route.id) === String(targetId)) || staticCraftRoutes[0])
  }
  if (path === "/techVersion/techStandard/getTechStandardMaterialList") {
    const techVersionId = String(requestParams.techVersionId || requestData.techVersionId || "tv2")
    return ok((staticTechProcessesByVersion[techVersionId] || []).map((process, index) => ({
      id: `mat-${techVersionId}-${process.processSerial}`,
      productModelId: index === 0 ? "pm5" : "pm1",
      productModelName: index === 0 ? "球墨铸铁锭" : `${process.name || processNameBySerial[process.processSerial]}过程件`,
      productModelCode: index === 0 ? "RM-IRON-001" : "自动生成",
      baseAmount: 1,
      quantity: 1,
      sourceProcessSerial: index === 0 ? "" : String((staticTechProcessesByVersion[techVersionId] || [])[index - 1]?.processSerial || ""),
      usedByChildrenProcessSerial: process.processSerial,
      unitId: "1",
      unitName: "件",
      feedingControl: 1,
      replaceItemList: []
    })))
  }
  if (path === "/techVersion/techStandard/getTechStandardManList") {
    const techVersionId = String(requestParams.techVersionId || requestData.techVersionId || "tv2")
    const processId = String(requestParams.processId || requestData.processId || "")
    return ok(buildStaticTechStandardManRows(techVersionId, processId))
  }
  if (path === "/techVersion/techStandard/getTechStandardMroList") {
    const techVersionId = String(requestParams.techVersionId || requestData.techVersionId || "tv2")
    const processId = String(requestParams.processId || requestData.processId || "")
    return ok(buildStaticTechStandardMroRows(techVersionId, processId))
  }
  if (path === "/techVersion/techStandard/getTechStandardProdUnitList") {
    const techVersionId = String(requestParams.techVersionId || requestData.techVersionId || "tv2")
    const processId = String(requestParams.processId || requestData.processId || "")
    return ok(buildStaticTechStandardProdUnitRows(techVersionId, processId))
  }
  if (path === "/techVersion/techStandard/getTechStandardMachineList" || path === "/techVersion/techStandard/getTechStandardMethodList") {
    const techVersionId = String(requestParams.techVersionId || requestData.techVersionId || "tv2")
    const processId = String(requestParams.processId || requestData.processId || "")
    return ok(getStaticTechStandardProcesses(techVersionId, processId).map((process, index) => ({
      id: `${path.split("/").pop()}-${techVersionId}-${process.processSerial}`,
      processSerial: process.processSerial,
      type: 1,
      refId: String(index + 1),
      quantity: 1,
      priority: 1,
      workerNum: Number(process.workerNum || (index === 0 ? 2 : 1)),
      fileId: `route-doc-${process.processSerial}`,
      facilityName: process.workstationName || process.productionUnitName || "生产单元"
    })))
  }
  if (path === "/techVersion/techStandard/getTechStandardOutputList") {
    const techVersionId = String(requestParams.techVersionId || requestData.techVersionId || "tv2")
    const processes = staticTechProcessesByVersion[techVersionId] || []
    return ok(processes.map((process, index) => ({
      id: `out-${techVersionId}-${process.processSerial}`,
      processSerial: process.processSerial,
      productModelId: index === processes.length - 1 ? "pm1" : `wip-${process.processSerial}`,
      productModelName: index === processes.length - 1 ? "减速器壳体总成A型" : `${process.name}过程件`,
      productModelCode: index === processes.length - 1 ? "GR-HSG-001" : "自动生成",
      quantity: 1,
      unitId: "1",
      unitName: "件",
      sourceProcessId: process.id,
      sourceProcessSerial: process.processSerial
    })))
  }
  if (path === "/techVersion/techStandard/getTechStandardMeasurementList") {
    const techVersionId = String(requestParams.techVersionId || requestData.techVersionId || "tv2")
    return ok(buildStaticProcessControlPlan(techVersionId))
  }
  if (path === "/techVersion/techStandard/getPackStandard") {
    return ok({ container: 1, isCreateNewBatch: 0, packMaterialList: [{ id: "pack-1", productModelName: "标准包装", quantity: 1, unitId: "1", unitName: "件" }] })
  }
  if (path.startsWith("/techVersion/techStandard/")) return ok(null)

  if (path === "/productionOrder/page" || path === "/productionOrder/dynamicPage") {
    return ok(page(queryProductionOrderRows(requestData), pageNum, pageSize))
  }
  if (path === "/productionOrder/listByIds") {
    const ids = toArrayIdSet(requestData.idList)
    return ok(state.productionOrders.filter((order) => ids.has(String(order.id))).map(withComputedOrderFields))
  }
  if (path === "/productionOrder/saveOrUpdate") {
    const selectedSaleIds = Array.isArray(requestData.saleIds) ? requestData.saleIds.map((item: unknown) => String(item)) : []
    const saleRows = state.saleOrders.filter((sale) => selectedSaleIds.includes(String(sale.id)))
    const matchedProduct = products.find((product) => String(product.id) === String(requestData.productModelId || ""))
    const orderId = String(requestData.id || nextId("po"))
    const nextOrder = {
      id: orderId,
      no: String(requestData.no || `MOCK-ORDER-${idSeq}`),
      source: Number(requestData.source ?? 1),
      type: Number(requestData.type ?? 1),
      status: 5,
      saleCode: saleRows.map((sale) => sale.saleCode).filter(Boolean).join(","),
      orderAmount: Number(requestData.orderAmount || 0),
      productModelId: String(requestData.productModelId || matchedProduct?.id || "pm1"),
      productModelCode: String(requestData.productModelNo || matchedProduct?.productModelCode || "GR-HSG-001"),
      productModelName: String(requestData.productModelName || matchedProduct?.productModelName || "减速器壳体总成A型"),
      scheduledQuantity: 0,
      completeAmount: 0,
      productionProgress: 0,
      unitName: String(requestData.unitName || matchedProduct?.unitName || "件"),
      unitId: String(requestData.unitId || matchedProduct?.unitId || "1"),
      unitItem: { id: String(requestData.unitId || "1"), unitName: String(requestData.unitName || "件") },
      techProcessId: String(requestData.techProcessId || "tp-1"),
      techProcess: defaultTechProcess(String(requestData.techProcessId || "tp-1")),
      deliveryDate: String(requestData.deliveryDate || ""),
      remark: String(requestData.remark || ""),
      specifiedInboundWarehouseId: String(requestData.specifiedInboundWarehouseId || "1"),
      specifiedInboundWarehouseName: String(requestData.specifiedInboundWarehouseName || "本地演示仓库"),
      saleVOList: saleRows,
      productModel: {
        id: String(requestData.productModelId || matchedProduct?.id || "pm1"),
        name: String(requestData.productModelName || matchedProduct?.productModelName || "减速器壳体总成A型"),
        code: String(requestData.productModelNo || matchedProduct?.productModelCode || "GR-HSG-001")
      },
      createTime: now,
      updateTime: now
    }
    const idx = state.productionOrders.findIndex((order) => String(order.id) === orderId)
    if (idx > -1) {
      state.productionOrders[idx] = {
        ...state.productionOrders[idx],
        ...nextOrder,
        createTime: state.productionOrders[idx].createTime,
        updateTime: now
      }
    } else {
      state.productionOrders.unshift(nextOrder)
    }
    return ok(null)
  }
  if (path === "/productionOrder/check") {
    const targetId = String(requestData.id || "")
    state.productionOrders = state.productionOrders.map((order) =>
      String(order.id) === targetId ? { ...order, status: 1, updateTime: now } : order
    )
    return ok({ result: targetId ? 1 : 0, message: targetId ? "ok" : "id is required" })
  }
  if (path === "/productionOrder/unCheck") {
    const targetId = String(requestData.id || "")
    state.productionOrders = state.productionOrders.map((order) =>
      String(order.id) === targetId ? { ...order, status: 5, updateTime: now } : order
    )
    return ok(null)
  }
  if (path === "/productionOrder/delete") {
    const removeIds = toArrayIdSet(requestData.idList)
    state.productionOrders = state.productionOrders.filter((order) => !removeIds.has(String(order.id)))
    return ok(null)
  }
  if (path === "/productionOrder/unPlanAmount") return ok(0)
  if (path === "/productionOrder/searchSales") {
    const productId = String(requestData.queryParam?.id || "")
    const rows = state.saleOrders.filter((sale) => {
      if (!productId) return true
      return (sale.saleDetailVOList || []).some((detail: any) => String(detail.productModelId) === productId)
    })
    return ok(page(rows, pageNum, pageSize))
  }
  if (path === "/productionOrder/searchSaleByIds") {
    const ids = toArrayIdSet(requestData.idList)
    return ok(state.saleOrders.filter((sale) => ids.has(String(sale.id))))
  }
  if (
    path === "/productionOrder/copyTechProcessToProduction" ||
    path === "/productionOrder/autoCopyTechProcessToProduction" ||
    path === "/productionOrder/createOrderProcess"
  ) {
    return ok(buildOrderTechProcess(requestData))
  }
  if (path === "/productionOrder/add") {
    const orderId = String(requestData.productionOrderId || requestData.orderId || requestData.id || "")
    const addAmount = Number(requestData.addAmount ?? requestData.quantity ?? 0)
    const order = findProductionOrder(orderId)
    if (order && addAmount > 0) {
      state.productionOrderReAddRecords.unshift({
        recordId: nextId("poadd"),
        orderId: String(order.id),
        orderNo: String(order.no || ""),
        source: Number(order.source ?? 1),
        status: 0,
        productModelId: String(order.productModelId || ""),
        productModelCode: String(order.productModelCode || ""),
        productModelName: String(order.productModelName || ""),
        orderAmount: Number(order.orderAmount || 0),
        addAmount,
        unitId: String(order.unitId || ""),
        unitName: String(order.unitName || ""),
        deliveryDate: String(requestData.deliveryDate || ""),
        createTime: now,
        remark: String(requestData.remark || requestData.remarks || "")
      })
      state.productionOrders = state.productionOrders.map((item) =>
        String(item.id) === orderId ? { ...item, orderAmount: Number(item.orderAmount || 0) + addAmount } : item
      )
    }
    return ok(null)
  }
  if (path === "/productionOrder/add/page") {
    return ok(page(filterReAddRecords(state.productionOrderReAddRecords, requestData.queryParam || {}), pageNum, pageSize))
  }
  if (path.startsWith("/productionOrder/add/check/")) {
    const recordId = path.split("/").pop()
    state.productionOrderReAddRecords = state.productionOrderReAddRecords.map((record) =>
      String(record.recordId) === String(recordId) ? { ...record, status: 1 } : record
    )
    return ok(null)
  }
  if (path === "/productionOrder/add/withdraw") {
    const recordId = String(requestData.id || "")
    const target = state.productionOrderReAddRecords.find((record) => String(record.recordId) === recordId)
    if (target && Number(target.status) === 0) {
      state.productionOrders = state.productionOrders.map((order) =>
        String(order.id) === String(target.orderId)
          ? { ...order, orderAmount: Number(order.orderAmount || 0) - Number(target.addAmount || 0) }
          : order
      )
      state.productionOrderReAddRecords = state.productionOrderReAddRecords.filter(
        (record) => String(record.recordId) !== recordId
      )
    }
    return ok(null)
  }
  if (path === "/productionOrder/add/query") {
    return ok(state.productionOrderReAddRecords.filter((record) => String(record.orderId) === String(requestData.id || "")))
  }
  if (path === "/productionOrder/add/hasUncheckedRecord") {
    return ok(
      state.productionOrderReAddRecords.some(
        (record) => String(record.orderId) === String(requestData.id || "") && Number(record.status) === 0
      )
    )
  }
  if (path === "/productionOrder/computeMaterials") {
    const target = state.productionOrders.find(
      (order) => String(order.techProcessId || "") === String(requestParams?.techProcessId || requestData?.techProcessId || "")
    )
    return ok(Array.isArray(target?.materials) ? target.materials : [])
  }
  if (/^\/productionOrder\/[^/]+\/outbound$/.test(path)) return ok([])
  if (/^\/productionOrder\/[^/]+\/pack$/.test(path)) return ok(state.packageTasks)
  if (/^\/productionOrder\/[^/]+$/.test(path)) {
    const targetId = path.split("/").pop()
    return ok(withComputedOrderFields(findProductionOrder(String(targetId)) || state.productionOrders[0]))
  }

  if (path === "/productionTask/page") return ok(page(state.productionTasks, pageNum, pageSize))
  if (path === "/productionTask/listByIds") {
    const ids = toArrayIdSet(requestData.idList)
    return ok(state.productionTasks.filter((task) => ids.has(String(task.id))))
  }
  if (path === "/productionTask/archive" || path === "/productionTask/close") return ok(null)
  if (path === "/productionTask/getAvailablePlanQuantity") return ok(0)
  if (path === "/productionTask/add") return ok(Number(requestData.quantity || 0))
  if (path === "/productionTask/children/page") return ok(page([], pageNum, pageSize))
  if (path === "/productionTask/reSchedule") return ok(null)
  if (/^\/productionTask\/[^/]+$/.test(path)) {
    const targetId = path.split("/").pop()
    return ok(state.productionTasks.find((task) => String(task.id) === String(targetId)) || state.productionTasks[0])
  }

  if (path === "/productionOrderPlan/list") return ok(buildProductionOrderPlanPreview(requestData))
  if (path === "/productionOrderPlan/getPlanDetail") {
    return ok({
      id: requestData.taskId || "plan-po-1-1",
      taskId: requestData.taskId || "plan-po-1-1",
      taskType: requestData.taskType || 1,
      entityId: requestData.entityId || "1",
      entityName: "本地演示工厂",
      productModelName: "减速器壳体总成A型",
      beginTime: createTimeRange().beginTime,
      endTime: createTimeRange().endTime
    })
  }
  if (path === "/productionOrderPlan/task/getPublishStatus") {
    return ok(state.productionTasks.some((task) => Number(task.status) === 251) || state.scheduleProcessOverrides.size ? 1 : 0)
  }
  if (path === "/productionOrderPlan/getFacilityWorkerNums") {
    return ok([{ entityId: "1", entityName: "本地演示工厂", level: 1, taskNum: state.productionTasks.length, workerNum: 4 }])
  }
  if (path === "/productionOrderPlan/procManager") {
    return ok({ id: "proc-1", procDefId: "proc-1", procDefName: "默认流程", status: 1, createTime: now, updateTime: now })
  }
  if (path === "/productionOrderPlan/procManager/list") return ok([])
  if (path === "/productionOrderPlan/processSerial/list") return ok([])
  if (path === "/productionOrderPlan/inferSerialAmount") return ok([])
  if (path === "/productionOrderPlan/convertToDelegate") return ok(null)
  if (path === "/productionOrderPlan/getCTs") return ok([])
  if (path === "/productionOrderPlan/batchQuery") {
    const orderIds = Array.isArray(requestData.orderIds) ? requestData.orderIds.map((item: unknown) => String(item)) : []
    return ok(orderIds.map(buildSchedulePlanByOrderItem))
  }
  if (path === "/productionOrderPlan/batchQueryScheduling") {
    const orderIds = Array.isArray(requestData.orderIds) ? requestData.orderIds.map((item: unknown) => String(item)) : []
    const result = orderIds.map(buildUnpublishedScheduleByOrder)
    return ok(result)
  }
  if (path === "/productionOrderPlan/batchUpdateScheduling") {
    const list = Array.isArray(requestData.updateReqList) ? requestData.updateReqList : []
    list.forEach((item: any) => {
      const rowId = String(item.id || "")
      if (!rowId) return
      const prev = state.scheduleProcessOverrides.get(rowId) || {}
      state.scheduleProcessOverrides.set(rowId, {
        ...prev,
        planAmount: item.mainProductQuantity ?? prev.planAmount,
        entityIdList: Array.isArray(item.entityIdList) ? item.entityIdList : prev.entityIdList,
        planBeginTime: item.beginTime ?? prev.planBeginTime,
        planEndTime: item.endTime ?? prev.planEndTime,
        status: prev.status || 251
      })
    })
    return ok(null)
  }
  if (path === "/productionOrderPlan/batchPublishScheduling") {
    publishSchedulingTasks(requestData.taskIdList, now)
    return ok(null)
  }
  if (path === "/productionOrderPlan/cancelAllUnpublishedScheduling") {
    state.productionTasks = state.productionTasks.filter((task) => Number(task.status) !== 251)
    state.scheduleProcessOverrides.clear()
    return ok(null)
  }
  if (path === "/productionOrderPlan/autoSchedule" || path === "/productionOrderPlan/addSchedule") {
    // 支持 orderIds（数组）和 orderId（单数）两种格式
    const orderId = requestData.orderId || requestData.orderIds?.[0]
    if (orderId) {
      const rowId = `uns-${orderId}-1`
      const planAmount = Number(requestData.planAmount || findProductionOrder(String(orderId))?.orderAmount || 0)
      state.scheduleProcessOverrides.set(rowId, {
        planAmount,
        entityIdList: Array.isArray(requestData.entityIdList) ? requestData.entityIdList : (Array.isArray(requestData.productionUnitIds) ? requestData.productionUnitIds : ["1"]),
        planBeginTime: requestData.planBeginTime || createTimeRange().beginTime,
        planEndTime: requestData.planEndTime || createTimeRange().endTime,
        orderNo: requestData.orderNo || "",
        productModelName: requestData.productModelName || "",
        status: 251
      })
      // 更新订单的已排产数量
      const order = findProductionOrder(String(orderId))
      if (order) {
        const orderIndex = state.productionOrders.findIndex(o => String(o.id) === String(orderId))
        if (orderIndex > -1) {
          state.productionOrders[orderIndex] = {
            ...state.productionOrders[orderIndex],
            scheduledQuantity: Number(state.productionOrders[orderIndex].scheduledQuantity || 0) + planAmount
          }
        }
      }
    }
    return ok(null)
  }
  if (path.startsWith("/productionOrderPlan/")) return ok(null)

  if (path === "/production/report/page") {
    // 解析查询参数
    const queryParam = requestData?.queryParam || requestData || {}
    let filteredReports = [...state.productionReports]

    // 调试日志
    console.log("原始数据条数:", filteredReports.length)
    console.log("查询参数:", queryParam)

    // 根据审核状态筛选
    const { reviewStatus } = queryParam
    if (reviewStatus !== undefined && reviewStatus !== "") {
      filteredReports = filteredReports.filter((report) => {
        const isReviewed = report.reviewedQty !== null && report.reviewedQty !== undefined
        if (reviewStatus === "0") {
          return !isReviewed
        } else if (reviewStatus === "1") {
          return isReviewed
        }
        return true
      })
    }

    console.log("筛选后数据条数:", filteredReports.length)
    return ok(page(filteredReports, pageNum, pageSize))
  }
  if (path === "/production/report/info") {
    return ok(state.productionReports.find((report) => String(report.id) === String(requestData.id)) || state.productionReports[0])
  }
  // 审核报工记录
  if (path === "/production/report/review") {
    const { id, reviewedQty, physicalCheckQty, reviewer, remark } = requestData || {}
    const reportIndex = state.productionReports.findIndex(r => String(r.id) === String(id))
    if (reportIndex > -1) {
      state.productionReports[reportIndex] = {
        ...state.productionReports[reportIndex],
        reviewedQty: reviewedQty || physicalCheckQty,
        physicalCheckQty,
        reviewer,
        reviewTime: now,
        remark
      }
      // 添加审核记录
      state.productionReportReviews.push({
        id: `review-${Date.now()}`,
        reportId: id,
        reportNo: state.productionReports[reportIndex].productionExecutionNo,
        originalQty: state.productionReports[reportIndex].reportQty,
        reviewedQty: reviewedQty || physicalCheckQty,
        physicalCheckQty,
        reviewer,
        reviewTime: now,
        remark,
        createTime: now
      })
      // 保存到 localStorage
      saveToLocalStorage(STORAGE_KEY_PRODUCTION_REPORTS, state.productionReports)
      saveToLocalStorage(STORAGE_KEY_PRODUCTION_REPORT_REVIEWS, state.productionReportReviews)
    }
    return ok(null)
  }
  // 获取审核记录
  if (path === "/production/report/review/records") {
    const reportId = requestData?.reportId
    const records = reportId
      ? state.productionReportReviews.filter(r => String(r.reportId) === String(reportId))
      : state.productionReportReviews
    return ok(page(records, pageNum, pageSize))
  }

  if (path === "/logistics/delivery/search") return ok(page(state.deliveryPlans, pageNum, pageSize))
  if (path === "/logistics/delivery/schedule/packTask/page") return ok(page(state.packageTasks, pageNum, pageSize))
  if (path === "/logistics/delivery/schedule/taskInfo") {
    return ok(state.packageTasks.find((task) => String(task.id) === String(requestData.id)) || state.packageTasks[0])
  }
  if (path === "/logistics/delivery/schedule/scheduleTaskList") {
    const deliveryPlanId = String(requestData.deliveryPlanId || "")
    return ok(
      state.packageScheduleByPlan.get(deliveryPlanId) || {
        deliveryPlanId,
        idList: [],
        scheduleTaskList: []
      }
    )
  }
  if (path.startsWith("/logistics/delivery/schedule/")) return ok(null)

  const qualityStatic = resolveQualityStatic(path, requestData, requestParams, pageNum, pageSize)
  if (qualityStatic !== undefined) return ok(qualityStatic)

  const equipmentStatic = resolveEquipmentStatic(path, requestData, requestParams, pageNum, pageSize)
  if (equipmentStatic !== undefined) return ok(equipmentStatic)

  const mroStatic = resolveMroStatic(path, requestData, requestParams, pageNum, pageSize)
  if (mroStatic !== undefined) return ok(mroStatic)

  const otherStatic = resolveOtherStatic(path, requestData, requestParams, requestMethod, pageNum, pageSize)
  if (otherStatic !== undefined) return ok(otherStatic)

  if (path.includes("/fileResource/upload")) return ok([id])
  if (path.includes("/fileResource/filePathHandler")) return ok(commonFile)
  if (path.includes("/fileResource") || path.includes("/directory")) return ok([])

  if (path.includes("/sys/config/")) return ok({})
  if (path.includes("/flowable/")) return ok(path.includes("/page") || path.includes("/List") ? emptyPage(requestData, requestParams) : {})
  const rows = getGenericRows(path)
  if (rows.length) {
    if (path.includes("/page") || path.includes("/paged") || path.includes("/getPaged") || path.includes("/getListPaged")) {
      return ok(page(rows, pageNum, pageSize))
    }
    if (path.endsWith("/id") || path.includes("/detail") || path.includes("/getById")) {
      return ok(rows.find((row) => String(row.id) === id) || rows[0])
    }
    if (path.includes("/list") || path.includes("/tree") || path.includes("/options")) {
      return ok(rows)
    }
  }
  if (path.includes("/report/")) return ok(emptyPage(requestData, requestParams))
  if (path.includes("/page") || path.includes("/paged") || path.includes("/getPaged") || path.includes("/getListPaged")) {
    return ok(emptyPage(requestData, requestParams))
  }
  if (path.endsWith("/id") || path.includes("/detail") || path.includes("/getById")) return ok({ id })
  if (path.includes("/list") || path.includes("/tree") || path.includes("/options")) return ok([])
  if (shouldReturnSuccess(path, requestMethod)) return ok(null)

  if (requestMethod === "post") return ok(emptyPage(requestData, requestParams))
  if (requestMethod === "get") return ok([])
  return ok(null)
}
