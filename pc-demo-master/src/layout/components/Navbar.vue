<template>
  <div class="navbar">
    <TopTags id="topmenu-container" class="topmenu-container" v-if="settingsStore.topNav" />

    <div class="right-menu">
      <el-tooltip content="追踪追溯" effect="dark" placement="bottom">
        <div
          class="right-menu-item hover-effect"
          @click="$router.push({ path: personalRoutesPath.trace })"
        >
          <SvgIcon icon-class="trace-icon" size="24" />
        </div>
      </el-tooltip>
      <span content="菜单收藏夹">
        <div class="right-menu-item hover-effect">
          <el-dropdown>
            <span>
              <SvgIcon icon-class="favoriteRight" size="28" />
            </span>
            <template #dropdown>
              <el-dropdown-menu class="dropdown-list-style">
                <el-dropdown-item
                  v-for="item in favoriteMenus"
                  :key="item.id"
                  @click="$router.push({ path: item.menuPath })"
                >
                  <SvgIcon icon-class="starred" size="28" style="color: #ffc700ff" />
                  {{
                    item.menuFullName.length > 20
                      ? item.menuFullName.slice(0, 20) + "..."
                      : item.menuFullName
                  }}
                </el-dropdown-item>
                <el-dropdown-item
                  icon="Setting"
                  @click="$router.push({ path: personalRoutesPath.collect })"
                >
                  管理收藏夹
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </span>
      <el-tooltip content="我的流程" effect="dark" placement="bottom">
        <div
          class="right-menu-item hover-effect"
          @click="$router.push({ path: personalRoutesPath.usersFlow })"
        >
          <el-badge :value="flowTotal" :max="99" :show-zero="false" class="badge">
            <SvgIcon icon-class="process-right" size="28" />
          </el-badge>
        </div>
      </el-tooltip>
      <el-tooltip content="消息中心" effect="dark" placement="bottom">
        <div
          class="right-menu-item hover-effect"
          @click="$router.push({ path: personalRoutesPath.systemMessages })"
        >
          <el-badge :value="sysMessageCount" :max="99" :show-zero="false" class="badge">
            <SvgIcon icon-class="message-right" size="28" />
          </el-badge>
        </div>
      </el-tooltip>
      <span content="用户个人" class="mr-2">
        <div class="right-menu-item hover-effect">
          <el-dropdown>
            <span>
              <SvgIcon icon-class="user" size="28" />
            </span>
            <template #dropdown>
              <el-dropdown-menu class="dropdown-list-style">
                <el-dropdown-item @click="$router.push({ path: personalRoutesPath.account })">
                  账号管理
                </el-dropdown-item>
                <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { queryUserFavoriteMenuList } from "@/api/favorite"
import { queryFlowTodoList } from "@/api/flowable"
import SvgIcon from "@/components/SvgIcon/Index.vue"
import TopTags from "@/components/TopTags/index.vue"
import { useFlowTotal } from "@/hooks/useFlowTotal"
import { useSystemMessage } from "@/hooks/useSystemMessage"
import { personalRoutesPath } from "@/router/index"
import useSettingsStore from "@/store/modules/settings"
import useUserStore from "@/store/modules/user"
import emitter from "@/utils/mitt"

defineOptions({
  name: "NavbarComponent"
})

const userStore = useUserStore()
const settingsStore = useSettingsStore()
const router = useRouter()
const { sysMessageCount, initSystemMessage } = useSystemMessage()

const favoriteMenus = ref<
  {
    id: string
    menuFullName: string
    menuPath: string
  }[]
>([])

const { flowTotal, setFlowTotal } = useFlowTotal()

onBeforeMount(() => {
  fetchFavoriteList()
  getMyProcessList()
  // getSystemMessageList()
  initSystemMessage()
})

emitter.on("addFavorite", async () => {
  await fetchFavoriteList()
  ElMessage.success("操作成功")
})

onBeforeUnmount(() => {
  emitter.off("addFavorite") //关闭
})

const fetchFavoriteList = async () => {
  const res = await queryUserFavoriteMenuList()
  favoriteMenus.value = res.map((item) => ({
    ...item,
    id: item.id,
    menuId: item.menuId,
    menuName: item.menuName,
    menuFullName: item.menuFullName,
    menuPath: item.menuPath
  }))
}

const logout = async () => {
  await ElMessageBox.confirm("确定注销并退出系统吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
  await userStore.logOut()
  ElMessage.success("注销成功")
  router.replace("/login")
}

/** 获取我的流程待审批数量 */
const getMyProcessList = async () => {
  try {
    const { total } = await queryFlowTodoList({
      pageNum: 1,
      pageSize: 10
    })
    setFlowTotal(+total)
  } catch (error) {
    setFlowTotal(0)
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  height: 50px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .top-tag-container {
    display: flex;
    justify-content: space-between;
    width: calc(100% - 268px);
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    height: 100%;
    line-height: 50px;
    display: flex;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #303133;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }

      :deep(.el-dropdown) {
        vertical-align: baseline;
        color: #303133;

        .el-tooltip__trigger:focus-visible {
          outline: 0;
        }

        .svg-icon {
          width: 18px !important;
          height: 18px !important;
          margin-right: 5px;
        }
      }
    }

    .avatar-container {
      margin-right: 40px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 100px;
          height: 24px;
          border-radius: 10px;
        }

        i {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}

.dropdown-list-style {
  :deep(.el-dropdown-menu__item) {
    flex-direction: row-reverse;
    justify-content: flex-start;

    .el-icon {
      margin-left: 8px;
    }
  }
}

.badge:deep(.el-badge__content) {
  top: 12px;
}
</style>
