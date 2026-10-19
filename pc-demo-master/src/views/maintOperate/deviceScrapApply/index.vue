<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="设备报废流程单列表">
          <div v-if="isAuth">
            <el-button type="primary" @click="visible = true" icon="Plus">新建报废</el-button>
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
          <template #scrapStatus-default="{ row }">
            <el-tag :type="EnumEquipmentScrapStatusTagTypeMap[row.scrapStatus]">{{
              EnumEquipmentScrapStatusTypeMap[row.scrapStatus]
            }}</el-tag>
          </template>

          <template #files-default="{ row }">
            <div v-if="row.files?.length > 0">
              <el-image
                :preview-teleported="true"
                v-for="item in row?.files"
                :key="item.id"
                :zoom-rate="1"
                :max-scale="7"
                :min-scale="0.2"
                :preview-src-list="[formatImgUrlPreview(item.path)]"
                :src="formatImgUrlPreview(item.path)"
                class="w-[50px] h-[50px]"
                fit="contain"
              />
            </div>
            <div v-else>
              <span>无图片</span>
            </div>
          </template>

          <template #operation-default="{ row }">
            <el-button
              v-if="row.processInstanceId"
              link
              type="primary"
              size="small"
              @click="useFlowDetail.setStatus(true, row.processInstanceId)"
              >查看详情</el-button
            >
            <el-button v-else link type="primary" size="small" disabled>暂无详情</el-button>
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

    <!-- 新增报废弹窗 -->
    <ScrapApplyCreate v-model="visible" @success="customTableRef?.requestData()" />
  </div>
</template>

<script setup lang="ts">
import { queryEquipmentScrapPageList } from "@/api/operation/equipment/equipment-scrap-apply"
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
import {
  EnumEquipmentScrapSourceTypeMap,
  EnumEquipmentScrapStatusTagTypeMap,
  EnumEquipmentScrapStatusTypeMap
} from "@/constant/enums"
import useButtonAuth from "@/hooks/useButtonAuth"
import useFlowDetailStore from "@/store/modules/flowDetail"
import type {
  IEquipmentScrapPageItem as ITableRow,
  IEquipmentScrapPageListParams
} from "@/types/maintain/equipment-manage/equipment-scrap-apply"
import { formatImgUrlPreview } from "@/utils/common"

import ScrapApplyCreate from "./components/ScrapApplyCreate.vue"

defineOptions({
  name: "DeviceScrapApply"
})

const useFlowDetail = useFlowDetailStore()
const isAuth = useButtonAuth("DeviceScrapApply_update", "DeviceScrapApply_query")

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Select,
    key: "scrapStatusList",
    label: "流程进度",
    value: "",
    placeholder: "请选择流程进度",
    options: [
      {
        label: "申请中",
        value: 1
      },
      {
        label: "已通过",
        value: 2
      },
      {
        label: "未通过",
        value: 3
      }
    ],
    multiple: true,
    maxTag: 2
  },
  {
    type: EnumComponentType.Select,
    key: "sourceTypeList",
    label: "来源",
    value: "",
    placeholder: "请选择来源",
    options: [
      {
        label: "保养",
        value: 1
      },
      {
        label: "维修",
        value: 2
      },
      {
        label: "手动创建",
        value: 3
      }
    ],
    multiple: true,
    maxTag: 2
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  scrapStatusList?: number[]
  sourceTypeList?: number[]
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const visible = ref(false)
const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "index",
      type: "index",
      label: "序号",
      width: 60,
      align: "center"
    },
    {
      prop: "processDefineName",
      label: "流程名称",
      width: 160
    },
    {
      prop: "scrapStatus",
      label: "流程进度",
      width: 120,
      align: "center",
      slots: {
        default: "scrapStatus-default"
      }
    },
    {
      prop: "equipmentName",
      label: "设备名称",
      width: 160
    },
    {
      prop: "equipmentNo",
      label: "设备编号",
      width: 160
    },
    {
      prop: "scrapReason",
      label: "报废原因",
      width: 160
    },
    {
      prop: "files",
      label: "报废附件",
      width: 160,
      slots: {
        default: "files-default"
      }
    },
    {
      prop: "reportUsersName",
      label: "发起人",
      minWidth: 160,
      formatter: (row: ITableRow) => {
        return row.reportUsers?.length ? row?.reportUsers?.map((i) => i.name).join(",") : "-"
      }
    },
    {
      prop: "reportUsersDepName",
      label: "所属部门",
      minWidth: 160,
      formatter: (row: ITableRow) => {
        return row.reportUsers?.length ? row?.reportUsers?.map((i) => i.depName).join(",") : "-"
      }
    },
    {
      prop: "sourceType",
      label: "来源",
      minWidth: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        return EnumEquipmentScrapSourceTypeMap[row.sourceType] ?? "手动创建"
      }
    },
    {
      prop: "sourceNo",
      label: "关联维修单",
      width: 160
    },
    {
      prop: "operation",
      label: "操作",
      width: 80,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IEquipmentScrapPageListParams], ITableRow, true> = {
  api: queryEquipmentScrapPageList,
  getParams: () => {
    return [
      {
        pageQuery: {
          pageNum: pagination.value.currentPage,
          pageSize: pagination.value.pageSize
        },
        queryParam: getFormData(),
        sort: [
          {
            field: "createTime",
            order: "desc"
          }
        ]
      }
    ]
  }
}

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
</script>

<style scoped lang="scss"></style>
