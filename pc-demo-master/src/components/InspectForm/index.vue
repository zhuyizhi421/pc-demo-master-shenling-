<template>
  <!-- 新建或者编辑检验要求 -->
  <CustomDialog :title="title" v-model="show">
    <CustomForm
      ref="customFormRef"
      v-model="inspectDemandForm"
      :configs="formConfigs"
      :label-width="140"
      class="inspect-form"
    >
      <template #firstTitle-default>
        <div class="block-title">检验内容</div>
      </template>

      <template #standardType-default>
        <el-select v-model="inspectDemandForm.inspectionStandard.standardType">
          <el-option label="数值" :value="1" />
          <el-option label="文本" :value="2" />
        </el-select>
      </template>

      <template #standardDesc-default>
        <el-input v-model="inspectDemandForm.inspectionStandard.standardDesc" />
      </template>

      <template #standardMax-default>
        <el-select
          style="width: 100px"
          class="mr-[4px]"
          v-model="inspectDemandForm.inspectionStandard.standardMaxInclusive"
        >
          <el-option label="≤" :value="1" />
          <el-option label="<" :value="0" />
        </el-select>
        <el-input
          type="number"
          v-model="inspectDemandForm.inspectionStandard.standardMax"
          @mousewheel.prevent
          clearable
        />
      </template>

      <template #standardMin-default>
        <el-select
          style="width: 100px"
          class="mr-[4px]"
          v-model="inspectDemandForm.inspectionStandard.standardMinInclusive"
        >
          <el-option label="≥" :value="1" />
          <el-option label=">" :value="0" />
        </el-select>
        <el-input
          type="number"
          v-model="inspectDemandForm.inspectionStandard.standardMin"
          @mousewheel.prevent
          clearable
        />
      </template>

      <template #unitId-default>
        <el-select
          v-model="inspectDemandForm.inspectionStandard.unitId"
          placeholder="请选择"
          clearable
          filterable
        >
          <el-option
            v-for="item in unitOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </template>

      <template #imageList-default>
        <UploadImage v-model="imageList" :limit="5" multiple />
      </template>

      <template #secondTitle-default>
        <div class="block-title">检验条件</div>
      </template>

      <template #inspectRate-default>
        <CustomNumberInput
          v-if="inspectDemandForm.pollingTrigger === 1"
          v-model="inspectDemandForm.inspectRate!"
          :type="1"
          :decimalNumber="0"
          placeholder="请输入1-1440"
        >
          <template #suffix> 分钟 </template>
        </CustomNumberInput>
        <CustomNumberInput
          v-if="inspectDemandForm.pollingTrigger === 2"
          v-model="inspectDemandForm.triggerAmount!"
          :type="1"
          placeholder="请输入"
        >
          <template #suffix>{{ productInfo.defaultUnitName }}</template>
        </CustomNumberInput>
      </template>
    </CustomForm>

    <template #footer>
      <el-button @click="onCancelClick()">取消</el-button>
      <el-button type="primary" @click="onConfirmClick()" :loading="loading">保存</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import {
  queryInspectOptionTemplateDetail,
  queryInspectOptionTemplateList
} from "@/api/baseInfo/inspectOptionTemplate"
import {
  createTechStandardMeasurementWithInspectItem,
  getProcessControlPlanList,
  updateTechStandardMeasurement
} from "@/api/craft"
import { queryFactoryModelList } from "@/api/fm"
import { InspectionStandardType } from "@/api/operation/equipment/types"
import {
  createWithInspectItem,
  getProductModelById,
  type IProductModelListItem,
  updateInspectItemDetail
} from "@/api/product"
import { getUnit } from "@/api/units"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomNumberInput from "@/components/CustomNumberInput/index.vue"
import UploadImage from "@/components/UploadImage/index.vue"
import {
  EnumFirstInspectionTriggerType,
  EnumFirstInspectionTriggerTypeMap,
  EnumProductInspectionType,
  EnumProductInspectionTypeMap
} from "@/constant/enums"
import useResetRef from "@/hooks/useResetRef"
import type { IUploadPhoto } from "@/types/base-info/global-config"
import type { IInspectOptionTemplateListItem } from "@/types/base-info/inspect-option-template"
import { isNumberStandardValid, modifyStandardData } from "@/utils"
import { formatImgUrlPreview } from "@/utils/common"

import { EnumFormType, type InspectDemandForm, SourceType } from "./type"

defineOptions({
  name: "InspectForm"
})

interface TypeOptions {
  inspectName: string
  inspectType: number
}
const props = withDefaults(
  defineProps<{
    title: string
    inspectFormType: EnumFormType
    formData: InspectDemandForm
    inspectTypeOptions?: TypeOptions[]
    source?: SourceType
    isProcess?: boolean // 是否为“过程检”
  }>(),
  {
    source: SourceType.Default,
    isProcess: false, // 默认为非过程检验
    inspectTypeOptions: () => {
      return Object.entries(EnumProductInspectionTypeMap)
        .filter((item) => +item[0] > 6)
        .map((item) => {
          return {
            inspectName: item[1],
            inspectType: +item[0]
          }
        })
    }
  }
)
const emits = defineEmits<{
  (e: "onOk"): void
  (e: "cancel"): void
}>()

const inspectSiteOptions = ref<{ label: string; value: string }[]>([])

const inspectTemplateOptions = ref<IInspectOptionTemplateListItem[]>([]) //检验项模板下拉options
const show = ref(false)
// 检验要求参数
const [inspectDemandForm, resetInspectDemandForm] = useResetRef<InspectDemandForm>({
  techVersionId: "",
  id: "", // 更新时需要的
  inspectItemCode: "",
  inspectItemId: "",
  inspectItemName: "",
  inspectType: 0,
  inspectionStandard: {
    standardDesc: "",
    standardMax: 0,
    standardMaxInclusive: 0,
    standardMin: 0,
    standardMinInclusive: 1,
    standardType: 1,
    unitId: ""
  },
  productModelId: "",
  methodDesc: "",
  laboratoryIdList: [], // 检验场所
  imageIds: [],
  imageUrls: [],
  pollingTrigger: 1, // 巡检触发方式
  inspectRate: 0, // 巡检频率
  triggerAmount: undefined, // 巡检触发数量
  firstInspectionCondition: [], // 首检触发方式
  destructive: 1 // 是否破坏性检验
})

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "div",
    special: true,
    field: "firstTitle",
    slots: {
      default: "firstTitle-default"
    }
  },
  {
    componentType: "el-select",
    label: "检验项名称",
    field: "inspectItemId",
    rules: [
      {
        required: true,
        message: "请输入检验项名称",
        trigger: "change"
      }
    ],
    props: {
      placeholder: "请输入",
      filterable: true,
      allowCreate: true,
      defaultFirstOption: true,
      get customChildren() {
        return inspectTemplateOptions.value.map((item) => {
          return {
            componentType: "el-option",
            props: {
              label: item.itemName,
              value: item.id
            }
          }
        })
      }
    },
    events: {
      change: onInspectNameChange
    }
  },
  {
    componentType: "el-input",
    label: "检验项编号",
    field: "inspectItemCode",
    props: {
      placeholder: "不填则自动生成",
      get disabled() {
        return props.inspectFormType != EnumFormType.Create
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
    componentType: "div",
    label: "检验标准类型",
    field: "standardType",
    props: {
      class: "w-[100%]"
    },
    slots: {
      default: "standardType-default"
    }
  },
  {
    componentType: "div",
    label: "检验标准",
    field: "inspectionStandard.standardDesc",
    get hidden() {
      return inspectDemandForm.value.inspectionStandard.standardType !== InspectionStandardType.Text
    },
    rules: [
      {
        required: true,
        message: "请输入检验标准",
        trigger: "blur"
      }
    ],
    props: {
      class: "w-[100%]"
    },
    slots: {
      default: "standardDesc-default"
    }
  },
  {
    componentType: "div",
    label: "数值上限",
    field: "standardMax",
    get hidden() {
      return (
        inspectDemandForm.value.inspectionStandard.standardType !== InspectionStandardType.Number
      )
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
      return (
        inspectDemandForm.value.inspectionStandard.standardType !== InspectionStandardType.Number
      )
    },
    props: {
      class: "flex w-[100%]"
    },
    slots: {
      default: "standardMin-default"
    }
  },
  {
    componentType: "div",
    label: "单位",
    field: "unitId",
    get hidden() {
      return (
        inspectDemandForm.value.inspectionStandard.standardType !== InspectionStandardType.Number
      )
    },
    props: {
      class: "w-[100%]"
    },
    slots: {
      default: "unitId-default"
    }
  },
  {
    componentType: "div",
    label: "图片",
    field: "imageList",
    slots: {
      default: "imageList-default"
    }
  },
  {
    componentType: "div",
    special: true,
    field: "secondTitle",
    get hidden() {
      return !props.isProcess
    },
    slots: {
      default: "secondTitle-default"
    }
  },
  {
    componentType: "el-select",
    label: "触发条件",
    field: "firstInspectionCondition",
    rules: [
      {
        required: true,
        message: "请选择触发条件",
        trigger: "change"
      }
    ],
    get hidden() {
      return !isFirstCheck.value
    },
    props: {
      placeholder: "请选择触发条件",
      multiple: true,
      collapseTags: true,
      collapseTagsTooltip: true,
      get customChildren() {
        return Object.keys(EnumFirstInspectionTriggerTypeMap).map((key) => {
          return {
            componentType: "el-option",
            props: {
              label:
                EnumFirstInspectionTriggerTypeMap[key as unknown as EnumFirstInspectionTriggerType],
              value: +key
            }
          }
        })
      }
    }
  },
  {
    componentType: "el-select",
    label: "触发条件",
    field: "pollingTrigger",
    get hidden() {
      return !isPollingCheck.value
    },
    props: {
      clearable: false,
      placeholder: "请选择触发条件",
      get customChildren() {
        return [
          {
            componentType: "el-option",
            props: {
              label: "按时间",
              value: 1
            }
          },
          {
            componentType: "el-option",
            props: {
              label: "按数量",
              value: 2
            }
          }
        ]
      }
    }
  },
  {
    componentType: "div",
    label: "巡检频率",
    get field() {
      return inspectDemandForm.value.pollingTrigger === 1 ? "inspectRate" : "triggerAmount"
    },
    get rules() {
      return inspectDemandForm.value.pollingTrigger === 1
        ? [
            {
              required: true,
              validator: (rule: any, value: number, callback: any) => {
                if (!value) {
                  callback("检验频率必须大于0")
                }
                if (!isNaN(Number(value)) && (value <= 0 || value > 1440)) {
                  callback("请输入1-1440之间的数字")
                } else {
                  callback()
                }
              },
              trigger: "blur"
            }
          ]
        : [
            {
              required: true,
              validator: (rule: any, value: number, callback: any) => {
                console.log(value)
                if (!value) {
                  callback("检验频率必须大于0")
                }
                if (isNaN(Number(value))) {
                  callback("请输入数字")
                } else if (value < 0) {
                  callback("请输入大于0的数字")
                } else {
                  callback()
                }
              },
              trigger: "blur"
            }
          ]
    },
    get hidden() {
      return !isPollingCheck.value
    },
    props: {
      class: "w-[100%]"
    },
    slots: {
      default: "inspectRate-default"
    }
  },
  {
    componentType: "el-select",
    label: "检验场所",
    field: "laboratoryIdList",
    get hidden() {
      return !props.isProcess
    },
    props: {
      placeholder: "请选择检验场所",
      multiple: true,
      collapseTags: true,
      collapseTagsTooltip: true,
      get customChildren() {
        return inspectSiteOptions.value.map((item) => {
          return {
            componentType: "el-option",
            props: {
              label: item.label,
              value: item.value
            }
          }
        })
      }
    }
  },
  {
    componentType: "el-switch",
    label: "破坏性检验",
    field: "destructive",
    get hidden() {
      return !props.isProcess
    },
    props: {
      activeValue: 1,
      inactiveValue: 0
    }
  }
])

const imageList = ref<IUploadPhoto[]>([])

const unitOptions = ref<{ label: string; value: string }[]>([])
const productInfo = ref<Partial<IProductModelListItem>>({})

/** 当前单位名称 */
const currentUnitName = computed(
  () =>
    unitOptions.value.find(
      (item) => item.value === String(inspectDemandForm.value.inspectionStandard?.unitId || "")
    )?.label || ""
)

/** 是否为首检，包括自检、专检 */
const isFirstCheck = computed(() => {
  return [EnumProductInspectionType.FIRST_SELF, EnumProductInspectionType.FIRST_SPECIAL].includes(
    inspectDemandForm.value.inspectType as EnumProductInspectionType
  )
})

/** 是否为巡检，包括自检、专检 */
const isPollingCheck = computed(() => {
  return [
    EnumProductInspectionType.POLLING_SELF,
    EnumProductInspectionType.POLLING_SPECIAL
  ].includes(inspectDemandForm.value.inspectType as EnumProductInspectionType)
})

watch(
  () => show.value,
  async (val) => {
    if (!val) {
      resetInspectDemandForm()
      customFormRef.value?.resetForm()
      imageList.value = []
    } else {
      getUnitOptions()
      getInspectSideOptions()
      if (props.formData) {
        inspectDemandForm.value = cloneDeep(props.formData)
        const { imageIds, imageUrls } = props.formData
        if (imageIds?.length && imageUrls?.length) {
          imageList.value = imageIds.map((item, index) => ({
            fileName: "",
            fileUrl: formatImgUrlPreview(imageUrls[index]),
            fileId: item
          }))
        }
        await getInspectOptionTemplate()
        getProductInfo(inspectDemandForm.value.productModelId)
      }
    }
  },
  {
    immediate: true
  }
)

/** 获取单位下拉列表 */
const getUnitOptions = async () => {
  const data = await getUnit()
  unitOptions.value = data.map((item) => {
    return {
      label: item.unitName,
      value: String(item.id)
    }
  })
}

/** 获取检验场所下拉列表 */
const getInspectSideOptions = async () => {
  const data = await queryFactoryModelList({
    isEnable: true,
    isInspection: true
  })

  inspectSiteOptions.value = data.map((item) => {
    return {
      label: item.entityName,
      value: item.id
    }
  })
}

/** 获取检验项模板列表 */
const getInspectOptionTemplate = async () => {
  const res = await queryInspectOptionTemplateList({})
  inspectTemplateOptions.value = res || []
}

/** 获取产品信息 */
const getProductInfo = async (id: string) => {
  const data = await getProductModelById(id)
  productInfo.value = data
}

/** 切换检验项名称 */
const onInspectNameChange = async (val: string) => {
  if (!val) {
    return
  }

  // 判断是否是通过选择检验项模板来切换的，如果是，则需要根据模板id查询检验项详情，
  // 并将检验项详情赋值到表单中，如果不是，则清空检验性id
  const isSelect = inspectTemplateOptions.value.some((item) => item.id === val)
  if (isSelect) {
    const detailInfo = await queryInspectOptionTemplateDetail(val)
    if (detailInfo) {
      inspectDemandForm.value.inspectItemName = detailInfo.inspectItemName
      inspectDemandForm.value.methodDesc = detailInfo.methodDesc
      inspectDemandForm.value.inspectionStandard = {
        standardType: detailInfo.standardType,
        standardDesc: detailInfo.standardDesc,
        standardMax: detailInfo.standardMax,
        standardMaxInclusive: detailInfo.standardMaxInclusive ?? 0,
        standardMin: detailInfo.standardMin,
        standardMinInclusive: detailInfo.standardMinInclusive ?? 1,
        unitId: detailInfo.unitId
      }
      inspectDemandForm.value.imageIds = detailInfo.images?.map((item) => item.id) || []
      imageList.value =
        detailInfo.images?.map((item) => ({
          fileName: item.fileName,
          fileUrl: formatImgUrlPreview(item.path),
          fileId: item.id
        })) || []
    }
  } else {
    inspectDemandForm.value.inspectItemId = val
    inspectDemandForm.value.inspectItemName = val
  }
}

/** 取消操作 */
const onCancelClick = () => {
  resetInspectDemandForm()
  show.value = false
  emits("cancel")
}

const loading = ref(false)
//新增、编辑检验要求
const onConfirmClick = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return

  try {
    if (
      inspectDemandForm.value.inspectionStandard?.standardType === InspectionStandardType.Number &&
      !isNumberStandardValid(
        inspectDemandForm.value.inspectionStandard.standardMax,
        inspectDemandForm.value.inspectionStandard.standardMin,
        !!inspectDemandForm.value.inspectionStandard.standardMaxInclusive,
        !!inspectDemandForm.value.inspectionStandard.standardMinInclusive
      )
    ) {
      return
    }

    inspectDemandForm.value.inspectionStandard = modifyStandardData(
      inspectDemandForm.value.inspectionStandard
    ) as InspectDemandForm["inspectionStandard"]

    // 添加单位名称到检验标准
    inspectDemandForm.value.inspectionStandard.unitName = currentUnitName.value

    const {
      id,
      inspectItemCode,
      inspectItemName,
      inspectType,
      inspectionStandard,
      productModelId,
      methodDesc,
      laboratoryIdList,
      inspectRate,
      triggerAmount,
      pollingTrigger,
      firstInspectionCondition,
      techVersionId,
      destructive
    } = inspectDemandForm.value

    loading.value = true
    if (!id) {
      // 新增单个检验要求
      if (props.source == SourceType.Default) {
        // 非过程检
        await createWithInspectItem({
          inspectItemCode: inspectItemCode as string,
          inspectItemName,
          inspectType,
          inspectionStandard,
          laboratoryIdList,
          productModelId,
          methodDesc,
          imageIds: imageList.value.map((item) => item.fileId)
        })
      } else {
        // 过程检
        await createTechStandardMeasurementWithInspectItem({
          productModelId,
          inspectItemCode: inspectItemCode as string,
          inspectItemName,
          inspectRate,
          laboratoryIdList,
          inspectType,
          inspectionStandard,
          methodDesc,
          pollingTrigger,
          triggerAmount,
          techVersionId: techVersionId as string,
          destructive: destructive as number,
          firstInspectionCondition,
          imageIds: imageList.value.map((item) => item.fileId)
        })
      }
      ElMessage.success("新建成功")
    } else {
      // 编辑单个检验要求
      if (props.source == SourceType.Default) {
        // 非过程检
        await updateInspectItemDetail({
          id,
          inspectItemCode: inspectItemCode as string,
          inspectItemName,
          inspectType,
          inspectionStandard,
          laboratoryIdList,
          productModelId,
          methodDesc,
          imageIds: imageList.value.map((item) => item.fileId)
        })
      } else {
        // 过程检
        await updateTechStandardMeasurement({
          id,
          productModelId,
          inspectItemCode: inspectItemCode as string,
          inspectItemName,
          inspectRate,
          laboratoryIdList,
          inspectType,
          inspectionStandard,
          methodDesc,
          pollingTrigger,
          triggerAmount,
          techVersionId: techVersionId as string,
          destructive: destructive as number,
          firstInspectionCondition,
          imageIds: imageList.value.map((item) => item.fileId)
        })
      }
      ElMessage.success("编辑成功")
    }
    loading.value = false
    resetInspectDemandForm()
    show.value = false
    emits("onOk")
    // 刷新过程控制计划列表
    if (techVersionId) {
      await getProcessControlPlanList(techVersionId as string)
    }
  } catch (error) {
    loading.value = false
  }
}

defineExpose({
  setShow: () => {
    show.value = true
  }
})
</script>

<style lang="scss" scoped>
.inspect-form {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 5px;

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

.block-title {
  font-size: 16px;
  color: #303133;
  margin: 16px 0 12px;
}
</style>
