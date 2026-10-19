<template>
  <CustomDialog v-model="visible" title="MRO台账信息" size="medium" :loading="loading">
    <CustomDescription :data="mroInfo || {}" :configs="configs" />
  </CustomDialog>
</template>

<script setup lang="ts">
import { queryMroInfoDetail } from "@/api/operation/mro/mro-info"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomDialog from "@/components/CustomDialog/index.vue"
import { EnumMROCurrentLocation, EnumMROCurrentLocationMap } from "@/constant/enums"
import type { IMroInfoPageListItem } from "@/types/maintain/mro-manage/mro-info"

import { formatLedgerStatus, formatRunningAlerts, formatRunningStatus } from "../status"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    mroId: string
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
})

const loading = ref(false)
const mroInfo = ref<IMroInfoPageListItem>()
const configs = computed<ICustomDescriptionConfig[]>(() => [
  {
    field: "mroNo",
    label: "MRO序列号："
  },
  {
    field: "barcode",
    label: "标签码：",
    formatter: ({ data }) => data.barcode || "-"
  },
  {
    field: "ledgerStatus",
    label: "台账状态：",
    formatter: ({ data }) => data.displayLedgerStatus || formatLedgerStatus(data.ledgerStatus)
  },
  {
    field: "runningStatus",
    label: "运转状态：",
    formatter: ({ data }) => formatRunningStatus(data.displayRunningStatus || data.runningStatus)
  },
  {
    field: "runningAlerts",
    label: "运转提醒：",
    formatter: ({ data }) => formatRunningAlerts(data.runningAlerts)
  },
  {
    field: "remainingLife",
    label: "剩余寿命：",
    formatter: ({ data }) => data.remainingLife ?? "-"
  },
  {
    field: "curLocation",
    label: "当前位置：",
    formatter: ({ data }) =>
      EnumMROCurrentLocationMap[data.curLocation as EnumMROCurrentLocation] || "-"
  },
  {
    field: "warehouseName",
    label: "所属仓库：",
    formatter: ({ data }) => data.warehouseName || "-"
  },
  {
    field: "warehouseLocationName",
    label: "所属库位：",
    formatter: ({ data }) => data.warehouseLocationName || "-"
  },
  {
    field: "productionAreaDisplayName",
    label: "生产区域：",
    formatter: ({ data }) => data.productionAreaDisplayName || "-"
  },
  {
    field: "remarks",
    label: "备注：",
    colspan: -1,
    formatter: ({ data }) => data.remarks || "-"
  }
])

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      void getMroInfo(props.mroId)
    }
  }
)

const getMroInfo = async (id: string) => {
  loading.value = true
  try {
    mroInfo.value = await queryMroInfoDetail({ id })
  } finally {
    loading.value = false
  }
}
</script>
