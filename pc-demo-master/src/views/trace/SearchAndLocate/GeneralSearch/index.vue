<template>
  <SearchBar :default-object-code="defaultObjectCode" @confirm="onConfirm" />
  <div class="general-search">
    <div class="left">
      <TimeLine
        ref="timeLineRef"
        :sort="queryParams.sort"
        :current-event-id="currentEventId"
        :event-list="relatedEvents"
        :show-load-more="showLoadMore"
        @change-sort="onSortChane"
        @change-current-event-id="onCurrentEventIdChange"
        @load-more="loadMoreRelatedEvents"
      />
    </div>
    <EventDetails
      :event-detail="eventDetail"
      :self-object-codes="[queryParams.traceObjectCode]"
      @new-tab="onNewTab"
      @retrospect-or-trace="retrospectOrTrace"
    />
  </div>
</template>

<script lang="ts" setup>
import { ElMessageBox } from "element-plus"
import { computed, ref, shallowRef } from "vue"

import { queryEventDetail, queryEventsGraph, queryRelatedEvents } from "@/api/trace"
import { TraceDirectionEnum } from "@/constant/enums"
import { type IEventDetail, type IRelatedEvent, RelatedEventsSortEnum } from "@/types/trace"

import EventDetails from "./EventDetails/index.vue"
import SearchBar from "./SearchBar.vue"
import TimeLine from "./TimeLine.vue"

defineOptions({
  name: "SearchAndLocateGeneralSearch"
})

interface IProps {
  defaultObjectCode?: string
}
const props = defineProps<IProps>()

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

const timeLineRef = shallowRef<InstanceType<typeof TimeLine>>()

/** 查询 */
const queryParams = ref<{
  traceObjectCode: string
  sort: RelatedEventsSortEnum
}>({
  traceObjectCode: "",
  sort: RelatedEventsSortEnum.降序
})

const pageQueryResult = ref({
  pageNum: 0,
  pageSize: 0,
  total: 0
})
const relatedEvents = ref<IRelatedEvent[]>([])
async function getRelatedEvents() {
  try {
    const res = await queryRelatedEvents({
      queryParam: {
        traceObjectCode: queryParams.value.traceObjectCode
      },
      sort: [{ field: "eventTime", order: queryParams.value.sort }]
    })
    if (Number(res.total) === 0) {
      ElMessageBox.alert("未查询到相关信息", "提示", {
        confirmButtonText: "确认",
        closeOnClickModal: true
      }).catch(() => {
        // .
      })
      return
    }

    pageQueryResult.value = {
      pageNum: Number(res.current),
      pageSize: Number(res.size),
      total: Number(res.total)
    }
    relatedEvents.value = res.records
    // 新增默认选中第一个事件
    nextTick(() => {
      if (relatedEvents.value.length) {
        timeLineRef.value?.onClick(relatedEvents.value[0].eventId)
      }
    })

    emits("update-tab-name", queryParams.value.traceObjectCode)
  } catch (e) {
    // .
  }
}

/** load more */
const showLoadMore = computed(() => {
  const { pageNum, pageSize, total } = pageQueryResult.value

  return pageNum * pageSize < total
})
async function loadMoreRelatedEvents() {
  const { pageNum, pageSize, total } = pageQueryResult.value

  if (pageNum * pageSize >= total) {
    return
  }

  try {
    const res = await queryRelatedEvents({
      queryParam: {
        traceObjectCode: queryParams.value.traceObjectCode
      },
      pageQuery: {
        pageNum: pageQueryResult.value.pageNum + 1,
        pageSize: pageQueryResult.value.pageSize
      },
      sort: [{ field: "eventTime", order: queryParams.value.sort }]
    })

    pageQueryResult.value = {
      pageNum: Number(res.current),
      pageSize: Number(res.size),
      total: Number(res.total)
    }
    relatedEvents.value = [...relatedEvents.value, ...res.records]
  } catch (e) {
    // .
  }
}

if (props.defaultObjectCode) {
  queryParams.value.traceObjectCode = props.defaultObjectCode
  getRelatedEvents()
}

/** 事件详情 */
const eventDetail = shallowRef<IEventDetail>()
async function getEventDetail(eventId: number) {
  try {
    const res = await queryEventDetail(eventId)
    // TODO：测试数据，打开上述代码
    // const res = {
    //   eventId: 2781,
    //   eventTypeName: "生产报工",
    //   eventTypeField: "productionReporting",
    //   data: [
    //     {
    //       eventContentField: "reportInfo",
    //       eventContentName: "报工信息",
    //       type: "KEY_VALUE",
    //       value: [
    //         {
    //           name: "产品名称",
    //           field: "productName",
    //           value: "唱片",
    //           component: "text",
    //           uri: null,
    //           url: null
    //         },
    //         {
    //           name: "产品编号",
    //           field: "productNo",
    //           value: "250326111440EU",
    //           component: "text",
    //           uri: null,
    //           url: null
    //         },
    //         {
    //           name: "产品图号",
    //           field: "productDrawingNo",
    //           value: "CPcpth",
    //           component: "text",
    //           uri: null,
    //           url: null
    //         },
    //         {
    //           name: "输出数量",
    //           field: "outputQuantity",
    //           value: "3.0",
    //           component: "text",
    //           uri: null,
    //           url: null
    //         },
    //         {
    //           name: "单位",
    //           field: "unit",
    //           value: "件",
    //           component: "text",
    //           uri: null,
    //           url: null
    //         },
    //         {
    //           name: "生产任务",
    //           field: "productionTask",
    //           value: "SCRW20250702018",
    //           component: "text",
    //           uri: null,
    //           url: null
    //         },
    //         {
    //           name: "生产订单",
    //           field: "productionOrder",
    //           value: "SC250702003",
    //           component: "text",
    //           uri: null,
    //           url: null
    //         },
    //         {
    //           name: "工序",
    //           field: "process",
    //           value: "10",
    //           component: "text",
    //           uri: null,
    //           url: null
    //         },
    //         {
    //           name: "工艺名称",
    //           field: "processName",
    //           value: "电镀",
    //           component: "text",
    //           uri: null,
    //           url: null
    //         },
    //         {
    //           name: "生产执行单位",
    //           field: "productionUnit",
    //           value: "劲焱A-4-3工位",
    //           component: "text",
    //           uri: null,
    //           url: null
    //         },
    //         {
    //           name: "报工班次",
    //           field: "reportShift",
    //           value: "",
    //           component: "text",
    //           uri: null,
    //           url: null
    //         },
    //         {
    //           name: "报工时间",
    //           field: "reportTime",
    //           value: "2025-07-02 16:51:30.694",
    //           component: "text",
    //           uri: null,
    //           url: null
    //         }
    //       ],
    //       contentBean: null
    //     },
    //     {
    //       eventContentField: "outputDetails",
    //       eventContentName: "报工详情：产出",
    //       type: "LIST",
    //       value: null,
    //       contentBean: {
    //         title: ["产品标签码", "产品名称", "产品编号", "产品图号", "批次号", "数量", "单位"],
    //         rows: [
    //           [
    //             {
    //               field: "productLabelCode",
    //               component: "node",
    //               uri: null,
    //               content: "250702165129zD",
    //               url: null
    //             },
    //             {
    //               field: "productName",
    //               component: "text",
    //               uri: null,
    //               content: "唱片",
    //               url: null
    //             },
    //             {
    //               field: "productNo",
    //               component: "text",
    //               uri: null,
    //               content: "250326111440EU",
    //               url: null
    //             },
    //             {
    //               field: "productDrawingNo",
    //               component: "text",
    //               uri: null,
    //               content: "CPcpth",
    //               url: null
    //             },
    //             {
    //               field: "batchNo",
    //               component: "text",
    //               uri: null,
    //               content: "250702165129fh",
    //               url: null
    //             },
    //             {
    //               field: "quantity",
    //               component: "text",
    //               uri: null,
    //               content: "3.0",
    //               url: null
    //             },
    //             {
    //               field: "unit",
    //               component: "text",
    //               uri: null,
    //               content: "件",
    //               url: null
    //             }
    //           ]
    //         ]
    //       }
    //     },
    //     {
    //       eventContentField: "humanFactors",
    //       eventContentName: "生产要素：人",
    //       type: "LIST",
    //       value: null,
    //       contentBean: {
    //         title: ["员工姓名", "员工编号", "上岗时间"],
    //         rows: [
    //           [
    //             {
    //               field: "employeeName",
    //               component: "text",
    //               uri: null,
    //               content: "lsy01",
    //               url: null
    //             },
    //             {
    //               field: "employeeNo",
    //               component: "text",
    //               uri: null,
    //               content: "lsybh01",
    //               url: null
    //             },
    //             {
    //               field: "onDutyTime",
    //               component: "text",
    //               uri: null,
    //               content: "2025-07-02 16:51:10.411",
    //               url: null
    //             }
    //           ],
    //           [
    //             {
    //               field: "employeeName",
    //               component: "text",
    //               uri: null,
    //               content: "xzhu624",
    //               url: null
    //             },
    //             {
    //               field: "employeeNo",
    //               component: "text",
    //               uri: null,
    //               content: "YG2025252302",
    //               url: null
    //             },
    //             {
    //               field: "onDutyTime",
    //               component: "text",
    //               uri: null,
    //               content: "2025-07-02 16:51:10.393",
    //               url: null
    //             }
    //           ],
    //           [
    //             {
    //               field: "employeeName",
    //               component: "text",
    //               uri: null,
    //               content: "xzhu",
    //               url: null
    //             },
    //             {
    //               field: "employeeNo",
    //               component: "text",
    //               uri: null,
    //               content: "xzhubh",
    //               url: null
    //             },
    //             {
    //               field: "onDutyTime",
    //               component: "text",
    //               uri: null,
    //               content: "2025-07-02 16:51:10.310",
    //               url: null
    //             }
    //           ],
    //           [
    //             {
    //               field: "employeeName",
    //               component: "text",
    //               uri: null,
    //               content: "xzhu623",
    //               url: null
    //             },
    //             {
    //               field: "employeeNo",
    //               component: "text",
    //               uri: null,
    //               content: "YG2025252301",
    //               url: null
    //             },
    //             {
    //               field: "onDutyTime",
    //               component: "text",
    //               uri: null,
    //               content: "2025-07-02 16:51:10.365",
    //               url: null
    //             }
    //           ]
    //         ]
    //       }
    //     },
    //     {
    //       eventContentField: "machineFactors",
    //       eventContentName: "生产要素：机",
    //       type: "LIST",
    //       value: null,
    //       contentBean: {
    //         title: ["设备标签码", "设备名称", "设备编号", "设备类型", "设备型号", "维护状态"],
    //         rows: []
    //       }
    //     },
    //     {
    //       eventContentField: "materialFactors",
    //       eventContentName: "生产要素：料",
    //       type: "LIST",
    //       value: null,
    //       contentBean: {
    //         title: [
    //           "产品标签码",
    //           "产品名称",
    //           "产品编号",
    //           "产品图号",
    //           "批次号",
    //           "原数量",
    //           "预计消耗数量",
    //           "预计剩余数量",
    //           "单位",
    //           "上料时间"
    //         ],
    //         rows: []
    //       }
    //     },
    //     {
    //       eventContentField: "mroFactors",
    //       eventContentName: "生产要素：MRO",
    //       type: "LIST",
    //       value: null,
    //       contentBean: {
    //         title: [
    //           "MRO编号",
    //           "MRO标签码",
    //           "MRO型号",
    //           "MRO类型",
    //           "原寿命",
    //           "预计消耗寿命",
    //           "预计剩余寿命",
    //           "数量",
    //           "单位",
    //           "绑定时间"
    //         ],
    //         rows: []
    //       }
    //     },
    //     {
    //       eventContentField: "inspectionDetails",
    //       eventContentName: "过程检",
    //       type: "LIST",
    //       value: null,
    //       contentBean: {
    //         title: [
    //           "任务单号",
    //           "检验类型",
    //           "状态",
    //           "检验结果",
    //           "产品名称",
    //           "产品编号",
    //           "产品图号",
    //           "创建时间",
    //           "完成时间",
    //           "生产任务",
    //           "生产订单",
    //           "执行人"
    //         ],
    //         rows: []
    //       }
    //     }
    //   ],
    //   eventTime: "2025-07-02 16:51:37",
    //   objects: ["250702165129zD"],
    //   type: "productionReporting",
    //   operator: ""
    // }
    eventDetail.value = res
  } catch (e) {
    // .
  }
}

/** 当前选择的事件 */
const currentEventId = ref<number>()
function onCurrentEventIdChange(eventId: number) {
  currentEventId.value = eventId

  if (eventId != undefined) {
    getEventDetail(eventId)
  }
}

/** 查询 */
function onConfirm(newTraceObjectCode: string) {
  queryParams.value.traceObjectCode = newTraceObjectCode

  // 查询不清空事件详情
  // eventDetail.value = undefined
  // currentEventId.value = undefined
  getRelatedEvents()
}

/** 重置 */
// function onReset () {
//   // eventDetail.value = undefined
//   // currentEventId.value = undefined
//   queryParams.value.traceObjectCode = ''
// }

/** new tab */
function onNewTab(objectCode: string) {
  emits("new-tab", objectCode)
}

/** on sort change */
function onSortChane(newSort: RelatedEventsSortEnum) {
  queryParams.value.sort = newSort

  getRelatedEvents()
}

/** 追踪/追溯 */
async function retrospectOrTrace(params: {
  eventId: number
  direction: TraceDirectionEnum
  traceObjectCode: string[]
}) {
  const { eventId, direction, traceObjectCode } = params

  // 校验：当前事件追踪/追溯是否存在数据链，如果不存在，则仅提示，不跳转路由
  const res = await queryEventsGraph({
    eventId,
    direction,
    traceObjectCode,
    level: 1
  })
  // TODO：测试数据，打开上述代码
  // const res = {
  //   events: [
  //     {
  //       eventId: 2781,
  //       eventTypeName: "生产报工",
  //       operator: "",
  //       eventTime: "2025-07-02T16:51:37",
  //       memo: [
  //         {
  //           field: "产品名称",
  //           value: "唱片"
  //         },
  //         {
  //           field: "输出数量",
  //           value: "3.0"
  //         }
  //       ]
  //     }
  //   ],
  //   relations: []
  // }

  // 原判断为仅只有事件本身，也提示
  // || (res.events.length === 1 && res.events.some(i => i.eventId === params.eventId))
  if (res.events.length === 0) {
    ElMessageBox.alert("未查询到相关数据", "提示", {
      confirmButtonText: "确认",
      closeOnClickModal: true
    }).catch(() => {
      // .
    })
    return
  }

  emits("retrospect-or-trace", {
    eventId,
    direction,
    traceObjectCode
  })
}
</script>

<style lang="scss" scoped>
.general-search {
  height: calc(100% - 40px - 56px);
  display: flex;

  .left {
    width: 336px;
    height: 100%;
    flex: none;
    padding: 20px 0 0;
    box-sizing: border-box;
    border-right: 1px solid #dcdfe6;
  }
}
</style>
