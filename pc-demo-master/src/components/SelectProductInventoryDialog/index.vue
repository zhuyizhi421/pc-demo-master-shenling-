<!--  选择库存产品弹窗 -->
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
  requestProductModelByWarehouseCheck,
  requestProductModelByWarehouseCheckIds
} from "@/api/logistics/warehouseCheck"
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
import type {
  IWarehouseCheckProductListItem as ITableRow,
  IWarehouseCheckProductListParams
} from "@/types/logistics/warehouse-check"
import { precisionConversion } from "@/utils/common"

import type { IProductInventoryDialogEmits, IProductInventoryDialogProps } from "./type"

defineOptions({
  name: "SelectProductInventoryDialog"
})

const props = withDefaults(defineProps<IProductInventoryDialogProps>(), {
  rowKey: "id",
  multiple: false
})

const emit = defineEmits<IProductInventoryDialogEmits>()

const productStore = useProductStore()

const { searchList, resetForm, getFormData } = useSearchForm<{
  productModelCode: string
  productCategoryName: string
  productModelName: string
  hasInventory: number
}>([
  {
    type: EnumComponentType.Input,
    label: "产品名称",
    key: "productModelName",
    value: "",
    placeholder: "请输入产品名称"
  },
  {
    type: EnumComponentType.Input,
    label: "产品编号",
    key: "productModelCode",
    value: "",
    placeholder: "请输入产品编号"
  },
  {
    type: EnumComponentType.Input,
    label: "产品类别",
    key: "productCategoryName",
    value: "",
    placeholder: "请输入产品类别"
  },
  {
    type: EnumComponentType.Select,
    label: "库存范围",
    key: "hasInventory",
    value: props.inventory || "",
    placeholder: "请选择",
    options: [
      {
        label: "有库存",
        value: 1
      }
    ],
    filterable: true,
    get disabled() {
      return !!props.inventory || props.inventory === 0
    }
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
      prop: "productModelName",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "productModelCode",
      label: "产品编号",
      minWidth: 160
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
      formatter: ({ productType }) => productStore.productTypeMap[productType]
    },
    {
      prop: "inventoryQuantity",
      label: "库存总数",
      width: 120,
      align: "right",
      formatter: ({ inventoryQuantity, decimalNumber }) =>
        precisionConversion(inventoryQuantity, decimalNumber)
    },
    {
      prop: "unitName",
      label: "单位",
      width: 90,
      align: "center"
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
const queryConfig: ITableRequestConfig<[IWarehouseCheckProductListParams], ITableRow, true> = {
  api: requestProductModelByWarehouseCheck,
  getParams: () => {
    const { hasInventory, ...rest } = getFormData()
    return [
      {
        ...rest,
        pageNum: pagination.currentPage,
        pageSize: pagination.pageSize,
        facilityId: props.facilityId,
        hasInventory: hasInventory === 1 ? true : hasInventory === 0 ? false : undefined
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
    if (val) {
      searchList.value.find((item) => item.key === "hasInventory")!.value = props.inventory || ""

      nextTick(() => {
        tableRef.value?.requestData()

        if (!props.selectedRowKeys?.length) {
          return
        }
        props.multiple
          ? tableRef.value?.setSelectedRows(props.selectedRowKeys, getCheckedProductModelData)
          : tableRef.value?.setSelectedRow(props.selectedRowKeys?.[0], getCheckedProductModelData)
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

/** 获取产品列表所有数据 */
const getCheckedProductModelData = async () => {
  const data = await requestProductModelByWarehouseCheckIds({
    facilityId: props.facilityId,
    idList: props.selectedRowKeys
  })
  return data
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

<style scoped lang="scss"></style>
