<template>
  <div class="verify-item-tab">
    <CustomSearchForm :form-list="searchList" @search="onSubmit" @reset="onReset" />

    <CustomTable
      ref="customTableRef"
      v-model:table-data="customTableData"
      v-model:total="pagination.total"
      :config="tableConfig"
      :query-config="queryConfig"
    >
      <template #remarkFiles-default="{ row }">
        <div v-if="row.remarkFiles?.length > 0">
          <el-image
            v-for="item in row?.remarkFiles"
            :key="item.id"
            :preview-src-list="[formatImgUrlPreview(item.path)]"
            :src="formatImgUrlPreview(item.path)"
            class="w-[50px] h-[50px]"
            fit="contain"
            preview-teleported
          />
        </div>
        <div v-else>
          <span>无图片</span>
        </div>
      </template>

      <template #operation-default="{ row }">
        <el-button
          v-if="row.inspectionResult === EnumMROInspectionTaskResult.NG"
          link
          type="primary"
          size="small"
          @click="onReviewDetail(row)"
        >
          查看详情
        </el-button>
      </template>
    </CustomTable>
    <CustomPagination
      v-model:currentPage="pagination.currentPage"
      v-model:pageSize="pagination.pageSize"
      :total="pagination.total"
      :border="false"
      @change="customTableRef?.requestData()"
    />
  </div>
</template>

<script setup lang="ts">
import { queryMroInspectionTaskItemPageList } from "@/api/operation/mro/mro-verify-task"
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
import {
  EnumMROInspectionStandardType,
  EnumMROInspectionStandardTypeMap,
  EnumMROInspectionTaskResult,
  EnumMROInspectionTaskResultMap
} from "@/constant/enums"
import type { IMroInspectionTaskItemPageListParams } from "@/types/maintain/mro-manage/mro-verify-task"
import type { IMroInspectionTaskItem as ITableRow } from "@/types/maintain/mro-manage/mro-verify-task"
import { getStandardString } from "@/utils"
import { formatImgUrlPreview } from "@/utils/common"

const props = withDefaults(
  defineProps<{
    mroVerifyTaskId: string
  }>(),
  {}
)

const { openDetail } = inject("verifyAbnormalOrderDetail") as any

const { searchList, resetForm, getFormData } = useSearchForm<{
  inspectionNo: string
  inspectionResult?: number
}>([
  {
    type: EnumComponentType.Input,
    label: "校验项编号",
    key: "inspectionNo",
    value: ""
  },
  {
    type: EnumComponentType.Select,
    label: "校验项结果",
    key: "inspectionResult",
    value: "",
    options: Object.entries(EnumMROInspectionTaskResultMap).map(([key, value]) => ({
      label: value,
      value: +key
    }))
  }
])

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "inspectionName",
      label: "校验项名称",
      minWidth: 160
    },
    {
      prop: "inspectionNo",
      label: "校验项编号",
      minWidth: 160
    },
    {
      prop: "inspectionResult",
      label: "校验项结果",
      minWidth: 120,
      align: "center",
      formatter: (row) =>
        EnumMROInspectionTaskResultMap[row.inspectionResult as EnumMROInspectionTaskResult]
    },
    {
      prop: "inspectionMethod",
      label: "探测方式",
      minWidth: 160
    },
    {
      prop: "standardType",
      label: "检验标准类型",
      minWidth: 160,
      align: "center",
      formatter: (row) =>
        EnumMROInspectionStandardTypeMap[
          row.inspectionStandard?.standardType as EnumMROInspectionStandardType
        ]
    },
    {
      prop: "inspectionStandard",
      label: "检验标准",
      minWidth: 160,
      formatter: (row) => getStandardString(row.inspectionStandard)
    },
    {
      prop: "practicalValue",
      label: "实测值",
      minWidth: 120,
      align: "right"
    },
    {
      prop: "unitName",
      label: "单位",
      minWidth: 120,
      align: "center",
      formatter: (row: ITableRow) => row.inspectionStandard?.unitName || "--"
    },
    {
      prop: "inspectionUsers",
      label: "校验人",
      minWidth: 160,
      formatter: (row: ITableRow) => row.inspectionUsers?.map((item) => item.name)?.join(",")
    },
    {
      prop: "inspectionTime",
      label: "校验时间",
      minWidth: 160,
      align: "center"
    },
    {
      prop: "remarks",
      label: "备注",
      minWidth: 200
    },
    {
      prop: "remarkFiles",
      label: "上传图片",
      minWidth: 200,
      slots: {
        default: "remarkFiles-default"
      }
    },
    {
      prop: "operation",
      label: "异常工单",
      width: 120,
      fixed: "right",
      align: "center",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IMroInspectionTaskItemPageListParams], ITableRow, true> = {
  api: queryMroInspectionTaskItemPageList,
  getParams: () => {
    return [
      {
        pageQuery: {
          pageNum: pagination.currentPage,
          pageSize: pagination.pageSize
        },
        queryParam: {
          ...getFormData(),
          inspectionTaskId: props.mroVerifyTaskId
        }
      }
    ]
  }
}
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

onMounted(() => {
  customTableRef.value?.requestData()
})

const onSubmit = () => {
  pagination.currentPage = 1
  customTableRef.value?.requestData()
}

const onReset = () => {
  resetForm()
  onSubmit()
}

/** 查看检验项详情 */
const onReviewDetail = (row: ITableRow) => {
  openDetail(row.exceptionTaskId)
}
</script>

<style lang="scss" scoped>
.verify-item-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &:deep(.custom-search-form) {
    margin-bottom: 12px;
  }

  &:deep(.custom-table) {
    flex: 1;
    overflow: hidden;
  }

  &:deep(.custom-pagination) {
    padding-bottom: 0;
  }
}
</style>
