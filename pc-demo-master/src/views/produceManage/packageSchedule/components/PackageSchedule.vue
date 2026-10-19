<template>
  <div class="layout-child-page-container">
    <SchedulePreview v-if="showGantt">
      <el-button type="primary" @click="onsubmitPublish()">提交发布</el-button>
      <el-button type="plain" @click="showGantt = false">返回</el-button>
    </SchedulePreview>
    <div v-show="!showGantt" v-loading="loading" class="layout-child-page-content content">
      <div class="plan-list">
        <CustomTitle title="发货计划列表" style="margin: 0" />
        <CustomForm class="search-form" v-model="searchFormData" :configs="searchList" :columns="3">
          <template #customerId-option>
            <el-option
              v-for="item in customerOptions"
              :key="item.value"
              :value="item.value"
              :label="item.label"
            >
              <div class="customer-option">
                <span>{{ item.label }}</span>
                <span class="customer-full-name">{{ item.fullName }}</span>
              </div>
            </el-option>
          </template>
        </CustomForm>
        <CustomTable
          class="package-table"
          ref="shipmentTableRef"
          v-model:table-data="shipmentTableData"
          v-model:total="pagination.total"
          :config="shipmentTableConfig"
          :query-config="queryConfig"
          @current-change="onShipmentRowChange"
        >
          <template #expand-default="{ row }">
            <div class="package-product-table-title">
              <span>产品列表</span>
            </div>
            <CustomTable
              :table-data="row?.detailVOList || []"
              :config="shipmentProductTableConfig"
            ></CustomTable>
          </template>
        </CustomTable>
        <CustomPagination
          v-model:currentPage="pagination.currentPage"
          v-model:pageSize="pagination.pageSize"
          :total="pagination.total"
          border
          @change="shipmentTableRef?.requestData()"
        />
      </div>
      <div class="package-list">
        <div class="package-spec-list">
          <CustomTitle class="package-title" title="包装规范" style="margin: 0">
            <span class="package-code">（{{ currentRow?.deliveryCode }}）</span>
          </CustomTitle>
          <CustomTable
            class="package-table"
            ref="packageSpecTableRef"
            v-model:table-data="packageSpecTableData"
            :config="packageSpecTableConfig"
          >
            <template #containerType-default="{ row }">
              <el-tag type="primary">{{ row.containerType }}</el-tag>
            </template>

            <template #expand-default="{ row }">
              <div class="package-product-table-title">
                <span>包装产品列表</span>
              </div>
              <CustomTable
                :table-data="row?.packSpecProductVoList || []"
                :config="packageSpecProductTableConfig"
              ></CustomTable>
            </template>

            <template #thumbnailAddress-default="{ row: { templateDto } }">
              <el-image
                v-if="templateDto?.thumbnailAddress"
                :src="formatImgUrlPreview(templateDto.thumbnailAddress)"
                :preview-src-list="[formatImgUrlPreview(templateDto.thumbnailAddress)]"
                preview-teleported
                style="height: 24px"
              />
            </template>
          </CustomTable>
        </div>
        <div class="package-schedule-list">
          <CustomTitle class="package-title" title="包装排产" style="margin: 0">
            <span class="package-code">（{{ currentRow?.deliveryCode }}）</span>
            <el-button type="danger" link @click="onClearSchedule()" v-if="showClearBtn"
              >清空排产</el-button
            >
          </CustomTitle>
          <CustomForm
            class="package-schedule-form"
            ref="packageScheduleFormRef"
            v-model="packageScheduleFormData"
            :configs="packageScheduleConfig"
            :columns="3"
            :label-width="78"
          ></CustomForm>
          <CustomTable
            class="package-schedule-table"
            ref="packageScheduleTableRef"
            v-model:table-data="packageScheduleTableData"
            :config="packageScheduleTableConfig"
            @select-all="updatePackageScheduleTask()"
            @select-change="updatePackageScheduleTask()"
          >
            <template #planQty-default="{ row }">
              <el-input
                v-if="row.isSelect"
                type="number"
                v-model="row.planQty"
                :min="0"
                :max="row.schedulableQty"
                @change="updatePackageScheduleTask()"
              />
              <span v-else>{{ row.planQty }}</span>
            </template>
          </CustomTable>
        </div>
        <div class="operation-area">
          <el-button type="primary" @click="showGantt = true">查看甘特图</el-button>
          <div>
            <el-button type="primary" @click="onsubmitPublish()">提交发布</el-button>
            <el-button @click="emit('close')">返回</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { getSearchCustomer } from "@/api/customer"
import {
  queryDeliveryPlanPageList,
  requestPackageSpecListByDeliveryPlan
} from "@/api/logistics/delivery"
import {
  queryUnpublishedPackageScheduleTaskList,
  requestCreatePackageScheduleTask,
  requestDeletePackageScheduleTask,
  requestPublishPackageScheduleTask,
  requestUpdatePackageScheduleTask
} from "@/api/produce/package-schedule/package-schedule"
import CustomForm from "@/components/CustomForm/index.vue"
import CustomPagination from "@/components/CustomPagination/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  IColumnSortInfo,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectFactoryModel from "@/components/SelectFactoryModel/index.vue"
import { SelectType } from "@/components/SelectFactoryModel/types"
import { EnumDeliveryPlanStatus } from "@/constant/enums"
import { END_TIME, FORMAT_TIME, START_TIME } from "@/constant/time"
import type { IOption } from "@/types/common"
import type {
  IDeliveryPlanPackageSpecItem,
  IDeliveryPlanPageListItem as ITableRow
} from "@/types/logistics/delivery"
import type { IDeliveryPlanPageListParams } from "@/types/logistics/delivery"
import type {
  IPackageScheduleTaskDetail,
  IPackageScheduleTaskListItem
} from "@/types/production-manage/package-schedule"
import { formatImgUrlPreview, isEffectiveValue, precisionConversion } from "@/utils/common"

import SchedulePreview from "./SchedulePreview.vue"

type ICustomerOption = IOption & { fullName: string }

defineOptions({
  name: "PackageSchedule"
})

const emit = defineEmits<{
  (e: "close"): void
}>()

const loading = ref(false)
const showGantt = ref(false)
const currentRow = ref<ITableRow | null>(null)

let customOptionsCopy: ICustomerOption[] = []
const customerOptions = ref<ICustomerOption[]>([])
const searchFormData = ref({
  deliveryCode: "",
  productModelName: "",
  customerId: ""
})
const searchList = computed(() => [
  {
    componentType: "el-input",
    label: "",
    field: "deliveryCode",
    props: {
      prefixIcon: "Search",
      placeholder: "请输入计划单号"
    },
    events: {
      change: init
    }
  },
  {
    componentType: "el-input",
    label: "",
    field: "productModelName",
    props: {
      prefixIcon: "Search",
      placeholder: "请输入产品名称"
    },
    events: {
      change: init
    }
  },
  {
    componentType: "el-select",
    label: "",
    field: "customerId",
    props: {
      filterable: true,
      placeholder: "请选择客户",
      filterMethod: (filterValue: string) => {
        filterValue = filterValue.trim().toLowerCase()
        customerOptions.value = customOptionsCopy.filter(
          (item) =>
            item.label.toLowerCase().includes(filterValue) ||
            item.fullName.toLowerCase().includes(filterValue)
        )
      }
    },
    slots: {
      default: "customerId-option"
    },
    events: {
      change: init
    }
  }
])

const showClearBtn = computed(() => {
  const selectedRows = (packageScheduleTableRef.value?.getCurrentMultipleRows() ||
    []) as IPackageScheduleTaskListItem[]
  return (
    packageScheduleFormData.value.beginTime ||
    packageScheduleFormData.value.endTime ||
    packageScheduleFormData.value.entityIds.length ||
    (selectedRows.length && selectedRows.some((item) => item.planQty))
  )
})

const shipmentTableRef = ref<ComponentExposed<typeof CustomTable>>()
const shipmentTableData = ref<ITableRow[]>([])
const shipmentTableConfig = ref<ITableConfig>({
  height: "100%",
  highlightCurrentRow: true,
  columns: [
    {
      prop: "id",
      label: "",
      type: "expand",
      width: 40,
      slots: {
        default: "expand-default"
      }
    },
    {
      prop: "deliveryCode",
      label: "发货计划",
      width: 140
    },
    {
      prop: "customerName",
      label: "客户",
      minWidth: 160
    },
    {
      prop: "deliveryTime",
      label: "计划发货日期",
      width: 140,
      align: "center",
      sortable: true,
      sortOrder: "desc",
      formatter: ({ deliveryTime }) => {
        return dayjs(deliveryTime).format("YYYY-MM-DD")
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IDeliveryPlanPageListParams], ITableRow, true> = {
  api: queryDeliveryPlanPageList,
  getParams: (sortData: IColumnSortInfo[]) => {
    return [
      {
        pageQuery: {
          pageNum: pagination.currentPage,
          pageSize: pagination.pageSize
        },
        queryParam: {
          ...searchFormData.value,
          deliveryStatusList: [EnumDeliveryPlanStatus.Reviewed, EnumDeliveryPlanStatus.Underway],
          isPack: true
        },
        sort: sortData.map((item) => ({ field: item.sortField, order: item.order! }))
      }
    ]
  }
}
const shipmentProductTableConfig = ref<ITableConfig>({
  columns: [
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
      prop: "productModelCode",
      label: "产品编号",
      width: 150
    },
    {
      prop: "planAmount",
      label: "计划总数",
      width: 90,
      align: "right",
      formatter: ({ decimalNumber, planAmount }) =>
        isEffectiveValue(planAmount) ? precisionConversion(planAmount, decimalNumber) : ""
    },
    {
      prop: "completeAmount",
      label: "已排产数",
      width: 90,
      align: "right",
      formatter: ({ decimalNumber, completeAmount }) =>
        isEffectiveValue(completeAmount) ? precisionConversion(completeAmount, decimalNumber) : ""
    },
    {
      prop: "remainAmount",
      label: "可排产数",
      width: 90,
      align: "right",
      formatter: ({ decimalNumber, remainAmount }) =>
        isEffectiveValue(remainAmount) ? precisionConversion(remainAmount, decimalNumber) : ""
    },
    {
      prop: "unitName",
      label: "单位",
      width: 90,
      align: "center"
    }
  ]
})

const packageSpecTableRef = ref<ComponentExposed<typeof CustomTable>>()
const packageSpecTableData = ref<IDeliveryPlanPackageSpecItem[]>([])
const packageSpecTableConfig = ref<ITableConfig>({
  height: 300,
  columns: [
    {
      prop: "id",
      label: "",
      type: "expand",
      width: 40,
      slots: {
        default: "expand-default"
      }
    },
    {
      prop: "specName",
      label: "包装规范名称",
      minWidth: 160
    },
    {
      prop: "containerType",
      label: "包装规范类型",
      minWidth: 160,
      align: "center",
      slots: {
        default: "containerType-default"
      }
    },
    {
      prop: "transportType",
      label: "运输方式",
      minWidth: 160,
      align: "center",
      formatter: ({ transportType }) => transportType || "-"
    },
    {
      prop: "thumbnailAddress",
      label: "打印标识模板",
      minWidth: 160,
      align: "center",
      slots: {
        default: "thumbnailAddress-default"
      }
    }
  ]
})
const packageSpecProductTableConfig = ref<ITableConfig>({
  columns: [
    {
      prop: "productModelName",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "productModelSpec",
      label: "产品规格",
      minWidth: 160,
      formatter: (row: any) => row.productModelSpec || row.productModel?.specification || "-"
    },
    {
      prop: "productModelCode",
      label: "产品编号",
      minWidth: 160
    },
    {
      prop: "drawingNumber",
      label: "产品图号",
      minWidth: 160
    },
    {
      prop: "packQty",
      label: "装入数量",
      width: 120,
      align: "right",
      formatter: ({ decimalNumber, packQty }) =>
        isEffectiveValue(packQty) ? precisionConversion(packQty, decimalNumber) : "（不限）"
    },
    {
      prop: "unitName",
      label: "单位",
      width: 90
    }
  ]
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const packageScheduleFormRef = ref<InstanceType<typeof CustomForm>>()
const packageScheduleFormData = ref<{
  beginTime: string
  endTime: string
  entityIds: string[]
}>({
  beginTime: "",
  endTime: "",
  entityIds: []
})
const packageScheduleConfig = ref([
  {
    componentType: "el-date-picker",
    label: "开始时间",
    field: "beginTime",
    props: {
      type: "datetime",
      placeholder: "请选择开始时间",
      format: FORMAT_TIME,
      valueFormat: FORMAT_TIME,
      defaultTime: [START_TIME]
    },
    rules: [
      {
        required: true,
        message: "开始时间不能为空",
        trigger: "blur"
      }
    ],
    events: {
      change: () => updatePackageScheduleTask("startTime")
    }
  },
  {
    componentType: "el-date-picker",
    label: "结束时间",
    field: "endTime",
    props: {
      type: "datetime",
      placeholder: "请选择结束时间",
      format: FORMAT_TIME,
      valueFormat: FORMAT_TIME,
      defaultTime: [END_TIME]
    },
    rules: [
      {
        required: true,
        message: "结束时间不能为空",
        trigger: "change"
      }
    ],
    events: {
      change: () => updatePackageScheduleTask("endTime")
    }
  },
  {
    componentType: markRaw(SelectFactoryModel),
    label: "位置",
    field: "entityIds",
    props: {
      class: "location",
      multiple: true,
      type: SelectType.ProductType,
      placeholder: "请选择位置"
    },
    rules: [
      {
        required: true,
        message: "位置不能为空",
        trigger: "change"
      }
    ],
    events: {
      onChange: () => updatePackageScheduleTask()
    }
  }
])
const packageScheduleTableRef = ref<ComponentExposed<typeof CustomTable>>()
const packageScheduleTableData = ref<IPackageScheduleTaskListItem[]>([])
const packageScheduleTableConfig = ref<ITableConfig>({
  height: "100%",
  rowKey: "productModelId",
  columns: [
    {
      prop: "selection",
      label: "选择",
      type: "selection",
      width: 60,
      align: "center",
      multiple: true,
      fixed: "left",
      selectable: (row: IPackageScheduleTaskListItem) => {
        return row.schedulableQty > 0 || !!row.planQty
      }
    },
    {
      prop: "productModelName",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "productModelSpec",
      label: "产品规格",
      minWidth: 160,
      formatter: (row: IPackageScheduleTaskListItem) => {
        const data = row as any
        return data.productModelSpec || data.productModel?.specification || "-"
      }
    },
    {
      prop: "productModelCode",
      label: "产品编号",
      minWidth: 160
    },
    {
      prop: "schedulableQty",
      label: "可排产数",
      minWidth: 160
    },
    {
      prop: "planQty",
      label: "排产数",
      minWidth: 160,
      slots: {
        default: "planQty-default"
      }
    }
  ]
})
const packageScheduleInfo = ref<IPackageScheduleTaskDetail>()

onMounted(() => {
  getCustomerOptions()
  init()
})

/** 初始化数据 */
const init = async () => {
  shipmentTableRef.value?.requestData()
}

/** 获取客户下拉 */
const getCustomerOptions = async () => {
  const { records } = await getSearchCustomer({ pageNum: 1, pageSize: 10000, stateList: [0] })
  customerOptions.value = records.map((item) => ({
    label: item.customerAbbr,
    value: item.id,
    fullName: item.customerName
  }))

  customOptionsCopy = records.map((item) => ({
    label: item.customerAbbr,
    value: item.id,
    fullName: item.customerName
  }))
}

/** 发货计划表格选中行改变触发 */
const onShipmentRowChange = (row: ITableRow) => {
  if (row.id === currentRow.value?.id) {
    return
  }

  if (!row) {
    packageSpecTableData.value = []
    packageScheduleTableData.value = []
    currentRow.value = null
    return
  }
  currentRow.value = row
  getPackageSpecList(row.id)
  getPackageScheduleTaskList(row.id)
}

/** 获取包装规范列表 */
const getPackageSpecList = async (shipmentPlanTd: string) => {
  try {
    packageSpecTableRef.value?.setLoading(true)
    const data = await requestPackageSpecListByDeliveryPlan(shipmentPlanTd)
    packageSpecTableData.value = data
  } finally {
    packageSpecTableRef.value?.setLoading(false)
  }
}

/** 获取指定发布计划未发布的包装排产任务数据 */
const getPackageScheduleTaskList = async (shipmentPlanTd: string, isClear?: boolean) => {
  try {
    packageScheduleTableRef.value?.setLoading(true)
    const data = await queryUnpublishedPackageScheduleTaskList(shipmentPlanTd)
    packageScheduleInfo.value = data

    const checkedProductIds: string[] = []
    packageScheduleTableData.value = data.selectableProducts.map((item) => {
      const task = data.scheduleTaskVos[0]
      let targetQty: number | undefined
      let target: IPackageScheduleTaskListItem | undefined
      if (task) {
        target = task.products.find((product) => product.productModelId === item.productModelId)

        if (target) {
          checkedProductIds.push(item.productModelId)
          targetQty = target.planQty
        }

        packageScheduleFormData.value = {
          beginTime: task?.planStartTime || "",
          endTime: task?.planEndTime || "",
          entityIds: task?.areaIds || []
        }
      } else {
        // 任务不存在时，使用工序配置中生产单位配置数据
        packageScheduleFormData.value = {
          beginTime: "",
          endTime: "",
          entityIds: isClear ? [] : data.defaultEntityIds || []
        }
      }

      return {
        decimalNumber: item.decimalNumber,
        productModelCode: item.productModelCode,
        productModelId: item.productModelId,
        productModelName: item.productModelName,
        schedulableQty: item.schedulableQty,
        unitId: item.unitId,
        unitName: item.unitName,
        planQty: targetQty,
        isSelect: !!target
      }
    })

    packageScheduleFormRef.value?.resetForm()

    nextTick(() => {
      packageScheduleTableRef.value!.setSelectedRows(checkedProductIds)
      packageScheduleTableRef.value?.setLoading(false)
    })
  } catch (error) {
    packageScheduleTableRef.value?.setLoading(false)
  }
}

/** 清空排产 */
const onClearSchedule = async () => {
  if (!currentRow.value?.id) {
    return ElMessage.warning("请先选择发货计划")
  }

  await ElMessageBox.confirm("确定清空该发货计划下所有待发布的包装排产任务吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    closeOnPressEscape: false,
    autofocus: false,
    type: "warning"
  })

  try {
    loading.value = true

    const taskId = packageScheduleInfo.value?.scheduleTaskVos?.[0]?.id
    if (taskId) {
      await requestDeletePackageScheduleTask(taskId)
    }
    await getPackageScheduleTaskList(currentRow.value?.id, true)
    loading.value = false
    ElMessage.success("清空排产成功")
  } catch (error) {
    ElMessage.error("清空排产失败")
    loading.value = false
  }
}

/** 更新包装排产任务 */
const updatePackageScheduleTask = async (type?: string) => {
  if (!currentRow.value?.id) {
    return ElMessage.warning("请先选择发货计划")
  }

  const { beginTime, endTime } = packageScheduleFormData.value

  if (beginTime && endTime && dayjs(endTime).isBefore(dayjs(beginTime))) {
    type === "endTime"
      ? (packageScheduleFormData.value.endTime = "")
      : (packageScheduleFormData.value.beginTime = "")
    return ElMessage.warning("结束时间不能早于开始时间")
  }

  try {
    loading.value = true

    const selectedRows =
      packageScheduleTableRef.value?.getCurrentMultipleRows() as IPackageScheduleTaskListItem[]
    const taskId = packageScheduleInfo.value?.scheduleTaskVos?.[0]?.id

    let params = {
      ...packageScheduleFormData.value,
      deliveryPlanId: currentRow.value?.id,
      productionTaskId: taskId,
      productList: selectedRows.map((item) => ({
        productModelId: item.productModelId,
        planQty: item.planQty!,
        unitId: item.unitId
      }))
    }

    if (taskId) {
      // 已有排产任务，更新任务
      await requestUpdatePackageScheduleTask(params)
    } else {
      // 没有排产任务，创建任务
      await requestCreatePackageScheduleTask(params)
    }
  } finally {
    await shipmentTableRef.value?.requestData()
    await getPackageScheduleTaskList(currentRow.value?.id)
    loading.value = false
  }
}

/** 提交发布 */
const onsubmitPublish = async () => {
  if (!currentRow.value?.id) {
    return ElMessage.warning("请先选择发货计划")
  }

  const selectedRows =
    packageScheduleTableRef.value?.getCurrentMultipleRows() as IPackageScheduleTaskListItem[]

  if (!selectedRows.length) {
    return ElMessage.warning("请至少选择一个产品进行排产")
  }

  const taskIds = packageScheduleInfo.value!.scheduleTaskVos!.map((item) => item.id)
  await requestPublishPackageScheduleTask({
    deliveryTaskId: currentRow.value!.id,
    idList: taskIds
  })
  ElMessage.success("发布成功")
  await shipmentTableRef.value?.requestData()
  let index = shipmentTableData.value.findIndex((item) => item.id === currentRow.value?.id)
  if (index !== -1) {
    getPackageSpecList(currentRow.value?.id)
    getPackageScheduleTaskList(currentRow.value?.id)
  } else {
    // 清空右侧数据
    currentRow.value = null
    packageSpecTableData.value = []
    packageScheduleTableData.value = []
  }
}
</script>

<style lang="scss" scoped>
.content {
  flex-direction: row !important;
  flex: 1;
  overflow: hidden;

  .plan-list {
    width: 530px;
    flex: none;
    padding-right: 16px;
    border-right: 1px solid #e6e6e6;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .package-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

.package-spec-list {
  padding: 0 0 16px 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid #e6e6e6;
}

.package-title {
  &:deep(.custom-title-operation) {
    width: 100%;
    margin: 0 auto 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.package-schedule-list {
  flex: 1;
  padding: 0 0 0 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .package-schedule-table {
    flex: 1;
    overflow: hidden;
  }

  &:deep(.package-schedule-form) {
    .el-form {
      gap: 0 8px;
    }
  }

  &:deep(.location) {
    .el-cascader__tags {
      flex-wrap: nowrap;
      right: 30px;
      overflow: hidden;

      .el-tag--info {
        width: 70%;
      }
    }
  }
}

.package-code {
  font-size: 14px;
  color: #999;
}

.search-form {
  &:deep(.el-form-item__label) {
    width: 0px !important;
  }
}

.package-table {
  flex: 1;
  overflow: hidden;

  &:deep(.el-table__expanded-cell) {
    padding: 20px;
    background-color: #e6e6e6;
  }

  .package-product-table-title {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    color: #000;
    font-weight: bold;
  }
}

.operation-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0 16px 16px;
}

.customer-option {
  display: flex;
  align-items: center;
  justify-content: space-between;

  span {
    flex: 1;
  }

  .customer-full-name {
    margin-left: 12px;
  }
}
</style>
