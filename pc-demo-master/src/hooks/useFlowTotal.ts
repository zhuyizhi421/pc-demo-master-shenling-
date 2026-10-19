import { type RemovableRef, useStorage } from "@vueuse/core"

const flowTotal: RemovableRef<number> = useStorage(
  import.meta.env.VITE_PRODUCT_NAME + "-flowTotal",
  0
)

const setFlowTotal = (val: number) => {
  flowTotal.value = val
}

const initFlowTotal = () => {
  flowTotal.value = 0
}

export const useFlowTotal = () => {
  return { flowTotal, setFlowTotal, initFlowTotal }
}
