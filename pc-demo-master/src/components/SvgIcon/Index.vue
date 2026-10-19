<template>
  <svg :class="svgClass" aria-hidden="true">
    <use :xlink:href="iconName" :fill="color" />
  </svg>
</template>

<script setup lang="ts">
defineOptions({
  name: "SvgIcon"
})

const props = defineProps<{
  iconClass?: string
  className?: string
  color?: string
}>()

const iconName = computed(() => `#icon-${props.iconClass}`)
const svgClass = computed(() => {
  if (props.className) {
    return `svg-icon ${props.className}`
  }
  return "svg-icon"
})
</script>

<style scope lang="scss">
.sub-el-icon,
.nav-icon {
  display: inline-block;
  font-size: 15px;
  margin-right: 12px;
  position: relative;
}

.svg-icon {
  width: 1em !important;
  height: 1em;
  position: relative;
  fill: currentColor;
  vertical-align: -2px;
  margin-right: 10px;
  margin-left: 10px;
}
</style>
