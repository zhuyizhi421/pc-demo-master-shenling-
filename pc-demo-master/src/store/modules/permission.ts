import Layout from "@/layout/index.vue"
import { basicConfigRoutes, constantRoutes, noAuthRoutes } from "@/router"
import { type RouteConfig } from "@/router/index"

import useUserStore from "./user"

function getCompatibleMenuCodes(menuCodes: string[] = []) {
  const nextMenuCodes = [...menuCodes]
  if (nextMenuCodes.includes("Craftwork") && !nextMenuCodes.includes("CraftTypeConfig")) {
    nextMenuCodes.push("CraftTypeConfig")
  }
  if (nextMenuCodes.includes("Craftwork") && !nextMenuCodes.includes("CraftManage")) {
    nextMenuCodes.push("CraftManage")
  }
  if (nextMenuCodes.includes("MonthPlan") && !nextMenuCodes.includes("MaintainType")) {
    nextMenuCodes.push("MaintainType")
  }
  if (nextMenuCodes.includes("MonthPlan") && !nextMenuCodes.includes("WeekPlan")) {
    nextMenuCodes.push("WeekPlan")
  }
  if (nextMenuCodes.includes("MROManagement") && !nextMenuCodes.includes("MROReturnOrder")) {
    nextMenuCodes.push("MROReturnOrder")
  }
  if (nextMenuCodes.includes("MROInventoryCheck") && !nextMenuCodes.includes("MRODifferenceOrder")) {
    nextMenuCodes.push("MRODifferenceOrder")
  }
  if (nextMenuCodes.includes("MRODifferenceOrder") && !nextMenuCodes.includes("MROAdjustOrder")) {
    nextMenuCodes.push("MROAdjustOrder")
  }
  if (nextMenuCodes.includes("DeviceRepair") && !nextMenuCodes.includes("DeviceRepairBaseConfig")) {
    nextMenuCodes.push("DeviceRepairBaseConfig")
  }
  return nextMenuCodes
}

// 匹配views里面所有的.vue文件
const modules = import.meta.glob("./../../views/**/*.vue")

const usePermissionStore = defineStore(import.meta.env.VITE_PRODUCT_NAME + "-permission", {
  state: () => ({
    routes: [] as RouteConfig[],
    addRoutes: [] as RouteConfig[],
    defaultRoutes: [] as RouteConfig[],
    topbarRouters: [] as RouteConfig[],
    sidebarRouters: [] as RouteConfig[]
  }),
  actions: {
    setRoutes(routes: RouteConfig[]) {
      this.addRoutes = routes
      this.routes = constantRoutes.concat(routes)
    },
    setDefaultRoutes(routes: RouteConfig[]) {
      this.defaultRoutes = constantRoutes.concat(routes)
    },
    setTopbarRoutes(routes: RouteConfig[]) {
      this.topbarRouters = routes
    },
    setSidebarRouters(routes: RouteConfig[]) {
      this.sidebarRouters = routes
    },
    generateRoutes(toPath?: any) {
      return new Promise((resolve) => {
        const res = [...noAuthRoutes]
        const menuCodes = getCompatibleMenuCodes(useUserStore().menuCodes)
        useUserStore().menuCodes = menuCodes
        const menuCodesSet = new Set(menuCodes)
        const routes = getAuthRoutes(basicConfigRoutes, menuCodesSet)
        res.push(...routes)
        // 要把用户个人这四项默认开头加进来
        useUserStore().setAuthedRoutes(routes)

        const sdata = JSON.parse(JSON.stringify(res))
        const rdata = JSON.parse(JSON.stringify(res))
        const defaultData = JSON.parse(JSON.stringify(res))
        const sidebarRoutes = filterAsyncRouter(sdata)
        const rewriteRoutes = filterAsyncRouter(rdata, true)
        const defaultRoutes = filterAsyncRouter(defaultData)

        this.setRoutes(rewriteRoutes)
        this.setDefaultRoutes(sidebarRoutes)
        this.setTopbarRoutes(defaultRoutes)
        this.setSidebarRouters(constantRoutes.concat(sidebarRoutes))
        resolve(rewriteRoutes)
      })
      // })
    }
  }
})

// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap: RouteConfig[], type = false) {
  return asyncRouterMap.filter((route) => {
    if (type && route.children) {
      route.children = filterChildren(route.children)
    }
    if (route.component) {
      // Layout 组件特殊处理
      if (route.component === "Layout") {
        route.component = Layout
      } else {
        route.component = loadView(route.component)
      }
    }
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children, type)
    } else {
      delete route["children"]
      delete route["redirect"]
    }
    return true
  })
}

function filterChildren(childrenMap: RouteConfig[]) {
  let children: RouteConfig[] = []
  childrenMap.forEach((el) => {
    children = children.concat(el)
  })
  return children
}

function getAuthRoutes(routesReturn: any[], menuCodesSet: Set<string>) {
  const result: any[] = []
  const routes = [...routesReturn]
  routes.forEach((item) => {
    if (menuCodesSet.has(item.meta?.menuCode)) {
      if (item.meta?.menuCode === "MaintainType") {
        item.meta.title = "保养类型"
      }
      if (item.meta?.menuCode === "DeviceRepairBaseConfig") {
        item.meta.title = "设备维修基础配置"
      }
      let c = []
      if (item.children) {
        c = getAuthRoutes(item.children, menuCodesSet)
      }
      if (item.meta?.menuCode === "Personal") return // 用户个人这四项默认不需要鉴权
      result.push({
        ...item,
        children: c
      })
    }
  })
  return result
}

export const loadView = (view: string) => {
  let res
  for (const path in modules) {
    const dir = path.split("views/")[1].split(".vue")[0]
    if (dir === view) {
      res = () => modules[path]()
    }
  }
  return res
}

export default usePermissionStore
