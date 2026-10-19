<template>
  <div ref="tabPaneRef" class="tab-pane">
    <div class="row-1">
      <Graph
        :query-params="queryParams"
        v-model:selected-event-id="selectedEventId"
        @toggle-fullscreen="toggle"
      />
    </div>
    <div class="row-2">
      <RetrospectAndTraceEventContents
        v-if="eventDetails"
        :event-detail="eventDetails"
        :selfObjectCodes="[]"
        @new-tab="onNewTab"
        @retrospect-or-trace="retrospectOrTrace"
      />
      <el-empty v-else :description="'请点击事件查看详情'" style="border-top: 1px solid #dcdfe6" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useFullscreen } from "@vueuse/core"
import { ref, shallowRef, watch } from "vue"

import { queryEventDetail } from "@/api/trace"
import { TraceDirectionEnum } from "@/constant/enums"
import type { IEventDetail, IEventsGraphQueryParams } from "@/types/trace"

import RetrospectAndTraceEventContents from "./EventContents/index.vue"
import Graph from "./Graph/index.vue"

defineOptions({
  name: "RetrospectAndTraceTabPane"
})

interface IProps {
  queryParams: IEventsGraphQueryParams
}
defineProps<IProps>()

const emits = defineEmits<{
  "new-tab": [objectCode: string]
  "retrospect-or-trace": [
    params: {
      eventId: number
      direction: TraceDirectionEnum
      traceObjectCode: string[]
    }
  ]
}>()
function retrospectOrTrace(params: {
  eventId: number
  direction: TraceDirectionEnum
  traceObjectCode: string[]
}) {
  if (isFullscreen.value) {
    toggle()
  }
  emits("retrospect-or-trace", params)
}

/**
 * new tab: 新的普通查询
 */
function onNewTab(objectCode: string) {
  if (isFullscreen.value) {
    toggle()
  }
  emits("new-tab", objectCode)
}

const tabPaneRef = shallowRef<HTMLDivElement>()
const { toggle, isFullscreen } = useFullscreen(tabPaneRef)

/** 事件详情 */
const selectedEventId = ref<number>()

watch(selectedEventId, (newVal) => {
  if (newVal != undefined && !isNaN(newVal)) {
    // console.log(newVal)
    getEventDetails(newVal)
  } else {
    eventDetails.value = undefined
  }
})

const eventDetails = shallowRef<IEventDetail>()
async function getEventDetails(eventId: number) {
  try {
    const res = await queryEventDetail(eventId)
    eventDetails.value = res
  } catch (e) {
    // .
  }
}
</script>

<style lang="scss" scoped>
.tab-pane {
  width: 100%;
  height: calc(100% - 40px);
  display: flex;
  flex-direction: column;
  position: relative;

  .row-1 {
    width: 100%;
    flex: 1;
  }
  .row-2 {
    width: 100%;
    height: 300px;
  }
}
</style>
