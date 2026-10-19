import type {
  IAndonFaultDialogEvents,
  IAndonFaultDialogProps
} from "@/components/SelectAndonFaultDialog/type"
import type {
  IAndonFaultTypeDialogEvents,
  IAndonFaultTypeDialogProps
} from "@/components/SelectAndonFaultTypeDialog/type"
import type {
  ICraftRouteDialogEvents,
  ICraftRouteDialogProps
} from "@/components/SelectCraftRouteDialog/type"
import type {
  ICraftVersionLinkDialogEvents,
  ICraftVersionLinkDialogProps
} from "@/components/SelectCraftVersionLinkDialog/type"
import type { IDeviceDialogEvents, IDeviceDialogProps } from "@/components/SelectDeviceDialog/type"
import type {
  IDeviceMaintainDialogEvents,
  IDeviceMaintainDialogProps
} from "@/components/SelectDeviceMaintainDialog/type"
import type {
  IDeviceModelDialogEvents,
  IDeviceModelDialogProps
} from "@/components/SelectDeviceModelDialog/type"
import type {
  IDocumentDialogEvents,
  IDocumentDialogProps
} from "@/components/SelectDocumentDialog/type"
import type { IMroDialogEvents, IMroDialogProps } from "@/components/SelectMroDialog/type"
import type {
  IMroModelDialogEvents,
  IMroModelDialogProps
} from "@/components/SelectMroModelDialog/type"
import type {
  IOutsourceOrderDialogEvents,
  IOutsourceOrderDialogProps
} from "@/components/SelectOutsourceOrderDialog/type"
import type {
  IPackageProcessDialogEvents,
  IPackageProcessDialogProps
} from "@/components/SelectPackageProcessDialog/type"
import type {
  IPackageSpecDialogEvents,
  IPackageSpecDialogProps
} from "@/components/SelectPackageSpecDialog/type"
import type {
  IProductDialogEvents,
  IProductDialogProps
} from "@/components/SelectProductDialog/type"
import type {
  IProductInventoryDialogEvents,
  IProductInventoryDialogProps
} from "@/components/SelectProductInventoryDialog/type"
import type {
  IProductOrderDialogEvents,
  IProductOrderDialogProps
} from "@/components/SelectProductOrderDialog/type"
import type {
  IProductTaskDialogEvents,
  IProductTaskDialogProps
} from "@/components/SelectProductTaskDialog/type"
import type {
  ISaleOrderDialogEvents,
  ISaleOrderDialogProps
} from "@/components/SelectSaleOrderDialog/type"
import type { IUserDialogEvents, IUserDialogProps } from "@/components/SelectUserDialog/type"
import type { IRoleDialogEvents, IRoleDialogProps } from "@/components/SelectRoleDialog/type"

/**
 * @description 选择类型弹窗枚举
 */
export enum EnumDialogType {
  AndonFault, // 选择安灯故障弹窗
  AndonFaultType, // 选择安灯故障类型弹窗
  CraftRoute, // 选择工艺路线，附带展示工艺路线下工序信息
  CraftVersionLink, // 选择工艺路线下工序弹窗
  DeviceMaintain, // 选择设备保养弹窗
  Device, // 选择设备弹窗
  DeviceModel, // 选择设备模型弹窗
  Document, // 选择文档弹窗
  MroModel, // 选择MRO型号弹窗
  Mro, // 选择MRO弹窗
  OutsourceOrder, // 选择委外订单弹窗
  Product, // 选择产品弹窗
  ProductInventory, // 选择库存产品弹窗
  ProductOrder, // 选择生产订单弹窗
  ProductTask, // 选择生产任务弹窗
  SaleOrder, // 选择销售订单弹窗
  User, // 选择用户弹窗
  PackageSpec, // 选择包装规范弹窗
  PackageProcess, // 选择包装工序弹窗
  Role // 选择角色弹窗
}

/**
 * @description 选择弹窗props
 * 注意：不能使用ts类型映射写法，目前defineProps传入外部类型时不能是复杂类型，否则编译不通过
 */
export type IDialogProps =
  | {
      type: EnumDialogType.AndonFault
      props: IAndonFaultDialogProps
      events: IAndonFaultDialogEvents
    }
  | {
      type: EnumDialogType.AndonFaultType
      props: IAndonFaultTypeDialogProps
      events: IAndonFaultTypeDialogEvents
    }
  | {
      type: EnumDialogType.CraftRoute
      props: ICraftRouteDialogProps
      events: ICraftRouteDialogEvents
    }
  | {
      type: EnumDialogType.CraftVersionLink
      props: ICraftVersionLinkDialogProps
      events: ICraftVersionLinkDialogEvents
    }
  | {
      type: EnumDialogType.DeviceMaintain
      props: IDeviceMaintainDialogProps
      events: IDeviceMaintainDialogEvents
    }
  | {
      type: EnumDialogType.Device
      props: IDeviceDialogProps
      events: IDeviceDialogEvents
    }
  | {
      type: EnumDialogType.DeviceModel
      props: IDeviceModelDialogProps
      events: IDeviceModelDialogEvents
    }
  | {
      type: EnumDialogType.Document
      props: IDocumentDialogProps
      events: IDocumentDialogEvents
    }
  | {
      type: EnumDialogType.Mro
      props: IMroDialogProps
      events: IMroDialogEvents
    }
  | {
      type: EnumDialogType.MroModel
      props: IMroModelDialogProps
      events: IMroModelDialogEvents
    }
  | {
      type: EnumDialogType.OutsourceOrder
      props: IOutsourceOrderDialogProps
      events: IOutsourceOrderDialogEvents
    }
  | {
      type: EnumDialogType.Product
      props: IProductDialogProps
      events: IProductDialogEvents
    }
  | {
      type: EnumDialogType.ProductInventory
      props: IProductInventoryDialogProps
      events: IProductInventoryDialogEvents
    }
  | {
      type: EnumDialogType.ProductOrder
      props: IProductOrderDialogProps
      events: IProductOrderDialogEvents
    }
  | {
      type: EnumDialogType.ProductTask
      props: IProductTaskDialogProps
      events: IProductTaskDialogEvents
    }
  | {
      type: EnumDialogType.SaleOrder
      props: ISaleOrderDialogProps
      events: ISaleOrderDialogEvents
    }
  | {
      type: EnumDialogType.User
      props: IUserDialogProps
      events: IUserDialogEvents
    }
  | {
      type: EnumDialogType.PackageSpec
      props: IPackageSpecDialogProps
      events: IPackageSpecDialogEvents
    }
  | {
      type: EnumDialogType.PackageProcess
      props: IPackageProcessDialogProps
      events: IPackageProcessDialogEvents
    }
  | {
      type: EnumDialogType.Role
      props: IRoleDialogProps
      events: IRoleDialogEvents
    }
