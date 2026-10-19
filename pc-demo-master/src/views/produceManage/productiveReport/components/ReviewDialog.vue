<!-- 报工审核弹窗 -->
<template>
  <CustomDialog v-model="visible" :title="isViewMode ? '审核详情' : '报工审核'" width="700px" @close="visible = false">
    <el-form ref="formRef" :model="form" :rules="isViewMode ? {} : rules" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="订单编号">
            <el-input :model-value="row?.productionOrderNo" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="产品名称">
            <el-input :model-value="row?.productModelName" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="产品规格">
            <el-input :model-value="row?.productModelCode" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="工艺名称">
            <el-input :model-value="row?.techName" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="工序编号">
            <el-input :model-value="row?.processSerial" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="报工数量">
            <el-input :model-value="row?.reportQty" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="报工人">
            <el-input :model-value="row?.rotationName" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="审核数量" prop="reviewedQty">
            <el-input-number
              v-model="form.reviewedQty"
              :min="0"
              :max="999999"
              controls-position="right"
              placeholder="请输入"
              :disabled="isViewMode"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <template v-if="isViewMode">
          <el-col :span="12">
            <el-form-item label="审核人">
              <el-input :model-value="row?.reviewer" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="审核时间">
              <el-input :model-value="row?.reviewTime" disabled />
            </el-form-item>
          </el-col>
        </template>
        <el-col :span="24">
          <el-form-item label="备注">
            <el-input
              v-model="form.remark"
              type="textarea"
              :rows="2"
              placeholder="请输入备注"
              maxlength="200"
              show-word-limit
              :disabled="isViewMode"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">{{ isViewMode ? '关闭' : '取消' }}</el-button>
      <el-button v-if="!isViewMode" type="primary" :loading="loading" @click="handleSubmit">确定审核</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage, type FormInstance, type FormRules } from "element-plus"

import CustomDialog from "@/components/CustomDialog/index.vue"
import axios from "axios"
import useUserStore from "@/store/modules/user"

import type { IProductionReportPageItem } from "@/types/production-manage/product-order"

const userStore = useUserStore()

const props = defineProps<{
  modelValue: boolean
  row?: IProductionReportPageItem
}>()

const emit = defineEmits<{
  "update:modelValue": [value: boolean]
  success: []
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
})

// 是否是查看模式（已审核）
const isViewMode = computed(() => {
  return props.row?.reviewedQty !== null && props.row?.reviewedQty !== undefined
})

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  reviewedQty: undefined as number | undefined,
  remark: ""
})

const rules: FormRules = {
  reviewedQty: [{ required: true, message: "请输入审核数量", trigger: "blur" }]
}

// 监听弹窗打开，初始化表单
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (isViewMode.value) {
        // 查看模式：加载已审核的数据
        form.reviewedQty = props.row?.reviewedQty
        form.remark = props.row?.remark || ""
      } else {
        // 审核模式：默认填入报工数量
        form.reviewedQty = props.row?.reportQty
        form.remark = ""
      }
      formRef.value?.clearValidate()
    }
  }
)

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate()

  loading.value = true
  try {
    await axios.post("/production/report/review", {
      id: props.row?.id,
      physicalCheckQty: form.reviewedQty,
      reviewedQty: form.reviewedQty,
      reviewer: userStore.name || userStore.nickname || "审核员",
      remark: form.remark
    })

    ElMessage.success("审核成功")
    visible.value = false
    emit("success")
  } catch (error: any) {
    ElMessage.error(error?.message || "审核失败")
  } finally {
    loading.value = false
  }
}
</script>
