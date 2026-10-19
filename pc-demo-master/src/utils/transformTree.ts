import type { IDepartmentListItem, IDepartmentTreeItem } from "@/types/base-info/employee"
import type {
  IMeneTreeDisplay,
  IMenuListItem,
  IMenuTreeItem,
  IPermissionListItem
} from "@/types/base-info/user"

const generateMenuTree = <T extends IMenuTreeItem<T, U>, U extends IPermissionListItem>(
  menus: T[],
  permissions: U[]
) => {
  // 首先，我们将 permissions 按照 menu_id 分组
  const permissionMap = permissions.reduce(
    (acc, cur) => {
      if (acc[cur.menuId]) {
        acc[cur.menuId].push(cur)
      } else {
        acc[cur.menuId] = [cur]
      }
      return acc
    },
    {} as { [key: string]: U[] }
  )

  // 然后，我们创建一个函数，递归地将 menus 转换为树状结构
  const createTree = (nodes: T[], parent: string) => {
    const tree = []
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].levelTree.endsWith("L") && nodes[i].levelTree.startsWith(parent)) {
        // 这是一个叶子节点，我们需要给它添加权限
        nodes[i].permissions = permissionMap[nodes[i].id] || []
        tree.push(nodes[i]) // 直接把叶子节点加入到树中
        nodes.splice(i, 1) // 移除已经处理的节点，避免重复添加
        i-- // 由于我们移除了一个节点，所以我们需要减少 i 以防止跳过任何节点
      } else if (nodes[i].levelTree.startsWith(parent) && !nodes[i].levelTree.endsWith("L")) {
        // 这是当前 parent 的子节点
        const childNode = { ...nodes[i] }
        childNode.children = createTree(nodes, nodes[i].levelTree + ".") // 只有非叶子节点才有children字段
        tree.push(childNode)
        nodes.splice(i, 1) // 移除已经处理的节点，避免重复添加
        i-- // 由于我们移除了一个节点，所以我们需要减少 i 以防止跳过任何节点
      }
    }
    return tree
  }

  // 最后，我们调用 createTree 来生成树状结构
  return createTree(menus, "")
}

/** 转换菜单树 */
export const convertMenuData = <T extends IMenuTreeItem<T, U>, U extends IPermissionListItem>(
  testData: T[]
) => {
  return testData.map((item) => {
    const menuTree = {
      label: item.menuName,
      id: item.id,
      checkedStatus: item.checkedStatus
    } as IMeneTreeDisplay

    if (item.children && Array.isArray(item.children)) {
      menuTree.type = "menu"
      menuTree.menuCode = item.menuCode
      menuTree.children = convertMenuData(item.children)
    } else if (item.permissions && Array.isArray(item.permissions)) {
      menuTree.type = "menu"
      menuTree.menuCode = item.menuCode
      menuTree.children = item.permissions.map((i) => ({
        label: i.permissionName,
        checkedStatus: i.checkedStatus,
        id: "custom-" + i.id, // 自定义 id，避免与菜单 id 冲突
        type: "permission",
        permissionCode: i.permissionCode
      }))
    }
    return menuTree
  })
}

/** 获取选中菜单 */
const getCheckedArr = (arrData: IMeneTreeDisplay[], checkedArr: string[]) => {
  for (const item of arrData) {
    if (Array.isArray(item.children) && item.children.length) {
      if (item.checkedStatus) {
        checkedArr.push(item.id)
      }
      getCheckedArr(item.children, checkedArr)
    } else {
      if (item.checkedStatus) {
        checkedArr.push(item.id)
      }
    }
  }
}

/** 菜单数据  列表结构 => 树状结构 */
export const listToTree = <T extends IMenuListItem, U extends IPermissionListItem>(
  menus: T[],
  permissions: U[]
) => {
  menus.sort((a, b) => a.levelTree.localeCompare(b.levelTree))
  const testData = generateMenuTree<T, U>(menus, permissions)
  const menuTree = convertMenuData<T, U>(testData)
  const checkedArr: string[] = []
  getCheckedArr(menuTree, checkedArr)
  return { menuTree, checkedArr }
}

/** 构建部门树形数据 */
export function buildDepartmentTree<T extends IDepartmentListItem>(
  data: T[],
  parentId: string | null
) {
  const result: IDepartmentTreeItem[] = []

  for (const item of data) {
    if (item.parentDepId === parentId) {
      const itemObj: T = cloneDeep(item)
      const newItem = {
        ...itemObj,
        label: itemObj.depName,
        children: buildDepartmentTree(data, itemObj.id)
      }
      result.push(newItem)
    }
  }
  return result
}

export function buildDepTree(data: any, parentId = null): any {
  const result = []

  for (const item of data) {
    if (item.parentDepId === parentId) {
      const newItem = {
        label: item.depName,
        value: item.id,
        children: buildDepTree(data, item.id)
      }
      result.push(newItem)
    }
  }

  return result
}
