<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="MRO报废流程单列表">
          <div v-if="isAuth">
            <el-button type="primary" @click="newScrapHandleRef?.setVisible(true)" icon="Plus"
              >新建报废</el-button
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
          <template #scrapStatus-default="{ row }">
            <el-tag
              :type="
                EnumMROScrapProcessProgressTagMap[row.scrapStatus as EnumMROScrapProcessProgress]
              "
              >{{
                EnumMROScrapProcessProgressMap[row.scrapStatus as EnumMROScrapProcessProgress]
              }}</el-tag
            >
          </template>

          <template #mroNo-default="{ row }">
            <el-button link type="primary" size="small" @click="onReviewMroInfo(row)"
              >{{ row.mroNo }}
            </el-button>
          </template>

          <template #mroName-default="{ row }">
            <el-button link type="primary" size="small" @click="onReviewMroModelInfo(row)"
              >{{ row.mroModelName }}
            </el-button>
          </template>

          <template #mroModelNo-default="{ row }">
            <el-button link type="primary" size="small" @click="onReviewMroModelInfo(row)"
              >{{ row.mroModelNo }}
            </el-button>
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
              link
              type="primary"
              size="small"
              @click="useFlowDetail.setStatus(true, row.processInstanceId, onFlowExamSuccess)"
              >查看详情
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

    <!-- MRO编号信息弹窗 -->
    <MroInfoDialog v-model="mroInfoVisible" :mro-id="selectedRow?.mroInformationId || ''" />

    <!-- MOR型号信息弹窗 -->
    <MroModelInfoDialog
      v-model="mroModelInfoVisible"
      :mro-model-id="selectedRow?.mroModelId || ''"
    />

    <!-- 新建报废弹窗 -->
    <NewScrapHandle ref="newScrapHandleRef" @success="onNewScrapSuccess" />
  </div>
</template>

<script setup lang="ts">
import { queryMroScrapApplyPageList } from "@/api/operation/mro/mro-scrap-apply"
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
  EnumMROScrapProcessProgress,
  EnumMROScrapProcessProgressMap,
  EnumMROScrapProcessProgressTagMap,
  EnumMROScrapSourceType,
  EnumMROScrapSourceTypeMap
} from "@/constant/enums"
import useButtonAuth from "@/hooks/useButtonAuth"
import useFlowDetailStore from "@/store/modules/flowDetail"
import type {
  IMroScrapApplyPageListItem as ITableRow,
  IMroScrapApplyPageListParams
} from "@/types/maintain/mro-manage/mro-scrap-apply"
import { formatImgUrlPreview } from "@/utils/common"
import MroInfoDialog from "@/views/MROManage/MROInfo/components/MroInfoDialog.vue"
import MroModelInfoDialog from "@/views/MROManage/MROModelManage/components/MroModelInfoDialog.vue"

import NewScrapHandle from "./components/NewScrapHandle.vue"

defineOptions({
  name: "MROScrapApply"
})

const isAuth = useButtonAuth("MROScrapApply_update", "MROScrapApply_query")
const useFlowDetail = useFlowDetailStore()

const scrapStatusOptions = ref<
  {
    label: string
    value: number
  }[]
>([])
const sourceTypeOptions = ref<
  {
    label: string
    value: number
  }[]
>([])

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Select,
    key: "scrapStatusList",
    label: "流程进度",
    value: "",
    placeholder: "请选择流程进度",
    options: scrapStatusOptions,
    multiple: true,
    maxTag: 2
  },
  {
    type: EnumComponentType.Select,
    key: "sourceTypeList",
    label: "来源",
    value: "",
    placeholder: "请选择来源",
    options: sourceTypeOptions,
    multiple: true
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

const mroInfoVisible = ref(false)
const mroModelInfoVisible = ref(false)
const selectedRow = ref<ITableRow>()
const newScrapHandleRef = ref<InstanceType<typeof NewScrapHandle>>()

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "index",
      label: "序号",
      width: 60,
      align: "center",
      type: "index"
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
      prop: "mroNo",
      label: "MRO序列号",
      width: 160,
      slots: {
        default: "mroNo-default"
      }
    },
    {
      prop: "mroName",
      label: "MRO名称",
      width: 160,
      slots: {
        default: "mroName-default"
      }
    },
    {
      prop: "mroModelNo",
      label: "MRO编号",
      width: 160,
      slots: {
        default: "mroModelNo-default"
      }
    },
    {
      prop: "mroClassifyName",
      label: "MRO分类",
      width: 140
    },
    {
      prop: "mroCategoryName",
      label: "MRO类型",
      width: 140
    },
    {
      prop: "scrapReason",
      label: "报废原因",
      width: 120,
      align: "center"
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
      prop: "reportUser.name",
      label: "发起人",
      width: 160
    },
    {
      prop: "reportUserDepartment.depName",
      label: "所属部门",
      width: 160
    },
    {
      prop: "sourceType",
      label: "来源",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        return EnumMROScrapSourceTypeMap[row.sourceType as EnumMROScrapSourceType]
      }
    },
    {
      prop: "sourceNo",
      label: "关联来源单号",
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
const queryConfig: ITableRequestConfig<[IMroScrapApplyPageListParams], ITableRow, true> = {
  api: queryMroScrapApplyPageList,
  getParams: () => {
    return [
      {
        pageQuery: {
          pageNum: pagination.value.currentPage,
          pageSize: pagination.value.pageSize
        },
        queryParam: {
          ...getFormData()
        },
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
  buildOptions()
  customTableRef.value?.requestData()
})

const onNewScrapSuccess = () => {
  customTableRef.value?.requestData()
}

/** 流程审批成功后刷新列表状态 */
const onFlowExamSuccess = () => {
  customTableRef.value?.requestData()
}

/** 查看MRO信息 */
const onReviewMroInfo = (row: ITableRow) => {
  mroInfoVisible.value = true
  selectedRow.value = row
}

/** 查看MRO型号信息 */
const onReviewMroModelInfo = (row: ITableRow) => {
  mroModelInfoVisible.value = true
  selectedRow.value = row
}

/** 构建下拉选项 */
const buildOptions = () => {
  scrapStatusOptions.value = Object.keys(EnumMROScrapProcessProgressMap).map((key) => ({
    label: EnumMROScrapProcessProgressMap[key as unknown as EnumMROScrapProcessProgress],
    value: +key
  }))

  sourceTypeOptions.value = Object.keys(EnumMROScrapSourceTypeMap).map((key) => ({
    label: EnumMROScrapSourceTypeMap[key as unknown as EnumMROScrapSourceType],
    value: +key
  }))
}

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
