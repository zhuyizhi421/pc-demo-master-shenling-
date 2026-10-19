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
            <el-form-item label="MRO序列号" prop="mroNo">
              <div class="operator-field">
                <el-input
                  v-model="formData.mroNo"
                  readonly
                  placeholder="请选择MRO序列号"
                  @click="mroInfoVisible = true"
                />
                <el-button type="primary" plain @click="mroInfoVisible = true">选择</el-button>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="MRO编号">
              <el-input v-model="formData.mroModelNo" readonly placeholder="--" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="MRO名称">
              <el-input v-model="formData.mroModelName" readonly placeholder="--" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="MRO规格">
              <el-input v-model="formData.mroSpec" readonly placeholder="--" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="MRO分类">
              <el-input v-model="formData.mroClassifyName" readonly placeholder="--" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="MRO类型">
              <el-input v-model="formData.mroTypeName" readonly placeholder="--" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="任务单来源" prop="taskSource">
              <el-select v-model="formData.taskSource" placeholder="请选择" class="w-full">
                <el-option label="手动新增" value="manual_create" />
                <el-option label="按次数" value="by_count" />
                <el-option label="按时间" value="by_time" />
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
                placeholder="请选择时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                class="w-full"
              />
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
          <el-select v-model="row.maintenanceResult" placeholder="请选择" class="w-full">
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
  </div>

  <SelectMroDialog
    v-model="mroInfoVisible"
    :multiple="false"
    ledgerStatus="enabled"
    @success="onSelectMro"
  />

  <div class="layout-footer">
    <el-button @click="emit('close')">取消</el-button>
    <el-button type="primary" :loading="submitLoading" @click="onSubmit">保存</el-button>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, type FormInstance } from "element-plus"

import { queryDepartmentWorkItemPageList } from "@/api/departmentWorkItem"
import {
  queryMroMaintenanceTaskDetail,
  queryMroMaintenanceTaskItemPageList,
  queryMroMaintenanceTaskPageList,
  requestCreateMroMaintenanceTask,
  requestUpdateMroMaintenanceTask
} from "@/api/operation/mro/mro-maintenance-task"
import { queryMroItemConfigPageList } from "@/api/operation/mro/mro-model"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectMroDialog from "@/components/SelectMroDialog/index.vue"
import UploadImage from "@/components/UploadImage/index.vue"
import {
  EnumMROInspectionStandardType,
  EnumMROInspectionStandardTypeMap,
  EnumMROMaintenanceTaskResult,
  EnumMROMaintenanceTaskResultMap
} from "@/constant/enums"
import type { IDepartmentWorkItem } from "@/types/base-info/department-work-item"
import type { IUploadPhoto } from "@/types/base-info/global-config"
import type { IMroInfoPageListItem } from "@/types/maintain/mro-manage/mro-info"
import type { IMroMaintenanceTaskItem } from "@/types/maintain/mro-manage/mro-maintenance-task"
import type { IMroItemConfigListItem } from "@/types/maintain/mro-manage/mro-model"
import { formatImgUrlPreview } from "@/utils/common"
import { typeNumberHandle } from "@/utils/inspectStandard"

defineOptions({
  name: "UpkeepTaskOrderCreateOrUpdate"
})

type TaskSourceType = "manual_create" | "by_count" | "by_time"

interface ICreateItemRow {
  id?: string
  mroItemConfigId?: string
  maintenanceName: string
  maintenanceNo: string
  methodRequire: string
  standardType?: EnumMROInspectionStandardType
  standardDesc: string
  practicalValue: string
  maintenanceResult: EnumMROMaintenanceTaskResult
  remarks: string
  imageList: IUploadPhoto[]
}

interface IDepartmentPositionOption {
  label: string
  value: string
  children?: IDepartmentPositionOption[]
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

const mroInfoVisible = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const tableData = ref<ICreateItemRow[]>([])
const departmentPositionOptions = ref<IDepartmentPositionOption[]>([])
const departmentPositionCascaderProps = { emitPath: true, checkStrictly: false }
const departmentPositionOptionsLoaded = ref(false)

const maintenanceResultOptions = computed(() =>
  Object.entries(EnumMROMaintenanceTaskResultMap).map(([key, value]) => ({
    label: value,
    value: +key as EnumMROMaintenanceTaskResult
  }))
)

const createDefaultFormData = () => ({
  mroInformationId: "",
  mroModelId: "",
  mroNo: "",
  mroModelNo: "",
  mroModelName: "",
  mroSpec: "",
  mroClassifyName: "",
  mroTypeName: "",
  taskSource: "manual_create" as TaskSourceType,
  executeDepartmentPositionValue: [] as string[],
  executePosition: "",
  planStartTime: "",
  remarks: ""
})

const formData = ref(createDefaultFormData())

const rules = {
  mroNo: [{ required: true, message: "请选择MRO序列号", trigger: "change" }],
  taskSource: [{ required: true, message: "请选择任务单来源", trigger: "change" }],
  executeDepartmentPositionValue: [
    { type: "array", required: true, message: "请选择执行职位", trigger: "change" }
  ],
  planStartTime: [{ required: true, message: "请选择计划开始时间", trigger: "change" }]
}

const tableConfig = computed<ITableConfig>(() => {
  const commonColumns: ITableConfig["columns"] = [
    { prop: "maintenanceName", label: "保养项名称", minWidth: 160 },
    { prop: "maintenanceNo", label: "保养项编号", minWidth: 160 },
    { prop: "methodRequire", label: "方法要求", minWidth: 180 },
    {
      prop: "standardType",
      label: "检测标准类型",
      minWidth: 140,
      formatter: (row: ICreateItemRow) =>
        row.standardType ? EnumMROInspectionStandardTypeMap[row.standardType] : "--"
    },
    { prop: "standardDesc", label: "检测标准", minWidth: 180 }
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
      minWidth: 150,
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

const normalizeTaskSource = (source?: string): TaskSourceType => {
  const key = String(source || "").toLowerCase()
  if (key === "by_count" || key === "count") return "by_count"
  if (key === "by_time" || key === "time") return "by_time"
  return "manual_create"
}

const mapFilesToUploadList = (files: any[] = []): IUploadPhoto[] => {
  return files
    .map((file) => ({
      fileId: String(file?.fileId || file?.id || ""),
      fileName: String(file?.fileName || file?.sourceName || ""),
      fileUrl: file?.path ? formatImgUrlPreview(file.path) : ""
    }))
    .filter((item) => item.fileId && item.fileUrl)
}

const mapTaskItemToRow = (item: IMroMaintenanceTaskItem): ICreateItemRow => {
  const source = item as unknown as Record<string, any>
  const standard = source.maintenanceStandard || {}
  const remarkFiles = Array.isArray(source.remarkFiles) ? source.remarkFiles : []
  const commonFiles = Array.isArray(source.files) ? source.files : []
  const imageFiles = remarkFiles.length ? remarkFiles : commonFiles

  return {
    id: item.id,
    mroItemConfigId: source.mroItemConfigId,
    maintenanceName: item.maintenanceName || source.mroItemConfigName || "",
    maintenanceNo: item.maintenanceNo || "",
    methodRequire: item.maintenanceMethod || source.methodRequire || source.detectMethod || "",
    standardType: standard.standardType as EnumMROInspectionStandardType,
    standardDesc: standard.standardType ? typeNumberHandle(standard) : source.standardDesc || "--",
    practicalValue: String(item.practicalValue || ""),
    maintenanceResult: Number(
      source.maintenanceResult ?? EnumMROMaintenanceTaskResult.NOT_RESULT
    ) as EnumMROMaintenanceTaskResult,
    remarks: String(item.remarks || ""),
    imageList: mapFilesToUploadList(imageFiles)
  }
}

const mapConfigItemToRow = (item: IMroItemConfigListItem): ICreateItemRow => ({
  mroItemConfigId: item.id,
  maintenanceName: item.configItemName || "",
  maintenanceNo: item.configItemNo || "",
  methodRequire: item.methodRequire || item.detectMethod || "",
  standardType: item.checkStandardValue?.standardType as EnumMROInspectionStandardType,
  standardDesc: item.checkStandardValue ? typeNumberHandle(item.checkStandardValue) : "--",
  practicalValue: "",
  maintenanceResult: EnumMROMaintenanceTaskResult.NOT_RESULT,
  remarks: "",
  imageList: []
})

const createDepartmentPositionValue = (departmentId?: string, positionId?: string) => {
  if (!departmentId || !positionId) return []
  return [departmentId, positionId]
}

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

const setExecutePositionByDetail = (source: Record<string, any>) => {
  const executeDepartmentId = String(source.executeDepartmentId || "")
  const executeDepartmentName = String(
    source.executeDepartmentName || source.departments || source.executeDepName || ""
  )
  const executePositionId = String(source.executePositionId || "")
  const executePositionName = String(source.executePositionName || "")

  if (executeDepartmentId && executePositionId) {
    ensureCurrentDepartmentPositionOption({
      depId: executeDepartmentId,
      depName: executeDepartmentName,
      positionId: executePositionId,
      positionName: executePositionName
    })
    formData.value.executeDepartmentPositionValue = createDepartmentPositionValue(
      executeDepartmentId,
      executePositionId
    )
    syncExecutePositionBySelection(formData.value.executeDepartmentPositionValue)
    return
  }

  const executePositionText = String(source.executePosition || executePositionName || "")
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
  formData.value.executeDepartmentPositionValue = createDepartmentPositionValue(depId, positionId)
  syncExecutePositionBySelection(formData.value.executeDepartmentPositionValue)
}

const applyDefaultExecutePositionByMro = (mro: IMroInfoPageListItem) => {
  const depId = String(mro.mroModelVo?.maintenanceExecuteDepartmentId || "")
  const depName = String(mro.mroModelVo?.maintenanceExecuteDepartmentName || "")
  const positionId = String(mro.mroModelVo?.maintenanceExecutePositionId || "")
  const positionName = String(mro.mroModelVo?.maintenanceExecutePositionName || "")
  if (!depId || !positionId) return

  ensureCurrentDepartmentPositionOption({
    depId,
    depName,
    positionId,
    positionName
  })
  formData.value.executeDepartmentPositionValue = createDepartmentPositionValue(depId, positionId)
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

const loadMroConfigItems = async (mroModelId: string) => {
  if (!mroModelId) {
    tableData.value = []
    return
  }
  const res = await queryMroItemConfigPageList({
    pageQuery: { pageNum: 1, pageSize: 1000 },
    queryParam: {
      mroItemType: 2,
      mroModelId
    }
  })
  tableData.value = (res.records || []).map((item) => mapConfigItemToRow(item))
}

const loadEditData = async (id: string) => {
  const detail = await queryMroMaintenanceTaskDetail(id)
  const source = detail as unknown as Record<string, any>
  formData.value = {
    ...formData.value,
    mroInformationId: String(detail.mroInformationId || ""),
    mroModelId: String(detail.mroModelId || ""),
    mroNo: String(detail.mroNo || ""),
    mroModelNo: String(detail.mroModelNo || ""),
    mroModelName: String(detail.mroModelName || ""),
    mroSpec: String(detail.mroSpec || ""),
    mroClassifyName: String(detail.mroClassifyName || ""),
    mroTypeName: String(detail.mroTypeName || ""),
    taskSource: normalizeTaskSource(source.taskSource),
    executeDepartmentPositionValue: [],
    executePosition: "",
    planStartTime: String(detail.planStartTime || ""),
    remarks: String(detail.remarks || "")
  }
  setExecutePositionByDetail({
    ...source,
    executePosition: detail.executePosition
  })

  let taskItems = Array.isArray(detail.items) ? detail.items : []
  if (!taskItems.length) {
    const itemRes = await queryMroMaintenanceTaskItemPageList({
      pageQuery: { pageNum: 1, pageSize: 1000 },
      queryParam: { maintenanceTaskId: id }
    })
    taskItems = itemRes.records || []
  }

  tableData.value = taskItems.map((item) => mapTaskItemToRow(item))
  if (!tableData.value.length && detail.mroModelId) {
    await loadMroConfigItems(String(detail.mroModelId))
  }
}

const resetPageData = () => {
  formData.value = createDefaultFormData()
  tableData.value = []
  formRef.value?.clearValidate()
}

const initPageData = async () => {
  await ensureDepartmentPositionOptionsLoaded()
  resetPageData()
  if (!props.id) return
  try {
    await loadEditData(props.id)
  } catch (error) {
    console.error("Failed to load maintenance task detail:", error)
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

const onSelectMro = async (rows: IMroInfoPageListItem[]) => {
  if (!rows.length) return
  const mro = rows[0]
  formData.value.mroInformationId = mro.id || ""
  formData.value.mroModelId = mro.mroModelId || mro.mroModelVo?.id || ""
  formData.value.mroNo = mro.mroNo || mro.barcode || ""
  formData.value.mroModelNo = mro.mroModelVo?.mroModelNo || ""
  formData.value.mroModelName = mro.mroModelVo?.mroModelName || ""
  formData.value.mroSpec = mro.mroModelVo?.mroSpec || ""
  formData.value.mroClassifyName = mro.mroModelVo?.mroClassifyName || ""
  formData.value.mroTypeName = mro.mroModelVo?.mroCategoryName || ""
  formData.value.executeDepartmentPositionValue = []
  formData.value.executePosition = ""
  applyDefaultExecutePositionByMro(mro)

  try {
    await loadMroConfigItems(formData.value.mroModelId)
  } catch (error) {
    console.error("Failed to fetch MRO maintenance config:", error)
    ElMessage.error("获取保养项失败")
  }
}

const buildSubmitPayload = () => {
  const currentForm = formData.value
  return {
    id: props.id || undefined,
    mroInformationId: currentForm.mroInformationId,
    mroModelId: currentForm.mroModelId,
    mroNo: currentForm.mroNo,
    taskSource: currentForm.taskSource,
    executePosition: currentForm.executePosition,
    planStartTime: currentForm.planStartTime,
    remarks: currentForm.remarks,
    items: tableData.value.map((item) => ({
      id: item.id,
      mroItemConfigId: item.mroItemConfigId,
      maintenanceName: item.maintenanceName,
      maintenanceNo: item.maintenanceNo,
      practicalValue: item.practicalValue,
      maintenanceResult: item.maintenanceResult,
      remarks: item.remarks,
      remarkFileIds: item.imageList.map((file) => file.fileId)
    }))
  }
}

const FINISHED_OR_VOIDED_STATUS = new Set([3, 5])
const DUPLICATE_CREATE_MESSAGE = "不允许重复建单"

const hasOpenMaintenanceTaskForMro = async (mroNo: string) => {
  const targetMroNo = String(mroNo || "").trim()
  if (!targetMroNo) return false
  const res = await queryMroMaintenanceTaskPageList({
    pageQuery: { pageNum: 1, pageSize: 1000 },
    queryParam: { mroNo: targetMroNo }
  })
  const records = Array.isArray(res?.records) ? res.records : []
  return records.some((record) => {
    const recordMroNo = String(record?.mroNo || "").trim()
    if (recordMroNo !== targetMroNo) return false
    const taskStatus = Number((record as any)?.maintenanceStatus ?? (record as any)?.taskStatus ?? -1)
    return !FINISHED_OR_VOIDED_STATUS.has(taskStatus)
  })
}

const onSubmit = async () => {
  await formRef.value?.validate()
  if (!tableData.value.length) {
    ElMessage.warning("请先选择MRO序列号并带出保养项")
    return
  }

  submitLoading.value = true
  try {
    const payload = buildSubmitPayload()
    if (props.id) {
      const res = await requestUpdateMroMaintenanceTask(payload)
      if (!res?.id) {
        throw new Error("编辑接口未返回有效ID")
      }
    } else {
      const hasOpenTask = await hasOpenMaintenanceTaskForMro(payload.mroNo)
      if (hasOpenTask) {
        ElMessage.warning(DUPLICATE_CREATE_MESSAGE)
        return
      }
      const res = await requestCreateMroMaintenanceTask(payload)
      if (!res?.id) {
        throw new Error("新增接口未返回有效ID")
      }
    }
    ElMessage.success(props.id ? "编辑成功" : "新增成功")
    emit("success")
  } catch (error) {
    console.error(error)
    const errorMessage = String(
      (error as any)?.response?.data?.msg ||
        (error as any)?.response?.data?.message ||
        (error as any)?.message ||
        ""
    )
    const isDuplicateCreateError =
      !props.id && /(重复建单|重复新增|未完成\/未作废)/.test(errorMessage)
    if (isDuplicateCreateError) {
      ElMessage.warning(DUPLICATE_CREATE_MESSAGE)
      return
    }
    ElMessage.error(props.id ? "编辑失败" : "新增失败")
  } finally {
    submitLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.form-container {
  margin-bottom: 20px;
}

.operator-field {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
}

.w-full {
  width: 100%;
}

.item-upload {
  min-width: 220px;

  :deep(.upload-image-select .el-upload-list__item) {
    margin-bottom: 4px;
  }

  :deep(.upload-image-select .el-upload) {
    margin-bottom: 4px;
  }
}
</style>
