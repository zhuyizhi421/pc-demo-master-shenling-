<template>
  <CustomDialog
    v-model="visible"
    :title="!isEdit ? '新建职位' : '编辑查看'"
    @close="closeResetForm"
  >
    <CustomForm ref="customFormRef" v-model="formData" :configs="formConfigs"></CustomForm>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onResetClick()">取消</el-button>
        <el-button type="primary" @click="onSubmitClick()">保存</el-button>
      </span>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { requestCreatePosition, requestUpdatePosition } from "@/api/position"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import type { IPositionListItem, IPositionUpdateParams } from "@/types/base-info/employee"

const emit = defineEmits<{
  (e: "submit"): void
}>()

const visible = ref(false)
const isEdit = ref(false)
const id = ref("")

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = ref<ICustomFormConfigItem[]>([
  {
    componentType: "el-input",
    label: "职位名称",
    field: "name",
    rules: [
      { required: true, message: "请输入职位名称", trigger: "blur" },
      { min: 2, max: 10, message: "长度在2-10 之间", trigger: "blur" }
    ],
    props: {
      type: "text",
      placeholder: "请输入职位名称"
    }
  },
  {
    componentType: "el-input",
    label: "职位编号",
    field: "code",
    props: {
      type: "text",
      placeholder: "不填则自动生成",
      get disabled() {
        return isEdit.value
      }
    }
  },
  {
    componentType: "el-input",
    label: "备注",
    field: "remark",
    props: {
      type: "textarea",
      placeholder: "请输入备注",
      maxlength: 200,
      showWordLimit: true
    }
  }
])

const setVisible = (value: boolean, isEditVal: boolean, rowData?: IPositionListItem) => {
  visible.value = value
  isEdit.value = isEditVal
  if (rowData) {
    formData.name = rowData.name
    formData.code = rowData.code
    formData.remark = rowData.remark
    id.value = rowData.id
  }
}

const formData: IPositionUpdateParams = reactive({
  name: "",
  code: "",
  id: "",
  remark: ""
})

const onSubmitClick = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return
  if (!isEdit.value) {
    // 新建
    await requestCreatePosition({
      name: formData.name,
      remark: formData.remark,
      code: formData.code || undefined
    })
    ElMessage.success("新建成功")
    closeResetForm()
    visible.value = false
    emit("submit")
  } else {
    await requestUpdatePosition({
      id: id.value,
      name: formData.name,
      remark: formData.remark,
      code: formData.code
    })
    ElMessage.success("编辑成功")
    closeResetForm()
    visible.value = false
    emit("submit")
  }
}

const onResetClick = () => {
  customFormRef.value?.resetForm()
  visible.value = false
}

const closeResetForm = () => {
  formData.name = ""
  formData.remark = ""
  formData.code = ""
  formData.id = ""
}

defineExpose({
  setVisible
})
</script>

<style scoped lang="scss"></style>
