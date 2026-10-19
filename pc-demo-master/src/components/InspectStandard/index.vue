<template>
  <CustomDialog
    v-model="dialogVisible"
    @close="emits('update:modelValue', false)"
    title="检验标准"
    size="mini"
  >
    <CustomForm ref="customFormRef" v-model="formData" :label-width="70" :configs="formConfigs">
      <template #standardMax-default>
        <el-select style="width: 100px" class="mr-[4px]" v-model="formData.standardMaxInclusive">
          <!-- 注意下获取有的地方是传boolean 值 -->
          <el-option label="≤" :value="1" />
          <el-option label="<" :value="0" />
        </el-select>
        <el-input v-model="formData.standardMax" placeholder="请输入" />
      </template>

      <template #standardMin-default>
        <el-select style="width: 100px" class="mr-[4px]" v-model="formData.standardMinInclusive">
          <el-option label="≥" :value="1" />
          <el-option label=">" :value="0" />
        </el-select>
        <el-input v-model="formData.standardMin" placeholder="请输入" />
      </template>
    </CustomForm>
    <template #footer>
      <el-button @click="emits('update:modelValue', false)">取消</el-button>
      <el-button type="primary" @click="clickOk()">确定</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import { isNumberStandardValid } from "@/utils"

defineOptions({
  name: "InspectStandard"
})

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emits("update:modelValue", val)
})

// 后端确认都是 1 数值，2文本
enum StandardType {
  Number = 1,
  Text = 2
}

const formData = ref(formInit())

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "div",
    label: "数值上限",
    field: "standardMax",
    get hidden() {
      return formData.value.standardType !== StandardType.Number
    },
    props: {
      class: "flex"
    },
    slots: {
      default: "standardMax-default"
    }
  },
  {
    componentType: "div",
    label: "数值下限",
    field: "standardMin",
    get hidden() {
      return formData.value.standardType !== StandardType.Number
    },
    props: {
      class: "flex"
    },
    slots: {
      default: "standardMin-default"
    }
  },
  {
    componentType: "el-input",
    label: "检验标准",
    field: "standardDesc",
    get hidden() {
      return formData.value.standardType !== StandardType.Text
    },
    rules: [
      {
        required: true,
        message: "请输入检验标准",
        trigger: "blur"
      }
    ],
    props: {
      type: "textarea",
      placeholder: "请输入检验标准",
      maxlength: 200,
      showWordLimit: true
    }
  }
])

function formInit() {
  return {
    standardType: 1,
    precision: 0,
    standardDesc: "",
    standardMaxInclusive: 0,
    standardMax: "",
    standardMinInclusive: 0,
    standardMin: ""
  }
}

const props = defineProps<{
  modelValue: boolean
  data: typeof formData.value
}>()

const emits = defineEmits<{
  (e: "update:modelValue", show: boolean): void
  (e: "onOk", data: any): void
}>()

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.data) {
        formData.value = cloneDeep(props.data)
      }
    }
  }
)

function clickOk() {
  const cloneData = cloneDeep(formData.value)
  if (cloneData.standardType === StandardType.Number) {
    if (
      !isNumberStandardValid(
        cloneData.standardMax,
        cloneData.standardMin,
        !!cloneData.standardMaxInclusive,
        !!cloneData.standardMinInclusive
      )
    ) {
      return
    }
  }
  emits("onOk", cloneDeep(cloneData))
  emits("update:modelValue", false)
}
</script>

<style scoped lang="scss"></style>
