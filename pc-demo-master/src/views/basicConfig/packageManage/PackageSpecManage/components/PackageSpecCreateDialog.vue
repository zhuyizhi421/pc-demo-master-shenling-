<template>
  <CustomDialog v-model="dialogVisible" :title="dialogTitle" size="medium">
    <CustomForm ref="customFormRef" class="form" v-model="formData" :configs="formConfigs">
      <template #templateId-content>
        <div class="template-list">
          <el-radio-group v-model="formData.templateId">
            <div
              class="template-list-item"
              v-for="(item, index) in printTemplateList"
              :key="item.templateId"
              @click="formData.templateId = item.templateId"
            >
              <el-radio class="template-list-item-radio" size="large" :value="item.templateId"
                >模板{{ index + 1 }}</el-radio
              >
              <div class="template-list-item-img">
                <el-image
                  :src="formatImgUrlPreview(item.thumbnailAddress)"
                  fit="contain"
                  :preview-src-list="[formatImgUrlPreview(item.thumbnailAddress)]"
                  preview-teleported
                />
              </div>
            </div>
          </el-radio-group>
        </div>
      </template>
    </CustomForm>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onsubmit()">确定</el-button>
      </div>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import {
  queryPackageSpecDetails,
  requestCreatePackageSpec,
  requestPackageSpecTransportType,
  requestPackageSpecType,
  requestUpdatePackageSpec
} from "@/api/baseInfo/package-manage/packageSpec"
import { queryPrintTemplateList } from "@/api/baseInfo/print-template/pintTemplate"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import useResetRef from "@/hooks/useResetRef"
import type { IPrintTemplateListItem } from "@/types/base-info/print-template"
import type { IOption } from "@/types/common"
import { formatImgUrlPreview } from "@/utils/common"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    id?: string
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success"): void
}>()

const containerTypeList = ref<IOption[]>([])
const transportationTypeList = ref<IOption[]>([])
const printTemplateList = ref<IPrintTemplateListItem[]>([])

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const [formData, resetFormData] = useResetRef({
  specName: "",
  containerType: "",
  transportType: "",
  remark: "",
  templateId: ""
})
const formConfigs = computed(() => [
  {
    componentType: "el-input",
    label: "包装规范名称",
    field: "specName",
    props: {
      placeholder: "请输入"
    },
    rules: [
      {
        required: true,
        message: "包装规范名称不能为空",
        trigger: "blur"
      }
    ]
  },
  {
    componentType: "el-select",
    label: "包装容器类型",
    field: "containerType",
    props: {
      customChildren: containerTypeList.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.label,
          value: item.value
        }
      }))
    },
    rules: [
      {
        required: true,
        message: "包装容器类型不能为空",
        trigger: "change"
      }
    ]
  },
  {
    componentType: "el-select",
    label: "运输方式",
    field: "transportType",
    props: {
      customChildren: transportationTypeList.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.label,
          value: item.value
        }
      }))
    }
  },
  {
    componentType: "el-input",
    label: "备注说明",
    field: "remark",
    props: {
      type: "textarea",
      placeholder: "请输入",
      maxlength: 200,
      showWordLimit: true
    },
    colspan: -1
  },
  {
    componentType: "div",
    label: "打印标识模板",
    field: "templateId",
    colspan: -1,
    props: {
      class: "print-template"
    },
    slots: {
      default: "templateId-content"
    },
    rules: [
      {
        required: true,
        message: "打印标识模板不能为空",
        trigger: "change"
      }
    ]
  }
])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
})
const dialogTitle = computed(() => (props.id ? "编辑包装规范" : "新建包装规范"))

watch(
  () => props.modelValue,
  async (val) => {
    if (val) {
      await getContainerTypeList()
      getPackageSpecDetail()
      getTransportationTypeList()
      getPrintTemplateList()
    } else {
      customFormRef.value?.resetForm()
      resetFormData()
    }
  }
)

/** 获取包装容器类型 */
const getContainerTypeList = async () => {
  const data = await requestPackageSpecType()
  containerTypeList.value = data || []

  // 若项目配置容器类型中包含“箱”，则默认选中“箱”
  const hasBox = data.some((item) => item.value === "箱")
  if (hasBox) {
    formData.value.containerType = "箱"
  }
}

/** 获取运输方式类型 */
const getTransportationTypeList = async () => {
  const data = await requestPackageSpecTransportType()
  transportationTypeList.value = data || []
}

/** 获取打印标识模板 */
const getPrintTemplateList = async () => {
  const data = await queryPrintTemplateList({})
  printTemplateList.value = data || []
  if (printTemplateList.value.length) {
    formData.value.templateId = printTemplateList.value[0].templateId
  }
}

/** 获取包装规范详情 */
const getPackageSpecDetail = async () => {
  if (!props.id) {
    return
  }
  const data = await queryPackageSpecDetails([props.id])
  if (!data) {
    return
  }

  for (let key in formData.value) {
    ;(formData.value as any)[key] = (data as any)[0][key]
  }
}

/** 提交操作 */
const onsubmit = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) {
    return
  }

  const params = {
    ...formData.value,
    id: props.id
  }

  const fn = props.id ? requestUpdatePackageSpec : requestCreatePackageSpec
  await fn(params)
  ElMessage.success(props.id ? "编辑成功" : "新建成功")
  dialogVisible.value = false
  emit("success")
}
</script>

<style lang="scss" scoped>
.tooltip-content {
  display: flex;
  align-items: center;
  justify-content: center;

  & > span {
    margin-right: 5px;
  }
}

.form {
  &:deep(.print-template) {
    width: 100%;
  }

  .template-list {
    display: flex;
    max-height: 450px;
    overflow-y: auto;

    .template-list-item {
      width: 180px;
      height: 200px;
      margin: 0 18px 16px 0;
      border: 1px solid #dcdfe6;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .template-list-item-radio {
      width: 100%;
      border-bottom: 1px solid #dcdfe6;
      padding-left: 8px;

      &:deep(.el-radio__inner) {
        width: 18px;
        height: 18px;
      }
    }

    .template-list-item-img {
      width: 100%;
      flex: 1;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 16px;
    }

    &:deep(.el-image) {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
