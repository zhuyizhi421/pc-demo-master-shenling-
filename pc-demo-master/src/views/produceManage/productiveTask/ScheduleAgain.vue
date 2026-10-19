<template>
  <div class="schedule-again">
    <div class="back">
      <el-button icon="ArrowLeft" @click="back()">返回</el-button>
      <div>可排产数量：{{ canScheduleAmount }}</div>
      <el-button icon="CircleCheck" @click="onOkClick" type="primary">确认</el-button>
    </div>

    <CustomTable ref="tableRef" v-model:table-data="tableData" :config="tableConfig">
      <template #status-default="{ row }">
        {{ statusList[row.status] }}
      </template>
      <template #action-default="{ row, $index }">
        <el-button type="primary" link v-if="$index == 0" @click="onHandleClick('split', row)">
          拆分
        </el-button>
        <el-button type="primary" link @click="onHandleClick('update', row)">调整</el-button>
        <el-button type="danger" v-if="$index != 0" link @click="onHandleClick('delete', row)"
          >删除</el-button
        >
      </template>
    </CustomTable>

    <!-- 拆分，调整排产 -->
    <UpdateSchedule
      v-model="showUpdate"
      :productBaseAmount="currentTask?.productBaseAmount"
      :title="handleType == 'split' ? '拆分排产' : '调整排产'"
      :techVersionId="currentTask?.techVersionId"
      :currentInfo="currentTask"
      :outputName="currentTask?.productModelName"
      @onOk="onUpdateScheduleOk"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { queryProductionTaskDetail, requestReScheduleProduction } from "@/api/scheduling"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import { useAreaLocation } from "@/hooks/useAreaLocation"
import type { IProductionTaskPageItem } from "@/types/production-manage/product-task"

import UpdateSchedule from "./UpdateScheduleDialog.vue"

type IHandleType = "split" | "update" | "delete"
type tableItem = IProductionTaskPageItem & {
  quantity?: number
  level?: number
  productionTaskId?: string
}

defineOptions({
  name: "ScheduleAgain"
})

const props = withDefaults(
  defineProps<{
    id: string
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "close"): void
  (e: "success"): void
}>()

const { curLocation } = useAreaLocation()
const tableConfig = ref<ITableConfig>({
  stripe: true,
  columns: [
    {
      prop: "no",
      label: "任务编号",
      width: 160,
      showOverflowTooltip: true
    },
    {
      prop: "status",
      label: "状态",
      width: 90,
      align: "center",
      showOverflowTooltip: true,
      slots: {
        default: "status-default"
      }
    },
    {
      prop: "productionOrderNo",
      label: "生产订单",
      width: 160,
      showOverflowTooltip: true
    },
    {
      prop: "productModelName",
      label: "产品名称",
      width: 160,
      showOverflowTooltip: true
    },
    {
      prop: "productModelSpec",
      label: "产品规格",
      width: 160,
      formatter: (row: any) => row.productModelSpec || row.productModel?.specification || "-"
    },
    {
      prop: "drawingNumber",
      label: "产品图号",
      width: 160,
      showOverflowTooltip: true
    },
    {
      prop: "techProcessNo",
      label: "工艺路线编号",
      width: 160,
      showOverflowTooltip: true
    },
    {
      prop: "processSerial",
      label: "工序",
      width: 160,
      showOverflowTooltip: true
    },
    {
      prop: "entityName",
      label: "生产区域",
      width: 160,
      showOverflowTooltip: true
    },
    {
      prop: "quantity",
      label: "排产数量",
      width: 120,
      align: "right",
      showOverflowTooltip: true
    },
    {
      prop: "unitName",
      label: "单位",
      width: 90,
      align: "center",
      showOverflowTooltip: true
    },
    {
      prop: "archiveManName",
      label: "结案人",
      width: 120,
      align: "center",
      showOverflowTooltip: true
    },
    {
      prop: "planBeginTime",
      label: "计划开始时间",
      width: 160,
      align: "center",
      showOverflowTooltip: true
    },
    {
      prop: "planEndTime",
      label: "计划结束时间",
      width: 160,
      align: "center",
      showOverflowTooltip: true
    },
    {
      prop: "createTime",
      label: "创建时间",
      width: 160,
      align: "center",
      showOverflowTooltip: true
    },
    {
      prop: "action",
      label: "操作",
      width: 120,
      fixed: "right",
      slots: {
        default: "action-default"
      }
    }
  ]
})

const statusList: Record<string, string> = {
  1: "未开始",
  // 5: "待复核",
  6: "进行中",
  8: "已暂停",
  9: "已完成"
  // 10: "已关闭"
}

const showUpdate = ref(false)
const currentTask = ref<tableItem>()
const currentTaskIndex = ref(0)
const taskDetailInfo = ref<tableItem>()
const handleType = ref<IHandleType>("split")
const tableData = ref<tableItem[]>([])

// 可排产数量
const canScheduleAmount = computed(() => {
  const planAmount = taskDetailInfo.value?.taskAmount ?? 0
  const completeAmount = taskDetailInfo.value?.completeAmount ?? 0
  return planAmount - completeAmount
})

onMounted(() => {
  getDetailInfo()
})

const getDetailInfo = async () => {
  const res = await queryProductionTaskDetail(props.id)
  taskDetailInfo.value = res
  tableData.value = [
    {
      ...res,
      quantity: canScheduleAmount.value,
      level: curLocation.level,
      productionTaskId: props.id
    }
  ]
  // tableData.value = res.records
}

/** 点击操作 */
const onHandleClick = async (type: IHandleType, row: tableItem) => {
  currentTask.value = row
  currentTask.value.taskAmount = row.quantity! // 用于弹窗回显
  currentTaskIndex.value = tableData.value.findIndex((item) => item === row)
  if (type === "delete") {
    await ElMessageBox.confirm("确定删除该拆分项？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })
    tableData.value[0].quantity = Number(tableData.value[0].quantity!) + Number(row.quantity!)
    tableData.value = tableData.value.filter((item) => item != row)
    return
  }
  handleType.value = type
  showUpdate.value = true
}

/** 更新,拆分排产 */
const onUpdateScheduleOk = async (data: any, selectNodes: any[]) => {
  console.log("data", data, selectNodes)
  const params = {
    planBeginTime: data.beginTime,
    planEndTime: data.endTime,
    ctTime: data.ctTime,
    entityId: data.entityId,
    quantity: data.mainProductQuantity,
    level: curLocation.level,
    productionTaskId: props.id,
    originalTaskId: props.id,

    // 表格回显部分
    entityName: selectNodes.map((item) => item.label).join(",")
  }
  const dataList = tableData.value.filter((item) => item !== currentTask.value)
  const limitNum =
    canScheduleAmount.value - dataList.reduce((prev, cur) => prev + Number(cur.quantity!), 0)
  if (Number(data.mainProductQuantity) > Number(limitNum)) {
    ElMessage.error("数量不能大于等于可排产数量")
    return
  }
  if (handleType.value === "split") {
    const originData = { ...tableData.value[0] }
    console.log("originData", originData, data)
    if (Number(data.mainProductQuantity) >= Number(originData.quantity!)) {
      ElMessage.error("拆分数量不能大于等于原始数量")
      return
    }
    tableData.value[0].quantity = tableData.value[0].quantity! - data.mainProductQuantity

    tableData.value.push({ ...originData, ...params })
  } else {
    tableData.value[currentTaskIndex.value] = { ...currentTask.value!, ...params }
  }
  ElMessage.success("暂存成功，需点击确认后提交后台保存")
  showUpdate.value = false
}

const onOkClick = async () => {
  await ElMessageBox.confirm("提交后不可撤销，确定提交再排产？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
  const originData = tableData.value[0]!
  await requestReScheduleProduction({
    originalTask: {
      beginTime: originData.planBeginTime,
      endTime: originData.planEndTime,
      entityIds: originData.entityId,
      level: originData.level!,
      productionTaskId: originData.productionTaskId!,
      quantity: originData.quantity!
    },
    splitTaskList: tableData.value.slice(1).map((item) => ({
      beginTime: item.planBeginTime,
      endTime: item.planEndTime,
      entityIds: item.entityId,
      level: item.level!,
      originalTaskId: item.productionTaskId!,
      quantity: item.quantity!
    }))
  })
  ElMessage.success("保存成功")
  back()
}

const back = () => {
  emit("close")
  emit("success")
}
</script>

<style scoped lang="scss">
.schedule-again {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px 20px 16px;
  color: #303133;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;

  .back {
    display: flex;
    width: 100%;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  &:deep(.el-table) {
    flex: 1;
  }
}
</style>
