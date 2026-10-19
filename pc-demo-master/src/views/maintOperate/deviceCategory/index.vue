<template>
  <div class="layout-container">
    <div class="layout-tree">
      <el-input
        v-model="treeKeyword"
        placeholder="搜索分类名称"
        clearable
        class="tree-search"
      />

      <CustomTreeMenu
        ref="treeMenuRef"
        class="device-category-tree"
        :menu-items="menuItems"
        :show-custom-icon="false"
        :current-node-key="currentCategoryId"
        virtualize
        @node-click="onTreeNodeClick"
      >
        <template #nodeContent="{ data }">
          <span class="tree-node-name">{{ data.categoryName || data.label }}</span>
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
          :config="tableConfig"
          class="custom-table"
        >
          <template #operation-default="{ row }">
            <el-button link type="primary" size="small" @click="openDetailDialog(actionMode, row.id)">
              {{ canEdit ? "编辑" : "查看详情" }}
            </el-button>
            <el-button
              v-if="canEdit"
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
        @change="refreshTableData"
      />
    </div>

    <DeviceCategoryCreate
      v-model="dialogVisible"
      :id="dialogTargetId"
      :is-update="dialogMode === 'edit'"
      :just-see="dialogMode === 'view'"
      @success="onDialogSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  requestDeleteDeviceCategory,
  requestDeviceCategoryTree
} from "@/api/operation/equipment/equipment-category"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType, type ISearchItem } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import CustomTreeMenu from "@/components/CustomTreeMenu/index.vue"
import useButtonAuth, { AuthType } from "@/hooks/useButtonAuth"
import type { IDeviceCateHierarchyTreeRes } from "@/types/maintain/equipment-manage/equipment-category"

import DeviceCategoryCreate from "../deviceCateManage/components/DeviceCategoryCreate.vue"

defineOptions({
  name: "DeviceClassify"
})

type CategoryDialogMode = "create" | "edit" | "view"
type DeviceCategoryTreeNode = IDeviceCateHierarchyTreeRes & {
  label: string
  children: DeviceCategoryTreeNode[]
}

const ROOT_CATEGORY_ID = "0"
const ROOT_CATEGORY_NAME = "全部设备分类"

const authType = useButtonAuth("DeviceCategory_update", "DeviceCategory_query")
const canEdit = computed(() => authType.value !== AuthType.View)
const actionMode = computed<CategoryDialogMode>(() => (canEdit.value ? "edit" : "view"))
const createButtonText = computed(() =>
  currentCategoryId.value === ROOT_CATEGORY_ID ? "新建一级分类" : "新建下级分类"
)

const treeMenuRef = ref<InstanceType<typeof CustomTreeMenu> | null>(null)
const customTableRef = ref<ComponentExposed<typeof CustomTable>>()

const treeKeyword = ref("")
const rawTreeItems = ref<DeviceCategoryTreeNode[]>([])
const currentCategoryId = ref(ROOT_CATEGORY_ID)
const customTableData = ref<DeviceCategoryTreeNode[]>([])

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "categoryNo",
    label: "分类编号",
    value: "",
    placeholder: "请输入分类编号"
  },
  {
    type: EnumComponentType.Input,
    key: "categoryName",
    label: "分类名称",
    value: "",
    placeholder: "请输入分类名称"
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  categoryNo: string
  categoryName: string
}>(searchFormData.value)

const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "categoryNo",
      label: "分类编号",
      minWidth: 180
    },
    {
      prop: "categoryName",
      label: "分类名称",
      minWidth: 180
    },
    {
      prop: "parentCategoryName",
      label: "上级分类",
      minWidth: 180,
      formatter: (row: DeviceCategoryTreeNode) => row.parentCategoryName || "-"
    },
    {
      prop: "remarks",
      label: "备注",
      minWidth: 220
    },
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
})

const dialogVisible = ref(false)
const dialogMode = ref<CategoryDialogMode>("create")
const dialogTargetId = ref(ROOT_CATEGORY_ID)
const dialogRefreshSelectionId = ref(ROOT_CATEGORY_ID)

const categoryMap = computed(() => {
  const map = new Map<string, DeviceCategoryTreeNode>()
  const walk = (nodes: DeviceCategoryTreeNode[]) => {
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

  const filterTree = (nodes: DeviceCategoryTreeNode[]): DeviceCategoryTreeNode[] => {
    return nodes
      .map((item) => {
        const children = filterTree(item.children || [])
        const matched =
          String(item.categoryName || "")
            .toLowerCase()
            .includes(keyword) ||
          String(item.categoryNo || "")
            .toLowerCase()
            .includes(keyword)
        if (!matched && !children.length) return null
        return {
          ...item,
          children
        }
      })
      .filter(Boolean) as DeviceCategoryTreeNode[]
  }

  return filterTree(rawTreeItems.value)
})

const menuItems = computed(() => [
  {
    id: ROOT_CATEGORY_ID,
    label: ROOT_CATEGORY_NAME,
    categoryName: ROOT_CATEGORY_NAME,
    categoryNo: "",
    parentCategoryName: "",
    parentId: "",
    remarks: "",
    record: [],
    subDirs: filteredTreeItems.value,
    children: filteredTreeItems.value
  }
])

const tableTitle = computed(() => {
  if (currentCategoryId.value === ROOT_CATEGORY_ID) return ROOT_CATEGORY_NAME
  return categoryMap.value.get(currentCategoryId.value)?.categoryName || ROOT_CATEGORY_NAME
})

const selectedChildren = computed(() => {
  if (currentCategoryId.value === ROOT_CATEGORY_ID) return rawTreeItems.value
  return categoryMap.value.get(currentCategoryId.value)?.children || []
})

const filteredTableRows = computed(() => {
  const { categoryNo, categoryName } = getFormData()
  const noKeyword = String(categoryNo || "").trim().toLowerCase()
  const nameKeyword = String(categoryName || "").trim().toLowerCase()

  return selectedChildren.value.filter((item) => {
    const matchNo = !noKeyword || String(item.categoryNo || "").toLowerCase().includes(noKeyword)
    const matchName =
      !nameKeyword || String(item.categoryName || "").toLowerCase().includes(nameKeyword)
    return matchNo && matchName
  })
})

const flattenTableRow = (item: DeviceCategoryTreeNode): DeviceCategoryTreeNode => ({
  ...item,
  children: [],
  subDirs: []
})

const normalizeTreeItem = (item: IDeviceCateHierarchyTreeRes): DeviceCategoryTreeNode => ({
  ...item,
  id: String(item.id),
  label: item.categoryName || "",
  children: (item.subDirs || []).map(normalizeTreeItem)
})

const refreshTableData = () => {
  const { currentPage, pageSize } = pagination.value
  const rows = filteredTableRows.value.map(flattenTableRow)
  pagination.value.total = rows.length
  const startIndex = (currentPage - 1) * pageSize
  customTableData.value = rows.slice(startIndex, startIndex + pageSize)
}

const getCategoryTreeData = async () => {
  const res = await requestDeviceCategoryTree()
  rawTreeItems.value = (res?.subDirs || []).map(normalizeTreeItem)
}

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = () => {
  pagination.value.currentPage = 1
  refreshTableData()
}

const onTreeNodeClick = (node: DeviceCategoryTreeNode) => {
  currentCategoryId.value = node.id || ROOT_CATEGORY_ID
  pagination.value.currentPage = 1
  refreshTableData()
}

const openCreateDialog = (parentCategoryId = ROOT_CATEGORY_ID) => {
  dialogMode.value = "create"
  dialogTargetId.value = parentCategoryId || ROOT_CATEGORY_ID
  dialogRefreshSelectionId.value = parentCategoryId || ROOT_CATEGORY_ID
  dialogVisible.value = true
}

const openDetailDialog = (mode: CategoryDialogMode, categoryId: string) => {
  dialogMode.value = mode
  dialogTargetId.value = categoryId
  dialogRefreshSelectionId.value = currentCategoryId.value
  dialogVisible.value = true
}

const onDeleteCategory = async (row: DeviceCategoryTreeNode) => {
  await ElMessageBox.confirm("确定删除该分类吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
  await requestDeleteDeviceCategory(row.id)
  ElMessage.success("删除成功")
  await getCategoryTreeData()
  if (!categoryMap.value.has(currentCategoryId.value)) {
    currentCategoryId.value = ROOT_CATEGORY_ID
  }
  refreshTableData()
}

const onDialogSuccess = async () => {
  await getCategoryTreeData()
  currentCategoryId.value = dialogRefreshSelectionId.value || ROOT_CATEGORY_ID
  pagination.value.currentPage = 1
  await nextTick()
  treeMenuRef.value?.setCurrentKey(currentCategoryId.value)
  refreshTableData()
}

onMounted(async () => {
  await getCategoryTreeData()
  await nextTick()
  treeMenuRef.value?.setCurrentKey(ROOT_CATEGORY_ID)
  refreshTableData()
})
</script>

<style scoped lang="scss">
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

.device-category-tree {
  height: calc(100% - 44px);
  overflow-y: auto;
}

.tree-search {
  margin-bottom: 12px;
}
</style>
