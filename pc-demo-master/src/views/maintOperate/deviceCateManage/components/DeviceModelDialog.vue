<template>
  <div>
    <CustomDialog
      v-model="show"
      :title="`${justSee ? '查看' : status === 'edit' ? '编辑' : '新建'}设备信息`"
      size="medium"
      @close="onCancelClick"
    >
      <CustomForm
        ref="customFormRef"
        v-model="modalData"
        :configs="formConfigs"
        :columns="2"
        :label-width="150"
      />
      <template #footer>
        <div>
          <el-button @click="onCancelClick">取消</el-button>
          <el-button v-if="!justSee" type="primary" @click="onSubmitClick()">确定</el-button>
        </div>
      </template>
    </CustomDialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { queryDepartmentWorkItemPageList } from "@/api/departmentWorkItem"
import { requestFlowDefinitionList } from "@/api/flowable"
import {
  requestCreateEquipmentModel,
  requestUpdateEquipmentModel
} from "@/api/operation/equipment/equipment-model"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import SelectFault from "@/components/SelectFault/cascader.vue"
import uploadImage from "@/components/UploadImage/index.vue"
import { EnumSystemFaultType } from "@/constant/enums"
import useResetRef from "@/hooks/useResetRef"
import type { IDepartmentWorkItem } from "@/types/base-info/department-work-item"
import type { IUploadPhoto } from "@/types/base-info/global-config"
import type {
  IEquipmentModelDepartmentPosition,
  IEquipmentModelRepairTargetItem
} from "@/types/maintain/equipment-manage/equipment-model"
import type { IFlowableDefinitionItem } from "@/types/personal/flow"
import { formatImgUrlPreview } from "@/utils/common"

interface ICategoryOption {
  label: string
  value: string
  children?: ICategoryOption[]
}

interface IDepartmentPositionOption {
  label: string
  value: string
  children?: IDepartmentPositionOption[]
}

interface ModalData {
  modelName: string
  modelNo?: string
  deviceModel: string
  remarks: string
  repairDepartmentIds: string[]
  repairDepartments: IEquipmentModelRepairTargetItem[]
  repairDepartmentPositionValues: string[][]
  repairProcdefId: string
  scrapProcdefId: string
  faultIds: string[]
  equipmentCategoryId: string
  id: string
  modelImg: string
  modelImgPath: string
  fileList: IUploadPhoto[]
  patrolDepartmentPositionValue: string[]
  maintenanceDepartmentPositionValue: string[]
  exceptionHandleDepartmentPositionValues: string[][]
  patrolExecuteDepartmentId?: string
  patrolExecuteDepartmentName?: string
  patrolExecutePositionId?: string
  patrolExecutePositionName?: string
  maintenanceExecuteDepartmentId?: string
  maintenanceExecuteDepartmentName?: string
  maintenanceExecutePositionId?: string
  maintenanceExecutePositionName?: string
  exceptionHandlePositionList?: IEquipmentModelDepartmentPosition[]
}

const [modalData, resetModalData] = useResetRef<ModalData>({
  modelName: "",
  modelNo: "",
  deviceModel: "",
  remarks: "",
  repairDepartmentIds: [],
  repairDepartments: [],
  repairDepartmentPositionValues: [],
  repairProcdefId: "",
  scrapProcdefId: "",
  faultIds: [],
  equipmentCategoryId: "",
  id: "",
  modelImg: "",
  modelImgPath: "",
  fileList: [],
  patrolDepartmentPositionValue: [],
  maintenanceDepartmentPositionValue: [],
  exceptionHandleDepartmentPositionValues: []
})

const customFormRef = ref<InstanceType<typeof CustomForm>>()

defineOptions({
  name: "EditDeviceModal"
})

const props = defineProps<{
  status: "edit" | "create"
  deviceInfo?: ModalData
  categoryOptions: ICategoryOption[]
  justSee?: boolean
}>()

const emits = defineEmits<{
  (e: "onOk"): void
}>()

const show = ref(false)
const flowOptions = ref<IFlowableDefinitionItem[]>([])
const departmentPositionOptions = ref<IDepartmentPositionOption[]>([])

const singleDepartmentPositionProps = {
  emitPath: true,
  checkStrictly: false
}

const multipleDepartmentPositionProps = {
  emitPath: true,
  checkStrictly: false,
  multiple: true
}

const buildDepartmentPositionOptions = (departments: IDepartmentWorkItem[]) => {
  return departments
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

const ensureRepairTargetOption = (item: IEquipmentModelRepairTargetItem) => {
  const positionId = item.id || ""
  const departmentName = item.depName || ""
  const positionName = item.positionName || item.name || ""
  if (!positionId || !departmentName || !positionName) return

  const departmentNode = departmentPositionOptions.value.find((option) => option.label === departmentName)
  if (!departmentNode) return

  departmentNode.children ||= []
  if (!departmentNode.children.some((child) => child.value === positionId)) {
    departmentNode.children.unshift({
      label: positionName,
      value: positionId
    })
  }
}

const createDepartmentPositionValue = (departmentId?: string, positionId?: string) => {
  if (!departmentId || !positionId) return []
  return [departmentId, positionId]
}

const createDepartmentPositionValues = (rows: IEquipmentModelDepartmentPosition[] = []) => {
  return rows
    .filter((item) => item.depId && item.positionId)
    .map((item) => createDepartmentPositionValue(item.depId, item.positionId))
}

const findDepartmentPositionPathByPositionId = (
  positionId?: string,
  depName?: string,
  positionName?: string
) => {
  if (!positionId) return []

  for (const department of departmentPositionOptions.value) {
    const matchedById = department.children?.find((item) => item.value === positionId)
    if (matchedById) {
      return [department.value, matchedById.value]
    }
  }

  if (!depName || !positionName) return []

  const department = departmentPositionOptions.value.find((item) => item.label === depName)
  const position = department?.children?.find((item) => item.label === positionName)
  if (!department || !position) return []

  return [department.value, position.value]
}

const createRepairDepartmentPositionValues = (rows: IEquipmentModelRepairTargetItem[] = []) => {
  return rows
    .map((item) =>
      findDepartmentPositionPathByPositionId(item.id, item.depName, item.positionName || item.name)
    )
    .filter((item) => item.length)
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

const buildExceptionHandlePositionList = (values: string[][]) => {
  return values
    .map((value) => {
      const [depId = "", positionId = ""] = value || []
      if (!depId || !positionId) return null
      const departmentNode = departmentPositionOptions.value.find((item) => item.value === depId)
      const positionNode = departmentNode?.children?.find((item) => item.value === positionId)
      return {
        depId,
        depName: departmentNode?.label || "",
        positionId,
        positionName: positionNode?.label || ""
      }
    })
    .filter(Boolean) as IEquipmentModelDepartmentPosition[]
}

const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-input",
    label: "类型名称",
    field: "modelName",
    rules: [{ required: true, message: "请输入类型名称", trigger: "change" }],
    props: {
      placeholder: "请输入类型名称",
      disabled: !!props.justSee
    }
  },
  {
    componentType: "el-input",
    label: "类型编号",
    field: "modelNo",
    props: {
      placeholder: "不填则自动生成",
      disabled: props.status === "edit" || !!props.justSee
    }
  },
  {
    componentType: "el-input",
    label: "设备型号",
    field: "deviceModel",
    props: {
      placeholder: "请输入设备型号",
      disabled: !!props.justSee
    }
  },
  {
    componentType: "el-cascader",
    label: "设备分类",
    field: "equipmentCategoryId",
    rules: [{ required: true, message: "请选择设备分类", trigger: "change" }],
    props: {
      class: "position-content",
      options: props.categoryOptions,
      clearable: true,
      filterable: true,
      showAllLevels: false,
      disabled: !!props.justSee,
      props: {
        label: "label",
        value: "value",
        children: "children",
        emitPath: false,
        checkStrictly: true
      },
      placeholder: "请选择设备分类"
    }
  },
  {
    componentType: "el-cascader",
    label: "指定维修职位",
    field: "repairDepartmentPositionValues",
    props: {
      class: "position-content compact-multi-cascader",
      options: departmentPositionOptions.value,
      props: multipleDepartmentPositionProps,
      clearable: true,
      filterable: true,
      separator: "-",
      collapseTags: true,
      collapseTagsTooltip: true,
      maxCollapseTags: 1,
      disabled: !!props.justSee,
      placeholder: "请选择指定维修职位"
    }
  },
  {
    componentType: "el-cascader",
    label: "巡检执行职位",
    field: "patrolDepartmentPositionValue",
    props: {
      class: "position-content",
      options: departmentPositionOptions.value,
      props: singleDepartmentPositionProps,
      clearable: true,
      filterable: true,
      separator: "-",
      disabled: !!props.justSee,
      placeholder: "请选择巡检执行职位"
    }
  },
  {
    componentType: "el-cascader",
    label: "保养执行职位",
    field: "maintenanceDepartmentPositionValue",
    props: {
      class: "position-content",
      options: departmentPositionOptions.value,
      props: singleDepartmentPositionProps,
      clearable: true,
      filterable: true,
      separator: "-",
      disabled: !!props.justSee,
      placeholder: "请选择保养执行职位"
    }
  },
  {
    componentType: "el-cascader",
    label: "异常处理职位",
    field: "exceptionHandleDepartmentPositionValues",
    props: {
      class: "position-content compact-multi-cascader",
      options: departmentPositionOptions.value,
      props: multipleDepartmentPositionProps,
      clearable: true,
      filterable: true,
      separator: "-",
      collapseTags: true,
      collapseTagsTooltip: true,
      maxCollapseTags: 1,
      disabled: !!props.justSee,
      placeholder: "请选择异常处理职位"
    }
  },
  {
    componentType: "el-select",
    label: "设备维修流程",
    field: "repairProcdefId",
    props: {
      placeholder: "请选择",
      disabled: !!props.justSee,
      customChildren: flowOptions.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.name,
          value: item.flowKey
        }
      }))
    }
  },
  {
    componentType: "el-select",
    label: "设备报废流程",
    field: "scrapProcdefId",
    props: {
      placeholder: "请选择",
      disabled: !!props.justSee,
      customChildren: flowOptions.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.name,
          value: item.flowKey
        }
      }))
    }
  },
  {
    componentType: markRaw(SelectFault),
    label: "关联故障",
    field: "faultIds",
    props: {
      type: EnumSystemFaultType.Equipment,
      multiple: true,
      collapseTags: true,
      maxCollapseTags: 1,
      class: "w-[100%] compact-multi-cascader",
      disabled: !!props.justSee
    }
  },
  {
    componentType: markRaw(uploadImage),
    label: "设备图片",
    field: "fileList",
    props: {
      disabled: !!props.justSee
    }
  },
  {
    componentType: "el-input",
    label: "备注",
    field: "remarks",
    colspan: -1,
    props: {
      type: "textarea",
      placeholder: "请输入备注",
      maxlength: 200,
      showWordLimit: true,
      disabled: !!props.justSee
    }
  }
])

watch(
  () => show.value,
  async (val) => {
    if (!val) {
      resetModalData()
      return
    }

    await Promise.all([getFlowOptions(), getDepartmentPositionOptions()])
    if (props.status !== "edit" || !props.deviceInfo) return

    const { modelImg, modelImgPath } = props.deviceInfo
    modalData.value = cloneDeep(props.deviceInfo)
    modalData.value.fileList = modelImg
      ? [
          {
            fileId: modelImg,
            fileUrl: formatImgUrlPreview(modelImgPath)
          }
        ]
      : []

    ensureCurrentDepartmentPositionOption({
      depId: props.deviceInfo.patrolExecuteDepartmentId,
      depName: props.deviceInfo.patrolExecuteDepartmentName,
      positionId: props.deviceInfo.patrolExecutePositionId,
      positionName: props.deviceInfo.patrolExecutePositionName
    })
    ensureCurrentDepartmentPositionOption({
      depId: props.deviceInfo.maintenanceExecuteDepartmentId,
      depName: props.deviceInfo.maintenanceExecuteDepartmentName,
      positionId: props.deviceInfo.maintenanceExecutePositionId,
      positionName: props.deviceInfo.maintenanceExecutePositionName
    })
    ;(props.deviceInfo.repairDepartments || []).forEach((item) => ensureRepairTargetOption(item))
    ;(props.deviceInfo.exceptionHandlePositionList || []).forEach((item) => {
      ensureCurrentDepartmentPositionOption(item)
    })

    modalData.value.repairDepartmentPositionValues = createRepairDepartmentPositionValues(
      props.deviceInfo.repairDepartments || []
    )
    modalData.value.patrolDepartmentPositionValue = createDepartmentPositionValue(
      props.deviceInfo.patrolExecuteDepartmentId,
      props.deviceInfo.patrolExecutePositionId
    )
    modalData.value.maintenanceDepartmentPositionValue = createDepartmentPositionValue(
      props.deviceInfo.maintenanceExecuteDepartmentId,
      props.deviceInfo.maintenanceExecutePositionId
    )
    modalData.value.exceptionHandleDepartmentPositionValues = createDepartmentPositionValues(
      props.deviceInfo.exceptionHandlePositionList || []
    )
  },
  {
    immediate: true
  }
)

const getFlowOptions = async () => {
  flowOptions.value = await requestFlowDefinitionList()
}

const getDepartmentPositionOptions = async () => {
  const result = await queryDepartmentWorkItemPageList({
    pageNum: 1,
    pageSize: 999
  })
  departmentPositionOptions.value = buildDepartmentPositionOptions(result.records || [])
}

const onSubmitClick = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return

  const repairDepartmentIds = Array.from(
    new Set(
      modalData.value.repairDepartmentPositionValues
        .map((item) => item[1] || "")
        .filter(Boolean)
    )
  )
  const patrolExecutePosition = getSelectedDepartmentPosition(
    modalData.value.patrolDepartmentPositionValue
  )
  const maintenanceExecutePosition = getSelectedDepartmentPosition(
    modalData.value.maintenanceDepartmentPositionValue
  )
  const exceptionHandlePositionList = buildExceptionHandlePositionList(
    modalData.value.exceptionHandleDepartmentPositionValues
  )
  const {
    fileList,
    repairDepartments,
    repairDepartmentPositionValues,
    patrolDepartmentPositionValue,
    maintenanceDepartmentPositionValue,
    exceptionHandleDepartmentPositionValues,
    exceptionHandlePositionList: _exceptionHandlePositionList,
    ...res
  } = modalData.value

  const payload = {
    ...res,
    modelImg: fileList[0]?.fileId,
    repairDepartmentIds,
    patrolExecuteDepartmentId: patrolExecutePosition.departmentId,
    patrolExecuteDepartmentName: patrolExecutePosition.departmentName,
    patrolExecutePositionId: patrolExecutePosition.positionId,
    patrolExecutePositionName: patrolExecutePosition.positionName,
    maintenanceExecuteDepartmentId: maintenanceExecutePosition.departmentId,
    maintenanceExecuteDepartmentName: maintenanceExecutePosition.departmentName,
    maintenanceExecutePositionId: maintenanceExecutePosition.positionId,
    maintenanceExecutePositionName: maintenanceExecutePosition.positionName,
    exceptionHandlePositionList: exceptionHandlePositionList.map((item) => ({
      depId: item.depId,
      positionId: item.positionId
    }))
  }

  if (props.status === "edit") {
    await requestUpdateEquipmentModel(payload)
    ElMessage.success("编辑成功")
  } else {
    await requestCreateEquipmentModel(payload)
    ElMessage.success("新建成功")
  }

  show.value = false
  customFormRef.value?.resetForm()
  emits("onOk")
}

const onCancelClick = () => {
  customFormRef.value?.resetForm()
  show.value = false
}

defineExpose({
  setShow: () => {
    show.value = true
  }
})
</script>

<style scoped lang="scss">
:deep(.position-content) {
  width: 100%;
}

:deep(.compact-multi-cascader) {
  width: 100%;

  .el-input__wrapper {
    min-height: 32px;
  }

  .el-cascader__tags {
    overflow: hidden;
    flex-wrap: nowrap;
    width: calc(100% - 32px);
  }

  .el-tag {
    max-width: 100%;
  }

  .el-tag:first-child {
    flex: 1;
    overflow: hidden;
  }

  .el-tag__content {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .el-cascader__search-input {
    display: none;
  }
}
</style>
