<template>
  <el-input
    v-model="innerValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :size="size"
    :maxlength="maxlength"
    @input="handleInput"
    @blur="handleBlur"
    @focus="handleFocus"
    :clearable="clearable"
  />
</template>

<script lang="ts" setup>
defineOptions({
  name: "PositiveIntInput"
})

// 定义 Props----正整数组件
const props = withDefaults(
  defineProps<{
    modelValue: number | string
    placeholder?: string
    disabled?: boolean
    size?: "large" | "default" | "small"
    maxlength?: number
    clearable?: boolean
  }>(),
  {
    placeholder: "",
    disabled: false,
    size: "default",
    maxlength: undefined,
    clearable: true
  }
)

// 定义 Emits
const emit = defineEmits<{
  (e: "update:modelValue", value: number | string): void
  (e: "input", value: number | string): void
  (e: "blur", event: FocusEvent): void
  (e: "focus", event: FocusEvent): void
}>()

// 内部数据
const innerValue = ref<string | number>(props.modelValue)

// 监听外部 `modelValue` 的变化，更新内部值
watch(
  () => props.modelValue,
  (newValue) => {
    innerValue.value = newValue || ""
  }
)

// 输入处理
const handleInput = (value: string) => {
  const sanitizedValue = sanitizeInput(value)
  innerValue.value = sanitizedValue
  emit("update:modelValue", sanitizedValue)
  emit("input", sanitizedValue)
}

// 失焦处理
const handleBlur = (event: FocusEvent) => {
  const finalValue = innerValue.value === "" ? "" : Number(innerValue.value)
  emit("update:modelValue", finalValue)
  emit("blur", event)
}

// 聚焦处理
const handleFocus = (event: FocusEvent) => {
  emit("focus", event)
}

// 输入过滤：仅允许正整数，禁止输入 0 和以 0 开头的数字
function sanitizeInput(value: string): string {
  // 移除所有非数字字符
  const sanitized = value.replace(/\D/g, "")

  // 如果输入为空或为 0 或以 0 开头，则返回空字符串
  if (sanitized === "" || sanitized === "0" || sanitized.startsWith("0")) {
    return ""
  }

  return sanitized
}
</script>
