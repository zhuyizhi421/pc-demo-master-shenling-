<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content">
      <div class="page-toolbar">
        <el-button plain icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>

      <CustomTitle title="任务单详情" :showShortBar="false" />
      <CustomDescription :data="taskOrderDetail || {}" :configs="desConfig">
        <template #equipmentNo-content>
          <el-button link type="primary" size="small" @click="deviceInfoVisible = true">
            {{ taskOrderDetail?.equipmentNo || "--" }}
          </el-button>
        </template>

        <template #maintenanceResult-content>
          {{ resolveMaintenanceResultText(taskOrderDetail?.maintenanceResult) }}
        </template>
      </CustomDescription>
    </div>

    <div class="custom-table-container item">
      <CustomTitle title="保养项" :showShortBar="false" />
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
      :type="EnumEquipmentExceptionSourceType.Maintain"
    />
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs"

import { queryEquipmentExceptionOrderDetail } from "@/api/operation/equipment/equipment-exception-order"
import { queryEquipmentMaintenanceTaskDetail } from "@/api/operation/equipment/equipment-maintenance-task"
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
  IEquipmentMaintenanceTaskItem,
  IEquipmentMaintenanceTaskPageItem
} from "@/types/maintain/equipment-manage/equipment-maintenance-task"
import { formatImgUrlPreview } from "@/utils/common"
import DeviceInfo from "@/views/maintOperate/components/DeviceInfo.vue"
import ExceptOrderDetail from "@/views/maintOperate/components/exceptOrderDetail.vue"

defineOptions({
  name: "EquipmentTaskOrderDetail"
})

const props = defineProps<{
  id: string
}>()

const emit = defineEmits<{
  (e: "close"): void
}>()

const maintenanceResultOptions = [
  { label: "NG", value: 0 },
  { label: "OK", value: 1 },
  { label: "未出结果", value: 2 }
]

const deviceInfoVisible = ref(false)
const exceptionVisible = ref(false)
const exceptionData = ref({})
const taskOrderDetail = ref<IEquipmentMaintenanceTaskPageItem>()
const filteredTableData = ref<IEquipmentMaintenanceTaskItem[]>([])

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

const resolveMaintenanceResultText = (value?: number) => {
  return maintenanceResultOptions.find((item) => item.value === Number(value ?? 2))?.label || "--"
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

const resolveMaintenanceTimeText = (data?: IEquipmentMaintenanceTaskPageItem) => {
  if (!data) return "--"
  const seconds = Number(data.maintenanceCostSeconds || 0)
  if (seconds > 0) {
    return `${Math.round(seconds / 60)}分钟`
  }
  if (data.maintenanceStart && data.maintenanceComplete) {
    return `${dayjs(data.maintenanceComplete).diff(data.maintenanceStart, "minute")}分钟`
  }
  return "--"
}

const resolveMaintenanceUserText = (row: IEquipmentMaintenanceTaskItem) => {
  const users = Array.isArray(row.maintenanceUsers) ? row.maintenanceUsers : []
  const text = users.map((item) => item.name || item.empNo).filter(Boolean).join(",")
  return text || row.maintenanceUserName || "--"
}

const desConfig = computed<ICustomDescriptionConfig[]>(() => {
  const configs: ICustomDescriptionConfig[] = [
    { field: "taskNo", label: "任务单号：" },
    {
      field: "taskStatus",
      label: "任务状态：",
      formatter: ({ data }) => resolveTaskStatusText((data as IEquipmentMaintenanceTaskPageItem).taskStatus)
    },
    {
      field: "maintenanceResult",
      label: "保养结果：",
      slots: { content: "maintenanceResult-content" }
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
      formatter: ({ data }) => {
        const key = String((data as IEquipmentMaintenanceTaskPageItem).taskSource || "").toLowerCase()
        if (key === "manual_create" || key === "manual") return "手动新增"
        if (key === "week_plan") return "周计划生成"
        return "--"
      }
    },
    { field: "maintenanceTypeName", label: "保养类型：" },
    { field: "executePosition", label: "执行职位：" },
    {
      field: "planStartTime",
      label: "计划开始时间：",
      formatter: ({ data }) => formatDisplayTime((data as IEquipmentMaintenanceTaskPageItem).planStartTime)
    },
    {
      field: "planEndTime",
      label: "计划结束时间：",
      formatter: ({ data }) => formatDisplayTime((data as IEquipmentMaintenanceTaskPageItem).planEndTime)
    },
    {
      field: "maintenanceStart",
      label: "保养开始时间：",
      formatter: ({ data }) => formatDisplayTime((data as IEquipmentMaintenanceTaskPageItem).maintenanceStart)
    },
    {
      field: "maintenanceComplete",
      label: "保养结束时间：",
      formatter: ({ data }) => formatDisplayTime((data as IEquipmentMaintenanceTaskPageItem).maintenanceComplete)
    },
    {
      field: "maintenanceTime",
      label: "保养耗时：",
      formatter: ({ data }) => resolveMaintenanceTimeText(data as IEquipmentMaintenanceTaskPageItem)
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
        formatter: ({ data }) => formatDisplayTime((data as IEquipmentMaintenanceTaskPageItem).checkTime)
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
        formatter: ({ data }) => formatDisplayTime((data as IEquipmentMaintenanceTaskPageItem).voidTime)
      }
    )
  }

  configs.push(
    { field: "createBy", label: "创建人：" },
    {
      field: "createTime",
      label: "创建时间：",
      formatter: ({ data }) => formatDisplayTime((data as IEquipmentMaintenanceTaskPageItem).createTime)
    },
    { field: "updateBy", label: "修改人：" },
    {
      field: "updateTime",
      label: "修改时间：",
      formatter: ({ data }) => formatDisplayTime((data as IEquipmentMaintenanceTaskPageItem).updateTime)
    }
  )

  return configs
})

const { searchList, resetForm, getFormData } = useSearchForm<{
  maintenanceNo: string
  maintenanceResult?: number
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
    options: maintenanceResultOptions
  }
])

const applyTableFilter = () => {
  const { maintenanceNo, maintenanceResult } = getFormData()
  filteredTableData.value = rawTableData.value.filter((item) => {
    const matchNo = maintenanceNo ? String(item.maintenanceNo || "").includes(maintenanceNo) : true
    const matchResult =
      maintenanceResult === "" || maintenanceResult === undefined
        ? true
        : Number(item.maintenanceResult ?? 2) === Number(maintenanceResult)
    return matchNo && matchResult
  })
}

const tableConfig = ref<ITableConfig>({
  height: "100%",
  rowKey: "id",
  columns: [
    {
      prop: "maintenanceName",
      label: "保养项名称",
      minWidth: 180
    },
    {
      prop: "maintenanceNo",
      label: "保养项编号",
      minWidth: 160
    },
    {
      prop: "maintenanceResult",
      label: "保养结果",
      minWidth: 120,
      formatter: (row: IEquipmentMaintenanceTaskItem) =>
        resolveMaintenanceResultText(row.maintenanceResult)
    },
    {
      prop: "maintenanceMethod",
      label: "检测方式",
      minWidth: 180
    },
    {
      prop: "standardType",
      label: "检验标准类型",
      minWidth: 140,
      formatter: (row: IEquipmentMaintenanceTaskItem) =>
        row.maintenanceStandard?.standardType === 1 ? "数值" : "文本"
    },
    {
      prop: "standardDesc",
      label: "检验标准",
      minWidth: 200,
      formatter: (row: IEquipmentMaintenanceTaskItem) => {
        const standard = row.maintenanceStandard
        if (!standard?.standardType) return "--"
        if (standard.standardType === 2) return standard.standardDesc || "--"
        let text = ""
        if (!["undefined", "object"].includes(typeof standard.standardMin) && standard.standardMin !== "") {
          text += ` ${standard.standardMin} ${standard.standardMinInclusive ? "<=" : "<"} `
        }
        text += "n"
        if (!["undefined", "object"].includes(typeof standard.standardMax) && standard.standardMax !== "") {
          text += ` ${standard.standardMaxInclusive ? "<=" : "<"} ${standard.standardMax}`
        }
        return text
      }
    },
    {
      prop: "unitName",
      label: "单位",
      minWidth: 120,
      formatter: (row: IEquipmentMaintenanceTaskItem) => row.maintenanceStandard?.unitName || "--"
    },
    {
      prop: "practicalValue",
      label: "实测值",
      minWidth: 140
    },
    {
      prop: "maintenanceTime",
      label: "保养时间",
      minWidth: 160,
      formatter: (row: IEquipmentMaintenanceTaskItem) => formatDisplayTime(row.maintenanceTime)
    },
    {
      prop: "maintenanceUsers",
      label: "保养人",
      minWidth: 160,
      formatter: (row: IEquipmentMaintenanceTaskItem) => resolveMaintenanceUserText(row)
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
  const data = await queryEquipmentMaintenanceTaskDetail(props.id)
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

.item {
  padding-bottom: 0;

  &:deep(.custom-title) {
    margin-bottom: 0;
  }
}
</style>
