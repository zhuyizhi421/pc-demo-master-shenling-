import { queryProductTypeList } from "@/api/product"

type IState = {
  productTypeList: {
    label: string
    value: number
  }[]
  productTypeMap: {
    [key: number]: string
  }
}

const useProductStore = defineStore(import.meta.env.VITE_PRODUCT_NAME + "-product", {
  state: (): IState => ({
    productTypeList: [],
    productTypeMap: {}
  }),
  actions: {
    async initProductTypeList() {
      const data = await queryProductTypeList()
      if (!data) {
        return
      }
      this.productTypeList = data
        .filter((item) => !!item.isConfig)
        .map((item) => ({
          label: item.productType,
          value: +item.id
        }))
      this.initProductTypeMap()
    },
    initProductTypeMap() {
      const map: { [key: number]: string } = {}
      this.productTypeList.forEach((item) => {
        map[item.value] = item.label
      })
      this.productTypeMap = map
    }
  }
})

export default useProductStore
