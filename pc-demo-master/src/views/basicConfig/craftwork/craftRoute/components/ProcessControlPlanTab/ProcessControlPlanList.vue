<!-- 过程控制计划列表 -->
<template>
  <div class="process-control-plan">
    <CustomTitle>
      <div class="control-plan-toolbar">
        <span class="product-filter-label">产出物编号</span>
        <el-select
          v-model="productNameFilter"
          class="product-name-filter"
          placeholder="请选择产品"
          clearable
          filterable
        >
          <el-option
            v-for="item in productNameOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
        <template v-if="!isOnlyView">
          <el-button type="primary" icon="Plus" @click="onAddClick">新建</el-button>
          <el-button type="primary" icon="Check" @click="onSaveClick">保存</el-button>
          <el-button type="primary" icon="Upload" @click="onImportClick">导入</el-button>
          <el-button type="primary" icon="Download" @click="onExportClick">导出</el-button>
        </template>
      </div>
    </CustomTitle>

    <CustomTable
      ref="tableRef"
      v-model:table-data="tableData"
      :config="tableConfig"
      class="custom-table"
    >
      <template #seq-default="{ $index }">
        <span>{{ $index + 1 }}</span>
      </template>

      <template #processSerial-default="{ row }">
        <el-select
          v-model="row.processSerial"
          placeholder="请选择工序"
          :disabled="isOnlyView"
          filterable
        >
          <el-option
            v-for="item in processListOptions"
            :key="item.id"
            :label="item.processSerial"
            :value="item.processSerial"
          />
        </el-select>
      </template>

      <template #inspectItemCode-default="{ row }">
        <el-input
          v-model="row.inspectItemCode"
          placeholder="请输入检验项编号"
          :disabled="isOnlyView"
        />
      </template>

      <template #inspectItemName-default="{ row }">
        <el-input
          v-model="row.inspectItemName"
          placeholder="请输入检验项名称"
          :disabled="isOnlyView"
        />
      </template>

      <template #methodDesc-default="{ row }">
        <el-input
          v-model="row.methodDesc"
          placeholder="请输入探测方式"
          :disabled="isOnlyView"
        />
      </template>

      <template #standardType-default="{ row }">
        <el-select
          v-model="row.standardType"
          placeholder="请选择标准类型"
          :disabled="isOnlyView"
        >
          <el-option label="定量" :value="1" />
          <el-option label="定性" :value="2" />
        </el-select>
      </template>

      <template #inspectionStandard-default="{ row,$index }">
        <el-button
          type="primary"
          link
          size="small"
          @click="onInspectionStandardClick(row,$index)"
        >
          配置
        </el-button>
      </template>

      <template #standardPreview-default="{ row }">
        <span>{{ getStandardPreview(row.inspectionStandard) || '-' }}</span>
      </template>

      <template #imageList-default="{ row }">
        <div class="image-preview-list">
          <el-image
            v-for="(url, index) in getImagePreviewList(row)"
            :key="index"
            :src="url"
            :preview-src-list="getImagePreviewList(row)"
            fit="cover"
            class="image-preview-item"
            :initial-index="index"
          />
          <span v-if="!getImagePreviewList(row).length">-</span>
        </div>
      </template>

      <template #isSpc-default="{ row }">
        <el-select
          v-model="row.isSpc"
          placeholder="请选择"
          :disabled="isOnlyView"
        >
          <el-option label="是" :value="1" />
          <el-option label="否" :value="0" />
        </el-select>
      </template>

      <template #inspectionCondition-default="{ row }">
        <el-button
          type="primary"
          link
          size="small"
          @click="onInspectionConditionClick(row)"
        >
          {{ row.inspectionCondition ? '已配置' : '配置' }}
        </el-button>
      </template>

      <template #isSampleReturn-default="{ row }">
        <el-select
          v-model="row.isSampleReturn"
          placeholder="请选择"
          :disabled="isOnlyView"
        >
          <el-option label="是" :value="1" />
          <el-option label="否" :value="0" />
        </el-select>
      </template>

      <template #remark-default="{ row }">
        <el-input
          v-model="row.remark"
          placeholder="请输入备注"
          :disabled="isOnlyView"
          type="textarea"
          :rows="1"
        />
      </template>

      <template #operation-default="{ $index }">
        <el-button
          v-if="!isOnlyView"
          type="danger"
          size="small"
          link
          @click="onDeleteClick($index)"
        >
          删除
        </el-button>
      </template>
    </CustomTable>

    <!-- 检验标准弹窗 - 使用 ProcessInspectForm -->
    <ProcessInspectForm
      ref="processInspectFormRef"
      :title="processInspectFormTitle"
      :inspect-form-type="processInspectFormType"
      :form-data="processInspectFormData"
      @on-ok="onProcessInspectFormOk"
      @cancel="onProcessInspectFormCancel"
    />

    <!-- 检验条件弹窗 -->
    <el-dialog
      v-model="inspectionConditionDialog.visible"
      title="检验条件配置"
      width="900px"
      :close-on-click-modal="false"
    >
      <div class="condition-table-header" style="text-align: right;margin-bottom: 10px;">
        <el-button type="primary" icon="Plus" @click="onAddConditionRow">新增</el-button>
      </div>
      <el-table
        :data="inspectionConditionDialog.tableData"
        border
        style="width: 100%"
        height="400px"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="检验方式"  align="center">
          <template #default="{ row }">
            <el-select v-model="row.inspectMethod" placeholder="请选择" style="width: 120px" @change="onInspectMethodChange(row)">
              <el-option label="首检自检" :value="1" />
              <el-option label="首检专检" :value="2" />
              <el-option label="巡检自检" :value="3" />
              <el-option label="巡检专检" :value="4" />
              <el-option label="末检自检" :value="5" />
              <el-option label="末检专检" :value="6" />
              <el-option label="抽检" :value="7" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="触发条件" align="center">
          <template #default="{ row }">
            <el-select 
              v-model="row.triggerCondition" 
              placeholder="请选择" 
              style="width: 120px"
              :disabled="isFinalCheckMethod(row.inspectMethod) || isSamplingCheckMethod(row.inspectMethod)"
            >
              <!-- 首检类型(1,2)的触发条件 -->
              <template v-if="isFirstCheckMethod(row.inspectMethod)">
                <el-option label="换天" :value="1" />
                <el-option label="换型" :value="2" />
                <el-option label="换单" :value="3" />
                <el-option label="更换MRO" :value="4" />
              </template>
              <!-- 巡检类型(3,4)的触发条件 -->
              <template v-else-if="isPollingCheckMethod(row.inspectMethod)">
                <el-option label="按时间" :value="1" />
                <el-option label="按数量" :value="2" />
              </template>
              <!-- 末检和抽检不需要触发条件 -->
              <template v-else>
                <el-option label="-" :value="0" disabled />
              </template>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="检验频率" align="center">
          <template #default="{ row }">
            <el-input-number
              v-model="row.inspectRate"
              :min="1"
              :precision="0"
              :controls="false"
              :disabled="!isPollingCheckMethod(row.inspectMethod)"
              placeholder="请输入"
              style="width: 100px"
            />
          </template>
        </el-table-column>
        <el-table-column label="样本数量" align="center">
          <template #default="{ row }">
            <el-input-number
              v-model="row.sampleNum"
              :min="1"
              :precision="0"
              :controls="false"
              placeholder="请输入"
              style="width: 100px"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center" fixed="right">
          <template #default="{ $index }">
            <el-button type="danger" link size="small" @click="onDeleteConditionRow($index)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="inspectionConditionDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="onSaveInspectionCondition">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import {
  getProcessControlPlanList,
  getTechProcessList,
  saveProcessControlPlanList,
  type TechProcessInfo
} from "@/api/craft"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import { EnumFormType, type InspectDemandForm } from "@/components/InspectForm/type"
import { formatImgUrlPreview } from "@/utils/common"

import ProcessInspectForm from "./ProcessInspectForm.vue"

// 检验条件项
export interface IInspectionConditionItem {
  id?: string
  inspectMethod: number // 检验方式：1-首检自检，2-首检专检，3-巡检自检，4-巡检专检，5-末检自检，6-末检专检
  triggerCondition: number // 触发条件：首检(1-换天,2-换型,3-换单,4-更换MRO)，巡检(1-按时间,2-按数量)
  inspectRate?: number // 检验频率（巡检时才可操作）
  sampleNum?: number // 样本数量
}

export interface IProcessControlRow {
  id?: string
  productModelId?: string
  productModelName?: string
  processSerial: string
  inspectItemCode: string
  inspectItemName: string
  methodDesc: string
  standardType: number
  inspectionStandard?: {
    standardType: number
    standardDesc: string
    standardMax: number
    standardMaxInclusive: number
    standardMin: number
    standardMinInclusive: number
    quantitativeMode?: "lower" | "upper" | "range"
    standardValue?: number | string | null
    upperTolerance?: number | string | null
    lowerTolerance?: number | string | null
    upperToleranceSign?: "+" | "-"
    lowerToleranceSign?: "+" | "-"
    unitId: string
    unitName?: string
  }
  isSpc: number
  inspectionConditionList?: IInspectionConditionItem[]
  isSampleReturn: number
  remark: string
  imageIds: string[]
  imageUrls: string[]
  laboratoryId?: string
}

const props = withDefaults(
  defineProps<{
    craftVersionId: string
    isOnlyView?: boolean
  }>(),
  {
    isOnlyView: false
  }
)

const emit = defineEmits<{
  (e: "save", data: IProcessControlRow[]): void
}>()

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<any[]>([])
const fullTableData = ref<IProcessControlRow[]>([])
const productNameFilter = ref("")
const processListOptions = ref<TechProcessInfo[]>([]) // 工序列表选项

const getRowProductName = (row: any) => String(row?.productModelName || row?.productName || "").trim()
const productNameOptions = computed(() =>
  Array.from(new Set(fullTableData.value.map(getRowProductName).filter(Boolean)))
)

const applyProductNameFilter = () => {
  const filterValue = productNameFilter.value
  tableData.value = filterValue
    ? fullTableData.value.filter((row) => getRowProductName(row) === filterValue)
    : fullTableData.value
}

const tableConfig = ref<ITableConfig>({
  height: "400px",
  highlightCurrentRow: false,
  isSaveColumnWidth: true,
  localTableKey: "ProcessControlPlanTable",
  columns: [
    {
      prop: "seq",
      label: "序号",
      width: 80,
      align: "center",
      slots: {
        default: "seq-default"
      }
    },
    {
      prop: "processSerial",
      label: "工序编号",
      width: 140,
      align: "center",
      slots: {
        default: "processSerial-default"
      }
    },
    {
      prop: "inspectItemCode",
      label: "检验项编号",
      minWidth: 160,
      align: "center",
      slots: {
        default: "inspectItemCode-default"
      }
    },
    {
      prop: "inspectItemName",
      label: "检验项名称",
      minWidth: 160,
      align: "center",
      slots: {
        default: "inspectItemName-default"
      }
    },
    {
      prop: "methodDesc",
      label: "探测方式",
      minWidth: 250,
      align: "center",
      slots: {
        default: "methodDesc-default"
      }
    },
    {
      prop: "standardType",
      label: "标准类型",
      width: 120,
      align: "center",
      slots: {
        default: "standardType-default"
      }
    },
    {
      prop: "inspectionStandard",
      label: "检验标准",
      width: 110,
      align: "center",
      slots: {
        default: "inspectionStandard-default"
      }
    },
    {
      prop: "standardPreview",
      label: "标准值",
      minWidth: 180,
      align: "center",
      slots: {
        default: "standardPreview-default"
      }
    },
    {
      prop: "imageList",
      label: "图片",
      width: 120,
      align: "center",
      slots: {
        default: "imageList-default"
      }
    },
    {
      prop: "isSpc",
      label: "是否SPC",
      width: 110,
      align: "center",
      slots: {
        default: "isSpc-default"
      }
    },
    {
      prop: "inspectionCondition",
      label: "检验条件",
      width: 110,
      align: "center",
      slots: {
        default: "inspectionCondition-default"
      }
    },
    {
      prop: "isSampleReturn",
      label: "是否还回",
      width: 140,
      align: "center",
      slots: {
        default: "isSampleReturn-default"
      }
    },
    {
      prop: "remark",
      label: "备注",
      minWidth: 160,
      align: "center",
      slots: {
        default: "remark-default"
      }
    },
    {
      prop: "operation",
      label: "操作",
      width: 100,
      fixed: "right",
      align: "center",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

// ProcessInspectForm 弹窗
const processInspectFormRef = ref<InstanceType<typeof ProcessInspectForm>>()
const processInspectFormTitle = ref('检验标准配置')
const processInspectFormType = ref<EnumFormType>(EnumFormType.Create)
const currentEditRow = ref<IProcessControlRow | null>(null)
const currentEditIndex = ref<number>(-1)
const processInspectFormData = ref<InspectDemandForm>({
  techVersionId: '',
  id: '',
  inspectItemCode: '',
  inspectItemId: '',
  inspectItemName: '',
  inspectType: 0,
  sampleNum: undefined,
  inspectionStandard: {
    standardDesc: '',
    standardMax: null as any,
    standardMaxInclusive: 0,
    standardMin: null as any,
    standardMinInclusive: 1,
    standardType: 1,
    quantitativeMode: 'lower',
    standardValue: undefined,
    upperTolerance: undefined,
    lowerTolerance: undefined,
    upperToleranceSign: '+',
    lowerToleranceSign: '-',
    unitId: ''
  },
  productModelId: '',
  methodDesc: '',
  laboratoryId: '',
  imageIds: [],
  imageUrls: [],
  pollingTrigger: 1,
  inspectRate: undefined,
  triggerAmount: undefined,
  firstInspectionCondition: [],
  isSampleReturn: true,
  isSpc: false,
  remark: ""
})

// 检验条件弹窗
const inspectionConditionDialog = reactive({
  visible: false,
  currentRow: null as IProcessControlRow | null,
  tableData: [] as IInspectionConditionItem[]
})

// 检验方式选项
const inspectMethodOptions = [
  { label: '首检自检', value: 1 },
  { label: '首检专检', value: 2 },
  { label: '巡检自检', value: 3 },
  { label: '巡检专检', value: 4 },
  { label: '末检自检', value: 5 },
  { label: '末检专检', value: 6 }
]

// 判断是否是首检类型
const isFirstCheckMethod = (method?: number) => {
  return method === 1 || method === 2
}

// 判断是否是巡检类型
const isPollingCheckMethod = (method?: number) => {
  return method === 3 || method === 4
}

// 判断是否是末检类型
const isFinalCheckMethod = (method?: number) => {
  return method === 5 || method === 6
}

// 判断是否是抽检类型
const isSamplingCheckMethod = (method?: number) => {
  return method === 7
}

// 新增检验条件行
const onAddConditionRow = () => {
  inspectionConditionDialog.tableData.push({
    inspectMethod: 1,
    triggerCondition: 1
  })
}

// 删除检验条件行
const onDeleteConditionRow = (index: number) => {
  inspectionConditionDialog.tableData.splice(index, 1)
}

// 检验方式变化处理
const onInspectMethodChange = (row: IInspectionConditionItem) => {
  // 末检或抽检时，清空触发条件和检验频率
  if (isFinalCheckMethod(row.inspectMethod) || isSamplingCheckMethod(row.inspectMethod)) {
    row.triggerCondition = 0
    row.inspectRate = undefined
  } else if (isFirstCheckMethod(row.inspectMethod)) {
    // 首检默认触发条件为换天
    row.triggerCondition = 1
    row.inspectRate = undefined
  } else if (isPollingCheckMethod(row.inspectMethod)) {
    // 巡检默认触发条件为按时间
    row.triggerCondition = 1
  }
}

// 新建
const onAddClick = () => {
  const newRow: IProcessControlRow = {
    productModelName: productNameFilter.value || undefined,
    processSerial: '',
    inspectItemCode: '',
    inspectItemName: '',
    methodDesc: '',
    standardType: 1,
    isSpc: 0,
    isSampleReturn: 1,
    remark: '',
    imageIds: [],
    imageUrls: []
  }
  fullTableData.value.push(newRow)
  applyProductNameFilter()
}

// 保存
const onSaveClick = async () => {
  // 检验项编号必填校验
  for (let i = 0; i < fullTableData.value.length; i++) {
    const row = fullTableData.value[i]
    if (!row.inspectItemCode || !row.inspectItemCode.trim()) {
      ElMessage.error(`第 ${i + 1} 行检验项编号不能为空`)
      return
    }
  }

  // 检验项编号重复校验
  const itemNoSet = new Set<string>()
  for (let i = 0; i < fullTableData.value.length; i++) {
    const row = fullTableData.value[i]
    if (itemNoSet.has(row.inspectItemCode)) {
      ElMessage.error(`第 ${i + 1} 行检验项编号 "${row.inspectItemCode}" 重复，请检查`)
      return
    }
    itemNoSet.add(row.inspectItemCode)
  }

  try {
    tableRef.value?.setLoading(true)
    await saveProcessControlPlanList({
      techVersionId: props.craftVersionId,
      planList: fullTableData.value
    })
    emit('save', fullTableData.value)
    ElMessage.success('保存成功')
    tableRef.value?.setLoading(false)
  } catch (error) {
    tableRef.value?.setLoading(false)
    ElMessage.error('保存失败')
  }
}

// 导入
const onImportClick = () => {
  ElMessage.info('导入功能待实现')
}

// 导出
const onExportClick = () => {
  ElMessage.info('导出功能待实现')
}

// 获取标准预览文本
const getStandardPreview = (standard?: IProcessControlRow['inspectionStandard']) => {
  if (!standard) return ''
  if (standard.standardType === 2) {
    return standard.standardDesc
  }
  const unit = standard.unitName ? ` ${standard.unitName}` : ''
  // 定量类型
  if (standard.quantitativeMode === 'range' && standard.standardValue !== undefined) {
    const lowerValue = standard.lowerTolerance !== undefined
      ? Number(standard.standardValue) - Number(standard.lowerTolerance)
      : undefined
    const upperValue = standard.upperTolerance !== undefined
      ? Number(standard.standardValue) + Number(standard.upperTolerance)
      : undefined
    if (lowerValue !== undefined && upperValue !== undefined) {
      return `${lowerValue}${unit} ~ ${upperValue}${unit}`
    }
    if (lowerValue !== undefined) {
      return `≥ ${lowerValue}${unit}`
    }
    if (upperValue !== undefined) {
      return `≤ ${upperValue}${unit}`
    }
    return `${standard.standardValue}${unit}`
  }
  if (standard.quantitativeMode === 'upper' && standard.standardMax !== undefined) {
    const op = standard.standardMaxInclusive ? '≤' : '<'
    return `${op} ${standard.standardMax}${unit}`
  }
  if (standard.quantitativeMode === 'lower' && standard.standardMin !== undefined) {
    const op = standard.standardMinInclusive ? '≥' : '>'
    return `${op} ${standard.standardMin}${unit}`
  }
  return ''
}

// 获取图片预览列表
const getImagePreviewList = (row: IProcessControlRow) => {
  if (!row.imageUrls?.length) return []
  return row.imageUrls.map(url => formatImgUrlPreview(url))
}

// 打开检验标准弹窗
const onInspectionStandardClick = (row: IProcessControlRow,index:number) => {
  currentEditIndex.value = index
  currentEditRow.value = row
  processInspectFormTitle.value = row.inspectionStandard ? '编辑检验标准' : '新建检验标准'
  processInspectFormType.value = row.inspectionStandard ? EnumFormType.Edit : EnumFormType.Create

  // 填充表单数据
  processInspectFormData.value = {
    techVersionId: props.craftVersionId,
    id: row.id || '',
    inspectItemCode: row.inspectItemCode || '',
    inspectItemId: '',
    inspectItemName: row.inspectItemName || '',
    inspectType: 0,
    sampleNum: undefined,
    inspectionStandard: row.inspectionStandard || {
      standardDesc: '',
      standardMax: null as any,
      standardMaxInclusive: 0,
      standardMin: null as any,
      standardMinInclusive: 1,
      standardType: row.standardType || 1,
      quantitativeMode: 'lower',
      standardValue: undefined,
      upperTolerance: undefined,
      lowerTolerance: undefined,
      upperToleranceSign: '+',
      lowerToleranceSign: '-',
      unitId: ''
    },
    productModelId: '',
    methodDesc: row.methodDesc || '',
    laboratoryId: row.laboratoryId || '',
    imageIds: row.imageIds || [],
    imageUrls: row.imageUrls || [],
    pollingTrigger: 1,
    inspectRate: undefined,
    triggerAmount: undefined,
    firstInspectionCondition: [],
    isSampleReturn: row.isSampleReturn === 1,
    isSpc: row.isSpc === 1,
    remark: row.remark || ''
  }

  processInspectFormRef.value?.setShow()
}

// ProcessInspectForm 确认回调
const onProcessInspectFormOk = (data:any) => {
  if (currentEditIndex.value !== -1) {
      const obj = tableData.value[currentEditIndex.value]
      Object.assign(obj, data)
      tableData.value.splice(currentEditIndex.value, 1, obj)
  }
}

// ProcessInspectForm 取消回调
const onProcessInspectFormCancel = () => {
  currentEditRow.value = null
}

// 打开检验条件弹窗
const onInspectionConditionClick = (row: IProcessControlRow) => {
  inspectionConditionDialog.currentRow = row
  inspectionConditionDialog.tableData = row.inspectionConditionList ? [...row.inspectionConditionList] : []
  inspectionConditionDialog.visible = true
}

// 保存检验条件
const onSaveInspectionCondition = () => {
  if (inspectionConditionDialog.currentRow) {
    inspectionConditionDialog.currentRow.inspectionConditionList = [...inspectionConditionDialog.tableData]
  }
  inspectionConditionDialog.visible = false
  ElMessage.success('检验条件配置成功')
}

// 删除
const onDeleteClick = (index: number) => {
  const target = tableData.value[index]
  const fullIndex = fullTableData.value.findIndex((item) => item === target)
  if (fullIndex > -1) {
    fullTableData.value.splice(fullIndex, 1)
  }
  applyProductNameFilter()
  ElMessage.success('删除成功')
}

// 加载数据
const loadData = (data: IProcessControlRow[]) => {
  fullTableData.value = data || []
  applyProductNameFilter()
}

// 获取当前数据
const getData = () => {
  return fullTableData.value
}

// 获取工序列表
const getProcessList = async () => {
  if (props.craftVersionId) {
    try {
      tableRef.value?.setLoading(true)
      const res = await getTechProcessList(props.craftVersionId)
      processListOptions.value = res
      tableRef.value?.setLoading(false)
    } catch (error) {
      tableRef.value?.setLoading(false)
    }
  }
}

// 获取过程控制计划列表
const getProcessControlList = async () => {
  if (props.craftVersionId) {
    try {
      tableRef.value?.setLoading(true)
      const res = await getProcessControlPlanList(props.craftVersionId)
      fullTableData.value = res || []
      applyProductNameFilter()
      tableRef.value?.setLoading(false)
    } catch (error) {
      tableRef.value?.setLoading(false)
    }
  }
}

// 监听 craftVersionId 变化
watch(
  () => props.craftVersionId,
  () => {
    productNameFilter.value = ""
    getProcessList()
    getProcessControlList()
  }
)

watch(productNameFilter, () => {
  applyProductNameFilter()
})

onBeforeMount(() => {
  getProcessList()
  getProcessControlList()
})

defineExpose({
  loadData,
  getData
})
</script>

<style lang="scss" scoped>
.process-control-plan {
  margin-top: -52px;
  .custom-table {
    margin-top: 16px;
  }
}

.control-plan-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-name-filter {
  width: 220px;
}

.product-filter-label {
  color: var(--el-text-color-primary);
  white-space: nowrap;
}

.image-preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
  align-items: center;
  min-height: 40px;
}

.image-preview-item {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  cursor: pointer;
  object-fit: cover;
}

.required-tip {
  color: #f56c6c;
  margin-left: 4px;
  font-size: 14px;
}
</style>
