<!-- MRO-tab -->
<template>
  <div class="law-tab">
    <CustomTitle title="MRO列表">
      <div v-if="!isOnlyView">
        <el-button type="primary" icon="Plus" @click="selectMROVisible = true">新增MRO</el-button>
      </div>
    </CustomTitle>

    <CustomTable
      ref="customTableRef"
      v-model:table-data="customTableData"
      :config="tableConfig"
      class="custom-table"
    >
      <template #quantity-default="{ row }">
        <el-input-number
          v-model="row.quantity"
          :min="1"
          :precision="0"
          :controls="false"
          placeholder="请输入数量"
          @change="hasChange = true"
          style="width: 100%"
          :disabled="isOnlyView"
        />
      </template>

      <template #lifeManage-default="{ row }">
        <el-input
          v-if="row.lifeManage"
          placeholder="请输入"
          v-model="row.baseUseLife"
          @input="onHandleInput(row)"
          @change="hasChange = true"
        >
        </el-input>
        <span v-else>无需设置</span>
      </template>

      <template #operation-default="{ $index }">
        <el-button
          type="danger"
          size="small"
          link
          @click="onDeleteRowClick($index)"
          :disabled="isOnlyView"
          >删除</el-button
        >
      </template>
    </CustomTable>

    <div class="operation">
      <el-button v-if="!isOnlyView" type="primary" @click="onSaveClick()">保存</el-button>
    </div>

    <!-- 选择MRO弹窗 -->
    <SelectMroModelDialog
      v-model="selectMROVisible"
      :selected-row-keys="selectMROIdList"
      multiple
      @success="onSelectMROSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { getTechStandardMroList, saveTechStandardMroList } from "@/api/craft"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectMroModelDialog from "@/components/SelectMroModelDialog/index.vue"
import type { ITechVersionProps } from "@/types/base-info/craftRoute"
import type { IMroModelPageListItem } from "@/types/maintain/mro-manage/mro-model"
import { validateInput } from "@/utils/common"

interface ITableRow {
  id: string
  mroModelId: string
  mroModelName: string
  mroModelNo: string
  mroCategoryName: string
  mroSpec: string
  mroTypeName: string
  quantity: number
  lifeManage: number
  baseUseLife: number
  decimalNumber: number
  totalLife?: number
}

const isOnlyView = inject("isOnlyView")

defineOptions({
  name: "MROTab"
})

const props = withDefaults(
  defineProps<{
    techVersionInfo: ITechVersionProps
  }>(),
  {}
)

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "400px",
  columns: [
    {
      prop: "mroModelNo",
      label: "MRO编号",
      minWidth: 160
    },
    {
      prop: "mroModelName",
      label: "MRO名称",
      minWidth: 160
    },
    {
      prop: "mroSpec",
      label: "MRO规格",
      minWidth: 160
    },
    {
      prop: "mroTypeName",
      label: "MRO分类",
      minWidth: 160
    },
    {
      prop: "mroCategoryName",
      label: "MRO类型",
      minWidth: 160
    },
    {
      prop: "quantity",
      label: "数量",
      width: 120,
      align: "center",
      slots: {
        default: "quantity-default"
      }
    },
    {
      prop: "lifeManage",
      label: "寿命管理",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        return !row.lifeManage ? "关闭" : "开启"
      }
    },
    {
      prop: "lifeManage",
      label: "寿命损耗（次）",
      minWidth: 160,
      slots: {
        default: "lifeManage-default"
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

const selectMROVisible = ref(false) // 选择MRO弹窗可见
const selectMROIdList = ref<string[]>([]) // 选择的MRO ID列表
const hasChange = ref(false) // 是否有修改

onBeforeMount(() => {
  getTableData()
})

const onHandleInput = (row: ITableRow) => {
  row.baseUseLife = validateInput(row.baseUseLife, 6, row.decimalNumber)
}

/** 获取文档表格数据 */
const getTableData = async () => {
  const data = await getTechStandardMroList({
    techVersionId: props.techVersionInfo.techVersionId,
    processId: props.techVersionInfo.processId
  })
  if (data) {
    customTableData.value = data.map((item) => {
      const mroInfo = item.mroModelVo
      return {
        id: item.id,
        mroModelId: mroInfo.id,
        mroModelName: mroInfo.mroModelName,
        mroModelNo: mroInfo.mroModelNo,
        mroCategoryName: mroInfo.mroCategoryName,
        mroSpec: mroInfo.mroSpec || "",
        mroTypeName: mroInfo.mroTypeName || "",
        quantity: item.quantity || 1,
        lifeManage: mroInfo.lifeManage,
        baseUseLife: item.baseUseLife,
        decimalNumber: mroInfo.decimalNumber
      }
    })
    selectMROIdList.value = data.map((item) => item.mroModelId)
    hasChange.value = false
  }
}

/** 删除表格行 */
const onDeleteRowClick = async (index: number) => {
  const confirm = await ElMessageBox.confirm("确定删除确认删除该行数据?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    closeOnPressEscape: false,
    autofocus: false,
    type: "warning"
  })
  if (confirm === "confirm") {
    customTableData.value.splice(index, 1)
    selectMROIdList.value.splice(index, 1)
    hasChange.value = true
  }
}

/** 选择MRO成功回调 */
const onSelectMROSuccess = (data: IMroModelPageListItem[]) => {
  if (data.length) {
    data.forEach((item) => {
      // 若已存在，则不再添加
      if (selectMROIdList.value.includes(item.id)) {
        return
      } else {
        customTableData.value.push({
          id: "",
          mroModelId: item.id,
          mroModelName: item.mroModelName,
          mroModelNo: item.mroModelNo,
          mroCategoryName: item.mroCategoryName,
          mroSpec: item.mroSpec || "",
          mroTypeName: item.mroClassifyName || "",
          quantity: 1,
          lifeManage: item.lifeManage,
          baseUseLife: 0,
          decimalNumber: item.decimalNumber,
          totalLife: item.totalLife
        })
        selectMROIdList.value.push(item.id)
        hasChange.value = true
      }
    })
  }
}

/** 保存 */
const onSaveClick = async (isUpdate: boolean = true) => {
  let errorText = ""
  customTableData.value.forEach((item) => {
    if (!errorText) {
      if (!item.quantity || item.quantity < 1) {
        errorText = "数量必须大于0"
      } else if (item.lifeManage) {
        if (!item.baseUseLife) {
          errorText = "寿命损耗次数不能为空"
        } else if (isNaN(Number(item.baseUseLife))) {
          errorText = "寿命损耗次数必须为数字"
        } else {
          const number = Number(item.baseUseLife)
          if (number < 0 || number > 100) {
            errorText = "寿命损耗次数必须在0-100之间"
          }
        }
      }
    }
  })
  if (errorText) {
    ElMessage.warning(errorText)
    return
  }
  hasChange.value = false

  let mroReqList = customTableData.value.map((item) => {
    return {
      id: item.id,
      mroModelId: item.mroModelId,
      quantity: item.quantity,
      baseUseLife: item.baseUseLife
    }
  })
  let params = {
    techVersionId: props.techVersionInfo.techVersionId,
    processId: props.techVersionInfo.processId,
    mroReqList
  }
  await saveTechStandardMroList(params)

  ElMessage.success("保存成功")
  isUpdate && getTableData()
}

/** 更新数据 */
const updateTableData = () => {
  if (hasChange.value) {
    onSaveClick(false)
  }
}

defineExpose({ updateTableData })
</script>

<style lang="scss" scoped>
.title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0 16px;
}

.operation {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin: 20px 20px 0 20px;
}
</style>
