/**
 * v-preventReClick 指令
 *
 * 作用：防止重复点击
 *
 * 使用方法：
 *    无参数使用方式：
 *      <button v-preventReClick="handleClick">点击</button>
 *    带参数使用方式：
 *      <button v-preventReClick="[handleClick, arg1, arg2]">点击</button>
 * */

import { ElMessage } from "element-plus"
import { type App } from "vue"

const preventReClick = (app: App<HTMLElement>) => {
  app.directive("preventReClick", {
    mounted(el, binding) {
      let { value } = binding

      if (!Array.isArray(value)) {
        value = [value]
      }

      const [fn, ...args] = value
      let isExecution = false

      if (typeof fn === "function") {
        const callback = async () => {
          if (isExecution) {
            ElMessage({
              type: "warning",
              message: "请勿重复操作",
              grouping: true
            })
            return
          }

          isExecution = true
          try {
            await fn(...args)
          } finally {
            isExecution = false
          }
        }

        el._clickFn = callback
        el.addEventListener("click", callback)
      }
    },
    unmounted(el) {
      el.removeEventListener("click", el._clickFn)
    }
  })
}

export default preventReClick
