<!-- 新建退货（按销售订单） -->
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
      <CustomTitle title="退货清单" :is-table-title="false" show-short-bar />
      <CustomTable
        ref="tableRef"
        v-model:table-data="customTableData"
        :config="tableConfig"
        class="custom-table"
      >
        <template #returnQty-default="{ row }">
          <CustomNumberInput
            v-model="row.returnQty"
            :type="2"
            :max="row.deliveryQty"
            include-max
          ></CustomNumberInput>
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
      </CustomTable>
    </div>
  </div>
  <div class="layout-footer">
    <el-button @click="emit('close')">取消</el-button>
    <el-button type="primary" @click="onSave">新建</el-button>
  </div>

  <!-- 销售订单选择弹窗 -->
  <SelectSaleOrdersModal
    v-model="selectSaleOrdersVisible"
    categoryName="return"
    :id="formData.id"
    @success="onSelectedOrderSuccess"
  />
</template>

<script setup lang="ts">
import { ElMessageBox } from "element-plus"

import {
  requestCreateReturnOrderBySaleOrder,
  requestProductListBySaleOrder
} from "@/api/logistics/return"
import { getInspectTypeConfigList } from "@/api/product"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomNumberInput from "@/components/CustomNumberInput/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import { EnumProductInspectionType } from "@/constant/enums"
import useResetRef from "@/hooks/useResetRef"
import type { IOption } from "@/types/common"
import type { IReturnOrderProductInfo, ISaleOrderBySaleListItem } from "@/types/logistics/return"
import { precisionConversion } from "@/utils/common"
import SelectSaleOrdersModal from "@/views/logisticsOperate/components/SelectSaleordersHandle.vue"

type ITableRow = IReturnOrderProductInfo & {
  isReturnInspection: boolean
  isReturnInspectionDisabled: boolean
}

const emit = defineEmits<{
  (e: "close"): void
  (e: "success"): void
}>()

const selectSaleOrdersVisible = ref(false)

const saleCodeOptions = ref<IOption[]>([])

const [formData] = useResetRef({
  saleCode: "",
  customerName: "",
  customerCode: "",
  id: ""
})

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = ref<ICustomFormConfigItem[]>([
  {
    componentType: "el-select",
    label: "销售订单",
    field: "saleCode",
    rules: [
      {
        required: true,
        message: "请选择销售订单",
        trigger: "change"
      }
    ],
    props: {
      placeholder: "请选择",
      clearable: false,
      customChildren: saleCodeOptions.value.map((item) => {
        return {
          componentType: "el-option",
          props: { label: item.label, value: item.value }
        }
      })
    },
    events: {
      "visible-change": onVisibleChangeSaleCode
    }
  },
  {
    componentType: "el-input",
    label: "客户名称",
    field: "customerName",
    props: {
      placeholder: "请输入客户名称",
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
  }
])

const customTableData = ref<any>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "productModelName",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "deliveryQty",
      label: "已发货数量",
      width: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return row.deliveryQty || row.deliveryQty == 0
          ? precisionConversion(row.deliveryQty, row?.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "returnQty",
      label: "退货数量",
      width: 160,
      align: "right",
      slots: {
        default: "returnQty-default"
      }
    },
    {
      prop: "unitName",
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
    }
  ]
})

const onSelectedOrderSuccess = async (row: ISaleOrderBySaleListItem) => {
  formData.value = cloneDeep(row)

  const res = await requestProductListBySaleOrder({
    saleId: row.id
  })

  customTableData.value = []
  res.forEach(async (item: IReturnOrderProductInfo) => {
    const data = await getInspectTypeConfigList({
      inspectTypes: EnumProductInspectionType.RETURN_IN,
      productModelId: item.productModelId
    })
    customTableData.value.push({
      ...item,
      isReturnInspection: !!data[0]?.needCheck,
      isReturnInspectionDisabled: !data[0]?.needCheck
    })
  })
}

const onSave = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return
  let temptable: any = customTableData.value.map((item: any) => ({
    unitId: item.unitId,
    saleId: formData.value.id,
    returnQty: precisionConversion(item.returnQty, item?.decimalNumber ?? 2),
    productModelId: item.productModelId,
    specifiedInboundWarehouseId: item.specifiedInboundWarehouseId || null,
    isReturnInspection: item.isReturnInspection
  }))
  await requestCreateReturnOrderBySaleOrder(temptable)
  ElMessageBox.alert("新建成功，请前往拆分并打印退货产品的标签码。", "提示", {
    confirmButtonText: "确认",
    callback: () => {
      emit("success")
      emit("close")
    }
  })
}

function onVisibleChangeSaleCode() {
  selectSaleOrdersVisible.value = true
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
