<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content">
      <CustomTitle title="基础信息" :is-table-title="false" show-short-bar>
        <div>
          <el-button @click="oncancel()">取消</el-button>
          <el-button type="primary" @click="onSubmit()">保存</el-button>
        </div>
      </CustomTitle>
      <CustomForm ref="customFormRef" v-model="formData" :configs="formConfigs">
        <template #bizTypeName-default>
          <el-dropdown
            :teleported="false"
            placement="bottom"
            trigger="click"
            class="bizType-dropdown"
            :class="bizTypeNameListByEnabledOptions.length ? '' : 'empty-bizType-dropdown'"
          >
            <el-select
              placeholder="请选择业务类型"
              v-model="formData.bizTypeName"
              popper-class="bizType-select-dropdown"
            >
              <el-option :label="formData.bizTypeName" :value="formData.bizTypeName" />
            </el-select>
            <template #dropdown>
              <el-dropdown-menu class="bizType-dropdown-menu">
                <template v-for="item in bizTypeNameListByEnabledOptions" :key="item.value">
                  <el-dropdown-item
                    :class="{ 'bizType-dropdown-menu-active': item.value === formData.bizTypeName }"
                    @click="onBizTypeClick(item)"
                    >{{ item.label }}</el-dropdown-item
                  >
                </template>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </CustomForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  queryPackageProcessDetail,
  requestCreatePackageProcess,
  requestUpdatePackageProcess
} from "@/api/baseInfo/package-manage/packageProcess"
import { queryAllCraftList } from "@/api/craft"
import { queryImplementConfigBaseDetail } from "@/api/implementConfig"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import { EnumCraftBizType, EnumProductionType, EnumProductionTypeMap } from "@/constant/enums"
import type { IOption } from "@/types/common"

const props = withDefaults(
  defineProps<{
    id?: string
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "close", isUpdate: boolean): void
  (e: "success", id: string): void
}>()

const techOptions = ref<IOption[]>([])
const bizTypeNameListByEnabledOptions = ref<{ label: string; value: string }[]>([])
const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formData = reactive({
  name: "",
  techId: "",
  bizTypeName: "",
  nature: EnumProductionType.CUSTOM,
  remark: "",
  techVersionId: ""
})
const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-input",
    field: "name",
    label: "工序名称",
    props: {
      placeholder: "请输入"
    },
    rules: [
      {
        required: true,
        message: "工序名称不能为空",
        trigger: "blur"
      }
    ]
  },
  {
    componentType: "el-select-v2",
    field: "techId",
    label: "工艺名称",
    rules: [
      {
        required: true,
        message: "工序名称不能为空",
        trigger: "change"
      }
    ],
    props: {
      filterable: true,
      options: techOptions.value
    }
  },
  {
    componentType: "div",
    field: "bizTypeName",
    label: "业务类型",
    props: {
      class: "w-[100%]"
    },
    slots: {
      default: "bizTypeName-default"
    },
    rules: [
      {
        required: true,
        message: "业务类型不能为空",
        trigger: "change"
      }
    ]
  },
  {
    componentType: "el-select",
    field: "nature",
    label: "性质",
    props: {
      disabled: true,
      customChildren: Object.entries(EnumProductionTypeMap).map(([key, value]) => ({
        componentType: "el-option",
        props: {
          label: value,
          value: +key
        }
      }))
    }
  },
  {
    componentType: "el-input",
    field: "remark",
    label: "备注",
    props: {
      placeholder: "请输入备注",
      type: "textarea",
      maxlength: 200,
      showWordLimit: true
    },
    colspan: -1
  }
])

onMounted(async () => {
  getTechList()
  await getBaseConfig()
  if (props.id) {
    getPackageProcessDetail(props.id)
  } else {
    formData.bizTypeName = bizTypeNameListByEnabledOptions.value?.length
      ? bizTypeNameListByEnabledOptions.value[0].value
      : ""
  }
})

const getBaseConfig = async () => {
  const data = await queryImplementConfigBaseDetail()
  bizTypeNameListByEnabledOptions.value =
    data.versionTemplateList
      ?.filter((item) => item.status === "enable" && item.bizType === EnumCraftBizType.PACK)
      .map((item) => ({
        label: item.bizTypeName,
        value: item.bizTypeName
      })) || []
}

const onBizTypeClick = (item: { value: string; label: string }) => {
  if (formData.bizTypeName !== item.value) {
    formData.bizTypeName = item.value
  }
}

// 获取工艺下拉列表
const getTechList = async () => {
  const res = await queryAllCraftList({})
  techOptions.value = res.map((item) => ({
    value: item.id,
    label: item.name
  }))
}

/** 取消操作 */
const oncancel = async () => {
  await ElMessageBox.confirm("填写的数据将不会被保存,是否继续？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
  emit("close", !!props.id)
}

/** 获取包装工序详情 */
const getPackageProcessDetail = async (id: string) => {
  const data = await queryPackageProcessDetail(id)
  for (let key in formData) {
    ;(formData as any)[key] = (data as any)[key]
  }
}

/** 保存操作 */
const onSubmit = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) {
    return
  }

  let resId = props.id || ""
  if (props.id) {
    await requestUpdatePackageProcess({ ...formData, id: props.id })
  } else {
    const res = await requestCreatePackageProcess({ ...formData })
    resId = res.id
  }
  ElMessage.success(props.id ? "编辑成功" : "新建成功")
  emit("success", resId)
}
</script>

<style lang="scss">
.bizType-select-dropdown {
  display: none;
}
.bizType-dropdown-menu {
  width: 100%;

  &:hover {
    background-color: #fff !important;

    .bizType-dropdown-menu-active {
      background-color: #fff !important;

      &:hover {
        background-color: rgb(235.9, 245.3, 255) !important;
      }
    }
  }
  .el-dropdown-menu__item {
    padding: 5px 20px;

    &.bizType-dropdown-menu-active {
      background-color: rgb(235.9, 245.3, 255);
      color: #409eff !important;

      &:hover {
        color: #409eff !important;
      }
    }
    &:hover {
      background-color: rgb(235.9, 245.3, 255) !important;
      color: #606266;
    }
  }
  .el-dropdown-menu__item:not(.is-disabled):focus,
  .el-dropdown-menu__item:not(.is-disabled):hover {
    background-color: #fff;
    color: #606266;
  }
}
</style>
<style lang="scss" scoped>
.layout-child-page-content {
  flex: 1;
  overflow-y: auto;

  .bizType-dropdown {
    width: 100%;

    &.is-disabled {
      cursor: unset;
    }
    :deep(.el-popper) {
      width: 100%;
    }
    &.empty-bizType-dropdown {
      :deep(.el-popper) {
        display: none;
      }
    }
  }
}
</style>
