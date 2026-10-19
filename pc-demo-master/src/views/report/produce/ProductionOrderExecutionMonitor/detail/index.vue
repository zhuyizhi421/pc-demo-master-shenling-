<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <!-- 返回按钮 -->
      <div class="page-header">
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <div class="page-title">
          数采详情 - 设备：{{ equipmentNo }} | 生产任务：{{ productionTaskNo }}
        </div>
      </div>

      <!-- 统计信息卡片 -->
      <div class="stats-cards">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card shadow="hover">
              <div class="stat-item">
                <div class="stat-label">设备编号</div>
                <div class="stat-value">{{ equipmentNo }}</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <div class="stat-item">
                <div class="stat-label">生产任务号</div>
                <div class="stat-value">{{ productionTaskNo }}</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <div class="stat-item">
                <div class="stat-label">统计日期</div>
                <div class="stat-value">{{ statDate }}</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <div class="stat-item">
                <div class="stat-label">采集记录数</div>
                <div class="stat-value">{{ detailList.length }}</div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 数采详情表格 -->
      <div class="custom-table-container">
        <CustomTitle title="设备采集明细" />
        <el-table :data="detailList" border stripe style="width: 100%">
          <el-table-column prop="equipmentNo" label="设备编号" width="100" />
          <el-table-column prop="processingTime" label="加工时长(S)" width="120">
            <template #default="{ row }">
              {{ row.processingTime || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="alarmTime" label="报警时长(S)" width="120">
            <template #default="{ row }">
              {{ row.alarmTime || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="idleTime" label="空闲时长(S)" width="120">
            <template #default="{ row }">
              {{ row.idleTime || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="startTime" label="开始时间" width="180" />
          <el-table-column prop="endTime" label="结束时间" width="180" />
          <el-table-column prop="status" label="设备运行状态" width="120">
            <template #default="{ row }">
              <el-tag :type="row.status === '正常' ? 'success' : 'danger'">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import { ArrowLeft } from "@element-plus/icons-vue"

// import { queryEquipmentCollectionDetail } from "@/api/report/produce/productionOrderExecutionMonitor"
import CustomTitle from "@/components/CustomTitle/index.vue"
import type { IEquipmentCollectionDetailItem } from "@/types/report/produce/productionOrderExecutionMonitor"

defineOptions({
  name: "ProductionOrderExecutionDetail"
})

const route = useRoute()
const router = useRouter()

// 查询参数
const equipmentNo = ref(route.query.equipmentNo as string || "")
const productionTaskNo = ref(route.query.productionTaskNo as string || "")
const statDate = ref(route.query.statDate as string || "")

// 详情数据
const detailList = ref<IEquipmentCollectionDetailItem[]>([])

// 返回
const goBack = () => {
  router.back()
}

// 加载详情数据
const loadDetail = async () => {
  // 暂时直接使用模拟数据，确保页面有数据显示
  detailList.value = getMockDetailData()

  // TODO: 后端接口完成后使用以下代码
  // if (!equipmentNo.value || !productionTaskNo.value) {
  //   ElMessage.warning("缺少查询参数")
  //   return
  // }
  // try {
  //   const res = await queryEquipmentCollectionDetail({
  //     equipmentNo: equipmentNo.value,
  //     productionTaskNo: productionTaskNo.value,
  //     statDate: statDate.value
  //   })
  //   detailList.value = res || []
  // } catch (error) {
  //   console.error("获取数采详情失败:", error)
  //   detailList.value = getMockDetailData()
  // }
}

// 模拟Excel中的数采详情数据
const getMockDetailData = () => {
  return [
    {
      equipmentNo: "SS-01",
      processingTime: 120,
      alarmTime: null,
      idleTime: 50,
      startTime: "2026/10/15 T 8:23:05",
      endTime: "2026/10/15 T 8:25:05",
      status: "正常"
    },
    {
      equipmentNo: "SS-01",
      processingTime: 120,
      alarmTime: null,
      idleTime: 65,
      startTime: "2026/10/15 T 8:20:15",
      endTime: "2026/10/15 T 8:22:15",
      status: "正常"
    },
    {
      equipmentNo: "SS-01",
      processingTime: 120,
      alarmTime: null,
      idleTime: 120,
      startTime: "2026/10/15 T 8:17:05",
      endTime: "2026/10/15 T 8:19:05",
      status: "正常"
    },
    {
      equipmentNo: "SS-01",
      processingTime: 120,
      alarmTime: null,
      idleTime: 60,
      startTime: "2026/10/15 T 8:13:05",
      endTime: "2026/10/15 T 8:15:05",
      status: "正常"
    },
    {
      equipmentNo: "SS-01",
      processingTime: 120,
      alarmTime: null,
      idleTime: 0,
      startTime: "2026/10/15 T 8:10:05",
      endTime: "2026/10/15 T 8:12:05",
      status: "正常"
    },
    {
      equipmentNo: "SS-01",
      processingTime: null,
      alarmTime: 600,
      idleTime: null,
      startTime: "2026/10/15 T 8:00:00",
      endTime: "2026/10/15 T 8:10:00",
      status: "报警"
    }
  ]
}

onMounted(() => {
  loadDetail()
})
</script>

<style scoped>
.layout-container {
  padding: 16px;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  margin-left: 20px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.custom-table-container {
  margin-top: 20px;
}
</style>
