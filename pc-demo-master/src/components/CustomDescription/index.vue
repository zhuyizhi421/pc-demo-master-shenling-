<template>
  <div
    class="custom-description"
    :style="{
      'grid-template-columns': props.columns
        ? `repeat(${props.columns}, 1fr)`
        : `repeat(auto-fit, minmax(340px, 1fr))`
    }"
  >
    <template v-for="config in props.configs" :key="config.field">
      <div
        class="custom-description-item"
        v-if="typeof config.hidden === 'function' ? !config.hidden() : !config.hidden"
        :style="getItemStyle(config)"
      >
        <div class="item-label" :style="{ width: props.labelWidth + 'px' }">
          <slot :name="config.slots?.label" :config="config">{{ config.label }}</slot>
        </div>
        <div class="item-content">
          <slot :name="config.slots?.content" :config="config" :format="formatContent">{{
            formatContent(config)
          }}</slot>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { type ICustomDescriptionConfig, type ICustomDescriptionProps } from "./type"

defineOptions({
  name: "CustomDescription"
})

const props = withDefaults(defineProps<ICustomDescriptionProps>(), {
  labelWidth: 120
})

/**
 * 获取项目样式
 */
const getItemStyle = (item: ICustomDescriptionConfig) => {
  if (item.colspan) {
    return { "grid-column": item.colspan > 0 ? `span ${item.colspan}` : "1/-1" }
  }

  return { "grid-column": "span 1" }
}

/**
 * 格式化内容
 * 优先使用 formatter方法，如果没有，则使用源数据中对应字段的值
 */
const formatContent = (config: ICustomDescriptionConfig) => {
  const { formatter, field } = config
  if (formatter) {
    return formatter({ field, data: props.data })
  }

  return props.data?.[field]
}
</script>

<style lang="scss" scoped>
.custom-description {
  display: grid;
  gap: 12px 20px;
  padding: 16px 20px 12px;
  overflow: hidden;

  .custom-description-item {
    display: flex;
    line-height: 20px;
    font-size: 14px;

    .item-label {
      text-align: right;
      flex: none;
      color: #a8abb2;
    }

    .item-content {
      flex: auto;
      word-break: break-all;
      color: #303133;
    }
  }
}
</style>
