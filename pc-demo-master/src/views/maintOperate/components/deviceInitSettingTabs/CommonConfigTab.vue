<template>
  <div class="common-config-tab">
    <CustomTitle :title="title">
      <div v-if="!justSee">
        <el-button type="primary" @click="onAddConfigItemClick">新增配置项</el-button>
      </div>
    </CustomTitle>

    <CustomTable
      ref="customTableRef"
      v-model:table-data="customTableData"
      :config="tableConfig"
      class="custom-table"
    >
      <template #files-default="{ row }">
        <div v-if="getRowFiles(row).length" class="image-list-cell">
          <el-image
            v-for="item in getRowFiles(row)"
            :key="item.id || item.fileId"
            class="image-item"
            :src="getImageUrl(item)"
            :preview-src-list="[getImageUrl(item)]"
            :preview-teleported="true"
            fit="contain"
          />
        </div>
        <span v-else>-</span>
      </template>

      <template #operation-default="{ row, $index }">
        <el-button v-if="!justSee" link type="primary" size="small" @click="onEditRow(row, $index)">
          编辑
        </el-button>
        <el-button v-if="!justSee" link type="danger" size="small" @click="onDeleteRow(row)">
          删除
        </el-button>
      </template>
    </CustomTable>

    <CustomDialog
      class="config-dialog"
      v-model="dialogVisible"
      size="large"
      :title="`${currentEditIndex > -1 ? '编辑' : '新增'}${itemLabel}项`"
      @close="resetDialogState"
    >
      <CustomForm
        ref="customFormRef"
        v-model="formData"
        :label-width="110"
        :configs="formConfigs"
        class="custom-form"
      >
        <template #section-base>
          <div class="block-title">{{ isPatrol ? "基础信息" : "检验内容" }}</div>
        </template>

        <template #inspectionId-default>
          <el-select
            v-model="formData.inspectionId"
            placeholder="请选择"
            clearable
            filterable
            allow-create
            default-first-option
            @change="onInspectNameChange"
          >
            <el-option
              v-for="item in inspectTemplateOptions"
              :key="item.id"
              :label="item.itemName"
              :value="item.id"
            />
          </el-select>
        </template>

        <template #standardType-default>
          <el-select v-model="formData.inspectionStandard.standardType" placeholder="请选择">
            <el-option
              :label="getInspectionStandardTypeLabel(InspectionStandardType.Number)"
              :value="InspectionStandardType.Number"
            />
            <el-option
              :label="getInspectionStandardTypeLabel(InspectionStandardType.Text)"
              :value="InspectionStandardType.Text"
            />
          </el-select>
        </template>

        <template #standardMax-default>
          <div class="flex w-[100%]">
            <el-select
              v-model="formData.inspectionStandard.standardMaxInclusive"
              style="width: 100px"
              class="mr-[4px]"
            >
              <el-option label="<=" :value="1" />
              <el-option label="<" :value="0" />
            </el-select>
            <el-input
              v-model="formData.inspectionStandard.standardMax"
              type="number"
              placeholder="请输入"
              clearable
              @mousewheel.prevent
            />
          </div>
        </template>

        <template #standardMin-default>
          <div class="flex w-[100%]">
            <el-select
              v-model="formData.inspectionStandard.standardMinInclusive"
              style="width: 100px"
              class="mr-[4px]"
            >
              <el-option label="<=" :value="1" />
              <el-option label=">" :value="0" />
            </el-select>
            <el-input
              v-model="formData.inspectionStandard.standardMin"
              type="number"
              placeholder="请输入"
              clearable
              @mousewheel.prevent
            />
          </div>
        </template>

        <template #unitId-default>
          <el-select v-model="formData.inspectionStandard.unitId" placeholder="请选择" clearable filterable>
            <el-option
              v-for="item in unitOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>

        <template #imageList-default>
          <UploadImage v-model="imageList" :limit="5" multiple />
        </template>

        <template #section-condition>
          <div class="block-title">{{ isPatrol ? "周期配置" : "检验条件" }}</div>
        </template>

        <template #inspectionFrequency-default>
          <el-select v-if="isCheck" v-model="formData.inspectionFrequency" placeholder="请选择">
            <el-option label="按天" :value="SpotInspectionFrequency.Daily" />
            <el-option label="时间点" :value="SpotInspectionFrequency.TimePoint" />
          </el-select>
          <el-input
            v-else
            v-model="formData.inspectionFrequency"
            :placeholder="isPatrol ? '请输入正整数' : '请输入数字1-365'"
          >
            <template #append>{{ isPatrol ? "周" : "天" }}</template>
          </el-input>
        </template>

        <template #inspectionTimeList-default>
          <div
            v-for="(item, index) in formData.inspectionTimeList"
            :key="item.key"
            class="flex items-center mb-[10px]"
          >
            <el-time-picker
              v-model="item.value"
              placeholder="请选择"
              format="HH:mm"
              value-format="HH:mm"
            />
            <el-icon
              v-if="index !== formData.inspectionTimeList.length - 1"
              class="ml-[10px] cursor-pointer"
              color="#f56c6c"
              size="20"
              @click="onRemoveTimeItemClick(index)"
            >
              <RemoveFilled />
            </el-icon>
            <el-icon
              v-else
              class="ml-[10px] cursor-pointer"
              color="#4093ff"
              size="20"
              @click="onAddTimeItemClick"
            >
              <CirclePlusFilled />
            </el-icon>
          </div>
        </template>

        <template #inspectionDepartmentIds-default>
          <el-select
            v-model="formData.inspectionDepartmentIds"
            placeholder="请选择"
            clearable
            multiple
            collapse-tags
            collapse-tags-tooltip
            @visible-change="onSelectDepartmentVisibleChange($event, 1)"
          >
            <el-option
              v-for="item in selectedDepartmentList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>

        <template #inspectionPositionValue-default>
          <el-cascader
            v-model="formData.inspectionPositionValue"
            class="w-[100%]"
            clearable
            filterable
            separator="-"
            :options="departmentPositionOptions"
            :props="singleDepartmentPositionProps"
            placeholder="请选择巡检执行职位"
          />
        </template>

        <template #ngDepartmentIds-default>
          <el-select
            v-model="formData.ngDepartmentIds"
            placeholder="请选择"
            clearable
            multiple
            collapse-tags
            collapse-tags-tooltip
            @visible-change="onSelectDepartmentVisibleChange($event, 2)"
          >
            <el-option
              v-for="item in selectedNgDepartmentList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>
      </CustomForm>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onSubmit">确定</el-button>
      </template>
    </CustomDialog>

    <SelectPersonDialog
      v-model="selectDepartmentVisible"
      :type="EnumSelectUser.Department"
      :selected-ids="selectedDepartmentIds"
      :multiple="true"
      @success="onSelectDepartmentSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { CirclePlusFilled, RemoveFilled } from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox } from "element-plus"

import {
  queryInspectOptionTemplateDetail,
  queryInspectOptionTemplateList
} from "@/api/baseInfo/inspectOptionTemplate"
import { queryDepartmentWorkItemPageList } from "@/api/departmentWorkItem"
import {
  deleteEquipmentModelConfig,
  editEquipmentModelConfig,
  getEquipmentModelConfigPaged
} from "@/api/equipmentModelConfig"
import { requestAllEquipmentModel } from "@/api/operation/equipment/equipment-model"
import {
  DeviceInitSettingTabs,
  InspectionStandardType,
  inspectionStandardTypeToNameMap,
  SpotInspectionFrequency,
  spotInspectionFrequencyMap
} from "@/api/operation/equipment/types"
import { getUnit } from "@/api/units"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectPersonDialog from "@/components/SelectPersonDialog/index.vue"
import type { ITree } from "@/components/SelectPersonDialog/type"
import UploadImage from "@/components/UploadImage/index.vue"
import { EnumSelectUser } from "@/constant/enums"
import type { IDepartmentWorkItem } from "@/types/base-info/department-work-item"
import type { IOption,IUploadPhoto } from "@/types/base-info/global-config"
import type { IInspectOptionTemplateListItem } from "@/types/base-info/inspect-option-template"
import type { IEquipmentModelPageItem } from "@/types/maintain/equipment-manage/equipment-model"
import { isNumberStandardValid, modifyStandardData } from "@/utils"
import { formatImgUrlPreview } from "@/utils/common"

interface IDepartmentPositionOption {
  label: string
  value: string
  children?: IDepartmentPositionOption[]
}

interface IFormData {
  inspectionId: string
  inspectionName: string
  inspectionCode: string
  inspectionDepartmentIds: string[]
  inspectionPositionValue: string[]
  ngDepartmentIds: string[]
  fileIds: string[]
  method: string
  inspectionStandard: {
    standardDesc: string
    standardMax: string | number
    standardMaxInclusive: number
    standardMin: string | number
    standardMinInclusive: number
    standardType: number
    unitId: string
  }
  inspectionFrequency: number
  inspectionTimeList: Array<{ key: number; value: string }>
}

type TMode = "check" | "patrol" | "maintain"

const props = defineProps<{
  modelId: string
  mode: TMode
  justSee?: boolean
}>()

const emit = defineEmits<{
  (e: "success"): void
}>()

const singleDepartmentPositionProps = {
  emitPath: true,
  checkStrictly: false
}

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customFormRef = ref<InstanceType<typeof CustomForm>>()
const customTableData = ref<any[]>([])
const dialogVisible = ref(false)
const currentEditIndex = ref(-1)
const inspectTemplateOptions = ref<IInspectOptionTemplateListItem[]>([])
const unitOptions = ref<IOption[]>([])
const imageList = ref<IUploadPhoto[]>([])
const departmentPositionOptions = ref<IDepartmentPositionOption[]>([])
const currentEquipmentModel = ref<IEquipmentModelPageItem>()
const selectDepartmentVisible = ref(false)
const departmentType = ref(1)
const selectedDepartmentList = ref<IOption[]>([])
const selectedNgDepartmentList = ref<IOption[]>([])

let timeKey = 0

const createDefaultFormData = (): IFormData => ({
  inspectionId: "",
  inspectionName: "",
  inspectionCode: "",
  inspectionDepartmentIds: [],
  inspectionPositionValue: [],
  ngDepartmentIds: [],
  fileIds: [],
  method: "",
  inspectionStandard: {
    standardDesc: "",
    standardMax: "",
    standardMaxInclusive: 0,
    standardMin: "",
    standardMinInclusive: 1,
    standardType: InspectionStandardType.Number,
    unitId: ""
  },
  inspectionFrequency: props.mode === "check" ? SpotInspectionFrequency.Daily : 1,
  inspectionTimeList: [{ key: 0, value: "" }]
})

const formData = ref<IFormData>(createDefaultFormData())

const configType = computed(() => {
  if (props.mode === "patrol") return DeviceInitSettingTabs.patrol
  if (props.mode === "maintain") return DeviceInitSettingTabs.maintain
  return DeviceInitSettingTabs.check
})

const rowAttr = computed(() => {
  if (props.mode === "patrol") return "patrolItem"
  if (props.mode === "maintain") return "maintenanceItem"
  return "spotItem"
})

const paramAttr = computed(() => {
  if (props.mode === "patrol") return "patrolConfigValue"
  if (props.mode === "maintain") return "maintenanceConfigValue"
  return "spotConfigValue"
})

const isCheck = computed(() => props.mode === "check")
const isPatrol = computed(() => props.mode === "patrol")
const isMaintain = computed(() => props.mode === "maintain")
const title = computed(() => {
  if (isPatrol.value) return "巡检配置"
  if (isMaintain.value) return "保养配置"
  return "点检配置"
})
const itemLabel = computed(() => {
  if (isPatrol.value) return "巡检"
  if (isMaintain.value) return "保养"
  return "检验"
})

const selectedDepartmentIds = computed(() =>
  departmentType.value === 1 ? formData.value.inspectionDepartmentIds : formData.value.ngDepartmentIds
)

const getInspectionStandardTypeLabel = (value?: number) =>
  inspectionStandardTypeToNameMap[Number(value || 0)] || "-"

const getRowItem = (row: Record<string, any>) => row?.[rowAttr.value] || {}

const getRowFiles = (row: Record<string, any>) => getRowItem(row)?.files || []

const getImageUrl = (item: Record<string, any>) => formatImgUrlPreview(item.path)

const formatStandard = (inspectionStandard: Record<string, any>) => {
  if (!inspectionStandard?.standardType) return "-"
  if (Number(inspectionStandard.standardType) === InspectionStandardType.Text) {
    return inspectionStandard.standardDesc || "-"
  }

  let text = "n"
  const min = inspectionStandard.standardMin
  const max = inspectionStandard.standardMax
  if (min !== "" && min !== null && min !== undefined) {
    text = `${min} ${inspectionStandard.standardMinInclusive ? "<=" : "<"} ${text}`
  }
  if (max !== "" && max !== null && max !== undefined) {
    text = `${text} ${inspectionStandard.standardMaxInclusive ? "<=" : "<"} ${max}`
  }
  const unit = inspectionStandard.unitName || ""
  return `${text}${unit ? ` ${unit}` : ""}`
}

const formatDepartmentPosition = (departmentName?: string, positionName?: string) => {
  if (departmentName && positionName) return `${departmentName}-${positionName}`
  return positionName || departmentName || "-"
}

const formatExecuteTarget = (row: Record<string, any>) => {
  const item = getRowItem(row)
  if (isPatrol.value) {
    return (
      formatDepartmentPosition(item?.inspectionExecuteDepartmentName, item?.inspectionExecutePositionName) ||
      item?.inspectionDepartments?.map((department: any) => department.depName).join(",") ||
      "-"
    )
  }

  if (isMaintain.value) {
    return item?.maintenanceDepartments?.map((department: any) => department.depName).join(",") || "-"
  }

  return "-"
}

const formatNgDepartment = (row: Record<string, any>) => {
  if (isPatrol.value) return "-"
  const item = getRowItem(row)
  return item?.ngDepartments?.map((department: any) => department.depName).join(",") || "-"
}

const formatFrequency = (row: Record<string, any>) => {
  const item = getRowItem(row)
  if (isCheck.value) {
    const value = Number(item?.inspectionFrequency || 0)
    return spotInspectionFrequencyMap[value] || "-"
  }
  if (isPatrol.value) {
    return item?.inspectionFrequency ? `${item.inspectionFrequency}周` : "-"
  }
  return item?.maintenanceFrequency ? `${item.maintenanceFrequency}天` : "-"
}

const tableConfig = computed<ITableConfig>(() => ({
  height: "100%",
  columns: [
    {
      prop: "inspectionName",
      label: `${itemLabel.value}项名称`,
      minWidth: 180,
      formatter: (row: Record<string, any>) => {
        const item = getRowItem(row)
        return item?.inspectionName || item?.maintenanceName || "-"
      }
    },
    {
      prop: "inspectionCode",
      label: `${itemLabel.value}项编号`,
      minWidth: 160,
      formatter: (row: Record<string, any>) => {
        const item = getRowItem(row)
        return item?.inspectionCode || item?.maintenanceCode || "-"
      }
    },
    {
      prop: "method",
      label: isPatrol.value ? "探测方式" : "方法要求",
      minWidth: 180,
      formatter: (row: Record<string, any>) => getRowItem(row)?.method || "-"
    },
    {
      prop: "standardType",
      label: "检验标准类型",
      width: 120,
      align: "center",
      formatter: (row: Record<string, any>) =>
        getInspectionStandardTypeLabel(getRowItem(row)?.inspectionStandard?.standardType)
    },
    {
      prop: "inspectionStandard",
      label: "检验标准",
      minWidth: 220,
      formatter: (row: Record<string, any>) => formatStandard(getRowItem(row)?.inspectionStandard)
    },
    {
      prop: "frequency",
      label: isPatrol.value ? "巡检周期" : isMaintain.value ? "保养频率" : "检验频率",
      width: 120,
      align: "center",
      formatter: (row: Record<string, any>) => formatFrequency(row)
    },
    {
      prop: "executeTarget",
      label: isPatrol.value ? "巡检执行职位" : isMaintain.value ? "保养执行部门" : "执行对象",
      minWidth: 180,
      formatter: (row: Record<string, any>) => formatExecuteTarget(row)
    },
    {
      prop: "ngDepartment",
      label: "NG处理部门",
      minWidth: 160,
      hidden: isPatrol.value,
      formatter: (row: Record<string, any>) => formatNgDepartment(row)
    },
    {
      prop: "files",
      label: "图片说明",
      minWidth: 180,
      slots: {
        default: "files-default"
      }
    },
    {
      prop: "operation",
      label: "操作",
      width: 120,
      fixed: "right",
      hidden: !!props.justSee,
      slots: {
        default: "operation-default"
      }
    }
  ]
}))

const buildDepartmentPositionOptions = (departments: IDepartmentWorkItem[]) =>
  departments
    .filter((department) => (department.positionList || []).length)
    .map((department) => ({
      label: department.depName,
      value: department.id,
      children: (department.positionList || []).map((position) => ({
        label: position.name,
        value: position.id
      }))
    }))

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

const createDepartmentPositionValue = (departmentId?: string, positionId?: string) => {
  if (!departmentId || !positionId) return []
  return [departmentId, positionId]
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

const resetDialogState = () => {
  customFormRef.value?.resetForm()
  dialogVisible.value = false
  currentEditIndex.value = -1
  timeKey = 0
  formData.value = createDefaultFormData()
  imageList.value = []
  selectedDepartmentList.value = []
  selectedNgDepartmentList.value = []
}

const getInspectOptionTemplate = async () => {
  inspectTemplateOptions.value = (await queryInspectOptionTemplateList({})) || []
}

const getUnitOptions = async () => {
  const data = await getUnit()
  unitOptions.value = data.map((item) => ({
    label: item.unitName,
    value: String(item.id)
  }))
}

const getDepartmentPositionOptions = async () => {
  if (!isPatrol.value) return
  const result = await queryDepartmentWorkItemPageList({
    pageNum: 1,
    pageSize: 999
  })
  departmentPositionOptions.value = buildDepartmentPositionOptions(result.records || [])
  ensureCurrentDepartmentPositionOption({
    depId: currentEquipmentModel.value?.patrolExecuteDepartmentId,
    depName: currentEquipmentModel.value?.patrolExecuteDepartmentName,
    positionId: currentEquipmentModel.value?.patrolExecutePositionId,
    positionName: currentEquipmentModel.value?.patrolExecutePositionName
  })
}

const getCurrentEquipmentModel = async () => {
  if (!isPatrol.value || !props.modelId) return
  const list = await requestAllEquipmentModel()
  currentEquipmentModel.value = list.find((item) => String(item.id) === String(props.modelId))
  ensureCurrentDepartmentPositionOption({
    depId: currentEquipmentModel.value?.patrolExecuteDepartmentId,
    depName: currentEquipmentModel.value?.patrolExecuteDepartmentName,
    positionId: currentEquipmentModel.value?.patrolExecutePositionId,
    positionName: currentEquipmentModel.value?.patrolExecutePositionName
  })
}

const getTableData = async () => {
  if (!props.modelId) {
    customTableData.value = []
    return
  }
  customTableRef.value?.setLoading(true)
  try {
    const { records } = await getEquipmentModelConfigPaged({
      pageQuery: {
        pageNum: 1,
        pageSize: 1000
      },
      queryParam: {
        equipmentModelId: props.modelId,
        mconfigType: configType.value
      }
    })
    customTableData.value = records || []
  } finally {
    customTableRef.value?.setLoading(false)
  }
}

const onSelectDepartmentVisibleChange = (visible: boolean, type: number) => {
  if (!visible) return
  departmentType.value = type
  selectDepartmentVisible.value = true
}

const onSelectDepartmentSuccess = (data: ITree[]) => {
  const selectedOptions = data.map((item) => ({
    label: item.label,
    value: item.id
  }))
  if (departmentType.value === 1) {
    selectedDepartmentList.value = selectedOptions
    formData.value.inspectionDepartmentIds = data.map((item) => item.id)
    return
  }
  selectedNgDepartmentList.value = selectedOptions
  formData.value.ngDepartmentIds = data.map((item) => item.id)
}

const onInspectNameChange = async (value: string) => {
  if (!value) return
  const isTemplate = inspectTemplateOptions.value.some((item) => item.id === value)
  if (!isTemplate) {
    formData.value.inspectionId = value
    formData.value.inspectionName = value
    return
  }

  const detail = await queryInspectOptionTemplateDetail(value)
  if (!detail) return

  formData.value.inspectionName = detail.inspectItemName
  formData.value.inspectionCode = detail.inspectItemCode || formData.value.inspectionCode
  formData.value.method = detail.methodDesc
  formData.value.inspectionStandard = {
    standardType: detail.standardType,
    standardDesc: detail.standardDesc,
    standardMax: detail.standardMax ?? "",
    standardMaxInclusive: detail.standardMaxInclusive ?? 0,
    standardMin: detail.standardMin ?? "",
    standardMinInclusive: detail.standardMinInclusive ?? 1,
    unitId: detail.unitId || ""
  }
  formData.value.fileIds = (detail.images || []).map((item) => item.id)
  imageList.value = (detail.images || []).map((item) => ({
    fileName: item.fileName,
    fileId: item.id,
    fileUrl: formatImgUrlPreview(item.path)
  }))
}

const onAddTimeItemClick = () => {
  formData.value.inspectionTimeList.push({
    key: ++timeKey,
    value: ""
  })
}

const onRemoveTimeItemClick = (index: number) => {
  formData.value.inspectionTimeList.splice(index, 1)
}

const onAddConfigItemClick = async () => {
  formData.value = createDefaultFormData()
  imageList.value = []
  selectedDepartmentList.value = []
  selectedNgDepartmentList.value = []
  timeKey = 0

  await Promise.all([getInspectOptionTemplate(), getUnitOptions()])

  if (isPatrol.value) {
    await Promise.all([getCurrentEquipmentModel(), getDepartmentPositionOptions()])
    formData.value.inspectionPositionValue = createDepartmentPositionValue(
      currentEquipmentModel.value?.patrolExecuteDepartmentId,
      currentEquipmentModel.value?.patrolExecutePositionId
    )
  }

  dialogVisible.value = true
}

const onEditRow = async (row: Record<string, any>, index: number) => {
  currentEditIndex.value = index
  await Promise.all([getInspectOptionTemplate(), getUnitOptions()])

  const item = getRowItem(row)
  timeKey = 0

  if (isPatrol.value) {
    await Promise.all([getCurrentEquipmentModel(), getDepartmentPositionOptions()])
    ensureCurrentDepartmentPositionOption({
      depId: item?.inspectionExecuteDepartmentId,
      depName: item?.inspectionExecuteDepartmentName,
      positionId: item?.inspectionExecutePositionId,
      positionName: item?.inspectionExecutePositionName
    })
  }

  formData.value = {
    inspectionId: item?.inspectionName || item?.maintenanceName || "",
    inspectionName: item?.inspectionName || item?.maintenanceName || "",
    inspectionCode: item?.inspectionCode || item?.maintenanceCode || "",
    inspectionDepartmentIds: isMaintain.value
      ? item?.maintenanceDepartments?.map((department: any) => department.id) || []
      : item?.inspectionDepartments?.map((department: any) => department.id) || [],
    inspectionPositionValue: isPatrol.value
      ? createDepartmentPositionValue(item?.inspectionExecuteDepartmentId, item?.inspectionExecutePositionId)
      : [],
    ngDepartmentIds: item?.ngDepartments?.map((department: any) => department.id) || [],
    fileIds: item?.files?.map((file: any) => file.id) || [],
    method: item?.method || "",
    inspectionStandard: {
      standardType: item?.inspectionStandard?.standardType || InspectionStandardType.Number,
      standardDesc: item?.inspectionStandard?.standardDesc || "",
      standardMax: item?.inspectionStandard?.standardMax ?? "",
      standardMaxInclusive: item?.inspectionStandard?.standardMaxInclusive ?? 0,
      standardMin: item?.inspectionStandard?.standardMin ?? "",
      standardMinInclusive: item?.inspectionStandard?.standardMinInclusive ?? 1,
      unitId: item?.inspectionStandard?.unitId || ""
    },
    inspectionFrequency: Number(
      item?.inspectionFrequency || item?.maintenanceFrequency || (isCheck.value ? SpotInspectionFrequency.Daily : 1)
    ),
    inspectionTimeList:
      item?.inspectionTimeList?.map((time: string) => ({
        key: ++timeKey,
        value: time
      })) || [{ key: 0, value: "" }]
  }

  selectedDepartmentList.value = formData.value.inspectionDepartmentIds.map((id, itemIndex) => ({
    value: id,
    label:
      (isMaintain.value ? item?.maintenanceDepartments : item?.inspectionDepartments)?.[itemIndex]?.depName || id
  }))
  selectedNgDepartmentList.value = formData.value.ngDepartmentIds.map((id, itemIndex) => ({
    value: id,
    label: item?.ngDepartments?.[itemIndex]?.depName || id
  }))
  imageList.value = (item?.files || []).map((file: any) => ({
    fileName: file.fileName,
    fileId: file.id,
    fileUrl: formatImgUrlPreview(file.path)
  }))

  dialogVisible.value = true
}

const onDeleteRow = async (row: Record<string, any>) => {
  await ElMessageBox.confirm("此操作将删除该配置项，是否继续？", "提示", {
    type: "warning"
  })
  await deleteEquipmentModelConfig(row.id)
  ElMessage.success("删除成功")
  await getTableData()
  emit("success")
}

const mapRowToSaveParams = (row: Record<string, any>) => {
  const item = getRowItem(row)
  const payload: Record<string, any> = {
    id: row.id,
    mconfigType: row.mconfigType,
    equipmentModelId: row.equipmentModelId
  }

  const itemPayload: Record<string, any> = {
    ...item,
    fileIds: item?.files?.map((file: any) => file.id) || [],
    ngDepartmentIds: item?.ngDepartments?.map((department: any) => department.id) || []
  }

  if (isPatrol.value) {
    itemPayload.inspectionDepartmentIds = item?.inspectionExecutePositionId
      ? [item.inspectionExecutePositionId]
      : item?.inspectionDepartments?.map((department: any) => department.id) || []
    itemPayload.inspectionExecuteDepartmentId = item?.inspectionExecuteDepartmentId || ""
    itemPayload.inspectionExecuteDepartmentName = item?.inspectionExecuteDepartmentName || ""
    itemPayload.inspectionExecutePositionId = item?.inspectionExecutePositionId || ""
    itemPayload.inspectionExecutePositionName = item?.inspectionExecutePositionName || ""
    itemPayload.ngDepartmentIds = []
  } else if (isMaintain.value) {
    itemPayload.inspectionDepartmentIds = item?.maintenanceDepartments?.map((department: any) => department.id) || []
    itemPayload.maintenanceDepartmentIds =
      item?.maintenanceDepartments?.map((department: any) => department.id) || []
  } else {
    itemPayload.inspectionDepartmentIds = item?.inspectionDepartments?.map((department: any) => department.id) || []
  }

  payload[paramAttr.value] = itemPayload
  return payload
}

const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    special: true,
    componentType: "div",
    slots: {
      default: "section-base"
    }
  },
  {
    componentType: "div",
    props: { class: "w-[100%]" },
    label: `${itemLabel.value}项名称`,
    field: "inspectionId",
    rules: [
      {
        required: true,
        message: `请选择${itemLabel.value}项名称`,
        trigger: "change"
      }
    ],
    slots: {
      default: "inspectionId-default"
    }
  },
  {
    componentType: "el-input",
    label: `${itemLabel.value}项编号`,
    field: "inspectionCode",
    props: {
      placeholder: "不填则自动生成",
      disabled: currentEditIndex.value > -1
    }
  },
  {
    componentType: "el-input",
    label: isPatrol.value ? "探测方式" : "方法要求",
    field: "method",
    props: {
      type: "textarea",
      placeholder: isPatrol.value ? "请输入探测方式" : "请输入方法要求",
      maxlength: 200,
      showWordLimit: true
    }
  },
  {
    componentType: "div",
    props: { class: "w-[100%]" },
    label: "检验标准类型",
    field: "inspectionStandard.standardType",
    slots: {
      default: "standardType-default"
    }
  },
  {
    componentType: "el-input",
    label: "检验标准",
    field: "inspectionStandard.standardDesc",
    props: {
      placeholder: "请输入检验标准"
    },
    rules: [
      {
        required: true,
        message: "请输入检验标准",
        trigger: "blur"
      }
    ],
    hidden: formData.value.inspectionStandard.standardType !== InspectionStandardType.Text
  },
  {
    componentType: "div",
    label: "数值上限",
    field: "inspectionStandard.standardMax",
    slots: {
      default: "standardMax-default"
    },
    hidden: formData.value.inspectionStandard.standardType !== InspectionStandardType.Number
  },
  {
    componentType: "div",
    label: "数值下限",
    field: "inspectionStandard.standardMin",
    slots: {
      default: "standardMin-default"
    },
    hidden: formData.value.inspectionStandard.standardType !== InspectionStandardType.Number
  },
  {
    componentType: "div",
    label: "单位",
    field: "inspectionStandard.unitId",
    props: { class: "w-[100%]" },
    slots: {
      default: "unitId-default"
    },
    hidden: formData.value.inspectionStandard.standardType !== InspectionStandardType.Number
  },
  {
    componentType: "div",
    label: "图片说明",
    field: "imageList",
    slots: {
      default: "imageList-default"
    }
  },
  {
    special: true,
    componentType: "div",
    slots: {
      default: "section-condition"
    }
  },
  {
    componentType: "div",
    props: { class: "w-[100%]" },
    label: isPatrol.value ? "巡检周期" : isMaintain.value ? "保养频率" : "检验频率",
    field: "inspectionFrequency",
    rules: [
      {
        required: true,
        validator: (rule: any, value: any, callback: any) => {
          if (isCheck.value) {
            callback()
            return
          }
          const number = Number(value)
          if (Number.isNaN(number)) {
            callback("请输入数字")
            return
          }
          if (isPatrol.value) {
            if (number < 1 || Math.floor(number) !== number) {
              callback("请输入正整数")
              return
            }
            callback()
            return
          }
          if (number < 1 || number > 365 || Math.floor(number) !== number) {
            callback("请输入数字1-365")
            return
          }
          callback()
        },
        trigger: "change"
      }
    ],
    slots: {
      default: "inspectionFrequency-default"
    }
  },
  {
    componentType: "div",
    label: "选择时间",
    field: "inspectionTimeList",
    rules: [
      {
        required: true,
        validator: (rule: any, value: any, callback: any) => {
          if ((value || []).some((item: any) => !item.value)) {
            callback("请选择时间")
            return
          }
          callback()
        },
        trigger: "change"
      }
    ],
    slots: {
      default: "inspectionTimeList-default"
    },
    hidden: !isCheck.value || formData.value.inspectionFrequency !== SpotInspectionFrequency.TimePoint
  },
  {
    componentType: "div",
    props: { class: "w-[100%]" },
    label: "巡检执行职位",
    field: "inspectionPositionValue",
    rules: [
      {
        required: true,
        validator: (rule: any, value: any, callback: any) => {
          if (!value?.length) {
            callback("请选择巡检执行职位")
            return
          }
          callback()
        },
        trigger: "change"
      }
    ],
    slots: {
      default: "inspectionPositionValue-default"
    },
    hidden: !isPatrol.value
  },
  {
    componentType: "div",
    props: { class: "w-[100%]" },
    label: isMaintain.value ? "保养执行部门" : "检验执行部门",
    field: "inspectionDepartmentIds",
    rules: [
      {
        required: true,
        validator: (rule: any, value: any, callback: any) => {
          if (!value?.length) {
            callback("请选择执行部门")
            return
          }
          callback()
        },
        trigger: "change"
      }
    ],
    slots: {
      default: "inspectionDepartmentIds-default"
    },
    hidden: isCheck.value || isPatrol.value
  },
  {
    componentType: "div",
    props: { class: "w-[100%]" },
    label: "NG处理部门",
    field: "ngDepartmentIds",
    rules: [
      {
        required: true,
        validator: (rule: any, value: any, callback: any) => {
          if (!value?.length) {
            callback("请选择NG处理部门")
            return
          }
          callback()
        },
        trigger: "change"
      }
    ],
    slots: {
      default: "ngDepartmentIds-default"
    },
    hidden: isPatrol.value
  }
])

const onSubmit = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid || !props.modelId) return

  const payload = {
    ...formData.value,
    inspectionStandard: modifyStandardData({ ...formData.value.inspectionStandard }),
    fileIds: imageList.value.map((item) => item.fileId)
  } as Record<string, any>

  if (
    Number(payload.inspectionStandard.standardType) === InspectionStandardType.Number &&
    !isNumberStandardValid(
      payload.inspectionStandard.standardMax,
      payload.inspectionStandard.standardMin,
      !!payload.inspectionStandard.standardMaxInclusive,
      !!payload.inspectionStandard.standardMinInclusive
    )
  ) {
    return
  }

  if (isCheck.value) {
    payload.inspectionTimeList = (payload.inspectionTimeList || []).map((item: any) => item.value)
    const timeSet = new Set(payload.inspectionTimeList)
    if (timeSet.size !== payload.inspectionTimeList.length) {
      ElMessage.warning("时间点不能重复")
      return
    }
  } else {
    payload.inspectionTimeList = []
  }

  if (isPatrol.value) {
    const selectedPosition = getSelectedDepartmentPosition(formData.value.inspectionPositionValue)
    payload.inspectionFrequency = Number(payload.inspectionFrequency)
    payload.inspectionDepartmentIds = selectedPosition.positionId ? [selectedPosition.positionId] : []
    payload.inspectionExecuteDepartmentId = selectedPosition.departmentId
    payload.inspectionExecuteDepartmentName = selectedPosition.departmentName
    payload.inspectionExecutePositionId = selectedPosition.positionId
    payload.inspectionExecutePositionName = selectedPosition.positionName
    payload.ngDepartmentIds = []
  }

  if (isMaintain.value) {
    payload.inspectionFrequency = Number(payload.inspectionFrequency)
    payload.maintenanceFrequency = payload.inspectionFrequency
    payload.maintenanceDepartmentIds = payload.inspectionDepartmentIds
    payload.maintenanceName = payload.inspectionName
    payload.maintenanceCode = payload.inspectionCode
  }

  const dataList = customTableData.value.map(mapRowToSaveParams)
  const saveData: Record<string, any> = {
    mconfigType: configType.value,
    equipmentModelId: props.modelId
  }

  saveData[paramAttr.value] = payload
  if (currentEditIndex.value > -1) {
    saveData.id = customTableData.value[currentEditIndex.value]?.id
    dataList[currentEditIndex.value] = saveData
  }

  await editEquipmentModelConfig({
    mconfigType: configType.value,
    equipmentModelId: props.modelId,
    equipmentCommonConfigs: currentEditIndex.value > -1 ? dataList : [...dataList, saveData]
  })

  ElMessage.success(currentEditIndex.value > -1 ? "编辑成功" : "新增成功")
  resetDialogState()
  await getTableData()
  emit("success")
}

watch(
  () => props.modelId,
  async (value) => {
    if (!value) {
      customTableData.value = []
      currentEquipmentModel.value = undefined
      return
    }
    await getTableData()
    if (isPatrol.value) {
      await Promise.all([getCurrentEquipmentModel(), getDepartmentPositionOptions()])
    }
  },
  {
    immediate: true
  }
)
</script>

<style scoped lang="scss">
.common-config-tab {
  height: 100%;
  display: flex;
  flex-direction: column;

  .custom-table {
    flex: 1;
    overflow: hidden;
  }

  .block-title {
    margin: 16px 0 12px;
    font-size: 16px;
    color: #303133;
  }

  .custom-form {
    max-height: 70vh;
    padding-right: 4px;
    overflow-y: auto;
  }

  &:deep(.el-form-item) {
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }

    input[type="number"] {
      -moz-appearance: textfield;
    }
  }

  &:deep(.config-dialog .custom-dialog-content) {
    max-height: 76vh;
    overflow: auto;
  }
}

.image-list-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.image-item {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  background: #f5f7fa;
}
</style>
