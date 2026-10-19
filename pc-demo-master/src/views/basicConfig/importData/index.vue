<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="数据导入列表">
          <div v-if="isAuth">
            <el-button type="primary" icon="Plus" @click="importVisible = true"
              >新建导入任务</el-button
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
          <template #importFile-default="{ row: { importFile } }">
            <el-link
              v-if="importFile?.fileId"
              type="primary"
              @click="fileDownloadHandle(importFile.fileId)"
              >{{ importFile.fileName }}</el-link
            >
          </template>

          <template #failFile-default="{ row: { errorFile } }">
            <el-link
              v-if="errorFile?.fileId"
              type="primary"
              @click="fileDownloadHandle(errorFile.fileId)"
              >{{ errorFile.fileName }}</el-link
            >
          </template>

          <template #status-default="{ row: { status } }">
            <el-tag :type="statusTags[status as EnumImportDataStatus]">{{
              EnumImportDataStatusMap[status as EnumImportDataStatus]
            }}</el-tag>
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

    <!-- 数据导入弹窗 -->
    <ImportDataDialog v-model="importVisible" @success="customTableRef?.requestData()" />
  </div>
</template>

<script setup lang="ts">
import {
  queryImportDataPageList,
  requestImportDataTaskType
} from "@/api/baseInfo/import-data/import-data"
import { fileDownloadHandle } from "@/api/fileResource"
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
import { EnumImportDataStatus, EnumImportDataStatusMap } from "@/constant/enums"
import useButtonAuth from "@/hooks/useButtonAuth"
import type {
  IImportDataPageItem as ITableRow,
  IImportDataPageParams
} from "@/types/base-info/import-data"
import type { IOption } from "@/types/common"
import { onPreventReClick } from "@/utils/common"

import ImportDataDialog from "./ImportDataDialog.vue"

defineOptions({
  name: "ImportData"
})

const isAuth = useButtonAuth("ImportData_update", "ImportData_query")

const statusTags = {
  [EnumImportDataStatus.PENDING]: "info",
  [EnumImportDataStatus.PROCESSING]: "primary",
  [EnumImportDataStatus.SUCCESS]: "success",
  [EnumImportDataStatus.FAILED]: "danger",
  [EnumImportDataStatus.REJECTED]: "warning"
}

const taskTypeOptions = ref<IOption[]>([])

const { searchList, resetForm, getFormData } = useSearchForm<{
  startTime: string
  endTime: string
  taskTypes: string[]
}>([
  {
    type: EnumComponentType.Date,
    dateType: "datetimerange",
    key: "startTime",
    label: "开始时间",
    value: [],
    placeholder: ["请选择开始时间", "请选择结束时间"],
    format: "YYYY-MM-DD HH:mm:ss",
    valueFormat: "YYYY-MM-DD HH:mm:ss",
    keyword: ["startTime", "endTime"],
    disabledDateParams: {
      maxRange: 30
    }
  },
  {
    type: EnumComponentType.Select,
    key: "taskTypes",
    label: "类型",
    value: "",
    options: taskTypeOptions,
    placeholder: "请选择类型（可多选）",
    multiple: true,
    filterable: true
  }
])

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
      prop: "no",
      label: "任务编号",
      minWidth: 160
    },
    {
      prop: "taskTypeName",
      label: "作业项类型",
      minWidth: 160,
      align: "center"
    },
    {
      prop: "taskItemName",
      label: "作业项",
      minWidth: 160,
      align: "center"
    },
    {
      prop: "importFile",
      label: "导入文件",
      minWidth: 200,
      slots: {
        default: "importFile-default"
      }
    },
    {
      prop: "",
      label: "失败记录",
      minWidth: 200,
      slots: {
        default: "failFile-default"
      }
    },
    {
      prop: "status",
      label: "状态",
      minWidth: 120,
      align: "center",
      slots: {
        default: "status-default"
      }
    },
    {
      prop: "startTime",
      label: "开始时间",
      minWidth: 160,
      align: "center"
    },
    {
      prop: "endTime",
      label: "结束时间",
      minWidth: 160,
      align: "center"
    }
  ]
})
const queryConfig: ITableRequestConfig<[IImportDataPageParams], ITableRow, true> = {
  api: queryImportDataPageList,
  getParams: () => {
    const { startTime, endTime, ...rest } = getFormData()
    return [
      {
        dateRange: {
          endDate: endTime,
          startDate: startTime
        },
        pageQuery: {
          pageNum: pagination.value.currentPage,
          pageSize: pagination.value.pageSize
        },
        queryParam: {
          ...rest
        }
      }
    ]
  }
}

const importVisible = ref(false)

onMounted(() => {
  getTaskTypeOptions()
  customTableRef.value?.requestData()
})

/** 获取作业项类型 */
const getTaskTypeOptions = async () => {
  const data = await requestImportDataTaskType()
  if (!data?.length) {
    return
  }
  taskTypeOptions.value = data.map((item) => ({
    label: item.taskTypeName,
    value: item.taskType
  }))
}

const handleSearch = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

const onReset = onPreventReClick(async () => {
  resetForm()
  await handleSearch()
})

const onSubmit = onPreventReClick(handleSearch)
</script>

<style lang="scss" scoped></style>
