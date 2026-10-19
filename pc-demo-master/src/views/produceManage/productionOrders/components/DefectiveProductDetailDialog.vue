<!-- 不合格品缺陷详情弹窗 -->
<template>
  <CustomDialog
    v-model="dialogVisible"
    title="不合格品评审详情"
    size="large"
    @close="emit('close')"
  >
    <CustomTitle title="基础信息" style="margin-top: 0" show-short-bar />
    <div class="base-info-order">
      <span>评审单号：{{ data?.reviewTaskNo || "******" }}</span>
      <span class="status">状态：{{ reviewStatusMap[data?.reviewStatus] }}</span>
    </div>
    <CustomDescription :data="data" :configs="detailConfig" :label-width="100" :column="3" />
    <div class="detail-table-content">
      <el-radio-group v-model="tabIndex" style="margin: 16px 0">
        <el-radio-button label="拆分结果" :value="0" />
        <el-radio-button label="评审对象" :value="1" />
        <el-radio-button label="缺陷信息" :value="2" />
      </el-radio-group>

      <template v-if="tabIndex === 0">
        <CustomTable
          v-model:table-data="depotData"
          :config="depotTableConfig"
          class="custom-detail-table"
        />
      </template>

      <template v-if="tabIndex === 1">
        <CustomTable
          v-model:table-data="targetData"
          :config="targetTableConfig"
          class="custom-detail-table"
        />
      </template>

      <template v-if="tabIndex === 2">
        <CustomTable
          v-model:table-data="defectData"
          :config="defectTableConfig"
          class="custom-detail-table"
        />
      </template>
    </div>
  </CustomDialog>
</template>

<script setup lang="ts">
import {
  getDefectReviewTaskDefect,
  getDefectReviewTaskDivide,
  getDefectReviewTaskTarget
} from "@/api/quality/defectReviewTask"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import {
  EnumResultNameMap,
  EnumUnqualifiedOriginType,
  EnumUnqualifiedOriginTypeMap
} from "@/constant/enums"
import type {
  IDefectReviewTaskDefectItem,
  IDefectReviewTaskDivideItem,
  IDefectReviewTaskTargetItem
} from "@/types/quality-manage/unqualified"

const props = defineProps<{
  data: any
}>()

const emit = defineEmits<{
  (e: "close"): void
}>()

const reviewStatusMap: Record<number, string> = {
  "-1": "待执行",
  "0": "进行中",
  "1": "已完成"
}

const detailConfig = computed<ICustomDescriptionConfig[]>(() => [
  {
    label: "来源：",
    field: "originType",
    formatter: ({ data }) => {
      return EnumUnqualifiedOriginTypeMap[data.originType as EnumUnqualifiedOriginType]
    }
  },
  {
    label: "处理结果：",
    field: "reviewResults",
    formatter: ({ data }) => {
      return data.reviewResults?.map((item: string) => EnumResultNameMap[item]).join(",") ?? "--"
    }
  },
  {
    label: "关联检验单号：",
    field: "inspectTaskNo",
    get hidden() {
      return !isProduct.value
    }
  },
  {
    label: "生产任务：",
    field: "productionTaskNo",
    get hidden() {
      return !isProduct.value
    }
  },
  {
    label: "产品名称：",
    field: "productModelName"
  },
  {
    label: "产品编号：",
    field: "productModelCode"
  },
  {
    label: "数量：",
    field: "quantity"
  },
  {
    label: "单位：",
    field: "unitName"
  },
  {
    label: "生产区域：",
    field: "entityName",
    get hidden() {
      return !isProduct.value
    }
  },
  {
    label: "工艺名称：",
    field: "techName",
    get hidden() {
      return !isProduct.value
    }
  },
  {
    label: "创建时间：",
    field: "createTime"
  },
  {
    label: "完成时间：",
    field: "reviewCompleteTime"
  },
  {
    label: "执行人：",
    field: "completeByName"
  }
])

const dialogVisible = ref(true)

const tabIndex = ref(0)

const depotData = ref<IDefectReviewTaskDivideItem[]>([])
const defectData = ref<IDefectReviewTaskDefectItem[]>([])
const targetData = ref<IDefectReviewTaskTargetItem[]>([])

const depotTableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "barcode",
      label: "标签码",
      minWidth: 160
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
      width: 100,
      align: "right"
    },
    {
      prop: "unitName",
      label: "单位",
      minWidth: 120
    },
    {
      prop: "reviewResult",
      label: "处理结果",
      minWidth: 120,
      align: "right",
      formatter: (row: IDefectReviewTaskDivideItem) => {
        return EnumResultNameMap[row.reviewResult] ?? "--"
      }
    }
  ]
})
const targetTableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "barcode",
      label: "标签码",
      minWidth: 160
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
      minWidth: 120
    }
  ]
})
const defectTableConfig = ref<ITableConfig>({
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
      prop: "flawName",
      label: "缺陷名称",
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
      minWidth: 120
    },
    {
      prop: "remarks",
      label: "备注",
      minWidth: 160
    }
  ]
})

const isProduct = computed(() => props.data?.originType == 111)

watchEffect(async () => {
  if (props.data?.id) {
    let res: any
    switch (tabIndex.value) {
      case 0:
        res = await getDefectReviewTaskDivide({ reviewTaskId: props.data.id })
        depotData.value = res
        break
      case 1:
        res = await getDefectReviewTaskTarget({ reviewTaskId: props.data.id })
        targetData.value = res
        break
      case 2:
        res = await getDefectReviewTaskDefect({ reviewTaskId: props.data.id })
        defectData.value = res
        break
      default:
        break
    }
  }
})
</script>

<style lang="scss" scoped>
.base-info-order {
  font-weight: bold;
  font-size: 16px;
}

.status {
  margin-left: 16px;
}

.detail-table-content {
  border-top: 1px solid #e8e8e8;
  height: 400px;
  display: flex;
  flex-direction: column;
  padding-bottom: 10px;

  .custom-detail-table {
    flex: 1;
    overflow: hidden;
  }
}
</style>
