<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="MRO类型列表">
          <div v-if="canEdit">
            <el-button type="primary" icon="Plus" @click="openDialog('create')">新建MRO类型</el-button>
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
            <el-button link type="primary" size="small" @click="openDialog(canEdit ? 'edit' : 'view', row.id)">
              {{ canEdit ? "编辑查看" : "查看详情" }}
            </el-button>
            <el-button
              v-if="canEdit"
              link
              type="danger"
              size="small"
              @click="onDeleteMroType(row.id)"
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

    <MroTypeDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :mro-type-id="selectedMroTypeId"
      @success="onDialogSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  queryMroTypePageList,
  requestDeleteMroType
} from "@/api/operation/mro/mro-type"
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
import useButtonAuth, { AuthType } from "@/hooks/useButtonAuth"
import type {
  IMroTypeExceptionHandlePosition,
  IMroTypePageListItem,
  IMroTypePageListParams
} from "@/types/maintain/mro-manage/mro-type"

import MroTypeDialog from "./components/MroTypeDialog.vue"

defineOptions({
  name: "MROType"
})

type MroTypeDialogMode = "create" | "edit" | "view"

const authType = useButtonAuth("MROType_update", "MROType_query")
const canEdit = computed(() => authType.value !== AuthType.View)

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "mroTypeNo",
    label: "MRO类型编号",
    value: "",
    placeholder: "请输入MRO类型编号"
  },
  {
    type: EnumComponentType.Input,
    key: "mroTypeName",
    label: "MRO类型名称",
    value: "",
    placeholder: "请输入MRO类型名称"
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  mroTypeNo: string
  mroTypeName: string
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const dialogVisible = ref(false)
const dialogMode = ref<MroTypeDialogMode>("create")
const selectedMroTypeId = ref("")

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<IMroTypePageListItem[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "mroTypeNo",
      label: "MRO类型编号",
      minWidth: 160
    },
    {
      prop: "mroTypeName",
      label: "MRO类型名称",
      minWidth: 180
    },
    {
      prop: "verifyAdvanceDays",
      label: "MRO校验工单提前生成天数",
      minWidth: 200
    },
    {
      prop: "maintenanceAdvanceDays",
      label: "MRO保养工单提前生成天数",
      minWidth: 200
    },
    {
      prop: "repairProcessName",
      label: "MRO维修流程",
      minWidth: 180
    },
    {
      prop: "scrapProcessName",
      label: "MRO报废流程",
      minWidth: 180
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

const queryConfig: ITableRequestConfig<[IMroTypePageListParams], IMroTypePageListItem, true> = {
  api: queryMroTypePageList,
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

const formatExceptionHandlePositions = (rows: IMroTypeExceptionHandlePosition[] = []) => {
  return rows.length
    ? rows.map((item) => `${item.depName}-${item.positionName}`).join("；")
    : "-"
}

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

const openDialog = (mode: MroTypeDialogMode, id = "") => {
  dialogMode.value = mode
  selectedMroTypeId.value = id
  dialogVisible.value = true
}

const onDialogSuccess = async () => {
  dialogVisible.value = false
  await customTableRef.value?.requestData()
}

const onDeleteMroType = async (id: string) => {
  await ElMessageBox.confirm("确认要删除吗", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "error"
  })

  await requestDeleteMroType({ id })
  ElMessage.success("删除成功")
  await customTableRef.value?.requestData()
}

onMounted(() => {
  customTableRef.value?.requestData()
})
</script>
