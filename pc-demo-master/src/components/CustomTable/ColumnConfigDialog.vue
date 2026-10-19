<template>
  <CustomDialog v-model="dialogVisible" title="字段配置" size="small">
    <div class="column-config-dialog-header">
      <el-checkbox
        v-model="isAllShow"
        :indeterminate="isIndeterminate"
        @change="handleCheckAllChange"
        >全选展示所有列</el-checkbox
      >
    </div>
    <VueDraggable
      v-model="columnConfigDialogLabelList"
      target=".el-table__body tbody"
      handle=".table-row-sort-icon"
    >
      <CustomTable v-model:table-data="columnConfigDialogLabelList" :config="tableConfig">
        <template #sort-default>
          <div class="table-row-sort-icon">
            <el-icon size="14"><Sort /></el-icon>
          </div>
        </template>

        <template #isFreezed-default="{ row }">
          <el-select v-model="row.isFreezed" placeholder="请选择">
            <el-option label="左冻结" value="left" />
            <el-option label="右冻结" value="right" />
            <el-option label="不冻结" value="default" />
          </el-select>
        </template>

        <template #isShow-default="{ row }">
          <el-switch
            v-model="row.isShow"
            @change="handleSwitchChange"
            :disabled="row.isShowDisabled"
          />
        </template>
      </CustomTable>
    </VueDraggable>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="onConfirmClick()">确定</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"
import { VueDraggable } from "vue-draggable-plus"

import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"

import type { IColumnConfigItem } from "./type"

defineOptions({
  name: "ColumnConfigDialog"
})

const props = defineProps<{
  modelValue: boolean
  columns: IColumnConfigItem[]
}>()

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void
  (e: "update:columns", val: IColumnConfigItem[]): void
  (e: "success", val: IColumnConfigItem[]): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
})

const columnConfigDialogLabelList = computed({
  get: () => props.columns,
  set: (val) => emit("update:columns", val)
})

const isAllShow = ref(true)
const isIndeterminate = computed(() => {
  return !(
    columnConfigDialogLabelList.value.every((item) => item.isShow) ||
    columnConfigDialogLabelList.value.every((item) => !item.isShow)
  )
})

const tableConfig = ref({
  height: 400,
  isOpenColumnConfig: false,
  columns: [
    {
      prop: "sort",
      label: "排序",
      width: 60,
      align: "center",
      slots: {
        default: "sort-default"
      }
    },
    {
      prop: "label",
      label: "列名称"
    },
    {
      prop: "isFreezed",
      label: "冻结列配置",
      slots: {
        default: "isFreezed-default"
      }
    },
    {
      prop: "isShow",
      label: "是否展示",
      width: 90,
      align: "center",
      slots: {
        default: "isShow-default"
      }
    }
  ]
})

const handleSwitchChange = () => {
  isAllShow.value = columnConfigDialogLabelList.value.every((item) => item.isShow)
}

const handleCheckAllChange = () => {
  if (isAllShow.value) {
    columnConfigDialogLabelList.value.forEach((item) => {
      item.isShow = true
    })
  } else {
    columnConfigDialogLabelList.value.forEach((item) => {
      if (!item.isShowDisabled) {
        item.isShow = false
      }
    })
  }
}

/** 提交操作 */
const onConfirmClick = async () => {
  if (columnConfigDialogLabelList.value.every((item) => !item.isShow)) {
    ElMessage.warning("请至少配置一个字段展示")
    return
  }
  await ElMessageBox.confirm("是否确定保存字段配置?", "提示", {
    type: "warning"
  })
  emit("success", columnConfigDialogLabelList.value)
}
</script>

<style lang="scss" scoped>
.column-config-dialog-header {
  display: flex;
  justify-content: flex-end;
}
.table-row-sort-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: move;
}
:deep(.sortable-chosen) {
  background-color: #d3d3d3 !important;
}
</style>
