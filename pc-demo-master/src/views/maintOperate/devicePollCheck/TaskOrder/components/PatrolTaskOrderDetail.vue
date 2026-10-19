<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content">
      <div class="page-toolbar">
        <el-button plain icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>

      <CustomTitle title="巡检任务单详情" :showShortBar="false" />
      <CustomDescription :data="taskOrderDetail || {}" :configs="desConfig">
        <template #equipmentNo-content>
          <el-button link type="primary" size="small" @click="deviceInfoVisible = true">
            {{ taskOrderDetail?.equipmentNo || "--" }}
          </el-button>
        </template>

        <template #inspectionResult-content>
          {{ resolveInspectionResultText(taskOrderDetail?.inspectionResult) }}
        </template>
      </CustomDescription>
    </div>

    <div class="custom-table-container item">
      <CustomTitle title="巡检项" :showShortBar="false" />
      <CustomSearchForm :form-list="searchList" @search="onSubmit" @reset="onReset" />
      <CustomTable v-model:table-data="filteredTableData" :config="tableConfig">
        <template #files-default="{ row }">
          <div v-if="row.files?.length">
            <el-image
              v-for="item in row.files"
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

        <template #inspectionUsers-default="{ row }">
          {{ resolveInspectionUserText(row) }}
        </template>

        <template #operation-default="{ row }">
          <el-button
            v-if="row.exceptionTaskId"
            link
            type="primary"
            size="small"
            @click="openExceptionDetail(row.exceptionTaskId)"
          >
            查看详情
          </el-button>
          <span v-else>-</span>
        </template>
      </CustomTable>
    </div>

    <div class="layout-footer">
      <el-button @click="emit('close')">关闭</el-button>
    </div>

    <DeviceInfo v-model="deviceInfoVisible" :id="taskOrderDetail?.equipmentId || ''" />
    <ExceptOrderDetail
      v-model="exceptionVisible"
      :data="exceptionData"
      :type="EnumEquipmentExceptionSourceType.Patrol"
    />
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs"

import { queryEquipmentExceptionOrderDetail } from "@/api/operation/equipment/equipment-exception-order"
import { queryEquipmentPatrolTaskDetail } from "@/api/operation/equipment/equipment-patrol-task"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import { EnumEquipmentExceptionSourceType } from "@/constant/enums"
import type {
  IEquipmentPatrolTaskItem,
  IEquipmentPatrolTaskPageItem
} from "@/types/maintain/equipment-manage/equipment-patrol-task"
import { formatImgUrlPreview } from "@/utils/common"
import DeviceInfo from "@/views/maintOperate/components/DeviceInfo.vue"
import ExceptOrderDetail from "@/views/maintOperate/components/exceptOrderDetail.vue"

defineOptions({
  name: "PatrolTaskOrderDetail"
})

const props = defineProps<{
  id: string
}>()

const emit = defineEmits<{
  (e: "close"): void
}>()

const inspectionResultOptions = [
  { label: "NG", value: 0 },
  { label: "OK", value: 1 },
  { label: "未出结果", value: 2 }
]

const deviceInfoVisible = ref(false)
const exceptionVisible = ref(false)
const exceptionData = ref({})
const taskOrderDetail = ref<IEquipmentPatrolTaskPageItem>()
const filteredTableData = ref<IEquipmentPatrolTaskItem[]>([])

const detailStatus = computed(() => Number(taskOrderDetail.value?.taskStatus ?? 0))
const isReviewed = computed(() => detailStatus.value !== 0)
const isVoided = computed(() => detailStatus.value === 5)

const rawTableData = computed(() => {
  return Array.isArray(taskOrderDetail.value?.items) ? taskOrderDetail.value.items : []
})

const formatDisplayTime = (value?: string) => {
  const text = String(value || "").trim()
  if (!text) return "--"
  const parsed = dayjs(text)
  return parsed.isValid() ? parsed.format("YYYY-MM-DD HH:mm") : text
}

const resolveInspectionResultText = (value?: number) => {
  return inspectionResultOptions.find((item) => item.value === Number(value ?? 2))?.label || "--"
}

const resolveTaskStatusText = (value?: number) => {
  const status = Number(value ?? 0)
  if (status === 0) return "未复核"
  if (status === 1) return "未执行"
  if (status === 2) return "执行中"
  if (status === 3) return "已完成"
  if (status === 5) return "已作废"
  return "--"
}

const resolveTaskSourceText = (value?: string) => {
  const key = String(value || "").toLowerCase()
  if (key === "manual_create" || key === "manual") return "手动新增"
  if (key === "by_count" || key === "count") return "按次数"
  if (key === "by_time" || key === "time") return "按时间"
  return "--"
}

const resolveInspectionTimeText = (data?: IEquipmentPatrolTaskPageItem) => {
  if (!data) return "--"
  const seconds = Number(data.inspectionCostSeconds || 0)
  if (seconds > 0) {
    return `${Math.round(seconds / 60)}分钟`
  }
  if (data.inspectionStart && data.inspectionComplete) {
    return `${dayjs(data.inspectionComplete).diff(data.inspectionStart, "minute")}分钟`
  }
  return "--"
}

const resolveInspectionUserText = (row: IEquipmentPatrolTaskItem) => {
  const users = Array.isArray(row.inspectionUsers) ? row.inspectionUsers : []
  return users.map((item) => item.name || item.empNo).filter(Boolean).join(",") || "--"
}

const formatStandard = (inspectionStandard: any) => {
  if (inspectionStandard?.standardType) {
    const {
      standardType,
      standardDesc,
      standardMaxInclusive,
      standardMax,
      standardMinInclusive,
      standardMin
    } = inspectionStandard
    if (standardType === 2) {
      return standardDesc || "--"
    }
    let text = ""
    if (!["undefined", "object"].includes(typeof standardMin) && standardMin !== "") {
      text += ` ${standardMin} ${standardMinInclusive ? "<=" : "<"} `
    }
    text += "n"
    if (!["undefined", "object"].includes(typeof standardMax) && standardMax !== "") {
      text += ` ${standardMaxInclusive ? "<=" : "<"} ${standardMax}`
    }
    return text
  }
  return "--"
}

const desConfig = computed<ICustomDescriptionConfig[]>(() => {
  const configs: ICustomDescriptionConfig[] = [
    { field: "taskNo", label: "任务单号：" },
    {
      field: "taskStatus",
      label: "任务状态：",
      formatter: ({ data }) => resolveTaskStatusText((data as IEquipmentPatrolTaskPageItem).taskStatus)
    },
    {
      field: "inspectionResult",
      label: "巡检结果：",
      slots: { content: "inspectionResult-content" }
    },
    {
      field: "equipmentNo",
      label: "设备编号：",
      slots: { content: "equipmentNo-content" }
    },
    { field: "equipmentName", label: "设备名称：" },
    { field: "equipmentTypeNo", label: "类型编号：" },
    { field: "equipmentTypeName", label: "类型名称：" },
    { field: "areaName", label: "所属区域：" },
    {
      field: "taskSource",
      label: "任务单来源：",
      formatter: ({ data }) => resolveTaskSourceText((data as IEquipmentPatrolTaskPageItem).taskSource)
    },
    { field: "executePosition", label: "执行职位：" },
    {
      field: "planStartTime",
      label: "计划开始时间：",
      formatter: ({ data }) => formatDisplayTime((data as IEquipmentPatrolTaskPageItem).planStartTime)
    },
    {
      field: "planEndTime",
      label: "计划结束时间：",
      formatter: ({ data }) => formatDisplayTime((data as IEquipmentPatrolTaskPageItem).planEndTime)
    },
    {
      field: "inspectionStart",
      label: "巡检开始时间：",
      formatter: ({ data }) => formatDisplayTime((data as IEquipmentPatrolTaskPageItem).inspectionStart)
    },
    {
      field: "inspectionComplete",
      label: "巡检结束时间：",
      formatter: ({ data }) => formatDisplayTime((data as IEquipmentPatrolTaskPageItem).inspectionComplete)
    },
    {
      field: "inspectionTime",
      label: "巡检耗时：",
      formatter: ({ data }) => resolveInspectionTimeText(data as IEquipmentPatrolTaskPageItem)
    },
    { field: "submitterName", label: "提交人：" },
    { field: "remarks", label: "备注：" }
  ]

  if (isReviewed.value) {
    configs.push(
      { field: "checkByName", label: "复核人：" },
      {
        field: "checkTime",
        label: "复核时间：",
        formatter: ({ data }) => formatDisplayTime((data as IEquipmentPatrolTaskPageItem).checkTime)
      }
    )
  }

  if (isVoided.value) {
    configs.push(
      { field: "voidByName", label: "作废人：" },
      { field: "voidReason", label: "作废原因：" },
      {
        field: "voidTime",
        label: "作废时间：",
        formatter: ({ data }) => formatDisplayTime((data as IEquipmentPatrolTaskPageItem).voidTime)
      }
    )
  }

  configs.push(
    { field: "createBy", label: "创建人：" },
    {
      field: "createTime",
      label: "创建时间：",
      formatter: ({ data }) => formatDisplayTime((data as IEquipmentPatrolTaskPageItem).createTime)
    },
    { field: "updateBy", label: "修改人：" },
    {
      field: "updateTime",
      label: "修改时间：",
      formatter: ({ data }) => formatDisplayTime((data as IEquipmentPatrolTaskPageItem).updateTime)
    }
  )

  return configs
})

const { searchList, resetForm, getFormData } = useSearchForm<{
  inspectionNo: string
  inspectionResult?: number
}>([
  {
    type: EnumComponentType.Input,
    label: "巡检项编号",
    key: "inspectionNo",
    value: ""
  },
  {
    type: EnumComponentType.Select,
    label: "巡检结果",
    key: "inspectionResult",
    value: "",
    options: inspectionResultOptions
  }
])

const applyTableFilter = () => {
  const { inspectionNo, inspectionResult } = getFormData()
  filteredTableData.value = rawTableData.value.filter((item) => {
    const matchNo = inspectionNo ? String(item.inspectionNo || "").includes(inspectionNo) : true
    const matchResult =
      inspectionResult === "" || inspectionResult === undefined
        ? true
        : Number(item.inspectionResult ?? 2) === Number(inspectionResult)
    return matchNo && matchResult
  })
}

const tableConfig = ref<ITableConfig>({
  height: "100%",
  rowKey: "id",
  columns: [
    {
      prop: "inspectionName",
      label: "巡检项名称",
      minWidth: 180
    },
    {
      prop: "inspectionNo",
      label: "巡检项编号",
      minWidth: 160
    },
    {
      prop: "inspectionResult",
      label: "巡检结果",
      minWidth: 120,
      formatter: (row: IEquipmentPatrolTaskItem) => resolveInspectionResultText(row.inspectionResult)
    },
    {
      prop: "inspectionMethod",
      label: "检测方式",
      minWidth: 180
    },
    {
      prop: "standardType",
      label: "标准类型",
      minWidth: 140,
      formatter: (row: IEquipmentPatrolTaskItem) =>
        row.inspectionStandard?.standardType === 1 ? "数值" : "文本"
    },
    {
      prop: "standardDesc",
      label: "巡检标准",
      minWidth: 200,
      formatter: (row: IEquipmentPatrolTaskItem) => formatStandard(row.inspectionStandard)
    },
    {
      prop: "unitName",
      label: "单位",
      minWidth: 120,
      formatter: (row: IEquipmentPatrolTaskItem) => row.inspectionStandard?.unitName || "--"
    },
    {
      prop: "practicalValue",
      label: "实测值",
      minWidth: 140
    },
    {
      prop: "inspectionTime",
      label: "巡检时间",
      minWidth: 160,
      formatter: (row: IEquipmentPatrolTaskItem) => formatDisplayTime(row.inspectionTime)
    },
    {
      prop: "inspectionUsers",
      label: "巡检人",
      minWidth: 160,
      slots: { default: "inspectionUsers-default" }
    },
    {
      prop: "files",
      label: "上传图片",
      minWidth: 200,
      slots: { default: "files-default" }
    },
    {
      prop: "remarks",
      label: "备注",
      minWidth: 180
    },
    {
      prop: "operation",
      label: "异常工单",
      minWidth: 120,
      fixed: "right",
      slots: { default: "operation-default" }
    }
  ]
})

const getTaskDetail = async () => {
  const data = await queryEquipmentPatrolTaskDetail(props.id)
  taskOrderDetail.value = data
  applyTableFilter()
}

const openExceptionDetail = async (id: string) => {
  const res = await queryEquipmentExceptionOrderDetail(id)
  exceptionData.value = res
  exceptionVisible.value = true
}

const onSubmit = () => {
  applyTableFilter()
}

const onReset = () => {
  resetForm()
  applyTableFilter()
}

onMounted(() => {
  getTaskDetail()
})
</script>

<style scoped lang="scss">
.page-toolbar {
  margin-bottom: 12px;
}
</style>
