<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content">
      <div class="page-toolbar">
        <el-button plain icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>

      <CustomTitle :title="pageTitle" showShortBar />

      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        class="form-container"
      >
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="设备编号" prop="equipmentNo">
              <div class="operator-field">
                <el-input
                  v-model="formData.equipmentNo"
                  readonly
                  placeholder="请选择设备编号"
                  @click="deviceSelectVisible = true"
                />
                <el-button type="primary" plain :disabled="!!props.id" @click="deviceSelectVisible = true">
                  选择
                </el-button>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="设备名称">
              <el-input v-model="formData.equipmentName" readonly placeholder="--" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="类型编号">
              <el-input v-model="formData.equipmentTypeNo" readonly placeholder="--" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="类型名称">
              <el-input v-model="formData.equipmentTypeName" readonly placeholder="--" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="所属区域">
              <el-input v-model="formData.areaName" readonly placeholder="--" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="班次编号" prop="rotationId">
              <el-select
                v-model="formData.rotationId"
                class="w-full"
                filterable
                clearable
                placeholder="请选择班次编号"
                @change="onRotationChange"
              >
                <el-option
                  v-for="item in rotationOptions"
                  :key="item.id"
                  :label="item.rotationCode"
                  :value="String(item.id)"
                >
                  <div class="rotation-option">
                    <span>{{ item.rotationCode }}</span>
                    <span class="rotation-option__name">{{ item.rotationName }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="班次名称">
              <el-input v-model="formData.rotationName" readonly placeholder="--" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="任务单来源" prop="taskSource">
              <el-select v-model="formData.taskSource" class="w-full" placeholder="请选择">
                <el-option label="手动新增" value="manual_create" />
                <el-option label="周计划生成" value="week_plan" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="点检类型" prop="taskType">
              <el-select v-model="formData.taskType" class="w-full" placeholder="请选择" @change="onTaskTypeChange">
                <el-option
                  v-for="item in taskTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="执行职位" prop="executeDepartmentPositionValue">
              <el-cascader
                v-model="formData.executeDepartmentPositionValue"
                class="w-full"
                :options="departmentPositionOptions"
                :props="departmentPositionCascaderProps"
                filterable
                clearable
                separator="-"
                placeholder="请选择执行职位"
                @change="onExecuteDepartmentPositionChange"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="计划开始时间" prop="planStartTime">
              <el-date-picker
                v-model="formData.planStartTime"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm:ss"
                class="w-full"
                placeholder="请选择计划开始时间"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="计划结束时间" prop="planEndTime">
              <el-date-picker
                v-model="formData.planEndTime"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm:ss"
                class="w-full"
                placeholder="请选择计划结束时间"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6" v-if="props.id">
            <el-form-item label="点检结果">
              <el-input :value="resolveInspectionResultText(formData.inspectionResult)" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="6" v-if="props.id">
            <el-form-item label="点检耗时">
              <el-input :value="resolveInspectionTimeText()" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remarks">
              <el-input v-model="formData.remarks" type="textarea" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <div class="custom-table-container">
      <CustomTitle title="点检项" :showShortBar="false" />
      <CustomTable v-model:table-data="tableData" :config="tableConfig" style="height: 360px">
        <template #practicalValue-default="{ row }">
          <el-input v-model="row.practicalValue" placeholder="请输入实测值" clearable />
        </template>

        <template #inspectionResult-default="{ row }">
          <el-select v-model="row.inspectionResult" class="w-full" placeholder="请选择">
            <el-option
              v-for="item in inspectionResultOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>

        <template #itemRemark-default="{ row }">
          <el-input v-model="row.remarks" placeholder="请输入备注" clearable />
        </template>

        <template #imageList-default="{ row }">
          <div class="item-upload">
            <UploadImage v-model="row.imageList" :limit="5" multiple />
          </div>
        </template>
      </CustomTable>
    </div>

    <SelectDeviceDialog
      v-model="deviceSelectVisible"
      :multiple="false"
      :enable="true"
      :selected-row-keys="formData.equipmentId ? [formData.equipmentId] : []"
      @success="onSelectDevice"
    />

    <div class="layout-footer">
      <el-button @click="emit('close')">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="onSubmit">保存</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs"
import { ElMessage, type FormInstance } from "element-plus"

import { queryDepartmentWorkItemPageList } from "@/api/departmentWorkItem"
import { getEquipmentModelConfigPaged } from "@/api/equipmentModelConfig"
import {
  queryEquipmentSpotTaskDetail,
  queryEquipmentSpotTaskPageList,
  requestCreateEquipmentSpotTask,
  requestUpdateEquipmentSpotTask
} from "@/api/operation/equipment/equipment-spot-task"
import { inspectionStandardTypeToNameMap } from "@/api/operation/equipment/types"
import { getEnabledClassesList } from "@/api/scheduling"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectDeviceDialog from "@/components/SelectDeviceDialog/index.vue"
import UploadImage from "@/components/UploadImage/index.vue"
import type { IDepartmentWorkItem } from "@/types/base-info/department-work-item"
import type { IUploadPhoto } from "@/types/base-info/global-config"
import type { IEquipmentPageItem } from "@/types/maintain/equipment-manage/equipment-info"
import type {
  IEquipmentSpotTaskItem,
  IEquipmentSpotTaskPageItem
} from "@/types/maintain/equipment-manage/equipment-spot-task"
import type { IClassesItem } from "@/types/production-manage/scheduling"
import { formatImgUrlPreview } from "@/utils/common"

defineOptions({
  name: "SpotTaskOrderCreateOrUpdate"
})

interface IDepartmentPositionOption {
  label: string
  value: string
  children?: IDepartmentPositionOption[]
}

interface ICreateItemRow {
  id?: string
  equipmentConfigId?: string
  inspectionName: string
  inspectionNo: string
  inspectionMethod: string
  standardType?: number
  standardDesc: string
  unitName?: string
  applicableScope: number
  practicalValue: string
  inspectionResult: number
  remarks: string
  imageList: IUploadPhoto[]
}

enum EnumSpotTaskType {
  General = 1,
  Product = 2
}

const taskTypeOptions = [
  { label: "通用点检", value: EnumSpotTaskType.General },
  { label: "产品点检", value: EnumSpotTaskType.Product }
]

const props = withDefaults(
  defineProps<{
    id?: string
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "close"): void
  (e: "success"): void
}>()

const pageTitle = computed(() => (props.id ? "编辑点检任务单" : "新增点检任务单"))

const deviceSelectVisible = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const tableData = ref<ICreateItemRow[]>([])
const spotConfigRecords = ref<Record<string, any>[]>([])
const departmentPositionOptions = ref<IDepartmentPositionOption[]>([])
const departmentPositionCascaderProps = { emitPath: true, checkStrictly: false }
const departmentPositionOptionsLoaded = ref(false)
const rotationOptions = ref<IClassesItem[]>([])

const inspectionResultOptions = [
  { label: "NG", value: 0 },
  { label: "OK", value: 1 },
  { label: "未出结果", value: 2 }
]

const createDefaultFormData = () => ({
  equipmentId: "",
  equipmentNo: "",
  equipmentName: "",
  equipmentModelId: "",
  equipmentTypeNo: "",
  equipmentTypeName: "",
  areaName: "",
  rotationId: "",
  rotationCode: "",
  rotationName: "",
  taskSource: "manual_create",
  taskType: EnumSpotTaskType.General,
  taskTypeName: "通用点检",
  executeDepartmentId: "",
  executeDepartmentName: "",
  executePositionId: "",
  executePositionName: "",
  executeDepartmentPositionValue: [] as string[],
  executePosition: "",
  planStartTime: "",
  planEndTime: "",
  inspectionResult: 2,
  inspectionStart: "",
  inspectionComplete: "",
  inspectionCostSeconds: 0,
  remarks: ""
})

const formData = ref(createDefaultFormData())

const rules = {
  equipmentNo: [{ required: true, message: "请选择设备编号", trigger: "change" }],
  rotationId: [{ required: true, message: "请选择班次编号", trigger: "change" }],
  taskSource: [{ required: true, message: "请选择任务单来源", trigger: "change" }],
  taskType: [{ required: true, message: "请选择点检类型", trigger: "change" }],
  executeDepartmentPositionValue: [
    { type: "array", required: true, message: "请选择执行职位", trigger: "change" }
  ],
  planStartTime: [{ required: true, message: "请选择计划开始时间", trigger: "change" }],
  planEndTime: [{ required: true, message: "请选择计划结束时间", trigger: "change" }]
}

const tableConfig = computed<ITableConfig>(() => ({
  height: "100%",
  rowKey: "inspectionNo",
  columns: [
    { prop: "inspectionName", label: "点检项名称", minWidth: 180 },
    { prop: "inspectionNo", label: "点检项编号", minWidth: 160 },
    {
      prop: "inspectionMethod",
      label: "探测方式",
      minWidth: 180
    },
    {
      prop: "standardType",
      label: "检验标准类型",
      minWidth: 140,
      formatter: (row: ICreateItemRow) =>
        row.standardType ? inspectionStandardTypeToNameMap[row.standardType] || "--" : "--"
    },
    { prop: "standardDesc", label: "检验标准", minWidth: 200 },
    { prop: "unitName", label: "单位", minWidth: 120 },
    {
      prop: "practicalValue",
      label: "实测值",
      minWidth: 160,
      slots: { default: "practicalValue-default" }
    },
    {
      prop: "inspectionResult",
      label: "点检结果",
      minWidth: 140,
      slots: { default: "inspectionResult-default" }
    },
    {
      prop: "itemRemark",
      label: "备注",
      minWidth: 180,
      slots: { default: "itemRemark-default" }
    },
    {
      prop: "imageList",
      label: "上传图片",
      minWidth: 260,
      slots: { default: "imageList-default" }
    }
  ]
}))

const buildDepartmentPositionOptions = (departments: IDepartmentWorkItem[]) => {
  return (departments || [])
    .filter((department) => (department.positionList || []).length)
    .map((department) => ({
      label: department.depName,
      value: department.id,
      children: (department.positionList || []).map((position) => ({
        label: position.name,
        value: position.id
      }))
    }))
}

const ensureCurrentDepartmentPositionOption = (params: {
  depId?: string
  depName?: string
  positionId?: string
  positionName?: string
}) => {
  const { depId = "", depName = "", positionId = "", positionName = "" } = params
  if (!depId || !positionId) return

  let departmentNode = departmentPositionOptions.value.find((item) => item.value === depId)
  if (!departmentNode) {
    departmentNode = {
      label: depName || depId,
      value: depId,
      children: []
    }
    departmentPositionOptions.value.unshift(departmentNode)
  }

  departmentNode.children ||= []
  if (!departmentNode.children.some((item) => item.value === positionId)) {
    departmentNode.children.unshift({
      label: positionName || positionId,
      value: positionId
    })
  }
}

const ensureCurrentRotationOption = (params: {
  id?: string
  rotationCode?: string
  rotationName?: string
}) => {
  const id = String(params.id || "")
  if (!id) return
  if (rotationOptions.value.some((item) => String(item.id) === id)) return
  rotationOptions.value.unshift({
    id: Number(id),
    rotationCode: String(params.rotationCode || id),
    rotationName: String(params.rotationName || params.rotationCode || id),
    rotationStatus: 1,
    beforeMinute: 0,
    belongDay: 0,
    createBy: 0,
    createTime: "",
    endTime: { hour: 0, minute: 0, second: 0, nano: 0 },
    remark: "",
    startTime: { hour: 0, minute: 0, second: 0, nano: 0 },
    updateBy: 0,
    updateTime: ""
  })
}

const parseExecutePositionText = (executePositionText: string) => {
  const text = String(executePositionText || "").trim()
  if (!text) return { depName: "", positionName: "" }
  const fragments = text
    .split("-")
    .map((item) => item.trim())
    .filter(Boolean)
  if (fragments.length < 2) return { depName: "", positionName: "" }
  return {
    depName: fragments.slice(0, -1).join("-"),
    positionName: fragments[fragments.length - 1] || ""
  }
}

const getSelectedDepartmentPosition = (value: string[]) => {
  const [departmentId = "", positionId = ""] = value || []
  const department = departmentPositionOptions.value.find((item) => item.value === departmentId)
  const position = department?.children?.find((item) => item.value === positionId)
  return {
    departmentId,
    departmentName: department?.label || "",
    positionId,
    positionName: position?.label || ""
  }
}

const syncExecutePositionBySelection = (value: string[]) => {
  const selected = getSelectedDepartmentPosition(value)
  formData.value.executeDepartmentId = selected.departmentId
  formData.value.executeDepartmentName = selected.departmentName
  formData.value.executePositionId = selected.positionId
  formData.value.executePositionName = selected.positionName
  formData.value.executePosition = selected.positionName
    ? `${selected.departmentName}-${selected.positionName}`
    : ""
}

const onExecuteDepartmentPositionChange = (value: string[]) => {
  syncExecutePositionBySelection(value || [])
}

const setExecutePositionByDetail = (source: Record<string, any>) => {
  const executeDepartmentId = String(source.executeDepartmentId || "")
  const executeDepartmentName = String(source.executeDepartmentName || "")
  const executePositionId = String(source.executePositionId || "")
  const executePositionName = String(source.executePositionName || "")

  if (executeDepartmentId && executePositionId) {
    ensureCurrentDepartmentPositionOption({
      depId: executeDepartmentId,
      depName: executeDepartmentName,
      positionId: executePositionId,
      positionName: executePositionName
    })
    formData.value.executeDepartmentPositionValue = [executeDepartmentId, executePositionId]
    syncExecutePositionBySelection(formData.value.executeDepartmentPositionValue)
    return
  }

  const executePositionText = String(source.executePosition || "")
  const parsed = parseExecutePositionText(executePositionText)
  if (!parsed.depName || !parsed.positionName) {
    formData.value.executeDepartmentPositionValue = []
    formData.value.executePosition = executePositionText
    return
  }
  const depId = `custom_dep_${parsed.depName}`
  const positionId = `custom_pos_${parsed.depName}_${parsed.positionName}`
  ensureCurrentDepartmentPositionOption({
    depId,
    depName: parsed.depName,
    positionId,
    positionName: parsed.positionName
  })
  formData.value.executeDepartmentPositionValue = [depId, positionId]
  syncExecutePositionBySelection(formData.value.executeDepartmentPositionValue)
}

const applyDefaultExecutePositionByDevice = (device: IEquipmentPageItem) => {
  const depId = String(device.equipmentModel?.patrolExecuteDepartmentId || "")
  const depName = String(device.equipmentModel?.patrolExecuteDepartmentName || "")
  const positionId = String(device.equipmentModel?.patrolExecutePositionId || "")
  const positionName = String(device.equipmentModel?.patrolExecutePositionName || "")
  if (!depId || !positionId) return

  ensureCurrentDepartmentPositionOption({
    depId,
    depName,
    positionId,
    positionName
  })
  formData.value.executeDepartmentPositionValue = [depId, positionId]
  syncExecutePositionBySelection(formData.value.executeDepartmentPositionValue)
}

const getDepartmentPositionOptions = async () => {
  const result = await queryDepartmentWorkItemPageList({
    pageNum: 1,
    pageSize: 999
  })
  departmentPositionOptions.value = buildDepartmentPositionOptions(result.records || [])
}

const ensureDepartmentPositionOptionsLoaded = async () => {
  if (departmentPositionOptionsLoaded.value) return
  await getDepartmentPositionOptions()
  departmentPositionOptionsLoaded.value = true
}

const loadRotationOptions = async () => {
  rotationOptions.value = await getEnabledClassesList()
}

const buildUploadList = (files: any[] = []): IUploadPhoto[] => {
  return files
    .map((file) => ({
      fileId: String(file?.fileId || file?.id || ""),
      fileName: String(file?.fileName || file?.sourceName || ""),
      fileUrl: file?.path ? formatImgUrlPreview(file.path) : ""
    }))
    .filter((item) => item.fileId && item.fileUrl)
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
      return standardDesc
    }
    if (standardType === 1) {
      let str = ""
      if (!["undefined", "object"].includes(typeof standardMin) && standardMin !== "") {
        str += ` ${standardMin} ${standardMinInclusive ? "<=" : "<"} `
      }
      str += "n"
      if (!["undefined", "object"].includes(typeof standardMax) && standardMax !== "") {
        str += ` ${standardMaxInclusive ? "<=" : "<"} ${standardMax}`
      }
      return str
    }
  }
  return ""
}

const resolveSpotItemConfig = (row: Record<string, any>) => {
  return row?.spotItem || row?.spotConfigValue || row?.mconfigValue?.spotConfigValue || {}
}

const mapConfigItemToRow = (item: Record<string, any>): ICreateItemRow => {
  const spotItem = resolveSpotItemConfig(item)
  return {
    equipmentConfigId: String(item.id || ""),
    inspectionName: String(spotItem.inspectionName || ""),
    inspectionNo: String(spotItem.inspectionCode || ""),
    inspectionMethod: String(spotItem.method || ""),
    standardType: Number(spotItem.inspectionStandard?.standardType || 0),
    standardDesc: formatStandard(spotItem.inspectionStandard),
    unitName: String(spotItem.inspectionStandard?.unitName || ""),
    applicableScope: Number(spotItem.applicableScope || EnumSpotTaskType.General),
    practicalValue: "",
    inspectionResult: 2,
    remarks: "",
    imageList: []
  }
}

const mapTaskItemToRow = (item: IEquipmentSpotTaskItem): ICreateItemRow => ({
  id: item.id,
  equipmentConfigId: item.equipmentConfigId || "",
  inspectionName: item.inspectionName || "",
  inspectionNo: item.inspectionNo || "",
  inspectionMethod: item.inspectionMethod || "",
  standardType: item.inspectionStandard?.standardType,
  standardDesc: formatStandard(item.inspectionStandard),
  unitName: item.inspectionStandard?.unitName || "",
  applicableScope: Number(item.inspectionType || formData.value.taskType || EnumSpotTaskType.General),
  practicalValue: String(item.practicalValue || ""),
  inspectionResult: Number(item.inspectionResult ?? 2),
  remarks: String(item.remarks || ""),
  imageList: buildUploadList(item.remarkFiles?.length ? item.remarkFiles : item.files)
})

const filterConfigRecordsByTaskType = (records: Record<string, any>[], taskType: number) => {
  return records.filter((item) => {
    const spotItem = resolveSpotItemConfig(item)
    const applicableScope = Number(spotItem.applicableScope || EnumSpotTaskType.General)
    return applicableScope === Number(taskType || EnumSpotTaskType.General)
  })
}

const syncTaskTypeName = (value: number) => {
  formData.value.taskType = Number(value || EnumSpotTaskType.General)
  formData.value.taskTypeName =
    taskTypeOptions.find((item) => item.value === formData.value.taskType)?.label || "通用点检"
}

const loadSpotConfigs = async () => {
  const equipmentModelId = String(formData.value.equipmentModelId || "")
  if (!equipmentModelId) {
    spotConfigRecords.value = []
    tableData.value = []
    return
  }

  const res = await getEquipmentModelConfigPaged({
    pageQuery: { pageNum: 1, pageSize: 1000 },
    queryParam: {
      equipmentModelId,
      mconfigType: 1
    }
  })
  const records = Array.isArray(res?.records) ? res.records : []
  spotConfigRecords.value = records
  const filtered = filterConfigRecordsByTaskType(records, formData.value.taskType)
  tableData.value = filtered.map((item) => mapConfigItemToRow(item))
}

const resetPageData = () => {
  formData.value = createDefaultFormData()
  spotConfigRecords.value = []
  tableData.value = []
  formRef.value?.clearValidate()
}

const resolveTaskTypeByDetail = (detail: IEquipmentSpotTaskPageItem) => {
  if (detail.taskType) return Number(detail.taskType)
  const firstItem = Array.isArray(detail.items) ? detail.items[0] : undefined
  return Number(firstItem?.inspectionType || EnumSpotTaskType.General)
}

const loadEditData = async (id: string) => {
  const detail = await queryEquipmentSpotTaskDetail(id)
  const source = detail as unknown as Record<string, any>
  const taskType = resolveTaskTypeByDetail(detail)
  syncTaskTypeName(taskType)
  formData.value = {
    ...formData.value,
    equipmentId: String(detail.equipmentId || ""),
    equipmentNo: String(detail.equipmentNo || ""),
    equipmentName: String(detail.equipmentName || ""),
    equipmentModelId: String(detail.equipmentModelId || ""),
    equipmentTypeNo: String(detail.equipmentTypeNo || ""),
    equipmentTypeName: String(detail.equipmentTypeName || ""),
    areaName: String(detail.areaName || ""),
    rotationId: String(detail.rotationId || ""),
    rotationCode: String(detail.rotationCode || ""),
    rotationName: String(detail.rotationName || ""),
    taskSource: String(detail.taskSource || "manual_create"),
    taskType,
    taskTypeName:
      String(detail.taskTypeName || "") ||
      taskTypeOptions.find((item) => item.value === taskType)?.label ||
      "通用点检",
    executeDepartmentId: String(detail.executeDepartmentId || ""),
    executeDepartmentName: String(detail.executeDepartmentName || ""),
    executePositionId: String(detail.executePositionId || ""),
    executePositionName: String(detail.executePositionName || ""),
    executeDepartmentPositionValue: [],
    executePosition: "",
    planStartTime: String(detail.planStartTime || ""),
    planEndTime: String(detail.planEndTime || ""),
    inspectionResult: Number(detail.inspectionResult ?? 2),
    inspectionStart: String(detail.inspectionStart || ""),
    inspectionComplete: String(detail.inspectionComplete || ""),
    inspectionCostSeconds: Number(detail.inspectionCostSeconds || 0),
    remarks: String(detail.remarks || "")
  }

  ensureCurrentRotationOption({
    id: formData.value.rotationId,
    rotationCode: formData.value.rotationCode,
    rotationName: formData.value.rotationName
  })
  setExecutePositionByDetail(source)
  const taskItems = Array.isArray(detail.items) ? detail.items : []
  tableData.value = taskItems.map((item) => mapTaskItemToRow(item))
  if (!tableData.value.length) {
    await loadSpotConfigs()
  }
}

const initPageData = async () => {
  await Promise.all([ensureDepartmentPositionOptionsLoaded(), loadRotationOptions()])
  resetPageData()
  if (!props.id) return
  try {
    await loadEditData(props.id)
  } catch (error) {
    console.error("Failed to load equipment spot task detail:", error)
    ElMessage.error("加载编辑数据失败")
  }
}

watch(
  () => props.id,
  () => {
    initPageData()
  },
  { immediate: true }
)

const onSelectDevice = async (rows: IEquipmentPageItem[]) => {
  if (!rows.length) return
  const device = rows[0]
  formData.value.equipmentId = String(device.id || "")
  formData.value.equipmentNo = String(device.equipmentNo || "")
  formData.value.equipmentName = String(device.equipmentName || "")
  formData.value.equipmentModelId = String(device.equipmentModelId || "")
  formData.value.equipmentTypeNo = String(device.equipmentModel?.modelNo || "")
  formData.value.equipmentTypeName = String(device.equipmentModel?.modelName || "")
  formData.value.areaName = String(device.fmEntityNames || "")
  formData.value.executeDepartmentPositionValue = []
  formData.value.executePosition = ""
  applyDefaultExecutePositionByDevice(device)
  await loadSpotConfigs()
}

const onTaskTypeChange = async (value: number) => {
  syncTaskTypeName(value)
  if (!spotConfigRecords.value.length) {
    await loadSpotConfigs()
    return
  }
  tableData.value = filterConfigRecordsByTaskType(spotConfigRecords.value, formData.value.taskType).map(
    (item) => mapConfigItemToRow(item)
  )
}

const onRotationChange = (value: string) => {
  const target = rotationOptions.value.find((item) => String(item.id) === String(value || ""))
  formData.value.rotationId = String(target?.id || "")
  formData.value.rotationCode = String(target?.rotationCode || "")
  formData.value.rotationName = String(target?.rotationName || "")
}

const resolveInspectionResultText = (value: number) => {
  return inspectionResultOptions.find((item) => item.value === Number(value))?.label || "--"
}

const resolveInspectionTimeText = () => {
  const seconds = Number(formData.value.inspectionCostSeconds || 0)
  if (seconds > 0) {
    return `${Math.round(seconds / 60)}分钟`
  }
  if (formData.value.inspectionStart && formData.value.inspectionComplete) {
    return `${dayjs(formData.value.inspectionComplete).diff(formData.value.inspectionStart, "minute")}分钟`
  }
  return "--"
}

const buildSubmitPayload = () => ({
  id: props.id || undefined,
  equipmentId: formData.value.equipmentId,
  equipmentNo: formData.value.equipmentNo,
  equipmentName: formData.value.equipmentName,
  equipmentModelId: formData.value.equipmentModelId,
  equipmentTypeNo: formData.value.equipmentTypeNo,
  equipmentTypeName: formData.value.equipmentTypeName,
  areaName: formData.value.areaName,
  rotationId: formData.value.rotationId,
  rotationCode: formData.value.rotationCode,
  rotationName: formData.value.rotationName,
  taskSource: formData.value.taskSource,
  taskType: formData.value.taskType,
  taskTypeName: formData.value.taskTypeName,
  inspectionTypeName: formData.value.taskTypeName,
  executeDepartmentId: formData.value.executeDepartmentId,
  executeDepartmentName: formData.value.executeDepartmentName,
  executePositionId: formData.value.executePositionId,
  executePositionName: formData.value.executePositionName,
  executePosition: formData.value.executePosition,
  planStartTime: formData.value.planStartTime,
  planEndTime: formData.value.planEndTime,
  remarks: formData.value.remarks,
  items: tableData.value.map((item) => ({
    id: item.id,
    equipmentConfigId: item.equipmentConfigId,
    inspectionName: item.inspectionName,
    inspectionNo: item.inspectionNo,
    practicalValue: item.practicalValue,
    inspectionResult: item.inspectionResult,
    remarks: item.remarks,
    remarkFileIds: item.imageList.map((file) => file.fileId)
  })),
  spotConfigIds: tableData.value
    .map((item) => String(item.equipmentConfigId || ""))
    .filter(Boolean)
})

const FINISHED_OR_VOIDED_STATUS = new Set([3, 5])

const hasOpenSpotTaskForEquipment = async (equipmentNo: string) => {
  const targetEquipmentNo = String(equipmentNo || "").trim()
  if (!targetEquipmentNo) return false
  const res = await queryEquipmentSpotTaskPageList({
    pageQuery: { pageNum: 1, pageSize: 1000 },
    queryParam: { equipmentNo: targetEquipmentNo }
  })
  const records = Array.isArray(res?.records) ? res.records : []
  return records.some((record) => {
    const recordEquipmentNo = String(record?.equipmentNo || "").trim()
    if (recordEquipmentNo !== targetEquipmentNo) return false
    const taskStatus = Number(record?.taskStatus ?? -1)
    return !FINISHED_OR_VOIDED_STATUS.has(taskStatus)
  })
}

const onSubmit = async () => {
  await formRef.value?.validate()
  if (!tableData.value.length) {
    ElMessage.warning("请先选择设备与点检类型，带出点检项")
    return
  }
  if (
    formData.value.planStartTime &&
    formData.value.planEndTime &&
    dayjs(formData.value.planEndTime).isBefore(dayjs(formData.value.planStartTime))
  ) {
    ElMessage.warning("计划结束时间不能早于计划开始时间")
    return
  }

  submitLoading.value = true
  try {
    const payload = buildSubmitPayload()
    if (props.id) {
      const res = await requestUpdateEquipmentSpotTask(payload)
      if (!res?.id) {
        throw new Error("编辑接口未返回有效ID")
      }
    } else {
      const hasOpenTask = await hasOpenSpotTaskForEquipment(payload.equipmentNo || "")
      if (hasOpenTask) {
        ElMessage.warning("当前设备存在未完成或未作废的点检任务单，不允许重复建单")
        return
      }
      const res = await requestCreateEquipmentSpotTask(payload)
      if (!res?.id) {
        throw new Error("新增接口未返回有效ID")
      }
    }
    ElMessage.success(props.id ? "编辑成功" : "新增成功")
    emit("success")
  } catch (error) {
    console.error(error)
    ElMessage.error(props.id ? "编辑失败" : "新增失败")
  } finally {
    submitLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.page-toolbar {
  margin-bottom: 12px;
}

.form-container {
  margin-bottom: 20px;
}

.operator-field {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
}

.operator-field :deep(.el-input) {
  flex: 1;
}

.rotation-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.rotation-option__name {
  color: var(--el-text-color-secondary);
}

.item-upload {
  min-height: 32px;
}
</style>
