<template>
  <CustomDialog v-model="visible" title="上岗证详情" size="medium">
    <CustomTable
      ref="customTableRef"
      v-model:table-data="customTableData"
      :config="tableConfig"
      :query-config="queryConfig"
      class="custom-table"
    >
      <template #licenseStatus-default="{ row }">
        <el-tag :type="row.licenseStatus === 0 ? 'success' : 'danger'">
          {{ EnumLicenseStatus[row.licenseStatus] }}
        </el-tag>
      </template>

      <template #operation-default="{ row }">
        <el-button link type="primary" size="small" @click="operationClick(row)">
          {{ formatOperation(row.licenseStatus) }}</el-button
        >
      </template>
    </CustomTable>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { queryLicenseApply, queryLicenseFreeze, queryLicenseListById } from "@/api/license"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import type { ILicenseItemDetail as ITableRow } from "@/types/base-info/employee"

const visible = ref(false)

const EnumLicenseStatus: Record<string, string> = {
  0: "正常",
  1: "冻结"
}

const empId = ref("")

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "400px",
  columns: [
    {
      prop: "licenseId",
      label: "上岗证编号",
      minWidth: 160
    },
    {
      prop: "licenseName",
      label: "上岗证名称",
      minWidth: 160
    },
    {
      prop: "licenseJobName",
      label: "所属岗位",
      width: 160
    },
    {
      prop: "licenseStatus",
      label: "上岗证状态",
      width: 120,
      align: "center",
      slots: {
        default: "licenseStatus-default"
      }
    },
    {
      prop: "licenseExpireTime",
      label: "过期时间",
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

function setVisible(value: boolean, _empId: string) {
  visible.value = value
  empId.value = _empId
  nextTick(() => {
    customTableRef.value?.requestData()
  })
}

/** 格式化操作按钮文字 */
const formatOperation = (status: number) => {
  return status === 0 ? "手动冻结" : status === 1 ? "申请解冻" : "-"
}

/** 操作按钮点击事件 */
const queryConfig: ITableRequestConfig<[{ empId: string }], ITableRow, false> = {
  api: queryLicenseListById,
  getParams: () => {
    return [
      {
        empId: empId.value
      }
    ]
  }
}

const operationClick = async (licenseData: ITableRow) => {
  if (licenseData.licenseStatus === 1) {
    // 申请解冻
    await queryLicenseApply({
      applyType: 2,
      empIds: [licenseData.empId],
      licenseIds: [licenseData.licenseId]
    })
    customTableRef.value?.requestData()
    ElMessage({
      type: "success",
      message: "已申请解冻"
    })
  } else if (licenseData.licenseStatus === 0) {
    // 手动冻结
    await queryLicenseFreeze({
      empId: licenseData.empId,
      licenseId: licenseData.licenseId
    })
    customTableRef.value?.requestData()
    ElMessage({
      type: "success",
      message: "已申请冻结"
    })
  }
}

defineExpose({
  setVisible
})
</script>
