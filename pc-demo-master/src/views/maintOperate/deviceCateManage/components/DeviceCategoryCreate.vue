<template>
  <CustomDialog v-model="visible" :title="dialogTitle" :loading="loading">
    <CustomForm
      ref="formRef"
      v-model="formData"
      :configs="createDevCateFormConfigs"
      :label-width="110"
    >
    </CustomForm>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button v-if="!props.justSee" type="primary" @click="onSubmit()">确定</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import {
  queryDeviceModelDetail,
  requestCreateDeviceCategory,
  requestUpdateDeviceCategory
} from "@/api/operation/equipment/equipment-category"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import useResetRef from "@/hooks/useResetRef"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    id: string
    isUpdate: boolean
    justSee?: boolean
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success"): void
}>()

const [formData, resetFormData] = useResetRef({
  categoryName: "",
  categoryNo: "",
  remarks: ""
})

const loading = ref(false)
const formRef = ref<InstanceType<typeof CustomForm>>()

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
})

const dialogTitle = computed(() => {
  if (props.justSee) return "查看设备分类"
  return props.isUpdate ? "编辑设备分类" : "新建设备分类"
})

const createDevCateFormConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-input",
    label: "设备分类名称",
    field: "categoryName",
    rules: [
      {
        required: true,
        message: "请输入设备分类名称",
        trigger: "blur"
      }
    ],
    props: {
      placeholder: "请输入",
      get disabled() {
        return !!props.justSee
      }
    }
  },
  {
    componentType: "el-input",
    label: "设备分类编号",
    field: "categoryNo",
    props: {
      placeholder: "不填则自动生成",
      get disabled() {
        return props.isUpdate || !!props.justSee
      }
    }
  },
  {
    componentType: "el-input",
    label: "备注",
    field: "remarks",
    props: {
      type: "textarea",
      placeholder: "请输入",
      maxlength: 200,
      showWordLimit: true,
      get disabled() {
        return !!props.justSee
      }
    }
  }
])

watch(
  () => props.modelValue,
  async (val) => {
    if (!val) {
      formRef.value?.resetForm()
      resetFormData()
    } else if (props.isUpdate || props.justSee) {
      loading.value = true
      await getDeviceCategoryDetail(props.id)
      loading.value = false
    }
  }
)

const getDeviceCategoryDetail = async (id: string) => {
  const res = await queryDeviceModelDetail(id)
  formData.value = {
    categoryName: res.categoryName,
    categoryNo: res.categoryNo,
    remarks: res.remarks
  }
}

const onSubmit = async () => {
  const valid = await formRef.value?.validateForm()
  if (!valid) return

  if (props.isUpdate) {
    await requestUpdateDeviceCategory({
      categoryName: formData.value.categoryName,
      id: props.id,
      remarks: formData.value.remarks
    })
  } else {
    await requestCreateDeviceCategory({
      categoryName: formData.value.categoryName,
      categoryNo: formData.value.categoryNo,
      parentId: props.id,
      remarks: formData.value.remarks
    })
  }
  ElMessage.success(props.isUpdate ? "编辑成功" : "新建成功")
  visible.value = false
  emit("success")
}
</script>

<style lang="scss" scoped></style>
