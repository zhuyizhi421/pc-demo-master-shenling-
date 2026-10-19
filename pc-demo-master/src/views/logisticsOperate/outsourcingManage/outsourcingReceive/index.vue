<!--  仓库运营管理 - 委外收货 -->
<template>
  <div class="layout-container">
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="委外收货列表" />

        <CustomTable
          ref="tableRef"
          v-model:table-data="tableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
        >
          <template #receiveItems-default="{ row: { receiveItems } }">
            <el-popover placement="left" width="600" trigger="hover">
              <template #reference> {{ formatterContent(receiveItems) }} </template>
              <CustomTable :table-data="receiveItems" :config="contentTableConfig"></CustomTable>
            </el-popover>
          </template>

          <template #operation-default="{ row }">
            <el-button link type="primary" @click="onViewClick(row)">查看</el-button>
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

      <!-- 委外收货记录详情子页面 -->
      <ReceiveDetail
        v-if="curPageKey === EnumPageType.Outsource_receive_detail"
        :current-row="curClickRow!"
        :id="curClickRowId"
        @close="curPageKey = EnumPageType.Main"
      ></ReceiveDetail>
    </div>
  </div>
</template>

<script setup lang="ts">
import { queryOutsourcingReceivePage } from "@/api/logistics/outsourcingReceive"
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
  IOutsourcingReceiveListItem as ITableRow,
  IOutsourcingReceivePageListReq
} from "@/types/logistics/outsourcingReceive"

import ReceiveDetail from "./components/ReceiveDetail.vue"

defineOptions({
  name: "OutsourcingReceive"
})

/** 页面显示类型枚举 */
enum EnumPageType {
  Main, // 列表页
  Outsource_receive_detail // 委外收货详情
}

const curPageKey = ref(EnumPageType.Main)
const pageTree = ref([
  {
    name: "委外收货",
    key: EnumPageType.Main,
    children: [
      {
        name: "委外收货详情",
        key: EnumPageType.Outsource_receive_detail
      }
    ]
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  productModelName: string
  productModelCode: string
  receiveNo: string
  startDate: string
  endDate: string
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
    label: "收货单号",
    key: "receiveNo",
    value: "",
    placeholder: "请输入收货单号"
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
    keyword: ["startDate", "endDate"]
  }
])

const curClickRowId = ref<string>("")
const curClickRow = ref<ITableRow>()
const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "code",
      label: "收货单号",
      minWidth: 160
    },
    {
      prop: "delegateNo",
      label: "委外单号",
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
      minWidth: 160,
      align: "center"
    },
    {
      prop: "receiveEmpName",
      label: "收货人",
      minWidth: 120
    },
    {
      prop: "receiveItems",
      label: "收货内容",
      minWidth: 160,
      showOverflowTooltip: false,
      className: "custom-table-content-ellipsis",
      slots: {
        default: "receiveItems-default"
      }
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
const queryConfig: ITableRequestConfig<[IOutsourcingReceivePageListReq], ITableRow, true> = {
  api: queryOutsourcingReceivePage,
  getParams: () => {
    const { startDate, endDate, ...restParams } = getFormData()
    return [
      {
        dateRange: {
          startDate,
          endDate
        },
        pageQuery: {
          pageNum: pagination.currentPage,
          pageSize: pagination.pageSize
        },
        queryParam: restParams
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
      prop: "barcode",
      label: "标签号",
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
      label: "收货数量",
      width: 90,
      align: "right"
    },
    {
      prop: "unitName",
      label: "单位",
      width: 90,
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

/** 查看详情 */
const onViewClick = (row: ITableRow) => {
  curClickRowId.value = row.id
  curClickRow.value = row
  curPageKey.value = EnumPageType.Outsource_receive_detail
}

/** 获取收货内容 */
const formatterContent = (data: any[]) => {
  const productSet = new Set()
  if (data && data.length) {
    data.forEach((item) => {
      productSet.add(item.productModelName)
    })
  }
  const arr = Array.from(productSet)
  return arr.join(",")
}
</script>

<style lang="scss" scoped></style>
