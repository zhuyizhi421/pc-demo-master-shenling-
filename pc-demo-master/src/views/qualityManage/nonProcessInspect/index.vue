<template>
  <div class="layout-container">
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="检验任务" />
        <CustomTable
          ref="customTableRef"
          v-model:table-data="customTableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
          class="custom-table"
        >
          <template #taskStatus-default="{ row }">
            <el-tag :type="taskStatusTagType[row.taskStatus]">
              {{ taskStatusType[row.taskStatus] }}
            </el-tag>
          </template>

          <template #taskResult-default="{ row }">
            <el-tag :type="taskResultTagType[row.taskResult]">
              {{ taskResultType[row.taskResult] }}
            </el-tag>
          </template>

          <template #operation-default="{ row }">
            <el-button link type="primary" size="small" @click="onViewClick(row)"
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
        @change="refreshTableData()"
      />
    </div>

    <div class="layout-child-page" v-if="curPageKey !== EnumPageType.Main">
      <CustomPageCrumbs v-model="curPageKey" :data="pageTree" />
      <NonProcessInspectDetail
        v-if="curPageKey === EnumPageType.Non_process_inspect_detail"
        :id="curClickRowId"
        :inspectType="curClickType"
        @close="curPageKey = EnumPageType.Main"
      ></NonProcessInspectDetail>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router"

import { queryNoNInspectTaskList } from "@/api/quality/inspectTask"
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
import { TIME_RANGE } from "@/constant/time"
import type {
  INonProcessInspectItem as ITableRow,
  INonProcessInspectSearchParams
} from "@/types/quality-manage/inspection-task"
import { precisionConversion } from "@/utils/common"
import { inspectTypeEnum } from "@/utils/const"

import NonProcessInspectDetail from "./components/NonProcessInspectDetail.vue"

defineOptions({
  name: "NonProcessInspect"
})

const route = useRoute()

/** 页面显示类型枚举 */
enum EnumPageType {
  Main, // 列表页
  Non_process_inspect_detail // 非过程检详情
}

const curPageKey = ref(EnumPageType.Main)
const pageTree = ref([
  {
    name: "非过程检",
    key: EnumPageType.Main,
    children: [
      {
        name: "非过程检详情",
        key: EnumPageType.Non_process_inspect_detail
      }
    ]
  }
])

type IOptionItem = {
  label: string
  value: number
}

const inspectionResType = ref<IOptionItem[]>([])
const taskResultResType = ref<IOptionItem[]>([])
const taskStatusResType = ref<IOptionItem[]>([])

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "inspectTaskNo",
    label: "任务单号",
    value: "",
    placeholder: "请输入任务单号"
  },
  {
    type: EnumComponentType.Select,
    key: "inspectType",
    label: "检验类型",
    value: "",
    placeholder: "请选择检验类型",
    options: inspectionResType,
    multiple: true
  },
  {
    type: EnumComponentType.Select,
    key: "statusList",
    label: "状态",
    value: "",
    placeholder: "请选择状态",
    options: taskStatusResType,
    multiple: true,
    maxTag: 2
  },
  {
    type: EnumComponentType.Input,
    key: "productModelName",
    label: "产品名称",
    value: "",
    placeholder: "请输入产品名称"
  },
  {
    type: EnumComponentType.Select,
    key: "taskResult",
    label: "检验结果",
    value: "",
    placeholder: "请选择检验结果",
    options: taskResultResType,
    multiple: true
  },
  {
    type: EnumComponentType.Date,
    dateType: "datetimerange",
    key: "date",
    label: "创建时间",
    value: [],
    placeholder: ["请选择开始时间", "请选择结束时间"],
    format: "YYYY-MM-DD HH:mm:ss",
    valueFormat: "YYYY-MM-DD HH:mm:ss",
    defaultTime: TIME_RANGE,
    keyword: ["createTimeStart", "createTimeEnd"]
  },
  {
    type: EnumComponentType.Input,
    linkProps: {
      linkKey: "inspectType",
      conditionSign: true,
      showByLinkKeyCondition: 7
    },
    key: "bizCode",
    label: "收货单号",
    value: "",
    placeholder: "请输入收货单号"
  },
  {
    type: EnumComponentType.Input,
    linkProps: {
      linkKey: "inspectType",
      conditionSign: true,
      showByLinkKeyCondition: 8
    },
    key: "bizCode",
    label: "委外收货单号",
    value: "",
    placeholder: "请输入委外收货单号"
  },
  {
    type: EnumComponentType.Input,
    linkProps: {
      linkKey: "inspectType",
      conditionSign: true,
      showByLinkKeyCondition: 10
    },
    key: "bizCode",
    label: "发货计划",
    value: "",
    placeholder: "请输入发货计划"
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  inspectTaskNo: string
  inspectType: number[]
  statusList: number[]
  productModelName: string
  taskResult: number[]
  createTimeStart: string
  createTimeEnd: string
  bizCode?: string
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 检验结果
const taskResultType: Record<string, string> = {
  0: "结果未出",
  1: "通过",
  2: "不通过"
}

const taskResultTagType: Record<string, string> = {
  0: "warning",
  1: "success",
  2: "danger"
}

const curClickRowId = ref("")
const curClickType = ref(0)

// 状态类型
const taskStatusType: Record<string, string> = {
  0: "未开始",
  1: "进行中",
  2: "已完成",
  3: "已关闭",
  4: "进行中"
}

const taskStatusTagType: Record<string, string> = {
  0: "warning",
  1: "primary",
  2: "success",
  3: "danger",
  4: "primary"
}

const taskStatusOptionType: Record<string, string> = {
  0: "未开始",
  1: "进行中",
  2: "已完成",
  3: "已关闭"
}

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  // rowKey: "bizId",
  columns: [
    {
      prop: "inspectTaskNo",
      label: "任务单号",
      width: 160
    },
    {
      prop: "taskStatus",
      label: "状态",
      width: 120,
      align: "center",
      slots: {
        default: "taskStatus-default"
      }
    },
    {
      prop: "inspectType",
      label: "检验类型",
      width: 160,
      align: "center",
      formatter: (row: ITableRow) => {
        return inspectTypeEnum[row.inspectType]
      }
    },
    {
      prop: "taskResult",
      label: "检验结果",
      width: 120,
      align: "center",
      slots: {
        default: "taskResult-default"
      }
    },
    {
      prop: "bizCode",
      label: "关联业务单号",
      width: 160
    },
    {
      prop: "productModelName",
      label: "产品名称",
      width: 160
    },
    {
      prop: "productModelCode",
      label: "产品编号",
      width: 160
    },
    {
      prop: "productTotalQuantity",
      label: "总数",
      width: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return row.productTotalQuantity || row.productTotalQuantity == 0
          ? precisionConversion(row.productTotalQuantity, row?.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "suggestSampleQuantity",
      label: "建议检验数",
      width: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return row.suggestSampleQuantity || row.suggestSampleQuantity == 0
          ? precisionConversion(row.suggestSampleQuantity, row?.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "unitName",
      label: "单位",
      width: 90,
      align: "center"
    },
    {
      prop: "sampleNum",
      label: "样本数",
      width: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return row.sampleNum || row.sampleNum == 0
          ? precisionConversion(row.sampleNum, row?.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "createTime",
      label: "创建时间",
      width: 160,
      align: "center"
    },
    {
      prop: "taskCompleteTime",
      label: "完成时间",
      width: 160,
      align: "center"
    },
    {
      prop: "taskCompleteByName",
      label: "执行人",
      width: 160
    },
    {
      prop: "operation",
      label: "操作",
      width: 100,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[INonProcessInspectSearchParams], ITableRow, true> = {
  api: queryNoNInspectTaskList,
  getParams: () => {
    return [
      {
        pageQuery: {
          pageNum: pagination.value.currentPage,
          pageSize: pagination.value.pageSize
        },
        queryParam: {
          ...getFormData()
        }
      }
    ]
  }
}

onMounted(async () => {
  buildOptions()
  await refreshTableData()
})

watch(
  () => route,
  (val) => {
    if (val.query.isDetail) {
      curPageKey.value = EnumPageType.Non_process_inspect_detail
      curClickRowId.value = val.query.id as string
      curClickType.value = Number(val.query.type)
    }
  },
  {
    deep: true,
    immediate: true
  }
)

/** 构建下拉选项 */
const buildOptions = () => {
  inspectionResType.value = Object.keys(inspectTypeEnum).map((key) => ({
    label: inspectTypeEnum[key],
    value: +key
  }))

  taskResultResType.value = Object.keys(taskResultType).map((key) => ({
    label: taskResultType[key],
    value: +key
  }))

  taskStatusResType.value = Object.keys(taskStatusOptionType).map((key) => ({
    label: taskStatusOptionType[key],
    value: +key
  }))
}

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await refreshTableData()
}

/** 刷新表格数据 */
const refreshTableData = async () => {
  await customTableRef.value?.requestData()
}

/** 查看详情 */
const onViewClick = (row: any) => {
  curClickRowId.value = row.id
  curClickType.value = row.inspectType
  curPageKey.value = EnumPageType.Non_process_inspect_detail
}
</script>

<style scoped lang="scss"></style>
