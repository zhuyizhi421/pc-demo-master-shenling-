<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content border-bottom">
      <div>
        <el-button icon="ArrowLeft" @click="emits('close')">返回</el-button>
      </div>
      <CustomTitle title="基础信息" :is-table-title="false" show-short-bar />
      <div class="base-info">
        <div class="detailSubTitle">任务单号：{{ data.reviewTaskNo }}</div>
        <div class="status">状态：{{ reviewStatusMap[data?.reviewStatus] }}</div>
      </div>
      <CustomDescription :data="data" :configs="detailConfig"></CustomDescription>
    </div>

    <div class="layout-child-page-content bottom-content">
      <el-radio-group v-model="tabIndex" class="el_radio_class">
        <el-radio-button label="拆分结果" value="0" />
        <el-radio-button label="评审对象" value="1" />
        <el-radio-button label="缺陷信息" value="2" />
      </el-radio-group>

      <div class="table-box">
        <template v-if="tabIndex === '0'">
          <SplitResult :id="props.data.id"></SplitResult>
        </template>

        <template v-if="tabIndex === '1'">
          <ReviewObject :id="props.data.id"></ReviewObject>
        </template>

        <template v-if="tabIndex === '2'">
          <DefectData :id="props.data.id"></DefectData>
        </template>
      </div>
    </div>

    <div class="footer-operation">
      <el-button @click="emits('close')">返回</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import {
  EnumResultNameMap,
  EnumUnqualifiedOriginType,
  EnumUnqualifiedOriginTypeMap
} from "@/constant/enums"

import DefectData from "./DefectData.vue"
import ReviewObject from "./ReviewObject.vue"
import SplitResult from "./SplitResult.vue"

const props = defineProps<{
  modelValue: boolean
  data: any
}>()

const emits = defineEmits(["close"])

const reviewStatusMap: Record<number, string> = {
  "-1": "待执行",
  "0": "进行中",
  "1": "已完成"
}

const tabIndex = ref("0")

const isProduct = computed(() => props.data?.originType == 111)

const detailConfig = ref<ICustomDescriptionConfig[]>([
  {
    field: "originType",
    label: "来源：",
    formatter: ({ data: { originType } }) => {
      return EnumUnqualifiedOriginTypeMap[originType as EnumUnqualifiedOriginType]
    }
  },
  {
    field: "reviewResults",
    label: "处理结果：",
    formatter: ({ data: { reviewResults } }) => {
      return reviewResults?.map((item: string) => EnumResultNameMap[item]).join(",")
    }
  },
  {
    field: "inspectTaskNo",
    label: "关联检验单号：",
    get hidden() {
      return !isProduct.value
    }
  },
  {
    field: "productionTaskNo",
    label: "生产任务编号：",
    get hidden() {
      return !isProduct.value
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
    field: "quantity",
    label: "数量："
  },
  {
    field: "unitName",
    label: "单位："
  },
  {
    field: "entityName",
    label: "生产区域：",
    get hidden() {
      return !isProduct.value
    }
  },
  {
    field: "techName",
    label: "工艺名称：",
    get hidden() {
      return !isProduct.value
    }
  },
  {
    field: "createTime",
    label: "创建时间："
  },
  {
    field: "reviewCompleteTime",
    label: "完成时间："
  },
  {
    field: "completeByName",
    label: "执行人："
  }
])
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

.choose-option {
  width: 63px;
  height: 32px;
  background: #bbbbbb;
  border-radius: 4px 4px 4px 4px;
  text-align: center;
  font-size: 12px;
  font-family:
    PingFang SC-Bold,
    PingFang SC;
  font-weight: bold;

  line-height: 32px;

  &.success-option {
    background: #f6ffed;
    border: 1px solid #d9f7be;
    color: #52c41a;
  }

  &.error-option {
    background: #fff1f0;
    border: 1px solid #ffccc7;
    color: #f5222d;
  }
}
</style>
