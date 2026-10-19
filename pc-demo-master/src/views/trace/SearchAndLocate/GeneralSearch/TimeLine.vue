<template>
  <div class="tnt-title" style="margin-top: 0">
    时间线
    <div class="sort-btn" @click="changeSort">
      <img
        src="@/assets/icon/svg/sort_icon.svg"
        alt=""
        class="icon"
        :class="[sort === RelatedEventsSortEnum.升序 ? 'reverse' : '']"
      />
      {{ sort === RelatedEventsSortEnum.升序 ? "顺序" : "倒序" }}
    </div>
  </div>
  <div class="time-line-container">
    <div
      v-for="(item, index) of listComputed"
      :key="item.eventId"
      :class="['new-time-line-item', { current: item.eventId === currentEventId }]"
      @click="onClick(item.eventId)"
    >
      <div class="timeline" style="margin-left: 20px">
        <div class="dot"></div>
        <div class="line" v-if="index !== listComputed.length - 1"></div>
      </div>
      <div>
        <div class="info-box">
          <div class="name">{{ item.eventTypeName }}</div>
          <div class="" v-for="(k, index) in item.memo" :key="index">
            {{ k.field }}：{{ k.value }}
          </div>
          <div class="" v-if="item.operator">人员：{{ item.operator }}</div>
        </div>
        <div class="base-info">
          <div class="datetime">
            {{ item.eventTime }}
          </div>
          <div class="datetime">id: {{ item.eventId }}</div>
        </div>
      </div>
    </div>
    <div v-if="showLoadMore" class="load-more">
      <el-button @click="loadMore">加载更多</el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import dayjs from "dayjs"
import { ElMessage } from "element-plus"
import { computed } from "vue"

import { type IRelatedEvent, RelatedEventsSortEnum } from "@/types/trace"

defineOptions({
  name: "SearchAndLocateTimeLine"
})

interface IProps {
  sort: RelatedEventsSortEnum
  currentEventId: number | undefined
  eventList: IRelatedEvent[]
  showLoadMore: boolean
}
const props = defineProps<IProps>()

const emits = defineEmits<{
  changeCurrentEventId: [eventId: number]
  "change-sort": [newVal: RelatedEventsSortEnum]
  "load-more": []
}>()

function changeSort() {
  if (props.eventList.length === 0) {
    ElMessage.warning("时间线为空")
    return
  }

  if (props.sort === RelatedEventsSortEnum.升序) {
    emits("change-sort", RelatedEventsSortEnum.降序)
  } else {
    emits("change-sort", RelatedEventsSortEnum.升序)
  }
}

const listComputed = computed(() => {
  return props.eventList.map((item) => {
    return {
      ...item,
      eventTime: dayjs(item.eventTime).format("YYYY-MM-DD HH:mm")
    }
  })
})

function onClick(eventId: number) {
  if (eventId === props.currentEventId) {
    return
  }
  emits("changeCurrentEventId", eventId)
}

function loadMore() {
  emits("load-more")
}

// const tntList = [
//   {
//     eventId: 1,
//     operator: 'operator',
//     eventTime: '2024-04-08 08:30',
//     eventType: 'event type',
//     memo: [
//       {
//         field: 'field',
//         value: 'value',
//       }
//     ]
//   },
//   {
//     eventId: 2,
//     operator: 'operator',
//     eventTime: '2024-04-08 08:30',
//     eventType: 'event type',
//     memo: [
//       {
//         field: 'field',
//         value: 'value',
//       },
//       {
//         field: 'field',
//         value: 'value',
//       },
//       {
//         field: 'field',
//         value: 'value',
//       },
//     ]
//   },
//   {
//     eventId: 3,
//     operator: 'operator',
//     eventTime: '2024-04-08 08:30',
//     eventType: 'event type',
//     memo: [
//       {
//         field: 'field',
//         value: 'value',
//       },
//       {
//         field: 'field',
//         value: 'value',
//       },
//     ]
//   },
// ]

defineExpose({
  onClick
})
</script>

<style lang="scss" scoped>
@import "./index.scss";

.new-time-line-item {
  display: flex;
  cursor: pointer;
  + .new-time-line-item {
    margin-top: 20px;
  }
  .base-info {
    display: flex;
    // flex-direction: column;
    align-items: center;
    justify-content: space-between;
    // gap: 20px;
    font-size: 12px;
    color: #303133;
    line-height: 22px;
    padding-left: 20px;
    padding-right: 0px;
    margin-bottom: 8px;
    .datetime {
      font-size: 12px;
      color: #909399;
    }
  }
  .timeline {
    width: 14px;
    position: relative;
    .dot {
      position: absolute;
      left: 0;
      top: 0;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #cdd0d6;
      display: inline-block;
      box-sizing: border-box;
    }
    .line {
      position: absolute;
      top: 14px;
      left: 6.5px;
      width: 1px;
      background: #e4e7ed;
      bottom: -27px;
    }
  }
  &.current {
    .timeline .dot {
      background: #409eff;
    }
    .info-box {
      background: #fafcff;
      color: #409eff;
      .name {
        color: #1989fa;
      }
    }
  }
  .info-box {
    margin-left: 16px;
    width: 246px;
    box-sizing: border-box;
    padding: 12px 20px;
    box-shadow: var(--el-box-shadow-lighter);
    font-size: 12px;
    color: #303133;
    line-height: 18px;
    .name {
      font-size: 14px;
      font-weight: 500;
      line-height: 20px;
      margin-bottom: 8px;
    }
  }
}

.load-more {
  margin-top: 20px;
  width: 100%;
  text-align: center;
}
</style>
