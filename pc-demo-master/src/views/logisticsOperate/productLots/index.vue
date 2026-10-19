<!-- 物流运营管理 - 产品记录- 产品批次记录 -->
<template>
  <div class="layout-container">
    <CustomSearchForm
      :form-list="searchList"
      @search="onSubmit"
      @reset="onReset"
    ></CustomSearchForm>

    <div class="custom-table-container">
      <CustomTitle title="产品批次" />

      <CustomTable
        ref="tableRef"
        v-model:table-data="tableData"
        v-model:total="pagination.total"
        :config="tableConfig"
        :query-config="queryConfig"
      >
        <template #operation-default="{ row }">
          <el-button
            link
            type="primary"
            size="small"
            @click="productLotDetailRef!.setVisible(true, row)"
            >查看详情
          </el-button>
        </template>
      </CustomTable>
    </div>
    <CustomPagination
      v-model:currentPage="pagination.currentPage"
      v-model:pageSize="pagination.pageSize"
      :total="pagination.total"
      border
      @change="tableRef?.requestData()"
    />

    <ProductLotDetail ref="productLotDetailRef" />
  </div>
</template>

<script setup lang="ts">
import { queryProductBatchPageList } from "@/api/logistics/batch"
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
import { EnumBatchModelType, EnumBatchModelTypeMap } from "@/constant/enums"
import { FORMAT_TIME, TIME_RANGE } from "@/constant/time"
import type {
  IProductBatchPageListItem as ITableRow,
  IProductBatchPageListParams
} from "@/types/logistics/batch"
import { precisionConversion } from "@/utils/common"

import ProductLotDetail from "./components/details.vue"

defineOptions({
  name: "ProductLots"
})

const { searchList, resetForm, getFormData } = useSearchForm<{}>([
  {
    type: EnumComponentType.Input,
    label: "批次号",
    key: "batchNo",
    value: "",
    placeholder: "请输入批次号"
  },
  {
    type: EnumComponentType.Select,
    label: "批次类型",
    key: "batchType",
    value: "",
    placeholder: "请选择批次类型",
    options: Object.entries(EnumBatchModelTypeMap).map(([key, value]) => ({
      label: value,
      value: +key
    }))
  },
  {
    type: EnumComponentType.Input,
    label: "产品名称",
    key: "productModelName",
    value: "",
    placeholder: "请输入产品名称"
  },
  {
    type: EnumComponentType.Input,
    label: "生产订单",
    key: "productionOrderNo",
    value: "",
    placeholder: "请输入生产订单"
  },
  {
    type: EnumComponentType.Date,
    dateType: "datetimerange",
    label: "创建时间",
    key: "date",
    value: ["", ""],
    placeholder: ["开始时间", "结束时间"],
    format: FORMAT_TIME,
    valueFormat: FORMAT_TIME,
    defaultTime: TIME_RANGE,
    keyword: ["createTimeStart", "createTimeEnd"]
  }
])

const productLotDetailRef = ref<InstanceType<typeof ProductLotDetail>>()
const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "batchNo",
      label: "批次号",
      minWidth: 160
    },
    {
      prop: "batchType",
      label: "批次类型",
      minWidth: 120,
      align: "center",
      formatter: ({ batchType }) => EnumBatchModelTypeMap[batchType as EnumBatchModelType]
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
      prop: "batchQuantity",
      label: "批次总数",
      minWidth: 120,
      align: "right",
      formatter: ({ batchQuantity, decimalNumber }) =>
        precisionConversion(batchQuantity, decimalNumber)
    },
    {
      prop: "unitName",
      label: "单位",
      minWidth: 90,
      align: "center"
    },
    {
      prop: "createTime",
      label: "创建时间",
      minWidth: 160
    },
    {
      prop: "operation",
      label: "操作",
      width: 120,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IProductBatchPageListParams], ITableRow, true> = {
  api: queryProductBatchPageList,
  getParams: () => {
    return [
      {
        ...getFormData(),
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

<style scoped lang="scss">
.fContainer {
  height: 100%;
  display: flex;
  flex-direction: column;

  .spaceStyle {
    height: 24px;
  }

  .titleTableBox {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    :deep(.el-table) {
      flex: 1;
      margin-bottom: 16px;
    }
  }
}
</style>
