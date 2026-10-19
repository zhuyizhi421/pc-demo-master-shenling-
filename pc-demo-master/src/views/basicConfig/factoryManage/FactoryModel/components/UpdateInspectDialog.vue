<template>
  <!--  新建/更新有 检验 权限的区域时 -->
  <CustomDialog v-model="dialogVisible" :title="`${typeMap[type]}${tagName}`" size="mini">
    <CustomForm
      ref="customFormRef"
      v-model="formData"
      :label-width="formLabelWidth"
      :configs="formConfigs"
    >
    </CustomForm>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" v-if="!isReview && !isReadonly" @click="onConfirmClick()"
        >保存</el-button
      >
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import {
  queryFactoryModelDetail,
  requestCreateFactoryModel,
  requestUpdateFactoryModel
} from "@/api/fm"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import { EnumOperationType } from "@/constant/enums"
import type { IFactoryUnderClasses } from "@/types/base-info/factory-model"
import { getDynamicFormLabelWidth } from "@/utils"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    parentId: string
    tagName: string
    currentChildType?: IFactoryUnderClasses
    id: string
    type: EnumOperationType
    isReadonly?: boolean
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success"): void
}>()

/** 检验单位类型选项 */
const inspectionTypeList = [
  {
    id: 1,
    label: "实验室"
  },
  {
    id: 2,
    label: "检验站"
  }
]

const typeMap = {
  [EnumOperationType.Create]: "新建",
  [EnumOperationType.Update]: "编辑",
  [EnumOperationType.Review]: "查看"
}

const formData = reactive({
  entityName: "",
  entityCode: "",
  inspectionType: "" as unknown as number
})

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = ref<ICustomFormConfigItem[]>([
  {
    componentType: "el-input",
    get label() {
      return `${props.tagName}名称`
    },
    field: "entityName",
    rules: [
      {
        required: true,
        get message() {
          return `请输入${props.tagName}名称`
        },
        trigger: "blur"
      }
    ],
    props: {
      type: "text",
      placeholder: "请输入",
      maxlength: 50,
      get disabled() {
        return props.isReadonly
      }
    }
  },
  {
    componentType: "el-input",
    get label() {
      return `${props.tagName}编号`
    },
    field: "entityCode",
    props: {
      type: "text",
      placeholder: "不填则自动生成",
      maxlength: 50,
      get disabled() {
        return !isCreate.value
      }
    }
  },
  {
    componentType: "el-select",
    get label() {
      return `${props.tagName}类型`
    },
    field: "inspectionType",
    rules: [
      {
        required: true,
        get message() {
          return `请选择${props.tagName}类型`
        },
        trigger: "blur"
      }
    ],
    props: {
      placeholder: "请选择",
      filterable: true,
      get disabled() {
        return props.isReadonly
      },
      get customChildren() {
        return inspectionTypeList.map((item) => {
          return {
            componentType: "el-option",
            props: { label: item.label, value: item.id }
          }
        })
      }
    }
  }
])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
})

const formLabelWidth = computed(() => {
  const width = Number(getDynamicFormLabelWidth(props.tagName).split("px")[0])
  return width
})

const isCreate = computed(() => props.type === EnumOperationType.Create)
const isReview = computed(() => props.type === EnumOperationType.Review)

watch(
  () => props.modelValue,
  async (val) => {
    if (!val) {
      customFormRef.value?.resetForm()
      formData.entityName = ""
      formData.entityCode = ""
    } else {
      if (!isCreate.value) {
        const res = await queryFactoryModelDetail(props.id)
        formData.entityName = res.entityName
        formData.entityCode = res.entityCode
        formData.inspectionType = res.inspectionType
      }
    }
  }
)

/** 确认操作 */
const onConfirmClick = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return

  if (isCreate.value) {
    await requestCreateFactoryModel({
      parentId: props.parentId,
      entityName: formData.entityName,
      entityCode: formData.entityCode,
      modelId: props.currentChildType?.id,
      inspectionType: formData.inspectionType
    })
    ElMessage.success("新建成功")
  } else {
    await requestUpdateFactoryModel({
      id: props.id,
      entityName: formData.entityName,
      inspectionType: formData.inspectionType
    })
    ElMessage.success("编辑成功")
  }

  dialogVisible.value = false
  emit("success")
}

defineOptions({
  name: "UpdateStorageDialog"
})
</script>

<style lang="scss" scoped>
.barcode-item {
  &:deep(.el-form-item__content) {
    display: flex;

    .el-input {
      flex: 1;
    }
  }
}
</style>
