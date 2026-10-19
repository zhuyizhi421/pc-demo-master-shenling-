<template>
  <el-input
    type="text"
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
  name: "NoNegativeInput"
})

// 定义 Props----非负数组件
const props = withDefaults(
  defineProps<{
    modelValue: number | string
    placeholder?: string
    disabled?: boolean
    size?: "large" | "default" | "small"
    maxlength?: number
    max?: number
    clearable?: boolean
  }>(),
  {
    placeholder: "",
    disabled: false,
    size: "default",
    maxlength: undefined,
    max: undefined,
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

// 输入过滤：仅保留大于等于 0 的数字，且小数点只能出现一次，多个零前缀处理，不能以小数点开头
function sanitizeInput(value: string): string {
  // 如果以小数点开头，去掉小数点
  if (value.startsWith(".")) {
    value = value.slice(1) // 去掉首位的 '.'
  }

  // 移除非数字和小数点字符
  const sanitized = value.replace(/[^\d.]/g, "")

  // 如果小数点出现多次，只保留第一个
  const parts = sanitized.split(".")
  const sanitizedValue = parts[0] + (parts.length > 1 ? "." + parts[1] : "")

  // 处理多个零前缀：如果值是纯数字并且是以 0 开头，且没有小数点，去掉多余的 0
  if (/^\d+$/.test(sanitizedValue)) {
    // 如果是纯数字且大于 0，保留一个 0
    const pureNum = sanitizedValue.replace(/^0+(\d)/, "$1") || "0"
    // 新增max判断
    if (props.max !== undefined && Number(pureNum) > props.max) {
      return String(props.max)
    }
    return pureNum
  }

  // 新增max判断（针对小数）
  if (
    sanitizedValue !== "" &&
    !isNaN(Number(sanitizedValue)) &&
    props.max !== undefined &&
    Number(sanitizedValue) > props.max
  ) {
    return String(props.max)
  }

  return sanitizedValue === "" || Number(sanitizedValue) < 0 ? "" : sanitizedValue
}
</script>
