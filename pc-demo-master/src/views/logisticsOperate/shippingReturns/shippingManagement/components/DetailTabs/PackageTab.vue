<template>
  <CustomTable
    class="package-table"
    ref="tableRef"
    v-model:table-data="tableData"
    :config="tableConfig"
  >
    <template #containerType-default="{ row }">
      <el-tag type="primary">{{ row.containerType }}</el-tag>
    </template>

    <template #operation-default="{ row }">
      <el-button type="primary" link size="small" @click="printBarcode([row.barcode])"
        >打印</el-button
      >
    </template>

    <template #expand-default="{ row }">
      <template v-if="row.childContainers?.length > 0">
        <div class="package-product-table-title">
          <span>子包装列表</span>
        </div>
        <CustomTable
          ref="packageProductTableRef"
          v-model:table-data="row.childContainers"
          :config="childPackageTableConfig"
        >
          <template #child-containerType-default="{ row: childRow }">
            <el-tag type="primary">{{ childRow.containerType }}</el-tag>
          </template>

          <template #child-package-operation-default="{ row: childRow }">
            <el-button type="primary" link size="small" @click="printBarcode([childRow.barcode])"
              >打印</el-button
            >
          </template>
        </CustomTable>
      </template>

      <template v-if="row.bindProducts?.length > 0">
        <div class="package-product-table-title mt">
          <span>产品列表</span>
          <el-tooltip
            effect="dark"
            content="仅列表中勾选的产品可包入此包装，若产品填写了装入数量，封包时将校验该产品的数量。"
            placement="top-start"
          >
            <el-icon><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
        <CustomTable
          ref="packageProductTableRef"
          v-model:table-data="row.bindProducts"
          :config="packageProductTableConfig"
        >
          <template #product-operation-default="{ row: productRow }">
            <el-button type="primary" link size="small" @click="printBarcode([productRow.barcode])"
              >打印</el-button
            >
          </template>
        </CustomTable>
      </template>
    </template>
  </CustomTable>
</template>

<script setup lang="ts">
import { requestPackageRecordByDeliveryPlan } from "@/api/logistics/delivery"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import useBarcodePrint from "@/hooks/useBarcodePrint"
import type { IDeliveryPlanPackageRecordItem } from "@/types/logistics/delivery"
import { isEffectiveValue, precisionConversion } from "@/utils/common"

const props = withDefaults(defineProps<{ id: string }>(), {})

const { printBarcode } = useBarcodePrint()
const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<IDeliveryPlanPackageRecordItem[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "",
      type: "expand",
      label: "",
      width: 60,
      align: "center",
      slots: {
        default: "expand-default"
      }
    },
    {
      prop: "containerType",
      label: "包装容器类型",
      width: 160,
      align: "center",
      slots: {
        default: "containerType-default"
      }
    },
    {
      prop: "barcode",
      label: "包装标签码",
      minWidth: 160
    },
    {
      prop: "packTime",
      label: "包装时间",
      minWidth: 160
    },
    {
      prop: "operation",
      label: "操作",
      width: 160,
      align: "center",
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const childPackageTableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "containerType",
      label: "包装容器类型",
      width: 160,
      align: "center",
      slots: {
        default: "child-containerType-default"
      }
    },
    {
      prop: "barcode",
      label: "包装标签码",
      minWidth: 160
    },
    {
      prop: "child-package-operation",
      label: "操作",
      width: 160,
      align: "center",
      fixed: "right",
      slots: {
        default: "child-package-operation-default"
      }
    }
  ]
})
const packageProductTableConfig = ref<ITableConfig>({
  columns: [
    {
      prop: "barcode",
      label: "标签码",
      minWidth: 160
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
      prop: "defaultQuantity",
      label: "数量",
      width: 160,
      align: "right",
      formatter: ({ defaultQuantity, decimalNumber }) =>
        isEffectiveValue(defaultQuantity) ? precisionConversion(defaultQuantity, decimalNumber) : ""
    },
    {
      prop: "defaultUnitName",
      label: "单位",
      width: 160,
      align: "center"
    },
    {
      prop: "product-operation",
      label: "操作",
      width: 160,
      align: "center",
      fixed: "right",
      slots: {
        default: "product-operation-default"
      }
    }
  ]
})

const getTableData = async (id: string) => {
  if (!id) {
    return
  }
  tableRef.value?.setLoading(true)
  const data = await requestPackageRecordByDeliveryPlan(id)
  tableData.value = data
  tableRef.value?.setLoading(false)
}

watch(
  () => props.id,
  () => {
    getTableData(props.id)
  },
  {
    immediate: true
  }
)
</script>

<style lang="scss" scoped>
.package-table {
  flex: 1;
  display: flex;
  flex-direction: column;
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

    &.mt {
      margin-top: 12px;
    }
  }
}
</style>
