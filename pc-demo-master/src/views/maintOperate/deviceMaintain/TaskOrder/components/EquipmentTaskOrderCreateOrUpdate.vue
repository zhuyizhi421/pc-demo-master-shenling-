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
            <el-form-item label="任务单来源" prop="taskSource">
              <el-select v-model="formData.taskSource" class="w-full" placeholder="请选择">
                <el-option label="手动新增" value="manual_create" />
                <el-option label="周计划生成" value="week_plan" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="保养类型" prop="maintenanceTypeId">
              <el-select
                v-model="formData.maintenanceTypeId"
                class="w-full"
                filterable
                clearable
                placeholder="请选择保养类型"
                @change="onMaintenanceTypeChange"
              >
                <el-option
                  v-for="item in maintenanceTypeOptions"
                  :key="item.id"
                  :label="item.maintenanceTypeName"
                  :value="item.id"
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
            <el-form-item label="保养结果">
              <el-input :value="resolveMaintenanceResultText(formData.maintenanceResult)" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="6" v-if="props.id">
            <el-form-item label="保养耗时">
              <el-input :value="resolveMaintenanceTimeText()" readonly />
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
      <CustomTitle title="保养项" :showShortBar="false" />
      <CustomTable v-model:table-data="tableData" :config="tableConfig" style="height: 360px">
        <template #practicalValue-default="{ row }">
          <el-input v-model="row.practicalValue" placeholder="请输入实测值" clearable />
        </template>

        <template #maintenanceResult-default="{ row }">
          <el-select v-model="row.maintenanceResult" class="w-full" placeholder="请选择">
            <el-option
              v-for="item in maintenanceResultOptions"
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
  queryEquipmentMaintenanceTaskDetail,
  queryEquipmentMaintenanceTaskPageList,
  requestCreateEquipmentMaintenanceTask,
  requestUpdateEquipmentMaintenanceTask
} from "@/api/operation/equipment/equipment-maintenance-task"
import { requestEquipmentMaintenanceTypeList } from "@/api/operation/equipment/equipment-maintenance-type"
import { inspectionStandardTypeToNameMap } from "@/api/operation/equipment/types"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectDeviceDialog from "@/components/SelectDeviceDialog/index.vue"
import UploadImage from "@/components/UploadImage/index.vue"
import type { IDepartmentWorkItem } from "@/types/base-info/department-work-item"
import type { IUploadPhoto } from "@/types/base-info/global-config"
import type { IEquipmentPageItem } from "@/types/maintain/equipment-manage/equipment-info"
import type { IEquipmentMaintenanceTaskItem } from "@/types/maintain/equipment-manage/equipment-maintenance-task"
import type { IEquipmentMaintenanceTypeItem } from "@/types/maintain/equipment-manage/equipment-maintenance-type"
import { formatImgUrlPreview } from "@/utils/common"

defineOptions({
  name: "EquipmentTaskOrderCreateOrUpdate"
})

interface IDepartmentPositionOption {
  label: string
  value: string
  children?: IDepartmentPositionOption[]
}

interface ICreateItemRow {
  id?: string
  equipmentConfigId?: string
  maintenanceName: string
  maintenanceNo: string
  maintenanceMethod: string
  standardType?: number
  standardDesc: string
  unitName?: string
  maintenanceTypeId?: string
  maintenanceTypeName?: string
  practicalValue: string
  maintenanceResult: number
  remarks: string
  imageList: IUploadPhoto[]
}

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

const pageTitle = computed(() => (props.id ? "编辑保养任务单" : "新增保养任务单"))

const maintenanceTypeOptions = ref<IEquipmentMaintenanceTypeItem[]>([])
const deviceSelectVisible = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const tableData = ref<ICreateItemRow[]>([])
const maintenanceConfigRecords = ref<Record<string, any>[]>([])
const departmentPositionOptions = ref<IDepartmentPositionOption[]>([])
const departmentPositionCascaderProps = { emitPath: true, checkStrictly: false }
const departmentPositionOptionsLoaded = ref(false)

const maintenanceResultOptions = [
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
  taskSource: "manual_create",
  maintenanceTypeId: "",
  maintenanceTypeName: "",
  executeDepartmentPositionValue: [] as string[],
  executePosition: "",
  planStartTime: "",
  planEndTime: "",
  maintenanceResult: 2,
  maintenanceStart: "",
  maintenanceComplete: "",
  maintenanceCostSeconds: 0,
  remarks: ""
})

const formData = ref(createDefaultFormData())

const rules = {
  equipmentNo: [{ required: true, message: "请选择设备编号", trigger: "change" }],
  taskSource: [{ required: true, message: "请选择任务单来源", trigger: "change" }],
  maintenanceTypeId: [{ required: true, message: "请选择保养类型", trigger: "change" }],
  executeDepartmentPositionValue: [
    { type: "array", required: true, message: "请选择执行职位", trigger: "change" }
  ],
  planStartTime: [{ required: true, message: "请选择计划开始时间", trigger: "change" }],
  planEndTime: [{ required: true, message: "请选择计划结束时间", trigger: "change" }]
}

const tableConfig = computed<ITableConfig>(() => {
  const commonColumns: ITableConfig["columns"] = [
    { prop: "maintenanceName", label: "保养项名称", minWidth: 180 },
    { prop: "maintenanceNo", label: "保养项编号", minWidth: 160 },
    {
      prop: "maintenanceMethod",
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
      prop: "maintenanceTypeName",
      label: "保养类型",
      minWidth: 160
    }
  ]

  const editableColumns: ITableConfig["columns"] = [
    {
      prop: "practicalValue",
      label: "实测值",
      minWidth: 160,
      slots: { default: "practicalValue-default" }
    },
    {
      prop: "maintenanceResult",
      label: "保养结果",
      minWidth: 140,
      slots: { default: "maintenanceResult-default" }
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

  return {
    height: "100%",
    rowKey: "maintenanceNo",
    columns: props.id ? [...commonColumns, ...editableColumns] : commonColumns
  }
})

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
  const depId = String(device.equipmentModel?.maintenanceExecuteDepartmentId || "")
  const depName = String(device.equipmentModel?.maintenanceExecuteDepartmentName || "")
  const positionId = String(device.equipmentModel?.maintenanceExecutePositionId || "")
  const positionName = String(device.equipmentModel?.maintenanceExecutePositionName || "")
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

const mapConfigItemToRow = (item: Record<string, any>): ICreateItemRow => ({
  equipmentConfigId: String(item.id || ""),
  maintenanceName: item.maintenanceItem?.maintenanceName || "",
  maintenanceNo: item.maintenanceItem?.maintenanceCode || "",
  maintenanceMethod: item.maintenanceItem?.method || "",
  standardType: item.maintenanceItem?.inspectionStandard?.standardType,
  standardDesc: formatStandard(item.maintenanceItem?.inspectionStandard),
  unitName: item.maintenanceItem?.inspectionStandard?.unitName || "",
  maintenanceTypeId: item.maintenanceItem?.maintenanceTypeId || "",
  maintenanceTypeName: item.maintenanceItem?.maintenanceTypeName || "",
  practicalValue: "",
  maintenanceResult: 2,
  remarks: "",
  imageList: []
})

const mapTaskItemToRow = (item: IEquipmentMaintenanceTaskItem): ICreateItemRow => ({
  id: item.id,
  equipmentConfigId: item.equipmentConfigId || "",
  maintenanceName: item.maintenanceName || "",
  maintenanceNo: item.maintenanceNo || "",
  maintenanceMethod: item.maintenanceMethod || item.methodRequire || "",
  standardType: item.maintenanceStandard?.standardType,
  standardDesc: formatStandard(item.maintenanceStandard),
  unitName: item.maintenanceStandard?.unitName || "",
  maintenanceTypeId: item.maintenanceTypeId || "",
  maintenanceTypeName: item.maintenanceTypeName || "",
  practicalValue: String(item.practicalValue || ""),
  maintenanceResult: Number(item.maintenanceResult ?? 2),
  remarks: String(item.remarks || ""),
  imageList: buildUploadList(item.remarkFiles?.length ? item.remarkFiles : item.files)
})

const getAvailableMaintenanceTypes = (records: Record<string, any>[]) => {
  const typeMap = new Map<string, string>()
  records.forEach((item) => {
    const typeId = String(item?.maintenanceItem?.maintenanceTypeId || "")
    if (!typeId || typeMap.has(typeId)) return
    typeMap.set(typeId, String(item?.maintenanceItem?.maintenanceTypeName || ""))
  })
  return Array.from(typeMap.entries()).map(([id, maintenanceTypeName]) => ({
    id,
    maintenanceTypeName
  }))
}

const syncMaintenanceTypeFromConfigs = (records: Record<string, any>[]) => {
  const availableTypes = getAvailableMaintenanceTypes(records)
  if (!availableTypes.length) {
    formData.value.maintenanceTypeId = ""
    formData.value.maintenanceTypeName = ""
    return ""
  }

  const currentTypeId = String(formData.value.maintenanceTypeId || "")
  const matchedType = availableTypes.find((item) => item.id === currentTypeId)
  const nextType = matchedType || availableTypes[0]
  formData.value.maintenanceTypeId = nextType.id
  formData.value.maintenanceTypeName = nextType.maintenanceTypeName || ""
  return nextType.id
}

const loadMaintenanceConfigs = async () => {
  const equipmentModelId = String(formData.value.equipmentModelId || "")
  if (!equipmentModelId) {
    maintenanceConfigRecords.value = []
    tableData.value = []
    return
  }

  const res = await getEquipmentModelConfigPaged({
    pageQuery: { pageNum: 1, pageSize: 1000 },
    queryParam: {
      equipmentModelId,
      mconfigType: 3
    }
  })
  const records = Array.isArray(res?.records) ? res.records : []
  maintenanceConfigRecords.value = records
  const maintenanceTypeId = syncMaintenanceTypeFromConfigs(records)
  if (!maintenanceTypeId) {
    tableData.value = []
    return
  }
  const filtered = maintenanceTypeId
    ? records.filter(
        (item) => String(item?.maintenanceItem?.maintenanceTypeId || "") === maintenanceTypeId
      )
    : records
  tableData.value = filtered.map((item) => mapConfigItemToRow(item))
}

const resetPageData = () => {
  formData.value = createDefaultFormData()
  maintenanceConfigRecords.value = []
  tableData.value = []
  formRef.value?.clearValidate()
}

const loadMaintenanceTypeOptions = async () => {
  maintenanceTypeOptions.value = await requestEquipmentMaintenanceTypeList()
}

const loadEditData = async (id: string) => {
  const detail = await queryEquipmentMaintenanceTaskDetail(id)
  const source = detail as unknown as Record<string, any>
  formData.value = {
    ...formData.value,
    equipmentId: String(detail.equipmentId || ""),
    equipmentNo: String(detail.equipmentNo || ""),
    equipmentName: String(detail.equipmentName || ""),
    equipmentModelId: String(detail.equipmentModelId || ""),
    equipmentTypeNo: String(detail.equipmentTypeNo || ""),
    equipmentTypeName: String(detail.equipmentTypeName || ""),
    areaName: String(detail.areaName || ""),
    taskSource: String(detail.taskSource || source.taskSource || "manual_create"),
    maintenanceTypeId: String(detail.maintenanceTypeId || ""),
    maintenanceTypeName: String(detail.maintenanceTypeName || ""),
    executeDepartmentPositionValue: [],
    executePosition: "",
    planStartTime: String(detail.planStartTime || detail.planDate || ""),
    planEndTime: String(detail.planEndTime || detail.planDate || ""),
    maintenanceResult: Number(detail.maintenanceResult ?? 2),
    maintenanceStart: String(detail.maintenanceStart || ""),
    maintenanceComplete: String(detail.maintenanceComplete || ""),
    maintenanceCostSeconds: Number(detail.maintenanceCostSeconds || 0),
    remarks: String(detail.remarks || "")
  }

  setExecutePositionByDetail(source)
  const taskItems = Array.isArray(detail.items) ? detail.items : []
  tableData.value = taskItems.map((item) => mapTaskItemToRow(item))
  if (!tableData.value.length) {
    await loadMaintenanceConfigs()
  }
}

const initPageData = async () => {
  await ensureDepartmentPositionOptionsLoaded()
  await loadMaintenanceTypeOptions()
  resetPageData()
  if (!props.id) return
  try {
    await loadEditData(props.id)
  } catch (error) {
    console.error("Failed to load equipment maintenance task detail:", error)
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
  await loadMaintenanceConfigs()
}

const onMaintenanceTypeChange = async (value: string) => {
  const current =
    maintenanceTypeOptions.value.find((item) => item.id === value) ||
    getAvailableMaintenanceTypes(maintenanceConfigRecords.value).find((item) => item.id === value)
  formData.value.maintenanceTypeName = current?.maintenanceTypeName || ""
  if (!value) {
    tableData.value = []
    return
  }
  const records = maintenanceConfigRecords.value
  if (!records.length) {
    await loadMaintenanceConfigs()
    return
  }
  const filtered = value
    ? records.filter((item) => String(item?.maintenanceItem?.maintenanceTypeId || "") === String(value))
    : records
  tableData.value = filtered.map((item) => mapConfigItemToRow(item))
}

const resolveMaintenanceResultText = (value: number) => {
  return maintenanceResultOptions.find((item) => item.value === Number(value))?.label || "--"
}

const resolveMaintenanceTimeText = () => {
  const seconds = Number(formData.value.maintenanceCostSeconds || 0)
  if (seconds > 0) {
    return `${Math.round(seconds / 60)}分钟`
  }
  if (formData.value.maintenanceStart && formData.value.maintenanceComplete) {
    return `${dayjs(formData.value.maintenanceComplete).diff(formData.value.maintenanceStart, "minute")}分钟`
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
  taskSource: formData.value.taskSource,
  maintenanceTypeId: formData.value.maintenanceTypeId,
  maintenanceTypeName: formData.value.maintenanceTypeName,
  executePosition: formData.value.executePosition,
  planStartTime: formData.value.planStartTime,
  planEndTime: formData.value.planEndTime,
  planDate: formData.value.planStartTime,
  remarks: formData.value.remarks,
  items: tableData.value.map((item) => ({
    id: item.id,
    equipmentConfigId: item.equipmentConfigId,
    maintenanceName: item.maintenanceName,
    maintenanceNo: item.maintenanceNo,
    practicalValue: item.practicalValue,
    maintenanceResult: item.maintenanceResult,
    remarks: item.remarks,
    remarkFileIds: item.imageList.map((file) => file.fileId)
  })),
  maintenanceConfigIds: tableData.value
    .map((item) => String(item.equipmentConfigId || ""))
    .filter(Boolean)
})

const FINISHED_OR_VOIDED_STATUS = new Set([3, 5])

const hasOpenMaintenanceTaskForEquipment = async (equipmentNo: string) => {
  const targetEquipmentNo = String(equipmentNo || "").trim()
  if (!targetEquipmentNo) return false
  const res = await queryEquipmentMaintenanceTaskPageList({
    pageQuery: { pageNum: 1, pageSize: 1000 },
    queryParam: { equipmentNo: targetEquipmentNo }
  })
  const records = Array.isArray(res?.records) ? res.records : []
  return records.some((record) => {
    const recordEquipmentNo = String(record?.equipmentNo || "").trim()
    if (recordEquipmentNo !== targetEquipmentNo) return false
    const taskStatus = Number(record?.taskStatus ?? record?.maintenanceStatus ?? -1)
    return !FINISHED_OR_VOIDED_STATUS.has(taskStatus)
  })
}

const onSubmit = async () => {
  await formRef.value?.validate()
  if (!tableData.value.length) {
    ElMessage.warning("请先选择设备与保养类型，带出保养项")
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
      const res = await requestUpdateEquipmentMaintenanceTask(payload)
      if (!res?.id) {
        throw new Error("编辑接口未返回有效ID")
      }
    } else {
      const hasOpenTask = await hasOpenMaintenanceTaskForEquipment(payload.equipmentNo || "")
      if (hasOpenTask) {
        ElMessage.warning("当前设备存在未完成或未作废的保养任务单，不允许重复建单")
        return
      }
      const res = await requestCreateEquipmentMaintenanceTask(payload)
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

.item-upload {
  min-height: 32px;
}
</style>
