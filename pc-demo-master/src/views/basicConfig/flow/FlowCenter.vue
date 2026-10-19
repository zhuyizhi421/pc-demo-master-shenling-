<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="流程单列表"></CustomTitle>
        <CustomTable
          ref="customTableRef"
          v-model:table-data="customTableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
          class="custom-table"
        >
          <template #procProgress-default="{ row }">
            <el-tag
              v-if="statusTagTypeMap[statusTuple[row.procProgress]]"
              :type="statusTagTypeMap[statusTuple[row.procProgress]]"
            >
              {{ statusTuple[row.procProgress] ?? "-" }}
            </el-tag>
            <span v-else>-</span>
          </template>

          <template #operation-default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="useFlowDetail.setStatus(true, row.procInsId, getTableData)"
              >查看详情</el-button
            >
          </template>
        </CustomTable>
      </div>

      <CustomPagination
        v-model:currentPage="pagination.currentPage"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        border
        @change="customTableRef?.requestData()"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { getFlowableDefinitionList, getFlowableInstList } from "@/api/flowable"
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
import useFlowDetailStore from "@/store/modules/flowDetail"
import type { IFlowableInstItem as ITableRow, IFlowableInstParams } from "@/types/personal/flow"

defineOptions({
  name: "FlowCenter"
})

const useFlowDetail = useFlowDetailStore()

const flowableDefinitionList = ref<
  Array<{
    label: string
    value: string
  }>
>([])

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Select,
    key: "processDefId",
    label: "流程名称",
    value: "",
    placeholder: "请选择流程名称",
    filterable: true,
    options: flowableDefinitionList
  },
  {
    type: EnumComponentType.Select,
    key: "progressList",
    label: "流程进度",
    value: "",
    placeholder: "请选择流程进度",
    options: [
      {
        label: "进行中",
        value: 1
      },
      {
        label: "已通过",
        value: 2
      },
      {
        label: "已拒绝",
        value: 3
      }
    ],
    multiple: true,
    maxTag: 2
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
    keyword: ["startTime", "endTime"]
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  processDefId: string
  progressList: number[]
  startTime: string
  endTime: string
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const statusTuple = ["-", "进行中", "已通过", "已拒绝"] as const
const statusTagTypeMap: Record<string, string> = {
  "-": "",
  进行中: "warning",
  已通过: "success",
  已拒绝: "danger"
}

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
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
      width: 90,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

const queryConfig: ITableRequestConfig<[IFlowableInstParams], ITableRow, true> = {
  api: getFlowableInstList,
  getParams: () => {
    return [
      {
        pageNum: pagination.value.currentPage,
        pageSize: pagination.value.pageSize,
        ...getFormData()
      }
    ]
  }
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

/** 获取流程单列表 */
const getTableData = async () => {
  await customTableRef.value?.requestData()
}

onMounted(async () => {
  await getFlowableDefinitionListRequset()
  getTableData()
})
</script>

<style scoped lang="scss"></style>
