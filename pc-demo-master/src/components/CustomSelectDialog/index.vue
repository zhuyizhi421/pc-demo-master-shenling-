<template>
  <Component
    ref="comRef"
    :key="props.type"
    :is="dynamicComponent"
    v-bind="props.props"
    v-on="props.events"
  />
</template>

<script setup lang="ts">
import { EnumDialogType, type IDialogProps } from "./type"

defineOptions({
  name: "CustomSelectDialog"
})

const props = defineProps<IDialogProps>()

const dynamicComponent = computed(() => dialogMap[props.type])
const comRef = ref()

/**
 * 弹窗枚举
 */
const dialogMap: Record<EnumDialogType, Component> = {
  [EnumDialogType.AndonFault]: defineAsyncComponent(
    () => import("@/components/SelectAndonFaultDialog/index.vue")
  ),
  [EnumDialogType.AndonFaultType]: defineAsyncComponent(
    () => import("@/components/SelectAndonFaultTypeDialog/index.vue")
  ),
  [EnumDialogType.CraftRoute]: defineAsyncComponent(
    () => import("@/components/SelectCraftRouteDialog/index.vue")
  ),
  [EnumDialogType.CraftVersionLink]: defineAsyncComponent(
    () => import("@/components/SelectCraftVersionLinkDialog/index.vue")
  ),
  [EnumDialogType.Device]: defineAsyncComponent(
    () => import("@/components/SelectDeviceDialog/index.vue")
  ),
  [EnumDialogType.DeviceModel]: defineAsyncComponent(
    () => import("@/components/SelectDeviceModelDialog/index.vue")
  ),
  [EnumDialogType.DeviceMaintain]: defineAsyncComponent(
    () => import("@/components/SelectDeviceMaintainDialog/index.vue")
  ),
  [EnumDialogType.Document]: defineAsyncComponent(
    () => import("@/components/SelectDocumentDialog/index.vue")
  ),
  [EnumDialogType.Mro]: defineAsyncComponent(
    () => import("@/components/SelectMroDialog/index.vue")
  ),
  [EnumDialogType.MroModel]: defineAsyncComponent(
    () => import("@/components/SelectMroModelDialog/index.vue")
  ),
  [EnumDialogType.OutsourceOrder]: defineAsyncComponent(
    () => import("@/components/SelectOutsourceOrderDialog/index.vue")
  ),
  [EnumDialogType.Product]: defineAsyncComponent(
    () => import("@/components/SelectProductDialog/index.vue")
  ),
  [EnumDialogType.ProductInventory]: defineAsyncComponent(
    () => import("@/components/SelectProductInventoryDialog/index.vue")
  ),
  [EnumDialogType.ProductOrder]: defineAsyncComponent(
    () => import("@/components/SelectProductOrderDialog/index.vue")
  ),
  [EnumDialogType.ProductTask]: defineAsyncComponent(
    () => import("@/components/SelectProductTaskDialog/index.vue")
  ),
  [EnumDialogType.SaleOrder]: defineAsyncComponent(
    () => import("@/components/SelectSaleOrderDialog/index.vue")
  ),
  [EnumDialogType.User]: defineAsyncComponent(
    () => import("@/components/SelectUserDialog/index.vue")
  ),
  [EnumDialogType.PackageSpec]: defineAsyncComponent(
    () => import("@/components/SelectPackageSpecDialog/index.vue")
  ),
  [EnumDialogType.PackageProcess]: defineAsyncComponent(
    () => import("@/components/SelectPackageProcessDialog/index.vue")
  ),
  [EnumDialogType.Role]: defineAsyncComponent(
    () => import("@/components/SelectRoleDialog/index.vue")
  )
}

defineExpose({
  getRef: () => comRef.value
})
</script>

<style lang="scss" scoped></style>
