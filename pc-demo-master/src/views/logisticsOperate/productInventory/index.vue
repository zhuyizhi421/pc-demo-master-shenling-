<!-- 物流运营管理 - 仓库管理  - 所有仓库 -->
<template>
  <div class="layout-container">
    <div class="sidebar">
      <CustomTreeMenu
        :menuItems="menuItems"
        :horizonScroll="true"
        @node-click="onClickNode"
        :defaultExpand="true"
        :default-checked-keys="['']"
        :currentNodeKey="defaultChecked.id"
        :arrowExpand="false"
        :show-custom-icon="false"
      />
    </div>
    <div class="content">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle :title="defaultChecked.name == 'facility' ? '产品库存' : '库位明细'">
          <!-- <BatchImport
            :template-path="EnumTemplatePathType.ALL_INVENTORY"
            :import-path="EnumImportPathType.ALL_INVENTORY"
            :fail-path="EnumFailPathType.ALL_INVENTORY"
            @on-ok="flushList"
          /> -->
        </CustomTitle>

        <CustomTable
          v-if="defaultChecked.name == 'facility'"
          ref="inventoryTableRef"
          v-model:table-data="inventoryTableData"
          v-model:total="pagination.total"
          :config="inventoryTableConfig"
          :query-config="inventoryQueryConfig"
        >
          <template #productModelName-default="{ row: { productModelId, productModelName } }">
            <el-button
              link
              type="primary"
              @click="productInfoModalRef!.setVisible(true, productModelId)"
              >{{ productModelName }}
            </el-button>
          </template>

          <template #operation-default="{ row }">
            <el-button link type="primary" size="small" @click="onOpenSaveLocationDetails(row)"
              >存放库位</el-button
            >
          </template>
        </CustomTable>

        <CustomTable
          v-else
          ref="detailTableRef"
          v-model:table-data="detailTableData"
          v-model:total="pagination.total"
          :config="detailTableConfig"
          :query-config="detailQueryConfig"
        >
          <template #productModelName-default="{ row: { productModelId, productModelName } }">
            <el-button
              link
              type="primary"
              @click="productInfoModalRef!.setVisible(true, productModelId)"
              >{{ productModelName }}
            </el-button>
          </template>
        </CustomTable>
      </div>

      <CustomPagination
        v-model:currentPage="pagination.currentPage"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        border
        @change="getTableList()"
      />

      <!-- 库位信息 抽屉弹窗 -->
      <SaveLocationDetails
        v-model="saveLocationDetailsVisible"
        :warehouseData="warehouseData"
        @success="onSuccess"
      />

      <!-- 产品信息弹窗 -->
      <ProductInfoModal ref="productInfoModalRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  getLogInventorySearch,
  getLoglistWarehouseTree,
  getLogProductPositionDetailSearch
} from "@/api/logistics/inventory"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import CustomTreeMenu from "@/components/CustomTreeMenu/index.vue"
import type {
  FmStorageFacilityTree,
  LogInventorySearchInter,
  LogInventorySearchReturn as IInventoryTableRow,
  LogProductPositionSearchDetailInter,
  PositionDetailRecord as IDetailTableRow
} from "@/types/logistics/inventory"
import { precisionConversion } from "@/utils/common"
import ProductInfoModal from "@/views/logisticsOperate/components/productInfoHandle.vue"

import SaveLocationDetails from "./components/SaveLocationDetails.vue"

defineOptions({
  name: "ProductInventory"
})

const { searchList, resetForm, getFormData } = useSearchForm<{
  productModelName: string
  productModelCode: string
}>([
  {
    type: EnumComponentType.Input,
    label: "产品名称",
    key: "productModelName",
    value: "",
    placeholder: "请输入产品名称"
  },
  {
    type: EnumComponentType.Input,
    label: "产品编号",
    key: "productModelCode",
    value: "",
    placeholder: "请输入产品编号"
  }
])

const saveLocationDetailsVisible = ref(false)
const warehouseData = ref<IInventoryTableRow>()

const productInfoModalRef = ref<InstanceType<typeof ProductInfoModal>>()

//树形列表选中的信息
const defaultChecked = ref({
  name: "facility",
  id: ""
})

const menuItems = ref<any[]>([]) // 初始菜单数据
const inventoryTableRef = ref<ComponentExposed<typeof CustomTable>>()
const inventoryTableData = ref<IInventoryTableRow[]>([])
const inventoryTableConfig = ref<ITableConfig>({
  height: "100%",
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
      prop: "productModelCode",
      label: "产品编号",
      minWidth: 160
    },
    {
      prop: "warehouseNames",
      label: "所属仓库",
      minWidth: 160
    },
    {
      prop: "quantity",
      label: "数量",
      width: 120,
      align: "right",
      formatter: ({ quantity, decimalNumber }) => precisionConversion(quantity, decimalNumber)
    },
    {
      prop: "unitName",
      label: "单位",
      width: 90,
      align: "center"
    },
    {
      prop: "operation",
      label: "操作",
      width: 100,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const inventoryQueryConfig: ITableRequestConfig<
  [LogInventorySearchInter],
  IInventoryTableRow,
  true
> = {
  api: getLogInventorySearch,
  getParams: () => {
    return [
      {
        pageNum: pagination.currentPage,
        pageSize: pagination.pageSize,
        facilityId: defaultChecked.value.id,
        ...getFormData()
      }
    ]
  }
}

const detailTableRef = ref<ComponentExposed<typeof CustomTable>>()
const detailTableData = ref<IDetailTableRow[]>([])
const detailTableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "barCode",
      label: "标签码",
      minWidth: 160
    },
    {
      prop: "productModelName",
      label: "产品名称",
      minWidth: 160,
      slots: {
        default: "productModelName-default"
      }
    },
    {
      prop: "productModelCode",
      label: "产品编号",
      minWidth: 160
    },
    {
      prop: "quantity",
      label: "数量",
      width: 120,
      align: "right",
      formatter: ({ quantity, decimalNumber }) => precisionConversion(quantity, decimalNumber)
    },
    {
      prop: "unitName",
      label: "单位",
      width: 90,
      align: "center"
    },
    {
      prop: "inboundTime",
      label: "入库时间",
      width: 160,
      align: "center"
    },
    {
      prop: "supplierName",
      label: "供应商名称",
      width: 160
    },
    {
      prop: "productionTime",
      label: "生产日期",
      width: 160,
      align: "center"
    }
  ]
})
const detailQueryConfig: ITableRequestConfig<
  [LogProductPositionSearchDetailInter],
  IDetailTableRow,
  true
> = {
  api: getLogProductPositionDetailSearch,
  getParams: () => {
    return [
      {
        pageNum: pagination.currentPage,
        pageSize: pagination.pageSize,
        locationId: defaultChecked.value.id,
        ...getFormData()
      }
    ]
  }
}

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

onMounted(() => {
  getTreeData()
  onSubmit()
})

const onSuccess = (locationId: string) => {
  onClickNode({
    name: "location",
    id: locationId
  })
}

const onOpenSaveLocationDetails = (row: IInventoryTableRow) => {
  warehouseData.value = row
  saveLocationDetailsVisible.value = true
}

const getTableList = () => {
  nextTick(() => {
    defaultChecked.value.name == "facility"
      ? inventoryTableRef.value?.requestData()
      : detailTableRef.value?.requestData()
  })
}

const onSubmit = () => {
  pagination.currentPage = 1
  getTableList()
}

const onReset = () => {
  resetForm()
  onSubmit()
}

/** 获取所有仓库和库位树 */
const getTreeData = async () => {
  const res: FmStorageFacilityTree[] = await getLoglistWarehouseTree()
  menuItems.value = [
    {
      label: "所有仓库",
      id: "",
      name: "facility",
      children: res.map((item: any) => ({
        label: item.facilityName,
        id: item.id,
        name: "facility",
        children: (item.locations ?? []).map((innerItem: any) => ({
          label: innerItem.locationName,
          id: innerItem.id,
          name: "location"
        }))
      }))
    }
  ]
}

// 列表树的点击
const onClickNode = (clickRes: any) => {
  console.log("点击树节点", clickRes)
  defaultChecked.value.name = clickRes.name
  defaultChecked.value.id = clickRes.id
  resetForm()
  onSubmit()
}
</script>

<style scoped lang="scss">
.layout-container {
  flex-direction: row;
  background-color: #e2e2e2;
}

.sidebar {
  flex: none;
  width: 292px;
  height: 100%;
  padding: 6px 12px;
  margin-right: 10px;
  background-color: #ffffff;
  overflow-y: auto;

  &:deep(.containerStyle) {
    overflow: hidden;
  }

  &::-webkit-scrollbar {
    display: none;
  }
}

.content {
  width: calc(100% - 292px);
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
  background-color: rgb(230, 247, 255) !important;
}
</style>
