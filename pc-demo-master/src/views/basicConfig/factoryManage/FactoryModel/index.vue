<!-- 基础配置-工厂建模 -->
<template>
  <div class="layout-container">
    <div class="layout-tree">
      <CustomTreeMenu
        ref="treeMenuRef"
        :menu-items="menuItems"
        label-attr="entityName"
        nodeKey="entityId"
        @node-click="onTreeNodeClick($event, true)"
        :show-custom-icon="false"
        virtualize
      >
        <template #afterIcon="{ node }">
          <div class="pr-[6px]">
            <div class="level-name" v-if="node.data.levelTag">
              {{ node.data.levelTag }}
            </div>
          </div>
        </template>
      </CustomTreeMenu>
    </div>

    <div class="layout-main-page">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="下级列表">
          <div v-if="isAuth">
            <el-dropdown v-if="childrenTypes.length" popper-class="factoryModel-dropdown">
              <el-button type="primary">
                新建下级单位
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <template v-for="item in childrenTypes" :key="item.id">
                    <el-dropdown-item @click="onCreateSubsClick(item)">
                      <el-button link type="primary">{{ item.tagName }}</el-button>
                    </el-dropdown-item>
                  </template>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </CustomTitle>
        <CustomTable
          ref="customTableRef"
          v-model:table-data="customTableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
          class="custom-table"
        >
          <template #isEnable-default="{ row }">
            <el-tag link :type="row.isEnable ? 'success' : 'danger'">{{
              row.isEnable ? "开启" : "停用"
            }}</el-tag>
          </template>

          <template #operation-default="{ row }">
            <el-button link type="primary" size="small" @click="onEditClick(row)">{{
              isAuth ? "编辑" : "查看"
            }}</el-button>
            <el-button
              v-if="isAuth"
              link
              type="primary"
              @click="onSwitchStatusClick(row)"
              size="small"
              >{{ row.isEnable ? "停用" : "启用" }}</el-button
            >
            <el-button link type="primary" size="small" @click="onViewDeviceClick(row)"
              >设备</el-button
            >
            <el-button v-if="isAuth" @click="onDeleteClick(row)" link type="danger" size="small"
              >删除</el-button
            >
          </template>
        </CustomTable>
      </div>

      <CustomPagination
        v-model:currentPage="pagination.currentPage"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        border
        @change="onTreeNodeClick(selectedTreeData)"
      />
    </div>

    <!-- 新建/编辑 没有存储/检验权限 的区域时 -->
    <UpdateOtherDialog
      v-model="showProductionOrOtherDialog"
      :currentChildType="currentChildType"
      :tagName="tagName"
      :type="operationType"
      :info="currentHandleRow"
      :parent-id="selectedTreeId"
      :isReadonly="!isAuth"
      @success="getModelTreeList()"
    />

    <!-- 新建/编辑 有存储权限 的区域时 -->
    <UpdateStorageDialog
      v-model="showStorageDialog"
      :currentChildType="currentChildType"
      :type="operationType"
      :tagName="tagName"
      :id="selectedRowId"
      :parent-id="selectedTreeId"
      :isReadonly="!isAuth"
      @success="getModelTreeList()"
    />

    <!-- 新建/编辑 有检验权限 的区域时 -->
    <UpdateInspectDialog
      v-model="showInspectionDialog"
      :currentChildType="currentChildType"
      :id="selectedRowId"
      :tagName="tagName"
      :type="operationType"
      :info="currentHandleRow"
      :parent-id="selectedTreeId"
      :isReadonly="!isAuth"
      @success="getModelTreeList()"
    />

    <!-- 新建/编辑查看库位弹窗 -->
    <UpdateLocationDialog
      v-model="showLocationDialog"
      :currentChildType="currentChildType"
      :type="operationType"
      :tagName="tagName"
      :id="selectedRowId"
      :parent-id="selectedTreeId"
      :isReadonly="!isAuth"
      @success="getModelTreeList()"
    />

    <!-- 编辑、查看设备弹窗 -->
    <UpdateDeviceDialog
      v-model="unitUpdateVisible"
      :id="selectedRowId"
      :parent-id="selectedTreeId"
      :type="operationType"
      :is-storage="!!selectedTreeData?.propertyVO?.isStorage"
      :isReadonly="!isAuth"
      @success="getModelTreeList()"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  queryFactoryModelPageList,
  queryFactoryModelTree,
  requestDeleteFactoryModel,
  requestDisableFactoryModel,
  requestEnableFactoryModel,
  requestFactoryModelChildAuth
} from "@/api/fm"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType, type ISearchItem } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import CustomTreeMenu from "@/components/CustomTreeMenu/index.vue"
import { EnumOperationType } from "@/constant/enums"
import useButtonAuth from "@/hooks/useButtonAuth"
import type {
  IFactoryListItem as ITableRow,
  IFactoryModelTreeNode,
  IFactoryPageParams,
  IFactoryUnderClasses
} from "@/types/base-info/factory-model"

import UpdateDeviceDialog from "./components/UpdateDeviceDialog.vue"
import UpdateInspectDialog from "./components/UpdateInspectDialog.vue"
import UpdateLocationDialog from "./components/UpdateLocationDialog.vue"
import UpdateOtherDialog from "./components/UpdateOtherDialog.vue"
import UpdateStorageDialog from "./components/UpdateStorageDialog.vue"

defineOptions({
  name: "FactoryModel"
})

// 仓库，库位，实验室，其他,生产单位
const isAuth = useButtonAuth("FactoryModel_update", "FactoryModel_query")

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "name",
    label: "名称",
    value: "",
    placeholder: "请输入名称"
  },
  {
    type: EnumComponentType.Input,
    key: "code",
    label: "编号",
    value: "",
    placeholder: "请输入编号"
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  name: string
  code: string
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const treeMenuRef = ref<typeof CustomTreeMenu>()
const menuItems = ref<IFactoryModelTreeNode[]>([])
const selectedTreeData = ref<IFactoryModelTreeNode | undefined>(undefined) // 选中树节点数据

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "entityName",
      label: "名称",
      minWidth: 160
    },
    {
      prop: "levelTag",
      label: "类型",
      minWidth: 160
    },
    {
      prop: "entityCode",
      label: "编号",
      minWidth: 160
    },
    {
      prop: "parentName",
      label: "上级名称",
      minWidth: 160
    },
    {
      prop: "parentCode",
      label: "上级编号",
      minWidth: 160
    },
    {
      prop: "isEnable",
      label: "状态",
      width: 120,
      align: "center",
      slots: {
        default: "isEnable-default"
      }
    },
    {
      prop: "operation",
      label: "操作",
      width: 190,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IFactoryPageParams], ITableRow, true> = {
  api: queryFactoryModelPageList,
  getParams: () => {
    return [
      {
        pageQuery: {
          pageNum: pagination.value.currentPage,
          pageSize: pagination.value.pageSize
        },
        queryParam: {
          parentId: selectedTreeId.value,
          ...getFormData()
        }
      }
    ]
  }
}

const selectedTreeId = computed(() => {
  let id = selectedTreeData.value?.entityId
  return !id || id === "0" ? "" : id
})

const selectedRowId = ref("") // 选中表格行的id
const operationType = ref(EnumOperationType.Create)
const unitUpdateVisible = ref(false)

const childrenTypes = ref<IFactoryUnderClasses[]>([])
const currentChildType = ref<IFactoryUnderClasses>()
const currentHandleRow = ref<ITableRow>()
const showInspectionDialog = ref(false)
const showStorageDialog = ref(false)
const showProductionOrOtherDialog = ref(false)
const showLocationDialog = ref(false)

const tagName = computed(() => {
  if (operationType.value === EnumOperationType.Create) {
    return currentChildType.value?.tagName || ""
  }
  return currentHandleRow.value?.levelTag || ""
})

onMounted(async () => {
  getModelTreeList()
})

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

/** 获取菜单树数据 */
const getModelTreeList = async () => {
  const res = await queryFactoryModelTree({ containLastLevel: false })
  const list = [
    {
      entityCode: "0",
      entityId: "0",
      entityName: "工厂建模",
      levelTag: "",
      parentId: "",
      children: res,
      propertyVO: {
        isInspection: 0,
        isProduction: 0,
        isStorage: 0,
        isStorageLocation: 0,
        levelTag: ""
      }
    }
  ]
  menuItems.value = list

  // 重新高亮当前选中的菜单
  setTimeout(() => {
    if (!selectedTreeId.value || selectedTreeId.value === "0") {
      selectedTreeData.value = list[0]
    }

    treeMenuRef.value?.getTreeRef()?.setCurrentKey(selectedTreeId.value || "0", true)
    onTreeNodeClick(selectedTreeData.value)
  }, 50)
}

/** 点击菜单树节点 */
const onTreeNodeClick = async (data?: IFactoryModelTreeNode, isFlush: boolean = false) => {
  if (isFlush) {
    resetForm()
    pagination.value.currentPage = 1
  }
  if (data) {
    selectedTreeData.value = data
  }
  await getFactoryChildTypes()
  await customTableRef.value?.requestData()
}

/** 获取工厂建模层级下可创建的区域类型列表 */
const getFactoryChildTypes = async () => {
  try {
    const data = await requestFactoryModelChildAuth(selectedTreeId.value)
    childrenTypes.value = data
  } catch (e) {
    // console.log(e)
    childrenTypes.value = []
  }
}

/** 点击新建下级 */
const onCreateSubsClick = (item: IFactoryUnderClasses) => {
  currentChildType.value = item
  operationType.value = EnumOperationType.Create
  openRightDialog({
    inspectionPermit: !!item.inspectionPermit,
    storagePermit: !!item.storagePermit,
    locationPermit: !!item.locationPermit,
    productionPermit: !!item.productionPermit
  })
}

/** 打开对应的操作弹窗 */
const openRightDialog = (data: {
  inspectionPermit: boolean
  storagePermit: boolean
  locationPermit: boolean
  productionPermit: boolean
}) => {
  const { inspectionPermit, storagePermit, locationPermit } = data
  if (inspectionPermit) {
    showInspectionDialog.value = true
  } else if (storagePermit) {
    showStorageDialog.value = true
  } else if (locationPermit) {
    showLocationDialog.value = true
  } else {
    console.log("onCreateSubsClick::")
    // 生产类型和其他类型共用一种弹窗，以后可能会有区别
    showProductionOrOtherDialog.value = true
  }
}

/** 编辑查看设备 */
const onViewDeviceClick = (row: ITableRow) => {
  unitUpdateVisible.value = true
  selectedRowId.value = row.id
  operationType.value = EnumOperationType.Update
}

/**
 * 编辑、查看
 */
const onEditClick = (row: ITableRow) => {
  currentHandleRow.value = row
  selectedRowId.value = row.id
  operationType.value = isAuth.value ? EnumOperationType.Update : EnumOperationType.Review

  openRightDialog({
    inspectionPermit: row.isInspection,
    storagePermit: row.isStorage,
    locationPermit: row.isStorageLocation,
    productionPermit: row.isProduction
  })
}

/**
 * 启用、停用状态切换
 */
const onSwitchStatusClick = async (row: ITableRow) => {
  let statusText = row.isEnable ? "停用" : "启用"
  await ElMessageBox.confirm(`此操作将${statusText}该单位, 是否继续?`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
  let fn = row.isEnable ? requestDisableFactoryModel : requestEnableFactoryModel
  await fn(row.id)
  ElMessage.success(`${statusText}成功`)
  getModelTreeList()
}

/**
 * 删除
 */
const onDeleteClick = async (row: ITableRow) => {
  await ElMessageBox.confirm(`此操作将删除该条数据, 是否继续?`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
  await requestDeleteFactoryModel(row.id)
  ElMessage.success("删除成功")
  getModelTreeList()
}
</script>

<style lang="scss" scoped>
.layout-container {
  flex-direction: row;
  overflow: hidden;

  .layout-tree {
    width: 292px;
    height: 100%;
    padding: 14px 8px 0 8px;
    border-right: 1px solid #e8e8e8;
  }
  .layout-main-page {
    flex: 1;
    overflow: hidden;
  }
}

.level-name {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border-radius: 4px;
  color: #aaa;
  border: 1px solid #aaa;
  padding: 0 4px;
}
</style>
