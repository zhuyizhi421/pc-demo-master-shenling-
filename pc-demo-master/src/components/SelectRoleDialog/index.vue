<template>
  <!-- 主弹窗 -->
  <el-dialog
    v-model="dialogVisible"
    title="选择角色"
    width="700px"
  >
    <div class="dialog-content">
      <!-- 已选角色列表 -->
      <div class="selected-section">
        <div class="section-header">
          <div class="section-title">已选角色 ({{ selectedRoles.length }})</div>
          <el-button type="primary" size="small" @click="openAddDialog">
            + 添加角色
          </el-button>
        </div>
        <div class="selected-list" v-if="selectedRoles.length > 0">
          <div class="selected-table-header">
            <span class="col-index">序号</span>
            <span class="col-name">角色名称</span>
            <span class="col-action">操作</span>
          </div>
          <div
            v-for="(role, index) in selectedRoles"
            :key="role.id"
            class="selected-item"
          >
            <span class="col-index">{{ index + 1 }}</span>
            <span class="col-name">{{ role.name }}</span>
            <el-button type="danger" link @click="handleRemoveRole(index)">
              删除
            </el-button>
          </div>
        </div>
        <div v-else class="empty-tip">暂无已选角色</div>
      </div>
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>

  <!-- 添加角色弹窗 -->
  <el-dialog
    v-model="addDialogVisible"
    title="添加角色"
    width="600px"
  >
    <div class="add-dialog-content">
      <div class="search-area">
        <el-input
          v-model="searchKeyword"
          placeholder="请输入角色名称或编码搜索"
          clearable
          style="width: 250px;"
        />
      </div>
      <el-table
        :data="filteredRoles"
        height="300"
        @selection-change="handleTableSelectionChange"
        ref="tableRef"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="name" label="角色名称" />
        <el-table-column prop="code" label="角色编码" />
        <el-table-column prop="remark" label="备注" />
      </el-table>
    </div>

    <template #footer>
      <el-button @click="addDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleAddConfirm">添加</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessageBox } from "element-plus"

interface RoleItem {
  id: string
  name: string
  code: string
  remark: string
}

const props = defineProps<{
  visible: boolean
  selectedRoles?: RoleItem[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'confirm', val: RoleItem[]): void
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 模拟数据
const mockRoles: RoleItem[] = [
  { id: '1', name: '管理员', code: 'admin', remark: '系统管理员' },
  { id: '2', name: '生产主管', code: 'production_manager', remark: '生产管理部门' },
  { id: '3', name: '车间主任', code: 'workshop_director', remark: '车间管理角色' },
  { id: '4', name: '质检员', code: 'quality_inspector', remark: '质量检验角色' },
  { id: '5', name: '仓库管理员', code: 'warehouse_keeper', remark: '仓库管理角色' },
  { id: '6', name: '设备维护员', code: 'equipment_maintainer', remark: '设备维护角色' },
  { id: '7', name: '生产员工', code: 'production_worker', remark: '生产线员工' },
  { id: '8', name: '技术员', code: 'technician', remark: '技术支持角色' },
  { id: '9', name: '采购员', code: 'purchaser', remark: '采购管理角色' },
  { id: '10', name: '财务', code: 'finance', remark: '财务管理角色' }
]

// 当前已选角色
const selectedRoles = ref<RoleItem[]>([])

// 添加弹窗相关
const addDialogVisible = ref(false)
const searchKeyword = ref('')
const tableSelectedRows = ref<RoleItem[]>([])
const tableRef = ref()

// 过滤后的角色列表
const filteredRoles = computed(() => {
  const selectedIds = selectedRoles.value.map(r => r.id)
  const availableRoles = mockRoles.filter(r => !selectedIds.includes(r.id))

  if (!searchKeyword.value) {
    return availableRoles
  }

  const keyword = searchKeyword.value.toLowerCase()
  return availableRoles.filter(r =>
    r.name.toLowerCase().includes(keyword) ||
    r.code.toLowerCase().includes(keyword)
  )
})

// 打开添加弹窗
const openAddDialog = () => {
  searchKeyword.value = ''
  tableSelectedRows.value = []
  if (tableRef.value) {
    tableRef.value.clearSelection()
  }
  addDialogVisible.value = true
}

// 表格选择变化
const handleTableSelectionChange = (selection: RoleItem[]) => {
  tableSelectedRows.value = selection
}

// 添加弹窗确认
const handleAddConfirm = () => {
  for (const role of tableSelectedRows.value) {
    if (!selectedRoles.value.find(r => r.id === role.id)) {
      selectedRoles.value.push({ ...role })
    }
  }
  addDialogVisible.value = false
}

// 删除角色
const handleRemoveRole = async (index: number) => {
  const roleName = selectedRoles.value[index].name
  try {
    await ElMessageBox.confirm(
      `确定要删除角色"${roleName}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    selectedRoles.value.splice(index, 1)
  } catch {
    // 用户取消删除
  }
}

// 监听主弹窗打开
watch(() => props.visible, (val) => {
  if (val) {
    selectedRoles.value = [...(props.selectedRoles || [])]
  }
})

// 确定
const handleConfirm = () => {
  emit('confirm', [...selectedRoles.value])
  dialogVisible.value = false
}
</script>

<style scoped lang="scss">
.dialog-content {
  max-height: 400px;
  overflow-y: auto;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.selected-section {
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.selected-list {
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
}

.selected-table-header {
  display: flex;
  padding: 10px 12px;
  background: #f5f7fa;
  font-weight: 600;
  font-size: 14px;
  color: #606266;
  border-bottom: 1px solid #ebeef5;

  .col-index {
    width: 60px;
    color: #606266;
  }

  .col-name {
    flex: 1;
    color: #606266;
  }

  .col-action {
    width: 60px;
    text-align: right;
  }
}

.selected-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid #ebeef5;
  font-size: 14px;

  &:last-child {
    border-bottom: none;
  }

  .col-index {
    width: 60px;
    color: #909399;
  }

  .col-name {
    flex: 1;
    color: #303133;
  }

  .col-action {
    width: 60px;
    text-align: right;
  }
}

.empty-tip {
  color: #909399;
  font-size: 14px;
  text-align: center;
  padding: 20px;
}

.add-dialog-content {
  .search-area {
    margin-bottom: 15px;
  }
}
</style>
