<!--  物流运营管理 - 产品记录 - 报废记录 -->
<template>
  <div class="layout-container">
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="报废列表" />

        <CustomTable
          ref="tableRef"
          v-model:table-data="tableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
        >
          <template #content-default="{ row: { productList } }">
            <el-popover placement="left" width="600" trigger="hover">
              <template #reference> {{ formatterContent(productList) }} </template>
              <CustomTable :table-data="productList" :config="contentTableConfig"></CustomTable>
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

      <!-- 报废记录详情子页面 -->
      <ScrapRecordDetail
        v-if="curPageKey === EnumPageType.Scrap_detail"
        :id="curClickRowId"
        @close="curPageKey = EnumPageType.Main"
      ></ScrapRecordDetail>
    </div>
  </div>
</template>

<script setup lang="ts">
import { queryScrapRecordPageList } from "@/api/logistics/scrapRecord"
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
  IScrapRecordItem as ITableRow,
  IScrapRecordPageListReq
} from "@/types/logistics/scrapRecord"

import ScrapRecordDetail from "./components/ScrapRecordDetail.vue"

defineOptions({
  name: "ScrapRecord"
})

/** 页面显示类型枚举 */
enum EnumPageType {
  Main, // 列表页
  Scrap_detail // 报废记录详情
}

const curPageKey = ref(EnumPageType.Main)
const pageTree = ref([
  {
    name: "报废记录",
    key: EnumPageType.Main,
    children: [
      {
        name: "报废记录详情",
        key: EnumPageType.Scrap_detail
      }
    ]
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  productModeCode: string
  productModeName: string
  scrapRecordNo: string
  startDate: string
  endDate: string
}>([
  {
    type: EnumComponentType.Input,
    label: "产品编号",
    key: "productModeCode",
    value: "",
    placeholder: "请输入产品编号"
  },
  {
    type: EnumComponentType.Input,
    label: "产品名称",
    key: "productModeName",
    value: "",
    placeholder: "请输入产品名称"
  },
  {
    type: EnumComponentType.Input,
    label: "报废单号",
    key: "scrapRecordNo",
    value: "",
    placeholder: "请输入报废单号"
  },
  {
    type: EnumComponentType.Date,
    dateType: "datetimerange",
    label: "报废时间",
    key: "date",
    value: ["", ""],
    placeholder: ["开始时间", "结束时间"],
    format: FORMAT_TIME,
    valueFormat: FORMAT_TIME,
    defaultTime: TIME_RANGE,
    keyword: ["startDate", "endDate"]
  }
])

const curClickRowId = ref("")
const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "no",
      label: "报废单号",
      minWidth: 160
    },
    {
      prop: "vehicleBarcodes",
      label: "标签号",
      minWidth: 160
    },
    {
      prop: "createTime",
      label: "报废时间",
      minWidth: 160,
      align: "center"
    },
    {
      prop: "reportUser.name",
      label: "登记人",
      minWidth: 120,
      align: "center"
    },
    {
      prop: "content",
      label: "报废内容",
      minWidth: 200,
      showOverflowTooltip: false,
      className: "custom-table-content-ellipsis",
      slots: {
        default: "content-default"
      }
    },
    {
      prop: "remarks",
      label: "备注",
      minWidth: 200
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
const queryConfig: ITableRequestConfig<[IScrapRecordPageListReq], ITableRow, true> = {
  api: queryScrapRecordPageList,
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
      prop: "defaultQuantity",
      label: "报废数量",
      width: 90,
      align: "right"
    },
    {
      prop: "defaultUnitName",
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

/** 格式化报废内容 */
const formatterContent = (productList: ITableRow["productList"]) => {
  return productList?.map((item) => item.productModelName)?.join("，")
}

/** 查看详情 */
const onViewClick = (row: any) => {
  curClickRowId.value = row.id
  curPageKey.value = EnumPageType.Scrap_detail
}
</script>

<style lang="scss" scoped></style>
