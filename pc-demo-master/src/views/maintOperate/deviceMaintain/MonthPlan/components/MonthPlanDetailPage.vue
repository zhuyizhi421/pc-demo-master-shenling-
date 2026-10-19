<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content">
      <div class="page-toolbar">
        <el-button plain icon="ArrowLeft" @click="emit('close')">返回</el-button>
        <el-button v-if="canSplit" type="primary" plain @click="onSplitClick">拆分周计划</el-button>
      </div>

      <div v-loading="loading" class="month-plan-detail-page">
        <div class="section-card">
          <CustomTitle :title="pageTitle" :is-table-title="false" show-short-bar />

          <CustomDescription :data="detailData" :configs="mainInfoConfigs" :columns="3">
            <template #status-content>
              <el-tag
                :type="
                  EnumEquipmentMaintenanceMonthPlanStatusTagTypeMap[
                    detailData.status as EnumEquipmentMaintenanceMonthPlanStatusType
                  ]
                "
              >
                {{
                  EnumEquipmentMaintenanceMonthPlanStatusTypeMap[
                    detailData.status as EnumEquipmentMaintenanceMonthPlanStatusType
                  ]
                }}
              </el-tag>
            </template>

            <template #remarks-content>
              <el-input
                v-if="editable"
                v-model.trim="editableRemarks"
                type="textarea"
                :rows="3"
                maxlength="200"
                show-word-limit
                placeholder="请输入备注"
              />
              <div v-else class="remarks-value">{{ detailData.remarks || "--" }}</div>
            </template>
          </CustomDescription>
        </div>

        <div class="section-card section-card--table">
          <CustomTitle title="设备明细">
            <div v-if="editable">
              <el-button type="danger" plain @click="onBatchRemove">批量删除设备</el-button>
            </div>
          </CustomTitle>

          <CustomSearchForm :form-list="searchList" @search="onSearch" @reset="onResetSearch" />

          <div class="table-wrapper">
            <CustomTable
              ref="tableRef"
              v-model:table-data="filteredDetails"
              :config="tableConfig"
              @select-all="onSelectionChange"
              @select-change="onSelectionChange"
            >
              <template #operation-default="{ row }">
                <el-button link type="danger" size="small" @click="onRemoveSingle(row)">
                  删除
                </el-button>
              </template>
            </CustomTable>
          </div>
        </div>
      </div>
    </div>

    <div class="layout-footer">
      <el-button @click="emit('close')">返回</el-button>
      <el-button v-if="editable" type="primary" :loading="saving" @click="onSave">保存</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  queryEquipmentMaintenancePlanDetail,
  requestUpdateEquipmentMaintenancePlan
} from "@/api/operation/equipment/equipment-maintenance-plan"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import type {
  IEquipmentMaintenanceMonthPlanDetailItem,
  IEquipmentMaintenanceMonthPlanPageItem
} from "@/types/maintain/equipment-manage/equipment-maintenance-month-plan"
import { formatDateTime } from "@/views/maintOperate/status"

import {
  EnumEquipmentMaintenanceMonthPlanStatusTagTypeMap,
  EnumEquipmentMaintenanceMonthPlanStatusType,
  EnumEquipmentMaintenanceMonthPlanStatusTypeMap
} from "../status"

defineOptions({
  name: "MonthPlanDetailPage"
})

const props = defineProps<{
  id: string
  mode: "edit" | "detail"
}>()

const emit = defineEmits<{
  (e: "close"): void
  (e: "success"): void
  (e: "split", value: Partial<IEquipmentMaintenanceMonthPlanPageItem>): void
}>()

const detailData = ref<IEquipmentMaintenanceMonthPlanPageItem>({
  id: "",
  planNo: "",
  planMonth: "",
  planName: "",
  areaName: "",
  sourceType: "",
  sourceYearPlanId: "",
  sourceYearPlanNo: "",
  sourceYearPlanName: "",
  totalCount: 0,
  status: EnumEquipmentMaintenanceMonthPlanStatusType.Unreviewed,
  remarks: "",
  createBy: "",
  createTime: "",
  updateBy: "",
  updateTime: "",
  reviewBy: "",
  reviewTime: "",
  voidBy: "",
  voidTime: "",
  voidReason: "",
  details: []
})
const editableDetails = ref<IEquipmentMaintenanceMonthPlanDetailItem[]>([])
const filteredDetails = ref<IEquipmentMaintenanceMonthPlanDetailItem[]>([])
const editableRemarks = ref("")
const selectedRows = ref<IEquipmentMaintenanceMonthPlanDetailItem[]>([])
const loading = ref(false)
const saving = ref(false)
const tableRef = ref<ComponentExposed<typeof CustomTable>>()

const editable = computed(
  () =>
    props.mode === "edit" &&
    Number(detailData.value.status) === Number(EnumEquipmentMaintenanceMonthPlanStatusType.Unreviewed)
)
const canSplit = computed(
  () =>
    Number(detailData.value.status) === Number(EnumEquipmentMaintenanceMonthPlanStatusType.Reviewed)
)

const hasReviewInfo = computed(() => Boolean(detailData.value.reviewBy || detailData.value.reviewTime))
const hasVoidInfo = computed(() =>
  Boolean(detailData.value.voidBy || detailData.value.voidTime || detailData.value.voidReason)
)

const pageTitle = computed(() => (editable.value ? "编辑月保养计划" : "月保养计划详情"))

const mainInfoConfigs = computed<ICustomDescriptionConfig[]>(() => [
  { field: "planNo", label: "月计划单号：" },
  { field: "planMonth", label: "计划月份：" },
  { field: "planName", label: "月计划名称：" },
  { field: "areaName", label: "所属区域：" },
  { field: "sourceType", label: "来源类型：" },
  { field: "status", label: "当前状态：", slots: { content: "status-content" } },
  {
    field: "totalCount",
    label: "设备数量：",
    formatter: ({ data }) => `${data.totalCount || 0} 台`
  },
  { field: "sourceYearPlanNo", label: "来源年计划单号：" },
  { field: "sourceYearPlanName", label: "来源年计划名称：" },
  {
    field: "createBy",
    label: "创建人：",
    formatter: ({ data }) => data.createBy || "--"
  },
  {
    field: "createTime",
    label: "创建时间：",
    formatter: ({ data }) => formatDateTime(data.createTime)
  },
  {
    field: "updateBy",
    label: "更新人：",
    formatter: ({ data }) => data.updateBy || "--"
  },
  {
    field: "updateTime",
    label: "更新时间：",
    formatter: ({ data }) => formatDateTime(data.updateTime)
  },
  {
    field: "reviewBy",
    label: "复核人：",
    hidden: () => !hasReviewInfo.value,
    formatter: ({ data }) => data.reviewBy || "--"
  },
  {
    field: "reviewTime",
    label: "复核时间：",
    hidden: () => !hasReviewInfo.value,
    formatter: ({ data }) => formatDateTime(data.reviewTime)
  },
  {
    field: "voidBy",
    label: "作废人：",
    hidden: () => !hasVoidInfo.value,
    formatter: ({ data }) => data.voidBy || "--"
  },
  {
    field: "voidTime",
    label: "作废时间：",
    hidden: () => !hasVoidInfo.value,
    formatter: ({ data }) => formatDateTime(data.voidTime)
  },
  {
    field: "voidReason",
    label: "作废原因：",
    hidden: () => !hasVoidInfo.value,
    colspan: 0,
    formatter: ({ data }) => data.voidReason || "--"
  },
  {
    field: "remarks",
    label: "备注：",
    colspan: 0,
    slots: { content: "remarks-content" }
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  equipmentNo?: string
  equipmentName?: string
}>([
  {
    type: EnumComponentType.Input,
    key: "equipmentNo",
    label: "设备编号",
    value: "",
    placeholder: "请输入设备编号"
  },
  {
    type: EnumComponentType.Input,
    key: "equipmentName",
    label: "设备名称",
    value: "",
    placeholder: "请输入设备名称"
  }
])

const tableConfig = computed<ITableConfig>(() => ({
  height: "100%",
  rowKey: "equipmentId",
  columns: [
    {
      prop: "selection",
      label: "",
      type: "selection",
      width: 60,
      align: "center",
      fixed: "left",
      multiple: true,
      get hidden() {
        return !editable.value
      }
    },
    {
      prop: "equipmentNo",
      label: "设备编号",
      minWidth: 150
    },
    {
      prop: "equipmentName",
      label: "设备名称",
      minWidth: 180
    },
    {
      prop: "equipmentTypeNo",
      label: "设备类型编号",
      minWidth: 160
    },
    {
      prop: "equipmentTypeName",
      label: "设备类型名称",
      minWidth: 180
    },
    {
      prop: "operation",
      label: "操作",
      width: 90,
      fixed: "right",
      slots: {
        default: "operation-default"
      },
      get hidden() {
        return !editable.value
      }
    }
  ]
}))

watch(
  () => props.id,
  () => {
    void loadDetail()
  },
  {
    immediate: true
  }
)

function applyFilter() {
  const { equipmentNo, equipmentName } = getFormData()
  filteredDetails.value = editableDetails.value.filter((item) => {
    const matchedNo = equipmentNo ? item.equipmentNo.includes(equipmentNo) : true
    const matchedName = equipmentName ? item.equipmentName.includes(equipmentName) : true
    return matchedNo && matchedName
  })
}

async function loadDetail() {
  if (!props.id) return
  loading.value = true
  try {
    const data = await queryEquipmentMaintenancePlanDetail(props.id)
    detailData.value = data
    editableDetails.value = cloneDeep(data.details || [])
    editableRemarks.value = data.remarks || ""
    resetForm()
    applyFilter()
    selectedRows.value = []
    tableRef.value?.setSelectedRows([])
  } finally {
    loading.value = false
  }
}

function syncDetailCount() {
  detailData.value.totalCount = editableDetails.value.length
}

function onSearch() {
  applyFilter()
}

function onResetSearch() {
  resetForm()
  applyFilter()
}

function onSplitClick() {
  emit("split", {
    id: detailData.value.id,
    planNo: detailData.value.planNo,
    planMonth: detailData.value.planMonth,
    planName: detailData.value.planName,
    areaName: detailData.value.areaName,
    status: detailData.value.status
  })
}

function onSelectionChange() {
  selectedRows.value =
    (tableRef.value?.getCurrentMultipleRows() as IEquipmentMaintenanceMonthPlanDetailItem[]) || []
}

function isMessageBoxCancel(error: unknown) {
  return error === "cancel" || error === "close"
}

async function onBatchRemove() {
  if (!selectedRows.value.length) {
    ElMessage.warning("请先选择需要删除的设备")
    return
  }
  try {
    await ElMessageBox.confirm("确认删除选中的设备明细吗？", "删除确认", {
      type: "warning",
      confirmButtonText: "确认",
      cancelButtonText: "取消"
    })
    const removedIds = new Set(selectedRows.value.map((item) => item.equipmentId))
    editableDetails.value = editableDetails.value.filter((item) => !removedIds.has(item.equipmentId))
    syncDetailCount()
    applyFilter()
    selectedRows.value = []
    tableRef.value?.setSelectedRows([])
  } catch (error) {
    if (isMessageBoxCancel(error)) return
    throw error
  }
}

async function onRemoveSingle(row: IEquipmentMaintenanceMonthPlanDetailItem) {
  try {
    await ElMessageBox.confirm(`确认删除设备 ${row.equipmentName || row.equipmentNo} 吗？`, "删除确认", {
      type: "warning",
      confirmButtonText: "确认",
      cancelButtonText: "取消"
    })
    editableDetails.value = editableDetails.value.filter((item) => item.equipmentId !== row.equipmentId)
    syncDetailCount()
    applyFilter()
  } catch (error) {
    if (isMessageBoxCancel(error)) return
    throw error
  }
}

async function onSave() {
  if (!editableDetails.value.length) {
    ElMessage.warning("月计划至少保留一条设备明细")
    return
  }

  saving.value = true
  try {
    await requestUpdateEquipmentMaintenancePlan({
      id: detailData.value.id,
      remarks: editableRemarks.value,
      details: editableDetails.value
    })
    ElMessage.success("保存成功")
    emit("success")
  } finally {
    saving.value = false
  }
}
</script>

<style scoped lang="scss">
.month-plan-detail-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.page-toolbar {
  margin-bottom: 12px;
}

.section-card {
  padding: 16px;
  background: var(--el-bg-color);
  border-radius: 8px;
}

.section-card--table {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.remarks-value {
  min-height: 22px;
  line-height: 22px;
  color: var(--el-text-color-regular);
  white-space: pre-wrap;
}

.table-wrapper {
  flex: 1;
  min-height: 0;
}

:deep(.custom-table-container) {
  padding: 0;
  box-shadow: none;
}

:deep(.custom-description) {
  padding-bottom: 0;
}
</style>
