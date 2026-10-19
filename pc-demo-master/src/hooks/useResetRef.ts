import cloneDeep from "lodash/cloneDeep"
import { ref } from "vue"

export default function useResetRef<T>(initialValue: T) {
  const refValue = ref(cloneDeep(initialValue))
  const resetRef = () => {
    refValue.value = cloneDeep(initialValue) as any
  }
  return [refValue, resetRef] as const
}
