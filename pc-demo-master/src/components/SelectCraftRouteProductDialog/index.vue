<!-- 选择存在工艺路线的产品弹窗 -->
<template>
  <CustomDialog v-model="visible" title="选择产品" size="large">
    <CustomSearchForm
      :form-list="searchList"
      @search="onSubmit"
      @reset="onReset"
    ></CustomSearchForm>

    <CustomTable
      ref="tableRef"
      v-model:table-data="tableData"
      v-model:total="pagination.total"
      :config="tableConfig"
      :query-config="queryConfig"
    >
    </CustomTable>

    <CustomPagination
      v-model:currentPage="pagination.currentPage"
      v-model:pageSize="pagination.pageSize"
      :total="pagination.total"
      :border="false"
      @change="tableRef?.requestData()"
    />

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="onConfirmClick()">确定</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import {
  type IProductModelListItem as ITableRow,
  queryProductHasTechRoutePageList,
  queryProductModelListByIdList,
  requestProductCategoryList
} from "@/api/product"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import useProductStore from "@/store/modules/product"
import type { IProductModelParams } from "@/types/base-info/product"
import type { IOption } from "@/types/common"

import type { ICraftRouteProductDialogEmits, ICraftRouteProductDialogProps } from "./type"

defineOptions({
  name: "SelectProductDialog"
})

const props = withDefaults(defineProps<ICraftRouteProductDialogProps>(), {
  rowKey: "id",
  multiple: false,
  enable: true
})

const emit = defineEmits<ICraftRouteProductDialogEmits>()

const productStore = useProductStore()
const productCateOptions = ref<IOption[]>([])
const { searchList, resetForm, getFormData } = useSearchForm<{
  name: string
  code: string
  productCategoryId: string
  productTypes: number[]
}>([
  {
    type: EnumComponentType.Input,
    label: "产品名称",
    key: "name",
    value: "",
    placeholder: "请输入产品名称"
  },
  {
    type: EnumComponentType.Input,
    label: "产品编号",
    key: "code",
    value: "",
    placeholder: "请输入产品编号"
  },
  {
    type: EnumComponentType.Select,
    label: "产品类别",
    key: "productCategoryId",
    value: "",
    placeholder: "请选择产品类别",
    options: productCateOptions,
    filterable: true
  },
  {
    type: EnumComponentType.Select,
    label: "产品类型",
    key: "productTypes",
    value: "",
    placeholder: "请选择产品类型",
    options: productStore.productTypeList,
    multiple: true,
    maxTag: 2
  }
])

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: 400,
  rowKey: props.rowKey,
  reserveSelection: true,
  columns: [
    {
      prop: "name",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "code",
      label: "产品编号",
      width: 160
    },
    {
      prop: "productCategoryName",
      label: "产品类别",
      minWidth: 160
    },
    {
      prop: "productType",
      label: "产品类型",
      width: 120,
      align: "center",
      formatter: ({ productType }) => {
        return productStore.productTypeMap[productType]
      }
    },
    {
      prop: "status",
      label: "状态",
      width: 90,
      align: "center",
      formatter: ({ status }) => {
        return status === 1 ? "启用" : "停用"
      }
    },
    {
      prop: "remark",
      label: "备注",
      minWidth: 200
    },
    {
      prop: "selection",
      label: "选择",
      type: "selection",
      width: 60,
      align: "center",
      get multiple() {
        return props.multiple
      },
      fixed: "right",
      selectable: (row) => {
        return props.multiple ? !props.selectedRowKeys?.includes(row[props.rowKey]) : true
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IProductModelParams], ITableRow, true> = {
  api: queryProductHasTechRoutePageList,
  getParams: () => {
    return [
      {
        ...getFormData(),
        pageNum: pagination.currentPage,
        pageSize: pagination.pageSize,
        filterProductModelIds: props.filterProductModelIds,
        status: props.enable ? 1 : undefined
      }
    ]
  }
}

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
})

watch(
  () => props.modelValue,
  (val) => {
    console.log("dialog props", props)
    if (val) {
      getProductCateOptions()
      nextTick(() => {
        tableRef.value?.requestData()

        if (!props.selectedRowKeys?.length) {
          return
        }
        props.multiple
          ? tableRef.value?.setSelectedRows(props.selectedRowKeys, getAllProductModelData)
          : tableRef.value?.setSelectedRow(props.selectedRowKeys?.[0], getAllProductModelData)
      })
    } else {
      resetForm()
      tableData.value = []
      tableRef.value?.clearSelectedRow()
    }
  }
)

const onSubmit = () => {
  pagination.currentPage = 1
  tableRef.value?.requestData()
}

const onReset = () => {
  resetForm()
  onSubmit()
}

/** 获取产品类别下拉 */
const getProductCateOptions = async () => {
  const res = await requestProductCategoryList()
  productCateOptions.value = res.map((item) => ({
    label: item.name,
    value: item.id
  }))
}

/** 获取产品模型列表所有数据 */
const getAllProductModelData = async () => {
  const res = await queryProductModelListByIdList({
    idList: props.selectedRowKeys
  })

  return res
}

/** 提交操作 */
const onConfirmClick = () => {
  if (!props.multiple) {
    const selectedRow = tableRef.value?.getCurrentSingleRow() as ITableRow
    if (!selectedRow) {
      return ElMessage.warning("请选择产品")
    }
    emit("success", cloneDeep([selectedRow]))
  } else {
    const selectedRows = tableRef.value?.getCurrentMultipleRows() as ITableRow[]
    if (!selectedRows?.length) {
      return ElMessage.warning("请选择产品")
    }
    emit("success", cloneDeep(selectedRows))
  }
  visible.value = false
}
</script>

<style lang="scss" scoped></style>
