<!-- 自定义数字输入组件 -->
<template>
  <el-input
    v-bind="$attrs"
    v-model="innerValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :size="size"
    :maxlength="maxlength"
    @change="handleChange"
    @input="handleInput"
    @blur="handleBlur"
    @focus="handleFocus"
    :clearable="clearable"
  >
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps" />
    </template>
  </el-input>
</template>

<script lang="ts" setup>
enum CustomNumberType {
  // 默认
  DEFAULT,
  // 正数
  POSITIVE,
  // 非负数
  NO_NEGATIVE
}

interface CustomNumberInputProps {
  // 模型值
  modelValue: number | string
  // 类型
  type?: CustomNumberType
  // 占位符
  placeholder?: string
  // 禁用
  disabled?: boolean
  // 大小
  size?: "large" | "default" | "small"
  // 最大长度
  maxlength?: number
  // 是否可清除
  clearable?: boolean
  // 小数位数
  decimalNumber?: number
  // 最小值
  min?: number
  // 最大值
  max?: number
  // 是否包含最小值
  includeMin?: boolean
  // 是否包含最大值
  includeMax?: boolean
}

defineOptions({
  name: "CustomNumberInput"
})

// 定义 Emits
const emit = defineEmits<{
  (e: "update:modelValue", value: number | string): void
  (e: "input", value: number | string): void
  (e: "blur", event: FocusEvent): void
  (e: "focus", event: FocusEvent): void
  (e: "change", value: string | number): void
}>()

const props = withDefaults(defineProps<CustomNumberInputProps>(), {
  type: CustomNumberType.DEFAULT,
  placeholder: "",
  disabled: false,
  size: "default",
  maxlength: undefined,
  clearable: true,
  decimalNumber: undefined,
  min: undefined,
  max: undefined,
  includeMin: undefined,
  includeMax: undefined
})

const computedProps = computed(() => {
  return {
    min: props.type === CustomNumberType.DEFAULT ? props.min : props.min || 0,
    includeMin:
      props.type === CustomNumberType.POSITIVE
        ? props.includeMin || false
        : props.type === CustomNumberType.DEFAULT
          ? props.includeMin
          : props.includeMin || true
  }
})

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

const handleChange = (value: string) => {
  const sanitizedValue = sanitizeInput(value)
  innerValue.value = sanitizedValue
  emit("update:modelValue", sanitizedValue)
  emit("change", sanitizedValue)
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

// 输入过滤
function sanitizeInput(value: string): string {
  if (value === "") {
    return ""
  }
  // 根据类型处理负号
  if (props.type === CustomNumberType.POSITIVE || props.type === CustomNumberType.NO_NEGATIVE) {
    value = value.replace(/-/g, "")
  }

  // 处理小数位数
  if (props.decimalNumber !== undefined) {
    const [integer, decimal] = value.split(".")
    if (props.decimalNumber === 0) {
      value = `${integer}`
    }
    if (decimal && decimal.length > props.decimalNumber) {
      value = `${integer}.${decimal.slice(0, props.decimalNumber)}`
    }
  }

  // 移除非数字、小数点和负号
  const sanitized = value.replace(/[^\d.-]/g, "")

  // 处理多个负号
  const hasNegative = sanitized.includes("-")
  const sanitizedValue = hasNegative ? `-${sanitized.replace(/-/g, "")}` : sanitized

  // 处理多个小数点
  const parts = sanitizedValue.split(".")
  const finalValue = parts[0] + (parts.length > 1 ? "." + parts[1] : "")

  // 处理范围限制
  if (
    (computedProps.value.min !== undefined || props.max !== undefined) &&
    !finalValue.endsWith(".")
  ) {
    const numValue = Number(finalValue)
    const minDecimalValue = props.decimalNumber ? 10 ** -props.decimalNumber : 0
    if (!isNaN(numValue)) {
      if (
        computedProps.value.min !== undefined &&
        (computedProps.value.includeMin
          ? numValue < computedProps.value.min
          : numValue <= computedProps.value.min)
      ) {
        return computedProps.value.includeMin
          ? computedProps.value.min.toString()
          : (computedProps.value.min + minDecimalValue).toString()
      }

      if (
        props.max !== undefined &&
        (props.includeMax ? numValue > props.max : numValue >= props.max)
      ) {
        return props.includeMax ? props.max.toString() : (props.max - minDecimalValue).toString()
      }
    }
  }

  // 处理多个零前缀：如果值是纯数字并且是以 0 开头，且没有小数点，去掉多余的 0
  if (/^\d+$/.test(finalValue)) {
    // 如果是纯数字且大于 0，保留一个 0
    return finalValue.replace(/^0+(\d)/, "$1") || "0" // 如果结果为空，返回 '0'
  }

  return finalValue
}
</script>
