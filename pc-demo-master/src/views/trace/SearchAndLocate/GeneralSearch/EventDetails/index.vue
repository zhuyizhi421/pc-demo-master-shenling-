<template>
  <div ref="eventsContainerRef" class="events">
    <EventContents
      v-if="eventDetail"
      ref="eventContentsRef"
      :event-detail="eventDetail"
      :self-object-codes="selfObjectCodes"
      @new-tab="onNewTab"
      @retrospect-or-trace="retrospectOrTrace"
    />
  </div>
  <div class="anchors">
    <EventAnchors
      v-if="eventDetail"
      :event-detail="eventDetail"
      :self-object-codes="selfObjectCodes"
      @scroll-to-anchor="toAnchor"
    />
  </div>
</template>

<script lang="ts" setup>
import { shallowRef } from "vue"

import { TraceDirectionEnum } from "@/constant/enums"
import type { IEventDetail } from "@/types/trace"

import EventAnchors from "./EventAnchors.vue"
import EventContents from "./EventContents.vue"

defineOptions({
  name: "SearchAndLocateEventDetails"
})

interface IProps {
  eventDetail?: IEventDetail
  selfObjectCodes: string[]
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

/**
 * new tab: 新的查询
 */
function onNewTab(objectCode: string) {
  emits("new-tab", objectCode)
}

/**
 * 如果当前路由已经为“追踪追溯链”，则不需要跳转
 */
function retrospectOrTrace(params: {
  eventId: number
  direction: TraceDirectionEnum
  traceObjectCode: string[]
}) {
  emits("retrospect-or-trace", params)
}

/** 锚点 */
const eventsContainerRef = shallowRef<HTMLDivElement>()
const eventContentsRef = shallowRef<InstanceType<typeof EventContents>>()
function toAnchor(id: string) {
  if (eventsContainerRef.value) {
    eventContentsRef.value?.scrollToAnchor(id, eventsContainerRef.value)
  }
}
</script>

<style lang="scss" scoped>
.events {
  // width: calc(100% - 201px);
  flex: 1;
  padding: 20px 0 20px;
  box-sizing: border-box;
  height: 100%;
  overflow: auto;
  position: relative;
}
.anchors {
  width: 200px;
  box-sizing: border-box;
  border-left: 1px solid #dcdfe6;
  padding: 24px 16px;
  overflow: auto;
  height: 100%;
}
</style>
