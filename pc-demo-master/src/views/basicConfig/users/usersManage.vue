<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="用户列表">
          <div v-if="isAuth">
            <el-button type="primary" @click="onAddUserClick()" icon="Plus">新建用户</el-button>
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
            <el-button link type="primary" size="small" @click="onEditAndReview(row)">
              编辑查看
            </el-button>
            <el-button link type="danger" size="small" @click="onDeleteClick(row.id)">
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

    <!-- 新建用户弹窗 -->
    <UserCreateDialog ref="userCreateRef" @on-submit="customTableRef?.requestData()" />

    <!-- 编辑查看用户弹窗 -->
    <UserUpdateDialog ref="userUpdateRef" @on-submit="customTableRef?.requestData()" />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { queryUserInfoList, requestDeleteUser } from "@/api/user"
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
import useButtonAuth from "@/hooks/useButtonAuth"
import type { IUserInfoListItem as ITableRow, IUserInfoListParams } from "@/types/base-info/user"

import UserCreateDialog from "./components/newUserHandle.vue"
import UserUpdateDialog from "./UserInfo.vue"

defineOptions({
  name: "UsersManage"
})

const isAuth = useButtonAuth("UsersManage_update", "UsersManage_query")

const userCreateRef = ref<InstanceType<typeof UserCreateDialog>>()
const userUpdateRef = ref<InstanceType<typeof UserUpdateDialog>>()

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "username",
    label: "用户账号",
    value: "",
    placeholder: "请输入用户账号"
  },
  {
    type: EnumComponentType.Input,
    key: "empNo",
    label: "关联员工编号",
    value: "",
    placeholder: "请输入关联员工编号"
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  username: string
  empNo: string
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "nickname",
      label: "用户名",
      minWidth: 160
    },
    {
      prop: "username",
      label: "用户账号",
      minWidth: 160
    },
    {
      prop: "role",
      label: "用户角色",
      minWidth: 160,
      formatter: (row: ITableRow) => {
        return row.roleList.map((item) => item.roleName).join(",")
      }
    },
    {
      prop: "empNo",
      label: "关联员工编号",
      minWidth: 160
    },
    {
      prop: "empName",
      label: "关联员工姓名",
      minWidth: 160
    },
    {
      prop: "operation",
      label: "操作",
      width: 130,
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
})

/** 新建用户操作 */
const onAddUserClick = () => {
  userCreateRef.value?.setVisible(true)
}

/** 编辑查看操作 */
const onEditAndReview = (row: ITableRow) => {
  userUpdateRef.value?.setVisible(true, {
    ...row,
    roleId: row.roleList.map((item) => item.roleCode)
  })
}

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

const queryConfig: ITableRequestConfig<[IUserInfoListParams], ITableRow, true> = {
  api: queryUserInfoList,
  getParams: () => {
    return [
      {
        pageNum: pagination.value.currentPage,
        pageSize: pagination.value.pageSize,
        ...getFormData()
      }
    ]
  }
}

/** 删除用户操作 */
const onDeleteClick = async (infoId: string) => {
  const confirm = await ElMessageBox.confirm("确认删除吗？", "删除操作", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  })
  if (confirm === "confirm") {
    await requestDeleteUser({ id: infoId })
    ElMessage.success("删除成功")
    await customTableRef.value?.requestData()
  }
}
</script>

<style scoped lang="scss">
.fContainer {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.titleTableBox {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &:deep(.el-table) {
    flex: 1;
    margin-bottom: 16px;
  }
}
</style>
