<template>
  <el-tooltip v-if="showTooltip" :content="tooltip" placement="bottom" effect="light">
    <span class="tooltip-wrapper">
      <el-button v-bind="buttonProps" :disabled="disabled">
        <slot />
      </el-button>
    </span>
  </el-tooltip>
  <el-button v-else v-bind="buttonProps" :disabled="disabled">
    <slot />
  </el-button>
</template>

<script lang="ts" setup>
import type { ButtonProps } from "element-plus"

interface Props extends Partial<ButtonProps> {
  tooltip?: string
}

const props = defineProps<Props>()

const { tooltip, disabled } = toRefs(props)

const showTooltip = computed(() => {
  return !!tooltip.value && disabled.value
})

// 将除了 tooltip 之外的所有 props 传给 el-button
const buttonProps = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { tooltip, ...others } = props
  return others
})

defineOptions({
  name: "CustomTooltipButton"
})
</script>

<style scoped>
/* 用 span 包 el-button 是为了保证 tooltip 能包裹住 disabled 的 button */
.tooltip-wrapper {
  display: inline-block;
  cursor: not-allowed;
}
</style>
