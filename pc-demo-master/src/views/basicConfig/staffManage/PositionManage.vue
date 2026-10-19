<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="职位列表">
          <div v-if="isAuth">
            <el-button
              type="primary"
              @click="positionDialogRef!.setVisible(true, false)"
              icon="Plus"
              >新建职位</el-button
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
          <template #operation-default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="positionDialogRef!.setVisible(true, true, row)"
              >编辑查看</el-button
            >
            <el-button link type="danger" size="small" @click="onDeletePositionClick(row.id)"
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

    <!-- 新增/编辑职位弹窗 -->
    <PositionUpdateDialog ref="positionDialogRef" @submit="customTableRef?.requestData()" />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { queryPositionPageList, requestDeletePosition } from "@/api/position"
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
import type {
  IPositionListItem as ITableRow,
  IPositionListParams
} from "@/types/base-info/employee"

import PositionUpdateDialog from "./components/PositionUpdateDialog.vue"

defineOptions({
  name: "PositionManage"
})

const isAuth = useButtonAuth("PositionManage_update", "PositionManage_query")

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "name",
    label: "职位名称",
    value: "",
    placeholder: "请输入职位名称"
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  name: string
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const positionDialogRef = ref<InstanceType<typeof PositionUpdateDialog>>()

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "name",
      label: "职位名称",
      minWidth: 160
    },
    {
      prop: "code",
      label: "职位编号",
      minWidth: 160
    },
    {
      prop: "remark",
      label: "备注",
      minWidth: 200
    },
    {
      prop: "operation",
      label: "操作",
      width: 130,
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

const queryConfig: ITableRequestConfig<[IPositionListParams], ITableRow, true> = {
  api: queryPositionPageList,
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

/** 删除职位 */
const onDeletePositionClick = async (id: number) => {
  const confirm = await ElMessageBox.confirm("确认要删除吗？", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "error"
  })
  if (confirm) {
    await requestDeletePosition({ id })
    ElMessage.success("删除成功")
    customTableRef.value?.requestData()
  }
}

const init = () => {
  customTableRef.value?.requestData()
}

onMounted(() => {
  init()
})
</script>

<style scoped lang="scss"></style>
