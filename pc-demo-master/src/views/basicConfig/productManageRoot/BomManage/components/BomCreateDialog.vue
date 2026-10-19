<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="900px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="父件产品" prop="productId">
            <div class="product-select-wrapper">
              <el-input
                v-model="formData.productName"
                placeholder="请选择父件产品"
                readonly
                @click="productDialogVisible = true"

              />
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="产品编号">
            <el-input v-model="formData.productCode" disabled placeholder="自动填充" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="版本" prop="version">
            <el-input v-model="formData.version" placeholder="请输入版本号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="生效时间">
            <el-date-picker
              v-model="formData.effectiveTime"
              type="datetime"
              placeholder="请选择生效时间"
              style="width: 100%"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="备注">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="2"
          placeholder="请输入备注"
        />
      </el-form-item>

      <el-divider />

      <div class="bom-items-header">
        <span class="title">BOM明细</span>
        <el-button type="primary" size="small" @click="addItem"
          >添加明细</el-button
        >
      </div>

      <el-table :data="formData.items" border style="width: 100%; margin-top: 16px" max-height="400px">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="子件产品名称" min-width="200">
          <template #default="{ row, $index }">
            <div class="product-select-wrapper">
              <el-input
                v-model="row.productName"
                placeholder="请选择子件产品"
                readonly
                style="flex: 1"
                @click="openChildProductDialog($index)"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="子件产品编号" width="150">
          <template #default="{ row }">
            <el-input v-model="row.productCode" readonly />
          </template>
        </el-table-column>
        <el-table-column label="子件产品单位" width="150">
          <template #default="{ row, $index }">
            <el-select
              v-model="row.unitId"
              placeholder="请选择单位"
              style="width: 100%"
              :disabled=" !row.productId"
              @change="(val:any) => onUnitChange(val, $index)"
            >
              <el-option
                v-for="item in row.unitList || []"
                :key="item.unitId"
                :label="item.unitName"
                :value="item.unitId"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="底数" width="100">
          <template #default="{ row }">
            <el-input-number
              v-model="row.baseQuantity"
              :min="1"
              :precision="0"
              :controls="false"
              style="width: 100%"
            />
          </template>
        </el-table-column>
        <el-table-column label="组成量" width="100">
          <template #default="{ row }">
            <el-input-number
              v-model="row.composeQuantity"
              :min="1"
              :precision="0"
              :controls="false"
              style="width: 100%"
            />
          </template>
        </el-table-column>
        <el-table-column  label="操作" width="80" fixed="right">
          <template #default="{ $index }">
            <el-button link type="danger" size="small" @click="removeItem($index)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button  type="primary" :loading="submitLoading" @click="handleSubmit"
        >确定</el-button
      >
    </template>
  </el-dialog>

  <!-- 选择父件产品弹窗 -->
  <SelectProductDialog
    v-model="productDialogVisible"
    :selected-row-keys="formData.productId ? [formData.productId] : []"
    :multiple="false"
    @success="onProductSelected"
  />

  <!-- 选择子件产品弹窗 -->
  <SelectProductDialog
    v-model="childProductDialogVisible"
    :selected-row-keys="currentChildProductIndex >= 0 && formData.items[currentChildProductIndex]?.productId ? [formData.items[currentChildProductIndex].productId] : []"
    :multiple="false"
    @success="onChildProductSelected"
  />
</template>

<script setup lang="ts">
import { ElMessage, type FormInstance, type FormRules } from "element-plus"
import { computed, reactive, ref, watch } from "vue"

import { checkBomVersion, createBom, getBomDetail, updateBom } from "@/api/bom"
import SelectProductDialog from "@/components/SelectProductDialog/index.vue"

import type { IBomFormData, IBomItem, IBomItemDetail } from "../types"

const props = defineProps<{
  modelValue: boolean
  type: "create" | "edit" 
  data: IBomItem | null
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success"): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
})

const dialogTitle = computed(() => {
  const titles = {
    create: "新建BOM",
    edit: "编辑BOM",
  }
  return titles[props.type]
})


const formRef = ref<FormInstance>()
const submitLoading = ref(false)
const productDialogVisible = ref(false)
const childProductDialogVisible = ref(false)
const currentChildProductIndex = ref(-1)

const formData = reactive<IBomFormData>({
  productId: "",
  productCode: "",
  productName: "",
  version: "",
  effectiveTime: "",
  remark: "",
  items: []
})

const formRules: FormRules = {
  productId: [{ required: true, message: "请选择父件产品", trigger: "change" }],
  version: [{ required: true, message: "请输入版本号", trigger: "blur" }],
}

// 监听弹窗打开
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      initForm()
    }
  }
)

// 初始化表单
const initForm = async () => {
  if (props.type === "create") {
    Object.assign(formData, {
      id: undefined,
      productId: "",
      productCode: "",
      productName: "",
      version: "",
      effectiveTime: "",
      remark: "",
      items: []
    })
  } else if (props.data) {
    // 获取详情数据
    try {
      const detail = await getBomDetail(props.data.id)
      console.log(detail);
      Object.assign(formData, {
        id: detail.id,
        productId: detail.productId,
        productCode: detail.productCode,
        productName: detail.productName,
        version: detail.version,
        effectiveTime: detail.effectiveTime,
        remark: detail.remark || "",
        items: detail.items || []
      })
    } catch (error) {
      ElMessage.error("获取BOM详情失败")
    }
  }
}

// 产品选择回调
const onProductSelected = (products: any[]) => {
  if (products && products.length > 0) {
    const product = products[0]
    formData.productId = product.id
    formData.productCode = product.code
    formData.productName = product.name
  }
  productDialogVisible.value = false
}

// 打开子件产品选择弹窗
const openChildProductDialog = (index: number) => {
  currentChildProductIndex.value = index
  childProductDialogVisible.value = true
}

// 子件产品选择回调
const onChildProductSelected = (products: any[]) => {
  if (products && products.length > 0 && currentChildProductIndex.value >= 0) {
    const product = products[0]
    const item = formData.items[currentChildProductIndex.value]
    if (item) {
      item.productId = product.id
      item.productCode = product.code
      item.productName = product.name
      // 设置单位列表
      item.unitList = product.productModelUnitList || []
      // 设置默认单位
      const defaultUnit = item.unitList.find((u: any) => u.isDefaultUnit === 1)
      if (defaultUnit) {
        item.unitId = defaultUnit.unitId
        item.unitName = defaultUnit.unitName
      } else if (item.unitList.length > 0) {
        item.unitId = item.unitList[0].unitId
        item.unitName = item.unitList[0].unitName
      } else {
        item.unitId = ""
        item.unitName = ""
      }
    }
  }
  childProductDialogVisible.value = false
  currentChildProductIndex.value = -1
}

// 单位选择变化
const onUnitChange = (val: string, index: number) => {
  const item = formData.items[index]
  if (item && item.unitList) {
    const unit = item.unitList.find((u: any) => u.unitId === val)
    if (unit) {
      item.unitName = unit.unitName
    }
  }
}

// 添加明细
const addItem = () => {
  formData.items.push({
    productId: "",
    productCode: "",
    productName: "",
    unitId: "",
    unitName: "",
    unitList: [],
    baseQuantity: 1,
    composeQuantity: 1
  })
}

// 删除明细
const removeItem = (index: number) => {
  formData.items.splice(index, 1)
}

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    if (formData.items.length === 0) {
      ElMessage.warning("请至少添加一条BOM明细")
      return
    }

    submitLoading.value = true

    try {
      // 检查版本是否重复（编辑时排除自己）
      const excludeId = props.type === "edit" ? formData.id : undefined
      const isDuplicate = await checkBomVersion(formData.productId, formData.version, excludeId)
      if (isDuplicate) {
        ElMessage.error("该产品的此版本已存在")
        submitLoading.value = false
        return
      }

      // 调用保存API
      if (props.type === "create") {
        await createBom(formData)
      } else {
        await updateBom(formData)
      }

      ElMessage.success(props.type === "create" ? "创建成功" : "修改成功")
      submitLoading.value = false
      visible.value = false
      emit("success")
    } catch (error: any) {
      ElMessage.error(error?.message || "保存失败")
      submitLoading.value = false
    }
  })
}
</script>

<style scoped lang="scss">
.product-select-wrapper {
  display: flex;
  gap: 8px;
  width: 100%;
}

.bom-items-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  .title {
    font-weight: 500;
    font-size: 14px;
  }
}
</style>
