<template>
  <CustomDialog v-model="visible" :title="dialogTitle" size="medium" :loading="loading">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px" class="dialog-form">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="MRO分类编号" prop="mroCategoryNo">
            <el-input
              v-model="formData.mroCategoryNo"
              placeholder="为空则自动生成"
              :disabled="isReadonly"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="MRO分类名称" prop="mroCategoryName">
            <el-input
              v-model="formData.mroCategoryName"
              placeholder="请输入MRO分类名称"
              :disabled="isReadonly"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="MRO类型" prop="mroTypeId">
            <el-select
              v-model="formData.mroTypeId"
              placeholder="请选择MRO类型"
              filterable
              clearable
              class="w-full"
              :disabled="isTypeDisabled"
            >
              <el-option
                v-for="item in mroTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="上级分类">
            <el-input :model-value="parentCategoryName" disabled />
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

import { queryMroClassifyDetail, queryMroClassifyTree, requestCreateMroClassify, requestUpdateMroClassify } from "@/api/operation/mro/mro-classify"
import { queryMroTypePageList } from "@/api/operation/mro/mro-type"
import CustomDialog from "@/components/CustomDialog/index.vue"
import type { IOption } from "@/types/common"
import type { IMroClassifyItem, IMroClassifyTreeItem } from "@/types/maintain/mro-manage/mro-classify"

defineOptions({
  name: "MroCategoryDialog"
})

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    mode: "create" | "edit" | "view"
    categoryId?: string
    parentCategoryId?: string
  }>(),
  {
    modelValue: false,
    mode: "create",
    categoryId: "",
    parentCategoryId: ""
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
const mroTypeOptions = ref<IOption[]>([])
const treeData = ref<IMroClassifyTreeItem[]>([])
const currentDetail = ref<IMroClassifyItem | null>(null)

const formData = reactive({
  mroCategoryNo: "",
  mroCategoryName: "",
  mroTypeId: "",
  parentId: "",
  remark: ""
})

const rules = reactive<FormRules<typeof formData>>({
  mroCategoryName: [
    {
      required: true,
      message: "请输入MRO分类名称",
      trigger: "blur"
    }
  ],
  mroTypeId: [
    {
      required: true,
      message: "请选择MRO类型",
      trigger: "change"
    }
  ]
})

const isReadonly = computed(() => props.mode === "view")
const dialogTitle = computed(() => {
  if (props.mode === "create") return "新建MRO分类"
  if (props.mode === "edit") return "编辑MRO分类"
  return "MRO分类详情"
})

const treeMap = computed(() => {
  const map = new Map<string, IMroClassifyTreeItem>()
  const walk = (nodes: IMroClassifyTreeItem[]) => {
    nodes.forEach((item) => {
      map.set(item.id, item)
      if (item.children?.length) {
        walk(item.children)
      }
    })
  }
  walk(treeData.value)
  return map
})

const currentHasChildren = computed(() => {
  if (!props.categoryId) return false
  return (treeMap.value.get(props.categoryId)?.children || []).length > 0
})

const selectedParent = computed(() => {
  return formData.parentId ? treeMap.value.get(formData.parentId) || null : null
})

const parentCategoryName = computed(() => {
  return selectedParent.value?.mroCategoryName || "为空表示顶级分类"
})

const isTypeDisabled = computed(() => {
  return isReadonly.value || !!selectedParent.value || currentHasChildren.value
})

const resetState = () => {
  currentDetail.value = null
  formData.mroCategoryNo = ""
  formData.mroCategoryName = ""
  formData.mroTypeId = ""
  formData.parentId = ""
  formData.remark = ""
  formRef.value?.resetFields()
  formRef.value?.clearValidate()
}

const initTypeOptions = async () => {
  const data = await queryMroTypePageList({
    pageQuery: {
      pageNum: 1,
      pageSize: 999
    },
    queryParam: {}
  })
  mroTypeOptions.value = data.records.map((item) => ({
    label: item.mroTypeName,
    value: item.id
  }))
}

const initTreeData = async () => {
  treeData.value = await queryMroClassifyTree()
}

const setFormByDetail = (detail: IMroClassifyItem) => {
  currentDetail.value = detail
  formData.mroCategoryNo = detail.mroCategoryNo || ""
  formData.mroCategoryName = detail.mroCategoryName || ""
  formData.mroTypeId = detail.mroTypeId || ""
  formData.parentId = detail.parentId && detail.parentId !== "0" ? detail.parentId : ""
  formData.remark = detail.remark || ""
}

const initCreateState = () => {
  const parentId = props.parentCategoryId || ""
  formData.parentId = parentId
  if (parentId) {
    const parent = treeMap.value.get(parentId)
    if (parent?.mroTypeId) {
      formData.mroTypeId = parent.mroTypeId
    }
  }
}

const initDialog = async () => {
  loading.value = true
  try {
    resetState()
    await Promise.all([initTypeOptions(), initTreeData()])

    if (props.categoryId) {
      const detail = await queryMroClassifyDetail(props.categoryId)
      if (detail) {
        setFormByDetail(detail)
      }
    } else {
      initCreateState()
    }
  } finally {
    loading.value = false
  }
}

watch(
  () => formData.parentId,
  (value) => {
    if (!value) return
    const parent = treeMap.value.get(value)
    if (parent?.mroTypeId) {
      formData.mroTypeId = parent.mroTypeId
    }
  }
)

const submit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const payload = {
      mroCategoryNo: formData.mroCategoryNo || undefined,
      mroCategoryName: formData.mroCategoryName.trim(),
      mroTypeId: formData.mroTypeId,
        parentId: formData.parentId || undefined,
        remark: formData.remark || undefined
      }

    if (props.mode === "create") {
      await requestCreateMroClassify(payload)
      ElMessage.success("新建成功")
    } else {
      await requestUpdateMroClassify({
        id: props.categoryId,
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
  :deep(.el-form-item__label) {
    white-space: normal;
    line-height: 20px;
    height: auto;
    padding-top: 6px;
  }
}
</style>
