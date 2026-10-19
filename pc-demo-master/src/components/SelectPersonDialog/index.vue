<!-- 选员工、部门、职位组件 -->
<template>
  <CustomDialog v-model="visible" :title="`选择${props.type}`" size="medium">
    <div class="content">
      <div class="left">
        <div class="search-row">
          <el-input
            v-model="searchValue"
            :placeholder="`请输入${props.type}名称`"
            prefix-icon="Search"
            maxlength="20"
            clearable
          />
          <el-button type="primary" @click="getTreeData()">查询</el-button>
        </div>
        <el-tree-v2
          ref="treeRef"
          :data="treeData"
          :props="treeProps"
          :show-checkbox="props.multiple"
          :check-strictly="strictly"
          :check-on-click-leaf="false"
          :height="500"
          :item-size="36"
          @check-change="onCheckChange"
        >
          <template #default="{ node: { data, isLeaf } }">
            <div class="custom-tree-node">
              <el-icon v-if="data.nodeType === EnumNodeType.Root"><Folder /></el-icon>
              <el-icon v-else-if="data.nodeType === EnumNodeType.Department"
                ><OfficeBuilding
              /></el-icon>
              <el-icon v-else-if="data.nodeType === EnumNodeType.Staff"><User /></el-icon>
              <el-icon v-else-if="data.nodeType === EnumNodeType.Post"><Suitcase /></el-icon>
              <span>{{ data.label }}</span>
              <el-radio
                v-if="
                  !props.multiple &&
                  data.nodeType !== EnumNodeType.Root &&
                  (strictly || (!strictly && isLeaf))
                "
                class="radio"
                :model-value="selectedMap.has(data.id)"
                :value="true"
                @change="onRadioChange(data)"
                @click.stop
                size="large"
              ></el-radio>
            </div>
          </template>
        </el-tree-v2>
      </div>
      <div class="right">
        <div class="right-title">已选{{ props.type }}：{{ selectedMap.size }}</div>
        <div class="right-list">
          <el-tag
            v-for="[key, value] of selectedMap"
            :key="key"
            closable
            @close="onRemoveTag(value.id)"
            >{{ value.label }}</el-tag
          >
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="onConfirmClick()">确定</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage, type ElTreeV2, type TreeNodeData } from "element-plus"

import {
  type DeEmployTreeNodeRes,
  listDepartmentAndEmployeeTrees,
  listDepartmentTrees,
  queryPositions
} from "@/api/component"
import CustomDialog from "@/components/CustomDialog/index.vue"
import { EnumSelectUser } from "@/constant/enums"

import type { ISelectPersonEmits, ISelectPersonProps, ITree } from "./type"

defineOptions({
  name: "SelectPersonDialog"
})

enum EnumNodeType {
  Root = 0, // 根节点
  Department = 1, // 部门节点
  Staff = 2, // 员工节点
  Post = 3 // 职位节点
}

const props = withDefaults(defineProps<ISelectPersonProps>(), {
  multiple: false
})
const emit = defineEmits<ISelectPersonEmits>()

const ROOT_ID = "0"
const searchValue = ref("")
const treeRef = ref<InstanceType<typeof ElTreeV2>>()
const treeData = ref<ITree[]>([])
const treeProps = {
  label: "label",
  value: "id",
  children: "children"
}
const defaultExpandedKeys = ref<Set<string>>(new Set())
const selectedMap = ref<Map<string, ITree>>(new Map())

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
})

// 在显示复选框的情况下，是否严格的遵循父子不互相关联的做法
const strictly = computed(() => {
  // 选择部门时，严格遵循父子不互相关联的做法
  const strictlyMap: Record<EnumSelectUser, boolean> = {
    [EnumSelectUser.Staff]: false,
    [EnumSelectUser.Department]: true,
    [EnumSelectUser.Post]: false
  }
  return strictlyMap[props.type]
})

watch(
  () => props.modelValue,
  async (val) => {
    if (val) {
      await getTreeData()
      initSelectedMap()
    } else {
      searchValue.value = ""
      treeData.value = []
      selectedMap.value.clear()
      defaultExpandedKeys.value.clear()
      treeRef.value?.setCheckedKeys([])
    }
  }
)

/** 初始化选中节点 */
const initSelectedMap = () => {
  const allNodes = getTreeAllCheckNodesData(treeData.value)
  props.selectedIds.forEach((item) => {
    const target = allNodes.find((node) => node.id === item)
    if (target) {
      selectedMap.value.set(target.id, target)
    }
  })
}

/** 回显选中树节点 */
const displaySelectedNodes = () => {
  if (!props.multiple) {
    return
  }

  if (props.type === EnumSelectUser.Department) {
    // 判断是否为全选状态
    const allNodes = getTreeAllCheckNodesData(treeData.value)

    if (allNodes.length && selectedMap.value.size) {
      const isAllChecked = allNodes.every((node) => selectedMap.value.has(node.id))
      if (isAllChecked) {
        treeRef.value?.setCheckedKeys([...selectedMap.value.keys(), ROOT_ID])
      } else {
        treeRef.value?.setCheckedKeys([...selectedMap.value.keys()])
      }
    }
  } else {
    treeRef.value?.setCheckedKeys([...selectedMap.value.keys()])
  }
}

/** 获取树数据 */
const getTreeData = async () => {
  defaultExpandedKeys.value.add(ROOT_ID)

  if (props.type === EnumSelectUser.Staff) {
    await getStaffTreeData()
  } else if (props.type === EnumSelectUser.Department) {
    await getDepartmentTreeData()
  } else if (props.type === EnumSelectUser.Post) {
    await getPositionTreeData()
  }

  setTimeout(() => {
    treeRef.value?.setExpandedKeys([...defaultExpandedKeys.value])

    displaySelectedNodes()
  }, 100)
}

/** 获取员工树数据 */
const getStaffTreeData = async () => {
  const data = await listDepartmentAndEmployeeTrees()

  treeData.value = [
    {
      id: ROOT_ID,
      label: "全部员工",
      no: "",
      nodeType: EnumNodeType.Root,
      children: buildStaffTreeData(data)
    }
  ]

  // 根据查询条件过滤员工数据
  if (searchValue.value) {
    treeData.value = filterStaffData(treeData.value)
  }
}

/** 员工树根据查询项过滤数据 */
const filterStaffData = (data: ITree[]): ITree[] => {
  const filterData: ITree[] = []
  data.forEach((item) => {
    const _item: ITree = {
      ...item,
      children: []
    }
    if (item.children.length) {
      _item.children = filterStaffData(item.children)
    } else {
      if (!item.id?.startsWith("dep_") && item.label?.includes(searchValue.value)) {
        filterData.push(_item)
      }
    }

    if (_item.children.length) {
      filterData.push(_item)
    }
  })

  return filterData
}

/** 构建员工树数据 */
const buildStaffTreeData = (data: DeEmployTreeNodeRes[]): ITree[] => {
  const list: ITree[] = []
  data.forEach((item) => {
    defaultExpandedKeys.value.add("dep_" + item.depId)
    const empList = item.employeeNodes.map((emp) => ({
      id: emp.empId,
      label: emp.empName,
      no: emp.empNo,
      depName: item.depName,
      nodeType: EnumNodeType.Staff,
      children: []
    }))
    const children = buildStaffTreeData(item.childDepartmentNodes)
    children.push(...empList)

    // 过滤掉没有员工的部门
    if (children.length) {
      list.push({
        id: item.depName ? "dep_" + item.depId : item.empId,
        label: item.depName ? item.depName : item.empName,
        no: item.depName ? "" : item.empNo,
        nodeType: item.depName ? EnumNodeType.Department : EnumNodeType.Staff,
        children
      })
    }
  })
  return list
}

/** 获取部门树数据 */
const getDepartmentTreeData = async () => {
  const data = await listDepartmentTrees({
    departmentName: searchValue.value
  })
  treeData.value = [
    {
      id: ROOT_ID,
      label: "全部部门",
      no: "",
      nodeType: EnumNodeType.Root,
      children: buildDepartmentTreeData(data)
    }
  ]
}

/** 构建部门树数据 */
const buildDepartmentTreeData = (data: DeEmployTreeNodeRes[]): ITree[] => {
  return data.map((item) => {
    defaultExpandedKeys.value.add(item.depId)
    return {
      id: item.depId,
      label: item.depName,
      no: item.empNo,
      nodeType: EnumNodeType.Department,
      children: buildDepartmentTreeData(item.childDepartmentNodes)
    }
  })
}

/** 获取职位树数据 */
const getPositionTreeData = async () => {
  const data = await queryPositions(searchValue.value)
  treeData.value = [
    {
      id: ROOT_ID,
      label: "全部职位",
      no: "",
      nodeType: EnumNodeType.Root,
      children: data.map((item) => ({
        id: item.positionId,
        label: item.positionName,
        no: item.positionCode,
        nodeType: EnumNodeType.Post,
        children: []
      }))
    }
  ]
}

/** 选中节点状态改变触发 */
const onCheckChange = (data: TreeNodeData, checked: boolean) => {
  const allNodes = getTreeAllCheckNodesData(treeData.value)
  const selectTreeNodes = treeRef.value!.getCheckedNodes()
  const selectTreeNodeIds = selectTreeNodes.map((item) => item.id)

  if (data.id === ROOT_ID) {
    // 切换根节点时

    if (strictly.value) {
      // 父子节点不严格遵循相关时

      if (checked) {
        allNodes.forEach((item) => {
          treeRef.value?.setChecked(item.id, checked)
          selectedMap.value.set(item.id, item as ITree)
        })
      } else {
        allNodes.forEach((item) => {
          treeRef.value?.setChecked(item.id, checked)
          selectedMap.value.delete(item.id)
        })
      }
    } else {
      // 父子节点严格遵循相关时
      if (checked) {
        selectTreeNodes.forEach((item) => {
          if (item.id.startsWith("dep_") || item.id === ROOT_ID) {
            return
          }
          selectedMap.value.set(item.id, item as ITree)
        })
      } else {
        allNodes.forEach((item) => {
          selectedMap.value.delete(item.id)
        })
      }
    }
  } else {
    // 切换非根节点

    allNodes.forEach((item) => {
      // 对于id为自定义拼接的节点，直接跳过
      if (!/^\d+$/.test(item.id)) {
        return
      }

      if (selectTreeNodeIds.includes(item.id)) {
        selectedMap.value.set(item.id, item)
      } else {
        selectedMap.value.delete(item.id)
      }
    })

    if (strictly.value) {
      // 父子节点不严格遵循相关时，判断是否全选

      const isAllChecked = allNodes.every((item) => selectedMap.value.has(item.id))
      treeRef.value?.setChecked(ROOT_ID, isAllChecked)
    }
  }
}

/** 单选框选中节点状态改变触发 */
const onRadioChange = (data: ITree) => {
  selectedMap.value.clear()
  selectedMap.value.set(data.id, data)
}

/** 移除选中标签 */
const onRemoveTag = (id: string) => {
  selectedMap.value.delete(id)
  treeRef.value?.setChecked(id, false)

  if (props.multiple && strictly.value) {
    const allNodes = getTreeAllCheckNodesData(treeData.value)
    const isAllChecked = allNodes.every((item) => selectedMap.value.has(item.id))
    treeRef.value?.setChecked(ROOT_ID, isAllChecked)
  }
}

/** 获取树所有可选择父子节点信息，排除根节点 */
const getTreeAllCheckNodesData = (data: ITree[]): ITree[] => {
  const allNodes: ITree[] = []
  data.forEach((item) => {
    if (item.id !== ROOT_ID) {
      allNodes.push(item)
    }
    if (item.children.length) {
      allNodes.push(...getTreeAllCheckNodesData(item.children))
    }
  })
  return allNodes
}

/** 确认操作 */
const onConfirmClick = () => {
  if (!selectedMap.value.size) {
    return ElMessage.warning(`请选择${props.type}`)
  }

  const selectedList = [...selectedMap.value.values()]
  visible.value = false
  emit("success", selectedList)
}
</script>

<style lang="scss" scoped>
.content {
  display: flex;

  .left {
    width: 500px;
    border-right: 1px solid #dcdfe6;
    padding-right: 8px;
  }

  .search-row {
    display: flex;
    align-items: center;
    margin-bottom: 16px;

    button {
      margin: 0 16px;
    }
  }

  &:deep(.el-tree) {
    height: 500px;

    .el-tree-node {
      &:hover {
        .el-tree-node__content {
          border-radius: 4px;
          border: 1px solid #91caff;
          background-color: #fff;
        }
      }

      .el-tree-node__content {
        position: relative;
        margin-right: 12px;
        border: 1px solid transparent;

        .el-checkbox {
          position: absolute;
          right: 5px;
          top: 50%;
          transform: translateY(-50%);

          .el-checkbox__label {
            padding: 0;
          }

          .el-checkbox__inner {
            width: 18px;
            height: 18px;

            &::before {
              width: 17px;
              top: 7px;
            }

            &::after {
              width: 4px;
              height: 10px;
              left: 6px;
              top: 1px;
            }
          }
        }
      }
    }

    .el-tree-node__expand-icon {
      font-size: 16px;
    }
  }

  .custom-tree-node {
    display: flex;
    align-items: center;

    .el-icon {
      font-size: 16px;
      margin-right: 6px;
    }
  }

  .radio {
    position: absolute;
    right: 5px;
    top: 50%;
    transform: translateY(-50%);

    &:deep(.el-radio__label) {
      padding: 0;
    }

    &:deep(.el-radio__inner) {
      width: 18px;
      height: 18px;

      &::after {
        width: 6px;
        height: 6px;
      }
    }
  }

  .right {
    flex: 1;
    margin-left: 16px;

    .right-title {
      font-size: 16px;
      font-weight: bold;
      margin: 4px 0 16px;
    }

    .right-title-line {
      height: 30px;
      line-height: 30px;
      padding: 0 12px;
      background-color: rgb(244, 246, 248);
    }

    .right-list {
      height: 500px;
      overflow-y: auto;

      &:deep(.el-tag) {
        margin: 12px 12px 0 0;
      }
    }
  }
}
</style>
