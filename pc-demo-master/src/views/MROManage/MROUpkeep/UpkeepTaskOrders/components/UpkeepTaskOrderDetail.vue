<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content">
      <div>
        <el-button plain icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>
      <CustomTitle title="任务单详情" :showShortBar="false" />
      <CustomDescription :data="taskOrderDetail || {}" :configs="desConfig">
        <template #mroNo-content>
          <el-button link type="primary" size="small" @click="mroInfoVisible = true"
            >{{ taskOrderDetail?.mroNo }}
          </el-button>
        </template>
        <template #mroModelNo-content>
          <el-button link type="primary" size="small" @click="mroModelInfoVisible = true"
            >{{ taskOrderDetail?.mroModelNo }}
          </el-button>
        </template>
      </CustomDescription>
    </div>
    <div class="custom-table-container item">
      <CustomTitle title="保养项" :showShortBar="false" />
      <CustomSearchForm :form-list="searchList" @search="onSubmit" @reset="onReset" />
      <CustomTable
        ref="customTableRef"
        v-model:table-data="tableData"
        v-model:total="pagination.total"
        :config="tableConfig"
        :query-config="queryConfig"
      >
        <template #files-default="{ row }">
          <div v-if="row.files?.length">
            <el-image
              v-for="item in row?.files"
              :key="item.id"
              :preview-src-list="[formatImgUrlPreview(item.path)]"
              :src="formatImgUrlPreview(item.path)"
              preview-teleported
              fit="contain"
              class="w-[50px] h-[50px]"
            />
          </div>
          <div v-else>
            <span>无图片</span>
          </div>
        </template>

        <template #remarkFiles-default="{ row }">
          <div v-if="row.remarkFiles?.length">
            <el-image
              v-for="item in row?.remarkFiles"
              :key="item.id"
              :preview-src-list="[formatImgUrlPreview(item.path)]"
              :src="formatImgUrlPreview(item.path)"
              preview-teleported
              fit="contain"
              class="w-[50px] h-[50px]"
            />
          </div>
          <div v-else>
            <span>无图片</span>
          </div>
        </template>

        <template #operation-default="{ row }">
          <el-button
            v-if="row.exceptionTaskId"
            link
            type="primary"
            size="small"
            @click="openDetail(row.exceptionTaskId)"
            >查看详情
          </el-button>
        </template>
      </CustomTable>

      <CustomPagination
        v-model:currentPage="pagination.currentPage"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        border
        @change="customTableRef?.requestData()"
      />
    </div>
    <div class="layout-footer">
      <el-button @click="emit('close')">取消</el-button>
    </div>

    <!-- MRO编号信息弹窗 -->
    <MroInfoDialog v-model="mroInfoVisible" :mro-id="taskOrderDetail?.mroInformationId || ''" />
    <!-- MRO型号信息弹窗 -->
    <MroModelInfoDialog
      v-model="mroModelInfoVisible"
      :mro-model-id="taskOrderDetail?.mroModelId || ''"
    />
  </div>
</template>

<script setup lang="ts">
import {
  queryMroMaintenanceTaskDetail,
  queryMroMaintenanceTaskItemPageList
} from "@/api/operation/mro/mro-maintenance-task"
import CustomDescription from "@/components/CustomDescription/index.vue"
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
import {
  EnumMROInspectionStandardType,
  EnumMROInspectionStandardTypeMap,
  EnumMROMaintenanceTaskResult,
  EnumMROMaintenanceTaskResultMap,
  EnumMROMaintenanceTaskStatus,
  EnumMROMaintenanceTaskStatusMap
} from "@/constant/enums"
import type {
  IMroMaintenanceTaskItem as ITableRow,
  IMroMaintenanceTaskItemPageListParams,
  IMroMaintenanceTaskPageListItem
} from "@/types/maintain/mro-manage/mro-maintenance-task"
import { formatImgUrlPreview } from "@/utils/common"
import { typeNumberHandle } from "@/utils/inspectStandard"
import MroInfoDialog from "@/views/MROManage/MROInfo/components/MroInfoDialog.vue"
import MroModelInfoDialog from "@/views/MROManage/MROModelManage/components/MroModelInfoDialog.vue"

const props = withDefaults(
  defineProps<{
    id: string
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "close"): void
}>()

const { openDetail } = inject("maintenanceExceptionOrderDetail") as any

const mroInfoVisible = ref(false)
const mroModelInfoVisible = ref(false)
const taskOrderDetail = ref<IMroMaintenanceTaskPageListItem>()
const detailStatus = computed(() => {
  const source = taskOrderDetail.value as unknown as Record<string, any>
  return Number(source?.maintenanceStatus ?? source?.taskStatus ?? 0)
})

const isReviewed = computed(() => detailStatus.value !== EnumMROMaintenanceTaskStatus.UNPUBLISHED)
const isVoided = computed(() => detailStatus.value === 5)

const resolveExecutePositionText = (data: Record<string, any>) => {
  const dep = String(data.executeDepartmentName || data.departments || "").trim()
  const pos = String(data.executePositionName || data.executePosition || "").trim()
  if (pos.includes("-")) return pos
  if (dep && pos) return `${dep}-${pos}`
  return pos || dep || "--"
}
const formatDisplayTime = (value?: string) => {
  const text = String(value || "").trim()
  if (!text) return "--"
  const parsed = dayjs(text)
  return parsed.isValid() ? parsed.format("YYYY/MM/DD HH:mm") : text
}

const desConfig = computed(() => {
  const configs: any[] = [
    {
      field: "maintenanceNo",
      label: "任务单号："
    },
    {
      field: "maintenanceStatus",
      label: "任务状态：",
      formatter: ({ data }: { data: Record<string, any> }) =>
        EnumMROMaintenanceTaskStatusMap[
          Number(data?.maintenanceStatus ?? data?.taskStatus ?? 0) as EnumMROMaintenanceTaskStatus
        ] || "--"
    },
    {
      field: "maintenanceResult",
      label: "保养结果：",
      formatter: ({ data }: { data: Record<string, any> }) =>
        EnumMROMaintenanceTaskResultMap[
          Number(
            data?.maintenanceResult ?? data?.inspectionResult ?? 2
          ) as EnumMROMaintenanceTaskResult
        ] || "--"
    },
    {
      field: "mroNo",
      label: "MRO序列号：",
      slots: {
        content: "mroNo-content"
      }
    },
    {
      field: "mroModelNo",
      label: "MRO编号：",
      slots: {
        content: "mroModelNo-content"
      }
    },
    {
      field: "executePosition",
      label: "执行职位：",
      formatter: ({ data }: { data: Record<string, any> }) => resolveExecutePositionText(data || {})
    },
    {
      field: "planStartTime",
      label: "计划开始时间："
    },
    {
      field: "maintenanceStart",
      formatter: ({ data }: { data: Record<string, any> }) =>
        formatDisplayTime(data?.maintenanceStart),
      label: "保养开始时间："
      // label: "保养开始时间(实际)："
    },
    {
      field: "maintenanceComplete",
      formatter: ({ data }: { data: Record<string, any> }) =>
        formatDisplayTime(data?.maintenanceComplete),
      label: "保养结束时间："
      // label: "保养结束时间(实际)："
    },
    {
      field: "submitterName",
      label: "提交人："
    },
    {
      field: "maintenanceTime",
      label: "保养耗时：",
      formatter: ({ data }: { data: Record<string, any> }) => {
        const maintenanceComplete = data?.maintenanceComplete
        const maintenanceStart = data?.maintenanceStart
        if (maintenanceComplete && maintenanceStart) {
          return dayjs(maintenanceComplete).diff(maintenanceStart, "minutes") + "分钟"
        }
        return "未结束"
      }
    },
    {
      field: "remarks",
      label: "备注："
      // colspan: -1
    }
  ]

  if (isReviewed.value) {
    configs.push(
      {
        field: "checkByName",
        label: "复核人："
      },
      {
        field: "checkTime",
        label: "复核时间："
      }
    )
  }

  if (isVoided.value) {
    configs.push(
      {
        field: "voidByName",
        label: "作废人："
      },
      {
        field: "voidReason",
        label: "作废原因："
      },
      {
        field: "voidTime",
        label: "作废时间："
      }
    )
  }

  configs.push(
    {
      field: "createBy",
      label: "创建人：",
      formatter: ({ data }: { data: Record<string, any> }) =>
        data?.createByName || data?.createBy || "--"
    },
    {
      field: "createTime",
      label: "创建时间："
    },
    {
      field: "updateBy",
      label: "修改人：",
      formatter: ({ data }: { data: Record<string, any> }) =>
        data?.updateByName || data?.updateBy || "--"
    },
    {
      field: "updateTime",
      label: "修改时间："
    }
  )

  return configs
})

const { searchList, resetForm, getFormData } = useSearchForm<{
  maintenanceNo: string
  maintenanceResult: number
}>([
  {
    type: EnumComponentType.Input,
    label: "保养项编号",
    key: "maintenanceNo",
    value: ""
  },
  {
    type: EnumComponentType.Select,
    label: "保养结果",
    key: "maintenanceResult",
    value: "",
    options: Object.entries(EnumMROMaintenanceTaskResultMap).map(([key, value]) => ({
      label: value,
      value: +key
    }))
  }
])

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const asItemRecord = (row: ITableRow) => row as unknown as Record<string, any>
const resolveMaintenanceUserText = (row: ITableRow) => {
  const source = asItemRecord(row)
  const users = Array.isArray(row.maintenanceUsers) ? row.maintenanceUsers : []
  const fromUsers = users
    .map((item) => item.name || item.empNo)
    .filter(Boolean)
    .join(",")
  return fromUsers || source.maintenanceUserName || "--"
}
const resolveMaintenanceTimeText = (row: ITableRow) => {
  const source = asItemRecord(row)
  return source.maintenanceTime || "--"
}
const tableConfig = ref<ITableConfig>({
  height: "100%",
  rowKey: "id",
  columns: [
    {
      prop: "maintenanceName",
      label: "保养项名称",
      minWidth: 160
    },
    {
      prop: "maintenanceNo",
      label: "保养项编号",
      minWidth: 160
    },
    {
      prop: "maintenanceResult",
      label: "保养项结果",
      minWidth: 120,
      align: "center",
      formatter: ({ maintenanceResult }) =>
        EnumMROMaintenanceTaskResultMap[maintenanceResult as EnumMROMaintenanceTaskResult]
    },
    {
      prop: "detectMethod",
      label: "探测方式",
      minWidth: 160
    },
    {
      prop: "standardType",
      label: "检验标准类型",
      minWidth: 160,
      align: "center",
      formatter: ({ maintenanceStandard }) =>
        EnumMROInspectionStandardTypeMap[
          maintenanceStandard?.standardType as EnumMROInspectionStandardType
        ]
    },
    {
      prop: "standardDesc",
      label: "检验标准",
      minWidth: 160,
      formatter: ({ maintenanceStandard }) => typeNumberHandle(maintenanceStandard)
    },
    {
      prop: "practicalValue",
      label: "实测值",
      minWidth: 160,
      align: "right"
    },
    {
      prop: "maintenanceTime",
      label: "保养时间",
      minWidth: 160,
      align: "center",
      formatter: (row: ITableRow) => resolveMaintenanceTimeText(row)
    },
    {
      prop: "maintenanceUsers",
      label: "保养人",
      minWidth: 160,
      formatter: (row: ITableRow) => resolveMaintenanceUserText(row)
    },
    // {
    //   prop: "depName",
    //   label: "NG处理部门",
    //   minWidth: 160,
    //   formatter: (row: ITableRow) => row.ngDepartments?.map((item) => item.depName).join(",")
    // },
    {
      prop: "files",
      label: "上传图片",
      minWidth: 200,
      slots: {
        default: "files-default"
      }
    },
    {
      prop: "remarks",
      label: "备注",
      minWidth: 200
    },
    // {
    //   prop: "remarkFiles",
    //   label: "备注图片",
    //   minWidth: 200,
    //   slots: {
    //     default: "remarkFiles-default"
    //   }
    // },

    {
      prop: "operation",
      label: "异常工单",
      minWidth: 120,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IMroMaintenanceTaskItemPageListParams], ITableRow, true> = {
  api: queryMroMaintenanceTaskItemPageList,
  getParams: () => {
    return [
      {
        pageQuery: {
          pageNum: pagination.currentPage,
          pageSize: pagination.pageSize
        },
        queryParam: {
          ...getFormData(),
          maintenanceTaskId: props.id
        }
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
  getMroMaintenanceTaskDetail()
  customTableRef.value?.requestData()
})

const onSubmit = () => {
  pagination.currentPage = 1
  customTableRef.value?.requestData()
}

const onReset = () => {
  resetForm()
  onSubmit()
}

/** 获取MRO保养任务单详情 */
const getMroMaintenanceTaskDetail = async () => {
  const data = await queryMroMaintenanceTaskDetail(props.id)
  taskOrderDetail.value = data
}
</script>

<style lang="scss" scoped>
.item {
  padding-bottom: 0;

  &:deep(.custom-title) {
    margin-bottom: 0;
  }
}
</style>
