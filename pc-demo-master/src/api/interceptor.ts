import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios"
import axios from "axios"
import { ElMessage } from "element-plus"

import router from "@/router"
import useUserStore from "@/store/modules/user"
import { removeToken } from "@/utils/auth"
import { getMockSharedBaseUrl, isModuleMockEnabled } from "@/utils/moduleMockEnv"
import { isStaticMockEnabled, resolveStaticMockRequest } from "@/mock-static"

export interface IRes<T = unknown> {
  code: number
  data: T
  message: string
  success: boolean
}

const baseURL = import.meta.env.VITE_API_BASE_URL
axios.defaults.baseURL = baseURL

axios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useUserStore().token
    const tenantId = useUserStore().tenantInfo?.id
    config.headers["tenant-id"] = tenantId
    if (token) {
      config.headers.setAuthorization(token)
    }

    if (isStaticMockEnabled()) {
      config.adapter = async (adapterConfig) => ({
        config: adapterConfig,
        data: resolveStaticMockRequest({
          url: adapterConfig.url,
          method: adapterConfig.method,
          data: adapterConfig.data,
          params: adapterConfig.params
        }),
        headers: adapterConfig.headers,
        request: {},
        status: 200,
        statusText: "OK"
      })
      return config
    }

    // Module mock: forward all relative requests to mock-shared-server.
    if (isModuleMockEnabled()) {
      const mockBase = getMockSharedBaseUrl()
      const url = config.url ? String(config.url) : ""
      const isAbsolute = /^https?:\/\//i.test(url)
      if (mockBase && url && !isAbsolute) {
        // Some callers include `/api` prefix; remove it to avoid double `/api` in mock server.
        if (url.startsWith("/api/")) {
          config.url = url.replace(/^\/api/, "") || "/"
        } else if (url === "/api") {
          config.url = "/"
        } else if (url.startsWith("api/")) {
          config.url = url.replace(/^api/, "") || "/"
        }
        config.baseURL = mockBase
      }
    }

    return config
  },
  (error: AxiosError) => {
    ElMessage({
      message: error.message,
      grouping: true,
      type: "error",
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

axios.interceptors.response.use(
  (response: AxiosResponse<IRes>) => {
    const res = response.data

    if (typeof res?.success !== "undefined" && !res.success) {
      ElMessage({
        message: res.message,
        grouping: true,
        type: "warning",
        duration: 5 * 1000
      })
      return Promise.reject(res)
    }
    return Promise.resolve(response)
  },
  (error: AxiosError) => {
    const responseData = error.response?.data as Partial<IRes> | undefined
    const message = responseData?.message || error.message

    if (error.response) {
      if (error.response.status === 401) {
        ElMessage({
          message: "需重新登录",
          grouping: true,
          type: "warning"
        })
        removeToken()
        setTimeout(() => {
          router.replace({ path: "/login" })
        }, 100)
        return Promise.reject(error)
      } else if (error.response.status === 403) {
        ElMessage({
          message: "抱歉，您无权限访问！",
          grouping: true,
          type: "warning"
        })
        return Promise.reject(error)
      }
    }
    ElMessage({
      message,
      grouping: true,
      type: "error",
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)
