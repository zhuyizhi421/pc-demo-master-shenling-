import axios from "axios"
import { type App } from "vue"

import { downloadFile } from "@/utils/common"

export default (app: App<HTMLElement>) => {
  app.directive("download", {
    mounted(el, binding) {
      el.addEventListener("click", async () => {
        try {
          binding.value.onStart?.()

          let res
          if (binding.value.method === "get") {
            res = await axios.get(binding.value.url, {
              responseType: "blob",
              params: binding.value.params
            })
          } else if (binding.value.method === "post") {
            res = await axios.post(binding.value.url, binding.value.params, {
              responseType: "blob"
            })
          }
          if (res) {
            downloadFile(res)
          }
        } catch (error) {
          /* empty */
        }
        binding.value.onEnd?.()
      })
    }
  })
}
