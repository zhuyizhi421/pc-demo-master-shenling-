<!-- 人-上岗证列表 -->
<template>
  <div class="person-tab">
    <CustomTitle title="上岗证列表">
      <div>
        <el-button type="primary" icon="Plus" @click="onCreateLicenseClick()">新增上岗证</el-button>
      </div>
    </CustomTitle>

    <CustomTable
      ref="customTableRef"
      v-model:table-data="customTableData"
      :config="tableConfig"
      class="custom-table"
    >
      <template #operation-default="{ $index }">
        <el-button link type="danger" @click="onDeleteRowClick($index)" size="small"
          >删除</el-button
        >
      </template>
    </CustomTable>

    <div class="operation">
      <el-button type="primary" @click="onSaveClick()">保存</el-button>
    </div>

    <!-- 上岗证弹窗 -->
    <LicenseAddDialog
      v-if="licenseVisible"
      @close="licenseVisible = false"
      @success="onLicenseAddSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { getTechStandardManList, saveTechStandardManList } from "@/api/craft"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"

import LicenseAddDialog from "./LicenseAddDialog.vue"

interface ITableRow {
  id: string
  licenseId: string
  licenseName: string
  jobName: string
  count: number
  type: number
}

defineOptions({
  name: "PersonTab"
})

const props = withDefaults(
  defineProps<{
    techVersionId: string
  }>(),
  {}
)

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "400px",
  columns: [
    {
      prop: "licenseName",
      label: "上岗证名称",
      minWidth: 160
    },
    {
      prop: "jobName",
      label: "所属岗位",
      minWidth: 160
    },
    {
      prop: "operation",
      label: "操作",
      width: 80,
      fixed: "right",
      align: "center",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const licenseVisible = ref(false)
const hasChange = ref(false) // 是否有修改

onBeforeMount(() => {
  getPersonTableData()
})

/** 获取人员上岗证表格数据 */
const getPersonTableData = async () => {
  const data = await getTechStandardManList({
    techVersionId: props.techVersionId
  })
  customTableData.value = data.map((item) => {
    return {
      id: item.id,
      licenseId: item.license.id,
      licenseName: item.license.licenseName,
      jobName: item.license.jobName,
      count: item.count,
      type: item.type
    }
  })
  hasChange.value = false
}

/** 新增上岗证 */
const onCreateLicenseClick = () => {
  licenseVisible.value = true
}

/** 删除表格行 */
const onDeleteRowClick = async (index: number) => {
  const confirm = await ElMessageBox.confirm("确定删除确认删除该行数据?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    closeOnPressEscape: false,
    autofocus: false,
    type: "warning"
  })
  if (confirm === "confirm") {
    customTableData.value.splice(index, 1)
    hasChange.value = true
  }
}

/** 上岗证新增成功回调 */
const onLicenseAddSuccess = (data: any[]) => {
  let curTableId = customTableData.value.map((item) => item.licenseId)
  data.forEach((item) => {
    if (!curTableId.includes(item.licenseId)) {
      customTableData.value.push({
        id: "",
        licenseId: item.licenseId,
        licenseName: item.licenseName,
        jobName: item.jobName,
        count: 1,
        type: 3
      })
      hasChange.value = true
    }
  })
}

/** 保存 */
const onSaveClick = async (isUpdate: boolean = true) => {
  hasChange.value = false
  let list = customTableData.value.map((item) => {
    return {
      id: item.id,
      refId: item.licenseId,
      count: item.count,
      type: item.type
    }
  })
  const params = {
    techVersionId: props.techVersionId,
    manReqList: list
  }
  await saveTechStandardManList(params)
  ElMessage.success("保存成功")
  isUpdate && getPersonTableData()
}

/** 更新数据 */
const updateTableData = () => {
  if (hasChange.value) {
    onSaveClick(false)
  }
}

defineExpose({ updateTableData })
</script>

<style lang="scss" scoped>
.operation {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin: 20px 20px 0 20px;
}
</style>
