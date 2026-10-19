<!-- 拆分标签码 -->
<template>
  <CustomDialog v-model="visible" title="拆分标签码" size="medium" @close="onClose">
    <CustomDescription
      :data="formData"
      :configs="detailConfig"
      :label-width="90"
      style="padding: 10px 0"
    ></CustomDescription>
    <div class="split-config-list">
      <div class="config-box">
        <div class="config-title">拆分方式：</div>
        <el-select v-model="formData.splitWay" placeholder="请选择" style="width: 180px">
          <el-option label="按每项数量" value="0" />
          <el-option label="按拆分项数" value="1" />
        </el-select>
      </div>

      <div class="config-box">
        <div class="config-title">{{ formData.splitWay == "1" ? "拆分项数" : "每项数量" }}：</div>
        <el-input v-model="formData.itemNum" placeholder="请输入" style="width: 180px" />
      </div>

      <el-button type="primary" @click="onPreSplit">预拆分</el-button>
    </div>
    <CustomTable ref="tableRef" v-model:table-data="tableData" :config="tableConfig">
      <template #num-default="{ row }">
        <CustomNumberInput v-model="row.num" :type="1"></CustomNumberInput>
      </template>
    </CustomTable>
    <template #footer>
      <el-button @click="resetForm">取消</el-button>
      <el-button type="primary" @click="Split">拆分</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { requestSplitLabelReturnOrder } from "@/api/logistics/return"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomNumberInput from "@/components/CustomNumberInput/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import useResetRef from "@/hooks/useResetRef"
import customMath from "@/utils/customMath"

type ITableRow = {
  num: number | string
  unitName: string
}

defineOptions({
  name: "BarCodeSplitModal"
})

const emits = defineEmits<{
  (e: "success"): void
}>()

const visible = ref(false)

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "300px",
  columns: [
    {
      prop: "index",
      label: "拆分项",
      width: 100,
      align: "center",
      type: "index"
    },
    {
      prop: "num",
      label: "拆分数量",
      minWidth: 120,
      slots: {
        default: "num-default"
      }
    },
    {
      prop: "unitName",
      label: "单位",
      minWidth: 120,
      align: "center"
    }
  ]
})

const returnData = ref<any[]>([])
const [formData, resetFormData] = useResetRef({
  productModelName: "",
  returnQty: "",
  unitName: "",
  splitWay: "0",
  itemNum: "",
  id: "",
  barCode: "",
  decimalNumber: 0
})
const detailConfig = ref<ICustomDescriptionConfig[]>([
  {
    label: "产品名称：",
    field: "productModelName"
  },
  {
    label: "数量：",
    field: "returnQty"
  },
  {
    label: "单位：",
    field: "unitName"
  }
])

const setVisible = (value: boolean, data: any) => {
  visible.value = value
  formData.value = cloneDeep(data)
}

const resetForm = () => {
  visible.value = false
}

const onPreSplit = () => {
  if (formData.value.splitWay && formData.value.itemNum) {
    const decimalPlaces = formData.value.decimalNumber ?? 2
    if (formData.value.itemNum == "0") {
      ElMessage({
        message: "拆分数量不能为0",
        type: "warning"
      })
      return
    }
    if (formData.value.splitWay == "0") {
      // 按每项数量
      const arr = []
      const num = Math.floor(Number(formData.value.returnQty) / Number(formData.value.itemNum))
      const leftNum = Number(
        (Number(formData.value.returnQty) - num * Number(formData.value.itemNum)).toFixed(
          decimalPlaces
        )
      )
      const lastListNum = leftNum ? num + 1 : num
      for (let i = 0; i < lastListNum; i++) {
        arr.push({
          num: leftNum && i === num ? leftNum : formData.value.itemNum,
          unitName: formData.value.unitName
        })
      }
      tableData.value = arr
    } else {
      // 按拆分项数
      const arr = []
      const num = (Number(formData.value.returnQty) / Number(formData.value.itemNum)).toFixed(
        decimalPlaces
      )
      const lastItemNum = (
        Number(formData.value.returnQty) -
        Number(num) * (Number(formData.value.itemNum) - 1)
      ).toFixed(0)
      for (let i = 0; i < Number(formData.value.itemNum); i++) {
        arr.push({
          num: i === Number(formData.value.itemNum) - 1 ? lastItemNum : num,
          unitName: formData.value.unitName
        })
      }
      tableData.value = arr
    }
  } else if (!formData.value.splitWay || !formData.value.itemNum) {
    ElMessage({
      message: "请填写前两项",
      type: "warning"
    })
  }
}

const Split = async () => {
  const arr = verifySplitItem()
  if (arr) {
    await requestSplitLabelReturnOrder(formData.value.id, {
      splitList: arr.map((item) => Number(item))
    })
    returnData.value = arr
    ElMessage.success("拆分成功")
    visible.value = false
    emits("success")
  }
}

const verifySplitItem = () => {
  for (let item of tableData.value) {
    if (Number(item.num) <= 0) {
      ElMessage.warning("拆分数量不能为0")
      return false
    }
  }
  const splitSum = tableData.value
    .reduce((pre, cur) => {
      return customMath.add(pre, Number(cur.num))
    }, 0)
    .toFixed(2)
  const splitNum = tableData.value.map((item) => item.num)
  if (tableData.value.length >= 1 && Number(splitSum) == Number(formData.value.returnQty)) {
    return splitNum
  } else {
    ElMessageBox.confirm("所有拆分项数量和≠原标签码数量请确认数量", "提示", {
      // confirmButtonText: 'OK',
      cancelButtonText: "返回",
      center: true
    })
    return false
  }
}

const onClose = () => {
  resetFormData()
  tableData.value = []
}

defineExpose({
  setVisible,
  returnData
})
</script>

<style lang="scss" scoped>
.split-config-list {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 16px 0;

  .config-box {
    display: flex;
    align-items: center;

    .config-title {
      font-size: 14px;
      color: #333;
      margin-right: 8px;
    }
  }
}
</style>
