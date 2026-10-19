<template>
  <CustomDialog v-model="visible" title="维修单详情" size="medium" :loading="loading">
    <CustomDescription :data="mroRepairOrderInfo || {}" :configs="configs" :label-width="130">
      <template #mroNo-content>
        <el-button link type="primary" size="small" @click="mroInfoVisible = true">
          {{ mroRepairOrderInfo?.mroNo || "--" }}
        </el-button>
      </template>

      <template #mroModelNo-content>
        <el-button link type="primary" size="small" @click="mroModelInfoVisible = true">
          {{ mroRepairOrderInfo?.mroModelNo || "--" }}
        </el-button>
      </template>

      <template #mroModelName-content>
        <el-button link type="primary" size="small" @click="mroModelInfoVisible = true">
          {{ mroRepairOrderInfo?.mroModelName || "--" }}
        </el-button>
      </template>

      <template #scrap-files-content>
        <div v-if="mroRepairOrderInfo?.scrapFiles?.length">
          <el-image
            v-for="item in mroRepairOrderInfo.scrapFiles"
            :key="item.id"
            class="w-[50px] h-[50px]"
            :preview-src-list="[formatImgUrlPreview(item.path)]"
            :src="formatImgUrlPreview(item.path)"
            fit="contain"
            preview-teleported
          />
        </div>
        <div v-else>无图片</div>
      </template>

      <template #mroScrapProcInstId-content>
        <el-button
          link
          type="primary"
          size="small"
          @click="useFlowDetail.setStatus(true, mroRepairOrderInfo?.mroScrapProcInstId)"
        >
          查看详情
        </el-button>
      </template>
    </CustomDescription>

    <template
      #footer
      v-if="authed && mroRepairOrderInfo?.repairStatus === EnumMRORepairStatus.PENDING"
    >
      <el-button type="primary" @click="mroRepairRegisterVisible = true">维修反馈</el-button>
    </template>

    <MroInfoDialog v-model="mroInfoVisible" :mro-id="mroRepairOrderInfo?.mroInformationId || ''" />

    <MroModelInfoDialog
      v-model="mroModelInfoVisible"
      :mro-model-id="mroRepairOrderInfo?.mroModelId || ''"
    />

    <MroRepairRegisterDialog
      v-model="mroRepairRegisterVisible"
      :mro-repair-id="props.mroRepairId"
      :repair-data="mroRepairOrderInfo"
      @success="onMroRepairRegisterSuccess"
    />
  </CustomDialog>
</template>

<script setup lang="ts">
import { queryMroRepairDetail } from "@/api/operation/mro/mro-repair"
import CustomDescription from "@/components/CustomDescription/index.vue"
import CustomDialog from "@/components/CustomDialog/index.vue"
import {
  EnumMRORepairMode,
  EnumMRORepairModeMap,
  EnumMRORepairResult,
  EnumMRORepairResultMap,
  EnumMRORepairSourceType,
  EnumMRORepairSourceTypeMap,
  EnumMRORepairStatus,
  EnumMRORepairStatusMap
} from "@/constant/enums"
import useButtonAuth from "@/hooks/useButtonAuth"
import useFlowDetailStore from "@/store/modules/flowDetail"
import type { IMroRepairPageListItem } from "@/types/maintain/mro-manage/mro-repair"
import { formatImgUrlPreview, formatPercent } from "@/utils/common"
import MroInfoDialog from "@/views/MROManage/MROInfo/components/MroInfoDialog.vue"
import MroModelInfoDialog from "@/views/MROManage/MROModelManage/components/MroModelInfoDialog.vue"

import MroRepairRegisterDialog from "./MroRepairRegisterDialog.vue"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    mroRepairId: string
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success"): void
}>()

const useFlowDetail = useFlowDetailStore()
const authed = useButtonAuth("MRORepairOrders_update", "MRORepairOrders_query")

const mroInfoVisible = ref(false)
const mroModelInfoVisible = ref(false)
const mroRepairRegisterVisible = ref(false)

const loading = ref(false)
const mroRepairOrderInfo = ref<IMroRepairPageListItem>()

const formatLife = (value?: number) => {
  if (value === undefined || value === null) {
    return ""
  }
  return formatPercent(Number(value))
}

const configs = computed(() => [
  {
    field: "repairNo",
    label: "维修单号："
  },
  {
    field: "repairStatus",
    label: "状态：",
    formatter: () => EnumMRORepairStatusMap[mroRepairOrderInfo.value?.repairStatus as EnumMRORepairStatus]
  },
  {
    field: "repairRound",
    label: "维修轮次："
  },
  {
    field: "previousRepairNo",
    label: "上一轮维修单："
  },
  {
    field: "linkedExceptionTaskNo",
    label: "关联异常工单："
  },
  {
    field: "sourceType",
    label: "来源类型：",
    formatter: () =>
      EnumMRORepairSourceTypeMap[mroRepairOrderInfo.value?.sourceType as EnumMRORepairSourceType]
  },
  {
    field: "sourceNo",
    label: "来源单号："
  },
  {
    field: "mroNo",
    label: "MRO序列号：",
    slots: {
      content: "mroNo-content"
    }
  },
  {
    field: "mroModelNo",
    label: "MRO编号：",
    slots: {
      content: "mroModelNo-content"
    }
  },
  {
    field: "mroModelName",
    label: "MRO名称：",
    slots: {
      content: "mroModelName-content"
    }
  },
  {
    field: "mroSpec",
    label: "MRO规格："
  },
  {
    field: "mroClassifyName",
    label: "MRO分类："
  },
  {
    field: "mroCategoryName",
    label: "MRO类型："
  },
  {
    field: "repairBeforeLife",
    label: "维修前寿命：",
    formatter: () => formatLife(mroRepairOrderInfo.value?.repairBeforeLife)
  },
  {
    field: "currentLife",
    label: "当前寿命：",
    formatter: () => formatLife(mroRepairOrderInfo.value?.currentLife)
  },
  {
    field: "reportUserName",
    label: "报修人名称：",
    formatter: () => mroRepairOrderInfo.value?.reportUser?.name
  },
  {
    field: "reportUserId",
    label: "报修人编号：",
    formatter: () => mroRepairOrderInfo.value?.reportUser?.empNo
  },
  {
    field: "handlePosition",
    label: "处理职位："
  },
  {
    field: "responsibleUserName",
    label: "责任人姓名：",
    formatter: () => mroRepairOrderInfo.value?.responsibleUser?.name
  },
  {
    field: "responsibleUserNo",
    label: "责任人工号：",
    formatter: () => mroRepairOrderInfo.value?.responsibleUser?.empNo
  },
  {
    field: "handleUserName",
    label: "处理人姓名：",
    formatter: () => mroRepairOrderInfo.value?.handleUser?.name
  },
  {
    field: "handleUserNo",
    label: "处理人工号：",
    formatter: () => mroRepairOrderInfo.value?.handleUser?.empNo
  },
  {
    field: "repairMode",
    label: "维修方式：",
    formatter: () => EnumMRORepairModeMap[mroRepairOrderInfo.value?.repairMode as EnumMRORepairMode]
  },
  {
    field: "entrustUnit",
    label: "委托单位：",
    hidden: mroRepairOrderInfo.value?.repairMode !== EnumMRORepairMode.EXTERNAL
  },
  {
    field: "faultDescription",
    label: "故障描述："
  },
  {
    field: "analysis",
    label: "故障分析："
  },
  {
    field: "solutionMeasures",
    label: "解决措施："
  },
  {
    field: "repairResult",
    label: "维修结果：",
    hidden: mroRepairOrderInfo.value?.repairStatus !== EnumMRORepairStatus.FINISHED,
    formatter: () => EnumMRORepairResultMap[mroRepairOrderInfo.value?.repairResult as EnumMRORepairResult]
  },
  {
    field: "repairAfterLife",
    label: "维修后寿命：",
    hidden:
      mroRepairOrderInfo.value?.repairStatus !== EnumMRORepairStatus.FINISHED ||
      mroRepairOrderInfo.value?.repairResult !== EnumMRORepairResult.RESOLVED,
    formatter: () => formatLife(mroRepairOrderInfo.value?.repairAfterLife)
  },
  {
    field: "repairStartTime",
    label: "开始维修时间："
  },
  {
    field: "repairEndTime",
    label: "维修完成时间："
  },
  {
    field: "createTime",
    label: "创建时间："
  },
  {
    field: "completeTime",
    label: "办结时间：",
    hidden: mroRepairOrderInfo.value?.repairStatus !== EnumMRORepairStatus.FINISHED
  },
  {
    field: "remarks",
    label: "备注："
  },
  {
    field: "scrapReason",
    label: "报废原因：",
    hidden:
      mroRepairOrderInfo.value?.repairStatus !== EnumMRORepairStatus.FINISHED ||
      mroRepairOrderInfo.value?.repairResult !== EnumMRORepairResult.SCRAPPED
  },
  {
    field: "scrapFiles",
    label: "报废附件：",
    hidden:
      mroRepairOrderInfo.value?.repairStatus !== EnumMRORepairStatus.FINISHED ||
      mroRepairOrderInfo.value?.repairResult !== EnumMRORepairResult.SCRAPPED,
    slots: {
      content: "scrap-files-content"
    }
  },
  {
    field: "mroScrapProcInstId",
    label: "报废申请单：",
    hidden:
      mroRepairOrderInfo.value?.repairStatus !== EnumMRORepairStatus.FINISHED ||
      mroRepairOrderInfo.value?.repairResult !== EnumMRORepairResult.SCRAPPED,
    slots: {
      content: "mroScrapProcInstId-content"
    }
  }
])

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
})

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      getMroRepairOrderInfo(props.mroRepairId)
    }
  }
)

const getMroRepairOrderInfo = async (id: string) => {
  loading.value = true
  const data = await queryMroRepairDetail(id)
  mroRepairOrderInfo.value = data
  loading.value = false
}

const onMroRepairRegisterSuccess = () => {
  getMroRepairOrderInfo(props.mroRepairId)
  emit("success")
}
</script>
