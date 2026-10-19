<template>
  <div
    class="time-line-item anchor-item"
    :class="{ 'active-anchor': index === currentAnchor }"
    v-for="(item, index) in anchors"
    :key="item.eventContentField"
    @click="toAnchor(item, index)"
  >
    <div class="timeline">
      <div class="dot"></div>
      <div class="line" v-if="index !== anchors.length - 1"></div>
    </div>
    {{ item.eventContentName }}
    <span class="anchor-num">
      <template v-if="item.num > 0">
        <img src="@/assets/icon/svg/obj_icon.svg" alt="" class="icon" />
        {{ item.num }}
      </template>
      <img v-if="item.includesSelf" src="@/assets/icon/svg/pos_icon.svg" alt="" class="icon" />
    </span>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue"

import type { IEventDetail } from "@/types/trace"

defineOptions({
  name: "SearchAndLocateEventAnchors"
})

interface IProps {
  eventDetail: IEventDetail
  selfObjectCodes: string[]
}
const props = defineProps<IProps>()

const emits = defineEmits<{
  "scroll-to-anchor": [index: string]
}>()

// 锚点
const anchors = computed(() => {
  return props.eventDetail.data.map((item) => {
    if (item.type === "KEY_VALUE") {
      return {
        eventContentField: item.eventContentField,
        eventContentName: item.eventContentName,
        num: item.value.filter((v) => v.component === "node").length,
        includesSelf: item.value.some((i) => {
          return props.selfObjectCodes.some((s) => i.component === "node" && s === i.value)
        })
      }
    } else {
      let num = 0
      let includesSelf = false
      item.contentBean.rows.forEach((row) => {
        num += row.filter((cell) => cell.component === "node").length

        if (!includesSelf) {
          includesSelf = row.some((cell) => {
            return props.selfObjectCodes.some(
              (i) => i === cell.content && cell.component === "node"
            )
          })
        }
      })
      return {
        eventContentField: item.eventContentField,
        eventContentName: item.eventContentName,
        num,
        includesSelf
      }
    }
  })
})

/** 锚点 */
const currentAnchor = ref<number>()
function toAnchor(data: any, index: number) {
  emits("scroll-to-anchor", data.eventContentField)
  currentAnchor.value = index
}
</script>

<style lang="scss" scoped>
@import "../index.scss";
</style>
