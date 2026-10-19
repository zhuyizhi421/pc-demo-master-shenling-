import localForage from 'localforage'
// 因为是异步，注意使用时的有效值处理

// 这里可以结合store 做响应式，读是直接读取store 中，但是写入清除需要同时清除store 中的值就行
// 后续添加，可以基于这个库做一个响应式的库，这样就可以直接在store 中使用了（理想状态是使用pinia似的直接使用）
// 将pinia 和 localforage 集成在一起

export enum LocalAttrEnum {
  // 每次有新的数据就在这添加
  UserName = 'userName'
}

export async function getLocalForageItem(val: LocalAttrEnum) {
  try {
    return await localForage.getItem(val)
  } catch (e) {
    /* empty */
  }
  return
}

export async function setLocalForageItem(key: LocalAttrEnum, val: any) {
  try {
    return await localForage.setItem(key, val)
  } catch (e) {
    /* empty */
  }
  return
}

export async function removeLocalForageItem(key: LocalAttrEnum) {
  try {
    return await localForage.removeItem(key)
  } catch (e) {
    /* empty */
  }
  return
}

export async function clearLocalForage() {
  try {
    return await localForage.clear()
  } catch (e) {
    /* empty */
  }
  return
}
