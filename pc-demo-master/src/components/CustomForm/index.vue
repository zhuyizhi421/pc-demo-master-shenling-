<template>
  <div class="custom-form">
    <el-form
      ref="formRef"
      :model="localFormData"
      :label-width="props.labelWidth"
      :label-position="props.labelPosition"
      :style="{
        'grid-template-columns': props.columns
          ? `repeat(${props.columns}, 1fr)`
          : `repeat(auto-fit, minmax(340px, 1fr))`
      }"
    >
      <template v-for="config in props.configs" :key="config.field">
        <template v-if="config.special">
          <Component
            v-if="!config.hidden"
            :is="config.componentType"
            v-bind="config.props || {}"
            v-on="config.events || {}"
            :style="getItemStyle(config)"
          >
            <template v-for="slotsValue in config?.slots" :key="slotsValue">
              <slot v-if="slotsValue" :name="slotsValue" :config="config"></slot>
            </template>
          </Component>
        </template>
        <template v-else>
          <el-form-item
            v-if="!config.hidden"
            :label="config.label"
            :prop="config.field"
            :rules="config.rules"
            :style="getItemStyle(config)"
          >
            <template #label="{ label }">
              <slot
                v-if="config.labelSlots"
                :name="config.labelSlots"
                :label="label"
                :config="config"
              >
                {{ label }}
              </slot>
            </template>

            <CustomRecursion
              :config="extractRecursionConfig(config)"
              :model-value="normalizeModelValue(config)"
              @update:model-value="(value) => updateModelValue(config, value)"
            >
              <template v-for="slotName in config?.slots" :key="slotName" #[slotName!]="slotData">
                <slot :name="slotName!" v-bind="slotData"></slot>
              </template>
            </CustomRecursion>
          </el-form-item>
        </template>
      </template>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance } from "element-plus"

import CustomRecursion from "@/components/CustomRecursion/index.vue"
import type { ICustomRecursionConfig } from "@/components/CustomRecursion/type"

import type { ICustomFormConfigItem, ICustomFormProps } from "./type"

defineOptions({ name: "CustomForm" })
defineSlots<{
  [key: string]: (props: any) => any
}>()

const props = withDefaults(defineProps<ICustomFormProps>(), {
  labelWidth: 120,
  labelPosition: "right"
})

const formRef = ref<FormInstance>()

const localFormData = toRef(props, "modelValue")

const extractRecursionConfig = (config: ICustomFormConfigItem): ICustomRecursionConfig => {
  const { componentType, hidden, props, events, slots, children } = config

  return {
    componentType,
    hidden,
    props,
    events,
    slots,
    children
  }
}

/**
 * 获取项目样式
 */
const getItemStyle = (config: ICustomFormProps["configs"][number]) => {
  if (config.colspan) {
    return { "grid-column": config.colspan > 0 ? `span ${config.colspan}` : "1/-1" }
  }

  return { "grid-column": "span 1" }
}

/**
 * 表单校验是否通过
 * @returns {Promise<boolean>}
 */
const validateForm = async () => {
  try {
    return await formRef.value?.validate()
  } catch (e) {
    console.warn(e)
    return false
  }
}

/**
 * 重置表单项，将其值重置为初始值，并移除校验结果
 */
const resetForm = () => {
  formRef.value?.resetFields()
}

/**
 * 校验指定字段是否通过
 * @param {string | string[]} field 字段名
 * @returns {Promise<boolean>}
 */
const validateField = async (field: string | string[]) => {
  try {
    return await formRef.value?.validateField(field)
  } catch (e) {
    console.warn(e)
    return false
  }
}

/**
 * modelValue归一化处理，支持多层级字段，如：a.b.c
 * @param config 自定义表单配置项
 */
const normalizeModelValue = (config: ICustomFormConfigItem) => {
  const { field } = config
  if (!field) {
    return
  }
  let fields = [field]
  if (field?.includes(".")) {
    fields = field.split(".")
  }
  let result: any
  fields.forEach((field) => {
    result = result ? result[field] : localFormData.value[field]
  })

  return result
}

/**
 * 更新modelValue值
 * @param config 自定义表单配置项
 * @param value 绑定值
 */
const updateModelValue = (config: ICustomFormConfigItem, value: any) => {
  const { field } = config
  if (!field) {
    return
  }
  let fields = [field]
  if (field?.includes(".")) {
    fields = field.split(".")
  }
  let result: any = localFormData.value
  for (let i = 0; i < fields.length - 1; i++) {
    result = localFormData.value[fields[i]]
  }
  result[fields[fields.length - 1]] = value
}

defineExpose({ validateForm, resetForm, validateField })
</script>

<style lang="scss" scoped>
.custom-form {
  &:deep(.el-form) {
    display: grid;
    gap: 0 20px;

    .el-form-item {
      .el-form-item__content {
        align-items: flex-start;
      }
    }

    .el-date-editor {
      width: 100%;
    }
  }
}
</style>
