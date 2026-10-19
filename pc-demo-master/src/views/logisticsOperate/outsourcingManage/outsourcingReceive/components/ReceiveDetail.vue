<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content border-bottom">
      <div>
        <el-button icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>
      <CustomTitle title="基础信息" :is-table-title="false" show-short-bar />
      <div class="order-info">
        <span class="detailSubTitle">收货单号：{{ props.currentRow.code }}</span>
      </div>
      <CustomDescription :data="props.currentRow" :configs="detailConfig"></CustomDescription>
    </div>
    <div class="layout-child-page-content bottom-content">
      <div class="tab">
        <el-radio-group v-model="activeTab">
          <el-radio-button :value="EnumTab.PRODUCT">产品清单</el-radio-button>
          <el-radio-button :value="EnumTab.FILE">附件</el-radio-button>
        </el-radio-group>
        <UploadFile
          v-if="activeTab == EnumTab.FILE"
          v-model="uploadFileList"
          accept=".jpg,.jpeg,.png,"
          :show-tip="false"
          :showFileList="false"
          multiple
          :limit="1"
        >
          <el-button type="primary" plain icon="upload">上传附件</el-button>
        </UploadFile>
      </div>
      <div class="table-box">
        <ReceiveProductRecord v-if="activeTab === EnumTab.PRODUCT" :id="props.id" />
        <ReceiveFiles v-if="activeTab === EnumTab.FILE" :id="props.id" ref="receiveFilesRef" />
      </div>
    </div>
    <div class="footer-operation">
      <el-button @click="emit('close')">返回</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { uploadAttachFile } from "@/api/logistics/outsourcingReceive"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import UploadFile from "@/components/UploadFile/index.vue"
import type { IOutsourcingReceiveListItem } from "@/types/logistics/outsourcingReceive"

import ReceiveFiles from "./ReceiveFiles.vue"
import ReceiveProductRecord from "./ReceiveProductRecord.vue"

interface IUploadFile {
  fileId: string
  fileName: string
}

enum EnumTab {
  PRODUCT = "product",
  FILE = "file"
}

const props = withDefaults(
  defineProps<{
    id: string
    currentRow: IOutsourcingReceiveListItem
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "close"): void
}>()

const detailConfig = ref<ICustomDescriptionConfig[]>([
  {
    field: "delegateNo",
    label: "委外单号："
  },
  {
    field: "supplierName",
    label: "供应商名称："
  },
  {
    field: "supplierAbbr",
    label: "供应商简称："
  },
  {
    field: "productBatchNo",
    label: "批次号："
  },
  {
    field: "receiveEmpName",
    label: "收货人："
  },
  {
    field: "receiveTime",
    label: "收货时间："
  }
])

const activeTab = ref(EnumTab.PRODUCT)

const uploadFileList = ref<IUploadFile[]>([]) // 已上传的文件列表
const receiveFilesRef = ref<InstanceType<typeof ReceiveFiles>>()

// 上传附件到委外单
const onUploadAttachFile = async (val: IUploadFile[]) => {
  try {
    const list = val.map((item) => {
      return item.fileId
    })
    await uploadAttachFile(props.id, list)
    ElMessage.success("上传成功")
    //提交成功，重载附件列表,并清空上传列表
    uploadFileList.value = []
    receiveFilesRef.value?.getAttachFiles()
  } catch (error) {
    console.log(error)
  }
}
watch(
  () => uploadFileList.value,
  (val) => {
    if (val && val.length) {
      onUploadAttachFile(val)
    }
  }
)
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
