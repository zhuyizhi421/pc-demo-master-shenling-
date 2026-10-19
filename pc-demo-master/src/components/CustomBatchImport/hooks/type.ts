export type ImportResult = {
  failCount: number
  failFilePath: string
  importSuccess: boolean
  message: string
  successCount: number
  totalCount: number
}

const FAIL_PATH = "/excel/downloadImportFailRecords"

export enum EnumFailPathType {
  PRODUCT_CATEGORY = FAIL_PATH,
  PRODUCT_MANAGE = FAIL_PATH,
  PRODUCT_INSPECT = FAIL_PATH,
  PRODUCT_SAFE = FAIL_PATH,
  PRODUCT_UNIT = FAIL_PATH,
  PRODUCT_BUDDY = FAIL_PATH,
  FROEIGN_CUMSTOMER = FAIL_PATH,
  FROEIGN_SUPPLIER = FAIL_PATH,
  EMP = FAIL_PATH,
  EQUMENT_MODEL = FAIL_PATH,
  EQUMENT_MODEL_SPOT = FAIL_PATH,
  EQUMENT_MODEL_PATROLL = FAIL_PATH,
  EQUMENT_MODEL_MAINTAIN = FAIL_PATH,
  EQUMENT_MODEL_BASIC = FAIL_PATH,
  EQUMENT_MODEL_CONFIG = FAIL_PATH,
  EQUMENT_INST = FAIL_PATH,
  EQUMENT_SPOT = FAIL_PATH,
  EQUMENT_PATROLL = FAIL_PATH,
  EQUMENT_MAINTAIN = FAIL_PATH,
  MRO_MODEL = FAIL_PATH,
  VEHICLE = FAIL_PATH,
  ALL_INVENTORY = FAIL_PATH,
  CRAFTE_ROUTE = FAIL_PATH,
  CRAFTE_ROUTE_BOM = FAIL_PATH,
  MRO_INFO = FAIL_PATH,
  MRO_INSPECT = FAIL_PATH,
  MRO_MAINTAIN = FAIL_PATH,
  STORAGE_LOCATION = FAIL_PATH,
  BARCODE = FAIL_PATH,

  CRAFT_PROCESS = FAIL_PATH,
  CRAFT_PERSON = FAIL_PATH,
  CRAFT_MACHINE = FAIL_PATH,
  CRAFT_MATERIAL = FAIL_PATH,
  CRAFT_MRO = FAIL_PATH,
  CRAFT_PROCESS_CHECK = FAIL_PATH,
  CRAFT_PRODUCT_UNIT = FAIL_PATH
}

export enum EnumTemplatePathType {
  PRODUCT_CATEGORY = "/product/category/downloadTemplate",
  PRODUCT_MANAGE = "/product/model/downloadTemplate",
  PRODUCT_SAFE = "/product/model/safetyStockConfig/downloadProductSafetyStockImportTemplate",
  PRODUCT_UNIT = "/product/model/unit/downloadProductUnitImportTemplate",
  PRODUCT_BUDDY = "/product/model/partnerPartMapping/downloadProductPartnerPartMappingImportTemplate",
  PRODUCT_INSPECT = "/product/model/inspectItemDetail/downloadTemplate",
  FROEIGN_CUMSTOMER = "/foreign/customer/downloadTemplate",
  FROEIGN_SUPPLIER = "/foreign/supplier/downloadTemplate",
  ALL_INVENTORY = "/logistics/inventory/downloadTemplate",
  EMP = "/emp/downloadTemplate",
  CRAFTE_ROUTE = "/processRouteExcel/downloadProcessImportTemplate",
  CRAFTE_ROUTE_BOM = "/processRouteExcel/downloadBomImportTemplate",
  MRO_INFO = "/mro/downloadMroImportTemplate",
  MRO_INSPECT = "/mroInspectionTaskItem/downloadMroInspectionImportTemplate",
  MRO_MAINTAIN = "/mroMaintenanceTaskItem/downloadMroMaintenanceImportTemplate",
  STORAGE_LOCATION = "/fm/facility/storage/location/downloadTemplate",
  EQUMENT_MODEL_SPOT = "/equipmentSpotItem/downloadEquipmentSpotImportTemplate",
  EQUMENT_MODEL_PATROLL = "/equipmentPatrolItem/downloadEquipmentPatrolImportTemplate",
  EQUMENT_MODEL_MAINTAIN = "/equipmentMaintenanceItem/downloadEquipmentMaintenanceImportTemplate",
  EQUMENT_MODEL_BASIC = "/equipmentParameter/downloadEquipmentTechSpecificationImportTemplate",
  EQUMENT_SPOT = "/equipmentConfig/downloadEquipmentSpotImportTemplate",
  EQUMENT_PATROLL = "/equipmentConfig/downloadEquipmentPatrolImportTemplate",
  EQUMENT_MAINTAIN = "/equipmentConfig/downloadEquipmentMaintenanceImportTemplate",
  BARCODE = "/sys/barcode/downloadTemplate",

  CRAFT_PROCESS = "/processRouteExcel/downloadProcessImportTemplate",
  CRAFT_PERSON = "/techStandardExcel/downloadStandardManImportTemplate",
  CRAFT_MACHINE = "/techStandardExcel/downloadStandardMachineImportTemplate",
  CRAFT_MATERIAL = "/processRouteExcel/downloadStandardMaterialImportTemplate",
  CRAFT_MRO = "/techStandardExcel/downloadStandardMroImportTemplate",
  CRAFT_PROCESS_CHECK = "/techStandardExcel/downloadStandardMeasurementImportTemplate",
  CRAFT_PRODUCT_UNIT = "/techStandardExcel/downloadStandardProUnitImportTemplate",

  // 以下相关的接口都是post
  EQUMENT_MODEL = "/equipmentModel/excel/template/export",
  EQUMENT_MODEL_CONFIG = "/equipmentModelConfig/excel/template/export",
  EQUMENT_INST = "/equipment/excel/template/export",
  MRO_MODEL = "/mroModel/excel/template/export",
  VEHICLE = "/vehicle/excel/template/export"
}
export enum EnumImportPathType {
  PRODUCT_CATEGORY = "/product/category/doImport",
  PRODUCT_MANAGE = "/product/model/doImport",
  PRODUCT_INSPECT = "/product/model/inspectItemDetail/doImport",
  PRODUCT_SAFE = "/product/model/safetyStockConfig/excel/import",
  PRODUCT_UNIT = "/product/model/unit/excel/import",
  PRODUCT_BUDDY = "/product/model/partnerPartMapping/excel/import",
  FROEIGN_CUMSTOMER = "/foreign/customer/doImport",
  FROEIGN_SUPPLIER = "/foreign/supplier/doImport",
  EMP = "/emp/doImport",
  CRAFTE_ROUTE = "/processRouteExcel/doProcessImport",
  CRAFTE_ROUTE_BOM = "/processRouteExcel/doBomImport",
  EQUMENT_MODEL_SPOT = "/equipmentSpotItem/excel/import",
  EQUMENT_MODEL_PATROLL = "/equipmentPatrolItem/excel/import",
  EQUMENT_MODEL_MAINTAIN = "/equipmentMaintenanceItem/excel/import",
  EQUMENT_MODEL_BASIC = "/equipmentParameter/excel/import",
  EQUMENT_MODEL = "/equipmentModel/excel/import",
  EQUMENT_MODEL_CONFIG = "/equipmentModelConfig/excel/import",
  EQUMENT_INST = "/equipment/excel/import",
  EQUMENT_SPOT = "/equipmentConfig/excel/spotImport",
  EQUMENT_PATROLL = "/equipmentConfig/excel/patrolImport",
  EQUMENT_MAINTAIN = "/equipmentConfig/excel/maintenanceImport",
  MRO_MODEL = "/mroModel/excel/import",
  MRO_INSPECT = "/mroInspectionTaskItem/excel/import",
  MRO_MAINTAIN = "/mroMaintenanceTaskItem/excel/import",
  VEHICLE = "/vehicle/excel/import",
  ALL_INVENTORY = "/logistics/inventory/doImport",
  MRO_INFO = "/mro/excel/import",
  STORAGE_LOCATION = "/fm/facility/storage/location/doImport",
  BARCODE = "/sys/barcode/doImport",

  CRAFT_PROCESS = "/processRouteExcel/doProcessImport",
  CRAFT_PERSON = "/techStandardExcel/excel/manImport",
  CRAFT_MACHINE = "/techStandardExcel/excel/machineImport",
  CRAFT_MATERIAL = "/processRouteExcel/doStandardMaterialImport",
  CRAFT_MRO = "/techStandardExcel/excel/mroImport",
  CRAFT_PROCESS_CHECK = "/techStandardExcel/excel/measurementImport",
  CRAFT_PRODUCT_UNIT = "/techStandardExcel/excel/prodUnitImport"
}
