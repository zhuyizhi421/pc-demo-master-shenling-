<template>
  <CustomDialog v-model="visible" title="设备维修单详情" size="large">
    <DeviceRepairDetail
      v-if="props.id"
      :id="props.id"
      embedded
      action-type="view"
      @success="emit('success')"
    />
  </CustomDialog>
</template>

<script setup lang="ts">
import CustomDialog from "@/components/CustomDialog/index.vue"
import type { IEquipmentRepairPageItem } from "@/types/maintain/equipment-manage/equipment-repair"

import DeviceRepairDetail from "./DeviceRepairDetail.vue"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    id: string
    showRegisterIfNeed?: boolean
    detailDrawerData?: IEquipmentRepairPageItem
  }>(),
  {
    showRegisterIfNeed: true
  }
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success"): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value)
})
</script>
