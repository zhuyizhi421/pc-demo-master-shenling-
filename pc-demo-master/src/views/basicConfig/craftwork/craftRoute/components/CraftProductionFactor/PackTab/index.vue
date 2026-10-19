<!-- 包装规范-tab -->
<template>
  <div class="pack-tab">
    <CustomTitle title="产品列表">
      <el-button type="primary" icon="Plus" v-if="!isOnlyView" @click="productSelectVisible = true"
        >添加产品</el-button
      >
    </CustomTitle>

    <CustomTable
      ref="productTableRef"
      v-model:table-data="productTableData"
      :config="productTableConfig"
    >
      <template #productModelName-default="{ row }">
        <el-button type="primary" link size="small" @click="onUpdateProductClick(row)">{{
          row.productModelName
        }}</el-button>
      </template>

      <template #baseAmount-default="{ row }">
        <el-input
          type="number"
          :min="0"
          placeholder="请输入"
          v-model="row.baseAmount"
          :disabled="isOnlyView"
          @change="onProductRowChange(row)"
        />
      </template>

      <template #pickMaterial-header="{ column: { label } }">
        <div class="pick-material-header">
          <span>{{ label }}</span>
          <el-tooltip effect="dark" content="排产执行后，自动为该物料创建领料计划" placement="top">
            <el-icon><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
      </template>

      <template #pickMaterial-default="{ row }">
        <el-select
          v-model="row.pickMaterial"
          :disabled="isOnlyView"
          @change="onProductRowChange(row)"
        >
          <el-option label="是" :value="1" />
          <el-option label="否" :value="0" />
        </el-select>
      </template>

      <template #operation-default="{ row }">
        <el-button
          link
          type="danger"
          size="small"
          @click="onDeleteProduct(row.productModelId)"
          :disabled="isOnlyView"
          >删除</el-button
        >
      </template>
    </CustomTable>

    <CustomTitle title="包装规范列表">
      <el-button
        type="primary"
        icon="Plus"
        v-if="!isOnlyView"
        @click="packageSpecProps.modelValue = true"
        >复制已有规范</el-button
      >
    </CustomTitle>
    <CustomTable
      class="package-table"
      ref="packageTableRef"
      v-model:table-data="packageTableData"
      :config="packageTableConfig"
    >
      <template #expand-default="{ row }: { row: IPackageSpecConfigList }">
        <div class="package-product-table-title">
          <span>包装产品列表</span>
          <el-tooltip
            effect="dark"
            content="仅列表中勾选的产品可包入此包装，若产品填写了装入数量，封包时将校验该产品的数量。"
            placement="top-start"
          >
            <el-icon><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
        <CustomTable
          :ref="($event) => handleRef($event as IEl, row.packSpecId)"
          :table-data="row?.productVoList || []"
          :config="packageProductTableConfig"
          @select-all="(...rest) => onSelectAllChange(...rest, row.packSpecId)"
          @select-change="(...rest) => onSelectChange(...rest, row.packSpecId)"
        >
          <template #packQty-default="{ row: product }">
            <el-input
              v-if="product.isSelect"
              v-model="product.packQty"
              type="number"
              :min="0"
              placeholder="不限"
              clearable
              :disabled="isOnlyView"
              @change="onPackQtyChange(row.packSpecId)"
            />
            <span v-else>{{ product.packQty }}</span>
          </template>
        </CustomTable>
      </template>

      <template #thumbnailAddress-default="{ row: { templateDto } }">
        <el-image
          :src="formatImgUrlPreview(templateDto?.thumbnailAddress)"
          :preview-src-list="[formatImgUrlPreview(templateDto?.thumbnailAddress)]"
          preview-teleported
          style="height: 24px"
        />
      </template>

      <template #operation-default="{ row, $index }">
        <el-button
          :type="$index === 0 ? 'info' : 'primary'"
          :disabled="$index === 0"
          link
          @click="sortData('up', $index)"
        >
          <el-icon>
            <SortUp />
          </el-icon>
        </el-button>
        <el-button
          :type="$index === packageTableData.length - 1 ? 'info' : 'primary'"
          link
          :disabled="$index === packageTableData.length - 1"
          @click="sortData('down', $index)"
        >
          <el-icon>
            <SortDown />
          </el-icon>
        </el-button>
        <el-button type="primary" link size="small" @click="onUpdatePackageSpec(row.packSpecId)"
          >编辑</el-button
        >
        <el-button type="danger" link size="small" @click="onDeletePackageSpec(row.packSpecId)"
          >删除</el-button
        >
      </template>
    </CustomTable>

    <!-- 选择产品弹窗 -->
    <SelectProductDialog
      v-model="productSelectVisible"
      :selected-row-keys="selectedProductIds"
      multiple
      @success="onSelectMaterialSuccess"
    />

    <!-- 选择包装规范弹窗 -->
    <CustomSelectDialog
      :type="EnumDialogType.PackageSpec"
      :props="packageSpecProps"
      :events="{
        'update:modelValue': (val: boolean) => (packageSpecProps.modelValue = val),
        success: onPackageSpecSuccess
      }"
    />

    <!-- 编辑包装规范弹窗 -->
    <PackageSpecCreateDialog
      v-model="packageSpecUpdateVisible"
      :id="curPackageSpecId"
      @success="getPackageSpecList(props.techVersionId)"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  queryPackageProcessSpecList,
  requestAddPackageProcessProduct,
  requestAddPackageProcessSpec,
  requestDeletePackageProcessProduct,
  requestDeletePackageProcessSpec,
  requestSavePackageProcessProduct,
  requestSortPackageProcessSpec,
  requestUpdatePackageProcessProduct
} from "@/api/baseInfo/package-manage/packageProcess"
import {
  getTechStandardMaterialList,
  type IPackMaterialListItem as ITableRow,
  type TechStandardMaterialListItem
} from "@/api/craft"
import type { IProductModelListItem } from "@/api/product"
import CustomSelectDialog from "@/components/CustomSelectDialog/index.vue"
import { EnumDialogType } from "@/components/CustomSelectDialog/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectProductDialog from "@/components/SelectProductDialog/index.vue"
import type { IPackageSpecConfigList } from "@/types/base-info/package-process"
import type { IPackageSpecPageListItem } from "@/types/base-info/package-spec"
import { formatImgUrlPreview } from "@/utils/common"
import PackageSpecCreateDialog from "@/views/basicConfig/packageManage/PackageSpecManage/components/PackageSpecCreateDialog.vue"

defineOptions({
  name: "PackTab"
})

type IEl = ComponentExposed<typeof CustomTable> | null

const props = withDefaults(
  defineProps<{
    techVersionId: string
  }>(),
  {}
)

const productSettingObj = inject<{ showProductSetting: (productModelId: string) => void }>(
  "productSettingObj"
)
const isOnlyView = inject<Ref<boolean>>("isOnlyView", ref(false))

const productSelectVisible = ref(false) // 选择产品弹窗是否显示
const packageSpecUpdateVisible = ref(false) // 编辑包装规范弹窗是否显示
const curPackageSpecId = ref("") // 当前编辑的包装规范id
const packageSpecProps = reactive({
  modelValue: false,
  selectedRowKeys: [],
  multiple: true
})

// 产品列表
const productTableRef = ref<ComponentExposed<typeof CustomTable>>()
const productTableData = ref<TechStandardMaterialListItem[]>([])
const productTableConfig = ref<ITableConfig>({
  height: 300,
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
      label: "比例",
      minWidth: 120,
      slots: {
        default: "baseAmount-default"
      }
    },
    {
      prop: "unitName",
      label: "单位",
      width: 120,
      align: "center"
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
      width: 120,
      fixed: "right",
      align: "center",
      get hidden() {
        return isOnlyView.value
      },
      slots: {
        default: "operation-default"
      }
    }
  ]
})

// 包装规范
const packageTableRef = ref<ComponentExposed<typeof CustomTable>>()
const packageTableData = ref<IPackageSpecConfigList[]>([])
const packageTableConfig = ref<ITableConfig>({
  columns: [
    {
      prop: "expand",
      type: "expand",
      label: "",
      width: 50,
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
      prop: "containerTypeName",
      label: "包装容器类型",
      minWidth: 160,
      align: "center"
    },
    {
      prop: "transportType",
      label: "运输方式",
      minWidth: 160,
      align: "center"
    },
    {
      prop: "thumbnailAddress",
      label: "打印标识模板",
      minWidth: 160,
      align: "center",
      slots: {
        default: "thumbnailAddress-default"
      }
    },
    {
      prop: "remark",
      label: "备注说明",
      minWidth: 200
    },
    {
      prop: "operation",
      label: "操作",
      width: 200,
      fixed: "right",
      align: "center",
      get hidden() {
        return isOnlyView.value
      },
      slots: {
        default: "operation-default"
      }
    }
  ]
})

// 包装规范下产品列表
const packageProductRefs = ref<Map<string, IEl>>(new Map())
const packageProductTableConfig = ref<ITableConfig>({
  rowKey: "productModelId",
  columns: [
    {
      prop: "selection",
      label: "",
      type: "selection",
      width: 60,
      align: "center",
      multiple: true,
      fixed: "left",
      get hidden() {
        return isOnlyView.value
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
      minWidth: 160,
      align: "center",
      slots: {
        default: "packQty-default"
      }
    },
    {
      prop: "unitName",
      label: "单位",
      minWidth: 160,
      align: "center"
    }
  ]
})

const selectedProductIds = computed(() => productTableData.value.map((item) => item.productModelId))

onMounted(async () => {
  await getPackageSpecProductList(props.techVersionId)
  await getPackageSpecList(props.techVersionId)
})

/** 查看产品信息 */
const onUpdateProductClick = async (data: ITableRow) => {
  if (data.productModelId) {
    productSettingObj!.showProductSetting(data.productModelId)
  }
}

/** 处理包装产品列表的ref模板引用 */
const handleRef = (el: IEl, id: string) => {
  if (!id) {
    return
  }

  packageProductRefs.value.set(id, el)
  packageTableData.value.forEach((row) => {
    const selectedRowKeys =
      row.productVoList?.filter((item) => item.isSelect)?.map((item) => item.productModelId) || []
    nextTick(() => {
      packageProductRefs.value.get(row.packSpecId)?.setSelectedRows(selectedRowKeys)
    })
  })
}

/** 获取产品与包装规范下产品列表数据 */
const getPackageSpecProductList = async (techVersionId: string) => {
  productTableRef.value?.setLoading(true)
  const data = await getTechStandardMaterialList({ techVersionId })
  productTableData.value = data || []
  productTableRef.value?.setLoading(false)
}

/** 新增料的成功回调 */
const onSelectMaterialSuccess = async (data: IProductModelListItem[]) => {
  if (data?.length) {
    const list = data.filter(
      (item) => !productTableData.value.find((i) => i.productModelId === item.id)
    )
    await requestAddPackageProcessProduct({
      productModelIds: list.map((item) => item.id),
      techVersionId: props.techVersionId
    })
    ElMessage.success("添加产品成功")

    await getPackageSpecProductList(props.techVersionId)
    await getPackageSpecList(props.techVersionId)
  }
}

/** 修改产品行数据 */
const onProductRowChange = async (row: TechStandardMaterialListItem) => {
  if (row.baseAmount <= 0 || !row.baseAmount) {
    ElMessage.warning("比例必须大于0")
    getPackageSpecProductList(props.techVersionId)
    return
  }
  await requestUpdatePackageProcessProduct({
    productModelId: row.productModelId,
    pickMaterial: row.pickMaterial,
    baseAmount: row.baseAmount,
    techVersionId: props.techVersionId
  })
  ElMessage.success("编辑成功")

  getPackageSpecProductList(props.techVersionId)
}

/** 获取包装规范列表 */
const getPackageSpecList = async (techVersionId: string) => {
  packageProductRefs.value.clear()
  packageTableRef.value?.setLoading(true)
  const data = await queryPackageProcessSpecList(techVersionId)

  if (!data) {
    packageTableData.value = []
    packageTableRef.value?.setLoading(false)
    return
  }

  // 包装规范列表下的包装产品列表数据显示需要与产品列表保持一致；通过接口获取
  // 的数据则表示当前已勾选的包装产品数据
  data.forEach((row) => {
    let list: IPackageSpecConfigList["productVoList"] = []

    productTableData.value.forEach((item) => {
      const target = row.productVoList?.find(
        (product) => product.productModelId === item.productModelId
      )
      if (target) {
        list.push({ ...target, isSelect: true })
      } else {
        list.push({
          decimalNumber: item.decimalNumber,
          drawingNumber: item.drawingNumber,
          packQty: undefined,
          productModelCode: item.productModelCode,
          productModelId: item.productModelId,
          productModelName: item.productModelName,
          unitId: item.unitId,
          unitName: item.unitName,
          isSelect: false
        })
      }
    })
    row.productVoList = list
  })

  packageTableData.value = data
  packageTableRef.value?.setLoading(false)
}

/** 选择包装规范弹窗成功回调 */
const onPackageSpecSuccess = async (data: IPackageSpecPageListItem[]) => {
  if (!data.length) {
    return
  }
  await requestAddPackageProcessSpec({
    packSpecIdList: data.map((item) => item.id),
    techVersionId: props.techVersionId
  })
  ElMessage.success("复制包装规范成功")

  getPackageSpecList(props.techVersionId)
}

/** 删除产品表格行 */
const onDeleteProduct = async (productId: string) => {
  await ElMessageBox.confirm("确认删除该行数据?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    closeOnPressEscape: false,
    autofocus: false,
    type: "warning"
  })
  await requestDeletePackageProcessProduct({
    productModelId: productId,
    techVersionId: props.techVersionId
  })
  ElMessage.success("删除产品成功")

  await getPackageSpecProductList(props.techVersionId)
  await getPackageSpecList(props.techVersionId)
}

/** 包装规范排序 */
const sortData = async (type: "up" | "down", index: number) => {
  await requestSortPackageProcessSpec({
    techVersionId: props.techVersionId,
    packSpecId1: packageTableData.value[index].packSpecId,
    packSpecId2: packageTableData.value[type === "up" ? index - 1 : index + 1].packSpecId
  })
  ElMessage.success("排序成功")

  getPackageSpecList(props.techVersionId)
}

/** 编辑包装规范 */
const onUpdatePackageSpec = (id: string) => {
  packageSpecUpdateVisible.value = true
  curPackageSpecId.value = id
}

/** 删除包装规范 */
const onDeletePackageSpec = async (id: string) => {
  await ElMessageBox.confirm("确认删除该行数据?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    closeOnPressEscape: false,
    autofocus: false,
    type: "warning"
  })

  await requestDeletePackageProcessSpec({
    techVersionId: props.techVersionId,
    packSpecId: id
  })
  ElMessage.success("删除包装规范成功")

  getPackageSpecList(props.techVersionId)
}

/** 包装产品装入数量变化触发 */
const onPackQtyChange = async (id: string) => {
  const curRef = packageProductRefs.value.get(id)
  const data = (curRef?.getCurrentMultipleRows() as IPackageSpecConfigList["productVoList"]) || []
  const valid = data.every((item) => (item.packQty && item.packQty > 0) || !item.packQty)
  if (!valid) {
    ElMessage.warning("装入数量必须大于0")
    getPackageSpecList(props.techVersionId)
    return
  }

  curRef?.setLoading(true)
  await requestSavePackageProcessProduct({
    id,
    productVoList: data
  })
  ElMessage.success("编辑成功")
  curRef?.setLoading(false)

  getPackageSpecList(props.techVersionId)
}

/** 包装产品列表全选触发 */
const onSelectAllChange = async (
  checked: boolean,
  data: IPackageSpecConfigList["productVoList"],
  id: string
) => {
  packageProductRefs.value.get(id)?.setLoading(true)
  await requestSavePackageProcessProduct({
    id,
    productVoList: data
  })
  await getPackageSpecList(props.techVersionId)
  packageProductRefs.value.get(id)?.setLoading(false)
}

/** 包装产品列表行选择触发 */
const onSelectChange = async (
  checked: boolean,
  row: IPackageSpecConfigList["productVoList"][0],
  id: string
) => {
  const curRef = packageProductRefs.value.get(id)
  curRef?.setLoading(true)
  const data = (curRef?.getCurrentMultipleRows() as IPackageSpecConfigList["productVoList"]) || []
  await requestSavePackageProcessProduct({
    id,
    productVoList: data
  })
  await getPackageSpecList(props.techVersionId)
  packageProductRefs.value.get(id)?.setLoading(false)
}
</script>

<style lang="scss" scoped>
.operation {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin: 20px 20px 0 20px;
}

.package-table {
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

.pick-material-header {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
