<template>
  <div class="search-and-locate">
    <div class="tab-container">
      <div class="tab-inner">
        <div
          v-for="(item, index) in tabs"
          :key="item.key"
          @click="currentTab = item.key"
          :class="{ active: item.key === currentTab }"
          class="tab-item"
        >
          {{ item.type === "general" ? `查询 ${calcIndex(index)}` : item.name }}
          <el-icon class="close-btn" size="16" @click.stop="closeTab(index)" v-if="tabs.length > 1"
            ><Close
          /></el-icon>
        </div>
        <div class="tab-item add-btn" @click="addTab('general')">
          <el-icon color="#999" size="16"><Plus /></el-icon>
        </div>
      </div>
    </div>
    <template v-for="(item, index) of tabs" :key="item.key">
      <div v-show="item.key === currentTab" style="width: 100%; height: 100%">
        <template v-if="item.type === 'general'">
          <TabPane
            :default-object-code="item.name"
            @update-tab-name="(newTabName: string) => updateTabName(index, newTabName)"
            @new-tab="onNewTab"
            @retrospect-or-trace="onRetrospectNewTab"
          />
        </template>
        <template v-if="item.type === 'retrospect'">
          <RetrospectTabPane
            :query-params="item.extra"
            @retrospect-or-trace="onRetrospectNewTab"
            @new-tab="onNewTab"
          />
        </template>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { Close, Plus } from "@element-plus/icons-vue"
import dayjs from "dayjs"
import { ref } from "vue"

import { TraceDirectionEnum, traceDirectionNameMap } from "@/constant/enums"

import RetrospectTabPane from "../RetrospectAndTrace/TabPane.vue"
import TabPane from "./TabPane.vue"

defineOptions({
  name: "TrackAndTrace"
})

interface ITab {
  type: "general" | "retrospect"
  name?: string
  key: string
  extra?: any
}
const tabs = ref<ITab[]>([{ type: "general", name: undefined, key: "1" }])
const currentTab = ref<string | undefined>("1")
const addTab = (type: "general" | "retrospect", tabName?: string, extra?: any) => {
  tabs.value.push({
    type,
    name: tabName,
    key: dayjs().valueOf() + "",
    extra
  })
  currentTab.value = tabs.value[tabs.value.length - 1].key
}
const closeTab = (index: number) => {
  if (currentTab.value === tabs.value[index].key) {
    if (index > 0) {
      currentTab.value = tabs.value[index - 1].key
    } else if (tabs.value.length > 0) {
      currentTab.value = tabs.value[1] ? tabs.value[1].key : undefined
    }
  }
  tabs.value.splice(index, 1)
}

const updateTabName = (index: number, newTabName: string) => {
  tabs.value[index].name = newTabName
}

const onNewTab = (objectCode: string) => {
  addTab("general", objectCode)
}

const onRetrospectNewTab = (params: {
  eventId: number
  direction: TraceDirectionEnum
  traceObjectCode: string[]
}) => {
  const { eventId, direction, traceObjectCode } = params

  addTab("retrospect", `${traceDirectionNameMap[direction]}链`, {
    eventId,
    direction,
    traceObjectCode
  })
}

const calcIndex = (index: number) => {
  const calcTabs = tabs.value.slice(0, index + 1)
  return calcTabs.filter((i) => i.type === "general").length
}
</script>

<style lang="scss" scoped>
.search-and-locate {
  width: 100%;
  height: 100%;
  overflow: hidden;

  .tab-container {
    height: 40px;
    display: flex;
    align-items: flex-end;
    padding: 0 12px;
    border-bottom: 1px solid #dcdfe6;
    overflow-x: auto;
    box-sizing: border-box;

    .tab-inner {
      height: 28px;
      width: 100%;
      white-space: nowrap;
    }

    .tab-item {
      height: 100%;
      background: #f4f4f5;
      border-radius: 4px 4px 0px 0px;
      border: 1px solid #e9e9eb;
      box-sizing: border-box;
      border-bottom: none;
      display: inline-flex;
      vertical-align: bottom;
      align-items: center;
      padding: 0 36px 0 22px;
      position: relative;
      font-size: 14px;
      color: #303133;
      cursor: pointer;

      .close-btn {
        position: absolute;
        right: 8px;
      }
      &.active {
        color: #ffffff;
        background-color: #1fbb7d;
      }
      + .tab-item {
        margin-left: 4px;
      }
      &.add-btn {
        width: 28px;
        padding: 0;
        justify-content: center;
        background: #fff;
      }
    }
  }
}
</style>
