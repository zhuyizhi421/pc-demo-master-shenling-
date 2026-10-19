import type { App } from "vue"

import tab from "./tab"

export default function installPlugins(app: App) {
  // 页签操作
  app.config.globalProperties.$tab = tab
}
