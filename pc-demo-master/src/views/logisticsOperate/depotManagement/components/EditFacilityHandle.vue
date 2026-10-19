<!-- 组件 编辑仓库 -->
<template>
  <CustomDialog
    v-model="visible"
    title="仓库信息"
    size="mini"
    align-center
    @close="resetFormContent"
  >
    <CustomForm ref="ruleFormRef" :configs="formConfig" v-model="form" :label-width="120">
      <template #barcode>
        <el-input
          v-model="form.barcode"
          placeholder=""
          :disabled="isBindBarcode || form.autoGenerateCode"
        />
        <el-checkbox
          v-if="!isBindBarcode"
          v-model="form.autoGenerateCode"
          label="自动生成"
          style="margin-left: 10px"
          @change="onAutoGenerateCodeChange($event)"
        />
      </template>
    </CustomForm>
    <template #footer>
      <el-button @click="resetForm()">取消</el-button>
      <el-button type="primary" @click="submitForm()"> 保存 </el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { requestUpdateWarehouse } from "@/api/logistics/warehouse"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import { EnumWarehouseTypeMap } from "@/constant/enums"
import useResetRef from "@/hooks/useResetRef"

const emits = defineEmits<{
  (e: "onOk"): void
}>()

const visible = ref(false)
const isAvaviblePost = ref(false)
const ruleFormRef = ref<InstanceType<typeof CustomForm>>()
const outboundRuleValue = ref([
  {
    label: "无",
    value: 0
  },
  {
    label: "建议先进先出",
    value: 1
  },
  {
    label: "建议后进先出",
    value: 2
  },
  {
    label: "强制先进先出",
    value: 3
  },
  {
    label: "强制后进先出",
    value: 4
  }
])

const isBindBarcode = ref(false) // 是否绑定标签码

const [form, resetFormContent] = useResetRef<any>({
  facilityName: "",
  facilityCode: "",
  autoGenerateCode: false,
  barcode: "",
  parentEntityName: "",
  warehouseType: "",
  locationNum: "",
  isEnable: "",
  outboundRule: "",
  id: ""
})

const formConfig = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-input",
    label: "仓库名称",
    field: "facilityName"
  },
  {
    componentType: "el-input",
    label: "仓库编号",
    field: "facilityCode",
    props: {
      disabled: true
    }
  },
  {
    componentType: "div",
    label: "仓库标签码",
    props: {
      class: "flex"
    },
    slots: {
      default: "barcode"
    }
  },
  {
    componentType: "el-input",
    label: "所属区域",
    field: "parentEntityName",
    props: {
      disabled: true
    }
  },
  {
    componentType: "el-select",
    label: "仓库类型",
    field: "warehouseType",
    props: {
      disabled: true,
      customChildren: Object.entries(EnumWarehouseTypeMap).map(([key, value]) => ({
        componentType: "el-option",
        props: {
          label: value,
          value: +key
        }
      }))
    }
  },
  {
    componentType: "el-input",
    label: "库位数量",
    field: "locationNum",
    props: {
      disabled: true
    }
  },
  {
    componentType: "el-select",
    label: "状态",
    field: "isEnable",
    props: {
      disabled: true,
      clearable: true,
      customChildren: [
        {
          componentType: "el-option",
          props: {
            label: "启用",
            value: true
          }
        },
        {
          componentType: "el-option",
          props: {
            label: "停用",
            value: false
          }
        }
      ]
    }
  },
  {
    componentType: "el-select",
    label: "出库规则",
    field: "outboundRule",
    props: {
      customChildren: outboundRuleValue.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.label,
          value: item.value
        }
      }))
    }
  }
])

const setVisible = (value: boolean, rowData?: any) => {
  try {
    visible.value = value
    isAvaviblePost.value = false
    form.value = cloneDeep(rowData)
    form.value.autoGenerateCode = rowData.autoGenerateCode || false
    isBindBarcode.value = !!rowData.barcode
  } catch (error) {
    console.log(error, "error")
  }
}

/** 切换自动生成标签码操作 */
const onAutoGenerateCodeChange = (checked: boolean) => {
  if (checked) {
    form.value.barcode = ""
  }
}

const submitEditLogwarehouse = async () => {
  await requestUpdateWarehouse(
    {
      id: form.value.id
    },
    {
      barcode: form.value.barcode,
      autoGenerateCode: form.value.autoGenerateCode,
      facilityName: form.value.facilityName,
      outboundRule: +form.value.outboundRule
    }
  )
  visible.value = false
  isAvaviblePost.value = true
  ElMessage.success("编辑成功")
  emits("onOk")
}

const submitForm = () => {
  submitEditLogwarehouse()
}

const resetForm = () => {
  ruleFormRef.value?.resetForm()
  resetFormContent()
  visible.value = false
}

defineExpose({
  setVisible,
  isAvaviblePost
})
</script>

<style scoped lang="scss">
.formClass {
  .el-form-item__content {
    .el-input {
      width: 100%;
    }
  }
}

.barcode-item {
  &:deep(.el-form-item__content) {
    display: flex;

    .el-input {
      flex: 1;
    }
  }
}
</style>
