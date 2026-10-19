<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="生产订单执行监控列表" />
        <el-table
          ref="tableRef"
          :data="tableData"
          :span-method="spanMethod"
          :row-class-name="getRowClassName"
          border
          style="width: 100%"
        >
          <el-table-column prop="equipmentNo" label="设备编号" width="100" />
          <el-table-column prop="dataType" label="类型" width="80">
            <template #default="{ row }">
              <span :style="{ color: getTypeColor(row.dataType) }">
                {{ getTypeName(row.dataType) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="productionOrderNo" label="生产订单号" width="140" />
          <el-table-column prop="productModelName" label="产品名称" width="120" />
          <el-table-column prop="productModelCode" label="产品编号" width="110" />
          <el-table-column prop="productionTaskNo" label="生产任务号" width="140" />
          <el-table-column prop="techName" label="工艺名称" width="100" />
          <el-table-column prop="processSerial" label="工序编号" width="90" />
          <el-table-column prop="startTime" label="开始时间" width="160" />
          <el-table-column prop="endTime" label="结束时间" width="160" />
          <el-table-column prop="duration" label="工作时长(分钟)" width="120" />
          <el-table-column prop="waitingTime" label="设备待机时长(分钟)" width="140" />
          <el-table-column prop="outputQty" label="产量" width="80" />
          <el-table-column prop="reporterName" label="报工人" width="100" />
          <el-table-column prop="statDate" label="统计日期" width="120" />
          <el-table-column label="操作" width="100" fixed="right" align="center">
            <template #default="{ row }">
              <el-button
                type="primary"
                link
                @click="goToDetail(row)"
              >
                数采详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <CustomPagination
          v-model:currentPage="pagination.currentPage"
          v-model:pageSize="pagination.pageSize"
          :total="pagination.total"
          :border="false"
          @change="onSubmit"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue"
import { useRouter } from "vue-router"

import { queryProductionOrderExecutionMonitorPage } from "@/api/report/produce/productionOrderExecutionMonitor"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig, ITableRequestConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"

defineOptions({
  name: "ProductionOrderExecutionMonitor"
})

const router = useRouter()

// 设备选项
const equipmentOptions = ref([
  { label: "SS-01", value: "SS-01" },
  { label: "SS-02", value: "SS-02" },
  { label: "SS-03", value: "SS-03" }
])

// 搜索表单配置
const searchList = ref([
  {
    type: EnumComponentType.Date,
    dateType: "daterange",
    modelValue: "dateRange",
    label: "计划开始日期",
    startDate: "planBeginTimeStart",
    endDate: "planBeginTimeEnd",
    valueFormat: "YYYY-MM-DD"
  },
  {
    type: EnumComponentType.Select,
    modelValue: "equipmentNo",
    label: "设备编号",
    placeholder: "请选择设备",
    options: equipmentOptions
  },
  {
    type: EnumComponentType.Input,
    modelValue: "productionOrderNo",
    label: "生产订单号",
    placeholder: "请输入生产订单号"
  },
  {
    type: EnumComponentType.Input,
    modelValue: "productionTaskNo",
    label: "生产任务号",
    placeholder: "请输入生产任务号"
  },
  {
    type: EnumComponentType.Input,
    modelValue: "processSerial",
    label: "工序编号",
    placeholder: "请输入工序编号"
  },
  {
    type: EnumComponentType.Input,
    modelValue: "productModelCode",
    label: "产品编号",
    placeholder: "请输入产品编号"
  },
  {
    type: EnumComponentType.Input,
    modelValue: "productModelName",
    label: "产品名称",
    placeholder: "请输入产品名称"
  },
  {
    type: EnumComponentType.Input,
    modelValue: "reporterName",
    label: "报工人姓名",
    placeholder: "请输入报工人姓名"
  }
])

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 表格数据
const tableData = ref([])
const tableRef = ref()

// 表格配置
const tableConfig = ref<ITableConfig>({
  stripe: true,
  border: true,
  showOverflowTooltip: true,
  columns: [
    {
      label: "设备编号",
      prop: "equipmentNo",
      width: 100
    },
    {
      label: "类型",
      prop: "dataType",
      width: 80,
      formatter: (row: any) => {
        const typeMap: Record<string, string> = {
          plan: "计划",
          manual: "人工",
          collection: "数采"
        }
        return typeMap[row.dataType] || row.dataType
      }
    },
    {
      label: "生产订单号",
      prop: "productionOrderNo",
      width: 140
    },
    {
      label: "产品名称",
      prop: "productModelName",
      width: 120
    },
    {
      label: "产品编号",
      prop: "productModelCode",
      width: 110
    },
    {
      label: "生产任务号",
      prop: "productionTaskNo",
      width: 140
    },
    {
      label: "工艺名称",
      prop: "techName",
      width: 100
    },
    {
      label: "工序编号",
      prop: "processSerial",
      width: 90
    },
    {
      label: "开始时间",
      prop: "startTime",
      width: 160
    },
    {
      label: "结束时间",
      prop: "endTime",
      width: 160
    },
    {
      label: "工作时长(分钟)",
      prop: "duration",
      width: 120
    },
    {
      label: "设备待机时长(分钟)",
      prop: "waitingTime",
      width: 140
    },
    {
      label: "产量",
      prop: "outputQty",
      width: 80
    },
    {
      label: "报工人",
      prop: "reporterName",
      width: 100
    },
    {
      label: "统计日期",
      prop: "statDate",
      width: 120
    },
    {
      label: "操作",
      prop: "operation",
      width: 100,
      fixed: "right"
    }
  ]
})

// 查询配置
const queryConfig = ref<ITableRequestConfig>({
  url: "/api/report/productionOrderExecutionMonitor/page",
  method: "POST",
  params: {}
})

// 搜索
const { resetForm, getFormData } = useSearchForm(searchList.value)

// 暂时使用模拟数据
const onSubmit = async () => {
  // 模拟数据
  tableData.value = getMockData()
  pagination.total = tableData.value.length

  // TODO: 后端接口完成后，使用以下代码
  // const params = getFormData()
  // const reqParams = {
  //   ...params,
  //   pageNum: pagination.currentPage,
  //   pageSize: pagination.pageSize
  // }
  // try {
  //   const res = await queryProductionOrderExecutionMonitorPage(reqParams)
  //   tableData.value = res?.list || []
  //   pagination.total = res?.total || 0
  // } catch (error) {
  //   console.error("查询失败:", error)
  //   tableData.value = getMockData()
  //   pagination.total = tableData.value.length
  // }
}

// 模拟Excel中的数据
const getMockData = () => {
  return [
    // 订单1 - 弹簧座
    {
      equipmentNo: "SS-01",
      dataType: "plan",
      productionOrderNo: "202610150001",
      productModelName: "弹簧座",
      productModelCode: "20001006",
      productionTaskNo: "TASK20260001",
      techName: "精车",
      processSerial: "20",
      startTime: "2026-10-15 08:00:00",
      endTime: "2026-10-15 17:00:00",
      duration: 480,
      waitingTime: 0,
      outputQty: 200,
      reporterName: "张三",
      statDate: "2026-10-15"
    },
    {
      equipmentNo: "SS-01",
      dataType: "manual",
      productionOrderNo: "",
      productModelName: "",
      productModelCode: "",
      productionTaskNo: "TASK20260001",
      techName: "",
      processSerial: "",
      startTime: "2026-10-15 08:20:00",
      endTime: "2026-10-15 11:20:00",
      duration: 180,
      waitingTime: 0,
      outputQty: 198,
      reporterName: "",
      statDate: "2026-10-15"
    },
    {
      equipmentNo: "SS-01",
      dataType: "collection",
      productionOrderNo: "",
      productModelName: "",
      productModelCode: "",
      productionTaskNo: "TASK20260001",
      techName: "",
      processSerial: "",
      startTime: "2026-10-15 08:30:00",
      endTime: "2026-10-15 11:10:00",
      duration: 160,
      waitingTime: 30,
      outputQty: 206,
      reporterName: "",
      statDate: "2026-10-15"
    },
    // 订单1 - 钻孔
    {
      equipmentNo: "SS-01",
      dataType: "plan",
      productionOrderNo: "202610150001",
      productModelName: "弹簧座",
      productModelCode: "20001006",
      productionTaskNo: "TASK20260002",
      techName: "钻孔",
      processSerial: "30",
      startTime: "",
      endTime: "",
      duration: 0,
      waitingTime: 0,
      outputQty: 0,
      reporterName: "李四",
      statDate: "2026-10-15"
    },
    {
      equipmentNo: "SS-01",
      dataType: "manual",
      productionOrderNo: "",
      productModelName: "",
      productModelCode: "",
      productionTaskNo: "TASK20260002",
      techName: "",
      processSerial: "",
      startTime: "",
      endTime: "",
      duration: 0,
      waitingTime: 0,
      outputQty: 0,
      reporterName: "",
      statDate: "2026-10-15"
    },
    {
      equipmentNo: "SS-01",
      dataType: "collection",
      productionOrderNo: "",
      productModelName: "",
      productModelCode: "",
      productionTaskNo: "TASK20260002",
      techName: "",
      processSerial: "",
      startTime: "",
      endTime: "",
      duration: 0,
      waitingTime: 0,
      outputQty: 0,
      reporterName: "",
      statDate: "2026-10-15"
    },
    // 订单2 - 两通接头
    {
      equipmentNo: "SS-01",
      dataType: "plan",
      productionOrderNo: "202610150002",
      productModelName: "两通接头",
      productModelCode: "20001021",
      productionTaskNo: "TASK20260003",
      techName: "精车",
      processSerial: "50",
      startTime: "",
      endTime: "",
      duration: 0,
      waitingTime: 0,
      outputQty: 0,
      reporterName: "王五",
      statDate: "2026-10-15"
    },
    {
      equipmentNo: "SS-01",
      dataType: "manual",
      productionOrderNo: "",
      productModelName: "",
      productModelCode: "",
      productionTaskNo: "TASK20260003",
      techName: "",
      processSerial: "",
      startTime: "",
      endTime: "",
      duration: 0,
      waitingTime: 0,
      outputQty: 0,
      reporterName: "",
      statDate: "2026-10-15"
    },
    {
      equipmentNo: "SS-01",
      dataType: "collection",
      productionOrderNo: "",
      productModelName: "",
      productModelCode: "",
      productionTaskNo: "TASK20260003",
      techName: "",
      processSerial: "",
      startTime: "",
      endTime: "",
      duration: 0,
      waitingTime: 0,
      outputQty: 0,
      reporterName: "",
      statDate: "2026-10-15"
    },
    // 订单3 - 三通接头
    {
      equipmentNo: "SS-01",
      dataType: "plan",
      productionOrderNo: "202610150003",
      productModelName: "三通接头",
      productModelCode: "2000158",
      productionTaskNo: "TASK20260004",
      techName: "车螺纹",
      processSerial: "50",
      startTime: "",
      endTime: "",
      duration: 0,
      waitingTime: 0,
      outputQty: 0,
      reporterName: "赵六",
      statDate: "2026-10-15"
    },
    {
      equipmentNo: "SS-01",
      dataType: "manual",
      productionOrderNo: "",
      productModelName: "",
      productModelCode: "",
      productionTaskNo: "TASK20260004",
      techName: "",
      processSerial: "",
      startTime: "",
      endTime: "",
      duration: 0,
      waitingTime: 0,
      outputQty: 0,
      reporterName: "",
      statDate: "2026-10-15"
    },
    {
      equipmentNo: "SS-01",
      dataType: "collection",
      productionOrderNo: "",
      productModelName: "",
      productModelCode: "",
      productionTaskNo: "TASK20260004",
      techName: "",
      processSerial: "",
      startTime: "",
      endTime: "",
      duration: 0,
      waitingTime: 0,
      outputQty: 0,
      reporterName: "",
      statDate: "2026-10-15"
    }
  ]
}

// 获取类型名称
const getTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    plan: "计划",
    manual: "人工",
    collection: "数采"
  }
  return typeMap[type] || type
}

// 获取类型颜色
const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    plan: "#409EFF",
    manual: "#67C23A",
    collection: "#E6A23C"
  }
  return colorMap[type] || "#303133"
}

// 合并单元格方法 - 根据Excel结构
const spanMethod = ({ row, column, rowIndex, columnIndex }: any) => {
  // 列索引对应: 0-设备编号, 1-类型, 2-生产订单号, 3-产品名称, 4-产品编号, 5-生产任务号, 6-工艺名称, 7-工序编号, 8-开始时间, 9-结束时间, 10-工作时长, 11-设备待机时长, 12-产量, 13-报工人, 14-统计日期, 15-操作
  // 需要合并的列: 设备编号(0), 生产订单号(2), 产品名称(3), 产品编号(4), 生产任务号(5), 工艺名称(6), 工序编号(7), 报工人(13), 统计日期(14), 操作(15)
  // 不需要合并的列: 类型(1), 开始时间(8), 结束时间(9), 工作时长(10), 设备待机时长(11), 产量(12)

  const mergeColumns = [0, 2, 3, 4, 5, 6, 7, 13, 14, 15]
  const currentTaskNo = row.productionTaskNo

  if (!currentTaskNo) return { rowspan: 1, colspan: 1 }

  // 操作列: 三行合并为一个单元格
  if (columnIndex === 15) {
    const firstIndex = tableData.value.findIndex((item: any) => item.productionTaskNo === currentTaskNo)
    if (rowIndex === firstIndex) {
      return { rowspan: 3, colspan: 1 }
    } else {
      return { rowspan: 0, colspan: 0 }
    }
  }

  if (mergeColumns.includes(columnIndex)) {
    // 计算该生产任务的总行数
    const taskRows = tableData.value.filter((item: any) => item.productionTaskNo === currentTaskNo)
    const rowspan = taskRows.length
    const firstIndex = tableData.value.findIndex((item: any) => item.productionTaskNo === currentTaskNo)

    if (rowIndex === firstIndex) {
      return { rowspan, colspan: 1 }
    } else {
      return { rowspan: 0, colspan: 0 }
    }
  }

  return { rowspan: 1, colspan: 1 }
}

// 获取行样式 - 按生产任务区分底色(交替)
const getRowClassName = ({ row, rowIndex }: any) => {
  const currentTaskNo = row.productionTaskNo
  if (!currentTaskNo) return ""

  // 找到该生产任务在数组中的起始位置
  const firstIndex = tableData.value.findIndex((item: any) => item.productionTaskNo === currentTaskNo)
  // 根据任务位置交替使用不同底色
  const taskIndex = Math.floor(firstIndex / 3)

  return taskIndex % 2 === 0 ? "row-even" : "row-odd"
}

const onReset = () => {
  resetForm()
  onSubmit()
}

// 页面加载时自动查询
onMounted(() => {
  onSubmit()
})

// 跳转数采详情
const goToDetail = (row: any) => {
  router.push({
    path: "/report/reportProduce/productionOrderExecutionMonitor/detail",
    query: {
      equipmentNo: row.equipmentNo,
      productionTaskNo: row.productionTaskNo,
      statDate: row.statDate
    }
  })
}
</script>

<style scoped>
/* 偶数任务组 - 浅蓝色背景 */
:deep(.el-table .row-even) {
  background-color: rgba(64, 158, 255, 0.2) !important;
}

/* 奇数任务组 - 浅橙色背景 */
:deep(.el-table .row-odd) {
  background-color: rgba(230, 162, 60, 0.2) !important;
}
</style>
