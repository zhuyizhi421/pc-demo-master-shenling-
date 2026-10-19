<!-- 组件 产品信息查看 -->
<template>
  <CustomDialog v-model="visible" title="产品信息" size="mini" align-center>
    <CustomDescription
      :data="form"
      :configs="detailConfig"
      :label-width="110"
      style="padding: 10px 0"
    ></CustomDescription>
  </CustomDialog>
</template>

<script setup lang="ts">
import { getProductModelById } from "@/api/product"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomDialog from "@/components/CustomDialog/index.vue"
import useProductStore from "@/store/modules/product"

const productStore = useProductStore()
const visible = ref(false)

const detailConfig = ref<ICustomDescriptionConfig[]>([
  {
    label: "产品名称：",
    field: "name"
  },
  {
    label: "产品编号：",
    field: "code"
  },
  {
    label: "状态：",
    field: "status"
  },
  {
    label: "产品类别名称：",
    field: "productCategoryName"
  },
  {
    label: "产品类别编号：",
    field: "productCategoryCode"
  },
  {
    label: "产品类型：",
    field: "productType"
  },
  {
    label: "备注：",
    field: "remark"
  }
])

defineExpose({
  setVisible
})

const statusEnum: Record<string, string> = {
  1: "正常",
  0: "停用"
}

function setVisible(value: boolean, productModelId: string) {
  visible.value = value
  if (productModelId) {
    getProductModelById(productModelId)
      .then((res: any) => {
        form.value = res
        form.value.status = statusEnum[res.status]
        form.value.productType = productStore.productTypeMap[res.productType]
      })
      .catch((err) => console.log(err))
  }
}

const form = ref({
  name: "",
  code: "",
  status: "",
  productCategoryName: "",
  productType: "",
  remark: "",
  productCategoryCode: ""
})
</script>

<style scoped>
.my-el-input-number {
  position: relative;
  width: 150px;
}

.my-el-input-number::after {
  content: "%";
  display: inline-block;
  height: 20px;
  line-height: 20px;
  width: 20px;
  text-align: center;
  position: absolute;
  right: 32px;
  top: 50%;
  transform: translateY(-50%);
}

.my-el-input-number .el-input__inner {
  padding-left: 30px;
  padding-right: 48px;
}
</style>
