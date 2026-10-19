import type { IGlobalConfigStyleParams } from "@/types/base-info/global-config"

const useSystemStore = defineStore(import.meta.env.VITE_PRODUCT_NAME + "-system", {
  state: (): {
    systemInfo: IGlobalConfigStyleParams | null
  } => ({
    systemInfo: null
  }),
  actions: {
    setSystemInfo(info: IGlobalConfigStyleParams) {
      this.systemInfo = {
        ...info,
        systemName: info.systemName || "数字化工厂系统",
        systemShortName: info.systemShortName || "数字化工厂"
      }
    }
  },
  persist: {
    paths: ["systemInfo"]
  }
})

export default useSystemStore
