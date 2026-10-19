import {
  getUserAllInfo,
  login as reqLogin,
  loginOut as reqLoginOut,
  queryTenantList
} from "@/api/user"
import type { TenantInfoVO } from "@/types/base-info/user"
import { removeToken } from "@/utils/auth"
import { clearLocalForage } from "@/utils/localforage"

type State = {
  token: string
  name: string
  avatar: string
  roles: string[]
  permissions: string[]
  userInfo: {}
  roleCodes: string[]
  permissionCodes: string[]
  menuCodes: string[]
  authedRoutes: any[]
  tenantList: TenantInfoVO[]
  tenantInfo?: TenantInfoVO | null
}

const getCompatibleMenuCodes = (menuCodes: string[] = []) => {
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

const getCompatiblePermissionCodes = (permissionCodes: string[] = []) => {
  const nextPermissionCodes = [...permissionCodes]

  const hasCraftQueryFallback =
    nextPermissionCodes.includes("CraftworkInfo_query") ||
    nextPermissionCodes.includes("CraftRoute_query") ||
    nextPermissionCodes.includes("ProductManage_query")
  const hasCraftUpdateFallback =
    nextPermissionCodes.includes("CraftworkInfo_update") ||
    nextPermissionCodes.includes("CraftRoute_update") ||
    nextPermissionCodes.includes("ProductManage_update")

  if (hasCraftQueryFallback && !nextPermissionCodes.includes("CraftTypeConfig_query")) {
    nextPermissionCodes.push("CraftTypeConfig_query")
  }
  if (hasCraftUpdateFallback && !nextPermissionCodes.includes("CraftTypeConfig_update")) {
    nextPermissionCodes.push("CraftTypeConfig_update")
  }
  if (hasCraftQueryFallback && !nextPermissionCodes.includes("CraftManage_query")) {
    nextPermissionCodes.push("CraftManage_query")
  }
  if (hasCraftUpdateFallback && !nextPermissionCodes.includes("CraftManage_update")) {
    nextPermissionCodes.push("CraftManage_update")
  }
  if (
    nextPermissionCodes.includes("MonthPlan_query") &&
    !nextPermissionCodes.includes("MaintainType_query")
  ) {
    nextPermissionCodes.push("MaintainType_query")
  }
  if (
    nextPermissionCodes.includes("MonthPlan_update") &&
    !nextPermissionCodes.includes("MaintainType_update")
  ) {
    nextPermissionCodes.push("MaintainType_update")
  }
  if (
    nextPermissionCodes.includes("MonthPlan_update") &&
    !nextPermissionCodes.includes("MaintainType_delete")
  ) {
    nextPermissionCodes.push("MaintainType_delete")
  }
  if (
    nextPermissionCodes.includes("MonthPlan_query") &&
    !nextPermissionCodes.includes("WeekPlan_query")
  ) {
    nextPermissionCodes.push("WeekPlan_query")
  }
  if (
    nextPermissionCodes.includes("MonthPlan_update") &&
    !nextPermissionCodes.includes("WeekPlan_update")
  ) {
    nextPermissionCodes.push("WeekPlan_update")
  }
  if (
    nextPermissionCodes.includes("DeviceRepair_query") &&
    !nextPermissionCodes.includes("DeviceRepairBaseConfig_query")
  ) {
    nextPermissionCodes.push("DeviceRepairBaseConfig_query")
  }
  if (
    nextPermissionCodes.includes("DeviceRepair_update") &&
    !nextPermissionCodes.includes("DeviceRepairBaseConfig_update")
  ) {
    nextPermissionCodes.push("DeviceRepairBaseConfig_update")
  }
  if (
    nextPermissionCodes.includes("DeviceRepair_update") &&
    !nextPermissionCodes.includes("DeviceRepairBaseConfig_delete")
  ) {
    nextPermissionCodes.push("DeviceRepairBaseConfig_delete")
  }

  return nextPermissionCodes
}

const useUserStore = defineStore(import.meta.env.VITE_PRODUCT_NAME + "-user", {
  state: (): State => ({
    token: "",
    name: "",
    avatar: "",
    roles: [],
    permissions: [],
    userInfo: {},
    roleCodes: [],
    permissionCodes: [],
    menuCodes: [],
    authedRoutes: [], // 权限过滤后的路由,存在路由懒加载函数，不能持久化
    tenantList: [],
    tenantInfo: null
  }),
  actions: {
    // 登录
    login(userInfo: any) {
      return new Promise((resolve, reject) => {
        reqLogin(userInfo)
          .then(async (res: any) => {
            this.name = userInfo.username
            this.tenantInfo = this.tenantList.find((item) => item.id === userInfo.tenantId)
            this.token = res
            await this.getUserInfo() // 要获取到用户权限信息才算登录成功
            resolve(null)
          })
          .catch((error) => {
            this.token = ""
            this.name = ""
            reject(error)
          })
      })
    },
    // 获取用户信息
    async getUserInfo() {
      const info = await getUserAllInfo(this.name)
      this.userInfo = info ?? {}
      this.roleCodes = info?.roleCodes ?? []
      this.permissionCodes = getCompatiblePermissionCodes(info?.permissionCodes ?? [])
      this.menuCodes = getCompatibleMenuCodes(info?.deviceMenuCodes?.PC ?? [])
    },
    // 获取组织列表
    async getTenantList() {
      const infoList = await queryTenantList()
      this.tenantList = infoList

      if (!this.tenantInfo) {
        this.tenantInfo = infoList[0]
      }
    },
    // 退出系统
    logOut() {
      return new Promise((resolve, reject) => {
        reqLoginOut(this.name)
          .then(() => {
            this.token = ""
            this.roles = []
            this.permissions = []
            this.userInfo = {}
            this.roleCodes = []
            this.permissionCodes = []
            this.menuCodes = []
            this.authedRoutes = [] //
            this.tenantInfo = null
            removeToken()
            clearLocalForage()
            resolve(null)
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    setAuthedRoutes(routes: any[]) {
      this.authedRoutes = routes
    }
  },
  persist: {
    paths: [
      "token",
      "name",
      "avatar",
      "roles",
      "permissions",
      "userInfo",
      "roleCodes",
      "permissionCodes",
      "menuCodes",
      "tenantList",
      "tenantInfo"
    ]
  }
})

export default useUserStore
