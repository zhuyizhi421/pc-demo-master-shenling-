<template>
  <CustomDialog v-model="visible" title="申请上岗证" @close="closeFunc">
    <el-alert
      class="alert"
      title="若员工已拥有该上岗证，则不会重复下发"
      type="info"
      show-icon
      :closable="false"
    />
    <CustomForm ref="customFormRef" v-model="formData" :configs="formConfigs"></CustomForm>

    <!-- 选择人员组件 -->
    <SelectPersonDialog
      v-model="selectPersonVisible"
      :type="EnumSelectUser.Staff"
      :selected-ids="formData.empIds"
      multiple
      @success="onSelectPersonSuccess"
    />

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="resetForm()">取消</el-button>
        <el-button type="primary" @click="submitForm()">确定</el-button>
      </span>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { queryLicenseApply } from "@/api/license"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import SelectLicense from "@/components/SelectLicense/index.vue"
import SelectPersonDialog from "@/components/SelectPersonDialog/index.vue"
import type { ITree } from "@/components/SelectPersonDialog/type"
import { EnumSelectUser } from "@/constant/enums"
import useResetRef from "@/hooks/useResetRef"
import type { IOption } from "@/types/common"

const [formData, resetFormData] = useResetRef<any>({
  applyType: "申请上岗证",
  empIds: [],
  licenseIds: []
})

const selectPersonVisible = ref(false)
const selectedPersonList = ref<IOption[]>([])

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = computed(() => [
  {
    componentType: "el-input",
    label: "申请类型",
    field: "applyType",
    props: {
      type: "text",
      placeholder: "请输入申请类型",
      disabled: true
    }
  },
  {
    componentType: "el-select",
    label: "选择申请人",
    field: "empIds",
    rules: [
      {
        required: true,
        message: "请选择申请人",
        trigger: "change"
      }
    ],
    props: {
      placeholder: "请选择",
      multiple: true,
      collapseTags: true,
      collapseTagsTooltip: true,
      customChildren: selectedPersonList.value.map((item) => {
        return {
          componentType: "el-option",
          props: { label: item.label, value: item.value }
        }
      })
    },
    events: {
      visibleChange: (val: boolean) => {
        if (val) {
          selectPersonVisible.value = true
        }
      }
    }
  },
  {
    componentType: markRaw(SelectLicense),
    label: "选择上岗证",
    field: "licenseIds",
    rules: [
      {
        required: true,
        message: "请选择上岗证",
        trigger: "change"
      }
    ],
    props: {
      style: "width: 100%",
      multiple: true
    }
  }
])

const emits = defineEmits<{
  (e: "success"): void
}>()

const visible = ref(false)

const setVisible = (value: boolean) => {
  visible.value = value
}

/** 选择处理对象成功回调 */
const onSelectPersonSuccess = (data: ITree[]) => {
  selectedPersonList.value = data.map((item) => ({
    label: item.label,
    value: item.id
  }))
  formData.value.empIds = data.map((item) => item.id)
}

const submitForm = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return
  await queryLicenseApply({
    empIds: formData.value.empIds,
    licenseIds: formData.value.licenseIds.map((item: any) => item[item.length - 1]),
    applyType: 1
  })
  ElMessage.success("申请成功")
  emits("success")
  visible.value = false
}

const resetForm = () => {
  customFormRef.value?.resetForm()
  resetFormData()
  visible.value = false
}

function closeFunc() {
  resetFormData()
}

defineExpose({
  setVisible
})
</script>

<style scoped lang="scss">
.alert {
  background-color: #ecf5ff;
  border-color: #c6e2ff;
  color: #409eff;
  margin-bottom: 15px;

  &:deep(.el-alert__title) {
    color: #606266;
  }
}
</style>
