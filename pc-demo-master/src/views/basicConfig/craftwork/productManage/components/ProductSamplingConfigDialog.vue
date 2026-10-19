<template>
  <el-dialog v-model="dialogVisible" title="抽检配置" width="900px" append-to-body>
    <div class="sampling-config-toolbar">
      <el-button type="primary" icon="Plus" @click="onAddRow">新增</el-button>
    </div>

    <el-table
      :data="tableData"
      height="420"
      border
    >
      <el-table-column label="序号" width="60" align="center">
        <template #default="{ $index }">{{ $index + 1 }}</template>
      </el-table-column>
      <el-table-column label="检验配置" min-width="140">
        <template #default="{ row }">
          <el-select v-model="row.inspectionMode" placeholder="请选择检验配置">
            <el-option
              v-for="item in inspectionModeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="检验类型" min-width="160">
        <template #default="{ row }">
          <el-select v-model="row.inspectType" placeholder="请选择检验类型">
            <el-option
              v-for="item in inspectTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="抽检方式" width="140">
        <template #default="{ row }">
          <el-select v-model="row.samplingMethod" placeholder="请选择" @change="onSamplingMethodChange(row)">
            <el-option
              v-for="item in samplingMethodOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="抽检比例" width="140">
        <template #default="{ row }">
          <el-input-number
            v-if="row.samplingMethod === EnumProductionSamplingMethod.PERCENTAGE"
            v-model="row.samplingRatio"
            :min="0"
            :max="100"
            :precision="2"
            :controls="false"
            placeholder="请输入比例"
            style="width: 100%"
          />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="梯度方式" min-width="160">
        <template #default="{ row }">
          <el-select
            v-if="row.samplingMethod === EnumProductionSamplingMethod.GRADIENT"
            v-model="row.gradientModelId"
            placeholder="请选择梯度方式"
            filterable
          >
            <el-option
              v-for="item in gradientOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <span v-else>-</span>
        </template>
      </el-table-column>
      
      <el-table-column label="操作" min-width="90">
        <template #default="{ $index }">
          <el-button type="danger"  @click="onDeleteRow($index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <el-button @click="onCancel">取消</el-button>
      <el-button type="primary" @click="onConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { queryGradientList } from "@/api/quality/gradientModel"
import {
  EnumProductInspectionMode,
  EnumProductInspectionModeMap,
  EnumProductInspectionType,
  EnumProductInspectionTypeMap,
  EnumProductionSamplingMethod,
  EnumProductionSamplingMethodMap
} from "@/constant/enums"
import type { IOption } from "@/types/common"
interface ISamplingConfigRow {
  inspectionMode: number
  inspectType: number
  samplingMethod: number
  samplingRatio: number | undefined
  gradientModelId: string
}

const props = defineProps<{
  modelValue: boolean
  initialData?: ISamplingConfigRow[]
}>()

const emit = defineEmits<{
  "update:modelValue": [value: boolean]
  confirm: [data: ISamplingConfigRow[]]
}>()


const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
})

const tableData = ref<ISamplingConfigRow[]>([])
const gradientOptions = ref<IOption[]>([])

const inspectionModeOptions = computed<IOption[]>(() =>
  Object.entries(EnumProductInspectionModeMap).map(([key, label]) => ({
    label,
    value: Number(key)
  }))
)

const inspectTypeOptions = computed<IOption[]>(() => {
  const tabs = [
    EnumProductInspectionType.PURCHASE_MATERIAL,
    EnumProductInspectionType.FOREIGN_MATERIAL,
    EnumProductInspectionType.PRODUCTION_IN,
    EnumProductInspectionType.RETURN_IN,
    EnumProductInspectionType.IN_STOCK,
    EnumProductInspectionType.FOREIGN_RETURN_IN
  ]
  return tabs.map((tab) => ({
    label: EnumProductInspectionTypeMap[tab],
    value: tab
  }))
})

const samplingMethodOptions = computed<IOption[]>(() =>
  Object.entries(EnumProductionSamplingMethodMap).map(([key, label]) => ({
    label,
    value: Number(key)
  }))
)


const onAddRow = () => {
  tableData.value.push({
    inspectionMode: EnumProductInspectionMode.SAMPLING,
    inspectType: 0,
    samplingMethod: EnumProductionSamplingMethod.PERCENTAGE,
    samplingRatio: undefined,
    gradientModelId: ""
  })
}

const onDeleteRow = (index: number) => {
  tableData.value.splice(index, 1)
}


const onSamplingMethodChange = (row: ISamplingConfigRow) => {
  if (row.samplingMethod === EnumProductionSamplingMethod.PERCENTAGE) {
    row.gradientModelId = ""
  } else {
    row.samplingRatio = undefined
  }
}

const onConfirm = () => {
  const typeSet = new Set<number>()
  
  for (let i = 0; i < tableData.value.length; i++) {
    const row = tableData.value[i]
    if (!row.inspectionMode) {
      ElMessage.warning(`第${i + 1}行请选择检验配置`)
      return
    }
    if (!row.inspectType) {
      ElMessage.warning(`第${i + 1}行请选择检验类型`)
      return
    }
    
    if (typeSet.has(row.inspectType)) {
      ElMessage.warning(`检验类型存在重复，请检查`)
      return
    }
    typeSet.add(row.inspectType)
    
    if (row.samplingMethod === EnumProductionSamplingMethod.PERCENTAGE) {
      if (row.samplingRatio === undefined || row.samplingRatio === null || isNaN(row.samplingRatio)) {
        ElMessage.warning(`第${i + 1}行请填写抽检比例`)
        return
      }
      if (row.samplingRatio < 0 || row.samplingRatio > 100) {
        ElMessage.warning(`第${i + 1}行抽检比例必须在0-100之间`)
        return
      }
    }
    if (row.samplingMethod === EnumProductionSamplingMethod.GRADIENT && !row.gradientModelId) {
      ElMessage.warning(`第${i + 1}行请选择梯度方式`)
      return
    }
  }
  emit("confirm", [...tableData.value])
  dialogVisible.value = false
}

const onCancel = () => {
  dialogVisible.value = false
}

const loadGradientOptions = async () => {
  try {
    const data = await queryGradientList()
    gradientOptions.value = (data || []).map((item) => ({
      label: item.modelName,
      value: String(item.id)
    }))
  } catch (error) {
    console.error("加载梯度方式失败", error)
  }
}

watch(() => props.modelValue, (val) => {
  if (val) {
    tableData.value = props.initialData?.length
      ? props.initialData.map((item) => ({
          ...item,
          inspectionMode: Number(item.inspectionMode || EnumProductInspectionMode.SAMPLING)
        }))
      : []
    loadGradientOptions()
  }
})

onMounted(() => {
  loadGradientOptions()
})
</script>

<style scoped lang="scss">
.sampling-config-toolbar {
  margin-bottom: 12px;
  display: flex;
  gap: 8px;
}
</style>
