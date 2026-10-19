<template>
  <CustomDialog v-model="dialogVisible" :title="dialogTitle">
    <CustomForm ref="customFormRef" v-model="formData" :configs="formConfigs">
      <template #standardMax-default>
        <el-select class="mr-[4px] w-[100px]" v-model="formData.standardMaxInclusive">
          <el-option label="≤" :value="1" />
          <el-option label="<" :value="0" />
        </el-select>
        <el-input type="number" v-model="formData.standardMax" @mousewheel.prevent clearable />
      </template>

      <template #standardMin-default>
        <el-select class="mr-[4px] w-[100px]" v-model="formData.standardMinInclusive">
          <el-option label="≥" :value="1" />
          <el-option label=">" :value="0" />
        </el-select>
        <el-input type="number" v-model="formData.standardMin" @mousewheel.prevent clearable />
      </template>
    </CustomForm>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button v-if="buttonAuthed" type="primary" @click="onSubmit">确认</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { queryInspectOptionCategoryListAll } from "@/api/baseInfo/inspectOptionCategory"
import {
  queryInspectOptionTemplateDetail,
  requestCreateInspectOptionTemplate,
  requestUpdateInspectOptionTemplate
} from "@/api/baseInfo/inspectOptionTemplate"
import { getUnit } from "@/api/units"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import UploadImage from "@/components/UploadImage/index.vue"
import useButtonAuth from "@/hooks/useButtonAuth"
import useResetRef from "@/hooks/useResetRef"
import type { IUploadPhoto } from "@/types/base-info/global-config"
import { isNumberStandardValid } from "@/utils"
import { formatImgUrlPreview, isEffectiveValue } from "@/utils/common"

enum EnumStandardType {
  Number = 1,
  Text = 2
}

const buttonAuthed = useButtonAuth("InspectOptionTemplate_update", "InspectOptionTemplate_query")

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    id: string
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void
  (e: "success"): void
}>()

const [formData, resetFormData] = useResetRef<{
  inspectItemName: string
  categoryId: string
  methodDesc: string
  standardType: EnumStandardType
  standardDesc: string
  standardMaxInclusive: number
  standardMax: number
  standardMinInclusive: number
  standardMin: number
  unitId: string
  imageList: IUploadPhoto[]
}>({
  inspectItemName: "",
  categoryId: "",
  methodDesc: "",
  standardType: EnumStandardType.Number,
  standardDesc: "",
  standardMaxInclusive: 0,
  standardMax: 0,
  standardMinInclusive: 1,
  standardMin: 0,
  unitId: "",
  imageList: []
})

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-input",
    label: "检验项名称",
    field: "inspectItemName",
    rules: [
      {
        required: true,
        message: "请输入检验项名称",
        trigger: "blur"
      }
    ],
    props: {
      type: "text",
      placeholder: "请输入检验项名称",
      maxlength: 20
    }
  },
  {
    componentType: "el-select",
    label: "检验项类别",
    field: "categoryId",
    rules: [
      {
        required: true,
        message: "请选择检验项类别",
        trigger: "change"
      }
    ],
    props: {
      placeholder: "请选择检验项类别",
      filterable: true,
      get customChildren() {
        return inspectCategoryOptions.value.map((item) => {
          return {
            componentType: "el-option",
            props: { label: item.label, value: item.value }
          }
        })
      }
    }
  },
  {
    componentType: "el-input",
    label: "方法要求",
    field: "methodDesc",
    props: {
      type: "textarea",
      placeholder: "请输入方法要求",
      maxlength: 200,
      showWordLimit: true
    }
  },
  {
    componentType: "el-select",
    label: "检验标准类型",
    field: "standardType",
    props: {
      placeholder: "请选择检验标准类型",
      customChildren: [
        {
          componentType: "el-option",
          props: { label: "数值", value: EnumStandardType.Number }
        },
        {
          componentType: "el-option",
          props: { label: "文本", value: EnumStandardType.Text }
        }
      ]
    }
  },
  {
    componentType: "el-input",
    label: "检验标准",
    field: "standardDesc",
    rules: [
      {
        required: true,
        message: "请输入检验标准",
        trigger: "blur"
      }
    ],
    get hidden() {
      return !(formData.value.standardType === EnumStandardType.Text)
    },
    props: {
      placeholder: "请输入检验标准"
    }
  },
  {
    componentType: "div",
    label: "数值上限",
    field: "standardMax",
    get hidden() {
      return !(formData.value.standardType === EnumStandardType.Number)
    },
    props: {
      class: "flex w-[100%]"
    },
    slots: {
      default: "standardMax-default"
    }
  },
  {
    componentType: "div",
    label: "数值下限",
    field: "standardMin",
    get hidden() {
      return !(formData.value.standardType === EnumStandardType.Number)
    },
    props: {
      class: "flex w-[100%]"
    },
    slots: {
      default: "standardMin-default"
    }
  },
  {
    componentType: "el-select",
    label: "单位",
    field: "unitId",
    props: {
      placeholder: "请选择单位",
      filterable: true,
      get customChildren() {
        return unitOptions.value.map((item) => {
          return {
            componentType: "el-option",
            props: { label: item.label, value: item.value }
          }
        })
      }
    }
  },
  {
    componentType: markRaw(UploadImage),
    label: "图片说明",
    field: "imageList",
    props: {
      limit: 5,
      multiple: true
    }
  }
])

const inspectCategoryOptions = ref<{ label: string; value: string }[]>([])
const unitOptions = ref<{ label: string; value: string }[]>([])
const uploadImgRef = ref()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
})

const dialogTitle = computed(() =>
  !props.id ? "新建检验项模板" : buttonAuthed.value ? "编辑检验项模板" : "查看检验项模板"
)

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      getInspectOptionTemplateDetail()
      getInspectCategoryList()
      getUnitOptions()
    } else {
      resetFormData()
      uploadImgRef.value?.clearFunc()
      customFormRef.value?.resetForm()
    }
  }
)

/**
 * 获取检验项模板详情
 */
const getInspectOptionTemplateDetail = async () => {
  if (!props.id) {
    return
  }

  const data = await queryInspectOptionTemplateDetail(props.id)
  if (!data) {
    return
  }

  formData.value = {
    inspectItemName: data.inspectItemName,
    categoryId: data.categoryId,
    methodDesc: data.methodDesc,
    standardType: data.standardType,
    standardDesc: data.standardDesc,
    standardMaxInclusive: data.standardMaxInclusive ?? 0,
    standardMax: data.standardMax,
    standardMinInclusive: data.standardMinInclusive ?? 1,
    standardMin: data.standardMin,
    unitId: data.unitId,
    imageList:
      data.images?.map((item) => {
        return {
          fileName: item.fileName,
          fileId: item.id,
          fileUrl: formatImgUrlPreview(item.path)
        }
      }) || []
  }
}

/**
 * 获取检验项类别列表
 */
const getInspectCategoryList = async () => {
  const data = await queryInspectOptionCategoryListAll()
  if (data) {
    inspectCategoryOptions.value = data
      .filter((item) => item.status)
      .map((item) => {
        return {
          label: item.categoryName,
          value: item.id
        }
      })
  }
}

/**
 * 获取单位下拉列表
 */
const getUnitOptions = async () => {
  const data = await getUnit()
  unitOptions.value = data.map((item) => {
    return {
      label: item.unitName,
      value: String(item.id)
    }
  })
}

/**
 * 提交操作
 */
const onSubmit = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) {
    return
  }

  const {
    inspectItemName,
    categoryId,
    methodDesc,
    standardType,
    standardDesc,
    standardMax,
    standardMin,
    standardMaxInclusive,
    standardMinInclusive,
    unitId,
    imageList
  } = formData.value

  if (
    standardType === EnumStandardType.Number &&
    !isNumberStandardValid(standardMax, standardMin, !!standardMaxInclusive, !!standardMinInclusive)
  ) {
    return
  }

  let fn = props.id ? requestUpdateInspectOptionTemplate : requestCreateInspectOptionTemplate
  let params = {
    id: props.id,
    inspectItemName,
    categoryId,
    methodDesc,
    standardType,
    standardDesc: standardType === EnumStandardType.Text ? standardDesc : "",
    standardMaxInclusive: standardType === EnumStandardType.Number ? standardMaxInclusive : null,
    standardMax:
      standardType === EnumStandardType.Number
        ? isEffectiveValue(standardMax)
          ? standardMax
          : null
        : null,
    standardMinInclusive: standardType === EnumStandardType.Number ? standardMinInclusive : null,
    standardMin:
      standardType === EnumStandardType.Number
        ? isEffectiveValue(standardMin)
          ? standardMin
          : null
        : null,
    unitId: standardType === EnumStandardType.Number ? unitId : undefined,
    images: imageList.map((item) => item.fileId)
  }
  await fn(params)
  ElMessage.success(props.id ? "编辑成功" : "新建成功")
  dialogVisible.value = false
  emit("success")
}
</script>

<style lang="scss" scoped>
.form {
  &:deep(.el-form-item) {
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }

    input[type="number"] {
      -moz-appearance: textfield;
    }
  }
}
</style>
