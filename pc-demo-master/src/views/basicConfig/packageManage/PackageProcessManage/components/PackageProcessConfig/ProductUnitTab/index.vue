<!-- 生产区域-tab -->
<template>
  <div class="person-tab">
    <CustomTitle title="生产区域">
      <div v-if="!isOnlyView">
        <el-button type="primary" icon="Plus" @click="onAddProductUnitClick()"
          >新增生产区域</el-button
        >
      </div>
    </CustomTitle>

    <CustomTable
      ref="customTableRef"
      v-model:table-data="customTableData"
      :config="tableConfig"
      class="custom-table"
    >
      <template #preChangeTime-default="{ row }">
        <el-input
          v-model="row.preChangeTime"
          placeholder="请输入"
          @change="hasChange = true"
          :disabled="isOnlyView"
        >
          <template #suffix>分钟</template>
        </el-input>
      </template>

      <template #postChangeTime-default="{ row }">
        <el-input
          v-model="row.postChangeTime"
          placeholder="请输入"
          @change="hasChange = true"
          :disabled="isOnlyView"
        >
          <template #suffix>分钟</template>
        </el-input>
      </template>

      <template #ctTime-default="{ row }">
        <el-input
          v-model="row.ctTime"
          placeholder="请输入"
          @change="hasChange = true"
          :disabled="isOnlyView"
        >
          <template #suffix>分钟</template>
        </el-input>
      </template>

      <template #lossTime-default="{ row }">
        <el-input
          v-model="row.lossTime"
          placeholder="请输入"
          @change="hasChange = true"
          :disabled="isOnlyView"
        >
          <template #suffix>分钟</template>
        </el-input>
      </template>

      <template #workerNum-default="{ row }">
        <el-input
          v-model="row.workerNum"
          placeholder="请输入"
          @change="hasChange = true"
          :disabled="isOnlyView"
        >
          <template #suffix>人</template>
        </el-input>
      </template>

      <template #operation-default="{ $index }">
        <el-button
          @click="sortData('up', $index)"
          link
          :disabled="$index === 0 || isOnlyView"
          :type="$index === 0 ? 'info' : 'primary'"
        >
          <el-icon>
            <SortUp />
          </el-icon>
        </el-button>
        <el-button
          @click="sortData('down', $index)"
          :disabled="$index === customTableData.length - 1 || isOnlyView"
          link
          :type="$index === customTableData.length - 1 ? 'info' : 'primary'"
        >
          <el-icon>
            <SortDown />
          </el-icon>
        </el-button>
        <el-button
          link
          type="danger"
          size="small"
          @click="onDeleteRowClick($index)"
          :disabled="isOnlyView"
          >删除本行</el-button
        >
      </template>
    </CustomTable>

    <div class="operation">
      <el-button v-if="!isOnlyView" type="primary" @click="onSaveClick()">保存</el-button>
    </div>

    <!-- 新增生产单位弹窗 -->
    <ProductUnitAddDialog
      v-if="selectProductUnitVisible"
      name="生产区域"
      :type="SelectType.ProductType"
      @close="selectProductUnitVisible = false"
      @success="onSelectProductUnitSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { getTechStandardProdUnitList, saveTechStandardProdUnitList } from "@/api/craft"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import { SelectType } from "@/components/SelectFactoryModel/types"

import ProductUnitAddDialog from "./ProductUnitAddDialog.vue"

interface ITableRow {
  id: string
  facilityId: number
  facilityName: string
  facilityCode: string
  preChangeTime?: number
  postChangeTime?: number
  ctTime?: number
  lossTime?: number
  workerNum?: number
}

const isOnlyView = inject("isOnlyView", ref(false))

defineOptions({
  name: "ProductUnitTab"
})

const props = withDefaults(
  defineProps<{
    techVersionId: string
  }>(),
  {}
)

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "400px",
  columns: [
    {
      prop: "index",
      label: "排产优先级",
      width: 100,
      align: "center",
      type: "index"
    },
    {
      prop: "facilityName",
      label: "生产区域",
      minWidth: 160
    },
    {
      prop: "facilityCode",
      label: "编号",
      minWidth: 160
    },
    {
      prop: "preChangeTime",
      label: "前置换型时间",
      minWidth: 160,
      align: "center",
      slots: {
        default: "preChangeTime-default"
      }
    },
    {
      prop: "postChangeTime",
      label: "后置换型时间",
      minWidth: 160,
      align: "center",
      slots: {
        default: "postChangeTime-default"
      }
    },
    {
      prop: "ctTime",
      label: "标准工时-CT",
      minWidth: 160,
      align: "center",
      slots: {
        default: "ctTime-default"
      }
    },
    {
      prop: "lossTime",
      label: "损耗时间",
      minWidth: 160,
      align: "center",
      slots: {
        default: "lossTime-default"
      }
    },
    {
      prop: "workerNum",
      label: "所需加工人数",
      minWidth: 160,
      align: "center",
      slots: {
        default: "workerNum-default"
      }
    },
    {
      prop: "operation",
      label: "操作",
      width: 160,
      fixed: "right",
      align: "center",
      get hidden() {
        return isOnlyView.value
      },
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const selectProductUnitVisible = ref(false)
const hasChange = ref(false) // 是否有修改

onBeforeMount(() => {
  getTableData()
})

/** 获取表格数据 */
const getTableData = async () => {
  const data = await getTechStandardProdUnitList({
    techVersionId: props.techVersionId
  })
  customTableData.value = data.map((item) => {
    const facilityInfo = item.fmEntity
    return {
      id: item.id,
      facilityId: facilityInfo.id,
      facilityName: facilityInfo.entityName,
      facilityCode: facilityInfo.entityCode,
      preChangeTime: item.preChangeTime,
      postChangeTime: item.postChangeTime,
      ctTime: item.ctTime,
      lossTime: item.lossTime,
      workerNum: item.workerNum
    }
  })
  hasChange.value = false
}

/** 新增生产单位 */
const onAddProductUnitClick = () => {
  selectProductUnitVisible.value = true
}

/** 排序 */
const sortData = (type: "up" | "down", index: number) => {
  const i = type === "up" ? index - 1 : index + 1
  ;[customTableData.value[index], customTableData.value[i]] = [
    customTableData.value[i],
    customTableData.value[index]
  ]
  hasChange.value = true
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
    hasChange.value = true
  }
}

/** 选择生产单位成功回调 */
const onSelectProductUnitSuccess = (data: any[]) => {
  if (data) {
    console.log(data)
    const tableEntityIds = customTableData.value.map((item) => item.facilityId)
    data.forEach((item) => {
      if (!tableEntityIds.includes(item.entityId)) {
        customTableData.value.push({
          id: "",
          facilityId: item.entityId,
          facilityName: item.entityName,
          facilityCode: item.entityCode,
          ctTime: undefined,
          lossTime: undefined,
          postChangeTime: undefined,
          preChangeTime: undefined,
          workerNum: undefined
        })
        hasChange.value = true
      }
    })
  }
}

/** 保存 */
const onSaveClick = async (isUpdate: boolean = true) => {
  hasChange.value = false
  const reg = /^\d+$/
  for (let item of customTableData.value) {
    if (item.preChangeTime && !reg.test(String(item.preChangeTime))) {
      return ElMessage.warning("前置换型时间必须为正整数")
    }
    if (item.postChangeTime && !reg.test(String(item.postChangeTime))) {
      return ElMessage.warning("后置换型时间必须为正整数")
    }
    if (item.ctTime && !reg.test(String(item.ctTime))) {
      return ElMessage.warning("标准工时-CT必须为正整数")
    }
    if (item.lossTime && !reg.test(String(item.lossTime))) {
      return ElMessage.warning("损耗时间必须为正整数")
    }
    if (item.workerNum && !reg.test(String(item.workerNum))) {
      return ElMessage.warning("所需加工人数必须为正整数")
    }
  }

  const prodUnitReqList = customTableData.value.map((item, index) => {
    return {
      id: item.id,
      abstractAreaId: item.facilityId,
      preChangeTime: item.preChangeTime,
      postChangeTime: item.postChangeTime,
      ctTime: item.ctTime,
      lossTime: item.lossTime,
      workerNum: item.workerNum,
      priority: index + 1
    }
  })
  const params = {
    techVersionId: props.techVersionId,
    prodUnitReqList
  }
  await saveTechStandardProdUnitList(params)
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
