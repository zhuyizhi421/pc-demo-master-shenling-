<template>
  <div class="layout-child-page-container">
    <!-- 基础信息 -->
    <div class="base-content">
      <CustomTitle
        title="查看BOM"
        :is-table-title="false"
        show-short-bar
      >
        <div>
          <el-button @click="onBack">返回</el-button>
        </div>
      </CustomTitle>

      <!-- BOM主件信息 -->
      <div class="bom-header-info">
        <div class="info-item">
          <span class="info-label">父件产品名称：</span>
          <span class="info-value">{{ bomData.productName }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">父件产品编号：</span>
          <span class="info-value">{{ bomData.productCode }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">版本：</span>
          <span class="info-value">{{ bomData.version }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">来源：</span>
          <el-tag :type="bomData.source === 'ERP' ? 'info' : 'success'" size="small">
            {{ bomData.source }}
          </el-tag>
        </div>
        <div class="info-item">
          <span class="info-label">状态：</span>
          <el-tag :type="getStatusType(bomData.status)" size="small">
            {{ getStatusText(bomData.status) }}
          </el-tag>
        </div>
        <div class="info-item" v-if="bomData.effectiveTime">
          <span class="info-label">生效时间：</span>
          <span class="info-value">{{ bomData.effectiveTime }}</span>
        </div>
      </div>

      <!-- BOM明细表格 -->
      <CustomTitle title="BOM信息" :is-table-title="false" show-short-bar style="margin-top: 24px" />
      
      <div class="bom-items-table">
        <el-table
          :data="bomData.items"
          border
          stripe
          style="width: 100%"
          :header-cell-style="{ background: '#f5f7fa' }"
        >
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="productName" label="子件产品名称" min-width="200" show-overflow-tooltip />
          <el-table-column prop="productCode" label="子件产品编号" min-width="160" />
          <el-table-column prop="unitName" label="子件产品单位" width="120" align="center" />
          <el-table-column prop="baseQuantity" label="底数" width="100" align="center" />
          <el-table-column prop="composeQuantity" label="组成量" width="100" align="center" />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"
import {  onMounted, ref } from "vue"

import {
  disableBom,
  getBomDetail,
  type IBomDetail,
  publishBom} from "@/api/bom"
import CustomTitle from "@/components/CustomTitle/index.vue"


defineOptions({
  name: "BomDetail"
})

const props = defineProps<{
  id: string
  isReadonly?: boolean
}>()

const emit = defineEmits<{
  (e: "back"): void
  (e: "edit", id: string): void
  (e: "refresh"): void
}>()

// BOM数据
const bomData = ref<IBomDetail>({
  id: "",
  productId: "",
  productCode: "",
  productName: "",
  source: "系统",
  version: "",
  status: "unpublished",
  effectiveTime: "",
  createTime: "",
  items: []
})

// 升级弹窗
const upgradeVisible = ref(false)
const upgradeData = ref({
  id: "",
  productCode: "",
  productName: "",
  version: ""
})

// 页面标题
// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    unpublished: "info",
    published: "success",
    disabled: "danger"
  }
  return typeMap[status] || "info"
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    unpublished: "未发布",
    published: "已发布",
    disabled: "停用"
  }
  return textMap[status] || status
}

// 加载BOM详情
const loadBomDetail = async () => {
  try {
    const res = await getBomDetail(props.id)
    bomData.value = res
  } catch (error) {
    console.error("加载BOM详情失败:", error)
    ElMessage.error("加载BOM详情失败")
  }
}

// 返回
const onBack = () => {
  emit("back")
}

// 编辑
const onEdit = () => {
  emit("edit", props.id)
}

// 发布
const onPublish = async () => {
  try {
    await ElMessageBox.confirm("确定要发布该BOM吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })
    await publishBom(props.id)
    ElMessage.success("发布成功")
    await loadBomDetail()
    emit("refresh")
  } catch {
    // 取消发布
  }
}

// 停用
const onDisable = async () => {
  try {
    await ElMessageBox.confirm("确定要停用该BOM吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })
    await disableBom(props.id)
    ElMessage.success("停用成功")
    await loadBomDetail()
    emit("refresh")
  } catch {
    // 取消停用
  }
}

// 升级
const onUpgrade = () => {
  upgradeData.value = {
    id: bomData.value.id,
    productCode: bomData.value.productCode,
    productName: bomData.value.productName,
    version: bomData.value.version
  }
  upgradeVisible.value = true
}

// 升级成功
const onUpgradeSuccess = () => {
  emit("refresh")
  emit("back")
}

onMounted(() => {
  if (props.id) {
    loadBomDetail()
  }
})
</script>

<style scoped lang="scss">
.layout-child-page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .base-content {
    flex: 1;
    overflow: auto;
    padding: 16px;
    background: #fff;
    border-radius: 4px;
  }

  .bom-header-info {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    padding: 16px;
    border-radius: 4px;
    margin-top: 16px;

    .info-item {
      display: flex;
      align-items: center;
      width: 30%;
      .info-label {
        color: #606266;
        font-size: 14px;
      }

      .info-value {
        color: #303133;
        font-size: 14px;
        font-weight: 500;
      }
    }
  }

  .bom-items-table {
    margin-top: 16px;
  }

  .bom-remark {
    margin-top: 24px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 4px;

    .remark-label {
      color: #606266;
      font-size: 14px;
      font-weight: 500;
    }

    .remark-value {
      color: #303133;
      font-size: 14px;
    }
  }
}
</style>
