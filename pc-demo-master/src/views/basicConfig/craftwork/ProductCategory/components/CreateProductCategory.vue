<template>
  <!-- 新增、编辑、查看产品类别弹窗 -->
  <CustomDialog
    :title="`${!isAuth ? '查看' : handleForm.id ? '编辑' : '新建'}产品类别1`"
    v-model="dialogVisible"
    @close="onClose()"
    size="default"
  >
    <CustomForm ref="customFormRef" v-model="handleForm" :configs="formConfigs"> </CustomForm>

    <template #footer>
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" v-if="isAuth" @click="onConfirmClick()">确 定</el-button>
    </template>
  </CustomDialog>
</template>

<script lang="ts" setup>
import { ElMessage } from "element-plus"

import { createProductCate, type ProductCategoryTreeRes, updateProductCate } from "@/api/product"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import useResetRef from "@/hooks/useResetRef"

interface IFormData {
  name: string
  code: string
  parentCode: string
  parentName: string
  remark: string
  id: string
}

const props = defineProps<{
  modelValue: boolean
  rootId: string
  defaultFormData: IFormData
  currentCateInfo?: ProductCategoryTreeRes
  isAuth: boolean
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success"): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
})

const [handleForm, resetHandleForm] = useResetRef<IFormData>({
  name: "",
  code: "",
  parentCode: "",
  parentName: "",
  remark: "",
  id: ""
})

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = ref<ICustomFormConfigItem[]>([
  {
    componentType: "el-input",
    label: "产品类别名称",
    field: "name",
    rules: [
      {
        required: true,
        message: "请输入产品类别名称",
        trigger: "blur"
      }
    ],
    props: {
      type: "text",
      placeholder: "请输入产品类别名称",
      get disabled() {
        return !props.isAuth
      }
    }
  },
  {
    componentType: "el-input",
    label: "产品类别编号",
    field: "code",
    props: {
      type: "text",
      placeholder: "不填则自动生成",
      get disabled() {
        return !props.isAuth || !!handleForm.value.id
      }
    }
  },
  {
    componentType: "el-input",
    label: "上级类别名称",
    field: "parentName",
    get hidden() {
      return !handleForm.value.parentName
    },
    props: {
      type: "text",
      placeholder: "请输入上级类别名称",
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "上级类别编号",
    field: "parentCode",
    get hidden() {
      return !handleForm.value.parentCode
    },
    props: {
      type: "text",
      placeholder: "请输入上级类别编号",
      disabled: true
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
      showWordLimit: true,
      get disabled() {
        return !props.isAuth
      }
    }
  }
])



watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      handleForm.value = props.defaultFormData
    } else {
      resetHandleForm()
      customFormRef.value?.resetForm()
    }
  }
)

/** 弹窗关闭回调 */
const onClose = () => {
  emit("update:modelValue", false)
}

/** 新建、编辑弹窗确认按钮回调 */
const onConfirmClick = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) {
    console.log("表单验证失败")
    return
  }

  const parentId = props.currentCateInfo?.id === props.rootId ? "" : props.currentCateInfo?.id || ""
  console.log("准备创建分类:", {
    name: handleForm.value.name,
    parentId: parentId,
    remark: handleForm.value.remark,
    code: handleForm.value.code,
    currentCateInfo: props.currentCateInfo,
    rootId: props.rootId
  })

  if (!handleForm.value.id) {
    try {
      const result = await createProductCate({
        name: handleForm.value.name,
        parentId: parentId,
        remark: handleForm.value.remark,
        code: handleForm.value.code
      })
      console.log("创建结果:", result)
      ElMessage.success("新建成功")
    } catch (error) {
      console.error("创建失败:", error)
      ElMessage.error("创建失败")
    }
  } else {
    try {
      await updateProductCate({
        id: handleForm.value.id,
        name: handleForm.value.name,
        parentId: props.currentCateInfo?.id === props.rootId ? "" : props.currentCateInfo?.id || "",
        remark: handleForm.value.remark
      })
      ElMessage.success("编辑成功")
    } catch (error) {
      console.error("编辑失败:", error)
      ElMessage.error("编辑失败")
    }
  }

  resetHandleForm()
  emit("update:modelValue", false)
  emit("success")
}

defineOptions({
  name: "CreateProductCategory"
})
</script>

<style lang="scss" scoped></style>
