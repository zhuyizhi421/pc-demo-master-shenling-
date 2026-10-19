import {
  createRouter,
  createWebHashHistory,
  type NavigationGuardNext,
  type RouteLocationNormalized,
  type RouteRecordRaw
} from "vue-router"

import { EnumEquipmentExceptionSourceType } from "@/constant/enums"
/* Layout */
import Layout from "@/layout/index.vue"

/**
 * Note: 路由配置项
 *
 * hidden: true                     // 当设置 true 的时候该路由不会再侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
 * alwaysShow: true                 // 当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式--如组件页面
 *                                  // 只有一个时，会将那个子路由当做根路由显示在侧边栏--如引导页面
 *                                  // 若你想不管路由下面的 children 声明的个数都显示你的根路由
 *                                  // 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
 * redirect: noRedirect             // 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'               // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
 * query: '{"id": 1, "name": "ry"}' // 访问路由的默认传递参数
 * roles: ['admin', 'common']       // 访问路由的角色权限
 * permissions: ['a:a:a', 'b:b:b']  // 访问路由的菜单权限
 * meta : {
    noCache: true                   // 如果设置为true，则不会被 <keep-alive> 缓存(默认 false)
    title: 'title'                  // 设置该路由在侧边栏和面包屑中展示的名字
    icon: 'svg-name'                // 设置该路由的图标，对应路径src/assets/icons/svg
    breadcrumb: false               // 如果设置为false，则不会在breadcrumb面包屑中显示
    activeMenu: '/system/user'      // 当路由设置了该属性，则会高亮相对应的侧边栏。
  }
 */
export interface RouteConfig {
  path: string
  component?: any
  parentPath?: string
  beforeEnter?: any
  name: string
  hidden?: boolean
  alwaysShow?: boolean
  redirect?: string
  query?: string
  roles?: string[]
  permissions?: string[]
  children?: RouteConfig[]
  meta?: {
    noCache?: boolean
    title?: string
    icon?: string
    menuCode?: string
    breadcrumb?: boolean
    activeMenu?: string
    sourceType?: EnumEquipmentExceptionSourceType
  }
}

// 个人中心路由 修改path时注意这里改动
export const personalRoutesPath = {
  trace: "/personal/trackAndTrace",
  collect: "/personal/collect",
  account: "/personal/account",
  systemMessages: "/personal/system-messages",
  usersFlow: "/personal/flow"
}

// 公共路由
export const constantRoutes: RouteConfig[] = [
  {
    path: "/login",
    name: "LoginPage",
    component: () => import("@/views/Login.vue"),
    hidden: true
  },
  {
    path: "",
    component: Layout,
    name: "Index",
    redirect: personalRoutesPath.account
  }
]

export const noAuthRoutes: RouteConfig[] = [
  {
    alwaysShow: false,
    hidden: true,
    name: "Personal",
    path: "/personal",
    meta: { title: "用户个人", icon: "user", menuCode: "Personal" },
    component: Layout,
    children: [
      {
        path: "trackAndTrace",
        name: "TrackAndTrace",
        hidden: false,
        component: () => import("@/views/trace/SearchAndLocate/index.vue"),
        meta: { title: "追踪追溯", icon: "favorite-left", menuCode: "TrackAndTrace" }
      },
      {
        path: "collect",
        name: "CollectManage",
        hidden: false,
        component: () => import("@/views/personal/Collect.vue"),
        meta: { title: "收藏夹管理", icon: "favorite-left", menuCode: "Collect" }
      },
      {
        path: "account",
        name: "AccountManage",
        hidden: false,
        component: () => import("@/views/personal/Account.vue"),
        meta: { title: "账号管理", icon: "account-left", menuCode: "Account" }
      },
      {
        path: "system-messages",
        name: "SystemMessages",
        hidden: false,
        component: () => import("@/views/personal/SystemMessages.vue"),
        meta: { title: "系统消息", icon: "message-left", menuCode: "SystemMessages" }
      },
      {
        path: "flow",
        name: "UsersFlow",
        hidden: false,
        component: () => import("@/views/personal/UsersFlow.vue"),
        meta: { title: "我的流程", icon: "myProcess-left", menuCode: "UsersFlow" }
      }
    ]
  }
]

export const basicConfigRoutes: RouteConfig[] = [
  ...noAuthRoutes,
  {
    alwaysShow: true,
    component: Layout,
    name: "BasicConfig",
    path: "/basic-config",
    hidden: false,
    meta: { title: "基础配置", icon: "basic-top", menuCode: "BasicConfig" },
    children: [
      {
        path: "personnel",
        name: "Personnel",
        hidden: false,
        meta: { title: "人员管理", icon: "personManage-left", menuCode: "Personnel" },
        children: [
          {
            path: "users",
            name: "Users",
            hidden: false,
            meta: { title: "用户管理", menuCode: "Users" },
            children: [
              {
                path: "manage",
                name: "UsersManage",
                component: () => import("@/views/basicConfig/users/usersManage.vue"),
                meta: { title: "用户信息", menuCode: "UsersManage" }
              },
              {
                path: "role-permission",
                name: "RolePermission",
                component: () => import("@/views/basicConfig/users/rolePermission.vue"),
                meta: { title: "角色权限", menuCode: "RolePermission" }
              }
            ]
          },
          {
            path: "staff-manage",
            name: "StaffManage",
            hidden: false,
            meta: { title: "员工管理", menuCode: "StaffManage" },
            children: [
              {
                path: "department-info-job",
                name: "DepartmentInfoJob",
                meta: { title: "部门信息", menuCode: "DepartmentInfoJob" },
                component: () => import("@/views/basicConfig/staffManage/DepartmentInfoJob/index.vue")
              },
              {
                path: "staff-info",
                name: "StaffInfo",
                meta: { title: "员工信息", menuCode: "StaffInfo" },
                component: () => import("@/views/basicConfig/staffManage/StaffInfo.vue")
              },
              {
                path: "post-manage",
                name: "PostManage",
                meta: { title: "岗位及上岗证信息", menuCode: "PostManage" },
                component: () => import("@/views/basicConfig/staffManage/PostManage.vue")
              },
              {
                path: "work-license",
                name: "WorkLicense",
                meta: { title: "上岗证申请", menuCode: "WorkLicense" },
                component: () => import("@/views/basicConfig/staffManage/workLicenseApply.vue")
              },
              {
                path: "position-manage",
                name: "PositionManage",
                meta: { title: "职位信息", menuCode: "PositionManage" },
                component: () => import("@/views/basicConfig/staffManage/PositionManage.vue")
              }
            ]
          }
        ]
      },
      {
        path: "flow",
        name: "Flow",
        meta: { title: "流程管理", icon: "process-left", menuCode: "Flow" },
        hidden: false,
        children: [
          {
            path: "flow-center",
            name: "FlowCenter",
            meta: { title: "流程中心", menuCode: "FlowCenter" },
            component: () => import("@/views/basicConfig/flow/FlowCenter.vue")
          },
          {
            path: "flow-config",
            name: "FlowConfig",
            meta: { title: "流程配置", menuCode: "FlowConfig" },
            component: () => import("@/views/basicConfig/flow/FlowConfig.vue")
          }
        ]
      },
      {
        path: "factoryModel",
        name: "FactoryModel",
        meta: { title: "工厂建模", icon: "factoryModel-left", menuCode: "FactoryModel" },
        component: () => import("@/views/basicConfig/factoryManage/FactoryModel/index.vue")
      },
      {
        path: "product",
        name: "ProductManageRoot",
        meta: { title: "产品管理", icon: "product-left", menuCode: "ProductManage" },
        hidden: false,
        children: [
          {
            path: "cate",
            name: "ProductCategory",
            meta: { title: "产品类别", menuCode: "ProductCategory" },
            hidden: false,
            component: () => import("@/views/basicConfig/craftwork/ProductCategory/index.vue")
          },
          {
            path: "manage",
            name: "ProductManage",
            meta: { title: "产品管理", menuCode: "ProductManage" },
            hidden: false,
            component: () => import("@/views/basicConfig/craftwork/productManage/index.vue")
          },
          {
            path: "bom",
            name: "BomManage",
            meta: { title: "BOM管理", menuCode: "BomManage" },
            hidden: false,
            component: () => import("@/views/basicConfig/productManageRoot/BomManage/index.vue")
          }
        ]
      },
      {
        path: "craftwork",
        name: "Craftwork",
        meta: { title: "工艺建模", icon: "factory-left", menuCode: "Craftwork" },
        hidden: false,
        children: [
          {
            path: "craftTypeConfig",
            name: "CraftTypeConfig",
            meta: { title: "工艺类型配置", menuCode: "CraftTypeConfig" },
            component: () => import("@/views/basicConfig/craftwork/CraftTypeConfig/index.vue")
          },
          {
            path: "craftManage",
            name: "CraftManage",
            meta: { title: "工艺配置", menuCode: "CraftManage" },
            component: () => import("@/views/basicConfig/craftwork/craftManage/index.vue")
          },
          {
            path: "craftRoute",
            name: "CraftRoute",
            meta: { title: "工艺路线", menuCode: "CraftRoute" },
            component: () => import("@/views/basicConfig/craftwork/craftRoute/index.vue")
          },
          {
            path: "pieceworkPrice",
            name: "PieceworkPrice",
            meta: { title: "工价配置", menuCode: "CraftRoute" },
            component: () => import("@/views/basicConfig/craftwork/pieceworkPrice/index.vue")
          },
          {
            path: "pieceworkPrice/history",
            name: "PieceworkPriceHistory",
            meta: { title: "历史工价", menuCode: "CraftRoute" },
            hidden: true,
            component: () => import("@/views/basicConfig/craftwork/pieceworkPrice/History.vue")
          },
          {
            path: "units",
            name: "UnitManagement",
            meta: { title: "单位管理", menuCode: "UnitManagement" },
            component: () => import("@/views/basicConfig/systemConfig/unitsManage.vue")
          },
          {
            path: "semiAxleBlankingCard",
            name: "SemiAxleBlankingCard",
            meta: { title: "半轴下料卡配置", menuCode: "SemiAxleBlankingCard" },
            component: () => import("@/views/basicConfig/craftwork/semiAxleBlankingCard/index.vue")
          }
        ]
      },
      {
        path: "inspectOptionManage",
        name: "InspectOptionManage",
        meta: { title: "检验项管理", icon: "inspect-option-left", menuCode: "InspectOptionManage" },
        hidden: false,
        children: [
          {
            path: "inspectOptionCategory",
            name: "InspectOptionCategory",
            meta: { title: "检验项类别", menuCode: "InspectOptionCategory" },
            component: () =>
              import("@/views/basicConfig/inspectOptionManage/InspectOptionCategory/index.vue")
          },
          {
            path: "inspectOptionTemplate",
            name: "InspectOptionTemplate",
            meta: { title: "检验项模板", menuCode: "InspectOptionTemplate" },
            component: () =>
              import("@/views/basicConfig/inspectOptionManage/InspectOptionTemplate/index.vue")
          }
        ]
      },
      {
        path: "package",
        name: "PackageManage",
        meta: { title: "包装管理", icon: "package-left", menuCode: "PackageManage" },
        hidden: false,
        children: [
          {
            path: "packageSpec",
            name: "PackageSpec",
            meta: { title: "包装规范管理", menuCode: "PackageSpec" },
            component: () => import("@/views/basicConfig/packageManage/PackageSpecManage/index.vue")
          },
          {
            path: "packageProcess",
            name: "PackageProcess",
            meta: { title: "包装工序管理", menuCode: "PackageProcess" },
            component: () =>
              import("@/views/basicConfig/packageManage/PackageProcessManage/index.vue")
          }
        ]
      },
      {
        path: "alarmManage",
        name: "AlarmManage",
        meta: { title: "告警管理", icon: "alarm-left", menuCode: "AlarmManage" },
        component: () => import("@/views/basicConfig/alarm/manage/index.vue")
      },
      {
        path: "barcodeManagement",
        name: "BarcodeManage",
        meta: { title: "条码管理", icon: "barcode-left", menuCode: "BarcodeManagement" },
        component: () => import("@/views/basicConfig/barcode/manage/index.vue")
      },
      {
        path: "external-relations",
        name: "ExternalRelations",
        hidden: false,
        meta: { title: "业务伙伴", icon: "relation-left", menuCode: "ExternalRelations" },
        children: [
          {
            path: "supplierInfo",
            name: "SupplierInfo",
            component: () => import("@/views/basicConfig/externalRelations/supplierInfo.vue"),
            meta: { title: "供应商信息", menuCode: "SupplierInfo" }
          },
          {
            path: "customerInfo",
            name: "CustomerInfo",
            component: () => import("@/views/basicConfig/externalRelations/customerInfo.vue"),
            meta: { title: "客户信息", menuCode: "CustomerInfo" }
          }
        ]
      },
      {
        path: "importData",
        name: "ImportData",
        meta: { title: "数据导入", icon: "import-data-left", menuCode: "ImportData" },
        component: () => import("@/views/basicConfig/importData/index.vue")
      },
      {
        path: "system-config",
        name: "SystemConfig",
        meta: { title: "系统配置", icon: "sysConfig-left", menuCode: "SystemConfig" },
        hidden: false,
        children: [
          {
            path: "calendar",
            name: "StandardCalendar",
            meta: { title: "标准日历", menuCode: "Calendar" },
            component: () => import("@/views/basicConfig/Calendar.vue")
          },
          {
            path: "encode",
            name: "SystemConfigEncode",
            meta: { title: "编码管理", menuCode: "SystemConfigEncode" },
            component: () => import("@/views/basicConfig/systemConfig/encodedManage.vue")
          },
          {
            path: "encodeModel",
            name: "SystemConfigEncodeModel",
            meta: { title: "编码模型", menuCode: "SystemConfigEncodeModel" },
            component: () => import("@/views/basicConfig/systemConfig/encodedModelManage.vue")
          },
          {
            path: "globalConfig",
            name: "GlobalConfig",
            meta: { title: "全局配置", menuCode: "GlobalConfig" },
            component: () => import("@/views/basicConfig/systemConfig/GlobalConfig/index.vue")
          },
          {
            path: "implementConfig",
            name: "ImplementConfig",
            meta: { title: "实施配置", menuCode: "ImplementConfig" },
            component: () => import("@/views/basicConfig/systemConfig/ImplementConfig/index.vue")
          }
        ]
      }
    ]
  },
  {
    alwaysShow: true,
    component: Layout,
    name: "Operation",
    path: "/operation",
    hidden: false,
    meta: { title: "维护运营管理", icon: "operation-top", menuCode: "Operation" },
    children: [
      {
        name: "OperationDevice",
        path: "device",
        meta: { title: "设备管理", icon: "device-left", menuCode: "OperationDevice" },
        children: [
          {
            path: "classify",
            name: "DeviceClassify",
            meta: { title: "设备分类", menuCode: "DeviceClassify" },
            component: () => import("@/views/maintOperate/deviceCategory/index.vue")
          },
          {
            path: "category",
            name: "DeviceCategory",
            meta: { title: "设备信息", menuCode: "DeviceCategory" },
            component: () => import("@/views/maintOperate/deviceCateManage/index.vue")
          },
          {
            path: "fault",
            name: "DeviceFault",
            meta: { title: "设备故障管理", menuCode: "DeviceFault" },
            component: () => import("@/views/maintOperate/deviceFault/index.vue")
          },
          {
            path: "info",
            name: "DeviceInfo",
            meta: { title: "设备台账", menuCode: "DeviceInfo" },
            component: () => import("@/views/maintOperate/deviceInfo/index.vue")
          },
          {
            path: "spotCheck",
            name: "SpotCheck",
            meta: { title: "设备点检", menuCode: "SpotCheck" },
            children: [
              {
                path: "task",
                name: "SpotCheckTask",
                meta: {
                  title: "点检任务单",
                  menuCode: "SpotCheckTask"
                },
                component: () => import("@/views/maintOperate/deviceSpotCheck/TaskOrder/index.vue")
              },
              {
                path: "expect",
                name: "SpotCheckExpect",
                meta: {
                  title: "点检异常工单",
                  menuCode: "SpotCheckExpect"
                },
                component: () =>
                  import("@/views/maintOperate/deviceSpotCheck/ExceptionOrder/index.vue")
              }
            ]
          },
          {
            path: "pollCheck",
            name: "PollCheck",
            meta: { title: "设备巡检", menuCode: "PollCheck" },
            children: [
              {
                path: "task",
                name: "PollCheckTask",
                meta: {
                  title: "巡检任务单",
                  menuCode: "PollCheckTask"
                },
                component: () => import("@/views/maintOperate/devicePollCheck/TaskOrder/index.vue")
              },
              {
                path: "expect",
                name: "PollCheckExpect",
                meta: {
                  title: "巡检异常工单",
                  menuCode: "PollCheckExpect"
                },
                component: () =>
                  import("@/views/maintOperate/devicePollCheck/ExceptionOrder/index.vue")
              }
            ]
          },
          {
            path: "maintain",
            name: "DeviceMaintain",
            meta: { title: "设备保养", menuCode: "DeviceMaintain" },
            children: [
              {
                path: "yearPlan",
                name: "YearPlan",
                meta: { title: "年计划", menuCode: "YearPlan" },
                component: () => import("@/views/maintOperate/deviceMaintain/YearPlan/index.vue")
              },
              {
                path: "monthPlan",
                name: "MonthPlan",
                meta: { title: "月计划", menuCode: "MonthPlan" },
                component: () => import("@/views/maintOperate/deviceMaintain/MonthPlan/index.vue")
              },
              {
                path: "weekPlan",
                name: "WeekPlan",
                meta: { title: "周计划", menuCode: "WeekPlan", noCache: true },
                component: () => import("@/views/maintOperate/deviceMaintain/WeekPlan/index.vue")
              },
              {
                path: "type",
                name: "MaintainType",
                meta: { title: "淇濆吇绫诲瀷", menuCode: "MaintainType" },
                component: () => import("@/views/maintOperate/deviceMaintain/MaintainType/index.vue")
              },
              {
                path: "task",
                name: "MaintainTask",
                meta: {
                  title: "任务单",
                  menuCode: "MaintainTask"
                },
                component: () => import("@/views/maintOperate/deviceMaintain/TaskOrder/index.vue")
              },
              {
                path: "expect",
                name: "MaintainExceptionOrder",
                meta: {
                  title: "保养异常工单",
                  menuCode: "ExceptionalOrder"
                },
                component: () =>
                  import("@/views/maintOperate/deviceMaintain/ExceptionOrder/index.vue")
              }
            ]
          },
          {
            path: "deviceRepair",
            name: "DeviceRepair",
            meta: { title: "设备维修单", menuCode: "DeviceRepair" },
            component: () => import("@/views/maintOperate/deviceRepair/index.vue")
          },
          {
            path: "deviceRepairBaseConfig",
            name: "DeviceRepairBaseConfig",
            meta: { title: "设备维修基础配置", menuCode: "DeviceRepairBaseConfig" },
            component: () => import("@/views/maintOperate/deviceRepairBaseConfig/index.vue")
          },
          {
            path: "deviceScrapApply",
            name: "DeviceScrapApply",
            meta: { title: "设备报废申请", menuCode: "DeviceScrapApply" },
            component: () => import("@/views/maintOperate/deviceScrapApply/index.vue")
          }
        ]
      },
      {
        name: "MROManagement",
        path: "mro",
        meta: { title: "MRO管理", icon: "mro-left", menuCode: "MROManagement" },
        children: [
          {
            path: "category",
            name: "MROCategory",
            meta: { title: "MRO分类", menuCode: "MROCategory" },
            component: () => import("@/views/MROManage/MROCategoryManage/index.vue")
          },
          {
            path: "model",
            name: "MROModel",
            meta: { title: "MRO信息", menuCode: "MROModel" },
            component: () => import("@/views/MROManage/MROModelManage/index.vue")
          },
          {
            path: "register",
            name: "MRORegister",
            meta: { title: "MRO登记", menuCode: "MRORegister" },
            component: () => import("@/views/MROManage/MRORegister/index.vue")
          },
          {
            path: "inbound-order",
            name: "MROInboundOrder",
            meta: { title: "MRO入库单", menuCode: "MROInboundOrder" },
            component: () => import("@/views/MROManage/MROInboundOrder/index.vue")
          },
          {
            path: "pickup-order",
            name: "MROPickupOrder",
            meta: { title: "MRO领用单", menuCode: "MROPickupOrder" },
            component: () => import("@/views/MROManage/MROPickupOrder/index.vue")
          },
          {
            path: "outbound-order",
            name: "MROOutboundOrder",
            meta: { title: "MRO出库单", menuCode: "MROOutboundOrder" },
            component: () => import("@/views/MROManage/MROOutboundOrder/index.vue")
          },
          {
            path: "return-order",
            name: "MROReturnOrder",
            meta: { title: "MRO还回单", menuCode: "MROReturnOrder" },
            component: () => import("@/views/MROManage/MROReturnOrder/index.vue")
          },
          {
            path: "inventory-check",
            name: "MROInventoryCheck",
            meta: { title: "MRO盘点单", menuCode: "MROInventoryCheck" },
            component: () => import("@/views/MROManage/MROInventoryCheck/index.vue")
          },
          {
            path: "difference-order",
            name: "MRODifferenceOrder",
            meta: { title: "MRO差异单", menuCode: "MRODifferenceOrder" },
            component: () => import("@/views/MROManage/MRODifferenceOrder/index.vue")
          },
          {
            path: "adjust-order",
            name: "MROAdjustOrder",
            meta: { title: "MRO调整单", menuCode: "MROAdjustOrder" },
            component: () => import("@/views/MROManage/MROAdjustOrder/index.vue")
          },
          {
            path: "info",
            name: "MROInfo",
            meta: { title: "MRO台账", menuCode: "MROInfo" },
            component: () => import("@/views/MROManage/MROInfo/index.vue")
          },
          {
            path: "MROinOutOrders",
            name: "MROInOutOrders",
            meta: { title: "MRO出入库", menuCode: "MROInOutOrders" },
            children: [
              {
                path: "inOrders",
                name: "MROInOrders",
                meta: { title: "入库记录", menuCode: "MROInOrders" },
                component: () => import("@/views/MROManage/MROInOutOrders/inOrders.vue")
              },
              {
                path: "outOrders",
                name: "MROOutOrders",
                meta: { title: "出库记录", menuCode: "MROOutOrders" },
                component: () => import("@/views/MROManage/MROInOutOrders/outOrders.vue")
              }
            ]
          },
          {
            path: "MROVerify",
            name: "MROVerify",
            meta: { title: "MRO校验", menuCode: "MROVerify" },
            children: [
              {
                path: "verifyTaskOrders",
                name: "VerifyTaskOrders",
                meta: { title: "校验任务单", menuCode: "VerifyTaskOrders" },
                component: () => import("@/views/MROManage/MROVerify/VerifyTaskOrders/index.vue")
              },
              {
                path: "verifyAbnormalOrders",
                name: "VerifyAbnormalOrders",
                meta: { title: "校验异常工单", menuCode: "VerifyAbnormalOrders" },
                component: () =>
                  import("@/views/MROManage/MROVerify/VerifyAbnormalOrders/index.vue")
              }
            ]
          },
          {
            path: "MROUpkeep",
            name: "MROUpkeep",
            meta: { title: "MRO保养", menuCode: "MROUpkeep" },
            children: [
              {
                path: "upkeepTaskOrders",
                name: "UpkeepTaskOrders",
                meta: { title: "保养任务单", menuCode: "UpkeepTaskOrders" },
                component: () => import("@/views/MROManage/MROUpkeep/UpkeepTaskOrders/index.vue")
              },
              {
                path: "upkeepErrorOrders",
                name: "UpkeepErrorOrders",
                meta: { title: "保养异常工单", menuCode: "UpkeepErrorOrders" },
                component: () => import("@/views/MROManage/MROUpkeep/UpkeepErrorOrders/index.vue"),
                beforeEnter: (
                  to: RouteLocationNormalized,
                  from: RouteLocationNormalized,
                  next: NavigationGuardNext
                ) => {
                  if (from.name == "UpkeepTaskOrders") {
                    to.query.exceptionTaskId = from.query.exceptionTaskId
                    to.query.jumpKey = from.query.jumpKey
                  }
                  next()
                }
              }
            ]
          },
          {
            path: "repairOrders",
            name: "MRORepairOrders",
            meta: { title: "MRO维修单", menuCode: "MRORepairOrders" },
            component: () => import("@/views/MROManage/MRORepairOrders/index.vue")
          },
          {
            path: "scrapApply",
            name: "MROScrapApply",
            meta: { title: "MRO报废申请", menuCode: "MROScrapApply" },
            component: () => import("@/views/MROManage/MROScrapApply/index.vue")
          }
        ]
      },
      {
        path: "Vehicle",
        name: "VehicleManage",
        meta: { title: "载具管理", icon: "vehicle", menuCode: "VehicleManage" },
        children: [
          {
            path: "category",
            name: "VehicleCategory",
            meta: { title: "载具分类", menuCode: "VehicleCategory" },
            component: () => import("@/views/vehicleManage/vehicleCategory/index.vue")
          },
          {
            path: "model",
            name: "VehicleModel",
            meta: { title: "载具信息", menuCode: "VehicleModelManage" },
            component: () => import("@/views/vehicleManage/vehicleModel/index.vue")
          },
          {
            path: "info",
            name: "VehicleInfo",
            meta: { title: "载具台账", menuCode: "VehicleInfoManage" },
            component: () => import("@/views/vehicleManage/vehicleInfo/index.vue")
          }
        ]
      },
      {
        path: "Andon",
        name: "AndonManagement",
        meta: { title: "Andon管理", icon: "andon", menuCode: "AndonManagement" },
        children: [
          {
            path: "record",
            name: "AndonRecord",
            meta: { title: "Andon记录", menuCode: "AndonRecord" },
            component: () => import("@/views/andonManage/andonRecord/index.vue")
          },
          {
            path: "info",
            name: "AndonInfo",
            meta: { title: "Andon信息管理", menuCode: "AndonInfo" },
            component: () => import("@/views/andonManage/andonInfo/index.vue")
          },
          {
            path: "fault",
            name: "AndonFault",
            meta: { title: "Andon故障管理", menuCode: "AndonFault" },
            component: () => import("@/views/andonManage/andonFault/index.vue")
          }
        ]
      },
      {
        path: "documentManage",
        name: "DocumentManageRoot",
        meta: { title: "文档管理", icon: "document-left", menuCode: "DocumentManage" },
        redirect: "/operation/documentManage/manage",
        children: [
          {
            path: "manage",
            name: "DocumentManage",
            meta: { title: "文档管理", menuCode: "DocumentManage" },
            component: () => import("@/views/basicConfig/document/Manage.vue")
          },
          {
            path: "cancelled",
            name: "CancelledDocumentManage",
            meta: { title: "已作废文档", menuCode: "DocumentManage" },
            component: () => import("@/views/basicConfig/document/Manage.vue")
          }
        ]
      }
    ]
  },
  {
    alwaysShow: false,
    hidden: false,
    name: "LogisticsOperate",
    path: "/logistics-operate",
    meta: { title: "物流运营管理", icon: "logistics-top", menuCode: "LogisticsOperate" },
    component: Layout,
    children: [
      {
        alwaysShow: false,
        path: "logisticsBasic",
        name: "LogisticsBasic",
        hidden: false,
        meta: { title: "基础信息管理", icon: "logisticsBasic", menuCode: "LogisticsBasic" },
        children: [
          {
            path: "productInventory",
            name: "ProductInventory",
            hidden: false,
            component: () => import("@/views/logisticsOperate/productInventory/index.vue"),
            meta: { title: "库存信息", menuCode: "ProductInventory" }
          },
          {
            path: "depotManage",
            name: "DepotManage",
            hidden: false,
            component: () => import("@/views/logisticsOperate/depotManagement/index.vue"),
            meta: { title: "仓库管理", menuCode: "DepotManage" }
          }
        ]
      },
      {
        path: "procurementManage",
        name: "ProcurementManage",
        hidden: false,
        meta: { title: "采购管理", icon: "buy-left", menuCode: "ProcurementManage" },
        children: [
          {
            path: "procurementOrder",
            name: "ProcurementOrder",
            hidden: false,
            component: () =>
              import("@/views/logisticsOperate/procurementManage/procurementOrders/index.vue"),
            meta: { title: "采购订单", menuCode: "ProcurementOrder" }
          },
          {
            path: "procurementReceive",
            name: "ProcurementReceive",
            hidden: false,
            component: () =>
              import("@/views/logisticsOperate/procurementManage/procurementReceive/index.vue"),
            meta: { title: "采购收货", menuCode: "ProcurementReceive" }
          }
        ]
      },
      {
        path: "outsourcingManage",
        name: "OutsourcingManage",
        meta: { title: "委外管理", icon: "outsourcing-left", menuCode: "OutsourcingManage" },
        children: [
          {
            path: "outsourcingOrders",
            name: "OutsourcingOrders",
            hidden: false,
            component: () =>
              import("@/views/logisticsOperate/outsourcingManage/outsourcingOrders/index.vue"),
            meta: { title: "委外订单", menuCode: "OutsourcingOrders" }
          },
          {
            path: "outsourcingReceive",
            name: "OutsourcingReceive",
            hidden: false,
            component: () =>
              import("@/views/logisticsOperate/outsourcingManage/outsourcingReceive/index.vue"),
            meta: { title: "委外收货", menuCode: "OutsourcingReceive" }
          },
          {
            path: "outsourcingReturn",
            name: "OutsourcingReturn",
            hidden: false,
            component: () =>
              import("@/views/logisticsOperate/outsourcingManage/outsourcingReturn/index.vue"),
            meta: { title: "委外退料", menuCode: "OutsourcingReturn" }
          }
        ]
      },
      {
        path: "shipping-returns",
        name: "ShippingReturns",
        meta: { title: "销售订单管理", icon: "deliveryReturn-left", menuCode: "ShippingReturns" },
        children: [
          {
            path: "salesOrders",
            name: "SalesOrders",
            hidden: false,
            component: () =>
              import("@/views/logisticsOperate/shippingReturns/salesOrders/index.vue"),
            meta: { title: "销售订单", menuCode: "SalesOrders" }
          },
          {
            path: "shippingManagement",
            name: "ShippingManagement",
            hidden: false,
            component: () =>
              import("@/views/logisticsOperate/shippingReturns/shippingManagement/index.vue"),
            meta: { title: "发货计划", menuCode: "ShippingManagement" },
            beforeEnter: (
              to: RouteLocationNormalized,
              from: RouteLocationNormalized,
              next: NavigationGuardNext
            ) => {
              if (from.name == "SalesOrders") {
                to.query.saleCode = from.query.saleCode
                to.query.jumpKey = from.query.jumpKey
              }
              next()
            }
          },
          {
            path: "packContainerManagement",
            name: "PackContainerManagement",
            hidden: false,
            component: () =>
              import("@/views/logisticsOperate/shippingReturns/packContainerManagement/index.vue"),
            meta: { title: "包装容器管理", menuCode: "PackContainerManagement" }
          },
          {
            path: "returnManagement",
            name: "ReturnManagement",
            hidden: false,
            component: () =>
              import("@/views/logisticsOperate/shippingReturns/returnManagement/index.vue"),
            meta: { title: "退货管理", menuCode: "ReturnManagement" }
          }
        ]
      },
      {
        path: "pickingManage",
        name: "PickingManage",
        hidden: false,
        meta: { title: "生产领料管理", icon: "pickingPlan", menuCode: "PickingManage" },
        children: [
          {
            path: "preparationPlan",
            name: "PreparationPlan",
            hidden: false,
            component: () =>
              import("@/views/logisticsOperate/pickingManage/preparationPlan/index.vue"),
            meta: { title: "领料计划", menuCode: "PreparationPlan" }
          },
          {
            path: "preparationTask",
            name: "PreparationTask",
            hidden: false,
            component: () =>
              import("@/views/logisticsOperate/pickingManage/preparationTask/index.vue"),
            meta: { title: "领料任务", menuCode: "PreparationTask" }
          }
        ]
      },
      {
        alwaysShow: false,
        path: "depotManagement",
        name: "DepotManagement",
        hidden: false,
        meta: { title: "仓储管理", icon: "warehouseManage", menuCode: "DepotManagement" },
        children: [
          {
            path: "procurementReturn",
            name: "ProcurementReturn",
            hidden: false,
            component: () => import("@/views/logisticsOperate/productInventoryReturn/index.vue"),
            meta: { title: "库存退货", menuCode: "ProcurementReturn" }
          },
          {
            path: "depotAllocate",
            name: "DepotAllocate",
            hidden: false,
            component: () => import("@/views/logisticsOperate/depotAllocate/index.vue"),
            meta: { title: "仓库调拨", menuCode: "DepotAllocate" }
          },
          {
            path: "depotCheck",
            name: "DepotCheck",
            hidden: false,
            component: () => import("@/views/logisticsOperate/depotCheck/index.vue"),
            meta: { title: "仓库盘点", menuCode: "DepotCheck" }
          }
        ]
      },
      {
        path: "productInOut",
        name: "ProductInOut",
        meta: { title: "产品记录", icon: "productInOut", menuCode: "ProductInOut" },
        children: [
          {
            path: "inStorage",
            name: "ProductInStorage",
            hidden: false,
            component: () => import("@/views/logisticsOperate/productInStorage/index.vue"),
            meta: { title: "产品入库记录", menuCode: "ProductInStorage" }
          },
          {
            path: "outStorage",
            name: "ProductOutStorage",
            hidden: false,
            component: () => import("@/views/logisticsOperate/productOutStorage/index.vue"),
            meta: { title: "产品出库记录", menuCode: "ProductOutStorage" }
          },
          {
            path: "productLots",
            name: "ProductLots",
            hidden: false,
            component: () => import("@/views/logisticsOperate/productLots/index.vue"),
            meta: { title: "产品批次记录", menuCode: "ProductLots" }
          },
          {
            path: "scrapRecord",
            name: "ScrapRecord",
            hidden: false,
            component: () => import("@/views/logisticsOperate/scrapRecord/index.vue"),
            meta: { title: "报废记录", menuCode: "ScrapRecord" }
          }
        ]
      }
    ]
  },
  {
    alwaysShow: true,
    component: Layout,
    name: "Produce",
    path: "/produce",
    hidden: false,
    meta: { title: "生产运营管理", icon: "production-top", menuCode: "Produce" },
    children: [
      {
        path: "productionOrder",
        name: "ProductionOrder",
        meta: { title: "生产订单", menuCode: "ProductionOrder", icon: "productionOrders-left" },
        component: () => import("@/views/produceManage/productionOrder/index.vue")
      },
      {
        path: "productionOrders",
        name: "ProductionOrders",
        meta: { title: "生产日计划", menuCode: "ProductionOrders", icon: "productionOrders-left" },
        component: () => import("@/views/produceManage/productionOrders/index.vue")
      },
      {
        path: "scheduleProductPlan",
        name: "ScheduleProductPlan",
        meta: {
          title: "计划排产",
          menuCode: "ScheduleProductPlan",
          icon: "scheduleProductPlan-left"
        },
        component: () => import("@/views/produceManage/scheduleProductPlan/index.vue")
      },
      {
        path: "packageSchedule",
        name: "PackageSchedule",
        meta: {
          title: "包装排产",
          menuCode: "PackageSchedule",
          icon: "package-schedule-left"
        },
        component: () => import("@/views/produceManage/packageSchedule/index.vue")
      },
      {
        path: "task",
        name: "ProductionSchedulingTask",
        meta: {
          title: "生产任务",
          menuCode: "ProductionSchedulingTask",
          icon: "productionTask-left"
        },
        component: () => import("@/views/produceManage/productiveTask/index.vue")
      },
      {
        path: "packageTask",
        name: "PackageTask",
        meta: {
          title: "包装任务",
          menuCode: "PackageTask",
          icon: "package-task-left"
        },
        component: () => import("@/views/produceManage/packageTask/index.vue")
      },
      {
        path: "report",
        name: "ProductionReport",
        meta: {
          title: "生产报工记录",
          menuCode: "ProductionReport",
          icon: "productionReport-left"
        },
        component: () => import("@/views/produceManage/productiveReport/index.vue")
      },
      {
        name: "ProduceArrange",
        path: "arrange",
        meta: { title: "排班管理", icon: "arrange-left", menuCode: "ProduceArrange" },
        children: [
          {
            path: "classes",
            name: "ProduceArrangeClasses",
            meta: { title: "班次管理", menuCode: "ProduceArrangeClasses" },
            component: () => import("@/views/produceManage/classes/index.vue")
          },
          {
            path: "group",
            name: "ProduceArrangeGroup",
            meta: { title: "班组管理", menuCode: "ProduceArrangeGroup" },
            component: () => import("@/views/produceManage/teamGroup/index.vue")
          },
          {
            path: "plan",
            name: "ProduceArrangePlan",
            meta: { title: "排班计划", menuCode: "ProduceArrangePlan" },
            component: () => import("@/views/produceManage/schedulingPlan/index.vue")
          }
        ]
      }
    ]
  },
  {
    alwaysShow: true,
    component: Layout,
    name: "Quality",
    path: "/quality",
    hidden: false,
    meta: { title: "质量运营管理", icon: "quality-top", menuCode: "Quality" },
    children: [
      {
        name: "inspectionTask",
        path: "InspectionTask",
        meta: { title: "检验任务", icon: "inspectionTask", menuCode: "InspectionTask" },
        children: [
          {
            path: "processInspect",
            name: "ProcessInspect",
            meta: { title: "生产过程检", menuCode: "ProcessInspect" },
            component: () => import("@/views/qualityManage/processInspect/index.vue")
          },
          {
            path: "nonProcessInspect",
            name: "NonProcessInspect",
            meta: { title: "非过程检", menuCode: "NonProcessInspect" },
            component: () => import("@/views/qualityManage/nonProcessInspect/index.vue")
          }
        ]
      },
      {
        path: "unqualified",
        name: "UnqualifiedReview",
        meta: { title: "不合格评审", icon: "unqualified-left", menuCode: "Unqualified" },
        component: () => import("@/views/qualityManage/unqualified/index.vue")
      },
      {
        path: "defectManage",
        name: "DefectManage",
        meta: { title: "缺陷管理", icon: "defectManage", menuCode: "DefectManage" },
        component: () => import("@/views/qualityManage/defectManage/index.vue")
      },
      {
        path: "gradientModel",
        name: "GradientModel",
        meta: { title: "梯度模型", icon: "gradientModel", menuCode: "GradientModel" },
        component: () => import("@/views/qualityManage/gradientModel/index.vue")
      },
      {
        path: "reworkCraftTemplate",
        name: "ReworkCraftTemplate",
        meta: { title: "返工工艺模板", icon: "gradientModel", menuCode: "CraftRoute" },
        component: () => import("@/views/qualityManage/reworkCraftTemplate/index.vue")
      }
    ]
  },
  {
    alwaysShow: true,
    component: Layout,
    name: "Report",
    path: "/report",
    hidden: false,
    meta: { title: "报表中心", icon: "report-left", menuCode: "Report" },
    children: [
      {
        name: "ReportPlan",
        path: "reportPlan",
        meta: { title: "计划", icon: "report-plan-left", menuCode: "ReportPlan" },
        children: [
          // {
          //   name: "ProduceTaskReport",
          //   path: "produceTaskReport",
          //   meta: { title: "生产任务汇总", menuCode: "ProduceTaskReport" },
          //   component: () => import("@/views/report/plan/ProduceTaskReport/index.vue")
          // },
          {
            name: "ProduceTaskCompleteRateReport",
            path: "produceTaskCompleteRateReport",
            meta: { title: "生产任务完成率报表", menuCode: "ProduceTaskCompleteRateReport" },
            component: () => import("@/views/report/plan/ProduceTaskCompleteRateReport/index.vue")
          }
          // {
          //   name: "ProductTaskCompleteTrendReport",
          //   path: "productTaskCompleteTrendReport",
          //   meta: { title: "生产任务完成量趋势图", menuCode: "ProductTaskCompleteTrendReport" },
          //   component: () => import("@/views/report/plan/productTaskCompleteTrendReport/index.vue")
          // }
        ]
      },
      {
        name: "ReportPurchase",
        path: "reportPurchase",
        meta: { title: "采购", icon: "report-purchase-left", menuCode: "ReportPurchase" },
        children: [
          {
            name: "PurchaseArrivalRateReport",
            path: "purchaseArrivalRateReport",
            meta: { title: "采购准时到货率", menuCode: "PurchaseArrivalRateReport" },
            component: () => import("@/views/report/purchase/PurchaseArrivalRateReport/index.vue")
          }
          // {
          //   name: "SupplierQualifiedRateReport",
          //   path: "supplierQualifiedRateReport",
          //   meta: { title: "供应商合格率分析表", menuCode: "SupplierQualifiedRateReport" },
          //   component: () => import("@/views/report/purchase/SupplierQualifiedRateReport/index.vue")
          // }
        ]
      },
      // {
      //   name: "ReportStorage",
      //   path: "reportStorage",
      //   meta: { title: "仓储", icon: "report-storage-left", menuCode: "ReportStorage" },
      //   children: [
      //     {
      //       name: "InventoryAgeListReport",
      //       path: "inventoryAgeListReport",
      //       meta: { title: "库龄清单", menuCode: "InventoryAgeListReport" },
      //       component: () => import("@/views/report/storage/InventoryAgeListReport/index.vue")
      //     },
      //     {
      //       name: "InventoryAnalysisReport",
      //       path: "inventoryAnalysisReport",
      //       meta: { title: "库存分析", menuCode: "InventoryAnalysisReport" },
      //       component: () => import("@/views/report/storage/InventoryAnalysisReport/index.vue")
      //     },
      //     {
      //       name: "InventoryProcessInProgressReport",
      //       path: "inventoryProcessInProgressReport",
      //       meta: { title: "工序在制品库存", menuCode: "InventoryProcessInProgressReport" },
      //       component: () =>
      //         import("@/views/report/storage/InventoryProcessInProgressReport/index.vue")
      //     }
      //   ]
      // },
      {
        name: "ReportProduce",
        path: "reportProduce",
        meta: { title: "生产", icon: "report-produce-left", menuCode: "ReportProduce" },
        children: [
          // {
          //   name: "MonthOEReport",
          //   path: "monthOEReport",
          //   meta: { title: "月度OE明细表", menuCode: "MonthOEReport" },
          //   component: () => import("@/views/report/produce/MonthOEReport/index.vue")
          // },
          {
            name: "ProductionOrderExecutionMonitor",
            path: "productionOrderExecutionMonitor",
            meta: { title: "生产订单执行监控", menuCode: "ProductionOrderExecutionMonitor" },
            component: () =>
              import("@/views/report/produce/ProductionOrderExecutionMonitor/index.vue")
          },
          {
            name: "ProductionOrderExecutionDetail",
            path: "productionOrderExecutionMonitor/detail",
            meta: { title: "数采详情", menuCode: "ProductionOrderExecutionMonitor" },
            component: () =>
              import("@/views/report/produce/ProductionOrderExecutionMonitor/detail/index.vue")
          },
          {
            name: "ProductInProgressAnalysisReport",
            path: "productInProgressAnalysisReport",
            meta: { title: "产品在制分析", menuCode: "ProductInProgressAnalysisReport" },
            component: () =>
              import("@/views/report/produce/ProductInProgressAnalysisReport/index.vue")
          },
          // {
          //   name: "BarcodeCenterReport",
          //   path: "barcodeCenterReport",
          //   meta: { title: "条码查询中心", menuCode: "BarcodeCenterReport" },
          //   component: () => import("@/views/report/produce/BarcodeCenterReport/index.vue")
          // },
          // {
          //   name: "WorkCenterProductQualityReport",
          //   path: "workCenterProductQualityReport",
          //   meta: { title: "工作中心产量统计分析", menuCode: "WorkCenterProductQualityReport" },
          //   component: () =>
          //     import("@/views/report/produce/WorkCenterProductQualityReport/index.vue")
          // },
          // {
          //   name: "ShiftProductQualityReport",
          //   path: "shiftProductQualityReport",
          //   meta: { title: "班次产量统计分析", menuCode: "ShiftProductQualityReport" },
          //   component: () => import("@/views/report/produce/ShiftProductQualityReport/index.vue")
          // },
          {
            name: "DaysCompleteRateReport",
            path: "daysCompleteRateReport",
            meta: { title: "每日完成率统计", menuCode: "DaysCompleteRateReport" },
            component: () => import("@/views/report/produce/DaysCompleteRateReport/index.vue")
          }
          // {
          //   name: "CompleteSetAnalysisReport",
          //   path: "completeSetAnalysisReport",
          //   meta: { title: "齐套分析-甘特图", menuCode: "CompleteSetAnalysisReport" },
          //   component: () => import("@/views/report/produce/CompleteSetAnalysisReport/index.vue")
          // }
        ]
      },
      {
        name: "ReportQuality",
        path: "reportQuality",
        meta: { title: "质量", icon: "report-quality-left", menuCode: "ReportQuality" },
        children: [
          // {
          //   name: "DefectAnalysisReport",
          //   path: "defectAnalysisReport",
          //   meta: { title: "缺陷分析", menuCode: "DefectAnalysisReport" },
          //   component: () => import("@/views/report/quality/DefectAnalysisReport/index.vue")
          // },
          {
            name: "NonconformingRateReport",
            path: "nonconformingRateReport",
            meta: { title: "不合格率统计表", menuCode: "NonconformingRateReport" },
            component: () => import("@/views/report/quality/NonconformingRateReport/index.vue")
          },
          {
            name: "NonconformingAnalysisReport",
            path: "nonconformingAnalysisReport",
            meta: { title: "不合格品统计分析", menuCode: "NonconformingAnalysisReport" },
            component: () => import("@/views/report/quality/NonconformingAnalysisReport/index.vue")
          }
          // {
          //   name: "QualityQuestionReport",
          //   path: "qualityQuestionReport",
          //   meta: { title: "质量问题帕累托图", menuCode: "QualityQuestionReport" },
          //   component: () => import("@/views/report/quality/QualityQuestionReport/index.vue")
          // }
        ]
      }
      // {
      //   name: "ReportLogistics",
      //   path: "reportLogistics",
      //   meta: { title: "物流", icon: "report-logistics-left", menuCode: "ReportLogistics" },
      //   children: [
      //     {
      //       name: "ProductInventoryCheckReport",
      //       path: "productInventoryCheckReport",
      //       meta: { title: "成品发运库存核对记录", menuCode: "ProductInventoryCheckReport" },
      //       component: () =>
      //         import("@/views/report/logistics/ProductInventoryCheckReport/index.vue")
      //     },
      //     {
      //       name: "OutsourcingProgressAnalysisProductReport",
      //       path: "outsourcingProgressAnalysisProductReport",
      //       meta: { title: "委外进度分析-产品", menuCode: "OutsourcingProgressAnalysisProductReport" },
      //       component: () =>
      //         import("@/views/report/logistics/OutsourcingProgressAnalysisProductReport/index.vue")
      //     },
      //     {
      //       name: "OutsourcingProgressAnalysisSupplierReport",
      //       path: "outsourcingProgressAnalysisSupplierReport",
      //       meta: { title: "委外进度分析-供应商", menuCode: "OutsourcingProgressAnalysisSupplierReport" },
      //       component: () =>
      //         import("@/views/report/logistics/OutsourcingProgressAnalysisSupplierReport/index.vue")
      //     }
      //   ]
      // },
      // {
      //   name: "ReportDevice",
      //   path: "reportDevice",
      //   meta: { title: "设备", icon: "report-device-left", menuCode: "ReportDevice" },
      //   children: [
      //     {
      //       name: "DeviceSpotProjectReport",
      //       path: "deviceSpotProjectReport",
      //       meta: { title: "设备点检项目明细表", menuCode: "DeviceSpotProjectReport" },
      //       component: () => import("@/views/report/device/DeviceSpotProjectReport/index.vue")
      //     },
      //     {
      //       name: "DeviceMaintainProjectReport",
      //       path: "deviceMaintainProjectReport",
      //       meta: { title: "设备保养项目明细表", menuCode: "DeviceMaintainProjectReport" },
      //       component: () => import("@/views/report/device/DeviceMaintainProjectReport/index.vue")
      //     },
      //     {
      //       name: "DeviceSpotInspectExceptionReport",
      //       path: "deviceSpotInspectExceptionReport",
      //       meta: { title: "设备点检异常分析", menuCode: "DeviceSpotInspectExceptionReport" },
      //       component: () =>
      //         import("@/views/report/device/DeviceSpotInspectExceptionReport/index.vue")
      //     },
      //     {
      //       name: "DeviceRoutingInspectExceptionReport",
      //       path: "deviceRoutingInspectExceptionReport",
      //       meta: { title: "设备巡检异常分析", menuCode: "DeviceRoutingInspectExceptionReport" },
      //       component: () =>
      //         import("@/views/report/device/DeviceRoutingInspectExceptionReport/index.vue")
      //     },
      //     {
      //       name: "DeviceMaintainExceptionReport",
      //       path: "deviceMaintainExceptionReport",
      //       meta: { title: "设备保养异常分析", menuCode: "DeviceMaintainExceptionReport" },
      //       component: () => import("@/views/report/device/DeviceMaintainExceptionReport/index.vue")
      //     },
      //     {
      //       name: "MTTRReport",
      //       path: "mTTRReport",
      //       meta: { title: "MTTR", menuCode: "MTTRReport" },
      //       component: () => import("@/views/report/device/MTTRReport/index.vue")
      //     },
      //     {
      //       name: "MonthsMTTRReport",
      //       path: "monthsMTTRReport",
      //       meta: { title: "月度MTTR", menuCode: "MonthsMTTRReport" },
      //       component: () => import("@/views/report/device/MonthsMTTRReport/index.vue")
      //     },
      //     {
      //       name: "MTBFReport",
      //       path: "mTBFReport",
      //       meta: { title: "MTBF", menuCode: "MTBFReport" },
      //       component: () => import("@/views/report/device/MTBFReport/index.vue")
      //     },
      //     {
      //       name: "MonthsMTBFReport",
      //       path: "monthsMTBFReport",
      //       meta: { title: "月度产线MTBF", menuCode: "MonthsMTBFReport" },
      //       component: () => import("@/views/report/device/MonthsMTBFReport/index.vue")
      //     }
      //   ]
      // },
      // {
      //   name: "ReportAndon",
      //   path: "reportAndon",
      //   meta: { title: "Andon", icon: "report-andon-left", menuCode: "ReportAndon" },
      //   children: [
      //     {
      //       name: "AndonStopTimeReport",
      //       path: "andonStopTimeReport",
      //       meta: { title: "andon停机时长明细表", menuCode: "AndonStopTimeReport" },
      //       component: () => import("@/views/report/andon/AndonStopTimeReport/index.vue")
      //     },
      //     {
      //       name: "AndonResponseTimeReport",
      //       path: "andonResponseTimeReport",
      //       meta: { title: "andon响应时长分析", menuCode: "AndonResponseTimeReport" },
      //       component: () => import("@/views/report/andon/AndonResponseTimeReport/index.vue")
      //     },
      //     {
      //       name: "AndonDealTimeReport",
      //       path: "andonDealTimeReport",
      //       meta: { title: "andon解决时长分析", menuCode: "AndonDealTimeReport" },
      //       component: () => import("@/views/report/andon/AndonDealTimeReport/index.vue")
      //     },
      //     {
      //       name: "AndonTimeReport",
      //       path: "andonTimeReport",
      //       meta: { title: "andon时长统计分析", menuCode: "AndonTimeReport" },
      //       component: () => import("@/views/report/andon/AndonTimeReport/index.vue")
      //     },
      //     {
      //       name: "AndonTypeTimeReport",
      //       path: "andonTypeTimeReport",
      //       meta: { title: "andon类别统计分析", menuCode: "AndonTypeTimeReport" },
      //       component: () => import("@/views/report/andon/AndonTypeTimeReport/index.vue")
      //     },
      //     {
      //       name: "AndonDefineReport",
      //       path: "andonDefineReport",
      //       meta: { title: "andon定义分析TOP10", menuCode: "AndonDefineReport" },
      //       component: () => import("@/views/report/andon/AndonDefineReport/index.vue")
      //     },
      //     {
      //       name: "AndonErrorReport",
      //       path: "andonErrorReport",
      //       meta: { title: "andon故障分析TOP10", menuCode: "AndonErrorReport" },
      //       component: () => import("@/views/report/andon/AndonErrorReport/index.vue")
      //     },
      //     {
      //       name: "AndonDeviceReport",
      //       path: "andonDeviceReport",
      //       meta: { title: "andon设备分析TOP10", menuCode: "AndonDeviceReport" },
      //       component: () => import("@/views/report/andon/AndonDeviceReport/index.vue")
      //     },
      //     {
      //       name: "AndonCountReport",
      //       path: "andonCountReport",
      //       meta: { title: "andon次数TOP10", menuCode: "AndonCountReport" },
      //       component: () => import("@/views/report/andon/AndonCountReport/index.vue")
      //     }
      //   ]
      // },
      // {
      //   name: "ReportUser",
      //   path: "reportUser",
      //   meta: { title: "人员", icon: "report-user-left", menuCode: "ReportUser" },
      //   children: [
      //     {
      //       name: "WorkLicenseFrozenReport",
      //       path: "workLicenseFrozenReport",
      //       meta: { title: "员工上岗证冻结明细表", menuCode: "WorkLicenseFrozenReport" },
      //       component: () => import("@/views/report/user/WorkLicenseFrozenReport/index.vue")
      //     },
      //     {
      //       name: "WorkReport",
      //       path: "workReport",
      //       meta: { title: "上岗记录表", menuCode: "WorkReport" },
      //       component: () => import("@/views/report/user/WorkReport/index.vue")
      //     },
      //     {
      //       name: "WorkLicenseAnalysisReport",
      //       path: "workLicenseAnalysisReport",
      //       meta: { title: "员工上岗证统计分析表", menuCode: "WorkLicenseAnalysisReport" },
      //       component: () => import("@/views/report/user/WorkLicenseAnalysisReport/index.vue")
      //     }
      //   ]
      // }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes as RouteRecordRaw[],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router
