<!-- 物流运营管理 - 销售订单 - 包装容器管理 -->
<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <CustomSearchForm
        :form-list="searchList"
        :label-width="130"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="包装容器列表"></CustomTitle>

        <CustomTable
          ref="tableRef"
          v-model:table-data="tableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
        >
          <!-- 操作列 -->
          <template #operation-default="{ row }">
            <el-button link type="primary" size="small" @click="onViewDetailClick(row)"
              >查看详情
            </el-button>
            <el-button
              type="primary"
              link
              size="small"
              :disabled="!row.barcode"
              @click="printBarcode([row.barcode])"
              >打印标签码</el-button
            >
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

    <PackContainerDialog v-model="packContainerDialogVisible" :id="currentRow.id" />
  </div>
</template>

<script setup lang="ts">
import { requestPackageSpecType } from "@/api/baseInfo/package-manage/packageSpec"
import { getPackContainerPage } from "@/api/logistics/packContainer"
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
import useBarcodePrint from "@/hooks/useBarcodePrint"
import useButtonAuth from "@/hooks/useButtonAuth"
import type { IOption } from "@/types/common"
import type {
  IPackContainerPageItem as ITableRow,
  IPackContainerPageParams
} from "@/types/logistics/packContainer"

import PackContainerDialog from "./components/PackContainerDialog.vue"

defineOptions({
  name: "PackContainerManagement"
})

const { printBarcode } = useBarcodePrint()

const Authed = useButtonAuth("PackContainerManagement_update", "PackContainerManagement_query")

const containerTypeList = ref<IOption[]>([])

const { searchList, resetForm, getFormData } = useSearchForm<{
  barcode: string
  productBarcode: string
  containerType: string
  createTimeStart: string
  createTimeEnd: string
  useTimeStart: string
  useTimeEnd: string
}>([
  {
    type: EnumComponentType.Input,
    label: "包装容器标签码",
    key: "barcode",
    value: "",
    placeholder: "请输入包装容器标签码"
  },
  {
    type: EnumComponentType.Input,
    label: "产品标签码",
    key: "productBarcode",
    value: "",
    placeholder: "请输入产品标签码"
  },
  {
    type: EnumComponentType.Select,
    label: "容器类型",
    key: "containerType",
    value: "",
    placeholder: "请选择容器类型",
    options: containerTypeList
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
  },
  {
    type: EnumComponentType.Date,
    dateType: "datetimerange",
    label: "使用时间",
    key: "date",
    value: ["", ""],
    placeholder: ["开始时间", "结束时间"],
    format: FORMAT_TIME,
    valueFormat: FORMAT_TIME,
    defaultTime: TIME_RANGE,
    keyword: ["useTimeStart", "useTimeEnd"]
  }
])

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "barcode",
      label: "包装容器标签码",
      minWidth: 160
    },
    {
      prop: "containerType",
      label: "包装容器类型",
      minWidth: 120,
      align: "center"
    },
    {
      prop: "createTime",
      label: "创建时间",
      minWidth: 160,
      align: "center"
    },
    {
      prop: "useTime",
      label: "使用时间",
      minWidth: 160,
      align: "center"
    },
    {
      prop: "operation",
      label: "操作",
      width: 160,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IPackContainerPageParams], ITableRow, true> = {
  api: getPackContainerPage,
  getParams: () => {
    return [
      {
        pageQuery: {
          pageNum: pagination.currentPage,
          pageSize: pagination.pageSize
        },
        queryParam: {
          ...getFormData()
        },
        sort: [
          {
            field: "createTime",
            order: "desc"
          }
        ]
      }
    ]
  }
}

const currentRow = ref<ITableRow>({} as ITableRow)
const packContainerDialogVisible = ref(false)

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

onMounted(() => {
  getContainerTypeList()
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

/** 获取包装容器类型 */
const getContainerTypeList = async () => {
  const data = await requestPackageSpecType()
  containerTypeList.value = data || []
}

/** 查看详情 */
const onViewDetailClick = (row: ITableRow) => {
  currentRow.value = row
  packContainerDialogVisible.value = true
}
</script>

<style scoped lang="scss"></style>
