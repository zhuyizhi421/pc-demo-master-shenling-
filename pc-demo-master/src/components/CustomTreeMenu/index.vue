<template>
  <div
    class="comTreeMenu"
    :class="[virtualize ? 'comp-virtual' : 'comp-normal']"
    ref="treeMenuContainerRef"
  >
    <component
      :is="component"
      v-bind="componentVOn"
      ref="treeRef"
      :props="treeProps"
      :data="menuItems"
      @check-change="handleCheckChange"
      :expand-on-click-node="expandOnClickNode"
      @check="handleTreeNodeClick"
      @node-click="handleNodeClick"
      :current-node-key="currentNodeKey"
      :highlight-current="highlightCurrent"
      :show-checkbox="showCheckbox"
      :indent="6"
    >
      <template #default="{ node, data }">
        <div class="custom-tree-node">
          <div class="custom-node-row">
            <div class="custom-node-icon" v-if="showCustomIcon">
              <slot name="beforeIcon" :data="data" :node="node">
                <svg-icon
                  style="margin-left: 0px; margin-right: 0px"
                  icon-class="folder"
                  size="28"
                />
              </slot>
            </div>
            <div class="comTreeMenu-name">
              <slot name="nodeContent" :data="data" :node="node">
                {{ node.label }}
              </slot>
            </div>
          </div>
          <div class="custom-node-handle">
            <!-- #1989fa -->
            <!-- icon 颜色： #96979a-->
            <slot name="afterIcon" :data="data" :node="node"></slot>
          </div>
        </div>
      </template>
    </component>
  </div>
</template>
<script setup lang="ts">
import { ElTree, ElTreeV2, type TreeInstance } from "element-plus"
import type { TreeOptionProps } from "element-plus/es/components/tree/src/tree.type.mjs"
import type { TreeOptionProps as TreeOptionPropsV2 } from "element-plus/es/components/tree-v2/src/types"

type TreeInstanceV2 = InstanceType<typeof ElTreeV2>

defineOptions({
  name: "CustomTreeMenu"
})

const props = withDefaults(
  defineProps<{
    menuItems: any[]
    labelAttr?: string
    childrenAttr?: string
    nodeKey?: string
    defaultExpand?: boolean
    defaultExpandedKeys?: number[]
    currentNodeKey?: number | string
    showCheckbox?: boolean
    multipleValue?: boolean
    expandOnClickNode?: boolean
    showCustomIcon?: boolean
    nodeContentHeight?: number
    highlightCurrent?: boolean
    virtualize?: boolean
  }>(),
  {
    labelAttr: "label",
    childrenAttr: "children",
    nodeKey: "id",
    defaultExpand: true,
    showCheckbox: false,
    expandOnClickNode: false,
    showCustomIcon: true,
    nodeContentHeight: 36,
    highlightCurrent: true,
    virtualize: false
  }
)
const emit = defineEmits<{
  (e: "nodeClick", nodeData: any): void
  (e: "checkChange", data: any, self?: boolean, selfTree?: any): void
}>()

const defaultExpandedRenderKeys = ref<string[]>([])

const treeMenuContainerRef = ref<HTMLDivElement>()
const treeHeight = ref(800)

const treeRef = ref<TreeInstanceV2 | TreeInstance>()
const treeProps = ref<TreeOptionProps | TreeOptionPropsV2>({
  label: props.labelAttr,
  children: props.childrenAttr,
  value: props.nodeKey
  // class: () => "custom-tree-container"
})

const component = computed(() => {
  return props.virtualize ? ElTreeV2 : ElTree
})

const componentVOn = computed<any>(() => {
  return props.virtualize
    ? {
        height: treeHeight.value,
        itemSize: props.nodeContentHeight,
        defaultExpandedKeys: defaultExpandedRenderKeys.value
      }
    : {
        nodeKey: props.nodeKey,
        defaultExpandAll: props.defaultExpand
      }
})

watch(
  () => props.menuItems,
  () => {
    if (props.virtualize) {
      nextTick(() => {
        const height = treeMenuContainerRef.value?.offsetHeight
        treeHeight.value = height || 800
        defaultExpandedRenderKeys.value = getDefaultExpandedRenderKeys()
        setTimeout(() => {
          ;(treeRef.value as TreeInstanceV2)?.setExpandedKeys(defaultExpandedRenderKeys.value)
        })
      })
    }
  }
)

// 递归获取所有 nodeKey 的函数
const getAllNodeKeys = (items: any[], nodeKey: string): any[] => {
  let keys: any[] = []

  items.forEach((item) => {
    // 添加当前节点的 key
    keys.push(item[nodeKey])

    // 如果有子节点,递归获取子节点的 keys
    if (item.children && item.children.length > 0) {
      keys = keys.concat(getAllNodeKeys(item.children, nodeKey))
    }
  })

  return keys
}

const getDefaultExpandedRenderKeys = () => {
  if (props.defaultExpandedKeys?.length) {
    return props.defaultExpandedKeys
  } else {
    if (props.defaultExpand) {
      const allNodeKeys = getAllNodeKeys(props.menuItems, props.nodeKey)
      return allNodeKeys
    } else {
      return []
    }
  }
}

const handleNodeClick = (nodeData: any) => {
  emit("nodeClick", nodeData)
}

// 多选逻辑
const handleCheckChange = (data: any, ...args: any[]) => {
  if (props.multipleValue) {
    // 默认 多选
    // const handleCheckChange = (data: any, self: boolean, selfTree?: any) => {
    emit("checkChange", data, ...args)
  }
}

// 单选逻辑
const handleTreeNodeClick = (data: any, checkObj: any) => {
  if (!props.multipleValue) {
    if (!data.children?.length) {
      // 最后一个节点
      setCheckedKeys([data.id])
      emit("checkChange", data)
    } else {
      // 如果是点击到了父级，就展示父级下的某一个叶子节点，父级的children 有值
      if (checkObj?.checkedNodes?.length) {
        // 为啥要反转，因为可能之前已选中的叶子会在前面，导致点击失效
        const finded = checkObj?.checkedNodes.reverse().find((item: any) => !item.children?.length)
        if (finded) {
          setCheckedKeys([finded.id])
          emit("checkChange", finded)
        }
      }
    }
  }
}

/** 设置默认选中节点 */
const setCurrentKey = (key: number | string) => {
  treeRef.value?.setCurrentKey(key)
}

/** 设置目前选中的节点，使用此方法必须设置 node-key 属性 */
const setCheckedKeys = (keys: (string | number)[], leafOnly = false) => {
  treeRef.value?.setCheckedKeys(keys, leafOnly)
}

/** 设置节点是否被选中, 使用此方法必须设置 node-key 属性 */
const setChecked = (key: string | number, checked: boolean, deep = true) => {
  treeRef.value?.setChecked(key, checked, deep)
}

defineExpose({
  getTreeRef: () => treeRef.value,
  setCurrentKey,
  setCheckedKeys,
  setChecked
})
</script>
<style scoped lang="scss">
.comTreeMenu {
  :deep(.el-checkbox) {
    position: absolute;
    right: 0;
  }

  :deep(.el-tree) {
    .el-tree-node {
      .el-tree-node__content {
        box-sizing: border-box;
        border: 1px solid #fff;
        &:hover {
          border-radius: 4px;
          border: 1px solid #91caff;
          background-color: #fff;
        }
      }
    }
  }
  :deep(.el-tree.el-tree--highlight-current) {
    .is-current > .el-tree-node__content {
      border-radius: 4px;
      background: #e6f4ff;
      .comTreeMenu-name {
        font-weight: 500;
      }
    }
  }

  .comTreeMenu-name {
    font-size: 14px;
    font-weight: 400;
    color: #606266;

    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .custom-tree-node {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .custom-node-row {
    // flex items-center flex-1 overflow-x-hidden w-0
    display: flex;
    align-items: center;
    flex: 1;
    overflow-x: hidden;
    width: 0;
  }

  .custom-node-icon {
    display: block;
    overflow: hidden;
    width: 14px;
    height: 14px;
    margin-right: 8px;
    min-width: 14px;
    min-height: 14px;
  }
  .custom-node-handle {
    // flex items-center justify-start w-fit
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: fit-content;
  }
}

.comp-virtual {
  height: 100%;

  :deep(.el-tree) {
    .el-tree-node {
      .el-tree-node__content {
        margin-right: 12px;
      }
    }
  }
}

.comp-normal {
  :deep(.el-tree) {
    .el-tree-node {
      .el-tree-node__content {
        --el-tree-node-content-height: v-bind(nodeContentHeight + "px");
      }
    }
  }
}
</style>
