<template>
  <CustomDialog v-model="visible" title="工艺路线-流程" size="medium">
    <CustomTable
      v-if="tableData.length"
      ref="tableRef"
      v-model:table-data="tableData"
      :config="tableConfig"
    >
    </CustomTable>
  </CustomDialog>
</template>

<script setup lang="ts">
import { requestCraftRouteSubTreeList } from "@/api/craft"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import { type EnumCraftType, EnumCraftTypeMap } from "@/constant/enums"

defineOptions({
  name: "CraftProcessDialog"
})

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    id: string
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
}>()

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<any[]>([])
const tableConfig = ref<ITableConfig>({
  height: 600,
  rowKey: "id",
  columns: [
    {
      prop: "processSerial",
      label: "工序",
      width: 160
    },
    {
      prop: "name",
      label: "工艺名称",
      minWidth: 160
    },
    {
      prop: "bizTypeName",
      label: "业务类型",
      minWidth: 120,
      align: "center"
    },
    {
      prop: "no",
      label: "编号",
      minWidth: 160
    },
    {
      prop: "type",
      label: "类型",
      width: 90,
      align: "center",
      formatter: ({ type }) => EnumCraftTypeMap[type as EnumCraftType]
    },
    {
      prop: "status",
      label: "状态",
      width: 90,
      align: "center",
      formatter: ({ status }) => ["", "设计中", "已发布", "已作废"][status]
    },
    {
      prop: "nature",
      label: "性质",
      width: 90,
      align: "center",
      formatter: ({ nature }) => (nature === 1 ? "自制" : "委外")
    }
  ]
})

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
})

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      nextTick(() => {
        getTableData()
      })
    } else {
      tableData.value = []
    }
  }
)

const getTableData = async () => {
  const res = await requestCraftRouteSubTreeList(props.id)
  tableData.value = handleTreeData(res)
}

const handleTreeData = (list: any[], parentReportType = 0) => {
  return list.map((item) => {
    const obj = {
      processSerial: item.processSerial,
      name: item.name,
      no: item.no,
      type: item.type,
      bizTypeName: item.bizTypeName,
      id: item.id,
      version: item.version,
      status: item.status,
      nature: item.nature,
      remarks: item.remarks,
      reportType: item.reportType,
      parentReportType,
      children: []
    }
    if (item.subTechTreeVos?.length) {
      obj.children = handleTreeData(item.subTechTreeVos, item.reportType) as []
    }
    return obj
  })
}
</script>

<style lang="scss" scoped></style>
