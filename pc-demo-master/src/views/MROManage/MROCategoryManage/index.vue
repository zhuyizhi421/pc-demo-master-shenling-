<template>
  <div class="layout-container">
    <template v-if="curPageKey === EnumPageType.Main">
    <div class="layout-tree">
      <el-input
        v-model="treeKeyword"
        placeholder="搜索分类名称"
        clearable
        class="tree-search"
      />

      <CustomTreeMenu
        ref="treeMenuRef"
        class="mro-category-tree"
        :menu-items="menuItems"
        :show-custom-icon="false"
        :current-node-key="currentCategoryId"
        virtualize
        @node-click="onTreeNodeClick"
      >
        <template #nodeContent="{ data }">
          <span class="tree-node-name">{{ data.mroCategoryName || data.label }}</span>
        </template>
      </CustomTreeMenu>
    </div>

    <div class="layout-main-page">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      />

      <div class="custom-table-container">
        <CustomTitle :title="tableTitle">
          <div class="title-actions">
            <el-button
              v-if="canEdit"
              type="primary"
              icon="Plus"
              @click="openCreateDialog(currentCategoryId)"
            >
              {{ createButtonText }}
            </el-button>
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
          <template #exceptionHandlePositionList-default="{ row }">
            <span>{{ formatExceptionHandlePositions(row.exceptionHandlePositionList) }}</span>
          </template>
          <template #repairPositionList-default="{ row }">
            <span>{{ formatExceptionHandlePositions(row.repairPositionList) }}</span>
          </template>

          <template #operation-default="{ row }">
            <el-button link type="primary" size="small" @click="openDetailDialog(actionMode, row)">
              {{ canEdit ? "编辑查看" : "查看详情" }}
            </el-button>
            <el-button
              v-if="canDelete"
              link
              type="danger"
              size="small"
              @click="onDeleteCategory(row)"
            >
              删除
            </el-button>
          </template>
        </CustomTable>
      </div>

      <CustomPagination
        v-model:currentPage="pagination.currentPage"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        border
        @change="customTableRef?.requestData()"
      />
    </div>

    <MroCategoryDialog
      v-model="categoryDialogVisible"
      :mode="dialogMode"
      :category-id="dialogCategoryId"
      :parent-category-id="dialogParentCategoryId"
      @success="onDialogSuccess"
    />

    <MroTypeDialog
      v-model="typeDialogVisible"
      :mode="dialogMode"
      :mro-type-id="dialogCategoryId"
      @success="onDialogSuccess"
    />
    </template>

    <div v-else class="layout-child-page">
      <CustomPageCrumbs v-model="curPageKey" :data="pageTree" @change="onPageChange" />
      <MroConfig
        v-if="curPageKey === EnumPageType.InitConfig"
        :mro-model-id="selectedCategoryId"
        @close="closeInitConfig"
        @success="customTableRef?.requestData()"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  queryMroClassifyPageList,
  queryMroClassifyTree,
  requestDeleteMroClassify
} from "@/api/operation/mro/mro-classify"
import { queryMroTypePageList } from "@/api/operation/mro/mro-type"
import CustomPageCrumbs from "@/components/CustomPageCrumbs/index.vue"
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
import useButtonAuth, { AuthType, useButtonSingleAuth } from "@/hooks/useButtonAuth"
import type { IOption } from "@/types/common"
import type {
  IMroClassifyItem,
  IMroClassifyPageListParams,
  IMroClassifyTreeItem
} from "@/types/maintain/mro-manage/mro-classify"

import MroConfig from "../MROModelManage/components/MroConfig/index.vue"
import MroTypeDialog from "../MROTypeManage/components/MroTypeDialog.vue"
import MroCategoryDialog from "./components/MroCategoryDialog.vue"

defineOptions({
  name: "MROCategory"
})

type CategoryDialogMode = "create" | "edit" | "view"
type MroCategoryTreeNode = IMroClassifyTreeItem & {
  label: string
  children: MroCategoryTreeNode[]
}

enum EnumPageType {
  Main,
  InitConfig
}

const ROOT_CATEGORY_ID = ""
const ROOT_CATEGORY_NAME = "全部分类"

const authType = useButtonAuth("MROCategory_update", "MROCategory_query")
const canDelete = useButtonSingleAuth("MROCategory_delete")
const canEdit = computed(() => authType.value !== AuthType.View)
const actionMode = computed<CategoryDialogMode>(() => {
  return canEdit.value ? "edit" : "view"
})

const treeMenuRef = ref<InstanceType<typeof CustomTreeMenu> | null>(null)
const treeKeyword = ref("")
const rawTreeItems = ref<MroCategoryTreeNode[]>([])
const currentCategoryId = ref(ROOT_CATEGORY_ID)
const curPageKey = ref(EnumPageType.Main)
const selectedCategoryId = ref("")
const pageTree = [
  {
    name: "MRO分类",
    key: EnumPageType.Main,
    children: [
      {
        name: "初始化配置",
        key: EnumPageType.InitConfig
      }
    ]
  }
]

const mroTypeOptions = ref<IOption[]>([])
const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "mroCategoryNo",
    label: "MRO分类编号",
    value: "",
    placeholder: "请输入MRO分类编号"
  },
  {
    type: EnumComponentType.Input,
    key: "mroCategoryName",
    label: "MRO分类名称",
    value: "",
    placeholder: "请输入MRO分类名称"
  },
  {
    type: EnumComponentType.Select,
    key: "mroTypeId",
    label: "MRO类型",
    value: "",
    placeholder: "请选择MRO类型",
    filterable: true,
    options: mroTypeOptions
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  mroCategoryNo: string
  mroCategoryName: string
  mroTypeId: string
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<IMroClassifyItem[]>([])
const tableConfig = computed<ITableConfig>(() => {
  const columns: ITableConfig["columns"] = [
    {
      prop: "mroCategoryNo",
      label: "MRO分类编号",
      minWidth: 180
    },
    {
      prop: "mroCategoryName",
      label: "MRO分类名称",
      minWidth: 180
    },
    {
      prop: "parentName",
      label: "上级分类",
      minWidth: 180,
      formatter: (row: IMroClassifyItem) => row.parentName || "-"
    },
    {
      prop: "verifyAdvanceDays",
      label: "MRO校验工单提前生成天数",
      minWidth: 200,
      formatter: (row: IMroClassifyItem) => row.verifyAdvanceDays ?? "-"
    },
    {
      prop: "maintenanceAdvanceDays",
      label: "MRO保养工单提前生成天数",
      minWidth: 200,
      formatter: (row: IMroClassifyItem) => row.maintenanceAdvanceDays ?? "-"
    },
    {
      prop: "repairProcessName",
      label: "MRO维修流程",
      minWidth: 180,
      formatter: (row: IMroClassifyItem) => row.repairProcessName || "-"
    },
    {
      prop: "scrapProcessName",
      label: "MRO报废流程",
      minWidth: 180,
      formatter: (row: IMroClassifyItem) => row.scrapProcessName || "-"
    },
    {
      prop: "exceptionHandlePositionList",
      label: "异常处理职位",
      minWidth: 320,
      slots: {
        default: "exceptionHandlePositionList-default"
      }
    },
    {
      prop: "repairPositionList",
      label: "维修职位",
      minWidth: 320,
      slots: {
        default: "repairPositionList-default"
      }
    },
    {
      prop: "remark",
      label: "备注",
      minWidth: 220,
      formatter: (row: IMroClassifyItem) => row.remark || "-"
    }
  ]

  return {
    height: "100%",
    columns: [
      ...columns,
      {
        prop: "operation",
        label: "操作",
        width: 160,
        fixed: "right",
        slots: {
          default: "operation-default"
        }
      }
    ]
  }
})
const queryConfig: ITableRequestConfig<[IMroClassifyPageListParams], IMroClassifyItem, true> = {
  api: queryMroClassifyPageList,
  getParams: () => {
    return [
      {
        pageQuery: {
          pageNum: pagination.value.currentPage,
          pageSize: pagination.value.pageSize
        },
        queryParam: {
          parentId: currentCategoryId.value || "0",
          ...getFormData()
        }
      }
    ]
  }
}

const categoryDialogVisible = ref(false)
const typeDialogVisible = ref(false)
const dialogMode = ref<CategoryDialogMode>("create")
const dialogCategoryId = ref("")
const dialogParentCategoryId = ref("")
const dialogRefreshSelectionId = ref(ROOT_CATEGORY_ID)

const categoryMap = computed(() => {
  const map = new Map<string, MroCategoryTreeNode>()
  const walk = (nodes: MroCategoryTreeNode[]) => {
    nodes.forEach((item) => {
      map.set(item.id, item)
      if (item.children?.length) {
        walk(item.children)
      }
    })
  }
  walk(rawTreeItems.value)
  return map
})

const filteredTreeItems = computed(() => {
  const keyword = treeKeyword.value.trim().toLowerCase()
  if (!keyword) return rawTreeItems.value

  const filterTree = (nodes: MroCategoryTreeNode[]): MroCategoryTreeNode[] => {
    return nodes
      .map((item) => {
        const children = filterTree(item.children || [])
        const matched =
          String(item.mroCategoryName || "")
            .toLowerCase()
            .includes(keyword) ||
          String(item.mroCategoryNo || "")
            .toLowerCase()
            .includes(keyword)
        if (!matched && !children.length) return null
        return {
          ...item,
          children
        }
      })
      .filter(Boolean) as MroCategoryTreeNode[]
  }

  return filterTree(rawTreeItems.value)
})

const menuItems = computed(() => {
  return [
    {
      id: ROOT_CATEGORY_ID,
      label: ROOT_CATEGORY_NAME,
      mroCategoryName: ROOT_CATEGORY_NAME,
      mroCategoryNo: "",
      mroTypeId: "",
      mroTypeNo: "",
      mroTypeName: "",
      parentId: "0",
      parentName: "",
      remark: "",
      createBy: "",
      createTime: "",
      updateBy: "",
      updateTime: "",
      children: filteredTreeItems.value
    }
  ]
})

const tableTitle = computed(() => {
  if (!currentCategoryId.value) return ROOT_CATEGORY_NAME
  return categoryMap.value.get(currentCategoryId.value)?.mroCategoryName || ROOT_CATEGORY_NAME
})

const createButtonText = computed(() => {
  return currentCategoryId.value ? "新建下级分类" : "新建一级类型"
})

const formatExceptionHandlePositions = (rows: IMroClassifyItem["exceptionHandlePositionList"] = []) => {
  return rows?.length ? rows.map((item) => `${item.depName}-${item.positionName}`).join("；") : "-"
}

const isTypeNode = (row?: Partial<IMroClassifyItem> | null) => {
  if (!row) return false
  return Number(row.level || 0) === 1 || row.nodeType === "type" || String(row.parentId || "0") === "0"
}

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

const onTreeNodeClick = async (node: MroCategoryTreeNode) => {
  currentCategoryId.value = node.id || ROOT_CATEGORY_ID
  await onSubmit()
}

const openCreateDialog = (parentCategoryId = ROOT_CATEGORY_ID) => {
  dialogMode.value = "create"
  dialogCategoryId.value = ""
  dialogParentCategoryId.value = parentCategoryId
  dialogRefreshSelectionId.value = parentCategoryId || ROOT_CATEGORY_ID

  if (!parentCategoryId) {
    typeDialogVisible.value = true
    return
  }

  categoryDialogVisible.value = true
}

const openDetailDialog = (mode: CategoryDialogMode, row: IMroClassifyItem) => {
  dialogMode.value = mode
  dialogCategoryId.value = row.id
  dialogParentCategoryId.value = ""
  dialogRefreshSelectionId.value = currentCategoryId.value

  if (isTypeNode(row)) {
    typeDialogVisible.value = true
    return
  }

  categoryDialogVisible.value = true
}

const openInitConfig = (row: IMroClassifyItem) => {
  selectedCategoryId.value = String(row.id || "")
  curPageKey.value = EnumPageType.InitConfig
}

const closeInitConfig = () => {
  selectedCategoryId.value = ""
  curPageKey.value = EnumPageType.Main
}

const onPageChange = (page: number) => {
  if (page === EnumPageType.Main) {
    closeInitConfig()
  }
}

const refreshTypeOptions = async () => {
  const data = await queryMroTypePageList({
    pageQuery: {
      pageNum: 1,
      pageSize: 999
    },
    queryParam: {}
  })
  mroTypeOptions.value = data.records.map((item) => ({
    label: item.mroTypeName,
    value: item.id
  }))
}

const normalizeTreeItem = (item: IMroClassifyTreeItem): MroCategoryTreeNode => {
  return {
    ...item,
    label: item.mroCategoryName,
    children: (item.children || []).map(normalizeTreeItem)
  }
}

const refreshTreeData = async (preferredSelectionId = currentCategoryId.value) => {
  const data = await queryMroClassifyTree()
  rawTreeItems.value = data.map(normalizeTreeItem)

  currentCategoryId.value = preferredSelectionId && categoryMap.value.has(preferredSelectionId)
    ? preferredSelectionId
    : ROOT_CATEGORY_ID

  await nextTick()
  treeMenuRef.value?.setCurrentKey(currentCategoryId.value)
}

const refreshTreeAndList = async (preferredSelectionId = currentCategoryId.value) => {
  await refreshTreeData(preferredSelectionId)
  await customTableRef.value?.requestData()
}

const onDialogSuccess = async () => {
  categoryDialogVisible.value = false
  typeDialogVisible.value = false
  await refreshTypeOptions()
  await refreshTreeAndList(dialogRefreshSelectionId.value)
}

const onDeleteCategory = async (row: IMroClassifyItem) => {
  const rowName = row.mroCategoryName || row.mroTypeName || ""
  try {
    await ElMessageBox.confirm(`确认删除【${rowName}】吗？`, "确认删除", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning"
    })
  } catch {
    return
  }

  await requestDeleteMroClassify({ id: row.id })
  ElMessage.success("删除成功")
  await refreshTreeAndList(currentCategoryId.value)
}

const init = async () => {
  await Promise.all([refreshTypeOptions(), refreshTreeData(ROOT_CATEGORY_ID)])
  await customTableRef.value?.requestData()
}

onMounted(() => {
  init()
})
</script>

<style scoped lang="scss">
.layout-container {
  flex-direction: row;
  overflow: hidden;

  .layout-tree {
    width: 292px;
    height: 100%;
    padding: 14px 8px 0;
    border-right: 1px solid #e8e8e8;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .layout-main-page {
    flex: 1;
    overflow: hidden;
  }
}

.layout-child-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tree-search {
  flex-shrink: 0;
}

.mro-category-tree {
  flex: 1;
  min-height: 0;
}

.tree-node-name {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.title-actions {
  display: flex;
  gap: 12px;
}
</style>
