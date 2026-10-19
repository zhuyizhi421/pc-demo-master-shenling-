<template>
  <GeneralSearch
    :default-object-code="defaultObjectCode"
    @update-tab-name="updateTabName"
    @new-tab="onNewTab"
    @retrospect-or-trace="
      (params) => {
        emits('retrospect-or-trace', params)
      }
    "
    key="general-search"
  />
</template>

<script lang="ts" setup>
import type { TraceDirectionEnum } from "@/constant/enums"

import GeneralSearch from "./GeneralSearch/index.vue"

defineOptions({
  name: "SearchAndLocateTabPane"
})

interface IProps {
  defaultObjectCode?: string
}
defineProps<IProps>()

const emits = defineEmits<{
  "update-tab-name": [newTabName: string]
  "new-tab": [objectCode: string]
  "retrospect-or-trace": [
    params: {
      eventId: number
      direction: TraceDirectionEnum
      traceObjectCode: string[]
    }
  ]
}>()

function updateTabName(newTabName: string) {
  emits("update-tab-name", newTabName)
}

function onNewTab(objectCode: string) {
  emits("new-tab", objectCode)
}
</script>
