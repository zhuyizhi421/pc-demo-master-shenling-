/**
 * Global mock toggle: off by default.
 * Set `VITE_MODULE_MOCK=true` in `.env.devlopment` (or `.env.development`) to enable module mocks.
 */
const toBool = (val: unknown) => {
  if (val === true) return true
  const s = String(val ?? "")
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .toLowerCase()
  return s === "true" || s === "1" || s === "yes"
}

export const isGlobalModuleMockEnabled = toBool(import.meta.env.VITE_MODULE_MOCK)

/** Unified helper for module mocks (reserved for future per-module granularity). */
export const isModuleMockEnabled = () => isGlobalModuleMockEnabled

/** Base URL of mock-shared-server (no trailing slash). Empty if unset. */
export const getMockSharedBaseUrl = (): string => {
  let raw = String(import.meta.env.VITE_MOCK_SHARED_BASE ?? "").trim()
  if (!raw) return ""
  raw = raw.replace(/\/+$/, "")
  if (!/^https?:\/\//i.test(raw)) {
    raw = `http://${raw}`
  }
  // When accessed from another machine on the LAN, localhost/127.0.0.1 should resolve to the dev host.
  if (typeof window !== "undefined") {
    const currentHost = window.location.hostname
    raw = raw.replace(/^http:\/\/(?:127\.0\.0\.1|localhost)(?=[:/]|$)/i, `http://${currentHost}`)
  }
  return raw
}

/**
 * Normalized URL path (no `/api` prefix) prefixes forwarded to mock-shared-server when module mock is on.
 * Keep in sync with mock-shared-server/basic-config and existing logistics / foreign mocks.
 */
export const SHARED_MOCK_PATH_PREFIXES: readonly string[] = [
  "/trace/",
  "/logistics/",
  "/fm/",
  "/sys/config/logistics",
  "/sys/config/production",
  "/sys/config/quality",
  "/sys/config/maintenance",
  "/sys/config/basic",
  "/sys/config/global/",
  "/globalConfig",
  "/foreign/",
  "/favorite/",
  "/user/",
  "/group/",
  "/role/",
  "/tenant/",
  "/employee/",
  "/department/",
  "/job/",
  "/position/",
  "/license/",
  "/emp/",
  "/component/",
  "/unit",
  "/code/",
  "/alarm/",
  "/flowable/",
  "/msg/",
  "/directory",
  "/fileResource",
  "/calendar",
  "/barcode",
  "/printTemplate",
  "/customizeField/",
  "/inspectOption",
  "/craftType",
  "/tech",
  "/tech/",
  "/tech_process/",
  "/techVersion/",
  "/packTechSerial",
  "/packProcess/",
  "/packSpec/",
  "/packSpec",
  "/product/",
  "/sys/barcode",
  "/sys/product/",
  "/vehicle/",
  "/vehicleModel/",
  "/vehicleCategory/",
  "/delegate/",
  "/supplierPlatform/",
  "/scheduling/",
  "/productionOrder",
  "/productionTask",
  "/productionOrderPlan/",
  "/quality/report/",
  "/purchase/report/",
  "/production/report/",
  "/plan/report/",
  "/import/"
]

/** Whether a request path should use {@link getMockSharedBaseUrl} (paths may be with or without `/api`). */
export function matchesSharedMockPath(pathForMatch: string): boolean {
  const p = pathForMatch.startsWith("/api/") ? pathForMatch.slice(4) || "/" : pathForMatch
  return SHARED_MOCK_PATH_PREFIXES.some((prefix) => p.startsWith(prefix))
}
