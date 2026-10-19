<template>
  <div class="calendar">
    <FullCalendar ref="fullCalendar" class="calendar-container" :options="calendarOptions" />
    <div class="calendar-side">
      <div class="rowTitleButton">
        <div class="rowTitleButton-title">日程列表</div>
        <el-button type="primary" v-if="isAuth" icon="Plus" @click="createHolidayDialog.show = true"
          >新建节假</el-button
        >
      </div>
      <el-card shadow="never" class="bg-[#F8F9FC]">
        <template #header>
          <div class="flex items-center">
            <el-icon :size="20">
              <SuccessFilled color="#538FFF" />
            </el-icon>
            <span class="calendar-card-title">日期信息</span>
          </div>
        </template>
        <div class="calendar-card-text mb-[4px]">
          <span>日期: </span><span>{{ dateInfo?.calendarDate }}</span>
        </div>
        <div class="calendar-card-text mb-[4px]">
          <span>星期: </span><span>{{ dateInfo?.weekDate }}</span>
        </div>
        <div class="calendar-card-text">
          <span>状态: </span><span>{{ dateInfo?.status }}</span>
        </div>
      </el-card>
      <el-card shadow="never" class="mt-[32px] bg-[#F8F9FC]">
        <template #header>
          <div class="flex items-center">
            <el-icon :size="20">
              <SuccessFilled color="#FFC55F" />
            </el-icon>
            <span class="calendar-card-title">节假信息</span>
          </div>
        </template>
        <template v-if="dateInfo?.holiday">
          <div class="calendar-card-text mb-[4px]">
            <span>开始日期: </span><span>{{ dateInfo?.holiday?.startDate }}</span>
          </div>
          <div class="calendar-card-text">
            <span>结束日期: </span><span>{{ dateInfo?.holiday?.endDate }}</span>
          </div>
          <div class="calendar-card-footer" v-if="isAuth">
            <el-button type="primary" @click="onOpenHolidayDialog()">编辑查看</el-button>
            <el-button type="danger" @click="onDeleteHoliday()">删除</el-button>
          </div>
        </template>
        <template v-else>
          <div class="calendar-card-text">暂无节假</div>
        </template>
      </el-card>
    </div>

    <CustomDialog
      v-model="createHolidayDialog.show"
      :title="!createHolidayDialog.isAdd ? '编辑节假' : '新建节假'"
      size="mini"
      @close="resetHolidayForm()"
    >
      <CustomForm
        ref="customFormRef"
        v-model="createHolidayDialog"
        :configs="formConfigs"
      ></CustomForm>
      <template #footer>
        <el-button @click="createHolidayDialog.show = false">取消</el-button>
        <el-button type="primary" @click="onUpdateHoliday()">确定</el-button>
      </template>
    </CustomDialog>
  </div>
</template>

<script setup lang="ts">
import type { CalendarOptions, DatesSetArg, EventSourceInput } from "@fullcalendar/core"
import zhLocal from "@fullcalendar/core/locales/zh-cn"
import interactionPlugin from "@fullcalendar/interaction"
import multiMonthPlugin from "@fullcalendar/multimonth"
import FullCalendar from "@fullcalendar/vue3"
import { ElMessage, ElMessageBox } from "element-plus"

import {
  createHoliday,
  deleteHoliday,
  editHoliday,
  getDateInfo,
  getHolidayList
} from "@/api/calendar"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import useButtonAuth from "@/hooks/useButtonAuth"
import useResetRef from "@/hooks/useResetRef"
import { uuidv4 } from "@/utils"

defineOptions({
  name: "StandardCalendar"
})

const formConfigs = ref<ICustomFormConfigItem[]>([
  {
    componentType: "el-date-picker",
    label: "节假日期",
    field: "date",
    rules: [
      {
        required: true,
        message: "请选择节假日期",
        trigger: "blur"
      }
    ],
    props: {
      type: "daterange",
      "unlink-panels": true
    }
  }
])
const customFormRef = ref<InstanceType<typeof CustomForm>>()

const isAuth = useButtonAuth("Calendar_update", "Calendar_query")
const [createHolidayDialog, resetHolidayForm] = useResetRef<any>({
  show: false,
  isAdd: true, // true 新建 false 编辑
  date: []
})

const fullCalendar = ref<InstanceType<typeof FullCalendar>>()
const selectedDay = ref(dayjs().format("YYYY-MM-DD"))
const dateInfo = ref<{
  calendarDate: string
  status: string
  weekDate: string
  holiday?: {
    startDate: string
    endDate: string
    id: string
  }
}>()
// const resetHolidayFormRef = ref<FormInstance>()
const currentYearDate = ref<{
  start: string | Date
  end: string | Date
}>({
  start: "",
  end: ""
})

const calendarOptions = ref<CalendarOptions>({
  plugins: [multiMonthPlugin, interactionPlugin],
  initialView: "multiMonthFourMonth",
  locale: zhLocal,
  height: "100%",
  timeZone: "local",
  views: {
    multiMonthFourMonth: {
      type: "multiMonth",
      duration: {
        years: 1
      },
      showNonCurrentDates: false
    }
  },
  eventClassNames: (arg) => {
    if (arg.event.extendedProps.isHolidays) {
      return ["holidays"]
    } else {
      return ["holidaysTTT"]
    }
  },

  events: [],
  datesSet: (...rest) => {
    setDateHolidays(...rest)
  },
  dateClick: (...rest) => {
    onDateClick(...rest)
  },
  eventClick: (info: any) => {
    // 弥补dateClick ,点击区域过小无法获取到当前点击的日期
    if (info.event?.extendedProps?.currentEventDate) {
      selectedDay.value = info.event.extendedProps.currentEventDate
      getSelectedDayInfo(info.event.extendedProps.currentEventDate)
    }
  },
  selectable: true
})

onMounted(() => {
  // 初始获取当天日历信息
  getSelectedDayInfo(dayjs().format("YYYY-MM-DD"))
})

/** 获取选中日期对应的日历信息 */
const getSelectedDayInfo = async (str: string) => {
  const data = await getDateInfo(str)
  dateInfo.value = data
}

/** 日期点击事件 */
const onDateClick = (info: any) => {
  selectedDay.value = info.dateStr
  getSelectedDayInfo(info.dateStr)
}

/** 设置节假日信息 */
const setDateHolidays = async (date?: DatesSetArg | { start: string; end: string }) => {
  if (!date) {
    date = currentYearDate.value as any
  }

  const res = await getHolidayList({
    start: dayjs(date?.start).format("YYYY-MM-DD"),
    end: dayjs(date?.end).format("YYYY-MM-DD")
  })
  const eventList: EventSourceInput = []
  res.forEach((item) => {
    const timeList = getDaysBetween(item.startDate, item.endDate)
    timeList.forEach((i) => {
      eventList.push({
        date: i,
        id: uuidv4(),
        isHolidays: true,
        currentEventDate: i,
        backgroundColor: "transparent",
        borderColor: "transparent"
      })
    })
  })

  fullCalendar.value?.getApi().removeAllEventSources()
  fullCalendar.value?.getApi().addEventSource(eventList)
  currentYearDate.value = { start: date?.start as any, end: date?.end as any }
}

/** 获取两个日期之间的所有日期 */
const getDaysBetween = (start: string, end: string) => {
  const startDate = dayjs(start)
  const endDate = dayjs(end)
  const days = []
  let currentDate = startDate

  while (currentDate.isBefore(endDate)) {
    days.push(currentDate.format("YYYY-MM-DD"))
    currentDate = currentDate.add(1, "day")
  }
  days.push(endDate.format("YYYY-MM-DD"))
  return days
}

/** 新建、编辑节假日操作 */
const onUpdateHoliday = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return
  const [startDate, endDate] = createHolidayDialog.value.date
  if (createHolidayDialog.value.isAdd) {
    await createHoliday({
      startDate: dayjs(startDate).format("YYYY-MM-DD"),
      endDate: dayjs(endDate).format("YYYY-MM-DD")
    })
    ElMessage.success("新建成功")
  } else {
    await editHoliday(dateInfo.value?.holiday?.id as any, {
      startDate: dayjs(startDate).format("YYYY-MM-DD"),
      endDate: dayjs(endDate).format("YYYY-MM-DD")
    })
    ElMessage.success("编辑成功")
  }

  setDateHolidays()
  createHolidayDialog.value.show = false
}

/** 打开节假日编辑弹窗 */
const onOpenHolidayDialog = () => {
  createHolidayDialog.value = {
    date: [dateInfo.value?.holiday?.startDate || "", dateInfo.value?.holiday?.endDate || ""],
    show: true,
    isAdd: false
  }
}

/** 删除节假日操作 */
const onDeleteHoliday = async () => {
  if (dateInfo.value?.holiday?.id) {
    await ElMessageBox.confirm("确定删除该节假么？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })

    await deleteHoliday(dateInfo.value?.holiday?.id)
    ElMessage.success("删除成功")
    getSelectedDayInfo(dateInfo.value?.calendarDate || "")
    setDateHolidays()
  }
}
</script>

<style scoped lang="scss">
.calendar {
  display: flex;
  height: 100%;

  &:deep(.calendar-container) {
    padding-left: 28px;
    padding-top: 20px;
    padding-bottom: 20px;
    height: calc(100vh - 120px);
    flex: 1;

    &::-webkit-scrollbar {
      display: none;
    }

    .fc-toolbar-chunk {
      .fc-toolbar-title {
        color: #303133;
        font-size: 28px;
      }

      button {
        background: var(--el-color-primary);
        border: none;

        &:disabled {
          background: var(--el-color-primary-light-5);
          cursor: not-allowed;
        }

        &:hover {
          background-color: var(--el-color-primary-light-3);
          color: var(--el-color-white);
        }

        &:focus {
          outline: none;
          appearance: none;
          box-shadow: none;
        }
      }

      .fc-button-group {
        margin-left: 12px;
      }
    }

    .fc-view-harness {
      .fc-multimonth-title {
        color: #303133;
        font-size: 20px;
        font-weight: normal;
      }

      .fc-multimonth-header-table {
        background-color: rgb(132 186 243);
        color: #fff;

        .fc-scrollgrid-sync-inner {
          height: 46px;
          line-height: 46px;
        }
      }

      .fc-daygrid-day-top {
        color: #666;
      }

      .fc-day-disabled {
        background: rgba(195, 189, 189, 0.2);
      }

      .fc-daygrid-day {
        &.fc-day-today {
          background-color: transparent;

          .fc-daygrid-day-top {
            color: var(--el-color-primary);
          }
        }
      }

      .fc-day:has(.holidays) {
        background-color: rgb(255, 214, 141, 0.5);
      }

      .fc-highlight {
        background: rgba(151, 202, 255, 0.5);
      }
    }
  }

  &-side {
    max-width: 456px;
    min-width: 256px;
    width: 28.08%;
    padding: 24px;
    padding-top: 0;
    box-shadow: -12px 0px 34px 0px rgba(176, 179, 189, 0.1);
  }

  &-card {
    &-title {
      font-size: 16px;
      font-family:
        PingFang SC-Medium,
        PingFang SC;
      font-weight: 500;
      color: #303133;
      line-height: 24px;
      -webkit-background-clip: text;
      margin-left: 12px;
    }

    &-text {
      font-size: 14px;
      font-family:
        PingFang SC-Medium,
        PingFang SC;
      font-weight: 500;
      color: #7d8da6;
      line-height: 20px;
      -webkit-background-clip: text;
    }

    &-footer {
      margin-left: -20px;
      margin-top: 16px;
      padding: 12px 20px 0 20px;
      width: calc(100% + 40px);
      border-top: 1px solid #e4e7ed;
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }
  }

  /* 或者使用querySelector 来兼容 */
  :deep(.fc-day:has(.holidays)) {
    background-color: #ffc55f;
  }

  /* fc-highlight */
  :deep(.fc-highlight) {
    background-color: #409eff;
  }
}
</style>
