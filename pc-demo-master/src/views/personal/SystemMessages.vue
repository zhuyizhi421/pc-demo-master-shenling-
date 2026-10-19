<template>
  <div class="layout-container">
    <div class="layout-sidebar">
      <el-menu default-active="0" class="sidebar-menu" @select="onMessageCategoryChange">
        <el-menu-item v-for="item in categoryData" :key="item.type" :index="String(item.type)">
          <el-badge :hidden="!Number(item.unreadNum)" :value="item.unreadNum">{{
            item.name
          }}</el-badge>
        </el-menu-item>
      </el-menu>
    </div>
    <div class="layout-main-page">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="消息列表">
          <div>
            <el-button type="primary" @click="onReadAllClick()">全部已读</el-button>
          </div>
        </CustomTitle>
        <div class="content-container">
          <div class="content-box">
            <div v-if="!messageData.length" class="flex flex-row justify-center text-zinc-500">
              {{ "暂无消息" }}
            </div>
            <div v-else>
              <template v-for="message in messageData" :key="message.id">
                <el-card class="box-card" style="width: 100%" @click="onCardClick(message)">
                  <template #header>
                    <div class="card-header">
                      <div>
                        <el-badge is-dot class="item" v-if="!message.isRead"></el-badge>
                        <span
                          class="font-medium mr-[16px]"
                          :class="message.isRead ? 'ml-[14px]' : ''"
                        >
                          {{ messageTitle[activeIndex] }}
                        </span>
                        <span>|</span>
                        <span class="ml-[16px]">{{ message.subject }}</span>
                      </div>
                      <div class="flex items-center">
                        <span class="mr-[20px]">{{ message.sendTime }}</span>
                        <el-button
                          v-if="message.isRead"
                          type="info"
                          disabled
                          class="align-bottom w-[86px]"
                        >
                          <span>已读</span>
                        </el-button>
                        <el-button
                          v-if="!message.isRead"
                          type="primary"
                          class="align-bottom w-[86px]"
                          @click.stop="onReadClick(message.isRead, message.id)"
                        >
                          <span>点击已读</span>
                        </el-button>
                      </div>
                    </div>
                  </template>
                  <div v-html="message.content" class="hrefContainer message-content"></div>
                </el-card>
              </template>
            </div>
          </div>
        </div>
      </div>

      <CustomPagination
        v-model:currentPage="pagination.currentPage"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        border
        @change="getList()"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"
import { reactive } from "vue"

import {
  queryMessageCategoryList,
  querySystemMessageList,
  requestMessageSetAllRead,
  requestMessageSetRead
} from "@/api/systemMessage"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType, type ISearchItem } from "@/components/CustomSearchForm/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import { FORMAT_DATE, FORMAT_TIME, TIME_RANGE } from "@/constant/time"
import { useSystemMessage } from "@/hooks/useSystemMessage"
import useFlowDetailStore from "@/store/modules/flowDetail"
import type { ICategory, ISystemMessageItem } from "@/types/personal/system-message"

defineOptions({
  name: "SystemMessages"
})

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Date,
    key: "date",
    label: "消息日期",
    dateType: "daterange",
    value: ["", ""],
    placeholder: ["开始日期", "结束日期"],
    format: FORMAT_DATE,
    valueFormat: FORMAT_TIME,
    defaultTime: TIME_RANGE,
    keyword: ["sendTimeStart", "sendTimeEnd"]
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  sendTimeStart: string
  sendTimeEnd: string
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const { initSystemMessage } = useSystemMessage()

const useFlowDetail = useFlowDetailStore()

const messageTitle: { [key: number]: string } = reactive({})

const activeIndex = ref(0) // 左侧菜单选中项序号

// 消息列表数据
const messageData = ref<ISystemMessageItem[]>([])

// 左侧消息分类数据
const categoryData = ref<ICategory[]>([])

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await getList()
}

/** 消息类别切换 */
const onMessageCategoryChange = (key: number) => {
  activeIndex.value = key
  getList()
}

/** 获取消息列表 */
const getList = async () => {
  const { sendTimeStart, sendTimeEnd } = getFormData()
  let params = {
    pageNum: pagination.value.currentPage,
    pageSize: pagination.value.pageSize,
    type: activeIndex.value,
    sendTimeStart: sendTimeStart,
    sendTimeEnd: sendTimeEnd
  }
  const { records, total } = await querySystemMessageList(params)
  messageData.value = records
  pagination.value.total = +total
}

/** 获取消息分类数据 */
const getMessageCategoryInfo = async () => {
  const data = await queryMessageCategoryList()
  categoryData.value = data
  data.map((item: any) => {
    messageTitle[item.type] = item.name
  })
}

/** 点击消息卡片 */
const onCardClick = ({ messageType, procInstId }: ISystemMessageItem) => {
  // 点击流程消息，设置已读及打开流程详情
  if (messageType !== 2) {
    return
  }
  useFlowDetail.setStatus(true, procInstId, init)
}

/** 已读操作 */
const onReadClick = async (isRead: number, id: string) => {
  if (isRead) {
    return
  }
  await requestMessageSetRead({ readIdList: [id] })
  ElMessage.success("已读成功")
  getMessageCategoryInfo()
  getList()
  initSystemMessage()
}

/** 全部已读操作 */
const onReadAllClick = async () => {
  await requestMessageSetAllRead({ type: activeIndex.value })
  ElMessage.success("全部已读成功")
  getMessageCategoryInfo()
  getList()
  initSystemMessage()
}

const init = () => {
  getMessageCategoryInfo()
  getList()
}
init()
</script>

<style>
.sidebar-menu .el-badge__content.is-fixed {
  right: calc(1px + var(--el-badge-size) * 4) !important;
}
</style>
<style lang="scss" scoped>
.layout-container {
  flex-direction: row;
  overflow: hidden;

  .layout-sidebar {
    width: 140px;
    height: 100%;
    border-right: 1px solid #e2e2e2;

    .sidebar-menu {
      width: 100%;
      margin-top: 90px;
      border: none;

      .el-menu-item.is-active {
        background-color: #1989faff !important;
        color: aliceblue;
      }

      .el-menu-item {
        background-color: #f1f3f9ff !important;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          background-color: rgb(86, 164, 242) !important;
        }
      }
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.layout-main-page {
  flex: 1;
  height: 100%;
}

.content-container {
  flex: 1;
  overflow: hidden;

  .content-box {
    height: 100%;
    overflow: auto;
  }
  .hrefContainer {
    :deep(a) {
      color: rgb(76, 165, 243);
    }
  }
  .message-content {
    font-size: 14px;
    color: #606266;
    white-space: pre-line;
    line-height: 2;
    padding-left: 10px;
  }

  .box-card {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }
  }
  &:deep(.el-descriptions__cell) {
    padding-bottom: 0 !important;
  }
}

.contentStyle::-webkit-scrollbar {
  display: none;
}

.item {
  margin-top: 10px;
  margin-right: 10px;
}
</style>
