<template>
  <CustomDialog v-model="dialogVisible" title="员工明细" size="medium" @close="emit('close')">
    <CustomTable
      ref="customTableRef"
      v-model:table-data="customTableData"
      :config="tableConfig"
      :query-config="queryConfig"
      class="custom-table"
    >
      <template #isFreeze-default="{ row }">
        <el-tag v-if="row.isFreeze" type="success">是</el-tag>
        <el-tag v-else type="danger">否</el-tag>
      </template>
    </CustomTable>
  </CustomDialog>
</template>

<script setup lang="ts">
import { queryEmployeeDetail } from "@/api/license"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import type { ILicenseEmployeeDetail as ITableRow } from "@/types/base-info/employee"

const emit = defineEmits<{
  (e: "success"): void
  (e: "close"): void
}>()

const dialogVisible = ref(false)

const licenseId = ref("")

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "400px",
  columns: [
    {
      prop: "empNo",
      label: "员工编号",
      minWidth: 160
    },
    {
      prop: "barcode",
      label: "标签码",
      minWidth: 160
    },
    {
      prop: "empName",
      label: "姓名",
      minWidth: 160
    },
    {
      prop: "depName",
      label: "所属部门",
      minWidth: 160
    },
    {
      prop: "isFreeze",
      label: "是否冻结",
      width: 120,
      align: "center",
      slots: {
        default: "isFreeze-default"
      }
    }
  ]
})

const onOpen = (_licenseId: string) => {
  dialogVisible.value = true
  licenseId.value = _licenseId
  nextTick(async () => {
    await customTableRef.value?.requestData()
  })
}

const queryConfig: ITableRequestConfig<[{ id: string }], ITableRow, false> = {
  api: queryEmployeeDetail,
  getParams: () => {
    return [
      {
        id: licenseId.value
      }
    ]
  }
}

defineExpose({
  onOpen
})
</script>

<style lang="scss" scoped>
.form-style {
  margin: 20px 0;
}
</style>
