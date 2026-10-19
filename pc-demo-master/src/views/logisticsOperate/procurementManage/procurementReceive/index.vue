<template>
  <div class="layout-container">
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="采购收货列表" />

        <CustomTable
          ref="tableRef"
          v-model:table-data="tableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
        >
          <template #detailContent-default="{ row: { detailContent } }">
            <el-popover placement="left" :width="720" trigger="hover">
              <template #reference>
                {{ formatterContent(detailContent) }}
              </template>
              <CustomTable :table-data="detailContent" :config="contentTableConfig"></CustomTable>
            </el-popover>
          </template>

          <template #operation-default="{ row }">
            <el-button link type="primary" size="small" @click="onViewDetailClick(row)"
              >查看
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
    </div>

    <!-- 子页面部分 -->
    <div class="layout-child-page" v-if="curPageKey !== EnumPageType.Main">
      <CustomPageCrumbs v-model="curPageKey" :data="pageTree" />

      <!-- 采购收货详情 -->
      <ReceiveDetail
        v-if="curPageKey === EnumPageType.Procurement_receive_detail"
        :id="selectedRowId"
        @close="curPageKey = EnumPageType.Main"
      ></ReceiveDetail>
    </div>
  </div>
</template>

<script setup lang="ts">
import { queryPurchaseReceivePageList } from "@/api/logistics/purchase-manage/parchaseReceive"
import CustomPageCrumbs from "@/components/CustomPageCrumbs/index.vue"
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
import { FORMAT_TIME, TIME_RANGE } from "@/constant/time"
import type {
  IPurchaseReceivePageListItem as ITableRow,
  IPurchaseReceivePageParams
} from "@/types/logistics/purchaseReceive"

import ReceiveDetail from "./components/ReceiveDetail.vue"

defineOptions({
  name: "ProcurementReceive"
})

/** 页面显示类型枚举 */
enum EnumPageType {
  Main, // 列表页
  Procurement_receive_detail // 采购收货详情页
}

const curPageKey = ref(EnumPageType.Main)
const pageTree = ref([
  {
    name: "采购收货",
    key: EnumPageType.Main,
    children: [
      {
        name: "采购收货详情",
        key: EnumPageType.Procurement_receive_detail
      }
    ]
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  productName: string
  productCode: string
  taskCode: string
  purchaseCode: string
  batchCode: string
  productBarcode: string
  receiveTimeStart: string
  receiveTimeEnd: string
}>([
  {
    type: EnumComponentType.Input,
    label: "产品名称",
    key: "productName",
    value: "",
    placeholder: "请输入产品名称"
  },
  {
    type: EnumComponentType.Input,
    label: "产品编号",
    key: "productCode",
    value: "",
    placeholder: "请输入产品编号"
  },
  {
    type: EnumComponentType.Input,
    label: "收货单号",
    key: "taskCode",
    value: "",
    placeholder: "请输入收货单号"
  },
  {
    type: EnumComponentType.Input,
    label: "采购单号",
    key: "purchaseCode",
    value: "",
    placeholder: "请输入采购单号"
  },
  {
    type: EnumComponentType.Input,
    label: "批次号",
    key: "batchCode",
    value: "",
    placeholder: "请输入批次号"
  },
  {
    type: EnumComponentType.Input,
    label: "产品条码",
    key: "productBarcode",
    value: "",
    placeholder: "请输入产品条码"
  },
  {
    type: EnumComponentType.Date,
    dateType: "datetimerange",
    label: "收货时间",
    key: "date",
    value: ["", ""],
    placeholder: ["开始时间", "结束时间"],
    format: FORMAT_TIME,
    valueFormat: FORMAT_TIME,
    defaultTime: TIME_RANGE,
    keyword: ["receiveTimeStart", "receiveTimeEnd"]
  }
])

const selectedRowId = ref("") // 选中行id
const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "receiptCode",
      label: "收货单号",
      minWidth: 160
    },
    {
      prop: "purchaseCode",
      label: "采购单号",
      minWidth: 160
    },
    {
      prop: "supplierName",
      label: "供应商名称",
      minWidth: 160
    },
    {
      prop: "receiveTime",
      label: "收货时间",
      width: 160,
      align: "center"
    },
    {
      prop: "receiver",
      label: "收货人",
      minWidth: 120
    },
    {
      prop: "detailContent",
      label: "收货内容",
      minWidth: 160,
      showOverflowTooltip: false,
      className: "custom-table-content-ellipsis",
      slots: {
        default: "detailContent-default"
      }
    },
    {
      prop: "operation",
      label: "操作",
      width: 80,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IPurchaseReceivePageParams], ITableRow, true> = {
  api: queryPurchaseReceivePageList,
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

const contentTableConfig = ref<ITableConfig>({
  columns: [
    {
      prop: "productBatch",
      label: "批次号",
      minWidth: 160
    },
    {
      prop: "productName",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "productCode",
      label: "产品编号",
      minWidth: 160
    },
    {
      prop: "receiveNum",
      label: "收货数量",
      minWidth: 120,
      align: "right"
    },
    {
      prop: "unit",
      label: "单位",
      minWidth: 90,
      align: "center"
    }
  ]
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

/** 获取收货内容 */
const formatterContent = (data: ITableRow["detailContent"]) => {
  const productSet = new Set()
  data?.forEach((item) => {
    productSet.add(item.productName)
  })
  const arr = Array.from(productSet)
  return arr.join(",")
}

/** 查看详情 */
const onViewDetailClick = (row: ITableRow) => {
  curPageKey.value = EnumPageType.Procurement_receive_detail
  selectedRowId.value = row.id
}
</script>

<style lang="scss" scoped></style>
