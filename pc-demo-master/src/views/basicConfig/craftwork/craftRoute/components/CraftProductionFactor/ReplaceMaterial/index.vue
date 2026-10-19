<template>
  <CustomDialog
    v-model="visible"
    @close="emits('update:modelValue', false)"
    size="medium"
    title="替代料"
  >
    <CustomTitle title="" style="margin-top: 0px">
      <div v-if="!isOnlyView">
        <el-button type="primary" @click="productSelectVisible = true">新增替代料</el-button>
      </div>
    </CustomTitle>

    <CustomTable
      ref="customTableRef"
      v-model:table-data="customTableData"
      :config="tableConfig"
      class="custom-table"
    >
      <template #baseAmount-default="{ row }">
        <el-input
          placeholder="请输入"
          v-model="row.baseAmount"
          :disabled="isOnlyView"
        />
      </template>

      <template #unitId-default="{ row }">
        <span>{{ row.unitName || "-" }}</span>
      </template>

      <template #pickMaterial-header="{ column: { label } }">
        <div class="material-header">
          <span>{{ label }}</span>
          <el-tooltip effect="dark" content="执行排产后，自动为该物料创建领料计划" placement="top">
            <el-icon><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
      </template>
      <template #pickMaterial-default="{ row }">
        <el-select
          v-model="row.pickMaterial"
          :disabled="isOnlyView"
        >
          <el-option label="是" :value="1" />
          <el-option label="否" :value="0" />
        </el-select>
      </template>

      <template #operation-default="{ $index }">
        <el-button
          link
          type="danger"
          size="small"
          @click="onDeleteRowClick($index)"
          v-if="!isOnlyView"
          >删除</el-button
        >
      </template>
    </CustomTable>

    <template #footer>
      <el-button @click="emits('update:modelValue', false)">取消</el-button>
      <el-button type="primary" @click="modalClick" v-if="!isOnlyView"> 确定 </el-button>
    </template>

    <!-- 选择产品弹窗 -->
    <SelectProductDialog
      v-model="productSelectVisible"
      :selected-row-keys="selectedProductIds"
      :filterProductModelIds="filterProductModelIds"
      multiple
      @success="onSelectMaterialSuccess"
    />
  </CustomDialog>
</template>

<script setup lang="ts">
import { QuestionFilled } from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox } from "element-plus"

import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectProductDialog from "@/components/SelectProductDialog/index.vue"
import useProductStore from "@/store/modules/product"

defineOptions({
  name: "SelectReplaceMaterialModel"
})

interface ITableRow {
  productModelId: string
  productModelCode: string
  productModelName: string
  productCategoryName: string
  productType: number
  productTypeName?: string
  baseAmount: number | ""
  unitId: string
  unitName: string
  pickMaterial: number
}
interface IReplaceTableRow {
  productModelId: string
  productModelCode: string
  productModelName: string
  productCategoryName: string
  productType: number
  productTypeName?: string
  baseAmount: number
  unitId: string
  unitName: string
  pickMaterial: number
}

const props = defineProps<{
  modelValue: boolean
  replaceTableData: ITableRow[]
  replaceOriginId: string
  isOnlyView: boolean
  filterProductModelIds?: string[]
}>()
const emits = defineEmits<{
  (e: "update:modelValue", show: boolean): void
  (e: "onOk", data: IReplaceTableRow[]): void
}>()

const productStore = useProductStore()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emits("update:modelValue", val)
})

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "400px",
  columns: [
    {
      prop: "productModelName",
      label: "产品名称",
      minWidth: 160,
      align: "center"
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
      minWidth: 160,
      align: "center"
    },
    {
      prop: "productCategoryName",
      label: "产品类别",
      minWidth: 160,
      align: "center"
    },
    {
      prop: "productTypeName",
      label: "产品类型",
      width: 160,
      align: "center"
    },
    {
      prop: "baseAmount",
      label: "BOM基数",
      minWidth: 120,
      align: "center",
      slots: {
        default: "baseAmount-default"
      }
    },
    {
      prop: "unitId",
      label: "单位",
      minWidth: 120,
      align: "center",
      slots: {
        default: "unitId-default"
      }
    },
    {
      prop: "pickMaterial",
      label: "排产后联动领料",
      minWidth: 160,
      align: "center",
      slots: {
        header: "pickMaterial-header",
        default: "pickMaterial-default"
      }
    },
    {
      prop: "operation",
      label: "操作",
      width: 100,
      fixed: "right",
      align: "center",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const productSelectVisible = ref(false) // 选择产品弹窗是否显示
const selectedProductIds = computed(() => customTableData.value.map((item) => item.productModelId))

watch(
  () => props.modelValue,
  async (val) => {
    if (val) {
      customTableData.value = JSON.parse(JSON.stringify(props.replaceTableData))
    } else {
      customTableData.value = []
    }
  },
  {
    immediate: true
  }
)

const modalClick = () => {
  for (const item of customTableData.value) {
    if (item.baseAmount === "" || !Number(item.baseAmount) || Number(item.baseAmount) <= 0) {
      return ElMessage.error("BOM基数需大于0")
    }
  }
  const data = customTableData.value.filter((item) => {
    return item.baseAmount
  })
  emits("onOk", data as IReplaceTableRow[])
  emits("update:modelValue", false)
}

/** 替换料的成功回调 */
const onSelectMaterialSuccess = (data: any) => {
  if (!data.length) {
    return
  }

  if (data[0].id === props.replaceOriginId) {
    ElMessage.error("不能选择相同的原料")
    return
  }
  const productList = data
    .map((item: any) => {
      return {
        productModelId: item.id,
        productModelCode: item.code,
        productModelName: item.name,
        productCategoryName: item.productCategoryName || "",
        productType: item.productType || 1,
        productTypeName: productStore.productTypeMap[item.productType || 1],
        baseAmount: 1,
        unitId: item.defaultUnitId || "1",
        unitName: item.defaultUnitName || "件",
        pickMaterial: 1
      }
    })
    .filter(
      (item: any) =>
        customTableData.value.findIndex((i: any) => i.productModelId === item.productModelId) === -1
    )
  customTableData.value.push(...productList)
}

/** 删除表格行 */
const onDeleteRowClick = async (index: number) => {
  const confirm = await ElMessageBox.confirm("确认删除该行数据?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    closeOnPressEscape: false,
    autofocus: false,
    type: "warning"
  })
  if (confirm === "confirm") {
    customTableData.value.splice(index, 1)
  }
}
</script>
<style scoped lang="scss">
.material-header {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
