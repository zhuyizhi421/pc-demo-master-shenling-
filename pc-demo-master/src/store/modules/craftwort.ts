import { defineStore } from "pinia"
import { useRouter } from "vue-router"

import { type IProductModelListItem } from "@/api/product"
import type { ICraftRouteItem } from "@/types/base-info/craftRoute"

//工艺建模相关
export type CraftRouteEditInfo = ICraftRouteItem & { isGroup?: boolean; isAnd?: boolean }

type State = {
  // 设备管理中的类型状态
  quickCraftRouteInfo: IProductModelListItem | null
  craftRouteEditArr: CraftRouteEditInfo[] //工艺路线-编辑详情数组
  craftRouteInfo: ICraftRouteItem | null // 用于其他页面跳转至工艺路线页面进行查看工艺路线信息
  [str: string]: any
}
const useCraftWork = defineStore("craftwork", {
  state: (): State => ({
    quickCraftRouteInfo: null, //快捷创建工艺路线的信息
    craftRouteEditArr: [],
    craftRouteInfo: null, //工艺路线信息
    router: useRouter()
  }),
  actions: {
    goCreateCraftRoute(row: IProductModelListItem) {
      this.setQuickCraftRouteInfo(row)
      this.router.push({ name: "CraftRoute" })
    },

    clearQuickCraftRouteInfo() {
      this.quickCraftRouteInfo = null
    },
    setQuickCraftRouteInfo(row: IProductModelListItem) {
      this.quickCraftRouteInfo = row
    },
    setCraftRouteInfo(row: ICraftRouteItem) {
      this.craftRouteInfo = row
    },
    clearCraftRouteInfo() {
      this.craftRouteInfo = null
    },

    // 添加编辑详情
    addCraftRouteEdit(info: CraftRouteEditInfo) {
      this.craftRouteEditArr?.push(info)
    },
    // 清空工艺路线的编辑详情
    clearCraftRouteEditByIndex(index: number) {
      this.craftRouteEditArr?.splice(index)
      this.craftRouteEditArr = [...this.craftRouteEditArr]
    },
    updateCraftRouteEditByIndex(index: number, info: CraftRouteEditInfo) {
      this.craftRouteEditArr?.splice(index, 1, info)
      this.craftRouteEditArr = [...this.craftRouteEditArr]
    }
  }
})

export default useCraftWork
