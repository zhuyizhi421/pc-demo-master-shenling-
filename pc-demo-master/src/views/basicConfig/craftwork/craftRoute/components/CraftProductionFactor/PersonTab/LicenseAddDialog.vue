<template>
  <CustomDialog v-model="dialogVisible" title="新增上岗证" size="mini" @close="emit('close')">
    <CustomForm ref="customFormRef" v-model="formData" :label-width="100" :configs="formConfigs">
    </CustomForm>

    <template #footer>
      <el-button @click="emit('close')">取消</el-button>
      <el-button type="primary" @click="onConfirmClick()">确定</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import SelectLicense from "@/components/SelectLicense/index.vue"

const emit = defineEmits<{
  (e: "close"): void
  (e: "success", data: any[]): void
}>()

const dialogVisible = ref(true)

const formData = reactive<{
  licenseList: string[]
  originData: any[]
}>({
  licenseList: [],
  originData: []
})
const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: markRaw(SelectLicense),
    label: "选择上岗证",
    field: "licenseList",
    rules: [
      {
        required: true,
        message: "请选择上岗证",
        trigger: "change"
      }
    ],
    props: {
      multiple: true,
      emitPath: false,
      get originData() {
        return formData.originData
      }
    },
    events: {
      "update:originData": (data: any[]) => {
        formData.originData = data
      }
    }
  }
])

/** 确定操作 */
const onConfirmClick = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return

  emit("close")
  emit("success", formData.originData)
}
</script>

<style lang="scss" scoped></style>
