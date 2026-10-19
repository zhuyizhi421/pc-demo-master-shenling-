<template>
  <CustomDialog v-model="visible" :title="dialogTitle" :loading="loading" size="medium">
    <CustomForm ref="formRef" v-model="formData" :configs="formConfigs" :label-width="150">
      <template #manage-default>
        <div class="manage-default">
          <el-checkbox
            v-model="formData.identityManage"
            label="标识管理"
            :true-value="1"
            :false-value="0"
          >
            <span>标识管理</span>
            <el-tooltip
              effect="dark"
              content="开启后，当前 MRO 信息按单件进行管理，每件都会关联独立的标签码。"
              placement="top-start"
            >
              <el-button :icon="QuestionFilled" size="small" circle class="text-[16px] ml-[5px]" />
            </el-tooltip>
          </el-checkbox>
          <el-checkbox
            v-if="formData.identityManage"
            v-model="formData.checkManage"
            label="校验管理"
            :true-value="1"
            :false-value="0"
          />
          <el-checkbox
            v-if="formData.identityManage"
            v-model="formData.maintenanceManage"
            label="保养管理"
            :true-value="1"
            :false-value="0"
          />
          <el-checkbox
            v-if="formData.identityManage"
            v-model="formData.lifeManage"
            label="寿命管理"
            :true-value="1"
            :false-value="0"
          >
            <span>寿命管理</span>
            <el-tooltip
              effect="dark"
              content="寿命低于报警线后，系统会按配置触发对应预警。"
              placement="top-start"
            >
              <el-button :icon="QuestionFilled" size="small" circle class="text-[16px] ml-[5px]" />
            </el-tooltip>
          </el-checkbox>
          <el-checkbox
            v-if="formData.identityManage"
            v-model="formData.archiveManage"
            label="封存管理"
            :true-value="1"
            :false-value="0"
          />
        </div>
      </template>

      <template #safe-stock-default>
        <el-checkbox
          v-model="formData.safeStockManage"
          label="安全库存管理"
          :true-value="1"
          :false-value="0"
        >
          <span>安全库存管理</span>
          <el-tooltip
            effect="dark"
            content="当前 MRO 信息库存低于安全库存时，系统按库存管理规则触发预警。"
            placement="top-start"
          >
            <el-button :icon="QuestionFilled" size="small" circle class="text-[16px] ml-[5px]" />
          </el-tooltip>
        </el-checkbox>
      </template>
    </CustomForm>

    <template #footer>
      <div>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="onSubmit()">保存</el-button>
      </div>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { QuestionFilled } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"

import { queryDepartmentWorkItemPageList } from "@/api/departmentWorkItem"
import { queryMroClassifyTree } from "@/api/operation/mro/mro-classify"
import {
  queryMroModelDetail,
  requestCreateMroModel,
  requestUpdateMroModel
} from "@/api/operation/mro/mro-model"
import { queryMroTypePageList } from "@/api/operation/mro/mro-type"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import PositiveIntInput from "@/components/PositiveIntInput/index.vue"
import type { IDepartmentWorkItem } from "@/types/base-info/department-work-item"
import type { IOption } from "@/types/common"
import type { IMroClassifyTreeItem } from "@/types/maintain/mro-manage/mro-classify"

interface IDepartmentPositionOption {
  label: string
  value: string
  children?: IDepartmentPositionOption[]
}

defineOptions({
  name: "MroModelCreateOrUpdate"
})

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    morModelId?: string
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success"): void
}>()

const loading = ref(false)
const formRef = ref<InstanceType<typeof CustomForm>>()

const mroTypeOptions = ref<IOption[]>([])
const mroClassifyTree = ref<IMroClassifyTreeItem[]>([])
const departmentPositionOptions = ref<IDepartmentPositionOption[]>([])
const departmentPositionCascaderProps = {
  emitPath: true,
  checkStrictly: false
}

const formData = reactive<{
  mroModelName: string
  mroModelNo: string
  mroSpec: string
  mroCategoryId: string
  mroClassifyId: string
  identityManage: number
  checkManage: number
  checkDepartmentPositionValue: string[]
  maintenanceManage: number
  maintenanceDepartmentPositionValue: string[]
  lifeManage: number
  totalLife: string
  alarmLine?: number
  archiveManage: number
  archivePeriod: string
  safeStockManage: number
  safeStock: number
  remarks: string
}>({
  mroModelName: "",
  mroModelNo: "",
  mroSpec: "",
  mroCategoryId: "",
  mroClassifyId: "",
  identityManage: 1,
  checkManage: 1,
  checkDepartmentPositionValue: [],
  maintenanceManage: 1,
  maintenanceDepartmentPositionValue: [],
  lifeManage: 1,
  totalLife: "",
  alarmLine: undefined,
  archiveManage: 1,
  archivePeriod: "",
  safeStockManage: 1,
  safeStock: 1,
  remarks: ""
})

const mroClassifyOptions = computed(() => {
  const filterTree = (
    list: IMroClassifyTreeItem[]
  ): Array<{ label: string; value: string; mroTypeId: string; children: any[] }> => {
    return list
      .map((item) => ({
        label: item.mroCategoryName,
        value: item.id,
        mroTypeId: item.mroTypeId,
        children: filterTree(item.children || [])
      }))
      .filter(
        (item) =>
          !formData.mroCategoryId ||
          item.mroTypeId === formData.mroCategoryId ||
          item.children.length
      )
  }

  const treeRows = Array.isArray(mroClassifyTree.value) ? mroClassifyTree.value : []
  const classifyRows = treeRows.flatMap((item) => (Array.isArray(item?.children) ? item.children : []))
  return filterTree(classifyRows)
})

const validateAlarmLine = (_rule: unknown, value: number | undefined, callback: Function) => {
  if (value === undefined || value === null || value === ("" as unknown as number)) {
    callback()
    return
  }
  if (Number(value) < 0 || Number(value) > 100) {
    callback(new Error("寿命报警线范围为0~100"))
    return
  }
  callback()
}

const formConfigs = computed<ICustomFormConfigItem[]>(() => {
  return [
    {
      componentType: "el-input",
      field: "mroModelNo",
      label: "MRO编号",
      props: {
        placeholder: "不填则自动生成",
        disabled: !!props.morModelId
      }
    },
    {
      componentType: "el-input",
      field: "mroModelName",
      label: "MRO名称",
      props: {
        placeholder: "请输入MRO名称"
      },
      rules: [
        {
          required: true,
          message: "请输入MRO名称",
          trigger: "blur"
        }
      ]
    },
    {
      componentType: "el-input",
      field: "mroSpec",
      label: "MRO规格",
      props: {
        placeholder: "请输入MRO规格"
      }
    },
    {
      componentType: "el-select",
      field: "mroCategoryId",
      label: "MRO类型",
      props: {
        customChildren: mroTypeOptions.value.map((item) => ({
          componentType: "el-option",
          props: {
            label: item.label,
            value: item.value
          }
        }))
      },
      events: {
        change: onMroTypeChange
      },
      rules: [
        {
          required: true,
          message: "请选择MRO类型",
          trigger: "change"
        }
      ]
    },
    {
      componentType: "el-cascader",
      field: "mroClassifyId",
      label: "MRO分类",
      props: {
        class: "position-content",
        options: mroClassifyOptions.value,
        clearable: true,
        filterable: true,
        separator: "-",
        props: {
          label: "label",
          value: "value",
          children: "children",
          emitPath: false,
          checkStrictly: true
        },
        placeholder: "请选择MRO分类"
      }
    },
    {
      componentType: "el-input",
      field: "remarks",
      label: "备注",
      colspan: -1,
      props: {
        type: "textarea",
        placeholder: "请输入备注",
        maxlength: 200,
        showWordLimit: true
      }
    },
    {
      componentType: "div",
      colspan: -1,
      slots: {
        default: "manage-default"
      }
    },
    {
      componentType: "el-cascader",
      field: "maintenanceDepartmentPositionValue",
      label: "保养执行职位",
      props: {
        class: "position-content",
        options: departmentPositionOptions.value,
        props: departmentPositionCascaderProps,
        clearable: true,
        filterable: true,
        separator: "-",
        placeholder: "请选择保养执行职位"
      },
      rules: [
        {
          required: true,
          message: "请选择保养执行职位",
          trigger: "change"
        }
      ],
      hidden: !formData.identityManage || !formData.maintenanceManage
    },
    {
      componentType: "el-cascader",
      field: "checkDepartmentPositionValue",
      label: "校验执行职位",
      props: {
        class: "position-content",
        options: departmentPositionOptions.value,
        props: departmentPositionCascaderProps,
        clearable: true,
        filterable: true,
        placeholder: "请选择校验执行职位"
      },
      rules: [
        {
          required: true,
          message: "请选择校验执行职位",
          trigger: "change"
        }
      ],
      hidden: !formData.identityManage || !formData.checkManage
    },
    {
      componentType: toRaw(PositiveIntInput),
      field: "totalLife",
      label: "设计寿命",
      props: {
        placeholder: "请输入设计寿命"
      },
      rules: [
        {
          required: true,
          message: "请输入设计寿命",
          trigger: "blur"
        }
      ],
      hidden: !formData.identityManage || !formData.lifeManage
    },
    {
      componentType: "el-input-number",
      field: "alarmLine",
      label: "寿命报警线(%)",
      props: {
        min: 0,
        max: 100,
        step: 1,
        precision: 0,
        controlsPosition: "right",
        validateEvent: true
      },
      rules: [
        {
          required: true,
          message: "请输入寿命报警线",
          trigger: "change"
        },
        {
          trigger: "change",
          validator: validateAlarmLine
        }
      ],
      hidden: !formData.identityManage || !formData.lifeManage
    },
    {
      componentType: toRaw(PositiveIntInput),
      field: "archivePeriod",
      label: "封存周期(天)",
      props: {
        placeholder: "请输入封存周期"
      },
      rules: [
        {
          required: true,
          message: "请输入封存周期",
          trigger: "blur"
        }
      ],
      hidden: !formData.identityManage || !formData.archiveManage
    },
    {
      componentType: "div",
      colspan: -1,
      slots: {
        default: "safe-stock-default"
      }
    },
    {
      componentType: "el-input-number",
      field: "safeStock",
      label: "安全库存",
      props: {
        min: 1,
        max: 99999,
        controlsPosition: "right",
        validateEvent: true
      },
      rules: [
        {
          required: true,
          message: "请输入安全库存",
          trigger: "blur"
        }
      ],
      hidden: !formData.safeStockManage
    }
  ]
})

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
})

const dialogTitle = computed(() => {
  return props.morModelId ? "编辑MRO信息" : "新建MRO信息"
})

watch(
  () => props.modelValue,
  async (val: boolean) => {
    if (val) {
      loading.value = true
      await Promise.all([
        getMroTypeList(),
        getMroClassifyList(),
        getDepartmentPositionOptions(),
        getMroModelDetail()
      ])
      loading.value = false
    } else {
      resetFormData()
      formRef.value?.resetForm()
    }
  }
)

const resetFormData = () => {
  formData.mroModelName = ""
  formData.mroModelNo = ""
  formData.mroSpec = ""
  formData.mroCategoryId = ""
  formData.mroClassifyId = ""
  formData.identityManage = 1
  formData.checkManage = 1
  formData.checkDepartmentPositionValue = []
  formData.maintenanceManage = 1
  formData.maintenanceDepartmentPositionValue = []
  formData.lifeManage = 1
  formData.totalLife = ""
  formData.alarmLine = undefined
  formData.archiveManage = 1
  formData.archivePeriod = ""
  formData.safeStockManage = 1
  formData.safeStock = 1
  formData.remarks = ""
}

const getMroTypeList = async () => {
  const data = await queryMroTypePageList({
    pageQuery: {
      pageNum: 1,
      pageSize: 999
    },
    queryParam: {}
  })
  if (!data) return
  mroTypeOptions.value = (data.records || []).map((item) => ({
    label: item.mroTypeName,
    value: item.id
  }))
}

const getMroClassifyList = async () => {
  mroClassifyTree.value = (await queryMroClassifyTree()) || []
}

const createDepartmentPositionValue = (departmentId?: string, positionId?: string) => {
  if (!departmentId || !positionId) return []
  return [departmentId, positionId]
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

const getDepartmentPositionOptions = async () => {
  const result = await queryDepartmentWorkItemPageList({
    pageNum: 1,
    pageSize: 999
  })
  departmentPositionOptions.value = buildDepartmentPositionOptions(result.records || [])
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

const findClassifyById = (id: string, list = mroClassifyTree.value): IMroClassifyTreeItem | null => {
  for (const item of list) {
    if (item.id === id) {
      return item
    }
    const child = findClassifyById(id, item.children || [])
    if (child) {
      return child
    }
  }
  return null
}

const onMroTypeChange = () => {
  const selectedClassify = findClassifyById(formData.mroClassifyId)
  if (selectedClassify && selectedClassify.mroTypeId !== formData.mroCategoryId) {
    formData.mroClassifyId = ""
  }
}

const getMroModelDetail = async () => {
  if (!props.morModelId) {
    return
  }

  const data = await queryMroModelDetail(props.morModelId)
  if (!data) {
    return
  }

  formData.mroModelName = data.mroModelName || ""
  formData.mroModelNo = data.mroModelNo || ""
  formData.mroSpec = data.mroSpec || ""
  formData.mroCategoryId = data.mroCategoryId || ""
  formData.mroClassifyId = data.mroClassifyId || ""
  formData.identityManage = Number(data.identityManage ?? 1)
  formData.checkManage = Number(data.checkManage ?? 1)
  ensureCurrentDepartmentPositionOption({
    depId: data.checkExecuteDepartmentId,
    depName: data.checkExecuteDepartmentName,
    positionId: data.checkExecutePositionId,
    positionName: data.checkExecutePositionName
  })
  formData.checkDepartmentPositionValue = createDepartmentPositionValue(
    data.checkExecuteDepartmentId,
    data.checkExecutePositionId
  )
  formData.maintenanceManage = Number(data.maintenanceManage ?? 1)
  ensureCurrentDepartmentPositionOption({
    depId: data.maintenanceExecuteDepartmentId,
    depName: data.maintenanceExecuteDepartmentName,
    positionId: data.maintenanceExecutePositionId,
    positionName: data.maintenanceExecutePositionName
  })
  formData.maintenanceDepartmentPositionValue = createDepartmentPositionValue(
    data.maintenanceExecuteDepartmentId,
    data.maintenanceExecutePositionId
  )
  formData.lifeManage = Number(data.lifeManage ?? 1)
  formData.totalLife = String(data.totalLife ?? "")
  formData.alarmLine = data.alarmLine ?? undefined
  formData.archiveManage = Number(data.archiveManage ?? 1)
  formData.archivePeriod = String(data.archivePeriod ?? "")
  formData.safeStockManage = Number(data.safeStockManage ?? 1)
  formData.safeStock = Number(data.safeStock ?? 1)
  formData.remarks = data.remarks || ""
}

const onSubmit = async () => {
  const valid = await formRef.value?.validateForm()
  if (!valid) {
    return
  }

  const normalizeSingleValue = (value: unknown) => {
    if (Array.isArray(value)) {
      return String(value[value.length - 1] || "")
    }
    return String(value || "")
  }

  const selectedMaintenancePosition = getSelectedDepartmentPosition(
    formData.maintenanceDepartmentPositionValue
  )
  const selectedCheckPosition = getSelectedDepartmentPosition(formData.checkDepartmentPositionValue)

  const params = {
    id: props.morModelId || "",
    mroModelName: formData.mroModelName.trim(),
    mroModelNo: formData.mroModelNo.trim(),
    mroSpec: formData.mroSpec.trim(),
    mroCategoryId: normalizeSingleValue(formData.mroCategoryId),
    mroClassifyId: normalizeSingleValue(formData.mroClassifyId),
    identityManage: formData.identityManage,
    checkManage: formData.identityManage ? formData.checkManage : 0,
    checkExecuteDepartmentId:
      formData.identityManage && formData.checkManage ? selectedCheckPosition.departmentId : "",
    checkExecuteDepartmentName:
      formData.identityManage && formData.checkManage ? selectedCheckPosition.departmentName : "",
    checkExecutePositionId:
      formData.identityManage && formData.checkManage ? selectedCheckPosition.positionId : "",
    checkExecutePositionName:
      formData.identityManage && formData.checkManage ? selectedCheckPosition.positionName : "",
    maintenanceManage: formData.identityManage ? formData.maintenanceManage : 0,
    maintenanceExecuteDepartmentId:
      formData.identityManage && formData.maintenanceManage
        ? selectedMaintenancePosition.departmentId
        : "",
    maintenanceExecuteDepartmentName:
      formData.identityManage && formData.maintenanceManage
        ? selectedMaintenancePosition.departmentName
        : "",
    maintenanceExecutePositionId:
      formData.identityManage && formData.maintenanceManage
        ? selectedMaintenancePosition.positionId
        : "",
    maintenanceExecutePositionName:
      formData.identityManage && formData.maintenanceManage
        ? selectedMaintenancePosition.positionName
        : "",
    lifeManage: formData.identityManage ? formData.lifeManage : 0,
    totalLife: formData.identityManage && formData.lifeManage ? Number(formData.totalLife || 0) : 0,
    alarmLine: formData.identityManage && formData.lifeManage ? Number(formData.alarmLine || 0) : 0,
    archiveManage: formData.identityManage ? formData.archiveManage : 0,
    archivePeriod:
      formData.identityManage && formData.archiveManage ? Number(formData.archivePeriod || 0) : 0,
    safeStockManage: formData.safeStockManage,
    safeStock: formData.safeStockManage ? Number(formData.safeStock || 0) : 0,
    remarks: formData.remarks.trim()
  }

  const request = props.morModelId ? requestUpdateMroModel : requestCreateMroModel
  await request(params)
  visible.value = false
  ElMessage.success(props.morModelId ? "编辑成功" : "创建成功")
  emit("success")
}
</script>

<style scoped lang="scss">
.manage-default {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
}

:deep(.position-content) {
  width: 100%;
}
</style>
