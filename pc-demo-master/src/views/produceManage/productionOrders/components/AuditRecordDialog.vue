<template>
  <CustomDialog
    v-model="dialogVisible"
    title="不合格品评审记录"
    size="large"
    @close="emit('close')"
  >
    <CustomTable v-model:table-data="tableData" :config="tableConfig">
      <template #reviewStatus-default="{ row: { reviewStatus } }">
        <el-tag v-if="reviewStatus === -1" type="danger">待执行</el-tag>
        <el-tag v-if="reviewStatus === 0" type="warning">进行中</el-tag>
        <el-tag v-if="reviewStatus === 1" type="success">已完成</el-tag>
      </template>

      <template #operation-default="{ row }">
        <el-button link type="primary" size="small" @click="onReviewDetail(row)"
          >查看详情</el-button
        >
      </template>
    </CustomTable>

    <!-- 不合格品详情弹窗 -->
    <DefectiveProductDetailDialog
      v-if="showDetail"
      :data="currentRowData"
      @close="showDetail = false"
    />
  </CustomDialog>
</template>

<script setup lang="ts">
import { type IDefectReviewTaskItem } from "@/api/quality/defectReviewTask"
import { requestUnQualifiedReasonList } from "@/api/scheduling"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import {
  EnumResultNameMap,
  EnumUnqualifiedOriginType,
  EnumUnqualifiedOriginTypeMap
} from "@/constant/enums"

import DefectiveProductDetailDialog from "./DefectiveProductDetailDialog.vue"

interface IProps {
  ids: string[]
}

const props = withDefaults(defineProps<IProps>(), {})
const emit = defineEmits<{
  (e: "close"): void
}>()

const dialogVisible = ref(true)
const tableData = ref<IDefectReviewTaskItem[]>([])
const tableConfig = ref({
  height: 500,
  columns: [
    {
      prop: "reviewTaskNo",
      label: "不合格品处理单号",
      minWidth: 160
    },
    {
      prop: "reviewStatus",
      label: "状态",
      width: 120,
      align: "center",
      slots: {
        default: "reviewStatus-default"
      }
    },
    {
      prop: "originType",
      label: "来源",
      width: 120,
      align: "center",
      formatter: (row: IDefectReviewTaskItem) => {
        return EnumUnqualifiedOriginTypeMap[row.originType as EnumUnqualifiedOriginType]
      }
    },
    {
      prop: "reviewResults",
      label: "处理结果",
      minWidth: 160,
      formatter: (row: IDefectReviewTaskItem) => {
        return row.reviewResults?.map((item) => EnumResultNameMap[item]).join(",") ?? "-"
      }
    },
    {
      prop: "productModelName",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "productModelSpec",
      label: "产品规格",
      minWidth: 160,
      formatter: (row: any) => row.productModelSpec || row.productModel?.specification || "-"
    },
    {
      prop: "productModelCode",
      label: "产品编号",
      minWidth: 160
    },
    {
      prop: "quantity",
      label: "数量",
      width: 120,
      align: "right"
    },
    {
      prop: "unitName",
      label: "单位",
      width: 90,
      align: "center"
    },
    {
      prop: "createTime",
      label: "创建时间",
      width: 160,
      align: "center"
    },
    {
      prop: "inspectTaskNo",
      label: "关联检验单号",
      minWidth: 160
    },
    {
      prop: "productionTaskNo",
      label: "生产任务",
      minWidth: 160
    },
    {
      prop: "entityName",
      label: "生产区域",
      minWidth: 160
    },
    {
      prop: "techName",
      label: "工艺名称",
      minWidth: 160
    },
    {
      prop: "reviewCompleteTime",
      label: "完成时间",
      width: 160,
      align: "center"
    },
    {
      prop: "completeByName",
      label: "执行人",
      minWidth: 120,
      align: "center"
    },
    {
      prop: "operation",
      label: "操作",
      width: 120,
      align: "center",
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const showDetail = ref(false)
const currentRowData = ref({})

onMounted(() => {
  getDefectReviewRecord()
})

/** 获取不合格品评审记录 */
const getDefectReviewRecord = async () => {
  const data = await requestUnQualifiedReasonList(props.ids)
  tableData.value = data || []
}

/** 查看详情 */
const onReviewDetail = (row: IDefectReviewTaskItem) => {
  showDetail.value = true
  currentRowData.value = row
}
</script>

<style lang="scss" scoped></style>
