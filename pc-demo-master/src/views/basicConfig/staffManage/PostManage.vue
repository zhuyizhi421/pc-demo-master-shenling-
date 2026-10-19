<template>
  <div class="layout-container">
    <div class="layout-tree">
      <CustomTreeMenu
        ref="treeMenuRef"
        :menuItems="jobList"
        label-attr="jobName"
        @node-click="onMenuSelect"
        :showCustomIcon="false"
        virtualize
      >
        <template #afterIcon="{ data }" v-if="isAuth">
          <template v-if="data.id !== ''">
            <el-icon class="mr-[10px]" @click.stop="postInfoRef!.setVisible(true, true, data.id)">
              <EditPen color="var(--tree-right-icon-color)" />
            </el-icon>
            <el-icon class="mr-[6px]" @click.stop="onJobDelete(data.id)">
              <CircleClose color="var(--tree-right-icon-color)" />
            </el-icon>
          </template>
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
        <CustomTitle title="上岗证列表">
          <div v-if="isAuth">
            <el-button type="primary" @click="postInfoRef!.setVisible(true, false, '')" icon="Plus"
              >新建岗位</el-button
            >
            <el-button
              type="primary"
              @click="
                WorkLicenseRef!.setVisible({
                  show: true,
                  editStatus: false,
                  jobId: activeJobId
                })
              "
              icon="Plus"
              >新建上岗证</el-button
            >
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
          <template #autoFreeze-default="{ row }">
            <el-tag :type="row.autoFreeze == 1 ? 'success' : 'danger'">{{
              row.autoFreeze === 1 ? "开启" : "关闭"
            }}</el-tag>
          </template>

          <template #operation-default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="
                WorkLicenseRef!.setVisible({
                  show: true,
                  editStatus: true,
                  id: row.id,
                  detailStatus: !isAuth
                })
              "
              >{{ isAuth ? "编辑查看" : "查看详情" }}</el-button
            >
            <el-button link type="primary" size="small" @click="EmployeeDetailRef!.onOpen(row.id)"
              >员工明细</el-button
            >
            <el-button
              v-if="isAuth"
              link
              type="danger"
              size="small"
              @click="onLicenseDelete(row.id)"
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
        @change="customTableRef?.requestData()"
      />
    </div>

    <!-- 岗位信息新增、编辑、详情弹窗 -->
    <PostInfoDialog ref="postInfoRef" @success="getJobList()" />

    <!-- 上岗证信息新增、编辑、详情弹窗 -->
    <WorkLicenseDialog ref="WorkLicenseRef" @on-ok="customTableRef?.requestData()" />

    <!-- 上岗证员工明细弹窗 -->
    <employeeDetailDialog ref="EmployeeDetailRef"></employeeDetailDialog>
  </div>
</template>

<script setup lang="ts">
import { EditPen } from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox } from "element-plus"

import { getDeleteJobs, getSelectedPosition } from "@/api/job"
import { queryLicensePageList, requestDeleteLicense } from "@/api/license"
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
import useButtonAuth from "@/hooks/useButtonAuth"
import type {
  ILicenseListItem as ITableRow,
  ILicensePageSearchParams
} from "@/types/base-info/employee"

import employeeDetailDialog from "./components/employeeDetailDialog.vue"
import PostInfoDialog from "./components/NewPostHandle.vue"
import WorkLicenseDialog from "./components/NewWorkLicenseHandle.vue"

defineOptions({
  name: "PostManage"
})

const isAuth = useButtonAuth("PostManage_update", "PostManage_query")

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "licenseName",
    label: "上岗证名称",
    value: "",
    placeholder: "请输入上岗证名称"
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  licenseName: string
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const postInfoRef = ref<InstanceType<typeof PostInfoDialog>>()
const WorkLicenseRef = ref<InstanceType<typeof WorkLicenseDialog>>()
const EmployeeDetailRef = ref<InstanceType<typeof employeeDetailDialog>>()

const jobList = ref<any>([])
const activeJobId = ref("")
const treeMenuRef = ref<InstanceType<typeof CustomTreeMenu>>()

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "licenseName",
      label: "上岗证名称",
      minWidth: 160
    },
    {
      prop: "jobName",
      label: "所属岗位",
      minWidth: 160
    },
    {
      prop: "autoFreeze",
      label: "自动冻结",
      width: 120,
      align: "center",
      slots: {
        default: "autoFreeze-default"
      }
    },
    {
      prop: "equipmentType",
      label: "可操作设备",
      width: 160,
      align: "center",
      formatter: (row: ITableRow) => {
        return row.equipmentType == 1
          ? "所有设备"
          : row.equipmentType == 2
            ? "特定设备类型"
            : "特定设备"
      }
    },
    {
      prop: "equipmentBizNames",
      label: "可操作设备详情",
      minWidth: 160
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

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

const queryConfig: ITableRequestConfig<[ILicensePageSearchParams], ITableRow, true> = {
  api: queryLicensePageList,
  getParams: () => {
    return [
      {
        pageNum: pagination.value.currentPage,
        pageSize: pagination.value.pageSize,
        ...getFormData(),
        jobId: activeJobId.value || undefined
      }
    ]
  }
}

/** 获取左侧岗位列表 */
const getJobList = async () => {
  const data: any = await getSelectedPosition()
  jobList.value = [
    {
      id: "",
      jobName: "全部岗位",
      children: data.map((item: any) => {
        return {
          ...item,
          children: []
        }
      })
    }
  ]
  activeJobId.value = jobList.value[0].id
  setTimeout(() => {
    treeMenuRef.value?.getTreeRef()?.setCurrentKey(activeJobId.value)
  })
}

/** 删除上岗证 */
const onLicenseDelete = async (id: number) => {
  const confirm = await ElMessageBox.confirm("确认要删除吗", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "error"
  })
  if (confirm) {
    await requestDeleteLicense({ id })
    ElMessage({
      message: "删除成功",
      type: "success"
    })
    customTableRef.value?.requestData()
  }
}

/** 切换岗位选中 */
const onMenuSelect = (data: any) => {
  const key = data.id
  activeJobId.value = key
  customTableRef.value?.requestData()
}

/** 删除岗位 */
const onJobDelete = async (id: number) => {
  await ElMessageBox.confirm("确认要删除吗", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  })

  await getDeleteJobs({ id })
  ElMessage.success("删除成功")
  getJobList()
  customTableRef.value?.requestData()
}

onMounted(() => {
  getJobList()
  customTableRef.value?.requestData()
})
</script>

<style scoped lang="scss">
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
</style>
