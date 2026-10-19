<template>
  <!--  新建/更新没有存储/检验权限的区域时 -->
  <CustomDialog v-model="dialogVisible" :title="`${typeMap[type]}${tagName}`" size="mini">
    <CustomForm
      ref="customFormRef"
      v-model="formData"
      :label-width="formLabelWidth"
      :configs="formConfigs"
    ></CustomForm>

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
  queryFactoryModelList,
  requestCreateFactoryModel,
  requestUpdateFactoryModel
} from "@/api/fm"
import { queryPositionList } from "@/api/position"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import { EnumOperationType } from "@/constant/enums"
import type {
  IFactoryListItem,
  IFactoryModelListItem,
  IFactoryUnderClasses
} from "@/types/base-info/factory-model"
import { getDynamicFormLabelWidth } from "@/utils"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    parentId: string
    tagName: string
    currentChildType?: IFactoryUnderClasses
    info?: IFactoryListItem
    type: EnumOperationType
    isReadonly?: boolean
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success"): void
}>()

const typeMap = {
  [EnumOperationType.Create]: "新建",
  [EnumOperationType.Update]: "编辑",
  [EnumOperationType.Review]: "查看"
}

const formData = reactive({
  entityName: "",
  entityCode: "",
  parentId: "",
  leader: ""
})

const parentOptions = ref<IFactoryModelListItem[]>([])
const positionOptions = ref<{ label: string; value: string }[]>([])

const customFormRef = ref<InstanceType<typeof CustomForm>>()

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
const isWorkstation = computed(() => props.tagName === "workstation")
const isProductionArea = computed(() => props.tagName === "productionArea" || props.tagName === "storage")
const showLeader = computed(() => isProductionArea.value)

const loadParentOptions = async () => {
  if (!isWorkstation.value) return
  try {
    const [productionAreaList, productionUnitList] = await Promise.all([
      queryFactoryModelList({ levelTag: "productionArea", isEnable: true }),
      queryFactoryModelList({ levelTag: "productionUnit", isEnable: true })
    ])
    parentOptions.value = [...productionAreaList, ...productionUnitList]
  } catch (e) {
    parentOptions.value = []
  }
}

const formConfigs: ICustomFormConfigItem[] = [
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
    label: "上级单位",
    field: "parentId",
    rules: [
      {
        required: true,
        message: "请选择上级单位",
        trigger: "change"
      }
    ],
    props: {
      placeholder: "请选择上级单位",
      get disabled() {
        return props.isReadonly
      },
      filterable: true,
      get customChildren() {
        return parentOptions.value.map((item) => {
          return {
            componentType: "el-option",
            props: {
              label: item.entityName,
              value: item.id
            }
          }
        })
      }
    },
    get hidden() {
      return !isWorkstation.value  || isCreate.value
    }
  },
  {
    componentType: "el-select",
    label: "负责职位",
    field: "leader",
    props: {
      placeholder: "请选择负责职位",
      filterable: true,
      clearable: true,
      get disabled() {
        return props.isReadonly
      },
      get customChildren() {
        return positionOptions.value.map((item) => {
          return {
            componentType: "el-option",
            props: {
              label: item.label,
              value: item.value
            }
          }
        })
      }
    },
    get hidden() {
      return !showLeader.value
    }
  }
]

// 加载职位列表
const loadPositionOptions = async () => {
  try {
    const list = await queryPositionList()
    positionOptions.value = (list || []).map((item: any) => ({
      label: item.positionName,
      value: item.positionName
    }))
  } catch (e) {
    positionOptions.value = []
  }
}

watch(
  () => props.modelValue,
  async (val) => {
    if (!val) {
      customFormRef.value?.resetForm()
      formData.entityName = ""
      formData.entityCode = ""
      formData.parentId = ""
      formData.leader = ""
      parentOptions.value = []
    } else {
      // 加载职位列表
      if (showLeader.value) {
        await loadPositionOptions()
      }
      if (props.type == EnumOperationType.Update || props.type == EnumOperationType.Review) {
        formData.entityName = props.info?.entityName || ""
        formData.entityCode = props.info?.entityCode || ""
        formData.parentId = props.info?.parentId || ""
        formData.leader = (props.info as any)?.leader || ""
      }
      if (isWorkstation.value && !isCreate.value) {
        await loadParentOptions()
      }
    }
  }
)

/** 确认操作 */
const onConfirmClick = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return

  const leader = formData.leader || undefined

  if (isCreate.value) {
    await requestCreateFactoryModel({
      parentId: props.parentId,
      entityName: formData.entityName,
      entityCode: formData.entityCode,
      modelId: props.currentChildType?.id,
      leader
    })
    ElMessage.success("新建成功")
  } else {
    const updateParams: any = {
      id: props.info!.id,
      entityName: formData.entityName,
      leader
    }
    if (isWorkstation.value && formData.parentId) {
      updateParams.parentId = formData.parentId
    }
    await requestUpdateFactoryModel(updateParams)
    ElMessage.success("编辑成功")
  }

  dialogVisible.value = false
  emit("success")
}

defineOptions({
  name: "UpdateNormalDialog"
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
