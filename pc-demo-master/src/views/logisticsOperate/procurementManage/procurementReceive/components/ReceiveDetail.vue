<!-- 物流运营-采购管理-采购收货-收货详情 -->

<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content border-bottom">
      <div>
        <el-button icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>
      <CustomTitle title="基础信息" :is-table-title="false" show-short-bar />
      <div class="order-info">
        <span class="detailSubTitle">收货单号：{{ baseInfo?.receiptCode }}</span>
      </div>
      <CustomDescription :data="baseInfo!" :configs="detailConfig"></CustomDescription>
    </div>
    <div class="layout-child-page-content bottom-content">
      <div class="tab">
        <el-radio-group v-model="activeTab">
          <el-radio-button :value="EnumTab.ProductInfo">产品清单</el-radio-button>
          <el-radio-button :value="EnumTab.Attachment">附件</el-radio-button>
        </el-radio-group>
        <UploadFile
          v-show="activeTab === EnumTab.Attachment"
          v-model="uploadFileList"
          accept=".jpg,.jpeg,.png"
          :show-tip="false"
          :showFileList="false"
          :limit="8"
          multiple
          @success="onUploadSuccess"
        >
          <el-button type="primary" plain icon="Upload">上传附件</el-button>
        </UploadFile>
      </div>
      <div class="table-box">
        <ReceiveProductRecord
          v-if="activeTab === EnumTab.ProductInfo"
          :table-data="tableData"
          :id="props.id"
        />
        <ReceiveFiles
          v-if="activeTab === EnumTab.Attachment"
          :id="props.id"
          ref="receiveFilesRef"
        />
      </div>
    </div>
    <div class="footer-operation">
      <el-button @click="emit('close')">返回</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import {
  queryPurchaseReceiveDetail,
  requestProcurementReceiveAttachment
} from "@/api/logistics/purchase-manage/parchaseReceive"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import UploadFile from "@/components/UploadFile/index.vue"
import type { IPurchaseReceiveReceiveDetail } from "@/types/logistics/purchaseReceive"

import ReceiveFiles from "./ReceiveFiles.vue"
import ReceiveProductRecord from "./ReceiveProductRecord.vue"

interface IUploadFile {
  fileId: string
  fileName: string
}

enum EnumTab {
  ProductInfo, // 产品清单
  Attachment // 附件
}

const props = withDefaults(
  defineProps<{
    id: string
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "close"): void
}>()

const detailConfig = ref<ICustomDescriptionConfig[]>([
  {
    field: "purchaseCode",
    label: "采购单号："
  },
  {
    field: "supplierName",
    label: "供应商名称："
  },
  {
    field: "supplierShortName",
    label: "供应商简称："
  },
  {
    field: "batchCode",
    label: "批次号："
  },
  {
    field: "receiver",
    label: "收货人："
  },
  {
    field: "receiveTime",
    label: "收货时间："
  }
])

const activeTab = ref(EnumTab.ProductInfo)
const baseInfo = ref<IPurchaseReceiveReceiveDetail>()

const tableData = ref<IPurchaseReceiveReceiveDetail["detailContent"]>([])

const uploadFileList = ref<IUploadFile[]>([]) // 已上传的文件列表
const receiveFilesRef = ref<InstanceType<typeof ReceiveFiles>>()

onMounted(async () => {
  getProcurementReceiveDetail()
})

/** 获取采购收货详情 */
const getProcurementReceiveDetail = async () => {
  const data = await queryPurchaseReceiveDetail({ id: props.id })
  baseInfo.value = data
  tableData.value = baseInfo.value.detailContent ? baseInfo.value.detailContent : []
}

/** 文件上传成功回调 */
const onUploadSuccess = async (fileList: IUploadFile[]) => {
  let promiseList = fileList.map((item) => {
    return requestProcurementReceiveAttachment(props.id, item.fileId)
  })
  await Promise.allSettled(promiseList)
  ElMessage.success("上传成功")
  receiveFilesRef.value?.getAttachFiles()
}
</script>

<style lang="scss" scoped>
.order-info {
  display: flex;
  align-items: center;

  .detailSubTitle {
    height: 24px;
    font-weight: bold;
    font-size: 16px;
    color: #303133;
    line-height: 24px;
    text-align: left;
  }
}

.tab {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.bottom-content {
  flex: 1;
}

.table-box {
  flex: 1;
  display: flex;
  flex-direction: column;

  &:deep(.custom-table) {
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
