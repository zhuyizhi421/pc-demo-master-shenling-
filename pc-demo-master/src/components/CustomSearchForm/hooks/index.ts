import { isEqual } from "lodash-es"

import { EnumComponentType, type ISearchItem } from "@/components/CustomSearchForm/type"
import { isEffectiveValue } from "@/utils/common"

export default function useSearchForm<T extends Record<string, any>>(formList: ISearchItem[]) {
  const originData: ISearchItem[] = cloneDeep(formList)

  // 响应式表单数据
  const searchList = ref<ISearchItem[]>(formList)

  // 监听表单依赖数据变化后，更新响应式表单数据
  watch(
    () => markRaw(formList), // 标记原始数据
    (newList) => {
      if (!isEqual(newList, searchList.value)) {
        searchList.value = cloneDeep(newList)
      }
    },
    { deep: true }
  )

  /**
   * 重置表单
   */
  const resetForm = () => {
    searchList.value = searchList.value.map((item) => {
      const value = cloneDeep(originData).find((val: ISearchItem) => val.key === item.key).value
      return {
        ...item,
        value
      }
    })
  }

  /**
   * 是否需要返回数据
   */
  const isNeedReturn = (item: ISearchItem) => {
    if (item.hidden) return false
    if (item.linkProps) {
      const findValue = searchList.value.find((val) => val.key === item.linkProps!.linkKey)?.value
      if (findValue) {
        if (item.linkProps.conditionSign) {
          return findValue === item.linkProps!.showByLinkKeyCondition
        } else {
          return findValue !== item.linkProps!.showByLinkKeyCondition
        }
      } else {
        return false
      }
    }
    return true
  }

  /**
   * 获取表单数据
   */
  const getFormData = () => {
    const data: Record<string, any> = {}
    searchList.value.forEach((item) => {
      // 日期范围类型时，value实际对应两个字段
      if (isNeedReturn(item)) {
        if (item.type === EnumComponentType.Date && item.keyword?.length) {
          data[item.keyword[0]] = item.value?.[0] || ""
          data[item.keyword[1]] = item.value?.[1] || ""
        } else {
          data[item.key] = isEffectiveValue(item.value) ? item.value : undefined
        }
      }
    })
    return cloneDeep(data) as T
  }

  return {
    searchList,
    resetForm,
    getFormData
  }
}
