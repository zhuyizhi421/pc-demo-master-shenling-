<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <CustomSearchForm :form-list="searchList" @search="onSubmit" @reset="onReset" />

      <div class="custom-table-container">
        <CustomTitle title="保养类型列表">
          <div v-if="canEdit">
            <el-button type="primary" icon="Plus" @click="openDialog('create')">
              新增保养类型
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
            <el-button
              link
              type="primary"
              size="small"
              @click="openDialog(canEdit ? 'edit' : 'view', row)"
            >
              {{ canEdit ? "编辑" : "查看详情" }}
            </el-button>
            <el-button
              v-if="canDelete"
              link
              type="danger"
              size="small"
              @click="onDeleteClick(row)"
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

    <MaintainTypeDialog
      v-model="dialogState.visible"
      :id="dialogState.id"
      :is-edit="dialogState.mode === 'edit'"
      :just-see="dialogState.mode === 'view'"
      @success="customTableRef?.requestData()"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  queryEquipmentMaintenanceTypePageList,
  requestDeleteEquipmentMaintenanceType
} from "@/api/operation/equipment/equipment-maintenance-type"
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
import useButtonAuth, { AuthType, useButtonSingleAuth } from "@/hooks/useButtonAuth"
import type {
  IEquipmentMaintenanceTypeItem as ITableRow,
  IEquipmentMaintenanceTypePageParams
} from "@/types/maintain/equipment-manage/equipment-maintenance-type"

import MaintainTypeDialog from "./components/MaintainTypeDialog.vue"

defineOptions({
  name: "MaintainType"
})

type TDialogMode = "create" | "edit" | "view"

const authType = useButtonAuth("MaintainType_update", "MaintainType_query")
const deleteAuth = useButtonSingleAuth("MaintainType_delete")
const canEdit = computed(() => authType.value !== AuthType.View)
const canDelete = computed(() => canEdit.value && deleteAuth.value)

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "maintenanceTypeCode",
    label: "保养类型编号",
    value: "",
    placeholder: "请输入保养类型编号"
  },
  {
    type: EnumComponentType.Input,
    key: "maintenanceTypeName",
    label: "保养类型名称",
    value: "",
    placeholder: "请输入保养类型名称"
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  maintenanceTypeCode?: string
  maintenanceTypeName?: string
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const dialogState = reactive<{
  visible: boolean
  mode: TDialogMode
  id: string
}>({
  visible: false,
  mode: "create",
  id: ""
})

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])

function formatDateTime(value?: string) {
  if (!value) return "-"
  return String(value).replace("T", " ").replace("Z", "")
}

const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "maintenanceTypeCode",
      label: "保养类型编号",
      minWidth: 180
    },
    {
      prop: "maintenanceTypeName",
      label: "保养类型名称",
      minWidth: 180
    },
    {
      prop: "remarks",
      label: "备注",
      minWidth: 220,
      formatter: (row: ITableRow) => row.remarks || "-"
    },
    {
      prop: "createBy",
      label: "创建人",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => row.createBy || "-"
    },
    {
      prop: "createTime",
      label: "创建时间",
      minWidth: 170,
      align: "center",
      formatter: (row: ITableRow) => formatDateTime(row.createTime)
    },
    {
      prop: "updateBy",
      label: "修改人",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => row.updateBy || "-"
    },
    {
      prop: "updateTime",
      label: "修改时间",
      minWidth: 170,
      align: "center",
      formatter: (row: ITableRow) => formatDateTime(row.updateTime)
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

const queryConfig: ITableRequestConfig<[IEquipmentMaintenanceTypePageParams], ITableRow, true> = {
  api: queryEquipmentMaintenanceTypePageList,
  getParams: () => [
    {
      pageQuery: {
        pageNum: pagination.value.currentPage,
        pageSize: pagination.value.pageSize
      },
      queryParam: getFormData()
    }
  ]
}

function onReset() {
  resetForm()
  onSubmit()
}

async function onSubmit() {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

function openDialog(mode: TDialogMode, row?: Partial<ITableRow>) {
  dialogState.mode = mode
  dialogState.id = String(row?.id || "")
  dialogState.visible = true
}

async function onDeleteClick(row: ITableRow) {
  try {
    await ElMessageBox.confirm(`确认删除保养类型 ${row.maintenanceTypeName} 吗？`, "删除确认", {
      type: "warning",
      confirmButtonText: "确认",
      cancelButtonText: "取消"
    })
    await requestDeleteEquipmentMaintenanceType(String(row.id || ""))
    ElMessage.success("删除成功")
    await customTableRef.value?.requestData()
  } catch (error) {
    if (error === "cancel" || error === "close") return
    ElMessage.error("删除失败")
  }
}

onMounted(() => {
  customTableRef.value?.requestData()
})
</script>
