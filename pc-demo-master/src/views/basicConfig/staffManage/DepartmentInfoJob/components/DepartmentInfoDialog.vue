<template>
  <CustomDialog v-model="visible" :title="dialogTitle" size="medium" :loading="loading">
    <div class="dialog-body">
      <div class="section-title">基础信息</div>
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="96px" class="dialog-form">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="部门名称" prop="depName">
              <el-input
                v-model="formData.depName"
                placeholder="请输入部门名称"
                :disabled="isReadonly"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门编号" prop="depCode">
              <el-input
                v-model="formData.depCode"
                placeholder="不填则自动生成"
                :disabled="isReadonly"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上级部门">
              <el-input v-model="formData.parentName" disabled placeholder="" />
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

      <div class="section-title">部门职位配置</div>
      <div class="position-toolbar">
        <el-select
          v-model="pendingPositionIds"
          class="position-select"
          multiple
          collapse-tags
          collapse-tags-tooltip
          filterable
          placeholder="请选择职位"
          :disabled="isReadonly"
        >
          <el-option
            v-for="item in positionOptions"
            :key="item.id"
            :label="`${item.name}${item.code ? ` (${item.code})` : ''}`"
            :value="item.id"
          />
        </el-select>
        <el-button type="primary" @click="appendPositions()" :disabled="isReadonly">
          添加职位
        </el-button>
      </div>

      <el-table :data="selectedPositions" border class="position-table" empty-text="暂无已选职位">
        <el-table-column prop="name" label="职位名称" min-width="180" />
        <el-table-column prop="code" label="职位编号" min-width="180" />
        <el-table-column prop="remark" label="备注" min-width="180" />
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-button
              link
              type="danger"
              @click="removePosition(row.id)"
              :disabled="isReadonly"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button v-if="!isReadonly" type="primary" @click="submit">保存</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage, type FormInstance, type FormRules } from "element-plus"

import {
  queryDepartmentWorkItemDetail,
  requestCreateDepartmentWorkItem,
  requestUpdateDepartmentWorkItem
} from "@/api/departmentWorkItem"
import { queryPositionList } from "@/api/position"
import CustomDialog from "@/components/CustomDialog/index.vue"
import type { IPositionListItem } from "@/types/base-info/employee"

defineOptions({
  name: "DepartmentInfoDialog"
})

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    mode: "create" | "edit" | "view"
    departmentId?: string
    parentDepId?: string | null
    parentDepName?: string
  }>(),
  {
    modelValue: false,
    mode: "create",
    departmentId: "",
    parentDepId: null,
    parentDepName: ""
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

const isReadonly = computed(() => props.mode === "view")
const dialogTitle = computed(() => {
  if (props.mode === "create") return "新建部门"
  if (props.mode === "edit") return "编辑部门"
  return "部门详情"
})

const loading = ref(false)
const formRef = ref<FormInstance | null>(null)
const positionOptions = ref<IPositionListItem[]>([])
const pendingPositionIds = ref<string[]>([])
const selectedPositions = ref<IPositionListItem[]>([])
const formData = reactive({
  parentName: "",
  depName: "",
  depCode: "",
  remark: ""
})

const rules = reactive<FormRules<typeof formData>>({
  depName: [
    {
      required: true,
      message: "请输入部门名称",
      trigger: "blur"
    }
  ]
})

const resetState = () => {
  formData.parentName = ""
  formData.depName = ""
  formData.depCode = ""
  formData.remark = ""
  pendingPositionIds.value = []
  selectedPositions.value = []
  formRef.value?.resetFields()
  formRef.value?.clearValidate()
}

const ensurePositionOptions = async () => {
  if (positionOptions.value.length) return
  positionOptions.value = await queryPositionList()
}

const setDetailData = async () => {
  if (!props.departmentId) return

  const detail = await queryDepartmentWorkItemDetail({ id: props.departmentId })
  formData.parentName = detail?.parentName || ""
  formData.depName = detail?.depName || ""
  formData.depCode = detail?.depCode || ""
  formData.remark = detail?.remark || ""
  selectedPositions.value = Array.isArray(detail?.positionList) ? [...detail.positionList] : []
}

const initDialog = async () => {
  loading.value = true
  try {
    resetState()
    await ensurePositionOptions()
    if (props.mode === "create") {
      formData.parentName = props.parentDepId ? props.parentDepName || "" : ""
    } else {
      await setDetailData()
    }
  } finally {
    loading.value = false
  }
}

const appendPositions = () => {
  if (!pendingPositionIds.value.length) {
    ElMessage.warning("请先选择职位")
    return
  }

  const currentIds = new Set(selectedPositions.value.map((item) => item.id))
  const appendList = positionOptions.value.filter(
    (item) => pendingPositionIds.value.includes(item.id) && !currentIds.has(item.id)
  )

  if (!appendList.length) {
    ElMessage.warning("所选职位已全部存在")
    return
  }

  selectedPositions.value = [...selectedPositions.value, ...appendList]
  pendingPositionIds.value = []
}

const removePosition = (id: string) => {
  selectedPositions.value = selectedPositions.value.filter((item) => item.id !== id)
}

const submit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const params = {
      depName: formData.depName,
      depCode: formData.depCode || undefined,
      remark: formData.remark || undefined,
      positionIdList: selectedPositions.value.map((item) => item.id)
    }

    if (props.mode === "create") {
      await requestCreateDepartmentWorkItem({
        ...params,
        parentDepId: props.parentDepId || null
      })
      ElMessage.success("新建成功")
    } else {
      await requestUpdateDepartmentWorkItem({
        id: props.departmentId,
        ...params
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
.dialog-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dialog-form {
  margin-bottom: 4px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  line-height: 22px;
}

.position-toolbar {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.position-select {
  flex: 1;
}

.position-table {
  width: 100%;
}
</style>
