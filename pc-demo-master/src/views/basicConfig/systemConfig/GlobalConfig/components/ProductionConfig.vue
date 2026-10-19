<!-- 生产运营配置 -->
<template>
  <div style="flex: 1; overflow-y: auto">
    <CustomForm
      v-model="productionForm"
      :configs="formConfigs"
      label-position="right"
      :label-width="260"
      :columns="2"
    >
      <template #autoCloseIntervalDays-append>
        <span>天</span>
      </template>
    </CustomForm>

    <!-- 生产上料授权角色 -->
    <el-form label-position="right" :label-width="260" :model="productionForm">
      <el-form-item label="生产上料授权角色：">
        <div class="role-select-wrap">
          <div class="selected-roles-input" @click="openRoleDialog">
            <div class="selected-tags" v-if="selectedRoles.length > 0">
              <el-tag
                v-for="role in selectedRoles"
                :key="role.id"
                closable
                @close="handleRemoveRole(role.id)"
                @click.stop
              >
                {{ role.name }}
              </el-tag>
            </div>
            <span v-else class="placeholder">请选择角色</span>
          </div>
        </div>
      </el-form-item>
    </el-form>
  </div>

  <!-- 角色选择弹窗 -->
  <SelectRoleDialog
    v-model:visible="roleDialogVisible"
    :selected-roles="selectedRoles"
    @confirm="handleRoleConfirm"
  />

  <div class="footer">
    <el-button v-if="!!buttonAuth" type="primary" @click="onSaveClick()">保存</el-button>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"
import { Plus } from "@element-plus/icons-vue"

import {
  queryProductionGlobalConfigDetail,
  requestUpdateProductionGlobalConfig
} from "@/api/globalConfig"
import { queryRoleList } from "@/api/role"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import useButtonAuth from "@/hooks/useButtonAuth"
import type { IGlobalConfigProductionParams } from "@/types/base-info/global-config"
import SelectRoleDialog from "@/components/SelectRoleDialog/index.vue"

defineOptions({
  name: "ProductionConfig"
})

const buttonAuth = useButtonAuth("GlobalConfig_update", "GlobalConfig_query")

// 角色列表选项
const roleOptions = ref<{ label: string; value: string }[]>([])

// 已选中的角色列表
const selectedRoles = ref<{ id: string; name: string }[]>([])

// 角色选择弹窗
const roleDialogVisible = ref(false)

// 角色选择确认
const handleRoleConfirm = (roles: { id: string; name: string }[]) => {
  // 直接替换为弹窗返回的角色列表
  selectedRoles.value = roles
  // 更新表单值
  productionForm.productionLoadAuthRoleIds = selectedRoles.value.map(r => r.id)
}

const productionForm = reactive<Partial<IGlobalConfigProductionParams>>({
  productionTaskAutoCloseIntervalDays: 7,
  productionLoadAuthRoleIds: []
})

const formConfigs = ref<ICustomFormConfigItem[]>([
  {
    componentType: "el-input",
    label: "生产任务自动结案间隔时间：",
    field: "productionTaskAutoCloseIntervalDays",
    colspan: 2,
    props: {
      type: "number",
      min: 0,
      placeholder: "请输入",
      clearable: true
    },
    slots: ["autoCloseIntervalDays-append"]
  }
])

onMounted(async () => {
  await getRoleOptions()
  getProductionInfo()
})

// 获取角色列表
const getRoleOptions = async () => {
  const roles = await queryRoleList()
  if (roles) {
    roleOptions.value = roles.map(role => ({
      label: role.name,
      value: role.id
    }))
  }
}

// 打开角色选择弹窗，传递已选择的角色
const openRoleDialog = () => {
  roleDialogVisible.value = true
}

// 移除已选角色
const handleRemoveRole = (roleId: string) => {
  selectedRoles.value = selectedRoles.value.filter(r => r.id !== roleId)
  productionForm.productionLoadAuthRoleIds = selectedRoles.value.map(r => r.id)
}

const getProductionInfo = async () => {
  const data = await queryProductionGlobalConfigDetail()
  if (data) {
    productionForm.productionTaskAutoCloseIntervalDays =
      data.productionTaskAutoCloseIntervalDays ?? productionForm.productionTaskAutoCloseIntervalDays
    productionForm.productionLoadAuthRoleIds = data.productionLoadAuthRoleIds || []

    // 根据已选ID获取角色名称
    const roleIds = productionForm.productionLoadAuthRoleIds || []
    if (roleIds.length > 0 && roleOptions.value.length > 0) {
      selectedRoles.value = roleOptions.value
        .filter(r => roleIds.includes(r.value))
        .map(r => ({ id: r.value, name: r.label }))
    } else {
      selectedRoles.value = []
    }
  }
}

const saveProductionInfo = async () => {
  await requestUpdateProductionGlobalConfig({
    productionTaskAutoCloseIntervalDays: Number(
      productionForm.productionTaskAutoCloseIntervalDays || 0
    ),
    productionLoadAuthRoleIds: productionForm.productionLoadAuthRoleIds || []
  })
  ElMessage.success("保存成功")
}

const onSaveClick = async () => {
  saveProductionInfo()
}
</script>

<style lang="scss" scoped>
.footer {
  display: flex;
  justify-content: flex-end;
  margin: 10px;
}

.role-select-wrap {
  display: flex;
  align-items: center;
  gap: 12px;

  .selected-roles-input {
    display: flex;
    align-items: center;
    min-height: 32px;
    padding: 4px 8px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    flex: 1;
    cursor: pointer;

    &:hover {
      border-color: #409eff;
    }

    .selected-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;

      .el-tag {
        margin: 2px;
      }
    }

    .placeholder {
      color: #909399;
      font-size: 14px;
      line-height: 24px;
    }
  }
}
</style>
