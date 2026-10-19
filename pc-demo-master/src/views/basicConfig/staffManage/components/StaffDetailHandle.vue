<template>
  <CustomDialog
    v-model="visible"
    :title="isCreate ? '新建员工' : '员工信息'"
    size="medium"
    @close="onCloseDialog"
  >
    <CustomForm ref="customFormRef" v-model="form" :configs="formConfigs" :columns="2">
      <template #barcode-default>
        <el-input
          v-model="form.barcode"
          placeholder="请输入员工标签码"
          :disabled="isBindBarcode || form.autoGenerateCode"
        />
        <el-checkbox
          v-if="!isBindBarcode"
          v-model="form.autoGenerateCode"
          label="自动生成"
          style="margin-left: 10px"
          @change="onAutoGenerateCodeChange"
        />
      </template>
      <template #department-position-default>
        <el-cascader
          v-model="form.departmentPositionValue"
          :options="departmentPositionOptions"
          :props="departmentPositionCascaderProps"
          separator="-"
          placeholder="请选择部门职位"
          clearable
          filterable
          style="width: 100%"
          @change="syncDepartmentPosition"
        />
      </template>
      <template #license-suffix>
        <el-button link type="primary" size="small" @click="workLicenseRef?.setVisible(true, form.id)">
          详情
        </el-button>
      </template>
      <template #user-account-default>
        <el-tag>{{ form.bindUserId ? "已开通" : "未开通" }}</el-tag>
        <el-button
          v-if="form.bindUserId"
          link
          type="primary"
          @click="onReviewClick(form.bindUserId)"
        >
          前往查看
        </el-button>
        <el-button
          v-if="!form.bindUserId"
          link
          type="primary"
          class="ml-[12px]"
          @click="onOpenUserClick(form.id, form.empNo)"
        >
          开通
        </el-button>
        <el-button
          v-if="!form.bindUserId"
          link
          type="primary"
          @click="onBindExistUserClick(form.id)"
        >
          关联现有账号
        </el-button>
      </template>
    </CustomForm>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="resetForm()">取消</el-button>
        <el-button v-if="isAuth" type="primary" @click="submitForm()">保存</el-button>
      </span>
    </template>

    <WorkLicenseDetailDialog ref="workLicenseRef" />
    <UserDetailDialog ref="userDetailRef" />
    <UserRelateDialog ref="userRelatedRef" @onOk="onBindOk" />
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { queryDepartmentWorkItemPageList } from "@/api/departmentWorkItem"
import {
  queryBindExistUserAccount,
  queryEmployeeDetail,
  queryOpenEmployeeAccount,
  requestCreateEmployee,
  requestUpdateEmployee
} from "@/api/employee"
import { queryJobList } from "@/api/job"
import { queryUserInfoDetail } from "@/api/user"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import useButtonAuth from "@/hooks/useButtonAuth"
import useResetRef from "@/hooks/useResetRef"
import type { IJobListItem } from "@/types/base-info/employee"
import type { IUserInfoListItem } from "@/types/base-info/user"
import UserDetailDialog from "@/views/basicConfig/users/UserInfo.vue"

import UserRelateDialog from "./RelatedSearchUserHandle.vue"
import WorkLicenseDetailDialog from "./RelatedStuffHandle.vue"

interface IDepartmentPositionOption {
  label: string
  value: string
  children?: IDepartmentPositionOption[]
}

const isAuth = useButtonAuth("StaffInfo_update", "StaffInfo_query")
const userDetailRef = ref<InstanceType<typeof UserDetailDialog>>()
const workLicenseRef = ref<InstanceType<typeof WorkLicenseDetailDialog>>()
const userRelatedRef = ref<InstanceType<typeof UserRelateDialog>>()

const visible = ref(false)
const jobOptions = ref<IJobListItem[]>([])
const departmentPositionOptions = ref<IDepartmentPositionOption[]>([])
const moduleType = ref("")
const isCreate = computed(() => moduleType.value === "create")
const departmentPositionCascaderProps = {
  emitPath: true,
  checkStrictly: false
}

const emits = defineEmits<{
  (e: "onOk"): void
}>()

const [form, resetFormContent] = useResetRef({
  empNo: "",
  name: "",
  barcode: "",
  autoGenerateCode: false,
  status: "1",
  depId: "",
  departmentPositionValue: [] as string[],
  email: "",
  phone: "",
  positionList: [] as string[],
  jobList: [] as string[],
  licenseList: [] as string[],
  bindUserId: null as string | null,
  id: "1",
  password: "",
  remark: ""
})

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-input",
    label: "员工姓名",
    field: "name",
    rules: [{ required: true, message: "请输入员工姓名", trigger: "blur" }],
    props: {
      type: "text",
      placeholder: "请输入员工姓名",
      get disabled() {
        return !isCreate.value
      }
    }
  },
  {
    componentType: "el-input",
    label: "员工编号",
    field: "empNo",
    props: {
      type: "text",
      placeholder: "请输入员工编号，为空则自动生成",
      get disabled() {
        return !isCreate.value
      }
    }
  },
  {
    componentType: "div",
    label: "员工标签码",
    field: "barcode",
    props: {
      class: "barcode-content"
    },
    slots: {
      default: "barcode-default"
    }
  },
  {
    componentType: "el-select",
    label: "在职状态",
    field: "status",
    props: {
      placeholder: "请选择在职状态",
      customChildren: [
        {
          componentType: "el-option",
          props: {
            label: "在职",
            value: "1"
          }
        },
        {
          componentType: "el-option",
          props: {
            label: "离职",
            value: "0"
          }
        }
      ]
    }
  },
  {
    componentType: "div",
    label: "部门职位选择",
    field: "departmentPositionValue",
    rules: [{ required: true, message: "请选择部门职位", trigger: "change" }],
    props: {
      class: "department-position-content"
    },
    slots: {
      default: "department-position-default"
    }
  },
  {
    componentType: "el-input",
    label: "邮箱",
    field: "email",
    rules: [{ required: false, validator: checkEmail, trigger: "blur" }],
    props: {
      type: "text",
      placeholder: "请输入邮箱"
    }
  },
  {
    componentType: "el-input",
    label: "手机号码",
    field: "phone",
    rules: [{ required: false, validator: checkPhone, trigger: "blur" }],
    props: {
      type: "number",
      placeholder: "请输入手机号码"
    },
    events: {
      input: (value: string) => {
        onInputPhone(value)
      }
    }
  },
  {
    componentType: "el-select",
    label: "岗位",
    field: "jobList",
    props: {
      placeholder: "请选择岗位",
      multiple: true,
      collapseTags: true,
      collapseTagsTooltip: true,
      customChildren: jobOptions.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.jobName,
          value: item.id
        }
      }))
    }
  },
  {
    componentType: "el-input",
    label: "上岗证",
    field: "licenseList",
    get hidden() {
      return isCreate.value
    },
    props: {
      type: "text",
      placeholder: "请输入上岗证",
      clearable: false
    },
    slots: {
      suffix: "license-suffix"
    }
  },
  {
    componentType: "div",
    label: "用户账号",
    field: "bindUserId",
    get hidden() {
      return isCreate.value
    },
    props: {
      class: "user-account-content"
    },
    slots: {
      default: "user-account-default"
    }
  },
  {
    componentType: "el-input",
    colspan: 2,
    label: "备注",
    field: "remark",
    props: {
      type: "textarea",
      placeholder: "请输入备注",
      maxlength: 200,
      showWordLimit: true
    }
  }
])

const isBindBarcode = ref(false)
const jobListCopy = ref<string[]>([])

const parseDepartmentPositionValue = (value: string[] = []) => {
  const [depId = "", positionId = ""] = value
  return { depId, positionId }
}

const ensureCurrentDepartmentPositionOption = (params: {
  depId?: string
  depName?: string
  positionId?: string
  positionName?: string
}) => {
  const { depId = "", depName = "", positionId = "", positionName = "" } = params
  if (!depId || !positionId) return

  let departmentNode = departmentPositionOptions.value.find((item) => item.value === depId)
  if (!departmentNode) {
    departmentNode = {
      label: depName || depId,
      value: depId,
      children: []
    }
    departmentPositionOptions.value.unshift(departmentNode)
  }

  departmentNode.children ||= []
  if (!departmentNode.children.some((item) => item.value === positionId)) {
    departmentNode.children.unshift({
      label: positionName || positionId,
      value: positionId
    })
  }
}

const syncDepartmentPosition = (value: string[] = []) => {
  const { depId, positionId } = parseDepartmentPositionValue(value)
  form.value.depId = depId
  form.value.positionList = positionId ? [positionId] : []
}

const checkPhone = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback()
    return
  }

  const reg = /^1[3456789]\d{9}$/
  if (reg.test(value)) {
    callback()
    return
  }

  callback(new Error("请输入正确的手机号码"))
}

const checkEmail = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback()
    return
  }

  const regEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
  if (regEmail.test(value)) {
    callback()
    return
  }

  callback(new Error("请输入合法的邮箱"))
}

const onInputPhone = (value: string) => {
  form.value.phone = value?.slice(0, 11)
}

const onAutoGenerateCodeChange = (checked: boolean) => {
  if (checked) {
    form.value.barcode = ""
  }
}

const getJobOptions = async () => {
  jobOptions.value = await queryJobList()
}

const getDepartmentPositionOptions = async () => {
  const result = await queryDepartmentWorkItemPageList({
    pageNum: 1,
    pageSize: 999
  })

  departmentPositionOptions.value = result.records
    .filter((department) => (department.positionList || []).length)
    .map((department) => ({
      label: department.depName,
      value: department.id,
      children: (department.positionList || []).map((position) => ({
        label: position.name,
        value: position.id
      }))
    }))
}

const setVisible = async (value: boolean, columnData?: any) => {
  visible.value = value
  customFormRef.value?.resetForm()
  resetFormContent()
  moduleType.value = columnData ? "edit" : "create"

  await Promise.all([getJobOptions(), getDepartmentPositionOptions()])

  if (columnData) {
    const res: any = await queryEmployeeDetail({
      id: columnData.id
    })

    form.value = {
      ...form.value,
      ...res,
      status: `${res.status}`,
      positionList: (res.positionList || []).map((item: any) => item.id),
      jobList: (res.jobList || []).map((item: any) => item.id),
      licenseList: (res.licenseList || []).map((item: any) => item.licenseName),
      autoGenerateCode: false
    }

    const primaryPosition = res.positionList?.[0]
    if (primaryPosition?.id) {
      ensureCurrentDepartmentPositionOption({
        depId: res.depId,
        depName: res.depName,
        positionId: primaryPosition.id,
        positionName: primaryPosition.name
      })
      form.value.departmentPositionValue = [res.depId, primaryPosition.id]
      syncDepartmentPosition(form.value.departmentPositionValue)
    } else {
      form.value.departmentPositionValue = []
      form.value.positionList = []
    }

    isBindBarcode.value = !!res.barcode
    jobListCopy.value = [...form.value.jobList]
  } else {
    form.value.departmentPositionValue = []
    form.value.depId = ""
    form.value.positionList = []
    isBindBarcode.value = false
    jobListCopy.value = []
  }
}

const submitEmployee = async () => {
  const payload = {
    depId: form.value.depId,
    email: form.value.email,
    jobIdList: form.value.jobList,
    name: form.value.name,
    phone: form.value.phone,
    positionIdList: form.value.positionList.slice(0, 1),
    status: +form.value.status,
    remark: form.value.remark,
    barcode: !isBindBarcode.value ? form.value.barcode : undefined,
    autoGenerateCode: form.value.autoGenerateCode
  }

  if (isCreate.value) {
    await requestCreateEmployee({
      ...payload,
      empNo: form.value.empNo || undefined,
      barcode: form.value.barcode
    })
    ElMessage.success("新建员工成功")
  } else {
    await requestUpdateEmployee({
      id: form.value.id,
      ...payload
    })
    ElMessage.success("编辑员工成功")
  }

  visible.value = false
  emits("onOk")
}

const submitForm = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return

  syncDepartmentPosition(form.value.departmentPositionValue)

  const jobRemoveList = jobListCopy.value
    .filter((item) => !form.value.jobList.includes(item))
    .map((item) => jobOptions.value.find((job) => job.id === item))
    .filter(Boolean) as IJobListItem[]

  if (!jobRemoveList.length) {
    await submitEmployee()
    return
  }

  const jobRemoveListName = jobRemoveList.map((item) => item.jobName).join("、")
  const confirm = await ElMessageBox.confirm(
    `您取消了员工的岗位“${jobRemoveListName}”，该岗位关联的上岗证也将同时被撤销，请确认操作。`,
    "确认要修改吗？",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }
  )

  if (!confirm) {
    return
  }

  await submitEmployee()
}

const resetForm = () => {
  customFormRef.value?.resetForm()
  resetFormContent()
  moduleType.value = ""
  visible.value = false
}

const onReviewClick = async (userStatus: string) => {
  if (!userStatus) {
    return
  }

  const res = await queryUserInfoDetail({ userId: userStatus })
  const userInfo = {
    username: res.username,
    nickname: res.nickname,
    roleId: res.roleList.map((item) => item.roleCode),
    empNo: res.empNo,
    empName: res.empName,
    id: res.id
  }
  userDetailRef.value?.setVisible(true, userInfo as IUserInfoListItem)
}

const onOpenUserClick = async (id: string, empNo?: string) => {
  try {
    const { nickname, username, password } = await queryOpenEmployeeAccount({ empId: id })
    ElMessageBox({
      title: "提示",
      message: `开通成功！<br/>用户名：${nickname}<br/>账号为：${username}<br/>密码为：${password}`,
      dangerouslyUseHTMLString: true,
      confirmButtonText: "确认"
    })
    const res: any = await queryEmployeeDetail({
      id: form.value.id
    })
    form.value.bindUserId = res.bindUserId
    emits("onOk")
  } catch (error: any) {
    let userId = "1"
    if (error.message.includes("未关联其他员工")) {
      const { id: existedUserId } = await queryUserInfoDetail({ username: empNo })
      userId = existedUserId
      const confirm = await ElMessageBox.confirm(
        `系统已有该员工同编号的账号：${userId}，请关联其他现有账号。`,
        "提示",
        {
          confirmButtonText: "直接关联",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
      if (confirm) {
        await queryBindExistUserAccount({ empId: id, userId })
        ElMessageBox({
          title: "提示",
          message: "关联成功",
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确认"
        })
      }
    } else {
      ElMessageBox({
        title: "提示",
        message: `系统已有该员工同编号的账号：${id}，请关联其他现有账号。`,
        dangerouslyUseHTMLString: true,
        confirmButtonText: "确认"
      })
    }
  }
}

const onBindOk = (userId: string) => {
  form.value.bindUserId = userId
  emits("onOk")
}

const onBindExistUserClick = (empId: string) => {
  userRelatedRef.value?.setVisible(true, empId)
}

const onCloseDialog = () => {
  resetFormContent()
  moduleType.value = ""
}

defineExpose({
  setVisible
})
</script>

<style scoped lang="scss">
:deep(.barcode-content) {
  display: flex;
  align-items: center;
  width: 100%;

  .el-input {
    flex: 1;
  }
}

:deep(.department-position-content) {
  width: 100%;
}

:deep(.user-account-content) {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}
</style>
