<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content border-bottom">
      <div>
        <el-button icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>
      <CustomTitle title="基础信息" :is-table-title="false" show-short-bar />
      <div class="base-info">
        <div class="detailSubTitle">任务单号：{{ formInline.inspectTaskNo }}</div>
        <div class="status">状态：{{ formInline.taskStatus }}</div>
      </div>
      <CustomDescription :data="formInline" :configs="detailConfig"></CustomDescription>
    </div>

    <div class="layout-child-page-content bottom-content">
      <el-radio-group v-model="tabIndex" class="el_radio_class">
        <el-radio-button label="样本" value="0" />
        <el-radio-button label="检验对象" value="1" v-if="isShowInspectInstances" />
        <el-radio-button label="附件" value="2" />
      </el-radio-group>

      <template v-if="tabIndex === '0'">
        <ProcessSamples :id="props.id" :tabArr="tabArr"></ProcessSamples>
      </template>

      <template v-else-if="tabIndex === '1' && isShowInspectInstances">
        <ProcessObject :id="props.id"></ProcessObject>
      </template>

      <template v-else-if="tabIndex === '2'">
        <ProcessFiles :id="props.id"></ProcessFiles>
      </template>
    </div>

    <div class="footer-operation">
      <el-button @click="emit('close')">返回</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  getInspectInstancesById,
  queryProcessInspectTaskDetail
} from "@/api/quality/processInspect"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import { EnumProductInspectionType, EnumProductInspectionTypeMap } from "@/constant/enums"

import ProcessFiles from "./ProcessFiles.vue"
import ProcessObject from "./ProcessObject.vue"
import ProcessSamples from "./ProcessSamples.vue"

const props = withDefaults(
  defineProps<{
    id: string
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "close"): void
}>()

const tabArr = ref<string[]>([])

const tabIndex = ref("0")

const isShowInspectInstances = ref(true)

const formInline = ref({
  createTime: "",
  dispatcherTaskCode: "",
  dispatcherTaskId: "",
  facilityId: 0 as string | number,
  facilityName: "",
  id: "",
  inspectTaskNo: "",
  inspectType: "",
  productModelCode: "",
  productModelId: "",
  productModelName: "",
  productionTaskNo: "",
  sampleNum: 0,
  taskCompleteBy: 0 as string | number,
  taskCompleteByName: "",
  taskCompleteTime: "",
  taskResult: "",
  taskStatus: "",
  techName: "",
  workstationId: "",
  workstationName: "",
  entityName: ""
})

const detailConfig = ref<ICustomDescriptionConfig[]>([
  {
    field: "inspectType",
    label: "检验类型："
  },
  {
    field: "taskResult",
    label: "检验结果："
  },
  {
    field: "productModelName",
    label: "产品名称："
  },
  {
    field: "productModelCode",
    label: "产品编号："
  },
  {
    field: "productionTaskNo",
    label: "所属生产任务："
  },
  {
    field: "techName",
    label: "工艺名称："
  },
  {
    field: "createTime",
    label: "创建时间："
  },
  {
    field: "taskCompleteTime",
    label: "完成时间："
  },
  {
    field: "taskCompleteByName",
    label: "执行人："
  },
  {
    field: "sampleNum",
    label: "样本数："
  }
])

const taskResultType: Record<string, string> = {
  0: "结果未出",
  1: "通过",
  2: "不通过"
}

const taskStatusType: Record<string, string> = {
  0: "未开始",
  1: "进行中",
  2: "已完结",
  3: "已关闭"
}

const getData = async () => {
  try {
    if (props.id) {
      const data = await queryProcessInspectTaskDetail({ taskId: props.id })
      const { taskStatus, inspectType, taskResult, sampleNum } = data
      formInline.value = {
        ...data,
        taskStatus: taskStatusType[taskStatus],
        inspectType: EnumProductInspectionTypeMap[inspectType as EnumProductInspectionType],
        taskResult: taskResultType[taskResult]
      }

      if (sampleNum > 0) {
        const length = sampleNum
        const tempArr = []
        for (let i = 0; i < length; i++) {
          tempArr.push("样本" + (i + 1))
        }
        tabArr.value = tempArr
      }
    }
  } catch (error) {
    tabArr.value = []
  }
}

const getInspectInstancesByIdRequest = async () => {
  const res = await getInspectInstancesById(props.id)
  if (res?.length > 0) {
    isShowInspectInstances.value = true
  } else {
    isShowInspectInstances.value = false
  }
}

onMounted(() => {
  getData()
  getInspectInstancesByIdRequest()
})

defineOptions({
  name: "ProcessInspectDetail"
})
</script>

<style lang="scss" scoped>
.base-info {
  display: flex;
  align-items: center;

  .detailSubTitle {
    height: 24px;
    font-weight: 500;
    font-size: 16px;
    color: #303133;
    line-height: 24px;
    text-align: left;
  }

  .status {
    font-weight: 500;
    font-size: 16px;
    color: #303133;
    line-height: 24px;
    margin-left: 16px;
  }
}

.bottom-content {
  flex: 1;
  overflow: hidden;
}

.el_radio_class {
  margin-bottom: 12px;
}

:deep(.el-radio-button) {
  height: 32px;
}

:deep(.el-radio-button__inner) {
  width: 92px;
}

:deep(.el-tabs__item) {
  width: 80px;
}

:deep(.table-box) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .custom-table {
    flex: 1;
    overflow: hidden;
  }
}

.footer-operation {
  width: 100%;
  background: #fff;
  border-top: 1px solid #e4e7ed;
  padding: 13px 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
</style>
