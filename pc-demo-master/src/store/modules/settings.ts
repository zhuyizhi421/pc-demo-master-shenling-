import defaultSettings from "@/settings"

const { showSettings, topNav } = defaultSettings

const useSettingsStore = defineStore(import.meta.env.VITE_PRODUCT_NAME + "-settings", {
  state: () => ({
    title: "",
    showSettings: showSettings,
    topNav: topNav
  })
})

export default useSettingsStore
