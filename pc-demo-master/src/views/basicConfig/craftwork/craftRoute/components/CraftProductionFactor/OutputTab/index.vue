<!-- 产出-tab -->
<template>
  <div class="output-tab">
    <CustomTitle title="产品列表">
      <div
        v-if="(isSingleCraft || isCraftGroup || isAndCraft) && !isPack && !isOnlyView && !props.isSummary"
      >
        <el-button type="primary" icon="Plus" @click="selectProductVisible = true"
          >新增产品</el-button
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
        <el-button type="primary" link size="small" @click="onUpdateProductClick(row)">{{
          row.productModelName
        }}</el-button>
      </template>

      <template #baseAmount-default="{ row }">
        <el-input
          v-model="row.baseAmount"
          placeholder="请输入"
          @change="hasChange = true"
          :disabled="isOnlyView || isPack || props.isSummary"
        />
      </template>

      <template #unitId-default="{ row, $index }">
        <el-select
          v-if="isSingleCraft && row.productModelUnitList?.length && !isOnlyView && !props.isSummary"
          v-model="row.unitId"
          @change="hasChange = true"
          @focus="selectOutputUnit(row, $index)"
          :disabled="isOnlyView || isPack"
          filterable
        >
          <el-option
            v-for="item in row.productModelUnitList"
            :key="item.id"
            :label="item.unitName"
            :value="item.unitId || item.id"
          />
        </el-select>
        <span v-else>
          {{ row.unitName }}
        </span>
      </template>

      <template #mainProduct-default="{ row }">
        <el-select
          v-if="isEffectiveValue(row.mainProduct) && !props.isSummary"
          v-model="row.mainProduct"
          @change="hasChange = true"
          :disabled="isOnlyView"
        >
          <el-option label="是" :value="1" />
          <el-option label="否" :value="0" />
        </el-select>
        <span v-else>{{ row.mainProduct ? "是" : "否" }}</span>
      </template>

      <template #relatedMaterialId-default="{ row }">
        <el-select
          v-model="row.relatedMaterialId"
          placeholder="请选择关联料"
          :disabled="isOnlyView || !!row.sourceProcessSerial"
          @change="hasChange = true"
          clearable
          filterable
        >
          <el-option
            v-for="material in materialOptions"
            :key="material.productModelId"
            :label="material.productModelName"
            :value="material.productModelId"
          />
        </el-select>
      </template>

      <template #operation-default="{ row, $index }">
        <!-- <el-button
          v-if="!(craftType === EnumParentCraftType.CRAFT_ROUTE && isSummary) && !props.isSummary"
          link
          type="primary"
          size="small"
          @click="onConfigProcessCheckClick(row)"
          :disabled="isOnlyView"
          >配置过程检</el-button
        > -->
        <el-button
          link
          type="danger"
          size="small"
          @click="onDeleteRowClick($index)"
          :disabled="isOnlyView || props.isSummary "
          >删除产出</el-button
        >
      </template>
    </CustomTable>

    <div class="operation">
      <el-button v-if="!isOnlyView && !props.isSummary" type="primary" @click="onSaveClick()">保存</el-button>
    </div>

    <!-- 选择产品弹窗 -->
    <SelectProductDialog
      v-model="selectProductVisible"
      :selected-row-keys="selectProductIdList"
      multiple
      @success="onSelectProductSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { getTechStandardMaterialList, getTechStandardOutputList, saveTechStandardOutputList } from "@/api/craft"
import { getProductModelById, type IProductModelListItem } from "@/api/product"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectProductDialog from "@/components/SelectProductDialog/index.vue"
import { EnumParentCraftType } from "@/constant/enums"
import useProductStore from "@/store/modules/product"
import type { ITechVersionProps } from "@/types/base-info/craftRoute"
import { isEffectiveValue } from "@/utils/common"

interface IMaterialOption {
  productModelId: string
  productModelName: string
}

interface ITableRow {
  id: string
  productModelId: string
  productModelName: string
  productModelCode: string
  productCategoryName: string
  productType: number
  productTypeName?: string
  remark: string
  baseAmount: number
  productModelUnitList: {
    id: string
    unitName: string
    unitId: string
  }[]
  unitId: string
  unitName: string
  mainProduct: number
  relatedMaterialId: string
  sourceProcessSerial: string
}

const isOnlyView = inject<Ref<boolean>>("isOnlyView", ref(false))
const productSettingObj = inject<{ showProductSetting: (productModelId: string) => void }>(
  "productSettingObj"
)

defineOptions({
  name: "OutputTab"
})

const props = withDefaults(
  defineProps<{
    techVersionInfo: ITechVersionProps
    isSummary?: boolean // 是否为汇总情况
    craftType: EnumParentCraftType // 工艺类型
    isPack?: boolean
    processId?: string // 当前选中的工序ID
  }>(),
  {
    isSummary: false,
    isPack: false,
    processId: ""
  }
)
const emit = defineEmits<{
  (e: "switch-tab", productModelId: string): void
}>()

const productStore = useProductStore()

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "400px",
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
      prop: "remark",
      label: "备注",
      minWidth: 160
    },
    {
      prop: "baseAmount",
      get label() {
        return props.isPack ? "比例" : "产出基数"
      },
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
      prop: "mainProduct",
      label: "标为主产出",
      minWidth: 120,
      slots: {
        default: "mainProduct-default"
      }
    },
    {
      prop: "relatedMaterialId",
      label: "关联料",
      minWidth: 180,
      slots: {
        default: "relatedMaterialId-default"
      }
    },
    {
      prop: "operation",
      label: "操作",
      width: 160,
      fixed: "right",
      align: "center",
      get hidden() {
        return (
          !(isSingleCraft.value || isCraftGroup.value || isAndCraft.value || props.isSummary) ||
          props.isPack
        )
      },
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const selectProductVisible = ref(false) // 选择产品弹窗可见
const selectProductIdList = ref<string[]>([]) // 已选择的产品id列表
const hasChange = ref(false) // 是否有修改
const materialOptions = ref<IMaterialOption[]>([]) // 关联料选项列表

// 是否为单工艺
const isSingleCraft = computed(() => {
  return props.techVersionInfo.type === EnumParentCraftType.CRAFT_ROUTE
})

// 是否为工艺组
const isCraftGroup = computed(() => {
  return props.techVersionInfo.type === EnumParentCraftType.CRAFT_GROUP
})

// 是否为且工艺
const isAndCraft = computed(() => {
  return props.techVersionInfo.type === EnumParentCraftType.CRAFT_AND
})

onBeforeMount(() => {
  console.log(props.techVersionInfo.type)
  getTableData()
})

/** 获取关联料选项 */
const getMaterialOptions = async () => {
  const data = await getTechStandardMaterialList({
    techVersionId: props.techVersionInfo.techVersionId,
    processId: props.processId
  })
  if (data) {
    const options: IMaterialOption[] = []
    data.forEach((material) => {
      options.push({
        productModelId: material.productModelId,
        productModelName: material.productModelName
      })
      if (material.replaceItemList && material.replaceItemList.length > 0) {
        material.replaceItemList.forEach((replaceItem) => {
          options.push({
            productModelId: replaceItem.productModelId,
            productModelName: replaceItem.productModelName
          })
        })
      }
    })
    materialOptions.value = options
  }
}

/** 获取表格数据 */
const getTableData = async () => {
  await getMaterialOptions()
  const data = await getTechStandardOutputList({
    techVersionId: props.techVersionInfo.techVersionId,
    processId: props.processId
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
        remark: item.remark,
        baseAmount: item.baseAmount,
        unitId: item.unitId,
        unitName: item.unitName,
        mainProduct: item.mainProduct,
        relatedMaterialId: item.relatedMaterialId || "",
        sourceProcessSerial: item.sourceProcessSerial || "",
        productModelUnitList: item.productModelUnitList.map((item) => {
          return {
            id: item.id,
            unitName: item.unitName,
            unitId: item.unitId
          }
        })
      }
    })
    selectProductIdList.value = data.map((item) => item.productModelId)
    hasChange.value = false
  }
}

/** 编辑产品信息 */
const onUpdateProductClick = async (data: ITableRow) => {
  if (data.productModelId) {
    productSettingObj!.showProductSetting(data.productModelId)
  }
}

/** 选择产品单位 */
const selectOutputUnit = async (data: any, index: number) => {
  const res = await getProductModelById(data.productModelId)
  customTableData.value[index].productModelUnitList = res.productModelUnitList.map((item) => {
    return {
      id: item.id,
      unitName: item.unitName,
      unitId: item.unitId
    }
  })
}

/** 配置过程检 */
const onConfigProcessCheckClick = (row: ITableRow) => {
  emit("switch-tab", row.productModelId)
}

/** 删除表格行 */
const onDeleteRowClick = async (index: number) => {
  const confirm = await ElMessageBox.confirm("确定删除确认删除该行数据?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    closeOnPressEscape: false,
    autofocus: false,
    type: "warning"
  })
  if (confirm === "confirm") {
    customTableData.value.splice(index, 1)
    selectProductIdList.value.splice(index, 1)
    hasChange.value = true
  }
}

/** 选择产品弹窗成功回调 */
const onSelectProductSuccess = (data: IProductModelListItem[]) => {
  if (data.length) {
    data.forEach((item) => {
      // 若已存在，则不再添加
      if (selectProductIdList.value.includes(item.id)) {
        return
      } else {
        customTableData.value.push({
          id: "",
          productModelId: item.id,
          productModelName: item.name,
          productModelCode: item.code,
          productCategoryName: item.productCategoryName,
          productType: item.productType,
          productTypeName: productStore.productTypeMap[item.productType],
          remark: item.remark,
          baseAmount: 1,
          mainProduct: 0,
          relatedMaterialId: "",
          sourceProcessSerial: "",
          unitId: item.defaultUnitId,
          unitName: item.defaultUnitName,
          productModelUnitList: item.productModelUnitList.map((item) => {
            return {
              id: item.id,
              unitName: item.unitName,
              unitId: item.unitId
            }
          })
        })
        selectProductIdList.value.push(item.id)
        hasChange.value = true
      }
    })
  }
}
/** 保存 */
const onSaveClick = async (isUpdate: boolean = true) => {
  let errorText = ""
  let hasMainProduct = false
  customTableData.value.forEach((item) => {
    if (!errorText) {
      if (!(Number(item.baseAmount) > 0)) {
        errorText = "基数需大于0"
      } else if (!item.unitId) {
        errorText = "请选择单位"
      } else if (item.mainProduct) {
        if (hasMainProduct) {
          errorText = "主产出只能有一个"
        } else {
          hasMainProduct = true
        }
      }
    }
  })
  if (errorText) {
    ElMessage.warning(errorText)
    return
  }
  hasChange.value = false

  let outputProductList = customTableData.value.map((item) => {
    return {
      id: item.id,
      productModelId: item.productModelId,
      baseAmount: item.baseAmount,
      unitId: item.unitId,
      mainProduct: item.mainProduct,
      relatedMaterialId: item.relatedMaterialId,
      // 传递完整的产品信息，用于自动生成的产出（可能没有productModelId）
      productModelName: item.productModelName,
      productModelCode: item.productModelCode,
      productCategoryName: item.productCategoryName,
      productType: item.productType,
      productTypeName: item.productTypeName,
      unitName: item.unitName,
      remark: item.remark
    }
  })
  let params = {
    techVersionId: props.techVersionInfo.techVersionId,
    sourceProcessId: props.processId,
    outputProductList
  }
  await saveTechStandardOutputList(params)
  ElMessage.success("保存成功")
  isUpdate && getTableData()
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
</style>
