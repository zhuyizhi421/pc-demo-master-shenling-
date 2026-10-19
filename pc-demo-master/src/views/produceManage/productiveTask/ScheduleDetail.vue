<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content">
      <div>
        <el-button icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>

      <CustomTitle title="生产任务"></CustomTitle>
      <CustomTable
        ref="customTableRef"
        v-model:table-data="parentTableData"
        :config="parentTableConfig"
      >
      </CustomTable>

      <CustomTitle title="下级生产任务"></CustomTitle>
      <CustomTable
        ref="customTableRef"
        v-model:table-data="customTableData"
        v-model:total="pagination.total"
        :config="tableConfig"
        :query-config="queryConfig"
        class="custom-detail-table"
      >
        <template #operation-default="{ row }">
          <el-button type="primary" size="small" @click="onViewChildDetail(row)" link
            >查看详情</el-button
          >
        </template>
      </CustomTable>
    </div>

    <CustomPagination
      v-model:currentPage="pagination.currentPage"
      v-model:pageSize="pagination.pageSize"
      :total="pagination.total"
      border
      @change="customTableRef?.requestData()"
    />
  </div>
</template>

<script setup lang="ts">
import { queryProductionTaskDetail, requestChildProductionTask } from "@/api/scheduling"
import type { IPagedAPIParams } from "@/api/type"
import CustomPagination from "@/components/CustomPagination/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import type {
  IProductionTaskPageItem,
  IProductionTaskPageItem as ITableRow
} from "@/types/production-manage/product-task"
import { isEffectiveValue, precisionConversion } from "@/utils/common"

const props = withDefaults(
  defineProps<{
    id: string
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "close"): void
  (e: "success", no: string): void
}>()

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const statusList: Record<string, string> = {
  1: "未开始",
  // 5: "待复核",
  6: "进行中",
  8: "已暂停",
  9: "已完成"
  // 10: "已关闭"
}
const parentTableData = ref<IProductionTaskPageItem[]>([])
const parentTableConfig = ref<ITableConfig>({
  columns: [
    {
      prop: "no",
      label: "任务编号",
      width: 160
    },
    {
      prop: "status",
      label: "状态",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        return statusList[row.status] ?? ""
      }
    },
    {
      prop: "productionOrderNo",
      label: "生产订单",
      width: 160
    },
    {
      prop: "productModelName",
      label: "产品名称",
      width: 160
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
      width: 160
    },
    {
      prop: "techProcessNo",
      label: "工艺路线编号",
      width: 160
    },
    {
      prop: "processSerial",
      label: "工序",
      width: 160
    },
    {
      prop: "entityName",
      label: "生产区域",
      width: 160
    },
    {
      prop: "taskAmount",
      label: "计划加工数量",
      width: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return isEffectiveValue(row.taskAmount)
          ? precisionConversion(row.taskAmount, row.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "completeAmount",
      label: "完工数量",
      width: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return isEffectiveValue(row.completeAmount)
          ? precisionConversion(row.completeAmount, row.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "unitName",
      label: "单位",
      width: 120,
      align: "center"
    },
    {
      prop: "archiveManName",
      label: "结案人",
      width: 120,
      align: "center"
    },
    {
      prop: "planBeginTime",
      label: "计划开始时间",
      width: 160
    },
    {
      prop: "planEndTime",
      label: "计划完工时间",
      width: 160
    },
    {
      prop: "beginTime",
      label: "实际开始时间",
      width: 160
    },
    {
      prop: "endTime",
      label: "结案时间",
      width: 160
    },
    {
      prop: "createTime",
      label: "创建时间",
      width: 160
    }
  ]
})

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "no",
      label: "任务编号",
      width: 160
    },
    {
      prop: "status",
      label: "状态",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        return statusList[row.status] ?? ""
      }
    },
    {
      prop: "productionOrderNo",
      label: "生产订单",
      width: 160
    },
    {
      prop: "productModelName",
      label: "产品名称",
      width: 160
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
      width: 160
    },
    {
      prop: "techProcessNo",
      label: "工艺路线编号",
      width: 160
    },
    {
      prop: "processSerial",
      label: "工序",
      width: 160
    },
    {
      prop: "entityName",
      label: "生产区域",
      width: 160
    },
    {
      prop: "taskAmount",
      label: "计划加工数量",
      width: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return isEffectiveValue(row.taskAmount)
          ? precisionConversion(row.taskAmount, row.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "completeAmount",
      label: "完工数量",
      width: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return row.bizType === 2
          ? ""
          : isEffectiveValue(row.completeAmount)
            ? precisionConversion(row.completeAmount, row.decimalNumber ?? 2)
            : ""
      }
    },
    {
      prop: "unitName",
      label: "单位",
      width: 120,
      align: "center"
    },
    {
      prop: "archiveManName",
      label: "结案人",
      width: 120,
      align: "center"
    },
    {
      prop: "planBeginTime",
      label: "计划开始时间",
      width: 160
    },
    {
      prop: "planEndTime",
      label: "计划完工时间",
      width: 160
    },
    {
      prop: "beginTime",
      label: "实际开始时间",
      width: 160
    },
    {
      prop: "endTime",
      label: "结案时间",
      width: 160
    },
    {
      prop: "createTime",
      label: "创建时间",
      width: 160
    },
    {
      prop: "operation",
      label: "操作",
      width: 160,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

onMounted(() => {
  getParentTableData()
})

/** 查看子任务详情 */
const onViewChildDetail = (row: any) => {
  emit("close")
  emit("success", row.no)
}

/** 获取父任务数据 */
const getParentTableData = async () => {
  const data = await queryProductionTaskDetail(props.id)
  parentTableData.value = [data]
}

/** 获取子任务数据 */
const queryConfig: ITableRequestConfig<[IPagedAPIParams<{ id: string }>], ITableRow, true> = {
  api: requestChildProductionTask,
  getParams: () => {
    return [
      {
        pageQuery: {
          pageNum: pagination.value.currentPage,
          pageSize: pagination.value.pageSize
        },
        queryParam: {
          id: props.id
        },
        sort: [
          {
            field: "createTime",
            order: "desc"
          }
        ]
      }
    ]
  }
}
</script>

<style lang="scss" scoped>
.layout-child-page-content {
  flex: 1;
}
.custom-detail-table {
  flex: 1;
  overflow: hidden;
}
</style>
