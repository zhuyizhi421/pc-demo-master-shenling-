<template>
  <el-tree
    ref="treeRef"
    :data="tree"
    :props="defaultProps"
    show-checkbox
    default-expand-all
    :node-key="'id'"
    :empty-text="'无数据'"
  >
    <template #default="{ node }">
      <el-space>
        <span>{{ node.label }}</span>
        <img v-if="node.data.isComp" src="@/assets/icon/svg/obj_icon.svg" style="width: 14px" />
        <img v-if="node.data.self" src="@/assets/icon/svg/pos_icon.svg" style="width: 14px" />
      </el-space>
    </template>
  </el-tree>
</template>

<script lang="ts" setup>
import type { ElTree } from "element-plus"
import { nextTick, shallowRef, watch } from "vue"

defineOptions({
  name: "SearchAndLocateIdTree"
})

interface Tree {
  id?: string
  label: string
  children?: Tree[]
  disabled?: boolean
  isComp?: boolean
  self?: boolean
}

interface IProps {
  tree: Tree[]
}
const props = defineProps<IProps>()

const defaultProps = {
  children: "children",
  label: "label"
}

const treeRef = shallowRef<InstanceType<typeof ElTree>>()

const getCheckedKeys = () => {
  return treeRef.value
    ?.getCheckedKeys()
    .filter((i) => i != undefined)
    .map((key) => (key as string).split("自定义")[0])
}

const setAllChecked = () => {
  const nodes = treeRef.value?.store.nodesMap
  for (const key in nodes) {
    if (Object.prototype.hasOwnProperty.call(nodes, key)) {
      const node = nodes[key]
      treeRef.value?.store.setChecked(node.key, true, true)
    }
  }
}

watch(
  () => props.tree,
  () => {
    nextTick(() => {
      setAllChecked()
    })
  },
  {
    deep: true,
    immediate: true
  }
)

defineExpose({
  getCheckedKeys
})
</script>
