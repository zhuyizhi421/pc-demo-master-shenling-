<template>
  <div class="schedule-page" @click="closeTaskActionMenu">
    <el-alert
      v-if="urgentInsertReason"
      type="warning"
      :title="`紧急插单原因：${urgentInsertReason}`"
      :closable="false"
      class="urgent-insert-alert"
    />

    <template v-if="!showGantt">
      <div class="schedule-list-layout">
        <section class="order-panel">
          <div class="panel-header">
            <strong>生产订单</strong>
            <span>已选择{{ selectedOrders.length }}个</span>
            <el-button link type="primary" @click="showSelectOrderDialog = true">选择</el-button>
          </div>

          <div class="order-list">
            <el-table
              :data="selectedOrders"
              row-key="id"
              border
              size="small"
              class="order-main-table"
            >
              <el-table-column type="expand" width="34">
                <template #default="{ row }">
                  <el-table :data="getLeftRows(row.id)" border size="small" class="order-process-table">
                    <el-table-column prop="processSerial" label="工序" width="56" />
                    <el-table-column prop="techName" label="工艺名称" min-width="92" show-overflow-tooltip />
                    <el-table-column prop="totalAmount" label="总数" width="62" align="right" />
                    <el-table-column prop="availableAmount" label="可排产" width="68" align="right" />
                    <el-table-column prop="unPublishedAmount" label="未发布" width="68" align="right" />
                    <el-table-column label="操作" width="54" align="center">
                      <template #default="{ row: processRow }">
                        <el-button link type="primary" @click="addScheduleRow(processRow)">排产</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </template>
              </el-table-column>
              <el-table-column label="订单号" min-width="138" show-overflow-tooltip>
                <template #default="{ row, $index }">
                  <div
                    class="order-drag-cell"
                    draggable="true"
                    @dragstart="handleOrderDragStart($event, row)"
                    @dragover="handleOrderDragOver"
                    @drop="handleOrderDrop($event, row)"
                    @dragend="handleOrderDragEnd"
                  >
                    <span class="order-no-text">{{ row.no }}</span>
                    <el-tag size="small" type="warning">优先{{ $index + 1 }}</el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="产品名称" min-width="110" show-overflow-tooltip>
                <template #default="{ row }">{{ getProductName(row) }}</template>
              </el-table-column>
              <el-table-column label="产品规格" min-width="110" show-overflow-tooltip>
                <template #default="{ row }">{{ getProductSpec(row) }}</template>
              </el-table-column>
              <el-table-column label="产品图号" min-width="100" show-overflow-tooltip>
                <template #default="{ row }">{{ getDrawingNumber(row) }}</template>
              </el-table-column>
              <el-table-column label="计划量" width="78" align="right">
                <template #default="{ row }">{{ getOrderPlanAmount(row) }}{{ getUnitName(row) }}</template>
              </el-table-column>
              <el-table-column label="已排产数" width="86" align="right">
                <template #default="{ row }">{{ getScheduledAmount(row) }}{{ getUnitName(row) }}</template>
              </el-table-column>
              <el-table-column prop="deliveryDate" label="交期" width="96" align="center" />
            </el-table>
          </div>
        </section>

        <section class="schedule-panel">
          <div class="panel-title-row">
            <strong>排产列表</strong>
            <div class="toolbar">
              <el-button type="primary" @click="batchFill">批量维护</el-button>
              <el-button type="primary" @click="openGantt">查看甘特图</el-button>
            </div>
          </div>

          <div v-for="group in scheduleGroups" :key="group.orderId" class="schedule-group">
            <div class="schedule-group-title">
              <span>{{ group.orderNo }}</span>
              <el-button link type="danger" @click="removeOrderSchedules(group.orderId)">删除</el-button>
            </div>
            <el-table :data="group.rows" border size="small" class="schedule-table">
              <el-table-column prop="processSerial" label="工序" width="48" />
              <el-table-column prop="techName" label="工艺名称" min-width="86" show-overflow-tooltip />
              <el-table-column prop="availableAmount" label="可排产" width="56" align="right" />
              <el-table-column label="计划数" width="112">
                <template #default="{ row }">
                  <el-input-number
                    v-model="row.planAmount"
                    :min="1"
                    :max="row.availableAmount || undefined"
                    controls-position="right"
                    class="plan-amount-input"
                  />
                  <span class="unit-suffix">{{ row.unitName }}</span>
                </template>
              </el-table-column>
              <el-table-column label="位置" width="138">
                <template #default="{ row }">
                  <el-cascader
                    v-model="row.facilityPath"
                    :options="facilityCascaderOptions"
                    :props="facilityCascaderProps"
                    placeholder="请选择"
                    filterable
                    clearable
                    separator="-"
                    class="facility-select"
                    @change="onScheduleFacilityChange(row)"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="estimatedHours" label="预计耗时" width="64" align="right" />
              <el-table-column label="开始时间" width="165">
                <template #default="{ row }">
                  <el-date-picker
                    v-model="row.planBeginTime"
                    type="datetime"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    placeholder="开始时间"
                    class="schedule-datetime-picker"
                  />
                </template>
              </el-table-column>
              <el-table-column label="结束时间" width="165">
                <template #default="{ row }">
                  <el-date-picker
                    v-model="row.planEndTime"
                    type="datetime"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    placeholder="结束时间"
                    class="schedule-datetime-picker"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="60" align="center" fixed="right">
                <template #default="{ row }">
                  <el-button link type="danger" @click="removeScheduleRow(row.id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </section>
      </div>
    </template>

    <template v-else>
      <div class="gantt-view">
        <div class="gantt-top-bar">
          <div class="gantt-order-board">
            <div class="gantt-order-board-header">
              <div class="gantt-order-board-title">
                <strong>待排产订单</strong>
                <span class="urgent-order-tip"><i class="urgent-star">★</i> 有标记的是紧急订单</span>
              </div>
            </div>
            <div class="gantt-order-table-wrap">
              <el-table
                :data="selectedOrders"
                row-key="id"
                border
                size="small"
                max-height="194"
                empty-text="暂无待排产订单"
                highlight-current-row
                :row-class-name="getPendingOrderRowClass"
                class="gantt-order-table"
                @row-click="setActivePendingOrder"
              >
              <el-table-column label="生产订单号" min-width="140">
                <template #default="{ row }">
                  <div
                    class="order-drag-cell gantt-order-drag"
                    draggable="true"
                    @dragstart="handleOrderDragStart($event, row)"
                    @dragend="handleOrderDragEnd"
                  >
                    <span class="order-no-text">{{ row.no }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="ERP工单号" min-width="120" show-overflow-tooltip>
                <template #default="{ row }">{{ getErpWorkOrderNo(row) }}</template>
              </el-table-column>
              <el-table-column label="产品名称" min-width="120" show-overflow-tooltip>
                <template #default="{ row }">
                  <span class="product-name-cell">
                    {{ getProductName(row) }}
                    <i v-if="isUrgentOrder(row)" class="urgent-star product-urgent-star">★</i>
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="产品规格" min-width="120" show-overflow-tooltip>
                <template #default="{ row }">{{ getProductSpec(row) }}</template>
              </el-table-column>
              <el-table-column label="产品编号" min-width="110" show-overflow-tooltip>
                <template #default="{ row }">{{ getProductNo(row) }}</template>
              </el-table-column>
              <el-table-column label="订单数" width="90" align="right">
                <template #default="{ row }">{{ getOrderPlanAmount(row) }}{{ getUnitName(row) }}</template>
              </el-table-column>
              <el-table-column label="待排产数" width="90" align="right">
                <template #default="{ row }">{{ getPendingAmount(row) }}{{ getUnitName(row) }}</template>
              </el-table-column>
              <el-table-column prop="deliveryDate" label="交期" width="110" align="center" />
              <el-table-column label="操作" width="64" align="center" fixed="right">
                <template #default="{ row }">
                  <el-button link type="danger" @click="removePendingOrder(row.id)">删除</el-button>
                </template>
              </el-table-column>
              </el-table>
            </div>
          </div>

          <div class="gantt-process-board">
            <div class="gantt-order-board-header">
              <div class="gantt-order-board-title">
                <strong>待排产工序</strong>
                <span>{{ activePendingOrderSummary }}</span>
              </div>
            </div>
            <div class="gantt-order-table-wrap">
              <el-table
                :data="activePendingOrderProcessRows"
                border
                size="small"
                max-height="194"
                empty-text="请选择左侧订单"
                class="gantt-process-table"
              >
                <el-table-column prop="processSerial" label="工序" width="56">
                  <template #default="{ row }">
                    <div
                      class="process-drag-cell"
                      draggable="true"
                      @dragstart="handleProcessDragStart($event, row)"
                      @dragend="handleProcessDragEnd"
                    >
                      {{ row.processSerial }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="techName" label="工艺名称" min-width="130" show-overflow-tooltip />
                <el-table-column prop="availableAmount" label="可排产" width="78" align="right" />
                <el-table-column prop="totalAmount" label="总数" width="70" align="right" />
                <el-table-column prop="unitName" label="单位" width="56" align="center" />
                <el-table-column label="位置" min-width="130" show-overflow-tooltip>
                  <template #default="{ row }">{{ getProcessFacilityName(row) }}</template>
                </el-table-column>
                <el-table-column label="操作" width="64" align="center" fixed="right">
                  <template #default="{ row }">
                    <el-button link type="danger" @click="removePendingProcessRow(row.id)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>

        <div class="gantt-title-row">
          <div class="gantt-title-left">
            <strong>排产预览</strong>
            <div class="gantt-location-filter-row">
              <span class="gantt-filter-label">位置</span>
              <el-cascader
                v-model="ganttFacilityIds"
                :options="facilityCascaderOptions"
                :props="ganttFacilityCascaderProps"
                collapse-tags
                collapse-tags-tooltip
                filterable
                clearable
                separator="-"
                class="gantt-location"
                style="width: 100%"
              />
            </div>
          </div>
          <div class="legend">
            <span><i class="dot scheduled"></i>已加工</span>
            <span><i class="dot auditing"></i>已发布</span>
            <span><i class="dot pending"></i>待排产</span>
            <span class="forced-legend"><i class="urgent-star">★</i>紧急任务</span>
          </div>
        </div>

        <div class="gantt-grid-wrap">
          <table class="gantt-grid">
            <thead>
              <tr>
                <th class="corner-cell">
                  <span class="corner-time">时间</span>
                  <span class="corner-location">位置</span>
                </th>
                <th colspan="24">{{ ganttStartLabel }}</th>
                <th colspan="4">{{ nextGanttDay }}</th>
              </tr>
              <tr>
                <th></th>
                <th v-for="hour in ganttHours" :key="hour.key">{{ hour.label }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="line in visibleGanttLines" :key="line.id">
                <td class="line-name">{{ line.name }}</td>
                <td
                  v-for="hour in ganttHours"
                  :key="`${line.id}-${hour.key}`"
                  class="gantt-time-cell"
                  @dragover="handleGanttCellDragOver"
                  @drop="handleGanttCellDrop($event, line.id, hour.offset)"
                >
                  <div
                    v-for="(task, taskIndex) in getGanttTasks(line.id, hour.offset)"
                    :key="task.id"
                    :class="getTaskClass(task)"
                    :style="{ width: `${task.span * GANTT_HOUR_WIDTH - 8}px`, top: `${4 + taskIndex * GANTT_TASK_STACK_OFFSET}px` }"
                    :draggable="isTaskDraggable(task)"
                    @dragstart.stop="handleTaskDragStart($event, task)"
                    @dragend="handleTaskDragEnd"
                    @contextmenu.prevent.stop="openTaskActionMenu($event, task)"
                  >
                    <span class="task-info">{{ getTaskDisplayText(task) }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <AutoScheduleDialog
      v-model="showSelectOrderDialog"
      :default-selected-order-ids="selectedOrderIds"
      @confirm="handleSelectOrderConfirm"
    />

    <el-dialog
      v-model="orderDropConfirm.visible"
      title="确认排产"
      width="440px"
      append-to-body
      @close="cancelOrderDrop"
    >
      <el-form label-width="108px" class="order-drop-form">
        <el-form-item label="订单号：">{{ orderDropConfirm.orderNo }}</el-form-item>
        <el-form-item label="产品名称：">{{ orderDropConfirm.productName }}</el-form-item>
        <el-form-item label="产品编号：">{{ orderDropConfirm.productNo }}</el-form-item>
        <el-form-item label="排产数量：">
          <el-input-number
            v-model="orderDropConfirm.planAmount"
            :min="1"
            :max="orderDropConfirm.maxPlanAmount || undefined"
            controls-position="right"
            class="order-drop-amount-input"
          />
          <span class="unit-suffix">{{ orderDropConfirm.unitName }}</span>
        </el-form-item>
        <el-form-item label="计划开始时间：">
          <el-date-picker
            v-model="orderDropConfirm.planBeginTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="计划开始时间"
            class="schedule-datetime-picker"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelOrderDrop">取消</el-button>
        <el-button type="primary" @click="confirmOrderDrop">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="taskEditDialog.visible"
      title="排产任务"
      width="480px"
      append-to-body
      class="task-edit-dialog"
      @close="cancelTaskEdit"
    >
      <el-form label-width="112px" class="task-edit-form">
        <el-form-item label="计划开始时间：">
          <el-date-picker
            v-model="taskEditDialog.planBeginTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择计划开始时间"
            class="schedule-datetime-picker"
          />
        </el-form-item>
        <el-form-item label="计划数量：">
          <el-input
            v-model.number="taskEditDialog.planAmount"
            type="number"
            min="1"
            placeholder="请输入计划数量"
          />
          <span class="unit-suffix">{{ taskEditDialog.unitName }}</span>
        </el-form-item>
        <el-form-item label="生产区域：">
          <el-cascader
            v-model="taskEditDialog.facilityPath"
            :options="facilityCascaderOptions"
            :props="facilityCascaderProps"
            clearable
            filterable
            placeholder="请选择生产区域"
            class="facility-select"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelTaskEdit">取消</el-button>
        <el-button type="primary" @click="confirmTaskEdit">确定</el-button>
      </template>
    </el-dialog>

    <div
      v-if="activeTaskForMenu"
      class="task-action-menu"
      :style="taskActionMenuStyle"
      @click.stop
      @contextmenu.prevent
    >
      <el-button
        v-for="action in getTaskActions(activeTaskForMenu)"
        :key="action"
        link
        :type="action === '取消发布' ? 'warning' : 'primary'"
        @click.stop="handleTaskAction(action, activeTaskForMenu)"
      >
        {{ action }}
      </el-button>
    </div>

    <div
      v-if="activeTaskDetail"
      class="task-detail-popover"
      :style="taskDetailPopoverStyle"
      @click.stop
      @contextmenu.prevent
    >
      <div class="task-detail-title">
        <strong>任务详情</strong>
        <el-button link type="primary" @click="closeTaskDetail">关闭</el-button>
      </div>
      <div class="task-detail-content">
        <div class="task-detail-row">
          <span class="task-detail-label">产品名称</span>
          <span>{{ getTaskProductName(activeTaskDetail) }}</span>
        </div>
        <div class="task-detail-row">
          <span class="task-detail-label">产品编号</span>
          <span>{{ getTaskProductNo(activeTaskDetail) }}</span>
        </div>
        <div class="task-detail-row">
          <span class="task-detail-label">订单号</span>
          <span>{{ activeTaskDetail.orderNo }}</span>
        </div>
        <div class="task-detail-row">
          <span class="task-detail-label">工序</span>
          <span>{{ activeTaskDetail.processSerial }} {{ activeTaskDetail.techName }}</span>
        </div>
        <div class="task-detail-row">
          <span class="task-detail-label">生产区域</span>
          <span>{{ getTaskProductionArea(activeTaskDetail) }}</span>
        </div>
        <div class="task-detail-row">
          <span class="task-detail-label">计划数量</span>
          <span>{{ activeTaskDetail.planAmount }}{{ activeTaskDetail.unitName }}</span>
        </div>
        <div class="task-detail-row">
          <span class="task-detail-label">开始时间</span>
          <span>{{ formatTaskTime(activeTaskDetail.planBeginTime) }}</span>
        </div>
        <div class="task-detail-row">
          <span class="task-detail-label">结束时间</span>
          <span>{{ formatTaskTime(activeTaskDetail.planEndTime) }}</span>
        </div>
        <div class="task-detail-row">
          <span class="task-detail-label">排产状态</span>
          <span>{{ activeTaskDetail.status }}</span>
        </div>
        <div v-if="activeTaskDetail.forceReason" class="task-detail-row task-force-reason">
          <span class="task-detail-label">紧急任务</span>
          <span>{{ activeTaskDetail.forceReason }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs"
import { computed, onMounted, ref, watch } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"

import { queryModelTreeByLeafType } from "@/api/fm"
import { querySchedulePlanByOrder, requestCancelPublishAll, requestPushPublish } from "@/api/scheduling"
import type { IProductionOrderPageItem } from "@/types/production-manage/product-order"

import AutoScheduleDialog from "./AutoScheduleDialog.vue"

type SelectedOrder = IProductionOrderPageItem & {
  productionUnitIds?: string[]
  productModelName?: string
  productModelNo?: string
  planAmount?: number | string
  scheduledQuantity?: number | string
  unitName?: string
}

type ProductionUnitOption = {
  id: string
  name: string
}

type FacilityCascaderOption = {
  label: string
  value: string
  children?: FacilityCascaderOption[]
}

type ProcessRow = {
  id: string
  orderId: string
  orderNo: string
  productName?: string
  productNo: string
  processSerial: string
  techName: string
  totalAmount: number
  availableAmount: number
  unPublishedAmount: number
  unitName: string
  isUrgent?: boolean
  urgent?: boolean
  isUrgentInsert?: boolean
  urgentReason?: string
  priority?: number | string
  prodUnits?: {
    abstractAreaId?: string
    facilityId?: string
    ctTime?: number
    workerNum?: number
  }[]
}

type ScheduleTaskStatus = "已加工" | "已发布" | "待排产" | "正在生产" | "已完成"
const hiddenGanttStatuses = new Set<ScheduleTaskStatus>(["正在生产", "已完成"])

type ScheduleRow = ProcessRow & {
  sourceRowId: string
  planAmount: number
  facilityId: string
  facilityPath: string[]
  estimatedHours: string
  planBeginTime: string
  planEndTime: string
  status: ScheduleTaskStatus
  forceReason?: string
  forceParallel?: boolean
}

type GanttHour = {
  key: string
  label: string
  offset: number
}

type GanttTask = ScheduleRow & {
  startOffset: number
  span: number
}

type TaskAction = "查看" | "修改" | "取消发布"

type AutoScheduleConfirmPayload = {
  orders: IProductionOrderPageItem[]
  isUrgentInsert: boolean
  urgentInsertReason: string
}

const props = defineProps<{
  initialOrders?: IProductionOrderPageItem[]
  urgentInsertReason?: string
  dateRange?: [string, string]
}>()

const emit = defineEmits<{
  (e: "on-ok"): void
  (e: "orders-change", orders: IProductionOrderPageItem[]): void
  (e: "update:dateRange", value: [string, string]): void
}>()

const selectedOrders = ref<SelectedOrder[]>([])
const leftRows = ref<ProcessRow[]>([])
const scheduleRows = ref<ScheduleRow[]>([])
const productionUnitOptions = ref<ProductionUnitOption[]>([])
const facilityCascaderOptions = ref<FacilityCascaderOption[]>([])
const showGantt = ref(true)
const showSelectOrderDialog = ref(false)
const selectOrderMode = ref<"select" | "auto">("select")
const internalGanttDateRange = ref<[string, string]>([
  dayjs().format("YYYY-MM-DD"),
  dayjs().add(7, "day").format("YYYY-MM-DD")
])
const ganttDateRange = computed<[string, string]>({
  get: () => props.dateRange || internalGanttDateRange.value,
  set: (value) => {
    internalGanttDateRange.value = value
    emit("update:dateRange", value)
  }
})
const ganttFacilityIds = ref<string[]>([])
const activePendingOrderId = ref("")
const draggingOrderId = ref("")
const draggingTaskId = ref("")
const draggingProcessRowId = ref("")
const orderDropConfirm = ref({
  visible: false,
  orderId: "",
  orderNo: "",
  productName: "",
  productNo: "",
  unitName: "",
  facilityId: "",
  planAmount: 1,
  maxPlanAmount: 1,
  planBeginTime: ""
})
const baselineTaskAdjustments = ref<
  Record<
    string,
    Partial<
      Pick<
        ScheduleRow,
        | "facilityId"
        | "facilityPath"
        | "planBeginTime"
        | "planEndTime"
        | "status"
        | "forceReason"
        | "forceParallel"
        | "planAmount"
        | "estimatedHours"
      >
    >
  >
>({})
const taskActionMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  taskId: ""
})
const taskDetailPopover = ref({
  visible: false,
  x: 0,
  y: 0,
  taskId: ""
})
const taskEditDialog = ref({
  visible: false,
  taskId: "",
  planBeginTime: "",
  planAmount: 1,
  facilityPath: [] as string[],
  unitName: ""
})
const skipNextInitialOrdersHydrate = ref(false)
const GANTT_HOUR_WIDTH = 56
const GANTT_ROW_HEIGHT = 36
const GANTT_VISIBLE_ROW_COUNT = 14
const GANTT_HEADER_HEIGHT = 52
const GANTT_TASK_STACK_OFFSET = 18
const ganttGridMaxHeight = `${GANTT_HEADER_HEIGHT + GANTT_ROW_HEIGHT * GANTT_VISIBLE_ROW_COUNT}px`
const DEFAULT_PROCESS_HOURS = 2
const urgentInsertReason = computed(() => props.urgentInsertReason?.trim() || "")
const facilityCascaderProps = {
  emitPath: true,
  checkStrictly: false
}
const ganttFacilityCascaderProps = {
  emitPath: false,
  multiple: true,
  checkStrictly: false
}

const shellWorkshopLines = [
  {
    lineName: "N350减壳",
    productionUnitId: "pu-jk-n350",
    productCodes: ["JD-N350HL-JK", "GR-HSG-001"],
    operations: [
      ["精车法兰面、止口", 135, 1],
      ["钻法兰面及四凸台各孔、攻四凸台螺纹孔", 145, 1],
      ["粗镗主动齿轮轴承孔", 120, 1],
      ["装配轴承盖", 20, 1],
      ["粗镗被动齿轮轴承孔", 100, 1],
      ["精镗主被动齿轮轴承孔", 170, 1],
      ["气密检测", 45, 1]
    ]
  },
  {
    lineName: "8A减壳",
    productionUnitId: "pu-jk-8a",
    productCodes: ["JD-8C1-JK"],
    operations: [
      ["精车法兰面、止口", 110, 1],
      ["钻法兰面孔", 100, 1],
      ["车平面攻丝", 100, 1],
      ["清洗螺纹孔", 50, 1],
      ["装配轴承盖", 30, 1],
      ["粗镗主被动齿轮孔、车端面", 75, 2],
      ["精镗主被动齿轮孔、车端面", 95, 1],
      ["镗丝", 65, 1],
      ["套车外圆、钻孔、倒角、攻丝", 100, 1],
      ["气密检测", 70, 1]
    ]
  },
  {
    lineName: "3A减壳",
    productionUnitId: "pu-jk-3a",
    productCodes: ["JD-3CE-JK"],
    operations: [
      ["精车法兰面、止口", 105, 1],
      ["铣小端平面", 90, 1],
      ["钻法兰面及四凸台各孔、攻四凸台螺纹孔", 128, 1],
      ["粗镗主动齿轮轴承孔", 120, 1],
      ["装配轴承盖", 20, 1],
      ["粗镗被动齿轮轴承孔", 115, 1],
      ["精镗主被动齿轮轴承孔", 180, 1],
      ["气密检测", 70, 1]
    ]
  }
] as const

const ganttHours = computed<GanttHour[]>(() =>
  Array.from({ length: 28 }, (_, offset) => ({
    key: `hour-${offset}`,
    label: `${String(offset % 24).padStart(2, "0")}:00`,
    offset
  }))
)

const nextGanttDay = computed(() => dayjs(ganttDateRange.value[0]).add(1, "day").format("YYYY/MM/DD"))

const ganttStartLabel = computed(() => dayjs(ganttDateRange.value[0]).format("YYYY/MM/DD"))

const visibleGanttLines = computed(() => {
  if (!ganttFacilityIds.value.length) return productionUnitOptions.value
  const ids = new Set(ganttFacilityIds.value)
  return productionUnitOptions.value.filter((item) => ids.has(item.id))
})

const ganttTasks = computed<GanttTask[]>(() => {
  const baseTime = dayjs(ganttDateRange.value[0]).startOf("day")
  const endTime = baseTime.add(ganttHours.value.length, "hour")
  return [...baselineGanttTasks.value, ...scheduleRows.value]
    .filter((row) => !hiddenGanttStatuses.has(row.status))
    .map((row) => {
      const beginTime = dayjs(row.planBeginTime)
      const rowEndTime = dayjs(row.planEndTime)
      if (!row.facilityId || !beginTime.isValid() || !rowEndTime.isValid()) return null

      const clampedBegin = beginTime.isBefore(baseTime) ? baseTime : beginTime
      const clampedEnd = rowEndTime.isAfter(endTime) ? endTime : rowEndTime
      const startOffset = Math.floor(clampedBegin.diff(baseTime, "minute") / 60)
      const endOffset = Math.ceil(clampedEnd.diff(baseTime, "minute") / 60)

      if (endOffset <= 0 || startOffset >= ganttHours.value.length) return null

      return {
        ...row,
        startOffset: Math.max(0, startOffset),
        span: Math.max(1, Math.min(ganttHours.value.length, endOffset) - Math.max(0, startOffset))
      }
    })
    .filter((task): task is GanttTask => Boolean(task))
})

const activeTaskForMenu = computed(() => {
  if (!taskActionMenu.value.visible || !taskActionMenu.value.taskId) return null
  return ganttTasks.value.find((task) => task.id === taskActionMenu.value.taskId) || null
})

const activeTaskDetail = computed(() => {
  if (!taskDetailPopover.value.visible || !taskDetailPopover.value.taskId) return null
  return ganttTasks.value.find((task) => task.id === taskDetailPopover.value.taskId) || null
})

const taskActionMenuStyle = computed(() => ({
  left: `${taskActionMenu.value.x}px`,
  top: `${taskActionMenu.value.y}px`
}))

const taskDetailPopoverStyle = computed(() => ({
  left: `${taskDetailPopover.value.x}px`,
  top: `${taskDetailPopover.value.y}px`
}))

const baselineGanttTasks = computed<ScheduleRow[]>(() => {
  const baseDate = dayjs(ganttDateRange.value[0]).startOf("day")
  const lines = productionUnitOptions.value.slice(0, 4)
  const makeTask = (
    index: number,
    status: ScheduleTaskStatus,
    startHour: number,
    duration: number,
    orderNo: string,
    productNo: string,
    techName: string
  ): ScheduleRow | null => {
    const line = lines[index]
    if (!line) return null
    const id = `baseline-${status}-${index}-${startHour}`
    const baseTask: ScheduleRow = {
      id,
      sourceRowId: `baseline-${index}`,
      orderId: `baseline-order-${index}`,
      orderNo,
      productName: productNo === "GR-HSG-001" ? "减速器壳体总成A型" : productNo,
      productNo,
      processSerial: String((index + 1) * 10),
      techName,
      totalAmount: 100,
      availableAmount: 100,
      unPublishedAmount: 0,
      unitName: "件",
      planAmount: 100,
      facilityId: line.id,
      facilityPath: findFacilityPath(line.id),
      estimatedHours: `${duration}h`,
      planBeginTime: baseDate.add(startHour, "hour").format("YYYY-MM-DD HH:mm:ss"),
      planEndTime: baseDate.add(startHour + duration, "hour").format("YYYY-MM-DD HH:mm:ss"),
      status
    }
    return {
      ...baseTask,
      ...baselineTaskAdjustments.value[id]
    }
  }

  return [
    makeTask(0, "已加工", 8, 4, "MOCK-ORDER-001", "GR-HSG-001", "精车法兰面"),
    makeTask(1, "已发布", 10, 3, "MOCK-ORDER-002", "GR-HSG-001", "粗镗轴承孔")
  ].filter((task): task is ScheduleRow => Boolean(task))
})

const scheduleGroups = computed(() =>
  selectedOrders.value.map((order) => ({
    orderId: order.id,
    orderNo: order.no,
    rows: scheduleRows.value.filter((row) => row.orderId === order.id)
  }))
)

const selectedOrderIds = computed(() => selectedOrders.value.map((order) => order.id))

const activePendingOrder = computed(() =>
  selectedOrders.value.find((order) => String(order.id) === String(activePendingOrderId.value)) ||
  selectedOrders.value[0] ||
  null
)

const activePendingOrderProcessRows = computed(() =>
  activePendingOrder.value ? getLeftRows(activePendingOrder.value.id) : []
)

const activePendingOrderSummary = computed(() => {
  const order = activePendingOrder.value
  if (!order) return "未选择订单"
  return [
    `生产订单号：${order.no || "-"}`,
    `产品名称：${getProductName(order)}`,
    `产品规格：${getProductSpec(order)}`,
    `订单数量：${getOrderPlanAmount(order)}${getUnitName(order)}`
  ].join(" / ")
})

const getProductName = (order: SelectedOrder) =>
  order.productModel?.name || order.productModelName || order.productModelNo || "-"

const getProductSpec = (order: SelectedOrder) => {
  const data = order as any
  return data.productModelSpec || data.productModel?.specification || data.specification || "-"
}

const getDrawingNumber = (order: SelectedOrder) => order.productModel?.drawingNumber || "-"

const getProductNo = (order?: SelectedOrder) =>
  order?.productModel?.code || order?.productModelNo || order?.productModel?.drawingNumber || order?.no || "-"

const getErpWorkOrderNo = (order?: SelectedOrder) => order?.saleCode || "-"

const isUrgentOrder = (order?: SelectedOrder) => {
  const data = order as any
  return Boolean(
    data?.isUrgent ||
      data?.urgent ||
      data?.isUrgentInsert ||
      Number(data?.priority || data?.saleVOList?.[0]?.priority || 0) === 3
  )
}

const getOrderUrgentFields = (order?: SelectedOrder) => {
  const data = order as any
  return {
    isUrgent: isUrgentOrder(order),
    urgent: Boolean(data?.urgent),
    isUrgentInsert: Boolean(data?.isUrgentInsert),
    urgentReason: String(data?.urgentReason || ""),
    priority: data?.priority
  }
}

const getOrderPlanAmount = (order: SelectedOrder) => {
  const amount = Number(order.orderAmount || order.planAmount || 0)
  return Number.isFinite(amount) ? amount : 0
}

const getScheduledAmount = (order: SelectedOrder) => {
  const amount = Number(order.scheduledQuantity || order.planAmount || 0)
  return Number.isFinite(amount) ? amount : 0
}

const getPendingAmount = (order: SelectedOrder) => {
  const available = Number(order.availableAmount)
  if (Number.isFinite(available) && available >= 0) return available
  const rows = getLeftRows(order.id)
  if (rows.length) return Number(rows[0].availableAmount) || 0
  return Math.max(0, getOrderPlanAmount(order) - getScheduledAmount(order))
}

const getProcessFacilityName = (row: ProcessRow) => {
  const path = getDefaultFacilityPathForProcess(row)
  const facilityId = path[path.length - 1]
  return productionUnitOptions.value.find((item) => item.id === facilityId)?.name || "-"
}

const setActivePendingOrder = (row: SelectedOrder) => {
  activePendingOrderId.value = row.id
}

const getPendingOrderRowClass = ({ row }: { row: SelectedOrder }) =>
  String(row.id) === String(activePendingOrder.value?.id || "") ? "is-active-pending-order" : ""

const syncActivePendingOrder = () => {
  if (!selectedOrders.value.length) {
    activePendingOrderId.value = ""
    return
  }
  if (!selectedOrders.value.some((order) => String(order.id) === String(activePendingOrderId.value))) {
    activePendingOrderId.value = selectedOrders.value[0].id
  }
}

const getPlanAmount = (order: SelectedOrder) => {
  const amount = Number(order.planAmount || order.scheduledQuantity || order.orderAmount || 1)
  return Number.isFinite(amount) && amount > 0 ? amount : 1
}

const getUnitName = (order: SelectedOrder) => order.unitItem?.unitName || order.unitName || "件"

const getShellWorkshopLineForOrder = (order?: SelectedOrder) => {
  const productNo = getProductNo(order)
  return shellWorkshopLines.find((line) => line.productCodes.some((code) => code === productNo)) || shellWorkshopLines[0]
}

const getShellWorkshopFacilityId = (productionUnitId: string, operationIndex: number) =>
  `ws-${productionUnitId.replace(/^pu-/, "")}-${String(operationIndex + 1).padStart(2, "0")}`

const createShellWorkshopProdUnit = (line: (typeof shellWorkshopLines)[number], operationIndex: number) => {
  const operation = line.operations[operationIndex] || line.operations[0]
  const facilityId = getShellWorkshopFacilityId(line.productionUnitId, operationIndex)
  return {
    abstractAreaId: facilityId,
    facilityId,
    ctTime: Number(operation[1] || 60),
    workerNum: Number(operation[2] || 1)
  }
}

const buildShellWorkshopProcessRows = (order: SelectedOrder): ProcessRow[] => {
  const amount = getPlanAmount(order)
  const line = getShellWorkshopLineForOrder(order)
  return line.operations.map((operation, index) => {
    const processSerial = String((index + 1) * 10)
    return {
      id: `${order.id}-jk-${processSerial}`,
      orderId: order.id,
      orderNo: order.no,
      productName: getProductName(order),
      productNo: getProductNo(order),
      processSerial,
      techName: String(operation[0]),
      totalAmount: amount,
      availableAmount: amount,
      unPublishedAmount: amount,
      unitName: getUnitName(order),
      ...getOrderUrgentFields(order),
      prodUnits: [createShellWorkshopProdUnit(line, index)]
    }
  })
}

const createProcessRow = (order: SelectedOrder, serial?: {
  id: string
  processSerial: string
  techName: string
  planAmount?: number
  availableAmount?: number
  unPublishAmount?: number
  unitName?: string
  prodUnits?: ProcessRow["prodUnits"]
}): ProcessRow => {
  const amount = getPlanAmount(order)
  const line = getShellWorkshopLineForOrder(order)
  const operationIndex = Math.max(0, Math.floor((Number(serial?.processSerial || 10) || 10) / 10) - 1)
  return {
    id: serial?.id || `${order.id}-10`,
    orderId: order.id,
    orderNo: order.no,
    productName: getProductName(order),
    productNo: getProductNo(order),
    processSerial: serial?.processSerial || "10",
    techName: serial?.techName || order.techProcess?.name || "电镀",
    totalAmount: Number(serial?.planAmount ?? amount),
    availableAmount: Number(serial?.availableAmount ?? amount),
    unPublishedAmount: Number(serial?.unPublishAmount ?? serial?.availableAmount ?? amount),
    unitName: serial?.unitName || getUnitName(order),
    ...getOrderUrgentFields(order),
    prodUnits: serial?.prodUnits?.length ? serial.prodUnits : [createShellWorkshopProdUnit(line, operationIndex)]
  }
}

const buildProcessRowsFromPlan = (orders: SelectedOrder[], planList: Awaited<ReturnType<typeof querySchedulePlanByOrder>>) => {
  const orderMap = new Map(orders.map((order) => [order.id, order]))
  return planList.flatMap((plan) => {
    const order = orderMap.get(plan.orderId)
    if (!order) return []
    const serialList = plan.orderPlanSerialVoList || []
    if (serialList.length <= 1 && !serialList.some((serial) => serial.prodUnits?.length)) {
      return buildShellWorkshopProcessRows(order)
    }
    return serialList.map((serial) =>
      createProcessRow(order, {
        id: serial.id,
        processSerial: String(serial.processSerial),
        techName: serial.techName,
        planAmount: serial.planAmount,
        availableAmount: serial.availableAmount,
        unPublishAmount: serial.unPublishAmount,
        unitName: serial.unitItem?.unitName,
        prodUnits: serial.prodUnits
      })
    )
  })
}

const defaultBeginTime = () => dayjs().startOf("day").add(8, "hour").format("YYYY-MM-DD HH:mm:ss")
const defaultEndTime = () => dayjs().startOf("day").add(20, "hour").format("YYYY-MM-DD HH:mm:ss")

/** 工序 CT：若配置多个加工区域，取所有 CT 中的最大值（秒） */
const getProcessMaxCtSeconds = (row: ProcessRow) => {
  const cts = (row.prodUnits || [])
    .map((unit) => Number(unit.ctTime))
    .filter((ct) => Number.isFinite(ct) && ct > 0)
  if (!cts.length) return 0
  return Math.max(...cts)
}

/**
 * 加工时长（分钟）= 任务数量 × 工序 CT（秒）
 * CT 取多加工区域中的最大值
 */
const getProcessDurationMinutes = (row: ProcessRow, planAmount?: number) => {
  const amount = Number(planAmount ?? row.availableAmount ?? 0)
  const ctSeconds = getProcessMaxCtSeconds(row)
  if (!Number.isFinite(amount) || amount <= 0 || ctSeconds <= 0) {
    return DEFAULT_PROCESS_HOURS * 60
  }
  return Math.max(1, Math.ceil((amount * ctSeconds) / 60))
}

const getProcessDurationHours = (row: ProcessRow, planAmount?: number) =>
  Math.max(1, Math.ceil(getProcessDurationMinutes(row, planAmount) / 60))

type UnavailableWindow = { start: ReturnType<typeof dayjs>; end: ReturnType<typeof dayjs>; reason: string }

/** 模拟：班次休息（每日 12:00-13:00、18:00-18:30） */
const buildShiftRestWindows = (from: ReturnType<typeof dayjs>, to: ReturnType<typeof dayjs>) => {
  const windows: UnavailableWindow[] = []
  let day = from.startOf("day")
  const last = to.startOf("day").add(1, "day")
  while (day.isBefore(last)) {
    windows.push(
      { start: day.hour(12).minute(0).second(0), end: day.hour(13).minute(0).second(0), reason: "班次休息" },
      { start: day.hour(18).minute(0).second(0), end: day.hour(18).minute(30).second(0), reason: "班次休息" }
    )
    day = day.add(1, "day")
  }
  return windows
}

/** 模拟：设备保养窗口（每日 16:00-16:30，按工位可扩展） */
const buildMaintenanceWindows = (from: ReturnType<typeof dayjs>, to: ReturnType<typeof dayjs>) => {
  const windows: UnavailableWindow[] = []
  let day = from.startOf("day")
  const last = to.startOf("day").add(1, "day")
  while (day.isBefore(last)) {
    windows.push({
      start: day.hour(16).minute(0).second(0),
      end: day.hour(16).minute(30).second(0),
      reason: "设备保养"
    })
    day = day.add(1, "day")
  }
  return windows
}

const getUnavailableWindows = (from: ReturnType<typeof dayjs>, to: ReturnType<typeof dayjs>) =>
  [...buildShiftRestWindows(from, to), ...buildMaintenanceWindows(from, to)].sort(
    (a, b) => a.start.valueOf() - b.start.valueOf()
  )

/** 若开始时间落在不可用区间内，或任务时段与不可用区间重叠，则顺延到区间结束 */
const skipUnavailableWindows = (start: ReturnType<typeof dayjs>, durationMinutes: number) => {
  let cursor = start
  const horizon = start.add(7, "day")
  const windows = getUnavailableWindows(start, horizon)
  let guard = 0
  while (guard < 64) {
    guard += 1
    const end = cursor.add(durationMinutes, "minute")
    const hit = windows.find(
      (window) => cursor.isBefore(window.end) && end.isAfter(window.start)
    )
    if (!hit) break
    cursor = hit.end
  }
  return cursor
}

/** 指定工位上已有任务（含背景任务与本次草稿）中最晚的计划结束时间 */
const getLatestPlanEndOnFacility = (
  facilityId: string,
  excludeTaskIds: Set<string> = new Set(),
  extraRows: Array<Pick<ScheduleRow, "id" | "facilityId" | "planEndTime">> = []
) => {
  const tasks = [
    ...baselineGanttTasks.value,
    ...scheduleRows.value,
    ...extraRows
  ].filter(
    (task) =>
      task.facilityId === facilityId &&
      !excludeTaskIds.has(task.id) &&
      dayjs(task.planEndTime).isValid()
  )
  if (!tasks.length) return null
  return tasks.reduce((latest, task) => {
    const end = dayjs(task.planEndTime)
    return end.isAfter(latest) ? end : latest
  }, dayjs(tasks[0].planEndTime))
}

/**
 * 计算新任务开始时间：
 * 取 max(第一道工序开始时间 / 前道结束时间, 该工位已有任务最晚结束时间)，
 * 再跳过设备保养与班次休息
 */
const resolveTaskBeginTime = (params: {
  processIndex: number
  firstProcessStart: ReturnType<typeof dayjs>
  prevProcessEnd?: ReturnType<typeof dayjs> | null
  facilityId: string
  durationMinutes: number
  excludeTaskIds?: Set<string>
  extraRows?: Array<Pick<ScheduleRow, "id" | "facilityId" | "planEndTime">>
}) => {
  const processConstraint =
    params.processIndex === 0
      ? params.firstProcessStart
      : params.prevProcessEnd && params.prevProcessEnd.isValid()
        ? params.prevProcessEnd
        : params.firstProcessStart

  const facilityLatest = getLatestPlanEndOnFacility(
    params.facilityId,
    params.excludeTaskIds,
    params.extraRows
  )
  const rawStart =
    facilityLatest && facilityLatest.isAfter(processConstraint) ? facilityLatest : processConstraint
  return skipUnavailableWindows(rawStart, params.durationMinutes)
}

const findFacilityPath = (facilityId = "") => {
  if (!facilityId) return []
  for (const line of facilityCascaderOptions.value) {
    const matchedStation = line.children?.find((station) => station.value === facilityId)
    if (matchedStation) return [String(line.value), String(matchedStation.value)]
    if (line.value === facilityId && line.children?.[0]) {
      return [String(line.value), String(line.children[0].value)]
    }
  }
  return []
}

const getDefaultFacilityPath = (order?: SelectedOrder) => {
  const matchedPath = findFacilityPath(order?.productionUnitIds?.[0] || productionUnitOptions.value[0]?.id || "")
  if (matchedPath.length) return matchedPath

  return (() => {
    const firstLine = facilityCascaderOptions.value.find((line) => line.children?.length)
    return firstLine?.children?.[0] ? [String(firstLine.value), String(firstLine.children[0].value)] : []
  })()
}

const getDefaultFacilityPathForProcess = (row: ProcessRow, order?: SelectedOrder) => {
  const configuredFacilityId = row.prodUnits?.[0]?.abstractAreaId || row.prodUnits?.[0]?.facilityId || ""
  const configuredPath = findFacilityPath(configuredFacilityId)
  if (configuredPath.length) return configuredPath
  return getDefaultFacilityPath(order)
}

const getDefaultFacilityId = (order?: SelectedOrder) => {
  const path = getDefaultFacilityPath(order)
  return path[path.length - 1] || ""
}

const createScheduleRow = (
  row: ProcessRow,
  order?: SelectedOrder,
  overrides: Partial<
    Pick<
      ScheduleRow,
      "facilityPath" | "planBeginTime" | "planEndTime" | "status" | "forceReason" | "forceParallel" | "planAmount"
    >
  > = {}
): ScheduleRow => {
  const facilityPath = overrides.facilityPath?.length ? overrides.facilityPath : getDefaultFacilityPathForProcess(row, order)
  const planAmount = overrides.planAmount ?? row.availableAmount
  const durationMinutes = getProcessDurationMinutes(row, planAmount)
  const planBeginTime = overrides.planBeginTime || defaultBeginTime()
  const planEndTime =
    overrides.planEndTime || dayjs(planBeginTime).add(durationMinutes, "minute").format("YYYY-MM-DD HH:mm:ss")
  return {
    ...row,
    id: `${row.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    sourceRowId: row.id,
    planAmount,
    facilityId: facilityPath[facilityPath.length - 1] || "",
    facilityPath,
    estimatedHours: `${(durationMinutes / 60).toFixed(durationMinutes % 60 === 0 ? 0 : 1)}h`,
    planBeginTime,
    planEndTime,
    status: overrides.status || "待排产",
    forceReason: overrides.forceReason,
    forceParallel: overrides.forceParallel
  }
}

const hydrateOrders = async (orders: IProductionOrderPageItem[] = props.initialOrders || []) => {
  selectedOrders.value = (orders as SelectedOrder[]).map((order) => ({ ...order }))
  if (!selectedOrders.value.length) {
    leftRows.value = []
    scheduleRows.value = []
    syncActivePendingOrder()
    return
  }

  try {
    const planList = await querySchedulePlanByOrder(selectedOrders.value.map((order) => order.id))
    leftRows.value = buildProcessRowsFromPlan(selectedOrders.value, planList)
    if (!leftRows.value.length) {
      leftRows.value = selectedOrders.value.flatMap((order) => buildShellWorkshopProcessRows(order))
    }
  } catch {
    leftRows.value = selectedOrders.value.flatMap((order) => buildShellWorkshopProcessRows(order))
  }

  scheduleRows.value = []
  syncActivePendingOrder()
}

const handleSelectOrderConfirm = async (payload: AutoScheduleConfirmPayload) => {
  const orders = payload.orders
  const shouldAutoSchedule = selectOrderMode.value === "auto"
  showSelectOrderDialog.value = false
  selectOrderMode.value = "select"
  if (showGantt.value) {
    syncGanttFacilities()
  }
  emit("orders-change", orders)
  await hydrateOrders(orders)
  if (shouldAutoSchedule) {
    runAutoScheduleForOrders(orders)
  }
}

const openAutoScheduleDialog = () => {
  selectOrderMode.value = "auto"
  showSelectOrderDialog.value = true
}

const getAllWorkstationPaths = () => {
  const paths: string[][] = []
  for (const line of facilityCascaderOptions.value) {
    for (const station of line.children || []) {
      paths.push([String(line.value), String(station.value)])
    }
  }
  return paths
}

const resolveLineOptionForOrder = (order: SelectedOrder, orderIndex: number) => {
  const lines = facilityCascaderOptions.value.filter((line) => line.children?.length)
  if (!lines.length) return null

  const shellLine = getShellWorkshopLineForOrder(order)
  const matched = lines.find(
    (line) =>
      line.label === shellLine.lineName ||
      String(line.value) === shellLine.productionUnitId ||
      shellLine.productCodes.some((code) => String(line.label).includes(code) || String(line.value).includes(code))
  )
  if (matched) return matched
  return lines[orderIndex % lines.length]
}

const pickFacilityPathForProcess = (
  order: SelectedOrder,
  processRow: ProcessRow,
  processIndex: number,
  orderIndex: number,
  usageCount: Map<string, number>
) => {
  const configuredPath = getDefaultFacilityPathForProcess(processRow, order)
  const line = resolveLineOptionForOrder(order, orderIndex)
  const lineStations =
    line?.children?.map((station) => [String(line.value), String(station.value)]) || []
  const candidates = lineStations.length ? lineStations : getAllWorkstationPaths()
  if (!candidates.length) return configuredPath

  const nameMatched = line?.children?.find((station) => {
    const label = String(station.label || "")
    return Boolean(label && (label.includes(processRow.techName) || processRow.techName.includes(label)))
  })
  if (nameMatched && line) {
    const path = [String(line.value), String(nameMatched.value)]
    const facilityId = path[path.length - 1]
    usageCount.set(facilityId, (usageCount.get(facilityId) || 0) + 1)
    return path
  }

  // Prefer a configured station when it belongs to the candidate set and is not overloaded.
  if (configuredPath.length) {
    const configuredId = configuredPath[configuredPath.length - 1]
    const inCandidates = candidates.some((path) => path[path.length - 1] === configuredId)
    const configuredUsage = usageCount.get(configuredId) || 0
    const minUsage = Math.min(...candidates.map((path) => usageCount.get(path[path.length - 1]) || 0))
    if (inCandidates && configuredUsage <= minUsage) {
      usageCount.set(configuredId, configuredUsage + 1)
      return configuredPath
    }
  }

  // Spread across workstations: start from process index, then pick the least-used station.
  let bestPath = candidates[processIndex % candidates.length]
  let bestUsage = usageCount.get(bestPath[bestPath.length - 1]) || 0
  for (let offset = 0; offset < candidates.length; offset += 1) {
    const path = candidates[(processIndex + offset) % candidates.length]
    const usage = usageCount.get(path[path.length - 1]) || 0
    if (usage < bestUsage) {
      bestPath = path
      bestUsage = usage
    }
  }
  usageCount.set(bestPath[bestPath.length - 1], bestUsage + 1)
  return bestPath
}

const runAutoScheduleForOrders = (orders: IProductionOrderPageItem[]) => {
  const nextRows: ScheduleRow[] = []
  const usageCount = new Map<string, number>()
  const baseTime = dayjs(ganttDateRange.value[0]).startOf("day").hour(8)

  orders.forEach((orderItem, orderIndex) => {
    const order = selectedOrders.value.find((item) => item.id === orderItem.id) || (orderItem as SelectedOrder)
    const processRows = getLeftRows(order.id)
    if (!processRows.length) return

    const firstProcessStart = baseTime
    let prevProcessEnd: ReturnType<typeof dayjs> | null = null

    processRows.forEach((row, processIndex) => {
      const facilityPath = pickFacilityPathForProcess(order, row, processIndex, orderIndex, usageCount)
      if (!facilityPath.length) return

      const facilityId = facilityPath[facilityPath.length - 1]
      const durationMinutes = getProcessDurationMinutes(row)
      const beginTime = resolveTaskBeginTime({
        processIndex,
        firstProcessStart,
        prevProcessEnd,
        facilityId,
        durationMinutes,
        extraRows: nextRows
      })
      const endTime = beginTime.add(durationMinutes, "minute")

      nextRows.push(
        createScheduleRow(row, order, {
          facilityPath,
          planBeginTime: beginTime.format("YYYY-MM-DD HH:mm:ss"),
          planEndTime: endTime.format("YYYY-MM-DD HH:mm:ss"),
          status: "待排产"
        })
      )

      prevProcessEnd = endTime
    })
  })

  scheduleRows.value = nextRows
  syncGanttFacilities()
  if (nextRows.length) {
    ElMessage.success(`已自动排产 ${orders.length} 个订单的全部工序`)
  } else {
    ElMessage.warning("所选订单暂无可排产工序")
  }
}

const handlePublish = async () => {
  if (!scheduleRows.value.length) {
    ElMessage.warning("请先维护排产列表")
    return
  }
  try {
    const taskIdList = scheduleRows.value.map((row) => row.id)
    await requestPushPublish(taskIdList)
    ElMessage.success("发布成功")
  } catch {
    ElMessage.error("发布失败")
  }
}

const handleCancelPublish = async () => {
  try {
    await ElMessageBox.confirm("确认取消所有未发布的排产？", "取消发布", {
      type: "warning",
      confirmButtonText: "确认",
      cancelButtonText: "取消"
    })
    await requestCancelPublishAll()
    ElMessage.success("取消发布成功")
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("取消发布失败")
    }
  }
}

const handleCancelPreSchedule = async () => {
  if (!scheduleRows.value.length && !selectedOrders.value.length) {
    ElMessage.warning("当前没有预排产数据")
    return
  }
  try {
    await ElMessageBox.confirm("确认取消本次预排产数据？取消后将清空甘特图任务和待排产订单。", "取消预排", {
      type: "warning",
      confirmButtonText: "确认",
      cancelButtonText: "取消"
    })
    scheduleRows.value = []
    leftRows.value = []
    selectedOrders.value = []
    syncActivePendingOrder()
    syncSelectedOrderChange()
    ElMessage.success("已取消预排")
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("取消预排失败")
    }
  }
}

const getLeftRows = (orderId: string) => leftRows.value.filter((row) => row.orderId === orderId)

const addScheduleRow = (row: ProcessRow) => {
  const order = selectedOrders.value.find((item) => item.id === row.orderId)
  scheduleRows.value.push(createScheduleRow(row, order))
}

const removeScheduleRow = (id: string) => {
  scheduleRows.value = scheduleRows.value.filter((row) => row.id !== id)
}

const removePendingProcessRow = (id: string) => {
  leftRows.value = leftRows.value.filter((row) => row.id !== id)
  scheduleRows.value = scheduleRows.value.filter((row) => row.sourceRowId !== id)
  ElMessage.success("已删除待排产工序")
}

const removeOrderSchedules = (orderId: string) => {
  scheduleRows.value = scheduleRows.value.filter((row) => row.orderId !== orderId)
}

const removePendingOrder = (orderId: string) => {
  selectedOrders.value = selectedOrders.value.filter((order) => order.id !== orderId)
  leftRows.value = leftRows.value.filter((row) => row.orderId !== orderId)
  scheduleRows.value = scheduleRows.value.filter((row) => row.orderId !== orderId)
  syncActivePendingOrder()
  syncSelectedOrderChange()
  ElMessage.success("已删除待排产订单")
}

const syncSelectedOrderChange = () => {
  skipNextInitialOrdersHydrate.value = true
  emit("orders-change", selectedOrders.value.map((order) => ({ ...order })) as IProductionOrderPageItem[])
}

const reorderSelectedOrders = (sourceOrderId: string, targetOrderId: string) => {
  if (!sourceOrderId || !targetOrderId || sourceOrderId === targetOrderId) return

  const nextOrders = [...selectedOrders.value]
  const sourceIndex = nextOrders.findIndex((order) => order.id === sourceOrderId)
  const targetIndex = nextOrders.findIndex((order) => order.id === targetOrderId)
  if (sourceIndex < 0 || targetIndex < 0) return

  const [sourceOrder] = nextOrders.splice(sourceIndex, 1)
  nextOrders.splice(targetIndex, 0, sourceOrder)
  selectedOrders.value = nextOrders
  syncSelectedOrderChange()
}

const handleOrderDragStart = (event: DragEvent, order: SelectedOrder) => {
  draggingOrderId.value = order.id
  draggingProcessRowId.value = ""
  event.dataTransfer?.setData("text/plain", order.id)
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move"
  }
}

const handleOrderDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move"
  }
}

const handleOrderDrop = async (event: DragEvent, targetOrder: SelectedOrder) => {
  event.preventDefault()
  const sourceOrderId = event.dataTransfer?.getData("text/plain") || draggingOrderId.value
  if (!sourceOrderId || sourceOrderId === targetOrder.id) {
    draggingOrderId.value = ""
    return
  }

  reorderSelectedOrders(sourceOrderId, targetOrder.id)
  ElMessage.success("已调整排产优先级")
  draggingOrderId.value = ""
}

const handleOrderDragEnd = () => {
  draggingOrderId.value = ""
}

const handleProcessDragStart = (event: DragEvent, row: ProcessRow) => {
  draggingProcessRowId.value = row.id
  draggingOrderId.value = ""
  event.dataTransfer?.setData("application/x-schedule-process-row-id", row.id)
  event.dataTransfer?.setData("text/plain", row.id)
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move"
  }
}

const handleProcessDragEnd = () => {
  draggingProcessRowId.value = ""
}

const batchFill = () => {
  scheduleRows.value = scheduleRows.value.map((row) => ({
    ...row,
    facilityPath: row.facilityPath?.length ? row.facilityPath : getDefaultFacilityPath(),
    facilityId: row.facilityId || getDefaultFacilityId(),
    planBeginTime: row.planBeginTime || defaultBeginTime(),
    planEndTime: row.planEndTime || defaultEndTime()
  }))
  ElMessage.success("已带出默认排产信息")
}

const onScheduleFacilityChange = (row: ScheduleRow) => {
  row.facilityId = row.facilityPath?.[row.facilityPath.length - 1] || ""
}

const syncGanttFacilities = () => {
  const usedFacilityIds = Array.from(new Set(scheduleRows.value.map((row) => row.facilityId).filter(Boolean)))
  const mockFacilityIds = productionUnitOptions.value.map((item) => item.id)
  ganttFacilityIds.value = Array.from(new Set([...usedFacilityIds, ...mockFacilityIds]))
}

const openGantt = () => {
  syncGanttFacilities()
  showGantt.value = true
}

const getGanttTasks = (facilityId: string, hourOffset: number) =>
  ganttTasks.value.filter((task) => task.facilityId === facilityId && task.startOffset === hourOffset)

const getTaskClass = (task: GanttTask) => [
  "gantt-task",
  `status-${task.status}`,
  {
    "is-draggable-task": isTaskDraggable(task),
    "is-locked-task": !isTaskDraggable(task),
    "force-parallel-task": Boolean(task.forceParallel || task.forceReason),
    "urgent-task": isTaskFromUrgentOrder(task)
  }
]

const isTaskDraggable = (task: Pick<GanttTask, "status">) => task.status === "待排产"

const isTaskFromUrgentOrder = (task: Pick<GanttTask, "orderId">) => {
  const order = selectedOrders.value.find((item) => String(item.id) === String(task.orderId))
  return isUrgentOrder(order) || isUrgentOrder(task as SelectedOrder)
}

const getTaskDisplayText = (task: GanttTask) => {
  const order = selectedOrders.value.find((item) => item.id === task.orderId)
  const productNo = task.productNo || getProductNo(order)
  return `${productNo} ${task.techName} ${task.planAmount}${task.unitName}`
}

const getTaskProductName = (task: GanttTask) => {
  const order = selectedOrders.value.find((item) => item.id === task.orderId)
  return task.productName || (order ? getProductName(order) : "") || "-"
}

const getTaskProductNo = (task: GanttTask) => {
  const order = selectedOrders.value.find((item) => item.id === task.orderId)
  return task.productNo || getProductNo(order)
}

const getTaskProductionArea = (task: GanttTask) => {
  const facilityPath = task.facilityPath?.length ? task.facilityPath : findFacilityPath(task.facilityId)
  if (facilityPath.length) {
    const line = facilityCascaderOptions.value.find((item) => String(item.value) === String(facilityPath[0]))
    const station = line?.children?.find((item) => String(item.value) === String(facilityPath[1]))
    if (line && station) return `${line.label}-${station.label}`
  }

  const matchedOption = productionUnitOptions.value.find((item) => item.id === task.facilityId)
  if (matchedOption?.name) return matchedOption.name

  return task.facilityId || "-"
}

const formatTaskTime = (value: string) => (value ? dayjs(value).format("YYYY-MM-DD HH:mm") : "-")

const getBoundedPoint = (x: number, y: number, width = 260, height = 240) => {
  if (typeof window === "undefined") {
    return { x, y }
  }
  return {
    x: Math.max(8, Math.min(x, window.innerWidth - width - 8)),
    y: Math.max(8, Math.min(y, window.innerHeight - height - 8))
  }
}

const getBoundedOverlayPosition = (event: MouseEvent, width = 260, height = 240) =>
  getBoundedPoint(event.clientX, event.clientY, width, height)

const openTaskActionMenu = (event: MouseEvent, task: GanttTask) => {
  const position = getBoundedOverlayPosition(event, 128, 132)
  closeTaskDetail()
  taskActionMenu.value = {
    visible: true,
    x: position.x,
    y: position.y,
    taskId: task.id
  }
}

const closeTaskActionMenu = () => {
  taskActionMenu.value.visible = false
}

const closeTaskDetail = () => {
  taskDetailPopover.value.visible = false
}

const cancelTaskEdit = () => {
  taskEditDialog.value = {
    visible: false,
    taskId: "",
    planBeginTime: "",
    planAmount: 1,
    facilityPath: [],
    unitName: ""
  }
}

const openTaskDetail = (task: GanttTask) => {
  const position = getBoundedPoint(taskActionMenu.value.x, taskActionMenu.value.y, 320, 260)
  taskDetailPopover.value = {
    visible: true,
    x: position.x,
    y: position.y,
    taskId: task.id
  }
  closeTaskActionMenu()
}

const openTaskEditDialog = (task: GanttTask) => {
  taskEditDialog.value = {
    visible: true,
    taskId: task.id,
    planBeginTime: task.planBeginTime,
    planAmount: Number(task.planAmount || 1),
    facilityPath: task.facilityPath?.length ? [...task.facilityPath] : findFacilityPath(task.facilityId),
    unitName: task.unitName || ""
  }
  closeTaskDetail()
  closeTaskActionMenu()
}

const getTaskActions = (task: GanttTask): TaskAction[] => {
  if (task.status === "已加工") return ["查看"]
  if (task.status === "已发布") return ["查看", "取消发布"]
  return ["查看", "修改"]
}

const updateTaskStatus = (task: GanttTask, status: ScheduleTaskStatus) => {
  const row = scheduleRows.value.find((item) => item.id === task.id)
  if (row) {
    row.status = status
    return
  }

  baselineTaskAdjustments.value = {
    ...baselineTaskAdjustments.value,
    [task.id]: {
      ...baselineTaskAdjustments.value[task.id],
      status
    }
  }
}

const handleTaskAction = (action: TaskAction, task: GanttTask) => {
  if (action === "查看") {
    openTaskDetail(task)
    return
  }
  if (action === "取消发布") {
    updateTaskStatus(task, "待排产")
    closeTaskActionMenu()
    ElMessage.success("已取消发布")
    return
  }
  if (action === "修改") {
    openTaskEditDialog(task)
  }
}

const confirmTaskEdit = () => {
  const { taskId, planBeginTime, planAmount, facilityPath } = taskEditDialog.value
  const task = ganttTasks.value.find((item) => item.id === taskId)
  if (!task) return
  if (!planAmount || Number(planAmount) < 1) {
    ElMessage.warning("请输入有效的计划数量")
    return
  }
  if (!dayjs(planBeginTime).isValid()) {
    ElMessage.warning("请选择有效的计划开始时间")
    return
  }
  const facilityId = facilityPath[facilityPath.length - 1] || ""
  if (!facilityId) {
    ElMessage.warning("请选择生产区域")
    return
  }

  const durationMinutes = getProcessDurationMinutes(task, Number(planAmount))
  const nextRow: ScheduleRow = {
    ...task,
    planAmount: Number(planAmount),
    facilityId,
    facilityPath: [...facilityPath],
    estimatedHours: `${(durationMinutes / 60).toFixed(durationMinutes % 60 === 0 ? 0 : 1)}h`,
    planBeginTime,
    planEndTime: dayjs(planBeginTime).add(durationMinutes, "minute").format("YYYY-MM-DD HH:mm:ss")
  }
  nextRow.forceParallel = isTaskOverlapped(nextRow)

  const rowIndex = scheduleRows.value.findIndex((row) => row.id === taskId)
  if (rowIndex >= 0) {
    scheduleRows.value.splice(rowIndex, 1, nextRow)
  } else {
    baselineTaskAdjustments.value = {
      ...baselineTaskAdjustments.value,
      [taskId]: {
        ...baselineTaskAdjustments.value[taskId],
        planAmount: nextRow.planAmount,
        facilityId: nextRow.facilityId,
        facilityPath: nextRow.facilityPath,
        estimatedHours: nextRow.estimatedHours,
        planBeginTime: nextRow.planBeginTime,
        planEndTime: nextRow.planEndTime,
        forceParallel: nextRow.forceParallel
      }
    }
  }

  cancelTaskEdit()
  ElMessage.success("已修改排产任务")
}

const isTaskOverlapped = (row: Pick<ScheduleRow, "id" | "facilityId" | "planBeginTime" | "planEndTime">) => {
  const begin = dayjs(row.planBeginTime)
  const end = dayjs(row.planEndTime)
  if (!row.facilityId || !begin.isValid() || !end.isValid()) return false
  return ganttTasks.value.some((task) => {
    if (task.id === row.id || task.facilityId !== row.facilityId) return false
    const taskBegin = dayjs(task.planBeginTime)
    const taskEnd = dayjs(task.planEndTime)
    return begin.isBefore(taskEnd) && end.isAfter(taskBegin)
  })
}

type BuildOrderScheduleOptions = {
  hourOffset?: number
  firstProcessStart?: ReturnType<typeof dayjs>
  planAmount?: number
  forceParallel?: boolean
}

const buildOrderScheduleRowsAt = (orderId: string, facilityId: string, options: BuildOrderScheduleOptions = {}) => {
  const order = selectedOrders.value.find((item) => item.id === orderId)
  if (!order) return []
  const rows = getLeftRows(orderId)
  const dropPath = findFacilityPath(facilityId)
  const dropLineId = dropPath[0] || ""
  const dropLine = facilityCascaderOptions.value.find((line) => String(line.value) === dropLineId)
  const siblingStations =
    dropLine?.children?.map((station) => [String(dropLine.value), String(station.value)]) || []
  const firstProcessStart =
    options.firstProcessStart && options.firstProcessStart.isValid()
      ? options.firstProcessStart
      : dayjs(ganttDateRange.value[0])
          .startOf("day")
          .add(options.hourOffset ?? 0, "hour")
  const schedulePlanAmount = options.planAmount ?? getPendingAmount(order)
  const builtRows: ScheduleRow[] = []
  let prevProcessEnd: ReturnType<typeof dayjs> | null = null

  rows.forEach((row, index) => {
    const configuredPath = getDefaultFacilityPathForProcess(row, order)
    let facilityPath = configuredPath
    if (!facilityPath.length) {
      if (index === 0 && dropPath.length) {
        facilityPath = dropPath
      } else if (siblingStations.length) {
        facilityPath = siblingStations[index % siblingStations.length]
      } else {
        facilityPath = dropPath
      }
    } else if (index === 0 && dropPath.length) {
      facilityPath = dropPath
    }

    const targetFacilityId = facilityPath[facilityPath.length - 1] || facilityId
    const durationMinutes = getProcessDurationMinutes(row, schedulePlanAmount)
    const beginTime = resolveTaskBeginTime({
      processIndex: index,
      firstProcessStart,
      prevProcessEnd,
      facilityId: targetFacilityId,
      durationMinutes,
      extraRows: builtRows
    })
    const endTime = beginTime.add(durationMinutes, "minute")
    builtRows.push(
      createScheduleRow(row, order, {
        facilityPath,
        planAmount: schedulePlanAmount,
        planBeginTime: beginTime.format("YYYY-MM-DD HH:mm:ss"),
        planEndTime: endTime.format("YYYY-MM-DD HH:mm:ss"),
        status: "待排产",
        forceParallel: options.forceParallel
      })
    )
    prevProcessEnd = endTime
  })

  return builtRows
}

const resetOrderDropConfirm = () => {
  orderDropConfirm.value = {
    visible: false,
    orderId: "",
    orderNo: "",
    productName: "",
    productNo: "",
    unitName: "",
    facilityId: "",
    planAmount: 1,
    maxPlanAmount: 1,
    planBeginTime: ""
  }
}

const openOrderDropConfirm = (orderId: string, facilityId: string, hourOffset: number) => {
  const order = selectedOrders.value.find((item) => item.id === orderId)
  if (!order) return

  const pendingAmount = getPendingAmount(order)
  const defaultStart = dayjs(ganttDateRange.value[0]).startOf("day").add(hourOffset, "hour")
  orderDropConfirm.value = {
    visible: true,
    orderId,
    orderNo: order.no,
    productName: getProductName(order),
    productNo: getProductNo(order),
    unitName: getUnitName(order),
    facilityId,
    planAmount: pendingAmount > 0 ? pendingAmount : 1,
    maxPlanAmount: pendingAmount > 0 ? pendingAmount : 1,
    planBeginTime: defaultStart.format("YYYY-MM-DD HH:mm:ss")
  }
}

const cancelOrderDrop = () => {
  resetOrderDropConfirm()
}

const applyOrderDropSchedule = async (
  orderId: string,
  facilityId: string,
  planAmount: number,
  planBeginTime: string
) => {
  const firstProcessStart = dayjs(planBeginTime)
  const nextRows = buildOrderScheduleRowsAt(orderId, facilityId, {
    firstProcessStart,
    planAmount
  })
  if (!nextRows.length) return false

  const hasOverlap = nextRows.some((row) => isTaskOverlapped(row))
  if (hasOverlap) {
    nextRows.forEach((row) => {
      row.forceParallel = true
    })
  }

  const existingIds = new Set(getLeftRows(orderId).map((row) => row.id))
  scheduleRows.value = scheduleRows.value.filter((row) => row.orderId !== orderId || !existingIds.has(row.sourceRowId))
  scheduleRows.value.push(...nextRows)
  ElMessage.success("已生成该订单全部工序排产")
  return true
}

const confirmOrderDrop = async () => {
  const { orderId, facilityId, planAmount, planBeginTime, maxPlanAmount } = orderDropConfirm.value
  if (!orderId || !facilityId || !planBeginTime) return
  if (!planAmount || planAmount < 1) {
    ElMessage.warning("请输入有效的排产数量")
    return
  }
  if (planAmount > maxPlanAmount) {
    ElMessage.warning(`排产数量不能大于待排产数 ${maxPlanAmount}`)
    return
  }
  if (!dayjs(planBeginTime).isValid()) {
    ElMessage.warning("请选择有效的计划开始时间")
    return
  }

  const payload = { orderId, facilityId, planAmount, planBeginTime }
  resetOrderDropConfirm()
  await applyOrderDropSchedule(payload.orderId, payload.facilityId, payload.planAmount, payload.planBeginTime)
}

const handleGanttCellDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = "move"
}

const handleTaskDragStart = (event: DragEvent, task: GanttTask) => {
  if (!isTaskDraggable(task)) {
    event.preventDefault()
    return
  }
  draggingTaskId.value = task.id
  draggingOrderId.value = ""
  draggingProcessRowId.value = ""
  event.dataTransfer?.setData("application/x-schedule-task-id", task.id)
  event.dataTransfer?.setData("text/plain", task.id)
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move"
  }
}

const handleTaskDragEnd = () => {
  draggingTaskId.value = ""
}

const moveScheduleTaskTo = async (taskId: string, facilityId: string, hourOffset: number) => {
  const rowIndex = scheduleRows.value.findIndex((row) => row.id === taskId)
  const currentRow = rowIndex >= 0 ? scheduleRows.value[rowIndex] : ganttTasks.value.find((task) => task.id === taskId)
  if (!currentRow) return false

  const beginTime = dayjs(ganttDateRange.value[0]).startOf("day").add(hourOffset, "hour")
  const durationMinutes = Math.max(60, dayjs(currentRow.planEndTime).diff(dayjs(currentRow.planBeginTime), "minute"))
  const nextRow: ScheduleRow = {
    ...currentRow,
    facilityId,
    facilityPath: findFacilityPath(facilityId),
    planBeginTime: beginTime.format("YYYY-MM-DD HH:mm:ss"),
    planEndTime: beginTime.add(durationMinutes, "minute").format("YYYY-MM-DD HH:mm:ss")
  }
  nextRow.forceParallel = isTaskOverlapped(nextRow)

  if (rowIndex >= 0) {
    scheduleRows.value.splice(rowIndex, 1, nextRow)
  } else {
    baselineTaskAdjustments.value = {
      ...baselineTaskAdjustments.value,
      [taskId]: {
        facilityId: nextRow.facilityId,
        facilityPath: nextRow.facilityPath,
        planBeginTime: nextRow.planBeginTime,
        planEndTime: nextRow.planEndTime,
        forceParallel: nextRow.forceParallel
      }
    }
  }
  return true
}

const scheduleProcessRowAt = async (processRowId: string, facilityId: string, hourOffset: number) => {
  const processRow = leftRows.value.find((row) => row.id === processRowId)
  if (!processRow) return false

  const order = selectedOrders.value.find((item) => item.id === processRow.orderId)
  const beginTime = dayjs(ganttDateRange.value[0]).startOf("day").add(hourOffset, "hour")
  const nextRow = createScheduleRow(processRow, order, {
    facilityPath: findFacilityPath(facilityId),
    planBeginTime: beginTime.format("YYYY-MM-DD HH:mm:ss")
  })
  nextRow.forceParallel = isTaskOverlapped(nextRow)

  scheduleRows.value.push(nextRow)
  return true
}

const handleGanttCellDrop = async (event: DragEvent, facilityId: string, hourOffset: number) => {
  event.preventDefault()
  const taskId = event.dataTransfer?.getData("application/x-schedule-task-id") || draggingTaskId.value
  if (taskId) {
    await moveScheduleTaskTo(taskId, facilityId, hourOffset)
    draggingTaskId.value = ""
    return
  }

  const processRowId =
    event.dataTransfer?.getData("application/x-schedule-process-row-id") || draggingProcessRowId.value
  if (processRowId) {
    const scheduled = await scheduleProcessRowAt(processRowId, facilityId, hourOffset)
    draggingProcessRowId.value = ""
    if (scheduled) ElMessage.success("已生成该工序排产")
    return
  }

  const orderId = event.dataTransfer?.getData("text/plain") || draggingOrderId.value
  draggingOrderId.value = ""
  if (!orderId) return

  openOrderDropConfirm(orderId, facilityId, hourOffset)
}

const submitPublish = () => {
  if (!scheduleRows.value.length) {
    ElMessage.warning("请先维护排产列表")
    return
  }
  ElMessage.success("提交发布成功")
  emit("on-ok")
}

const buildFallbackFacilityOptions = () => [
  ...shellWorkshopLines.map((line) => ({
    label: line.lineName,
    value: line.productionUnitId,
    children: line.operations.map((operation, index) => ({
      label: String(operation[0]),
      value: getShellWorkshopFacilityId(line.productionUnitId, index)
    }))
  }))
]

const buildShellWorkshopStationOptions = (lineId: string, lineName: string) => {
  const matchedLine = shellWorkshopLines.find(
    (line) => line.productionUnitId === lineId || line.lineName === lineName
  )
  if (!matchedLine) return []
  return matchedLine.operations.map((operation, index) => ({
    label: String(operation[0]),
    value: getShellWorkshopFacilityId(matchedLine.productionUnitId, index)
  }))
}

const flattenFacilityOptions = (options: FacilityCascaderOption[]) =>
  options.flatMap((line) =>
    (line.children || []).map((station) => ({
      id: String(station.value),
      name: `${line.label}-${station.label}`
    }))
  )

const buildFacilityOptionsFromTree = (nodes: any[] = []) => {
  const result: FacilityCascaderOption[] = []
  const collectWorkstations = (rows: any[] = []): FacilityCascaderOption[] =>
    rows.flatMap((node) => {
      if (node.levelTag === "workstation") {
        return [
          {
            label: String(node.entityName || node.name || node.entityId || node.id),
            value: String(node.entityId || node.id)
          }
        ]
      }
      return collectWorkstations(node.children || [])
    })

  const walk = (rows: any[], underShellWorkshop = false) => {
    rows.forEach((node) => {
      const nodeName = String(node.entityName || node.name || "")
      const nextUnderShellWorkshop = underShellWorkshop || nodeName === "减壳车间"
      if (node.levelTag === "productionUnit" && nextUnderShellWorkshop) {
        const lineId = String(node.entityId || node.id)
        const lineName = String(node.entityName || node.name || lineId)
        const workstations = collectWorkstations(node.children || [])
        const fallbackStations = buildShellWorkshopStationOptions(lineId, lineName)

        result.push({
          label: lineName,
          value: lineId,
          children: workstations.length ? workstations : fallbackStations
        })
        return
      }
      if (node.children?.length) walk(node.children, nextUnderShellWorkshop)
    })
  }

  walk(nodes)
  return result.filter((line) => line.children?.length)
}

const loadProductionUnits = async () => {
  try {
    const tree = await queryModelTreeByLeafType({
      leafType: 1,
      isEnable: true,
      containLastLevel: true
    })
    facilityCascaderOptions.value = buildFacilityOptionsFromTree(tree || [])
    if (!facilityCascaderOptions.value.length) {
      facilityCascaderOptions.value = buildFallbackFacilityOptions()
    }
    productionUnitOptions.value = flattenFacilityOptions(facilityCascaderOptions.value)
    if (!ganttFacilityIds.value.length) {
      ganttFacilityIds.value = productionUnitOptions.value.map((item) => item.id)
    }
  } catch {
    facilityCascaderOptions.value = buildFallbackFacilityOptions()
    productionUnitOptions.value = flattenFacilityOptions(facilityCascaderOptions.value)
  }
}

watch(
  () => props.initialOrders,
  () => {
    if (skipNextInitialOrdersHydrate.value) {
      skipNextInitialOrdersHydrate.value = false
      return
    }
    void hydrateOrders()
  },
  { deep: true }
)

onMounted(async () => {
  await loadProductionUnits()
  await hydrateOrders()
})

defineExpose({
  handlePublish,
  handleCancelPublish,
  handleCancelPreSchedule,
  openAutoScheduleDialog
})
</script>

<style scoped lang="scss">
.schedule-page {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.urgent-insert-alert {
  flex-shrink: 0;
}

.schedule-list-layout {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 620px minmax(0, 1fr);
  border-top: 1px solid #ebeef5;
}

.order-panel,
.schedule-panel,
.gantt-view {
  min-height: 0;
  overflow: auto;
  padding: 16px;
}

.order-panel {
  border-right: 1px solid #ebeef5;
}

.panel-header,
.panel-title-row,
.schedule-group-title,
.gantt-title-row,
.gantt-filter-row {
  display: flex;
  align-items: center;
}

.panel-header {
  gap: 8px;
  margin-bottom: 12px;
}

.panel-title-row {
  justify-content: space-between;
  margin-bottom: 8px;

  strong {
    font-size: 13px;
  }
}

.gantt-title-row {
  justify-content: space-between;
  margin-bottom: 8px;
  flex-wrap: nowrap;

  strong {
    flex-shrink: 0;
    font-size: 14px;
  }
}

.gantt-title-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.toolbar,
.gantt-actions {
  display: flex;
  gap: 8px;
}

.order-main-table {
  width: 100%;

  :deep(.el-table__expanded-cell) {
    padding: 8px;
    background: #fafafa;
  }
}

.order-drag-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: move;
}

.order-no-text {
  min-width: 0;
  overflow: hidden;
  color: #303133;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-process-table {
  width: 100%;
}

.schedule-group {
  margin-bottom: 18px;
}

.schedule-group-title {
  justify-content: space-between;
  padding: 8px 12px;
  background: #f5f7fa;
  font-weight: 600;
}

.schedule-table {
  width: 100%;

  :deep(.facility-select),
  :deep(.schedule-datetime-picker) {
    width: 100%;
  }

  :deep(.schedule-datetime-picker.el-date-editor) {
    --el-date-editor-width: 100%;
  }
}

.plan-amount-input {
  width: 72px;
}

.unit-suffix {
  display: inline-block;
  margin-left: 4px;
  color: #606266;
  font-size: 12px;
}

.task-edit-form {
  :deep(.facility-select),
  :deep(.schedule-datetime-picker),
  :deep(.el-input) {
    width: 100%;
  }

  :deep(.schedule-datetime-picker.el-date-editor) {
    --el-date-editor-width: 100%;
  }
}

.gantt-view {
  flex: 1;
}

.gantt-top-bar {
  display: grid;
  grid-template-columns: minmax(360px, 40%) minmax(0, 1fr);
  gap: 8px;
  margin-bottom: 8px;
  min-height: 224px;
  align-items: stretch;
}

.gantt-filter-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  min-width: 0;
  padding: 8px 10px;
  border: 1px solid #dcdfe6;
  background: #fff;
}

.gantt-filter-label {
  flex-shrink: 0;
  width: 32px;
  color: #606266;
  font-size: 13px;
}

.gantt-filter-row {
  gap: 8px;
  min-width: 0;
  width: 100%;
}

.gantt-filter-actions {
  justify-content: flex-end;
  gap: 8px;
}

.gantt-order-board {
  display: flex;
  flex-direction: column;
  min-width: 0;
  border: 1px solid #dcdfe6;
  background: #fff;
  overflow: hidden;
}

.gantt-process-board {
  display: flex;
  flex-direction: column;
  min-width: 0;
  border: 1px solid #dcdfe6;
  background: #fff;
  overflow: hidden;
}

.gantt-order-board-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 4px 8px;
  border-bottom: 1px solid #ebeef5;
  background: #f8fafc;
  min-height: 28px;

  .gantt-order-board-title {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  strong {
    font-size: 14px;
    line-height: 20px;
  }

  span {
    color: #606266;
    font-size: 12px;
    line-height: 18px;
  }

  :deep(.el-button) {
    flex-shrink: 0;
    height: 28px;
    padding: 5px 12px;
    font-size: 13px;
  }
}

.gantt-order-table-wrap {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.gantt-order-table {
  width: 100%;

  .order-no-text {
    font-weight: 400;
  }

  :deep(.el-table__header-wrapper th.el-table__cell) {
    padding: 2px 4px;
    height: 26px;
    line-height: 22px;
    font-size: 14px;
  }

  :deep(.el-table__body-wrapper td.el-table__cell) {
    padding: 2px 4px;
    height: 28px;
    line-height: 24px;
    font-size: 14px;
  }

  :deep(.el-table__body tr) {
    height: 28px;
  }

  :deep(.el-table__body tr.is-active-pending-order > td.el-table__cell) {
    background: #1f4e79 !important;
    color: #f56c6c;
  }

  :deep(.el-table__body tr.is-active-pending-order:hover > td.el-table__cell) {
    background: #1a4165 !important;
  }

  :deep(.el-table__body tr.is-active-pending-order .order-no-text) {
    color: #fff;
  }

  :deep(.el-tag) {
    height: 20px;
    padding: 0 4px;
    font-size: 12px;
    line-height: 18px;
  }
}

.urgent-order-tip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  white-space: nowrap;
}

.product-name-cell {
  position: relative;
  display: inline-block;
  max-width: 100%;
  padding-right: 12px;
}

.urgent-star {
  color: #f56c6c;
  font-style: normal;
  line-height: 1;
}

.product-urgent-star {
  position: absolute;
  top: -6px;
  right: 0;
  font-size: 13px;
}

.gantt-process-table {
  width: 100%;

  :deep(.el-table__header-wrapper th.el-table__cell) {
    padding: 2px 4px;
    height: 26px;
    line-height: 22px;
    font-size: 14px;
  }

  :deep(.el-table__body-wrapper td.el-table__cell) {
    padding: 2px 4px;
    height: 28px;
    line-height: 24px;
    font-size: 14px;
  }
}

.process-drag-cell {
  width: 100%;
  cursor: grab;
  font-weight: 600;
  color: #409eff;

  &:active {
    cursor: grabbing;
  }
}

.gantt-order-drag {
  padding: 0;
  gap: 4px;
  min-height: 0;
}

.gantt-location-filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 1 430px;
  min-width: 320px;
}

.gantt-date-picker {
  flex: 1;
  min-width: 0;
  width: 100% !important;

  :deep(.el-range-input) {
    font-size: 12px;
  }

  :deep(.el-input__wrapper) {
    padding: 0 6px;
  }
}

.gantt-location {
  flex: 1 1 auto;
  min-width: 0;
  width: 100% !important;
  display: block;

  :deep(.el-input),
  :deep(.el-input__wrapper),
  :deep(.el-tooltip__trigger) {
    width: 100% !important;
  }

  :deep(.el-input__wrapper) {
    flex-wrap: nowrap;
    overflow: hidden;
    padding: 0 8px;
    min-height: 32px;
    max-height: 32px;
  }

  :deep(.el-cascader__tags) {
    display: flex;
    flex-wrap: nowrap;
    overflow: hidden;
    white-space: nowrap;
    max-height: 24px;
    align-items: center;
  }

  :deep(.el-tag) {
    flex-shrink: 0;
    max-width: none;
  }

  :deep(.el-cascader__search-input) {
    flex: 1;
    min-width: 24px;
    margin-left: 0;
  }
}

.gantt-toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;

  :deep(.el-button) {
    padding: 8px 15px;
    font-size: 14px;
    height: 32px;
  }
}

.gantt-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;

  :deep(.el-button) {
    padding: 8px 15px;
    font-size: 14px;
    height: 32px;
  }
}

.legend {
  display: flex;
  gap: 18px;
  flex-shrink: 0;
  white-space: nowrap;
  color: #606266;
  font-size: 13px;
}

.forced-legend {
  color: #f56c6c;
  font-weight: 600;
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 4px;
}

.scheduled {
  background: #22c55e;
}

.auditing {
  background: #facc15;
}

.pending {
  background: #409eff;
}

.running {
  background: #2f855a;
}

.finished {
  background: #b8bcc3;
}

.forced {
  background: #f56c6c;
}

.processed {
  background: #67c23a;
}

.gantt-grid-wrap {
  overflow: auto;
  border: 1px solid #dcdfe6;
  max-height: v-bind(ganttGridMaxHeight);
}

.gantt-grid {
  border-collapse: collapse;
  min-width: 1700px;
  width: 100%;

  th,
  td {
    border: 1px solid #dcdfe6;
    min-width: 56px;
    text-align: center;
    color: #303133;
    font-weight: 400;
  }

  tbody td {
    height: 36px;
  }

  thead th {
    height: 26px;
    padding: 0 4px;
    background: #f5f7fa;
    font-size: 12px;
    line-height: 26px;
  }
}

.corner-cell {
  position: relative;
  width: 130px;
  min-width: 130px !important;
  background:
    linear-gradient(to top right, transparent 49.5%, #dcdfe6 50%, transparent 50.5%),
    #fff !important;
}

.corner-time {
  position: absolute;
  right: 16px;
  top: 3px;
}

.corner-location {
  position: absolute;
  left: 12px;
  bottom: 3px;
}

.line-name {
  width: 130px;
  min-width: 130px !important;
  height: 36px;
  text-align: left !important;
  padding: 0 8px;
  background: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  line-height: 36px;
}

.gantt-time-cell {
  position: relative;
  overflow: visible;
  padding: 0;
}

.gantt-task {
  position: absolute;
  left: 4px;
  z-index: 2;
  height: 18px;
  line-height: 18px;
  border-radius: 2px;
  padding: 0 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  color: #fff;
  font-size: 11px;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  cursor: default;
  box-shadow: 0 1px 2px rgb(0 0 0 / 14%);
}

.is-draggable-task {
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}

.is-locked-task {
  cursor: default;
}

.status-已加工 {
  background: #22c55e;
  color: #fff;
}

.status-已发布 {
  background: #facc15;
  color: #303133;
}

.status-待排产 {
  background: #409eff;
  color: #fff;
}

.status-正在生产 {
  background: #2f855a;
}

.status-已完成 {
  background: #b8bcc3;
  color: #303133;
}

.force-parallel-task {
  border: 2px solid #f56c6c;
}

.urgent-task {
  &::after {
    content: "★";
    position: absolute;
    top: -9px;
    right: -7px;
    z-index: 3;
    color: #f56c6c;
    font-size: 14px;
    line-height: 14px;
    pointer-events: none;
    text-shadow:
      0 0 1px #fff,
      0 0 2px #fff,
      0 0 3px #fff;
    text-align: center;
  }
}

.task-info {
  min-width: 0;
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
}

.task-action-menu {
  position: fixed;
  z-index: 3000;
  min-width: 104px;
  padding: 6px;
  display: grid;
  gap: 2px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 8px 20px rgb(0 0 0 / 14%);

  :deep(.el-button) {
    justify-content: flex-start;
    margin-left: 0;
    padding: 4px 8px;
  }
}

.task-detail-popover {
  position: fixed;
  z-index: 2999;
  width: 320px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 10px 24px rgb(0 0 0 / 16%);
}

.task-detail-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid #ebeef5;
}

.task-detail-content {
  display: grid;
  gap: 6px;
  padding: 10px 12px 12px;
  color: #303133;
  font-size: 13px;
}

.task-detail-row {
  display: flex;
  align-items: flex-start;
  gap: 0;
}

.task-detail-label {
  flex: 0 0 auto;
  min-width: 72px;
  color: #606266;
}

.task-detail-label::after {
  content: "：";
}

.task-force-reason {
  color: #f56c6c;
  font-weight: 600;
}

.task-force-reason .task-detail-label,
.task-force-reason span:last-child {
  color: #f56c6c;
}
</style>
