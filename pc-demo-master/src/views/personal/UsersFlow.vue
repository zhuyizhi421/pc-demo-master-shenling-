<template>
  <div class="layout-container">
    <div class="layout-main-header">
      <el-radio-group v-model="activeTabValue" @change="onTabChange">
        <template v-for="item in tabList" :key="item.name">
          <el-radio-button :value="item.name">{{ item.label }}</el-radio-button>
        </template>
      </el-radio-group>
    </div>

    <div class="layout-main-page">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="流程单列表">
          <div v-if="isTodoList">
            <el-button type="primary" @click="onAuditBatchClick">批量审批</el-button>
          </div>
        </CustomTitle>

        <CustomTable
          ref="customTableRef"
          v-model:table-data="customTableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          class="custom-table"
        >
          <template #procProgress-default="{ row }">
            <el-tag :type="progressTagTypeMap[row.procProgress]">{{
              EnumProgress[row.procProgress]
            }}</el-tag>
          </template>

          <template #operation-default="{ row }">
            <el-button link type="primary" size="small" @click="onReviewClick(row.procInsId)"
              >查看详情</el-button
            >
            <el-button
              link
              type="primary"
              size="small"
              v-if="isTodoList && row.procProgress === EnumFlowProgress.RUNNING"
              @click="onAuditClick(row)"
              >审批操作</el-button
            >
          </template>
        </CustomTable>
      </div>

      <CustomPagination
        v-model:currentPage="pagination.currentPage"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        border
        @change="getTableData()"
      />
    </div>

    <!-- 审批弹窗 -->
    <ExamineHandle v-model="showAuditDialog" :data="selectedRowsData" @on-ok="getTableData()" />
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import {
  getFlowableDefinitionList,
  queryFlowFinishedList,
  queryFlowMyList,
  queryFlowTodoList
} from "@/api/flowable"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import {
  EnumComponentType,
  type ISearchItem,
  type ISearchSelect
} from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import { FORMAT_DATE, FORMAT_TIME, TIME_RANGE } from "@/constant/time"
import { useFlowTotal } from "@/hooks/useFlowTotal"
import useFlowDetailStore from "@/store/modules/flowDetail"
import type { IListPageResult } from "@/types/common"
import {
  EnumFlowProgress,
  type IFlowListParams,
  type IFlowListResult as ITableRow
} from "@/types/personal/flow"
import ExamineHandle from "@/views/basicConfig/flow/components/ExamineHandle.vue"

defineOptions({
  name: "UsersFlow"
})

const EnumProgress: { [key: string]: any } = {
  1: "进行中",
  2: "已通过",
  3: "已拒绝"
}

const progressTagTypeMap: { [key: string]: string } = {
  1: "primary",
  2: "success",
  3: "danger"
}

const useFlowDetail = useFlowDetailStore()

const flowableDefinitionList = ref<
  Array<{
    label: string
    value: string
  }>
>([])

const activeTabValue = ref("todo")
const tabList = ref([
  { label: "我的待办", name: "todo" },
  { label: "我发起的", name: "myProcess" },
  { label: "我的已办", name: "done" }
])

const isTodoList = computed(() => activeTabValue.value === "todo")
const progressListOptions = computed(() => {
  if (activeTabValue.value === "todo") {
    return []
  } else if (activeTabValue.value === "myProcess") {
    return [
      { label: "进行中", value: "1" },
      { label: "已通过", value: "2" },
      { label: "已拒绝", value: "3" }
    ]
  } else {
    return [
      { label: "已通过", value: "2" },
      { label: "已拒绝", value: "3" }
    ]
  }
})

const { searchList, resetForm, getFormData } = useSearchForm<{
  startDate: string
  endDate: string
  progressList: string[]
  processDefId: string
}>([
  {
    type: EnumComponentType.Date,
    dateType: "daterange",
    label: "创建日期",
    key: "date",
    value: ["", ""],
    placeholder: ["开始日期", "结束日期"],
    format: FORMAT_DATE,
    valueFormat: FORMAT_TIME,
    defaultTime: TIME_RANGE,
    keyword: ["startDate", "endDate"]
  },
  {
    type: EnumComponentType.Select,
    label: "流程进度",
    key: "progressList",
    value: [],
    placeholder: "请选择",
    hidden: !!isTodoList.value,
    options: progressListOptions.value,
    multiple: true,
    maxTag: 2
  },
  {
    type: EnumComponentType.Select,
    key: "processDefId",
    label: "流程名称",
    value: "",
    placeholder: "请选择流程名称",
    filterable: true,
    options: flowableDefinitionList
  }
])

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  rowKey: "no",
  columns: [
    {
      prop: "",
      label: "",
      type: "selection",
      width: 55,
      align: "center",
      multiple: true,
      get hidden() {
        return !isTodoList.value
      },
      selectable: (row: ITableRow) => {
        return isChecked(row)
      }
    },
    {
      prop: "no",
      label: "序号",
      width: 160,
      align: "center"
    },
    {
      prop: "procDefName",
      label: "流程名称",
      minWidth: 160
    },
    {
      prop: "startUserName",
      label: "发起人",
      minWidth: 160
    },
    {
      prop: "procProgress",
      label: "流程进度",
      width: 120,
      align: "center",
      slots: {
        default: "procProgress-default"
      }
    },
    {
      prop: "startTime",
      label: "创建时间",
      minWidth: 160
    },
    {
      prop: "operation",
      label: "操作",
      get width() {
        return isTodoList.value ? 160 : 90
      },
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const { setFlowTotal } = useFlowTotal()

const showAuditDialog = ref(false) // 审批弹窗显示标识
const selectedRowsData = ref<ITableRow[]>([])

onMounted(() => {
  getFlowableDefinitionListRequset()
  getTableData()
})

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  getTableData()
}

const getFlowableDefinitionListRequset = async () => {
  try {
    const res = await getFlowableDefinitionList()
    flowableDefinitionList.value = res.map((item) => {
      return {
        label: item.processDefinitionName,
        value: item.processDefinitionId
      }
    })
  } catch (error) {
    console.log(error)
  }
}

/** 获取表格数据 */
const getTableData = async () => {
  try {
    const { startDate, endDate, progressList, processDefId } = getFormData()
    let params = {
      pageNum: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
      startTime: startDate,
      endTime: endDate,
      progressList: progressList?.length ? progressList.map((item) => +item) : [],
      processDefId: processDefId
    }

    customTableRef.value?.setLoading(true)
    let enumFn: {
      [key: string]: (params: IFlowListParams) => Promise<IListPageResult<ITableRow>>
    } = {
      todo: queryFlowTodoList,
      myProcess: queryFlowMyList,
      done: queryFlowFinishedList
    }

    const { records, total } = await enumFn[activeTabValue.value](params)
    pagination.value.total = +total

    // 表格数据“创建时间”进行特殊处理
    if (activeTabValue.value !== "todo") {
      customTableData.value = records.map((item) => {
        return {
          ...item,
          createTime: item.startTime
        }
      })
    } else {
      customTableData.value = records
      setFlowTotal(+total)
    }
    customTableRef.value?.setLoading(false)
  } catch (error) {
    customTableRef.value?.setLoading(false)
  }
}

/** tabs切换 */
const onTabChange = () => {
  customTableRef.value?.clearSelectedRow()
  searchList.value.find((item) => item.key === "progressList")!.hidden = !!isTodoList.value
  ;(searchList.value.find((item) => item.key === "progressList") as ISearchSelect)!.options =
    progressListOptions.value
  onReset()
}

/** 判断对应行是否可以多选 */
function isChecked(row: ITableRow) {
  // 多选审批操作只能操作流程进度为“进行中”的数据
  return row.procProgress === EnumFlowProgress.RUNNING
}

/** 批量审核操作 */
function onAuditBatchClick() {
  const multipleSelection = (customTableRef.value?.getCurrentMultipleRows() || []) as ITableRow[]
  if (!multipleSelection?.length) {
    ElMessage({
      type: "warning",
      message: "请先选择流程单"
    })
    return
  }

  showAuditDialog.value = true
  selectedRowsData.value = multipleSelection
}

/** 查看详情 */
const onReviewClick = (procInsId: string) => {
  useFlowDetail.setStatus(true, procInsId, getTableData)
}

/** 审批操作 */
const onAuditClick = (row: ITableRow) => {
  showAuditDialog.value = true
  selectedRowsData.value = [row]
}
</script>

<style scoped lang="scss">
.layout-main-header {
  padding: 16px 16px 0;
}
.layout-main-page {
  flex: 1;
  overflow: hidden;
}
</style>
