<!-- 包装容器详情弹窗 -->
<template>
  <CustomDialog v-model="visible" title="包装记录" size="large" @close="visible = false">
    <CustomTable ref="tableRef" v-model:table-data="tableData" :config="tableConfig">
      <template #operation-default="{ row }">
        <el-button type="primary" link size="small" @click="printBarcode([row.barcode])"
          >打印</el-button
        >
      </template>

      <template #expand-default="{ row }">
        <div class="py-[12px] px-[16px] bg-[#e6e6e6]">
          <template v-if="row.containerVoList.length > 0">
            <div class="package-product-table-title">
              <span>子包装列表</span>
            </div>
            <CustomTable
              ref="packageProductTableRef"
              v-model:table-data="row.containerVoList"
              :config="childPackageTableConfig"
            >
              <template #child-containerType-default="{ row: childRow }">
                <el-tag type="primary">{{ childRow.containerType }}</el-tag>
              </template>

              <template #child-package-operation-default="{ row }">
                <el-button type="primary" link size="small" @click="printBarcode([row.barcode])"
                  >打印</el-button
                >
              </template>
            </CustomTable>
          </template>

          <template v-if="row.productVoList.length > 0">
            <div class="package-product-table-title">
              <span>产品列表</span>
              <el-tooltip
                effect="dark"
                content="仅包含直接装入此包装内的产品"
                placement="top-start"
              >
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
            <CustomTable
              ref="packageProductTableRef"
              v-model:table-data="row.productVoList"
              :config="packageProductTableConfig"
            >
              <template #product-operation-default="{ row }">
                <el-button type="primary" link size="small" @click="printBarcode([row.barcode])"
                  >打印</el-button
                >
              </template>
            </CustomTable>
          </template>
        </div>
      </template>

      <template #containerType-default="{ row }">
        <el-tag type="primary">{{ row.containerType }}</el-tag>
      </template>
    </CustomTable>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { getProductionReportInfo } from "@/api/scheduling"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import useBarcodePrint from "@/hooks/useBarcodePrint"
import type {
  IProductionReportInfo as ITableRow,
  IProductVoItem
} from "@/types/logistics/packContainer"
import { precisionConversion } from "@/utils/common"

defineOptions({
  name: "PackRecordDialog"
})

const props = defineProps<{
  modelValue: boolean
  id?: string
}>()

const emits = defineEmits<{
  (e: "update:modelValue", val: boolean): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emits("update:modelValue", val)
})

const { printBarcode } = useBarcodePrint()

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
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
      label: "产品标签码",
      minWidth: 160
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
      formatter: (row: any) => row.productModelSpec || row.productModel?.specification || "-"
    },
    {
      prop: "productModelCode",
      label: "产品编号",
      minWidth: 160
    },
    {
      prop: "quantity",
      label: "数量",
      minWidth: 160,
      align: "right",
      formatter: (row: IProductVoItem) => {
        return precisionConversion(row.quantity, row.decimalNumber || 0)
      }
    },
    {
      prop: "unitName",
      label: "单位",
      minWidth: 160,
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

const getProductionReportInfoRequest = async () => {
  try {
    const res = await getProductionReportInfo(props.id)
    tableData.value = [res]
  } catch (error) {
    console.error(error)
  }
}

watch(
  () => props.modelValue,
  async (val) => {
    if (val) {
      await getProductionReportInfoRequest()
    } else {
      tableData.value = []
    }
  }
)
</script>

<style lang="scss" scoped>
:deep(.el-table__expanded-cell) {
  padding: 0;
}
</style>
