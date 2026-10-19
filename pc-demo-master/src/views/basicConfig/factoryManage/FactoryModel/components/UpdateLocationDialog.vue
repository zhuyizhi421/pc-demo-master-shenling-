<template>
  <!--  新建/更新有 库位权限 的区域时 -->
  <CustomDialog v-model="dialogVisible" :title="`${typeMap[type]}${tagName}`" size="mini">
    <CustomForm
      ref="customFormRef"
      v-model="formData"
      :label-width="formLabelWidth"
      :configs="formConfigs"
    >
      <template #barcode-default>
        <el-input
          v-model="formData.barcode"
          :disabled="formData.autoGenerateCode || (!isCreate && hasBarcode)"
          placeholder="请输入"
          maxlength="50"
          clearable
        />
        <el-checkbox
          v-model="formData.autoGenerateCode"
          v-if="isCreate || (!isCreate && !hasBarcode)"
          @change="formData.barcode = ''"
          class="ml-[6px]"
          label="自动生成"
        />
      </template>
    </CustomForm>

    <template #footer>
      <div>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" v-if="!isReview && !isReadonly" @click="onConfirmClick()"
          >保存</el-button
        >
      </div>
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

const typeMap = {
  [EnumOperationType.Create]: "新建",
  [EnumOperationType.Update]: "编辑",
  [EnumOperationType.Review]: "查看"
}

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success"): void
}>()

const hasBarcode = ref(false) // 编辑时原数据是否有库位标签码

const formData = reactive({
  entityName: "",
  entityCode: "",
  barcode: "",
  autoGenerateCode: false
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
    componentType: "div",
    get label() {
      return `${props.tagName}标签码`
    },
    field: "barcode",
    props: {
      class: "flex items-center"
    },
    slots: {
      default: "barcode-default"
    }
  }
])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
})

const formLabelWidth = computed(() => {
  const width = Number(
    getDynamicFormLabelWidth(props.tagName, { placeholderLength: 3 }).split("px")[0]
  )
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
        formData.barcode = res.barcode
        hasBarcode.value = !!res.barcode
        formData.autoGenerateCode = false
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
      autoGenerateCode: formData.autoGenerateCode,
      barCode: formData.barcode,
      modelId: props.currentChildType?.id
    })
    ElMessage.success("新建成功")
  } else {
    await requestUpdateFactoryModel({
      id: props.id,
      entityName: formData.entityName,
      autoGenerateCode: hasBarcode.value ? undefined : formData.autoGenerateCode,
      barCode: hasBarcode.value ? undefined : formData.barcode
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
