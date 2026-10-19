<template>
  <div class="verify-config">
    <CustomTitle title="报废记录" />
    <CustomTable ref="customTableRef" v-model:table-data="customTableData" :config="tableConfig">
      <template #mroNo-default="{ row }">
        <el-button link type="primary" size="small" @click="onReviewMroInfo(row)"
          >{{ row.mroNo }}
        </el-button>
      </template>

      <template #mroModelName-default="{ row }">
        <el-button link type="primary" size="small" @click="onReviewMroModelInfo(row)"
          >{{ row.mroModelName }}
        </el-button>
      </template>

      <template #fileName-default="{ row }">
        <div v-if="row.files?.length > 0">
          <el-image
            :preview-teleported="true"
            v-for="item in row?.files"
            :key="item.id"
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
        <el-button link type="primary" size="small" @click="onReview(row)">查看详情</el-button>
      </template>
    </CustomTable>

    <!-- MRO编号信息弹窗 -->
    <MroInfoDialog v-model="mroInfoVisible" :mro-id="selectedRow?.mroInformationId || ''" />

    <!-- MRO型号信息弹窗 -->
    <MroModelInfoDialog
      v-model="mroModelInfoVisible"
      :mro-model-id="selectedRow?.mroModelId || ''"
    />
  </div>
</template>

<script setup lang="ts">
import { queryMroScrapApplyPageList } from "@/api/operation/mro/mro-scrap-apply"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import {
  EnumMROScrapProcessProgress,
  EnumMROScrapProcessProgressMap,
  EnumMROScrapSourceType,
  EnumMROScrapSourceTypeMap
} from "@/constant/enums"
import useFlowDetailStore from "@/store/modules/flowDetail"
import type { IMroScrapApplyPageListItem as ITableRow } from "@/types/maintain/mro-manage/mro-scrap-apply"
import { formatImgUrlPreview } from "@/utils/common"
import { formatPercent } from "@/utils/common"
import MroInfoDialog from "@/views/MROManage/MROInfo/components/MroInfoDialog.vue"
import MroModelInfoDialog from "@/views/MROManage/MROModelManage/components/MroModelInfoDialog.vue"

const props = withDefaults(
  defineProps<{
    mroId: string
  }>(),
  {}
)

const useFlowDetail = useFlowDetailStore()

const mroInfoVisible = ref(false)
const selectedRow = ref<ITableRow>()
const mroModelInfoVisible = ref(false)

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "processDefineName",
      label: "流程名称",
      minWidth: 160
    },
    {
      prop: "scrapStatus",
      label: "申请状态",
      width: 160,
      align: "center",
      formatter: (row) =>
        EnumMROScrapProcessProgressMap[row.scrapStatus as EnumMROScrapProcessProgress]
    },
    {
      prop: "mroNo",
      label: "MRO编号",
      minWidth: 160,
      slots: {
        default: "mroNo-default"
      }
    },
    {
      prop: "mroModelName",
      label: "MRO型号",
      minWidth: 160,
      slots: {
        default: "mroModelName-default"
      }
    },
    {
      prop: "mroClassifyName",
      label: "MRO分类",
      minWidth: 140
    },
    {
      prop: "mroCategoryName",
      label: "MRO类型",
      minWidth: 140
    },
    {
      prop: "lifeSpan",
      label: "寿命",
      width: 160,
      align: "right",
      formatter: (row) => formatPercent(row.lifeSpan)
    },
    {
      prop: "scrapReason",
      label: "报废原因",
      minWidth: 200
    },
    {
      prop: "fileName",
      label: "报废附件",
      minWidth: 200,
      slots: {
        default: "fileName-default"
      }
    },
    {
      prop: "empNo",
      label: "发起人",
      width: 160,
      formatter: (row) => row.reportUser?.name
    },
    {
      prop: "depName",
      label: "所属部门",
      minWidth: 160,
      formatter: (row) => row?.reportUserDepartment?.depName
    },
    {
      prop: "sourceType",
      label: "来源",
      width: 160,
      align: "center",
      formatter: (row) => EnumMROScrapSourceTypeMap[row.sourceType as EnumMROScrapSourceType]
    },
    {
      prop: "sourceNo",
      label: "关联维修单",
      minWidth: 160
    },
    {
      prop: "operation",
      label: "操作",
      width: 120,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

onMounted(() => {
  getMroScrapRecord()
})

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

/** 获取MRO报废记录 */
const getMroScrapRecord = async () => {
  customTableRef.value?.setLoading(true)
  const { records } = await queryMroScrapApplyPageList({
    pageQuery: { pageNum: 1, pageSize: 1000 },
    queryParam: { mroInformationId: props.mroId }
  })
  customTableData.value = records
  customTableRef.value?.setLoading(false)
}

/** 查看详情 */
const onReview = (row: ITableRow) => {
  useFlowDetail.setStatus(true, row.processInstanceId)
}
</script>

<style lang="scss" scoped>
.verify-config {
  height: 100%;
  display: flex;
  flex-direction: column;

  .custom-title {
    margin-top: 0;
  }

  .custom-table {
    flex: 1;
    overflow: hidden;
  }
}
</style>
