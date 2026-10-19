<template>
  <CustomDialog v-model="visible" title="新建报废" @close="onClose">
    <CustomForm v-model="formInline" :configs="formConfigs" ref="customFormRef"></CustomForm>

    <template #footer>
      <el-button @click="onReset()">取消</el-button>
      <el-button type="primary" @click="onSubmitClick()"> 保存 </el-button>
    </template>

    <SelectMroDialog
      v-model="selectMroVisible"
      :selected-row-keys="[formInline.mroInformationId]"
      identity-manage
      @success="onSelectMroSuccess"
    />

    <!-- 选择人员组件 -->
    <SelectPersonDialog
      v-model="selectPersonVisible"
      :type="EnumSelectUser.Staff"
      :selected-ids="formInline.reportUserIds"
      @success="onSelectPersonSuccess"
    />
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { requestCreateMroScrapApply } from "@/api/operation/mro/mro-scrap-apply"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import SelectMroDialog from "@/components/SelectMroDialog/index.vue"
import SelectPersonDialog from "@/components/SelectPersonDialog/index.vue"
import type { ITree } from "@/components/SelectPersonDialog/type"
import UploadImage from "@/components/UploadImage/index.vue"
import { EnumSelectUser } from "@/constant/enums"
import useResetRef from "@/hooks/useResetRef"
// import useUserStore from "@/store/modules/user"
import type { IOption } from "@/types/common"
import type { IMroInfoPageListItem } from "@/types/maintain/mro-manage/mro-info"

const emits = defineEmits<{
  (e: "success"): void
}>()

// const userStore = useUserStore()

const [formInline, resetFormInline] = useResetRef<any>({
  mroNo: "",
  mroModelNo: "",
  mroName: "",
  mroInformationId: "",
  lifeSpan: "",
  reportUserIds: [],
  repairReason: "",
  report: [] as { name: ""; empNo: "" }[],
  depName: "",
  imgData: new FormData(),
  imageList: [],
  fileIds: [],
  scrapReason: "",
  scrapProcessName: ""
})

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-input",
    label: "流程名称",
    field: "scrapProcessName",
    props: {
      maxlength: 50,
      disabled: true
    }
  },
  {
    componentType: "el-select",
    label: "发起人",
    field: "reportUserIds",
    props: {
      placeholder: "请选择",
      clearable: true,
      multiple: true,
      collapseTags: true,
      collapseTagsTooltip: true,
      get customChildren() {
        return selectedPersonList.value.map((item) => ({
          componentType: "el-option",
          props: {
            label: item.label,
            value: item.value
          }
        }))
      }
    },
    events: {
      change: ($event: string[]) => onSelectPersonChange($event),
      visibleChange: ($event: boolean) => onSelectPersonVisibleChange($event)
    },
    rules: [
      {
        required: true,
        message: "请选择",
        trigger: "change"
      }
    ]
  },
  {
    componentType: "el-input",
    label: "所属部门",
    field: "depName",
    props: {
      placeholder: "请输入",
      disabled: true
    }
  },
  {
    componentType: "el-select",
    label: "MRO序列号",
    field: "mroNo",
    props: {
      placeholder: "请选择",
      clearable: true,
      multiple: false,
      collapseTags: true,
      collapseTagsTooltip: true,
      get customChildren() {
        return selectedMroList.value.map((item) => ({
          componentType: "el-option",
          props: {
            label: item.label,
            value: item.value
          }
        }))
      }
    },
    events: {
      visibleChange: ($event: boolean) => onSelectMroVisibleChange($event)
    },
    rules: [
      {
        required: true,
        message: "请选择",
        trigger: "change"
      }
    ]
  },
  {
    componentType: "el-input",
    label: "MRO编号",
    field: "mroModelNo",
    props: {
      placeholder: "请输入",
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "MRO名称",
    field: "mroName",
    props: {
      placeholder: "请输入",
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "寿命",
    field: "lifeSpan",
    props: {
      placeholder: "请输入",
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "报废原因",
    field: "scrapReason",
    props: {
      placeholder: "请输入"
    },
    rules: [
      {
        required: true,
        message: "请填写",
        trigger: "blur"
      }
    ]
  },
  {
    componentType: markRaw(UploadImage),
    label: "报废附件",
    field: "imageList",
    props: {
      limit: 3
    }
  }
])
const visible = ref(false)

const selectMroVisible = ref(false)
const selectedMroList = ref<IOption[]>([])

const selectPersonVisible = ref(false)
const selectedPersonList = ref<IOption[]>([])

const setVisible = (value: boolean) => {
  customFormRef.value?.resetForm()
  // if (value) {
  //   const userInfo = userStore.userInfo as {
  //     empName: string
  //     empId: string
  //   }
  //   formInline.value.reportUserIds = [userInfo!.empId]
  //   selectedPersonList.value = [
  //     {
  //       label: userInfo!.empName,
  //       value: userInfo!.empId
  //     }
  //   ]
  // }
  visible.value = value
}

/** MRO编号选择改变 */
const onSelectMroVisibleChange = (visible: boolean) => {
  if (visible) {
    selectMroVisible.value = true
  }
}

/** MRO型号选择改变 */
const onSelectMroSuccess = (data: IMroInfoPageListItem[]) => {
  if (!data.length) {
    return
  }

  const {
    mroNo,
    id,
    entityName,
    lifeSpan,
    mroModelVo: { mroModelName, mroModelNo, mroScrapProcessName }
  } = data[0]
  selectedMroList.value = data.map((item) => ({
    label: item.mroNo,
    value: item.mroNo
  }))
  formInline.value.mroNo = mroNo
  formInline.value.mroModelNo = mroModelNo
  formInline.value.mroName = entityName || mroModelName
  formInline.value.mroInformationId = id
  formInline.value.lifeSpan = lifeSpan
  formInline.value.scrapProcessName = mroScrapProcessName
}

/** 提交操作 */
const onSubmitClick = async () => {
  try {
    const valid = await customFormRef.value?.validateForm()
    if (!valid) return

    const { imageList, ...otherParams } = formInline.value
    otherParams.fileIds = imageList?.map((item: any) => item.fileId)

    await requestCreateMroScrapApply({
      fileIds: otherParams.fileIds,
      reportUserIds: otherParams.reportUserIds,
      mroInformationId: otherParams.mroInformationId,
      scrapReason: otherParams.scrapReason
    })
    ElMessage.success("新建成功")
    visible.value = false
    emits("success")
  } catch (error) {
    console.error(error)
  }
}

/** 选择处理对象下拉框visible-change回调 */
const onSelectPersonVisibleChange = (visible: boolean) => {
  if (visible) {
    selectPersonVisible.value = true
  }
}

/** 选择处理对象下拉框change回调 */
const onSelectPersonChange = (value: string[]) => {
  if (!value || !value.length) {
    formInline.value.depName = ""
  }
}

/** 选择处理对象成功回调 */
const onSelectPersonSuccess = (data: ITree[]) => {
  selectedPersonList.value = data.map((item) => ({
    label: item.label,
    value: item.id
  }))
  formInline.value.reportUserIds = data.map((item) => item.id)
  console.log(formInline.value.reportUserIds)
  formInline.value.depName = data[0].depName
}

const onReset = () => {
  visible.value = false
  resetFormInline()
}

const onClose = () => {
  resetFormInline()
}

defineExpose({
  setVisible
})
</script>

<style>
.el-form-item {
  width: 100%;
}
.el-form-item__content {
  flex: 1;
}
</style>
