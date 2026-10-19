<template>
  <div ref="processCheckTabRef" class="process-check-tab">
    <el-tabs
      type="border-card"
      class="process-check-tab__stage-tabs"
      v-model="inspectTabValue"
      @tab-change="onInspectTabChange()"
    >
      <el-tab-pane
        v-for="(item, index) in inspectProcessTypeList"
        :key="index"
        :label="item.inspectName"
        :name="item.inspectType"
      >
        <CustomTitle title="产品过程检">
          <div class="process-check-tab__meta">
            <span>当前产品：{{ currentProductName || "-" }}</span>
            <span>当前检验阶段：{{ currentInspectStageName || "-" }}</span>
          </div>
        </CustomTitle>

        <el-tabs
          v-if="leftTabList.length"
          class="left-tabs"
          v-model="curProductTabValue"
          type="border-card"
          tab-position="left"
          style="height: 500px"
          @tab-change="onProductTabChange()"
        >
          <el-tab-pane
            v-for="item in leftTabList"
            :key="item.productModelId"
            :label="item.productModelName"
            :name="item.productModelId"
          />

          <CustomTitle title="检验要求">
            <div v-if="!isOnlyView">
              <el-button type="primary" icon="Plus" @click="updateInspectDemand('create')">
                新建检验要求
              </el-button>
            </div>
          </CustomTitle>

          <CustomTable
            v-model:table-data="inspectDemandTableData"
            :config="inspectDemandTableConfig"
          >
            <template #operation-default="{ row }">
              <el-button
                link
                type="primary"
                size="small"
                :disabled="isOnlyView"
                @click="updateInspectDemand('edit', row)"
              >
                编辑
              </el-button>
              <el-button
                link
                type="danger"
                size="small"
                :disabled="isOnlyView"
                @click="updateInspectDemand('delete', row)"
              >
                删除
              </el-button>
            </template>
          </CustomTable>
        </el-tabs>
      </el-tab-pane>
    </el-tabs>

    <ProcessInspectForm
      ref="inspectFormRef"
      :title="FormTypeTitleMap[inspectFormType]"
      :inspect-form-type="inspectFormType"
      :form-data="inspectDemandForm"
      @onOk="getProcessInspectItemList()"
      @cancel="resetInspectDemandForm"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  deleteTechStandardMeasurementById,
  getTechStandardMeasurementList,
  getTechStandardOutputList
} from "@/api/craft"
import { type IInspectItemDetail } from "@/api/product"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import { EnumFormType, FormTypeTitleMap, type InspectDemandForm } from "@/components/InspectForm/type"
import {
  EnumProductInspectionType,
  EnumProductInspectionTypeMap
} from "@/constant/enums"
import useResetRef from "@/hooks/useResetRef"
import type { ITechVersionProps } from "@/types/base-info/craftRoute"
import { typeNumberHandle } from "@/utils/inspectStandard"

import ProcessInspectForm from "./ProcessInspectForm.vue"

interface ILeftTabItem {
  productModelName: string
  productModelId: string
}

defineOptions({
  name: "ProcessCheckTab"
})

const props = withDefaults(
  defineProps<{
    techVersionInfo: ITechVersionProps
    productId: string
  }>(),
  {
    productId: ""
  }
)

const isOnlyView = inject<Ref<boolean>>("isOnlyView", ref(false))
const processCheckTabRef = ref<HTMLDivElement>()

const inspectFormType = ref<EnumFormType>(EnumFormType.Create)
const inspectProcessTypeList = Object.entries(EnumProductInspectionTypeMap)
  .filter((item) => +item[0] <= 6)
  .map((item) => ({
    inspectName: item[1],
    inspectType: +item[0]
  }))
const inspectTabValue = ref<EnumProductInspectionType>(inspectProcessTypeList[0].inspectType)
const leftTabList = ref<ILeftTabItem[]>([])
const curProductTabValue = ref(props.productId)
const allInspectDemandTableData = ref<IInspectItemDetail[]>([])
const inspectDemandTableData = ref<IInspectItemDetail[]>([])

const currentProductName = computed(
  () => leftTabList.value.find((item) => item.productModelId === curProductTabValue.value)?.productModelName || ""
)
const currentInspectStageName = computed(
  () => EnumProductInspectionTypeMap[inspectTabValue.value as EnumProductInspectionType] || ""
)

const hasStandardNumericValue = (value: unknown) => value !== null && value !== undefined && value !== ""
const normalizeNullableNumber = (value: unknown) =>
  hasStandardNumericValue(value) ? Number(value) : undefined
const inferQuantitativeMode = (row: Partial<IInspectItemDetail>) => {
  if (row.quantitativeMode === "lower" || row.quantitativeMode === "upper") {
    return row.quantitativeMode
  }
  if (
    row.quantitativeMode === "range" ||
    (hasStandardNumericValue(row.standardValue) &&
      hasStandardNumericValue(row.upperTolerance) &&
      hasStandardNumericValue(row.lowerTolerance))
  ) {
    return "range" as const
  }
  return hasStandardNumericValue(row.standardMax) ? ("upper" as const) : ("lower" as const)
}
const buildStandardPreview = (row: Partial<IInspectItemDetail>) => {
  if (Number(row.standardType) !== 1) {
    return String(row.standardDesc || "-") || "-"
  }
  return (
    typeNumberHandle(
      {
        standardType: 1,
        standardDesc: "",
        standardMaxInclusive: Number(row.standardMaxInclusive ?? 0),
        standardMax: normalizeNullableNumber(row.standardMax) ?? null,
        standardMinInclusive: Number(row.standardMinInclusive ?? 1),
        standardMin: normalizeNullableNumber(row.standardMin) ?? null,
        quantitativeMode: inferQuantitativeMode(row),
        standardValue: normalizeNullableNumber(row.standardValue) ?? null,
        upperTolerance: normalizeNullableNumber(row.upperTolerance) ?? null,
        lowerTolerance: normalizeNullableNumber(row.lowerTolerance) ?? null,
        upperToleranceSign: row.upperToleranceSign || "+",
        lowerToleranceSign: row.lowerToleranceSign || "-",
        unitName: String((row as any).unitName || "")
      },
      true
    ) || "-"
  )
}

const inspectDemandTableConfig = ref<ITableConfig>({
  height: "300px",
  columns: [
    {
      prop: "inspectItemName",
      label: "检验项名称",
      minWidth: 160
    },
    {
      prop: "inspectType",
      label: "检验类型",
      width: 120,
      align: "center",
      formatter: (row: IInspectItemDetail) =>
        EnumProductInspectionTypeMap[row.inspectType as EnumProductInspectionType]
    },
    {
      prop: "inspectItemCode",
      label: "检验项编号",
      minWidth: 160
    },
    {
      prop: "methodDesc",
      label: "探测方式",
      minWidth: 160
    },
    {
      prop: "standardType",
      label: "检验标准类型",
      width: 120,
      align: "center",
      formatter: (row: IInspectItemDetail) => (row.standardType === 1 ? "定量" : "定性")
    },
    {
      prop: "standardDesc",
      label: "检验标准",
      minWidth: 220,
      formatter: (row: IInspectItemDetail) => buildStandardPreview(row)
    },
    {
      prop: "sampleNum",
      label: "样本数",
      width: 100,
      align: "center",
      formatter: (row: IInspectItemDetail) =>
        hasStandardNumericValue(row.sampleNum) ? String(row.sampleNum) : "-"
    },
    {
      prop: "isSampleReturn",
      label: "样品是否还回",
      width: 130,
      align: "center",
      formatter: (row: IInspectItemDetail) => {
        const isSampleReturn = row.isSampleReturn ?? Number(row.destructive) !== 1
        return isSampleReturn ? "还回" : "不还回"
      }
    },
    {
      prop: "triggerAmount",
      label: "检验频率",
      width: 120,
      get hidden() {
        return ![
          EnumProductInspectionType.POLLING_SELF,
          EnumProductInspectionType.POLLING_SPECIAL
        ].includes(inspectTabValue.value)
      },
      formatter: (row: any) =>
        row.pollingTrigger === 1
          ? `${row.inspectRate || "-"}分钟`
          : `${row.triggerAmount || "-"}${row.productUnitName || ""}`
    },
    {
      prop: "operation",
      label: "操作",
      width: 140,
      fixed: "right",
      align: "center",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const inspectFormRef = ref<InstanceType<typeof ProcessInspectForm>>()
const [inspectDemandForm, resetInspectDemandForm] = useResetRef<InspectDemandForm>({
  id: "",
  techVersionId: "",
  productModelId: "",
  inspectItemName: "",
  inspectItemCode: "",
  inspectItemId: "",
  inspectRate: undefined,
  laboratoryIdList: [],
  inspectType: 0,
  inspectionStandard: {
    standardDesc: "",
    standardMax: null as any,
    standardMaxInclusive: 0,
    standardMin: null as any,
    standardMinInclusive: 1,
    standardType: 1,
    quantitativeMode: "lower",
    standardValue: undefined,
    upperTolerance: undefined,
    lowerTolerance: undefined,
    upperToleranceSign: "+",
    lowerToleranceSign: "-",
    unitId: ""
  },
  methodDesc: "",
  pollingTrigger: 1,
  triggerAmount: undefined,
  imageIds: [],
  imageUrls: [],
  firstInspectionCondition: [],
  destructive: 0,
  isSampleReturn: true,
  sampleNum: undefined
})

onBeforeMount(async () => {
  await onInspectTabChange()
})

const scrollToProcessCheckTop = () => {
  nextTick(() => {
    processCheckTabRef.value?.scrollIntoView({
      block: "start",
      behavior: "smooth"
    })
  })
}

const onInspectTabChange = async () => {
  scrollToProcessCheckTop()
  await getOutputProductList()
  if (curProductTabValue.value) {
    await getProcessInspectItemList()
  }
}

const onProductTabChange = () => {
  scrollToProcessCheckTop()
  getProcessInspectItemList()
}

const getOutputProductList = async () => {
  const data = await getTechStandardOutputList({
    techVersionId: props.techVersionInfo.techVersionId
  })
  leftTabList.value = (data || []).map((item) => ({
    productModelName: item.productModelName,
    productModelId: item.productModelId
  }))
  const preferredProductId = leftTabList.value.some((item) => item.productModelId === props.productId)
    ? props.productId
    : leftTabList.value[0]?.productModelId || ""
  curProductTabValue.value = preferredProductId
}

const getProcessInspectItemList = async () => {
  if (!curProductTabValue.value) {
    inspectDemandTableData.value = []
    return
  }
  const data = await getTechStandardMeasurementList({
    techVersionId: props.techVersionInfo.techVersionId,
    productModelId: curProductTabValue.value,
    inspectType: inspectTabValue.value
  })
  allInspectDemandTableData.value = data || []
  inspectDemandTableData.value = allInspectDemandTableData.value.filter(
    (item) => item.inspectType === inspectTabValue.value
  )
}

const updateInspectDemand = async (
  type: "create" | "edit" | "delete",
  data?: IInspectItemDetail
) => {
  if (type === "delete") {
    await ElMessageBox.confirm("确认删除该行数据?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })
    await deleteTechStandardMeasurementById(String(data?.id || ""))
    await getProcessInspectItemList()
    ElMessage.success("删除成功")
    return
  }

  if (type === "create") {
    inspectFormType.value = EnumFormType.Create
    resetInspectDemandForm()
    inspectDemandForm.value.techVersionId = props.techVersionInfo.techVersionId
    inspectDemandForm.value.productModelId = curProductTabValue.value
    inspectDemandForm.value.inspectType = inspectTabValue.value
    inspectDemandForm.value.isSampleReturn = true
    inspectFormRef.value?.setShow()
    return
  }

  resetInspectDemandForm()
  inspectFormType.value = EnumFormType.Edit
  inspectDemandForm.value = {
    id: String(data?.id || ""),
    techVersionId: props.techVersionInfo.techVersionId,
    productModelId: curProductTabValue.value,
    inspectItemName: String(data?.inspectItemName || ""),
    inspectItemCode: String(data?.inspectItemCode || ""),
    inspectItemId: String(data?.inspectItemId || ""),
    inspectRate: hasStandardNumericValue(data?.inspectRate) ? Number(data?.inspectRate) : undefined,
    laboratoryIdList: [...(data?.laboratoryIdList || [])],
    inspectType: Number(data?.inspectType || 0),
    inspectionStandard: {
      standardDesc: String(data?.standardDesc || ""),
      standardMax: normalizeNullableNumber(data?.standardMax) ?? (null as any),
      standardMaxInclusive: Number(data?.standardMaxInclusive ?? 0),
      standardMin: normalizeNullableNumber(data?.standardMin) ?? (null as any),
      standardMinInclusive: Number(data?.standardMinInclusive ?? 1),
      standardType: Number(data?.standardType || 1),
      quantitativeMode: inferQuantitativeMode(data || {}),
      standardValue: normalizeNullableNumber(data?.standardValue) ?? undefined,
      upperTolerance: normalizeNullableNumber(data?.upperTolerance) ?? undefined,
      lowerTolerance: normalizeNullableNumber(data?.lowerTolerance) ?? undefined,
      upperToleranceSign: data?.upperToleranceSign || "+",
      lowerToleranceSign: data?.lowerToleranceSign || "-",
      unitId: String(data?.unitId || "")
    },
    methodDesc: String(data?.methodDesc || ""),
    pollingTrigger: Number(data?.pollingTrigger || 1),
    triggerAmount: hasStandardNumericValue(data?.triggerAmount) ? Number(data?.triggerAmount) : undefined,
    imageIds: [...(data?.imageIds || [])],
    imageUrls: [...(data?.imageUrls || [])],
    firstInspectionCondition: [...(data?.firstInspectionCondition || [])],
    destructive: Number(data?.destructive || 0),
    isSampleReturn: data?.isSampleReturn ?? Number(data?.destructive) !== 1,
    sampleNum: hasStandardNumericValue(data?.sampleNum) ? Number(data?.sampleNum) : undefined
  }
  inspectFormRef.value?.setShow()
}
</script>

<style lang="scss" scoped>
.process-check-tab {
  &__meta {
    display: flex;
    gap: 20px;
    color: var(--el-text-color-secondary);
    font-size: 13px;
  }

  &:deep(.process-check-tab__stage-tabs > .el-tabs__header) {
    position: sticky;
    top: 0;
    z-index: 12;
    margin-bottom: 12px;
    background: #fff;
  }

  &:deep(.process-check-tab__stage-tabs.el-tabs--top) {
    flex-direction: column;
  }

  &:deep(.left-tabs) {
    .el-tab-pane {
      min-height: unset !important;
    }

    .el-tabs__item {
      width: auto !important;
    }
  }
}
</style>
