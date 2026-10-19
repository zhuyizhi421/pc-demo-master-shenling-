<template>
  <div class="search-bar">
    <div>
      <el-input
        :model-value="'产品/包装条码'"
        readonly
        class="combined-input-left"
        style="width: 200px"
      >
        <template #append> = </template>
      </el-input>
      <el-input v-model="traceObjectCode" class="combined-input-right" style="width: 160px" />
    </div>
    <el-space :size="'large'">
      <el-button :type="'primary'" :icon="Search" @click="confirm">查询</el-button>
      <el-button class="reset-btn" :icon="RefreshRight" @click="reset">重置</el-button>
    </el-space>
  </div>
</template>

<script lang="ts" setup>
import { RefreshRight, Search } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import { ref } from "vue"

defineOptions({
  name: "SearchAndLocateSearchBar"
})

interface IProps {
  defaultObjectCode: string | undefined
}
const props = defineProps<IProps>()

const emits = defineEmits<{
  confirm: [newTraceObjectCode: string]
}>()

const traceObjectCode = ref("")
if (props.defaultObjectCode) {
  traceObjectCode.value = props.defaultObjectCode
}

// function onTraceObjectCodeChange (newVal: string) {
//   emits('update:traceObjectCode', newVal)
// }

function reset() {
  traceObjectCode.value = ""
}

function confirm() {
  if (traceObjectCode.value == undefined || traceObjectCode.value === "") {
    ElMessage.warning("产品/包装条码为空")
    return
  }

  emits("confirm", traceObjectCode.value)
}
</script>

<style lang="scss" scoped>
.search-bar {
  width: 100%;
  height: 56px;
  padding: 0 16px;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:deep(.el-button) {
    width: 112px;

    + .el-button {
      margin-left: 16px;
    }

    span {
      margin-left: 16px;
    }
  }
}

.combined-input-right {
  :deep(.el-input__wrapper) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  :deep(.el-input-group__prepend) {
    border-radius: 0;
    // box-shadow: none;
    box-shadow:
      0 1px 0 0 var(--el-input-border-color) inset,
      0 -1px 0 0 var(--el-input-border-color) inset;
  }
}

.combined-input-left {
  :deep(.el-input-group__append) {
    border-radius: 0;
    // box-shadow: none;
    box-shadow:
      0 1px 0 0 var(--el-input-border-color) inset,
      0 -1px 0 0 var(--el-input-border-color) inset;
  }
}

.reset-btn {
  background: #f0f2f5;
  border-color: #f0f2f5;
}
</style>
