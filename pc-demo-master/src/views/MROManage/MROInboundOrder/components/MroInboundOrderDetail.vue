<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content">
      <div class="page-toolbar">
        <el-button plain icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>

      <CustomTitle title="MRO入库单详情" :is-table-title="false" show-short-bar />

      <CustomDescription :data="detailData || {}" :configs="descriptionConfig">
        <template #status-content>
          <el-tag :type="detailStatusTagType" size="small">
            {{ detailStatusText }}
          </el-tag>
        </template>
      </CustomDescription>
    </div>

    <div class="custom-table-container detail-table-container">
      <CustomTitle title="入库明细" />
      <CustomTable v-model:table-data="tableData" :config="tableConfig" />
    </div>
  </div>
</template>

<script setup lang="ts">
import CustomDescription from "@/components/CustomDescription/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import { EnumMRORegisterStatus, EnumMRORegisterStatusMap } from "@/constant/enums"
import { FORMAT_TIME } from "@/constant/time"
import type {
  IMroInboundOrderDetailItem,
  IMroInboundOrderPageListItem,
  MroInboundDetailSourceType,
  MroInboundOrderSourceType
} from "@/types/maintain/mro-manage/mro-inbound-order"

defineOptions({
  name: "MroInboundOrderDetail"
})

const props = withDefaults(
  defineProps<{
    data?: IMroInboundOrderPageListItem
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "close"): void
}>()

const sourceTypeMap: Record<MroInboundOrderSourceType, string> = {
  manual_create: "手工新增",
  register_auto: "登记自动生成"
}

const detailSourceTypeMap: Record<MroInboundDetailSourceType, string> = {
  mro_info: "MRO信息",
  mro_resume: "MRO履历"
}

const detailData = ref<IMroInboundOrderPageListItem>()
const tableData = ref<IMroInboundOrderDetailItem[]>([])

const formatDisplayTime = (value?: string) => {
  if (!value) return "--"
  const target = dayjs(value)
  return target.isValid() ? target.format(FORMAT_TIME) : value
}

const detailStatusText = computed(() => {
  const status = (detailData.value?.status || EnumMRORegisterStatus.NOT_REVIEWED) as EnumMRORegisterStatus
  return EnumMRORegisterStatusMap[status] || "--"
})

const detailStatusTagType = computed(() =>
  detailData.value?.status === EnumMRORegisterStatus.REVIEWED ? "success" : "danger"
)

const descriptionConfig = computed(() => [
  { field: "mroInboundNo", label: "入库单号：" },
  {
    field: "sourceType",
    label: "来源类型：",
    formatter: () => sourceTypeMap[detailData.value?.sourceType as MroInboundOrderSourceType] || "--"
  },
  {
    field: "sourceBizNo",
    label: "关联来源单号：",
    formatter: () => detailData.value?.sourceBizNo || "--"
  },
  {
    field: "mroInboundEmpName",
    label: "入库人：",
    formatter: () => detailData.value?.mroInboundEmpName || "--"
  },
  {
    field: "warehouseName",
    label: "仓库名称：",
    formatter: () => detailData.value?.warehouseName || "--"
  },
  {
    field: "warehouseNo",
    label: "仓库编号：",
    formatter: () => detailData.value?.warehouseNo || "--"
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
  },
  {
    field: "checkByName",
    label: "复核人：",
    formatter: () => detailData.value?.checkByName || "--"
  },
  {
    field: "completeTime",
    label: "入库完成时间：",
    formatter: () => formatDisplayTime(detailData.value?.completeTime)
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
      formatter: ({ sourceDetailType }: IMroInboundOrderDetailItem) =>
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
      formatter: ({ mroNo }: IMroInboundOrderDetailItem) => mroNo || "--"
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
      formatter: ({ mroSpec }: IMroInboundOrderDetailItem) => mroSpec || "--"
    },
    {
      prop: "mroClassifyName",
      label: "MRO分类",
      minWidth: 140,
      formatter: ({ mroClassifyName }: IMroInboundOrderDetailItem) => mroClassifyName || "--"
    },
    {
      prop: "mroCategoryName",
      label: "MRO类型",
      minWidth: 140,
      formatter: ({ mroCategoryName }: IMroInboundOrderDetailItem) => mroCategoryName || "--"
    },
    {
      prop: "barcode",
      label: "标签码",
      minWidth: 160,
      formatter: ({ barcode }: IMroInboundOrderDetailItem) => barcode || "--"
    },
    {
      prop: "inboundQty",
      label: "入库数量",
      width: 120,
      align: "center"
    },
    {
      prop: "warehouseLocationNo",
      label: "库位编号",
      minWidth: 120,
      formatter: ({ warehouseLocationNo }: IMroInboundOrderDetailItem) => warehouseLocationNo || "--"
    },
    {
      prop: "warehouseLocationName",
      label: "库位名称",
      minWidth: 140,
      formatter: ({ warehouseLocationName }: IMroInboundOrderDetailItem) =>
        warehouseLocationName || "--"
    },
    {
      prop: "remarks",
      label: "备注",
      minWidth: 180,
      formatter: ({ remarks }: IMroInboundOrderDetailItem) => remarks || "--"
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
