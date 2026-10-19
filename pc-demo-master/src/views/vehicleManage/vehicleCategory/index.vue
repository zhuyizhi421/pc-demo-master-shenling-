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
        class="vehicle-category-tree"
        :menu-items="menuItems"
        :show-custom-icon="false"
        :current-node-key="currentCategoryId"
        label-attr="categoryName"
        children-attr="subDirs"
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
              v-if="canDelete && canEdit"
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

    <CustomDialog v-model="vehicleCategoryModal.show" :title="vehicleCategoryModal.title" size="mini">
      <CustomForm
        v-model="vehicleCategoryModal"
        ref="vehicleCategoryFormRef"
        :configs="vehicleCategoryModalFormConfig"
        :label-width="110"
      />
      <template #footer>
        <el-button @click="vehicleCategoryModal.show = false">取消</el-button>
        <el-button v-if="dialogMode !== 'view'" type="primary" @click="onSubmitVehicleCategoryClick">
          确定
        </el-button>
      </template>
    </CustomDialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  deleteVehicleCategory,
  getVehicleCategorySaveOrUpdate,
  getVehicleCategoryTreeList
} from "@/api/operation/vehicle/vehicleCategory"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType, type ISearchItem } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import CustomTreeMenu from "@/components/CustomTreeMenu/index.vue"
import useButtonAuth, { AuthType, useButtonSingleAuth } from "@/hooks/useButtonAuth"

defineOptions({
  name: "VehicleCategory"
})

type CategoryDialogMode = "create" | "edit" | "view"

const ROOT_CATEGORY_ID = "0"
const ROOT_CATEGORY_NAME = "全部载具分类"

enum EnumVehicleCategoryTitle {
  ADD_ROOT = "新建一级载具分类",
  ADD_CHILD = "新建下级载具分类",
  EDIT = "编辑载具分类",
  VIEW = "查看载具分类"
}

interface IVehicleCategoryTreeNode {
  id: string
  categoryName: string
  categoryNo: string
  parentId: string
  remarks: string
  label?: string
  parentCategoryName?: string
  subDirs?: IVehicleCategoryTreeNode[]
}

const authType = useButtonAuth("VehicleCategory_update", "VehicleCategory_query")
const canEdit = computed(() => authType.value !== AuthType.View)
const canDelete = useButtonSingleAuth("VehicleCategory_delete")
const actionMode = computed<CategoryDialogMode>(() => (canEdit.value ? "edit" : "view"))
const createButtonText = computed(() =>
  currentCategoryId.value === ROOT_CATEGORY_ID ? "新建一级分类" : "新建下级分类"
)

const treeMenuRef = ref<InstanceType<typeof CustomTreeMenu> | null>(null)
const customTableRef = ref<ComponentExposed<typeof CustomTable>>()

const treeKeyword = ref("")
const treeData = ref<IVehicleCategoryTreeNode[]>([])
const currentCategoryId = ref<string>(ROOT_CATEGORY_ID)
const customTableData = ref<IVehicleCategoryTreeNode[]>([])

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
      formatter: (row: IVehicleCategoryTreeNode) => row.parentCategoryName || "-"
    },
    {
      prop: "remarks",
      label: "备注",
      minWidth: 220,
      formatter: (row: IVehicleCategoryTreeNode) => row.remarks || "-"
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

const vehicleCategoryFormRef = ref<InstanceType<typeof CustomForm>>()
const dialogMode = ref<CategoryDialogMode>("create")
const dialogRefreshSelectionId = ref(ROOT_CATEGORY_ID)
const vehicleCategoryModal = ref({
  show: false,
  title: EnumVehicleCategoryTitle.ADD_CHILD,
  id: "",
  categoryName: "",
  categoryNo: "",
  parentId: ROOT_CATEGORY_ID,
  remarks: ""
})

const vehicleCategoryModalFormConfig = computed<ICustomFormConfigItem[]>(() => [
  {
    label: "载具分类名称",
    componentType: "el-input",
    field: "categoryName",
    rules: [{ required: true, message: "请输入载具分类名称", trigger: "blur" }],
    props: {
      placeholder: "请输入",
      disabled: dialogMode.value === "view"
    }
  },
  {
    label: "载具分类编号",
    componentType: "el-input",
    field: "categoryNo",
    props: {
      placeholder: "不填则自动生成",
      disabled:
        dialogMode.value === "view" || vehicleCategoryModal.value.title === EnumVehicleCategoryTitle.EDIT
    }
  },
  {
    label: "备注",
    componentType: "el-input",
    field: "remarks",
    props: {
      type: "textarea",
      maxlength: 200,
      showWordLimit: true,
      placeholder: "请输入",
      disabled: dialogMode.value === "view"
    }
  }
])

const buildCategoryMap = (nodes: IVehicleCategoryTreeNode[]) => {
  const map = new Map<string, IVehicleCategoryTreeNode>()
  const walk = (items: IVehicleCategoryTreeNode[], parentName = ROOT_CATEGORY_NAME) => {
    items.forEach((item) => {
      const current = {
        ...item,
        parentCategoryName: item.parentId && item.parentId !== ROOT_CATEGORY_ID ? parentName : ROOT_CATEGORY_NAME
      }
      map.set(current.id, current)
      if (current.subDirs?.length) {
        walk(current.subDirs, current.categoryName)
      }
    })
  }
  walk(nodes)
  return map
}

const categoryMap = computed(() => buildCategoryMap(treeData.value))

const filteredTreeData = computed(() => {
  const value = treeKeyword.value.trim().toLowerCase()
  if (!value) return treeData.value

  const filterTree = (items: IVehicleCategoryTreeNode[]): IVehicleCategoryTreeNode[] => {
    return items
      .map((item) => {
        const subDirs = filterTree(item.subDirs || [])
        const matched =
          String(item.categoryName || "")
            .toLowerCase()
            .includes(value) ||
          String(item.categoryNo || "")
            .toLowerCase()
            .includes(value)

        if (!matched && !subDirs.length) return null

        return {
          ...item,
          subDirs
        }
      })
      .filter(Boolean) as IVehicleCategoryTreeNode[]
  }

  return filterTree(treeData.value)
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
    subDirs: filteredTreeData.value
  }
])

const tableTitle = computed(() => {
  if (currentCategoryId.value === ROOT_CATEGORY_ID) return ROOT_CATEGORY_NAME
  return categoryMap.value.get(currentCategoryId.value)?.categoryName || ROOT_CATEGORY_NAME
})

const selectedChildren = computed(() => {
  if (currentCategoryId.value === ROOT_CATEGORY_ID) return treeData.value
  return categoryMap.value.get(currentCategoryId.value)?.subDirs || []
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

const flattenTableRow = (item: IVehicleCategoryTreeNode): IVehicleCategoryTreeNode => ({
  ...item,
  subDirs: []
})

const formatTreeData = (items: IVehicleCategoryTreeNode[]): IVehicleCategoryTreeNode[] => {
  return items.map((item) => ({
    ...item,
    id: String(item.id),
    label: item.categoryName,
    subDirs: formatTreeData(item.subDirs || [])
  }))
}

const refreshTableData = () => {
  const { currentPage, pageSize } = pagination.value
  const rows = filteredTableRows.value.map((item) => {
    const current = categoryMap.value.get(item.id) || item
    return flattenTableRow(current)
  })
  pagination.value.total = rows.length
  const startIndex = (currentPage - 1) * pageSize
  customTableData.value = rows.slice(startIndex, startIndex + pageSize)
}

const getTreeData = async () => {
  const res = await getVehicleCategoryTreeList(ROOT_CATEGORY_ID)
  treeData.value = formatTreeData(res?.subDirs || [])
}

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = () => {
  pagination.value.currentPage = 1
  refreshTableData()
}

const onTreeNodeClick = (data: IVehicleCategoryTreeNode) => {
  currentCategoryId.value = String(data.id || ROOT_CATEGORY_ID)
  pagination.value.currentPage = 1
  refreshTableData()
}

const openCategoryDialog = (
  mode: CategoryDialogMode,
  params: {
    title: EnumVehicleCategoryTitle
    id?: string
    categoryName?: string
    categoryNo?: string
    parentId?: string
    remarks?: string
  }
) => {
  dialogMode.value = mode
  vehicleCategoryModal.value = {
    show: true,
    title: params.title,
    id: params.id || "",
    categoryName: params.categoryName || "",
    categoryNo: params.categoryNo || "",
    parentId: params.parentId || ROOT_CATEGORY_ID,
    remarks: params.remarks || ""
  }
}

const openCreateDialog = (parentCategoryId = ROOT_CATEGORY_ID) => {
  dialogRefreshSelectionId.value = parentCategoryId || ROOT_CATEGORY_ID
  openCategoryDialog("create", {
    title:
      (parentCategoryId || ROOT_CATEGORY_ID) === ROOT_CATEGORY_ID
        ? EnumVehicleCategoryTitle.ADD_ROOT
        : EnumVehicleCategoryTitle.ADD_CHILD,
    parentId: parentCategoryId || ROOT_CATEGORY_ID
  })
}

const openDetailDialog = (mode: CategoryDialogMode, categoryId: string) => {
  const target = categoryMap.value.get(String(categoryId))
  if (!target) return

  dialogRefreshSelectionId.value = currentCategoryId.value
  openCategoryDialog(mode, {
    title: mode === "view" ? EnumVehicleCategoryTitle.VIEW : EnumVehicleCategoryTitle.EDIT,
    id: target.id,
    categoryName: target.categoryName,
    categoryNo: target.categoryNo,
    parentId: target.parentId || ROOT_CATEGORY_ID,
    remarks: target.remarks
  })
}

const onDeleteCategory = async (data: IVehicleCategoryTreeNode) => {
  await ElMessageBox.confirm("确定删除该载具分类吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
  await deleteVehicleCategory(String(data.id))
  ElMessage.success("删除成功")
  await getTreeData()
  if (!categoryMap.value.has(currentCategoryId.value)) {
    currentCategoryId.value = ROOT_CATEGORY_ID
  }
  refreshTableData()
  await nextTick()
  treeMenuRef.value?.setCurrentKey(currentCategoryId.value)
}

const onSubmitVehicleCategoryClick = async () => {
  await vehicleCategoryFormRef.value?.validateForm()

  await getVehicleCategorySaveOrUpdate({
    id: dialogMode.value === "edit" ? vehicleCategoryModal.value.id : undefined,
    categoryName: vehicleCategoryModal.value.categoryName,
    categoryNo: vehicleCategoryModal.value.categoryNo || undefined,
    parentId: vehicleCategoryModal.value.parentId,
    remarks: vehicleCategoryModal.value.remarks
  })

  ElMessage.success(dialogMode.value === "edit" ? "编辑成功" : "新建成功")
  vehicleCategoryModal.value.show = false
  await getTreeData()

  currentCategoryId.value =
    dialogMode.value === "edit"
      ? vehicleCategoryModal.value.id
      : dialogRefreshSelectionId.value || ROOT_CATEGORY_ID

  pagination.value.currentPage = 1
  await nextTick()
  treeMenuRef.value?.setCurrentKey(currentCategoryId.value)
  refreshTableData()
}

onMounted(async () => {
  await getTreeData()
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

.vehicle-category-tree {
  height: calc(100% - 44px);
  overflow-y: auto;
}

.tree-search {
  margin-bottom: 12px;
}
</style>
