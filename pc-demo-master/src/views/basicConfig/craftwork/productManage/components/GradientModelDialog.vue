<template>
  <CustomDialog v-model="visible" title="梯度模型详情" size="medium">
    <CustomDescription
      :data="detailForm"
      :configs="detailConfig"
      :label-width="80"
      :columns="3"
      style="padding: 10px 0 20px"
    ></CustomDescription>

    <CustomTable
      ref="customTableRef"
      v-model:table-data="customTableData"
      :config="tableConfig"
      class="custom-table"
    >
    </CustomTable>

    <template #footer>
      <el-button @click="visible = false">返回</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { queryGradientDetail } from "@/api/quality/gradientModel"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import useResetRef from "@/hooks/useResetRef"
import type {
  GradientDetailModel,
  GradientListModel as ITableRow
} from "@/types/quality-manage/inspection-task"

defineOptions({
  name: "GradientModelDialog"
})

const props = defineProps<{
  modelValue: boolean
  id: string
}>()

const emits = defineEmits<{
  (e: "update:modelValue", show: boolean): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emits("update:modelValue", val)
})

const modelStatusResType = ref<{ label: string; value: number }[]>([
  {
    label: "停用",
    value: 0
  },
  {
    label: "启用",
    value: 1
  }
])

const [detailForm, resetDetailForm] = useResetRef<GradientDetailModel>({
  id: "",
  itemList: [],
  modelName: "",
  modelNo: "",
  remarks: "",
  status: 0
})

const detailConfig = ref<ICustomDescriptionConfig[]>([
  {
    field: "modelNo",
    label: "梯度编号："
  },
  {
    field: "modelName",
    label: "梯度名称："
  },
  {
    field: "status",
    label: "状态：",
    formatter: ({ data: { status } }) => {
      return modelStatusResType.value.find((item) => item.value === status)?.label
    }
  },
  {
    field: "remarks",
    label: "备注：",
    colspan: -1
  }
])

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "250px",
  columns: [
    {
      prop: "seqNo",
      label: "序号",
      width: 60,
      align: "center"
    },
    {
      prop: "batchNumMin",
      label: "批量下限",
      minWidth: 160
    },
    {
      prop: "batchNumMax",
      label: "批量上限",
      minWidth: 160
    },
    {
      prop: "sampleNum",
      label: "样本数",
      minWidth: 160
    }
  ]
})

watch(
  () => props.modelValue,
  async (val) => {
    if (val) {
      detailForm.value = await queryGradientDetail({ modelId: props.id })
      customTableData.value = detailForm.value.itemList
    } else {
      resetDetailForm()
      customTableData.value = []
    }
  }
)
</script>
