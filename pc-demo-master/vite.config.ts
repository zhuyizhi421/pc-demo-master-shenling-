import { fileURLToPath, URL } from "node:url"

import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"
import path from "path"
import autoImport from "unplugin-auto-import/vite"
import { defineConfig } from "vite"
import { createSvgIconsPlugin } from "vite-plugin-svg-icons" // 生成 svg 雪碧图

// const proxyTarget = 'http://192.168.200.1/wenzhi-release/mes-backend-server/' // 测试环境
const proxyTarget = "http://127.0.0.1:4010/" // 模拟服务器

const pathSrc = path.resolve(__dirname, "src")
// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  base: command === "serve" ? "/" : "./",
  plugins: [
    autoImport({
      imports: [
        "vue",
        "vue-router",
        "pinia",
        {
          dayjs: [
            // default imports
            ["default", "dayjs"] // import { default as dayjs } from 'dayjs',
          ],
          "lodash/cloneDeep": [["default", "cloneDeep"]]
        }
      ],
      dts: path.resolve(pathSrc, "auto-imports.d.ts")
    }),
    vue(),
    vueJsx(),
    createSvgIconsPlugin({
      // 指定需要缓存的图标文件夹
      iconDirs: [path.resolve(process.cwd(), "src/assets/icon/svg")],
      // 指定symbolId格式
      symbolId: "icon-[dir]-[name]",
      inject: "body-last",
      customDomId: "__svg__icons__dom__"
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    },
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue", ".d.ts"]
  },
  server: {
    proxy: {
      // "/api/tech_process/saveOrUpdate": {
      //   target: proxyTarget,
      //   changeOrigin: true
      //   // rewrite: (path) => path.replace(/^\/api/, '')
      // },
      // "/api/tech_process": {
      //   target: proxyTarget2,
      //   changeOrigin: true
      //   // rewrite: (path) => path.replace(/^\/api/, '')
      // },
      "/api": {
        target: proxyTarget,
        changeOrigin: true
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    rollupOptions: {
      manualChunks: {
        "@antv/g6": ["@antv/g6"],
        "@dagrejs/dagre": ["@dagrejs/dagre"],
        "@vueuse/core": ["@vueuse/core"],
        axios: ["axios"],
        dayjs: ["dayjs"],
        echarts: ["echarts"],
        pinia: ["pinia"],
        radash: ["radash"],
        vue: ["vue"],
        "vue-router": ["vue-router"]
      },
      output: {
        chunkFileNames: "static/js/[name]-[hash].js",
        entryFileNames: "static/js/[name]-[hash].js",
        assetFileNames: "static/[ext]/[name]-[hash].[ext]"
      }
    }
  }
}))
