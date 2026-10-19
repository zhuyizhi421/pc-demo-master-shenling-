<template>
  <CustomDialog
    v-model="visible"
    :title="isDetail ? '上岗证信息' : isEdit ? '编辑查看' : '新建上岗证'"
    size="medium"
    @close="closeHandle"
  >
    <template v-if="isDetail">
      <CustomDescription :data="formData" :configs="detailConfig" :columns="2" style="padding: 0">
        <template #auto-freeze-content>
          <div class="auto-freeze-container">
            <el-tag v-if="autoFreezeCheck" type="success">开启</el-tag>
            <el-tag v-else type="danger">关闭</el-tag>
            <div v-if="autoFreezeCheck" class="pl-2">
              <div class="leading-[24px]">
                员工
                <span class="font-semibold">{{ formData.idleMaxDays }}</span>
                天未操作关联设备，自动冻结。
              </div>
              <div class="leading-[24px]">
                上岗证冻结前
                <span class="font-semibold">{{ formData.preNoticeDays }}</span> 天，系统通知持有人。
              </div>
            </div>
          </div>
        </template>
      </CustomDescription>
    </template>
    <template v-else>
      <CustomForm ref="customFormRef" v-model="formData" :configs="formConfigs" :columns="2">
        <template #auto-freeze-default>
          <el-checkbox
            label="开启"
            name="type"
            v-model="autoFreezeCheck"
            :true-value="1"
            :false-value="0"
          />
          <div v-if="autoFreezeCheck" class="pl-2">
            <div>
              <span>员工</span>
              <el-input-number
                class="ml-2 mr-2"
                v-model="formData.idleMaxDays"
                :min="10"
                :max="365"
                controls-position="right"
              />
              <span>天未操作关联设备，自动冻结。</span>
            </div>
            <div>
              <span>上岗证冻结前</span>
              <el-input-number
                class="ml-2 mt-2 mr-2"
                v-model="formData.preNoticeDays"
                :min="1"
                :max="30"
                controls-position="right"
              />
              <span>天，系统通知持有人。</span>
            </div>
          </div>
        </template>
      </CustomForm>
    </template>

    <CustomTitle title="上岗证培训文档">
      <div v-if="!isDetail">
        <el-button type="primary" icon="Plus" @click="selectDocumentDialogVisible = true">
          添加文档
        </el-button>
      </div>
    </CustomTitle>
    <CustomTable
      ref="customTableRef"
      v-model:table-data="customTableData"
      :config="tableConfig"
      class="custom-table"
    >
      <template #fileStatus-default="{ row }">
        <el-tag
          v-if="EnumDocumentStatusMap[row.fileStatus as EnumDocumentStatus]"
          :type="EnumDocumentStatusTagMap[row.fileStatus as EnumDocumentStatus]"
        >
          {{ EnumDocumentStatusMap[row.fileStatus as EnumDocumentStatus] }}
        </el-tag>
      </template>

      <template #operation-default="{ row, $index }">
        <el-button type="primary" size="small" link @click="fileDownloadHandle(row.fileId)">
          下载
        </el-button>
        <el-button v-if="!isDetail" type="danger" size="small" link @click="onDeleteRow($index)"
          >删除本行</el-button
        >
      </template>
    </CustomTable>

    <!-- 选择设备模型弹窗 -->
    <SelectDeviceModelDialog
      v-model="selectDeviceModelVisible"
      :selected-row-keys="formData.equipmentTypesKind"
      multiple
      @success="onSelectDeviceModelSuccess"
    />

    <!-- 选择设备弹窗 -->
    <SelectDeviceDialog
      v-model="selectDeviceVisible"
      :selected-row-keys="formData.equipmentTypesSpecific"
      multiple
      @success="onSelectDeviceSuccess"
    />

    <!-- 选择文档弹窗 -->
    <SelectDocumentDialog
      v-model="selectDocumentDialogVisible"
      :selected-row-keys="selectedDocumentIdList"
      :statusList="[EnumDocumentStatus.Normal]"
      multiple
      @success="onSelectDocumentSuccess"
    />

    <template #footer>
      <span class="dialog-footer" v-if="!isDetail">
        <el-button @click="onCancel()">取消</el-button>
        <el-button v-if="isAuth" type="primary" @click="onSubmit()">保存</el-button>
      </span>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { fileDownloadHandle } from "@/api/fileResource"
import { queryJobDetail, queryJobList } from "@/api/job"
import { queryLicenseDetail, requestCreateLicense, requestUpdateLicense } from "@/api/license"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectDeviceDialog from "@/components/SelectDeviceDialog/index.vue"
import SelectDeviceModelDialog from "@/components/SelectDeviceModelDialog/index.vue"
import SelectDocumentDialog from "@/components/SelectDocumentDialog/index.vue"
import {
  EnumDocumentStatus,
  EnumDocumentStatusMap,
  EnumDocumentStatusTagMap
} from "@/constant/enums"
import useButtonAuth from "@/hooks/useButtonAuth"
import useResetRef from "@/hooks/useResetRef"
import type { FileResourceVo as ITableRow } from "@/types/base-info/employee"
import type { IFileResourcePageItem } from "@/types/base-info/file"
import type { IEquipmentPageItem } from "@/types/maintain/equipment-manage/equipment-info"
import type { IEquipmentModelPageItem } from "@/types/maintain/equipment-manage/equipment-model"

const isAuth = useButtonAuth("PostManage_update", "PostManage_query")

enum EnumEquipmentType {
  All = 1,
  SpecificType = 2,
  Specific = 3
}

const isDetail = ref(false)
const visible = ref(false)
const isEdit = ref(false)
const jobOptions = ref<
  {
    id: string
    jobName: string
  }[]
>([])

const autoFreezeCheck = ref(1) // 自动冻结标识

const emits = defineEmits<{
  (e: "onOk"): void
}>()

const [formData, resetFormData] = useResetRef<any>({
  licenseName: "",
  jobName: "",
  jobId: "",
  autoFreeze: "开启",
  idleMaxDays: 10,
  preNoticeDays: 1,
  equipmentType: 1,
  equipmentBizIds: "",
  id: "",
  equipmentTypesKind: [],
  equipmentTypesSpecific: [],
  equipmentConfig: [
    {
      equipmentId: 0
    }
  ],
  equipmentTypeConfig: [
    {
      equipmentId: 0,
      equipmentName: ""
    }
  ],
  equipmentDeviceConfig: [
    {
      equipmentId: 0,
      equipmentName: ""
    }
  ],
  licenseApplyProcessName: "",
  licenseUnfreezeProcessName: ""
})

const detailConfig = ref<ICustomDescriptionConfig[]>([
  {
    field: "licenseName",
    label: "上岗证名称："
  },
  {
    field: "jobId",
    label: "所属岗位：",
    formatter: ({ data: { jobId } }) => {
      return jobOptions.value.find((item) => item.id === jobId)?.jobName || "-"
    }
  },
  {
    field: "licenseApplyProcessName",
    label: "上岗证申请流程："
  },
  {
    field: "licenseUnfreezeProcessName",
    label: "上岗证解冻流程："
  },
  {
    field: "autoFreeze",
    label: "上岗证自动冻结：",
    colspan: -1,
    slots: {
      content: "auto-freeze-content"
    }
  },
  {
    field: "equipmentType",
    label: "可操作设备：",
    formatter: ({ data: { equipmentType } }) => {
      return (
        [
          {
            label: "所有设备",
            value: EnumEquipmentType.All
          },
          {
            label: "特定设备类型",
            value: EnumEquipmentType.SpecificType
          },
          {
            label: "特定设备",
            value: EnumEquipmentType.Specific
          }
        ].find((item) => item.value === equipmentType)?.label || "-"
      )
    }
  },
  {
    field: "equipmentTypesKind",
    label: "可操作设备类型：",
    get hidden() {
      return formData.value.equipmentType !== EnumEquipmentType.SpecificType
    },
    formatter: () => {
      return deviceModelOptions.value.map((item) => item.label).join(",")
    }
  },
  {
    field: "equipmentTypesSpecific",
    label: "可操作设备：",
    get hidden() {
      return formData.value.equipmentType !== EnumEquipmentType.Specific
    },
    formatter: () => {
      return deviceOptions.value.map((item) => item.label).join(",")
    }
  }
])

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = ref<ICustomFormConfigItem[]>([
  {
    componentType: "el-input",
    label: "上岗证名称",
    field: "licenseName",
    rules: [
      {
        required: true,
        message: "请输入上岗证名称",
        trigger: "blur"
      }
    ],
    props: {
      type: "text",
      placeholder: "请输入上岗证名称"
    }
  },
  {
    componentType: "el-select",
    label: "所属岗位",
    field: "jobId",
    rules: [
      {
        required: true,
        message: "请输入所属岗位",
        trigger: "blur"
      }
    ],
    props: {
      placeholder: "请选择所属岗位",
      get customChildren() {
        return jobOptions.value.map((item) => {
          return {
            componentType: "el-option",
            props: { label: item.jobName, value: item.id }
          }
        })
      }
    }
  },
  {
    componentType: "el-input",
    label: "上岗证申请流程",
    field: "licenseApplyProcessName",
    props: {
      placeholder: "请输入上岗证申请流程",
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "上岗证解冻流程",
    field: "licenseUnfreezeProcessName",
    props: {
      placeholder: "请输入上岗证解冻流程",
      disabled: true
    }
  },
  {
    componentType: "div",
    label: "上岗证自动冻结",
    field: "autoFreeze",
    colspan: -1,
    props: {
      class: "auto-freeze-container"
    },
    slots: {
      default: "auto-freeze-default"
    }
  },
  {
    componentType: "el-radio-group",
    label: "可操作设备",
    field: "equipmentType",
    rules: [
      {
        required: true,
        message: "请选择可操作设备",
        trigger: "change"
      }
    ],
    colspan: -1,
    props: {
      customChildren: [
        {
          componentType: "el-radio",
          props: { label: "所有设备", value: EnumEquipmentType.All }
        },
        {
          componentType: "el-radio",
          props: { label: "特定设备类型", value: EnumEquipmentType.SpecificType }
        },
        {
          componentType: "el-radio",
          props: { label: "特定设备", value: EnumEquipmentType.Specific }
        }
      ]
    }
  },
  {
    componentType: "el-select",
    label: "可操作设备类型",
    field: "equipmentTypesKind",
    rules: [
      {
        required: true,
        message: "请选择特定设备类型",
        trigger: "change"
      }
    ],
    get hidden() {
      return formData.value.equipmentType !== EnumEquipmentType.SpecificType
    },
    props: {
      placeholder: "请选择可操作设备类型",
      multiple: true,
      collapseTags: true,
      collapseTagsTooltip: true,
      get customChildren() {
        return deviceModelOptions.value.map((item) => {
          return {
            componentType: "el-option",
            props: { label: item.label, value: item.value }
          }
        })
      }
    },
    events: {
      visibleChange: (value: boolean) => {
        value && (selectDeviceModelVisible.value = value)
      }
    }
  },
  {
    componentType: "el-select",
    label: "可操作设备",
    field: "equipmentTypesSpecific",
    rules: [
      {
        required: true,
        message: "请选择可操作设备",
        trigger: "change"
      }
    ],
    get hidden() {
      return formData.value.equipmentType !== EnumEquipmentType.Specific
    },
    props: {
      placeholder: "请选择可操作设备",
      multiple: true,
      collapseTags: true,
      collapseTagsTooltip: true,
      get customChildren() {
        return deviceOptions.value.map((item) => {
          return {
            componentType: "el-option",
            props: { label: item.label, value: item.value }
          }
        })
      }
    },
    events: {
      visibleChange: (value: boolean) => {
        value && (selectDeviceVisible.value = value)
      }
    }
  }
])

const selectDeviceVisible = ref(false)
const deviceOptions = ref<{ label: string; value: string }[]>([])
const selectDeviceModelVisible = ref(false)
const deviceModelOptions = ref<{ label: string; value: string }[]>([])

//  产品类型弹窗文档部分
const selectDocumentDialogVisible = ref(false)
const selectedDocumentIdList = computed(() => {
  return customTableData.value?.map((item) => item.id)
})

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "220px",
  columns: [
    {
      prop: "fileName",
      label: "文档名称",
      minWidth: 160
    },
    {
      prop: "sourceName",
      label: "源文档名",
      minWidth: 160
    },
    {
      prop: "directoryName",
      label: "文档类型",
      width: 160
    },
    {
      prop: "extension",
      label: "格式",
      width: 90,
      align: "center"
    },
    {
      prop: "fileStatus",
      label: "文档状态",
      width: 120,
      align: "center",
      slots: {
        default: "fileStatus-default"
      }
    },
    {
      prop: "size",
      label: "文档大小",
      width: 120,
      align: "center"
    },
    {
      prop: "operation",
      label: "操作",
      width: 130,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

/** 设置弹窗显示状态 */
const setVisible = async ({
  show,
  editStatus,
  id = undefined,
  detailStatus = false,
  jobId = ""
}: {
  show: boolean
  editStatus: boolean
  id?: string
  detailStatus?: boolean
  jobId?: string
}) => {
  isEdit.value = editStatus
  visible.value = show
  detailStatus ? (isDetail.value = detailStatus) : false
  getJobList()

  // 编辑、详情状态获取上岗证信息
  if (id) {
    formData.value.id = id
    const res = await queryLicenseDetail({ id })
    if (!res) {
      return
    }
    customTableData.value =
      res.fileResourceList?.map((item) => {
        return {
          ...item,
          fileId: item.id
        }
      }) || []
    formData.value = {
      id: res.id,
      jobId: res.jobId,
      jobName: res.jobName,
      licenseName: res.licenseName
    }
    onJobChange(res.jobId)

    autoFreezeCheck.value = res.autoFreeze
    if (res.autoFreeze == 1) {
      formData.value.idleMaxDays = res.idleMaxDays
      formData.value.preNoticeDays = res.preNoticeDays
    }
    formData.value.equipmentType = res.equipmentType
    if (formData.value.equipmentType === EnumEquipmentType.SpecificType) {
      formData.value.equipmentTypesKind = res.equipmentModelList?.map((item) => item.id) || []
      deviceModelOptions.value = res.equipmentModelList.map((item) => ({
        label: item.modelName,
        value: item.id
      }))
    } else if (formData.value.equipmentType === EnumEquipmentType.Specific) {
      formData.value.equipmentTypesSpecific = res.equipmentList.map((item) => item.id)
      deviceOptions.value = res.equipmentList.map((item) => ({
        label: item.equipmentName,
        value: item.id
      }))
    }
  } else {
    if (jobId) {
      formData.value.jobId = jobId
      onJobChange(jobId)
    }
  }
}

/** 获取岗位列表 */
const getJobList = async () => {
  const res = await queryJobList()
  jobOptions.value = res.map((item) => ({
    id: item.id,
    jobName: item.jobName
  }))
}

/** 切换所属岗位，设置流程信息 */
const onJobChange = async (value: string) => {
  const { licenseApplyProcessName, licenseUnfreezeProcessName } = await queryJobDetail({
    id: value
  })
  formData.value.licenseApplyProcessName = licenseApplyProcessName || "-"
  formData.value.licenseUnfreezeProcessName = licenseUnfreezeProcessName || "-"
}

/** 产品类别文档删除行 */
const onDeleteRow = (index: number) => {
  customTableData.value.splice(index, 1)
}

/**
 * 选择设备模型弹窗成功回调
 */
const onSelectDeviceModelSuccess = (data: IEquipmentModelPageItem[]) => {
  if (!data.length) {
    return
  }
  formData.value.equipmentTypesKind = data.map((item) => item.id)
  deviceModelOptions.value = data.map((item) => ({
    label: item.modelName,
    value: item.id
  }))
}

/**
 * 选择设备弹窗成功回调
 */
const onSelectDeviceSuccess = (data: IEquipmentPageItem[]) => {
  if (!data.length) {
    return
  }
  formData.value.equipmentTypesSpecific = data.map((item) => item.id)
  deviceOptions.value = data.map((item) => ({
    label: item.equipmentName,
    value: item.id
  }))
}

/** 选择文档弹窗成功回调 */
const onSelectDocumentSuccess = (data: IFileResourcePageItem[]) => {
  if (data?.length) {
    data.forEach((file) => {
      if (!selectedDocumentIdList.value.includes(file.id)) {
        customTableData.value.push(file)
      }
    })
  }
}

/** 提交操作 */
const onSubmit = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return
  if (Number(formData.value.idleMaxDays) < 10 || Number(formData.value.idleMaxDays) > 365) {
    ElMessage({
      type: "warning",
      message: "自动冻结时间必须在10到365天之间"
    })
    return
  }

  if (Number(formData.value.preNoticeDays) < 1 || Number(formData.value.preNoticeDays) > 30) {
    ElMessage({
      type: "warning",
      message: "系统通知时间必须在10到365天之间"
    })
    return
  }

  if (formData.value.equipmentType === EnumEquipmentType.Specific) {
    if (formData.value.equipmentDeviceConfig?.length == 0) {
      ElMessage({
        type: "warning",
        message: "请选择特定设备"
      })
      return
    }
  } else if (formData.value.equipmentType === EnumEquipmentType.SpecificType) {
    if (formData.value.equipmentDeviceConfig?.length == 0) {
      ElMessage({
        type: "warning",
        message: "请选择特定设备类型"
      })
      return
    }
    formData.value.equipmentConfig =
      formData.value.equipmentTypeConfig?.map((item: any) => ({
        equipmentId: +item
      })) ?? []
  }

  let type = formData.value.equipmentType
  let params = {
    id: isEdit.value ? formData.value.id : "",
    jobId: formData.value.jobId,
    licenseName: formData.value.licenseName,
    autoFreeze: autoFreezeCheck.value,
    idleMaxDays: formData.value.idleMaxDays || undefined,
    preNoticeDays: formData.value.preNoticeDays || undefined,
    equipmentType: type,
    equipmentBizIds:
      type === EnumEquipmentType.All
        ? undefined
        : type === EnumEquipmentType.SpecificType
          ? formData.value.equipmentTypesKind?.join(",")
          : formData.value.equipmentTypesSpecific?.join(","),
    fileIds: customTableData.value?.map((item) => item.fileId)
  }

  let fn = isEdit.value ? requestUpdateLicense : requestCreateLicense

  await fn(params)
  ElMessage.success(isEdit.value ? "编辑成功" : "新建成功")
  visible.value = false
  customTableData.value = []
  emits("onOk")
}

/** 取消操作 */
const onCancel = () => {
  customFormRef.value?.resetForm()
  resetFormData()
  customTableData.value = []
  visible.value = false
}

function closeHandle() {
  resetFormData()
}

defineExpose({
  setVisible
})
</script>

<style lang="scss" scoped>
:deep(.auto-freeze-container) {
  display: flex;
}
</style>
