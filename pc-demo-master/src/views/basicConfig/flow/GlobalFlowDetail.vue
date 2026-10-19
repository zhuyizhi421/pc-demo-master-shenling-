<template>
  <CustomDrawer
    :model-value="useFlowDetail.show"
    :loading="loading"
    title="流程详情"
    @close="
      () => {
        useFlowDetail.setStatus()
        resetFlowBasic()
        insInfo = {}
      }
    "
  >
    <div class="examine-box">
      <CustomTitle title="流程基础" style="margin-top: 0"></CustomTitle>
      <CustomDescription
        :data="flowBasic"
        :configs="detailConfig"
        :label-width="100"
        style="padding: 0"
      ></CustomDescription>

      <template v-if="!!parseForm.length">
        <CustomTitle title="流程内容"></CustomTitle>
        <CustomDescription
          :data="parseForm"
          :configs="parseFormConfig"
          :label-width="100"
          :columns="2"
          style="padding: 0"
        >
          <template v-for="item in parseForm" #[`${item.key}-content`] :key="item.key">
            <span v-if="item.type === FlowContentType.Text"> {{ item.value }} </span>
            <el-button
              v-else-if="item.type === FlowContentType.Link"
              type="primary"
              link
              @click="skipHandle(item.value as string)"
              >点击跳转</el-button
            >
            <el-button
              v-else-if="item.type === FlowContentType.File"
              type="primary"
              @click="fileDownloadHandle(item.value as string)"
              link
              >下载</el-button
            >
            <ul v-else-if="item.type === FlowContentType.multipleFile" class="file-list">
              <li v-for="file in item.value as IFileItem[]" :key="file.fileId">
                <span>{{ file.fileName }}</span>
                <el-button type="primary" @click="fileDownloadHandle(file.fileId)" link
                  >下载</el-button
                >
              </li>
            </ul>
          </template>
        </CustomDescription>
      </template>

      <CustomTitle title="层级审批"></CustomTitle>

      <Examine :data="flowExamList" type="readonly" :flowTaskDto="flowTaskDto" />
    </div>

    <template #footer>
      <el-button @click="useFlowDetail.setStatus()">取 消</el-button>
      <el-button
        v-if="insInfo.procProgress == '1' && canExamHandle"
        type="primary"
        @click="examineShow = true"
        >审批操作</el-button
      >
    </template>

    <ExamineHandle v-model="examineShow" @on-ok="examOnOk" :data="detailData" />
  </CustomDrawer>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router"

import { fileDownloadHandle } from "@/api/fileResource"
import {
  getFlowableDefineInfo,
  getFlowableInstById,
  getTaskAvailableExamByUser,
  type ICreateFlowableDefineProcessNodes
} from "@/api/flowable"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomDrawer from "@/components/CustomDrawer/index.vue"
import CustomTitle from "@/components/CustomTitle/index.vue"
import useResetRef from "@/hooks/useResetRef"
import useFlowDetailStore from "@/store/modules/flowDetail"
import type { IFileItem } from "@/types/base-info/employee"
import ExamineHandle from "@/views/basicConfig/flow/components/ExamineHandle.vue"

import Examine from "./components/Examine.vue"

const router = useRouter()
enum FlowContentType {
  Text = 1,
  Link,
  File,
  multipleFile
}

const useFlowDetail = useFlowDetailStore()
const canExamHandle = ref(false) // 接口查询是否可以审批
const examineShow = ref(false) // 打开审批弹窗
const insInfo = ref<any>({})
const flowTaskDto = ref<any[]>([])
const loading = ref(false)

const parseForm = ref<
  {
    key: string
    value: string | IFileItem[]
    type: FlowContentType
  }[]
>([])
const parseFormConfig = computed<ICustomDescriptionConfig[]>(() => {
  return parseForm.value.map((item) => {
    return {
      field: item.key,
      label: `${item.key}：`,
      slots: {
        content: `${item.key}-content`
      }
    }
  })
})

const flowExamList = ref<Partial<ICreateFlowableDefineProcessNodes>[]>([])

const [flowBasic, resetFlowBasic] = useResetRef({
  name: "",
  documentation: ""
})
const detailConfig = ref<ICustomDescriptionConfig[]>([
  {
    field: "name",
    label: "流程名称："
  },
  {
    field: "documentation",
    label: "流程说明："
  }
])

const emits = defineEmits<{
  (e: "examOnOk"): void
}>()

const detailData = computed(() => [insInfo.value])

watch(
  () => useFlowDetail.show,
  async (val) => {
    if (val) {
      await nextTick()
      loading.value = true
      await getFlowableInstInfo()
      loading.value = false
    } else {
      flowExamList.value = []
    }
  }
)

const queryExamLimits = async () => {
  try {
    const res = await getTaskAvailableExamByUser(useFlowDetail.flowInstanceId)
    res && (insInfo.value.taskId = res) // 审批通过需要任务id
    canExamHandle.value = !!res
  } catch (error) {
    /* empty */
  }
}

const getFlowableInstInfo = async () => {
  try {
    const insRes = await getFlowableInstById(useFlowDetail.flowInstanceId)
    insInfo.value = insRes ?? {}
    flowTaskDto.value = insRes?.flowTaskDto ?? []
    parseForm.value = Array.isArray(insRes?.parseForm) ? insRes.parseForm : []
    const defRes = await getFlowableDefineInfo({
      procInstId: insRes.procInsId
    })
    queryExamLimits()

    flowBasic.value = {
      name: defRes.name,
      documentation: defRes.documentation
    }
    flowExamList.value =
      defRes.processNodes?.map((item: any, index: number) => {
        return {
          ...item,
          endTime: insRes.flowTaskDto?.length ? insRes.flowTaskDto[index]?.endTime : "-",
          procProgress: insRes.flowTaskDto?.length ? insRes.flowTaskDto[index]?.procProgress : "-"
        }
      }) || []
  } catch (error) {
    /* empty */
  }
}

function skipHandle(url: string) {
  if (url === "/produce/scheduleProductPlan") {
    const uu = router.resolve({
      name: "ScheduleProductPlan"
    })

    window.open("#" + uu.path)
  } else {
    window.open("#" + url)
  }
}

const examOnOk = () => {
  try {
    getFlowableInstInfo()
    useFlowDetail.examCallback?.()
    emits("examOnOk")
  } catch (error) {
    /* empty */
  }
}
</script>

<style lang="scss" scoped>
.examine-box {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.file-list {
  margin: 0;
  padding: 0;

  li {
    display: flex;
    align-items: flex-start;
    list-style: none;
    overflow: hidden;

    span {
      margin-right: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
