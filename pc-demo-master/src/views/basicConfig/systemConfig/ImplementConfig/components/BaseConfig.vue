<!-- 质量运营配置 -->
<template>
  <div class="base-config-container">
    <CustomForm
      ref="customFormRef"
      v-model="formData"
      :configs="formConfigs"
      :label-width="125"
    ></CustomForm>

    <CustomTitle title="工序业务类型" style="margin-top: 0">
      <el-button type="primary" icon="Plus" @click="onAddClick" :disabled="!buttonAuth"
        >新增业务类型</el-button
      >
    </CustomTitle>
    <CustomTable
      ref="customTableRef"
      v-model:table-data="customTableData"
      :config="tableConfig"
      class="custom-table"
    >
      <template #bizTypeName-default="{ row }">
        <el-input
          v-model="row.bizTypeName"
          placeholder="请输入"
          maxlength="10"
          @input="onBizTypeNameInput(row)"
          :disabled="!buttonAuth"
        />
      </template>

      <template #bizType-default="{ row }">
        <el-select
          placeholder="请选择业务类型"
          v-model="row.bizType"
          :disabled="!buttonAuth"
          @change="onBizTypeChange(row)"
        >
          <el-option
            v-for="(value, key) in EnumCraftBizTypeMap"
            :key="key"
            :label="value"
            :value="+key"
          />
        </el-select>
      </template>

      <template #nature-default="{ row }">
        <el-select
          placeholder="请选择生产方式"
          v-model="row.nature"
          :disabled="row.bizType === EnumCraftBizType.PACK || !buttonAuth"
          @change="onNatureChange(row)"
        >
          <el-option
            v-for="(value, key) in EnumProductionTypeMap"
            :key="key"
            :label="value"
            :value="+key"
          />
        </el-select>
      </template>

      <template #productionSchedulingType-default="{ row }">
        <el-select
          v-model="row.productionSchedulingType"
          :disabled="!buttonAuth || row.nature === EnumProductionType.OUTSOURCING"
          @change="onProductionSchedulingTypeChange(row)"
        >
          <el-option label="是" :value="1" />
          <el-option label="否" :value="0" />
        </el-select>
      </template>

      <template #codeRelate-default="{ row }">
        <el-select
          v-if="row.productionSchedulingType !== 0 && row.bizType !== EnumCraftBizType.PACK"
          v-model="row.codeRelate"
          :disabled="!buttonAuth"
          @change="onCodeRelateChange(row)"
        >
          <el-option label="是" :value="1" />
          <el-option label="否" :value="0" />
        </el-select>
      </template>

      <template #defaultCodeRelationType-default="{ row }">
        <el-select
          v-if="
            row.productionSchedulingType !== 0 &&
            row.bizType !== EnumCraftBizType.PACK &&
            row.codeRelate === 1
          "
          v-model="row.defaultCodeRelationType"
          :disabled="!buttonAuth"
        >
          <el-option
            v-for="(value, key) in EnumBarcodeDefaultRelevanceModeMap"
            :key="key"
            :label="value"
            :value="+key"
          />
        </el-select>
      </template>

      <template #vehicleRelate-default="{ row }">
        <el-select
          v-if="row.productionSchedulingType !== 0 && row.bizType !== EnumCraftBizType.PACK"
          v-model="row.vehicleRelate"
          :disabled="!buttonAuth"
        >
          <el-option label="是" :value="1" />
          <el-option label="否" :value="0" />
          <el-option label="不限" :value="2" />
        </el-select>
      </template>

      <template #status-default="{ row }">
        <el-select v-model="row.status" :disabled="!buttonAuth">
          <el-option label="启用" value="enable" />
          <el-option label="停用" value="disable" />
        </el-select>
      </template>

      <template #operation-default="{ $index }">
        <el-button
          :disabled="!buttonAuth"
          style="margin-left: 6px"
          type="danger"
          size="small"
          link
          @click="onDeleteClick($index)"
          >删除</el-button
        >
      </template>
    </CustomTable>
  </div>
  <div class="footer">
    <el-button v-if="!!buttonAuth" type="primary" @click="saveBaseConfig()">保存</el-button>
  </div>
</template>
<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  queryImplementConfigBaseDetail,
  requestUpdateImplementConfigBase
} from "@/api/implementConfig"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import {
  EnumBarcodeDefaultRelevanceMode,
  EnumBarcodeDefaultRelevanceModeMap,
  EnumCraftBizType,
  EnumCraftBizTypeMap,
  EnumProductionType,
  EnumProductionTypeMap
} from "@/constant/enums"
import useButtonAuth from "@/hooks/useButtonAuth"
import type { IVersionTemplateItem as ITableRow } from "@/types/base-info/implement-config"
import { validURL } from "@/utils/validate"

defineOptions({
  name: "BaseConfig"
})

const buttonAuth = useButtonAuth("ImplementConfig_update", "ImplementConfig_query")

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formData = ref<{
  supplierAddress: string
}>({
  supplierAddress: ""
})

const formConfigs = ref<ICustomFormConfigItem[]>([
  {
    componentType: "el-input",
    field: "supplierAddress",
    label: "供应商平台地址：",
    props: {
      placeholder: "请输入",
      maxlength: 200,
      get disabled() {
        return !buttonAuth.value
      }
    },
    rules: [
      {
        required: false,
        validator: (rule, value, callback) => {
          if (value && !validURL(value)) {
            return callback(new Error("请输入正确的网址格式"))
          }
          callback()
        },
        trigger: "blur"
      }
    ]
  }
])

const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "bizTypeName",
      label: "业务类型名称",
      minWidth: 160,
      align: "center",
      slots: {
        default: "bizTypeName-default"
      }
    },
    {
      prop: "bizType",
      label: "业务属性",
      width: 100,
      align: "center",
      slots: {
        default: "bizType-default"
      }
    },
    {
      prop: "nature",
      label: "性质",
      minWidth: 100,
      align: "center",
      slots: {
        default: "nature-default"
      }
    },
    {
      prop: "productionSchedulingType",
      label: "要求排产",
      minWidth: 90,
      align: "center",
      slots: {
        default: "productionSchedulingType-default"
      }
    },
    {
      prop: "codeRelate",
      label: "关联条码",
      minWidth: 90,
      align: "center",
      slots: {
        default: "codeRelate-default"
      }
    },
    {
      prop: "defaultCodeRelationType",
      label: "关联条码方式",
      minWidth: 140,
      align: "center",
      slots: {
        default: "defaultCodeRelationType-default"
      }
    },
    {
      prop: "vehicleRelate",
      label: "关联载具",
      minWidth: 90,
      align: "center",
      slots: {
        default: "vehicleRelate-default"
      }
    },
    {
      prop: "status",
      label: "启用/停用",
      minWidth: 90,
      align: "center",
      slots: {
        default: "status-default"
      }
    },
    {
      prop: "operation",
      label: "操作",
      width: 90,
      align: "center",
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

onMounted(() => {
  getBaseConfig()
})

const onBizTypeNameInput = (row: ITableRow) => {
  if (row.bizTypeName) {
    row.bizTypeName = row.bizTypeName.replace(/\s+/g, "")
  }
}

const onAddClick = () => {
  customTableData.value.push({
    bizTypeName: "",
    bizType: EnumCraftBizType.PROCESS,
    nature: EnumProductionType.CUSTOM,
    productionSchedulingType: 1,
    codeRelate: 1,
    defaultCodeRelationType: EnumBarcodeDefaultRelevanceMode.NEW,
    vehicleRelate: 1,
    status: "enable"
  })
}

const onDeleteClick = async (index: number) => {
  try {
    await ElMessageBox.confirm("确认删除该行数据?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      closeOnClickModal: false,
      closeOnPressEscape: false,
      autofocus: false,
      type: "warning"
    })
    customTableData.value.splice(index, 1)
  } catch (error) {
    console.error(error)
  }
}

/** 业务类型选择事件 */
const onBizTypeChange = (row: ITableRow) => {
  if (row.bizType === EnumCraftBizType.PACK) {
    // 包装业务类型，性质改为自制，条码相关改为默认
    row.nature = EnumProductionType.CUSTOM
    row.codeRelate = 1
    row.defaultCodeRelationType = EnumBarcodeDefaultRelevanceMode.NEW
    row.vehicleRelate = 1
  }
}

/** 生产方式（性质）选择事件 */
const onNatureChange = (row: ITableRow) => {
  if (row.nature === EnumProductionType.OUTSOURCING) {
    // 性质是委外，要求排产改为否，条码相关改为默认
    row.productionSchedulingType = 0
    row.codeRelate = 1
    row.defaultCodeRelationType = EnumBarcodeDefaultRelevanceMode.NEW
    row.vehicleRelate = 1
  }
}

/** 要求排产选择事件 */
const onProductionSchedulingTypeChange = (row: ITableRow) => {
  if (row.productionSchedulingType === 0) {
    // 不排产，条码相关改为默认
    row.codeRelate = 1
    row.defaultCodeRelationType = EnumBarcodeDefaultRelevanceMode.NEW
    row.vehicleRelate = 1
  }
}

/** 关联条码选择事件 */
const onCodeRelateChange = (row: ITableRow) => {
  if (row.codeRelate === 0) {
    // 不关联条码，关联条码方式改为默认
    row.defaultCodeRelationType = EnumBarcodeDefaultRelevanceMode.NEW
  }
}

/** 获取基础配置 */
const getBaseConfig = async () => {
  const data = await queryImplementConfigBaseDetail()
  formData.value.supplierAddress = data.supplierPlatformAddress
  customTableData.value = data.versionTemplateList || []
}

/** 保存基础配置 */
const saveBaseConfig = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) {
    return
  }

  let hasNoName = customTableData.value.some((item) => !item.bizTypeName)
  if (hasNoName) {
    ElMessage.error("请输入业务类型名称")
    return
  }

  const params = {
    supplierPlatformAddress: formData.value.supplierAddress,
    versionTemplateList: customTableData.value
  }
  await requestUpdateImplementConfigBase(params)
  ElMessage.success("保存成功")
}
</script>

<style lang="scss" scoped>
.base-config-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  padding-bottom: 16px;
}
.custom-table {
  flex: 1;
  overflow: hidden;
}
.footer {
  display: flex;
  justify-content: flex-end;
  margin: 10px;
}
</style>
