<template>
  <!-- 多层组件嵌套递归展示 -->
  <!-- 如果config是数组，则递归展示 -->
  <template v-if="Array.isArray(config)">
    <template v-for="(item, index) in config" :key="index">
      <CustomRecursion v-if="!item.hidden" :config="item" v-model="item.props!.modelValue">
        <template v-for="(_, slotName) in $slots" :key="slotName" #[slotName]="slotData: ISlotData">
          <slot :name="slotName" v-bind="slotData"></slot>
        </template>
      </CustomRecursion>
    </template>
  </template>
  <!-- 如果config不是数组，则展示组件 -->
  <template v-else>
    <Component
      v-if="!propsConfigCustomChildren && !config.hidden"
      :is="config.componentType"
      :model-value="modelValue"
      v-bind="cachedProps"
      v-on="cachedEvents"
    >
      <!-- 如果子组件还有自己的内容 -->
      <template v-for="(slotName, slotKey) in config?.slots" :key="slotKey" #[slotKey]>
        <slot :name="slotName" :data="config.props || {}"></slot>
      </template>
    </Component>
    <!-- 如果config有子组件，则递归展示 -->
    <Component
      v-else
      :model-value="modelValue"
      :is="config.componentType"
      v-bind="cachedProps"
      v-on="cachedEvents"
    >
      <!-- 如果config有子组件，则递归展示 -->
      <CustomRecursion
        v-if="propsConfigCustomChildren && configCustomChildren && !config.hidden"
        :config="configCustomChildren"
        v-model="config!.props!.modelValue"
      >
        <!-- 用$slots循环，value值是第二个值，第一个值是一个迭代器 -->
        <template v-for="(_, slotName) in $slots" :key="slotName" #[slotName]="slotData: ISlotData">
          <slot :name="slotName" v-bind="slotData"></slot>
        </template>
      </CustomRecursion>
      <!-- 用config?.slots循环，value值是第一个值，key是第二个值 -->
      <template v-for="(slotName, slotKey) in config?.slots" :key="slotKey" #[slotKey]>
        <slot :name="slotName" :data="config.props || {}"></slot>
      </template>
    </Component>
  </template>
</template>

<script setup lang="ts">
import type { ICustomRecursionConfig } from "./type"

type ISlotData = Record<string, unknown>

const props = withDefaults(
  defineProps<{
    config: ICustomRecursionConfig | ICustomRecursionConfig[]
    modelValue?: any
  }>(),
  { modelValue: null }
)

const emit = defineEmits<{ (e: "update:modelValue", value: any): void }>()

defineOptions({ name: "CustomRecursion" })

// ts类型断言
const propsConfigCustomChildren = computed(() => {
  const children = (props.config as ICustomRecursionConfig).props?.customChildren as any
  return children?.length
})

const configCustomChildren = computed(() => {
  const customChildren = (props.config as ICustomRecursionConfig)?.props?.customChildren
  return isRef(customChildren) ? customChildren.value : customChildren
})

/**
 * el表单组件默认配置
 */
const defaultProps: Record<string, Record<string, any>> = {
  "el-input": { maxlength: 20, clearable: true },
  "el-select": {
    clearable: true,
    collapseTags: true,
    collapseTagsTooltip: true,
    maxCollapseTags: 1
  },
  "el-select-v2": {
    clearable: true,
    collapseTags: true,
    collapseTagsTooltip: true,
    maxCollapseTags: 1
  },
  "el-cascader": { clearable: true },
  "el-date-picker": { editable: false, clearable: true },
  "el-time-picker": { editable: false, clearable: true }
}

/**
 * 对象深度合并
 * @param target 目标对象
 * @param source 源对象
 * @returns 合并后的对象
 */
const deepMerge = (target: Record<string, any>, source: Record<string, any>) => {
  const result = { ...target }

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (source[key] !== null && typeof source[key] === "object" && !Array.isArray(source[key])) {
        // 如果是对象且不是数组，则递归合并
        if (typeof result[key] === "object" && !Array.isArray(result[key])) {
          result[key] = deepMerge(result[key], source[key])
        } else {
          // 目标不是对象或是数组，直接覆盖
          result[key] = { ...source[key] }
        }
      } else {
        // 基本类型或数组，直接覆盖
        result[key] = source[key]
      }
    }
  }

  return result
}

/**
 * 为props设置默认属性
 */
const buildProps = (config: ICustomRecursionConfig) => {
  if (typeof config.componentType !== "string") {
    // 自定义组件
    return config.props || {}
  }

  const defaultPropForComponent = defaultProps[config.componentType]
  if (!defaultPropForComponent) {
    return config.props || {}
  }

  // 创建一个新的props对象，排除modelValue属性，因为我们单独处理它
  // 多层组件嵌套时，modelValue会作为props传递给子组件，所以需要单独处理
  // 只作为当前组件的modelValue，不作为props传递给子组件
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { modelValue, ...restProps } = config.props || {}
  return deepMerge(defaultPropForComponent, restProps)
}

/**
 * 构建事件处理函数
 */
const buildEvents = (config: ICustomRecursionConfig) => {
  const events = { ...(config.events || {}) }
  if (!events["update:modelValue"]) {
    events["update:modelValue"] = (value: any) => {
      emit("update:modelValue", value)
    }
  }
  return events
}

/**
 * 缓存 props
 */
const cachedProps = computed(() => {
  return buildProps(props.config as ICustomRecursionConfig)
})

/**
 * 缓存事件
 */
const cachedEvents = computed(() => {
  return buildEvents(props.config as ICustomRecursionConfig)
})

// 监听 props.config 的变化，手动触发更新
// watch(
//   () => props.config,
//   () => {
//     // 触发 cachedProps 和 cachedEvents 的重新计算
//     cachedProps.value // 访问 cachedProps 以触发计算
//     cachedEvents.value // 访问 cachedEvents 以触发计算
//   },
//   { deep: true }
// ) // 使用 deep 选项以确保深度监听
</script>

<style scoped lang="scss"></style>
