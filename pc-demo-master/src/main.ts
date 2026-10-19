import "dayjs/locale/zh-cn"
// import 'element-plus/dist/index.css'
import "element-plus/theme-chalk/index.css"
import "virtual:svg-icons-register"
import "@/assets/styles/index.scss"
import "@/api/interceptor"
import "./permission"

import ElementPlus from "element-plus"
// @ts-ignore
import locale from "element-plus/es/locale/lang/zh-cn"
import localforage from "localforage"
import piniaPluginPersistedstate from "pinia-plugin-persistedstate"
import { createApp } from "vue"

import svgIcons from "@/components/SvgIcon/Index.vue"
import elementIcons from "@/components/SvgIcon/svgicon"
import download from "@/directive/downLoadUrl"
import preventReClick from "@/directive/preventReClick"
import store from "@/store"

import App from "./App.vue"
// 注册指令
import plugins from "./plugins" // plugins
import router from "./router"

localforage.config({
  name: "wenzhi-mes",
  storeName: "wenzhi-mes"
})

dayjs.locale("zh-cn")
const app = createApp(App)
store.use(piniaPluginPersistedstate)

app.use(preventReClick)
app.use(download)
app.use(store)
app.use(router)
app.use(plugins)
app.use(ElementPlus, {
  locale,
  size: "default"
})

app.use(elementIcons)
app.component("svg-icon", svgIcons)

app.mount("#app")
