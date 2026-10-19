<template>
  <div class="containerStyle">
    <el-tree
      ref="treeRef"
      :props="treeProps"
      :class="horizonScroll ? 'horizonScrollStyle custom-scrollbar' : ''"
      :data="menuItems"
      :node-key="nodeKey"
      :default-expand-all="defaultExpand"
      :default-expanded-keys="defaultExpandedKeys"
      :default-checked-keys="defaultCheckedKeys"
      :current-node-key="currentNodeKey"
      :show-checkbox="iconStyle === 'check'"
      :expand-on-click-node="arrowExpand"
      :highlight-current="true"
      @node-click="onNodeClick"
    >
      <template #default="{ node, data }">
        <!-- 这个类名可以外部传入定义 -->
        <div class="custom-tree-node">
          <div class="flex items-center gap-[6px] h-full">
            <slot name="beforeIcon" :data="data" :node="node"></slot>
            <slot :data="data" :node="node">
              <span>{{ labelAttr ? data[labelAttr] : node.label }}</span>
            </slot>
          </div>

          <div class="flex items-center justify-start w-fit" v-if="isLeafNode(data)">
            <el-button
              v-if="isLeafNode(data) && !data.checkedStatus"
              type="primary"
              link
              @click.stop="onNodeClick(data)"
            >
              <svg-icon icon-class="star" size="28" />
              {{ "点击收藏" }}</el-button
            >
            <el-button
              v-if="isLeafNode(data) && data.checkedStatus"
              type="primary"
              link
              @click.stop="onCancelClick(data.id)"
            >
              <svg-icon icon-class="starred" size="28" style="color: #ffc700ff" />{{
                "取消收藏"
              }}</el-button
            >
          </div>
          <div class="flex items-center justify-start w-fit" v-if="!hideAfterIcon">
            <slot name="afterIcon" :data="data" :node="node"></slot>
          </div>
        </div>
      </template>
    </el-tree>
  </div>
</template>

<script setup lang="ts" generic="T">
import { requestDeleteFavorite } from "@/api/favorite"
import type { ITreeMenuItem } from "@/types/personal/collect"
import emitter from "@/utils/mitt"

enum EnumNodeType {
  All = "所有",
  Leaf = "L"
}

const props = withDefaults(
  defineProps<{
    menuItems: T[]
    iconStyle?: "check" | "star"
    labelAttr?: string
    childrenAttr?: string
    nodeKey?: string
    defaultExpand?: boolean
    defaultExpandedKeys?: (number | string)[]
    defaultCheckedKeys?: string[]
    currentNodeKey?: number | string
    isChecked?: boolean
    arrowExpand?: boolean
    horizonScroll?: boolean
    hideAfterIcon?: boolean
  }>(),
  {
    labelAttr: "label",
    childrenAttr: "children",
    nodeKey: "id",
    defaultExpand: true,
    isChecked: true,
    horizonScroll: false,
    hideAfterIcon: false
    // arrowExpand: true 默认值为 true，如果为 false，则只有点箭头图标的时候才会展开或者收缩节点。
  }
)

// 下拉树的属性配置
const treeProps = ref({
  label: props.labelAttr,
  children: props.childrenAttr,
  disabled: () => {
    return props.isChecked
  }
})
const treeRef = ref()

const emit = defineEmits<{
  (e: "toggle-favorite", nodeData: T): void
  (e: "node-click", nodeData: T): void
  (e: "delete-click"): void
  (e: "check-change", nodeData: any, checked: Boolean, checked2: Boolean): void
  (e: "get-all-nodes", allArr: any, halfIdsArr: any): void
}>()

onMounted(() => {
  if (props.currentNodeKey || props.currentNodeKey == "0") {
    treeRef.value.setCurrentKey(props.currentNodeKey)
  }
})

watch(
  () => props.defaultCheckedKeys,
  () => {
    treeRef.value.setCheckedKeys(props.defaultCheckedKeys)
  },
  {
    deep: true
  }
)

/** 是否为叶子节点 */
const isLeafNode = (data: ITreeMenuItem) => {
  return data.levelTree?.includes(EnumNodeType.Leaf)
}

/** 节点点击事件 */
const onNodeClick = (nodeData: T) => {
  // 派发事件通知父组件收藏状态变更
  emit("toggle-favorite", nodeData)
  emit("node-click", nodeData)
}

/** 获取树形节点选中与半选中状态节点数据 */
const getTreeCheckedNodes = () => {
  const allCheckedArr = treeRef.value.getCheckedNodes()
  const halfCheckedIdsArr = treeRef.value.getHalfCheckedNodes()
  return { allCheckedArr, halfCheckedIdsArr }
}

/** 取消收藏操作 */
const onCancelClick = async (menuId: string) => {
  await requestDeleteFavorite({ menuId })
  emit("delete-click")
}

defineExpose({
  getTreeCheckedNodes
})
</script>

<style lang="scss" scoped>
.containerStyle {
  width: 100%;
  height: 100%;
}

:deep(.el-tree) {
  .el-tree-node {
    .el-tree-node__content {
      --el-tree-node-content-height: 32px;
      box-sizing: border-box;
      // border: 1px solid rgba(0, 0, 0, 0);
      &:hover {
        // border-radius: 4px;
        // border: 1px solid #91caff;
        background-color: #fff;
      }
    }
  }
}
:deep(.el-tree.el-tree--highlight-current) {
  .is-current > .el-tree-node__content {
    // border-radius: 4px;
    background: #fff;
  }
}

.custom-tree-node {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;

  span {
    vertical-align: text-bottom;
  }
}

.horizonScrollStyle {
  overflow-x: scroll;
  flex: 1;
  height: 98%;
  margin: 10px;
  &:deep(.el-button + .el-button) {
    margin-left: 0px;
  }
  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
