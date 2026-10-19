<!-- 页面面包屑 -->
<template>
  <div class="custom-page-crumbs">
    <template v-for="(item, index) in curRouteList" :key="item.key">
      <div
        class="crumbs-item"
        :class="{ active: modelValue === item.key }"
        @click="onCrumbItemClick(item)"
      >
        {{ item.name }}
      </div>
      <el-icon v-if="index !== curRouteList.length - 1"><ArrowRight /></el-icon>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox } from "element-plus"

import type { IConfirmConfig, ICustomPageCrumbsProps, IKey, IPageCrumbsItem } from "./type"

defineOptions({
  name: "CustomPageCrumbs"
})

const props = withDefaults(defineProps<ICustomPageCrumbsProps>(), {})
const emit = defineEmits<{
  (event: "update:modelValue", value: IKey): void
  (event: "change", value: IKey): void
}>()

const curRouteList = computed(() => {
  return getCurRoute(props.data, props.modelValue)
})

/** 获取当前路由的面包屑数据 */
const getCurRoute = (data: IPageCrumbsItem[], key: IKey): IPageCrumbsItem[] => {
  const route: IPageCrumbsItem[] = []
  let isFind = false

  const deepFind = (data: IPageCrumbsItem[], key: IKey) => {
    if (isFind) {
      return
    }

    for (let i = 0; i < data.length; i++) {
      if (isFind) {
        return
      }
      if (i !== 0) {
        route.pop()
      }
      route.push(data[i])
      if (data[i].key === key) {
        isFind = true
        return
      }
      if (data[i].children?.length) {
        deepFind(data[i].children!, key)
      }
    }

    if (!isFind) {
      route.pop()
    }
  }

  deepFind(data, key)
  return route
}

/** 合并确认配置，单个项配置优先级高于全局配置 */
const mergeConfirmConfig = (
  itemConfig?: IConfirmConfig,
  globalConfig?: IConfirmConfig
): IConfirmConfig | undefined => {
  if (!itemConfig && !globalConfig) return undefined

  return {
    enabled: itemConfig?.enabled ?? globalConfig?.enabled ?? false,
    title: itemConfig?.title ?? globalConfig?.title ?? "确认切换",
    message: itemConfig?.message ?? globalConfig?.message ?? "确定要切换到该页面吗？",
    confirmText: itemConfig?.confirmText ?? globalConfig?.confirmText ?? "确定",
    cancelText: itemConfig?.cancelText ?? globalConfig?.cancelText ?? "取消",
    type: itemConfig?.type ?? globalConfig?.type ?? "warning"
  }
}

/** 执行页面切换 */
const executePageChange = (data: IPageCrumbsItem) => {
  emit("update:modelValue", data.key)
  if (props.modelValue !== data.key) {
    emit("change", data.key)
  }
}

/** 点击面包屑项触发的事件 */
const onCrumbItemClick = async (data: IPageCrumbsItem) => {
  // 如果点击的是当前页面，不需要任何操作
  if (props.modelValue === data.key) {
    return
  }

  // 获取当前页面的数据项
  const currentPageData = findPageData(props.data, props.modelValue)

  // 合并确认配置 - 使用当前页面的配置，而不是目标页面的配置
  const confirmConfig = mergeConfirmConfig(
    currentPageData?.confirmConfig,
    props.globalConfirmConfig
  )

  // 如果不需要确认，直接执行切换
  if (!confirmConfig?.enabled) {
    executePageChange(data)
    return
  }

  try {
    // 显示确认对话框
    await ElMessageBox.confirm(confirmConfig.message!, confirmConfig.title!, {
      confirmButtonText: confirmConfig.confirmText,
      cancelButtonText: confirmConfig.cancelText,
      type: confirmConfig.type
    })

    // 用户确认后执行切换
    executePageChange(data)
  } catch {
    // 用户取消，不执行任何操作
  }
}

/** 根据key查找页面数据 */
const findPageData = (data: IPageCrumbsItem[], key: IKey): IPageCrumbsItem | undefined => {
  for (const item of data) {
    if (item.key === key) {
      return item
    }
    if (item.children?.length) {
      const found = findPageData(item.children, key)
      if (found) {
        return found
      }
    }
  }
  return undefined
}

defineExpose({
  getCurRoute: () => cloneDeep(curRouteList.value)
})
</script>

<style lang="scss" scoped>
.custom-page-crumbs {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  border: 1px solid #e4e7ed;
  padding: 7px 0 7px 8px;
  color: #c0c4cc;
  font-size: 14px;

  .crumbs-item {
    margin: 0 9px;
    cursor: pointer;

    &.active {
      color: #909399;
      padding: 2px 12px;
      background: #f0f2f5;
      border-radius: 4px;
    }
  }
}
</style>
