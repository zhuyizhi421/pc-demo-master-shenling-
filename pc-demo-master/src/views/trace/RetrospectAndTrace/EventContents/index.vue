<template>
  <el-tabs addable class="event-content-tabs" :type="'border-card'">
    <template #add-icon>
      <el-button :size="'small'" @click="drawerVisible = true">详情</el-button>
    </template>
    <template v-for="item of dataList" :key="item.eventContentName">
      <el-tab-pane>
        <template #label>
          <el-space :size="6">
            {{ item.eventContentName }}
            <template v-if="item.calcedNodeNum > 0">
              <img src="@/assets/icon/svg/obj_icon.svg" style="width: 14px" />
              <span style="color: #409eff">{{ item.calcedNodeNum }}</span>
            </template>
          </el-space>
        </template>
        <div v-if="item.type === 'KEY_VALUE'" class="key-value-container">
          <div v-for="(k, index) in item.value" :key="index" class="key-value-item">
            <span class="key">{{ k.name }}</span>
            <template v-if="k.component === 'node'">
              <!-- <span class="value current" v-if="k.value === name" title="自身">{{ k.value }}</span> -->
              <span class="value obj" title="点击追踪追溯" @click="toTnt(k.value)">{{
                k.value
              }}</span>
            </template>
            <span class="value link" v-else-if="k.url" title="点击跳转" @click="toUrl(k.url)">{{
              k.value
            }}</span>
            <span class="value" v-else>{{ k.value }}</span>
          </div>
        </div>
        <div class="table-container" v-else-if="item.type === 'LIST'">
          <CustomTable
            v-model:table-data="item.contentBean.rows"
            :config="tableConfig(item)"
            class="custom-table"
          >
            <template
              v-for="(column, index) in item.contentBean.title"
              :key="index"
              #[`${column}-default`]="{ row }"
            >
              <template v-if="row[index].component === 'node'">
                <span class="value obj" title="点击追踪追溯" @click="toTnt(row[index].content)">{{
                  row[index].content
                }}</span>
              </template>
              <span
                class="value link"
                v-else-if="row[index].url"
                title="点击跳转"
                @click="toUrl(row[index].url)"
                >{{ row[index].content }}</span
              >
              <span class="value" v-else>{{ row[index].content }}</span>
            </template>
          </CustomTable>
        </div>
      </el-tab-pane>
    </template>
  </el-tabs>

  <CustomDrawer v-model="drawerVisible" size="medium" title="查看详情" class="event-content-drawer">
    <div style="display: flex; height: 100%">
      <EventContents
        :event-detail="eventDetail"
        :self-object-codes="[]"
        @new-tab="onNewTab"
        @retrospect-or-trace="retrospectOrTrace"
      />
    </div>
    <template #footer>
      <el-button @click="drawerVisible = false">取 消</el-button>
    </template>
  </CustomDrawer>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, ref } from "vue"

import CustomDrawer from "@/components/CustomDrawer/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import { TraceDirectionEnum } from "@/constant/enums"
import type { IEventDetail, IEventDetailData, IEventDetailListData } from "@/types/trace"

const EventContents = defineAsyncComponent(
  () => import("@/views/trace/SearchAndLocate/GeneralSearch/EventDetails/index.vue")
)

defineOptions({
  name: "RetrospectAndTraceEventContents"
})

interface IProps {
  eventDetail: IEventDetail
  selfObjectCodes: string[]
}
const props = defineProps<IProps>()

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
// function retrospectOrTrace () {
//   emits('retrospect-or-trace')
// }

const tableConfig = (item: IEventDetailListData) => {
  return {
    height: "100%",
    columns: item.contentBean.title.map((column) => ({
      label: column,
      minWidth: 150,
      slots: {
        default: `${column}-default`
      }
    }))
  } as ITableConfig
}

/**
 * new tab: 新的普通查询
 */
function onNewTab(objectCode: string) {
  drawerVisible.value = false
  emits("new-tab", objectCode)
}

const toTnt = (objectCode: string) => {
  emits("new-tab", objectCode)
}
const toUrl = (url: any) => {
  if (typeof url === "string") {
    window.open(url)
  }
}

function calcNodeNum(item: IEventDetailData) {
  if (item.type === "KEY_VALUE") {
    return item.value.filter((v) => v.component === "node").length
  } else {
    let num = 0
    item.contentBean.rows.forEach((row) => {
      num += row.filter((cell) => cell.component === "node").length
    })
    return num
  }
}

const dataList = computed(() => {
  return props.eventDetail.data.map((item) => {
    return {
      ...item,
      calcedNodeNum: calcNodeNum(item)
    }
  })
})

const drawerVisible = ref(false)

function retrospectOrTrace(params: {
  eventId: number
  direction: TraceDirectionEnum
  traceObjectCode: string[]
}) {
  drawerVisible.value = false
  emits("retrospect-or-trace", params)
}
</script>

<style lang="scss" scoped>
.event-content-tabs {
  height: 100%;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;

  :deep(.el-tabs__content) {
    width: 100%;
    height: calc(100% - 39px);
    padding: 0;
    // background-color: rgb(238, 238, 238);
    // overflow: auto;
  }
  :deep(.el-tab-pane) {
    height: 100%;
  }
  :deep(.el-tabs__new-tab) {
    width: 48px;
    margin: 10px;
  }
}

.key-value-container {
  padding: 10px 10px;
  box-sizing: border-box;
  height: 100%;
  overflow: auto;
  // margin-top: 10px;
  // margin-bottom: 10px;
  .key-value-item {
    padding: 6px 10px;
    box-sizing: border-box;
    width: 25%;
    display: inline-flex;
    align-items: center;
    color: #303133;
  }
  .key {
    font-size: 14px;
    color: #909399;
    margin-right: 12px;
  }
  .value {
    font-size: 14px;
    flex: 1;
    word-break: break-all;
  }
  .icon {
    margin-left: 4px;
  }
}
.table-container {
  height: 100%;
  padding: 16px 16px;
  :deep(.el-table th.el-table__cell) {
    background: #f1f3f9;
    font-size: 14px;
    font-weight: 400;
    color: #909399;
  }
  :deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
    background: #f8f9fc;
  }
}
.link {
  color: #1989fa;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  &::after {
    display: inline-block;
    content: "";
    background: url("@/assets/icon/svg/link_icon.svg") center no-repeat;
    background-size: 100%;
    width: 16px;
    height: 16px;
    margin-left: 4px;
  }
}
.obj {
  color: #1989fa;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  &.current {
    color: #303133;
    cursor: default;
    &::after {
      display: inline-block;
      content: "";
      background: url("@/assets/icon/svg/pos_icon.svg") center no-repeat;
      background-size: 100%;
      width: 16px;
      height: 16px;
      margin-left: 4px;
    }
  }
  &::after {
    display: inline-block;
    content: "";
    background: url("@/assets/icon/svg/obj_icon.svg") center no-repeat;
    background-size: 100%;
    width: 16px;
    height: 16px;
    margin-left: 4px;
  }
}
.event-content-drawer {
  :deep(.custom-drawer-content) {
    padding: 0 !important;
  }
}
.custom-table {
  height: 100%;
}
</style>
