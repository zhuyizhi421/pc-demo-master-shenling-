<!-- 物流运营管理 - 产品记录 - 产品出库 -->
<template>
  <div class="layout-container">
    <CustomSearchForm
      :form-list="searchList"
      @search="onSubmit"
      @reset="onReset"
    ></CustomSearchForm>

    <div class="custom-table-container">
      <CustomTitle title="产品出库记录" />

      <CustomTable
        ref="tableRef"
        v-model:table-data="tableData"
        v-model:total="pagination.total"
        :config="tableConfig"
        :query-config="queryConfig"
      >
      </CustomTable>
    </div>
    <CustomPagination
      v-model:currentPage="pagination.currentPage"
      v-model:pageSize="pagination.pageSize"
      :total="pagination.total"
      border
      @change="tableRef?.requestData()"
    />
  </div>
</template>

<script setup lang="ts">
import { queryProductOutStoragePageList } from "@/api/logistics/productInOutStorage"
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
import CustomTitle from "@/components/CustomTitle/index.vue"
import { SelectType } from "@/components/SelectFactoryModel/types"
import {
  EnumProductOutStockType,
  EnumProductOutStockTypeMap,
  outboundTypeDefinitions
} from "@/constant/enums"
import { FORMAT_TIME, TIME_RANGE } from "@/constant/time"
import type {
  IProductOutStoragePageListItem as ITableRow,
  IProductOutStoragePageListParams
} from "@/types/logistics/product-in-out-storage"
import { precisionConversion } from "@/utils/common"

defineOptions({
  name: "ProductOutStorage"
})

const { searchList, resetForm, getFormData } = useSearchForm<{
  outboundType: number
  barcode: string
  productName: string
  locationId: string[]
  outboundTimeStart: string
  outboundTimeEnd: string
}>([
  {
    type: EnumComponentType.Select,
    label: "出库类型",
    key: "outboundType",
    value: "",
    placeholder: "请选择出库类型",
    options: outboundTypeDefinitions
  },
  {
    type: EnumComponentType.Input,
    label: "标签码",
    key: "barcode",
    value: "",
    placeholder: "请输入标签码"
  },
  {
    type: EnumComponentType.Input,
    label: "产品名称",
    key: "productName",
    value: "",
    placeholder: "请输入产品名称"
  },
  {
    type: EnumComponentType.Area,
    label: "库位",
    key: "locationId",
    value: [],
    placeholder: "请选择库位",
    props: {
      areaType: SelectType.LocationType,
      isEnable: true,
      multiple: true
    }
  },
  {
    type: EnumComponentType.Date,
    dateType: "datetimerange",
    label: "出库时间",
    key: "date",
    value: ["", ""],
    placeholder: ["开始时间", "结束时间"],
    format: FORMAT_TIME,
    valueFormat: FORMAT_TIME,
    defaultTime: TIME_RANGE,
    keyword: ["outboundTimeStart", "outboundTimeEnd"]
  }
])

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "outboundDetailCode",
      label: "编号",
      minWidth: 160
    },
    {
      prop: "outboundType",
      label: "出库类型",
      minWidth: 120,
      align: "center",
      formatter: ({ outboundType }) =>
        EnumProductOutStockTypeMap[outboundType as EnumProductOutStockType]
    },
    {
      prop: "barcode",
      label: "标签码",
      minWidth: 160
    },
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
      prop: "quantity",
      label: "数量",
      minWidth: 120,
      align: "right",
      formatter: ({ quantity, decimalNumber }) => precisionConversion(quantity, decimalNumber ?? 2)
    },
    {
      prop: "unitName",
      label: "单位",
      minWidth: 90,
      align: "center"
    },
    {
      prop: "facilityName",
      label: "仓库名称",
      minWidth: 160
    },
    {
      prop: "locationName",
      label: "库位名称",
      minWidth: 160
    },
    {
      prop: "operatorName",
      label: "操作人",
      minWidth: 120,
      align: "center"
    },
    {
      prop: "outboundTime",
      label: "出库时间",
      minWidth: 160,
      align: "center"
    },
    {
      prop: "otherReasonContent",
      label: "出库原因",
      minWidth: 200,
      fixed: "right"
    }
  ]
})
const queryConfig: ITableRequestConfig<[IProductOutStoragePageListParams], ITableRow, true> = {
  api: queryProductOutStoragePageList,
  getParams: () => {
    const { locationId, ...params } = getFormData()
    return [
      {
        ...params,
        locationIdStr: locationId.join(","),
        pageNum: pagination.currentPage,
        pageSize: pagination.pageSize
      }
    ]
  }
}

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

onMounted(() => {
  tableRef.value?.requestData()
})

const onSubmit = () => {
  pagination.currentPage = 1
  tableRef.value?.requestData()
}

const onReset = () => {
  resetForm()
  onSubmit()
}
</script>

<style scoped lang="scss"></style>
