<template>
  <CustomDialog
    v-model="visible"
    :title="isEdit ? '客户信息' : '新建客户'"
    size="medium"
    @close="onCancel"
  >
    <CustomForm ref="customFormRef" v-model="formData" :configs="formConfigs" :columns="2">
      <template #isUncheck-labelSlots="{ label }">
        <div class="label-wrapper">
          <el-tooltip
            effect="dark"
            content="开启免检后，该供应商的所有来料都免检，直接进行入库"
            placement="top-start"
          >
            <el-icon><QuestionFilled /></el-icon>
          </el-tooltip>
          <span class="label-text">{{ label }}</span>
        </div>
      </template>
    </CustomForm>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onCancel()">取消</el-button>
        <el-button v-if="isAuth" type="primary" @click="onSubmitClick()"> 提交 </el-button>
      </span>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { getAddCustomer, getEditCustomer } from "@/api/customer"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import useButtonAuth from "@/hooks/useButtonAuth"
import useResetRef from "@/hooks/useResetRef"

const isAuth = useButtonAuth("CustomerInfo_update", "CustomerInfo_query")
const [formData, resetFormData] = useResetRef<any>({
  id: 0,
  customerAbbr: "",
  customerName: "",
  taxNo: "",
  contactName: "",
  phone: "",
  businessAddress: "",
  remarks: "",
  customerCode: ""
})

const emit = defineEmits<{
  (e: "success"): void
}>()

const visible = ref(false)
const isEdit = ref(false)
const customFormRef = ref<InstanceType<typeof CustomForm>>()
// 手机号验证
const checkPhone = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback()
    return
  }
  const reg = /^1[3456789]\d{9}$/
  if (reg.test(value)) {
    callback()
  } else {
    callback(new Error("请输入正确的手机号"))
  }
}

const formConfigs = ref<ICustomFormConfigItem[]>([
  {
    componentType: "el-input",
    label: "客户简称",
    field: "customerAbbr",
    props: {
      type: "text",
      placeholder: "请输入"
    },
    colspan: 1
  },
  {
    componentType: "el-input",
    label: "客户编号",
    field: "customerCode",
    props: {
      type: "text",
      placeholder: "不填则自动生成",
      get disabled() {
        return isEdit.value
      }
    },
    colspan: 1
  },
  {
    componentType: "el-input",
    label: "客户全称",
    field: "customerName",
    rules: [
      {
        required: true,
        message: "请输入客户全称",
        trigger: "blur"
      }
    ],
    props: {
      type: "text",
      placeholder: "请输入"
    },
    colspan: 1
  },
  {
    componentType: "el-input",
    label: "税号",
    field: "taxNo",
    props: {
      type: "text",
      placeholder: "请输入"
    },
    colspan: 1
  },

  {
    componentType: "el-input",
    label: "联系人",
    field: "contactName",
    props: {
      type: "text",
      placeholder: "请输入"
    },
    colspan: 1
  },
  {
    componentType: "el-input",
    label: "联系电话",
    field: "phone",
    rules: [
      {
        required: false,
        validator: checkPhone,
        trigger: "blur"
      }
    ],

    props: {
      type: "text",
      placeholder: "请输入",
      maxlength: 11
    },
    colspan: 1
  },

  {
    componentType: "el-input",
    label: "地址",
    field: "businessAddress",
    props: {
      type: "textarea",
      placeholder: "请输入",
      maxlength: 200,
      rows: 2,
      showWordLimit: true,
      clearable: true
    },
    colspan: 2
  },

  {
    componentType: "el-input",
    label: "备注",
    field: "remarks",
    props: {
      type: "textarea",
      placeholder: "请输入",
      maxlength: 200,
      rows: 2,
      showWordLimit: true,
      clearable: true
    },
    colspan: 2
  }
])

const setVisible = (value: boolean, editStatus: boolean, rowData?: any) => {
  visible.value = value
  isEdit.value = editStatus
  if (rowData) {
    formData.value = cloneDeep(rowData)
  }
}

/** 提交操作 */
const onSubmitClick = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return
  let params = {
    id: isEdit.value ? formData.value.id : "",
    customerAbbr: formData.value.customerAbbr,
    customerName: formData.value.customerName,
    taxNo: formData.value.taxNo,
    contactName: formData.value.contactName,
    phone: formData.value.phone,
    businessAddress: formData.value.businessAddress,
    remarks: formData.value.remarks,
    customerCode: formData.value.customerCode || undefined
  }
  let fn = isEdit.value ? getEditCustomer : getAddCustomer
  await fn(params)
  ElMessage.success(isEdit.value ? "编辑成功" : "新建成功")
  visible.value = false
  emit("success")
}

const onCancel = () => {
  // ruleFormRef.value?.resetFields()
  customFormRef.value?.resetForm()
  resetFormData()
  visible.value = false
}

defineExpose({
  setVisible
})
</script>

<style scoped>
.form-wrapper {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;

  .el-form-item {
    width: 50%;
  }
}

.el-input__wrapper .el-input__inner {
  width: 260px;
}
</style>
