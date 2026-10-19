<!--生产单位选择-->
<template>
  <el-cascader
    ref="cascaderRef"
    v-model="value"
    @change="change"
    @visible-change="($event: boolean) => emits('visible-change', $event)"
    :options="cascaderData"
    collapse-tags
    collapse-tags-tooltip
    filterable
    :props="cascaderProps"
    :show-all-levels="showAllLevels"
    :clearable="clearable"
    :disabled="disabled"
  />
</template>

<script setup lang="ts">
import { queryFactoryModelTree, queryModelTreeByLeafType } from "@/api/fm"
import type { IFactoryModelTreeNode } from "@/types/base-info/factory-model"

import { SelectType } from "./types"

defineOptions({
  name: "SelectFactoryModel"
})

const props = withDefaults(
  defineProps<{
    modelValue: any
    type?: SelectType
    isEnable?: boolean // 查询条件，是否启用
    containLastLevel?: boolean // 是否包含最后一级
    multiple?: boolean
    initSelectAll?: boolean
    labelAttr?: string
    valueAttr?: string
    disabled?: boolean
    checkStrictly?: boolean // 是否每一级可选
    clearable?: boolean
    showAllLevels?: boolean
    disabledNonPeer?: boolean // 是否禁用非同级，multiple为true且checkStrictly为true时有效
    rootLevelTag?: string // 指定根节点的levelTag，用于过滤顶级节点
  }>(),
  {
    type: SelectType.AllType,
    multiple: false,
    initSelectAll: false,
    labelAttr: "entityName",
    valueAttr: "entityId",
    isEnable: true,
    disabled: false,
    checkStrictly: false,
    clearable: true,
    showAllLevels: true,
    disabledNonPeer: false,
    containLastLevel: true
  }
)

const emits = defineEmits<{
  (e: "update:modelValue", data: any): void
  (e: "initSelectAll"): void
  (e: "onChange", data: any): void
  (e: "visible-change", visible: boolean): void
}>()

const cascaderData = ref<IFactoryModelTreeNode[]>([])
const cascaderRef = ref()

const cascaderProps = computed(() => ({
  label: props.labelAttr,
  value: props.valueAttr,
  multiple: !!props.multiple,
  checkStrictly: props.checkStrictly,
  emitPath: false
}))

onMounted(async () => {
  try {
    let res: IFactoryModelTreeNode[] = []
    if (props.type !== SelectType.AllType) {
      res = await queryModelTreeByLeafType({
        leafType: props.type,
        isEnable: props.isEnable,
        containLastLevel: props.containLastLevel
      })
      cascaderData.value = addLevelToNodes(res)
    } else {
      res = await queryFactoryModelTree({
        isEnable: props.isEnable
      })
      cascaderData.value = addLevelToNodes(res)
    }
    if (props.multiple && props.initSelectAll) {
      const selectIds: any[] = []
      selectAll(selectIds, res)
      emits("update:modelValue", selectIds)
      emits("initSelectAll")
    }
  } catch (error) {
    /* empty */
  }
})

const value = computed({
  get: () => props.modelValue,
  set: (val: any) => {
    emits("update:modelValue", val)
  }
})

/**
 * 添加层级并过滤节点
 * @param nodes 节点数组
 * @param level 层级
 * @returns 添加层级后的节点数组
 */
const addLevelToNodes = (
  nodes: IFactoryModelTreeNode[],
  level: number = 1
): IFactoryModelTreeNode[] => {
  // 当设置了rootLevelTag时，直接从所有节点中收集匹配levelTag的节点作为顶级
  if (props.rootLevelTag && level === 1) {
    const resultNodes: IFactoryModelTreeNode[] = []

    const collectNodes = (nodeList: IFactoryModelTreeNode[]) => {
      for (const node of nodeList) {
        if (node.levelTag === props.rootLevelTag) {
          resultNodes.push({ ...node })
        }
        if (node.children && node.children.length > 0) {
          collectNodes(node.children)
        }
      }
    }
    collectNodes(nodes)

    if (resultNodes.length > 0) {
      return resultNodes.map((node) => {
        node.level = level
        if (node.children) {
          node.children = addLevelToNodes(node.children, level + 1)
        }
        return node
      })
    }
  }

  return nodes
    .filter((node) => {
      // 当type为ProductType时，过滤掉levelTag为"workstation"的工位数据
      if (props.type === SelectType.ProductType && node.levelTag === "workstation") {
        return false
      }
      return true
    })
    .map((node) => {
      node.level = level // 给当前节点添加层级
      if (node.children) {
        node.children = addLevelToNodes(node.children, level + 1) // 递归处理子节点
      }
      return node
    })
}

/**
 * 禁用选项
 * @param unDisabledLevel 未禁用的层级
 */
const disabledOption = (unDisabledLevel: number) => {
  cascaderData.value.forEach((item) => {
    const dealOption = (item: IFactoryModelTreeNode) => {
      if (item.level === unDisabledLevel) {
        item.disabled = false
      } else {
        item.disabled = true
      }
      if (item.children) {
        item.children.forEach((val) => {
          dealOption(val)
        })
      }
      return
    }
    dealOption(item)
  })
}

/**
 * 清除禁用状态
 */
const clearDisabledOption = () => {
  cascaderData.value.forEach((item) => {
    const dealOption = (item: IFactoryModelTreeNode) => {
      item.disabled = false
      if (item.children) {
        item.children.forEach((val) => {
          dealOption(val)
        })
      }
      return
    }
    dealOption(item)
  })
}

/**
 * 查找指定ID在级联数据中的路径
 * @param targetId 要查找的目标ID
 * @param nodes 要搜索的节点数组
 * @param currentPath 当前路径（用于递归）
 * @returns 从根节点到目标节点的ID数组，如果未找到则返回空数组
 */
const findPathById = (
  targetId: string | number,
  nodes: IFactoryModelTreeNode[] = cascaderData.value,
  currentPath: (string | number)[] = []
): (string | number)[] => {
  for (const node of nodes) {
    const nodeValue = (node as any)[props.valueAttr]
    const newPath = [...currentPath, nodeValue]

    // 检查当前节点是否为目标节点
    if (nodeValue === targetId) {
      return newPath
    }

    // 如果有子节点，递归搜索
    if (node.children && node.children.length > 0) {
      const result = findPathById(targetId, node.children, newPath)
      if (result.length > 0) {
        return result
      }
    }
  }

  return []
}

/**
 * 处理级联选择器变化
 * @param value 选中的值
 */
const handleCascaderChange = (value: string[]) => {
  if (value.length > 0) {
    const unDisabledLevel = findPathById(value[0], cascaderData.value)?.length
    disabledOption(unDisabledLevel)
  } else {
    clearDisabledOption()
  }
}

const change = (data: any) => {
  if (props.multiple && props.checkStrictly && props.disabledNonPeer) {
    handleCascaderChange(data)
  }
  if (data) {
    emits("onChange", data)
  } else if (data == undefined) {
    emits("onChange", "")
  }
}

const selectAll = (data: any[], originData: any[]) => {
  originData.forEach((item: any) => {
    if (!item.children?.length) {
      data.push(item[props.valueAttr])
      return
    }
    selectAll(data, item.children)
  })
}

defineExpose({
  cascaderRef
})
</script>

<style scoped lang="scss"></style>
