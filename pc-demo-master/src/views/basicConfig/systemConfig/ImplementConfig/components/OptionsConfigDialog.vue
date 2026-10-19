<!-- 自定义组件相关，暂不修改及删除 -->
<template>
  <el-dialog v-model="dialogVisible" title="编辑选项" width="700" @close="emit('close')">
    <div class="dialog-content">
      <div class="title">
        <span>选项列表</span>
        <el-button type="primary" @click="onAddRowClick()" icon="Plus">新增选项</el-button>
      </div>
      <el-form ref="formRef" :model="formData" :rules="rules">
        <el-table
          :data="formData.tableData"
          border
          height="500"
          style="width: 100%; margin-bottom: 16px"
        >
          <el-table-column type="index" label="展示顺序" width="100" align="center" />
          <el-table-column label="选项名称" min-width="180" align="center">
            <template #default="{ row, $index }">
              <el-form-item :prop="`tableData.${$index}.label`" :rules="rules.label">
                <el-input v-model="row.label" placeholder="请输入" maxlength="50" clearable />
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="启用状态" width="120" align="center">
            <template #default="{ row }">
              <el-switch v-model="row.isActive" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right" align="center">
            <template #default="{ $index }">
              <div class="operation">
                <el-icon v-if="$index !== 0" @click="onMoveClick($index, SortDirection.UP)">
                  <Top />
                </el-icon>
                <el-icon
                  v-if="$index !== formData.tableData.length - 1"
                  @click="onMoveClick($index, SortDirection.DOWN)"
                >
                  <Bottom />
                </el-icon>

                <el-button type="danger" @click="onDeleteRowClick($index)" link>删除选项</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
    </div>
    <template #footer>
      <div>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onConfirmClick()"> 确定 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { type ElForm, ElMessage, type FormRules } from "element-plus"

import type { ICustomSelectOption } from "@/types/base-info/implement-config"

interface IProps {
  data: ICustomSelectOption[]
}

enum SortDirection {
  UP = "up",
  DOWN = "down"
}

const props = withDefaults(defineProps<IProps>(), {})
const emit = defineEmits<{
  (e: "success", data: ICustomSelectOption[]): void
  (e: "close"): void
}>()

const formRef = ref<InstanceType<typeof ElForm> | null>(null)
const formData: { tableData: ICustomSelectOption[] } = reactive({
  tableData: []
})
const rules = reactive<FormRules<ICustomSelectOption>>({
  label: [
    {
      required: true,
      message: "请输入选项名称",
      trigger: "blur"
    }
  ]
})

const dialogVisible = ref(true)

watchEffect(() => {
  formData.tableData = cloneDeep(props.data)
})

/** 新增选项按钮点击事件 */
const onAddRowClick = () => {
  formData.tableData.push({
    label: "",
    value: "",
    isActive: true
  })
}

/** 移动选项按钮点击事件 */
const onMoveClick = (index: number, direction: SortDirection) => {
  const targetIndex = direction === SortDirection.UP ? index - 1 : index + 1
  const temp = formData.tableData[index]
  formData.tableData[index] = formData.tableData[targetIndex]
  formData.tableData[targetIndex] = temp
}

/** 删除选项按钮点击事件 */
const onDeleteRowClick = (index: number) => {
  formData.tableData.splice(index, 1)
}

/** 确认按钮点击事件 */
const onConfirmClick = () => {
  formRef.value?.validate((valid: boolean) => {
    if (!valid) {
      return
    }

    // 选项名称去重
    const nameList = new Set(formData.tableData.map((item) => item.label))
    if (nameList.size !== formData.tableData.length) {
      ElMessage.error("选项名称不能重复")
      return
    }

    // 规范化数据
    const data = formData.tableData.map((item) => {
      return {
        label: item.label,
        value: item.label,
        isActive: item.isActive
      }
    })
    emit("close")
    emit("success", data)
  })
}
</script>

<style lang="scss" scoped>
.dialog-content {
  &:deep(.el-form-item--default) {
    margin-bottom: 0;
  }
}

.title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 16px;
}

.operation {
  display: flex;
  justify-content: center;
  align-items: center;

  > i {
    margin-right: 8px;
    cursor: pointer;
  }
}
</style>
