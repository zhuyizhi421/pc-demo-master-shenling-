<!-- 标题组件 -->
<template>
  <div
    class="custom-title"
    :class="props.isTableTitle ? 'custom-title-table' : 'custom-title-detail'"
  >
    <h2
      class="custom-title-text"
      :class="props.showShortBar && 'short-bar-custom-title-text'"
      :style="{
        fontSize: props.size + 'px',
        fontWeight: props.weight,
        '--color': props.color
      }"
    >
      <!-- title slot  -->
      <slot name="title">{{ props.title }}</slot>
    </h2>
    <div class="custom-title-operation">
      <!-- operation slot  -->
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type ICustomTitleProps } from "./type"

defineOptions({
  name: "CustomTitle"
})

const props = withDefaults(defineProps<ICustomTitleProps>(), {
  size: 16,
  color: "#000",
  weight: "bold",
  isTableTitle: true,
  showShortBar: false
})
</script>

<style lang="scss" scoped>
.custom-title {
  display: flex;
  justify-content: space-between;
  align-items: center;

  &.custom-title-table {
    margin: 20px 0 16px;
  }
  &.custom-title-detail {
    margin: 12px 0 18px;
  }
  .custom-title-text {
    height: 32px;
    line-height: 32px;
    margin: 0;
    color: var(--color);
    flex: none;

    &.short-bar-custom-title-text {
      position: relative;
      padding-left: 12px;

      &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 4px;
        height: 24px;
        width: 4px;
        background-color: var(--color);
      }
    }
  }
}
</style>
