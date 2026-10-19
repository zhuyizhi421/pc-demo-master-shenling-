<template>
  <CustomDialog v-model="dialogVisible" title="工艺参数配置界面" size="large" @close="emit('close')">
    <CraftParamsConfigPanel
      :data="props.data"
      :tech-version-id="props.techVersionId"
      :read-only="props.readOnly"
      show-cancel
      @close="emit('close')"
      @success="onSuccess"
    />
  </CustomDialog>
</template>

<script setup lang="ts">
import CustomDialog from "@/components/CustomDialog/index.vue"
import type { IProduceBasicMachineCraftItem } from "@/types/base-info/craftRoute"

import CraftParamsConfigPanel from "./CraftParamsConfigPanel.vue"

interface ITableRow extends IProduceBasicMachineCraftItem {
  tempId?: string
}

const props = withDefaults(defineProps<{ data: any; techVersionId: string; readOnly?: boolean }>(), {
  data: () => ({}),
  readOnly: false
})

const emit = defineEmits<{
  (e: "close"): void
  (e: "success", data: ITableRow[]): void
}>()

const dialogVisible = ref(true)

const onSuccess = (data: ITableRow[]) => {
  emit("success", data)
}
</script>
