<!-- 工艺参数配置弹窗 -->
<template>
  <CustomDialog v-model="dialogVisible" title="配置工艺参数" @close="emit('close')" size="medium">
    <CustomTable
      ref="customTableRef"
      v-model:table-data="customTableData"
      :config="tableConfig"
      class="custom-table"
    >
      <template #standardType-default="{ row }">
        <el-select
          v-if="row.monitor"
          v-model="row.inspectionStandard.standardType"
          placeholder="请选择"
        >
          <el-option label="数值" :value="1"></el-option>
          <el-option label="文本" :value="2"></el-option>
        </el-select>
      </template>

      <template #inspectionStandard-default="{ row, $index }">
        <el-input
          v-if="row.monitor"
          :model-value="
            row.inspectionStandard.standardType === 1 &&
            getStandardString(row?.inspectionStandard) === 'n'
              ? ''
              : getStandardString(row?.inspectionStandard)
          "
          placeholder="请输入"
        >
          <template #suffix>
            <el-button @click="onRecordClick(row, $index)" link type="primary">录入</el-button>
          </template>
        </el-input>
      </template>

      <template #operation-default="{ row, $index }">
        <el-button
          link
          :type="`${row.monitor ? 'danger' : 'primary'}`"
          size="small"
          @click="onMonitorChange($index, row.monitor)"
          >{{ row.monitor ? "关闭监控" : "开启监控" }}</el-button
        >
      </template>
    </CustomTable>

    <InspectStandard
      v-model="inspectVisible"
      @onOk="onInspectSuccess"
      :data="currentHandleParamsRow"
    />

    <template #footer>
      <el-button @click="emit('close')">取消</el-button>
      <el-button v-if="customTableData.length" type="primary" @click="onConfirmClick()"
        >确定</el-button
      >
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { getProductBasicMachineCraft, setProduceBasicMachineCraft } from "@/api/craft"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import InspectStandard from "@/components/InspectStandard/index.vue"
import type { IProduceBasicMachineCraftItem as ITableRow } from "@/types/base-info/craftRoute"
import { getStandardString, modifyStandardData } from "@/utils"

const props = withDefaults(
  defineProps<{
    data: any
    techVersionId: string
  }>(),
  {
    data: () => {}
  }
)
const emit = defineEmits<{
  (e: "close"): void
  (e: "success", data: any[]): void
}>()

const dialogVisible = ref(true)

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "400px",
  columns: [
    {
      prop: "key",
      label: "属性",
      width: 120,
      align: "center"
    },
    {
      prop: "val",
      label: "值",
      width: 120,
      align: "center"
    },
    {
      prop: "desc",
      label: "描述",
      minWidth: 160
    },
    {
      prop: "standardType",
      label: "标准类型",
      width: 160,
      slots: {
        default: "standardType-default"
      }
    },
    {
      prop: "inspectionStandard",
      label: "标准",
      width: 200,
      slots: {
        default: "inspectionStandard-default"
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

const inspectVisible = ref(false)
const editRowIndex = ref(0) // 当前编辑行索引
const currentHandleParamsRow = ref<any>({}) // 当前编辑行的inspectionStandard

onBeforeMount(() => {
  getTableData()
})

const getTableData = async () => {
  const { records } = await getProductBasicMachineCraft({
    pageQuery: {
      pageNum: 1,
      pageSize: 1000
    },
    queryParam: {
      id: props.data.id
    }
  })
  customTableData.value = records
}

/** 监控状态切换 */
const onMonitorChange = (index: number, status: any) => {
  customTableData.value[index].monitor = status ? 0 : 1
}

/** 录入操作*/
const onRecordClick = (data: any, index: number) => {
  editRowIndex.value = index
  currentHandleParamsRow.value = cloneDeep(data.inspectionStandard)
  inspectVisible.value = true
}

/** 录入弹窗成功回调 */
const onInspectSuccess = (data: any) => {
  console.log("onInspectSuccess", data)

  data = modifyStandardData(data)
  currentHandleParamsRow.value = {}
  customTableData.value[editRowIndex.value].inspectionStandard = data
  editRowIndex.value = 0
}

/** 确定操作 */
const onConfirmClick = async () => {
  const valid = customTableData.value.every((item) => {
    if (!item.monitor) {
      return true
    }

    const { standardType, standardMax, standardMin } = item.inspectionStandard

    // 监控开启时，标准类型为数值时，区间必须有一个存在
    if (standardType === 1 && (standardMax || standardMin)) {
      return true
    }

    // 监控开启时，标准类型为文本时，文本可以为空
    if (standardType === 2) {
      return true
    }

    return false
  })

  if (!valid) {
    ElMessage.warning("开启监控时，标准类型为数值时，区间必须有一个值存在。")
    return
  }

  const params = {
    id: props.data.id,
    refId: props.data.refId,
    type: props.data.type,
    refSpecifications: customTableData.value.map((item) => {
      return {
        id: item.id,
        refId: item.refId,
        standard: item.inspectionStandard,
        monitor: item.monitor
      }
    })
  }
  await setProduceBasicMachineCraft(props.techVersionId, params)
  emit("close")
  ElMessage.success("保存成功")
}
</script>

<style lang="scss" scoped></style>
