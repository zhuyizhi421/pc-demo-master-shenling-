<template>
  <div class="layout-container">
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="包装工序列表">
          <div v-if="isAuth">
            <el-button icon="Plus" type="primary" @click="onCreatePackageProcess()"
              >新建包装工序</el-button
            >
          </div>
        </CustomTitle>
        <CustomTable
          ref="customTableRef"
          v-model:table-data="customTableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
        >
          <template #status-default="{ row: { status } }">
            <el-tag :type="status === 'enable' ? 'success' : 'danger'">{{
              status === "enable" ? "启用" : "停用"
            }}</el-tag>
          </template>

          <template #operation-default="{ row }">
            <el-button type="primary" link size="small" @click="onReviewPackageProcess(row)"
              >查看</el-button
            >
            <el-button
              v-if="isAuth && row.status === 'enable'"
              type="danger"
              link
              size="small"
              @click="onChangeStatusPackageProcess(row, false)"
              >停用</el-button
            >
            <el-button
              v-if="isAuth && row.status === 'disable'"
              type="primary"
              link
              size="small"
              @click="onChangeStatusPackageProcess(row, true)"
              >启用</el-button
            >
            <el-button
              v-if="isAuth"
              type="danger"
              link
              size="small"
              @click="onDeletePackageProcess(row)"
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

    <div class="layout-child-page" v-if="curPageKey !== EnumPageType.Main">
      <CustomPageCrumbs v-model="curPageKey" :data="pageTree" />

      <!-- 新建、编辑包装工序 -->
      <PackageProcessCreate
        v-if="
          [EnumPageType.PackageProcessCreate, EnumPageType.PackageProcessUpdate].includes(
            curPageKey
          )
        "
        :id="selectedId"
        @close="onCreateOrUpdateClose"
        @success="onCreateOrUpdateSuccess"
      />

      <!-- 包装工序详情 -->
      <PackageProcessDetail
        v-if="curPageKey === EnumPageType.PackageProcessDetail"
        :id="selectedId"
        @close="curPageKey = EnumPageType.Main"
        @success="onDetailSuccess"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  queryPackageProcessPageList,
  requestDeletePackageProcess,
  requestDisablePackageProcess,
  requestEnablePackageProcess
} from "@/api/baseInfo/package-manage/packageProcess"
import CustomPageCrumbs from "@/components/CustomPageCrumbs/index.vue"
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
import { EnumProductionType, EnumProductionTypeMap } from "@/constant/enums"
import useButtonAuth from "@/hooks/useButtonAuth"
import type {
  IPackageProcessPageListItem as ITableRow,
  IPackageProcessPageListParams
} from "@/types/base-info/package-process"

import PackageProcessCreate from "./components/PackageProcessCreate.vue"
import PackageProcessDetail from "./components/PackageProcessDetail.vue"

defineOptions({
  name: "PackageProcess"
})

/** 页面显示类型枚举 */
enum EnumPageType {
  Main, // 列表页
  PackageProcessCreate,
  PackageProcessUpdate,
  PackageProcessDetail
}

const route = useRoute()
const curPageKey = ref(EnumPageType.Main)
const pageTree = ref([
  {
    name: "包装工序",
    key: EnumPageType.Main,
    children: [
      {
        name: "包装工序新建",
        key: EnumPageType.PackageProcessCreate
      },
      {
        name: "包装工序详情",
        key: EnumPageType.PackageProcessDetail
      },
      {
        name: "包装工序编辑",
        key: EnumPageType.PackageProcessUpdate
      }
    ]
  }
])

const isAuth = useButtonAuth("PackageProcess_update", "PackageProcess_query")

const { searchList, resetForm, getFormData } = useSearchForm<{
  name: string
  status: string
}>([
  {
    type: EnumComponentType.Input,
    key: "name",
    label: "包装工序名称",
    value: "",
    placeholder: "请输入包装工序名称"
  },
  {
    type: EnumComponentType.Select,
    key: "status",
    label: "状态",
    value: "",
    placeholder: "请选择状态",
    options: [
      {
        label: "启用",
        value: "enable"
      },
      {
        label: "停用",
        value: "disable"
      }
    ]
  }
])

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "name",
      label: "工序名称",
      minWidth: 160
    },
    {
      prop: "status",
      label: "状态",
      minWidth: 90,
      align: "center",
      slots: {
        default: "status-default"
      }
    },
    {
      prop: "techName",
      label: "工艺名称",
      minWidth: 160
    },
    {
      prop: "bizTypeName",
      label: "业务类型",
      minWidth: 120,
      align: "center"
    },
    {
      prop: "nature",
      label: "性质",
      minWidth: 120,
      align: "center",
      formatter: ({ nature }) => EnumProductionTypeMap[nature as EnumProductionType]
    },
    {
      prop: "remark",
      label: "备注",
      minWidth: 200
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
const queryConfig: ITableRequestConfig<[IPackageProcessPageListParams], ITableRow, true> = {
  api: queryPackageProcessPageList,
  getParams: () => {
    return [
      {
        pageQuery: {
          pageNum: pagination.value.currentPage,
          pageSize: pagination.value.pageSize
        },
        queryParam: {
          ...getFormData()
        }
      }
    ]
  }
}

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})
const selectedId = ref("")

onMounted(() => {
  customTableRef.value?.requestData()
})

onActivated(() => {
  if (route.query.packageProcessId) {
    selectedId.value = String(route.query.packageProcessId)
    curPageKey.value = EnumPageType.PackageProcessDetail
  }
})

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

/** 新建包装工序 */
const onCreatePackageProcess = () => {
  curPageKey.value = EnumPageType.PackageProcessCreate
  selectedId.value = ""
}

/** 详情包装工序 */
const onReviewPackageProcess = (row: ITableRow) => {
  curPageKey.value = EnumPageType.PackageProcessDetail
  selectedId.value = row.id
}

/** 启用、停用包装工序 */
const onChangeStatusPackageProcess = async (row: ITableRow, status: boolean) => {
  const statusText = !status ? "停用" : "启用"
  await ElMessageBox.confirm(`确定${statusText}该包装工序吗?`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    closeOnPressEscape: false,
    autofocus: false,
    type: "warning"
  })
  if (!status) {
    await requestDisablePackageProcess(row.id)
  } else {
    await requestEnablePackageProcess(row.id)
  }
  ElMessage.success(`${statusText}成功`)
  customTableRef.value?.requestData()
}

/** 删除包装工序 */
const onDeletePackageProcess = async (row: ITableRow) => {
  await ElMessageBox.confirm("确定删除该包装工序吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    closeOnPressEscape: false,
    autofocus: false,
    type: "warning"
  })
  await requestDeletePackageProcess(row.id)
  ElMessage.success("删除成功")
  customTableRef.value?.requestData()
}

/** 新建、编辑包装工序取消操作回调 */
const onCreateOrUpdateClose = (isUpdate: boolean) => {
  curPageKey.value = isUpdate ? EnumPageType.PackageProcessDetail : EnumPageType.Main
}

/** 新建包装工序成功回调 */
const onCreateOrUpdateSuccess = async (id: string) => {
  curPageKey.value = EnumPageType.PackageProcessDetail
  selectedId.value = id
  customTableRef.value?.requestData()
}

/** 包装工序详情编辑操作回调 */
const onDetailSuccess = (id: string) => {
  curPageKey.value = EnumPageType.PackageProcessUpdate
  selectedId.value = id
}
</script>

<style lang="scss" scoped></style>
