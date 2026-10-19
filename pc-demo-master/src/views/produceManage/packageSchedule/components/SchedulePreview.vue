<template>
  <div class="schedule-preview">
    <CustomSearchForm
      :form-list="searchList"
      @search="getChartList()"
      @reset="onReset"
    ></CustomSearchForm>

    <div class="titleTableBox">
      <div class="rowTitleButton">
        <div class="rowTitleButton-title">排产预览</div>
        <div class="flex gap-[12px]">
          <div v-for="item in statusList" :key="item.color">
            <span
              class="inline-block rounded-[50%] w-[10px] h-[10px] mr-[4px]"
              :style="{ backgroundColor: item.color, border: '1px solid #E4E7ED' }"
            ></span>
            <span class="text-[14px] text-[#888]">{{ item.label }}</span>
          </div>
        </div>
      </div>
      <div class="gantt-chart">
        <!-- 甘特图 -->
        <GanttChart
          v-model="ganttChartValue"
          :chartData="chartDataComputed"
          :startTime="gantStartTime"
          :gantType="gantType"
          :endTime="gantEndTime"
        />
      </div>
    </div>
    <div class="preview-footer">
      <slot></slot>
    </div>

    <!-- 点击查看排产信息 -->
    <ArrangeDetail v-model="showDetail" :data="currentSelectedItem" />
  </div>
</template>
<script setup lang="ts">
import { queryImplementConfigProductionDetail } from "@/api/implementConfig"
import {
  getProductionOrderPlanList,
  getPublishStatus,
  type ProductionOrderPlanVo,
  PublishStatus
} from "@/api/scheduling"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType } from "@/components/CustomSearchForm/type"
import GanttChart from "@/components/GanttChart/index.vue"
import {
  type GanttChartDataType,
  IceFloat,
  IceFloatColorMap
} from "@/components/GanttChart/useChart"
import { SelectType } from "@/components/SelectFactoryModel/types"
import { TIME_RANGE } from "@/constant/time"
import { useAreaLocation } from "@/hooks/useAreaLocation"
import { timeIsOverlap, uuidv4 } from "@/utils"

import ArrangeDetail from "./ScheduleDetailDrawer.vue"

defineOptions({
  name: "SchedulePreview"
})

const { curLocation } = useAreaLocation()
const statusList = [
  {
    label: "未发布排产",
    color: IceFloatColorMap[IceFloat.ScheUnPub]
  },
  {
    label: "已发布排产",
    color: IceFloatColorMap[IceFloat.ScheInPub]
  },
  {
    label: "已包装排产",
    color: IceFloatColorMap[IceFloat.ScheProcessed]
  }
]

const isScheduleByDay = ref<boolean>(false) // 是否按天排产，否则是按时分秒

const { searchList, getFormData } = useSearchForm<{
  startDate: string
  endDate: string
  area: string[]
}>([
  {
    type: EnumComponentType.Date,
    dateType: "daterange",
    key: "date",
    label: "日期",
    value: [],
    placeholder: ["请选择开始时间", "请选择结束时间"],
    format: "YYYY-MM-DD",
    valueFormat: "YYYY-MM-DD HH:mm:ss",
    defaultTime: TIME_RANGE,
    keyword: ["startDate", "endDate"],
    get hidden() {
      return isScheduleByDay.value
    },
    style: {
      width: 240
    }
  },
  {
    type: EnumComponentType.Date,
    dateType: "monthrange",
    key: "month",
    label: "月份",
    value: [],
    placeholder: ["请选择开始月份", "请选择结束月份"],
    format: "YYYY-MM",
    valueFormat: "YYYY-MM-DD HH:mm:ss",
    defaultTime: TIME_RANGE,
    keyword: ["startDate", "endDate"],
    get hidden() {
      return !isScheduleByDay.value
    },
    style: {
      width: 240
    }
  },
  {
    type: EnumComponentType.Area,
    key: "area",
    label: "位置",
    value: "",
    placeholder: "请选择位置",
    props: {
      areaType: SelectType.ProductType,
      isEnable: true,
      multiple: true,
      initSelectAll: true
    },
    style: {
      width: 320
    }
  }
])

// 甘特图渲染依赖的数据，仅查询触发后变化
const renderTimes = ref<{
  startDate: string
  endDate: string
}>({
  startDate: "",
  endDate: ""
})

const publishStatus = ref<PublishStatus>()
const showDetail = ref(false)
const startTime = computed(() => dayjs(renderTimes.value.startDate))
const endTime = computed(() => dayjs(renderTimes.value.endDate))
const gantType = computed<"day" | "month">(() => (isScheduleByDay.value ? "month" : "day"))
const gantStartTime = computed(() => dayjs(renderTimes.value.startDate).startOf(gantType.value))
const gantEndTime = computed(() => dayjs(renderTimes.value.endDate).endOf(gantType.value))
const ganttChartValue = ref()
const chartData = ref<ProductionOrderPlanVo[]>([])
const currentSelectedItem = ref<any>()
const chartDataComputed = computed<GanttChartDataType[]>(() => handleData(chartData.value))

onMounted(async () => {
  await getImplementConfig()
  initSearchTime()
  setTimeout(() => {
    getChartList()
  }, 500)
})

const onReset = () => {
  initSearchTime()
  setTimeout(() => {
    getChartList()
  }, 500)
}

const initSearchTime = () => {
  const now = dayjs().valueOf()
  const timeStamp = 24 * 60 * 60 * 1000 * 3.5
  searchList.value[!isScheduleByDay.value ? 0 : 1].value = [
    dayjs(now - timeStamp).format("YYYY-MM-DD HH:mm:ss"),
    dayjs(now + timeStamp).format("YYYY-MM-DD HH:mm:ss")
  ]
}

/** 获取排产设置 */
const getImplementConfig = async () => {
  const res = await queryImplementConfigProductionDetail()
  isScheduleByDay.value = res.scheduleTimeDimension === 1
}

const clickItem = async (data: any) => {
  data = cloneDeep(data)
  currentSelectedItem.value = data
  showDetail.value = true
}

const handleData = (res: any) => {
  const list =
    res?.map((item: any) => {
      let data: any[] = []
      item.list?.forEach((LItem: any) => {
        try {
          if (!data.length) {
            data.push([
              {
                jobId: uuidv4(),
                type: "手动",
                startTime: startTime.value,
                endTime: endTime.value,
                status: "可排产",
                items: [
                  {
                    onClick: clickItem,
                    originData: LItem,
                    type: LItem.taskType,
                    ...LItem,
                    startTime: dayjs(LItem.beginTime),
                    endTime: dayjs(LItem.endTime)
                  }
                ]
              }
            ])
          } else {
            for (let i = 0; i < data.length; i++) {
              const cantOverlapItems = data[i][0].items.filter(
                (item: any) => item.taskType !== IceFloat.ScheStop
              ) // 计划停产是可以重合？？
              const isOverlap = timeIsOverlap(cantOverlapItems, {
                beginTime: LItem.beginTime,
                endTime: LItem.endTime
              })
              if (!isOverlap || LItem.taskType === IceFloat.ScheStop) {
                data[i][0].items.push({
                  onClick: clickItem,
                  originData: LItem,
                  type: LItem.taskType,
                  ...LItem,
                  startTime: dayjs(LItem.beginTime),
                  endTime: dayjs(LItem.endTime)
                })
                break
              } else {
                if (!data[i + 1]) {
                  data.push([
                    {
                      jobId: uuidv4(),
                      type: "手动",
                      YUY: "12",
                      startTime: startTime.value,
                      endTime: endTime.value,
                      status: "可排产",
                      items: [
                        {
                          onClick: clickItem,
                          originData: LItem,
                          type: LItem.taskType,
                          ...LItem,
                          startTime: dayjs(LItem.beginTime),
                          endTime: dayjs(LItem.endTime)
                        }
                      ]
                    }
                  ])
                  break
                }
              }
            }
          }
        } catch (error) {
          /* empty */
        }
      })

      return {
        id: uuidv4(),
        lineName: item.entityName,
        // facilityId: item.facilityId,
        entityId: item.entityId,
        data
      }
    }) ?? []
  return list
}

/** 获取甘特图列表 */
const getChartList = async () => {
  const { area, startDate, endDate } = getFormData()

  if (!area?.length) {
    return
  }

  renderTimes.value = {
    startDate,
    endDate
  }

  let type = isScheduleByDay.value ? "month" : "day"

  const res = await getProductionOrderPlanList({
    entityIdList: area,
    beginTime: dayjs(startDate).startOf(type).format("YYYY-MM-DD HH:mm:ss"),
    endTime: dayjs(endDate).endOf(type).format("YYYY-MM-DD HH:mm:ss"),
    level: curLocation.level,
    source: "deliveryPlan"
  })

  // 处理成需要的数据结构
  chartData.value = cloneDeep(res)
  const status = await getPublishStatus()
  publishStatus.value = status
}
</script>

<style scoped lang="scss">
.schedule-preview {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .gantt-container {
    height: calc(100vh - 800px);
  }

  &:deep(.el-cascader__tags) {
    flex-wrap: nowrap;
    right: 30px;
    overflow: hidden;

    .el-tag--info {
      width: 70%;
    }
  }

  .scheExam {
    :deep(.el-dialog__body) {
      padding: 0;
      position: relative;
    }
  }

  .selectInput {
    :deep(.el-input__wrapper) {
      cursor: pointer;
    }

    :deep(input) {
      cursor: pointer;
    }

    width: 100%;
  }

  .setSchedule {
    :deep(.el-drawer) {
      position: relative;
    }

    :deep(.el-drawer__body) {
      padding: 0;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    :deep(.el-form .el-form-item__label) {
      color: #a8abb2;
    }

    &-top {
      margin: 0 12px;
      padding: 12px 16px;
      box-sizing: border-box;
      width: calc(100% - 24px);
      /* height: 100px; */
      background-color: #f8f9fc;

      :deep(.el-form-item--default) {
        margin-bottom: 0;
      }
    }

    &-content {
      &::-webkit-scrollbar {
        display: none;
      }
    }

    &-orderItem {
      border: 1px solid #e8e8e8;
      border-radius: 4px;
      margin-bottom: 8px;
      padding: 16px;

      :deep(.el-descriptions__cell) {
        padding-bottom: 0px;
      }

      :deep(.el-form-item--default) {
        margin-bottom: 0;
      }

      .arrange-title {
        justify-content: space-between;
        height: 22px;
        margin-bottom: 6px;
      }

      :deep(.el-descriptions__label) {
        color: #a8abb2;
      }
    }

    .title {
      height: 24px;
      margin: 12px;
      border-left: 4px solid #303133;
      padding-left: 12px;
      color: #303133;
      font-size: 16px;
      font-weight: bold;
    }

    .area-plan {
      max-width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    :deep(.el-form-value) {
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .add-arrange {
      margin: 12px;
    }
  }

  .titleTableBox {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding-top: 24px;
    overflow: hidden;

    .rowTitleButton {
      margin-top: 0;

      .rowTitleButton-title {
        font-weight: 600;
      }
    }

    :deep(.el-date-editor.el-input) {
      width: 100%;
    }

    .gantt-chart {
      flex: 1;
      overflow: hidden;
      margin-bottom: 16px;
    }
  }
  .preview-footer {
    border-top: 1px solid #e8e8e8;
    height: 64px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}
</style>
