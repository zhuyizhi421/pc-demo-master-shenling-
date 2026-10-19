import "nprogress/nprogress.css"

import { ElMessage } from "element-plus"
import NProgress from "nprogress"
import { type RouteRecordRaw } from "vue-router"

import usePermissionStore from "@/store/modules/permission"
import useUserStore from "@/store/modules/user"

import router, { basicConfigRoutes } from "./router"

NProgress.configure({ showSpinner: false })

const whiteList = ["/login", "/register"]
const noAuthPath = [
  "/personal/trackAndTrace",
  "/personal/collect",
  "/personal/account",
  "/personal/system-messages",
  "/personal/flow"
]

basicConfigRoutes.forEach((route) => {
  router.addRoute(route as RouteRecordRaw)
})

const hasRouteAccess = (to: any) => {
  return (
    (to?.meta?.menuCode && useUserStore().menuCodes.includes(to.meta.menuCode as string)) ||
    noAuthPath.includes(to.path)
  )
}

router.beforeEach(async (to, _from, next) => {
  NProgress.start()

  const permissionStore = usePermissionStore()
  const userStore = useUserStore()

  if (userStore.token) {
    if (to.path === "/login") {
      next()
      NProgress.done()
      return
    }

    if (!permissionStore.routes.length) {
      await userStore.getUserInfo()
      await permissionStore.generateRoutes(to.path)
    }

    if (!hasRouteAccess(to)) {
      NProgress.done()
      ElMessage.error("抱歉，您无权限访问")
      next(false)
      return
    }

    next()
    return
  }

  if (whiteList.includes(to.path)) {
    next()
    return
  }

  next(`/login?redirect=${to.fullPath}`)
  NProgress.done()
})

router.afterEach(() => {
  NProgress.done()
})
