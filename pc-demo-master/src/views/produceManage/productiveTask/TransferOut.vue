<!-- 生产任务-转委外 -->
<template>
  <div class="transfer-out">
    <div>
      <el-button icon="ArrowLeft" @click="emit('close')">返回</el-button>
    </div>
    <div class="top-title">自制转委外</div>
    <div class="form-content">
      <CustomForm ref="formRef" :configs="formConfig" v-model="formData" :label-width="150" inline>
        <template #fileList-tips>
          <div class="tips">请选择10M以内，.rar .zip 格式文件。</div>
        </template>
      </CustomForm>
    </div>
    <div class="footer-operation">
      <el-button @click="emit('close')">取消</el-button>
      <el-button type="primary" @click="onSaveClick()">提交</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { queryProductionTaskDetail, requestSelfOrderToOutsourcedOrder } from "@/api/scheduling"
import { queryAllSupplierList } from "@/api/supplier"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import UploadFile from "@/components/UploadFile/index.vue"
import { EnumOutsourcingType } from "@/constant/enums"
import type { IFile } from "@/types/base-info/implement-config"
import type { ISupplierItem } from "@/types/base-info/supplier"

const props = withDefaults(
  defineProps<{
    id: string
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "close"): void
  (e: "success"): void
}>()

const formRef = ref<InstanceType<typeof CustomForm>>()
const formData = reactive<{
  no: string
  supplierId: string
  supplierCode: string
  planEndTime: string
  expectedReceiveTime: string
  productModelId: string
  productModelName: string
  productModelNo: string
  techNo: string
  techName: string
  taskAmount: number
  completeAmount: number
  orderAmount?: number
  remark: string
  fileList: IFile[]
  nodeId: string
}>({
  no: "",
  supplierId: "",
  supplierCode: "",
  planEndTime: "",
  expectedReceiveTime: "",
  productModelId: "",
  productModelName: "",
  productModelNo: "",
  techNo: "",
  techName: "",
  taskAmount: 0,
  completeAmount: 0,
  orderAmount: undefined,
  remark: "",
  fileList: [],
  nodeId: ""
})
const supplierOptions = ref<ISupplierItem[]>([])

const formConfig = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-input",
    label: "委外单号",
    field: "no",
    props: {
      placeholder: "无输入时系统自动创建",
      maxlength: 50,
      clearable: true
    }
  },
  {
    componentType: "el-select",
    label: "供应商名称",
    field: "supplierId",
    rules: [
      {
        required: true,
        message: "请选择供应商",
        trigger: "change"
      }
    ],
    props: {
      placeholder: "请选择",
      clearable: true,
      customChildren: supplierOptions.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.supplierName,
          value: item.id
        }
      }))
    },
    events: {
      change: (value: string) => onSupplierChange(value)
    }
  },
  {
    componentType: "el-input",
    label: "供应商编号",
    field: "supplierCode",
    props: {
      placeholder: "",
      maxlength: 50,
      clearable: true,
      disabled: true
    }
  },
  {
    componentType: "el-date-picker",
    label: "计划结束时间",
    field: "planEndTime",
    props: {
      type: "datetime",
      placeholder: "请选择",
      format: "YYYY-MM-DD HH:mm:ss",
      valueFormat: "YYYY-MM-DD HH:mm:ss",
      disabled: true
    }
  },
  {
    componentType: "el-date-picker",
    label: "预计收货日期",
    field: "expectedReceiveTime",
    rules: [
      {
        required: true,
        message: "请选择预计收货时间",
        trigger: "change"
      }
    ],
    props: {
      placeholder: "请选择",
      format: "YYYY-MM-DD",
      valueFormat: "YYYY-MM-DD"
    }
  },
  {
    componentType: "el-input",
    label: "产品名称",
    field: "productModelName",
    props: {
      placeholder: "",
      maxlength: 50,
      clearable: true,
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "产品编号",
    field: "productModelNo",
    props: {
      placeholder: "",
      maxlength: 50,
      clearable: true,
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "工序编号",
    field: "techNo",
    props: {
      placeholder: "",
      maxlength: 50,
      clearable: true,
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "工艺名称",
    field: "techName",
    props: {
      placeholder: "",
      maxlength: 50,
      clearable: true,
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "计划加工数量",
    field: "taskAmount",
    props: {
      placeholder: "",
      maxlength: 50,
      clearable: true,
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "完工数量",
    field: "completeAmount",
    props: {
      placeholder: "",
      maxlength: 50,
      clearable: true,
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "委外数量",
    field: "orderAmount",
    rules: [
      {
        required: true,
        validator: (rule, value, callback) => {
          if (!value) {
            callback(new Error("请输入委外数量"))
          } else {
            if (value <= 0) {
              callback(new Error("委外数量不能小于0"))
            }

            if (+value > formData.taskAmount - formData.completeAmount) {
              callback(new Error("委外数量不能大于计划加工数量"))
            }
            callback()
          }
        },
        trigger: "blur"
      }
    ],
    props: {
      placeholder: "",
      maxlength: 50,
      clearable: true,
      type: "number",
      min: 0
    }
  },
  {
    componentType: UploadFile,
    label: "附件",
    field: "fileList",
    props: {
      accept: ".rar,.zip",
      size: 10
    },
    slots: {
      tip: "fileList-tips"
    }
  },
  {
    componentType: "el-input",
    label: "备注",
    field: "remark",
    props: {
      placeholder: "",
      maxlength: 200,
      rows: 4,
      clearable: true,
      showWordLimit: true,
      type: "textarea"
    }
  }
])

onBeforeMount(() => {
  getProductOrderDetail()
  getSupplierList()
})

/** 获取生产任务详情 */
const getProductOrderDetail = async () => {
  const data = await queryProductionTaskDetail(props.id)
  if (data) {
    formData.planEndTime = data.planEndTime
    formData.productModelId = data.productModelId
    formData.productModelName = data.productModelName
    formData.productModelNo = data.productModelNo
    formData.techNo = data.techNo
    formData.techName = data.techName
    formData.taskAmount = data.taskAmount
    formData.completeAmount = data.completeAmount
    formData.nodeId = data.nodeId
  }
}

/** 获取供应商列表 */
const getSupplierList = async () => {
  const data = await queryAllSupplierList()
  supplierOptions.value = data || []
}

/** 切换供应商 */
const onSupplierChange = (value: string) => {
  const supplier = supplierOptions.value.find((item) => item.id === value)
  if (supplier) {
    formData.supplierCode = supplier.supplierCode
  }
}

/** 保存操作 */
const onSaveClick = async () => {
  formRef.value?.validateForm()
  const {
    no,
    supplierId,
    expectedReceiveTime,
    orderAmount,
    fileList,
    remark,
    productModelId,
    nodeId
  } = formData

  let params = {
    no,
    supplierId,
    expectedReceiveTime,
    remark,
    productModelId,
    taskId: props.id,
    originalOrderId: "", // 原生产订单ID
    source: 1, // 默认为mes
    delegateType: EnumOutsourcingType.PROCESS, // 委外类型 3 订单委外 4工序委外
    fileIds: fileList.map((item) => item.fileId),
    serialItems: [
      {
        id: nodeId,
        amount: orderAmount as number
      }
    ] // 委外工序
  }

  await requestSelfOrderToOutsourcedOrder(params)
  ElMessage.success("提交成功")
  emit("success")
  emit("close")
}
</script>

<style lang="scss" scoped>
.transfer-out {
  flex: 1;
  padding: 12px 20px 55px;
  color: #303133;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.top-title {
  height: 24px;
  font-weight: bold;
  margin: 12px 0 30px;
  padding-left: 8px;
  border-left: 4px solid #000;
  display: flex;
  align-items: center;
}

.form-content {
  flex: 1;
}

.footer-operation {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 100;
  width: 100%;
  background: #fff;
  border-top: 1px solid #e4e7ed;
  padding: 13px 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 13px;
}
</style>
