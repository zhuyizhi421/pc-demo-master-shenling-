<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="包装规范列表">
          <div v-if="isAuth">
            <el-button icon="Plus" type="primary" @click="onCreatePackageSpec()"
              >新建包装规范</el-button
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

          <template #template-path-default="{ row: { templateDto } }">
            <el-image
              v-if="templateDto?.thumbnailAddress"
              :src="formatImgUrlPreview(templateDto.thumbnailAddress)"
              :preview-src-list="[formatImgUrlPreview(templateDto.thumbnailAddress)]"
              preview-teleported
              style="height: 24px"
            />
          </template>

          <template #operation-default="{ row }">
            <el-button
              v-if="isAuth"
              type="primary"
              link
              size="small"
              @click="onEditPackageSpec(row)"
              >编辑</el-button
            >
            <el-button type="primary" link size="small" @click="onReviewPackageSpec(row)"
              >查看</el-button
            >
            <el-button
              v-if="isAuth && row.status === 'enable'"
              type="danger"
              link
              size="small"
              @click="onChangeStatusPackageSpec(row, false)"
              >停用</el-button
            >
            <el-button
              v-if="isAuth && row.status === 'disable'"
              type="primary"
              link
              size="small"
              @click="onChangeStatusPackageSpec(row, true)"
              >启用</el-button
            >
            <el-button
              v-if="isAuth"
              type="danger"
              link
              size="small"
              @click="onDeletePackageSpec(row)"
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

    <!-- 新建包装规范弹窗 -->
    <PackageSpecCreateDialog
      v-model="visibleCreate"
      :id="selectedRow?.id"
      @success="customTableRef?.requestData()"
    />

    <!-- 包装规范详情弹窗 -->
    <PackageSpecDetailDialog v-model="visibleDetail" :id="selectedRow?.id || ''" />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  queryPackageSpecPageList,
  requestDeletePackageSpec,
  requestDisablePackageSpec,
  requestEnablePackageSpec
} from "@/api/baseInfo/package-manage/packageSpec"
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
import useButtonAuth from "@/hooks/useButtonAuth"
import type {
  IPackageSpecPageListItem as ITableRow,
  IPackageSpecPageListParams
} from "@/types/base-info/package-spec"
import { formatImgUrlPreview } from "@/utils/common"

import PackageSpecCreateDialog from "./components/PackageSpecCreateDialog.vue"
import PackageSpecDetailDialog from "./components/PackageSpecDetailDialog.vue"

defineOptions({
  name: "PackageSpec"
})

const isAuth = useButtonAuth("PackageSpec_update", "PackageSpec_query")

const { searchList, resetForm, getFormData } = useSearchForm<{
  specName: string
  status: string
}>([
  {
    type: EnumComponentType.Input,
    key: "specName",
    label: "包装规范名称",
    value: "",
    placeholder: "请输入包装规范名称"
  },
  {
    type: EnumComponentType.Select,
    key: "status",
    label: "状态",
    value: "",
    placeholder: "请选择状态",
    options: [
      { label: "启用", value: "enable" },
      { label: "停用", value: "disable" }
    ]
  }
])

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "specName",
      label: "包装规范名称",
      minWidth: 160
    },
    {
      prop: "containerTypeName",
      label: "包装容器类型",
      minWidth: 120,
      align: "center"
    },
    {
      prop: "transportType",
      label: "运输方式",
      minWidth: 120,
      align: "center"
    },
    {
      prop: "thumbnailAddress",
      label: "打印标识模板",
      minWidth: 160,
      align: "center",
      slots: {
        default: "template-path-default"
      }
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
      prop: "remark",
      label: "备注说明",
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
const queryConfig: ITableRequestConfig<[IPackageSpecPageListParams], ITableRow, true> = {
  api: queryPackageSpecPageList,
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

const visibleCreate = ref(false)
const visibleDetail = ref(false)
const selectedRow = ref<ITableRow | null>(null)

onMounted(() => {
  customTableRef.value?.requestData()
})

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

/** 新建包装规范 */
const onCreatePackageSpec = () => {
  visibleCreate.value = true
  selectedRow.value = null
}

/** 编辑包装规范 */
const onEditPackageSpec = (row: ITableRow) => {
  visibleCreate.value = true
  selectedRow.value = row
}

/** 详情包装规范 */
const onReviewPackageSpec = (row: ITableRow) => {
  visibleDetail.value = true
  selectedRow.value = row
}

/** 启用、停用包装规范 */
const onChangeStatusPackageSpec = async (row: ITableRow, status: boolean) => {
  const statusText = status ? "启用" : "停用"
  await ElMessageBox.confirm(`确定${statusText}该包装规范吗?`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    closeOnPressEscape: false,
    autofocus: false,
    type: "warning"
  })
  if (!status) {
    await requestDisablePackageSpec(row.id)
  } else {
    await requestEnablePackageSpec(row.id)
  }
  ElMessage.success(`${statusText}成功`)
  customTableRef.value?.requestData()
}

/** 删除包装规范 */
const onDeletePackageSpec = async (row: ITableRow) => {
  await ElMessageBox.confirm("确定删除该包装规范吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    closeOnPressEscape: false,
    autofocus: false,
    type: "warning"
  })
  await requestDeletePackageSpec(row.id)
  ElMessage.success("删除成功")
  customTableRef.value?.requestData()
}
</script>

<style lang="scss" scoped></style>
