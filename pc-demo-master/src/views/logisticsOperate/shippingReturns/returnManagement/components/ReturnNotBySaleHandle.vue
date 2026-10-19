<!-- 新建退货 -->
<template>
  <div class="content">
    <div class="top-back">
      <el-button icon="ArrowLeft" @click="emit('close')">返回</el-button>
    </div>
    <div class="top-content">
      <CustomTitle title="新建退货" :is-table-title="false" show-short-bar style="margin-top: 0" />
      <CustomForm ref="customFormRef" v-model="formData" :configs="formConfigs" :columns="3">
      </CustomForm>
    </div>
    <div class="table-box">
      <CustomTitle title="退货清单" :is-table-title="false" show-short-bar>
        <el-button type="primary" @click="selectProductVisible = true" icon="Plus"
          >添加退货产品</el-button
        >
      </CustomTitle>
      <CustomTable
        ref="tableRef"
        v-model:table-data="customTableData"
        :config="tableConfig"
        class="custom-table"
      >
        <template #quantity-default="{ row }">
          <el-input v-model="row.quantity" type="number" :min="0"></el-input>
        </template>

        <template #isReturnInspection-default="{ row }">
          <el-select
            v-model="row.isReturnInspection"
            placeholder="请选择"
            :disabled="row.isReturnInspectionDisabled"
          >
            <el-option label="是" :value="true" />
            <el-option label="否" :value="false" />
          </el-select>
        </template>

        <template #operation-default="{ $index }">
          <el-button link type="danger" size="small" @click="customTableData.splice($index, 1)"
            >删除本行</el-button
          >
        </template>
      </CustomTable>
    </div>
  </div>
  <div class="layout-footer">
    <el-button @click="emit('close')">取消</el-button>
    <el-button type="primary" @click="onSave">新建</el-button>
  </div>

  <SelectProductDialog
    v-model="selectProductVisible"
    :selected-row-keys="selectedProductIds"
    multiple
    @success="onSelectProductSuccess"
  />
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { getSearchCustomer } from "@/api/customer"
import { requestCreateReturnOrderByNotSaleOrder } from "@/api/logistics/return"
import { getInspectTypeConfigList, type IProductModelListItem } from "@/api/product"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectProductDialog from "@/components/SelectProductDialog/index.vue"
import { EnumProductInspectionType } from "@/constant/enums"
import useResetRef from "@/hooks/useResetRef"
import type { IOption } from "@/types/common"
import { precisionConversion } from "@/utils/common"

type ITableRow = IProductModelListItem & {
  productModelId: string
  isReturnInspection: boolean
  isReturnInspectionDisabled: boolean
  quantity?: number
}

const emit = defineEmits<{
  (e: "close"): void
  (e: "success"): void
}>()

const customerOptions = ref<IOption[]>([])

const [formData] = useResetRef({
  customerId: "",
  planDeliveryTime: "",
  saleCode: "",
  dataSource: "",
  saleStatus: "",
  createTime: "",
  id: "",
  customerCode: ""
})

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = ref<ICustomFormConfigItem[]>([
  {
    componentType: "el-select",
    label: "客户名称",
    field: "customerId",
    rules: [
      {
        required: true,
        message: "请选择客户名称",
        trigger: "change"
      }
    ],
    props: {
      placeholder: "请选择客户名称",
      filterable: true,
      get customChildren() {
        return customerOptions.value.map((item) => {
          return {
            componentType: "el-option",
            props: {
              label: item.label,
              value: item.value
            }
          }
        })
      }
    },
    events: {
      change: customerChange
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
  }
])

const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "name",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "quantity",
      label: "退货数量",
      width: 160,
      align: "right",
      slots: {
        default: "quantity-default"
      }
    },
    {
      prop: "defaultUnitName",
      label: "单位",
      width: 120,
      align: "center"
    },
    {
      prop: "isReturnInspection",
      label: "是否退货检验",
      width: 160,
      slots: {
        default: "isReturnInspection-default"
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

const selectedProductIds = computed(() =>
  customTableData.value.map((item: any) => item.productModelId)
)

const selectProductVisible = ref(false)

/** 选择产品成功回调 */
const onSelectProductSuccess = (data: IProductModelListItem[]) => {
  if (!data.length) {
    return
  }

  data?.forEach(async (item) => {
    const target = selectedProductIds.value.find((it) => it === item.id)
    if (target) {
      return
    }

    const data = await getInspectTypeConfigList({
      inspectTypes: EnumProductInspectionType.RETURN_IN,
      productModelId: item.id
    })
    customTableData.value.push({
      ...item,
      productModelId: item.id,
      isReturnInspection: !!data[0]?.needCheck,
      isReturnInspectionDisabled: !data[0]?.needCheck
    })
  })
}

const onSave = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return

  let registerNumsNullIndex = customTableData.value.findIndex((item: ITableRow) => !item?.quantity)
  let warehouseLocationIdNullIndex = customTableData.value.findIndex(
    (item: ITableRow) => !item.isReturnInspection && item.isReturnInspection !== false
  )
  if (registerNumsNullIndex > -1) {
    if (warehouseLocationIdNullIndex > -1) {
      ElMessage({
        message: "请确保输入每一行的退货数量及是否退货检验",
        type: "warning"
      })
      return
    }
    ElMessage({
      message: "请确保输入每一行的退货数量",
      type: "warning"
    })
    return
  } else if (warehouseLocationIdNullIndex > -1) {
    ElMessage({
      message: "请选择输入每一行的是否退货检验",
      type: "warning"
    })
    return
  }
  let temptable = customTableData.value.map((item: any) => ({
    isReturnInspection: item.isReturnInspection,
    customerId: formData.value.customerId,
    productModelId: item.productModelId,
    unitId: item.defaultUnitId,
    specifiedInboundWarehouseId: item.specifiedInboundWarehouseId || null,
    returnQty: precisionConversion(item.quantity, item?.decimalNumber ?? 2)
  }))
  await requestCreateReturnOrderByNotSaleOrder(temptable)
  ElMessageBox.alert("新建成功，请前往拆分并打印退货产品的标签码。", "提示", {
    confirmButtonText: "确认",
    callback: () => {
      emit("success")
      emit("close")
    }
  })
}

function customerChange(val: string) {
  formData.value.customerCode = val
}

/** 获取客户下拉 */
const getCustomerOptions = async () => {
  const { records } = await getSearchCustomer({ pageNum: 1, pageSize: 1000, stateList: [0] })
  customerOptions.value = records.map((item) => ({
    label: item.customerAbbr,
    value: item.id
  }))
}

onMounted(() => {
  getCustomerOptions()
})
</script>

<style lang="scss" scoped>
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
