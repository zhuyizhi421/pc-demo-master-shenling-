/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_IMAGE_PATH: string
  readonly VITE_MODULE_MOCK?: string
  readonly VITE_MOCK_SHARED_BASE?: string
  readonly VITE_STATIC_MOCK?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
