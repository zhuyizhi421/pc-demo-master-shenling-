import cloneDeep from "lodash/cloneDeep"
import { ref } from "vue"

export default function useSearch<T extends Object>(searchInitForm: T, updateCallBack: Function) {
  const searchForm = ref<T>(searchFormInit())
  const searchFormParams = ref<T>(searchFormInit())
  const pagination = ref({
    pageNum: 1,
    pageSize: 10,
    total: 0
  })

  function searchFormInit(): T {
    return cloneDeep(searchInitForm)
  }

  function searchHandle() {
    searchFormParams.value = cloneDeep(searchForm.value)

    // 点击查询按钮时，重置页码为1
    pagination.value.pageNum = 1

    updateCallBack()
  }

  function resetSearch() {
    searchForm.value = searchFormInit() as any
  }

  function resetAllStatus() {
    searchForm.value = searchFormInit() as any
    searchFormParams.value = searchFormInit() as any
    pagination.value = {
      pageNum: 1,
      pageSize: 10,
      total: 0
    }
  }

  return {
    searchHandle,
    resetSearch,
    searchFormParams,
    searchForm,
    pagination,
    searchFormInit,
    resetAllStatus
  }
}
