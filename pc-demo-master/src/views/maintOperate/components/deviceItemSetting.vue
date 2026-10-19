<template>
  <div class="deviceItemSetting">
    <CustomDrawer v-model="show" title="设备配置" size="medium">
      <el-tabs v-model="activeTab" type="card" class="demo-tabs" @tab-change="getTableData()">
        <el-tab-pane label="点检配置" :name="DeviceInitSettingTabs.check" />
        <el-tab-pane label="巡检配置" :name="DeviceInitSettingTabs.patrol" />
        <el-tab-pane label="保养配置" :name="DeviceInitSettingTabs.maintain" />
        <el-tab-pane label="设备参数配置" :name="DeviceInitSettingTabs.base" />
        <el-tab-pane label="相关文件配置" :name="DeviceInitSettingTabs.file" />
      </el-tabs>

      <CustomTable
        v-if="activeTab === DeviceInitSettingTabs.check"
        v-model:table-data="tableData"
        :config="spotTableConfig"
      >
        <template #image-remark-default="{ row: { spotItem } }">
          <el-image
            v-for="item in spotItem?.files"
            :key="item.id"
            :src="formatImgUrlPreview(item.path)"
            :preview-src-list="[formatImgUrlPreview(item.path)]"
            class="w-[50px] h-[50px]"
            fit="contain"
            preview-teleported
          />
        </template>

        <template #operation-default="{ row, $index }">
          <el-button
            type="primary"
            size="small"
            @click="onEditRowClick(row, $index)"
            :disabled="justSee"
            link
            >编辑</el-button
          >
          <el-button
            type="danger"
            size="small"
            @click="onDeleteRowClick(row)"
            :disabled="justSee"
            link
            >删除本行</el-button
          >
        </template>
      </CustomTable>

      <CustomTable
        v-else-if="activeTab === DeviceInitSettingTabs.patrol"
        v-model:table-data="tableData"
        :config="patrolTableConfig"
      >
        <template #image-remark-default="{ row: { patrolItem } }">
          <el-image
            v-for="item in patrolItem?.files"
            :key="item.id"
            :src="formatImgUrlPreview(item.path)"
            :preview-src-list="[formatImgUrlPreview(item.path)]"
            class="w-[50px] h-[50px]"
            fit="contain"
            preview-teleported
          />
        </template>

        <template #operation-default="{ row, $index }">
          <el-button
            type="primary"
            size="small"
            @click="onEditRowClick(row, $index)"
            :disabled="justSee"
            link
            >编辑</el-button
          >
          <el-button
            type="danger"
            size="small"
            @click="onDeleteRowClick(row)"
            :disabled="justSee"
            link
            >删除本行</el-button
          >
        </template>
      </CustomTable>

      <CustomTable
        v-else-if="activeTab === DeviceInitSettingTabs.maintain"
        v-model:table-data="tableData"
        :config="maintainTableConfig"
      >
        <template #image-remark-default="{ row: { maintenanceItem } }">
          <el-image
            v-for="item in maintenanceItem?.files"
            :key="item.id"
            :src="formatImgUrlPreview(item.path)"
            :preview-src-list="[formatImgUrlPreview(item.path)]"
            class="w-[50px] h-[50px]"
            fit="contain"
            preview-teleported
          />
        </template>

        <template #operation-default="{ row, $index }">
          <el-button
            type="primary"
            size="small"
            @click="onEditRowClick(row, $index)"
            :disabled="justSee"
            link
            >编辑</el-button
          >
          <el-button
            type="danger"
            size="small"
            @click="onDeleteRowClick(row)"
            :disabled="justSee"
            link
            >删除本行</el-button
          >
        </template>
      </CustomTable>

      <CustomTable
        v-else-if="activeTab === DeviceInitSettingTabs.base"
        v-model:table-data="tableData"
        :config="baseTableConfig"
      ></CustomTable>

      <CustomTable
        v-else-if="activeTab === DeviceInitSettingTabs.file"
        v-model:table-data="tableData"
        :config="fileTableConfig"
      >
        <template #operation-default="{ row }">
          <el-button type="primary" size="small" link @click="fileDownloadHandle(row.fileId)"
            >下载</el-button
          >
          <el-button
            type="danger"
            size="small"
            @click="onDeleteRowClick(row)"
            :disabled="justSee"
            link
            >删除本行</el-button
          >
        </template>
      </CustomTable>

      <template #footer v-if="!justSee">
        <el-button @click="show = false">取 消</el-button>
        <el-button v-if="isFileCheck" @click="selectDocumentDialogVisible = true" type="primary"
          >选择文档</el-button
        >
        <el-button v-else-if="!isBaseCheck" type="primary" @click="onAddConfigItemClick()"
          >新增配置项</el-button
        >
      </template>
    </CustomDrawer>

    <!-- 选择文档弹窗 -->
    <SelectDocumentDialog
      v-model="selectDocumentDialogVisible"
      :selected-row-keys="selectedDocumentIdList"
      multiple
      @success="onSelectDocumentSuccess"
    />

    <!-- 新增配置项弹窗 -->
    <CustomDialog
      v-model="addModalShow"
      :title="`新增${isMaintainCheck ? '保养' : '检验'}项`"
      @close="resetAddModalForm()"
    >
      <CustomForm ref="addModalFormRef" v-model="addModalForm" :configs="addFormConfig">
        <template #title-default>
          <div class="block-title">检验内容</div>
        </template>

        <template #standard-max-default>
          <el-form-item
            label="数值上限"
            prop="inspectionStandard.standardMax"
            :rules="{
              required: false,
              trigger: 'blur',
              message: '请输入数值上限'
            }"
          >
            <div class="flex w-[100%]">
              <el-select
                style="width: 100px"
                class="mr-[4px]"
                v-model="addModalForm.standardMaxInclusive"
              >
                <el-option label="≤" :value="1" />
                <el-option label="<" :value="0" />
              </el-select>
              <el-input
                type="number"
                v-model="addModalForm.standardMax"
                placeholder="请输入"
                @mousewheel.prevent
                clearable
              />
            </div>
          </el-form-item>
        </template>

        <template #standard-min-default>
          <el-form-item
            label="数值下限"
            prop="inspectionStandard.standardMin"
            :rules="{
              required: false,
              trigger: 'blur',
              message: '请输入数值下限'
            }"
          >
            <div class="flex w-[100%]">
              <el-select
                style="width: 100px"
                class="mr-[4px]"
                v-model="addModalForm.standardMinInclusive"
              >
                <el-option label="≥" :value="1" />
                <el-option label=">" :value="0" />
              </el-select>
              <el-input
                type="number"
                v-model="addModalForm.standardMin"
                placeholder="请输入"
                @mousewheel.prevent
                clearable
              />
            </div>
          </el-form-item>
        </template>

        <template #if-default>
          <div class="block-title">检验条件</div>
        </template>

        <template #frequency-default>
          <el-form-item
            label="检验频率"
            required
            prop="inspectionFrequency"
            :rules="{
              validator: (rule: any, value: any, callback: any) => {
                if (isSpotCheck) {
                  callback()
                } else {
                  const number = Number(value)
                  if (isNaN(number)) {
                    callback('请输入数字')
                  } else {
                    if (number < 1 || number > 365) {
                      callback('请输入数字1-365')
                    } else if (Math.floor(number) !== number) {
                      callback('请输入整数')
                    } else {
                      callback()
                    }
                  }
                }
              }
            }"
          >
            <el-select
              v-if="isSpotCheck"
              v-model="addModalForm.inspectionFrequency"
              placeholder="请选择检验标准类型"
            >
              <el-option label="按天" :value="SpotInspectionFrequency.Daily" />
              <el-option label="时间点" :value="SpotInspectionFrequency.TimePoint" />
            </el-select>
            <el-input
              v-else
              v-model="addModalForm.inspectionFrequency"
              placeholder="请输入数字1-365"
            >
              <template #append>天</template>
            </el-input>
          </el-form-item>
        </template>

        <template #inspect-time-default>
          <el-form-item
            v-for="(item, index) in addModalForm.inspectionTimeList"
            :key="item.key"
            :label="!index ? '选择时间' : ''"
            :prop="`inspectionTimeList.${index}.value`"
            :rules="{
              required: true,
              message: '请选择时间',
              trigger: 'blur'
            }"
          >
            <el-time-picker
              v-model="item.value"
              placeholder="请选择"
              format="HH:mm"
              value-format="HH:mm"
              style="width: 220px"
            />
            <el-icon
              v-if="index !== addModalForm.inspectionTimeList.length - 1"
              class="ml-[10px] mt-[5px] cursor-pointer"
              color="#f56c6c"
              size="20"
              @click="onRemoveTimeItemClick(index)"
              ><RemoveFilled
            /></el-icon>
            <el-icon
              v-else
              class="ml-[10px] mt-[5px] cursor-pointer"
              color="#4093ff"
              size="20"
              @click="onAddTimeItemClick()"
              ><CirclePlusFilled
            /></el-icon>
          </el-form-item>
        </template>
      </CustomForm>

      <template #footer>
        <el-button @click="addModalShow = false">取 消</el-button>
        <el-button type="primary" @click="onSubmitConfigItemClick()">确 定</el-button>
      </template>
    </CustomDialog>

    <!-- 选择部门组件 -->
    <SelectPersonDialog
      v-model="selectDepartmentVisible"
      :type="EnumSelectUser.Department"
      :selected-ids="selectedDepartmentIds"
      :multiple="departmentType === 2"
      @success="onSelectDepartmentSuccess($event)"
    />
  </div>
</template>

<script setup lang="ts" name="deviceItemSetting">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  queryInspectOptionTemplateDetail,
  queryInspectOptionTemplateList
} from "@/api/baseInfo/inspectOptionTemplate"
import { fileDownloadHandle } from "@/api/fileResource"
import {
  requestDeleteEquipmentConfig,
  requestEquipmentConfigList,
  requestUpdateEquipmentConfig
} from "@/api/operation/equipment/equipment-config"
import {
  DeviceInitSettingTabs,
  InspectionStandardType,
  inspectionStandardTypeToNameMap,
  SpotInspectionFrequency,
  spotInspectionFrequencyMap
} from "@/api/operation/equipment/types"
import { getUnit } from "@/api/units"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomDrawer from "@/components/CustomDrawer/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import SelectDocumentDialog from "@/components/SelectDocumentDialog/index.vue"
import SelectPersonDialog from "@/components/SelectPersonDialog/index.vue"
import type { ITree } from "@/components/SelectPersonDialog/type"
import UploadImage from "@/components/UploadImage/index.vue"
import { EnumDocumentStatus, EnumDocumentStatusMap } from "@/constant/enums"
import { EnumSelectUser } from "@/constant/enums"
import useResetRef from "@/hooks/useResetRef"
import type { IFileResourcePageItem } from "@/types/base-info/file"
import type { IOption, IUploadPhoto } from "@/types/base-info/global-config"
import type { IInspectOptionTemplateListItem } from "@/types/base-info/inspect-option-template"
import type { IEquipmentConfigPageListItem as ITableRow } from "@/types/maintain/equipment-manage/equipment-config"
import { isNumberStandardValid, modifyStandardData } from "@/utils"
import { formatImgUrlPreview } from "@/utils/common"

defineProps<{
  justSee?: boolean
}>()

const tabsToAttrNameMap = {
  [DeviceInitSettingTabs.check]: "spotItem",
  [DeviceInitSettingTabs.patrol]: "patrolItem",
  [DeviceInitSettingTabs.maintain]: "maintenanceItem",
  [DeviceInitSettingTabs.base]: "specificationJson",
  [DeviceInitSettingTabs.file]: "fileIds"
}

const tabsToParamAttrNameMap = {
  [DeviceInitSettingTabs.check]: "spotConfigValue",
  [DeviceInitSettingTabs.patrol]: "patrolConfigValue",
  [DeviceInitSettingTabs.maintain]: "maintenanceConfigValue",
  [DeviceInitSettingTabs.base]: "specConfigValue",
  [DeviceInitSettingTabs.file]: "fileIds"
}

let modelId = ""

const selectDocumentDialogVisible = ref(false)
const selectedDocumentIdList = computed(() => {
  if (activeTab.value === DeviceInitSettingTabs.file) {
    return tableData.value.map((item: any) => String(item?.fileResource?.deploymentId))
  } else {
    return []
  }
})
const show = ref(false)
const addModalShow = ref(false)

const currentEditIndex = ref(-1) // 也可用来标识是新增还是编辑
const activeTab = ref(DeviceInitSettingTabs.check)

const isSpotCheck = computed(() => activeTab.value === DeviceInitSettingTabs.check)
const isPatrolCheck = computed(() => activeTab.value === DeviceInitSettingTabs.patrol)
const isMaintainCheck = computed(() => activeTab.value === DeviceInitSettingTabs.maintain)
const isBaseCheck = computed(() => activeTab.value === DeviceInitSettingTabs.base)
const isFileCheck = computed(() => activeTab.value === DeviceInitSettingTabs.file)
const activeParamsAttr = computed(() => tabsToParamAttrNameMap[activeTab.value])
const activeDataItemAttr = computed(() => tabsToAttrNameMap[activeTab.value])

const unitOptions = ref<{ label: string; value: string }[]>([])

const departmentType = ref(1) // 当前查看的部门类型  1：执行部门 2：NG处理部门
const selectDepartmentVisible = ref(false)
const selectedDepartmentList = ref<IOption[]>([])
const selectedNgDepartmentList = ref<IOption[]>([])
const selectedDepartmentIds = computed(() =>
  departmentType.value === 1
    ? addModalForm.value.inspectionDepartmentIds
    : addModalForm.value.ngDepartmentIds
)

// 点检巡检保养
const [addModalForm, resetAddModalForm] = useResetRef<{
  inspectionId: string
  inspectionName: string
  inspectionCode: string
  fileIds: string[]
  ngDepartmentIds: string[]
  inspectionDepartmentIds: string[]
  method: string
  standardType: InspectionStandardType
  standardMax: number
  standardMin: number
  standardDesc: string
  standardMinInclusive: number
  standardMaxInclusive: number
  unitId: string
  inspectionFrequency: number | SpotInspectionFrequency
  inspectionTimeList: { key: number; value: string }[]
  imageList: IUploadPhoto[]
}>({
  inspectionId: "",
  inspectionName: "",
  inspectionCode: "",
  fileIds: [] as string[],
  ngDepartmentIds: [],
  inspectionDepartmentIds: [], // 巡检中的检验执行部门
  method: "",
  standardType: InspectionStandardType.Text,
  standardMax: 0,
  standardMin: 0,
  standardDesc: "",
  standardMinInclusive: 1,
  standardMaxInclusive: 0,
  unitId: "",
  inspectionFrequency: isSpotCheck.value ? SpotInspectionFrequency.Daily : 1,
  inspectionTimeList: [{ key: 0, value: "" }], // 点检配置-检验时间点列表
  imageList: []
})
const addFormConfig = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "div",
    special: true,
    slots: {
      default: "title-default"
    }
  },
  {
    componentType: "el-select",
    label: "检验项名称",
    field: "inspectionId",
    rules: [{ required: true, trigger: "change", message: "请选择检验项名称" }],
    props: {
      customChildren: inspectTemplateOptions.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.itemName,
          value: item.id
        }
      })),
      clearable: true,
      filterable: true,
      allowCreate: true,
      defaultFirstOption: true
    },
    events: {
      change: onInspectNameChange
    }
  },
  {
    componentType: "el-input",
    label: "检验项编号",
    field: "inspectionCode",
    props: {
      placeholder: "不填则自动生成",
      disabled: currentEditIndex.value !== -1
    }
  },
  {
    componentType: "el-input",
    label: "方法要求",
    field: "method",
    props: {
      type: "textarea",
      placeholder: "请输入",
      maxlength: 200,
      showWordLimit: true
    }
  },
  {
    componentType: "el-select",
    label: "检验标准类型",
    field: "standardType",
    props: {
      customChildren: Object.entries(inspectionStandardTypeToNameMap).map(([key, value]) => {
        return {
          componentType: "el-option",
          props: {
            label: value,
            value: +key
          }
        }
      })
    }
  },
  {
    componentType: "el-input",
    label: "检验标准",
    field: "standardDesc",
    props: {
      placeholder: "请输入"
    },
    rules: [
      {
        required: true,
        message: "请输入检验标准",
        trigger: "blur"
      }
    ],
    hidden: addModalForm.value.standardType !== InspectionStandardType.Text
  },
  {
    componentType: "div",
    special: true,
    slots: {
      default: "standard-max-default"
    },
    hidden: addModalForm.value.standardType === InspectionStandardType.Text
  },
  {
    componentType: "div",
    special: true,
    slots: {
      default: "standard-min-default"
    },
    hidden: addModalForm.value.standardType === InspectionStandardType.Text
  },
  {
    componentType: "el-select",
    label: "单位",
    field: "unitId",
    props: {
      customChildren: unitOptions.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.label,
          value: item.value
        }
      })),
      clearable: true,
      filterable: true
    },
    hidden: addModalForm.value.standardType === InspectionStandardType.Text
  },
  {
    componentType: markRaw(UploadImage),
    label: "图片说明",
    field: "imageList",
    props: {
      limit: 5,
      multiple: true
    }
  },
  {
    componentType: "div",
    special: true,
    slots: {
      default: "if-default"
    }
  },
  {
    componentType: "div",
    special: true,
    slots: {
      default: "frequency-default"
    }
  },
  {
    componentType: "div",
    special: true,
    slots: {
      default: "inspect-time-default"
    },
    hidden:
      !isSpotCheck.value ||
      addModalForm.value.inspectionFrequency !== SpotInspectionFrequency.TimePoint
  },
  {
    componentType: "el-select",
    label: isMaintainCheck.value ? "保养执行部门" : "检验执行部门",
    field: "inspectionDepartmentIds",
    rules: [
      {
        required: true,
        message: "请选择执行部门",
        trigger: "change"
      }
    ],
    props: {
      customChildren: selectedDepartmentList.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.label,
          value: item.value
        }
      })),
      clearable: true,
      multiple: true,
      collapseTags: true,
      collapseTagsTooltip: true
    },
    events: {
      visibleChange: ($event: boolean) => onSelectDepartmentVisibleChange($event, 1)
    },
    hidden: isSpotCheck.value
  },
  {
    componentType: "el-select",
    label: "NG处理部门",
    field: "ngDepartmentIds",
    rules: [
      {
        required: true,
        message: "请选择NG处理部门",
        trigger: "change"
      }
    ],
    props: {
      customChildren: selectedNgDepartmentList.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.label,
          value: item.value
        }
      })),
      clearable: true,
      multiple: true,
      collapseTags: true,
      collapseTagsTooltip: true
    },
    events: {
      visibleChange: ($event: boolean) => onSelectDepartmentVisibleChange($event, 2)
    }
  }
])

const inspectTemplateOptions = ref<IInspectOptionTemplateListItem[]>([]) //检验项模板下拉options
const addModalFormRef = ref<InstanceType<typeof CustomForm>>()
const baseModalForm = ref({
  // 设备参数
  show: false,
  desc: "",
  key: "",
  val: ""
})

let timeKey = 0

const tableData = ref<ITableRow[]>([])
const spotTableConfig: ITableConfig = {
  height: "100%",
  columns: [
    {
      prop: "inspectionName",
      label: "检验项",
      width: 160,
      formatter: ({ spotItem }) => spotItem?.inspectionName
    },
    {
      prop: "inspectionCode",
      label: "检验项编号",
      width: 160,
      formatter: ({ spotItem }) => spotItem?.inspectionCode
    },
    {
      prop: "method",
      label: "方法要求",
      width: 160,
      formatter: ({ spotItem }) => spotItem?.method
    },
    {
      prop: "standardType",
      label: "检验标准类型",
      width: 120,
      align: "center",
      formatter: ({ spotItem }) =>
        inspectionStandardTypeToNameMap[spotItem?.inspectionStandard?.standardType]
    },
    {
      prop: "inspectionStandard",
      label: "检验标准",
      width: 160,
      align: "center",
      formatter: ({ spotItem }) => formatStandard(spotItem?.inspectionStandard)
    },
    {
      prop: "inspectionFrequency",
      label: "检验频率",
      width: 160,
      align: "center",
      formatter: ({ spotItem }) =>
        spotInspectionFrequencyMap[spotItem?.inspectionFrequency as SpotInspectionFrequency]
    },
    {
      prop: "ngDepartments",
      label: "NG处理部门",
      width: 160,
      formatter: ({ spotItem }: ITableRow) =>
        spotItem?.ngDepartments?.map((item) => item.depName).join("，")
    },
    {
      prop: "imageRemark",
      label: "图片说明",
      width: 160,
      slots: {
        default: "image-remark-default"
      }
    },
    {
      prop: "operation",
      label: "操作",
      width: 140,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
}
const patrolTableConfig: ITableConfig = {
  height: "100%",
  columns: [
    {
      prop: "inspectionName",
      label: "检验项",
      width: 160,
      formatter: ({ patrolItem }) => patrolItem?.inspectionName
    },
    {
      prop: "inspectionCode",
      label: "检验项编号",
      width: 160,
      formatter: ({ patrolItem }) => patrolItem?.inspectionCode
    },
    {
      prop: "method",
      label: "方法要求",
      width: 160,
      formatter: ({ patrolItem }) => patrolItem?.method
    },
    {
      prop: "standardType",
      label: "检验标准类型",
      width: 120,
      align: "center",
      formatter: ({ patrolItem }) =>
        inspectionStandardTypeToNameMap[patrolItem?.inspectionStandard?.standardType]
    },
    {
      prop: "inspectionStandard",
      label: "检验标准",
      width: 160,
      align: "center",
      formatter: ({ patrolItem }) => formatStandard(patrolItem?.inspectionStandard)
    },
    {
      prop: "inspectionFrequency",
      label: "检验频率",
      width: 160,
      align: "center",
      formatter: ({ patrolItem }) => patrolItem?.inspectionFrequency
    },
    {
      prop: "inspectionDepartments",
      label: "检验执行部门",
      width: 160,
      formatter: ({ patrolItem }: ITableRow) =>
        patrolItem?.inspectionDepartments?.map((item) => item.depName).join("，")
    },
    {
      prop: "ngDepartments",
      label: "NG处理部门",
      width: 160,
      formatter: ({ patrolItem }: ITableRow) =>
        patrolItem?.ngDepartments?.map((item) => item.depName).join("，")
    },
    {
      prop: "imageRemark",
      label: "图片说明",
      width: 160,
      slots: {
        default: "image-remark-default"
      }
    },
    {
      prop: "operation",
      label: "操作",
      width: 140,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
}
const maintainTableConfig: ITableConfig = {
  height: "100%",
  columns: [
    {
      prop: "maintenanceName",
      label: "检验项",
      width: 160,
      formatter: ({ maintenanceItem }) => maintenanceItem?.maintenanceName
    },
    {
      prop: "",
      label: "检验项编号",
      width: 160,
      formatter: ({ maintenanceItem }) => maintenanceItem?.maintenanceCode
    },
    {
      prop: "method",
      label: "方法要求",
      width: 160,
      formatter: ({ maintenanceItem }) => maintenanceItem?.method
    },
    {
      prop: "standardType",
      label: "检验标准类型",
      width: 120,
      align: "center",
      formatter: ({ maintenanceItem }) =>
        inspectionStandardTypeToNameMap[maintenanceItem?.inspectionStandard?.standardType]
    },
    {
      prop: "inspectionStandard",
      label: "检验标准",
      width: 160,
      align: "center",
      formatter: ({ maintenanceItem }) => formatStandard(maintenanceItem?.inspectionStandard)
    },
    {
      prop: "maintenanceFrequency",
      label: "保养频率",
      width: 160,
      align: "center",
      formatter: ({ maintenanceItem }) => maintenanceItem?.maintenanceFrequency
    },
    {
      prop: "maintenanceDepartments",
      label: "保养执行部门",
      width: 160,
      formatter: ({ maintenanceItem }: ITableRow) =>
        maintenanceItem?.maintenanceDepartments?.map((item) => item.depName).join("，")
    },
    {
      prop: "ngDepartments",
      label: "NG处理部门",
      width: 160,
      formatter: ({ maintenanceItem }: ITableRow) =>
        maintenanceItem?.ngDepartments?.map((item) => item.depName).join("，")
    },
    {
      prop: "imageRemark",
      label: "图片说明",
      width: 160,
      slots: {
        default: "image-remark-default"
      }
    },
    {
      prop: "operation",
      label: "操作",
      width: 140,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
}
const baseTableConfig: ITableConfig = {
  height: "100%",
  columns: [
    {
      prop: "key",
      label: "属性",
      minWidth: 160,
      formatter: ({ specificationJson }) => specificationJson?.key
    },
    {
      prop: "val",
      label: "值",
      minWidth: 160,
      formatter: ({ specificationJson }) => specificationJson?.val
    },
    {
      prop: "desc",
      label: "描述",
      minWidth: 160,
      formatter: ({ specificationJson }) => specificationJson?.desc
    }
  ]
}
const fileTableConfig: ITableConfig = {
  height: "100%",
  columns: [
    {
      prop: "fileName",
      label: "文件名称",
      minWidth: 160,
      formatter: ({ fileResource }) => fileResource?.fileName
    },
    {
      prop: "sourceName",
      label: "源文件名",
      minWidth: 160,
      formatter: ({ fileResource }) => fileResource?.sourceName
    },
    {
      prop: "extension",
      label: "文档类型",
      width: 120,
      align: "center",
      formatter: ({ fileResource }) => fileResource?.extension
    },
    {
      prop: "fileStatus",
      label: "文档状态",
      width: 120,
      align: "center",
      formatter: ({ fileResource }) =>
        EnumDocumentStatusMap[fileResource?.fileStatus as EnumDocumentStatus]
    },
    {
      prop: "size",
      label: "文件大小",
      width: 120,
      align: "right",
      formatter: ({ fileResource }) => fileResource?.size
    },
    {
      prop: "operation",
      label: "操作",
      width: 140,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
}

watch(
  () => show.value,
  (val) => {
    if (val) {
      getTableData()
    } else {
      resetAddModalForm()
    }
  }
)

watch(
  () => addModalShow.value,
  (val) => {
    if (!val) {
      currentEditIndex.value = -1
      addModalFormRef.value?.resetForm()
      resetAddModalForm()
      selectedDepartmentList.value = []
      selectedNgDepartmentList.value = []
    } else {
      getInspectOptionTemplate()
      getUnitOptions()
    }
  }
)

/** 执行部门visibleChange事件 */
const onSelectDepartmentVisibleChange = (val: boolean, type: number) => {
  if (val) {
    departmentType.value = type
    selectDepartmentVisible.value = val
  }
}

/** 选择部门弹窗回调成功 */
const onSelectDepartmentSuccess = (data: ITree[]) => {
  if (departmentType.value === 1) {
    // 设置执行部门
    selectedDepartmentList.value = data.map((item) => ({
      label: item.label,
      value: item.id
    }))
    addModalForm.value.inspectionDepartmentIds = data.map((item) => item.id)
  } else if (departmentType.value === 2) {
    // 设置NG处理部门
    selectedNgDepartmentList.value = data.map((item) => ({
      label: item.label,
      value: item.id
    }))
    addModalForm.value.ngDepartmentIds = data.map((item) => item.id)
  }
}

/** 获取检验项模板列表 */
const getInspectOptionTemplate = async () => {
  const res = await queryInspectOptionTemplateList({})
  inspectTemplateOptions.value = res || []
}

/** 切换检验项名称 */
const onInspectNameChange = async (val: string) => {
  if (!val) {
    return
  }

  // 判断是否是通过选择检验项模板来切换的，如果是，则需要根据模板id查询检验项详情，
  // 并将检验项详情赋值到表单中，如果不是，则清空检验性id
  const isSelect = inspectTemplateOptions.value.some((item) => item.id === val)
  if (isSelect) {
    const detailInfo = await queryInspectOptionTemplateDetail(val)
    if (detailInfo) {
      addModalForm.value.inspectionName = detailInfo.inspectItemName
      addModalForm.value.method = detailInfo.methodDesc
      addModalForm.value.standardType = detailInfo.standardType
      addModalForm.value.standardDesc = detailInfo.standardDesc
      addModalForm.value.standardMax = detailInfo.standardMax
      addModalForm.value.standardMaxInclusive = detailInfo.standardMaxInclusive ?? 0
      addModalForm.value.standardMin = detailInfo.standardMin
      addModalForm.value.standardMinInclusive = detailInfo.standardMinInclusive ?? 1
      addModalForm.value.unitId = detailInfo.unitId
      addModalForm.value.fileIds = detailInfo.images?.map((item) => item.id) || []
      addModalForm.value.imageList =
        detailInfo.images?.map((item) => ({
          fileName: item.fileName,
          fileUrl: formatImgUrlPreview(item.path),
          fileId: item.id
        })) || []
    }
  } else {
    addModalForm.value.inspectionId = val
    addModalForm.value.inspectionName = val
  }
}

/** 获取单位下拉列表 */
const getUnitOptions = async () => {
  const data = await getUnit()
  unitOptions.value = data.map((item) => {
    return {
      label: item.unitName,
      value: String(item.id)
    }
  })
}

/** 新增时间点 */
const onAddTimeItemClick = () => {
  addModalForm.value.inspectionTimeList.push({
    key: ++timeKey,
    value: ""
  })
}

/** 删除时间点 */
const onRemoveTimeItemClick = (index: number) => {
  addModalForm.value.inspectionTimeList.splice(index, 1)
}

/** 新增配置项 */
const onAddConfigItemClick = () => {
  if (isFileCheck.value) {
    selectDocumentDialogVisible.value = true
  } else if (isBaseCheck.value) {
    baseModalForm.value.show = true
  } else {
    addModalShow.value = true
  }
}

/** 获取表格数据 */
const getTableData = async () => {
  const data = await requestEquipmentConfigList({
    equipmentId: modelId,
    configType: activeTab.value
  })
  tableData.value = data
}

/** 删除行操作 */
const onDeleteRowClick = async (row: any) => {
  await ElMessageBox.confirm("此操作将删除本行, 是否继续?", "提示", {
    type: "warning"
  })
  if (activeTab.value === DeviceInitSettingTabs.file) {
    await requestUpdateEquipmentConfig({
      equipmentId: modelId,
      fileIds: tableData.value
        .map((item: any) => item.fileResource?.deploymentId)
        .filter((item) => item !== row.fileResource?.deploymentId),
      configType: DeviceInitSettingTabs.file
    })
  } else {
    await requestDeleteEquipmentConfig(row.id)
  }
  ElMessage.success("删除成功")
  getTableData()
}

/** 编辑操作 */
const onEditRowClick = (row: any, index: number) => {
  currentEditIndex.value = index
  if (isSpotCheck.value) {
    const timeList = row.spotItem?.inspectionTimeList?.map((item: any) => {
      return {
        key: ++timeKey,
        value: item
      }
    })

    addModalForm.value = {
      inspectionId: row.spotItem?.inspectionName,
      inspectionName: row.spotItem?.inspectionName,
      inspectionCode: row.spotItem?.inspectionCode,
      inspectionDepartmentIds: [],
      ngDepartmentIds: row.spotItem?.ngDepartments?.map((item: any) => item.id) || [],
      fileIds: row.spotItem?.files?.map((item: any) => item.id) || [],
      method: row.spotItem?.method,
      standardType: row.spotItem?.inspectionStandard.standardType,
      standardDesc: row.spotItem?.inspectionStandard.standardDesc,
      standardMax: row.spotItem?.inspectionStandard.standardMax,
      standardMaxInclusive: row.spotItem?.inspectionStandard.standardMaxInclusive ?? 0,
      standardMin: row.spotItem?.inspectionStandard.standardMin,
      standardMinInclusive: row.spotItem?.inspectionStandard.standardMinInclusive ?? 1,
      unitId: row.spotItem?.inspectionStandard.unitId,
      inspectionFrequency: row.spotItem?.inspectionFrequency,
      inspectionTimeList: timeList,
      imageList:
        row.spotItem?.files?.map((item: any) => ({
          fileName: item.fileName,
          fileUrl: formatImgUrlPreview(item.path),
          fileId: item.id
        })) ?? []
    }
    selectedDepartmentList.value = []
    selectedNgDepartmentList.value =
      row.spotItem?.ngDepartments?.map((item: any) => ({
        label: item.depName,
        value: item.id
      })) ?? []
  } else if (isPatrolCheck.value) {
    addModalForm.value = {
      inspectionId: row.patrolItem?.inspectionName,
      inspectionName: row.patrolItem?.inspectionName,
      inspectionCode: row.patrolItem?.inspectionCode,
      inspectionDepartmentIds:
        row.patrolItem?.inspectionDepartments?.map((item: any) => item.id) || [],
      ngDepartmentIds: row.patrolItem?.ngDepartments?.map((item: any) => item.id) || [],
      fileIds: row.patrolItem?.files?.map((item: any) => item.id) || [],
      method: row.patrolItem?.method,
      standardType: row.patrolItem?.inspectionStandard.standardType,
      standardDesc: row.patrolItem?.inspectionStandard.standardDesc,
      standardMax: row.patrolItem?.inspectionStandard.standardMax,
      standardMaxInclusive: row.patrolItem?.inspectionStandard.standardMaxInclusive ?? 0,
      standardMin: row.patrolItem?.inspectionStandard.standardMin,
      standardMinInclusive: row.patrolItem?.inspectionStandard.standardMinInclusive ?? 1,
      unitId: row.patrolItem?.inspectionStandard.unitId,
      inspectionFrequency: row.patrolItem?.inspectionFrequency,
      inspectionTimeList: [],
      imageList:
        row.patrolItem?.files?.map((item: any) => ({
          fileName: item.fileName,
          fileUrl: formatImgUrlPreview(item.path),
          fileId: item.id
        })) ?? []
    }
    selectedDepartmentList.value =
      row.patrolItem?.inspectionDepartments?.map((item: any) => ({
        label: item.depName,
        value: item.id
      })) ?? []
    selectedNgDepartmentList.value =
      row.patrolItem?.ngDepartments?.map((item: any) => ({
        label: item.depName,
        value: item.id
      })) ?? []
  } else if (isMaintainCheck.value) {
    addModalForm.value = {
      inspectionId: row.maintenanceItem?.maintenanceName,
      inspectionName: row.maintenanceItem?.maintenanceName,
      inspectionCode: row.maintenanceItem?.maintenanceCode,
      inspectionDepartmentIds:
        row.maintenanceItem?.maintenanceDepartments?.map((item: any) => item.id) || [],
      ngDepartmentIds: row.maintenanceItem?.ngDepartments?.map((item: any) => item.id) || [],
      fileIds: row.maintenanceItem?.files?.map((item: any) => item.id) ?? [],
      method: row.maintenanceItem?.method,
      standardType: row.maintenanceItem?.inspectionStandard.standardType,
      standardDesc: row.maintenanceItem?.inspectionStandard.standardDesc,
      standardMax: row.maintenanceItem?.inspectionStandard.standardMax,
      standardMaxInclusive: row.maintenanceItem?.inspectionStandard.standardMaxInclusive ?? 0,
      standardMin: row.maintenanceItem?.inspectionStandard.standardMin,
      standardMinInclusive: row.maintenanceItem?.inspectionStandard.standardMinInclusive ?? 1,
      unitId: row.maintenanceItem?.inspectionStandard.unitId,
      inspectionFrequency: row.maintenanceItem?.maintenanceFrequency,
      inspectionTimeList: [],
      imageList:
        row.maintenanceItem?.files?.map((item: any) => ({
          fileName: item.fileName,
          fileUrl: formatImgUrlPreview(item.path),
          fileId: item.id
        })) ?? []
    }
    selectedDepartmentList.value =
      row.maintenanceItem?.maintenanceDepartments?.map((item: any) => ({
        label: item.depName,
        value: item.id
      })) ?? []
    selectedNgDepartmentList.value =
      row.maintenanceItem?.ngDepartments?.map((item: any) => ({
        label: item.depName,
        value: item.id
      })) ?? []
  }
  addModalShow.value = true
  addModalForm.value = cloneDeep(addModalForm.value)
}

/** 格式化检验标准 */
const formatStandard = (inspectionStandard: any) => {
  if (inspectionStandard?.standardType) {
    const {
      standardType,
      standardDesc,
      standardMaxInclusive,
      standardMax,
      standardMinInclusive,
      standardMin
    } = inspectionStandard
    if (standardType === 2) {
      return standardDesc
    } else if (standardType === 1) {
      let str = ""
      if (!["undefined", "object"].includes(typeof standardMin) && standardMin !== "") {
        str += ` ${standardMin} ${standardMinInclusive ? "<=" : "<"} `
      }
      str += "n"
      if (!["undefined", "object"].includes(typeof standardMax) && standardMax !== "") {
        str += ` ${standardMaxInclusive ? "<=" : "<"} ${standardMax}`
      }
      return str
    }
  }
  return ""
}

/** 格式化频率 */
const formatFrequency = (row: any) => {
  if (isSpotCheck.value) {
    return row.spotItem?.inspectionFrequency === 1
      ? "按天"
      : row.spotItem?.inspectionFrequency === 2
        ? "换班"
        : "时间点"
  } else {
    return (
      row[tabsToAttrNameMap[activeTab.value]]?.inspectionFrequency ??
      row[tabsToAttrNameMap[activeTab.value]]?.maintenanceFrequency ??
      ""
    )
  }
}

/** tableData => params */
const nowDataToParams = () => {
  return tableData.value.map((item: any) => {
    const data = {
      configType: item.configType,
      equipmentId: item.equipmentId,
      configName:
        item[activeDataItemAttr.value]?.inspectionName ||
        item[activeDataItemAttr.value]?.maintenanceName,
      [activeParamsAttr.value]: {
        fileIds: item[activeDataItemAttr.value]?.files.map((item: any) => item.id) ?? [],
        ngDepartmentIds:
          item[activeDataItemAttr.value]?.ngDepartments.map((item: any) => item.id) ?? [],
        ...item[activeDataItemAttr.value]
      }
    }
    if (isBaseCheck.value) {
      data[activeParamsAttr.value] = {
        ...item[activeDataItemAttr.value]
      }
    } else {
      data[activeParamsAttr.value] = {
        fileIds: item[activeDataItemAttr.value]?.files.map((item: any) => item.id) ?? [],
        ngDepartmentIds:
          item[activeDataItemAttr.value]?.ngDepartments.map((item: any) => item.id) ?? [],

        ...item[activeDataItemAttr.value]
      }
      if (isMaintainCheck.value) {
        data[activeParamsAttr.value].maintenanceDepartmentIds =
          item[activeDataItemAttr.value]?.maintenanceDepartments?.map((item: any) => item.id) ?? []
      }
      if (isPatrolCheck.value) {
        data[activeParamsAttr.value].inspectionDepartmentIds =
          item[activeDataItemAttr.value]?.inspectionDepartments?.map((item: any) => item.id) ?? []
      }
    }
    return data
  })
}

/** 提交配置项 */
const onSubmitConfigItemClick = async () => {
  const valid = await addModalFormRef.value?.validateForm()

  if (!valid) return

  const list = nowDataToParams()
  const { inspectionId, ...otherParams }: any = addModalForm.value

  if (
    otherParams.standardType === InspectionStandardType.Number &&
    !isNumberStandardValid(
      otherParams.standardMax,
      otherParams.standardMin,
      !!otherParams.standardMaxInclusive,
      !!otherParams.standardMinInclusive
    )
  ) {
    return
  }

  let inspectionStandard = {
    standardType: otherParams.standardType,
    standardDesc: otherParams.standardDesc,
    standardMax: otherParams.standardMax,
    standardMaxInclusive: otherParams.standardMaxInclusive,
    standardMin: otherParams.standardMin,
    standardMinInclusive: otherParams.standardMinInclusive,
    unitId: otherParams.unitId
  }

  otherParams.inspectionStandard = modifyStandardData(inspectionStandard)

  if (isSpotCheck.value) {
    otherParams.inspectionTimeList = otherParams.inspectionTimeList?.map((item: any) => item.value)
    const noRepeatTimeList = new Set(otherParams.inspectionTimeList)
    if (otherParams.inspectionTimeList?.length !== noRepeatTimeList.size) {
      ElMessage.warning("时间点不能重复")
      return
    }
  } else {
    otherParams.inspectionTimeList = []
  }

  if (isMaintainCheck.value) {
    otherParams.maintenanceFrequency = otherParams.inspectionFrequency
    otherParams.maintenanceDepartmentIds = otherParams.inspectionDepartmentIds
    otherParams.maintenanceName = otherParams.inspectionName
    otherParams.maintenanceCode = otherParams.inspectionCode
  }

  otherParams.fileIds = otherParams.imageList.map((item: IUploadPhoto) => item.fileId)

  let attr = "spotConfigValue"
  if (isPatrolCheck.value) {
    attr = "patrolConfigValue"
  } else if (isMaintainCheck.value) {
    attr = "maintenanceConfigValue"
  }

  const newObj: any = {
    configType: activeTab.value,
    equipmentId: modelId,
    configName: otherParams.inspectionName
  }

  newObj[attr] = otherParams
  if (currentEditIndex.value > -1) {
    newObj.id = tableData.value[currentEditIndex.value].id
    list[currentEditIndex.value] = newObj
  }

  await requestUpdateEquipmentConfig({
    equipmentId: modelId,
    configType: activeTab.value,
    equipmentCommonConfigs: currentEditIndex.value > -1 ? [...list] : [...list, newObj]
  })

  ElMessage.success("操作成功")
  addModalShow.value = false

  getTableData()
}

/** 选择文件成功回调 */
const onSelectDocumentSuccess = async (data: IFileResourcePageItem[]) => {
  const selectedIds = data.map((item) => item.id)
  await requestUpdateEquipmentConfig({
    configType: activeTab.value,
    equipmentId: modelId,
    fileIds: [...new Set([...selectedIds, ...selectedDocumentIdList.value])]
  })
  ElMessage.success("新建成功")
  getTableData()
}

const setShow = () => {
  show.value = true
}

const setModelId = (id: string) => {
  modelId = id
}

defineExpose({
  setShow,
  setModelId
})
</script>

<style scoped lang="scss">
.deviceItemSetting {
  .block-title {
    font-size: 16px;
    color: #303133;
    margin: 16px 0 12px;
  }

  &:deep(.custom-drawer-content) {
    display: flex;
    flex-direction: column;

    .custom-table {
      flex: 1;
      overflow: hidden;
    }
  }
}
</style>
