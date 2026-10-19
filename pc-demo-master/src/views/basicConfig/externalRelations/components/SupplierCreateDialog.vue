<template>
  <CustomDialog v-model="visible" :title="formData.id ? '供应商信息' : '新建供应商'" size="medium">
    <CustomForm ref="customFormRef" class="custom-form" v-model="formData" :configs="formConfigs">
      <template #isUncheck-content="{ label }">
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

      <template #platPassword-default>
        <el-button type="primary" link @click="onResetPassword()" v-if="isAuth">重置</el-button>
        <el-button type="primary" link>
          <span @click="onCopyShareLink()">复制分享</span>
          <el-icon><Promotion /></el-icon>
        </el-button>
      </template>
    </CustomForm>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button v-if="isAuth" type="primary" @click="onSubmitClick()">保存</el-button>
      </span>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { useClipboard } from "@vueuse/core"
import { ElMessage, ElMessageBox } from "element-plus"

import {
  querySupplierDetail,
  requestCopyShareSupplier,
  requestCreateSupplier,
  requestResetSupplierPlatformPassword,
  requestUpdateSupplier
} from "@/api/supplier"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import useButtonAuth from "@/hooks/useButtonAuth"
import useResetRef from "@/hooks/useResetRef"
import type { ISupplierItem } from "@/types/base-info/supplier"

const { isSupported, copy } = useClipboard({ legacy: true })

const isAuth = useButtonAuth("SupplierInfo_update", "SupplierInfo_query")
const [formData, resetFormData] = useResetRef<{
  id: string
  supplierAbbr: string
  supplierCode: string
  supplierName: string
  taxNo: string
  contactName: string
  phone: string
  isUncheck: number
  supplierPlatformStatus: number
  supplierPlatformAccount: string
  businessAddress: string
  remarks: string
}>({
  id: "",
  supplierAbbr: "",
  supplierCode: "",
  supplierName: "",
  taxNo: "",
  contactName: "",
  phone: "",
  isUncheck: 0, // 是否免检
  supplierPlatformStatus: 0, // 是否开通供应商平台
  supplierPlatformAccount: "", // 供应商平台账号
  businessAddress: "",
  remarks: ""
})

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    id: string
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success"): void
}>()

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

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
})

const formConfigs = ref<ICustomFormConfigItem[]>([
  {
    componentType: "el-input",
    label: "供应商简称",
    field: "supplierAbbr",
    props: {
      placeholder: "请输入",
      get disabled() {
        return !isAuth.value
      }
    }
  },
  {
    componentType: "el-input",
    label: "供应商编号",
    field: "supplierCode",
    props: {
      placeholder: "不填则自动生成",
      get disabled() {
        return !!formData.value.id || !isAuth.value
      }
    }
  },
  {
    componentType: "el-input",
    label: "供应商名称",
    field: "supplierName",
    rules: [
      {
        required: true,
        message: "请输入供应商名称",
        trigger: "blur"
      }
    ],
    props: {
      placeholder: "请输入",
      get disabled() {
        return !isAuth.value
      }
    }
  },
  {
    componentType: "el-input",
    label: "税号",
    field: "taxNo",
    props: {
      placeholder: "请输入",
      get disabled() {
        return !isAuth.value
      }
    }
  },
  {
    componentType: "el-input",
    label: "联系人",
    field: "contactName",
    props: {
      placeholder: "请输入",
      get disabled() {
        return !isAuth.value
      }
    }
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
      placeholder: "请输入",
      oninput: "if(value.length>11)value=value.slice(0,11)",
      onkeyup: "this.value = this.value.replace(/[^\\d]/g,'');",
      get disabled() {
        return !isAuth.value
      }
    }
  },
  {
    componentType: "el-switch",
    label: "是否免检",
    field: "isUncheck",
    props: {
      "active-value": 1,
      "inactive-value": 0,
      "active-text": "是",
      "inactive-text": "否",
      "inline-prompt": true,
      get disabled() {
        return !isAuth.value
      }
    },
    get colspan() {
      return formData.value.supplierPlatformAccount ? -1 : 1
    },
    labelSlots: "isUncheck-content"
  },
  {
    componentType: "el-switch",
    label: "开通供应商平台",
    field: "supplierPlatformStatus",
    get hidden() {
      return !!formData.value.supplierPlatformAccount || !isAuth.value
    },
    props: {
      "active-value": 1,
      "inactive-value": 0,
      "active-text": "是",
      "inactive-text": "否",
      "inline-prompt": true
    }
  },
  {
    componentType: "el-input",
    label: "供应商平台账号",
    field: "supplierPlatformAccount",
    props: {
      disabled: true
    },
    get hidden() {
      return !formData.value.supplierPlatformAccount
    }
  },
  {
    componentType: "div",
    get label() {
      return isAuth.value ? "供应商平台密码" : ""
    },
    field: "",
    props: {
      get class() {
        return isAuth.value ? "plat-password" : "plat-share"
      }
    },
    slots: {
      default: "platPassword-default"
    },
    get hidden() {
      return !formData.value.supplierPlatformAccount
    }
  },
  {
    componentType: "el-input",
    label: "地址",
    field: "businessAddress",
    props: {
      type: "textarea",
      placeholder: "请输入",
      maxlength: 200,
      showWordLimit: true,
      get disabled() {
        return !isAuth.value
      }
    },
    colspan: -1
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
        return !isAuth.value
      }
    },
    colspan: -1
  }
])

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.id) {
        formData.value.id = props.id
        getSupplierDetail(formData.value.id)
      }
    } else {
      customFormRef.value?.resetForm()
      resetFormData()
    }
  }
)

/** 获取供应商详情 */
const getSupplierDetail = async (id: string) => {
  const data = await querySupplierDetail(id)
  for (let key in formData.value) {
    ;(formData.value as any)[key] = (data as any)[key]
  }
}

/** 提交操作 */
const onSubmitClick = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return

  let params = {
    supplierAbbr: formData.value.supplierAbbr,
    supplierName: formData.value.supplierName,
    taxNo: formData.value.taxNo,
    contactName: formData.value.contactName,
    phone: formData.value.phone,
    businessAddress: formData.value.businessAddress,
    supplierPlatformStatus: formData.value.supplierPlatformStatus,
    remarks: formData.value.remarks,
    supplierCode: formData.value.supplierCode || undefined,
    isUncheck: formData.value.isUncheck
  }
  let supplierInfo = {} as ISupplierItem
  if (formData.value.id) {
    await requestUpdateSupplier({
      id: formData.value.id,
      ...params
    })
  } else {
    supplierInfo = await requestCreateSupplier(params)
    formData.value.id = supplierInfo.id
  }
  ElMessage.success(formData.value.id ? "编辑成功" : "新建成功")
  emit("success")

  // 若开启供应商平台，则不关闭弹窗，直接刷新数据变为查看状态；否则关闭弹窗
  if (!formData.value.supplierPlatformStatus) {
    visible.value = false
    return
  }
  await getSupplierDetail(formData.value.id)
}

/** 重置密码 */
const onResetPassword = async () => {
  await ElMessageBox.confirm("确定将该供应商的密码重置为000000?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    closeOnPressEscape: false,
    autofocus: false,
    type: "warning"
  })

  await requestResetSupplierPlatformPassword(formData.value.id)
  ElMessage.success("密码重置成功")
}

/** 复制分享 */
const onCopyShareLink = async () => {
  const { supplierPlatformAddress, supplierPlatformAccount, supplierPlatformPassword } =
    await requestCopyShareSupplier(formData.value.id)
  if (!isSupported.value) {
    ElMessage.error("您的浏览器不支持复制")
    return
  }
  await copy(
    `供应商平台地址：${supplierPlatformAddress}\n登录账号：${supplierPlatformAccount}\n登录密码：${supplierPlatformPassword}`
  )
  ElMessage.success("已复制平台地址及该供应商的账号密码，可粘贴分享")
}
</script>

<style scoped>
.custom-form {
  &:deep(.plat-password) {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  &:deep(.plat-share) {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}

.label-wrapper {
  display: flex;
  align-items: center;

  .label-text {
    margin-left: 8px;
  }
}
</style>
