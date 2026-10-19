<template>
  <div class="verify-config">
    <CustomTitle :title="title">
      <div v-if="isAuth" class="title-actions">
        <el-button type="primary" icon="Plus" @click="onCreateBlank">新增{{ itemTypeName }}项</el-button>
        <el-button @click="onOpenImportDialog">从其他MRO带入</el-button>
      </div>
    </CustomTitle>

    <CustomTable ref="customTableRef" v-model:table-data="customTableData" :config="tableConfig">
      <template #configItemNo-default="{ row }">
        <el-input v-model.trim="row.configItemNo" :placeholder="`请输入${itemTypeName}项编号`" clearable class="table-input" />
      </template>

      <template #configItemName-default="{ row }">
        <el-input v-model.trim="row.configItemName" :placeholder="`请输入${itemTypeName}项名称`" clearable class="table-input" />
      </template>

      <template #standardType-default="{ row }">
        <el-select
          v-model="row.checkStandardValue.standardType"
          class="table-select"
          @change="onStandardTypeChange(row, $event)"
        >
          <el-option v-for="item in standardTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </template>

      <template #detectMethod-default="{ row }">
        <el-input v-model.trim="row.detectMethod" placeholder="请输入探测方式" clearable class="table-input" />
      </template>

      <template #standard-default="{ row }">
        <div class="standard-cell">
          <el-input
            v-if="Number(row.checkStandardValue?.standardType) === 2"
            v-model.trim="row.checkStandardValue.standardDesc"
            placeholder="请输入检验标准"
            clearable
            class="table-input standard-input-text"
          />
          <span v-else class="standard-text">{{ formatStandard(row) || "-" }}</span>
          <el-button link type="primary" size="small" class="standard-action" @click="onEditRow(row)">
            详情配置
          </el-button>
        </div>
      </template>

      <template #verifyType-default="{ row }">
        <el-select v-model="row.verifyType" class="table-select">
          <el-option v-for="item in verifyTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </template>

      <template #configFrequency-default="{ row }">
        <div class="frequency-cell">
          <template v-if="isSpotCheck && row.verifyType === 'shift'">
            <el-select v-model="row.spotShiftTiming" class="table-select">
              <el-option
                v-for="item in spotShiftTimingOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </template>
          <template v-else>
            <el-input-number
              v-model="row.configFrequency"
              :min="1"
              :step="1"
              :precision="0"
              controls-position="right"
              class="table-number"
            />
            <span class="frequency-suffix">{{ getVerifyFrequencySuffix(row.verifyType) }}</span>
          </template>
        </div>
      </template>

      <template #operation-default="{ row, $index }">
        <el-button link type="primary" size="small" @click="onCopyRow(row)">复制</el-button>
        <el-button link type="danger" size="small" @click="onDeleteRow($index)">删除</el-button>
      </template>
    </CustomTable>

    <MroModelVerifyConfigDialog
      v-model="dialogVisible"
      :data="selectedRow"
      :item-type-name="itemTypeName"
      :is-spot-check="isSpotCheck"
      :existing-item-nos="customTableData.map((item) => item.configItemNo)"
      :default-execute-department-id="defaultExecuteDepartmentId"
      :default-execute-department-name="defaultExecuteDepartmentName"
      :default-execute-position-id="defaultExecutePositionId"
      :default-execute-position-name="defaultExecutePositionName"
      @success="onConfigSuccess"
    />

    <el-dialog v-model="importVisible" :title="importDialogTitle" width="860px" append-to-body>
      <div class="import-toolbar">
        <el-input v-model.trim="importKeyword" clearable placeholder="搜索MRO编号、MRO名称、规格" />
      </div>

      <el-table :data="filteredImportModelList" height="420" v-loading="importLoading" @row-click="onSelectImportModel">
        <el-table-column label="选择" width="72" align="center">
          <template #default="{ row }">
            <el-radio :model-value="selectedImportModelId === row.id" :label="true" @change="onSelectImportModel(row)">
              &nbsp;
            </el-radio>
          </template>
        </el-table-column>
        <el-table-column prop="mroModelNo" label="MRO编号" min-width="150" />
        <el-table-column prop="mroModelName" label="MRO名称" min-width="180" />
        <el-table-column prop="mroSpec" label="规格" min-width="160" />
        <el-table-column prop="mroCategoryName" label="MRO类型" min-width="140" />
        <el-table-column prop="mroClassifyName" label="MRO分类" min-width="140" />
      </el-table>

      <template #footer>
        <el-button @click="importVisible = false">取消</el-button>
        <el-button type="primary" @click="onImportConfirm">整套带入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { queryMroItemConfigPageList, queryMroModelPageList } from "@/api/operation/mro/mro-model"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import useButtonAuth from "@/hooks/useButtonAuth"
import type {
  IMroItemConfigListItem,
  IMroModelConfigTableRow,
  IMroModelPageListItem
} from "@/types/maintain/mro-manage/mro-model"
import { formatImgUrlPreview } from "@/utils/common"
import { typeNumberHandle } from "@/utils/inspectStandard"

import MroModelVerifyConfigDialog from "../../MroModelVerifyConfigDialog.vue"

const props = withDefaults(
  defineProps<{
    mroModelId: string
    mroItemType?: number
    title?: string
    itemTypeName?: string
    tempIdPrefix?: string
    importDialogTitle?: string
    importConfirmMessage?: string
    defaultExecuteDepartmentId?: string
    defaultExecuteDepartmentName?: string
    defaultExecutePositionId?: string
    defaultExecutePositionName?: string
  }>(),
  {
    mroItemType: 1,
    title: "校验配置",
    itemTypeName: "校验",
    tempIdPrefix: "temp-verify",
    importDialogTitle: "从其他MRO带入校验配置",
    importConfirmMessage: "带入后将覆盖当前页面的校验配置，是否继续？",
    defaultExecuteDepartmentId: "",
    defaultExecuteDepartmentName: "",
    defaultExecutePositionId: "",
    defaultExecutePositionName: ""
  }
)

const isAuth = useButtonAuth("MROModel_update", "MROModel_query")

const dialogVisible = ref(false)
const importVisible = ref(false)
const importLoading = ref(false)
const importKeyword = ref("")
const selectedImportModelId = ref("")
const selectedRow = ref<IMroModelConfigTableRow | null>(null)
const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<IMroModelConfigTableRow[]>([])
const loaded = ref(false)
const importModelList = ref<IMroModelPageListItem[]>([])

const standardTypeOptions = [
  { label: "定量", value: 1 },
  { label: "定性", value: 2 }
]
const spotShiftTimingOptions = [
  { label: "班前", value: "beforeShift" },
  { label: "班中", value: "duringShift" },
  { label: "班后", value: "afterShift" }
]
const isSpotCheck = computed(() => Number(props.mroItemType) === 4 || props.itemTypeName === "点检")
const verifyTypeOptions = computed(() =>
  isSpotCheck.value
    ? [
        { label: "按天", value: "day" },
        { label: "按班", value: "shift" }
      ]
    : [
        { label: "按次数", value: "count" },
        { label: "按天", value: "day" }
      ]
)

const tableConfig = computed<ITableConfig>(() => ({
  height: "100%",
  columns: [
    {
      prop: "configItemNo",
      label: `${itemTypeName.value}项编号`,
      width: 180,
      showOverflowTooltip: false,
      slots: { default: "configItemNo-default" }
    },
    {
      prop: "configItemName",
      label: `${itemTypeName.value}项名称`,
      minWidth: 220,
      showOverflowTooltip: false,
      slots: { default: "configItemName-default" }
    },
    ...(isSpotCheck.value
      ? [
          {
            prop: "verifyType",
            label: "点检频率",
            width: 130,
            align: "center",
            showOverflowTooltip: false,
            slots: { default: "verifyType-default" }
          },
          {
            prop: "configFrequency",
            label: "点检周期",
            width: 170,
            align: "center",
            showOverflowTooltip: false,
            slots: { default: "configFrequency-default" }
          }
        ] as ITableConfig["columns"]
      : []),
    {
      prop: "standardType",
      label: "标准类型",
      width: 140,
      align: "center",
      showOverflowTooltip: false,
      slots: { default: "standardType-default" }
    },
    {
      prop: "detectMethod",
      label: "探测方式",
      minWidth: 180,
      showOverflowTooltip: false,
      slots: { default: "detectMethod-default" }
    },
    {
      prop: "standard",
      label: "检验标准",
      minWidth: 300,
      showOverflowTooltip: false,
      slots: { default: "standard-default" }
    },
    ...(!isSpotCheck.value
      ? [
          {
            prop: "verifyType",
            label: `${itemTypeName.value}类型`,
            width: 150,
            align: "center",
            showOverflowTooltip: false,
            slots: { default: "verifyType-default" }
          },
          {
            prop: "configFrequency",
            label: `${itemTypeName.value}周期`,
            width: 170,
            align: "center",
            showOverflowTooltip: false,
            slots: { default: "configFrequency-default" }
          }
        ] as ITableConfig["columns"]
      : []),
    {
      prop: "operation",
      label: "操作",
      width: 120,
      fixed: "right",
      showOverflowTooltip: false,
      slots: { default: "operation-default" }
    }
  ]
}))

const title = computed(() => props.title)
const itemTypeName = computed(() => props.itemTypeName)
const importDialogTitle = computed(() => props.importDialogTitle)

const filteredImportModelList = computed(() => {
  const keyword = importKeyword.value.trim()
  const rows = importModelList.value.filter((item) => item.id !== props.mroModelId)
  if (!keyword) return rows
  return rows.filter((item) =>
    [item.mroModelNo, item.mroModelName, item.mroSpec].some((field) =>
      String(field || "").includes(keyword)
    )
  )
})

onMounted(() => {
  void getMroModelVerifyConfig()
})

const createEmptyCheckStandardValue = (
  standardType: 1 | 2 = 2
): IMroModelConfigTableRow["checkStandardValue"] => ({
  standardType,
  standardDesc: "",
  standardMax: null,
  standardMaxInclusive: 1,
  standardMin: null,
  standardMinInclusive: 1,
  quantitativeMode: undefined,
  standardValue: null,
  upperTolerance: null,
  lowerTolerance: null,
  upperToleranceSign: "+",
  lowerToleranceSign: "-",
  unitId: "",
  unitName: ""
})

const onStandardTypeChange = (row: IMroModelConfigTableRow, value: number) => {
  row.checkStandardValue = createEmptyCheckStandardValue(Number(value) === 1 ? 1 : 2)
}

const formatStandard = (row: IMroModelConfigTableRow) => typeNumberHandle(row.checkStandardValue, true)
const getVerifyFrequencySuffix = (verifyType?: IMroModelConfigTableRow["verifyType"]) =>
  verifyType === "count" ? "次" : "天"

const toPhotoList = (files: IMroItemConfigListItem["files"] = []) =>
  (files || []).map((file) => ({
    fileId: file.deploymentId || file.id,
    fileName: file.fileName,
    fileUrl: formatImgUrlPreview(file.path)
  }))

const mapVerifyRow = (item: IMroItemConfigListItem): IMroModelConfigTableRow => ({
  checkStandardValue: item.checkStandardValue || createEmptyCheckStandardValue(2),
  configFrequency: Number(item.configFrequency || 1),
  configItemId: item.configItemId,
  configItemName: item.configItemName,
  configItemNo: item.configItemNo,
  detectMethod: item.detectMethod || item.methodRequire || "",
  executeDepartmentId: item.executeDepartmentId || props.defaultExecuteDepartmentId || "",
  executeDepartmentName: item.executeDepartmentName || props.defaultExecuteDepartmentName || "",
  executePositionId: item.executePositionId || props.defaultExecutePositionId || "",
  executePositionName: item.executePositionName || props.defaultExecutePositionName || "",
  files: toPhotoList(item.files),
  id: item.id,
  methodRequire: item.detectMethod || item.methodRequire || "",
  verifyOrg: item.verifyOrg || "",
  verifyType: isSpotCheck.value
    ? item.verifyType === "shift"
      ? "shift"
      : "day"
    : item.verifyType || "day",
  spotShiftTiming: item.spotShiftTiming || "beforeShift"
})

const buildTempId = () => `${props.tempIdPrefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`

const buildEmptyRow = (): IMroModelConfigTableRow => ({
  checkStandardValue: createEmptyCheckStandardValue(2),
  configFrequency: 1,
  configItemName: "",
  configItemNo: "",
  detectMethod: "",
  executeDepartmentId: props.defaultExecuteDepartmentId,
  executeDepartmentName: props.defaultExecuteDepartmentName,
  executePositionId: props.defaultExecutePositionId,
  executePositionName: props.defaultExecutePositionName,
  files: [],
  id: buildTempId(),
  methodRequire: "",
  verifyOrg: "",
  verifyType: "day",
  spotShiftTiming: "beforeShift"
})

const createCopiedRow = (row: IMroModelConfigTableRow): IMroModelConfigTableRow => ({
  ...cloneDeep(row),
  configItemNo: "",
  id: buildTempId()
})

const createImportedRow = (row: IMroModelConfigTableRow): IMroModelConfigTableRow => ({
  ...cloneDeep(row),
  id: buildTempId()
})

const getMroModelVerifyConfig = async () => {
  customTableRef.value?.setLoading(true)
  try {
    const { records } = await queryMroItemConfigPageList({
      pageQuery: { pageNum: 1, pageSize: 1000 },
      queryParam: { mroItemType: props.mroItemType, mroModelId: props.mroModelId }
    })

    customTableData.value = (records || []).map(mapVerifyRow)
  } finally {
    loaded.value = true
    customTableRef.value?.setLoading(false)
  }
}

const getImportModelList = async () => {
  importLoading.value = true
  try {
    const data = await queryMroModelPageList({
      pageQuery: { pageNum: 1, pageSize: 999 },
      queryParam: {}
    })
    importModelList.value = data?.records || []
  } finally {
    importLoading.value = false
  }
}

const onCreateBlank = () => {
  customTableData.value.unshift(buildEmptyRow())
}

const onOpenImportDialog = async () => {
  await getImportModelList()
  importKeyword.value = ""
  selectedImportModelId.value = ""
  if (!filteredImportModelList.value.length) {
    ElMessage.warning("当前没有可带入的其他MRO")
    return
  }
  importVisible.value = true
}

const onEditRow = (row: IMroModelConfigTableRow) => {
  selectedRow.value = cloneDeep(row)
  dialogVisible.value = true
}

const onCopyRow = (row: IMroModelConfigTableRow) => {
  customTableData.value.unshift(createCopiedRow(row))
}

const onDeleteRow = (rowIndex: number) => {
  customTableData.value.splice(rowIndex, 1)
}

const onSelectImportModel = (row: IMroModelPageListItem) => {
  selectedImportModelId.value = row.id
}

const onImportConfirm = async () => {
  if (!selectedImportModelId.value) {
    ElMessage.warning("请选择需要带入的MRO")
    return
  }

  const confirmed = await ElMessageBox.confirm(props.importConfirmMessage, "提示", {
    type: "warning"
  }).catch(() => false)
  if (!confirmed) return

  importLoading.value = true
  try {
    const { records } = await queryMroItemConfigPageList({
      pageQuery: { pageNum: 1, pageSize: 1000 },
      queryParam: { mroItemType: props.mroItemType, mroModelId: selectedImportModelId.value }
    })

    customTableData.value = (records || []).map(mapVerifyRow).map(createImportedRow)
    importVisible.value = false
    ElMessage.success("带入成功")
  } finally {
    importLoading.value = false
  }
}

const onConfigSuccess = (data: IMroModelConfigTableRow) => {
  const nextRow: IMroModelConfigTableRow = {
    ...data,
    id: data.id || buildTempId()
  }

  if (!selectedRow.value?.id) {
    customTableData.value.push(nextRow)
    return
  }

  const index = customTableData.value.findIndex((item) => item.id === selectedRow.value?.id)
  if (index === -1) {
    customTableData.value.push(nextRow)
    return
  }
  customTableData.value[index] = nextRow
}

const validateTableList = () => {
  const noMap = new Map<string, number>()

  for (let index = 0; index < customTableData.value.length; index += 1) {
    const row = customTableData.value[index]
    const rowNumber = index + 1

    row.configItemName = String(row.configItemName || "").trim()
    row.detectMethod = String(row.detectMethod || "").trim()
    row.methodRequire = row.detectMethod
    row.verifyOrg = String(row.verifyOrg || "").trim()
    row.configItemNo = String(row.configItemNo || "").trim()
    row.checkStandardValue ||= createEmptyCheckStandardValue(2)
    row.verifyType = isSpotCheck.value ? (row.verifyType === "shift" ? "shift" : "day") : row.verifyType || "day"
    row.spotShiftTiming ||= "beforeShift"

    if (!row.configItemNo) {
      ElMessage.warning(`第${rowNumber}行请填写${itemTypeName.value}项编号`)
      return false
    }

    if (!row.configItemName) {
      ElMessage.warning(`第${rowNumber}行请填写${itemTypeName.value}项名称`)
      return false
    }

    if (Number(row.checkStandardValue.standardType) === 2) {
      row.checkStandardValue.standardDesc = String(row.checkStandardValue.standardDesc || "").trim()
    } else if (!formatStandard(row)) {
      ElMessage.warning(`第${rowNumber}行请配置定量检验标准`)
      return false
    }

    if (!row.verifyType) {
      ElMessage.warning(`第${rowNumber}行请选择${itemTypeName.value}类型`)
      return false
    }

    if (isSpotCheck.value && row.verifyType === "shift" && !row.spotShiftTiming) {
      ElMessage.warning(`第${rowNumber}行请选择${itemTypeName.value}周期`)
      return false
    }

    if (
      !(isSpotCheck.value && row.verifyType === "shift") &&
      (!Number.isInteger(Number(row.configFrequency)) || Number(row.configFrequency) < 1)
    ) {
      ElMessage.warning(`第${rowNumber}行${itemTypeName.value}周期需为大于0的整数`)
      return false
    }

    const hit = noMap.get(row.configItemNo)
    if (hit !== undefined) {
      ElMessage.warning(`第${hit + 1}行和第${rowNumber}行${itemTypeName.value}项编号重复`)
      return false
    }
    noMap.set(row.configItemNo, index)
  }

  return true
}

defineExpose({
  getTableList: () => customTableData.value,
  validateTableList,
  isLoaded: () => loaded.value
})
</script>

<style lang="scss" scoped>
.verify-config {
  height: 100%;
  display: flex;
  flex-direction: column;

  .custom-table {
    height: 100%;
  }
}

.title-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.import-toolbar {
  margin-bottom: 12px;
}

.table-input,
.table-select,
.table-number {
  width: 100%;
}

.standard-cell,
.frequency-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
}

.standard-text {
  min-width: 0;
  flex: 1;
  color: #606266;
  line-height: 20px;
  word-break: break-all;
}

.standard-input-text {
  flex: 1;
}

.standard-action,
.frequency-suffix {
  flex: none;
}

.frequency-suffix {
  color: #606266;
  white-space: nowrap;
}
</style>
