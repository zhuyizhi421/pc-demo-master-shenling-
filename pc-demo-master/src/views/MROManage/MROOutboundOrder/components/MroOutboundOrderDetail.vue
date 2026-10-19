<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content">
      <div class="page-toolbar">
        <el-button plain icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>

      <CustomTitle title="MRO出库单详情" :is-table-title="false" show-short-bar />

      <div class="detail-section">
        <CustomDescription :data="detailData || {}" :configs="detailInfoConfig">
          <template #status-content>
            <el-tag :type="detailStatusTagType" size="small">
              {{ detailStatusText }}
            </el-tag>
          </template>
        </CustomDescription>
      </div>
    </div>

    <div class="custom-table-container detail-table-container">
      <CustomTitle title="出库明细" />
      <CustomTable v-model:table-data="tableData" :config="tableConfig" />
    </div>
  </div>
</template>

<script setup lang="ts">
import CustomDescription from "@/components/CustomDescription/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import { EnumMRORegisterStatus } from "@/constant/enums"
import { FORMAT_TIME } from "@/constant/time"
import type {
  IMroOutboundOrderDetailItem,
  IMroOutboundOrderPageListItem,
  MroOutboundDetailSourceType,
  MroOutboundOrderSourceType
} from "@/types/maintain/mro-manage/mro-outbound-order"

defineOptions({
  name: "MroOutboundOrderDetail"
})

const props = withDefaults(
  defineProps<{
    data?: IMroOutboundOrderPageListItem
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "close"): void
}>()

const sourceTypeMap: Record<MroOutboundOrderSourceType, string> = {
  manual_create: "手工新增",
  pickup_auto: "MRO领用单"
}

const detailSourceTypeMap: Record<MroOutboundDetailSourceType, string> = {
  mro_info: "MRO信息",
  mro_resume: "MRO履历"
}
const outboundOrderStatusMap: Record<EnumMRORegisterStatus, string> = {
  [EnumMRORegisterStatus.NOT_REVIEWED]: "未复核",
  [EnumMRORegisterStatus.REVIEWED]: "已完成"
}

const detailData = ref<IMroOutboundOrderPageListItem>()
const tableData = ref<IMroOutboundOrderDetailItem[]>([])

const formatDisplayTime = (value?: string) => {
  if (!value) return "--"
  const target = dayjs(value)
  return target.isValid() ? target.format(FORMAT_TIME) : value
}

const detailStatusText = computed(() => {
  const status = (detailData.value?.status ||
    EnumMRORegisterStatus.NOT_REVIEWED) as EnumMRORegisterStatus
  return outboundOrderStatusMap[status] || "--"
})

const detailStatusTagType = computed(() =>
  detailData.value?.status === EnumMRORegisterStatus.REVIEWED ? "success" : "danger"
)

const basicInfoConfig = computed(() => [
  { field: "mroOutboundNo", label: "出库单号：" },
  {
    field: "status",
    label: "状态：",
    slots: { content: "status-content" }
  },
  {
    field: "sourceType",
    label: "单据来源：",
    formatter: () =>
      sourceTypeMap[detailData.value?.sourceType as MroOutboundOrderSourceType] || "--"
  },
  {
    field: "sourceBizNo",
    label: "关联业务单号：",
    formatter: () => detailData.value?.sourceBizNo || "--"
  },
  {
    field: "createByName",
    label: "创建人：",
    formatter: () => detailData.value?.createByName || "--"
  },
  {
    field: "createTime",
    label: "创建时间：",
    formatter: () => formatDisplayTime(detailData.value?.createTime)
  }
])

const outboundInfoConfig = computed(() => [
  {
    field: "outboundTime",
    label: "出库时间：",
    formatter: () => formatDisplayTime(detailData.value?.outboundTime || detailData.value?.completeTime)
  },
  {
    field: "warehouseNo",
    label: "仓库编号：",
    formatter: () => detailData.value?.warehouseNo || "--"
  },
  {
    field: "warehouseName",
    label: "仓库名称：",
    formatter: () => detailData.value?.warehouseName || "--"
  },
  {
    field: "warehouseOperatorName",
    label: "仓管操作人：",
    formatter: () => detailData.value?.warehouseOperatorName || "--"
  },
  {
    field: "remark",
    label: "备注：",
    formatter: () => detailData.value?.remark || "--"
  }
])

const detailInfoConfig = computed(() => [...basicInfoConfig.value, ...outboundInfoConfig.value])

const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "sourceDetailType",
      label: "明细来源",
      minWidth: 120,
      align: "center",
      formatter: ({ sourceDetailType }: IMroOutboundOrderDetailItem) =>
        detailSourceTypeMap[sourceDetailType] || "--"
    },
    {
      prop: "mroModelNo",
      label: "MRO编号",
      minWidth: 150
    },
    {
      prop: "mroNo",
      label: "MRO序列号",
      minWidth: 150,
      formatter: ({ mroNo }: IMroOutboundOrderDetailItem) => mroNo || "--"
    },
    {
      prop: "mroModelName",
      label: "MRO名称",
      minWidth: 170
    },
    {
      prop: "mroSpec",
      label: "MRO规格",
      minWidth: 140,
      formatter: ({ mroSpec }: IMroOutboundOrderDetailItem) => mroSpec || "--"
    },
    {
      prop: "mroClassifyName",
      label: "MRO分类",
      minWidth: 140,
      formatter: ({ mroClassifyName }: IMroOutboundOrderDetailItem) => mroClassifyName || "--"
    },
    {
      prop: "mroCategoryName",
      label: "MRO类型",
      minWidth: 140,
      formatter: ({ mroCategoryName }: IMroOutboundOrderDetailItem) => mroCategoryName || "--"
    },
    {
      prop: "barcode",
      label: "标签码",
      minWidth: 160,
      formatter: ({ barcode }: IMroOutboundOrderDetailItem) => barcode || "--"
    },
    {
      prop: "outboundQty",
      label: "出库数量",
      width: 120,
      align: "center"
    },
    {
      prop: "warehouseLocationNo",
      label: "库位编号",
      minWidth: 140,
      formatter: ({ warehouseLocationNo }: IMroOutboundOrderDetailItem) => warehouseLocationNo || "--"
    },
    {
      prop: "warehouseLocationName",
      label: "库位名称",
      minWidth: 140,
      formatter: ({ warehouseLocationName }: IMroOutboundOrderDetailItem) =>
        warehouseLocationName || "--"
    },
    {
      prop: "remarks",
      label: "备注",
      minWidth: 180,
      formatter: ({ remarks }: IMroOutboundOrderDetailItem) => remarks || "--"
    }
  ]
})

const initData = () => {
  detailData.value = props.data ? cloneDeep(props.data) : undefined
  tableData.value = cloneDeep(props.data?.detailVos || [])
}

onMounted(() => {
  initData()
})

watch(
  () => props.data,
  () => {
    initData()
  }
)
</script>

<style scoped lang="scss">
.page-toolbar {
  margin-bottom: 12px;
}

.detail-section {
  margin-bottom: 12px;
}

.detail-table-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
}
</style>
