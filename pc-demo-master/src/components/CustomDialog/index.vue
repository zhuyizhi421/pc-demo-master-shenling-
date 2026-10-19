<template>
  <div class="custom-dialog">
    <el-dialog
      v-model="dialogVisible"
      :width="getDialogWidth(props.size)"
      :append-to-body="props.appendToBody"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      draggable
      @close="emit('close')"
    >
      <template #header>
        <div class="custom-dialog-title">
          <slot name="header">
            {{ props.title }}
          </slot>
        </div>
      </template>

      <div class="custom-dialog-content" v-loading="props.loading">
        <slot></slot>
      </div>

      <template #footer>
        <div v-if="$slots.footer" class="custom-dialog-footer">
          <slot name="footer"></slot>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import type { ICustomDialogEmits, ICustomDialogProps } from "./type"

defineOptions({
  name: "CustomDialog"
})

const props = withDefaults(defineProps<ICustomDialogProps>(), {
  title: "",
  size: "default",
  appendToBody: false,
  modal: true,
  loading: false
})
const emit = defineEmits<ICustomDialogEmits>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
})

const dialogSize: Record<string, number> = {
  mini: 400,
  default: 560,
  small: 720,
  medium: 960,
  large: 1200,
  xlarge: 1440
}

/** 获取弹窗宽度 */
const getDialogWidth = (size: string) => {
  return dialogSize[size]
}
</script>

<style lang="scss" scoped>
.custom-dialog {
  &:deep(.el-dialog) {
    padding: 0;

    .el-dialog__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 62px;
      padding: 0 20px;
      margin: 0;
      border-bottom: 1px solid #dcdfe6;
      position: relative;

      .el-dialog__headerbtn {
        height: 100%;
        font-size: 22px;
        padding-top: 5px;
      }
    }

    .el-dialog__body {
      padding: 0;

      .custom-dialog-content {
        padding: 12px 20px;
      }
    }

    .el-dialog__footer {
      padding: 0;
      border: none;

      .custom-dialog-footer {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        height: 64px;
        padding: 0 20px;
        border-top: 1px solid #dcdfe6;
      }
    }
  }

  .custom-dialog-title {
    display: flex;
    align-items: center;
    font-size: 18px;
    font-weight: bold;
    color: #303133;

    &::before {
      content: "";
      display: block;
      width: 4px;
      height: 26px;
      background-color: #303133;
      margin-right: 8px;
    }
  }
}
</style>
