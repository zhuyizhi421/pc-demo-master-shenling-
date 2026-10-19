<template>
  <CustomDialog v-model="visible" :title="dialogTitle" size="medium" :loading="loading">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="160px" class="dialog-form">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="MRO类型编号" prop="mroTypeNo">
            <el-input
              v-model="formData.mroTypeNo"
              placeholder="为空则自动生成"
              :disabled="isReadonly"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="MRO类型名称" prop="mroTypeName">
            <el-input
              v-model="formData.mroTypeName"
              placeholder="请输入MRO类型名称"
              :disabled="isReadonly"
            />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="MRO校验工单提前生成天数" prop="verifyAdvanceDays">
            <el-input-number
              v-model="formData.verifyAdvanceDays"
              :min="0"
              :step="1"
              :precision="0"
              controls-position="right"
              class="w-full"
              :disabled="isReadonly"
            />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="MRO保养工单提前生成天数" prop="maintenanceAdvanceDays">
            <el-input-number
              v-model="formData.maintenanceAdvanceDays"
              :min="0"
              :step="1"
              :precision="0"
              controls-position="right"
              class="w-full"
              :disabled="isReadonly"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="MRO维修流程" prop="repairProcessId">
            <el-select
              v-model="formData.repairProcessId"
              class="w-full"
              clearable
              filterable
              placeholder="请选择MRO维修流程"
              :disabled="isReadonly"
            >
              <el-option
                v-for="item in flowOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="MRO报废流程" prop="scrapProcessId">
            <el-select
              v-model="formData.scrapProcessId"
              class="w-full"
              clearable
              filterable
              placeholder="请选择MRO报废流程"
              :disabled="isReadonly"
            >
              <el-option
                v-for="item in flowOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="异常处理职位" prop="selectedExceptionHandleKeys">
            <el-tree-select
              v-model="formData.selectedExceptionHandleKeys"
              :data="departmentPositionOptions"
              :props="treeProps"
              multiple
              show-checkbox
              check-strictly
              filterable
              collapse-tags
              collapse-tags-tooltip
              clearable
              node-key="value"
              class="w-full"
              placeholder="请选择异常处理职位"
              :disabled="isReadonly"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="维修职位" prop="selectedRepairKeys">
            <el-tree-select
              v-model="formData.selectedRepairKeys"
              :data="departmentPositionOptions"
              :props="treeProps"
              multiple
              show-checkbox
              check-strictly
              filterable
              collapse-tags
              collapse-tags-tooltip
              clearable
              node-key="value"
              class="w-full"
              placeholder="请选择维修职位"
              :disabled="isReadonly"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              type="textarea"
              :rows="4"
              maxlength="200"
              show-word-limit
              placeholder="请输入备注"
              :disabled="isReadonly"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button v-if="!isReadonly" type="primary" @click="submit">保存</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage, type FormInstance, type FormRules } from "element-plus"

import { queryDepartmentWorkItemPageList } from "@/api/departmentWorkItem"
import { requestFlowDefinitionList } from "@/api/flowable"
import {
  queryMroTypeDetail,
  requestCreateMroType,
  requestUpdateMroType
} from "@/api/operation/mro/mro-type"
import CustomDialog from "@/components/CustomDialog/index.vue"
import type { IDepartmentWorkItem } from "@/types/base-info/department-work-item"
import type {
  IMroTypeExceptionHandlePosition,
  IMroTypePageListItem
} from "@/types/maintain/mro-manage/mro-type"
import type { IFlowableDefinitionItem } from "@/types/personal/flow"

defineOptions({
  name: "MroTypeDialog"
})

interface IDepartmentPositionTreeOption {
  label: string
  value: string
  disabled?: boolean
  children?: IDepartmentPositionTreeOption[]
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    mode: "create" | "edit" | "view"
    mroTypeId?: string
  }>(),
  {
    modelValue: false,
    mode: "create",
    mroTypeId: ""
  }
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success"): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value)
})

const loading = ref(false)
const formRef = ref<FormInstance | null>(null)
const departmentPositionOptions = ref<IDepartmentPositionTreeOption[]>([])
const flowOptions = ref<IFlowableDefinitionItem[]>([])
const treeProps = {
  label: "label",
  value: "value",
  children: "children",
  disabled: "disabled"
}

const isReadonly = computed(() => props.mode === "view")
const dialogTitle = computed(() => {
  if (props.mode === "create") return "新建MRO类型"
  if (props.mode === "edit") return "编辑MRO类型"
  return "MRO类型详情"
})

const formData = reactive({
  mroTypeNo: "",
  mroTypeName: "",
  verifyAdvanceDays: 0,
  maintenanceAdvanceDays: 0,
  repairProcessId: "",
  scrapProcessId: "",
  remark: "",
  selectedExceptionHandleKeys: [] as string[],
  selectedRepairKeys: [] as string[]
})

const rules = reactive<FormRules<typeof formData>>({
  mroTypeName: [
    {
      required: true,
      message: "请输入MRO类型名称",
      trigger: "blur"
    }
  ],
  verifyAdvanceDays: [
    {
      required: true,
      message: "请输入MRO校验工单提前生成天数",
      trigger: "change"
    }
  ],
  maintenanceAdvanceDays: [
    {
      required: true,
      message: "请输入MRO保养工单提前生成天数",
      trigger: "change"
    }
  ],
  selectedExceptionHandleKeys: [
    {
      type: "array",
      required: true,
      message: "请选择异常处理职位",
      trigger: "change"
    }
  ],
  selectedRepairKeys: [
    {
      type: "array",
      required: true,
      message: "请选择维修职位",
      trigger: "change"
    }
  ]
})

const resetState = () => {
  formData.mroTypeNo = ""
  formData.mroTypeName = ""
  formData.verifyAdvanceDays = 0
  formData.maintenanceAdvanceDays = 0
  formData.repairProcessId = ""
  formData.scrapProcessId = ""
  formData.remark = ""
  formData.selectedExceptionHandleKeys = []
  formData.selectedRepairKeys = []
  formRef.value?.resetFields()
  formRef.value?.clearValidate()
}

const createPositionKey = (depId: string, positionId: string) => `${depId}:${positionId}`

const buildDepartmentPositionOptions = (departments: IDepartmentWorkItem[]) => {
  return departments
    .filter((department) => (department.positionList || []).length)
    .map((department) => ({
      label: department.depName,
      value: `dep:${department.id}`,
      disabled: true,
      children: (department.positionList || []).map((position) => ({
        label: `${position.name}${position.code ? ` (${position.code})` : ""}`,
        value: createPositionKey(department.id, position.id)
      }))
    }))
}

const ensurePositionOptions = (rows: IMroTypeExceptionHandlePosition[] = []) => {
  rows.forEach((item) => {
    if (!item.depId || !item.positionId) return

    let departmentNode = departmentPositionOptions.value.find(
      (option) => option.value === `dep:${item.depId}`
    )

    if (!departmentNode) {
      departmentNode = {
        label: item.depName || item.depId,
        value: `dep:${item.depId}`,
        disabled: true,
        children: []
      }
      departmentPositionOptions.value.unshift(departmentNode)
    }

    departmentNode.children ||= []
    const targetValue = createPositionKey(item.depId, item.positionId)
    if (!departmentNode.children.some((child) => child.value === targetValue)) {
      departmentNode.children.unshift({
        label: item.positionName || item.positionId,
        value: targetValue
      })
    }
  })
}

const getDepartmentPositionOptions = async () => {
  const result = await queryDepartmentWorkItemPageList({
    pageNum: 1,
    pageSize: 999
  })
  departmentPositionOptions.value = buildDepartmentPositionOptions(result.records)
}

const getFlowOptions = async () => {
  flowOptions.value = await requestFlowDefinitionList()
}

const setDetailData = (detail: IMroTypePageListItem) => {
  formData.mroTypeNo = detail.mroTypeNo || ""
  formData.mroTypeName = detail.mroTypeName || ""
  formData.verifyAdvanceDays = Number(detail.verifyAdvanceDays || 0)
  formData.maintenanceAdvanceDays = Number(detail.maintenanceAdvanceDays || 0)
  formData.repairProcessId = detail.repairProcessId || ""
  formData.scrapProcessId = detail.scrapProcessId || ""
  formData.remark = detail.remark || ""
  ensurePositionOptions(detail.exceptionHandlePositionList || [])
  ensurePositionOptions(detail.repairPositionList || [])
  formData.selectedExceptionHandleKeys = (detail.exceptionHandlePositionList || []).map((item) =>
    createPositionKey(item.depId, item.positionId)
  )
  formData.selectedRepairKeys = (detail.repairPositionList || []).map((item) =>
    createPositionKey(item.depId, item.positionId)
  )
}

const initDialog = async () => {
  loading.value = true
  try {
    resetState()
    await Promise.all([getDepartmentPositionOptions(), getFlowOptions()])
    if (props.mroTypeId) {
      const detail = await queryMroTypeDetail(props.mroTypeId)
      if (detail) {
        setDetailData(detail)
      }
    }
  } finally {
    loading.value = false
  }
}

const buildPositionSubmitParams = (selectedKeys: string[]) => {
  return selectedKeys
    .map((value) => {
      const [depId = "", positionId = ""] = String(value).split(":")
      if (!depId || !positionId) return null
      return { depId, positionId }
    })
    .filter(Boolean) as Array<{ depId: string; positionId: string }>
}

const submit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const repairProcessName = flowOptions.value.find(
      (item) => item.id === formData.repairProcessId
    )?.name
    const scrapProcessName = flowOptions.value.find(
      (item) => item.id === formData.scrapProcessId
    )?.name
    const payload = {
      mroTypeNo: formData.mroTypeNo || undefined,
      mroTypeName: formData.mroTypeName,
      verifyAdvanceDays: Number(formData.verifyAdvanceDays || 0),
      maintenanceAdvanceDays: Number(formData.maintenanceAdvanceDays || 0),
      repairProcessId: formData.repairProcessId || undefined,
      repairProcessName,
      scrapProcessId: formData.scrapProcessId || undefined,
      scrapProcessName,
      remark: formData.remark || undefined,
      exceptionHandlePositionList: buildPositionSubmitParams(formData.selectedExceptionHandleKeys),
      repairPositionList: buildPositionSubmitParams(formData.selectedRepairKeys)
    }

    if (props.mode === "create") {
      await requestCreateMroType(payload)
      ElMessage.success("新建成功")
    } else {
      await requestUpdateMroType({
        id: props.mroTypeId,
        ...payload
      })
      ElMessage.success("编辑成功")
    }

    emit("success")
  } finally {
    loading.value = false
  }
}

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      initDialog()
    } else {
      resetState()
    }
  }
)
</script>

<style scoped lang="scss">
.dialog-form {
  :deep(.el-form-item) {
    align-items: flex-start;
  }

  :deep(.el-form-item__label) {
    white-space: normal;
    line-height: 20px;
    height: auto;
    padding-top: 6px;
  }

  :deep(.el-input-number) {
    width: 100%;
  }
}
</style>
