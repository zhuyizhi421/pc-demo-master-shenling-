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
            <el-tag :type="taskStatusTagType[row.taskStatus]">{{
              taskStatusType[row.taskStatus]
            }}</el-tag>
          </template>

          <template #taskResult-default="{ row }">
            <el-tag :type="taskResultTagType[row.taskResult]">{{
              taskResultType[row.taskResult]
            }}</el-tag>
          </template>

          <template #operation-default="{ row }">
            <el-button link type="primary" size="small" @click="onViewClick(row)">查看</el-button>
            <el-button
              v-if="!!buttonAuth"
              link
              type="danger"
              size="small"
              @click="closeTask(row)"
              :disabled="row.taskStatus != 0"
              >关闭任务
            </el-button>
            <el-button
              v-if="!!buttonAuth"
              link
              type="success"
              size="small"
              @click="resumeTask(row)"
              :disabled="row.taskStatus != 3"
              >恢复任务
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
      <ProcessInspectDetail
        ref="drawDetailRef"
        v-if="curPageKey === EnumPageType.Process_inspect_detail"
        :id="curClickRowId"
        @close="curPageKey = EnumPageType.Main"
      ></ProcessInspectDetail>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { closeInspectTask, resumeInspectTask } from "@/api/quality/inspectTask"
import { queryProcessInspectTaskList } from "@/api/quality/processInspect"
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
import { SelectType } from "@/components/SelectFactoryModel/types"
import { EnumProductInspectionType, EnumProductInspectionTypeMap } from "@/constant/enums"
import { TIME_RANGE } from "@/constant/time"
import useButtonAuth from "@/hooks/useButtonAuth"
import type {
  IProcessInspectListItem as ITableRow,
  IProcessInspectSearchParams
} from "@/types/quality-manage/inspection-task"
import { inspectProcessTypeEnum } from "@/utils/const"

import ProcessInspectDetail from "./components/ProcessInspectDetail.vue"

defineOptions({
  name: "ProcessInspect"
})

const buttonAuth = useButtonAuth("ProcessInspect_update", "ProcessInspect_query")

type IOptionItem = {
  label: string
  value: number
}

/** 页面显示类型枚举 */
enum EnumPageType {
  Main, // 列表页
  Process_inspect_detail // 生产过程检详情
}
const curPageKey = ref(EnumPageType.Main) // 当前显示页面种类
const pageTree = ref([
  {
    name: "生产过程检",
    key: EnumPageType.Main,
    children: [
      {
        name: "生产过程检详情",
        key: EnumPageType.Process_inspect_detail
      }
    ]
  }
])

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
    type: EnumComponentType.Input,
    key: "productModelNo",
    label: "产品编号",
    value: "",
    placeholder: "请输入产品编号"
  },
  {
    type: EnumComponentType.Area,
    key: "entityIdList",
    label: "生产区域",
    value: [],
    placeholder: "请选择生产区域",
    props: {
      areaType: SelectType.ProductType,
      isEnable: true,
      multiple: true
    }
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
    type: EnumComponentType.Input,
    key: "productionTaskNo",
    label: "所属生产任务",
    value: "",
    placeholder: "请输入所属生产任务"
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
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  dispatcherTaskCode: string
  inspectTaskNo: string
  inspectType: number[]
  productionTaskNo: string
  createTimeStart: string
  createTimeEnd: string
  taskResult: number[]
  statusList?: number[]
  productModelName: string
  productModelNo: string
  entityIdList?: string[]
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

// 任务状态
const taskStatusType: Record<string, string> = {
  0: "未开始",
  1: "进行中",
  2: "已完结",
  3: "已关闭"
}

const taskStatusTagType: Record<string, string> = {
  0: "warning",
  1: "primary",
  2: "success",
  3: "danger"
}

const drawDetailRef = ref<InstanceType<typeof ProcessInspectDetail>>()

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
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
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        return EnumProductInspectionTypeMap[row.inspectType as EnumProductInspectionType]
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
      prop: "entityName",
      label: "生产区域",
      width: 160
    },
    {
      prop: "productionTaskNo",
      label: "所属生产任务",
      width: 160
    },
    {
      prop: "techName",
      label: "工艺名称",
      width: 160
    },
    {
      prop: "sampleNum",
      label: "样本数",
      width: 120,
      align: "right"
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
      width: 190,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IProcessInspectSearchParams], ITableRow, true> = {
  api: queryProcessInspectTaskList,
  getParams: () => {
    const params = getFormData()
    if (params.entityIdList) {
      params.entityIdList = params.entityIdList.length ? params.entityIdList : undefined
    }

    return [
      {
        pageQueryVO: {
          pageNum: pagination.value.currentPage,
          pageSize: pagination.value.pageSize
        },
        conditions: {
          ...params
        }
      }
    ]
  }
}

onMounted(async () => {
  buildOptions()
  await refreshTableData()
})

/** 构建下拉选项 */
const buildOptions = () => {
  inspectionResType.value = Object.keys(inspectProcessTypeEnum).map((key) => ({
    label: inspectProcessTypeEnum[key],
    value: +key
  }))

  taskResultResType.value = Object.keys(taskResultType).map((key) => ({
    label: taskResultType[key],
    value: +key
  }))

  taskStatusResType.value = Object.keys(taskStatusType).map((key) => ({
    label: taskStatusType[key],
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
const onViewClick = (row: ITableRow) => {
  curClickRowId.value = row.id
  curPageKey.value = EnumPageType.Process_inspect_detail
}

const closeTask = async (row: ITableRow) => {
  await ElMessageBox.confirm(`确定关闭该任务?`, {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
  await closeInspectTask({ taskId: row.id })
  ElMessage.success("关闭成功")
  await refreshTableData()
}

const resumeTask = async (row: ITableRow) => {
  await ElMessageBox.confirm(`确定恢复该任务?`, {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
  await resumeInspectTask({ taskId: row.id })
  ElMessage.success("恢复成功")
  await refreshTableData()
}
</script>

<style scoped lang="scss"></style>
