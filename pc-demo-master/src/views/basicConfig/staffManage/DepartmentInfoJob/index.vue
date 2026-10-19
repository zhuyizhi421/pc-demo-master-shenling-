<template>
  <div class="layout-container">
    <div class="layout-tree">
      <CustomTreeMenu
        ref="treeMenuRef"
        class="department-info-job-tree"
        :menuItems="menuItems"
        :show-custom-icon="false"
        :current-node-key="currentDepartmentId"
        virtualize
        @node-click="onTreeNodeClick"
      >
        <template #afterIcon="{ data }" v-if="canEdit">
          <el-button link @click.stop="openCreateDialog(data.id, data.depName)">
            <el-icon>
              <CirclePlus color="var(--tree-right-icon-color)" />
            </el-icon>
          </el-button>
          <template v-if="data.id">
            <el-button link @click.stop="onDeleteDepartment(data.id)">
              <el-icon>
                <CircleClose color="var(--tree-right-icon-color)" />
              </el-icon>
            </el-button>
            <el-button link @click.stop="openDetailDialog(actionMode, data.id)">
              <el-icon>
                <EditPen color="var(--tree-right-icon-color)" />
              </el-icon>
            </el-button>
          </template>
          <span class="w-[8px]"></span>
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
            <el-button v-if="canEdit" type="primary" icon="Plus" @click="openCreateDialog(currentDepartmentId)">
              新建下级部门
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
          <template #operation-default="{ row }">
            <el-button link type="primary" size="small" @click="openDetailDialog(actionMode, row.id)">
              {{ canEdit ? "编辑查看" : "查看详情" }}
            </el-button>
            <el-button
              v-if="canEdit"
              link
              type="danger"
              size="small"
              @click="onDeleteDepartment(row.id)"
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

    <DepartmentInfoDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :department-id="dialogDepartmentId"
      :parent-dep-id="dialogParentDepId"
      :parent-dep-name="dialogParentDepName"
      @success="onDialogSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { queryDepartmentList } from "@/api/department"
import {
  queryDepartmentWorkItemPageList,
  requestDeleteDepartmentWorkItem
} from "@/api/departmentWorkItem"
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
import useButtonAuth, { AuthType } from "@/hooks/useButtonAuth"
import type {
  IDepartmentWorkItem,
  IDepartmentWorkItemPageParams
} from "@/types/base-info/department-work-item"
import type { IDepartmentListItem } from "@/types/base-info/employee"
import { buildDepartmentTree } from "@/utils/transformTree"

import DepartmentInfoDialog from "./components/DepartmentInfoDialog.vue"

defineOptions({
  name: "DepartmentInfoJob"
})

type DepartmentDialogMode = "create" | "edit" | "view"
type DepartmentTreeNode = Partial<IDepartmentListItem> & {
  id: string
  depName: string
  label: string
  children: DepartmentTreeNode[]
}

const ROOT_DEPARTMENT_ID = ""
const ROOT_DEPARTMENT_NAME = "全部部门"

const authType = useButtonAuth("DepartmentInfoJob_update", "DepartmentInfoJob_query")
const canEdit = computed(() => authType.value !== AuthType.View)
const actionMode = computed<DepartmentDialogMode>(() => {
  return canEdit.value ? "edit" : "view"
})

const departmentList = ref<IDepartmentListItem[]>([])
const treeMenuRef = ref<InstanceType<typeof CustomTreeMenu> | null>(null)
const menuItems = ref<DepartmentTreeNode[]>([])
const currentDepartmentId = ref(ROOT_DEPARTMENT_ID)

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "depName",
    label: "部门名称",
    value: "",
    placeholder: "请输入部门名称"
  },
  {
    type: EnumComponentType.Input,
    key: "depCode",
    label: "部门编号",
    value: "",
    placeholder: "请输入部门编号"
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  depName: string
  depCode: string
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<IDepartmentWorkItem[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "depName",
      label: "部门名称",
      minWidth: 180
    },
    {
      prop: "depCode",
      label: "部门编号",
      minWidth: 180
    },
    {
      prop: "parentName",
      label: "上级部门名称",
      minWidth: 180
    },
    {
      prop: "remark",
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
const queryConfig: ITableRequestConfig<[IDepartmentWorkItemPageParams], IDepartmentWorkItem, true> = {
  api: queryDepartmentWorkItemPageList,
  getParams: () => {
    return [
      {
        pageNum: pagination.value.currentPage,
        pageSize: pagination.value.pageSize,
        parentDepId: currentDepartmentId.value || "0",
        ...getFormData()
      }
    ]
  }
}

const dialogVisible = ref(false)
const dialogMode = ref<DepartmentDialogMode>("create")
const dialogDepartmentId = ref("")
const dialogParentDepId = ref<string | null>(null)
const dialogParentDepName = ref(ROOT_DEPARTMENT_NAME)
const dialogRefreshSelectionId = ref(ROOT_DEPARTMENT_ID)

const departmentMap = computed(() => {
  return new Map(departmentList.value.map((item) => [item.id, item]))
})

const tableTitle = computed(() => {
  if (!currentDepartmentId.value) {
    return ROOT_DEPARTMENT_NAME
  }
  return departmentMap.value.get(currentDepartmentId.value)?.depName || ROOT_DEPARTMENT_NAME
})

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

const onTreeNodeClick = async (node: DepartmentTreeNode) => {
  currentDepartmentId.value = node.id || ROOT_DEPARTMENT_ID
  await onSubmit()
}

const openCreateDialog = (parentDepId?: string, parentDepName?: string) => {
  dialogMode.value = "create"
  dialogDepartmentId.value = ""
  dialogParentDepId.value = parentDepId || null
  dialogParentDepName.value = parentDepName || tableTitle.value
  dialogRefreshSelectionId.value = parentDepId || ROOT_DEPARTMENT_ID
  dialogVisible.value = true
}

const openDetailDialog = (mode: DepartmentDialogMode, departmentId: string) => {
  dialogMode.value = mode
  dialogDepartmentId.value = departmentId
  dialogParentDepId.value = null
  dialogParentDepName.value = ROOT_DEPARTMENT_NAME
  dialogRefreshSelectionId.value = currentDepartmentId.value
  dialogVisible.value = true
}

const refreshTreeData = async (preferredSelectionId = currentDepartmentId.value) => {
  const data = await queryDepartmentList({})
  departmentList.value = data
  menuItems.value = [
    {
      id: ROOT_DEPARTMENT_ID,
      depName: ROOT_DEPARTMENT_NAME,
      depCode: "",
      parentDepId: "",
      remark: "",
      label: ROOT_DEPARTMENT_NAME,
      children: buildDepartmentTree(data, null) as DepartmentTreeNode[]
    }
  ]

  currentDepartmentId.value = departmentMap.value.has(preferredSelectionId)
    ? preferredSelectionId
    : ROOT_DEPARTMENT_ID

  await nextTick()
  treeMenuRef.value?.setCurrentKey(currentDepartmentId.value)
}

const refreshTreeAndList = async (preferredSelectionId = currentDepartmentId.value) => {
  await refreshTreeData(preferredSelectionId)
  await customTableRef.value?.requestData()
}

const onDialogSuccess = async () => {
  dialogVisible.value = false
  await refreshTreeAndList(dialogRefreshSelectionId.value)
}

const onDeleteDepartment = async (id: string) => {
  const parentDepId = departmentMap.value.get(id)?.parentDepId || ROOT_DEPARTMENT_ID

  try {
    await ElMessageBox.confirm(
      "删除后若该部门仍存在下级部门或部门员工，将无法删除。确认继续吗？",
      "确认删除",
      {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning"
      }
    )
  } catch {
    return
  }

  await requestDeleteDepartmentWorkItem(id)
  ElMessage.success("删除成功")

  const nextSelectionId = currentDepartmentId.value === id ? parentDepId : currentDepartmentId.value
  await refreshTreeAndList(nextSelectionId)
}

const init = async () => {
  await refreshTreeData(ROOT_DEPARTMENT_ID)
  await customTableRef.value?.requestData()
}

onMounted(() => {
  init()
})
</script>

<style scoped lang="scss">
.department-info-job-tree {
  &:deep(.el-button + .el-button) {
    margin-left: 0;
  }
}

.layout-container {
  flex-direction: row;
  overflow: hidden;

  .layout-tree {
    width: 292px;
    height: 100%;
    padding: 14px 0 0 12px;
    border-right: 1px solid #e8e8e8;
  }

  .layout-main-page {
    flex: 1;
    overflow: hidden;
  }
}

.title-actions {
  display: flex;
  align-items: center;
}
</style>
