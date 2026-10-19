<!-- 料-产品列表 -->

<template>
  <div class="material-tab">
    <CustomTitle title="产品列表">
      <div v-if="!isOnlyView && !props.isSummary">
        <el-button
          type="primary"
          icon="Plus"
          v-if="isSingleCraft || isCraftGroup || isAndCraft"
          @click="onAddMaterialClick()"
          >新增料</el-button
        >
      </div>
    </CustomTitle>

    <CustomTable
      ref="customTableRef"
      v-model:table-data="customTableData"
      :config="tableConfig"
      class="custom-table"
    >
      <template #productModelName-default="{ row }">
        <!-- <span v-if="isOnlyView || !isSingleCraft">{{ row.productModelName }}</span>
        <el-button type="primary" link size="small" @click="onUpdateProductClick(row)" v-else>{{
          row.productModelName
        }}</el-button> -->
        <el-button type="primary" link size="small" @click="onUpdateProductClick(row)">{{
          row.productModelName
        }}</el-button>
      </template>

      <template #baseAmount-default="{ row }">
        <el-input
          placeholder="请输入"
          v-model="row.baseAmount"
          :disabled="isOnlyView || props.isSummary"
          @change="hasChange = true"
        />
      </template>

      <template #unitId-default="{ row }">
        <el-select
          v-if="isSingleCraft && row.productModelUnitList?.length && !isOnlyView && !props.isSummary"
          v-model="row.unitId"
          :disabled="!!row.sourceProcessSerial"
          filterable
        >
          <el-option
            v-for="item in row.productModelUnitList"
            :key="item.id"
            :label="item.unitName"
            :value="item.unitId"
          />
        </el-select>
        <span v-else> {{ row?.unitName || "-" }} </span>
      </template>

      <template #feedingControl-default="{ row }">
        <el-select
          v-if="!isOnlyView && !props.isSummary"
          v-model="row.feedingControl"
          @change="hasChange = true"
        >
          <el-option label="是" :value="1" />
          <el-option label="否" :value="0" />
        </el-select>
        <span v-else>{{ Number(row.feedingControl ?? 1) === 1 ? "是" : "否" }}</span>
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
          v-if="isSingleCraft && isEffectiveValue(row.pickMaterial) && !props.isSummary"
          v-model="row.pickMaterial"
          :disabled="isOnlyView || isTestOrder"
          @change="hasChange = true"
        >
          <el-option label="是" :value="1" />
          <el-option label="否" :value="0" />
        </el-select>
        <span v-else>{{ row.pickMaterial ? "是" : "否" }}</span>
      </template>

      <template #primaryMaterial-header="{ column: { label } }">
        <div class="material-header">
          <span>{{ label }}</span>
          <el-tooltip effect="dark" content="工序产出物沿用主体物料的条码" placement="top">
            <el-icon><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
      </template>

      <template #operation-default="{ row, $index }">
        <el-button
          link
          type="danger"
          size="small"
          @click="onDeleteRowClick($index)"
          :disabled="isOnlyView || props.isSummary"
          >删除</el-button
        >
        <el-button
          v-if="props.craftType === EnumParentCraftType.CRAFT_ROUTE && !props.isSummary"
          link
          type="primary"
          size="small"
          @click="onReplaceMaterialClick(row, $index)"
          >替代料</el-button
        >
      </template>
    </CustomTable>

    <div class="operation">
      <el-button v-if="!isOnlyView && !props.isSummary" type="primary" @click="onSaveClick()">保存</el-button>
    </div>

    <!-- 选择产品弹窗 -->
    <SelectProductDialog
      v-model="productSelectVisible"
      :selected-row-keys="selectedProductIds"
      multiple
      @success="onSelectMaterialSuccess"
    />

    <!-- 选择BOM子件弹窗 -->
    <SelectBomItemDialog
      v-model="bomItemSelectVisible"
      :product-id="props.productModelId"
      :product-name="props.productModelName"
      :selected-row-keys="selectedBomItemKeys"
      @success="onSelectBomItemSuccess"
    />

    <!-- 替换料 -->
    <SelectReplaceMaterialModel
      v-model="replaceMaterialSelectVisible"
      :replaceOriginId="replaceOriginId"
      :filterProductModelIds="selectedProductIds"
      :replaceTableData="replaceTableData"
      :isOnlyView="isOnlyView"
      @on-ok="onSelectReplaceMaterialSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { getBomItemsByProductId, type IBomItemWithVersion } from "@/api/bom"
import { getTechStandardMaterialList, saveTechStandardMaterialList } from "@/api/craft"
import { type IProductModelListItem } from "@/api/product"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectBomItemDialog from "@/components/SelectBomItemDialog/index.vue"
import SelectProductDialog from "@/components/SelectProductDialog/index.vue"
import {
  EnumBarcodeDefaultRelevanceMode,
  EnumParentCraftType,
  EnumProductionOrderType
} from "@/constant/enums"
import useProductStore from "@/store/modules/product"
import type { ITechVersionProps } from "@/types/base-info/craftRoute"
import { isEffectiveValue } from "@/utils/common"
import SelectReplaceMaterialModel from "@/views/basicConfig/craftwork/craftRoute/components/CraftProductionFactor/ReplaceMaterial/index.vue"

defineOptions({
  name: "MaterialTab"
})

interface ITableRow {
  id: string
  productModelId: string
  productModelName: string
  productModelCode: string
  productCategoryName: string
  productType: number
  productTypeName?: string
  baseAmount: number
  productModelUnitList: any[]
  sourceProcessSerial: string
  feedingControl: number
  pickMaterial: number
  unitId: string
  unitName: string
  replaceTableData?: IReplaceTableRow[]
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
  feedingControl: number
  pickMaterial: number
}

const props = withDefaults(
  defineProps<{
    techVersionInfo: ITechVersionProps
    isSummary?: boolean // 是否为汇总情况，如右侧料产出
    craftType: EnumParentCraftType // 工艺类型
    productModelId?: string // 产品ID（用于查询BOM）
    productModelName?: string // 产品名称
  }>(),
  {
    isSummary: false
  }
)

const productStore = useProductStore()

const isOnlyView = inject<Ref<boolean>>("isOnlyView", ref(false))
const orderType = inject<Ref<EnumProductionOrderType>>(
  "orderType",
  ref(EnumProductionOrderType.QUANTITY)
)
const productSettingObj = inject<{ showProductSetting: (productModelId: string) => void }>(
  "productSettingObj"
)

const isTestOrder = computed(() => orderType.value === EnumProductionOrderType.TEST)

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "400px",
  rowKey: "productModelId",
  columns: [
    {
      prop: "productModelName",
      label: "产品名称",
      minWidth: 160,
      slots: {
        default: "productModelName-default"
      }
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
      prop: "productCategoryName",
      label: "产品类别",
      minWidth: 160
    },
    {
      prop: "productTypeName",
      label: "产品类型",
      width: 160
    },
    {
      prop: "baseAmount",
      label: "BOM基数",
      minWidth: 120,
      slots: {
        default: "baseAmount-default"
      }
    },
    {
      prop: "unitId",
      label: "单位",
      minWidth: 120,
      slots: {
        default: "unitId-default"
      }
    },
    {
      prop: "feedingControl",
      label: "上料管控",
      minWidth: 120,
      align: "center",
      slots: {
        default: "feedingControl-default"
      }
    },
    {
      get prop() {
        return props.isSummary ? "usedByChildrenProcessSerial" : "sourceProcessSerial"
      },
      get label() {
        return props.isSummary ? "投料工序" : "来源工序"
      },
      width: 120,
      align: "center",
      get hidden() {
        return props.craftType === EnumParentCraftType.CRAFT_AND
      }
    },
    {
      prop: "pickMaterial",
      label: "排产后联动领料",
      minWidth: 160,
      slots: {
        header: "pickMaterial-header",
        default: "pickMaterial-default"
      }
    },
    {
      prop: "primaryMaterial",
      label: "主体物料",
      minWidth: 120,
      align: "center",
      get hidden() {
        return props.isSummary || !isFollowMainMaterial.value
      },
      type: "selection",
      selectable: () => {
        return !isOnlyView.value
      },
      slots: {
        header: "primaryMaterial-header"
      }
    },
    {
      prop: "operation",
      label: "操作",
      width: 120,
      fixed: "right",
      align: "center",
      get hidden() {
        return !(isSingleCraft.value || isCraftGroup.value || props.isSummary)
      },
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const productSelectVisible = ref(false) // 选择产品弹窗是否显示
const bomItemSelectVisible = ref(false) // 选择BOM子件弹窗是否显示
const hasChange = ref(false) // 表格数据是否有更新
const replaceMaterialSelectVisible = ref(false) // 替换料弹窗是否显示
const replaceOriginId = ref("") // 替换料的原料id
const editIndex = ref(-1) // 编辑行索引
const replaceTableData = ref<IReplaceTableRow[]>([]) // 替换料数据

const selectedProductIds = computed(() => customTableData.value.map((item) => item.productModelId))
// BOM子件选择的已选key（使用 productId + 版本）
const selectedBomItemKeys = computed(() => 
  customTableData.value.map((item) => `${item.productModelId}-${item.bomVersion || 'V1.0'}`)
)
const currentTechVersionInfo = computed(() => props.techVersionInfo)

// 是否为单工艺
const isSingleCraft = computed(() => {
  return currentTechVersionInfo.value?.type === EnumParentCraftType.CRAFT_ROUTE
})

// 是否为工艺组
const isCraftGroup = computed(() => {
  return currentTechVersionInfo.value?.type === EnumParentCraftType.CRAFT_GROUP
})

// 是否为且工艺
const isAndCraft = computed(() => {
  return currentTechVersionInfo.value?.type === EnumParentCraftType.CRAFT_AND
})

// 是否关联条码方式为沿用主料码
const isFollowMainMaterial = computed(() => {
  return (
    currentTechVersionInfo.value?.defaultCodeRelationType ===
    EnumBarcodeDefaultRelevanceMode.MAIN_MATERIAL
  )
})

onMounted(() => {
  getTableList()
})

/** 新增料 */
const onAddMaterialClick = async () => {
  // 如果有产品ID，先查询该产品是否有BOM配置
  if (props.productModelId) {
    const bomData = await getBomItemsByProductId(props.productModelId)
    if (bomData && bomData.items && bomData.items.length > 0) {
      // 有BOM配置，打开BOM子件选择弹窗
      bomItemSelectVisible.value = true
      return
    }
  }
  // 没有BOM配置或没有产品ID，打开普通产品选择弹窗
  productSelectVisible.value = true
}

/** 编辑产品信息 */
const onUpdateProductClick = async (data: ITableRow) => {
  if (data.productModelId) {
    productSettingObj!.showProductSetting(data.productModelId)
  }
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
    const selectedRow = customTableRef.value?.getCurrentSingleRow() as ITableRow | null
    if (
      isFollowMainMaterial.value &&
      selectedRow?.productModelId === customTableData.value[index].productModelId
    ) {
      customTableRef.value?.clearSelectedRow()
    }
    customTableData.value.splice(index, 1)
    if (isFollowMainMaterial.value && customTableData.value.length === 1) {
      customTableRef.value?.setSelectedRow(customTableData.value[0].productModelId)
    }
    hasChange.value = true
  }
}

/** 新增料的成功回调 */
const onSelectMaterialSuccess = async (data: IProductModelListItem[]) => {
  if (data?.length) {
    const filterData = data.filter((item) => {
      return customTableData.value.findIndex((i: any) => i.productModelId === item.id) === -1
    })
    const productList = filterData.map((item: any) => {
      return {
        id: "",
        productModelId: item.id,
        productModelName: item.name,
        productModelCode: item.code,
        productCategoryName: item.productCategoryName,
        productType: item.productType,
        productTypeName: productStore.productTypeMap[item.productType],
        baseAmount: 1,
        sourceProcessSerial: item.sourceProcessSerial,
        usedByChildrenProcessSerial: item.usedByChildrenProcessSerial,
        feedingControl: Number(item.feedingControl ?? 1),
        pickMaterial: isTestOrder.value ? 1 : item.pickMaterial, // 试产订单倒扣料固定位“是”，且不可更改
        productModelUnitList: item.productModelUnitList,
        unitId: item.defaultUnitId,
        unitName: item.defaultUnitName,
        replaceTableData: props.isSummary ? [] : undefined
      }
    })

    customTableData.value.push(...productList)

    if (isFollowMainMaterial.value && customTableData.value.length === 1) {
      await nextTick()
      customTableRef.value?.setSelectedRow(customTableData.value[0].productModelId)
    }
    if (productList.length) {
      hasChange.value = true
    }
  }
}

/** 打开替代料 */
const onReplaceMaterialClick = async (row: any, $index: number) => {
  editIndex.value = $index
  replaceTableData.value = row.replaceTableData || []
  replaceOriginId.value = row.productModelId
  replaceMaterialSelectVisible.value = true
}

/** 替换料的成功回调 */
const onSelectReplaceMaterialSuccess = (data: IReplaceTableRow[]) => {
  customTableData.value[editIndex.value].replaceTableData = data
}

/** 选择BOM子件的成功回调 */
const onSelectBomItemSuccess = async (data: IBomItemWithVersion[]) => {
  console.log(data)
  if (data?.length) {
    const filterData = data.filter((item) => {
      return customTableData.value.findIndex((i: any) => i.productModelId === item.productId) === -1
    })
    const productList = filterData.map((item: IBomItemWithVersion) => {
      return {
        id: "",
        bomVersion: item.bomVersion,
        productModelId: item.productId,
        productModelName: item.productName,
        productModelCode: item.productCode,
        productCategoryName: item.productCategoryName || "",
        productType: item.productType || 1,
        productTypeName: productStore.productTypeMap[item.productType || 1],
        baseAmount: item.composeQuantity || 1,
        sourceProcessSerial: "",
        usedByChildrenProcessSerial: "",
        feedingControl: Number((item as any).feedingControl ?? 1),
        pickMaterial: isTestOrder.value ? 1 : 0,
        productModelUnitList: item.unitList || [],
        unitId: item.unitId || "1",
        unitName: item.unitName || "件",
        replaceTableData: props.isSummary ? [] : undefined
      }
    })

    customTableData.value.push(...productList)

    if (isFollowMainMaterial.value && customTableData.value.length === 1) {
      await nextTick()
      customTableRef.value?.setSelectedRow(customTableData.value[0].productModelId)
    }
    if (productList.length) {
      hasChange.value = true
    }
  }
}

/** 获取料表格数据 */
const getTableList = async () => {
  if (!currentTechVersionInfo.value?.techVersionId) {
    customTableData.value = []
    return
  }
  const data = await getTechStandardMaterialList({
    techVersionId: currentTechVersionInfo.value.techVersionId,
    processId: currentTechVersionInfo.value.processId
  })
  if (data) {
    customTableData.value = data.map((item) => {
      return {
        id: item.id,
        productModelId: item.productModelId,
        productModelName: item.productModelName,
        productModelCode: item.productModelCode,
        productCategoryName: item.productCategoryName,
        productType: item.productType,
        productTypeName: item.productTypeName,
        baseAmount: item.baseAmount,
        sourceProcessSerial: item.sourceProcessSerial,
        usedByChildrenProcessSerial: item.usedByChildrenProcessSerial,
        feedingControl: Number(item.feedingControl ?? 1),
        pickMaterial: item.pickMaterial,
        productModelUnitList: item.productModelUnitList,
        unitId: item.unitId,
        unitName: item.unitName,
        replaceTableData: item.replaceItemList || []
      }
    })
    if (isFollowMainMaterial.value) {
      const materialItem = data.find((item) => item.primaryMaterial === 1)
      if (materialItem) {
        await nextTick()
        customTableRef.value?.setSelectedRow(materialItem.productModelId)
      }
    }

    hasChange.value = false
  }
}

/** 保存操作 */
const onSaveClick = async (isUpdate: boolean = true) => {
  if (!currentTechVersionInfo.value?.techVersionId) {
    ElMessage.warning("工艺版本信息缺失，无法保存")
    return
  }
  const valid = customTableData.value.every((item) => Number(item.baseAmount) > 0)
  let materialItem: ITableRow | null = null
  if (isFollowMainMaterial.value) {
    materialItem = customTableRef.value?.getCurrentSingleRow() as ITableRow | null
    if (!materialItem) {
      ElMessage.warning("主体物料不能为空")
      return
    }
  }
  if (!valid) {
    ElMessage.warning("基数需大于0")
    return
  }
  hasChange.value = false

  const materialList = customTableData.value.map((item) => {
    return {
      id: item.id,
      baseAmount: item.baseAmount, // 为任意正整数
      feedingControl: Number(item.feedingControl ?? 1),
      pickMaterial: item.pickMaterial,
      primaryMaterial:
        isFollowMainMaterial.value && materialItem?.productModelId === item.productModelId ? 1 : 0,
      unitId: item.unitId,
      productModelId: item.productModelId,
      sourceProcessSerial: item.sourceProcessSerial,
      replaceItemList: item.replaceTableData || [],
      productType: item.productType,
      productTypeName: item.productTypeName
    }
  })

  await saveTechStandardMaterialList({
    materialList,
    techVersionId: currentTechVersionInfo.value.techVersionId,
    processId: currentTechVersionInfo.value.processId
  })
  ElMessage.success("保存成功")
  isUpdate && getTableList()
}

/** 更新数据 */
const updateTableData = () => {
  if (hasChange.value) {
    onSaveClick(false)
  }
}

defineExpose({ updateTableData })
</script>

<style lang="scss" scoped>
.title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0 16px;
}

.operation {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin: 20px 20px 0 20px;
}

.material-header {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
