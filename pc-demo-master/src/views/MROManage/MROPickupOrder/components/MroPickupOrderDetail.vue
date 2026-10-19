<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content">
      <div class="page-toolbar">
        <el-button plain icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>

      <CustomTitle title="MRO领用单详情" :is-table-title="false" show-short-bar />

      <CustomDescription :data="detailData || {}" :configs="descriptionConfig">
        <template #status-content>
          <el-tag :type="detailStatusTagType" size="small">
            {{ detailStatusText }}
          </el-tag>
        </template>
      </CustomDescription>
    </div>

    <div class="custom-table-container detail-table-container">
      <CustomTitle title="领用明细" />
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
  IMroPickupOrderDetailItem,
  IMroPickupOrderPageListItem,
  MroPickupDetailSourceType,
  MroPickupOrderSourceType
} from "@/types/maintain/mro-manage/mro-pickup-order"

defineOptions({
  name: "MroPickupOrderDetail"
})

const props = withDefaults(
  defineProps<{
    data?: IMroPickupOrderPageListItem
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "close"): void
}>()

const sourceTypeMap: Record<MroPickupOrderSourceType, string> = {
  manual_create: "手工新增",
  terminal_direct: "终端提交"
}
const pickupOrderStatusMap: Record<EnumMRORegisterStatus, string> = {
  [EnumMRORegisterStatus.NOT_REVIEWED]: "未复核",
  [EnumMRORegisterStatus.REVIEWED]: "已完成"
}

const detailSourceTypeMap: Record<MroPickupDetailSourceType, string> = {
  mro_info: "MRO信息",
  mro_resume: "MRO履历"
}

const detailData = ref<IMroPickupOrderPageListItem>()
const tableData = ref<IMroPickupOrderDetailItem[]>([])

const formatDisplayTime = (value?: string) => {
  if (!value) return "--"
  const target = dayjs(value)
  return target.isValid() ? target.format(FORMAT_TIME) : value
}

const detailStatusText = computed(() => {
  const status = (detailData.value?.status || EnumMRORegisterStatus.NOT_REVIEWED) as EnumMRORegisterStatus
  return pickupOrderStatusMap[status] || "--"
})

const detailStatusTagType = computed(() =>
  detailData.value?.status === EnumMRORegisterStatus.REVIEWED ? "success" : "danger"
)

const descriptionConfig = computed(() => [
  { field: "mroPickupNo", label: "领用单号：" },
  {
    field: "sourceType",
    label: "来源类型：",
    formatter: () => sourceTypeMap[detailData.value?.sourceType as MroPickupOrderSourceType] || "--"
  },
  {
    field: "linkedMroOutboundNo",
    label: "关联MRO出库单号：",
    formatter: () => detailData.value?.linkedMroOutboundNo || "--"
  },
  {
    field: "pickupEmpName",
    label: "领用人姓名：",
    formatter: () => detailData.value?.pickupEmpName || "--"
  },
  {
    field: "pickupEmpNo",
    label: "领用人工号：",
    formatter: () => detailData.value?.pickupEmpNo || "--"
  },
  {
    field: "pickupArea",
    label: "领用区域：",
    formatter: () => detailData.value?.pickupArea || "--"
  },
  {
    field: "pickupProdUnit",
    label: "领用生产单元：",
    formatter: () => detailData.value?.pickupProdUnit || "--"
  },
  {
    field: "pickupStation",
    label: "领用工位：",
    formatter: () => detailData.value?.pickupStation || "--"
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
    field: "pickupTime",
    label: "领用时间：",
    formatter: () => formatDisplayTime(detailData.value?.pickupTime)
  },
  {
    field: "status",
    label: "状态：",
    slots: { content: "status-content" }
  },
  {
    field: "remark",
    label: "备注：",
    formatter: () => detailData.value?.remark || "--"
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

const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "sourceDetailType",
      label: "明细来源",
      minWidth: 120,
      align: "center",
      formatter: ({ sourceDetailType }: IMroPickupOrderDetailItem) =>
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
      formatter: ({ mroNo }: IMroPickupOrderDetailItem) => mroNo || "--"
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
      formatter: ({ mroSpec }: IMroPickupOrderDetailItem) => mroSpec || "--"
    },
    {
      prop: "mroClassifyName",
      label: "MRO分类",
      minWidth: 140,
      formatter: ({ mroClassifyName }: IMroPickupOrderDetailItem) => mroClassifyName || "--"
    },
    {
      prop: "mroCategoryName",
      label: "MRO类型",
      minWidth: 140,
      formatter: ({ mroCategoryName }: IMroPickupOrderDetailItem) => mroCategoryName || "--"
    },
    {
      prop: "barcode",
      label: "标签码",
      minWidth: 160,
      formatter: ({ barcode }: IMroPickupOrderDetailItem) => barcode || "--"
    },
    {
      prop: "pickupQty",
      label: "领用数量",
      width: 120,
      align: "center"
    },
    {
      prop: "warehouseLocationNo",
      label: "库位编号",
      minWidth: 120,
      formatter: ({ warehouseLocationNo }: IMroPickupOrderDetailItem) => warehouseLocationNo || "--"
    },
    {
      prop: "warehouseLocationName",
      label: "库位名称",
      minWidth: 140,
      formatter: ({ warehouseLocationName }: IMroPickupOrderDetailItem) =>
        warehouseLocationName || "--"
    },
    {
      prop: "remarks",
      label: "备注",
      minWidth: 180,
      formatter: ({ remarks }: IMroPickupOrderDetailItem) => remarks || "--"
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

.detail-table-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
}
</style>
