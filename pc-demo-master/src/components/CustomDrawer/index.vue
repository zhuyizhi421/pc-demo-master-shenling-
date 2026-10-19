<template>
  <div class="custom-drawer">
    <el-drawer
      v-model="drawerVisible"
      :size="getDrawerWidth(props.size)"
      :append-to-body="props.appendToBody"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="emit('close')"
    >
      <template #header>
        <div class="custom-drawer-title">
          <slot name="header">
            {{ props.title }}
          </slot>
        </div>
      </template>

      <div class="custom-drawer-content" v-loading="props.loading">
        <slot></slot>
      </div>

      <template #footer>
        <div v-if="$slots.footer" class="custom-drawer-footer">
          <slot name="footer"></slot>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import type { ICustomDrawerEmits, ICustomDrawerProps } from "./type"

defineOptions({
  name: "CustomDrawer"
})

const props = withDefaults(defineProps<ICustomDrawerProps>(), {
  title: "",
  size: "default",
  appendToBody: false,
  modal: true,
  loading: false
})
const emit = defineEmits<ICustomDrawerEmits>()

const drawerVisible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
})

const drawerSize: Record<string, number> = {
  mini: 400,
  default: 800,
  medium: 1000,
  large: 1200
}

/** 获取抽屉宽度 */
const getDrawerWidth = (size: string) => {
  return drawerSize[size]
}
</script>

<style lang="scss" scoped>
.custom-drawer {
  &:deep(.el-drawer) {
    padding: 0;

    .el-drawer__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 62px;
      padding: 0 20px;
      margin: 0;
      border-bottom: 1px solid #dcdfe6;
      position: relative;

      .el-drawer__close-btn {
        height: 100%;
        font-size: 22px;
        padding: 0;
        position: absolute;
        right: 0;
        top: 0;
        width: 48px;

        .el-icon {
          align-items: center;
          display: inline-flex;
          justify-content: center;
          height: 100%;
          width: 100%;
        }
      }
    }

    .el-drawer__body {
      padding: 0;

      .custom-drawer-content {
        padding: 12px 20px;
        height: 100%;
        overflow-y: auto;
      }
    }

    .el-drawer__footer {
      padding: 0;
      border: none;

      .custom-drawer-footer {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        height: 64px;
        padding: 0 20px;
        border-top: 1px solid #dcdfe6;
      }
    }
  }

  .custom-drawer-title {
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
