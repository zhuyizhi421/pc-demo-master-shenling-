<template>
  <div class="preparation-material-task-detail">
    <div class="top-content">
      <div>
        <el-button icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>
      <CustomTitle title="任务信息" :is-table-title="false" show-short-bar />
      <div class="order">
        <span>任务单号：{{ formData?.no }}</span>
        <span class="status">{{
          EnumPreparationMaterialTaskStatusMap[
            formData?.status as EnumPreparationMaterialTaskStatus
          ]
        }}</span>
      </div>
      <CustomDescription :data="formData" :configs="detailConfig" style="padding: 0">
      </CustomDescription>
    </div>
    <div class="material-list">
      <CustomTitle title="产品明细" :is-table-title="false" show-short-bar />
      <CustomTable
        ref="tableRef"
        v-model:table-data="tableData"
        :config="tableConfig"
        class="custom-detail-table"
      >
        <template #operation-default="{ row }">
          <el-button type="primary" size="small" link @click="onReviewDetail(row)"
            >查看领料详情</el-button
          >
        </template>
      </CustomTable>
    </div>

    <div class="layout-footer">
      <el-button @click="emit('close')">取消</el-button>
    </div>

    <!-- 查看领料详情弹窗 -->
    <PreparationDetailDialog v-model="visible" :id="selectedId" />
  </div>
</template>

<script setup lang="ts">
import { queryPreparationMaterialTaskDetail } from "@/api/logistics/preparationMaterial"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import {
  EnumGetMaterialPurpose,
  EnumGetMaterialPurposeMap,
  EnumPreparationMaterialPlanType,
  EnumPreparationMaterialPlanTypeMap,
  EnumPreparationMaterialTaskStatus,
  EnumPreparationMaterialTaskStatusMap
} from "@/constant/enums"
import type {
  IPreparationMaterialPlanContent,
  IPreparationTaskItem
} from "@/types/logistics/preparationMaterial"
import { precisionConversion } from "@/utils/common"

import PreparationDetailDialog from "./PreparationDetailDialog.vue"

defineOptions({
  name: "PreparationTaskDetail"
})

const props = withDefaults(
  defineProps<{
    selectId: string
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "close"): void
}>()

const formData = ref<IPreparationTaskItem>({} as IPreparationTaskItem)
const detailConfig = ref<ICustomDescriptionConfig[]>([
  {
    label: "仓库名称：",
    field: "warehouseName"
  },
  {
    label: "领取用途：",
    field: "useFor",
    formatter: ({ data: { useFor } }) => {
      return EnumGetMaterialPurposeMap[useFor as EnumGetMaterialPurpose]
    }
  },
  {
    label: "领料计划单号：",
    field: "planNo"
  },
  {
    label: "类型：",
    field: "type",
    formatter: ({ data: { type } }) => {
      return EnumPreparationMaterialPlanTypeMap[type as EnumPreparationMaterialPlanType]
    }
  },
  {
    label: "创建人：",
    field: "createByName"
  },
  {
    label: "创建时间：",
    field: "createTime"
  }
])

const tableData = computed(() => {
  return formData.value.planContent
})
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
      prop: "productName",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "productCode",
      label: "产品编号",
      minWidth: 160
    },
    {
      prop: "amount",
      label: "计划领取数量",
      minWidth: 120,
      align: "right",
      formatter: (row: IPreparationMaterialPlanContent) => {
        return precisionConversion(row.amount, row.decimalNumber ?? 0)
      }
    },
    {
      prop: "preparedAmount",
      label: "已领取数量",
      minWidth: 120,
      align: "right",
      formatter: (row: IPreparationMaterialPlanContent) => {
        return precisionConversion(row.preparedAmount, row.decimalNumber ?? 0)
      }
    },
    {
      prop: "unit",
      label: "单位",
      minWidth: 120,
      align: "center"
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
const visible = ref(false)
const selectedId = ref("")

onBeforeMount(() => {
  getPreparationMaterialPlanDetail(props.selectId)
})

/** 获取领料计划详情 */
const getPreparationMaterialPlanDetail = async (id: string) => {
  const data = await queryPreparationMaterialTaskDetail(id)
  if (data) {
    formData.value = data
  }
}

/** 查看领料详情 */
const onReviewDetail = (row: IPreparationMaterialPlanContent) => {
  visible.value = true
  selectedId.value = row.id
}
</script>

<style lang="scss" scoped>
.preparation-material-task-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: var(--g-color);
}

.top-content {
  padding: 12px 20px;
  border-bottom: 1px solid #e4e7ed;

  .order {
    font-weight: bold;
    line-height: 24px;
    margin-bottom: 12px;

    .status {
      margin-left: 16px;
    }
  }
}

.material-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px 20px 16px;

  .custom-detail-table {
    flex: 1;
    overflow: hidden;
  }
}
</style>
