<!-- 新建/ 编辑销售订单 -->
<template>
  <div class="create-sale-order">
    <div class="top-back">
      <el-button icon="ArrowLeft" @click="emit('close')">返回</el-button>
    </div>
    <div class="top-content">
      <CustomTitle
        :title="!props.selectId ? '新建销售订单' : '编辑销售订单'"
        :is-table-title="false"
        show-short-bar
        style="margin-top: 0"
      />
      <CustomForm ref="customFormRef" v-model="formData" :configs="formConfigs">
        <template #fileList-default>
          <UploadFile v-model="fileList" :show-tip="false">
            <el-button icon="Upload">上传附件</el-button>
          </UploadFile>
        </template>
      </CustomForm>
    </div>

    <div class="table-box">
      <CustomTitle title="产品明细" :is-table-title="false" show-short-bar>
        <el-button type="primary" icon="Plus" @click="selectProductVisible = true"
          >添加产品</el-button
        >
      </CustomTitle>
      <CustomTable
        ref="tableRef"
        v-model:table-data="tableData"
        :config="tableConfig"
        class="custom-table"
      >
        <template #planDeliveryTime-default="{ row }">
          <el-date-picker
            style="width: 100%"
            v-model="row.planDeliveryTime"
            type="date"
            placeholder="请选择发货日期"
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DD"
          />
        </template>

        <template #quantity-default="{ row }">
          <el-input type="number" v-model="row.quantity" clearable />
        </template>

        <template #unitId-default="{ row }">
          <el-select v-model="row.unitId" placeholder="请选择" filterable>
            <el-option
              v-for="item in row.productModelUnitList"
              :key="item.unitId"
              :label="item.unitName"
              :value="item.unitId"
            />
          </el-select>
        </template>

        <template #operation-default="{ $index }">
          <el-button link type="danger" size="small" @click="onDeleteRowClick($index)"
            >删除</el-button
          >
        </template>
      </CustomTable>
    </div>
    <div class="layout-footer">
      <el-button @click="emit('close')">取消</el-button>
      <el-button type="primary" @click="submitForm">{{
        props.selectId ? "保存" : "新建"
      }}</el-button>
    </div>

    <!-- 选择产品 -->
    <SelectProductDialog
      v-model="selectProductVisible"
      :selected-row-keys="selectedProductIds"
      multiple
      @success="onSelectProductSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { getSearchCustomer } from "@/api/customer"
import { queryFactoryModelList } from "@/api/fm"
import { queryFormTypeCustomFields } from "@/api/implementConfig"
import {
  querySaleOrderDetail,
  requestCreateSaleOrder,
  requestUpdateSaleOrder
} from "@/api/logistics/sale"
import { type IProductModelListItem } from "@/api/product"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectProductDialog from "@/components/SelectProductDialog/index.vue"
import UploadFile from "@/components/UploadFile/index.vue"
import {
  EnumCustomFormType,
  EnumProductionOrderSource,
  EnumProductionOrderSourceMap,
  EnumSaleOrderPriorityMap,
  EnumSaleOrderStatus,
  EnumSaleOrderStatusMap
} from "@/constant/enums"
import { useImplementConfig } from "@/hooks/useImplementConfig"
import type { IFactoryModelListItem } from "@/types/base-info/factory-model"
import type { IFile } from "@/types/base-info/implement-config"
import type { ISaleOrderDetail } from "@/types/logistics/saleOrder"

interface IProps {
  selectId: string
}

interface ITableItem {
  id?: string
  productModelId: string
  productModelCode: string
  quantity?: number
  unitId: string
  planDeliveryTime: string
}

const {
  configToPreviewData,
  customFieldSaveCheck,
  updateCustomFieldViewList,
  customFieldViewListToParams
} = useImplementConfig()

const props = withDefaults(defineProps<IProps>(), {})
const emit = defineEmits<{
  (e: "close"): void
  (e: "success"): void
}>()

const warehouseList = ref<IFactoryModelListItem[]>([])
const fileList = ref<IFile[]>([])
const selectProductVisible = ref(false) // 选择产品弹窗显示标识
const selectedProductIds = ref<string[]>([]) // 选择的产品ID
const customerList = ref<any[]>([])

const saleOrderData = ref<Partial<ISaleOrderDetail>>({})

const formData = reactive({
  customerId: "",
  customerShortName: "",
  customerCode: "",
  planDeliveryTime: "",
  saleCode: "",
  dataSource: "",
  saleStatus: "",
  createTime: "",
  id: "",
  priority: "",
  remarks: "",
  attachmentFileId: "",
  customizeFields: []
})

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-select",
    label: "客户名称",
    field: "customerId",
    rules: [
      {
        required: true,
        message: "请选择客户",
        trigger: "change"
      }
    ],
    props: {
      placeholder: "请选择",
      filterable: true,
      get customChildren() {
        return customerList.value.map((item) => {
          return {
            componentType: "el-option",
            props: {
              label: item.customerName,
              value: item.id
            }
          }
        })
      }
    },
    events: {
      change: onCustomerChange
    }
  },
  {
    componentType: "el-input",
    label: "客户简称",
    field: "customerShortName",
    props: {
      placeholder: "请输入客户简称",
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "客户编号",
    field: "customerCode",
    props: {
      placeholder: "请输入客户编号",
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "销售单号",
    field: "saleCode",
    props: {
      placeholder: "无输入时系统自动创建",
      get disabled() {
        return isEdit.value
      }
    }
  },
  {
    componentType: "el-date-picker",
    label: "计划交货日期",
    field: "planDeliveryTime",
    rules: [
      {
        required: true,
        message: "请选择计划交货日期",
        trigger: "blur"
      }
    ],
    props: {
      type: "date",
      startPlaceholder: "请选择",
      endPlaceholder: "请选择",
      valueFormat: "YYYY-MM-DD HH:mm:ss",
      format: "YYYY-MM-DD"
    }
  },
  {
    componentType: "el-select",
    label: "优先级",
    field: "priority",
    props: {
      placeholder: "请选择",
      get customChildren() {
        return Object.entries(EnumSaleOrderPriorityMap).map(([key, value]) => {
          return {
            componentType: "el-option",
            props: {
              label: value,
              value: +key
            }
          }
        })
      }
    }
  },
  {
    componentType: "el-input",
    label: "来源",
    field: "dataSource",
    get hidden() {
      return !isEdit.value
    },
    props: {
      placeholder: "请输入来源",
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "状态",
    field: "saleStatus",
    get hidden() {
      return !isEdit.value
    },
    props: {
      placeholder: "请选择",
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "创建时间",
    field: "createTime",
    get hidden() {
      return !isEdit.value
    },
    props: {
      placeholder: "请选择",
      disabled: true
    }
  },
  {
    componentType: "div",
    label: "附件",
    colspan: -1,
    field: "fileList",
    slots: {
      default: "fileList-default"
    }
  },
  {
    componentType: "el-input",
    label: "备注",
    field: "remarks",
    colspan: -1,
    props: {
      type: "textarea",
      placeholder: "请输入",
      maxlength: 200,
      showWordLimit: true
    }
  }
])

const tableData = ref<ITableItem[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "index",
      label: "序号",
      width: 65,
      align: "center",
      type: "index"
    },
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
      prop: "planDeliveryTime",
      label: "计划发货日期",
      minWidth: 120,
      align: "center",
      showOverflowTooltip: false,
      slots: {
        default: "planDeliveryTime-default"
      }
    },
    {
      prop: "quantity",
      label: "数量",
      minWidth: 120,
      showOverflowTooltip: false,
      slots: {
        default: "quantity-default"
      }
    },
    {
      prop: "unitId",
      label: "单位",
      minWidth: 120,
      showOverflowTooltip: false,
      slots: {
        default: "unitId-default"
      }
    },
    {
      prop: "operation",
      label: "操作",
      width: 120,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const isEdit = computed(() => !!props.selectId)

onBeforeMount(async () => {
  getCustomList()
  getWarehouseOptions()
  if (props.selectId) {
    await getSaleOrderDetail()
  }
  getCustomFields(!!props.selectId)
})

/** 获取客户名称 */
const getCustomList = async () => {
  const res: any = await getSearchCustomer({ pageNum: 1, pageSize: 1000, stateList: [0] })
  customerList.value = res.records
}

/** 客户名称切换 */
const onCustomerChange = (value: string) => {
  const target = customerList.value.find((item) => item.id === value)
  formData.customerCode = target.customerCode
  formData.customerShortName = target.customerAbbr
}

/** 获取仓库列表 */
const getWarehouseOptions = async () => {
  const res = await queryFactoryModelList({
    isEnable: true,
    isStorage: true
  })
  warehouseList.value = res
}

/** 获取销售订单详情 */
const getSaleOrderDetail = async () => {
  const data = await querySaleOrderDetail({ id: props.selectId })
  if (data) {
    for (let key in formData) {
      ;(formData as any)[key] = (data as any)[key]
      if (key === "dataSource") {
        formData[key] = EnumProductionOrderSourceMap[data.dataSource as EnumProductionOrderSource]
      }
      if (key === "saleStatus") {
        formData[key] = EnumSaleOrderStatusMap[data.saleStatus as EnumSaleOrderStatus]
      }

      if (key === "attachmentFileId") {
        formData[key] = data.attachmentFileId
        if (data.attachmentFile) {
          fileList.value = [
            {
              fileId: data.attachmentFileId,
              fileName: data.attachmentFile.sourceName
            }
          ]
        }
      }
    }
    tableData.value = data.details || []
    selectedProductIds.value = data.details?.map((item) => item.productModelId) || []
    saleOrderData.value = data
  }
}

/** 删除产品明细表格行 */
const onDeleteRowClick = (index: number) => {
  tableData.value.splice(index, 1)
  selectedProductIds.value.splice(index, 1)
}

/** 选择产品回调 */
const onSelectProductSuccess = (data: IProductModelListItem[]) => {
  selectedProductIds.value = data.map((item) => item.id)
  tableData.value = data.map((item) => {
    const target = tableData.value.find((i) => i.productModelId === item.id)
    if (target) {
      return target
    } else {
      return {
        id: "",
        productModelId: item.id,
        productModelName: item.name,
        productModelCode: item.code,
        unitId: String(item.defaultUnitId),
        productModelUnitList: item.productModelUnitList,
        quantity: undefined,
        planDeliveryTime: ""
      }
    }
  })
}

/** 获取自定义配置中销售订单信息字段 */
const getCustomFields = async (editStatus?: boolean) => {
  const data: any = await queryFormTypeCustomFields(EnumCustomFormType.SALES_ORDER)
  if (data) {
    const activeList = data.filter((item: any) => item.isActive)
    configToPreviewData(activeList)

    // 编辑时设置数据回显
    if (editStatus) {
      updateCustomFieldViewList(saleOrderData.value?.customizedFields || [])
    }
  }
}

const submitForm = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return

  if (!tableData.value.length) {
    ElMessage.warning("产品明细不能为空")
    return
  }

  let registerNumsNullIndex = tableData.value.find(
    (item: any) => item?.quantity == "" || item?.quantity == undefined
  )
    ? 1
    : -1
  if (registerNumsNullIndex > -1) {
    ElMessage({
      message: "请确保输入每一行的数量",
      type: "warning"
    })
    return
  }
  const isQuantityExceed = tableData.value.filter(
    (item: any) => Number(item.quantity) > 99999 || Number(item.quantity) < 1
  )
  if (isQuantityExceed.length > 0) {
    ElMessage({
      message: "销售清单数量范围只能在0-99999之间",
      type: "warning"
    })
    return
  }

  if (!customFieldSaveCheck()) {
    ElMessage.warning("请填写自定义必填项")
    return
  }

  let params = {
    customerId: formData.customerId,
    planDeliveryTime: formData.planDeliveryTime,
    saleCode: formData.saleCode,
    priority: formData.priority || "",
    remarks: formData.remarks,
    attachmentFileId: fileList.value?.[0]?.fileId,
    details: tableData.value,
    customizeFields: customFieldViewListToParams()
  }
  if (!isEdit.value) {
    // 新建
    await requestCreateSaleOrder(params)
    ElMessage.success("新建成功")
  } else {
    // 保存
    await requestUpdateSaleOrder(formData.id, params)
    ElMessage.success("编辑成功")
  }
  emit("close")
  emit("success")
}
</script>

<style lang="scss" scoped>
.create-sale-order {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
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
