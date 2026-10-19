<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content">
      <div class="page-toolbar">
        <el-button plain icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>

      <CustomTitle title="基本信息" :is-table-title="false" show-short-bar />

      <CustomDescription :data="detailData || {}" :configs="descriptionConfig" :label-width="140">
        <template #status-content>
          <el-tag :type="detailStatusTagType" size="small">
            {{ detailStatusText }}
          </el-tag>
        </template>
      </CustomDescription>
    </div>

    <div class="custom-table-container detail-table-container">
      <CustomTitle title="还回明细" />
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
  IMroReturnOrderDetailItem,
  IMroReturnOrderPageListItem,
  MroReturnDetailSourceType,
  MroReturnOrderSourceType
} from "@/types/maintain/mro-manage/mro-return-order"

defineOptions({
  name: "MroReturnOrderDetail"
})

const props = withDefaults(
  defineProps<{
    data?: IMroReturnOrderPageListItem
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "close"): void
}>()

const sourceTypeMap: Record<MroReturnOrderSourceType, string> = {
  manual_create: "手工新增",
  terminal_direct: "终端提交"
}
const returnOrderStatusMap: Record<EnumMRORegisterStatus, string> = {
  [EnumMRORegisterStatus.NOT_REVIEWED]: "未复核",
  [EnumMRORegisterStatus.REVIEWED]: "已完成"
}

const detailSourceTypeMap: Record<MroReturnDetailSourceType, string> = {
  mro_info: "MRO信息",
  mro_resume: "MRO履历"
}

const detailData = ref<IMroReturnOrderPageListItem>()
const tableData = ref<IMroReturnOrderDetailItem[]>([])

const formatDisplayTime = (value?: string) => {
  if (!value) return "--"
  const target = dayjs(value)
  return target.isValid() ? target.format(FORMAT_TIME) : value
}

const detailStatusText = computed(() => {
  const status = (detailData.value?.status ||
    EnumMRORegisterStatus.NOT_REVIEWED) as EnumMRORegisterStatus
  return returnOrderStatusMap[status] || "--"
})

const detailStatusTagType = computed(() =>
  detailData.value?.status === EnumMRORegisterStatus.REVIEWED ? "success" : "danger"
)

const descriptionConfig = computed(() => [
  { field: "mroReturnNo", label: "还回单号：" },
  {
    field: "sourceType",
    label: "来源类型：",
    formatter: () => sourceTypeMap[detailData.value?.sourceType as MroReturnOrderSourceType] || "--"
  },
  {
    field: "linkedMroInboundNo",
    label: "关联MRO入库单号：",
    formatter: () => detailData.value?.linkedMroInboundNo || "--"
  },
  {
    field: "returnEmpName",
    label: "还回人姓名：",
    formatter: () => detailData.value?.returnEmpName || "--"
  },
  {
    field: "returnEmpNo",
    label: "还回人工号：",
    formatter: () => detailData.value?.returnEmpNo || "--"
  },
  {
    field: "returnArea",
    label: "还回区域：",
    formatter: () => detailData.value?.returnArea || "--"
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
    field: "returnTime",
    label: "还回时间：",
    formatter: () => formatDisplayTime(detailData.value?.returnTime)
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
      formatter: ({ sourceDetailType }: IMroReturnOrderDetailItem) =>
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
      formatter: ({ mroNo }: IMroReturnOrderDetailItem) => mroNo || "--"
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
      formatter: ({ mroSpec }: IMroReturnOrderDetailItem) => mroSpec || "--"
    },
    {
      prop: "mroClassifyName",
      label: "MRO分类",
      minWidth: 140,
      formatter: ({ mroClassifyName }: IMroReturnOrderDetailItem) => mroClassifyName || "--"
    },
    {
      prop: "mroCategoryName",
      label: "MRO类型",
      minWidth: 140,
      formatter: ({ mroCategoryName }: IMroReturnOrderDetailItem) => mroCategoryName || "--"
    },
    {
      prop: "barcode",
      label: "标签码",
      minWidth: 160,
      formatter: ({ barcode }: IMroReturnOrderDetailItem) => barcode || "--"
    },
    {
      prop: "returnQty",
      label: "还回数量",
      width: 120,
      align: "center"
    },
    {
      prop: "warehouseLocationNo",
      label: "库位编号",
      minWidth: 120,
      formatter: ({ warehouseLocationNo }: IMroReturnOrderDetailItem) => warehouseLocationNo || "--"
    },
    {
      prop: "warehouseLocationName",
      label: "库位名称",
      minWidth: 140,
      formatter: ({ warehouseLocationName }: IMroReturnOrderDetailItem) =>
        warehouseLocationName || "--"
    },
    {
      prop: "remarks",
      label: "备注",
      minWidth: 180,
      formatter: ({ remarks }: IMroReturnOrderDetailItem) => remarks || "--"
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
