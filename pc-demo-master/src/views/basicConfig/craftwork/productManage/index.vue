<template>
  <div class="layout-container">
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="产品列表">
          <div class="table-header-btn">
            <el-button v-if="isAuth" type="primary" icon="Plus" @click="tableHandle('detail')">新建产品</el-button>
            <el-button v-if="hasActiveColumnSearch" type="info" link @click="clearAllColumnSearch">清除筛选</el-button>
          </div>
        </CustomTitle>
        <CustomTable
          ref="customTableRef"
          v-model:table-data="customTableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
          class="custom-table"
        >
          <template #status-default="{ row }">
            <el-tag link :type="row.status === 1 ? 'success' : 'danger'">{{
              row.status === 1 ? "启用" : "停用"
            }}</el-tag>
          </template>

          <template #operation-default="{ row }">
            <div class="flex items-center">
              <el-button link type="primary" size="small" @click="tableHandle('detail', row)"
                >查看</el-button
              >
              <el-dropdown>
                <el-button link type="primary" size="small">
                  更多
                  <el-icon class="el-icon--right">
                    <arrow-down />
                  </el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-if="isAuth" @click="tableHandle('use', row)">
                      <el-button
                        link
                        :type="row.status === 1 ? 'danger' : 'primary'"
                        size="small"
                        >{{ row.status === 1 ? "停用" : "启用" }}</el-button
                      >
                    </el-dropdown-item>
                    <el-dropdown-item v-if="isAuth" @click="tableHandle('delete', row)">
                      <el-button link type="danger" size="small">删除</el-button>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>

          <!-- 列头搜索模板 -->
          <template #name-header>
            <ColumnSearch label="产品名称" v-model:visible="columnSearchVisible.name" :has-filter="hasColumnFilter('name')">
              <el-input v-model="columnSearchParams.name" placeholder="请输入" clearable size="small" @input="handleColumnSearch" />
              <div class="search-btns">
                <el-button v-if="columnSearchParams.name" type="primary" link size="small" @click="clearColumnSearch('name')">清空</el-button>
              </div>
            </ColumnSearch>
          </template>

          <template #productModel-header>
            <ColumnSearch label="产品型号" v-model:visible="columnSearchVisible.productModel" :has-filter="hasColumnFilter('productModel')">
              <el-input v-model="columnSearchParams.productModel" placeholder="请输入" clearable size="small" @input="handleColumnSearch" />
              <div class="search-btns">
                <el-button v-if="columnSearchParams.productModel" type="primary" link size="small" @click="clearColumnSearch('productModel')">清空</el-button>
              </div>
            </ColumnSearch>
          </template>

          <template #specification-header>
            <ColumnSearch label="产品规格" v-model:visible="columnSearchVisible.specification" :has-filter="hasColumnFilter('specification')">
              <el-input v-model="columnSearchParams.specification" placeholder="请输入" clearable size="small" @input="handleColumnSearch" />
              <div class="search-btns">
                <el-button v-if="columnSearchParams.specification" type="primary" link size="small" @click="clearColumnSearch('specification')">清空</el-button>
              </div>
            </ColumnSearch>
          </template>

          <template #code-header>
            <ColumnSearch label="产品编号" v-model:visible="columnSearchVisible.code" :has-filter="hasColumnFilter('code')">
              <el-input v-model="columnSearchParams.code" placeholder="请输入" clearable size="small" @input="handleColumnSearch" />
              <div class="search-btns">
                <el-button v-if="columnSearchParams.code" type="primary" link size="small" @click="clearColumnSearch('code')">清空</el-button>
              </div>
            </ColumnSearch>
          </template>

          <template #productCategoryName-header>
            <ColumnSearch label="产品类别名称" v-model:visible="columnSearchVisible.productCategoryName" :has-filter="hasColumnFilter('productCategoryName')">
              <el-input v-model="columnSearchParams.productCategoryName" placeholder="请输入" clearable size="small" @input="handleColumnSearch" />
              <div class="search-btns">
                <el-button v-if="columnSearchParams.productCategoryName" type="primary" link size="small" @click="clearColumnSearch('productCategoryName')">清空</el-button>
              </div>
            </ColumnSearch>
          </template>

          <template #productCategoryCode-header>
            <ColumnSearch label="产品类别编号" v-model:visible="columnSearchVisible.productCategoryCode" :has-filter="hasColumnFilter('productCategoryCode')">
              <el-input v-model="columnSearchParams.productCategoryCode" placeholder="请输入" clearable size="small" @input="handleColumnSearch" />
              <div class="search-btns">
                <el-button v-if="columnSearchParams.productCategoryCode" type="primary" link size="small" @click="clearColumnSearch('productCategoryCode')">清空</el-button>
              </div>
            </ColumnSearch>
          </template>
        </CustomTable>
      </div>

      <CustomPagination
        v-model:currentPage="pagination.currentPage"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        border
        @change="customTableRef?.requestData()"
      />
    </div>

    <!-- 产品配置子页面 -->
    <div class="layout-child-page" v-if="curPageKey !== EnumPageType.Main">
      <CustomPageCrumbs v-model="curPageKey" :data="pageTree" @change="onCrumbsChange" />

      <ProductDetail
        v-if="
          [
            EnumPageType.Product_create,
            EnumPageType.Product_update,
            EnumPageType.Product_detail
          ].includes(curPageKey)
        "
        :isReadonly="!isAuth"
        :product-info="productInfo"
        @changeCrumbs="changeCrumbs"
        @close="onDetailClose"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"
import { watch } from "vue"

import {
  ableProductModel,
  deleteProductModel,
  type IProductModelPagedRes,
  queryProductModelPageList,
  requestProductCategoryList
} from "@/api/product"
import CustomPageCrumbs from "@/components/CustomPageCrumbs/index.vue"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType, type ISearchItem } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import useButtonAuth from "@/hooks/useButtonAuth"
import useProductStore from "@/store/modules/product"
import type { IProductModelItem as ITableRow, IProductModelParams } from "@/types/base-info/product"

import ColumnSearch from "../semiAxleBlankingCard/components/ColumnSearch.vue"
import ProductDetail from "./components/ProductDetail.vue"

defineOptions({
  name: "ProductManage"
})

type ProductModelData = IProductModelPagedRes["records"][number] | null

const productStore = useProductStore()
const isAuth = useButtonAuth("ProductManage_update", "ProductManage_query")
const productCateOptions = ref<
  {
    label: string
    value: string
  }[]
>([])

const productTypeList = computed(() => {
  return productStore.productTypeList
})

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "name",
    label: "产品名称",
    value: "",
    placeholder: "请输入产品名称"
  },
  {
    type: EnumComponentType.Input,
    key: "code",
    label: "产品编号",
    value: "",
    placeholder: "请输入产品编号"
  },
  {
    type: EnumComponentType.Select,
    key: "productCategoryId",
    label: "产品类别",
    value: "",
    placeholder: "请选择产品类别",
    options: productCateOptions
  },
  {
    type: EnumComponentType.Select,
    key: "productTypes",
    label: "产品类型",
    value: "",
    placeholder: "请选择产品类型",
    options: productTypeList,
    multiple: true,
    maxTag: 2
  }
  // {
  //   type: EnumComponentType.Input,
  //   key: "",
  //   label: "产品图号",
  //   value: "",
  //   placeholder: "请输入产品图号"
  // },
  // {
  //   type: EnumComponentType.Input,
  //   key: "",
  //   label: "产品规格",
  //   value: "",
  //   placeholder: "请输入产品规格"
  // }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  name: string
  code: string
  productCategoryId: string
  productTypes?: number[]
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 列头搜索参数
const columnSearchParams = reactive<Record<string, string>>({
  name: "",
  productModel: "",
  specification: "",
  code: "",
  productCategoryName: "",
  productCategoryCode: ""
})

// 列头搜索弹窗显示状态
const columnSearchVisible = reactive<Record<string, boolean>>({
  name: false,
  productModel: false,
  specification: false,
  code: false,
  productCategoryName: false,
  productCategoryCode: false
})

// 判断是否有筛选
const hasColumnFilter = (key: string) => {
  return !!columnSearchParams[key]
}

// 清除单个列头搜索
const clearColumnSearch = (key: string) => {
  columnSearchParams[key] = ""
  handleColumnSearch()
}

// 清除所有列头搜索
const clearAllColumnSearch = () => {
  Object.keys(columnSearchParams).forEach(key => {
    columnSearchParams[key] = ""
  })
  handleColumnSearch()
}

// 是否有任何列头筛选
const hasActiveColumnSearch = computed(() => {
  return Object.values(columnSearchParams).some(v => !!v)
})

// 列头搜索过滤
const handleColumnSearch = () => {
  let filteredData = [...allProductsData.value]

  // 产品名称
  if (columnSearchParams.name) {
    filteredData = filteredData.filter(item =>
      item.name?.toString().toLowerCase().includes(columnSearchParams.name.toLowerCase())
    )
  }
  // 产品型号
  if (columnSearchParams.productModel) {
    filteredData = filteredData.filter(item =>
      item.productModel?.toString().toLowerCase().includes(columnSearchParams.productModel.toLowerCase())
    )
  }
  // 产品规格
  if (columnSearchParams.specification) {
    filteredData = filteredData.filter(item =>
      item.specification?.toString().toLowerCase().includes(columnSearchParams.specification.toLowerCase())
    )
  }
  // 产品编号
  if (columnSearchParams.code) {
    filteredData = filteredData.filter(item =>
      item.code?.toString().toLowerCase().includes(columnSearchParams.code.toLowerCase())
    )
  }
  // 产品类别名称
  if (columnSearchParams.productCategoryName) {
    filteredData = filteredData.filter(item =>
      item.productCategoryName?.toString().toLowerCase().includes(columnSearchParams.productCategoryName.toLowerCase())
    )
  }
  // 产品类别编号
  if (columnSearchParams.productCategoryCode) {
    filteredData = filteredData.filter(item =>
      item.productCategoryCode?.toString().toLowerCase().includes(columnSearchParams.productCategoryCode.toLowerCase())
    )
  }

  // 更新分页数据
  pagination.value.total = filteredData.length
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  customTableData.value = filteredData.slice(start, end)
}

const productInfo = ref<ProductModelData>(null)

enum EnumPageType {
  Main, // 列表页
  Product_create, // 产品新建
  Product_update, // 产品编辑
  Product_detail // 产品详情
}
const curPageKey = ref(EnumPageType.Main)

const pageTree = ref([
  {
    name: "产品管理",
    key: EnumPageType.Main,
    children: [
      {
        name: "产品管理新建",
        key: EnumPageType.Product_create
      },
      {
        name: "产品管理编辑",
        key: EnumPageType.Product_update
      },
      {
        name: "产品管理详情",
        key: EnumPageType.Product_detail
      }
    ]
  }
])

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "name",
      label: "产品名称",
      minWidth: 160,
      slots: {
        header: "name-header"
      }
    },
    {
      prop: "productModel",
      label: "产品型号",
      minWidth: 160,
      slots: {
        header: "productModel-header"
      }
    },
    {
      prop: "specification",
      label: "产品规格",
      minWidth: 160,
      slots: {
        header: "specification-header"
      }
    },
    {
      prop: "code",
      label: "产品编号",
      minWidth: 160,
      slots: {
        header: "code-header"
      }
    },
    {
      prop: "status",
      label: "状态",
      width: 120,
      align: "center",
      slots: {
        default: "status-default"
      }
    },
    {
      prop: "productCategoryName",
      label: "产品类别名称",
      minWidth: 160,
      slots: {
        header: "productCategoryName-header"
      }
    },
    {
      prop: "productCategoryCode",
      label: "产品类别编号",
      minWidth: 160,
      slots: {
        header: "productCategoryCode-header"
      }
    },
    {
      prop: "productType",
      label: "产品类型",
      width: 160,
      align: "center",
      formatter: (row: ITableRow) => {
        return productStore.productTypeMap[row.productType]
      }
    },
    // {
    //   prop: "",
    //   label: "产品图号",
    //   minWidth: 160
    // },
    // {
    //   prop: "",
    //   label: "产品规格",
    //   minWidth: 160
    // },
    // {
    //   prop: "",
    //   label: "创建时间",
    //   minWidth: 160,
    //   align: "center"
    // },
    // {
    //   prop: "",
    //   label: "创建人",
    //   minWidth: 160,
    //   align: "center"
    // },
    // {
    //   prop: "",
    //   label: "更新时间",
    //   minWidth: 160,
    //   align: "center"
    // },
    // {
    //   prop: "",
    //   label: "更新人",
    //   minWidth: 160,
    //   align: "center"
    // },
    {
      prop: "remark",
      label: "备注",
      minWidth: 200
    },
    {
      prop: "operation",
      label: "操作",
      width: 110,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IProductModelParams], ITableRow, true> = {
  api: queryProductModelPageList,
  getParams: () => {
    return [
      {
        pageNum: pagination.value.currentPage,
        pageSize: pagination.value.pageSize,
        ...getFormData()
      }
    ]
  }
}

// 本地存储key
const LOCAL_PRODUCTS_KEY = "semi-axle-products"

// 从localStorage获取本地产品
const getLocalProducts = () => {
  try {
    const data = localStorage.getItem(LOCAL_PRODUCTS_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error("读取本地产品失败:", error)
    return []
  }
}

// 清理本地产品数据
const clearLocalProducts = () => {
  ElMessageBox.confirm("确定要清理所有本地产品数据吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    localStorage.removeItem(LOCAL_PRODUCTS_KEY)
    allProductsData.value = []
    customTableData.value = []
    pagination.value.total = 0
    ElMessage.success("本地数据已清理")
  }).catch(() => {})
}

// 保存所有数据（本地+后端）
const allProductsData = ref<any[]>([])

// 加载所有数据
const loadAllData = async () => {
  // 获取本地产品
  const localProducts = getLocalProducts()
  console.log("本地产品数量:", localProducts.length)

  try {
    // 请求后端数据
    await customTableRef.value?.requestData()
    console.log("后端产品数量:", customTableData.value.length)

    // 合并所有数据
    allProductsData.value = [...localProducts, ...customTableData.value]
    pagination.value.total = allProductsData.value.length

    // 显示第一页数据
    handlePageChange()
    console.log("合并后产品数量:", allProductsData.value.length)
  } catch (error) {
    // 如果请求失败，至少显示本地产品
    allProductsData.value = localProducts
    customTableData.value = localProducts
    pagination.value.total = localProducts.length
  }
}

// 分页变化处理
const handlePageChange = () => {
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  customTableData.value = allProductsData.value.slice(start, end)
}

// 监听分页参数变化
watch(
  () => [pagination.value.currentPage, pagination.value.pageSize],
  () => {
    handleColumnSearch()
  }
)

onMounted(() => {
  getProductCateOptions()
  loadAllData()
})

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

/** 获取产品类别下拉 */
const getProductCateOptions = async () => {
  const res = await requestProductCategoryList()
  productCateOptions.value =
    res.map((item) => {
      return {
        label: item.name,
        value: item.id
      }
    }) || []
}

const changeCrumbs = (type: string) => {
  if (type === "update") {
    curPageKey.value = EnumPageType.Product_update
  } else if (type === "detail") {
    curPageKey.value = EnumPageType.Product_detail
  }
}

const onDetailClose = () => {
  curPageKey.value = EnumPageType.Main
  customTableRef.value?.requestData()
}

const tableHandle = async (type: "detail" | "use" | "delete", data?: any) => {
  if (type !== "detail") {
    const tips = type === "delete" ? "删除" : data.status === 1 ? "停用" : "启用"
    await ElMessageBox.confirm(`此操作将${tips}该条数据, 是否继续?`, "提示")

    type === "use" &&
      (await ableProductModel({
        productModelId: data.id,
        newStatus: data.status === 1 ? 0 : 1
      }))
    type === "delete" && (await deleteProductModel(data.id))
    ElMessage.success(`${tips}成功`)
    await customTableRef.value?.requestData()
  } else {
    productInfo.value = data || undefined
    curPageKey.value = EnumPageType.Product_detail
    curPageKey.value = data ? EnumPageType.Product_detail : EnumPageType.Product_create
  }
}

/**
 * 退出产品详情配置
 */
const onCrumbsChange = (value: string | number) => {
  if (value === EnumPageType.Main) {
    customTableRef.value?.requestData()
  }
}
</script>

<style scoped lang="scss">
:deep(.productSetContainer) {
  padding-top: 16px;
}
</style>
