<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content border-bottom">
      <div>
        <el-button icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>
      <CustomTitle title="基础信息" :is-table-title="false" show-short-bar />
      <div class="base-info">
        <div class="detailSubTitle">任务单号：{{ formInline.inspectTaskNo }}</div>
        <div class="status">状态：{{ taskStatusType[formInline.taskStatus] }}</div>
      </div>
      <CustomDescription :data="formInline" :configs="detailConfig"></CustomDescription>
    </div>

    <div class="layout-child-page-content bottom-content">
      <el-radio-group v-model="tabIndex" class="el_radio_class">
        <el-radio-button label="样本" value="0" />
        <el-radio-button label="检验对象" value="1" />
        <el-radio-button label="附件" value="2" />
      </el-radio-group>

      <template v-if="tabIndex === '0'">
        <NonProcessSamples :id="props.id" :tabArr="tabArr"></NonProcessSamples>
      </template>

      <template v-else-if="tabIndex === '1'">
        <NonProcessObject :id="props.id"></NonProcessObject>
      </template>

      <template v-else-if="tabIndex === '2'">
        <NonProcessFiles :id="props.id"></NonProcessFiles>
      </template>
    </div>

    <div class="footer-operation">
      <el-button @click="emit('close')">返回</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getPCInspectTaskDetailById } from "@/api/quality/inspectTask"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import { precisionConversion } from "@/utils/common"
import { inspectTypeEnum } from "@/utils/const"

import NonProcessFiles from "./NonProcessFiles.vue"
import NonProcessObject from "./NonProcessObject.vue"
import NonProcessSamples from "./NonProcessSamples.vue"

const props = withDefaults(
  defineProps<{
    id: string
    inspectType?: number
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "close"): void
}>()

const taskResultType: { [key: string]: any } = {
  0: "结果未出",
  1: "通过",
  2: "不通过"
}

const taskStatusType: { [key: string]: any } = {
  0: "未开始",
  1: "进行中",
  2: "已完成",
  3: "已关闭",
  4: "进行中"
}
const formInline = ref<Record<string, any>>({})
const isShipping = computed(() => {
  return formInline.value.inspectType == 10
})
const isPurchaseOrOut = computed(() => {
  return formInline.value.inspectType == 7 || formInline.value.inspectType == 8
})

const detailConfig = ref<ICustomDescriptionConfig[]>([
  {
    field: "inspectType",
    label: "检验类型：",
    formatter: ({ data: { inspectType } }) => {
      return inspectTypeEnum[inspectType]
    }
  },
  {
    field: "taskResult",
    label: "检验结果：",
    formatter: ({ data: { taskResult } }) => {
      return taskResultType[taskResult]
    }
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
    field: "bizCode",
    label: "收货单号：",
    hidden: () => {
      return !isPurchaseOrOut.value
    }
  },
  {
    field: "productTotalQuantity",
    label: "总数："
  },
  {
    field: "suggestSampleQuantity",
    label: "建议检验数："
  },
  {
    field: "unitName",
    label: "单位："
  },
  {
    field: "bizCode",
    label: "发货计划：",
    get hidden() {
      return !isShipping.value
    }
  },
  {
    field: "facilityName",
    label: "仓库名称：",
    get hidden() {
      return !isShipping.value
    }
  },
  {
    field: "deliveryTime",
    label: "发货日期：",
    formatter: ({ data: { deliveryTime } }) => {
      return deliveryTime?.slice(0, 10)
    },
    get hidden() {
      return !isShipping.value
    }
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
  },
  {
    field: "arrivalType",
    label: "收货单据类型：",
    formatter: ({ data: { arrivalType } }) => {
      return arrivalType === 1 ? "采购来料" : arrivalType === 2 ? "委外来料" : ""
    },
    hidden: () => {
      return !isPurchaseOrOut.value
    }
  }
])

const tabArr = ref<string[]>([])

const tabIndex = ref("0")

const getData = async () => {
  try {
    if (props.id) {
      const res: any = await getPCInspectTaskDetailById({ taskId: props.id })
      formInline.value = {
        ...res,
        productTotalQuantity:
          res.productTotalQuantity || res.productTotalQuantity == 0
            ? precisionConversion(res.productTotalQuantity, res?.decimalNumber ?? 2)
            : undefined,
        suggestSampleQuantity:
          res.suggestSampleQuantity || res.suggestSampleQuantity == 0
            ? precisionConversion(res.suggestSampleQuantity, res?.decimalNumber ?? 2)
            : undefined,
        sampleNum:
          res.sampleNum || res.sampleNum == 0
            ? precisionConversion(res.sampleNum, res?.decimalNumber ?? 2)
            : undefined
      }

      if (res?.sampleNum > 0) {
        const length = res?.sampleNum
        const tempArr = []
        for (let i = 0; i < length; i++) {
          tempArr.push("样本" + (i + 1))
        }
        tabArr.value = tempArr
      }
    }
  } catch {
    formInline.value = {} as Record<string, any>
    tabArr.value = []
  }
}

onMounted(() => {
  getData()
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
