<!-- 工艺配置页面-且工艺、工艺组配置 -->
<template>
  <div class="craft-config">
    <el-tabs v-model="activeName" @tab-change="onTabChange()">
      <el-tab-pane label="子工艺" :name="EnumTab.LEFT"></el-tab-pane>
      <el-tab-pane label="生产要素" :name="EnumTab.RIGHT"></el-tab-pane>
    </el-tabs>

    <!-- 工序信息 -->
    <div class="craft-info">
      <div class="info-title">
        <span>工艺信息</span>
        <div>
          <el-button @click="emit('close')">返回</el-button>
        </div>
      </div>
      <CustomDescription
        :data="craftForm"
        :configs="descriptionConfig"
        :label-width="100"
      ></CustomDescription>
    </div>

    <!-- 子工艺列表 -->
    <ChildCraftList
      v-if="activeName === EnumTab.LEFT"
      :craft-version-id="craftForm.techVersionId"
      :craft-type="curCraftType!"
      :status="craftForm.status!"
      @current-change="onCurrentChange"
    />

    <!-- 左侧工序-生产要素信息 -->
    <CraftProductionFactorLeft
      v-if="activeName === EnumTab.LEFT && curSelectProcessInfo?.techVersionId"
      :key="curSelectProcessInfo?.techVersionId"
      :tech-version-info="curSelectProcessInfo"
      :craft-type="curCraftType"
      :is-pack="curSelectProcessInfo.bizType === EnumCraftBizType.PACK"
    />

    <!-- 右侧工艺组、且工艺-生产要素信息 -->
    <CraftProductionFactorLeft
      v-if="activeName === EnumTab.RIGHT && craftForm.techVersionId"
      :key="craftForm.techVersionId"
      :tech-version-info="craftFormInfo"
      :craft-type="curCraftType"
      :is-pack="craftForm.bizType === EnumCraftBizType.PACK"
      is-summary
    />
  </div>
</template>

<script setup lang="ts">
import { getSonTechProcessInfo } from "@/api/craft"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import {
  EnumCraftBizType,
  EnumCraftStatus,
  EnumCraftStatusMap,
  EnumCraftType,
  EnumCraftTypeMap,
  EnumProductionOrderSource,
  EnumProductionOrderSourceMap,
  EnumProductionType,
  EnumProductionTypeMap
} from "@/constant/enums"
import type {
  ICraftConfigInfo,
  ICraftPageCrumbsData,
  ITechVersionProps
} from "@/types/base-info/craftRoute"

import ChildCraftList from "./ChildCraftList.vue"
import CraftProductionFactorLeft from "./CraftProductionFactor/CraftProductionFactorLeft.vue"

const props = withDefaults(
  defineProps<{
    data: ICraftPageCrumbsData
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "close"): void
  (e: "update-page-list", data: ICraftConfigInfo): void
}>()

console.log("工艺配置", props)

enum EnumTab {
  LEFT = 1,
  RIGHT = 2
}
const activeName = ref(EnumTab.LEFT)
const curSelectProcessInfo = ref<ITechVersionProps>({
  techVersionId: "",
  status: 0,
  type: 0,
  bizType: 1
}) // 当前子工艺列表选中的工序部分信息

// 工艺信息
const craftForm = reactive<{
  id: string
  name: string
  no: string
  type?: number
  version: string
  status?: number
  sourceType?: number
  nature?: number
  createTime: string
  remarks: string
  techVersionId: string
  bizType?: number
}>({
  id: "",
  name: "",
  no: "",
  type: undefined,
  version: "",
  status: undefined,
  sourceType: undefined,
  nature: undefined,
  createTime: "",
  remarks: "",
  techVersionId: "",
  bizType: undefined
})
const descriptionConfig = computed<ICustomDescriptionConfig[]>(() => [
  {
    label: "工艺名称：",
    field: "name"
  },
  {
    label: "工艺编号：",
    field: "no"
  },
  {
    label: "类型：",
    field: "type",
    formatter: ({ data }) => {
      return EnumCraftTypeMap[data.type as EnumCraftType]
    }
  },
  {
    label: "版本：",
    field: "version"
  },
  {
    label: "状态：",
    field: "status",
    formatter: ({ data }) => {
      return EnumCraftStatusMap[data.status as EnumCraftStatus]
    }
  },
  {
    label: "来源：",
    field: "sourceType",
    formatter: ({ data }) => {
      return EnumProductionOrderSourceMap[data.sourceType as EnumProductionOrderSource]
    }
  },
  {
    label: "性质：",
    field: "nature",
    formatter: ({ data }) => {
      return EnumProductionTypeMap[data.nature as EnumProductionType]
    }
  },
  {
    label: "创建时间：",
    field: "createTime"
  },
  {
    label: "备注：",
    field: "remarks",
    colspan: -1
  }
])

const craftFormInfo = computed(() => {
  return {
    techVersionId: craftForm.techVersionId,
    status: craftForm.status!,
    type: craftForm.type!,
    bizType: craftForm.bizType!
  }
}) // 工艺路线信息传参

/** 当前工艺的工艺类型 */
const curCraftType = computed(() => props.data.craftType)

onBeforeMount(async () => {
  await getCraftGroupDetail(props.data.techVersionId)
})

/** 获取工艺组详情 */
const getCraftGroupDetail = async (id: string) => {
  const { techVersion, tech } = await getSonTechProcessInfo(id)
  craftForm.id = techVersion.id
  craftForm.name = tech.name
  craftForm.no = tech.no
  craftForm.type = techVersion.type
  craftForm.version = techVersion.version
  craftForm.status = techVersion.status
  craftForm.sourceType = techVersion.sourceType
  craftForm.nature = techVersion.nature
  craftForm.createTime = techVersion.createTime
  craftForm.remarks = techVersion.remarks
  craftForm.techVersionId = techVersion.id
}

/** 子工艺列表表格选中行数据改变 */
const onCurrentChange = (data: any) => {
  if (data) {
    curSelectProcessInfo.value = {
      techVersionId: data.techVersionId,
      status: data.status,
      type: data.type,
      bizType: data.bizType,
      defaultCodeRelationType: data.defaultCodeRelationType
    }
  } else {
    curSelectProcessInfo.value = {
      techVersionId: "",
      status: 0,
      type: 0,
      bizType: EnumCraftBizType.PROCESS,
      defaultCodeRelationType: undefined
    }
  }
}

/** 切换tab操作 */
const onTabChange = () => {
  if (activeName.value === EnumTab.RIGHT) {
    curSelectProcessInfo.value = {
      techVersionId: "",
      status: 0,
      type: 0,
      bizType: EnumCraftBizType.PROCESS,
      defaultCodeRelationType: undefined
    }
  }
}
</script>

<style lang="scss" scoped>
.craft-config {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
  color: #303133;
}

.craft-info {
  &::after {
    content: "";
    display: block;
    width: calc(100% + 40px);
    height: 1px;
    background-color: #e4e7ed;
    margin: 6px 0 0 -20px;
  }
}

.info-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 32px;
  font-size: 16px;
  font-weight: bold;
  margin: 16px 0 12px;
}
</style>
