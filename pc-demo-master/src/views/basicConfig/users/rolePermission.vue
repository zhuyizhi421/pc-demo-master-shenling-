<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <div class="page-content">
        <div class="custom-table-container">
          <CustomTitle title="角色列表">
            <div v-if="isAuth">
              <el-button type="primary" @click="roleCreateRef?.setVisible(true)" icon="Plus"
                >新建角色</el-button
              >
            </div>
          </CustomTitle>
          <CustomTable
            ref="customTableRef"
            v-model:table-data="customTableData"
            :config="tableConfig"
            :query-config="queryConfig"
            class="custom-table"
            @current-change="handleCurrentChange"
          >
            <template #operation-default="{ row }">
              <div v-if="!isEdit">
                <el-button
                  v-if="row.roleName !== EnumRoleName.ADMIN"
                  type="primary"
                  size="small"
                  link
                  :disabled="selectedRow?.id !== row.id"
                  @click="handleEdit()"
                  >编辑权限
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  link
                  :disabled="selectedRow?.id !== row.id"
                  @click="detailVisible = true"
                  >详情
                </el-button>
                <el-button
                  v-if="![EnumRoleName.ADMIN, EnumRoleName.COMMON].includes(row.roleName)"
                  type="danger"
                  size="small"
                  link
                  :disabled="selectedRow?.id !== row.id"
                  @click="handleDelete(row.id)"
                  >删除</el-button
                >
              </div>
              <div v-else-if="isEdit && selectedRow?.id === row.id">
                <el-tag type="danger" effect="dark">编辑中</el-tag>
              </div>
            </template>
          </CustomTable>
        </div>

        <div class="page-content-tree">
          <TreeMenu
            ref="TreeMenuRef"
            :horizonScroll="true"
            :menuItems="menuItems"
            iconStyle="check"
            :defaultCheckedKeys="defaultCheckedKeys"
            :is-checked="!isEdit"
          />
        </div>
      </div>

      <div v-if="isEdit" class="layout-footer">
        <el-button @click="onCancelClick()">取消</el-button>
        <el-button type="primary" @click="onSubmitClick()">保存</el-button>
      </div>
    </div>

    <!-- 创建角色弹窗 -->
    <RoleCreateDialog ref="roleCreateRef" @on-success="customTableRef?.requestData()" />

    <!-- 详情弹窗 -->
    <RoleDetailDialog
      v-model="detailVisible"
      :isAdmin="selectedRow?.roleName === EnumRoleName.ADMIN"
      :id="selectedRow?.id!"
      v-if="selectedRow?.id"
      @success="customTableRef?.requestData()"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { queryRoleList, queryRoleMenuInfo, requestDeleteRole, requestUpdateRole } from "@/api/role"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import { EnumRoleName } from "@/constant/enums"
import useButtonAuth from "@/hooks/useButtonAuth"
import useUserStore from "@/store/modules/user"
import type {
  IMeneTreeDisplay,
  IRoleUpdateParams,
  IUserRoleInfo as ITableRow
} from "@/types/base-info/user"
import { listToTree } from "@/utils/transformTree"

import TreeMenu from "../../personal/components/TreeMenu.vue"
import RoleCreateDialog from "./components/newRole.vue"
import RoleDetailDialog from "./components/RoleDetailDialog.vue"

defineOptions({
  name: "RolePermission"
})

const useUser = useUserStore()
const isAuth = useButtonAuth("RolePermission_update", "RolePermission_query")

const roleCreateRef = ref<InstanceType<typeof RoleCreateDialog>>()
const TreeMenuRef = ref()

const isEdit = ref(false) // 是否处于编译状态
const menuItems = ref<IMeneTreeDisplay[]>([]) // 初始菜单数据
const defaultCheckedKeys = ref<string[]>([])

const selectedRow = ref<ITableRow>() // 当前选中表格行
const detailVisible = ref(false) // 详情弹窗是否可见

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  highlightCurrentRow: true,
  columns: [
    {
      prop: "roleName",
      label: "角色名称",
      minWidth: 160
    },
    {
      prop: "remark",
      label: "备注",
      minWidth: 160,
      formatter: (row: ITableRow) => {
        return row.remark || "-"
      }
    },
    {
      prop: "operation",
      label: "操作",
      width: 180,
      fixed: "right",
      hidden: !isAuth.value,
      slots: {
        default: "operation-default"
      }
    }
  ]
})

onMounted(async () => {
  await customTableRef.value?.requestData()
  setTimeout(() => {
    setTableSelectFirstRow()
  })
})

const queryConfig: ITableRequestConfig<[], ITableRow, false> = {
  api: queryRoleList
}

/** 获取角色对应菜单权限列表 */
const getRoleMenuList = async () => {
  const { deviceMenuList, permissionList } = await queryRoleMenuInfo(selectedRow.value!.id)
  let checkedArrSummary: string[] = []
  const treeData = Object.entries(deviceMenuList).map(([key, value]) => {
    const { menuTree, checkedArr } = listToTree(value, permissionList)
    checkedArrSummary.push(...checkedArr)
    return {
      label: key,
      id: "",
      checkedStatus: false,
      type: "menu" as const,
      children: menuTree
    }
  })
  defaultCheckedKeys.value = checkedArrSummary
  menuItems.value = treeData
}

/** 表格选中行变化 */
const handleCurrentChange = (row: ITableRow) => {
  // 默认选中第一行数据
  selectedRow.value = row || customTableData.value[0]
  isEdit.value = false
  getRoleMenuList()
}

/** 编辑操作 */
const handleEdit = () => {
  isEdit.value = true
}

/** 删除操作 */
const handleDelete = async (infoId: string) => {
  const confirm = await ElMessageBox.confirm("确认删除吗", "删除操作", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  })
  if (confirm) {
    await requestDeleteRole({ id: infoId })
    ElMessage({
      message: "删除成功",
      type: "success"
    })
    await customTableRef.value?.requestData()
    setTableSelectFirstRow()
  }
}

const deepFind = (arr: any[], menuArr: any[], result: string[]) => {
  arr.forEach((child) => {
    const target = menuArr.find((item) => item.id === child.id)
    if (target && target.type === "menu") {
      result.push(child.menuCode)
    }
    if (Array.isArray(child.children)) {
      deepFind(child.children, menuArr, result)
    }
  })
}

/** 获取当前菜单部分选中的菜单和权限 */
const getSelectedMenuAndPermission = (allArr: any[], halfArr: any[]) => {
  const permissionSet = allArr
    .filter((item) => item.type === "permission")
    .map((item) => item.permissionCode)
  const menuCodeList: IRoleUpdateParams["selectMenuCodes"] = []
  menuItems.value.forEach((item) => {
    const menuList: string[] = []
    deepFind(item.children!, [...allArr, ...halfArr], menuList)

    menuCodeList.push({
      deviceTag: item.label,
      selectMenuCodeList: menuList
    })
  })

  return { menuCodeList, permissionSet }
}

/** 提交修改权限操作 */
const onSubmitClick = async () => {
  const { allCheckedArr, halfCheckedIdsArr } = TreeMenuRef.value.getTreeCheckedNodes()
  const { menuCodeList, permissionSet } = getSelectedMenuAndPermission(
    allCheckedArr,
    halfCheckedIdsArr
  )
  let params = {
    roleId: selectedRow.value!.id,
    selectMenuCodes: menuCodeList,
    selectPermissionCodeList: permissionSet
  }
  await requestUpdateRole(params)
  isEdit.value = false
  ElMessage({
    type: "success",
    message: "保存成功"
  })

  useUser.getUserInfo()
}

/** 取消修改操作 */
const onCancelClick = async () => {
  isEdit.value = false
  getRoleMenuList()
}

/** 设置表格选中第一行数据 */
const setTableSelectFirstRow = () => {
  if (!customTableData.value?.length || !customTableRef.value) {
    return
  }
  customTableRef.value?.setHighLightRow(customTableData.value?.[0]?.id)
}
</script>

<style scoped lang="scss">
.page-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.page-content-tree {
  width: 320px;
  padding-top: 0;
  padding-left: 0;
  padding-right: 0;
  border-left: 1px solid #e8e8e8;
  overflow-y: hidden;
}

.titleTableBox {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &:deep(.el-table) {
    flex: 1;
    margin-bottom: 24px;
  }
}
</style>
