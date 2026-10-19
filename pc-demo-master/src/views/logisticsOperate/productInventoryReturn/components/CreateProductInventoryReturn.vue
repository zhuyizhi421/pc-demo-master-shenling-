<template>
  <div class="content">
    <div class="top-back">
      <el-button icon="ArrowLeft" @click="emit('close')">返回</el-button>
    </div>
    <div class="top-content">
      <CustomTitle
        :title="!props.selectId ? '新建库存退货' : '编辑库存退货'"
        :is-table-title="false"
        show-short-bar
        style="margin-top: 0"
      />
      <CustomForm ref="customFormRef" v-model="formData" :configs="formConfigs" :columns="3">
      </CustomForm>
    </div>
    <div class="table-box">
      <CustomTitle title="库存退货清单" :is-table-title="false" show-short-bar>
        <div>
          <el-dropdown>
            <el-button
              type="primary"
              icon="Plus"
              @click="onAddOrder('purchase')"
              :disabled="!formData.supplierId"
            >
              按采购订单选择<el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <el-button
                    type="primary"
                    icon="Plus"
                    style="margin-left: 12px"
                    link
                    :disabled="!formData.supplierId"
                    @click="onAddOrder('delegate')"
                  >
                    按委外订单选择
                  </el-button>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-button
                    class="w-[130px]"
                    type="primary"
                    icon="Plus"
                    link
                    @click="selectProductVisible = true"
                    >新增产品</el-button
                  >
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </CustomTitle>
      <CustomTable
        ref="tableRef"
        v-model:table-data="customTableData"
        :config="tableConfig"
        class="custom-table"
      >
        <template #returnQuantity-default="{ row }">
          <el-input
            v-model="row.returnQuantity"
            placeholder="请输入"
            clearable
            @input="handleInput(row)"
          />
        </template>

        <template #unitId-default="{ row }">
          <el-select
            v-model="row.unitId"
            filterable
            placeholder="请选择"
            clearable
            :disabled="!!row.relatedPurchaseTaskCode"
          >
            <el-option
              v-for="item in row.unitOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>

        <template #specifiedInboundWarehouseId-default="{ row }">
          <el-select v-model="row.specifiedInboundWarehouseId" clearable filterable>
            <el-option
              v-for="item in warehouseList"
              :key="item.id"
              :label="item.entityName"
              :value="item.id"
            ></el-option>
          </el-select>
        </template>

        <template #operation-default="{ $index }">
          <el-button link type="danger" size="small" @click="onDeleteIndex($index)"
            >删除本行</el-button
          >
        </template>
      </CustomTable>
    </div>
  </div>
  <div class="layout-footer">
    <el-button @click="emit('close')">取消</el-button>
    <el-button type="primary" @click="onSave">{{ formData.id ? "保存" : "创建" }}</el-button>
  </div>

  <!-- 选择产品 -->
  <SelectProductDialog
    v-model="selectProductVisible"
    :selected-row-keys="selectedProductIds"
    multiple
    @success="onSelectProductSuccess"
  />

  <!-- 选择采购订单 -->
  <SelectProcurementOrder
    v-model="showProcurementOrder"
    :supplierId="formData.supplierId"
    :supplierCode="formData.supplierCode"
    @confirm="onSelectProcurementOrderSuccess"
  ></SelectProcurementOrder>

  <!-- 选择委外订单 -->
  <SelectDelegateOrder
    v-model="showDelegateOrder"
    :supplierId="formData.supplierId"
    :supplierCode="formData.supplierCode"
    @confirm="onSelectDelegateOrderSuccess"
  ></SelectDelegateOrder>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { queryFactoryModelList } from "@/api/fm"
import {
  createPurchaseReturnTask,
  getPurchaseReturnTaskById,
  getPurchaseReturnTaskDetail,
  updatePurchaseReturnTask
} from "@/api/logistics/purchase"
import { getUnitList, type IProductModelListItem } from "@/api/product"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectProductDialog from "@/components/SelectProductDialog/index.vue"
import SelectSupplier from "@/components/SelectSupplier/index.vue"
import { EnumPurchaseReturnStatus, EnumPurchaseReturnStatusMap } from "@/constant/enums"
import type { IFactoryModelListItem } from "@/types/base-info/factory-model"
import type { IInventoryListItem } from "@/types/logistics/inventory"
import { isEffectiveValue, precisionConversion, validateInput } from "@/utils/common"

import SelectDelegateOrder from "./SelectDelegateOrder.vue"
import SelectProcurementOrder from "./SelectProcurementOrder.vue"

interface ITableDataItem {
  id?: string // 采购退货单明细ID
  productModelId: string // 产品ID
  productModelName: string
  productModelCode: string
  productCategory: string
  returnQuantity?: number
  unitId: string
  relatedOrderType?: number // 订单类型：1-采购订单，2-委外订单
  relatedPurchaseTaskId?: string // 关联采购订单ID
  relatedPurchaseTaskCode?: string // 关联采购订单
  inboundQuantity?: number // 原采购入库数量
  specifiedInboundWarehouseId?: string // 指定退货仓库
  decimalNumber?: number // 精度
  unitOptions: { value: string; label: string }[]
}

const props = withDefaults(
  defineProps<{
    selectId: string
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "close"): void
  (e: "success"): void
}>()

const formData = ref<{
  supplierId: string
  supplierCode: string
  planReturnTime: string
  purchaseCode: string
  dataSource: string
  taskStatus: string
  createTime: string
  id?: string
  taskCode: string
}>({
  supplierId: "",
  supplierCode: "",
  planReturnTime: "",
  purchaseCode: "",
  dataSource: "",
  taskStatus: "",
  createTime: "",
  id: "",
  taskCode: ""
})

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = ref<ICustomFormConfigItem[]>([
  {
    componentType: "el-input",
    label: "库存退货单号",
    field: "purchaseCode",
    get hidden() {
      return !!formData.value.id
    },
    props: {
      type: "text",
      placeholder: "手动输入/自动生成"
    }
  },
  {
    componentType: markRaw(SelectSupplier),
    label: "供应商名称",
    field: "supplierId",
    rules: [
      {
        required: true,
        message: "请输入供应商名称",
        trigger: "blur"
      }
    ],
    events: {
      originDataChange: onSupplierChange
    }
  },
  {
    componentType: "el-input",
    label: "供应商编号",
    field: "supplierCode",
    props: {
      placeholder: "请输入供应商编号",
      disabled: true
    }
  },
  {
    componentType: "el-date-picker",
    label: "计划退货日期",
    field: "planReturnTime",
    get hidden() {
      return !!formData.value.id
    },
    props: {
      type: "date",
      placeholder: "请选择",
      valueFormat: "YYYY-MM-DD HH:mm:ss",
      format: "YYYY-MM-DD"
    }
  },
  {
    componentType: "el-input",
    label: "来源",
    field: "dataSource",
    get hidden() {
      return !formData.value.id
    },
    props: {
      placeholder: "请输入来源",
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "状态",
    field: "taskStatus",
    get hidden() {
      return !formData.value.id
    },
    props: {
      placeholder: "请输入来源",
      disabled: true
    }
  },
  {
    componentType: "el-date-picker",
    label: "计划退货日期",
    field: "planReturnTime",
    get hidden() {
      return !formData.value.id
    },
    props: {
      type: "date",
      placeholder: "请选择",
      valueFormat: "YYYY-MM-DD HH:mm:ss",
      format: "YYYY-MM-DD"
    }
  },
  {
    componentType: "el-input",
    label: "创建时间",
    field: "createTime",
    get hidden() {
      return !formData.value.id
    },
    props: {
      placeholder: "请输入",
      disabled: true
    }
  }
])

const customTableData = ref<ITableDataItem[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "productModelName",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "productModelCode",
      label: "产品编号",
      minWidth: 160
    },
    {
      prop: "productCategory",
      label: "产品类别",
      minWidth: 160
    },
    {
      prop: "returnQuantity",
      label: "退货数量",
      width: 160,
      align: "right",
      slots: {
        default: "returnQuantity-default"
      }
    },
    {
      prop: "unitId",
      label: "单位",
      width: 120,
      align: "center",
      slots: {
        default: "unitId-default"
      }
    },
    {
      prop: "relatedPurchaseTaskCode",
      label: "关联订单",
      minWidth: 160
    },
    {
      prop: "relatedOrderType",
      label: "订单类型",
      minWidth: 120,
      formatter: (row: ITableDataItem) => {
        return row.relatedOrderType === 1
          ? "采购订单"
          : row.relatedOrderType === 2
            ? "委外订单"
            : ""
      }
    },
    {
      prop: "inboundQuantity",
      label: "原入库数量",
      width: 160,
      formatter: (row: ITableDataItem) => {
        return isEffectiveValue(row.inboundQuantity)
          ? precisionConversion(row.inboundQuantity || 0, row.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "specifiedInboundWarehouseId",
      label: "指定退货仓库",
      minWidth: 160,
      slots: {
        default: "specifiedInboundWarehouseId-default"
      }
    },
    {
      prop: "operation",
      label: "操作",
      width: 90,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const warehouseList = ref<IFactoryModelListItem[]>([])
const showProcurementOrder = ref(false)
const showDelegateOrder = ref(false)

const selectProductVisible = ref(false) // 选择产品弹窗显示标识
const selectedProductIds = ref<string[]>([]) // 选择的产品ID

onBeforeMount(() => {
  getWarehouseListReq()
  if (props.selectId) {
    getProReturnOrderDetail()
    getProReturnOrderDetailList()
  }
})

const handleInput = async (row: ITableDataItem) => {
  row.returnQuantity = validateInput(row.returnQuantity || 0, 10, 6)
}

// purchase:按采购订单选择; delegate:按委外订单选择
const onAddOrder = (type: string) => {
  if (type === "purchase") {
    showProcurementOrder.value = true
  } else {
    showDelegateOrder.value = true
  }
}

// 删除本行
const onDeleteIndex = (index: number) => {
  if (!customTableData.value[index].relatedOrderType) {
    const targetIndex = selectedProductIds.value.findIndex(
      (i) => i === customTableData.value[index].productModelId
    )

    if (targetIndex > -1) {
      selectedProductIds.value.splice(targetIndex, 1)
    }
  }
  customTableData.value.splice(index, 1)
}

/** 供应商选择切换 */
function onSupplierChange(data: any) {
  formData.value.supplierCode = data?.supplierCode || ""
  customTableData.value = []
  selectedProductIds.value = []
}

/** 获取产品单位 */
const getProductUnit = async (productModelId: string) => {
  const res = await getUnitList(productModelId)
  return res.map((item) => {
    return {
      value: item.unitId,
      label: item.unitName
    }
  })
}

// 按采购订单选择
const onSelectProcurementOrderSuccess = (
  list: (IInventoryListItem & { relatedPurchaseTaskCode: string })[]
) => {
  showProcurementOrder.value = false
  list.forEach(async (item) => {
    const target = customTableData.value.find(
      (i) =>
        i.productModelId === item.productModelId &&
        i.relatedPurchaseTaskCode === item.relatedPurchaseTaskCode
    )
    if (!target) {
      customTableData.value.push({
        id: "",
        productModelId: item.productModelId,
        productModelName: item.productModelName,
        productModelCode: item.productModelCode,
        productCategory: item.productCategoryName,
        returnQuantity: undefined,
        unitId: String(item.unitId),
        relatedOrderType: 1,
        relatedPurchaseTaskId: item.purchaseId,
        relatedPurchaseTaskCode: item.relatedPurchaseTaskCode,
        inboundQuantity: item.inboundQuantity,
        specifiedInboundWarehouseId: "",
        unitOptions: await getProductUnit(item.productModelId)
      })
    }
  })
}

//按委外订单选择
const onSelectDelegateOrderSuccess = (
  list: (IInventoryListItem & {
    couldReturnAmount: number
    delegateOrderId: string
    relatedOrderType: string
    delegateOrderNo: string
    relatedPurchaseTaskCode: string
  })[]
) => {
  showDelegateOrder.value = false
  list.forEach(async (item) => {
    const target = customTableData.value.find(
      (i) =>
        i.productModelId === item.productModelId &&
        i.relatedPurchaseTaskCode === item.delegateOrderNo
    )
    if (!target) {
      customTableData.value.push({
        id: "",
        productModelId: item.productModelId,
        productModelName: item.productModelName,
        productModelCode: item.productModelCode,
        productCategory: item.productCategoryName,
        returnQuantity: undefined,
        unitId: String(item.unitId),
        relatedOrderType: 2,
        relatedPurchaseTaskId: item.delegateOrderId,
        relatedPurchaseTaskCode: item.delegateOrderNo,
        inboundQuantity: item.inboundQuantity,
        specifiedInboundWarehouseId: "",
        unitOptions: await getProductUnit(item.productModelId)
      })
    }
  })
}

/** 选择产品回调 */
const onSelectProductSuccess = (data: IProductModelListItem[]) => {
  if (!data.length) {
    return
  }

  data.forEach(async (item) => {
    const target = customTableData.value.find(
      (i) => i.productModelId === item.id && !i.relatedOrderType
    )
    if (!target) {
      customTableData.value.push({
        id: "",
        productModelId: item.id,
        productModelName: item.name,
        productModelCode: item.code,
        productCategory: item.productCategoryName,
        returnQuantity: undefined,
        unitId: String(item.defaultUnitId),
        relatedOrderType: undefined,
        relatedPurchaseTaskId: "", // 添加缺失的字段
        relatedPurchaseTaskCode: "",
        inboundQuantity: undefined,
        specifiedInboundWarehouseId: "",
        unitOptions: await getProductUnit(item.id)
      })

      selectedProductIds.value.push(item.id)
    }
  })
}

// 获取仓库列表
const getWarehouseListReq = async () => {
  const res = await queryFactoryModelList({
    isStorage: true,
    isEnable: true
  })
  warehouseList.value = res
}

/** 获取采购退货单详情 */
const getProReturnOrderDetail = async () => {
  const res = await getPurchaseReturnTaskById(props.selectId)
  const {
    supplierId,
    supplierCode,
    planReturnTime,
    dataSource,
    taskStatus,
    createTime,
    id,
    taskCode
  } = res
  formData.value = {
    supplierId,
    supplierCode,
    planReturnTime,
    purchaseCode: "",
    createTime,
    id,
    taskCode,
    dataSource: dataSource == 1 ? "MES" : "ERP",
    taskStatus: EnumPurchaseReturnStatusMap[taskStatus as EnumPurchaseReturnStatus]
  }
}

/** 获取采购退货清单明细 */
const getProReturnOrderDetailList = async () => {
  const data = await getPurchaseReturnTaskDetail(props.selectId)
  customTableData.value = []
  data.forEach(async (item) => {
    customTableData.value.push({
      id: item.id,
      productModelId: item.productModelId,
      productModelName: item.productModelName,
      productModelCode: item.productModelCode,
      productCategory: item.productCategoryName,
      returnQuantity: item.quantity,
      unitId: item.unitId,
      relatedOrderType: item.relatedOrderType,
      relatedPurchaseTaskId: item.relatedPurchaseTaskId,
      relatedPurchaseTaskCode: item.relatedPurchaseTaskCode,
      inboundQuantity: item.purchaseInboundQuantity,
      decimalNumber: item.decimalNumber,
      specifiedInboundWarehouseId: item.specifiedInboundWarehouseId,
      unitOptions: await getProductUnit(item.productModelId)
    })
  })
  selectedProductIds.value = customTableData.value
    .filter((item) => !item.relatedOrderType)
    .map((item) => item.productModelId)
}

// 保存或创建
const onSave = async () => {
  const valid = await customFormRef.value!.validateForm()
  if (!valid) return

  if (!customTableData.value.length) {
    ElMessage.warning("退货清单不能为空")
    return
  }

  // 采购退货清单表格“退货数量”、“单位”必填
  const hasEmpty = customTableData.value.some(
    (item) => !item.returnQuantity || !Number(item.returnQuantity) || !item.unitId
  )
  if (hasEmpty) {
    ElMessage.warning("退货数量及单位不能为空")
    return
  }

  const hasBigger = customTableData.value.some(
    (item) => item.inboundQuantity && item.returnQuantity! > item.inboundQuantity
  )
  if (hasBigger) {
    ElMessage.warning("退货数量不能大于原入库数量")
    return
  }

  const details = customTableData.value.map((item) => {
    return {
      productModelId: item.productModelId,
      relatedPurchaseTaskCode: item.relatedPurchaseTaskCode,
      relatedOrderType: item.relatedOrderType,
      relatedPurchaseTaskId: item.relatedPurchaseTaskId,
      returnQuantity: item.returnQuantity,
      specifiedInboundWarehouseId: item.specifiedInboundWarehouseId,
      unitId: item.unitId,
      id: item.id
    }
  })
  if (formData.value.id) {
    // 编辑
    await updatePurchaseReturnTask(formData.value.id, {
      details: details,
      planReturnTime: formData.value.planReturnTime,
      supplierId: formData.value.supplierId,
      taskCode: formData.value.taskCode
    })
    ElMessage.success("编辑成功")
  } else {
    // 新增
    await createPurchaseReturnTask({
      details: details,
      planReturnTime: formData.value.planReturnTime,
      supplierId: formData.value.supplierId,
      taskCode: formData.value.purchaseCode
    })
    ElMessage.success("新建成功")
  }

  emit("close")
  emit("success")
}
</script>

<style scoped lang="scss">
.content {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-back {
  margin: 12px 20px;
}

.top-content {
  padding: 0 20px 16px;
  border-bottom: 1px solid #e4e7ed;
}

.table-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px 20px 16px;
  overflow: hidden;

  .custom-table {
    flex: 1;
    overflow: hidden;
  }
}
</style>
