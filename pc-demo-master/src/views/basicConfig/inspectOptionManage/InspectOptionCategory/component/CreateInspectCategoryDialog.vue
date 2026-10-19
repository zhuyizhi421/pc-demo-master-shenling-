<!-- 创建检查项类别弹窗 -->
<template>
  <CustomDialog v-model="dialogVisible" :title="dialogTitle">
    <CustomForm ref="customFormRef" v-model="formData" :configs="formConfigs"> </CustomForm>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button v-if="buttonAuthed" type="primary" @click="onSubmit">确认</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import {
  queryInspectOptionCategoryDetail,
  requestCreateInspectOptionCategory,
  requestUpdateInspectOptionCategory
} from "@/api/baseInfo/inspectOptionCategory"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import useButtonAuth from "@/hooks/useButtonAuth"

const buttonAuthed = useButtonAuth("InspectOptionCategory_update", "InspectOptionCategory_query")

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    id?: string
    parentId?: string
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void
  (e: "success"): void
}>()

const formData = reactive({
  categoryName: "",
  remark: ""
})

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = ref<ICustomFormConfigItem[]>([
  {
    componentType: "el-input",
    label: "检验项类别名称",
    field: "categoryName",
    rules: [
      {
        required: true,
        message: "请输入检验项类别名称",
        trigger: "blur"
      }
    ],
    props: {
      type: "text",
      placeholder: "请输入检验项类别名称",
      maxlength: 20
    }
  },
  {
    componentType: "el-input",
    label: "备注",
    field: "remark",
    colspan: -1,
    props: {
      type: "textarea",
      placeholder: "请输入备注",
      maxlength: 200,
      showWordLimit: true
    }
  }
])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
})
const dialogTitle = computed(() =>
  !props.id ? "检验项类别新建" : buttonAuthed.value ? "检验项类别编辑" : "检验项类别查看"
)

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      props.id && getInspectCategoryInfo()
    } else {
      customFormRef.value?.resetForm()
      formData.categoryName = ""
      formData.remark = ""
    }
  }
)

/**
 * 获取检验项类别信息
 */
const getInspectCategoryInfo = async () => {
  if (!props.id) {
    return
  }
  const data = await queryInspectOptionCategoryDetail(props.id)
  if (data) {
    formData.categoryName = data.categoryName
    formData.remark = data.remark
  }
}

/**
 * 提交操作
 */
const onSubmit = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) {
    return
  }

  if (props.id) {
    // 编辑
    let params = {
      ...formData,
      id: props.id
    }
    await requestUpdateInspectOptionCategory(params)
    ElMessage.success("编辑成功")
  } else {
    // 新建
    let params = {
      ...formData,
      parentId: props.parentId || ""
    }
    await requestCreateInspectOptionCategory(params)
    ElMessage.success("新建成功")
  }

  dialogVisible.value = false
  emit("success")
}
</script>

<style lang="scss" scoped></style>
