<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content">
      <div class="page-toolbar">
        <el-button plain icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>

      <div v-loading="loading" class="week-plan-detail-page">
        <template v-if="editable">
          <div class="summary-card">
            <CustomTitle :title="pageTitle" :is-table-title="false" show-short-bar />

            <CustomDescription :data="detailData" :configs="basicInfoConfigs" :columns="3">
              <template #planRange-content>
                <span>{{ detailData.planStartDate || "--" }} ~ {{ detailData.planEndDate || "--" }}</span>
              </template>

              <template #status-content>
                <el-tag :type="statusTagType">
                  {{ statusText }}
                </el-tag>
              </template>
            </CustomDescription>
          </div>

          <div class="workspace-card detail-workspace detail-workspace--edit">
            <div>
              <div class="workspace-title">设备明细</div>
              <div class="workspace-desc">仅在这里调整保养类型、执行日期和子表备注</div>
            </div>

            <div class="workspace-toolbar workspace-toolbar--stacked">
              <div class="workspace-toolbar__actions">
                <el-select
                  v-model="editableDefaultMaintenanceTypeId"
                  class="quick-fill-select"
                  clearable
                  placeholder="选择保养类型"
                >
                  <el-option
                    v-for="item in maintenanceTypeOptions"
                    :key="item.id"
                    :label="item.maintenanceTypeName"
                    :value="item.id"
                  />
                </el-select>
                <el-button plain @click="onApplyMaintenanceTypeToUnassigned">填充未设置</el-button>
                <el-button plain @click="onApplyMaintenanceTypeToSelected">填充选中</el-button>
                <el-button type="primary" plain @click="onApplyMaintenanceTypeToAll">
                  填充全部
                </el-button>
                <el-button type="danger" plain @click="onBatchRemove">批量删除</el-button>
              </div>

              <div class="workspace-filterbar">
                <div class="workspace-filterbar__text">默认收起筛选条件，优先腾出空间编辑设备明细</div>
                <el-button plain @click="isSearchExpanded = !isSearchExpanded">
                  {{ isSearchExpanded ? "收起筛选" : "展开筛选" }}
                </el-button>
              </div>
            </div>

            <div v-show="isSearchExpanded" class="workspace-search">
              <CustomSearchForm
                :form-list="searchList"
                @search="onSearch"
                @reset="onResetSearch"
              />
            </div>

            <div class="save-tip">保存时只更新设备明细调整，不修改主信息。</div>

            <div class="table-wrapper">
              <CustomTable
                ref="tableRef"
                v-model:table-data="filteredDetails"
                :config="tableConfig"
                @select-all="onSelectionChange"
                @select-change="onSelectionChange"
              >
                <template #maintenanceTypeName-default="{ row }">
                  <el-select
                    v-model="row.maintenanceTypeId"
                    class="table-cell-select"
                    clearable
                    placeholder="请选择保养类型"
                    @change="(value) => onDetailMaintenanceTypeChange(row, value)"
                  >
                    <el-option
                      v-for="item in maintenanceTypeOptions"
                      :key="item.id"
                      :label="item.maintenanceTypeName"
                      :value="item.id"
                    />
                  </el-select>
                </template>

                <template #executionDate-default="{ row }">
                  <el-date-picker
                    v-model="row.executionDate"
                    class="table-date-picker"
                    type="date"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    placeholder="请选择执行日期"
                    :disabled-date="(date) => isExecutionDateDisabled(date)"
                    teleported
                  />
                </template>

                <template #remarks-default="{ row }">
                  <el-input
                    v-model.trim="row.remarks"
                    class="table-cell-input"
                    maxlength="100"
                    placeholder="请输入备注"
                  />
                </template>

                <template #operation-default="{ row }">
                  <el-button link type="danger" size="small" @click="onRemoveSingle(row)">
                    删除
                  </el-button>
                </template>
              </CustomTable>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="summary-card">
            <CustomTitle :title="pageTitle" :is-table-title="false" show-short-bar />

            <CustomDescription :data="detailData" :configs="detailInfoConfigs" :columns="3">
              <template #planRange-content>
                <span>{{ detailData.planStartDate || "--" }} ~ {{ detailData.planEndDate || "--" }}</span>
              </template>

              <template #status-content>
                <el-tag :type="statusTagType">
                  {{ statusText }}
                </el-tag>
              </template>
            </CustomDescription>
          </div>

          <div class="detail-tab-content">
            <el-tabs v-model="activeTab" type="border-card" class="detail-tabs custom-tabs">
              <el-tab-pane label="设备明细" name="details" />
              <el-tab-pane label="来源月计划信息" name="sourcePlans" />
            </el-tabs>

            <div v-if="activeTab === 'details'" class="detail-pane">
              <div class="workspace-card detail-workspace">
                <div class="workspace-search workspace-search--plain">
                  <CustomSearchForm
                    :form-list="searchList"
                    @search="onSearch"
                    @reset="onResetSearch"
                  />
                </div>

                <div class="table-wrapper">
                  <CustomTable
                    ref="tableRef"
                    v-model:table-data="filteredDetails"
                    :config="tableConfig"
                    @select-all="onSelectionChange"
                    @select-change="onSelectionChange"
                  >
                    <template #maintenanceTypeName-default="{ row }">
                      <span>{{ row.maintenanceTypeName || "--" }}</span>
                    </template>

                    <template #executionDate-default="{ row }">
                      <span>{{ row.executionDate || "--" }}</span>
                    </template>

                    <template #remarks-default="{ row }">
                      <span>{{ row.remarks || "--" }}</span>
                    </template>
                  </CustomTable>
                </div>
              </div>
            </div>

            <div v-else class="detail-pane">
              <div class="workspace-card source-workspace">
                <el-table :data="detailData.sourcePlans" border class="source-table">
                  <el-table-column type="index" label="序号" width="60" align="center" />
                  <el-table-column prop="sourceMonthPlanNo" label="来源月计划单号" min-width="170" />
                  <el-table-column prop="sourceMonthPlanName" label="来源月计划名称" min-width="220" />
                  <el-table-column
                    prop="sourcePlanMonth"
                    label="来源计划月份"
                    width="120"
                    align="center"
                  />
                </el-table>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <div class="layout-footer">
      <el-button @click="emit('close')">返回</el-button>
      <el-button v-if="editable" type="primary" :loading="saving" @click="onSave">
        保存设备明细调整
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { requestEquipmentMaintenanceTypeList } from "@/api/operation/equipment/equipment-maintenance-type"
import {
  queryEquipmentMaintenanceWeekPlanDetail,
  requestUpdateEquipmentMaintenanceWeekPlan
} from "@/api/operation/equipment/equipment-maintenance-week-plan"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import type { IEquipmentMaintenanceTypeItem } from "@/types/maintain/equipment-manage/equipment-maintenance-type"
import type {
  IEquipmentMaintenanceWeekPlanDetailItem,
  IEquipmentMaintenanceWeekPlanPageItem
} from "@/types/maintain/equipment-manage/equipment-maintenance-week-plan"
import { formatDateTime } from "@/views/maintOperate/status"

import {
  EnumEquipmentMaintenanceWeekPlanStatusTagTypeMap,
  EnumEquipmentMaintenanceWeekPlanStatusType,
  EnumEquipmentMaintenanceWeekPlanStatusTypeMap
} from "../status"

defineOptions({
  name: "WeekPlanDetailPage"
})

const props = defineProps<{
  id: string
  mode: "edit" | "detail"
}>()

const emit = defineEmits<{
  (e: "close"): void
  (e: "success"): void
}>()

const activeTab = ref<"details" | "sourcePlans">("details")
const isSearchExpanded = ref(false)
const detailData = ref<IEquipmentMaintenanceWeekPlanPageItem>({
  id: "",
  planNo: "",
  naturalWeekLabel: "",
  planStartDate: "",
  planEndDate: "",
  planName: "",
  areaName: "",
  sourceType: "",
  defaultMaintenanceTypeId: "",
  defaultMaintenanceTypeName: "",
  totalCount: 0,
  status: EnumEquipmentMaintenanceWeekPlanStatusType.Unreviewed,
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
  sourceMonthPlanNos: "",
  sourcePlans: [],
  details: []
})
const editableDetails = ref<IEquipmentMaintenanceWeekPlanDetailItem[]>([])
const filteredDetails = ref<IEquipmentMaintenanceWeekPlanDetailItem[]>([])
const editableDefaultMaintenanceTypeId = ref("")
const selectedRows = ref<IEquipmentMaintenanceWeekPlanDetailItem[]>([])
const maintenanceTypeOptions = ref<IEquipmentMaintenanceTypeItem[]>([])
const loading = ref(false)
const saving = ref(false)
const tableRef = ref<ComponentExposed<typeof CustomTable>>()

const editable = computed(
  () =>
    props.mode === "edit" &&
    Number(detailData.value.status) === Number(EnumEquipmentMaintenanceWeekPlanStatusType.Unreviewed)
)
const hasReviewInfo = computed(() => Boolean(detailData.value.reviewBy || detailData.value.reviewTime))
const hasVoidInfo = computed(() =>
  Boolean(detailData.value.voidBy || detailData.value.voidTime || detailData.value.voidReason)
)
const pageTitle = computed(() => (editable.value ? "编辑周保养计划" : "周保养计划详情"))
const statusTagType = computed(
  () =>
    EnumEquipmentMaintenanceWeekPlanStatusTagTypeMap[
      detailData.value.status as EnumEquipmentMaintenanceWeekPlanStatusType
    ]
)
const statusText = computed(
  () =>
    EnumEquipmentMaintenanceWeekPlanStatusTypeMap[
      detailData.value.status as EnumEquipmentMaintenanceWeekPlanStatusType
    ] || "--"
)

const basicInfoConfigs = computed<ICustomDescriptionConfig[]>(() => [
  { field: "planNo", label: "周计划单号：" },
  { field: "naturalWeekLabel", label: "自然周：" },
  {
    field: "planRange",
    label: "计划范围：",
    slots: { content: "planRange-content" }
  },
  { field: "areaName", label: "所属区域：" },
  {
    field: "status",
    label: "状态：",
    slots: { content: "status-content" }
  }
])

const detailInfoConfigs = computed<ICustomDescriptionConfig[]>(() => {
  const configs: ICustomDescriptionConfig[] = [
    ...basicInfoConfigs.value,
    { field: "planName", label: "周计划名称：" },
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
      formatter: ({ data }) => data.remarks || "--"
    },
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
    }
  ]

  return configs
})

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
      prop: "maintenanceTypeName",
      label: "保养类型",
      minWidth: 180,
      slots: {
        default: "maintenanceTypeName-default"
      }
    },
    {
      prop: "executionDate",
      label: "执行日期",
      minWidth: 190,
      slots: {
        default: "executionDate-default"
      }
    },
    {
      prop: "remarks",
      label: "备注",
      minWidth: 180,
      slots: {
        default: "remarks-default"
      }
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
    activeTab.value = "details"
    isSearchExpanded.value = false
    void loadMaintenanceTypes()
    void loadDetail()
  },
  {
    immediate: true
  }
)

function getMaintenanceTypeNameById(id: string) {
  return (
    maintenanceTypeOptions.value.find((item) => String(item.id) === String(id))?.maintenanceTypeName ||
    ""
  )
}

function syncQuickFillDisplay() {
  detailData.value.defaultMaintenanceTypeId = editableDefaultMaintenanceTypeId.value
  detailData.value.defaultMaintenanceTypeName = getMaintenanceTypeNameById(
    editableDefaultMaintenanceTypeId.value
  )
}

function onDetailMaintenanceTypeChange(row: IEquipmentMaintenanceWeekPlanDetailItem, value: string) {
  row.maintenanceTypeId = String(value || "")
  row.maintenanceTypeName = getMaintenanceTypeNameById(row.maintenanceTypeId)
}

function applyMaintenanceType(
  matcher: (item: IEquipmentMaintenanceWeekPlanDetailItem) => boolean,
  successMessage: string
) {
  if (!editableDefaultMaintenanceTypeId.value) {
    ElMessage.warning("请先选择要填充的保养类型")
    return
  }

  const maintenanceTypeName = getMaintenanceTypeNameById(editableDefaultMaintenanceTypeId.value)
  let affectedCount = 0

  editableDetails.value.forEach((item) => {
    if (!matcher(item)) return
    item.maintenanceTypeId = editableDefaultMaintenanceTypeId.value
    item.maintenanceTypeName = maintenanceTypeName
    affectedCount += 1
  })

  syncQuickFillDisplay()
  applyFilter()

  if (!affectedCount) {
    ElMessage.warning("当前没有可填充的设备")
    return
  }

  ElMessage.success(successMessage)
}

function onApplyMaintenanceTypeToUnassigned() {
  applyMaintenanceType((item) => !item.maintenanceTypeId, "已填充未设置设备")
}

function onApplyMaintenanceTypeToSelected() {
  if (!selectedRows.value.length) {
    ElMessage.warning("请先勾选需要填充的设备")
    return
  }

  const selectedIds = new Set(selectedRows.value.map((item) => item.equipmentId))
  applyMaintenanceType((item) => selectedIds.has(item.equipmentId), "已填充选中设备")
}

function onApplyMaintenanceTypeToAll() {
  applyMaintenanceType(() => true, "已填充全部设备")
}

function applyFilter() {
  const { equipmentNo, equipmentName } = getFormData()
  filteredDetails.value = editableDetails.value.filter((item) => {
    const matchedNo = equipmentNo ? item.equipmentNo.includes(equipmentNo) : true
    const matchedName = equipmentName ? item.equipmentName.includes(equipmentName) : true
    return matchedNo && matchedName
  })
}

async function loadMaintenanceTypes() {
  maintenanceTypeOptions.value = await requestEquipmentMaintenanceTypeList()
}

async function loadDetail() {
  if (!props.id) return

  loading.value = true
  try {
    const data = await queryEquipmentMaintenanceWeekPlanDetail(props.id)
    detailData.value = data
    editableDetails.value = cloneDeep(data.details || [])
    editableDefaultMaintenanceTypeId.value = data.defaultMaintenanceTypeId || ""
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

function onSelectionChange() {
  selectedRows.value =
    (tableRef.value?.getCurrentMultipleRows() as IEquipmentMaintenanceWeekPlanDetailItem[]) || []
}

function isMessageBoxCancel(error: unknown) {
  return error === "cancel" || error === "close"
}

function isExecutionDateDisabled(date: Date) {
  const time = dayjs(date).format("YYYY-MM-DD")
  return time < detailData.value.planStartDate || time > detailData.value.planEndDate
}

function validateDetails() {
  if (!editableDetails.value.length) {
    ElMessage.warning("周计划至少保留一条设备明细")
    return false
  }

  for (const item of editableDetails.value) {
    if (
      item.executionDate &&
      (item.executionDate < detailData.value.planStartDate ||
        item.executionDate > detailData.value.planEndDate)
    ) {
      ElMessage.warning(`设备 ${item.equipmentName || item.equipmentNo} 的执行日期不在周计划范围内`)
      return false
    }
  }

  return true
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

async function onRemoveSingle(row: IEquipmentMaintenanceWeekPlanDetailItem) {
  try {
    await ElMessageBox.confirm(
      `确认删除设备 ${row.equipmentName || row.equipmentNo} 吗？`,
      "删除确认",
      {
        type: "warning",
        confirmButtonText: "确认",
        cancelButtonText: "取消"
      }
    )

    editableDetails.value = editableDetails.value.filter((item) => item.equipmentId !== row.equipmentId)
    syncDetailCount()
    applyFilter()
  } catch (error) {
    if (isMessageBoxCancel(error)) return
    throw error
  }
}

async function onSave() {
  if (!validateDetails()) return

  saving.value = true
  try {
    syncQuickFillDisplay()

    await requestUpdateEquipmentMaintenanceWeekPlan({
      id: detailData.value.id,
      defaultMaintenanceTypeId: editableDefaultMaintenanceTypeId.value,
      defaultMaintenanceTypeName: getMaintenanceTypeNameById(editableDefaultMaintenanceTypeId.value),
      remarks: detailData.value.remarks || "",
      details: editableDetails.value.map((item) => ({
        ...item,
        maintenanceTypeName: getMaintenanceTypeNameById(item.maintenanceTypeId)
      }))
    })

    ElMessage.success("保存成功")
    emit("success")
  } finally {
    saving.value = false
  }
}
</script>

<style scoped lang="scss">
.week-plan-detail-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  height: 100%;
}

.page-toolbar {
  margin-bottom: 12px;
}

.summary-card,
.workspace-card {
  padding: 16px;
  border-radius: 10px;
  background: var(--el-bg-color);
}

.detail-workspace,
.source-workspace {
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: 100%;
}

.detail-workspace--edit {
  min-height: 0;
}

.workspace-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.workspace-toolbar--stacked {
  flex-direction: column;
  align-items: stretch;
}

.workspace-toolbar__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.workspace-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.workspace-desc {
  margin-top: 4px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.workspace-filterbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  background: var(--el-fill-color-lighter);
}

.workspace-filterbar__text {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.workspace-search {
  padding: 12px 14px 4px;
  border-radius: 10px;
  background: var(--el-fill-color-lighter);
}

.workspace-search--plain {
  padding: 0;
  border-radius: 0;
  background: transparent;
}

.quick-fill-select {
  width: 220px;
}

.save-tip {
  padding: 10px 12px;
  border-radius: 8px;
  background: #f4f8ff;
  color: #3d5aa9;
  font-size: 13px;
  line-height: 20px;
}

.table-wrapper {
  flex: 1;
  min-height: 520px;
}

.source-table {
  width: 100%;
}

:deep(.detail-tabs) {
  flex: none;

  .el-tabs__header {
    margin-bottom: 16px;
  }

  .el-tabs__nav-wrap::after {
    height: 1px;
    background-color: var(--el-border-color-light);
  }

  .el-tabs__item {
    height: 36px;
    line-height: 36px;
    font-size: 14px;
  }

}

.detail-tab-content {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.detail-pane {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.custom-tabs {
  margin-bottom: 20px;

  :deep(.el-tabs__content) {
    padding: 0;
  }

  :deep(.el-tabs__header) {
    border: none;

    .el-tabs__nav-wrap {
      margin-bottom: 0 !important;
    }
  }
}

:deep(.custom-table-container) {
  padding: 0;
  height: 100%;
  box-shadow: none;
  overflow: visible;
}

:deep(.custom-table) {
  height: 100%;
}

:deep(.custom-description) {
  padding-bottom: 0;
}

:deep(.table-cell-select),
:deep(.table-cell-input),
:deep(.table-date-picker) {
  width: 100%;
}

@media (max-width: 992px) {
  .workspace-filterbar,
  .workspace-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .quick-fill-select {
    width: 100%;
  }
}
</style>
